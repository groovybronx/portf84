import {
  Folder,
  PortfolioItem,
  ViewMode,
  SortOption,
  SortDirection,
} from "../types";

// Core state interface
interface LibraryState {
  // Library data
  folders: Folder[];
  activeFolderIds: Set<string>;

  // View options
  viewMode: ViewMode;
  gridColumns: number;
  searchTerm: string;
  activeTags: Set<string>;
  activeColorFilter: string | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  // AI Settings
  autoAnalyzeEnabled: boolean;
  // Experimental Features
  useCinematicCarousel: boolean;
}

// Action types for the reducer
type LibraryAction =
  | { type: "SET_FOLDERS"; payload: Folder[] }
  | { type: "ADD_FOLDER"; payload: Folder }
  | { type: "REMOVE_FOLDER"; payload: string }
  | { type: "REMOVE_FOLDER_BY_PATH"; payload: string }
  | {
      type: "MERGE_FOLDERS";
      payload: {
        foldersToAdd: Folder[];
        virtualFoldersMap: Map<string, PortfolioItem[]>;
      };
    }
  | { type: "UPDATE_FOLDER"; payload: Folder }
  | { type: "SET_ACTIVE_FOLDER_IDS"; payload: Set<string> }
  | { type: "TOGGLE_FOLDER"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_GRID_COLUMNS"; payload: number }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_ACTIVE_TAGS"; payload: Set<string> }
  | { type: "TOGGLE_TAG"; payload: string }
  | { type: "CLEAR_TAGS"; payload: undefined }
  | { type: "SET_ACTIVE_COLOR_FILTER"; payload: string | null }
  | { type: "SET_SORT_OPTION"; payload: SortOption }
  | { type: "SET_SORT_DIRECTION"; payload: SortDirection }
  | { type: "BATCH_UPDATE_ITEMS"; payload: PortfolioItem[] }
  | { type: "SET_AUTO_ANALYZE"; payload: boolean }
  | { type: "SET_CINEMATIC_CAROUSEL"; payload: boolean }
  | { type: "CLEAR_LIBRARY"; payload: undefined };

// Combined context interface (legacy)
interface LibraryContextType extends LibraryState {
  // Computed values
  availableTags: string[];
  processedItems: PortfolioItem[];
  currentItems: PortfolioItem[];

  // Actions - Library
  loadFromPath: (path: string) => Promise<void>;
  importFiles: (fileList: FileList) => void;
  updateItem: (item: PortfolioItem) => void;
  createFolder: (name: string) => string;
  deleteFolder: (id: string) => void;
  removeFolderByPath: (path: string) => void;
  toggleFolderSelection: (id: string) => void;
  moveItemsToFolder: (
    itemIds: Set<string>,
    targetFolderId: string,
    allItemsFlat: PortfolioItem[]
  ) => void;
  clearLibrary: () => void;

  // Actions - View
  setViewMode: (mode: ViewMode) => void;
  setGridColumns: (columns: number) => void;
  setSearchTerm: (term: string) => void;
  setActiveTags: (tags: Set<string>) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setActiveColorFilter: (color: string | null) => void;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setAutoAnalyze: (enabled: boolean) => void;
  setCinematicCarousel: (enabled: boolean) => void;
}

// Split context interfaces
interface LibraryContextState extends LibraryState {
  availableTags: string[];
  processedItems: PortfolioItem[];
  currentItems: PortfolioItem[];
}

interface LibraryContextActions {
  loadFromPath: (path: string) => Promise<void>;
  importFiles: (fileList: FileList) => void;
  updateItem: (item: PortfolioItem) => void;
  updateItems: (items: PortfolioItem[]) => void;
  createFolder: (name: string) => string;
  deleteFolder: (id: string) => void;
  removeFolderByPath: (path: string) => void;
  toggleFolderSelection: (id: string) => void;
  moveItemsToFolder: (
    itemIds: Set<string>,
    targetFolderId: string,
    allItemsFlat: PortfolioItem[]
  ) => void;
  clearLibrary: () => void;
  setViewMode: (mode: ViewMode) => void;
  setGridColumns: (columns: number) => void;
  setSearchTerm: (term: string) => void;
  setActiveTags: (tags: Set<string>) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setActiveColorFilter: (color: string | null) => void;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setAutoAnalyze: (enabled: boolean) => void;
  setCinematicCarousel: (enabled: boolean) => void;
  refreshMetadata: () => Promise<void>;
}

export type {
  LibraryState,
  LibraryAction,
  LibraryContextType,
  LibraryContextState,
  LibraryContextActions,
};
