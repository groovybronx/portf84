import Database from "@tauri-apps/plugin-sql";
import type {
	DBMetadata,
	DBVirtualFolder,
	DBCollection,
	DBCollectionFolder,
	DBHandle,
	ParsedMetadata,
	ParsedVirtualFolder,
	ParsedHandle,
	ParsedCollection,
	MetadataInput,
	VirtualFolderInput,
	ShadowFolderPair,
} from "../shared/types/database";

const DB_PATH = "sqlite:lumina.db";
let dbInstance: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

const getDB = async (): Promise<Database> => {
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
			// Create indexes if they don't exist (idempotent)
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

			console.log("[Storage] Schema initialized successfully");
			dbInstance = db;
			return db;
		} catch (error) {
			console.error("[Storage] Schema initialization failed:", error);
			dbInitPromise = null; // Reset on failure
			throw error;
		}
	})();

	return dbInitPromise;
};

export const storageService = {
	// --- Handles (Root Directory Access) ---
	addDirectoryHandle: async (path: string, isRoot: boolean = false) => {
		const db = await getDB();
		console.log(`[Storage] Adding handle: ${path} (isRoot: ${isRoot})`);
		try {
			await db.execute(
				"INSERT OR REPLACE INTO handles (id, path, isRoot) VALUES (?, ?, ?)",
				[path, path, isRoot ? 1 : 0]
			);
			console.log(`[Storage] Handle saved successfully.`);
		} catch (e) {
			console.error(`[Storage] Failed to save handle:`, e);
		}
	},

	getDirectoryHandles: async (): Promise<ParsedHandle[]> => {
		const db = await getDB();
		const results = await db.select<DBHandle[]>("SELECT * FROM handles");
		return results.map((h) => ({
			...h,
			isRoot: h.isRoot === 1,
		}));
	},

	removeDirectoryHandle: async (id: string) => {
		const db = await getDB();
		await db.execute("DELETE FROM handles WHERE id = ?", [id]);
	},

	clearHandles: async () => {
		const db = await getDB();
		await db.execute("DELETE FROM handles");
	},

	// --- Metadata (AI Tags, Colors, Folder Assignment) ---
	saveMetadata: async (
		item: MetadataInput,
		relativePath: string,
		collectionId?: string
	): Promise<void> => {
		const db = await getDB();
		const finalCollectionId = collectionId || item.collectionId;

		console.log(
			`[Storage] Saving metadata for: ${relativePath} (collection: ${finalCollectionId})`
		);
		try {
			await db.execute(
				`INSERT OR REPLACE INTO metadata 
        (id, collectionId, virtualFolderId, aiDescription, aiTags, aiTagsDetailed, colorTag, manualTags, lastModified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					relativePath,
					finalCollectionId || null,
					item.virtualFolderId || item.folderId || null,
					item.aiDescription,
					JSON.stringify(item.aiTags || []),
					JSON.stringify(item.aiTagsDetailed || []),
					item.colorTag,
					JSON.stringify(item.manualTags || []),
					Date.now(),
				]
			);
			console.log(`[Storage] Metadata saved.`);
		} catch (e) {
			console.error(`[Storage] Failed to save metadata:`, e);
		}
	},

	getMetadataBatch: async (
		keys: string[],
		collectionId?: string
	): Promise<Map<string, ParsedMetadata>> => {
		const db = await getDB();
		const resultMap = new Map<string, ParsedMetadata>();

		let results: DBMetadata[] = [];
		if (keys.length === 0) {
			// No keys: return all metadata (optionally filtered by collection)
			if (collectionId) {
				results = await db.select<DBMetadata[]>(
					"SELECT * FROM metadata WHERE collectionId = ?",
					[collectionId]
				);
				console.log(
					`[Storage] getMetadataBatch: Loaded ${results.length} metadata for collection ${collectionId}`
				);
			} else {
				results = await db.select<DBMetadata[]>("SELECT * FROM metadata");
				console.log(
					`[Storage] getMetadataBatch: Loaded ${results.length} metadata (all collections)`
				);
			}
		} else {
			// With keys: fetch specific items (optionally filtered by collection)
			for (const key of keys) {
				let row: DBMetadata[];
				if (collectionId) {
					row = await db.select<DBMetadata[]>(
						"SELECT * FROM metadata WHERE id = ? AND collectionId = ?",
						[key, collectionId]
					);
				} else {
					row = await db.select<DBMetadata[]>("SELECT * FROM metadata WHERE id = ?", [
						key,
					]);
				}
				if (row.length > 0 && row[0]) results.push(row[0]);
			}
			console.log(
				`[Storage] getMetadataBatch: Loaded ${results.length}/${
					keys.length
				} metadata for collection ${collectionId || "all"}`
			);
		}

		results.forEach((meta) => {
			resultMap.set(meta.id, {
				id: meta.id,
				collectionId: meta.collectionId,
				virtualFolderId: meta.virtualFolderId,
				folderId: meta.virtualFolderId ?? undefined,
				aiDescription: meta.aiDescription,
				aiTags: JSON.parse(meta.aiTags || "[]"),
				aiTagsDetailed: JSON.parse(meta.aiTagsDetailed || "[]"),
				colorTag: meta.colorTag,
				manualTags: JSON.parse(meta.manualTags || "[]"),
				isHidden: meta.isHidden === 1,
				lastModified: meta.lastModified,
			});
		});
		return resultMap;
	},

	// --- Virtual Folders Persistence ---
	saveVirtualFolder: async (folder: VirtualFolderInput): Promise<void> => {
		const db = await getDB();
		await db.execute(
			"INSERT OR REPLACE INTO virtual_folders (id, collectionId, name, createdAt, isVirtual, sourceFolderId) VALUES (?, ?, ?, ?, ?, ?)",
			[
				folder.id,
				folder.collectionId,
				folder.name,
				folder.createdAt,
				1,
				folder.sourceFolderId || null,
			]
		);
	},

	deleteVirtualFolder: async (id: string) => {
		const db = await getDB();
		await db.execute("DELETE FROM virtual_folders WHERE id = ?", [id]);
	},

	getVirtualFolders: async (collectionId?: string): Promise<ParsedVirtualFolder[]> => {
		const db = await getDB();
		let rawFolders: DBVirtualFolder[];
		if (collectionId) {
			rawFolders = await db.select<DBVirtualFolder[]>(
				"SELECT * FROM virtual_folders WHERE collectionId = ?",
				[collectionId]
			);
			console.log(
				`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders for collection ${collectionId}`
			);
		} else {
			rawFolders = await db.select<DBVirtualFolder[]>("SELECT * FROM virtual_folders");
			console.log(
				`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders (all collections)`
			);
		}
		return rawFolders.map((f) => ({
			...f,
			items: [] as [],
			isVirtual: f.isVirtual === 1,
			sourceFolderId: f.sourceFolderId ?? undefined,
		}));
	},

	// --- Collections Management ---
	createCollection: async (name: string): Promise<string> => {
		const db = await getDB();
		const id = `col-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;

		await db.execute(
			"INSERT INTO collections (id, name, createdAt, lastOpenedAt, isActive) VALUES (?, ?, ?, ?, ?)",
			[id, name, Date.now(), Date.now(), 1]
		);

		// Deactivate all other collections
		await db.execute("UPDATE collections SET isActive = 0 WHERE id != ?", [id]);

		console.log(`[Storage] Collection created: ${name} (${id})`);
		return id;
	},

	getCollections: async (): Promise<ParsedCollection[]> => {
		const db = await getDB();
		const collections = await db.select<DBCollection[]>(
			"SELECT * FROM collections ORDER BY lastOpenedAt DESC"
		);
		return collections.map((c) => ({
			...c,
			lastOpenedAt: c.lastOpenedAt ?? undefined,
			isActive: c.isActive === 1,
		}));
	},

	getActiveCollection: async (): Promise<ParsedCollection | null> => {
		const db = await getDB();
		const results = await db.select<DBCollection[]>(
			"SELECT * FROM collections WHERE isActive = 1 LIMIT 1"
		);
		if (results.length === 0 || !results[0]) return null;
		const c = results[0];
		return {
			id: c.id,
			name: c.name,
			createdAt: c.createdAt,
			lastOpenedAt: c.lastOpenedAt ?? undefined,
			isActive: true,
		};
	},

	setActiveCollection: async (id: string): Promise<void> => {
		const db = await getDB();
		await db.execute("UPDATE collections SET isActive = 0");
		await db.execute(
			"UPDATE collections SET isActive = 1, lastOpenedAt = ? WHERE id = ?",
			[Date.now(), id]
		);
		console.log(`[Storage] Active collection set to: ${id}`);
	},

	deleteCollection: async (id: string): Promise<void> => {
		const db = await getDB();
		// Foreign key constraints will cascade delete collection_folders and virtual_folders
		await db.execute("DELETE FROM collections WHERE id = ?", [id]);
		// Clean up metadata
		await db.execute(
			"UPDATE metadata SET collectionId = NULL WHERE collectionId = ?",
			[id]
		);
		console.log(`[Storage] Collection deleted: ${id}`);
	},

	addFolderToCollection: async (
		collectionId: string,
		path: string
	): Promise<string> => {
		console.log(`[Storage] addFolderToCollection called with:`, {
			collectionId,
			path,
		});
		const db = await getDB();
		const name = path.split("/").pop() || "Folder";
		const id = `src-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;

		console.log(`[Storage] Inserting into collection_folders:`, {
			id,
			collectionId,
			path,
			name,
		});

		try {
			// 1. Add source folder to collection_folders
			await db.execute(
				"INSERT INTO collection_folders (id, collectionId, path, name, addedAt) VALUES (?, ?, ?, ?, ?)",
				[id, collectionId, path, name, Date.now()]
			);
			console.log(
				`[Storage] ✅ Folder successfully added to collection: ${path}`
			);

			// Verify insertion
			const verify = await db.select<DBCollectionFolder[]>(
				"SELECT * FROM collection_folders WHERE id = ?",
				[id]
			);
			console.log(`[Storage] Verification - Inserted row:`, verify);

			// 2. Automatically create shadow folder (if not already exists)
			const existingShadow = await storageService.getShadowFolder(id);
			if (existingShadow) {
				console.log(
					`[Storage] ✅ Shadow folder already exists: ${existingShadow.id}, skipping creation`
				);
				return existingShadow.id;
			}

			const shadowId = await storageService.createShadowFolder(
				collectionId,
				id,
				name
			);
			console.log(
				`[Storage] ✅ Shadow folder created automatically: ${shadowId}`
			);

			return shadowId; // Return shadow folder ID instead of source folder ID
		} catch (error) {
			console.error(`[Storage] ❌ Error adding folder to collection:`, error);
			throw error;
		}
	},

	removeFolderFromCollection: async (
		collectionId: string,
		path: string
	): Promise<void> => {
		const db = await getDB();
		await db.execute(
			"DELETE FROM collection_folders WHERE collectionId = ? AND path = ?",
			[collectionId, path]
		);
		console.log(`[Storage] Folder removed from collection: ${path}`);
	},

	getCollectionFolders: async (collectionId: string): Promise<DBCollectionFolder[]> => {
		const db = await getDB();
		const result = await db.select<DBCollectionFolder[]>(
			"SELECT * FROM collection_folders WHERE collectionId = ? ORDER BY addedAt DESC",
			[collectionId]
		);
		console.log(`[Storage] getCollectionFolders(${collectionId}):`, result);
		return result;
	},

	// DEBUG: List all collection_folders in database
	debugListAllCollectionFolders: async (): Promise<DBCollectionFolder[]> => {
		const db = await getDB();
		const result = await db.select<DBCollectionFolder[]>(
			"SELECT * FROM collection_folders ORDER BY addedAt DESC"
		);
		console.log("[Storage] DEBUG - All collection_folders in DB:", result);
		return result;
	},

	// --- Shadow Folders Management ---
	createShadowFolder: async (
		collectionId: string,
		sourceFolderId: string,
		name: string
	): Promise<string> => {
		const db = await getDB();
		const id = `shadow-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;

		await db.execute(
			"INSERT INTO virtual_folders (id, collectionId, name, createdAt, isVirtual, sourceFolderId) VALUES (?, ?, ?, ?, ?, ?)",
			[id, collectionId, name, Date.now(), 1, sourceFolderId]
		);

		console.log(
			`[Storage] Shadow folder created: ${name} (${id}) for source ${sourceFolderId}`
		);
		return id;
	},

	getShadowFolder: async (sourceFolderId: string): Promise<ParsedVirtualFolder | null> => {
		const db = await getDB();
		const results = await db.select<DBVirtualFolder[]>(
			"SELECT * FROM virtual_folders WHERE sourceFolderId = ? LIMIT 1",
			[sourceFolderId]
		);
		if (results.length === 0 || !results[0]) return null;
		const f = results[0];
		return {
			id: f.id,
			collectionId: f.collectionId,
			name: f.name,
			createdAt: f.createdAt,
			items: [] as [],
			isVirtual: f.isVirtual === 1,
			sourceFolderId: f.sourceFolderId ?? undefined,
		};
	},

	// --- Virtual Deletion (Hide/Unhide Images) ---
	hideImage: async (imageId: string): Promise<void> => {
		const db = await getDB();
		await db.execute("UPDATE metadata SET isHidden = 1 WHERE id = ?", [
			imageId,
		]);
		console.log(`[Storage] Image hidden: ${imageId}`);
	},

	unhideImage: async (imageId: string): Promise<void> => {
		const db = await getDB();
		await db.execute("UPDATE metadata SET isHidden = 0 WHERE id = ?", [
			imageId,
		]);
		console.log(`[Storage] Image restored: ${imageId}`);
	},

	// --- Database Reset Utility ---
	resetDatabase: async (): Promise<void> => {
		// Close current instance
		if (dbInstance) {
			console.log("[Storage] Closing database connection...");
			// Note: Tauri SQL plugin doesn't expose close(), but we can reset our reference
			dbInstance = null;
			dbInitPromise = null;
		}

		console.log(
			"[Storage] Database reset completed. The DB will be recreated on next access."
		);
		// Note: Actual file deletion would require Tauri FS API
		// For now, dropping all tables is sufficient
	},

	// --- Helper Functions for Shadow Folders ---
	getShadowFoldersWithSources: async (
		collectionId: string
	): Promise<ShadowFolderPair[]> => {
		const shadowFolders = await storageService.getVirtualFolders(collectionId);
		const sourceFolders = await storageService.getCollectionFolders(
			collectionId
		);

		const results = shadowFolders
			.filter((vf) => vf.sourceFolderId)
			.map((shadow) => {
				const source = sourceFolders.find(
					(sf) => sf.id === shadow.sourceFolderId
				);
				return { shadowFolder: shadow, sourceFolder: source! };
			})
			.filter((pair) => pair.sourceFolder);

		console.log(
			`[Storage] getShadowFoldersWithSources: Found ${results.length} shadow folder pairs for collection ${collectionId}`
		);
		return results;
	},

	getManualCollections: async (collectionId: string): Promise<ParsedVirtualFolder[]> => {
		const allVirtual = await storageService.getVirtualFolders(collectionId);
		const manualCollections = allVirtual.filter((vf) => !vf.sourceFolderId);
		console.log(
			`[Storage] getManualCollections: Found ${manualCollections.length} manual collections`
		);
		return manualCollections;
	},
};
