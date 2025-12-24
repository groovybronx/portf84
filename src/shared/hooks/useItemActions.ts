import { useCallback } from "react";
import { PortfolioItem } from "../types";
import { analyzeImage } from "../../features/vision";

export interface UseItemActionsProps {
  currentItems: PortfolioItem[];
  selectedIds: Set<string>;
  selectedItem: PortfolioItem | null;
  focusedId: string | null;
  selectionMode: boolean;
  contextMenuItem: PortfolioItem | null;
  updateItems: (items: PortfolioItem[]) => void;
  updateItem: (item: PortfolioItem) => void;
  clearSelection: () => void;
  setSelectedIds: (ids: Set<string>) => void;
  createVirtualFolder: (name: string) => string;
  moveItemsToFolder: (
    itemIds: Set<string>,
    folderId: string,
    items: PortfolioItem[]
  ) => void;
  setIsMoveModalOpen: (open: boolean) => void;
  setIsAddTagModalOpen: (open: boolean) => void;
  activeCollection: { id: string; name: string } | null;
}

export interface ItemActions {
  addTagsToSelection: (newTag: string) => Promise<void>;
  applyColorTagToSelection: (color: string | undefined) => void;
  analyzeItem: (item: PortfolioItem) => Promise<void>;
  moveItemToFolder: (targetId: string) => void;
  createFolderAndMove: (name: string) => void;
  handleContextMove: (item: PortfolioItem) => void;
  handleContextAddTag: (item: PortfolioItem) => void;
}

/**
 * Custom hook for item actions (tagging, color, move, analyze)
 * Centralizes all item manipulation logic
 */
export const useItemActions = ({
  currentItems,
  selectedIds,
  selectedItem,
  focusedId,
  selectionMode,
  contextMenuItem,
  setIsMoveModalOpen: (open: boolean) => void;
  setIsAddTagModalOpen: (open: boolean) => void;
  activeCollection: { id: string; name: string } | null;
  updateItems, // Added
  updateItem,
}: UseItemActionsProps): ItemActions => {
  // Tagging Logic
  const addTagsToSelection = useCallback(
    async (newTag: string) => {
      let itemsToUpdate: PortfolioItem[] = [];

      // Determine target items (Selection > Focused > ContextMenuTarget)
      if (selectedIds.size > 0) {
        itemsToUpdate = currentItems.filter((i) => selectedIds.has(i.id));
      } else if (contextMenuItem) {
        itemsToUpdate = [contextMenuItem];
      }

      if (itemsToUpdate.length === 0) return;

      const results = itemsToUpdate.map((item) => {
        const currentTags = item.manualTags || [];
        if (!currentTags.includes(newTag)) {
          return {
            ...item,
            manualTags: [...currentTags, newTag],
          };
        }
        return item;
      });

      updateItems(results);
    },
    [selectedIds, currentItems, contextMenuItem, updateItems]
  );

  // Apply color to Focused/Selected items
  const applyColorTagToSelection = useCallback(
    (color: string | undefined) => {
      let itemsToUpdate: PortfolioItem[] = [];

      if (selectedIds.size > 0) {
        itemsToUpdate = currentItems.filter((i) => selectedIds.has(i.id));
      } else if (selectedItem) {
        itemsToUpdate = [selectedItem];
      } else if (focusedId) {
        const item = currentItems.find((i) => i.id === focusedId);
        if (item) itemsToUpdate = [item];
      }

      updateItems(itemsToUpdate.map((item) => ({ ...item, colorTag: color })));
    },
    [
      selectionMode,
      selectedIds,
      selectedItem,
      focusedId,
      currentItems,
      updateItems,
    ]
  );

  // Analyze item with AI
  const analyzeItem = useCallback(
    async (item: PortfolioItem) => {
      try {
        const res = await analyzeImage(item);
        updateItem({
          ...item,
          aiDescription: res.description,
          aiTags: res.tags,
          aiTagsDetailed: res.tagsDetailed,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [updateItem]
  );

  // Move items to folder
  const moveItemToFolder = useCallback(
    (targetId: string) => {
      moveItemsToFolder(selectedIds, targetId, currentItems);
      clearSelection();
      setIsMoveModalOpen(false);
    },
    [
      selectedIds,
      currentItems,
      moveItemsToFolder,
      clearSelection,
      setIsMoveModalOpen,
    ]
  );

  // Create folder and move items
  const createFolderAndMove = useCallback(
    (name: string) => {
      if (!activeCollection) return;
      const newId = createVirtualFolder(name);
      moveItemsToFolder(selectedIds, newId, currentItems);
      clearSelection();
      setIsMoveModalOpen(false);
    },
    [
      activeCollection,
      createVirtualFolder,
      selectedIds,
      currentItems,
      moveItemsToFolder,
      clearSelection,
      setIsMoveModalOpen,
    ]
  );

  // Context menu move handler
  const handleContextMove = useCallback(
    (item: PortfolioItem) => {
      if (!selectedIds.has(item.id)) {
        clearSelection();
        setSelectedIds(new Set([item.id]));
      }
      setIsMoveModalOpen(true);
    },
    [selectedIds, clearSelection, setSelectedIds, setIsMoveModalOpen]
  );

  // Context menu add tag handler
  const handleContextAddTag = useCallback(
    (item: PortfolioItem) => {
      if (!selectedIds.has(item.id)) {
        clearSelection();
        setSelectedIds(new Set([item.id]));
      }
      setIsAddTagModalOpen(true);
    },
    [selectedIds, clearSelection, setSelectedIds, setIsAddTagModalOpen]
  );

  return {
    addTagsToSelection,
    applyColorTagToSelection,
    analyzeItem,
    moveItemToFolder,
    createFolderAndMove,
    handleContextMove,
    handleContextAddTag,
  };
};
