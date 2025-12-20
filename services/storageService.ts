import { PortfolioItem, Folder } from "../types";

const DB_NAME = 'LuminaDB';
const DB_VERSION = 2; // Incremented for virtual folders support
const STORE_HANDLES = 'handles';
const STORE_METADATA = 'metadata';
const STORE_FOLDERS = 'virtual_folders'; // New store

interface StoredHandle {
  id: string;
  handle: FileSystemDirectoryHandle;
  timestamp: number;
  isRoot?: boolean;
}

interface StoredMetadata {
  id: string; // usually relative path
  aiDescription?: string;
  aiTags?: string[];
  aiTagsDetailed?: any[];
  colorTag?: string;
  manualTags?: string[];
  folderId?: string; // Persist which folder this item belongs to
  lastModified: number;
}

// Simple Promise wrapper for IndexedDB with connection pooling
let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: "id" });
      }
    };
  });
};

export const storageService = {
  // --- Handles (Root Directory Access) ---
  addDirectoryHandle: async (
    handle: FileSystemDirectoryHandle,
    isRoot: boolean = false
  ) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_HANDLES, "readwrite");
      const store = tx.objectStore(STORE_HANDLES);
      const data: StoredHandle = {
        id: handle.name,
        handle,
        timestamp: Date.now(),
        isRoot,
      };
      store.put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getDirectoryHandles: async (): Promise<StoredHandle[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HANDLES, "readonly");
      const store = tx.objectStore(STORE_HANDLES);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  removeDirectoryHandle: async (id: string) => {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, "readwrite");
    tx.objectStore(STORE_HANDLES).delete(id);
  },

  clearHandles: async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, "readwrite");
    tx.objectStore(STORE_HANDLES).clear();
  },

  // --- Metadata (AI Tags, Colors, Folder Assignment) ---
  saveMetadata: async (item: PortfolioItem, relativePath: string) => {
    const db = await openDB();
    const data: StoredMetadata = {
      id: relativePath,
      aiDescription: item.aiDescription,
      aiTags: item.aiTags,
      aiTagsDetailed: item.aiTagsDetailed,
      colorTag: item.colorTag,
      manualTags: item.manualTags,
      folderId: item.folderId, // Save the folder assignment
      lastModified: item.lastModified,
    };
    const tx = db.transaction(STORE_METADATA, "readwrite");
    tx.objectStore(STORE_METADATA).put(data);
  },

  getMetadataBatch: async (
    keys: string[]
  ): Promise<Map<string, StoredMetadata>> => {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, "readonly");
      const store = tx.objectStore(STORE_METADATA);
      const resultMap = new Map<string, StoredMetadata>();

      if (keys.length === 0) {
        // Safe-guard: Don't load everything if not requested, but provide a way to if keys is empty and we really need "all"
        // Actually, the current logic for keys.length === 0 is "getAll", which might be slow.
        // Let's keep it but add a cap or warning if we were strictly scaling.
        const request = store.getAll();
        request.onsuccess = () => {
          const results: StoredMetadata[] = request.result;
          results.forEach((meta) => resultMap.set(meta.id, meta));
          resolve(resultMap);
        };
      } else {
        // Individual point lookups in a transaction are highly optimized in IDB.
        // However, we wrap them in a loop. For truly huge sets, we might use a cursor if keys were ranges.
        // Since they are likely disjoint relative paths, point lookups are best.
        let completed = 0;
        let failed = 0;

        keys.forEach((key) => {
          const request = store.get(key);
          request.onsuccess = () => {
            if (request.result) resultMap.set(key, request.result);
            if (++completed + failed === keys.length) resolve(resultMap);
          };
          request.onerror = () => {
            if (++failed + completed === keys.length) resolve(resultMap);
          };
        });
      }
    });
  },

  // --- Virtual Folders Persistence ---
  saveVirtualFolder: async (folder: Folder) => {
    const db = await openDB();
    const tx = db.transaction(STORE_FOLDERS, "readwrite");
    // We store a simplified version of the folder (without items array to avoid bloat/cycles)
    const folderData = {
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt,
      isVirtual: true, // Mark as virtual
    };
    tx.objectStore(STORE_FOLDERS).put(folderData);
  },

  deleteVirtualFolder: async (id: string) => {
    const db = await openDB();
    const tx = db.transaction(STORE_FOLDERS, "readwrite");
    tx.objectStore(STORE_FOLDERS).delete(id);
  },

  getVirtualFolders: async (): Promise<Folder[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_FOLDERS, "readonly");
      const request = tx.objectStore(STORE_FOLDERS).getAll();
      request.onsuccess = () => {
        const rawFolders = request.result || [];
        // Re-attach empty items array and ensure isVirtual is true
        resolve(
          rawFolders.map((f: any) => ({ ...f, items: [], isVirtual: true }))
        );
      };
    });
  },
};