import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, MainLayout } from "./features/layout";
import { AppOverlays, AppModals } from "./features/overlays";
import { TopBar } from "./features/navigation";
import { ViewRenderer } from "./features/library/components/ViewRenderer";
import { ImageViewer, analyzeImage } from "./features/vision";
import {
  FolderDrawer,
  CollectionManager,
  CreateFolderModal,
  MoveToFolderModal,
} from "./features/collections";
import { AddTagModal, BatchTagPanel, TagChanges } from "./features/tags";
import {
  ContextMenu,
  EmptyState,
  SettingsModal,
  UnifiedProgress,
  ErrorBoundary,
  KeyboardShortcutsHelp,
} from "./shared/components";
import { TagHub } from "./features/tags/components/TagHub";
import { open } from "@tauri-apps/plugin-dialog";


import { PortfolioItem, ViewMode, COLOR_PALETTE } from "./shared/types";
import { AnimatePresence, motion } from "framer-motion";

// Contexts
import { useCollections } from "./shared/contexts/CollectionsContext";
import { useLibrary } from "./shared/contexts/LibraryContext";
import { useSelection } from "./shared/contexts/SelectionContext";
import {
  useBatchAI,
  useKeyboardShortcuts,
  useModalState,
  useItemActions,
  useAppHandlers,
  useSidebarLogic,
} from "./shared/hooks";
import { storageService } from "./services/storageService";

import { LoadingOverlay } from "./shared/components/LoadingOverlay";

