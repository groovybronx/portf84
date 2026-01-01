import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSmartCollection, resolveSmartCollection } from '../src/services/smartCollectionService';
import { getDB } from '../src/services/storage/db';

vi.mock('../src/services/storage/db', () => ({
  getDB: vi.fn()
}));

describe('Smart Collections', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      select: vi.fn(),
      execute: vi.fn()
    };
    (getDB as any).mockResolvedValue(mockDb);
  });

  it('should create a smart collection', async () => {
    const input = {
      collectionId: 'coll-1',
      name: 'Test Album',
      query: { operator: 'AND', rules: [{ type: 'tag', value: 'Sea' }] }
    };
    const id = await createSmartCollection(input);
    expect(id).toMatch(/^smart-/);
    expect(mockDb.execute).toHaveBeenCalled();
  });

  it('should resolve a smart collection query with AND tags', async () => {
    mockDb.select.mockResolvedValueOnce([{ query: JSON.stringify({
      operator: 'AND',
      rules: [{ type: 'tag', value: 'Sunset' }, { type: 'tag', value: 'Beach' }]
    }) }]);
    
    mockDb.select.mockResolvedValueOnce([{ id: 'img-1' }]);

    const results = await resolveSmartCollection('smart-1', 'coll-1');
    
    expect(results).toEqual(['img-1']);
    const sql = mockDb.select.mock.calls[1][0];
    expect(sql).toContain('EXISTS');
    expect(sql).toContain('m.collectionId = ?');
  });

  it('should resolve a smart collection with NOT tags', async () => {
    mockDb.select.mockResolvedValueOnce([{ query: JSON.stringify({
      operator: 'AND',
      rules: [{ type: 'not_tag', value: 'Blurred' }]
    }) }]);
    
    mockDb.select.mockResolvedValueOnce([{ id: 'img-2' }]);

    await resolveSmartCollection('smart-1', 'coll-1');
    
    const sql = mockDb.select.mock.calls[1][0];
    expect(sql).toContain('NOT EXISTS');
  });
});
