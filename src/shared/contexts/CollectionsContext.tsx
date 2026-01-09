import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { Collection, SourceFolder } from "../types";
import { storageService } from "../../services/storageService";

import { logger } from '../utils/logger';
// Types
interface CollectionsState {
  collections: Collection[];
  activeCollection: Collection | null;
  sourceFolders: SourceFolder[];
  isLoading: boolean;
}

type CollectionsAction =
  | { type: "SET_COLLECTIONS"; payload: Collection[] }
  | { type: "SET_ACTIVE_COLLECTION"; payload: Collection | null }
  | { type: "ADD_COLLECTION"; payload: Collection }
  | { type: "REMOVE_COLLECTION"; payload: string }
  | { type: "SET_SOURCE_FOLDERS"; payload: SourceFolder[] }
  | { type: "ADD_SOURCE_FOLDER"; payload: SourceFolder }
  | { type: "REMOVE_SOURCE_FOLDER"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

interface CollectionsContextType extends CollectionsState {
  createCollection: (name: string) => Promise<void>;
  switchCollection: (id: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addSourceFolder: (path: string) => Promise<void>;
  removeSourceFolder: (path: string) => Promise<void>;
}

// Reducer
function collectionsReducer(
  state: CollectionsState,
  action: CollectionsAction
): CollectionsState {
  switch (action.type) {
    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };
    case "SET_ACTIVE_COLLECTION":
      return { ...state, activeCollection: action.payload };
    case "ADD_COLLECTION":
      return { ...state, collections: [...state.collections, action.payload] };
    case "REMOVE_COLLECTION":
      return {
        ...state,
        collections: state.collections.filter((c) => c.id !== action.payload),
        activeCollection:
          state.activeCollection?.id === action.payload
            ? null
            : state.activeCollection,
      };
    case "SET_SOURCE_FOLDERS":
      return { ...state, sourceFolders: action.payload };
    case "ADD_SOURCE_FOLDER":
      return {
        ...state,
        sourceFolders: [...state.sourceFolders, action.payload],
      };
    case "REMOVE_SOURCE_FOLDER":
      return {
        ...state,
        sourceFolders: state.sourceFolders.filter(
          (f) => f.path !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Context
const CollectionsContext = createContext<CollectionsContextType | undefined>(
  undefined
);

// Provider
export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(collectionsReducer, {
    collections: [],
    activeCollection: null,
    sourceFolders: [],
    isLoading: true,
  });

  // Initialize: Load collections and active collection
  useEffect(() => {
    const initialize = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      const storedCollections = await storageService.getCollections();
      dispatch({ type: "SET_COLLECTIONS", payload: storedCollections });

      const active = await storageService.getActiveCollection();
      dispatch({ type: "SET_ACTIVE_COLLECTION", payload: active });

      if (active) {
        const folders = await storageService.getCollectionFolders(active.id);
        dispatch({ type: "SET_SOURCE_FOLDERS", payload: folders });
      }

      dispatch({ type: "SET_LOADING", payload: false });
    };

    initialize();
  }, []);

  // Actions
  const createCollection = useCallback(async (name: string) => {
    const id = await storageService.createCollection(name);

    // Reload to get the newly created collection
    const allCollections = await storageService.getCollections();
    dispatch({ type: "SET_COLLECTIONS", payload: allCollections });

    const newCollection = allCollections.find((c) => c.id === id);
    if (newCollection) {
      dispatch({ type: "SET_ACTIVE_COLLECTION", payload: newCollection });
      dispatch({ type: "SET_SOURCE_FOLDERS", payload: [] });
    }
  }, []);

  const switchCollection = useCallback(async (id: string) => {
    await storageService.setActiveCollection(id);

    const allCollections = await storageService.getCollections();
    const active = allCollections.find((c) => c.id === id);

    if (active) {
      const folders = await storageService.getCollectionFolders(id);

      dispatch({ type: "SET_COLLECTIONS", payload: allCollections });
      dispatch({ type: "SET_ACTIVE_COLLECTION", payload: active });
      dispatch({ type: "SET_SOURCE_FOLDERS", payload: folders });
    }
  }, []);

  const deleteCollection = useCallback(
    async (id: string) => {
      await storageService.deleteCollection(id);
      dispatch({ type: "REMOVE_COLLECTION", payload: id });

      // If deleted collection was active, clear source folders
      if (state.activeCollection?.id === id) {
        dispatch({ type: "SET_SOURCE_FOLDERS", payload: [] });
      }
    },
    [state.activeCollection]
  );

  const addSourceFolder = useCallback(
    async (path: string) => {
      if (!state.activeCollection) return;

      await storageService.addFolderToCollection(
        state.activeCollection.id,
        path
      );
      const folders = await storageService.getCollectionFolders(
        state.activeCollection.id
      );
      dispatch({ type: "SET_SOURCE_FOLDERS", payload: folders });
    },
    [state.activeCollection]
  );

  const removeSourceFolder = useCallback(
    async (path: string) => {
      if (!state.activeCollection) return;

      await storageService.removeFolderFromCollection(
        state.activeCollection.id,
        path
      );
      const folders = await storageService.getCollectionFolders(
        state.activeCollection.id
      );
      dispatch({ type: "SET_SOURCE_FOLDERS", payload: folders });
    },
    [state.activeCollection]
  );

  const value: CollectionsContextType = {
    ...state,
    createCollection,
    switchCollection,
    deleteCollection,
    addSourceFolder,
    removeSourceFolder,
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

// Hook
export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within a CollectionsProvider");
  }
  return context;
};
