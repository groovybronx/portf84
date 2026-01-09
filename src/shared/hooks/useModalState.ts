import { useCallback, useMemo, useState } from 'react';

export type TagHubTab = 'browse' | 'manage' | 'fusion' | 'settings';

export type OverlayKey =
  | 'folderDrawer'
  | 'createFolderModal'
  | 'moveModal'
  | 'addTagModal'
  | 'settingsModal'
  | 'collectionManager'
  | 'smartCollectionBuilder'
  | 'tagHub'
  | 'batchTagPanel'
  | 'shortcutsHelp';

type OverlayState = Record<OverlayKey, boolean>;

const INITIAL_OVERLAY_STATE: OverlayState = {
  folderDrawer: false,
  createFolderModal: false,
  moveModal: false,
  addTagModal: false,
  settingsModal: false,
  collectionManager: false,
  smartCollectionBuilder: false,
  tagHub: false,
  batchTagPanel: false,
  shortcutsHelp: false,
};

export interface ModalManager {
  state: OverlayState;
  openOverlay: (key: OverlayKey) => void;
  closeOverlay: (key: OverlayKey) => void;
  toggleOverlay: (key: OverlayKey, value?: boolean) => void;
  isOpen: (key: OverlayKey) => boolean;
  closeAll: () => void;
  tagHubActiveTab: TagHubTab;
  setTagHubActiveTab: (tab: TagHubTab) => void;
}

/**
 * Gestionnaire générique pour toutes les surfaces modales/overlays
 */
export const useModalState = (): ModalManager => {
  const [overlays, setOverlays] = useState<OverlayState>(INITIAL_OVERLAY_STATE);
  const [tagHubActiveTab, setTagHubActiveTab] = useState<TagHubTab>('browse');

  const openOverlay = useCallback((key: OverlayKey) => {
    setOverlays((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeOverlay = useCallback((key: OverlayKey) => {
    setOverlays((prev) => ({ ...prev, [key]: false }));
  }, []);

  const toggleOverlay = useCallback((key: OverlayKey, value?: boolean) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: typeof value === 'boolean' ? value : !prev[key],
    }));
  }, []);

  const isOpen = useCallback((key: OverlayKey) => overlays[key], [overlays]);

  const closeAll = useCallback(() => {
    setOverlays(INITIAL_OVERLAY_STATE);
  }, []);

  const state = useMemo(() => overlays, [overlays]);

  return {
    state,
    openOverlay,
    closeOverlay,
    toggleOverlay,
    isOpen,
    closeAll,
    tagHubActiveTab,
    setTagHubActiveTab,
  };
};
