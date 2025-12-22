import Database from "@tauri-apps/plugin-sql";

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

	getDirectoryHandles: async (): Promise<any[]> => {
		const db = await getDB();
		const results = await db.select<any[]>("SELECT * FROM handles");
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
		item: any,
		relativePath: string,
		collectionId?: string
	) => {
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
	): Promise<Map<string, any>> => {
		const db = await getDB();
		const resultMap = new Map<string, any>();

		let results: any[] = [];
		if (keys.length === 0) {
			// No keys: return all metadata (optionally filtered by collection)
			if (collectionId) {
				results = await db.select<any[]>(
					"SELECT * FROM metadata WHERE collectionId = ?",
					[collectionId]
				);
				console.log(
					`[Storage] getMetadataBatch: Loaded ${results.length} metadata for collection ${collectionId}`
				);
			} else {
				results = await db.select<any[]>("SELECT * FROM metadata");
				console.log(
					`[Storage] getMetadataBatch: Loaded ${results.length} metadata (all collections)`
				);
			}
		} else {
			// With keys: fetch specific items (optionally filtered by collection)
			for (const key of keys) {
				let row;
				if (collectionId) {
					row = await db.select<any[]>(
						"SELECT * FROM metadata WHERE id = ? AND collectionId = ?",
						[key, collectionId]
					);
				} else {
					row = await db.select<any[]>("SELECT * FROM metadata WHERE id = ?", [
						key,
					]);
				}
				if (row.length > 0) results.push(row[0]);
			}
			console.log(
				`[Storage] getMetadataBatch: Loaded ${results.length}/${
					keys.length
				} metadata for collection ${collectionId || "all"}`
			);
		}

		results.forEach((meta) => {
			resultMap.set(meta.id, {
				...meta,
				aiTags: JSON.parse(meta.aiTags || "[]"),
				aiTagsDetailed: JSON.parse(meta.aiTagsDetailed || "[]"),
				manualTags: JSON.parse(meta.manualTags || "[]"),
				virtualFolderId: meta.virtualFolderId,
				folderId: meta.virtualFolderId || meta.folderId, // Backward compat: prefer virtualFolderId
				collectionId: meta.collectionId,
			});
		});
		return resultMap;
	},

	// --- Virtual Folders Persistence ---
	saveVirtualFolder: async (folder: any) => {
		const db = await getDB();
		await db.execute(
			"INSERT OR REPLACE INTO virtual_folders (id, name, createdAt, isVirtual) VALUES (?, ?, ?, ?)",
			[folder.id, folder.name, folder.createdAt, 1]
		);
	},

	deleteVirtualFolder: async (id: string) => {
		const db = await getDB();
		await db.execute("DELETE FROM virtual_folders WHERE id = ?", [id]);
	},

	getVirtualFolders: async (collectionId?: string): Promise<any[]> => {
		const db = await getDB();
		let rawFolders;
		if (collectionId) {
			rawFolders = await db.select<any[]>(
				"SELECT * FROM virtual_folders WHERE collectionId = ?",
				[collectionId]
			);
			console.log(
				`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders for collection ${collectionId}`
			);
		} else {
			rawFolders = await db.select<any[]>("SELECT * FROM virtual_folders");
			console.log(
				`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders (all collections)`
			);
		}
		return rawFolders.map((f: any) => ({
			...f,
			items: [],
			isVirtual: f.isVirtual === 1,
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

	getCollections: async (): Promise<any[]> => {
		const db = await getDB();
		const collections = await db.select<any[]>(
			"SELECT * FROM collections ORDER BY lastOpenedAt DESC"
		);
		return collections.map((c) => ({
			...c,
			isActive: c.isActive === 1,
		}));
	},

	getActiveCollection: async (): Promise<any | null> => {
		const db = await getDB();
		const results = await db.select<any[]>(
			"SELECT * FROM collections WHERE isActive = 1 LIMIT 1"
		);
		if (results.length === 0) return null;
		return {
			...results[0],
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
	): Promise<void> => {
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
			await db.execute(
				"INSERT INTO collection_folders (id, collectionId, path, name, addedAt) VALUES (?, ?, ?, ?, ?)",
				[id, collectionId, path, name, Date.now()]
			);
			console.log(
				`[Storage] ✅ Folder successfully added to collection: ${path}`
			);

			// Verify insertion
			const verify = await db.select<any[]>(
				"SELECT * FROM collection_folders WHERE id = ?",
				[id]
			);
			console.log(`[Storage] Verification - Inserted row:`, verify);
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

	getCollectionFolders: async (collectionId: string): Promise<any[]> => {
		const db = await getDB();
		const result = await db.select<any[]>(
			"SELECT * FROM collection_folders WHERE collectionId = ? ORDER BY addedAt DESC",
			[collectionId]
		);
		console.log(`[Storage] getCollectionFolders(${collectionId}):`, result);
		return result;
	},

	// DEBUG: List all collection_folders in database
	debugListAllCollectionFolders: async (): Promise<any[]> => {
		const db = await getDB();
		const result = await db.select<any[]>(
			"SELECT * FROM collection_folders ORDER BY addedAt DESC"
		);
		console.log("[Storage] DEBUG - All collection_folders in DB:", result);
		return result;
	},
};
