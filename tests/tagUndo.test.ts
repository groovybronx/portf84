import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mergeTags, undoMerge, getUndoableMerges } from '../src/services/storage/tags';

// Mock database
const mockExecute = vi.fn();
const mockSelect = vi.fn();
const mockDB = {
  execute: mockExecute,
  select: mockSelect,
};

// Mock getDB to return our mock DB
vi.mock('../src/services/storage/db', () => ({
  getDB: vi.fn(async () => mockDB),
}));

// Mock nanoid for predictable IDs
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id',
}));

describe('Tag Undo Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should capture snapshot during merge', async () => {
    const targetTagId = 'target-1';
    const sourceTagId = 'source-1';

    // Mock DB responses
    mockSelect.mockImplementation((query, params) => {
      // 1. Get source tag name
      if (query.includes('FROM tags WHERE id = ?')) {
        return Promise.resolve([{ name: 'Source Tag' }]);
      }
      // 2. Get items with tags (snapshot capture)
      if (query.includes('SELECT itemId FROM item_tags')) {
        if (params[0] === sourceTagId) return Promise.resolve([{ itemId: 'item-A' }]);
        if (params[0] === targetTagId) return Promise.resolve([{ itemId: 'item-B' }]);
      }
      return Promise.resolve([]);
    });

    await mergeTags(targetTagId, [sourceTagId]);

    // Verify INSERT into tag_merges includes JSON snapshot
    const insertCall = mockExecute.mock.calls.find(call => 
      call[0].includes('INSERT INTO tag_merges')
    );
    expect(insertCall).toBeDefined();
    expect(insertCall).toBeDefined();
    if (!insertCall) throw new Error("insertCall undefined");
    const params = insertCall[1];
    
    // params: [id, targetId, sourceId, sourceName, time, by, json]
    const jsonParam = params[6];
    expect(jsonParam).toBeDefined();
    
    const snapshot = JSON.parse(jsonParam);
    expect(snapshot.sourceItems).toEqual(['item-A']);
    expect(snapshot.targetItems).toEqual(['item-B']);
  });

  it('should undo merge and restore associations correctly', async () => {
    const mergeId = 'merge-1';
    const sourceTagId = 'source-1';
    const targetTagId = 'target-1';
    const snapshot = {
      sourceItems: ['item-A', 'item-C'], // items that had Source
      targetItems: ['item-B', 'item-C']  // item-C already had Target too
    };

    // Mock DB responses for undoMerge
    mockSelect.mockImplementation((query) => {
      if (query.includes('FROM tag_merges')) {
        return Promise.resolve([{
          id: mergeId,
          targetTagId,
          sourceTagId,
          sourceTagName: 'Source Tag',
          mergedBy: 'user',
          itemIdsJson: JSON.stringify(snapshot)
        }]);
      }
      return Promise.resolve([]);
    });

    await undoMerge(mergeId);

    // 1. Verify Source Tag Re-creation
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tags'),
      expect.arrayContaining(['Source Tag', 'manual'])
    );

    // 2. Verify Item Associations Restoration
    // item-A: Should get Source added, Target removed (wasn't in targetItems)
    // item-C: Should get Source added, Target KEPT (was in targetItems)

    const calls = mockExecute.mock.calls;
    
    // Check item-A
    const addSourceToA = calls.some(call => 
      call[0].includes('INSERT OR IGNORE INTO item_tags') && 
      call[1][0] === 'item-A' && 
      call[1][1] === sourceTagId
    );
    expect(addSourceToA).toBe(true);

    const removeTargetFromA = calls.some(call => 
      call[0].includes('DELETE FROM item_tags') && 
      call[1][0] === 'item-A' && 
      call[1][1] === targetTagId
    );
    expect(removeTargetFromA).toBe(true); // Should be removed

    // Check item-C
    const addSourceToC = calls.some(call => 
        call[0].includes('INSERT OR IGNORE INTO item_tags') && 
        call[1][0] === 'item-C' && 
        call[1][1] === sourceTagId
    );
    expect(addSourceToC).toBe(true);
  
    const removeTargetFromC = calls.some(call => 
        call[0].includes('DELETE FROM item_tags') && 
        call[1][0] === 'item-C' && 
        call[1][1] === targetTagId
    );
    expect(removeTargetFromC).toBe(false); // Should NOT be removed
  });

  it('should get undoable merges', async () => {
    mockSelect.mockResolvedValueOnce(['merge1', 'merge2']);
    const result = await getUndoableMerges();
    expect(result).toEqual(['merge1', 'merge2']);
    
    // Verify query filters by itemIdsJson IS NOT NULL
    const lastCall = mockSelect.mock.calls[mockSelect.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    if (!lastCall) throw new Error("lastCall undefined");
    expect(lastCall[0]).toContain('itemIdsJson IS NOT NULL');
    expect(lastCall[0]).toContain('mergedAt > ?');
  });
});
