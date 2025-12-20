import { PortfolioItem } from "../types";

const DB_NAME = 'LuminaDB';
const DB_VERSION = 1;
const STORE_HANDLES = 'handles';
const STORE_METADATA = 'metadata';

interface StoredMetadata {
  id: string; // usually relative path
  aiDescription?: string;
  aiTags?: string[];
  aiTagsDetailed?: any[];
  colorTag?: string;
  lastModified: number;
}

// Simple Promise wrapper for IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'id' });
      }
    };
  });
};

export const storageService = {
  // --- Handles (Root Directory Access) ---
  saveDirectoryHandle: async (handle: FileSystemDirectoryHandle) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_HANDLES, 'readwrite');
      const store = tx.objectStore(STORE_HANDLES);
      // We only support one root for now, id='root'
      store.put({ id: 'root', handle, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getDirectoryHandle: async (): Promise<FileSystemDirectoryHandle | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HANDLES, 'readonly');
      const store = tx.objectStore(STORE_HANDLES);
      const request = store.get('root');
      request.onsuccess = () => resolve(request.result?.handle || null);
      request.onerror = () => reject(request.error);
    });
  },

  clearHandles: async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readwrite');
    tx.objectStore(STORE_HANDLES).clear();
  },

  // --- Metadata (AI Tags, Colors) ---
  saveMetadata: async (item: PortfolioItem, relativePath: string) => {
    const db = await openDB();
    const data: StoredMetadata = {
      id: relativePath,
      aiDescription: item.aiDescription,
      aiTags: item.aiTags,
      aiTagsDetailed: item.aiTagsDetailed,
      colorTag: item.colorTag,
      lastModified: item.lastModified
    };
    const tx = db.transaction(STORE_METADATA, 'readwrite');
    tx.objectStore(STORE_METADATA).put(data);
  },

  getMetadataBatch: async (keys: string[]): Promise<Map<string, StoredMetadata>> => {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const resultMap = new Map<string, StoredMetadata>();
      
      // Efficiently getting all might be better if keys are many, 
      // but let's do a cursor or get all for simplicity in this context
      const request = store.getAll();
      request.onsuccess = () => {
        const results: StoredMetadata[] = request.result;
        results.forEach(meta => resultMap.set(meta.id, meta));
        resolve(resultMap);
      };
    });
  }
};
