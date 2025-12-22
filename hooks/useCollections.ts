import { useState, useEffect, useCallback } from "react";
import { Collection, SourceFolder } from "../types";
import { storageService } from "../services/storageService";

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollectionState] =
    useState<Collection | null>(null);
  const [sourceFolders, setSourceFolders] = useState<SourceFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collections on mount
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);

        // DEBUG: List all collection_folders in database
        await storageService.debugListAllCollectionFolders();

        const allCollections = await storageService.getCollections();
        console.log("[useCollections] Loaded collections:", allCollections);
        setCollections(allCollections);

        const active = await storageService.getActiveCollection();
        console.log("[useCollections] Active collection:", active);
        if (active) {
          setActiveCollectionState(active);
          const folders = await storageService.getCollectionFolders(active.id);
          console.log(
            "[useCollections] Source folders for active collection:",
            folders
          );
          setSourceFolders(folders);
        }
      } catch (error) {
        console.error("[useCollections] Failed to load collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  // Create a new collection
  const createCollection = useCallback(
    async (name: string): Promise<string> => {
      try {
        const id = await storageService.createCollection(name);

        // Reload collections
        const allCollections = await storageService.getCollections();
        setCollections(allCollections);

        const newCollection = allCollections.find((c) => c.id === id);
        if (newCollection) {
          setActiveCollectionState(newCollection);
          setSourceFolders([]); // New collection starts empty
        }

        return id;
      } catch (error) {
        console.error("[useCollections] Failed to create collection:", error);
        throw error;
      }
    },
    []
  );

  // Switch to a different collection
  const switchCollection = useCallback(async (id: string): Promise<void> => {
    try {
      console.log("[useCollections] Switching to collection:", id);
      await storageService.setActiveCollection(id);

      const allCollections = await storageService.getCollections();
      setCollections(allCollections);

      const active = allCollections.find((c) => c.id === id);
      console.log("[useCollections] Found active collection:", active);
      if (active) {
        setActiveCollectionState(active);
        const folders = await storageService.getCollectionFolders(id);
        console.log("[useCollections] Loaded source folders:", folders);
        setSourceFolders(folders);
      }
    } catch (error) {
      console.error("[useCollections] Failed to switch collection:", error);
      throw error;
    }
  }, []);

  // Delete a collection
  const deleteCollection = useCallback(
    async (id: string): Promise<void> => {
      try {
        await storageService.deleteCollection(id);

        const allCollections = await storageService.getCollections();
        setCollections(allCollections);

        // If we deleted the active collection, clear state
        if (activeCollection?.id === id) {
          setActiveCollectionState(null);
          setSourceFolders([]);
        }
      } catch (error) {
        console.error("[useCollections] Failed to delete collection:", error);
        throw error;
      }
    },
    [activeCollection]
  );

  // Add a source folder to the active collection
  const addSourceFolder = useCallback(
    async (path: string): Promise<void> => {
      if (!activeCollection) {
        throw new Error("No active collection");
      }

      try {
        await storageService.addFolderToCollection(activeCollection.id, path);
        const folders = await storageService.getCollectionFolders(
          activeCollection.id
        );
        setSourceFolders(folders);
      } catch (error) {
        console.error("[useCollections] Failed to add source folder:", error);
        throw error;
      }
    },
    [activeCollection]
  );

  // Remove a source folder from the active collection
  const removeSourceFolder = useCallback(
    async (path: string): Promise<void> => {
      if (!activeCollection) {
        throw new Error("No active collection");
      }

      try {
        await storageService.removeFolderFromCollection(
          activeCollection.id,
          path
        );
        const folders = await storageService.getCollectionFolders(
          activeCollection.id
        );
        setSourceFolders(folders);
      } catch (error) {
        console.error(
          "[useCollections] Failed to remove source folder:",
          error
        );
        throw error;
      }
    },
    [activeCollection]
  );

  return {
    collections,
    activeCollection,
    sourceFolders,
    isLoading,
    createCollection,
    switchCollection,
    deleteCollection,
    addSourceFolder,
    removeSourceFolder,
  };
};
