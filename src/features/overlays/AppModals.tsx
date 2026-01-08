import React from "react";
import { SettingsModal } from "../../shared/components";
import {
  CollectionManager,
  CreateFolderModal,
  MoveToFolderModal,
} from "../../features/collections";
import { AddTagModal, BatchTagPanel, TagChanges } from "../../features/tags";
import { PortfolioItem } from "../../shared/types";

interface AppModalsProps {
  isCollectionManagerOpen: boolean;
  setIsCollectionManagerOpen: (open: boolean) => void;
  collections: any[];
  activeCollection: any;
  createCollection: (name: string) => Promise<void>;
  switchCollection: (id: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  isCreateFolderModalOpen: boolean;
  setIsCreateFolderModalOpen: (open: boolean) => void;
  createVirtualFolder: (name: string) => string;
  isMoveModalOpen: boolean;
  setIsMoveModalOpen: (open: boolean) => void;
  folders: any[];
  moveItemToFolder: (targetId: string) => void;
  createFolderAndMove: (name: string) => void;
  selectedIds: Set<string>;
  isAddTagModalOpen: boolean;
  setIsAddTagModalOpen: (open: boolean) => void;
  availableTags: string[];
  addTagsToSelection: (tag: string) => void;
  isBatchTagPanelOpen: boolean;
  setIsBatchTagPanelOpen: (open: boolean) => void;
  batchSelectedItems: PortfolioItem[];
  libraryUpdateItems: (items: PortfolioItem[]) => void;
  clearSelection: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  useCinematicCarousel: boolean;
  setCinematicCarousel: (value: boolean) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  isCollectionManagerOpen,
  setIsCollectionManagerOpen,
  collections,
  activeCollection,
  createCollection,
  switchCollection,
  deleteCollection,
  isCreateFolderModalOpen,
  setIsCreateFolderModalOpen,
  createVirtualFolder,
  isMoveModalOpen,
  setIsMoveModalOpen,
  folders,
  moveItemToFolder,
  createFolderAndMove,
  selectedIds,
  isAddTagModalOpen,
  setIsAddTagModalOpen,
  availableTags,
  addTagsToSelection,
  isBatchTagPanelOpen,
  setIsBatchTagPanelOpen,
  batchSelectedItems,
  libraryUpdateItems,
  clearSelection,
  isSettingsOpen,
  setIsSettingsOpen,
  useCinematicCarousel,
  setCinematicCarousel,
}) => {
  return (
    <>
      {/* Collection Manager Modal */}
      <CollectionManager
        isOpen={isCollectionManagerOpen}
        onClose={() => setIsCollectionManagerOpen(false)}
        collections={collections}
        activeCollection={activeCollection}
        onCreateCollection={async (name) => {
          await createCollection(name);
          setIsCollectionManagerOpen(false);
        }}
        onSwitchCollection={async (id) => {
          await switchCollection(id);
          setIsCollectionManagerOpen(false);
        }}
        onDeleteCollection={deleteCollection}
      />

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={createVirtualFolder}
      />
      <MoveToFolderModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        folders={folders}
        onMove={moveItemToFolder}
        onCreateAndMove={createFolderAndMove}
        selectedCount={selectedIds.size}
      />
      {/* AddTagModal - Simple Quick Add */}
      <AddTagModal
        isOpen={isAddTagModalOpen && !isBatchTagPanelOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        selectedCount={selectedIds.size}
        availableTags={availableTags}
        onAddTag={(tag) => {
          addTagsToSelection(tag);
        }}
      />

      {/* BatchTagPanel - Advanced Multi-Tag Interface */}
      <BatchTagPanel
        isOpen={isBatchTagPanelOpen}
        onClose={() => setIsBatchTagPanelOpen(false)}
        selectedItems={batchSelectedItems}
        availableTags={availableTags}
        onApplyChanges={(changes: TagChanges) => {
          // Apply batch changes
          const updatedItems = batchSelectedItems.map((item) => {
            const currentTags = new Set(item.manualTags || []);

            // Remove tags
            changes.remove.forEach((tag) => currentTags.delete(tag));

            // Add tags
            changes.add.forEach((tag) => currentTags.add(tag));

            return {
              ...item,
              manualTags: Array.from(currentTags),
            };
          });

          libraryUpdateItems(updatedItems);
          clearSelection();
          setIsBatchTagPanelOpen(false);
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        useCinematicCarousel={useCinematicCarousel}
        onToggleCinematicCarousel={setCinematicCarousel}
      />
    </>
  );
};
