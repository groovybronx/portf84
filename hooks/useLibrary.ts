import { useState, useCallback, useMemo, useEffect } from "react";
import { Folder, PortfolioItem } from "../types";
import { storageService } from "../services/storageService";
import { verifyPermission } from "../utils/fileHelpers";
import { useSessionRestore } from "./useSessionRestore"; // New Hook
import { libraryLoader } from "../services/libraryLoader"; // New Service

export const useLibrary = (activeCollectionId: string | null) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderIds, setActiveFolderIds] = useState<Set<string>>(
    new Set(["all"])
  );

  // Auto-clear when collection changes to null
  useEffect(() => {
    if (!activeCollectionId) {
      console.log("[useLibrary] No active collection, clearing state");
      setFolders([]);
      setActiveFolderIds(new Set(["all"]));
    }
  }, [activeCollectionId]);

  // --- Core Loading Logic (Refactored) ---
  const loadFromPath = useCallback(
    async (path: string) => {
      // CRITICAL: Validate collection
      if (!activeCollectionId) {
        console.warn("[useLibrary] No active collection, skipping load");
        return;
      }

      // 1. Fetch virtual folders for ACTIVE COLLECTION ONLY
      const storedVirtual = await storageService.getVirtualFolders(
        activeCollectionId
      );
      console.log(
        `[useLibrary] Loaded ${storedVirtual.length} virtual folders for collection ${activeCollectionId}`
      );

      // 2. Delegate to Service with collectionId
      const { foldersToAdd, virtualFoldersMap } =
        await libraryLoader.loadAndMerge(
          path,
          storedVirtual,
          activeCollectionId
        );
      // Wait, loadAndMerge returns `foldersToAdd` (Physical) and `virtualFoldersMap` (Map of ID -> Items).

      // 3. Update State
      setFolders((prev) => {
        // A. Update Virtual Folders (Merge new items into existing ones)
        const updatedVirtualFolders = storedVirtual.map((vf) => {
          // New items from this load
          const newItems = virtualFoldersMap.get(vf.id) || [];

          // Old items (from previous loads of OTHER handles) are in `prev`.
          // We need to find the previous version of this virtual folder.
          const prevVF = prev.find((p) => p.id === vf.id);
          const prevItems = prevVF ? prevVF.items : [];

          // Deduplicate if necessary?
          // Since physical folders are distinct handles, their items should be distinct (unless same handle loaded twice).
          // We'll just concat for now, or use a Set map by ID if strict dedup needed.
          // Simple concat:
          return {
            ...vf,
            items: [...prevItems, ...newItems],
            isVirtual: true,
          };
        });

        // B. Add Physical Folders
        // Filter out any physical folder that might already exist (e.g. re-loading same root).
        // `foldersToAdd` are physical folders from THIS handle.
        const newPhysicalIds = new Set(foldersToAdd.map((f) => f.id));
        const keptPhysical = prev.filter(
          (f) => !f.isVirtual && !newPhysicalIds.has(f.id)
        );

        return [...updatedVirtualFolders, ...keptPhysical, ...foldersToAdd];
      });

      if (foldersToAdd.length > 0 || virtualFoldersMap.size > 0)
        setActiveFolderIds(new Set(["all"]));

      // Default isRoot=false when loading content manually
      await storageService.addDirectoryHandle(path, false);
    },
    [activeCollectionId]
  ); // CRITICAL: Must include activeCollectionId!

  // --- Session Management (Delegated) ---
  const { hasStoredSession, restoreSession } = useSessionRestore(
    loadFromPath,
    setFolders // Callback to set initial structure
  );

  // --- New: Link Root Folder (Permission Only) ---
  const setLibraryRoot = async (path: string) => {
    // We only verify/store it. We do NOT scan it.
    await verifyPermission(path);
    await storageService.addDirectoryHandle(path, true);
    // setHasStoredSession(true); // Handled by hook internal state or reload?
    // Simplify: just alert user. Restart will pick it up.
    alert(`Root folder linked! Future subfolders will load without prompts.`);
  };

  // --- Public Actions (Mostly unchanged, just state manipulation) ---

  // NOTE: importFiles logic is complex and somewhat duplicative of "scan".
  // For now, we leave it as is, or we could refactor it later.
  // It deals with FileList (Drag & Drop), not FileSystemHandles.
  const importFiles = (fileList: FileList) => {
    // Basic import logic (kept ephemeral as they don't have file handles)
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length === 0) return;

    const folderGroups = new Map<string, PortfolioItem[]>();
    const looseItems: PortfolioItem[] = [];

    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/");
      const folderTag = pathParts.length > 1 ? pathParts[0] : undefined;
      const item: PortfolioItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file), // Memory leak risk if not revoked
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        aiTags: folderTag ? [folderTag] : [],
      };
      if (pathParts.length > 1) {
        const folderName = pathParts[0];
        if (!folderGroups.has(folderName)) folderGroups.set(folderName, []);
        folderGroups.get(folderName)?.push(item);
      } else {
        looseItems.push(item);
      }
    });

    const newFolders: Folder[] = [];
    folderGroups.forEach((items, name) => {
      const folderId = Math.random().toString(36).substring(2, 9);
      newFolders.push({
        id: folderId,
        name,
        items: items.map((i) => ({ ...i, folderId })),
        createdAt: Date.now(),
        isVirtual: false,
        collectionId: "unknown", // TODO: Pass activeCollection.id to useLibrary
      });
    });
    if (looseItems.length > 0) {
      const folderId = Math.random().toString(36).substring(2, 9);
      newFolders.push({
        id: folderId,
        name: "Import",
        items: looseItems.map((i) => ({ ...i, folderId })),
        createdAt: Date.now(),
        isVirtual: false,
        collectionId: "unknown", // TODO: Pass activeCollection.id to useLibrary
      });
    }
    setFolders((prev) => [...prev, ...newFolders]);
    setActiveFolderIds(new Set(["all"]));
  };

  const updateItem = useCallback((updated: PortfolioItem) => {
    setFolders((prev) =>
      prev.map((folder) => {
        if (!updated.folderId || folder.id === updated.folderId) {
          return {
            ...folder,
            items: folder.items.map((item) =>
              item.id === updated.id ? updated : item
            ),
          };
        }
        return folder;
      })
    );
    storageService.saveMetadata(updated, updated.path || updated.name);
  }, []);

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      items: [],
      createdAt: Date.now(),
      isVirtual: true,
      collectionId: "unknown", // TODO: Pass activeCollection.id to useLibrary
    };
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolderIds(new Set([newFolder.id]));
    storageService.saveVirtualFolder(newFolder);
    return newFolder.id;
  };

  const deleteFolder = (id: string) => {
    const folderToDelete = folders.find((f) => f.id === id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setActiveFolderIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet.size === 0 ? new Set(["all"]) : newSet;
    });
    storageService.deleteVirtualFolder(id);
    if (folderToDelete && folderToDelete.path) {
      storageService.removeDirectoryHandle(folderToDelete.path);
    }
  };

  const toggleFolderSelection = (id: string) => {
    setActiveFolderIds((prev) => {
      if (id === "all") return new Set(["all"]);
      const newSet = new Set(prev);
      if (newSet.has("all")) {
        newSet.clear();
        newSet.add(id);
        return newSet;
      }
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) return new Set(["all"]);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const moveItemsToFolder = (
    itemIds: Set<string>,
    targetFolderId: string,
    allItemsFlat: PortfolioItem[]
  ) => {
    if (itemIds.size === 0) return;
    const itemsToMove = allItemsFlat.filter((i) => itemIds.has(i.id));

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id === targetFolderId) {
          const itemsToAdd = itemsToMove.map((i) => ({
            ...i,
            folderId: targetFolderId,
          }));
          return { ...folder, items: [...folder.items, ...itemsToAdd] };
        }
        return {
          ...folder,
          items: folder.items.filter((i) => !itemIds.has(i.id)),
        };
      })
    );

    itemsToMove.forEach((item) => {
      const updatedItem = { ...item, folderId: targetFolderId };
      storageService.saveMetadata(
        updatedItem,
        updatedItem.path || updatedItem.name
      );
    });

    setActiveFolderIds(new Set([targetFolderId]));
  };

  // Clear library (used when switching collections)
  const clearLibrary = useCallback(() => {
    console.log("[useLibrary] Clearing library state");
    setFolders([]);
    setActiveFolderIds(new Set(["all"]));
  }, []);

  return {
    folders,
    activeFolderIds,
    loadFromPath,
    importFiles,
    updateItem,
    createFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder,
    clearLibrary,
  };
};
