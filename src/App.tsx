import React, { useState, useRef, useEffect } from "react";
import { TopBar } from "./features/navigation";
import { ViewRenderer } from "./features/library/components/ViewRenderer";
import { ImageViewer, analyzeImage } from "./features/vision";
import {
  FolderDrawer,
  CollectionManager,
  CreateFolderModal,
  MoveToFolderModal,
} from "./features/collections";
import { AddTagModal } from "./features/tags";
import {
  ContextMenu,
  EmptyState,
  SettingsModal,
  UnifiedProgress,
  ErrorBoundary,
} from "./shared/components";
import { open } from "@tauri-apps/plugin-dialog";

import { PortfolioItem, ViewMode, COLOR_PALETTE } from "./shared/types";
import { AnimatePresence, motion } from "framer-motion";

// Contexts
import { useCollections } from "./contexts/CollectionsContext";
import { useLibrary } from "./contexts/LibraryContext";
import { useSelection } from "./contexts/SelectionContext";
import {
  useBatchAI,
  useKeyboardShortcuts,
  useModalState,
  useItemActions,
} from "./shared/hooks";
import { storageService } from "./services/storageService";

const App: React.FC = () => {
  // --- 0. Local State (Moved up for dependencies) ---
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<PortfolioItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Context Consumption ---
  const {
    collections,
    activeCollection,
    sourceFolders,
    isLoading: collectionsLoading,
    createCollection,
    switchCollection,
    deleteCollection,
    addSourceFolder,
    removeSourceFolder,
  } = useCollections();

  const {
    folders,
    activeFolderIds,
    loadFromPath,
    importFiles,
    updateItem: libraryUpdateItem,
    updateItems: libraryUpdateItems,
    createFolder: createVirtualFolder,
    deleteFolder,
    removeFolderByPath,
    toggleFolderSelection,
    moveItemsToFolder,
    clearLibrary,
    viewMode,
    setViewMode,
    gridColumns,
    setGridColumns,
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    activeColorFilter,
    setActiveColorFilter,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    availableTags,
    processedItems,
    currentItems,
    autoAnalyzeEnabled,
    useCinematicCarousel,
    setCinematicCarousel,
  } = useLibrary();

  const {
    selectionMode,
    setSelectionMode,
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearSelection,
    isDragSelecting,
    dragBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    registerItemRef,
  } = useSelection();

  // Wrapper to keep selectedItem in sync with library updates
  const updateItems = (items: PortfolioItem[]) => {
    libraryUpdateItems(items);
    // If our selected item is in the batch, update it too
    setSelectedItem((prev) => {
      if (!prev) return null;
      const updated = items.find((i) => i.id === prev.id);
      return updated || prev;
    });
  };

  const updateItem = (item: PortfolioItem) => {
    updateItems([item]);
  };

  // --- 4. AI Layer ---
  const { isBatchProcessing, batchProgress, addToQueue } =
    useBatchAI(updateItem);

  // --- 5. Layout State (Modals, Menus) ---
  const {
    isFolderDrawerOpen,
    setIsFolderDrawerOpen,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isMoveModalOpen,
    setIsMoveModalOpen,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isCollectionManagerOpen,
    setIsCollectionManagerOpen,
  } = useModalState();
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [showColorTags, setShowColorTags] = useState(true);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: PortfolioItem;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // --- Custom Hooks for Actions ---
  const {
    addTagsToSelection,
    applyColorTagToSelection,
    analyzeItem,
    moveItemToFolder,
    createFolderAndMove,
    handleContextMove,
    handleContextAddTag,
  } = useItemActions({
    currentItems,
    selectedIds,
    selectedItem,
    focusedId,
    selectionMode,
    contextMenuItem: contextMenu?.item || null,
    updateItems,
    updateItem,
    clearSelection,
    setSelectedIds,
    createVirtualFolder,
    moveItemsToFolder,
    setIsMoveModalOpen,
    setIsAddTagModalOpen,
    activeCollection,
  });

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    processedItems,
    focusedId,
    setFocusedId,
    setSelectedItem,
    applyColorTagToSelection,
    gridColumns,
  });

  // Helper functions
  const toggleColorTags = () => setShowColorTags(!showColorTags);
  const handleShareSelected = async () => {
    // Share logic placeholder
    console.log("Share selected items:", selectedIds);
  };

  const handleTopBarColorAction = (color: string | null) => {
    if (selectedIds.size > 0)
      applyColorTagToSelection(color || undefined);
    else setActiveColorFilter(color);
  };

  // Clear library and reload when collection changes
  useEffect(() => {
    const loadCollectionData = async () => {
      if (!collectionsLoading && activeCollection) {
        console.log("[App] Collection changed, clearing and reloading library");
        clearLibrary();

        // Load shadow folders (auto-created for each source folder)
        const shadowPairs = await storageService.getShadowFoldersWithSources(
          activeCollection.id
        );

        console.log(`[App] Found ${shadowPairs.length} shadow folders to load`);

        // Load each shadow folder's source path
        shadowPairs.forEach(({ shadowFolder, sourceFolder }) => {
          console.log(
            `[App] Loading shadow folder "${shadowFolder.name}" from source: ${sourceFolder.path}`
          );
          loadFromPath(sourceFolder.path);
        });
      }
    };

    loadCollectionData();
  }, [activeCollection?.id, collectionsLoading]); // Removed sourceFolders dependency

  // ...

  const handleDirectoryPicker = async () => {
    try {
      if (!activeCollection) {
        alert("Veuillez d'abord créer ou sélectionner un Projet");
        setIsCollectionManagerOpen(true);
        return;
      }

      const selected = await open({
        directory: true,
        multiple: false,
        title: "Sélectionner un Dossier Source",
      });
      if (selected && typeof selected === "string") {
        await addSourceFolder(selected);
        await loadFromPath(selected);
      }
    } catch (e) {
      console.log("Cancelled", e);
    }
  };

  // Batch AI
  const handleRunBatchAI = () => {
    const itemsToProcess = processedItems.filter((item) => !item.aiDescription);
    if (itemsToProcess.length === 0)
      return alert("No unanalyzed items in view.");
    if (confirm(`Start AI analysis for ${itemsToProcess.length} items?`)) {
      addToQueue(itemsToProcess);
    }
  };

  // Navigation
  const handleNext = () => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx !== -1 && idx < processedItems.length - 1) {
      const nextItem = processedItems[idx + 1];
      if (nextItem) setSelectedItem(nextItem);
    }
  };
  const handlePrev = () => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx > 0) {
      const prevItem = processedItems[idx - 1];
      if (prevItem) setSelectedItem(prevItem);
    }
  };

  const activeFolderName = activeFolderIds.has("all")
    ? "Library"
    : activeFolderIds.size === 1
    ? folders.find((f) => f.id === Array.from(activeFolderIds)[0])?.name
    : "Collection";

  return (
    <div
      className="main-app bg-surface h-screen overflow-hidden flex flex-col"
      onMouseDown={(e) => handleMouseDown(e, viewMode, processedItems)}
      onMouseMove={(e) => handleMouseMove(e, processedItems)}
      onMouseUp={handleMouseUp}
    >
      {/* Drag Selection Box */}
      {isDragSelecting && dragBox && (
        <div
          className="fixed border-2 border-blue-500 bg-blue-500/30 z-(--z-controlbar) pointer-events-none"
          style={{
            left: dragBox.x,
            top: dragBox.y,
            width: dragBox.w,
            height: dragBox.h,
          }}
        />
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        {...({ webkitdirectory: "", directory: "" } as any)}
        onChange={(e) => e.target.files && importFiles(e.target.files)}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-(--z-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

      {/* TopBar - Always visible */}
      <ErrorBoundary featureName="navigation">
        <div className="top-bar-area relative z-(--z-topbar)">
          <TopBar
            folderName={activeFolderName}
            isSidebarPinned={isSidebarPinned}
            onOpenFolders={() => {
              // Priority toggle logic:
              // 1. If pinned, unpin and hide.
              // 2. If drawer open, close it.
              // 3. Otherwise open drawer.
              if (isSidebarPinned) {
                setIsSidebarPinned(false);
                setIsFolderDrawerOpen(false);
              } else {
                setIsFolderDrawerOpen(!isFolderDrawerOpen);
              }
            }}
            onMoveSelected={() => setIsMoveModalOpen(true)}
            onShareSelected={handleShareSelected}
            onRunBatchAI={handleRunBatchAI}
            isBatchAIProcessing={isBatchProcessing}
            batchAIProgress={batchProgress}
            onOpenSettings={() => setIsSettingsOpen(true)}
            showColorTags={showColorTags}
            onToggleColorTags={toggleColorTags}
          />
        </div>
      </ErrorBoundary>

      {/* App Layout: Sidebar + Main Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Sidebar / Folder Drawer */}
        <ErrorBoundary featureName="collections">
          <FolderDrawer
            isOpen={isFolderDrawerOpen || isSidebarPinned}
            onClose={() => {
              setIsFolderDrawerOpen(false);
              setIsSidebarPinned(false);
            }}
            folders={folders}
            activeFolderId={activeFolderIds}
            onSelectFolder={toggleFolderSelection}
            onImportFolder={handleDirectoryPicker}
            onCreateFolder={() => setIsCreateFolderModalOpen(true)}
            onDeleteFolder={deleteFolder}
            activeCollection={activeCollection}
            sourceFolders={sourceFolders}
            onManageCollections={() => setIsCollectionManagerOpen(true)}
            onRemoveSourceFolder={async (path) => {
              await removeSourceFolder(path);
              removeFolderByPath(path);
            }}
            isPinned={isSidebarPinned}
            onTogglePin={() => {
              const newPinned = !isSidebarPinned;
              setIsSidebarPinned(newPinned);
              // When unpinning, hide everything for a clean exit
              setIsFolderDrawerOpen(false);
            }}
          />
        </ErrorBoundary>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col h-full">
          <ErrorBoundary featureName="library">
            <main className="flex-1 relative z-(--z-grid-item) overflow-y-auto custom-scrollbar h-full">
          {currentItems.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <p className="text-gray-500 text-center">
                {!activeCollection
                  ? "Ouvrez le tiroir (icône en haut à gauche) pour créer une Collection"
                  : "Aucune image. Ajoutez un dossier source depuis le tiroir."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <ViewRenderer
                viewMode={viewMode}
                useCinematicCarousel={useCinematicCarousel}
                currentItems={currentItems}
                selectedItem={selectedItem}
                focusedId={focusedId}
                onSelect={setSelectedItem}
                onHover={setHoveredItem}
                onContextMenu={(e, item) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item });
                }}
                onTagClick={setSelectedTag}
                onFocusChange={setFocusedId}
                folders={folders}
                collections={collections}
              />
            </AnimatePresence>
          )}
            </main>
          </ErrorBoundary>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onClose={() => setContextMenu(null)}
            onAnalyze={analyzeItem}
            onDelete={
              (id) =>
                updateItem({
                  ...contextMenu.item,
                  folderId: "trash",
                }) /* Pseudo delete */
            }
            onColorTag={(item, color) => {
              // If item not in selection, it becomes the selection
              if (!selectedIds.has(item.id)) {
                clearSelection();
                setSelectedIds(new Set([item.id]));
              }
              applyColorTagToSelection(color);
            }}
            onAddTags={handleContextAddTag}
            onOpen={setSelectedItem}
            onMove={handleContextMove}
          />
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      <AnimatePresence>
        {selectedItem && (
          <ErrorBoundary featureName="vision">
            <ImageViewer
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onUpdateItem={updateItem}
              onNext={handleNext}
              onPrev={handlePrev}
              showColorTags={true}
              availableTags={availableTags}
            />
          </ErrorBoundary>
        )}
      </AnimatePresence>

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
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onAddTag={addTagsToSelection}
        selectedCount={selectedIds.size > 0 ? selectedIds.size : 1}
        availableTags={availableTags}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        useCinematicCarousel={useCinematicCarousel}
        onToggleCinematicCarousel={setCinematicCarousel}
      />

      <UnifiedProgress />
    </div>
  );
};

export default App;
