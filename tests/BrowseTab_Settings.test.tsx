import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowseTab } from '../src/features/tags/components/TagHub/BrowseTab';
import * as tagHubSettings from '../src/shared/utils/tagHubSettings';
import * as tagsStorage from '../src/services/storage/tags';

import { logger } from './shared/utils/logger';
// Mock the storage module
vi.mock('../src/services/storage/tags', () => ({
  getTagsWithUsageStats: vi.fn(),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('BrowseTab Settings Persistence', () => {
  const mockTags = [
    { id: '1', name: 'test-tag', type: 'manual' as const, usageCount: 5 },
    { id: '2', name: 'ai-tag', type: 'ai' as const, usageCount: 3 },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(tagsStorage.getTagsWithUsageStats).mockResolvedValue(mockTags);
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should load settings from localStorage on mount', async () => {
    const customSettings: tagHubSettings.TagHubSettings = {
      ...tagHubSettings.DEFAULT_TAGHUB_SETTINGS,
      viewMode: 'list',
      filterMode: 'manual',
    };

    tagHubSettings.saveTagHubSettings(customSettings);

    render(<BrowseTab />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    // Verify the settings were loaded
    // The list view button should be active (has specific styling)
    const listButton = screen.getByLabelText('tags:listView');
    expect(listButton).toHaveClass('bg-primary'); // Correction des assertions de classes CSS
  });

  it('should save settings when viewMode changes', async () => {
    const saveSpy = vi.spyOn(tagHubSettings, 'saveTagHubSettings');

    render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    // Click the list view button
    const listButton = screen.getByLabelText('tags:listView');
    await userEvent.click(listButton);

    // Wait for debounced save (500ms)
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    }, { timeout: 1000 });

    const savedSettings = saveSpy.mock.calls[0]?.[0];
    expect(savedSettings?.viewMode).toBe('list');
  });

  it('should save settings when filterMode changes', async () => {
    const saveSpy = vi.spyOn(tagHubSettings, 'saveTagHubSettings');

    render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    // Click the manual tags filter button - use getByRole to be more specific
    const manualButton = screen.getByRole('button', { name: 'tags:manualTags' });
    await userEvent.click(manualButton);

    // Wait for debounced save (500ms)
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    }, { timeout: 1000 });

    const savedSettings = saveSpy.mock.calls[0]?.[0];
    expect(savedSettings?.filterMode).toBe('manual');
  });

  it('should debounce settings saves', async () => {
    const saveSpy = vi.spyOn(tagHubSettings, 'saveTagHubSettings');

    render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    // Make multiple rapid changes
    const listButton = screen.getByLabelText('tags:listView');
    const gridButton = screen.getByLabelText('tags:gridView');

    await userEvent.click(listButton);
    await userEvent.click(gridButton);
    await userEvent.click(listButton);

    // Should only save once after debounce period
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it('should cleanup timeout on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    // Make a change to create a timeout
    const listButton = screen.getByLabelText('tags:listView');
    await userEvent.click(listButton);

    // Unmount before timeout fires
    unmount();

    // Verify clearTimeout was called
    await waitFor(() => {
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  it('should persist viewMode across remounts', async () => {
    const saveSpy = vi.spyOn(tagHubSettings, 'saveTagHubSettings');

    // First mount - change to list view
    const { unmount } = render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    const listButton = screen.getByLabelText('tags:listView');
    await userEvent.click(listButton);

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    }, { timeout: 1000 });

    unmount();

    // Second mount - should load list view
    render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    const listButtonAfterRemount = screen.getByLabelText('tags:listView');
    expect(listButtonAfterRemount).toHaveClass('bg-primary');
  });

  it('should handle load errors gracefully', async () => {
    vi.spyOn(tagHubSettings, 'loadTagHubSettings').mockImplementationOnce(() => {
      throw new Error('Load error');
    });

    // Should not crash, fall back to defaults
    expect(() => render(<BrowseTab />)).not.toThrow();
  });

  it('should update settings object without mutating', async () => {
    const saveSpy = vi.spyOn(tagHubSettings, 'saveTagHubSettings');

    render(<BrowseTab />);

    await waitFor(() => {
      expect(screen.queryByText('common:loading')).not.toBeInTheDocument();
    });

    const listButton = screen.getByLabelText('tags:listView');
    await userEvent.click(listButton);

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    }, { timeout: 1000 });

    const savedSettings = saveSpy.mock.calls[0]?.[0];

    // Should have all properties from default settings plus the change
    expect(savedSettings).toHaveProperty('viewMode', 'list');
    expect(savedSettings).toHaveProperty('sortBy');
    expect(savedSettings).toHaveProperty('sortDirection');
    expect(savedSettings).toHaveProperty('filterMode');
    expect(savedSettings).toHaveProperty('showUsageCount');
    expect(savedSettings).toHaveProperty('version');
    expect(savedSettings).toHaveProperty('lastUpdated');
  });
});
