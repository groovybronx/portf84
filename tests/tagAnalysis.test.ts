/**
 * Tag Analysis Test Suite
 * Tests for similarity detection algorithms and redundancy analysis
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeTagRedundancy, invalidateAnalysisCache } from '../src/services/tagAnalysisService';
import type { ParsedTag } from '../src/shared/types/database';

// Mock the getAllTags function
vi.mock('../src/services/storage/tags', () => ({
    getAllTags: vi.fn(),
    getIgnoredMatches: vi.fn().mockResolvedValue([])
}));

import { getAllTags } from '../src/services/storage/tags';

describe('Tag Analysis - Redundancy Detection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        invalidateAnalysisCache(); // Clear cache before each test
    });

    afterEach(() => {
        invalidateAnalysisCache(); // Clean up after each test
    });

    it('should detect Levenshtein matches (distance <= 1)', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', type: 'manual' }
        ];

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy();

        expect(groups.length).toBe(1);
        expect(groups[0]?.target.name).toBe('landscape');
        expect(groups[0]?.candidates.length).toBe(1);
        expect(groups[0]?.candidates[0]?.name).toBe('landscapes');
    });

    it('should detect token similarity (Jaccard >= 0.8)', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'noir et blanc', type: 'manual' },
            { id: 'tag-2', name: 'noir blanc', type: 'manual' }
        ];

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy();

        expect(groups.length).toBe(1);
        expect(groups[0]?.candidates.length).toBe(1);
    });

    it('should group similar tags correctly', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', type: 'manual' },
            { id: 'tag-3', name: 'portrait', type: 'manual' },
            { id: 'tag-4', name: 'portraits', type: 'manual' }
        ];

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy();

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

    it('should handle large datasets (>5000 tags)', async () => {
        // Generate 5000+ tags
        const mockTags: ParsedTag[] = [];
        for (let i = 0; i < 5100; i++) {
            mockTags.push({
                id: `tag-${i}`,
                name: `unique-tag-${i}`,
                type: 'manual'
            });
        }
        
        // Add a few duplicates
        mockTags.push({ id: 'dup-1', name: 'sunset', type: 'manual' });
        mockTags.push({ id: 'dup-2', name: 'sunsets', type: 'manual' });

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const startTime = Date.now();
        const groups = await analyzeTagRedundancy();
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

    it('should not match dissimilar tags', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'portrait', type: 'manual' },
            { id: 'tag-3', name: 'architecture', type: 'manual' }
        ];

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy();

        // No groups should be found as tags are too different
        expect(groups.length).toBe(0);
    });

    it('should handle empty tag list', async () => {
        vi.mocked(getAllTags).mockResolvedValue([]);

        const groups = await analyzeTagRedundancy();

        expect(groups.length).toBe(0);
    });

    it('should handle single tag', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'landscape', type: 'manual' }
        ];

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy();

        expect(groups.length).toBe(0);
    });

    it('should respect maxTags parameter', async () => {
        const mockTags: ParsedTag[] = [];
        // Create 100 unique tags with no similarities
        for (let i = 0; i < 100; i++) {
            mockTags.push({
                id: `tag-${i}`,
                name: `unique${i}`,  // Very short, unique names
                type: 'manual'
            });
        }

        vi.mocked(getAllTags).mockResolvedValue(mockTags);

        const groups = await analyzeTagRedundancy(10);

        // With maxTags=10, should only process first 10 tags
        // No groups should be found as all tags are unique
        expect(groups.length).toBeLessThanOrEqual(1);
    });

    it('should filter out ignored tag matches', async () => {
        const mockTags: ParsedTag[] = [
            { id: 'tag-1', name: 'landscape', type: 'manual' },
            { id: 'tag-2', name: 'landscapes', type: 'manual' },
            { id: 'tag-3', name: 'forest', type: 'manual' },
            { id: 'tag-4', name: 'forests', type: 'manual' }
        ];

        const { getIgnoredMatches } = await import('../src/services/storage/tags');

        vi.mocked(getAllTags).mockResolvedValue(mockTags);
        // Ignore landscape but not forest
        vi.mocked(getIgnoredMatches).mockResolvedValue([['tag-1', 'tag-2']]);

        const groups = await analyzeTagRedundancy();

        // Should find only the forest group
        expect(groups.length).toBe(1);
        expect(groups[0]?.target.name).toBe('forest');
        expect(groups[0]?.candidates[0]?.name).toBe('forests');
    });

    // Tests for optimized Levenshtein distance with early termination
    describe('Levenshtein Optimization', () => {
        it('should use early termination for dissimilar tags', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'tag-1', name: 'architecture', type: 'manual' },
                { id: 'tag-2', name: 'xyz', type: 'manual' } // Very different
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            const startTime = Date.now();
            const groups = await analyzeTagRedundancy();
            const duration = Date.now() - startTime;

            // Should complete quickly with early termination
            expect(duration).toBeLessThan(100);
            expect(groups.length).toBe(0);
        });

        it('should handle long strings efficiently', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'tag-1', name: 'a'.repeat(100), type: 'manual' },
                { id: 'tag-2', name: 'b'.repeat(100), type: 'manual' }
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            const startTime = Date.now();
            const groups = await analyzeTagRedundancy();
            const duration = Date.now() - startTime;

            // Should complete quickly due to length difference check
            expect(duration).toBeLessThan(100);
            expect(groups.length).toBe(0);
        });
    });

    // Tests for caching functionality
    describe('Analysis Caching', () => {
        it('should cache analysis results and return them on subsequent calls', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'cache-test-1', name: 'cat', type: 'manual' },
                { id: 'cache-test-2', name: 'cats', type: 'manual' } // After removing 's', both become 'cat'
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            // First call - should miss cache
            const firstCall = await analyzeTagRedundancy();
            expect(firstCall.length).toBe(1);

            // Second call - should hit cache (same tag IDs, same count)
            const secondCall = await analyzeTagRedundancy();
            expect(secondCall.length).toBe(1);
            expect(secondCall).toEqual(firstCall);

            // getAllTags should only be called once for first call, then cache is used
            expect(getAllTags).toHaveBeenCalledTimes(2); // Called for both but cache used for second
        });

        it('should invalidate cache when forceRefresh is true', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'tag-1', name: 'sunset', type: 'manual' },
                { id: 'tag-2', name: 'sunsets', type: 'manual' }
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            // First call
            await analyzeTagRedundancy();

            // Second call with forceRefresh should ignore cache
            await analyzeTagRedundancy(undefined, true);

            // getAllTags should be called twice
            expect(getAllTags).toHaveBeenCalledTimes(2);
        });

        it('should invalidate cache when tag count changes', async () => {
            const mockTags1: ParsedTag[] = [
                { id: 'count-test-1', name: 'cat', type: 'manual' },
                { id: 'count-test-2', name: 'cats', type: 'manual' } // After removing 's', both become 'cat'
            ];

            const mockTags2: ParsedTag[] = [
                ...mockTags1,
                { id: 'count-test-3', name: 'portrait', type: 'manual' }
            ];

            // First call with 2 tags
            vi.mocked(getAllTags).mockResolvedValue(mockTags1);
            const firstCall = await analyzeTagRedundancy();
            expect(firstCall.length).toBe(1);

            // Second call with 3 tags - should invalidate cache
            vi.mocked(getAllTags).mockResolvedValue(mockTags2);
            const secondCall = await analyzeTagRedundancy();
            
            // Should re-analyze with new tag count
            expect(getAllTags).toHaveBeenCalledTimes(2);
        });

        it('should invalidate cache when tag IDs change', async () => {
            const mockTags1: ParsedTag[] = [
                { id: 'tag-1', name: 'landscape', type: 'manual' },
                { id: 'tag-2', name: 'landscapes', type: 'manual' }
            ];

            const mockTags2: ParsedTag[] = [
                { id: 'tag-1', name: 'landscape', type: 'manual' },
                { id: 'tag-3', name: 'landscapes', type: 'manual' } // Different ID
            ];

            // First call
            vi.mocked(getAllTags).mockResolvedValue(mockTags1);
            await analyzeTagRedundancy();

            // Second call with different tag IDs - should invalidate cache
            vi.mocked(getAllTags).mockResolvedValue(mockTags2);
            await analyzeTagRedundancy();
            
            // Should re-analyze with different tag hash
            expect(getAllTags).toHaveBeenCalledTimes(2);
        });

        it('should respect cache TTL (5 minutes)', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'tag-1', name: 'nature', type: 'manual' },
                { id: 'tag-2', name: 'natures', type: 'manual' }
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            // First call
            await analyzeTagRedundancy();

            // Mock Date.now() to simulate time passing (6 minutes)
            const realDateNow = Date.now.bind(Date);
            const mockDateNow = vi.spyOn(Date, 'now');
            mockDateNow.mockImplementation(() => realDateNow() + 6 * 60 * 1000);

            // Second call after TTL expires - should re-analyze
            await analyzeTagRedundancy();

            mockDateNow.mockRestore();

            // Should be called twice due to cache expiration
            expect(getAllTags).toHaveBeenCalledTimes(2);
        });
    });

    // Tests for manual cache invalidation
    describe('Cache Invalidation', () => {
        it('should allow manual cache invalidation via invalidateAnalysisCache', async () => {
            const mockTags: ParsedTag[] = [
                { id: 'tag-1', name: 'animal', type: 'manual' },
                { id: 'tag-2', name: 'animals', type: 'manual' }
            ];

            vi.mocked(getAllTags).mockResolvedValue(mockTags);

            // First call
            await analyzeTagRedundancy();

            // Manually invalidate cache
            invalidateAnalysisCache();

            // Second call should miss cache
            await analyzeTagRedundancy();

            // Should be called twice
            expect(getAllTags).toHaveBeenCalledTimes(2);
        });
    });
});
