import React, {
	createContext,
	useContext,
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
} from "../shared/types";
import { useCollections } from "./CollectionsContext";
import { storageService } from "../services/storageService";
import { libraryLoader } from "../services/libraryLoader";

// Types
interface LibraryState {
	// Library data
	folders: Folder[];
	activeFolderIds: Set<string>;

	// View options
	viewMode: ViewMode;
	gridColumns: number;
	searchTerm: string;
	selectedTag: string | null;
	activeColorFilter: string | null;
	sortOption: SortOption;
	sortDirection: SortDirection;
	// AI Settings
	autoAnalyzeEnabled: boolean;
}

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
	| { type: "SET_SELECTED_TAG"; payload: string | null }
	| { type: "SET_ACTIVE_COLOR_FILTER"; payload: string | null }
	| { type: "SET_SORT_OPTION"; payload: SortOption }
	| { type: "SET_SORT_OPTION"; payload: SortOption }
	| { type: "SET_SORT_DIRECTION"; payload: SortDirection }
	| { type: "CLEAR_LIBRARY"; payload: void }
	| { type: "SET_AUTO_ANALYZE"; payload: boolean };

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
	setSelectedTag: (tag: string | null) => void;
	setActiveColorFilter: (color: string | null) => void;
	setSortOption: (option: SortOption) => void;
	setSortDirection: (direction: SortDirection) => void;
	setAutoAnalyze: (enabled: boolean) => void;
}

// Reducer
function libraryReducer(
	state: LibraryState,
	action: LibraryAction
): LibraryState {
	switch (action.type) {
		case "SET_FOLDERS":
			return { ...state, folders: action.payload };
		case "ADD_FOLDER":
			return { ...state, folders: [...state.folders, action.payload] };
		case "REMOVE_FOLDER":
			return {
				...state,
				folders: state.folders.filter((f) => f.id !== action.payload),
			};
		case "REMOVE_FOLDER_BY_PATH":
			return {
				...state,
				folders: state.folders.filter((f) => f.path !== action.payload),
			};
		case "MERGE_FOLDERS": {
			const { foldersToAdd, virtualFoldersMap } = action.payload;

			// Update existing virtual folders with new items
			const updatedFolders = state.folders.map((folder) => {
				if (folder.isVirtual && virtualFoldersMap.has(folder.id)) {
					const newItems = virtualFoldersMap.get(folder.id) || [];
					// Merge items avoiding duplicates
					const existingIds = new Set(folder.items.map((i) => i.id));
					const distinctNewItems = newItems.filter(
						(i) => !existingIds.has(i.id)
					);
					return {
						...folder,
						items: [...folder.items, ...distinctNewItems],
					};
				}
				return folder;
			});

			// Filter out physical folders that are being re-added (to avoid duplicates)
			const newPhysicalIds = new Set(foldersToAdd.map((f) => f.id));
			const keptPhysical = updatedFolders.filter(
				(f) => !f.isVirtual && !newPhysicalIds.has(f.id)
			);

			// New folders list: Updated Virtual + Kept Physical + New Physical
			// Need to be careful not to lose virtual folders that weren't updated
			const virtualFolders = updatedFolders.filter((f) => f.isVirtual); // These are already updated above

			return {
				...state,
				folders: [...virtualFolders, ...keptPhysical, ...foldersToAdd],
			};
		}
		case "UPDATE_FOLDER":
			return {
				...state,
				folders: state.folders.map((f) =>
					f.id === action.payload.id ? action.payload : f
				),
			};
		case "SET_ACTIVE_FOLDER_IDS":
			return { ...state, activeFolderIds: action.payload };
		case "TOGGLE_FOLDER": {
			const id = action.payload;
			if (id === "all") return { ...state, activeFolderIds: new Set(["all"]) };

			const newSet = new Set(state.activeFolderIds);
			if (newSet.has("all")) {
				newSet.clear();
				newSet.add(id);
				return { ...state, activeFolderIds: newSet };
			}

			if (newSet.has(id)) {
				newSet.delete(id);
				if (newSet.size === 0)
					return { ...state, activeFolderIds: new Set(["all"]) };
			} else {
				newSet.add(id);
			}
			return { ...state, activeFolderIds: newSet };
		}
		case "SET_VIEW_MODE":
			return { ...state, viewMode: action.payload };
		case "SET_GRID_COLUMNS":
			return { ...state, gridColumns: action.payload };
		case "SET_SEARCH_TERM":
			return { ...state, searchTerm: action.payload };
		case "SET_SELECTED_TAG":
			return { ...state, selectedTag: action.payload };
		case "SET_ACTIVE_COLOR_FILTER":
			return { ...state, activeColorFilter: action.payload };
		case "SET_SORT_OPTION":
			return { ...state, sortOption: action.payload };
		case "SET_SORT_DIRECTION":
			return { ...state, sortDirection: action.payload };
		case "CLEAR_LIBRARY":
			return {
				...state,
				folders: [],
				activeFolderIds: new Set(["all"]),
			};
		case "SET_AUTO_ANALYZE":
			return { ...state, autoAnalyzeEnabled: action.payload };
		default:
			return state;
	}
}

// Contexts
const LibraryStateContext = createContext<LibraryContextState | undefined>(
	undefined
);
const LibraryDispatchContext = createContext<LibraryContextActions | undefined>(
	undefined
);

