import React, { useState, useRef, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { PhotoGrid } from "./components/PhotoGrid";
import { PhotoCarousel } from "./components/PhotoCarousel";
import { PhotoList } from "./components/PhotoList";
import { ImageViewer } from "./components/ImageViewer";
import { FolderDrawer } from "./components/FolderDrawer";
import { ContextMenu } from "./components/ContextMenu";
import {
	CreateFolderModal,
	MoveToFolderModal,
} from "./components/ActionModals";
import { AddTagModal } from "./components/AddTagModal";
import { SettingsModal } from "./components/SettingsModal";
import { UnifiedProgress } from "./components/UnifiedProgress";
import { EmptyState } from "./components/EmptyState";
import { CollectionManager } from "./components/CollectionManager";
import { open } from "@tauri-apps/plugin-dialog";

import { PortfolioItem, ViewMode, COLOR_PALETTE } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { analyzeImage } from "./services/geminiService";

// Contexts
import { useCollections } from "./contexts/CollectionsContext";
import { useLibrary } from "./contexts/LibraryContext";
import { useSelection } from "./contexts/SelectionContext";
import { useBatchAI } from "./hooks/useBatchAI";

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
		createFolder: createVirtualFolder,
		deleteFolder,
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
	const updateItem = (item: PortfolioItem) => {
		libraryUpdateItem(item);
		setSelectedItem((prev) => (prev && prev.id === item.id ? item : prev));
	};

	// --- 4. AI Layer ---
	const { isBatchProcessing, batchProgress, addToQueue } =
		useBatchAI(updateItem);

	// --- 5. Layout State (Modals, Menus) ---
	const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
	const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
	const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
	const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isCollectionManagerOpen, setIsCollectionManagerOpen] = useState(false);
	const [showColorTags, setShowColorTags] = useState(true);

	// Context Menu
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		item: PortfolioItem;
	} | null>(null);
	const contextMenuRef = useRef<HTMLDivElement>(null);

	// Helper functions
	const toggleColorTags = () => setShowColorTags(!showColorTags);
	const handleShareSelected = async () => {
		// Share logic placeholder
		console.log("Share selected items:", selectedIds);
	};

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

	// Clear library and reload when collection changes
	useEffect(() => {
		if (!collectionsLoading) {
			console.log("[App] Collection changed, clearing library");
			clearLibrary();

			if (activeCollection && sourceFolders.length > 0) {
				console.log("[App] Auto-loading source folders:", sourceFolders);
				sourceFolders.forEach((folder) => {
					console.log("[App] Loading folder:", folder.path);
					loadFromPath(folder.path);
				});
			}
		}
	}, [activeCollection?.id, collectionsLoading]);
	// ^ Only watch activeCollection.id - sourceFolders is fetched by useCollections

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
			if (!activeCollection) {
				alert("Veuillez d'abord créer ou sélectionner une Collection");
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

	// Folder Actions Wrapper
	const handleMoveAction = (targetId: string) => {
		moveItemsToFolder(selectedIds, targetId, currentItems);
		clearSelection();
		setIsMoveModalOpen(false);
	};

	const handleCreateAndMove = (name: string) => {
		if (!activeCollection) return;
		const newId = createVirtualFolder(name);
		moveItemsToFolder(selectedIds, newId, currentItems);
		clearSelection();
		setIsMoveModalOpen(false);
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
		switch (viewMode) {
			case ViewMode.GRID:
				return (
					<PhotoGrid
						onSelect={setSelectedItem}
						onHover={(i) => {
							setHoveredItem(i);
							if (i) setFocusedId(i.id);
						}}
						onContextMenu={(e, item) => {
							e.preventDefault();
							setContextMenu({ x: e.clientX, y: e.clientY, item });
						}}
						onTagClick={(tag) => setSelectedTag(tag)}
						focusedId={focusedId}
						onFocusChange={setFocusedId}
					/>
				);
			case ViewMode.CAROUSEL:
				return (
					<PhotoCarousel
						onSelect={setSelectedItem}
						onFocusedItem={(i) => setFocusedId(i.id)}
					/>
				);
			case ViewMode.LIST:
				return (
					<PhotoList
						onSelect={setSelectedItem}
						onHover={setHoveredItem}
						onContextMenu={(e, item) => {
							e.preventDefault();
							setContextMenu({ x: e.clientX, y: e.clientY, item });
						}}
						onTagClick={(tag) => setSelectedTag(tag)}
						focusedId={focusedId}
						onFocusChange={setFocusedId}
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
			className="main-app bg-surface min-h-screen overflow-hidden flex flex-col"
			onMouseDown={(e) => handleMouseDown(e, viewMode, processedItems)}
			onMouseMove={(e) => handleMouseMove(e, processedItems)}
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

			{/* TopBar - Always visible */}
			<div className="top-bar-area relative z-(--z-topbar)">
				<TopBar
					folderName={activeFolderName}
					onOpenFolders={() => setIsFolderDrawerOpen(true)}
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

			{/* Folder Drawer - Updated with Collection support */}
			<div className="drawer-area relative z-(--z-drawer-overlay)">
				<FolderDrawer
					isOpen={isFolderDrawerOpen}
					onClose={() => setIsFolderDrawerOpen(false)}
					folders={folders}
					activeFolderId={activeFolderIds}
					onSelectFolder={toggleFolderSelection}
					onImportFolder={handleDirectoryPicker} // SAME as EmptyState button
					onCreateFolder={() => setIsCreateFolderModalOpen(true)}
					onDeleteFolder={deleteFolder}
					activeCollection={activeCollection}
					sourceFolders={sourceFolders}
					onManageCollections={() => setIsCollectionManagerOpen(true)}
					onRemoveSourceFolder={async (path) => {
						await removeSourceFolder(path);
						// Optionally reload library here
					}}
				/>
			</div>

			{/* Main Content Area - EmptyState or View */}
			<main className="relative z-(--z-grid-item)">
				{currentItems.length === 0 ? (
					<div className="flex items-center justify-center h-full min-h-[60vh]">
						<p className="text-gray-500 text-center">
							{!activeCollection
								? "Ouvrez le tiroir (icône en haut à gauche) pour créer une Collection"
								: "Aucune image. Ajoutez un dossier source depuis le tiroir."}
						</p>
					</div>
				) : (
					<AnimatePresence mode="wait">{renderView()}</AnimatePresence>
				)}
			</main>

			{/* Context Menu */}
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
							if (selectedIds.size <= 1) {
								// Optional: could force select the context item here if desired
							}
							setIsAddTagModalOpen(true);
						}}
						onOpen={setSelectedItem}
						onMove={handleContextMove}
					/>
				)}
			</AnimatePresence>

			{/* Image Viewer */}
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

			<UnifiedProgress />
		</div>
	);
};

export default App;
