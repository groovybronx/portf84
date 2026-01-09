import React from 'react';
import { SettingsModal } from '../../shared/components';
import {
  CollectionManager,
  CreateFolderModal,
  MoveToFolderModal,
} from '../../features/collections';
import { AddTagModal, BatchTagPanel, TagChanges } from '../../features/tags';
import { PortfolioItem } from '../../shared/types';
import { OverlayKey } from '@/shared/hooks/useModalState';

export interface AppModalsProps {
  overlayState: Record<OverlayKey, boolean>;
  setOverlay: (key: OverlayKey, open: boolean) => void;
  collections: any[];
  activeCollection: any;
  createCollection: (name: string) => Promise<void>;
  switchCollection: (id: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  createVirtualFolder: (name: string) => string;
  folders: any[];
  moveItemToFolder: (targetId: string) => void;
  createFolderAndMove: (name: string) => void;
  selectedIds: Set<string>;
  availableTags: string[];
  addTagsToSelection: (tag: string) => void;
  batchSelectedItems: PortfolioItem[];
  libraryUpdateItems: (items: PortfolioItem[]) => void;
  clearSelection: () => void;
  useCinematicCarousel: boolean;
  setCinematicCarousel: (value: boolean) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  overlayState,
  setOverlay,
  collections,
  activeCollection,
  createCollection,
  switchCollection,
  deleteCollection,
  createVirtualFolder,
  folders,
  moveItemToFolder,
  createFolderAndMove,
  selectedIds,
  availableTags,
  addTagsToSelection,
  batchSelectedItems,
  libraryUpdateItems,
  clearSelection,
  useCinematicCarousel,
  setCinematicCarousel,
}) => {
  const closeOverlay = (key: OverlayKey) => setOverlay(key, false);

  const isCollectionManagerOpen = overlayState.collectionManager;
  const isCreateFolderModalOpen = overlayState.createFolderModal;
  const isMoveModalOpen = overlayState.moveModal;
  const isAddTagModalOpen = overlayState.addTagModal;
  const isBatchTagPanelOpen = overlayState.batchTagPanel;
  const isSettingsOpen = overlayState.settingsModal;

  return (
    <>
      {/* Collection Manager Modal */}
      <CollectionManager
        isOpen={isCollectionManagerOpen}
        onClose={() => closeOverlay('collectionManager')}
        collections={collections}
        activeCollection={activeCollection}
        onCreateCollection={async (name) => {
          await createCollection(name);
          closeOverlay('collectionManager');
        }}
        onSwitchCollection={async (id) => {
          await switchCollection(id);
          closeOverlay('collectionManager');
        }}
        onDeleteCollection={deleteCollection}
      />

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => closeOverlay('createFolderModal')}
        onCreate={createVirtualFolder}
      />
      <MoveToFolderModal
        isOpen={isMoveModalOpen}
        onClose={() => closeOverlay('moveModal')}
        folders={folders}
        onMove={moveItemToFolder}
        onCreateAndMove={createFolderAndMove}
        selectedCount={selectedIds.size}
      />
      {/* AddTagModal - Simple Quick Add */}
      <AddTagModal
        isOpen={isAddTagModalOpen && !isBatchTagPanelOpen}
        onClose={() => closeOverlay('addTagModal')}
        selectedCount={selectedIds.size}
        availableTags={availableTags}
        onAddTag={(tag) => {
          addTagsToSelection(tag);
        }}
      />

      {/* BatchTagPanel - Advanced Multi-Tag Interface */}
      <BatchTagPanel
        isOpen={isBatchTagPanelOpen}
        onClose={() => closeOverlay('batchTagPanel')}
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
          closeOverlay('batchTagPanel');
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => closeOverlay('settingsModal')}
        useCinematicCarousel={useCinematicCarousel}
        onToggleCinematicCarousel={setCinematicCarousel}
      />
    </>
  );
};
