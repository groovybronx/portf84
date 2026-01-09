/**
 * Database Connection Module
 * Handles SQLite initialization and provides the DB instance
 */
/// <reference types="vite/client" />
import Database from '@tauri-apps/plugin-sql';
import { STORAGE_KEYS } from '../../shared/constants';

import { logger } from '../../shared/utils/logger';
// Default path is relative to AppData usually
const DEFAULT_DB_NAME = import.meta.env.VITE_DB_NAME || 'lumina.db';

let dbInstance: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

const getConnectionString = () => {
  const customPath = localStorage.getItem(STORAGE_KEYS.DB_PATH);
  if (customPath) {
    // Custom absolute path requires specific handling or just passing the path depending on OS/Plugin
    // For sql plugin, usually `sqlite:/path/to/db` works for absolute paths on some platforms
    // But `sqlite:filename` is relative to AppData.
    // Let's try explicit path. Important: Windows paths might need handling.
    logger.debug('storage', '[Storage] Using custom DB path:', customPath);
    // Note: The plugin-sql load function expects a connection string.
    // If it's a file path, we prefix with sqlite:
    return `sqlite:${customPath}/${DEFAULT_DB_NAME}`;
  }
  // Default behavior (relative to AppData)
  return `sqlite:${DEFAULT_DB_NAME}`;
};

/**
 * Get or initialize the database connection
 * Uses singleton pattern with initialization promise to handle concurrent calls
 */
