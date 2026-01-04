import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageTab } from '../src/features/tags/components/TagHub/ManageTab';
import * as tagService from '../src/services/storage/tags';
import '@testing-library/jest-dom';

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.count !== undefined ? `${key}_${options.count}` : key,
        i18n: {
             changeLanguage: () => new Promise(() => {}),
        }
    }),
    Trans: ({ i18nKey, children }: { i18nKey: string, children?: React.ReactNode }) => {
        return <span data-testid="trans-mock">{i18nKey} {children}</span>;
    },
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    }
}));

// Mock ConfirmDialog to avoid animation issues and make it synchronous
vi.mock('../src/shared/components/ui', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        ConfirmDialog: ({ isOpen, onConfirm, onClose, title }: any) => {
            if (!isOpen) return null;
            return (
                <div data-testid="confirm-dialog">
                    <h1>{title}</h1>
                    <button onClick={onConfirm} data-testid="dialog-confirm">Confirm</button>
                    <button onClick={onClose} data-testid="dialog-cancel">Cancel</button>
                </div>
            );
        },
    };
});

describe('ManageTab', () => {
    const mockTags = [
        { id: '1', name: 'Tag 1', type: 'manual' },
        { id: '2', name: 'Tag 2', type: 'manual' },
        { id: '3', name: 'Tag 3', type: 'ai' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return
        vi.spyOn(tagService, 'getAllTags').mockResolvedValue(mockTags as any);
        vi.spyOn(tagService, 'deleteTag').mockResolvedValue(undefined);
        vi.spyOn(tagService, 'mergeTags').mockResolvedValue(undefined);
    });

    it('renders tags list correctly', async () => {
        render(<ManageTab />);
        
        // Wait for tags to load
        await waitFor(() => {
            expect(screen.getByText('Tag 1')).toBeInTheDocument();
            expect(screen.getByText('Tag 2')).toBeInTheDocument();
            expect(screen.getByText('Tag 3')).toBeInTheDocument();
        });
        
        expect(screen.getByText('tags:totalTags')).toBeInTheDocument();
    });

    it('allows selecting tags', async () => {
        render(<ManageTab />);
        
        await waitFor(() => screen.getByText('Tag 1'));

        const tag1 = screen.getByText('Tag 1').closest('div');
        if (tag1) fireEvent.click(tag1);

        // There might be multiple elements with "tags:selected" (bulk bar and stats)
        // Use getAllByText and check that at least one is present, or check specific container
        const selectedTexts = screen.getAllByText(/tags:selected/);
        expect(selectedTexts.length).toBeGreaterThan(0);
        
        // Similarly for "tags:tags"
        const tagsTexts = screen.getAllByText(/1 tags:tags/);
        expect(tagsTexts.length).toBeGreaterThan(0);
    });

    it('shows delete confirmation when clicking delete', async () => {
        render(<ManageTab />);
        
        await waitFor(() => screen.getByText('Tag 1'));

        // Select Tag 1
        fireEvent.click(screen.getByText('Tag 1'));

        // Click Delete button
        fireEvent.click(screen.getByRole('button', { name: /tags:deleteSelected/ }));

        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        // Check that the dialog is actually showing the correct content
        const dialog = screen.getByTestId('confirm-dialog');
        expect(dialog).toHaveTextContent('tags:deleteSelected');
    });

    it('calls deleteTag when confirmed', async () => {
        render(<ManageTab />);
        
        await waitFor(() => screen.getByText('Tag 1'));

        // Select Tag 1
        fireEvent.click(screen.getByText('Tag 1'));
        
        // Click Delete - use specific selector
        fireEvent.click(screen.getByRole('button', { name: /tags:deleteSelected/ }));
        
        // Confirm
        fireEvent.click(screen.getByTestId('dialog-confirm'));

        await waitFor(() => {
            expect(tagService.deleteTag).toHaveBeenCalledWith('1');
        });
        expect(tagService.getAllTags).toHaveBeenCalledTimes(2);
    });

    it('does not delete when cancelled', async () => {
        render(<ManageTab />);
        
        await waitFor(() => screen.getByText('Tag 1'));

        fireEvent.click(screen.getByText('Tag 1'));
        fireEvent.click(screen.getByRole('button', { name: /tags:deleteSelected/ }));
        fireEvent.click(screen.getByTestId('dialog-cancel'));

        expect(tagService.deleteTag).not.toHaveBeenCalled();
    });
});

import { FusionTab } from '../src/features/tags/components/TagHub/FusionTab';
import * as analysisService from '../src/services/tagAnalysisService';

describe('FusionTab', () => {
    const mockGroups = [
        {
            target: { id: '1', name: 'target', type: 'manual' },
            candidates: [
                { id: '2', name: 'candidate1', type: 'ai' },
                { id: '3', name: 'candidate2', type: 'ai' }
            ]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(analysisService, 'analyzeTagRedundancy').mockResolvedValue(mockGroups as any);
        vi.spyOn(tagService, 'mergeTags').mockResolvedValue(undefined);
    });

    it('renders redundant groups', async () => {
        render(<FusionTab />);
        
        await waitFor(() => {
            expect(screen.getByText('target')).toBeInTheDocument();
        });
        expect(screen.getByText('candidate1')).toBeInTheDocument();
    });

    it('shows merge all confirmation', async () => {
        render(<FusionTab />);
        
        await waitFor(() => screen.getByText('target'));
        
        // Find Merge All button (can be tricky if there's also individual merge buttons)
        // Individual buttons text: "tags:merge"
        // Merge All button text: "tags:mergeAll"
        
        const mergeAllBtn = screen.getByRole('button', { name: /tags:mergeAll/ });
        fireEvent.click(mergeAllBtn);

        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        const dialog = screen.getByTestId('confirm-dialog');
        expect(dialog).toHaveTextContent('tags:mergeAll');
    });

    it('executes merge all when confirmed', async () => {
        render(<FusionTab />);
        
        await waitFor(() => screen.getByText('target'));
        
        fireEvent.click(screen.getByRole('button', { name: /tags:mergeAll/ }));
        fireEvent.click(screen.getByTestId('dialog-confirm'));

        await waitFor(() => {
             // mergeTags called for each group
            expect(tagService.mergeTags).toHaveBeenCalledWith('1', ['2', '3'], 'auto');
        });
        
        // Should reload analysis after merge
        expect(analysisService.analyzeTagRedundancy).toHaveBeenCalledTimes(2);
    });
});
