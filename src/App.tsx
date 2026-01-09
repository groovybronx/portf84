/**
 * Composant principal de l'application Lumina Portfolio
 *
 * Ce composant est le point d'entrée de l'application et orchestre tous les modules.
 * Après refactoring (janvier 2026), il a été réduit de 682 lignes à une structure modulaire
 * en utilisant des composants spécialisés pour améliorer la maintenabilité.
 *
 * @version 0.3.0-beta.1
 * @refactor Janvier 2026 - Décomposition en composants modulaires
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalHost } from '@/features/overlays';
import { TopBar } from './features/navigation';
import { ViewRenderer } from './features/library/components/ViewRenderer';
import { FolderDrawer } from './features/collections';
import { AppShell } from './features/layout';
import { ErrorBoundary } from './shared/components';
import { TagHub } from './features/tags/components/TagHub';
import { PortfolioItem } from './shared/types';
import { AnimatePresence } from 'framer-motion';

// Contextes de l'application - Gestion centralisée de l'état
import { useCollections } from './shared/contexts/CollectionsContext';
import { useLibrary } from './shared/contexts/LibraryContext';
import { useSelection } from './shared/contexts/SelectionContext';
import {
  useBatchAI,
  useKeyboardShortcuts,
  useModalState,
  useItemActions,
  useAppHandlers,
  useSidebarLogic,
  OverlayKey,
} from './shared/hooks';
import { storageService } from './services/storageService';
import { LoadingOverlay } from './shared/components/LoadingOverlay';

import { logger } from './shared/utils/logger';
const App: React.FC = () => {
  const { t } = useTranslation(['library', 'common']);

  // ========================================================================
  // ÉTAT LOCAL (Déplacé en haut pour les dépendances)
  // ========================================================================
  // État local pour les interactions utilisateur et la navigation
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================================================
  // CONSOMMATION DES CONTEXTES
  // ========================================================================

  // Contexte Collections - Gestion des collections et dossiers sources
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

  // Contexte Library - Gestion de la médiathèque (fichiers, dossiers, tags)
  const {
    folders,
    activeFolderIds,
    loadFromPath,
    importFiles,
    updateItems: libraryUpdateItems,
    createFolder: createVirtualFolder,
    deleteFolder,
    toggleFolderSelection,
    moveItemsToFolder,
    clearLibrary,
    viewMode,
    gridColumns,
    activeColorFilter,
    setActiveColorFilter,
    availableTags,
    processedItems,
    currentItems,
    toggleTag,
    useCinematicCarousel,
    setCinematicCarousel,
    refreshMetadata,
  } = useLibrary();

  // Contexte Selection - Gestion de la sélection multiple et du drag-select
  const {
    selectionMode,
    selectedIds,
    setSelectedIds,
    clearSelection,
    isDragSelecting,
    dragBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSelection();

  // ========================================================================
  // WRAPPERS DE MISE À JOUR (Synchronisation selectedItem/library)
  // ========================================================================

  // Wrapper pour maintenir selectedItem synchronisé avec les mises à jour de la bibliothèque
  const updateItems = (items: PortfolioItem[]) => {
    libraryUpdateItems(items);
    // Si notre élément sélectionné est dans le batch, on le met à jour aussi
    setSelectedItem((prev) => {
      if (!prev) return null;
      const updated = items.find((i) => i.id === prev.id);
      return updated || prev;
    });
  };

  const updateItem = (item: PortfolioItem) => {
    updateItems([item]);
  };

  // ========================================================================
  // COUCHE IA - Traitement par lots des images
  // ========================================================================
  const { addToQueue } = useBatchAI(updateItem);

  // ========================================================================
  // ÉTAT DES MODALES ET MENUS (Gestion de l'interface)
  // ========================================================================
  const {
    state: overlayState,
    openOverlay,
    closeOverlay,
    tagHubActiveTab,
    setTagHubActiveTab,
  } = useModalState();

  const setOverlay = useCallback(
    (key: OverlayKey, open: boolean) => {
      if (open) {
        openOverlay(key);
      } else {
        closeOverlay(key);
      }
    },
    [openOverlay, closeOverlay]
  );

  const isFolderDrawerOpen = overlayState.folderDrawer;
  const isTagHubOpen = overlayState.tagHub;

  const setIsFolderDrawerOpen = useCallback(
    (open: boolean) => setOverlay('folderDrawer', open),
    [setOverlay]
  );

  // ========================================================================
  // LOGIQUE DE LA BARRE LATÉRALE (Sidebar)
  // ========================================================================
  // État séparé pour la TopBar - indépendant de la sidebar
  const [isTopBarPinned, setIsTopBarPinned] = useState(true);
  const [isTopBarHovered, setIsTopBarHovered] = useState(false);

  const { isSidebarPinned, setIsSidebarPinned, handleSidebarToggle } = useSidebarLogic({
    initialPinned: true,
    onFolderDrawerOpen: () => setIsFolderDrawerOpen(true),
    onFolderDrawerClose: () => {
      setIsFolderDrawerOpen(false);
      setIsSidebarPinned(false);
    },
  });

  const [showColorTags, setShowColorTags] = useState(true);

  // ========================================================================
  // MENU CONTEXTUEL
  // ========================================================================
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: PortfolioItem;
  } | null>(null);

  // ========================================================================
  // OPTIMISATION - Mémorisation des éléments sélectionnés pour les opérations batch
  // ========================================================================
  // Fonction pour obtenir les éléments batch sélectionnés
  const getBatchSelectedItems = () => {
    if (selectedIds.size > 0) {
      return currentItems.filter((item) => selectedIds.has(item.id));
    }
    if (contextMenu?.item) {
      return [contextMenu.item];
    }
    return [];
  };

  // ========================================================================
  // HOOKS PERSONNALISÉS - Actions sur les éléments
  // ========================================================================
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
    setOverlay,
    activeCollection,
  });

  // ========================================================================
  // HOOKS PERSONNALISÉS - Gestionnaires d'événements principaux
  // ========================================================================
  const { handleDirectoryPicker, handleShareSelected, handleNext, handlePrev, toggleColorTags } =
    useAppHandlers({
      t,
      activeCollection,
      sourceFolders,
      addSourceFolder,
      loadFromPath,
      processedItems,
      addToQueue,
      selectedItem,
      setOverlay,
      showColorTags,
      setShowColorTags,
    });

  // ========================================================================
  // RACCOURCIS CLAVIER
  // ========================================================================
  useKeyboardShortcuts({
    processedItems,
    focusedId,
    setFocusedId,
    setSelectedItem,
    applyColorTagToSelection,
    gridColumns,
    onOpenBatchTagPanel: () => {
      setOverlay('batchTagPanel', true);
    },
    onOpenHelp: () => {
      setOverlay('shortcutsHelp', true);
    },
    onSelectAll: () => {
      // Select all items
      const allIds = new Set(processedItems.map((item) => item.id));
      setSelectedIds(allIds);
    },
    onDelete: () => {
      // TODO: Implement delete confirmation modal
      console.log('Delete functionality not yet implemented');
    },
    onClearSelection: () => {
      setSelectedItem(null);
      clearSelection();
    },
    selectedItem, // Pass selectedItem to detect fullscreen mode
  });

  // ========================================================================
  // RACCOURCI SPÉCIAL - Tag Hub (Ctrl+T)
  // ========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setOverlay('tagHub', true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOverlay]);

  // ========================================================================
  // EFFETS DE BORD - Synchronisation des données
  // ========================================================================

  // Effet 1: Rechargement de la bibliothèque lors du changement de collection
  // Vide la bibliothèque actuelle et recharge les dossiers shadow de la nouvelle collection
  useEffect(() => {
    const loadCollectionData = async () => {
      if (!collectionsLoading && activeCollection) {
        logger.debug('app', '[App] Collection changed, clearing and reloading library');
        clearLibrary();

        // Charge les dossiers shadow (créés automatiquement pour chaque dossier source)
        const shadowPairs = await storageService.getShadowFoldersWithSources(activeCollection.id);

        logger.debug('app', `Found ${shadowPairs.length} shadow folders to load`);

        // Charge chaque chemin source des dossiers shadow
        shadowPairs.forEach(({ shadowFolder, sourceFolder }) => {
          logger.debug(
            'app',
            `[App] Loading shadow folder "${shadowFolder.name}" from source: ${sourceFolder.path}`
          );
          loadFromPath(sourceFolder.path);
        });
      }
    };

    loadCollectionData();
  }, [activeCollection?.id, collectionsLoading]); // Dépendance supprimée: sourceFolders

  // Effet 2: Synchronisation de selectedItem avec les mises à jour de la bibliothèque
  // Maintient l'élément sélectionné à jour après des modifications (ex: fusion de tags)
  useEffect(() => {
    if (selectedItem) {
      // Cherche la version mise à jour de l'élément sélectionné dans les dossiers
      const allItems = folders.flatMap((f) => f.items);
      const freshItem = allItems.find((i) => i.id === selectedItem.id);

      // Met à jour si la référence a changé (implique une mise à jour des données)
      if (freshItem && freshItem !== selectedItem) {
        logger.debug('app', '[App] Syncing selectedItem with library update');
        setSelectedItem(freshItem);
      }
    }
  }, [folders, selectedItem]);

  // ========================================================================
  // CALCULS DÉRIVÉS
  // ========================================================================

  const activeFolderName = activeFolderIds.has('all')
    ? 'Library'
    : activeFolderIds.size === 1
    ? folders.find((f) => f.id === Array.from(activeFolderIds)[0])?.name
    : 'Collection';

  const isSidebarExpanded = isFolderDrawerOpen || isSidebarPinned;

  const sidebarNode = (
    <ErrorBoundary featureName="collections">
      <FolderDrawer
        isOpen={isSidebarExpanded}
        onClose={() => {
          setIsFolderDrawerOpen(false);
          setIsSidebarPinned(false);
        }}
        folders={folders}
        activeFolderId={activeFolderIds}
        onSelectFolder={toggleFolderSelection}
        onImportFolder={handleDirectoryPicker}
        onCreateFolder={() => setOverlay('createFolderModal', true)}
        onDeleteFolder={deleteFolder}
        activeCollection={activeCollection}
        sourceFolders={sourceFolders}
        collections={collections}
        onSwitchCollection={switchCollection}
        onManageCollections={() => setOverlay('collectionManager', true)}
        onRemoveSourceFolder={async (path) => {
          await removeSourceFolder(path);
          clearLibrary();

          if (activeCollection && sourceFolders.length > 0) {
            const remainingFolders = sourceFolders.filter((sf) => sf.path !== path);
            for (const folder of remainingFolders) {
              await loadFromPath(folder.path);
            }
          }
        }}
        isPinned={isSidebarPinned}
        onTogglePin={() => {
          const newPinned = !isSidebarPinned;
          setIsSidebarPinned(newPinned);
          setIsFolderDrawerOpen(false);
        }}
        activeColorFilter={activeColorFilter}
        onColorFilterChange={setActiveColorFilter}
      />
    </ErrorBoundary>
  );

  const topBarLayer = (
    <ErrorBoundary featureName="navigation">
      <div
        className="absolute top-0 left-0 right-0 h-32 z-30 pointer-events-auto"
        onMouseEnter={() => setIsTopBarHovered(true)}
        onMouseLeave={() => setIsTopBarHovered(false)}
      />

      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <TopBar
          folderName={activeFolderName || ''}
          onOpenFolders={handleSidebarToggle}
          onMoveSelected={() => setOverlay('moveModal', true)}
          onShareSelected={handleShareSelected}
          onOpenSettings={() => setOverlay('settingsModal', true)}
          onOpenTagHub={() => setOverlay('tagHub', true)}
          onOpenBatchTagPanel={() => setOverlay('batchTagPanel', true)}
          showColorTags={showColorTags}
          onToggleColorTags={toggleColorTags}
          isSidebarPinned={isTopBarPinned}
          onToggleTopBarPin={() => setIsTopBarPinned(!isTopBarPinned)}
          isExternalHovered={isTopBarHovered}
        />
      </div>
    </ErrorBoundary>
  );

  const mainContentNode = (
    <ErrorBoundary featureName="library">
      <main className="flex-1 relative z-(--z-grid-item) overflow-y-auto custom-scrollbar h-full pt-24">
        {currentItems.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <p className="text-gray-500 text-center">
              {!activeCollection ? t('library:openDrawerToCreate') : t('library:noItemsAddSource')}
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
              onHover={() => {}}
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
  );

  const tagHubPanel = (
    <TagHub
      isOpen={isTagHubOpen}
      onClose={() => setOverlay('tagHub', false)}
      activeTab={tagHubActiveTab}
      onTabChange={setTagHubActiveTab}
      onTagsUpdated={async () => {
        logger.debug('app', '[App] Tags updated from Tag Hub, refreshing library...');
        await refreshMetadata();
      }}
      onSelectTag={(tag) => {
        toggleTag(tag);
      }}
    />
  );

  return (
    <AppShell
      topBar={topBarLayer}
      sidebar={sidebarNode}
      mainContent={mainContentNode}
      tagHub={tagHubPanel}
      isSidebarExpanded={isSidebarExpanded}
      isTagHubOpen={isTagHubOpen}
      onMouseDown={(e) => handleMouseDown(e, viewMode, processedItems)}
      onMouseMove={(e) => handleMouseMove(e, processedItems)}
      onMouseUp={handleMouseUp}
    >
      <LoadingOverlay isVisible={collectionsLoading} />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        onChange={(e) => e.target.files && importFiles(e.target.files)}
      />
      <ModalHost
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
        addTagsToSelection={addTagsToSelection}
        batchSelectedItems={getBatchSelectedItems()}
        libraryUpdateItems={libraryUpdateItems}
        clearSelection={clearSelection}
        useCinematicCarousel={useCinematicCarousel}
        setCinematicCarousel={setCinematicCarousel}
      />
    </AppShell>
  );
};

export default App;
