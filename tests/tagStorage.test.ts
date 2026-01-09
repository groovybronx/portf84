/**
 * Tag Storage Integration Test Suite
 * Tests for tag CRUD operations, merging, sync, and aliases with mocked database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the database module
vi.mock('../src/services/storage/db', () => ({
    getDB: vi.fn()
}));

import { getDB } from '../src/services/storage/db';
import { logger } from './shared/utils/logger';
import {
    getOrCreateTag,
    addTagToItem,
    mergeTags,
    syncAllTagsFromMetadata,
    createTagAlias,
    getTagByAlias,
    getAllTags,
    getTagsForItem
} from '../src/services/storage/tags';

// Mock database implementation
const createMockDB = () => {
    const tags = new Map<string, any>();
    const itemTags = new Map<string, Set<string>>();
    const tagMerges: any[] = [];
    const tagAliases = new Map<string, any>();
    const metadata = new Map<string, any>();

    return {
        select: vi.fn((query: string, params?: any[]) => {
            if (query.includes('FROM tags WHERE normalizedName')) {
                const normalizedName = params?.[0];
                const type = params?.[1];
                const results: any[] = [];
                for (const tag of tags.values()) {
                    if (tag.normalizedName === normalizedName && tag.type === type) {
                        results.push(tag);
                    }
                }
                return Promise.resolve(results);
            }
            if (query.includes('FROM tags') && !query.includes('WHERE')) {
                return Promise.resolve(Array.from(tags.values()));
            }
            if (query.includes('FROM item_tags WHERE tagId')) {
                const tagId = params?.[0];
                const results: any[] = [];
                for (const [itemId, tagSet] of itemTags.entries()) {
                    if (tagSet.has(tagId)) {
                        results.push({ itemId });
                    }
                }
                return Promise.resolve(results);
            }
            if (query.includes('FROM item_tags WHERE itemId')) {
                const itemId = params?.[0];
                const tagSet = itemTags.get(itemId) || new Set();
                const results: any[] = [];
                for (const tagId of tagSet) {
                    const tag = tags.get(tagId);
                    if (tag) {
                        results.push(tag);
                    }
                }
                return Promise.resolve(results);
            }
            if (query.includes('FROM tag_aliases WHERE aliasName')) {
                const aliasName = params?.[0]?.toLowerCase().trim();
                const alias = tagAliases.get(aliasName);
                return Promise.resolve(alias ? [alias] : []);
            }
            if (query.includes('FROM metadata')) {
                return Promise.resolve(Array.from(metadata.values()));
            }
            return Promise.resolve([]);
        }),
        execute: vi.fn((query: string, params?: any[]) => {
            if (query.includes('INSERT INTO tags')) {
                const [id, name, normalizedName, type, confidence, createdAt] = params || [];
                tags.set(id, { id, name, normalizedName, type, confidence, createdAt });
            }
            if (query.includes('INSERT OR IGNORE INTO item_tags')) {
                const [itemId, tagId] = params || [];
                if (!itemTags.has(itemId)) {
                    itemTags.set(itemId, new Set());
                }
                itemTags.get(itemId)?.add(tagId);
            }
            if (query.includes('DELETE FROM item_tags WHERE itemId')) {
                const itemId = params?.[0];
                itemTags.delete(itemId);
            }
            if (query.includes('DELETE FROM tags WHERE id')) {
                const tagId = params?.[0];
                tags.delete(tagId);
                // Cascade delete item_tags
                for (const tagSet of itemTags.values()) {
                    tagSet.delete(tagId);
                }
            }
            if (query.includes('INSERT INTO tag_merges')) {
                const [id, targetTagId, sourceTagId, sourceTagName, mergedAt, mergedBy] = params || [];
                tagMerges.push({ id, targetTagId, sourceTagId, sourceTagName, mergedAt, mergedBy });
            }
            if (query.includes('INSERT INTO tag_aliases')) {
                const [id, aliasName, targetTagId, createdAt] = params || [];
                const normalized = aliasName.toLowerCase().trim();
                tagAliases.set(normalized, { id, aliasName, targetTagId, createdAt });
            }
            return Promise.resolve();
        }),
        _mockData: {
            tags,
            itemTags,
            tagMerges,
            tagAliases,
            metadata
        }
    };
};

describe('Tag Storage - Integration Tests', () => {
    let mockDB: ReturnType<typeof createMockDB>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDB = createMockDB();
        vi.mocked(getDB).mockResolvedValue(mockDB as any);
    });

    describe('CRUD Operations', () => {
        it('should create tag with normalized name', async () => {
            const tagId = await getOrCreateTag('Landscape', 'manual');

            expect(tagId).toBeTruthy();
            const tag = Array.from(mockDB._mockData.tags.values()).find((t: any) => t.id === tagId);
            expect(tag?.name).toBe('Landscape');
            expect(tag?.normalizedName).toBe('landscape');
        });

        it('should deduplicate by normalized name', async () => {
            const id1 = await getOrCreateTag('Landscape', 'manual');
            const id2 = await getOrCreateTag('landscape', 'manual');
            const id3 = await getOrCreateTag('LANDSCAPE', 'manual');

            expect(id1).toBe(id2);
            expect(id2).toBe(id3);
        });

        it('should allow same name for different types', async () => {
            const aiTagId = await getOrCreateTag('sunset', 'ai');
            const manualTagId = await getOrCreateTag('sunset', 'manual');

            expect(aiTagId).not.toBe(manualTagId);
            expect(mockDB._mockData.tags.size).toBe(2);
        });

        it('should add tag to item', async () => {
            const tagId = await getOrCreateTag('nature', 'manual');
            const itemId = 'item-1';

            await addTagToItem(itemId, tagId);

            expect(mockDB._mockData.itemTags.get(itemId)?.has(tagId)).toBe(true);
        });
    });

    describe('Merge Operations', () => {
        it('should merge tags without losing associations', async () => {
            const targetTagId = await getOrCreateTag('landscape', 'manual');
            const sourceTagId1 = await getOrCreateTag('landscapes', 'manual');
            const sourceTagId2 = await getOrCreateTag('landschaft', 'manual');

            const itemId1 = 'item-1';
            const itemId2 = 'item-2';
            const itemId3 = 'item-3';

            await addTagToItem(itemId1, targetTagId);
            await addTagToItem(itemId2, sourceTagId1);
            await addTagToItem(itemId3, sourceTagId2);

            await mergeTags(targetTagId, [sourceTagId1, sourceTagId2]);

            // All items should now have target tag
            expect(mockDB._mockData.itemTags.get(itemId1)?.has(targetTagId)).toBe(true);
            expect(mockDB._mockData.itemTags.get(itemId2)?.has(targetTagId)).toBe(true);
            expect(mockDB._mockData.itemTags.get(itemId3)?.has(targetTagId)).toBe(true);

            // Source tags should be deleted
            expect(mockDB._mockData.tags.has(sourceTagId1)).toBe(false);
            expect(mockDB._mockData.tags.has(sourceTagId2)).toBe(false);

            // Target tag should still exist
            expect(mockDB._mockData.tags.has(targetTagId)).toBe(true);
        });

        it('should record merge in tag_merges table', async () => {
            const targetTagId = await getOrCreateTag('portrait', 'manual');
            const sourceTagId = await getOrCreateTag('portraits', 'manual');

            expect(mockDB._mockData.tagMerges.length).toBe(0);

            await mergeTags(targetTagId, [sourceTagId], 'user');

            expect(mockDB._mockData.tagMerges.length).toBe(1);
            expect(mockDB._mockData.tagMerges[0]?.targetTagId).toBe(targetTagId);
            expect(mockDB._mockData.tagMerges[0]?.sourceTagId).toBe(sourceTagId);
            expect(mockDB._mockData.tagMerges[0]?.mergedBy).toBe('user');
        });

        it('should prevent duplicate tags after merge', async () => {
            const targetTagId = await getOrCreateTag('sunset', 'ai');
            const sourceTagId = await getOrCreateTag('sunsets', 'ai');

            const itemId = 'item-1';
            await addTagToItem(itemId, targetTagId);
            await addTagToItem(itemId, sourceTagId);

            // Item has both tags before merge
            expect(mockDB._mockData.itemTags.get(itemId)?.size).toBe(2);

            await mergeTags(targetTagId, [sourceTagId]);

            // After merge, should only have target tag
            expect(mockDB._mockData.itemTags.get(itemId)?.has(targetTagId)).toBe(true);
            expect(mockDB._mockData.itemTags.get(itemId)?.has(sourceTagId)).toBe(false);
        });
    });

    describe('Alias System', () => {
        it('should create alias', async () => {
            const canonicalTagId = await getOrCreateTag('black and white', 'manual');
            await createTagAlias('B&W', canonicalTagId);

            // Verify alias was created in mock
            const normalized = 'b&w';
            expect(mockDB._mockData.tagAliases.has(normalized)).toBe(true);
            const alias = mockDB._mockData.tagAliases.get(normalized);
            expect(alias?.targetTagId).toBe(canonicalTagId);
        });

        it('should handle case-insensitive alias creation', async () => {
            const tagId = await getOrCreateTag('portrait', 'manual');
            await createTagAlias('face', tagId);
            await createTagAlias('FACE2', tagId);

            const normalized1 = 'face';
            const normalized2 = 'face2';
            
            expect(mockDB._mockData.tagAliases.has(normalized1)).toBe(true);
            expect(mockDB._mockData.tagAliases.has(normalized2)).toBe(true);
        });

        it('should allow multiple aliases for same tag', async () => {
            const tagId = await getOrCreateTag('black and white', 'manual');
            
            await createTagAlias('B&W', tagId);
            await createTagAlias('monochrome', tagId);
            await createTagAlias('noir et blanc', tagId);

            expect(mockDB._mockData.tagAliases.size).toBe(3);
            expect(mockDB._mockData.tagAliases.get('b&w')?.targetTagId).toBe(tagId);
            expect(mockDB._mockData.tagAliases.get('monochrome')?.targetTagId).toBe(tagId);
            expect(mockDB._mockData.tagAliases.get('noir et blanc')?.targetTagId).toBe(tagId);
        });
    });

    describe('Sync Operations', () => {
        it('should sync tags from JSON metadata to relational DB', async () => {
            // Add metadata to mock
            mockDB._mockData.metadata.set('item-1', {
                id: 'item-1',
                aiTags: JSON.stringify(['sunset', 'landscape']),
                manualTags: JSON.stringify(['featured'])
            });

            mockDB._mockData.metadata.set('item-2', {
                id: 'item-2',
                aiTags: JSON.stringify(['portrait']),
                manualTags: JSON.stringify(['best'])
            });

            const count = await syncAllTagsFromMetadata();

            expect(count).toBe(2);
            expect(mockDB._mockData.tags.size).toBeGreaterThan(0);
        });

        it('should handle empty metadata gracefully', async () => {
            mockDB._mockData.metadata.set('item-1', {
                id: 'item-1',
                aiTags: '[]',
                manualTags: '[]'
            });

            const count = await syncAllTagsFromMetadata();

            expect(count).toBe(0);
        });
    });
});
