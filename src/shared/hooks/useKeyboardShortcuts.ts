import { useEffect } from "react";
import { PortfolioItem, COLOR_PALETTE } from "../types";
import { useLocalShortcuts } from "./useLocalShortcuts";

import { logger } from '../utils/logger';
export interface UseKeyboardShortcutsProps {
  processedItems: PortfolioItem[];
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  setSelectedItem: (item: PortfolioItem) => void;
  applyColorTagToSelection: (color: string | undefined) => void;
  gridColumns: number;
  onOpenBatchTagPanel?: () => void;
  onOpenHelp?: () => void;
  onSelectAll?: () => void;
  onDelete?: () => void;
  onClearSelection?: () => void;
}

/**
 * Custom hook for managing global keyboard shortcuts
 * Handles:
 * - Navigation (Arrow keys)
 * - Selection (Space/Enter, Ctrl+A, Esc)
 * - Actions (Delete)
 * - Color tagging (0-6)
 * - Batch tagging (Ctrl+Shift+T)
 * - Help (?)
 */
export const useKeyboardShortcuts = ({
  processedItems,
  focusedId,
  setFocusedId,
  setSelectedItem,
  applyColorTagToSelection,
  gridColumns,
  onOpenBatchTagPanel,
  onOpenHelp,
  onSelectAll,
  onDelete,
  onClearSelection,
}: UseKeyboardShortcutsProps) => {
  const { shortcuts } = useLocalShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // 1. Navigation & Opening
      const isNavUp = shortcuts.NAV_UP.includes(e.key);
      const isNavDown = shortcuts.NAV_DOWN.includes(e.key);
      const isNavLeft = shortcuts.NAV_LEFT.includes(e.key);
      const isNavRight = shortcuts.NAV_RIGHT.includes(e.key);
      const isOpen = shortcuts.OPEN_VIEW.includes(e.key);

      if (isNavUp || isNavDown || isNavLeft || isNavRight || isOpen) {
        e.preventDefault(); // Prevent default scroll

        const currentIndex = focusedId
          ? processedItems.findIndex((i) => i.id === focusedId)
          : -1;

        if (isOpen) {
          // Open Fullscreen
          if (focusedId) {
            const item = processedItems.find((i) => i.id === focusedId);
            if (item) setSelectedItem(item);
          }
          return;
        }

        // If nothing focused, focus first item
        if (currentIndex === -1) {
          if (processedItems.length > 0 && processedItems[0]) {
            setFocusedId(processedItems[0].id);
          }
          return;
        }

        let newIndex = currentIndex;

        if (isNavRight) {
             newIndex = Math.min(processedItems.length - 1, currentIndex + 1);
        } else if (isNavLeft) {
             newIndex = Math.max(0, currentIndex - 1);
        } else if (isNavDown) {
             newIndex = Math.min(processedItems.length - 1, currentIndex + gridColumns);
        } else if (isNavUp) {
             newIndex = Math.max(0, currentIndex - gridColumns);
        }

        if (newIndex !== currentIndex) {
          const targetItem = processedItems[newIndex];
          if (targetItem) {
            setFocusedId(targetItem.id);
          }
        }
        return;
      }

      // 2. Batch Tagging Shortcut (Ctrl+Shift+T)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        if (onOpenBatchTagPanel) {
          onOpenBatchTagPanel();
        }
        return;
      }

      // 3. Color Tagging Shortcuts
      if (shortcuts.TAG_RED.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["1"]);
      else if (shortcuts.TAG_ORANGE.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["2"]);
      else if (shortcuts.TAG_YELLOW.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["3"]);
      else if (shortcuts.TAG_GREEN.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["4"]);
      else if (shortcuts.TAG_BLUE.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["5"]);
      else if (shortcuts.TAG_PURPLE.includes(e.key)) applyColorTagToSelection(COLOR_PALETTE["6"]);
      else if (shortcuts.TAG_REMOVE.includes(e.key)) applyColorTagToSelection(undefined);

      // 4. Help Shortcut (?)
      if (e.key === "?" && onOpenHelp) {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // 5. Select All (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && onSelectAll) {
        e.preventDefault();
        onSelectAll();
        return;
      }

      // 6. Delete (Delete/Backspace)
      if ((e.key === "Delete" || e.key === "Backspace") && onDelete) {
        // Only trigger if not editing text (already handled by early return, but safe to verify)
        e.preventDefault();
        onDelete();
        return;
      }

      // 7. Clear Selection (Esc)
      if (e.key === "Escape" && onClearSelection) {
        e.preventDefault();
        onClearSelection();
        return;
      }

    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    focusedId,
    processedItems,
    gridColumns,
    setFocusedId,
    setSelectedItem,
    applyColorTagToSelection,
    onOpenBatchTagPanel,
    onOpenHelp,
    onSelectAll,
    onDelete,
    onClearSelection,
    shortcuts,
  ]);
};
