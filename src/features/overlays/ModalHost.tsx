import React from 'react';
import { AppOverlays, AppOverlaysProps } from '@/features/overlays/AppOverlays';
import { AppModals, AppModalsProps } from '@/features/overlays/AppModals';

export interface ModalHostProps extends AppOverlaysProps, AppModalsProps {}

export const ModalHost: React.FC<ModalHostProps> = (props) => {
  const {
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
    contextMenu,
    setContextMenu,
    selectedItem,
    setSelectedItem,
    updateItem,
    handleNext,
    handlePrev,
    currentItems,
    analyzeItem,
    handleContextAddTag,
    handleContextMove,
    applyColorTagToSelection,
    isDragSelecting,
    dragBox,
    collectionsLoading,
  } = props;

  return (
    <>
      <AppOverlays
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        updateItem={updateItem}
        handleNext={handleNext}
        handlePrev={handlePrev}
        availableTags={availableTags}
        currentItems={currentItems}
        analyzeItem={analyzeItem}
        handleContextAddTag={handleContextAddTag}
        handleContextMove={handleContextMove}
        applyColorTagToSelection={applyColorTagToSelection}
        isDragSelecting={isDragSelecting}
        dragBox={dragBox}
        collectionsLoading={collectionsLoading}
      />

      <AppModals
        overlayState={overlayState}
        setOverlay={setOverlay}
        collections={collections}
        activeCollection={activeCollection}
        createCollection={createCollection}
        switchCollection={switchCollection}
        deleteCollection={deleteCollection}
        createVirtualFolder={createVirtualFolder}
        folders={folders}
        moveItemToFolder={moveItemToFolder}
        createFolderAndMove={createFolderAndMove}
        selectedIds={selectedIds}
        availableTags={availableTags}
        addTagsToSelection={addTagsToSelection}
        batchSelectedItems={batchSelectedItems}
        libraryUpdateItems={libraryUpdateItems}
        clearSelection={clearSelection}
        useCinematicCarousel={useCinematicCarousel}
        setCinematicCarousel={setCinematicCarousel}
      />
    </>
  );
};
