import React from 'react';
import { ViewMode } from '../types';
import { Grid, LayoutList, Layers, FolderCog, Share2, X, FolderInput } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlBarProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onOpenFolders: () => void;
  count: number;
  selectionMode: boolean;
  selectedCount: number;
  onShareSelected: () => void;
  onMoveSelected?: () => void;
  onCancelSelection: () => void;
  folderName?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
    currentMode, 
    onModeChange, 
    onOpenFolders, 
    count,
    selectionMode,
    selectedCount,
    onShareSelected,
    onMoveSelected,
    onCancelSelection,
    folderName
}) => {
  const modes = [
    { id: ViewMode.GRID, icon: Grid, label: 'Grid' },
    { id: ViewMode.CAROUSEL, icon: Layers, label: 'Flow' },
    { id: ViewMode.LIST, icon: LayoutList, label: 'Detail' },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-(--z-controlbar) max-w-[90vw]"
    >
      <div className="glass-surface border border-glass-border rounded-full shadow-2xl shadow-black/50 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectionMode ? (
            <motion.div
              key="selection-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 p-2 px-6"
            >
              <span className="text-sm font-mono text-white/70 mr-2 whitespace-nowrap">
                {selectedCount} Selected
              </span>

              {/* Move Button */}
              <button
                onClick={onMoveSelected}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-glass-bg-accent text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move to Folder"
              >
                <FolderInput size={18} />
                <span className="text-sm font-medium hidden sm:inline">
                  Move
                </span>
              </button>

              <button
                onClick={onShareSelected}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Share2 size={16} />
                <span className="text-sm font-medium hidden sm:inline">
                  Share
                </span>
              </button>

              <div className="w-px h-6 bg-glass-border/10" />
              <button
                onClick={onCancelSelection}
                className="p-2 rounded-full hover:bg-glass-bg-accent text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="view-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 p-2 px-4 sm:px-6"
            >
              <div className="pr-4 border-r border-glass-border/10 flex items-center gap-3">
                <button
                  onClick={onOpenFolders}
                  className="p-3 rounded-full hover:bg-glass-bg-accent transition-colors text-blue-400 hover:text-white flex items-center gap-2"
                  title="Manage Folders"
                >
                  <FolderCog size={20} />
                  <span className="text-sm font-medium text-white max-w-[100px] truncate hidden sm:block">
                    {folderName || "Library"}
                  </span>
                </button>
              </div>

              <div className="flex gap-1 sm:gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                      currentMode === mode.id
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {currentMode === mode.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-glass-bg-accent rounded-full border border-glass-border-light"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <mode.icon size={18} className="relative z-10" />
                    <span className="relative z-10 text-sm font-medium hidden sm:block">
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};