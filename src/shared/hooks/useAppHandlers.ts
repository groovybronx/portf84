import { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { PortfolioItem } from '../types';
import { OverlayKey } from './useModalState';

import { logger } from '../utils/logger';
interface AppHandlers {
  handleDirectoryPicker: () => Promise<void>;
  handleShareSelected: () => Promise<void>;
  handleRunBatchAI: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  toggleColorTags: () => void;
}

interface UseAppHandlersParams {
  t: any;
  activeCollection: any;
  sourceFolders: any[];
  addSourceFolder: (path: string) => Promise<void>;
  loadFromPath: (path: string) => Promise<void>;
  processedItems: PortfolioItem[];
  addToQueue: (items: PortfolioItem[]) => void;
  selectedItem: PortfolioItem | null;
  setOverlay: (key: OverlayKey, open: boolean) => void;
  showColorTags: boolean;
  setShowColorTags: (value: boolean) => void;
}

export const useAppHandlers = (params: UseAppHandlersParams): AppHandlers => {
  const {
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
  } = params;

  const handleDirectoryPicker = useCallback(async () => {
    try {
      if (!activeCollection) {
        alert(t('library:selectProjectPrompt'));
        setOverlay('collectionManager', true);
        return;
      }

      const selected = await open({
        directory: true,
        multiple: true,
        title: 'Sélectionner des Dossiers Source',
      });

      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];

        // Filter out existing source folders to prevent duplicates
        const existingPaths = new Set(sourceFolders.map((f: any) => f.path));
        const newPaths = paths.filter((path: string) => !existingPaths.has(path));

        if (newPaths.length < paths.length) {
          const skippedCount = paths.length - newPaths.length;
          alert(t('library:foldersSkipped', { count: skippedCount }));
        }

        for (const path of newPaths) {
          await addSourceFolder(path);
          await loadFromPath(path);
        }
      }
    } catch (e) {
      logger.debug('app', 'Cancelled', e);
    }
  }, [t, activeCollection, setOverlay, sourceFolders, addSourceFolder, loadFromPath]);

  const handleShareSelected = useCallback(async () => {
    // Implementation for sharing selected items
    logger.debug('app', 'Share selected items');
  }, []);

  const handleRunBatchAI = useCallback(() => {
    const itemsToProcess = processedItems.filter((item) => !item.aiDescription);
    if (itemsToProcess.length === 0) return alert(t('library:noUnanalyzedItems'));
    if (confirm(t('library:startAiAnalysisConfirm', { count: itemsToProcess.length }))) {
      addToQueue(itemsToProcess);
    }
  }, [t, processedItems, addToQueue]);

  const handleNext = useCallback(() => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx !== -1 && idx < processedItems.length - 1) {
      const nextItem = processedItems[idx + 1];
      if (nextItem) {
        // setSelectedItem(nextItem);
        // setFocusedId(nextItem.id); // Sync grid focus
      }
    }
  }, [selectedItem, processedItems]);

  const handlePrev = useCallback(() => {
    if (!selectedItem) return;
    const idx = processedItems.findIndex((i) => i.id === selectedItem.id);
    if (idx > 0) {
      const prevItem = processedItems[idx - 1];
      if (prevItem) {
        // setSelectedItem(prevItem);
        // setFocusedId(prevItem.id); // Sync grid focus
      }
    }
  }, [selectedItem, processedItems]);

  const toggleColorTags = useCallback(() => {
    setShowColorTags(!showColorTags);
  }, [showColorTags, setShowColorTags]);

  return {
    handleDirectoryPicker,
    handleShareSelected,
    handleRunBatchAI,
    handleNext,
    handlePrev,
    toggleColorTags,
  };
};
