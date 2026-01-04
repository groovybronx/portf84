
import { getAllTags, getIgnoredMatches } from "./storage/tags";
import { ParsedTag } from "../shared/types/database";
import { getCache, setCache, invalidateAnalysisCache, hashTagIds } from "./tagAnalysisCache";

export { invalidateAnalysisCache };

/**
 * Space-optimized Levenshtein distance calculation
 * Uses rolling array technique: O(min(m,n)) space instead of O(m*n)
 * Includes early termination when distance exceeds threshold
 * 
 * @param a - First string to compare
 * @param b - Second string to compare
 * @param threshold - Maximum distance to compute; returns threshold + 1 if exceeded.
 *                    This enables early termination for better performance when you only
 *                    care about distances below a certain value. Default: Infinity (no limit).
 * @returns The Levenshtein distance between the strings, or threshold + 1 if exceeded
 */
const levenshteinDistance = (
	a: string,
	b: string,
	threshold: number = Infinity
): number => {
	// Ensure a is the shorter string (optimize space)
	if (a.length > b.length) {
		[a, b] = [b, a];
	}

	const m = a.length;
	const n = b.length;

	// Early exit if length difference alone exceeds threshold
	if (Math.abs(m - n) > threshold) {
		return threshold + 1;
	}

	// Use two rows instead of full matrix
	let prevRow = Array.from({ length: m + 1 }, (_, i) => i);
	let currRow = new Array(m + 1);

	for (let i = 1; i <= n; i++) {
		currRow[0] = i;
		let minInRow = i; // Track minimum for early termination

		for (let j = 1; j <= m; j++) {
			const cost = b[i - 1] === a[j - 1] ? 0 : 1;

			currRow[j] = Math.min(
				prevRow[j]! + 1, // deletion
				currRow[j - 1]! + 1, // insertion
				prevRow[j - 1]! + cost // substitution
			);

			minInRow = Math.min(minInRow, currRow[j]!);
		}

		// Early termination: if minimum in this row exceeds threshold,
		// final distance will also exceed threshold
		if (minInRow > threshold) {
			return threshold + 1;
		}

		// Swap rows
		[prevRow, currRow] = [currRow, prevRow];
	}

	return prevRow[m]!;
};

export interface TagGroup {
	target: ParsedTag;
	candidates: ParsedTag[];
}

// Stop words to ignore during advanced comparison
const STOP_WORDS = new Set(["et", "and", "&", "le", "la", "les", "the", "a", "an", "de", "of", "in", "en"]);

// Levenshtein distance threshold for similarity matching
// Tags with distance <= 1 are considered similar
// Tags with distance <= 2 are considered similar if length > 5
const LEVENSHTEIN_THRESHOLD = 2;

// Performance threshold for large datasets
const LARGE_DATASET_THRESHOLD = 5000;

// Tokenize and clean string
const tokenize = (str: string): Set<string> => {
    return new Set(
        str.toLowerCase()
        .replace(/[^\w\s]/g, "") // remove punctuation
        .split(/\s+/)
        .filter(w => w.length > 0 && !STOP_WORDS.has(w))
    );
};

// Check if two sets of tokens are essentially the same
const areTokensSimilar = (
	a: Set<string>,
	b: Set<string>,
	threshold: number = 0.8
): boolean => {
	if (a.size === 0 || b.size === 0) return false;

	// Intersection
	const intersection = new Set([...a].filter((x) => b.has(x)));

	// Jaccard Index
	const unionSize = new Set([...a, ...b]).size;
	const jaccard = intersection.size / unionSize;

	return jaccard >= threshold; // High similarity threshold for tokens
};

export const analyzeTagRedundancy = async (
	maxTags?: number,
	forceRefresh = false
): Promise<TagGroup[]> => {
	const tags = await getAllTags();
	const tagIds = tags.map((t) => t.id);
	const currentHash = hashTagIds(tagIds);

	// Check cache validity (includes maxTags parameter)
	const cachedResult = getCache(currentHash, tags.length, maxTags, forceRefresh);
	if (cachedResult) {
		return cachedResult;
	}

	console.log("[TagAnalysis] Cache MISS - Running analysis");
	const ignoredMatches = await getIgnoredMatches();
	const ignoredSet = new Set(ignoredMatches.map((pair) => pair.sort().join("|")));

	console.log(`[TagAnalysis] Analyzing ${tags.length} tags for redundancy...`);

	// Performance optimization: For very large datasets, warn the user
	if (tags.length > LARGE_DATASET_THRESHOLD) {
		console.warn(
			`[TagAnalysis] Large dataset detected (${tags.length} tags). Analysis may take longer.`
		);
	}

	const groups: TagGroup[] = [];
	const processedIds = new Set<string>();

	// Normalize tags and pre-calculate tokens
	const simpleTags = tags.map((t) => ({
		...t,
		simpleName: t.name.toLowerCase().trim().replace(/s$/, ""), // Remove plural 's' roughly
		tokens: tokenize(t.name),
	}));

	// Apply limit if specified (for testing or preview)
	const tagsToProcess = maxTags ? simpleTags.slice(0, maxTags) : simpleTags;

	for (let i = 0; i < tagsToProcess.length; i++) {
		const root = tagsToProcess[i];
		if (!root) continue;
		if (processedIds.has(root.id)) continue;

		const group: TagGroup = {
			target: root,
			candidates: [],
		};

		// Fix: Inner loop should also use tagsToProcess for consistency with maxTags
		for (let j = i + 1; j < tagsToProcess.length; j++) {
			const candidate = tagsToProcess[j];
			if (!candidate) continue;
			if (processedIds.has(candidate.id)) continue;

			// 1. Check if this pair is ignored
			const pairKey = [root.id, candidate.id].sort().join("|");
			if (ignoredSet.has(pairKey)) continue;

			// 2. Performance: Early exit if length difference is too large for Levenshtein match
			// and no tokens overlap significantly
			const lengthDiff = Math.abs(root.simpleName.length - candidate.simpleName.length);
			if (lengthDiff > 2 && root.tokens.size === 0 && candidate.tokens.size === 0) continue;

			// Use threshold for Levenshtein optimization
			const dist = levenshteinDistance(root.simpleName, candidate.simpleName, LEVENSHTEIN_THRESHOLD);

			const isLevenshteinMatch = dist <= 1 || (dist <= 2 && root.simpleName.length > 5);

			const isTokenMatch = areTokensSimilar(root.tokens, candidate.tokens);

			if (isLevenshteinMatch || isTokenMatch || root.simpleName === candidate.simpleName) {
				group.candidates.push(candidate);
				processedIds.add(candidate.id);
			}
		}

		if (group.candidates.length > 0) {
			groups.push(group);
			processedIds.add(root.id);
		}
	}

	console.log(`[TagAnalysis] Found ${groups.length} groups with duplicates`);

	// Store results in cache (includes maxTags parameter)
	setCache(currentHash, tags.length, maxTags, groups);

	return groups;
};