const App: React.FC = () => {
  const { t } = useTranslation(["library", "common"]);
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
    activeTags,
    setActiveTags,
    toggleTag,
    clearTags,
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
    refreshMetadata,
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
    isSmartCollectionBuilderOpen,
    setIsSmartCollectionBuilderOpen,
    isTagHubOpen,
    setIsTagHubOpen,
    tagHubActiveTab,
    setTagHubActiveTab,
    isBatchTagPanelOpen,
    setIsBatchTagPanelOpen,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
  } = useModalState();

  // --- Custom Hooks for Sidebar Logic ---
  const {
    isSidebarPinned,
    setIsSidebarPinned,
    handleSidebarToggle,
    handleSidebarClose,
  } = useSidebarLogic({
    initialPinned: false,
    onFolderDrawerOpen: () => setIsFolderDrawerOpen(true),
    onFolderDrawerClose: () => {
      setIsFolderDrawerOpen(false);
      setIsSidebarPinned(false);
    },
  });

  const [showColorTags, setShowColorTags] = useState(true);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: PortfolioItem;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Memoize the selected items for batch operations to avoid duplication
  const batchSelectedItems = useMemo(() => {
    if (selectedIds.size > 0) {
      return currentItems.filter((item) => selectedIds.has(item.id));
    }
    if (contextMenu?.item) {
      return [contextMenu.item];
    }
    return [];
  }, [selectedIds, currentItems, contextMenu]);

  // --- Custom Hooks for Actions ---
  const contextMenuItem = contextMenu?.item || null;
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

  // --- Custom Hooks for Handlers ---
  const {
    handleDirectoryPicker,
    handleShareSelected,
    handleRunBatchAI,
    handleNext,
    handlePrev,
    toggleColorTags,
  } = useAppHandlers({
    t,
    activeCollection,
    setIsCollectionManagerOpen,
    sourceFolders,
    addSourceFolder,
    loadFromPath,
    processedItems,
    addToQueue,
    selectedItem,
    setIsFolderDrawerOpen,
    setIsSidebarPinned,
    setIsMoveModalOpen,
    setIsSettingsOpen,
    setIsTagHubOpen,
    setIsBatchTagPanelOpen,
    showColorTags,
    setShowColorTags,
  });

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    processedItems,
    focusedId,
    setFocusedId,
    setSelectedItem,
    applyColorTagToSelection,
    gridColumns,
    onOpenBatchTagPanel: () => {
      // Only open if items are selected
      if (selectedIds.size > 0) {
        setIsBatchTagPanelOpen(true);
      }
    },
  });

  // Tag Hub keyboard shortcut (Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsTagHubOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsTagHubOpen]);

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

  // Sync selectedItem with library updates (e.g. after tag merge)
  useEffect(() => {
    if (selectedItem) {
      // Find the updated version of the selected item in the folders
      const allItems = folders.flatMap(f => f.items);
      const freshItem = allItems.find(i => i.id === selectedItem.id);

      // Update if reference changed (implies data update)
      if (freshItem && freshItem !== selectedItem) {
        console.log("[App] Syncing selectedItem with library update");
        setSelectedItem(freshItem);
      }
    }
  }, [folders, selectedItem]);

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
      <LoadingOverlay isVisible={collectionsLoading} />

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
            onOpenFolders={handleSidebarToggle}
            onMoveSelected={() => setIsMoveModalOpen(true)}
            onShareSelected={handleShareSelected}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTagHub={() => setIsTagHubOpen(true)}
            onOpenBatchTagPanel={() => setIsBatchTagPanelOpen(true)}
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
            collections={collections}
            onSwitchCollection={switchCollection}
            onManageCollections={() => setIsCollectionManagerOpen(true)}
            onRemoveSourceFolder={async (path) => {
              await removeSourceFolder(path);
              clearLibrary();

              // Reload remaining folders
              if (activeCollection && sourceFolders.length > 0) {
                const remainingFolders = sourceFolders.filter(sf => sf.path !== path);
                for (const folder of remainingFolders) {
                  await loadFromPath(folder.path);
                }
              }
            }}
            isPinned={isSidebarPinned}
            onTogglePin={() => {
              const newPinned = !isSidebarPinned;
              setIsSidebarPinned(newPinned);
              // When unpinning, hide everything for a clean exit
              setIsFolderDrawerOpen(false);
            }}
            activeColorFilter={activeColorFilter}
            onColorFilterChange={setActiveColorFilter}


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
                      ? t('library:openDrawerToCreate')
                      : t('library:noItemsAddSource')}
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
                onTagClick={toggleTag}
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

      {/* Overlays */}
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

      {/* Modals */}
      <AppModals
        isCollectionManagerOpen={isCollectionManagerOpen}
        setIsCollectionManagerOpen={setIsCollectionManagerOpen}
        collections={collections}
        activeCollection={activeCollection}
        createCollection={createCollection}
        switchCollection={switchCollection}
        deleteCollection={deleteCollection}
        isCreateFolderModalOpen={isCreateFolderModalOpen}
        setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
        createVirtualFolder={createVirtualFolder}
        isMoveModalOpen={isMoveModalOpen}
        setIsMoveModalOpen={setIsMoveModalOpen}
        folders={folders}
        moveItemToFolder={moveItemToFolder}
        createFolderAndMove={createFolderAndMove}
        selectedIds={selectedIds}
        isAddTagModalOpen={isAddTagModalOpen}
        setIsAddTagModalOpen={setIsAddTagModalOpen}
        availableTags={availableTags}
        addTagsToSelection={addTagsToSelection}
        isBatchTagPanelOpen={isBatchTagPanelOpen}
        setIsBatchTagPanelOpen={setIsBatchTagPanelOpen}
        batchSelectedItems={batchSelectedItems}
        libraryUpdateItems={libraryUpdateItems}
        clearSelection={clearSelection}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        useCinematicCarousel={useCinematicCarousel}
        setCinematicCarousel={setCinematicCarousel}
      />

      {/* Tag Hub */}
      <TagHub
        isOpen={isTagHubOpen}
        onClose={() => setIsTagHubOpen(false)}
        activeTab={tagHubActiveTab}
        onTabChange={setTagHubActiveTab}
        onTagsUpdated={async () => {
          console.log("[App] Tags updated from Tag Hub, refreshing library...");
          console.log("[App] Tags updated from Tag Hub, refreshing library...");
          await refreshMetadata();
        }}
        onSelectTag={(tag) => {
            toggleTag(tag);
            // Don't close hub on multi-select, or maybe user wants to?
            // Requirement says "select multiple tags", so probably keep open or let user decide.
            // For now, let's keep it open to allow multi-selection.
            // setIsTagHubOpen(false);
        }}
      />





      <UnifiedProgress />
    </div>
  );
};

export default App;