// Types Split
interface LibraryContextState extends LibraryState {
	availableTags: string[];
	processedItems: PortfolioItem[];
	currentItems: PortfolioItem[];
}

interface LibraryContextActions {
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
	setViewMode: (mode: ViewMode) => void;
	setGridColumns: (columns: number) => void;
	setSearchTerm: (term: string) => void;
	setSelectedTag: (tag: string | null) => void;
	setActiveColorFilter: (color: string | null) => void;
	setSortOption: (option: SortOption) => void;
	setSortDirection: (direction: SortDirection) => void;
	setAutoAnalyze: (enabled: boolean) => void;
}

// Provider
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
		selectedTag: null,
		activeColorFilter: null,
		sortOption: "date",
		sortDirection: "desc",
		autoAnalyzeEnabled: false,
	});

	// Clear library when collection changes to null
	useEffect(() => {
		if (!activeCollection) {
			console.log("[LibraryContext] No active collection, clearing state");
			dispatch({ type: "CLEAR_LIBRARY", payload: undefined });
		}
	}, [activeCollection]);

	// Computed: Get all items from all folders
	const allItems = useMemo(() => {
		return state.folders.flatMap((f) => f.items);
	}, [state.folders]);

	// Computed: Filter items by active folders
	const filteredByFolder = useMemo(() => {
		if (state.activeFolderIds.has("all")) return allItems;
		return allItems.filter(
			(item) =>
				item.virtualFolderId && state.activeFolderIds.has(item.virtualFolderId)
		);
	}, [allItems, state.activeFolderIds]);

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

		// Tag filter
		if (state.selectedTag) {
			filtered = filtered.filter(
				(item) =>
					item.aiTags?.includes(state.selectedTag!) ||
					item.manualTags?.includes(state.selectedTag!)
			);
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
		state.selectedTag,
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
				console.warn("[LibraryContext] No active collection, skipping load");
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
		console.log("[LibraryContext] importFiles not yet implemented");
	}, []);

	const updateItem = useCallback(
		(updated: PortfolioItem) => {
			// Use functional update to ensure we have latest state
			let updatedFolders: Folder[] = [];
			let currentFolders: Folder[] = [];

			// Access current value from state via a ref or by re-dispatching?
			// React clean pattern: We should probably just dispatch an UPDATE_ITEM action
			// rather than calculating it here, but to minimize refactor:

			// FIX: We need to trust that 'state.folders' is fresh because this function
			// should be recreated when 'state.folders' changes.
			// However, to be absolutely safe and fix the reported bug where folders might reset,
			// let's ensure we are using the dependency correctly.
			// The original code had [] dependency, which DEFINITELY caused stale closure.

			updatedFolders = state.folders.map((folder) => {
				if (!updated.folderId || folder.id === updated.folderId) {
					return {
						...folder,
						items: folder.items.map((item) =>
							item.id === updated.id ? updated : item
						),
					};
				}
				return folder;
			});

			dispatch({ type: "SET_FOLDERS", payload: updatedFolders });
			storageService.saveMetadata(updated, updated.path || updated.name);
		},
		[state.folders]
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
			dispatch({
				type: "SET_ACTIVE_FOLDER_IDS",
				payload: new Set([newFolder.id]),
			});
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

			dispatch({
				type: "SET_ACTIVE_FOLDER_IDS",
				payload: new Set([targetFolderId]),
			});
		},
		[state.folders]
	);

	const clearLibrary = useCallback(() => {
		console.log("[LibraryContext] Clearing library state");
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

	const setSelectedTag = useCallback((tag: string | null) => {
		dispatch({ type: "SET_SELECTED_TAG", payload: tag });
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
			createFolder,
			deleteFolder,
			removeFolderByPath,
			toggleFolderSelection,
			moveItemsToFolder,
			clearLibrary,
			setViewMode,
			setGridColumns,
			setSearchTerm,
			setSelectedTag,
			setActiveColorFilter,
			setSortOption,
			setSortDirection,
			setAutoAnalyze,
		}),
		[
			loadFromPath,
			importFiles,
			updateItem,
			createFolder,
			deleteFolder,
			removeFolderByPath,
			toggleFolderSelection,
			moveItemsToFolder,
			clearLibrary,
			setViewMode,
			setGridColumns,
			setSearchTerm,
			setSelectedTag,
			setActiveColorFilter,
			setSortOption,
			setSortDirection,
			setAutoAnalyze,
		]
	);

	return (
		<LibraryStateContext.Provider value={stateValue}>
			<LibraryDispatchContext.Provider value={dispatchValue}>
				{children}
			</LibraryDispatchContext.Provider>
		</LibraryStateContext.Provider>
	);
};

// Hooks

export const useLibraryState = () => {
	const context = useContext(LibraryStateContext);
	if (context === undefined) {
		throw new Error(
			"useLibraryState must be used within a LibraryStateContext.Provider"
		);
	}
	return context;
};

export const useLibraryActions = () => {
	const context = useContext(LibraryDispatchContext);
	if (context === undefined) {
		throw new Error(
			"useLibraryActions must be used within a LibraryDispatchContext.Provider"
		);
	}
	return context;
};

// Legacy hook (Wrapper)
export const useLibrary = () => {
	const state = useLibraryState();
	const actions = useLibraryActions();
	return { ...state, ...actions };
};
