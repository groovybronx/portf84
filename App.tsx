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
import { PortfolioItem, ViewMode, COLOR_PALETTE } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { analyzeImage } from './services/geminiService';

// Hooks
import { useLibrary } from './hooks/useLibrary';
import { useViewOptions } from './hooks/useViewOptions';
import { useSelection } from './hooks/useSelection';
import { useBatchAI } from './hooks/useBatchAI';

const App: React.FC = () => {
  // --- 1. Library & Data Layer ---
  const {
    folders,
    activeFolderIds,
    hasStoredSession,
    isRestoring,
    restorationProgress,
    loadFromDirectoryHandle,
    restoreSession,
    setLibraryRoot,
    importFiles,
    updateItem,
    createFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder,
  } = useLibrary();

  // --- 2. View & Filter Layer ---
  const {
    viewMode, setViewMode, gridColumns, setGridColumns,
    searchTerm, setSearchTerm, selectedTag, setSelectedTag,
    activeColorFilter, setActiveColorFilter, sortOption, setSortOption,
    sortDirection, setSortDirection, availableTags, processedItems, currentItems
  } = useViewOptions({ folders, activeFolderIds });

  // --- 3. Selection & Drag Layer ---
  const {
    selectionMode, setSelectionMode, selectedIds, setSelectedIds,
    toggleSelection, clearSelection, isDragSelecting, dragBox,
    handleMouseDown, handleMouseMove, handleMouseUp, registerItemRef
  } = useSelection(viewMode, processedItems);

  // --- 4. AI Layer ---
  const { isBatchProcessing, batchProgress, addToQueue } = useBatchAI(updateItem);

  // --- 5. Local UI State (Nav, Modals, Menus) ---
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<PortfolioItem | null>(null);
  
  // Modals
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: PortfolioItem } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects & Helpers ---
  
  // Keyboard Shortcuts (Global)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        
        // Color Tagging Shortcuts
        if (/^[1-6]$/.test(e.key)) {
            const color = COLOR_PALETTE[e.key];
            if (color) applyColorTagToSelection(color);
        } else if (e.key === '0') {
            applyColorTagToSelection(undefined);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, selectionMode, selectedIds, focusedId, hoveredItem]);

  // Apply color to Focused/Selected items
  const applyColorTagToSelection = (color: string | undefined) => {
    let itemsToUpdate: PortfolioItem[] = [];
    
    if (selectedItem) itemsToUpdate = [selectedItem];
    else if (selectionMode && selectedIds.size > 0) itemsToUpdate = currentItems.filter(i => selectedIds.has(i.id));
    else if (focusedId) {
        const item = currentItems.find(i => i.id === focusedId);
        if(item) itemsToUpdate = [item];
    }

    itemsToUpdate.forEach(item => updateItem({ ...item, colorTag: color }));
  };

  const handleTopBarColorAction = (color: string | null) => {
    if (selectionMode && selectedIds.size > 0) applyColorTagToSelection(color || undefined);
    else setActiveColorFilter(color);
  };

  const handleDirectoryPicker = async () => {
    try {
        const handle = await (window as any).showDirectoryPicker();
        await loadFromDirectoryHandle(handle);
    } catch (e) { console.log("Cancelled", e); }
  };

  const handleSetRoot = async () => {
    try {
        const handle = await (window as any).showDirectoryPicker();
        await setLibraryRoot(handle);
    } catch (e) { console.log("Cancelled", e); }
  };

  // Batch AI
  const handleRunBatchAI = () => {
    const itemsToProcess = processedItems.filter(item => !item.aiDescription);
    if (itemsToProcess.length === 0) return alert("No unanalyzed items in view.");
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
      const idx = processedItems.findIndex(i => i.id === selectedItem.id);
      if (idx !== -1 && idx < processedItems.length - 1) setSelectedItem(processedItems[idx + 1]);
  };
  const handlePrev = () => {
      if (!selectedItem) return;
      const idx = processedItems.findIndex(i => i.id === selectedItem.id);
      if (idx > 0) setSelectedItem(processedItems[idx - 1]);
  };

  const handleContextAnalyze = async (item: PortfolioItem) => {
    try {
        const res = await analyzeImage(item);
        updateItem({ ...item, aiDescription: res.description, aiTags: res.tags, aiTagsDetailed: res.tagsDetailed });
    } catch (e) { console.error(e); }
  };

  // --- RENDER ---

  const renderView = () => {
    const commonProps = {
        onSelect: setSelectedItem,
        selectionMode, selectedIds,
        onToggleSelect: toggleSelection,
        showColorTags: true,
        registerItemRef,
        onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, item });
        }
    };

    switch (viewMode) {
      case ViewMode.GRID:
        return <PhotoGrid items={processedItems} {...commonProps} onHover={(i) => {setHoveredItem(i); if(i) setFocusedId(i.id);}} focusedId={focusedId} onFocusChange={setFocusedId} columns={gridColumns} />;
      case ViewMode.CAROUSEL:
        return <PhotoCarousel items={processedItems} onSelect={setSelectedItem} showColorTags={true} onFocusedItem={(i) => setFocusedId(i.id)} />;
      case ViewMode.LIST:
        return <PhotoList items={processedItems} {...commonProps} onHover={setHoveredItem} />;
      default: return null;
    }
  };

  const activeFolderName = activeFolderIds.has('all') ? 'All Photos' : (activeFolderIds.size === 1 ? folders.find(f => f.id === Array.from(activeFolderIds)[0])?.name : 'Collection');

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
          className="fixed border border-blue-500 bg-blue-500/20 z-50 pointer-events-none"
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
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

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
          <div className="top-bar-area relative z-40">
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
            />
          </div>

          <div className="drawer-area relative z-50">
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

          <main className="relative z-10">
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
                onOpen={setSelectedItem}
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
        </>
      )}

      <AnimatePresence>
        {isRestoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-surface/80 border border-white/10 shadow-2xl max-w-sm w-full">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-2xl font-semibold text-white tracking-tight">
                  Restoring Library
                </p>
                <p className="text-white/60 text-sm">
                  Please keep this tab focused...
                </p>
              </div>

              <div className="w-full space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${restorationProgress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/40">
                  <span>Progress</span>
                  <span>{restorationProgress}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;