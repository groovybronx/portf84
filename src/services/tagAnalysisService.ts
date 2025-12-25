
import { getAllTags } from "./storage/tags";
import { ParsedTag } from "../shared/types/database";

// Simple Levenshtein distance implementation
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export interface TagGroup {
    target: ParsedTag;
    candidates: ParsedTag[];
}

export const analyzeTagRedundancy = async (): Promise<TagGroup[]> => {
    const tags = await getAllTags();
    const groups: TagGroup[] = [];
    const processedIds = new Set<string>();

    // Normalize tags simply for comparison
    const simpleTags = tags.map(t => ({
        ...t,
        simpleName: t.name.toLowerCase().trim().replace(/s$/, "") // Remove plural 's' roughly
    }));

    for (let i = 0; i < simpleTags.length; i++) {
        const root = simpleTags[i];
        if (processedIds.has(root.id)) continue;

        const group: TagGroup = {
            target: root,
            candidates: []
        };

        for (let j = i + 1; j < simpleTags.length; j++) {
            const candidate = simpleTags[j];
            if (processedIds.has(candidate.id)) continue;

            const dist = levenshteinDistance(root.simpleName, candidate.simpleName);
            
            // Criteria for similarity:
            // 1. Direct inclusion (e.g., "landscape" vs "landscapes")
            // 2. Very small Levenshtein distance (< 2) for longer words
            // 3. Normalized equality
            
            const isSimilar = 
                dist <= 1 || 
                (dist <= 2 && root.simpleName.length > 5) ||
                root.simpleName === candidate.simpleName;

            if (isSimilar) {
                group.candidates.push(candidate);
                processedIds.add(candidate.id);
            }
        }

        if (group.candidates.length > 0) {
            groups.push(group);
            processedIds.add(root.id);
        }
    }

    return groups;
};
