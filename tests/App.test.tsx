import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import React from 'react';

// Mock dependencies
vi.mock('../src/features/vision', () => ({
  ImageViewer: () => <div data-testid="image-viewer">ImageViewer</div>,
  analyzeImage: vi.fn(),
  analyzeImageStream: vi.fn(),
}));

vi.mock('../src/shared/contexts/ThemeContext', () => ({
  useTheme: () => ({
    settings: {
      primaryColor: '#3b82f6',
      glassBg: 'rgba(10, 10, 10, 0.8)',
    },
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/shared/contexts/SelectionContext', () => ({
  useSelection: () => ({
    selectedIds: new Set(),
    selectionMode: false,
    setSelectionMode: vi.fn(),
    clearSelection: vi.fn(),
  }),
  SelectionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/shared/contexts/LibraryContext', () => ({
  useLibrary: () => ({
    items: [],
    loading: false,
    activeFolderIds: new Set(),
    folders: [],
    currentItems: [],
    processedItems: [],
    sourceFolders: [],
    availableTags: [],
    searchTerm: "",
    setSearchTerm: vi.fn(),
    sortOption: "date",
    setSortOption: vi.fn(),
    sortDirection: "desc",
    setSortDirection: vi.fn(),
    selectedTag: null,
    setSelectedTag: vi.fn(),
    activeColorFilter: null,
    setActiveColorFilter: vi.fn(),
    viewMode: "grid",
    setViewMode: vi.fn(),
    gridColumns: 4,
    setGridColumns: vi.fn(),
    autoAnalyzeEnabled: false,
    useCinematicCarousel: false,
  }),
  LibraryProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/shared/contexts/CollectionsContext', () => ({
  useCollections: () => ({
    collections: [],
    folders: [],
  }),
  CollectionsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/shared/contexts/ProgressContext', () => ({
  useProgress: () => ({
    tasks: [],
  }),
  ProgressProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Tauri APIs
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
}));

vi.mock('../src/shared/hooks', () => ({
  useBatchAI: () => ({
    isBatchProcessing: false,
    batchProgress: 0,
    addToQueue: vi.fn(),
  }),
  useKeyboardShortcuts: vi.fn(),
  useModalState: () => ({
    isFolderDrawerOpen: false,
    setIsFolderDrawerOpen: vi.fn(),
    isCreateFolderModalOpen: false,
    setIsCreateFolderModalOpen: vi.fn(),
    isMoveModalOpen: false,
    setIsMoveModalOpen: vi.fn(),
    isAddTagModalOpen: false,
    setIsAddTagModalOpen: vi.fn(),
    isSettingsOpen: false,
    setIsSettingsOpen: vi.fn(),
    isCollectionManagerOpen: false,
    setIsCollectionManagerOpen: vi.fn(),
  }),
  useItemActions: () => ({
    addTagsToSelection: vi.fn(),
    applyColorTagToSelection: vi.fn(),
    analyzeItem: vi.fn(),
    moveItemToFolder: vi.fn(),
    createFolderAndMove: vi.fn(),
    handleContextMove: vi.fn(),
    handleContextAddTag: vi.fn(),
  }),
  useSidebarLogic: () => ({
    isSidebarPinned: false,
    setIsSidebarPinned: vi.fn(),
    handleSidebarToggle: vi.fn(),
    handleSidebarClose: vi.fn(),
  }),
  useAppHandlers: () => ({
    handleDirectoryPicker: vi.fn(),
    handleShareSelected: vi.fn(),
    handleRunBatchAI: vi.fn(),
    handleNext: vi.fn(),
    handlePrev: vi.fn(),
    toggleColorTags: vi.fn(),
  }),
}));

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Initial render might be empty or show loading,
    // but successful execution of render() confirms it doesn't crash.
    // We can also check for a known static element if available.
    // For now, simple crash test.
    expect(true).toBe(true);
  });
});
