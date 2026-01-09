import type { LibraryState, LibraryAction } from './LibraryContext.types';
// Reducer function for library state management
function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'REMOVE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.payload),
      };
    case 'REMOVE_FOLDER_BY_PATH': {
      // For shadow folders, we need to find by sourceFolderId
      // The payload is actually the path of the source folder
      return {
        ...state,
        folders: state.folders.filter((f) => {
          // Keep folders that don't match the path
          // For physical folders: check f.path
          // For shadow folders: we can't directly match by path since they don't have it
          // Instead, we'll filter them out in the UI refresh via CollectionsContext
          return f.path !== action.payload;
        }),
      };
    }
    case 'MERGE_FOLDERS': {
      const { foldersToAdd, virtualFoldersMap } = action.payload;

      // Update existing virtual folders with new items
      const updatedFolders = state.folders.map((folder) => {
        if (folder.isVirtual && virtualFoldersMap.has(folder.id)) {
          const newItems = virtualFoldersMap.get(folder.id) || [];
          const newItemsMap = new Map(newItems.map((i) => [i.id, i]));

          // 1. Update existing items in the folder with any new data (tags, etc.)
          const updatedExistingItems = folder.items.map((item) =>
            newItemsMap.has(item.id) ? newItemsMap.get(item.id)! : item
          );

          // 2. Add truly new items (that weren't already in the folder)
          const existingIds = new Set(folder.items.map((i) => i.id));
          const distinctNewItems = newItems.filter((i) => !existingIds.has(i.id));

          return {
            ...folder,
            items: [...updatedExistingItems, ...distinctNewItems],
          };
        }
        return folder;
      });

      // Filter out physical folders that are being re-added (to avoid duplicates)
      // Use path comparison instead of ID to properly detect duplicates
      const newPhysicalPaths = new Set(foldersToAdd.filter((f) => !f.isVirtual).map((f) => f.path));
      const keptPhysical = updatedFolders.filter(
        (f) => !f.isVirtual && f.path && !newPhysicalPaths.has(f.path)
      );

      // New folders list: Updated Virtual + Kept Physical + New Physical
      // Need to be careful not to lose virtual folders that weren't updated
      const virtualFolders = updatedFolders.filter((f) => f.isVirtual); // These are already updated above

      // Deduplicate: exact ID match check
      const virtualFolderIds = new Set(virtualFolders.map((f) => f.id));
      const uniqueFoldersToAdd = foldersToAdd.filter((f) => !virtualFolderIds.has(f.id));

      return {
        ...state,
        folders: [...virtualFolders, ...keptPhysical, ...uniqueFoldersToAdd],
      };
    }
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((f) => (f.id === action.payload.id ? action.payload : f)),
      };
    case 'SET_ACTIVE_FOLDER_IDS':
      return { ...state, activeFolderIds: action.payload };
    case 'TOGGLE_FOLDER': {
      const id = action.payload;
      if (id === 'all') return { ...state, activeFolderIds: new Set(['all']) };

      const newSet = new Set(state.activeFolderIds);
      if (newSet.has('all')) {
        newSet.clear();
        newSet.add(id);
        return { ...state, activeFolderIds: newSet };
      }

      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) return { ...state, activeFolderIds: new Set(['all']) };
      } else {
        newSet.add(id);
      }
      return { ...state, activeFolderIds: newSet };
    }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_GRID_COLUMNS':
      return { ...state, gridColumns: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_ACTIVE_TAGS':
      return { ...state, activeTags: action.payload };
    case 'TOGGLE_TAG': {
      const newTags = new Set(state.activeTags);
      if (newTags.has(action.payload)) {
        newTags.delete(action.payload);
      } else {
        newTags.add(action.payload);
      }
      return { ...state, activeTags: newTags };
    }
    case 'CLEAR_TAGS':
      return { ...state, activeTags: new Set() };
    case 'SET_ACTIVE_COLOR_FILTER':
      return { ...state, activeColorFilter: action.payload };
    case 'SET_SORT_OPTION':
      return { ...state, sortOption: action.payload };
    case 'SET_SORT_DIRECTION':
      return { ...state, sortDirection: action.payload };
    case 'CLEAR_LIBRARY':
      return {
        ...state,
        folders: [],
        activeFolderIds: new Set(['all']),
      };
    case 'SET_AUTO_ANALYZE':
      return { ...state, autoAnalyzeEnabled: action.payload };
    case 'SET_CINEMATIC_CAROUSEL':
      return { ...state, useCinematicCarousel: action.payload };
    case 'BATCH_UPDATE_ITEMS': {
      const updates = action.payload;
      const updateMap = new Map(updates.map((i) => [i.id, i]));

      return {
        ...state,
        folders: state.folders.map((folder) => {
          // Check if this folder contains any of the updated items
          const hasUpdates = folder.items.some((item) => updateMap.has(item.id));
          if (!hasUpdates) return folder;

          return {
            ...folder,
            items: folder.items.map((item) =>
              updateMap.has(item.id) ? updateMap.get(item.id)! : item
            ),
          };
        }),
      };
    }

    default:
      return state;
  }
}

export { libraryReducer };
