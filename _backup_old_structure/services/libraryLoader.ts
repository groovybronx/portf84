import { Folder, PortfolioItem } from "../types";
import { storageService } from "./storageService";
import { scanDirectory } from "../utils/fileHelpers";

export const libraryLoader = {
  /**
   * Scans a directory handle and merges it with stored metadata and virtual folders.
   * @param basePath - The filesystem path to scan
   * @param storedVirtualFolders - Virtual folders from the active collection
   * @param collectionId - The active collection ID (required for proper isolation)
   */
  loadAndMerge: async (
    basePath: string,
    storedVirtualFolders: Folder[],
    collectionId: string // NEW: Required for collection isolation
  ): Promise<{
    foldersToAdd: Folder[];
    virtualFoldersMap: Map<string, PortfolioItem[]>;
  }> => {
    // 1. Scan Disk
    console.log(`[LibraryLoader] Scanning: ${basePath}`);
    const { folders: diskFolderMap, looseFiles } = await scanDirectory(
      basePath
    );
    console.log(
      `[LibraryLoader] Scan complete. Found ${diskFolderMap.size} folders and ${looseFiles.length} loose files.`
    );

    // 2. Load Persistence Data
    const allFilePaths = [
      ...Array.from(diskFolderMap.values()).flatMap((items) =>
        items.map((i) => i.path || i.name)
      ),
      ...looseFiles.map((i) => i.path || i.name),
    ];
    console.log(
      `[LibraryLoader] Fetching metadata for ${allFilePaths.length} items...`
    );
    const metaMap = await storageService.getMetadataBatch(
      allFilePaths,
      collectionId
    );
    console.log(
      `[LibraryLoader] Metadata fetched: ${metaMap.size} entries found in DB.`
    );

    const virtualFolderIds = new Set(storedVirtualFolders.map((f) => f.id));

    // Helper to hydrate and check for virtual folder assignment
    const processItem = (
      item: PortfolioItem
    ): { item: PortfolioItem; targetFolderId: string | null } => {
      const meta = metaMap.get(item.path || item.name); // Using Path as key
      if (meta) {
        const hydrated = {
          ...item,
          collectionId, // NEW: Assign collection ID to all items
          aiDescription: meta.aiDescription,
          aiTags: meta.aiTags,
          aiTagsDetailed: meta.aiTagsDetailed,
          colorTag: meta.colorTag,
          manualTags: meta.manualTags,
          virtualFolderId: meta.virtualFolderId || meta.folderId, // Prefer virtualFolderId
          folderId: meta.virtualFolderId || meta.folderId, // Backward compat
        };

        // If the item belongs to a known virtual folder, return that ID
        if (
          hydrated.virtualFolderId &&
          virtualFolderIds.has(hydrated.virtualFolderId)
        ) {
          return { item: hydrated, targetFolderId: hydrated.virtualFolderId };
        }
        return { item: hydrated, targetFolderId: null };
      }
      // No metadata: still assign collectionId
      return { item: { ...item, collectionId }, targetFolderId: null };
    };

    // 3. Distribute Items
    const virtualFolderContent = new Map<string, PortfolioItem[]>();
    storedVirtualFolders.forEach((f) => virtualFolderContent.set(f.id, []));

    const physicalFolders: Folder[] = [];

    // Process Disk Folders
    diskFolderMap.forEach((items, name) => {
      const remainingItems: PortfolioItem[] = [];
      const safeName = name.replace(/[^a-z0-9]/gi, "_");
      const folderId = `phys-${safeName}-${items.length}`; // Deterministic ID without btoa

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
          path: basePath,
          collectionId, // NEW: Assign collection ID to folder
        });
      }
    });

    // Process Loose Files (Root)
    const remainingLooseItems: PortfolioItem[] = [];
    const rootSafeName = basePath.replace(/[^a-z0-9]/gi, "_");
    const rootFolderId = `phys-root-${rootSafeName.slice(-10)}`;

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
        name: basePath.split("/").pop() || "Root",
        items: remainingLooseItems,
        createdAt: Date.now(),
        isVirtual: false,
        path: basePath,
        collectionId, // NEW: Assign collection ID to folder
      });
    }

    return {
      foldersToAdd: physicalFolders,
      virtualFoldersMap: virtualFolderContent,
    };
  },
};
