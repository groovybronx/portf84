import React, {
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  Folder,
  PortfolioItem,
  ViewMode,
  SortOption,
  SortDirection,
} from "../types";
import { useCollections } from "./CollectionsContext";
import { storageService } from "../../services/storageService";
import { libraryLoader } from "../../services/libraryLoader";
import { libraryReducer } from "./LibraryContext.reducer";
import { LibraryStateContext } from "./LibraryContext.state";
import { LibraryDispatchContext } from "./LibraryContext.actions";
import type { LibraryState, LibraryContextState, LibraryContextActions } from "./LibraryContext.types";

import { logger } from '../utils/logger';
// Provider component
export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeCollection } = useCollections();

  const [state, dispatch] = useReducer(libraryReducer, {
    folders: [],
    activeFolderIds: new Set(["all"]),
    viewMode: ViewMode.GRID,
    gridColumns: 4,
    searchTerm: "",
    activeTags: new Set<string>(),
    activeColorFilter: null,
    sortOption: "date",
    sortDirection: "desc",
    autoAnalyzeEnabled: false,
    useCinematicCarousel: false,
  });

  // Clear library when collection changes to null
  useEffect(() => {
    if (!activeCollection) {
      logger.debug("[LibraryContext] No active collection, clearing state");
      dispatch({ type: "CLEAR_LIBRARY", payload: undefined });
    }
  }, [activeCollection]);

  // Load virtual folders on mount when collection changes
  useEffect(() => {
    const loadVirtualFolders = async () => {
      if (!activeCollection) return;

      logger.debug(
        `[LibraryContext] Loading virtual folders for collection ${activeCollection.id}`
      );
      const storedVirtual = await storageService.getVirtualFolders(
        activeCollection.id
      );

      // IMPORTANT: Only load user-created virtual collections (not shadow folders)
      // Shadow folders (with sourceFolderId) are loaded by loadFromPath
      const userCollections = storedVirtual.filter((vf) => !vf.sourceFolderId);

      if (userCollections.length > 0) {
        logger.debug(
          `[LibraryContext] Found ${userCollections.length} user-created virtual collections to restore`
        );
        dispatch({ type: "SET_FOLDERS", payload: userCollections });
      }
    };

    loadVirtualFolders();
  }, [activeCollection?.id]);

  // Computed: Get all items from all folders
  const allItems = useMemo(() => {
    return state.folders.flatMap((f) => f.items);
  }, [state.folders]);

  // Computed: Filter items by active folders
  const filteredByFolder = useMemo(() => {
    if (state.activeFolderIds.has("all")) return allItems;

    // Get items from selected folders
    const selectedFolders = state.folders.filter((f) =>
      state.activeFolderIds.has(f.id)
    );

    // Collect item IDs that are in the selected folders
    const itemsInSelectedFolders = new Set<string>();
    selectedFolders.forEach((folder) => {
      folder.items.forEach((item) => {
        itemsInSelectedFolders.add(item.id);
      });
    });

    // Filter items: either by virtualFolderId OR by being in folder's items array
    return allItems.filter(
      (item) =>
        (item.virtualFolderId &&
          state.activeFolderIds.has(item.virtualFolderId)) ||
        (item.folderId && state.activeFolderIds.has(item.folderId)) ||
        itemsInSelectedFolders.has(item.id)
    );
  }, [allItems, state.activeFolderIds, state.folders]);

  // Computed: Apply search, tag, color filters
  const processedItems = useMemo(() => {
    let filtered = filteredByFolder;

    // Search filter
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.aiDescription?.toLowerCase().includes(term) ||
          item.aiTags?.some((tag) => tag.toLowerCase().includes(term)) ||
          item.manualTags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Tag filter (AND logic - item must have ALL active tags)
    if (state.activeTags.size > 0) {
      filtered = filtered.filter((item) => {
        const itemTags = new Set([
            ...(item.aiTags || []),
            ...(item.manualTags || [])
        ]);
        // Check if every active tag is present in itemTags
        return Array.from(state.activeTags).every(tag => itemTags.has(tag));
      });
    }

    // Color filter
    if (state.activeColorFilter) {
      filtered = filtered.filter(
        (item) => item.colorTag === state.activeColorFilter
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (state.sortOption === "date") {
        comparison = b.lastModified - a.lastModified;
      } else if (state.sortOption === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (state.sortOption === "size") {
        comparison = b.size - a.size;
      }
      return state.sortDirection === "asc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    filteredByFolder,
    state.searchTerm,
    state.activeTags,
    state.activeColorFilter,
    state.sortOption,
    state.sortDirection,
  ]);

  // Computed: Available tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    processedItems.forEach((item) => {
      item.aiTags?.forEach((tag) => tagSet.add(tag));
      item.manualTags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [processedItems]);

  // Actions - Library
  const loadFromPath = useCallback(
    async (path: string) => {
      if (!activeCollection) {
        logger.warn("[LibraryContext] No active collection, skipping load");
        return;
      }

      const storedVirtual = await storageService.getVirtualFolders(
        activeCollection.id
      );
      const { foldersToAdd, virtualFoldersMap } =
        await libraryLoader.loadAndMerge(
          path,
          storedVirtual,
          activeCollection.id
        );

      dispatch({
        type: "MERGE_FOLDERS",
        payload: { foldersToAdd, virtualFoldersMap },
      });

      // Removed manual state calculation that caused race condition

      if (foldersToAdd.length > 0 || virtualFoldersMap.size > 0) {
        dispatch({ type: "SET_ACTIVE_FOLDER_IDS", payload: new Set(["all"]) });
      }

      await storageService.addDirectoryHandle(path, false);
    },
    [activeCollection]
  );

  const importFiles = useCallback((fileList: FileList) => {
    // Implementation from useLibrary hook
    // Simplified for now - can be expanded
    logger.debug("[LibraryContext] importFiles not yet implemented");
  }, []);

  const updateItems = useCallback((updatedItems: PortfolioItem[]) => {
    dispatch({ type: "BATCH_UPDATE_ITEMS", payload: updatedItems });
    updatedItems.forEach((item) => {
      storageService.saveMetadata(item, item.path || item.name);
    });
  }, []);

  const updateItem = useCallback(
    (item: PortfolioItem) => {
      updateItems([item]);
    },
    [updateItems]
  );

  const createFolder = useCallback(
    (name: string): string => {
      const newFolder: Folder = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        items: [],
        createdAt: Date.now(),
        isVirtual: true,
        collectionId: activeCollection?.id || "unknown",
      };
      dispatch({ type: "ADD_FOLDER", payload: newFolder });
      storageService.saveVirtualFolder(newFolder);
      return newFolder.id;
    },
    [activeCollection]
  );

  const deleteFolder = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FOLDER", payload: id });
    dispatch({ type: "TOGGLE_FOLDER", payload: id }); // Remove from active if present
    storageService.deleteVirtualFolder(id);
  }, []);

  const removeFolderByPath = useCallback((path: string) => {
    dispatch({ type: "REMOVE_FOLDER_BY_PATH", payload: path });
  }, []);

  const toggleFolderSelection = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_FOLDER", payload: id });
  }, []);

  const moveItemsToFolder = useCallback(
    (
      itemIds: Set<string>,
      targetFolderId: string,
      allItemsFlat: PortfolioItem[]
    ) => {
      if (itemIds.size === 0) return;
      const itemsToMove = allItemsFlat.filter((i) => itemIds.has(i.id));

      const updatedFolders = state.folders.map((folder) => {
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
      });
      dispatch({ type: "SET_FOLDERS", payload: updatedFolders });

      itemsToMove.forEach((item) => {
        const updatedItem = { ...item, folderId: targetFolderId };
        storageService.saveMetadata(
          updatedItem,
          updatedItem.path || updatedItem.name
        );
      });
    },
    [state.folders]
  );

  const clearLibrary = useCallback(() => {
    logger.debug("[LibraryContext] Clearing library state");
    dispatch({ type: "CLEAR_LIBRARY", payload: undefined });
  }, []);

  // Actions - View
  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const setGridColumns = useCallback((columns: number) => {
    dispatch({ type: "SET_GRID_COLUMNS", payload: columns });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const setActiveTags = useCallback((tags: Set<string>) => {
    dispatch({ type: "SET_ACTIVE_TAGS", payload: tags });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    dispatch({ type: "TOGGLE_TAG", payload: tag });
  }, []);

  const clearTags = useCallback(() => {
    dispatch({ type: "CLEAR_TAGS", payload: undefined });
  }, []);

  const setActiveColorFilter = useCallback((color: string | null) => {
    dispatch({ type: "SET_ACTIVE_COLOR_FILTER", payload: color });
  }, []);

  const setSortOption = useCallback((option: SortOption) => {
    dispatch({ type: "SET_SORT_OPTION", payload: option });
  }, []);

  const setSortDirection = useCallback((direction: SortDirection) => {
    dispatch({ type: "SET_SORT_DIRECTION", payload: direction });
  }, []);

  const setAutoAnalyze = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_AUTO_ANALYZE", payload: enabled });
  }, []);

  const setCinematicCarousel = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_CINEMATIC_CAROUSEL", payload: enabled });
  }, []);

  const refreshMetadata = useCallback(async () => {
    if (!activeCollection) return;

    // Collect all paths from all current folders
    const allPaths = state.folders.flatMap(f => f.items.map(i => i.path || i.name));
    if (allPaths.length === 0) return;

    logger.debug('app', '[LibraryContext] Refreshing metadata for ${allPaths.length} items...');
    const metaMap = await storageService.getMetadataBatch(allPaths, activeCollection.id);

    const updatedFolders = state.folders.map(folder => ({
      ...folder,
      items: folder.items.map(item => {
        const meta = metaMap.get(item.path || item.name);
        if (meta) {
          return {
            ...item,
            aiDescription: meta.aiDescription || undefined,
            aiTags: meta.aiTags,
            aiTagsDetailed: meta.aiTagsDetailed,
            colorTag: meta.colorTag || undefined,
            manualTags: meta.manualTags,
          };
        }
        return item;
      })
    }));

    dispatch({ type: "SET_FOLDERS", payload: updatedFolders });
  }, [state.folders, activeCollection]);

  // --- 1. State Value (Memoized separately) ---
  const stateValue: LibraryContextState = useMemo(
    () => ({
      ...state,
      availableTags,
      processedItems,
      currentItems: processedItems,
    }),
    [state, availableTags, processedItems]
  );

  // --- 2. Dispatch Value (Memoized separately) ---
  const dispatchValue: LibraryContextActions = useMemo(
    () => ({
      loadFromPath,
      importFiles,
      updateItem,
      updateItems,
      createFolder,
      deleteFolder,
      removeFolderByPath,
      toggleFolderSelection,
      moveItemsToFolder,
      clearLibrary,
      setViewMode,
      setGridColumns,
      setSearchTerm,
      setActiveTags,
      toggleTag,
      clearTags,
      setActiveColorFilter,
      setSortOption,
      setSortDirection,
      setAutoAnalyze,
      setCinematicCarousel,
      refreshMetadata,
    }),
    [
      loadFromPath,
      importFiles,
      updateItem,
      updateItems,
      createFolder,
      deleteFolder,
      removeFolderByPath,
      toggleFolderSelection,
      moveItemsToFolder,
      clearLibrary,
      setViewMode,
      setGridColumns,
      setSearchTerm,
      setActiveTags,
      toggleTag,
      clearTags,
      setActiveColorFilter,
      setSortOption,
      setSortDirection,
      setAutoAnalyze,
      setCinematicCarousel,
      refreshMetadata,
    ]
  );

  return React.createElement(
    LibraryStateContext.Provider,
    { value: stateValue },
    React.createElement(
      LibraryDispatchContext.Provider,
      { value: dispatchValue },
      children
    )
  );
};
