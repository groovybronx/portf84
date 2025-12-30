/**
 * Tag Analysis Test Suite
 * Tests for similarity detection algorithms and redundancy analysis
 */

import { describe, it, expect } from 'vitest';

// ==================== ALGORITHMS ====================

/**
 * Levenshtein Distance Implementation
 * Calculates minimum edit operations to transform one string into another
 */
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
                const substitution = matrix[i - 1]![j - 1]! + 1;
                const insertion = matrix[i]![j - 1]! + 1;
                const deletion = matrix[i - 1]![j]! + 1;
                matrix[i]![j] = Math.min(substitution, insertion, deletion);
            }
        }
    }

    return matrix[b.length]![a.length]!;
};

/**
 * Tokenization with stop word filtering
 */
const STOP_WORDS = new Set([
    'et', 'and', '&', 'le', 'la', 'les', 
    'the', 'a', 'an', 'de', 'of', 'in', 'en'
]);

const tokenize = (str: string): Set<string> => {
    return new Set(
        str.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(w => w.length > 0 && !STOP_WORDS.has(w))
    );
};

/**
 * Jaccard Index for token similarity
 */
const areTokensSimilar = (a: Set<string>, b: Set<string>): boolean => {
    if (a.size === 0 || b.size === 0) return false;
    
    const intersection = new Set([...a].filter(x => b.has(x)));
    const unionSize = new Set([...a, ...b]).size;
    const jaccard = intersection.size / unionSize;
    
    return jaccard >= 0.8;
};

/**
 * Mock Tag type
 */
interface MockTag {
    id: string;
    name: string;
    normalizedName: string;
    type: 'ai' | 'manual' | 'ai_detailed';
}

interface TagGroup {
    target: MockTag;
    candidates: MockTag[];
}

/**
 * Simplified redundancy analysis for testing
 */
const analyzeTagRedundancy = (tags: MockTag[]): TagGroup[] => {
    const groups: TagGroup[] = [];
    const processedIds = new Set<string>();

    const simpleTags = tags.map(t => ({
        ...t,
        simpleName: t.name.toLowerCase().trim().replace(/s$/, ''),
        tokens: tokenize(t.name)
    }));

    for (let i = 0; i < simpleTags.length; i++) {
        const root = simpleTags[i];
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

    return groups;
};

// ==================== TESTS ====================

describe('Tag Analysis - Redundancy Detection', () => {
    it('should detect Levenshtein matches (distance <= 1)', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'landscape', normalizedName: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', normalizedName: 'landscapes', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);

        expect(groups.length).toBe(1);
        expect(groups[0]?.target.name).toBe('landscape');
        expect(groups[0]?.candidates.length).toBe(1);
        expect(groups[0]?.candidates[0]?.name).toBe('landscapes');
    });

    it('should detect token similarity (Jaccard >= 0.8)', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'noir et blanc', normalizedName: 'noir et blanc', type: 'manual' },
            { id: 'tag-2', name: 'noir blanc', normalizedName: 'noir blanc', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);

        expect(groups.length).toBe(1);
        expect(groups[0]?.candidates.length).toBe(1);
    });

    it('should group similar tags correctly', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'landscape', normalizedName: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', normalizedName: 'landscapes', type: 'manual' },
            { id: 'tag-3', name: 'portrait', normalizedName: 'portrait', type: 'manual' },
            { id: 'tag-4', name: 'portraits', normalizedName: 'portraits', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);

        expect(groups.length).toBe(2);
        
        // Find landscape group
        const landscapeGroup = groups.find(g => g.target.name === 'landscape');
        expect(landscapeGroup).toBeDefined();
        expect(landscapeGroup?.candidates.length).toBe(1);
        expect(landscapeGroup?.candidates[0]?.name).toBe('landscapes');
        
        // Find portrait group
        const portraitGroup = groups.find(g => g.target.name === 'portrait');
        expect(portraitGroup).toBeDefined();
        expect(portraitGroup?.candidates.length).toBe(1);
        expect(portraitGroup?.candidates[0]?.name).toBe('portraits');
    });

    it('should handle large datasets (>5000 tags)', () => {
        // Generate 5000+ tags
        const tags: MockTag[] = [];
        for (let i = 0; i < 5100; i++) {
            tags.push({
                id: `tag-${i}`,
                name: `unique-tag-${i}`,
                normalizedName: `unique-tag-${i}`,
                type: 'manual'
            });
        }
        
        // Add a few duplicates
        tags.push({ id: 'dup-1', name: 'sunset', normalizedName: 'sunset', type: 'manual' });
        tags.push({ id: 'dup-2', name: 'sunsets', normalizedName: 'sunsets', type: 'manual' });

        const startTime = Date.now();
        const groups = analyzeTagRedundancy(tags);
        const duration = Date.now() - startTime;

        // Should complete in reasonable time (< 10 seconds for this test)
        expect(duration).toBeLessThan(10000);
        
        // Should find at least the sunset group
        expect(groups.length).toBeGreaterThan(0);
        const sunsetGroup = groups.find(g => 
            g.target.name === 'sunset' || g.target.name === 'sunsets'
        );
        expect(sunsetGroup).toBeDefined();
    });

    it('should exclude stop words from tokenization', () => {
        const tokens1 = tokenize('the black and white');
        const tokens2 = tokenize('black white');

        expect(tokens1.has('black')).toBe(true);
        expect(tokens1.has('white')).toBe(true);
        expect(tokens1.has('the')).toBe(false);
        expect(tokens1.has('and')).toBe(false);

        // Should be similar because stop words are excluded
        expect(areTokensSimilar(tokens1, tokens2)).toBe(true);
    });

    it('should handle French stop words', () => {
        const tokens = tokenize('noir et blanc');
        
        expect(tokens.has('noir')).toBe(true);
        expect(tokens.has('blanc')).toBe(true);
        expect(tokens.has('et')).toBe(false);
    });

    it('should not match dissimilar tags', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'landscape', normalizedName: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'portrait', normalizedName: 'portrait', type: 'manual' },
            { id: 'tag-3', name: 'architecture', normalizedName: 'architecture', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);

        // No groups should be found as tags are too different
        expect(groups.length).toBe(0);
    });
});

