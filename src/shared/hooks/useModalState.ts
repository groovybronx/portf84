import { useState, useCallback } from "react";

export type TagHubTab = "browse" | "manage" | "fusion" | "settings";

export interface ModalState {
  // States
  isFolderDrawerOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isMoveModalOpen: boolean;
  isAddTagModalOpen: boolean;
  isSettingsOpen: boolean;
  isCollectionManagerOpen: boolean;
  isSmartCollectionBuilderOpen: boolean;
  isTagStudioOpen: boolean;
  isTagHubOpen: boolean;

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
  setIsTagStudioOpen: (open: boolean) => void;
  setIsTagHubOpen: (open: boolean) => void;
  setTagHubActiveTab: (tab: TagHubTab) => void;
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
  const [isTagStudioOpen, setIsTagStudioOpen] = useState(false);
  const [isTagHubOpen, setIsTagHubOpen] = useState(false);
  const [tagHubActiveTab, setTagHubActiveTab] = useState<TagHubTab>("browse");

  return {
    // States
    isFolderDrawerOpen,
    isCreateFolderModalOpen,
    isMoveModalOpen,
    isAddTagModalOpen,
    isSettingsOpen,
    isCollectionManagerOpen,
    isSmartCollectionBuilderOpen,
    isTagStudioOpen,
    isTagHubOpen,
    tagHubActiveTab,

    // Actions
    setIsFolderDrawerOpen,
    setIsCreateFolderModalOpen,
    setIsMoveModalOpen,
    setIsAddTagModalOpen,
    setIsSettingsOpen,
    setIsCollectionManagerOpen,
    setIsSmartCollectionBuilderOpen,
    setIsTagStudioOpen,
    setIsTagHubOpen,
    setTagHubActiveTab,
  };
};
