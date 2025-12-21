import Database from "@tauri-apps/plugin-sql";

const DB_PATH = "sqlite:lumina.db";
let dbInstance: Database | null = null;

const getDB = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;
  console.log("Initializing SQLite database...");
  dbInstance = await Database.load(DB_PATH);

  // Initialize Schema separately to ensure compatibility
  try {
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS handles (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        isRoot INTEGER DEFAULT 0
      )
    `);
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        id TEXT PRIMARY KEY,
        aiDescription TEXT,
        aiTags TEXT,
        aiTagsDetailed TEXT,
        colorTag TEXT,
        manualTags TEXT,
        folderId TEXT,
        lastModified INTEGER NOT NULL
      )
    `);
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS virtual_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        isVirtual INTEGER DEFAULT 1
      )
    `);
    console.log("Schema initialized successfully");
  } catch (error) {
    console.error("Failed to initialize schema:", error);
  }

  return dbInstance;
};

export const storageService = {
  // --- Handles (Root Directory Access) ---
  addDirectoryHandle: async (path: string, isRoot: boolean = false) => {
    const db = await getDB();
    console.log(`[Storage] Adding handle: ${path} (isRoot: ${isRoot})`);
    try {
      await db.execute(
        "INSERT OR REPLACE INTO handles (id, path, timestamp, isRoot) VALUES (?, ?, ?, ?)",
        [path, path, Date.now(), isRoot ? 1 : 0]
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
  saveMetadata: async (item: any, relativePath: string) => {
    const db = await getDB();
    console.log(`[Storage] Saving metadata for: ${relativePath}`);
    try {
      await db.execute(
        `INSERT OR REPLACE INTO metadata 
        (id, aiDescription, aiTags, aiTagsDetailed, colorTag, manualTags, folderId, lastModified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          relativePath,
          item.aiDescription,
          JSON.stringify(item.aiTags || []),
          JSON.stringify(item.aiTagsDetailed || []),
          item.colorTag,
          JSON.stringify(item.manualTags || []),
          item.folderId,
          item.lastModified,
        ]
      );
      console.log(`[Storage] Metadata saved.`);
    } catch (e) {
      console.error(`[Storage] Failed to save metadata:`, e);
    }
  },

  getMetadataBatch: async (keys: string[]): Promise<Map<string, any>> => {
    const db = await getDB();
    const resultMap = new Map<string, any>();

    let results: any[] = [];
    if (keys.length === 0) {
      results = await db.select<any[]>("SELECT * FROM metadata");
    } else {
      // For heavy batches, we'd use IN (...) but $ parameters are safer.
      // SQLite handles multiple queries well.
      for (const key of keys) {
        const row = await db.select<any[]>(
          "SELECT * FROM metadata WHERE id = ?",
          [key]
        );
        if (row.length > 0) results.push(row[0]);
      }
    }

    results.forEach((meta) => {
      resultMap.set(meta.id, {
        ...meta,
        aiTags: JSON.parse(meta.aiTags || "[]"),
        aiTagsDetailed: JSON.parse(meta.aiTagsDetailed || "[]"),
        manualTags: JSON.parse(meta.manualTags || "[]"),
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

  getVirtualFolders: async (): Promise<any[]> => {
    const db = await getDB();
    const rawFolders = await db.select<any[]>("SELECT * FROM virtual_folders");
    return rawFolders.map((f: any) => ({
      ...f,
      items: [],
      isVirtual: f.isVirtual === 1,
    }));
  },
};
