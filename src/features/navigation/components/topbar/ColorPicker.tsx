import React from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle, Eye, EyeOff } from 'lucide-react';
import { COLOR_PALETTE } from '../../../../shared/types';
import { Button, Flex, GlassCard } from '../../../../shared/components/ui';

import { logger } from '../../../../shared/utils/logger';
interface ColorPickerProps {
  activeColorFilter: string | null;
  onColorAction: (color: string | null) => void;
  showColorTags: boolean;
  onToggleColorTags: () => void;
  selectionMode: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  activeColorFilter,
  onColorAction,
  showColorTags,
  onToggleColorTags,
  selectionMode,
}) => {
  const { t } = useTranslation('navigation');
  return (
    <GlassCard variant="accent" padding="sm" border className="hidden lg:flex shrink-0">
      <Flex align="center" gap="sm">
        {Object.entries(COLOR_PALETTE).map(([key, hex]) => (
          <Button
            key={key}
            onClick={() => onColorAction(activeColorFilter === hex && !selectionMode ? null : hex)}
            variant="ghost"
            size="icon-sm"
            className={`rounded-full transition-all border shadow-sm ${
              activeColorFilter === hex && !selectionMode
                ? 'scale-125 border-white ring-2 ring-white/20'
                : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100 hover:border-white/30'
            }`}
            style={{ backgroundColor: hex }}
            aria-label={t('selectColor', { color: key })}
          />
        ))}
        <Button
          onClick={() => onColorAction(null)}
          variant="glass-icon"
          size="icon-sm"
          disabled={!activeColorFilter && !selectionMode}
          aria-label={t('clearFilter')}
          className={!activeColorFilter && !selectionMode ? 'opacity-30' : ''}
        >
          <XCircle size={14} />
        </Button>
        <div className="w-px h-4 bg-glass-border/10 mx-1" />
        <Button
          onClick={onToggleColorTags}
          variant="glass-icon"
          size="icon-sm"
          aria-label={t('toggleColorTags')}
          className={showColorTags ? 'text-white' : 'text-gray-500'}
        >
          {showColorTags ? <Eye size={14} /> : <EyeOff size={14} />}
        </Button>
      </Flex>
    </GlassCard>
  );
};
