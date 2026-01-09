import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Grid } from '../ui';
import { Icon } from '../Icon';
import { useLocalShortcuts, ShortcutMap } from '../../hooks/useLocalShortcuts';
import { KEYBOARD_SHORTCUTS, ShortcutCategory } from '../../constants/shortcuts';

import { logger } from '../../utils/logger';
// Helper for Shortcuts to clean up main component
const ShortcutRow = ({
  label,
  id,
  defaultKeys,
  shortcuts,
  update,
}: {
  label: string;
  id: string;
  defaultKeys: string[];
  shortcuts: ShortcutMap;
  update: (action: keyof ShortcutMap, keys: string[]) => void;
}) => {
  // Check if this shortcut is manageable via useLocalShortcuts
  const isCustomizable = id in shortcuts;
  const currentKeys = isCustomizable ? shortcuts[id as keyof ShortcutMap] : defaultKeys;

  return (
    <div className="flex items-center justify-between group">
      <span className="text-sm text-white/70 group-hover:text-white transition-colors">
        {label}
      </span>
      <Button
        variant="glass"
        size="sm"
        className={`px-3 py-1.5 text-xs font-mono min-w-12 text-center focus:ring-2 focus:ring-primary ${
          isCustomizable
            ? 'text-primary cursor-pointer'
            : 'text-white/50 cursor-default hover:bg-white/5'
        }`}
        onClick={() => {
          if (!isCustomizable) return;
          // Simple prompt for now, could be improved with a key recorder
          const key = prompt('Press a key (e.g., ArrowUp, a, b, Enter)');
          if (key) update(id as keyof ShortcutMap, [key]);
        }}
        disabled={!isCustomizable}
      >
        {currentKeys.join(' + ')}
      </Button>
    </div>
  );
};

export const ShortcutEditor: React.FC = () => {
  const { t } = useTranslation(['settings', 'shortcuts']);
  const { shortcuts, updateShortcut, resetToDefaults } = useLocalShortcuts();

  return (
    <Stack spacing="lg" className="max-w-2xl">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <p className="text-sm text-white/60">{t('settings:customizeWorkflow')}</p>
        <Button
          onClick={resetToDefaults}
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
        >
          <Icon action="reset" size={12} /> {t('settings:resetDefaults')}
        </Button>
      </div>

      <Grid cols={2} responsive className="gap-x-12 gap-y-8">
        {Object.values(ShortcutCategory).map((category) => {
          const categoryShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === category);
          if (!categoryShortcuts.length) return null;

          return (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                {t(`shortcuts:category.${category}` as any)}
              </h4>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.id}
                    label={t(shortcut.label as any)}
                    id={shortcut.id}
                    defaultKeys={shortcut.keys}
                    shortcuts={shortcuts}
                    update={updateShortcut}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </Grid>
    </Stack>
  );
};
