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

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppOverlays, AppModals } from './features/overlays';
import { TopBar } from './features/navigation';
import { ViewRenderer } from './features/library/components/ViewRenderer';
import { FolderDrawer } from './features/collections';
import { UnifiedProgress, ErrorBoundary } from './shared/components';
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
    isTagHubOpen,
    setIsTagHubOpen,
    tagHubActiveTab,
    setTagHubActiveTab,
    isBatchTagPanelOpen,
    setIsBatchTagPanelOpen,
  } = useModalState();

  // ========================================================================
  // LOGIQUE DE LA BARRE LATÉRALE (Sidebar)
  // ========================================================================
  const { isSidebarPinned, setIsSidebarPinned, handleSidebarToggle } = useSidebarLogic({
    initialPinned: false,
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
    setIsMoveModalOpen,
    setIsAddTagModalOpen,
    activeCollection,
  });

  // ========================================================================
  // HOOKS PERSONNALISÉS - Gestionnaires d'événements principaux
  // ========================================================================
  const { handleDirectoryPicker, handleShareSelected, handleNext, handlePrev, toggleColorTags } =
    useAppHandlers({
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
      // Ouvre uniquement si des éléments sont sélectionnés
      if (selectedIds.size > 0) {
        setIsBatchTagPanelOpen(true);
      }
    },
  });

  // ========================================================================
  // RACCOURCI SPÉCIAL - Tag Hub (Ctrl+T)
  // ========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTagHubOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsTagHubOpen]);

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

  // Nom du dossier actif pour l'affichage dans la TopBar
  const activeFolderName = activeFolderIds.has('all')
    ? 'Library'
    : activeFolderIds.size === 1
    ? folders.find((f) => f.id === Array.from(activeFolderIds)[0])?.name
    : 'Collection';

  // ========================================================================
  // RENDU JSX - Structure de l'interface utilisateur
  // ========================================================================
  return (
    <div
      className="main-app bg-surface h-screen overflow-hidden flex flex-col"
      onMouseDown={(e) => handleMouseDown(e, viewMode, processedItems)}
      onMouseMove={(e) => handleMouseMove(e, processedItems)}
      onMouseUp={handleMouseUp}
    >
      {/* Overlay de chargement pendant le chargement des collections */}
      <LoadingOverlay isVisible={collectionsLoading} />

      {/* Boîte de sélection par drag-and-drop */}
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

      {/* Input fichier caché pour l'import de dossiers */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={(e) => e.target.files && importFiles(e.target.files)}
      />

      {/* Arrière-plan décoratif */}
      <div className="fixed inset-0 pointer-events-none z-(--z-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

      {/* ========================================================================
          BARRE SUPÉRIEURE (TopBar) - Toujours visible
          ======================================================================== */}
      <ErrorBoundary featureName="navigation">
        <div className="top-bar-area relative z-(--z-topbar)">
          <TopBar
            folderName={activeFolderName || ''}
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

      {/* ========================================================================
          ZONE PRINCIPALE : Barre latérale + Contenu
          ======================================================================== */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* --------------------------------------------------------------------
            BARRE LATÉRALE (FolderDrawer) - Navigation des collections/dossiers
            -------------------------------------------------------------------- */}
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

              // Recharge les dossiers restants
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
              // Quand on désépingle, cache tout pour une sortie propre
              setIsFolderDrawerOpen(false);
            }}
            activeColorFilter={activeColorFilter}
            onColorFilterChange={setActiveColorFilter}
          />
        </ErrorBoundary>

        {/* --------------------------------------------------------------------
            ZONE DE CONTENU PRINCIPALE (Library View)
            -------------------------------------------------------------------- */}
        <div className="flex-1 relative overflow-hidden flex flex-col h-full">
          <ErrorBoundary featureName="library">
            <main className="flex-1 relative z-(--z-grid-item) overflow-y-auto custom-scrollbar h-full">
              {currentItems.length === 0 ? (
                // État vide - Aucun élément à afficher
                <div className="flex items-center justify-center h-full min-h-[60vh]">
                  <p className="text-gray-500 text-center">
                    {!activeCollection
                      ? t('library:openDrawerToCreate')
                      : t('library:noItemsAddSource')}
                  </p>
                </div>
              ) : (
                // Vue principale avec animations
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
        </div>
      </div>

      {/* ========================================================================
          OVERLAYS FLOTTANTS (Menu contextuel, visionneuse, etc.)
          ======================================================================== */}
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

      {/* ========================================================================
          MODALES (Dialogues modals pour les actions)
          ======================================================================== */}
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
        batchSelectedItems={getBatchSelectedItems()}
        libraryUpdateItems={libraryUpdateItems}
        clearSelection={clearSelection}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        useCinematicCarousel={useCinematicCarousel}
        setCinematicCarousel={setCinematicCarousel}
      />

      {/* ========================================================================
          TAG HUB - Panneau de gestion des tags (droite de l'écran)
          ======================================================================== */}
      <TagHub
        isOpen={isTagHubOpen}
        onClose={() => setIsTagHubOpen(false)}
        activeTab={tagHubActiveTab}
        onTabChange={setTagHubActiveTab}
        onTagsUpdated={async () => {
          logger.debug('app', '[App] Tags updated from Tag Hub, refreshing library...');
          await refreshMetadata();
        }}
        onSelectTag={(tag) => {
          toggleTag(tag);
          // Ne ferme pas le hub pour permettre la multi-sélection
          // setIsTagHubOpen(false);
        }}
      />

      {/* ========================================================================
          INDICATEUR DE PROGRÈS GLOBAL (pour les opérations en arrière-plan)
          ======================================================================== */}
      <UnifiedProgress />
    </div>
  );
};

export default App;
