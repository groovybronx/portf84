
import { getAllTags } from "./storage/tags";
import { ParsedTag } from "../shared/types/database";

// Simple Levenshtein distance implementation
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    if (!matrix[0]) matrix[0] = [];
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          Math.min(
            matrix[i]![j - 1]! + 1, // insertion
            matrix[i - 1]![j]! + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
};

export interface TagGroup {
    target: ParsedTag;
    candidates: ParsedTag[];
}

// Stop words to ignore during advanced comparison
const STOP_WORDS = new Set(["et", "and", "&", "le", "la", "les", "the", "a", "an", "de", "of", "in", "en"]);

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
const areTokensSimilar = (a: Set<string>, b: Set<string>): boolean => {
    if (a.size === 0 || b.size === 0) return false;
    
    // Intersection
    const intersection = new Set([...a].filter(x => b.has(x)));
    
    // Jaccard Index
    const unionSize = new Set([...a, ...b]).size;
    const jaccard = intersection.size / unionSize;
    
    return jaccard >= 0.8; // High similarity threshold for tokens
};

export const analyzeTagRedundancy = async (maxTags?: number): Promise<TagGroup[]> => {
    const tags = await getAllTags();
    console.log(`[TagAnalysis] Analyzing ${tags.length} tags for redundancy...`);
    
    // Performance optimization: For very large datasets, warn the user
    if (tags.length > LARGE_DATASET_THRESHOLD) {
        console.warn(`[TagAnalysis] Large dataset detected (${tags.length} tags). Analysis may take longer.`);
    }

    const groups: TagGroup[] = [];
    const processedIds = new Set<string>();

    // Normalize tags simply for comparison
    const simpleTags = tags.map(t => ({
        ...t,
        simpleName: t.name.toLowerCase().trim().replace(/s$/, ""), // Remove plural 's' roughly
        tokens: tokenize(t.name)
    }));

    // Apply limit if specified (for testing or preview)
    const tagsToProcess = maxTags ? simpleTags.slice(0, maxTags) : simpleTags;

    for (let i = 0; i < tagsToProcess.length; i++) {
        const root = tagsToProcess[i];
        if (!root) continue;
        if (processedIds.has(root.id)) continue;

        const group: TagGroup = {
            target: root,
            candidates: []
        };

        for (let j = i + 1; j < simpleTags.length; j++) {
            const candidate = simpleTags[j];
            if (!candidate) continue;
            if (processedIds.has(candidate.id)) continue;

            const dist = levenshteinDistance(root.simpleName, candidate.simpleName);
            
            // Criteria for similarity:
            // 1. Direct inclusion (e.g., "landscape" vs "landscapes") - Levenshtein low
            // 2. Token overlap (e.g., "noir et blanc" vs "noir blanc") - Jaccard high
            
            const isLevenshteinMatch = 
                dist <= 1 || 
                (dist <= 2 && root.simpleName.length > 5);

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
    return groups;
};
