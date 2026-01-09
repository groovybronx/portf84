/**
 * Directory Handles Module
 * Legacy module for root directory access
 * @deprecated Will be removed in future migration
 */
import { getDB } from './db';
import type { DBHandle, ParsedHandle } from '../../shared/types/database';

import { logger } from '../../shared/utils/logger';
/**
 * Add a directory handle
 */
export const addDirectoryHandle = async (path: string, isRoot: boolean = false): Promise<void> => {
  const db = await getDB();
  logger.debug('app', '[Storage] Adding handle: ${path} (isRoot: ${isRoot})');
  try {
    await db.execute('INSERT OR REPLACE INTO handles (id, path, isRoot) VALUES (?, ?, ?)', [
      path,
      path,
      isRoot ? 1 : 0,
    ]);
    logger.debug('app', '[Storage] Handle saved successfully.');
  } catch (e) {
    logger.error('app', '[Storage] Failed to save handle:', e);
  }
};

/**
 * Get all directory handles
 */
export const getDirectoryHandles = async (): Promise<ParsedHandle[]> => {
  const db = await getDB();
  const results = await db.select<DBHandle[]>('SELECT * FROM handles');
  return results.map((h) => ({
    ...h,
    isRoot: h.isRoot === 1,
  }));
};

/**
 * Remove a directory handle
 */
export const removeDirectoryHandle = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.execute('DELETE FROM handles WHERE id = ?', [id]);
};

/**
 * Clear all directory handles
 */
export const clearHandles = async (): Promise<void> => {
  const db = await getDB();
  await db.execute('DELETE FROM handles');
};
