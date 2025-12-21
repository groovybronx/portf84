import { Folder, PortfolioItem } from "../types";
import { storageService } from "./storageService";
import { scanDirectory } from "../utils/fileHelpers";

export const libraryLoader = {
  /**
   * Scans a directory handle and merges it with stored metadata and virtual folders.
   */
  loadAndMerge: async (
    handle: FileSystemDirectoryHandle,
    storedVirtualFolders: Folder[]
  ): Promise<{
    foldersToAdd: Folder[];
    virtualFoldersMap: Map<string, PortfolioItem[]>;
  }> => {
    // 1. Scan Disk
    const { folders: diskFolderMap, looseFiles } = await scanDirectory(handle);

    // 2. Load Persistence Data
    const allFileNames = [
      ...Array.from(diskFolderMap.values()).flatMap((items) =>
        items.map((i) => i.name)
      ),
      ...looseFiles.map((i) => i.name),
    ];
    const metaMap = await storageService.getMetadataBatch(allFileNames);

    const virtualFolderIds = new Set(storedVirtualFolders.map((f) => f.id));

    // Helper to hydrate and check for virtual folder assignment
    const processItem = (
      item: PortfolioItem
    ): { item: PortfolioItem; targetFolderId: string | null } => {
      const meta = metaMap.get(item.name); // Using Name/Path as key
      if (meta) {
        const hydrated = {
          ...item,
          aiDescription: meta.aiDescription,
          aiTags: meta.aiTags,
          aiTagsDetailed: meta.aiTagsDetailed,
          colorTag: meta.colorTag,
          manualTags: meta.manualTags,
          folderId: meta.folderId || item.folderId, // Prefer saved folderId
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
    const virtualFolderContent = new Map<string, PortfolioItem[]>();
    storedVirtualFolders.forEach((f) => virtualFolderContent.set(f.id, []));

    const physicalFolders: Folder[] = [];

    // Process Disk Folders
    diskFolderMap.forEach((items, name) => {
      const remainingItems: PortfolioItem[] = [];
      const folderId = `phys-${btoa(name).substring(0, 12)}`; // Deterministic ID

      items.forEach((rawItem) => {
        const { item, targetFolderId } = processItem({ ...rawItem, folderId });
        if (targetFolderId) {
          const list = virtualFolderContent.get(targetFolderId) || [];
          list.push(item);
          virtualFolderContent.set(targetFolderId, list);
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
          isVirtual: false,
        });
      }
    });

    // Process Loose Files (Root)
    const remainingLooseItems: PortfolioItem[] = [];
    const rootFolderId = `phys-${btoa(handle.name).substring(0, 12)}`;

    looseFiles.forEach((rawItem) => {
      const { item, targetFolderId } = processItem({
        ...rawItem,
        folderId: rootFolderId,
      });
      if (targetFolderId) {
        const list = virtualFolderContent.get(targetFolderId) || [];
        list.push(item);
        virtualFolderContent.set(targetFolderId, list);
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
        isVirtual: false,
      });
    }

    return {
      foldersToAdd: physicalFolders,
      virtualFoldersMap: virtualFolderContent,
    };
  },
};
