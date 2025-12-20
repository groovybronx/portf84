import { useState, useEffect, useCallback } from 'react';
import { Folder, PortfolioItem } from '../types';
import { storageService } from '../services/storageService';
import { scanDirectory, verifyPermission } from '../utils/fileHelpers';

export const useLibrary = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderIds, setActiveFolderIds] = useState<Set<string>>(new Set(['all']));
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // --- Persistence Check ---
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const storedItems = await storageService.getDirectoryHandles();
        if (storedItems.length > 0) setHasStoredSession(true);
      } catch (e) { console.error("Storage check failed", e); }
    };
    checkStorage();
    
    return () => {
      folders.forEach(f => f.items.forEach(i => URL.revokeObjectURL(i.url)));
    };
  }, []); // Run once on mount

  // --- Core Loading Logic ---
  const loadFromDirectoryHandle = async (handle: FileSystemDirectoryHandle) => {
    const { folders: folderMap, looseFiles } = await scanDirectory(handle);
    const metaMap = await storageService.getMetadataBatch([]); // Get all metadata

    const hydrateItem = (item: PortfolioItem): PortfolioItem => {
      const meta = metaMap.get(item.name);
      if (meta) {
        return {
          ...item,
          aiDescription: meta.aiDescription,
          aiTags: meta.aiTags,
          aiTagsDetailed: meta.aiTagsDetailed,
          colorTag: meta.colorTag
        };
      }
      return item;
    };

    const newFolders: Folder[] = [];
    folderMap.forEach((items, name) => {
      const folderId = Math.random().toString(36).substring(2, 9);
      newFolders.push({
        id: folderId,
        name: name,
        items: items.map(hydrateItem).map(i => ({...i, folderId})),
        createdAt: Date.now()
      });
    });

    if (looseFiles.length > 0) {
      const folderId = Math.random().toString(36).substring(2, 9);
      newFolders.push({
        id: folderId,
        name: handle.name,
        items: looseFiles.map(hydrateItem).map(i => ({...i, folderId})),
        createdAt: Date.now()
      });
    }

    setFolders(prev => [...prev, ...newFolders]);
    if (newFolders.length > 0) setActiveFolderIds(new Set(['all']));
    
    // Default isRoot=false when loading content
    await storageService.addDirectoryHandle(handle, false); 
  };

  // --- New: Link Root Folder (Permission Only) ---
  const setLibraryRoot = async (handle: FileSystemDirectoryHandle) => {
    // We only verify/store it. We do NOT scan it.
    await verifyPermission(handle, true);
    await storageService.addDirectoryHandle(handle, true);
    setHasStoredSession(true);
    alert(`Root "${handle.name}" linked! Future subfolders will load without prompts.`);
  };


  // --- Public Actions ---

  const restoreSession = async () => {
    try {
      setIsRestoring(true);
      const storedItems = await storageService.getDirectoryHandles();
      if (storedItems.length === 0) {
        setHasStoredSession(false);
        return;
      }

      // Prioritize explicit roots for permission request
      const authorizedHandles: FileSystemDirectoryHandle[] = [];
      let loadedCount = 0;

      // Sort: Roots first, then others. This increases chance of early hit.
      storedItems.sort((a, b) => (a.isRoot === b.isRoot) ? 0 : a.isRoot ? -1 : 1);

      for (let i = 0; i < storedItems.length; i++) {
          const item = storedItems[i];
          let handleToUse = item.handle;
          let isAuthorized = false;

          // 1. Try to resolve via already authorized parents
          for (const parentHandle of authorizedHandles) {
              try {
                  const path = await parentHandle.resolve(handleToUse);
                  if (path) {
                      // Found it! It is a child of an authorized parent.
                      // Traverse to get a "fresh" permitted handle.
                      let freshHandle = parentHandle;
                      for (const name of path) {
                          freshHandle = await freshHandle.getDirectoryHandle(name);
                      }
                      handleToUse = freshHandle;
                      isAuthorized = true;
                      console.log(`Auto-authorized ${item.id} via ${parentHandle.name}`);
                      break;
                  }
              } catch (e) { /* ignore */ }
          }

          // 2. If not covered, ask permission explicitly
          if (!isAuthorized) {
              const permitted = await verifyPermission(handleToUse, true);
              if (permitted) {
                  authorizedHandles.push(handleToUse);
                  isAuthorized = true;
              }
          }

          // 3. Action based on type
          if (isAuthorized) {
              if (item.isRoot) {
                  // If it's just a permission root, we just keep it in authorizedHandles (done above)
                  // We don't load its content.
              } else {
                  // It's a content folder, load it.
                  await loadFromDirectoryHandle(handleToUse);
                  loadedCount++;
              }
          }
      }

      if (loadedCount === 0 && storedItems.some(i => !i.isRoot)) {
         // If we had content folders but failed to load any
         alert("Could not restore folders. Please try linking the Root folder first.");
      }
      
    } catch (e) {
      console.error("Restore failed", e);
    } finally {
      setIsRestoring(false);
    }
  };

  const importFiles = (fileList: FileList) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const folderGroups = new Map<string, PortfolioItem[]>();
    const looseItems: PortfolioItem[] = [];

    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const folderTag = pathParts.length > 1 ? pathParts[0] : undefined;
      const item: PortfolioItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        aiTags: folderTag ? [folderTag] : []
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
        newFolders.push({ id: folderId, name, items: items.map(i => ({...i, folderId})), createdAt: Date.now() });
    });
    if (looseItems.length > 0) {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({ id: folderId, name: 'Import', items: looseItems.map(i => ({...i, folderId})), createdAt: Date.now() });
    }

    setFolders(prev => [...prev, ...newFolders]);
    setActiveFolderIds(new Set(['all']));
  };

  const updateItem = useCallback((updated: PortfolioItem) => {
    setFolders(prev => prev.map(folder => {
        if (!updated.folderId || folder.id === updated.folderId) {
            return {
                ...folder,
                items: folder.items.map(item => item.id === updated.id ? updated : item)
            };
        }
        return folder;
    }));
    storageService.saveMetadata(updated, updated.name);
  }, []);

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      items: [],
      createdAt: Date.now()
    };
    setFolders(prev => [...prev, newFolder]);
    setActiveFolderIds(new Set([newFolder.id]));
    return newFolder.id;
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setActiveFolderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet.size === 0 ? new Set(['all']) : newSet;
    });
  };

  const toggleFolderSelection = (id: string) => {
    setActiveFolderIds(prev => {
        if (id === 'all') return new Set(['all']);
        const newSet = new Set(prev);
        if (newSet.has('all')) { newSet.clear(); newSet.add(id); return newSet; }
        if (newSet.has(id)) { newSet.delete(id); if (newSet.size === 0) return new Set(['all']); } 
        else { newSet.add(id); }
        return newSet;
    });
  };

  const moveItemsToFolder = (itemIds: Set<string>, targetFolderId: string, allItemsFlat: PortfolioItem[]) => {
    if (itemIds.size === 0) return;
    setFolders(prev => prev.map(folder => {
        if (folder.id === targetFolderId) {
             const itemsToAdd = allItemsFlat.filter(i => itemIds.has(i.id)).map(i => ({...i, folderId: targetFolderId}));
             return { ...folder, items: [...folder.items, ...itemsToAdd] };
        }
        // Remove from source folders
        return { ...folder, items: folder.items.filter(i => !itemIds.has(i.id)) };
    }));
    setActiveFolderIds(new Set([targetFolderId]));
  };

  return {
    folders,
    activeFolderIds,
    hasStoredSession,
    isRestoring,
    loadFromDirectoryHandle,
    restoreSession,
    setLibraryRoot,
    importFiles,
    updateItem,
    createFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder
  };
};