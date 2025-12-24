/**
 * Database Connection Module
 * Handles SQLite initialization and provides the DB instance
 */
import Database from "@tauri-apps/plugin-sql";

const DB_PATH = "sqlite:lumina.db";
let dbInstance: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

/**
 * Get or initialize the database connection
 * Uses singleton pattern with initialization promise to handle concurrent calls
 */
export const getDB = async (): Promise<Database> => {
	// Return existing instance immediately
	if (dbInstance) {
		console.log("[Storage] Returning existing DB instance");
		return dbInstance;
	}

	// If initialization is in progress, wait for it
	if (dbInitPromise) {
		console.log("[Storage] DB initialization in progress, waiting...");
		return dbInitPromise;
	}

	// Start new initialization
	console.log("[Storage] Initializing NEW SQLite database instance...");
	dbInitPromise = (async () => {
		const db = await Database.load(DB_PATH);

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
			console.log("[Storage] Performance indexes created/verified");

			// ==================== NORMALIZED TAGS TABLES ====================
			// Table des tags uniques
			await db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          normalizedName TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('ai', 'manual', 'ai_detailed')),
          confidence REAL,
          createdAt INTEGER NOT NULL
        )
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
			console.log("[Storage] Tags tables created/verified");

			console.log("[Storage] Schema initialized successfully");
			dbInstance = db;
			return db;
		} catch (error) {
			console.error("[Storage] Schema initialization failed:", error);
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
		console.log("[Storage] Closing database connection...");
		dbInstance = null;
		dbInitPromise = null;
	}
	console.log(
		"[Storage] Database reset completed. The DB will be recreated on next access."
	);
};
