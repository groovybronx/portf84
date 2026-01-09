import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TagHub } from '../src/features/tags/components/TagHub';
import { logger } from './shared/utils/logger';
import '@testing-library/jest-dom';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

// Mock getAllTags service
vi.mock('../src/services/storage/tags', () => ({
  getAllTags: vi.fn().mockResolvedValue([
    { id: 'tag-1', name: 'landscape', type: 'manual' },
    { id: 'tag-2', name: 'portrait', type: 'ai' },
  ]),
  deleteTag: vi.fn(),
  mergeTags: vi.fn(),
  getTagsWithUsageStats: vi.fn().mockResolvedValue([]),
}));

// Mock tag analysis service
vi.mock('../src/services/tagAnalysisService', () => ({
  analyzeTagRedundancy: vi.fn().mockResolvedValue([]),
}));

describe('TagHub', () => {
  it('should render Tag Hub when open', async () => {
    const mockOnClose = vi.fn();
    const mockOnTabChange = vi.fn();

    await act(async () => {
      render(
        <TagHub
          isOpen={true}
          onClose={mockOnClose}
          activeTab="browse"
          onTabChange={mockOnTabChange}
        />
      );
    });

    // Check that Tag Hub title is rendered
    expect(screen.getByText('tags:tagHub')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', async () => {
    const mockOnClose = vi.fn();
    const mockOnTabChange = vi.fn();

    await act(async () => {
      render(
        <TagHub
          isOpen={true}
          onClose={mockOnClose}
          activeTab="browse"
          onTabChange={mockOnTabChange}
        />
      );
    });

    // Click on Manage tab (second tab button)
    const tabs = screen.getAllByRole('button');
    const manageTab = tabs.find((tab) => tab.textContent?.includes('tags:manage'));

    if (manageTab) {
      await act(async () => {
        fireEvent.click(manageTab);
      });
      expect(mockOnTabChange).toHaveBeenCalledWith('manage');
    }
  });

  it('should close when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    const mockOnTabChange = vi.fn();

    await act(async () => {
      render(
        <TagHub
          isOpen={true}
          onClose={mockOnClose}
          activeTab="browse"
          onTabChange={mockOnTabChange}
        />
      );
    });

    // Find and click close button by its accessible label
    const closeButton = screen.getByLabelText('common:close');
    await act(async () => {
      fireEvent.click(closeButton);
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not render when closed', async () => {
    const mockOnClose = vi.fn();
    const mockOnTabChange = vi.fn();

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <TagHub
          isOpen={false}
          onClose={mockOnClose}
          activeTab="browse"
          onTabChange={mockOnTabChange}
        />
      );
      container = result.container;
    });

    // When closed, the component should render nothing
    expect(container!.firstChild).toBeNull();
  });
});
