
export enum ShortcutCategory {
    NAVIGATION = 'navigation',
    SELECTION = 'selection',
    ACTIONS = 'actions',
    VIEW = 'view',
    TAGGING = 'tagging',
    GENERAL = 'general',
}

export interface ShortcutDefinition {
    id: string;
    label: string; // Translation key
    keys: string[]; // ['Ctrl', 'T']
    category: ShortcutCategory;
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
    // Navigation
    { id: 'NAV_UP', label: 'shortcuts:navUp', keys: ['↑'], category: ShortcutCategory.NAVIGATION },
    { id: 'NAV_DOWN', label: 'shortcuts:navDown', keys: ['↓'], category: ShortcutCategory.NAVIGATION },
    { id: 'NAV_LEFT', label: 'shortcuts:navLeft', keys: ['←'], category: ShortcutCategory.NAVIGATION },
    { id: 'NAV_RIGHT', label: 'shortcuts:navRight', keys: ['→'], category: ShortcutCategory.NAVIGATION },
    
    // Selection
    { id: 'SELECT_ITEM', label: 'shortcuts:selectItem', keys: ['Space'], category: ShortcutCategory.SELECTION },
    { id: 'OPEN_ITEM', label: 'shortcuts:openItem', keys: ['Enter'], category: ShortcutCategory.SELECTION },
    { id: 'SELECT_ALL', label: 'shortcuts:selectAll', keys: ['Ctrl', 'A'], category: ShortcutCategory.SELECTION },
    { id: 'CLEAR_SELECTION', label: 'shortcuts:clearSelection', keys: ['Esc'], category: ShortcutCategory.SELECTION },

    // Actions
    { id: 'DELETE_ITEMS', label: 'shortcuts:deleteItems', keys: ['Delete'], category: ShortcutCategory.ACTIONS },
    { id: 'RENAME_ITEM', label: 'shortcuts:renameItem', keys: ['F2'], category: ShortcutCategory.ACTIONS },

    // Tagging
    { id: 'OPEN_TAG_HUB', label: 'shortcuts:openTagHub', keys: ['Ctrl', 'T'], category: ShortcutCategory.TAGGING },
    { id: 'BATCH_TAGGING', label: 'shortcuts:batchTagging', keys: ['Ctrl', 'Shift', 'T'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_RED', label: 'shortcuts:tagRed', keys: ['1'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_ORANGE', label: 'shortcuts:tagOrange', keys: ['2'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_YELLOW', label: 'shortcuts:tagYellow', keys: ['3'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_GREEN', label: 'shortcuts:tagGreen', keys: ['4'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_BLUE', label: 'shortcuts:tagBlue', keys: ['5'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_PURPLE', label: 'shortcuts:tagPurple', keys: ['6'], category: ShortcutCategory.TAGGING },
    { id: 'TAG_REMOVE', label: 'shortcuts:removeColorTag', keys: ['0'], category: ShortcutCategory.TAGGING },

    // General
    { id: 'HELP', label: 'shortcuts:help', keys: ['?'], category: ShortcutCategory.GENERAL },
];
