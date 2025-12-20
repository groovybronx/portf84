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
    // 1. Scan Disk
    const { folders: diskFolderMap, looseFiles } = await scanDirectory(handle);
    
    // 2. Load Persistence Data
    const metaMap = await storageService.getMetadataBatch([]); 
    const storedVirtualFolders = await storageService.getVirtualFolders();
    const virtualFolderIds = new Set(storedVirtualFolders.map(f => f.id));

    // Helper to hydrate and check for virtual folder assignment
    const processItem = (item: PortfolioItem): { item: PortfolioItem, targetFolderId: string | null } => {
      const meta = metaMap.get(item.name); // Using Name/Path as key
      if (meta) {
        const hydrated = {
          ...item,
          aiDescription: meta.aiDescription,
          aiTags: meta.aiTags,
          aiTagsDetailed: meta.aiTagsDetailed,
          colorTag: meta.colorTag,
          folderId: meta.folderId || item.folderId // Prefer saved folderId
        };
        
        // If the item belongs to a known virtual folder, return that ID
        if (hydrated.folderId && virtualFolderIds.has(hydrated.folderId)) {
            return { item: hydrated, targetFolderId: hydrated.folderId };
        }
        return { item: hydrated, targetFolderId: null };
      }
      return { item, targetFolderId: null };
    };

    // 3. Distribute Items
    // We create a map for virtual folders to populate them
    const virtualFolderContent = new Map<string, PortfolioItem[]>();
    storedVirtualFolders.forEach(f => virtualFolderContent.set(f.id, []));

    const physicalFolders: Folder[] = [];

    // Process Disk Folders
    diskFolderMap.forEach((items, name) => {
      const remainingItems: PortfolioItem[] = [];
      const folderId = Math.random().toString(36).substring(2, 9); // Physical ID is ephemeral

      items.forEach(rawItem => {
         const { item, targetFolderId } = processItem({...rawItem, folderId});
         if (targetFolderId) {
             virtualFolderContent.get(targetFolderId)?.push(item);
         } else {
             remainingItems.push(item);
         }
      });

      if (remainingItems.length > 0) {
        physicalFolders.push({
            id: folderId,
            name: name,
            items: remainingItems,
            createdAt: Date.now(),
            isVirtual: false // Physical folder
        });
      }
    });

    // Process Loose Files (Root)
    const remainingLooseItems: PortfolioItem[] = [];
    const rootFolderId = Math.random().toString(36).substring(2, 9);
    
    looseFiles.forEach(rawItem => {
        const { item, targetFolderId } = processItem({...rawItem, folderId: rootFolderId});
        if (targetFolderId) {
            virtualFolderContent.get(targetFolderId)?.push(item);
        } else {
            remainingLooseItems.push(item);
        }
    });

    if (remainingLooseItems.length > 0) {
        physicalFolders.push({
            id: rootFolderId,
            name: handle.name,
            items: remainingLooseItems,
            createdAt: Date.now(),
            isVirtual: false // Physical folder
        });
    }

    // 4. Merge Virtual Folders with content
    const finalVirtualFolders = storedVirtualFolders.map(vf => ({
        ...vf,
        items: virtualFolderContent.get(vf.id) || [],
        isVirtual: true // Ensure flag is set
    }));

    // 5. Update State
    setFolders(prev => {
        const prevVirtualIds = new Set(storedVirtualFolders.map(f => f.id));
        const keptPrev = prev.filter(f => !prevVirtualIds.has(f.id)); 
        
        const existingVirtualMap = new Map(prev.filter(f => virtualFolderIds.has(f.id)).map(f => [f.id, f]));
        
        const mergedVirtualFolders = finalVirtualFolders.map(vf => {
            const existing = existingVirtualMap.get(vf.id);
            if (existing) {
                return { ...vf, items: [...existing.items, ...vf.items] };
            }
            return vf;
        });

        const cleanPrev = prev.filter(f => !virtualFolderIds.has(f.id));
        
        return [...cleanPrev, ...mergedVirtualFolders, ...physicalFolders];
    });

    if (physicalFolders.length > 0 || finalVirtualFolders.length > 0) setActiveFolderIds(new Set(['all']));
    
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

      // Sort: Roots first, then others.
      storedItems.sort((a, b) => (a.isRoot === b.isRoot) ? 0 : a.isRoot ? -1 : 1);

      // Pre-load virtual folders structure into state so empty folders appear even if files are missing
      const vFolders = await storageService.getVirtualFolders();
      setFolders(vFolders); // vFolders already have isVirtual: true from service

      for (let i = 0; i < storedItems.length; i++) {
          const item = storedItems[i];
          let handleToUse = item.handle;
          let isAuthorized = false;

          // 1. Try to resolve via already authorized parents
          for (const parentHandle of authorizedHandles) {
              try {
                  const path = await parentHandle.resolve(handleToUse);
                  if (path) {
                      let freshHandle = parentHandle;
                      for (const name of path) {
                          freshHandle = await freshHandle.getDirectoryHandle(name);
                      }
                      handleToUse = freshHandle;
                      isAuthorized = true;
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
                  // Permission root only
              } else {
                  await loadFromDirectoryHandle(handleToUse);
                  loadedCount++;
              }
          }
      }

      if (loadedCount === 0 && storedItems.some(i => !i.isRoot)) {
         alert("Could not restore folders. Please try linking the Root folder first.");
      }
      
    } catch (e) {
      console.error("Restore failed", e);
    } finally {
      setIsRestoring(false);
    }
  };

  const importFiles = (fileList: FileList) => {
    // Basic import logic (kept simple, mostly for non-FS usage)
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    // ... (Existing import logic largely similar, but ideally should hook into persistence if we wanted to support imports properly)
    // For now, imports are ephemeral as they don't have file handles.
    
    // Existing logic copy:
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
    // ... creating folders ...
    const newFolders: Folder[] = [];
    folderGroups.forEach((items, name) => {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({ id: folderId, name, items: items.map(i => ({...i, folderId})), createdAt: Date.now(), isVirtual: false });
    });
    if (looseItems.length > 0) {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({ id: folderId, name: 'Import', items: looseItems.map(i => ({...i, folderId})), createdAt: Date.now(), isVirtual: false });
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
      createdAt: Date.now(),
      isVirtual: true // Mark as virtual
    };
    setFolders(prev => [...prev, newFolder]);
    setActiveFolderIds(new Set([newFolder.id]));
    
    // Persist new folder
    storageService.saveVirtualFolder(newFolder);
    
    return newFolder.id;
  };

  const deleteFolder = (id: string) => {
    const folderToDelete = folders.find(f => f.id === id);
    
    setFolders(prev => prev.filter(f => f.id !== id));
    setActiveFolderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet.size === 0 ? new Set(['all']) : newSet;
    });
    
    // Remove persistence
    storageService.deleteVirtualFolder(id); // Remove virtual definition if it exists

    // Also attempt to remove Physical Handle if the folder name matches a stored handle
    if (folderToDelete) {
        storageService.removeDirectoryHandle(folderToDelete.name);
    }
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
    
    const itemsToMove = allItemsFlat.filter(i => itemIds.has(i.id));

    setFolders(prev => prev.map(folder => {
        if (folder.id === targetFolderId) {
             const itemsToAdd = itemsToMove.map(i => ({...i, folderId: targetFolderId}));
             return { ...folder, items: [...folder.items, ...itemsToAdd] };
        }
        // Remove from source folders
        return { ...folder, items: folder.items.filter(i => !itemIds.has(i.id)) };
    }));
    
    // Persist the move (Folder ID assignment) for each item
    itemsToMove.forEach(item => {
        const updatedItem = { ...item, folderId: targetFolderId };
        storageService.saveMetadata(updatedItem, updatedItem.name);
    });

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