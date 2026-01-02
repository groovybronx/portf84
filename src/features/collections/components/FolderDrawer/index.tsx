import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../../shared/components/Icon";
import { useTheme } from "../../../../shared/contexts/ThemeContext";
import { Button } from "../../../../shared/components/ui";

import {
  Folder as FolderType,
  Collection,
  SourceFolder,
} from "../../../../shared/types";

import { FolderDrawerHeader } from "./FolderDrawerHeader";
import { ShadowFoldersSection } from "./ShadowFoldersSection";
import { ManualCollectionsSection } from "./ManualCollectionsSection";
import { ColorFiltersSection } from "./ColorFiltersSection";
import { SmartCollectionsSection } from "./SmartCollectionsSection";
import { SmartCollection } from "../../../../services/smartCollectionService";

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
  // Smart Collections
  smartCollections: SmartCollection[];
  activeSmartCollectionId: string | null;
  onSelectSmartCollection: (id: string | null) => void;
  onEditSmartCollection: (collection: SmartCollection) => void;
  onDeleteSmartCollection: (id: string) => void;
  onCreateSmartCollection: () => void;
  onManageTags: () => void;
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
  smartCollections,
  activeSmartCollectionId,
  onSelectSmartCollection,
  onEditSmartCollection,
  onDeleteSmartCollection,
  onCreateSmartCollection,
  onManageTags,
}) => {
  const { t } = useTranslation(["library", "navigation"]);
  const { settings } = useTheme();
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
          <div className="px-1 text-xs font-bold text-quinary uppercase tracking-wider mb-2">
            {t('library:activeProject')}
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
                            className="bg-quinary/10 border border-quinary/30 rounded-xl overflow-hidden mb-4 relative z-10"
                        >
                            {/* Header */}
                            <motion.div layout="position" className="p-3 flex items-center gap-3 border-b border-quinary/20 bg-quinary/5">
                                <div className="p-2 bg-quinary text-white rounded-lg shadow-lg shadow-quinary/20">
                                    <Icon action={settings.quinaryIcon} size={18} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm truncate leading-tight">
                                        {collection.name}
                                    </h3>
                                    <p className="text-[10px] text-quinary/60 uppercase tracking-wider font-medium">
                                        {t('library:activeProjectLabel')}
                                    </p>
                                </div>
                                <Button 
                                    onClick={onManageCollections}
                                    variant="ghost"
                                    size="icon"
                                    className="text-quinary hover:bg-quinary/20"
                                >
                                    <Icon action="settings" size={14} />
                                </Button>
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
                                
                                {/* SMART COLLECTIONS SECTION */}
                                <SmartCollectionsSection
                                    collections={smartCollections}
                                    activeId={activeSmartCollectionId}
                                    onSelect={onSelectSmartCollection}
                                    onEdit={onEditSmartCollection}
                                    onDelete={onDeleteSmartCollection}
                                    onCreate={onCreateSmartCollection}
                                />

                                {/* COLOR TAGS SECTION */}
                                <ColorFiltersSection
                                    folders={folders}
                                    activeColorFilter={activeColorFilter}
                                    onColorFilterChange={onColorFilterChange}
                                    onSelectFolder={onSelectFolder}
                                />

                                {/* MANAGE TAGS BUTTON */}
                                <Button
                                    onClick={onManageTags}
                                    variant="ghost"
                                    className="w-full gap-3 p-2 rounded-lg text-quinary/60 hover:text-white hover:bg-quinary/10 transition-all group justify-start"
                                >
                                    <div className="p-1.5 bg-quinary/10 rounded-md text-quinary group-hover:bg-quinary group-hover:text-white transition-all">
                                        <Icon action="tag" size={14} />
                                    </div>
                                    <span className="text-sm font-medium">{t('library:manageTags')}</span>
                                </Button>
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
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-quinary/60 hover:text-white hover:bg-quinary/10 hover:opacity-100 transition-all group"
                        >
                            <Icon action="next" size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Icon action={settings.quinaryIcon} size={16} className="text-quinary/70 group-hover:text-quinary" />
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
