import { useEffect } from "react";
import { PortfolioItem, COLOR_PALETTE } from "../types";

export interface UseKeyboardShortcutsProps {
  processedItems: PortfolioItem[];
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  setSelectedItem: (item: PortfolioItem) => void;
  applyColorTagToSelection: (color: string | undefined) => void;
  gridColumns: number;
}

/**
 * Custom hook for managing global keyboard shortcuts
 * Handles:
 * - Navigation (Arrow keys)
 * - Selection (Space/Enter)
 * - Color tagging (0-6)
 */
export const useKeyboardShortcuts = ({
  processedItems,
  focusedId,
  setFocusedId,
  setSelectedItem,
  applyColorTagToSelection,
  gridColumns,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // 1. Navigation (Arrows) & Selection (Space/Enter)
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "Enter",
        ].includes(e.key)
      ) {
        e.preventDefault(); // Prevent scroll (Space/Arrows)

        const currentIndex = focusedId
          ? processedItems.findIndex((i) => i.id === focusedId)
          : -1;

        if (e.key === " " || e.key === "Enter") {
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

        switch (e.key) {
          case "ArrowRight":
            newIndex = Math.min(processedItems.length - 1, currentIndex + 1);
            break;
          case "ArrowLeft":
            newIndex = Math.max(0, currentIndex - 1);
            break;
          case "ArrowDown":
            newIndex = Math.min(
              processedItems.length - 1,
              currentIndex + gridColumns
            );
            break;
          case "ArrowUp":
            newIndex = Math.max(0, currentIndex - gridColumns);
            break;
        }

        if (newIndex !== currentIndex) {
          const targetItem = processedItems[newIndex];
          if (targetItem) {
            setFocusedId(targetItem.id);
          }
        }
        return;
      }

      // 2. Color Tagging Shortcuts
      if (/^[1-6]$/.test(e.key)) {
        const color = COLOR_PALETTE[e.key];
        if (color) applyColorTagToSelection(color);
      } else if (e.key === "0") {
        applyColorTagToSelection(undefined);
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
  ]);
};
