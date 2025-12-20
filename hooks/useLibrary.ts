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
        const handles = await storageService.getDirectoryHandles();
        if (handles.length > 0) setHasStoredSession(true);
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
        name: handle.name, // Use the handle name (Folder Name) instead of generic "Root Collection"
        items: looseFiles.map(hydrateItem).map(i => ({...i, folderId})),
        createdAt: Date.now()
      });
    }

    setFolders(prev => [...prev, ...newFolders]); // Append instead of replace
    if (newFolders.length > 0) setActiveFolderIds(new Set(['all']));
    await storageService.addDirectoryHandle(handle); // Add to persistence list
  };

  // --- Public Actions ---

  const restoreSession = async () => {
    try {
      setIsRestoring(true);
      const handles = await storageService.getDirectoryHandles();
      if (handles.length === 0) {
        setHasStoredSession(false);
        return;
      }

      const authorizedHandles: FileSystemDirectoryHandle[] = [];
      let loadedCount = 0;

      // Smart Restoration Loop
      // We iterate through handles. If we successfully authorize one, 
      // we check if subsequent handles are actually children of this one.
      // If so, we skip the prompt for the child, as it will be loaded by the parent scan anyway.
      
      const handlesToProcess = [...handles];
      
      // Sort handles? Ideally parents first, but we can't know without permission.
      // We rely on the user having added the parent or just simple iteration.

      for (let i = 0; i < handlesToProcess.length; i++) {
          const currentHandle = handlesToProcess[i];
          
          // Check if this handle is already contained in a previously authorized parent
          let isRedundant = false;
          for (const parentHandle of authorizedHandles) {
              try {
                  // resolve() returns an array of path parts if contained, or null if not.
                  // This only works if parentHandle has permission granted.
                  const relativePath = await parentHandle.resolve(currentHandle);
                  if (relativePath !== null) {
                      console.log(`Skipping permission for ${currentHandle.name} (covered by ${parentHandle.name})`);
                      isRedundant = true;
                      break;
                  }
              } catch (e) {
                  // Ignore permission errors during check
              }
          }

          if (isRedundant) {
              // We don't need to load this explicitly, as the parent scan will catch it (or has caught it)
              // However, to keep the UI consistent (sidebar items), we might want to ensure it exists.
              // But for now, let's assume minimizing prompts is priority.
              continue; 
          }

          // If not redundant, ask for permission
          const permitted = await verifyPermission(currentHandle, true);
          if (permitted) {
              authorizedHandles.push(currentHandle);
              await loadFromDirectoryHandle(currentHandle);
              loadedCount++;
          }
      }

      if (loadedCount === 0 && handles.length > 0) {
          alert("Could not restore access to folders. Please select them again manually if needed.");
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
    importFiles,
    updateItem,
    createFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder
  };
};
