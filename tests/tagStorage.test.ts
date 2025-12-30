/**
 * Tag Storage Test Suite
 * Tests for tag CRUD operations, merging, sync, and aliases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Database and types
interface MockDBTag {
    id: string;
    name: string;
    normalizedName: string;
    type: 'ai' | 'manual' | 'ai_detailed';
    confidence: number | null;
    createdAt: number;
}

interface MockDBItemTag {
    itemId: string;
    tagId: string;
    addedAt: number;
}

interface MockDBTagMerge {
    id: string;
    targetTagId: string;
    sourceTagId: string;
    mergedAt: number;
    mergedBy: string | null;
}

interface MockDBTagAlias {
    id: string;
    aliasName: string;
    targetTagId: string;
    createdAt: number;
}

interface MockDBMetadata {
    id: string;
    aiTags: string;
    manualTags: string;
}

// Mock database state
let mockTags: Map<string, MockDBTag>;
let mockItemTags: Map<string, Set<string>>; // itemId -> Set<tagId>
let mockTagMerges: MockDBTagMerge[];
let mockTagAliases: Map<string, MockDBTagAlias>;
let mockMetadata: Map<string, MockDBMetadata>;

// Reset database before each test
beforeEach(() => {
    mockTags = new Map();
    mockItemTags = new Map();
    mockTagMerges = [];
    mockTagAliases = new Map();
    mockMetadata = new Map();
});

// Helper functions to simulate storage operations
const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getOrCreateTag = async (
    name: string,
    type: 'ai' | 'manual' | 'ai_detailed',
    confidence?: number
): Promise<string> => {
    const normalizedName = name.toLowerCase().trim();
    
    // Check if tag exists
    for (const [id, tag] of mockTags.entries()) {
        if (tag.normalizedName === normalizedName && tag.type === type) {
            return id;
        }
    }
    
    // Create new tag
    const id = generateId('tag');
    mockTags.set(id, {
        id,
        name,
        normalizedName,
        type,
        confidence: confidence ?? null,
        createdAt: Date.now()
    });
    
    return id;
};

const addTagToItem = async (itemId: string, tagId: string): Promise<void> => {
    if (!mockItemTags.has(itemId)) {
        mockItemTags.set(itemId, new Set());
    }
    mockItemTags.get(itemId)?.add(tagId);
};

const getItemsWithTag = async (tagId: string): Promise<string[]> => {
    const items: string[] = [];
    for (const [itemId, tags] of mockItemTags.entries()) {
        if (tags.has(tagId)) {
            items.push(itemId);
        }
    }
    return items;
};

const deleteTag = async (tagId: string): Promise<void> => {
    mockTags.delete(tagId);
    // Cascade delete item_tags
    for (const tags of mockItemTags.values()) {
        tags.delete(tagId);
    }
};

const mergeTags = async (
    targetTagId: string,
    sourceTagIds: string[],
    mergedBy: string = 'user'
): Promise<void> => {
    for (const sourceId of sourceTagIds) {
        if (sourceId === targetTagId) continue;
        
        // Get all items with source tag
        const itemsWithSource = await getItemsWithTag(sourceId);
        
        // Add target tag to those items
        for (const itemId of itemsWithSource) {
            await addTagToItem(itemId, targetTagId);
        }
        
        // Record merge in history
        const mergeId = generateId('merge');
        mockTagMerges.push({
            id: mergeId,
            targetTagId,
            sourceTagId: sourceId,
            mergedAt: Date.now(),
            mergedBy
        });
        
        // Delete source tag
        await deleteTag(sourceId);
    }
};

const createTagAlias = async (aliasName: string, targetTagId: string): Promise<void> => {
    const normalizedAlias = aliasName.toLowerCase().trim();
    
    // Check if alias already exists
    if (mockTagAliases.has(normalizedAlias)) {
        throw new Error('Alias already exists');
    }
    
    const id = generateId('alias');
    mockTagAliases.set(normalizedAlias, {
        id,
        aliasName,
        targetTagId,
        createdAt: Date.now()
    });
};

const getTagByAlias = async (aliasName: string): Promise<MockDBTag | null> => {
    const normalizedAlias = aliasName.toLowerCase().trim();
    const alias = mockTagAliases.get(normalizedAlias);
    
    if (!alias) {
        return null;
    }
    
    return mockTags.get(alias.targetTagId) || null;
};

const syncAllTagsFromMetadata = async (): Promise<number> => {
    let count = 0;
    
    for (const [itemId, metadata] of mockMetadata.entries()) {
        let aiTags: string[] = [];
        let manualTags: string[] = [];
        
        try { aiTags = JSON.parse(metadata.aiTags || '[]'); } catch {}
        try { manualTags = JSON.parse(metadata.manualTags || '[]'); } catch {}
        
        if (aiTags.length === 0 && manualTags.length === 0) continue;
        
        // Clear existing tags for item
        mockItemTags.delete(itemId);
        
        // Add AI tags
        for (const tagName of aiTags) {
            const tagId = await getOrCreateTag(tagName, 'ai');
            await addTagToItem(itemId, tagId);
        }
        
        // Add manual tags
        for (const tagName of manualTags) {
            const tagId = await getOrCreateTag(tagName, 'manual');
            await addTagToItem(itemId, tagId);
        }
        
        count++;
    }
    
    return count;
};

// ==================== TESTS ====================

describe('Tag Storage - Merge Operations', () => {
    it('should merge tags without losing associations', async () => {
        // Setup: Create tags and items
        const targetTagId = await getOrCreateTag('landscape', 'manual');
        const sourceTagId1 = await getOrCreateTag('landscapes', 'manual');
        const sourceTagId2 = await getOrCreateTag('landschaft', 'manual');
        
        const itemId1 = 'item-1';
        const itemId2 = 'item-2';
        const itemId3 = 'item-3';
        
        await addTagToItem(itemId1, targetTagId);
        await addTagToItem(itemId2, sourceTagId1);
        await addTagToItem(itemId3, sourceTagId2);
        
        // Execute: Merge
        await mergeTags(targetTagId, [sourceTagId1, sourceTagId2]);
        
        // Verify: All items now have target tag
        expect(mockItemTags.get(itemId1)?.has(targetTagId)).toBe(true);
        expect(mockItemTags.get(itemId2)?.has(targetTagId)).toBe(true);
        expect(mockItemTags.get(itemId3)?.has(targetTagId)).toBe(true);
        
        // Verify: Source tags are deleted
        expect(mockTags.has(sourceTagId1)).toBe(false);
        expect(mockTags.has(sourceTagId2)).toBe(false);
        
        // Verify: Target tag still exists
        expect(mockTags.has(targetTagId)).toBe(true);
    });

    it('should record merge in tag_merges table', async () => {
        const targetTagId = await getOrCreateTag('portrait', 'manual');
        const sourceTagId = await getOrCreateTag('portraits', 'manual');
        
        expect(mockTagMerges.length).toBe(0);
        
        await mergeTags(targetTagId, [sourceTagId], 'user');
        
        expect(mockTagMerges.length).toBe(1);
        expect(mockTagMerges[0]?.targetTagId).toBe(targetTagId);
        expect(mockTagMerges[0]?.sourceTagId).toBe(sourceTagId);
        expect(mockTagMerges[0]?.mergedBy).toBe('user');
    });

    it('should prevent duplicate tags after merge', async () => {
        const targetTagId = await getOrCreateTag('sunset', 'ai');
        const sourceTagId = await getOrCreateTag('sunsets', 'ai');
        
        const itemId = 'item-1';
        await addTagToItem(itemId, targetTagId);
        await addTagToItem(itemId, sourceTagId);
        
        // Item has both tags before merge
        expect(mockItemTags.get(itemId)?.size).toBe(2);
        
        await mergeTags(targetTagId, [sourceTagId]);
        
        // After merge, should only have target tag (no duplicates)
        expect(mockItemTags.get(itemId)?.has(targetTagId)).toBe(true);
        expect(mockItemTags.get(itemId)?.has(sourceTagId)).toBe(false);
        expect(mockItemTags.get(itemId)?.size).toBe(1);
    });

    it('should handle cascade delete on source tags', async () => {
        const targetTagId = await getOrCreateTag('architecture', 'manual');
        const sourceTagId = await getOrCreateTag('architectural', 'manual');
        
        const itemId1 = 'item-1';
        const itemId2 = 'item-2';
        
        await addTagToItem(itemId1, sourceTagId);
        await addTagToItem(itemId2, sourceTagId);
        
        // Verify source tag is in item_tags
        expect(mockItemTags.get(itemId1)?.has(sourceTagId)).toBe(true);
        expect(mockItemTags.get(itemId2)?.has(sourceTagId)).toBe(true);
        
        await mergeTags(targetTagId, [sourceTagId]);
        
        // Verify source tag is removed from item_tags (cascade)
        expect(mockItemTags.get(itemId1)?.has(sourceTagId)).toBe(false);
        expect(mockItemTags.get(itemId2)?.has(sourceTagId)).toBe(false);
        
        // But items now have target tag
        expect(mockItemTags.get(itemId1)?.has(targetTagId)).toBe(true);
        expect(mockItemTags.get(itemId2)?.has(targetTagId)).toBe(true);
    });

    it('should handle auto merge type', async () => {
        const targetTagId = await getOrCreateTag('nature', 'ai');
        const sourceTagId = await getOrCreateTag('natural', 'ai');
        
        await mergeTags(targetTagId, [sourceTagId], 'auto');
        
        expect(mockTagMerges.length).toBe(1);
        expect(mockTagMerges[0]?.mergedBy).toBe('auto');
    });

    it('should skip self-merge', async () => {
        const tagId = await getOrCreateTag('landscape', 'manual');
        
        await mergeTags(tagId, [tagId]);
        
        // No merge should be recorded
        expect(mockTagMerges.length).toBe(0);
        // Tag should still exist
        expect(mockTags.has(tagId)).toBe(true);
    });
});

describe('Tag Storage - Sync Operations', () => {
    it('should sync tags from JSON metadata to relational DB', async () => {
        // Setup metadata
        mockMetadata.set('item-1', {
            id: 'item-1',
            aiTags: JSON.stringify(['sunset', 'landscape']),
            manualTags: JSON.stringify(['featured'])
        });
        
        mockMetadata.set('item-2', {
            id: 'item-2',
            aiTags: JSON.stringify(['portrait']),
            manualTags: JSON.stringify(['best'])
        });
        
        // Execute sync
        const count = await syncAllTagsFromMetadata();
        
        // Verify
        expect(count).toBe(2);
        
        // Check that tags were created
        let foundSunset = false;
        let foundPortrait = false;
        for (const tag of mockTags.values()) {
            if (tag.normalizedName === 'sunset' && tag.type === 'ai') foundSunset = true;
            if (tag.normalizedName === 'portrait' && tag.type === 'ai') foundPortrait = true;
        }
        expect(foundSunset).toBe(true);
        expect(foundPortrait).toBe(true);
        
        // Check that item_tags were created
        expect(mockItemTags.get('item-1')?.size).toBeGreaterThan(0);
        expect(mockItemTags.get('item-2')?.size).toBeGreaterThan(0);
    });

    it('should handle empty metadata gracefully', async () => {
        mockMetadata.set('item-1', {
            id: 'item-1',
            aiTags: '[]',
            manualTags: '[]'
        });
        
        const count = await syncAllTagsFromMetadata();
        
        // Item with no tags should not be counted
        expect(count).toBe(0);
        expect(mockItemTags.get('item-1')).toBeUndefined();
    });

    it('should handle invalid JSON gracefully', async () => {
        mockMetadata.set('item-1', {
            id: 'item-1',
            aiTags: 'invalid json',
            manualTags: '{not an array}'
        });
        
        const count = await syncAllTagsFromMetadata();
        
        // Should not throw, just skip
        expect(count).toBe(0);
    });

    it('should clear existing tags before sync', async () => {
        // Add some tags to item
        const itemId = 'item-1';
        const oldTagId = await getOrCreateTag('old-tag', 'manual');
        await addTagToItem(itemId, oldTagId);
        
        expect(mockItemTags.get(itemId)?.has(oldTagId)).toBe(true);
        
        // Setup metadata with different tags
        mockMetadata.set(itemId, {
            id: itemId,
            aiTags: JSON.stringify(['new-tag']),
            manualTags: '[]'
        });
        
        await syncAllTagsFromMetadata();
        
        // Old tag should be removed from item
        expect(mockItemTags.get(itemId)?.has(oldTagId)).toBe(false);
    });
});

describe('Tag Storage - Alias System', () => {
    it('should resolve alias to canonical tag', async () => {
        const canonicalTagId = await getOrCreateTag('black and white', 'manual');
        await createTagAlias('B&W', canonicalTagId);
        
        const resolvedTag = await getTagByAlias('B&W');
        
        expect(resolvedTag).not.toBeNull();
        expect(resolvedTag?.id).toBe(canonicalTagId);
        expect(resolvedTag?.name).toBe('black and white');
    });

    it('should create alias without duplicates', async () => {
        const tagId = await getOrCreateTag('landscape', 'manual');
        
        await createTagAlias('paysage', tagId);
        
        // Try to create same alias again
        await expect(createTagAlias('paysage', tagId)).rejects.toThrow('Alias already exists');
    });

    it('should handle case-insensitive alias resolution', async () => {
        const tagId = await getOrCreateTag('portrait', 'manual');
        await createTagAlias('face', tagId);
        
        const resolved1 = await getTagByAlias('face');
        const resolved2 = await getTagByAlias('FACE');
        const resolved3 = await getTagByAlias('Face');
        
        expect(resolved1?.id).toBe(tagId);
        expect(resolved2?.id).toBe(tagId);
        expect(resolved3?.id).toBe(tagId);
    });

    it('should return null for non-existent alias', async () => {
        const resolved = await getTagByAlias('non-existent-alias');
        expect(resolved).toBeNull();
    });

    it('should allow multiple aliases for same tag', async () => {
        const tagId = await getOrCreateTag('black and white', 'manual');
        
        await createTagAlias('B&W', tagId);
        await createTagAlias('monochrome', tagId);
        await createTagAlias('noir et blanc', tagId);
        
        const resolved1 = await getTagByAlias('B&W');
        const resolved2 = await getTagByAlias('monochrome');
        const resolved3 = await getTagByAlias('noir et blanc');
        
        expect(resolved1?.id).toBe(tagId);
        expect(resolved2?.id).toBe(tagId);
        expect(resolved3?.id).toBe(tagId);
    });
});

describe('Tag Storage - CRUD Operations', () => {
    it('should create tag with normalized name', async () => {
        const tagId = await getOrCreateTag('Landscape', 'manual');
        
        const tag = mockTags.get(tagId);
        expect(tag?.name).toBe('Landscape');
        expect(tag?.normalizedName).toBe('landscape');
    });

    it('should deduplicate by normalized name', async () => {
        const id1 = await getOrCreateTag('Landscape', 'manual');
        const id2 = await getOrCreateTag('landscape', 'manual');
        const id3 = await getOrCreateTag('LANDSCAPE', 'manual');
        
        // All should return same ID
        expect(id1).toBe(id2);
        expect(id2).toBe(id3);
    });

    it('should allow same name for different types', async () => {
        const aiTagId = await getOrCreateTag('sunset', 'ai');
        const manualTagId = await getOrCreateTag('sunset', 'manual');
        
        // Different types should get different IDs
        expect(aiTagId).not.toBe(manualTagId);
        expect(mockTags.size).toBe(2);
    });

    it('should store confidence for AI tags', async () => {
        const tagId = await getOrCreateTag('portrait', 'ai_detailed', 0.95);
        
        const tag = mockTags.get(tagId);
        expect(tag?.confidence).toBe(0.95);
    });

    it('should add tag to item', async () => {
        const tagId = await getOrCreateTag('nature', 'manual');
        const itemId = 'item-1';
        
        await addTagToItem(itemId, tagId);
        
        expect(mockItemTags.get(itemId)?.has(tagId)).toBe(true);
    });

    it('should handle adding same tag to item multiple times', async () => {
        const tagId = await getOrCreateTag('sunset', 'ai');
        const itemId = 'item-1';
        
        await addTagToItem(itemId, tagId);
        await addTagToItem(itemId, tagId);
        
        // Should only have tag once (Set behavior)
        expect(mockItemTags.get(itemId)?.size).toBe(1);
    });
});
