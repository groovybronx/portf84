import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { TopBar } from './components/TopBar';
import { PhotoGrid } from './components/PhotoGrid';
import { PhotoCarousel } from './components/PhotoCarousel';
import { PhotoList } from './components/PhotoList';
import { ImageViewer } from './components/ImageViewer';
import { FolderDrawer } from './components/FolderDrawer';
import { ContextMenu } from './components/ContextMenu';
import { CreateFolderModal, MoveToFolderModal } from './components/ActionModals';
import { AddTagModal } from "./components/AddTagModal";
import { SettingsModal } from "./components/SettingsModal";
import { UnifiedProgress } from "./components/UnifiedProgress";
import { open } from "@tauri-apps/plugin-dialog";

import { PortfolioItem, ViewMode, COLOR_PALETTE } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { analyzeImage } from "./services/geminiService";

// Hooks
import { useLibrary } from "./hooks/useLibrary";
import { useViewOptions } from "./hooks/useViewOptions";
import { useSelection } from "./hooks/useSelection";
import { useBatchAI } from "./hooks/useBatchAI";

const App: React.FC = () => {
  // --- 0. Local State (Moved up for dependencies) ---
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<PortfolioItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Library & Data Layer ---
  const {
    folders,
    activeFolderIds,
    hasStoredSession,
    loadFromPath,
    restoreSession,

    setLibraryRoot,
    importFiles,
    updateItem: libraryUpdateItem,
    createFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder,
  } = useLibrary();

  // Wrapper to keep selectedItem in sync with library updates
  const updateItem = (item: PortfolioItem) => {
    libraryUpdateItem(item);
    // If the modified item is the one currently open, update local state immediately
    setSelectedItem((prev) => (prev && prev.id === item.id ? item : prev));
  };

  // --- 2. View & Filter Layer ---
  const {
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
  } = useViewOptions({ folders, activeFolderIds });

  // --- 3. Selection & Drag Layer ---
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
  } = useSelection(viewMode, processedItems);

  // --- 4. AI Layer ---
  const { isBatchProcessing, batchProgress, addToQueue } =
    useBatchAI(updateItem);

  // --- 5. Layout State (Modals, Menus) ---
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: PortfolioItem;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Tagging Logic (Phase 8)
  const handleAddTagsToSelection = async (newTag: string) => {
    let itemsToUpdate: PortfolioItem[] = [];

    // Determine target items (Selection > Focused > ContextMenuTarget)
    if (selectedIds.size > 0) {
      itemsToUpdate = currentItems.filter((i) => selectedIds.has(i.id));
    } else if (contextMenu?.item) {
      itemsToUpdate = [contextMenu.item];
    }

    if (itemsToUpdate.length === 0) return;

    for (const item of itemsToUpdate) {
      const currentTags = item.manualTags || [];
      if (!currentTags.includes(newTag)) {
        const updatedItem = {
          ...item,
          manualTags: [...currentTags, newTag],
        };
        // Use existing update logic (handles persistence via useLibrary -> storageService)
        updateItem(updatedItem);
      }
    }
  };

  // --- Effects & Helpers ---

  // Keyboard Shortcuts (Global)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Color Tagging Shortcuts
      if (/^[1-6]$/.test(e.key)) {
        const color = COLOR_PALETTE[e.key];
        if (color) applyColorTagToSelection(color);
      } else if (e.key === "0") {
        applyColorTagToSelection(undefined);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, selectionMode, selectedIds, focusedId, hoveredItem]);

  // Auto-restore session when detected
  useEffect(() => {
    if (hasStoredSession && folders.length === 0) {
      restoreSession();
    }
  }, [hasStoredSession, folders.length]);

  // Apply color to Focused/Selected items
  const applyColorTagToSelection = (color: string | undefined) => {
    let itemsToUpdate: PortfolioItem[] = [];

    if (selectedItem) itemsToUpdate = [selectedItem];
    else if (selectionMode && selectedIds.size > 0)
      itemsToUpdate = currentItems.filter((i) => selectedIds.has(i.id));
    else if (focusedId) {
      const item = currentItems.find((i) => i.id === focusedId);
      if (item) itemsToUpdate = [item];
    }

    itemsToUpdate.forEach((item) => updateItem({ ...item, colorTag: color }));
  };

  const handleTopBarColorAction = (color: string | null) => {
    if (selectionMode && selectedIds.size > 0)
      applyColorTagToSelection(color || undefined);
    else setActiveColorFilter(color);
  };

  const handleDirectoryPicker = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Photo Folder",
      });
      if (selected && typeof selected === "string") {
        await loadFromPath(selected);
      }
    } catch (e) {
      console.log("Cancelled", e);
    }
  };

  const handleSetRoot = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Root Library Folder",
      });
      if (selected && typeof selected === "string") {
        await setLibraryRoot(selected);
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

  // Folder Actions Wrapper
  const handleMoveAction = (targetId: string) => {
    moveItemsToFolder(selectedIds, targetId, currentItems);
    clearSelection();
    setIsMoveModalOpen(false);
  };

  const handleCreateAndMove = (name: string) => {
    const newId = createFolder(name);
    moveItemsToFolder(selectedIds, newId, currentItems);
    clearSelection();
    setIsMoveModalOpen(false);
  };

  // Navigation
  const handleNext = () => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx !== -1 && idx < processedItems.length - 1)
      setSelectedItem(processedItems[idx + 1]);
  };
  const handlePrev = () => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx > 0) setSelectedItem(processedItems[idx - 1]);
  };

  const handleContextAnalyze = async (item: PortfolioItem) => {
    try {
      const res = await analyzeImage(item);
      updateItem({
        ...item,
        aiDescription: res.description,
        aiTags: res.tags,
        aiTagsDetailed: res.tagsDetailed,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleContextMove = (item: PortfolioItem) => {
    if (!selectedIds.has(item.id)) {
      clearSelection();
      setSelectedIds(new Set([item.id]));
    }
    setIsMoveModalOpen(true);
  };

  // --- RENDER ---

  const renderView = () => {
    const commonProps = {
      onSelect: setSelectedItem,
      selectionMode,
      selectedIds,
      onToggleSelect: toggleSelection,
      showColorTags: true,
      registerItemRef,
      onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
      },
      onTagClick: setSelectedTag,
      selectedTag,
    };

    switch (viewMode) {
      case ViewMode.GRID:
        return (
          <PhotoGrid
            items={processedItems}
            {...commonProps}
            onHover={(i) => {
              setHoveredItem(i);
              if (i) setFocusedId(i.id);
            }}
            focusedId={focusedId}
            onFocusChange={setFocusedId}
            columns={gridColumns}
          />
        );
      case ViewMode.CAROUSEL:
        return (
          <PhotoCarousel
            items={processedItems}
            onSelect={setSelectedItem}
            showColorTags={true}
            onFocusedItem={(i) => setFocusedId(i.id)}
          />
        );
      case ViewMode.LIST:
        return (
          <PhotoList
            items={processedItems}
            {...commonProps}
            onHover={setHoveredItem}
          />
        );
      default:
        return null;
    }
  };

  const activeFolderName = activeFolderIds.has("all")
    ? "All Photos"
    : activeFolderIds.size === 1
    ? folders.find((f) => f.id === Array.from(activeFolderIds)[0])?.name
    : "Collection";

  return (
    <div
      className="min-h-screen bg-background text-white selection:bg-blue-500/30"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Drag Selection Box */}
      {isDragSelecting && dragBox && (
        <div
          className="fixed border border-blue-500 bg-blue-500/20 z-(--z-controlbar) pointer-events-none"
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

      {folders.length === 0 ? (
        <UploadZone
          onFilesSelected={importFiles}
          onDirectoryPicker={handleDirectoryPicker}
          onSetRoot={handleSetRoot}
          hasStoredSession={hasStoredSession}
          onRestoreSession={restoreSession}
        />
      ) : (
        <>
          <div className="top-bar-area relative z-(--z-topbar)">
            <TopBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOption={sortOption}
              sortDirection={sortDirection}
              onSortChange={setSortOption}
              onSortDirectionChange={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              selectedTag={selectedTag}
              availableTags={availableTags}
              onTagSelect={setSelectedTag}
              selectionMode={selectionMode}
              onToggleSelectionMode={() => {
                if (selectionMode) clearSelection();
                else setSelectionMode(true);
              }}
              showColorTags={true}
              onToggleColorTags={() => {}}
              activeColorFilter={activeColorFilter}
              onColorAction={handleTopBarColorAction}
              currentViewMode={viewMode}
              onModeChange={setViewMode}
              gridColumns={gridColumns}
              onGridColumnsChange={setGridColumns}
              folderName={activeFolderName}
              onOpenFolders={() => setIsFolderDrawerOpen(true)}
              selectedCount={selectedIds.size}
              onMoveSelected={() => setIsMoveModalOpen(true)}
              onShareSelected={async () => {
                /* Share Logic */
              }}
              onRunBatchAI={handleRunBatchAI}
              isBatchAIProcessing={isBatchProcessing}
              batchAIProgress={batchProgress}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>

          <div className="drawer-area relative z-(--z-drawer-overlay)">
            <FolderDrawer
              isOpen={isFolderDrawerOpen}
              onClose={() => setIsFolderDrawerOpen(false)}
              folders={folders}
              activeFolderId={activeFolderIds}
              onSelectFolder={toggleFolderSelection}
              onImportFolder={() => {
                if ("showDirectoryPicker" in window) handleDirectoryPicker();
                else fileInputRef.current?.click();
              }}
              onCreateFolder={() => setIsCreateFolderModalOpen(true)}
              onDeleteFolder={deleteFolder}
            />
          </div>

          <main className="relative z-(--z-grid-item)">
            <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
          </main>

          <AnimatePresence>
            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                item={contextMenu.item}
                onClose={() => setContextMenu(null)}
                onAnalyze={handleContextAnalyze}
                onDelete={
                  (id) =>
                    updateItem({
                      ...contextMenu.item,
                      folderId: "trash",
                    }) /* Pseudo delete */
                }
                onColorTag={(item, color) =>
                  updateItem({ ...item, colorTag: color })
                }
                onAddTags={(item) => {
                  // If no selection, ensure we operate on the clicked item naturally
                  // logic inside Modal handler will check selection or context item
                  if (selectedIds.size <= 1) {
                    // Optional: could force select the context item here if desired
                    // keeping implementation flexible
                  }
                  setIsAddTagModalOpen(true);
                }}
                onOpen={setSelectedItem}
                onMove={handleContextMove}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedItem && (
              <ImageViewer
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onUpdateItem={updateItem}
                onNext={handleNext}
                onPrev={handlePrev}
                showColorTags={true}
                availableTags={availableTags}
              />
            )}
          </AnimatePresence>

          <CreateFolderModal
            isOpen={isCreateFolderModalOpen}
            onClose={() => setIsCreateFolderModalOpen(false)}
            onCreate={createFolder}
          />
          <MoveToFolderModal
            isOpen={isMoveModalOpen}
            onClose={() => setIsMoveModalOpen(false)}
            folders={folders}
            onMove={handleMoveAction}
            onCreateAndMove={handleCreateAndMove}
            selectedCount={selectedIds.size}
          />
          <AddTagModal
            isOpen={isAddTagModalOpen}
            onClose={() => setIsAddTagModalOpen(false)}
            onAddTag={handleAddTagsToSelection}
            selectedCount={selectedIds.size > 0 ? selectedIds.size : 1}
            availableTags={availableTags}
          />
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </>
      )}

      <UnifiedProgress />
    </div>
  );
};

export default App;