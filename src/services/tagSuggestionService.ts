/**
 * Tag Suggestion Service
 * Provides smart tag suggestions from similar images and AI descriptions
 */

import { PortfolioItem } from "../shared/types";

// Constants
const MIN_KEYWORD_LENGTH = 3; // Minimum length for extracted keywords
const BATCH_SUGGESTION_THRESHOLD_PERCENTAGE = 0.3; // 30% of items must have tag
const MIN_BATCH_SUGGESTION_THRESHOLD = 2; // Minimum absolute threshold

/**
 * Find similar images based on AI description similarity
 * Uses simple keyword matching for now (can be enhanced with embeddings later)
 */
const findSimilarByDescription = (
	targetDescription: string,
	allItems: PortfolioItem[],
	limit: number = 5
): PortfolioItem[] => {
	if (!targetDescription || allItems.length === 0) return [];

	const targetKeywords = extractKeywords(targetDescription);
	if (targetKeywords.length === 0) return [];

	// Score each item by keyword overlap
	const scored = allItems
		.filter((item) => item.aiDescription && item.id)
		.map((item) => {
			const itemKeywords = extractKeywords(item.aiDescription || "");
			const overlap = targetKeywords.filter((kw) =>
				itemKeywords.includes(kw)
			).length;
			return { item, score: overlap };
		})
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);

	return scored.map((s) => s.item);
};

/**
 * Extract keywords from text (simple implementation)
 */
const extractKeywords = (text: string): string[] => {
	const words = text
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > MIN_KEYWORD_LENGTH);

	// Remove common stop words
	const stopWords = new Set([
		"with",
		"this",
		"that",
		"from",
		"have",
		"been",
		"they",
		"there",
		"their",
		"what",
		"which",
		"when",
		"where",
		"will",
		"would",
		"could",
		"should",
	]);

	return [...new Set(words.filter((w) => !stopWords.has(w)))];
};

/**
 * Suggest tags from similar images based on AI description
 */
export const suggestTagsFromSimilar = async (
	item: PortfolioItem,
	allItems: PortfolioItem[],
	limit: number = 5
): Promise<string[]> => {
	if (!item.aiDescription) return [];

	const similarItems = findSimilarByDescription(
		item.aiDescription,
		allItems.filter((i) => i.id !== item.id), // Exclude the target item
		10 // Get more similar items for better tag frequency
	);

	if (similarItems.length === 0) return [];

	// Count tag frequency across similar images
	const tagFrequency = new Map<string, number>();

	similarItems.forEach((similarItem) => {
		similarItem.manualTags?.forEach((tag) => {
			tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
		});
	});

	// Return top tags by frequency (excluding tags already on the item)
	const existingTags = new Set(item.manualTags || []);
	return Array.from(tagFrequency.entries())
		.filter(([tag]) => !existingTags.has(tag))
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([tag]) => tag);
};

/**
 * Extract potential tags from AI description using keyword patterns
 */
export const extractTagsFromDescription = (description: string): string[] => {
	if (!description) return [];

	const text = description.toLowerCase();

	// Common photography subjects and themes
	const patterns = [
		// Landscapes
		"mountain",
		"mountains",
		"landscape",
		"scenery",
		"nature",
		"forest",
		"beach",
		"ocean",
		"sea",
		"lake",
		"river",
		"waterfall",
		"valley",
		"desert",
		"canyon",
		"cliff",
		"hill",
		"field",
		"meadow",
		"countryside",
		// Time of day
		"sunset",
		"sunrise",
		"dawn",
		"dusk",
		"twilight",
		"night",
		"evening",
		"morning",
		// Weather/Sky
		"clouds",
		"cloudy",
		"sunny",
		"storm",
		"rainbow",
		"fog",
		"mist",
		// Seasons
		"spring",
		"summer",
		"autumn",
		"fall",
		"winter",
		// People
		"portrait",
		"people",
		"person",
		"family",
		"friends",
		"couple",
		"group",
		"child",
		"children",
		"baby",
		// Animals
		"wildlife",
		"animal",
		"animals",
		"bird",
		"birds",
		"dog",
		"cat",
		"horse",
		"fish",
		"insect",
		// Urban
		"urban",
		"city",
		"street",
		"building",
		"architecture",
		"bridge",
		"road",
		"skyline",
		"downtown",
		// Activities
		"sports",
		"hiking",
		"travel",
		"vacation",
		"festival",
		"event",
		"concert",
		"party",
		"wedding",
		// Objects
		"flower",
		"flowers",
		"tree",
		"trees",
		"plant",
		"plants",
		"garden",
		"food",
		"car",
		"vehicle",
		"boat",
		"airplane",
		// Colors (often meaningful)
		"colorful",
		"vibrant",
		"black and white",
		"monochrome",
		// Styles
		"abstract",
		"minimalist",
		"vintage",
		"modern",
		"artistic",
	];

	// Match patterns in the description
	const matches = patterns.filter((pattern) => {
		// Use word boundaries to avoid partial matches
		const regex = new RegExp(`\\b${pattern}\\b`, "i");
		return regex.test(text);
	});

	// Return unique matches, normalized
	return [...new Set(matches.map((m) => m.toLowerCase()))];
};

/**
 * Get batch tag suggestions for multiple items
 * Returns common patterns across items
 */
export const getBatchTagSuggestions = (
	items: PortfolioItem[],
	limit: number = 5
): string[] => {
	if (items.length === 0) return [];

	// Collect all AI descriptions
	const allDescriptions = items
		.map((item) => item.aiDescription || "")
		.filter((desc) => desc.length > 0)
		.join(" ");

	// Extract common keywords
	const keywords = extractKeywords(allDescriptions);

	// Count keyword frequency
	const frequency = new Map<string, number>();
	keywords.forEach((kw) => {
		frequency.set(kw, (frequency.get(kw) || 0) + 1);
	});

	// Return keywords that appear in multiple items
	const threshold = Math.max(
		MIN_BATCH_SUGGESTION_THRESHOLD,
		Math.floor(items.length * BATCH_SUGGESTION_THRESHOLD_PERCENTAGE)
	);
	return Array.from(frequency.entries())
		.filter(([, count]) => count >= threshold)
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([kw]) => kw);
};
