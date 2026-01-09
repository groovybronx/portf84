import { useState, useCallback } from "react";

import { logger } from '../utils/logger';
interface SidebarLogic {
  isSidebarPinned: boolean;
  setIsSidebarPinned: (value: boolean) => void;
  handleSidebarToggle: () => void;
  handleSidebarClose: () => void;
}

interface UseSidebarLogicParams {
  initialPinned?: boolean;
  onFolderDrawerOpen?: () => void;
  onFolderDrawerClose?: () => void;
}

export const useSidebarLogic = ({
  initialPinned = false,
  onFolderDrawerOpen,
  onFolderDrawerClose,
}: UseSidebarLogicParams = {}): SidebarLogic => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(initialPinned);

  const handleSidebarToggle = useCallback(() => {
    // Priority toggle logic:
    // 1. If pinned, unpin and hide.
    // 2. If drawer open, close it.
    // 3. Otherwise open drawer.
    if (isSidebarPinned) {
      setIsSidebarPinned(false);
      onFolderDrawerClose?.();
    } else {
      onFolderDrawerOpen?.();
    }
  }, [isSidebarPinned, setIsSidebarPinned, onFolderDrawerOpen, onFolderDrawerClose]);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarPinned(false);
    onFolderDrawerClose?.();
  }, [setIsSidebarPinned, onFolderDrawerClose]);

  return {
    isSidebarPinned,
    setIsSidebarPinned,
    handleSidebarToggle,
    handleSidebarClose,
  };
};
