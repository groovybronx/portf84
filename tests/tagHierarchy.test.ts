import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getOrCreateTag, setTagParent, getTagTree, getAllTags } from '../src/services/storage/tags';
import { getDB } from '../src/services/storage/db';

// Mock DB
vi.mock('../src/services/storage/db', () => ({
  getDB: vi.fn()
}));

describe('Tag Hierarchy', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      select: vi.fn(),
      execute: vi.fn()
    };
    (getDB as any).mockResolvedValue(mockDb);
  });

  it('should allow setting a parent for a tag', async () => {
    await setTagParent('tag-child', 'tag-parent');
    expect(mockDb.execute).toHaveBeenCalledWith(
      "UPDATE tags SET parentId = ? WHERE id = ?",
      ['tag-parent', 'tag-child']
    );
  });

  it('should prevent setting a tag as its own parent', async () => {
    await expect(setTagParent('tag-1', 'tag-1')).rejects.toThrow("A tag cannot be its own parent");
  });

  it('should build a hierarchical tree from flat tags', async () => {
    const mockTags = [
      { id: '1', name: 'Root', type: 'manual', parentId: null },
      { id: '2', name: 'Child', type: 'manual', parentId: '1' },
      { id: '3', name: 'Grandchild', type: 'manual', parentId: '2' },
      { id: '4', name: 'Other Root', type: 'manual', parentId: null }
    ];

    mockDb.select.mockResolvedValue(mockTags);

    const tree = await getTagTree();

    expect(tree).toHaveLength(2);
    expect(tree[0]!.name).toBe('Root');
    expect(tree[0]!.children!).toHaveLength(1);
    expect(tree[0]!.children![0]!.name).toBe('Child');
    expect(tree[0]!.children![0]!.children!).toHaveLength(1);
    expect(tree[0]!.children![0]!.children![0]!.name).toBe('Grandchild');
    expect(tree[1]!.name).toBe('Other Root');
  });
});
