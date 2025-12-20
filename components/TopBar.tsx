import React, { useState } from 'react';
import { FolderCog, Pin, PinOff } from "lucide-react";
import { motion } from "framer-motion";
import { SortOption, SortDirection, ViewMode } from "../types";

// Sub-components
import { SearchField } from "./topbar/SearchField";
import { SortControls } from "./topbar/SortControls";
import { BatchActions } from "./topbar/BatchActions";
import { ColorPicker } from "./topbar/ColorPicker";
import { ViewToggle } from "./topbar/ViewToggle";

interface TopBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption) => void;
  onSortDirectionChange: () => void;
  selectedTag: string | null;
  availableTags: string[];
  onTagSelect: (tag: string | null) => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  activeColorFilter: string | null;
  onColorAction: (color: string | null) => void;
  showColorTags: boolean;
  onToggleColorTags: () => void;
  currentViewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  gridColumns?: number;
  onGridColumnsChange?: (cols: number) => void;
  folderName?: string;
  onOpenFolders: () => void;
  selectedCount: number;
  onMoveSelected: () => void;
  onShareSelected: () => void;
  onRunBatchAI: () => void;
  isBatchAIProcessing: boolean;
  batchAIProgress: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchTerm,
  onSearchChange,
  sortOption,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  selectedTag,
  availableTags,
  onTagSelect,
  selectionMode,
  onToggleSelectionMode,
  activeColorFilter,
  onColorAction,
  showColorTags,
  onToggleColorTags,
  currentViewMode,
  onModeChange,
  gridColumns = 4,
  onGridColumnsChange,
  folderName,
  onOpenFolders,
  selectedCount,
  onMoveSelected,
  onShareSelected,
  onRunBatchAI,
  isBatchAIProcessing,
  batchAIProgress,
}) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const shouldShow = isPinned || isHovered || isViewMenuOpen;
  const isSelectionSupported = currentViewMode !== ViewMode.CAROUSEL;

  // Grid Size Slider Logic (Inverted)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onGridColumnsChange) {
      const MIN_COLS = 2,
        MAX_COLS = 8,
        SUM = MIN_COLS + MAX_COLS;
      onGridColumnsChange(SUM - Number(e.target.value));
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[var(--z-topbar)] h-24 flex flex-col items-center pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsViewMenuOpen(false);
      }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: shouldShow ? 0 : -100, opacity: shouldShow ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full flex justify-center p-4"
      >
        <div className="glass-surface rounded-2xl shadow-xl p-2 sm:p-3 flex items-center max-w-[95vw]">
          {/* --- LEFT SECTION --- */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg transition-colors ${
                isPinned
                  ? "text-blue-400 bg-glass-bg-accent"
                  : "text-gray-500 hover:text-white"
              }`}
              title={isPinned ? "Unpin Topbar" : "Pin Topbar"}
            >
              {isPinned ? (
                <Pin size={16} fill="currentColor" />
              ) : (
                <PinOff size={16} />
              )}
            </button>
            <div className="h-6 w-px bg-glass-border/10 mx-1 hidden sm:block" />
            <button
              onClick={onOpenFolders}
              className="p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-glass-bg-accent text-blue-400 hover:text-white flex items-center gap-2 transition-colors border border-transparent hover:border-glass-border-light"
            >
              <FolderCog size={18} />
              <span className="text-sm font-medium hidden md:inline max-w-[100px] truncate">
                {folderName || "Library"}
              </span>
            </button>
          </div>

          <div className="h-6 w-px bg-glass-border/10 mx-2 hidden sm:block flex-shrink-0" />

          {/* --- MIDDLE SECTION (Search, Colors, Slider) --- */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-1 min-w-0">
            <SearchField
              value={searchTerm}
              onChange={onSearchChange}
              availableTags={availableTags}
              selectedTag={selectedTag}
              onTagSelect={onTagSelect}
            />

            <ColorPicker
              activeColorFilter={activeColorFilter}
              onColorAction={onColorAction}
              showColorTags={showColorTags}
              onToggleColorTags={onToggleColorTags}
              selectionMode={selectionMode}
            />

            {currentViewMode === ViewMode.GRID && onGridColumnsChange && (
              <div className="hidden sm:flex items-center gap-2 bg-glass-bg-accent px-3 py-2 rounded-xl border border-glass-border-light mx-2 flex-shrink-0">
                <input
                  type="range"
                  min={2}
                  max={8}
                  step="1"
                  value={10 - gridColumns}
                  onChange={handleSliderChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                />
              </div>
            )}
          </div>

          {/* --- ACTIONS SECTION (Tags, Sort, Select) --- */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <BatchActions
              selectionMode={selectionMode}
              selectedCount={selectedCount}
              onMoveSelected={onMoveSelected}
              onShareSelected={onShareSelected}
              onToggleSelectionMode={onToggleSelectionMode}
              onRunBatchAI={onRunBatchAI}
              isBatchAIProcessing={isBatchAIProcessing}
              batchAIProgress={batchAIProgress}
            />

            {!selectionMode && (
              <div className="flex items-center gap-2">
                <SortControls
                  sortOption={sortOption}
                  sortDirection={sortDirection}
                  onSortChange={onSortChange}
                  onSortDirectionChange={onSortDirectionChange}
                />
                {isSelectionSupported && (
                  <>
                    <div className="w-px h-6 bg-glass-border/10 mx-1 hidden sm:block" />
                    <button
                      onClick={onToggleSelectionMode}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-glass-bg-accent border-glass-border-light text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-sm font-medium hidden sm:inline">
                        Select
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* --- RIGHT SECTION (View Toggle) --- */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2 ml-2 border-l border-glass-border/10 relative z-50">
            <ViewToggle
              currentViewMode={currentViewMode}
              onModeChange={onModeChange}
              isViewMenuOpen={isViewMenuOpen}
              setIsViewMenuOpen={setIsViewMenuOpen}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};