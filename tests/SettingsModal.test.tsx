import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from '../src/shared/components/SettingsModal';
import { KEYBOARD_SHORTCUTS, ShortcutCategory } from '../src/shared/constants/shortcuts';
import '@testing-library/jest-dom';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
             changeLanguage: vi.fn(),
             language: 'en'
        }
    }),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-process', () => ({
    relaunch: vi.fn(),
}));

// Mock hooks
const mockUpdateShortcut = vi.fn();
const mockResetToDefaults = vi.fn();
const mockUpdateSetting = vi.fn();
const mockResetTheme = vi.fn();

vi.mock('../src/shared/hooks/useLocalShortcuts', () => ({
    useLocalShortcuts: () => ({
        shortcuts: {
            NAV_UP: ['ArrowUp'],
            TAG_RED: ['1']
        },
        updateShortcut: mockUpdateShortcut,
        resetToDefaults: mockResetToDefaults,
    }),
}));

vi.mock('../src/shared/contexts/ThemeContext', () => ({
    useTheme: () => ({
        settings: {
            primaryColor: '#3b82f6',
            glassBg: 'rgba(10, 10, 10, 0.8)'
        },
        updateSetting: mockUpdateSetting,
        resetTheme: mockResetTheme,
    }),
}));

vi.mock('../src/services/secureStorage', () => ({
    secureStorage: {
        getApiKey: vi.fn().mockResolvedValue('test-key'),
        saveApiKey: vi.fn(),
        clearApiKey: vi.fn(),
    }
}));

describe('SettingsModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders shortcuts tab with categories', async () => {
        render(<SettingsModal {...defaultProps} />);
        
        // Switch to Shortcuts tab
        fireEvent.click(screen.getByText('settings:shortcuts'));

        // Check for category headers
        expect(screen.getByText('shortcuts:category.navigation')).toBeInTheDocument();
        expect(screen.getByText('shortcuts:category.selection')).toBeInTheDocument();
        expect(screen.getByText('shortcuts:category.tagging')).toBeInTheDocument();
    });

    it('displays read-only shortcuts correctly', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('settings:shortcuts'));

        // Find a global shortcut (e.g. Select All)
        const selectAllShortcut = KEYBOARD_SHORTCUTS.find(s => s.id === 'SELECT_ALL');
        expect(selectAllShortcut).toBeDefined();

        // Check label is present
        expect(screen.getByText(selectAllShortcut!.label)).toBeInTheDocument();
        
        // Find the button/display for keys
        const keyDisplay = screen.getByText(selectAllShortcut!.keys.join(' + '));
        expect(keyDisplay).toBeInTheDocument();
        
        // Check it has disabled style or disabled attribute
        const button = keyDisplay.closest('button');
        expect(button).toBeDisabled();
    });

    it('displays editable shortcuts correctly', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('settings:shortcuts'));

        // Find a local shortcut (NAV_UP)
        const navUpDisplay = screen.getByText('ArrowUp');
        const button = navUpDisplay.closest('button');
        
        expect(button).not.toBeDisabled();
    });

    it('updates customizable shortcuts', async () => {
        // Mock window.prompt
        const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('W');

        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('settings:shortcuts'));

        // Click on NAV_UP
        const navUpDisplay = screen.getByText('ArrowUp');
        fireEvent.click(navUpDisplay);

        expect(promptSpy).toHaveBeenCalled();
        expect(mockUpdateShortcut).toHaveBeenCalledWith('NAV_UP', ['W']);
    });

    it('resets shortcuts to defaults', () => {
        render(<SettingsModal {...defaultProps} />);
        fireEvent.click(screen.getByText('settings:shortcuts'));

        fireEvent.click(screen.getByText('settings:resetDefaults'));

        expect(mockResetToDefaults).toHaveBeenCalled();
    });
});