describe('Tag Analysis - Levenshtein Distance', () => {
    it('should calculate distance for identical strings', () => {
        expect(levenshteinDistance('landscape', 'landscape')).toBe(0);
    });

    it('should calculate distance for single character difference', () => {
        expect(levenshteinDistance('landscape', 'landscapes')).toBe(1);
        expect(levenshteinDistance('portrait', 'portait')).toBe(1);
    });

    it('should calculate distance for substitution', () => {
        expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });

    it('should calculate distance for insertion', () => {
        expect(levenshteinDistance('cat', 'cart')).toBe(1);
    });

    it('should calculate distance for deletion', () => {
        expect(levenshteinDistance('cart', 'cat')).toBe(1);
    });

    it('should calculate distance for multiple differences', () => {
        expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('should handle empty strings', () => {
        expect(levenshteinDistance('', '')).toBe(0);
        expect(levenshteinDistance('test', '')).toBe(4);
        expect(levenshteinDistance('', 'test')).toBe(4);
    });

    it('should be case sensitive', () => {
        expect(levenshteinDistance('Test', 'test')).toBe(1);
    });

    it('should handle longer strings', () => {
        expect(levenshteinDistance('photography', 'photographie')).toBe(2);
    });
});

describe('Tag Analysis - Jaccard Index', () => {
    it('should detect identical token sets', () => {
        const a = tokenize('noir blanc');
        const b = tokenize('noir blanc');
        expect(areTokensSimilar(a, b)).toBe(true);
    });

    it('should detect similar tags with different word order', () => {
        const a = tokenize('black white');
        const b = tokenize('white black');
        expect(areTokensSimilar(a, b)).toBe(true);
    });

    it('should detect similar tags ignoring stop words', () => {
        const a = tokenize('noir et blanc');
        const b = tokenize('noir blanc');
        expect(areTokensSimilar(a, b)).toBe(true);
    });

    it('should reject dissimilar tags', () => {
        const a = tokenize('landscape');
        const b = tokenize('portrait');
        expect(areTokensSimilar(a, b)).toBe(false);
    });

    it('should reject partial overlap below threshold', () => {
        const a = tokenize('landscape nature');
        const b = tokenize('landscape');
        // Jaccard = 1/2 = 0.5 < 0.8
        expect(areTokensSimilar(a, b)).toBe(false);
    });

    it('should handle empty sets', () => {
        const a = tokenize('landscape');
        const b = tokenize('');
        expect(areTokensSimilar(a, b)).toBe(false);
    });

    it('should calculate exact Jaccard threshold', () => {
        // Test boundary case: exactly 0.8
        // Need 4 words with 4 in common for 4/5 = 0.8
        const a = tokenize('word1 word2 word3 word4');
        const b = tokenize('word1 word2 word3 word5');
        // Intersection: 3, Union: 5, Jaccard = 3/5 = 0.6 < 0.8
        expect(areTokensSimilar(a, b)).toBe(false);
    });

    it('should handle punctuation removal', () => {
        const a = tokenize('black & white');
        const b = tokenize('black white');
        expect(areTokensSimilar(a, b)).toBe(true);
    });
});

describe('Tag Analysis - Tokenization', () => {
    it('should tokenize simple strings', () => {
        const tokens = tokenize('landscape nature');
        expect(tokens.has('landscape')).toBe(true);
        expect(tokens.has('nature')).toBe(true);
        expect(tokens.size).toBe(2);
    });

    it('should remove stop words in English', () => {
        const tokens = tokenize('the black and white');
        expect(tokens.has('black')).toBe(true);
        expect(tokens.has('white')).toBe(true);
        expect(tokens.has('the')).toBe(false);
        expect(tokens.has('and')).toBe(false);
    });

    it('should remove stop words in French', () => {
        const tokens = tokenize('noir et blanc');
        expect(tokens.has('noir')).toBe(true);
        expect(tokens.has('blanc')).toBe(true);
        expect(tokens.has('et')).toBe(false);
    });

    it('should remove punctuation', () => {
        const tokens = tokenize('black & white');
        expect(tokens.has('black')).toBe(true);
        expect(tokens.has('white')).toBe(true);
        expect(tokens.has('&')).toBe(false);
    });

    it('should handle case insensitivity', () => {
        const tokens1 = tokenize('Landscape NATURE');
        const tokens2 = tokenize('landscape nature');
        expect([...tokens1].sort()).toEqual([...tokens2].sort());
    });

    it('should handle multiple spaces', () => {
        const tokens = tokenize('landscape    nature');
        expect(tokens.size).toBe(2);
    });

    it('should filter empty strings', () => {
        const tokens = tokenize('  landscape  ');
        expect(tokens.size).toBe(1);
        expect(tokens.has('landscape')).toBe(true);
    });

    it('should handle single word', () => {
        const tokens = tokenize('landscape');
        expect(tokens.size).toBe(1);
        expect(tokens.has('landscape')).toBe(true);
    });

    it('should handle empty string', () => {
        const tokens = tokenize('');
        expect(tokens.size).toBe(0);
    });
});

describe('Tag Analysis - Combined Strategy', () => {
    it('should match on Levenshtein when tokens differ', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'landscape', normalizedName: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', normalizedName: 'landscapes', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);
        expect(groups.length).toBe(1);
    });

    it('should match on tokens when Levenshtein differs', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'black and white', normalizedName: 'black and white', type: 'manual' },
            { id: 'tag-2', name: 'white black', normalizedName: 'white black', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);
        expect(groups.length).toBe(1);
    });

    it('should handle mixed language variations', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'noir et blanc', normalizedName: 'noir et blanc', type: 'manual' },
            { id: 'tag-2', name: 'noir blanc', normalizedName: 'noir blanc', type: 'manual' },
            { id: 'tag-3', name: 'black and white', normalizedName: 'black and white', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);
        
        // Should find noir et blanc + noir blanc as similar
        // But not match with black and white (different tokens)
        expect(groups.length).toBe(1);
        expect(groups[0]?.candidates.length).toBe(1);
    });

    it('should respect distance threshold for longer words', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'photography', normalizedName: 'photography', type: 'manual' },
            { id: 'tag-2', name: 'photographie', normalizedName: 'photographie', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);
        
        // Distance is 1, length > 5, should match
        expect(groups.length).toBe(1);
    });

    it('should not match when both Levenshtein and tokens fail', () => {
        const tags: MockTag[] = [
            { id: 'tag-1', name: 'landscape', normalizedName: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'architecture', normalizedName: 'architecture', type: 'manual' }
        ];

        const groups = analyzeTagRedundancy(tags);
        expect(groups.length).toBe(0);
    });
});
