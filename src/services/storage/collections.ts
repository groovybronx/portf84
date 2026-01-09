/**
 * Collections Management Module
 * CRUD operations for Collections (workspaces)
 */
import { getDB } from './db';
import { logger } from '../../shared/utils/logger';
import type { DBCollection, ParsedCollection } from '../../shared/types/database';

/**
 * Create a new collection
 */
export const createCollection = async (name: string): Promise<string> => {
  const db = await getDB();
  const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  await db.execute(
    'INSERT INTO collections (id, name, createdAt, lastOpenedAt, isActive) VALUES (?, ?, ?, ?, ?)',
    [id, name, Date.now(), Date.now(), 1]
  );

  // Deactivate all other collections
  await db.execute('UPDATE collections SET isActive = 0 WHERE id != ?', [id]);

  logger.debug('app', '[Storage] Collection created: ${name} (${id})');
  return id;
};

/**
 * Get all collections, ordered by last opened
 */
export const getCollections = async (): Promise<ParsedCollection[]> => {
  const db = await getDB();
  const collections = await db.select<DBCollection[]>(
    'SELECT * FROM collections ORDER BY createdAt ASC'
  );
  return collections.map((c) => {
    const base: ParsedCollection = {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      isActive: c.isActive === 1,
      ...(c.lastOpenedAt !== null ? { lastOpenedAt: c.lastOpenedAt } : {}),
    };
    return base;
  });
};

/**
 * Get the currently active collection
 */
export const getActiveCollection = async (): Promise<ParsedCollection | null> => {
  const db = await getDB();
  const results = await db.select<DBCollection[]>(
    'SELECT * FROM collections WHERE isActive = 1 LIMIT 1'
  );
  if (results.length === 0 || !results[0]) return null;
  const c = results[0];
  const base: ParsedCollection = {
    id: c.id,
    name: c.name,
    createdAt: c.createdAt,
    isActive: true,
    ...(c.lastOpenedAt !== null ? { lastOpenedAt: c.lastOpenedAt } : {}),
  };
  return base;
};

/**
 * Set a collection as active
 */
export const setActiveCollection = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.execute('UPDATE collections SET isActive = 0');
  await db.execute('UPDATE collections SET isActive = 1, lastOpenedAt = ? WHERE id = ?', [
    Date.now(),
    id,
  ]);
  logger.debug('app', '[Storage] Active collection set to: ${id}');
};

/**
 * Delete a collection and clean up related data
 */
export const deleteCollection = async (id: string): Promise<void> => {
  const db = await getDB();
  // Foreign key constraints will cascade delete collection_folders and virtual_folders
  await db.execute('DELETE FROM collections WHERE id = ?', [id]);
  // Clean up metadata
  await db.execute('UPDATE metadata SET collectionId = NULL WHERE collectionId = ?', [id]);
  logger.debug('app', '[Storage] Collection deleted: ${id}');
};
