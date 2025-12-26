import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Folder,
  Box,
} from "lucide-react";

import {
  Folder as FolderType,
  Collection,
  SourceFolder,
} from "../../../../shared/types";

import { FolderDrawerHeader } from "./FolderDrawerHeader";
import { ShadowFoldersSection } from "./ShadowFoldersSection";
import { ManualCollectionsSection } from "./ManualCollectionsSection";
import { ColorFiltersSection } from "./ColorFiltersSection";

interface FolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderType[];
  activeFolderId: Set<string>;
  onSelectFolder: (id: string) => void;
  onImportFolder: () => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  // Collection management
  activeCollection: Collection | null;
  sourceFolders: SourceFolder[];
  collections?: Collection[]; // Make optional to prevent breakage if not passed immediately
  onSwitchCollection?: (id: string) => Promise<void>;
  onManageCollections: () => void;
  onRemoveSourceFolder?: (path: string) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  // Color filter
  activeColorFilter?: string | null;
  onColorFilterChange?: (color: string | null) => void;
}

export const FolderDrawer: React.FC<FolderDrawerProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  onSelectFolder,
  onImportFolder,
  onCreateFolder,
  onDeleteFolder,
  activeCollection,
  collections = [],
  onSwitchCollection,
  onManageCollections,
  isPinned = false,
  onTogglePin,
  activeColorFilter,
  onColorFilterChange,
}) => {
  const totalItems = folders.reduce((acc, f) => acc + f.items.length, 0);

  // Separate shadow folders (linked to source) from manual collections
  const shadowFolders = folders.filter((f) => f.isVirtual && f.sourceFolderId);
  const manualCollections = folders.filter(
    (f) => f.isVirtual && !f.sourceFolderId
  );

  // Circular Rotation Logic
  const sortedCollections = React.useMemo(() => {
    if (!activeCollection || collections.length === 0) return collections;
    
    // Find index of currently active collection
    const activeIndex = collections.findIndex(c => c.id === activeCollection.id);
    if (activeIndex === -1) return collections;

    // Rotate array so active collection is first: [...fromActive, ...beforeActive]
    return [
        ...collections.slice(activeIndex),
        ...collections.slice(0, activeIndex)
    ];
  }, [collections, activeCollection]);

  const drawerBody = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <FolderDrawerHeader 
        isPinned={isPinned} 
        onTogglePin={onTogglePin} 
        totalItems={totalItems}
        onAdd={onManageCollections}
      />

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <div className="px-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Projets
          </div>
          
            {sortedCollections.map((collection) => {
            const isActive = activeCollection?.id === collection.id;
            // Smoother "bouncy" spring for the rotation effect
            // stiff: 200 (softer), damp: 20 (bouncy/overshoot)
            const springTransition = { 
              type: "spring" as const, 
              stiffness: 200, 
              damping: 20, 
              mass: 1 
            };

            return (
              <motion.div 
                layout
                key={collection.id} 
                initial={false}
                animate={{ opacity: 1 }}
                transition={springTransition}
                className="relative"
              >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isActive ? (
                        <motion.div 
                            layout // <--- Added layout here
                            key="active"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }} // Faster fade for inner content switch
                            className="bg-emerald-600/10 border border-emerald-500/30 rounded-xl overflow-hidden mb-4 relative z-10"
                        >
                            {/* Header */}
                            <motion.div layout="position" className="p-3 flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-600/5">
                                <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/20">
                                    <Box size={18} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm truncate leading-tight">
                                        {collection.name}
                                    </h3>
                                    <p className="text-[10px] text-emerald-200/60 uppercase tracking-wider font-medium">
                                        Projet Actif
                                    </p>
                                </div>
                                <button 
                                    onClick={onManageCollections}
                                    className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-300 transition-colors"
                                >
                                    <Settings size={14} />
                                </button>
                            </motion.div>

                            {/* Content Body with Slide Animation */}
                            <motion.div 
                                layout // <--- Added layout here
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                                className="p-2 space-y-4"
                            >
                                {/* SHADOW FOLDERS SECTION */}
                                <ShadowFoldersSection
                                    folders={shadowFolders}
                                    activeFolderId={activeFolderId}
                                    onSelectFolder={onSelectFolder}
                                    onImportFolder={onImportFolder}
                                    activeCollection={activeCollection}
                                    onColorFilterChange={onColorFilterChange}
                                />

                                {/* MANUAL COLLECTIONS SECTION */}
                                <ManualCollectionsSection
                                    folders={manualCollections}
                                    activeFolderId={activeFolderId}
                                    onSelectFolder={onSelectFolder}
                                    onCreateFolder={onCreateFolder}
                                    onDeleteFolder={onDeleteFolder}
                                    activeCollection={activeCollection}
                                    onColorFilterChange={onColorFilterChange}
                                />

                                {/* COLOR TAGS SECTION */}
                                <ColorFiltersSection
                                    folders={folders}
                                    activeColorFilter={activeColorFilter}
                                    onColorFilterChange={onColorFilterChange}
                                    onSelectFolder={onSelectFolder}
                                />
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* Inactive Project Row - Simple */
                        <motion.button
                            key="inactive"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => onSwitchCollection?.(collection.id)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-emerald-100/60 hover:text-white hover:bg-emerald-500/10 hover:opacity-100 transition-all group"
                        >
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Box size={16} className="text-emerald-500/70 group-hover:text-emerald-400" />
                            <span className="text-sm font-medium truncate">{collection.name}</span>
                        </motion.button>
                    )}
                  </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Unified Visibility Logic
  const isVisible = isOpen || isPinned;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - Only in floating drawer mode */}
          {!isPinned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-(--z-drawer-overlay) backdrop-blur-sm"
            />
          )}

          {/* Sidebar / Drawer Component */}
          <motion.div
            initial={isPinned ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`drawer-area glass-surface-lg border-r border-glass-border flex flex-col shadow-2xl overflow-hidden ${
              isPinned
                ? "relative h-full w-80 shrink-0 z-0"
                : "fixed top-0 left-0 bottom-0 w-80 z-(--z-drawer)"
            }`}
          >
            {drawerBody}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
