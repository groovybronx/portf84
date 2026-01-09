import { useState } from 'react';

export type TagHubTab = 'browse' | 'manage' | 'fusion' | 'settings';

export interface ModalState {
  // States
  isFolderDrawerOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isMoveModalOpen: boolean;
  isAddTagModalOpen: boolean;
  isSettingsOpen: boolean;
  isCollectionManagerOpen: boolean;
  isSmartCollectionBuilderOpen: boolean;

  isTagHubOpen: boolean;
  isBatchTagPanelOpen: boolean;
  isShortcutsHelpOpen: boolean;

  // Tag Hub active tab
  tagHubActiveTab: TagHubTab;

  // Actions
  setIsFolderDrawerOpen: (open: boolean) => void;
  setIsCreateFolderModalOpen: (open: boolean) => void;
  setIsMoveModalOpen: (open: boolean) => void;
  setIsAddTagModalOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsCollectionManagerOpen: (open: boolean) => void;
  setIsSmartCollectionBuilderOpen: (open: boolean) => void;

  setIsTagHubOpen: (open: boolean) => void;
  setTagHubActiveTab: (tab: TagHubTab) => void;
  setIsBatchTagPanelOpen: (open: boolean) => void;
  setIsShortcutsHelpOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing modal states
 * Centralizes all modal open/close states in one place
 */
export const useModalState = (): ModalState => {
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollectionManagerOpen, setIsCollectionManagerOpen] = useState(false);
  const [isSmartCollectionBuilderOpen, setIsSmartCollectionBuilderOpen] = useState(false);

  const [isTagHubOpen, setIsTagHubOpen] = useState(false);
  const [isBatchTagPanelOpen, setIsBatchTagPanelOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [tagHubActiveTab, setTagHubActiveTab] = useState<TagHubTab>('browse');

  return {
    // States
    isFolderDrawerOpen,
    isCreateFolderModalOpen,
    isMoveModalOpen,
    isAddTagModalOpen,
    isSettingsOpen,
    isCollectionManagerOpen,
    isSmartCollectionBuilderOpen,

    isTagHubOpen,
    isBatchTagPanelOpen,
    tagHubActiveTab,

    // Actions
    setIsFolderDrawerOpen,
    setIsCreateFolderModalOpen,
    setIsMoveModalOpen,
    setIsAddTagModalOpen,
    setIsSettingsOpen,
    setIsCollectionManagerOpen,
    setIsSmartCollectionBuilderOpen,

    setIsTagHubOpen,
    setTagHubActiveTab,

    // Batch Tag Panel
    // Batch Tag Panel
    setIsBatchTagPanelOpen,

    // Shortcuts Help
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
  };
};