export const getDB = async (): Promise<Database> => {
  // Return existing instance immediately
  if (dbInstance) {
    logger.debug('storage', '[Storage] Returning existing DB instance');
    return dbInstance;
  }

  // If initialization is in progress, wait for it
  if (dbInitPromise) {
    logger.debug('storage', '[Storage] DB initialization in progress, waiting...');
    return dbInitPromise;
  }

  // Start new initialization
  const connectionString = getConnectionString();
  logger.debug(
    'storage',
    '[Storage] Initializing NEW SQLite database instance at ${connectionString}...'
  );

  dbInitPromise = (async () => {
    const db = await Database.load(connectionString);

    // Initialize Schema - Collections Architecture
    try {
      // Collections table (Workspaces)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS collections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          lastOpenedAt INTEGER,
          isActive INTEGER DEFAULT 0
        )
      `);

      // Source folders (physical folders linked to a collection)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS collection_folders (
          id TEXT PRIMARY KEY,
          collectionId TEXT NOT NULL,
          path TEXT NOT NULL,
          name TEXT NOT NULL,
          addedAt INTEGER NOT NULL,
          FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
        )
      `);

      // Virtual folders (linked to a collection)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS virtual_folders (
          id TEXT PRIMARY KEY,
          collectionId TEXT NOT NULL,
          name TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          isVirtual INTEGER DEFAULT 1,
          sourceFolderId TEXT,
          FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
        )
      `);

      // Metadata (linked to a collection)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS metadata (
          id TEXT PRIMARY KEY,
          collectionId TEXT,
          virtualFolderId TEXT,
          aiDescription TEXT,
          aiTags TEXT,
          aiTagsDetailed TEXT,
          colorTag TEXT,
          manualTags TEXT,
          isHidden INTEGER DEFAULT 0,
          lastModified INTEGER NOT NULL,
          FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE SET NULL
        )
      `);

      // Legacy handles table (deprecated, will be removed in migration)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS handles (
          id TEXT PRIMARY KEY,
          path TEXT NOT NULL UNIQUE,
          isRoot INTEGER DEFAULT 0
        )
      `);

      // ==================== PERFORMANCE INDEXES ====================
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_metadata_collectionId
        ON metadata(collectionId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_metadata_virtualFolderId
        ON metadata(virtualFolderId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_virtual_folders_sourceFolderId
        ON virtual_folders(sourceFolderId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_collection_folders_collectionId
        ON collection_folders(collectionId)
      `);
      logger.debug('storage', '[Storage] Performance indexes created/verified');

      // ==================== NORMALIZED TAGS TABLES ====================
      // Table des tags uniques
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          normalizedName TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('ai', 'manual', 'ai_detailed')),
          confidence REAL,
          parentId TEXT,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (parentId) REFERENCES tags(id) ON DELETE SET NULL
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tags_parent
        ON tags(parentId)
      `);
      await db.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_normalized
        ON tags(normalizedName, type)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tags_name
        ON tags(name)
      `);

      // Table de liaison items ↔ tags (many-to-many)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS item_tags (
          itemId TEXT NOT NULL,
          tagId TEXT NOT NULL,
          addedAt INTEGER NOT NULL,
          PRIMARY KEY (itemId, tagId),
          FOREIGN KEY (itemId) REFERENCES metadata(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_item_tags_item
        ON item_tags(itemId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_item_tags_tag
        ON item_tags(tagId)
      `);
      logger.debug('storage', '[Storage] Tags tables created/verified');

      // ==================== TAG MERGES HISTORY ====================
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tag_merges (
          id TEXT PRIMARY KEY,
          targetTagId TEXT NOT NULL,
          sourceTagId TEXT NOT NULL,
          sourceTagName TEXT,
          mergedAt INTEGER NOT NULL,
          mergedBy TEXT,
          FOREIGN KEY (targetTagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tag_merges_target
        ON tag_merges(targetTagId)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tag_merges_merged_at
        ON tag_merges(mergedAt)
      `);
      logger.debug('storage', '[Storage] Tag merges history table created/verified');

      // Migration V2: Add snapshots for undo
      try {
        const result = await db.select<Array<{ name: string }>>('PRAGMA table_info(tag_merges)');
        const hasSourceTagName = result.some((col) => col.name === 'sourceTagName');
        const hasItemIdsJson = result.some((col) => col.name === 'itemIdsJson');

        if (!hasSourceTagName) {
          await db.execute('ALTER TABLE tag_merges ADD COLUMN sourceTagName TEXT');
          logger.debug('storage', '[Storage] Migration: Added sourceTagName to tag_merges');
        }
        if (!hasItemIdsJson) {
          await db.execute('ALTER TABLE tag_merges ADD COLUMN itemIdsJson TEXT');
          logger.debug('storage', '[Storage] Migration: Added itemIdsJson to tag_merges');
        }
      } catch (e) {
        logger.error('storage', '[Storage] Migration V2 for tag_merges failed:', e);
      }

      // ==================== TAG ALIASES ====================
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tag_aliases (
          id TEXT PRIMARY KEY,
          aliasName TEXT NOT NULL,
          targetTagId TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (targetTagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
      await db.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tag_aliases_name
        ON tag_aliases(aliasName)
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tag_aliases_target
        ON tag_aliases(targetTagId)
      `);
      logger.debug('storage', '[Storage] Tag aliases table created/verified');

      // ==================== TAG IGNORE MATCHES ====================
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tag_ignore_matches (
          id TEXT PRIMARY KEY,
          tagId1 TEXT NOT NULL,
          tagId2 TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (tagId1) REFERENCES tags(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId2) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tag_ignore_tags
        ON tag_ignore_matches(tagId1, tagId2)
      `);
      logger.debug('storage', '[Storage] Tag ignore matches table created/verified');

      // ==================== SMART COLLECTIONS ====================
      await db.execute(`
        CREATE TABLE IF NOT EXISTS smart_collections (
          id TEXT PRIMARY KEY,
          collectionId TEXT,
          name TEXT NOT NULL,
          query TEXT NOT NULL, -- JSON-stringified query object
          icon TEXT,
          color TEXT,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
        )
      `);

      // Migration: Add collectionId if it doesn't exist
      try {
        await db.execute('ALTER TABLE smart_collections ADD COLUMN collectionId TEXT');
        logger.debug('storage', '[Storage] Migration: Added collectionId to smart_collections');
      } catch (e) {
        // Column likely already exists
      }

      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_smart_collections_collectionId
        ON smart_collections(collectionId)
      `);
      logger.debug('storage', '[Storage] Smart collections table created/verified');

      logger.debug('storage', '[Storage] Schema initialized successfully');
      dbInstance = db;
      return db;
    } catch (error) {
      logger.error('storage', '[Storage] Schema initialization failed:', error);
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
};

/**
 * Reset database connection (for development/testing)
 */
export const resetDatabase = async (): Promise<void> => {
  if (dbInstance) {
    logger.debug('storage', '[Storage] Closing database connection...');
    dbInstance = null;
    dbInitPromise = null;
  }
  logger.debug(
    'storage',
    '[Storage] Database reset completed. The DB will be recreated on next access.'
  );
};
