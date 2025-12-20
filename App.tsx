import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import { UploadZone } from './components/UploadZone';
import { TopBar } from './components/TopBar';
import { PhotoGrid } from './components/PhotoGrid';
import { PhotoCarousel } from './components/PhotoCarousel';
import { PhotoList } from './components/PhotoList';
import { ImageViewer } from './components/ImageViewer';
import { FolderDrawer } from './components/FolderDrawer';
import { ContextMenu } from './components/ContextMenu';
import { CreateFolderModal, MoveToFolderModal } from './components/ActionModals';
import { PortfolioItem, ViewMode, SortOption, SortDirection, Folder, COLOR_PALETTE } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { storageService } from './services/storageService';
import { scanDirectory, verifyPermission } from './utils/fileHelpers';
import { analyzeImage } from './services/geminiService';

const App: React.FC = () => {
  // Data State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderIds, setActiveFolderIds] = useState<Set<string>>(new Set(['all']));
  
  // Persistence State
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [gridColumns, setGridColumns] = useState<number>(4);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: PortfolioItem } | null>(null);

  // Batch AI Processing State
  const [aiQueue, setAiQueue] = useState<PortfolioItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [totalBatchCount, setTotalBatchCount] = useState(0);

  // Ensure file input attributes are correctly set for folder selection
  useEffect(() => {
    if (fileInputRef.current) {
        fileInputRef.current.setAttribute('webkitdirectory', '');
        fileInputRef.current.setAttribute('directory', '');
    }
  }, []);

  // Interaction State
  const [hoveredItem, setHoveredItem] = useState<PortfolioItem | null>(null);
  const [focusedCarouselItem, setFocusedCarouselItem] = useState<PortfolioItem | null>(null);

  // Modals State
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Sorting and Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Color Tagging
  const [showColorTags, setShowColorTags] = useState(true);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);

  // Selection Mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drag Selection
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // --- Persistence Checks on Mount ---
  useEffect(() => {
    const checkStorage = async () => {
        try {
            const handle = await storageService.getDirectoryHandle();
            if (handle) {
                setHasStoredSession(true);
            }
        } catch (e) {
            console.error("Storage check failed", e);
        }
    };
    checkStorage();

    // Cleanup URLs on unmount
    return () => {
      folders.forEach(folder => {
        folder.items.forEach(item => URL.revokeObjectURL(item.url));
      });
    };
  }, []);

  // --- Persistence: Restore Session ---
  const handleRestoreSession = async () => {
      try {
          setIsRestoring(true);
          const handle = await storageService.getDirectoryHandle();
          if (!handle) {
              setHasStoredSession(false);
              return;
          }

          // Browser requires user gesture for permission re-grant
          const permitted = await verifyPermission(handle, true);
          if (!permitted) {
              alert("Permission denied. Please reload and select folder manually.");
              setIsRestoring(false);
              return;
          }

          await loadFromDirectoryHandle(handle);

      } catch (e) {
          console.error("Restore failed", e);
          alert("Failed to restore session. The original folder might have moved.");
          storageService.clearHandles();
          setHasStoredSession(false);
      } finally {
          setIsRestoring(false);
      }
  };

  // --- File Loading Logic (Directory Handle) ---
  const loadFromDirectoryHandle = async (handle: FileSystemDirectoryHandle) => {
    // 1. Scan files
    const { folders: folderMap, looseFiles } = await scanDirectory(handle);

    // 2. Load stored metadata
    const metaMap = await storageService.getMetadataBatch([]); // For simplicity getting all, or optimize later

    // 3. Hydrate Items with Metadata
    const hydrateItem = (item: PortfolioItem): PortfolioItem => {
        // We use relative path (folders names) or just name as simple key for now
        // A robust system would pass full relative path from scanDirectory
        const key = item.aiTags && item.aiTags[0] ? `${item.aiTags[0]}/${item.name}` : item.name;
        
        // Find by key or fuzzy match (filename)
        // Since we didn't pass full path down in scanDirectory in previous step strictly, let's look up by name primarily for this demo
        // Ideally scanDirectory passes `relativePath` to item.id or a new field
        const meta = metaMap.get(item.name); // Simplified matching
        
        if (meta) {
            return {
                ...item,
                aiDescription: meta.aiDescription,
                aiTags: meta.aiTags,
                aiTagsDetailed: meta.aiTagsDetailed,
                colorTag: meta.colorTag
            };
        }
        return item;
    };

    const newFolders: Folder[] = [];
    
    folderMap.forEach((items, name) => {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({
            id: folderId,
            name: name,
            items: items.map(hydrateItem).map(i => ({...i, folderId})),
            createdAt: Date.now()
        });
    });

    if (looseFiles.length > 0) {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({
            id: folderId,
            name: 'Root Collection',
            items: looseFiles.map(hydrateItem).map(i => ({...i, folderId})),
            createdAt: Date.now()
        });
    }

    setFolders(newFolders);
    if (newFolders.length > 0) {
        setActiveFolderIds(new Set(['all']));
    }
    
    // Save handle to update timestamp
    await storageService.saveDirectoryHandle(handle);
  };

  // --- File Loading Logic (Standard Input - Legacy/Fallback) ---
  const handleFilesSelected = (fileList: FileList) => {
    // Logic remains similar but without persistence handle
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    // ... (Existing logic for grouping)
    // We duplicate the grouping logic here briefly for fallback mode
    const folderGroups = new Map<string, PortfolioItem[]>();
    const looseItems: PortfolioItem[] = [];

    files.forEach(file => {
        const pathParts = file.webkitRelativePath.split('/');
        const folderTag = pathParts.length > 1 ? pathParts[0] : undefined;
        const item: PortfolioItem = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            aiTags: folderTag ? [folderTag] : []
        };
        if (pathParts.length > 1) {
            const folderName = pathParts[0];
            if (!folderGroups.has(folderName)) folderGroups.set(folderName, []);
            folderGroups.get(folderName)?.push(item);
        } else {
            looseItems.push(item);
        }
    });

    const newFolders: Folder[] = [];
    folderGroups.forEach((items, name) => {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({ id: folderId, name, items: items.map(i => ({...i, folderId})), createdAt: Date.now() });
    });
    if (looseItems.length > 0) {
        const folderId = Math.random().toString(36).substring(2, 9);
        newFolders.push({ id: folderId, name: 'Import', items: looseItems.map(i => ({...i, folderId})), createdAt: Date.now() });
    }

    setFolders(prev => [...prev, ...newFolders]);
    setActiveFolderIds(new Set(['all']));
  };

  // --- Open Directory Picker (Modern API) ---
  const handleDirectoryPicker = async () => {
    try {
        // Type assertion for experimental API
        const handle = await (window as any).showDirectoryPicker();
        await loadFromDirectoryHandle(handle);
    } catch (e) {
        console.log("User cancelled or API error", e);
    }
  };

  // --- Handlers ---
  const handleImportFolderClick = () => {
    if ('showDirectoryPicker' in window) {
        handleDirectoryPicker();
    } else {
        fileInputRef.current?.click();
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
        id: Math.random().toString(36).substring(2, 9),
        name: name,
        items: [],
        createdAt: Date.now()
    };
    setFolders(prev => [...prev, newFolder]);
    setActiveFolderIds(new Set([newFolder.id])); 
    setIsFolderDrawerOpen(false);
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm("Are you sure?")) {
        setFolders(prev => prev.filter(f => f.id !== id));
        setActiveFolderIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet.size === 0 ? new Set(['all']) : newSet;
        });
    }
  };

  const toggleFolderSelection = (id: string) => {
    setActiveFolderIds(prev => {
        if (id === 'all') return new Set(['all']);
        const newSet = new Set(prev);
        if (newSet.has('all')) { newSet.clear(); newSet.add(id); return newSet; }
        if (newSet.has(id)) { newSet.delete(id); if (newSet.size === 0) return new Set(['all']); } 
        else { newSet.add(id); }
        return newSet;
    });
  };

  const handleUpdateItem = (updated: PortfolioItem) => {
    // 1. Update State
    setFolders(prev => prev.map(folder => {
        if (!updated.folderId || folder.id === updated.folderId) {
            return {
                ...folder,
                items: folder.items.map(item => item.id === updated.id ? updated : item)
            };
        }
        return folder;
    }));
    
    if (selectedItem?.id === updated.id) {
        setSelectedItem(updated);
    }

    // 2. Persist Metadata
    // Note: We use the item name as ID for now. 
    // In production, we should store relative paths in the Item object.
    storageService.saveMetadata(updated, updated.name);
  };

  // --- Color Tagging ---
  const applyColorTag = useCallback((colorHex: string | undefined | null) => {
    const finalColor = colorHex === null ? undefined : colorHex;
    let itemsToUpdateIds: Set<string> = new Set();
    if (selectedItem) itemsToUpdateIds.add(selectedItem.id);
    else if (selectionMode && selectedIds.size > 0) itemsToUpdateIds = selectedIds;
    else if (viewMode === ViewMode.CAROUSEL && focusedCarouselItem) itemsToUpdateIds.add(focusedCarouselItem.id);
    else if (viewMode === ViewMode.GRID && focusedId) itemsToUpdateIds.add(focusedId);
    else if (viewMode === ViewMode.LIST && hoveredItem) itemsToUpdateIds.add(hoveredItem.id);
    else return;

    setFolders(prevFolders => prevFolders.map(folder => ({
        ...folder,
        items: folder.items.map(item => {
            if (itemsToUpdateIds.has(item.id)) {
                const updatedItem = { ...item, colorTag: finalColor };
                if (selectedItem?.id === item.id) setSelectedItem(updatedItem);
                
                // Persist
                storageService.saveMetadata(updatedItem, updatedItem.name);

                return updatedItem;
            }
            return item;
        })
    })));
  }, [selectedItem, selectionMode, selectedIds, viewMode, focusedCarouselItem, hoveredItem, focusedId]);

  const handleTopBarColorAction = (color: string | null) => {
    if (selectionMode && selectedIds.size > 0) applyColorTag(color);
    else setActiveColorFilter(color);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (/^[1-6]$/.test(e.key)) {
            const color = COLOR_PALETTE[e.key];
            if (color) applyColorTag(color);
        } else if (e.key === '0') {
            applyColorTag(undefined);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyColorTag]);

  // --- Filtering & Sorting ---
  const currentItems = useMemo(() => {
    if (activeFolderIds.has('all')) return folders.flatMap(f => f.items);
    return folders.filter(f => activeFolderIds.has(f.id)).flatMap(f => f.items);
  }, [folders, activeFolderIds]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    currentItems.forEach(item => item.aiTags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [currentItems]);

  const processedItems = useMemo(() => {
    let result = [...currentItems];
    
    // Fuzzy Search using Fuse.js
    if (searchTerm) {
        const fuse = new Fuse(result, {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'aiDescription', weight: 0.5 },
                { name: 'aiTags', weight: 0.3 }
            ],
            threshold: 0.4, // Sensitivity (0.0 = perfect match, 1.0 = match anything)
            ignoreLocation: true
        });
        result = fuse.search(searchTerm).map(res => res.item);
    }

    if (selectedTag) result = result.filter(item => item.aiTags?.includes(selectedTag));
    if (activeColorFilter) result = result.filter(item => item.colorTag === activeColorFilter);

    result.sort((a, b) => {
        let cmp = 0;
        switch (sortOption) {
            case 'date': cmp = a.lastModified - b.lastModified; break;
            case 'name': cmp = a.name.localeCompare(b.name); break;
            case 'size': cmp = a.size - b.size; break;
        }
        return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [currentItems, searchTerm, selectedTag, activeColorFilter, sortOption, sortDirection]);

  // --- Drag Selection Logic ---
  const registerItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el); else itemRefs.current.delete(id);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === ViewMode.CAROUSEL) return;
    if ((e.target as HTMLElement).closest('button, input, select, a, .top-bar-area, .drawer-area')) return;
    if (e.button !== 0) return; // Only Left click for drag select
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setContextMenu(null); // Close context menu on click
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartPos.current) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const startX = dragStartPos.current.x;
    const startY = dragStartPos.current.y;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const x = Math.min(currentX, startX);
    const y = Math.min(currentY, startY);

    if (!isDragSelecting && (width > 5 || height > 5)) {
        setIsDragSelecting(true);
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
             setSelectedIds(new Set());
             setSelectionMode(true);
        }
    }

    if (isDragSelecting) {
        setDragBox({ x, y, w: width, h: height });
        const initialSet = (e.shiftKey || e.ctrlKey || e.metaKey) ? selectedIds : new Set<string>();
        const newSelected = new Set(initialSet);
        
        // Optimize: iterate primarily visible items if possible, but processedItems is fine for reasonable counts
        processedItems.forEach(item => {
            const el = itemRefs.current.get(item.id);
            if (el) {
                const rect = el.getBoundingClientRect();
                const isIntersecting = !(rect.right < x || rect.left > x + width || rect.bottom < y || rect.top > y + height);
                if (isIntersecting) newSelected.add(item.id);
            }
        });
        setSelectedIds(newSelected);
    }
  };

  const handleMouseUp = () => {
    if (isDragSelecting) {
        setIsDragSelecting(false);
        setDragBox(null);
    } else if (dragStartPos.current) {
        if (selectionMode && !selectedItem) setSelectedIds(new Set());
    }
    dragStartPos.current = null;
  };

  // --- Context Menu Handler ---
  const handleContextMenu = (e: React.MouseEvent, item: PortfolioItem) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleContextAnalyze = async (item: PortfolioItem) => {
      // Trigger AI Analysis for single item
      try {
          const result = await analyzeImage(item);
          handleUpdateItem({
              ...item,
              aiDescription: result.description,
              aiTags: result.tags,
              aiTagsDetailed: result.tagsDetailed
          });
      } catch (e) { console.error("Analysis failed", e); }
  };

  const handleContextDelete = (id: string) => {
      if(confirm("Delete this item from view?")) {
        setFolders(prev => prev.map(f => ({
            ...f,
            items: f.items.filter(i => i.id !== id)
        })));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
  };

  // --- Batch AI Processing ---
  const handleRunBatchAI = () => {
      const itemsToProcess = processedItems.filter(item => !item.aiDescription);
      if (itemsToProcess.length === 0) {
          alert("No unanalyzed items in current view.");
          return;
      }
      if (confirm(`Start AI analysis for ${itemsToProcess.length} items? This may take some time.`)) {
          setTotalBatchCount(itemsToProcess.length);
          setAiQueue(itemsToProcess);
          setIsBatchProcessing(true);
      }
  };

  // Queue Processor Effect
  useEffect(() => {
      const processNext = async () => {
          if (aiQueue.length === 0) {
              setIsBatchProcessing(false);
              return;
          }

          const item = aiQueue[0];
          try {
              const result = await analyzeImage(item);
              handleUpdateItem({
                  ...item,
                  aiDescription: result.description,
                  aiTags: result.tags,
                  aiTagsDetailed: result.tagsDetailed
              });
          } catch (e) {
              console.error(`Failed to analyze ${item.name}`, e);
          } finally {
              setAiQueue(prev => prev.slice(1));
          }
      };

      if (isBatchProcessing && aiQueue.length > 0) {
          processNext();
      }
  }, [aiQueue, isBatchProcessing]);

  // --- Folder Actions ---
  const handleMoveSelectedItems = (targetFolderId: string) => {
    if (selectedIds.size === 0) return;
    setFolders(prev => prev.map(folder => {
        if (folder.id === targetFolderId) {
             const itemsToAdd = currentItems.filter(i => selectedIds.has(i.id)).map(i => ({...i, folderId: targetFolderId}));
             return { ...folder, items: [...folder.items, ...itemsToAdd] };
        }
        return { ...folder, items: folder.items.filter(i => !selectedIds.has(i.id)) };
    }));
    setSelectedIds(new Set());
    setSelectionMode(false);
    setIsMoveModalOpen(false);
    setActiveFolderIds(new Set([targetFolderId]));
  };

  const handleCreateAndMove = (name: string) => {
      const folderId = Math.random().toString(36).substring(2, 9);
      handleCreateFolder(name); // adds folder
      // Need to defer move until next render or manually construct new state block - doing manually here:
      const itemsToMove = currentItems.filter(i => selectedIds.has(i.id)).map(i => ({...i, folderId}));
      setFolders(prev => {
          // Remove from old
          const cleaned = prev.map(f => ({...f, items: f.items.filter(i => !selectedIds.has(i.id))}));
          // Add to new (last one added)
          const last = cleaned[cleaned.length - 1];
          if(last.id === folderId) last.items = itemsToMove; 
          return cleaned;
      });
      setSelectedIds(new Set());
      setSelectionMode(false);
      setIsMoveModalOpen(false);
      setActiveFolderIds(new Set([folderId]));
  };

  const handleShareSelected = async () => {
    const items = currentItems.filter(i => selectedIds.has(i.id));
    if (navigator.share && items.length > 0) {
        try { await navigator.share({ title: `Sharing ${items.length} Photos`, files: items.map(i => i.file) }); } 
        catch (e) { console.error(e); }
    } else { alert("Sharing not supported"); }
  };

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = processedItems.findIndex(item => item.id === selectedItem.id);
    if (currentIndex !== -1 && currentIndex < processedItems.length - 1) {
        setSelectedItem(processedItems[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = processedItems.findIndex(item => item.id === selectedItem.id);
    if (currentIndex > 0) {
        setSelectedItem(processedItems[currentIndex - 1]);
    }
  };

  // --- Render ---
  const renderView = () => {
    const commonProps = {
        onSelect: setSelectedItem,
        selectionMode,
        selectedIds,
        onToggleSelect: toggleFolderSelection,
        showColorTags,
        registerItemRef,
        onContextMenu: handleContextMenu
    };

    switch (viewMode) {
      case ViewMode.GRID:
        return <PhotoGrid items={processedItems} {...commonProps} onHover={(i) => {setHoveredItem(i); if(i) setFocusedId(i.id);}} focusedId={focusedId} onFocusChange={setFocusedId} columns={gridColumns} />;
      case ViewMode.CAROUSEL:
        return <PhotoCarousel items={processedItems} onSelect={setSelectedItem} showColorTags={showColorTags} onFocusedItem={setFocusedCarouselItem} />;
      case ViewMode.LIST:
        return <PhotoList items={processedItems} {...commonProps} onHover={setHoveredItem} />;
      default: return null;
    }
  };

  const activeFolderName = activeFolderIds.has('all') ? 'All Photos' : (activeFolderIds.size === 1 ? folders.find(f => f.id === Array.from(activeFolderIds)[0])?.name : 'Collection');

  return (
    <div className="min-h-screen bg-background text-white selection:bg-blue-500/30" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {isDragSelecting && dragBox && <div className="fixed border border-blue-500 bg-blue-500/20 z-50 pointer-events-none" style={{ left: dragBox.x, top: dragBox.y, width: dragBox.w, height: dragBox.h }} />}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        {...({ webkitdirectory: "", directory: "" } as any)} 
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)} 
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

      {folders.length === 0 ? (
        <UploadZone 
            onFilesSelected={handleFilesSelected} 
            onDirectoryPicker={handleDirectoryPicker}
            hasStoredSession={hasStoredSession}
            onRestoreSession={handleRestoreSession}
        />
      ) : (
        <>
            <div className="top-bar-area relative z-40">
                <TopBar 
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    sortOption={sortOption} sortDirection={sortDirection} onSortChange={setSortOption} onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    selectedTag={selectedTag} availableTags={availableTags} onTagSelect={setSelectedTag}
                    selectionMode={selectionMode} onToggleSelectionMode={() => { if(selectionMode) {setSelectionMode(false); setSelectedIds(new Set());} else setSelectionMode(true); }}
                    showColorTags={showColorTags} onToggleColorTags={() => setShowColorTags(!showColorTags)}
                    activeColorFilter={activeColorFilter} onColorAction={handleTopBarColorAction}
                    currentViewMode={viewMode} onModeChange={setViewMode}
                    gridColumns={gridColumns} onGridColumnsChange={setGridColumns}
                    folderName={activeFolderName} onOpenFolders={() => setIsFolderDrawerOpen(true)}
                    selectedCount={selectedIds.size} onMoveSelected={() => setIsMoveModalOpen(true)} onShareSelected={handleShareSelected}
                    onRunBatchAI={handleRunBatchAI}
                    isBatchAIProcessing={isBatchProcessing}
                    batchAIProgress={totalBatchCount > 0 ? 1 - (aiQueue.length / totalBatchCount) : 0}
                />
            </div>
            
            <div className="drawer-area relative z-50">
                <FolderDrawer isOpen={isFolderDrawerOpen} onClose={() => setIsFolderDrawerOpen(false)} folders={folders} activeFolderId={activeFolderIds} onSelectFolder={toggleFolderSelection} onImportFolder={handleImportFolderClick} onCreateFolder={() => setIsCreateFolderModalOpen(true)} onDeleteFolder={handleDeleteFolder} />
            </div>

            <main className="relative z-10">
                <AnimatePresence mode="wait">
                    {renderView()}
                </AnimatePresence>
            </main>

            {/* Custom Context Menu */}
            <AnimatePresence>
              {contextMenu && (
                <ContextMenu 
                  x={contextMenu.x} 
                  y={contextMenu.y} 
                  item={contextMenu.item} 
                  onClose={() => setContextMenu(null)}
                  onAnalyze={handleContextAnalyze}
                  onDelete={handleContextDelete}
                  onColorTag={(item, color) => handleUpdateItem({...item, colorTag: color})}
                  onOpen={setSelectedItem}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedItem && <ImageViewer item={selectedItem} onClose={() => setSelectedItem(null)} onUpdateItem={handleUpdateItem} onNext={handleNext} onPrev={handlePrev} showColorTags={showColorTags} />}
            </AnimatePresence>
            
            {/* Action Modals */}
            <CreateFolderModal isOpen={isCreateFolderModalOpen} onClose={() => setIsCreateFolderModalOpen(false)} onCreate={handleCreateFolder} />
            <MoveToFolderModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} folders={folders} onMove={handleMoveSelectedItems} onCreateAndMove={handleCreateAndMove} selectedCount={selectedIds.size} />
        </>
      )}

      {/* Loading Overlay for Restore */}
      <AnimatePresence>
          {isRestoring && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-md">
                  <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xl font-medium text-white">Restoring Library...</p>
                      <p className="text-sm text-gray-400">Scanning files and retrieving AI tags</p>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default App;