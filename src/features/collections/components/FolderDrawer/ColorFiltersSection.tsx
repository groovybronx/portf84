import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Folder as FolderType, COLOR_PALETTE } from '../../../../shared/types';
import { getColorName } from '../../../../services/storage/folders';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import { Button, Flex, Stack, GlassCard } from '../../../../shared/components/ui';

interface ColorFiltersSectionProps {
  folders: FolderType[];
  activeColorFilter?: string | null;
  onColorFilterChange?: (color: string | null) => void;
  onSelectFolder: (id: string) => void; // To reset to 'all' when picking color
}

export const ColorFiltersSection: React.FC<ColorFiltersSectionProps> = ({
  folders,
  activeColorFilter,
  onColorFilterChange,
  onSelectFolder,
}) => {
  const { t } = useTranslation('library');
  const { settings } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSection = () => setIsExpanded(!isExpanded);

  return (
    <div>
      <Button
        variant="ghost"
        onClick={toggleSection}
        className={`w-full mb-2 px-3 py-2 rounded-xl transition-all duration-300 border ${
          isExpanded
            ? 'bg-primary/10 border-primary/20 shadow-[0_0_15px_-5px_var(--color-primary)]'
            : 'hover:bg-primary/5 border-transparent'
        }`}
      >
        <Flex justify="between" align="center" className="w-full">
          <h3 className="text-secondary-bright/40 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Palette size={12} /> {t('colorFiltersTitle')}
          </h3>
          <ChevronRight
            size={14}
            className={`transition-transform duration-300 text-primary ${
              isExpanded ? 'rotate-90' : 'opacity-50'
            }`}
          />
        </Flex>
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Stack spacing="xs" className="pl-2">
              {Object.entries(COLOR_PALETTE).map(([key, hex]) => {
                const colorName = getColorName(hex);
                // Count items with this color (unique items across all folders)
                const uniqueItems = new Set();
                folders.forEach((f) =>
                  f.items.filter((i) => i.colorTag === hex).forEach((i) => uniqueItems.add(i.id))
                );
                const count = uniqueItems.size;

                const isActive = activeColorFilter === hex;

                return (
                  <GlassCard
                    variant={isActive ? 'card' : 'accent'}
                    padding="sm"
                    border={isActive}
                    as={Button}
                    key={hex}
                    onClick={() => {
                      if (onColorFilterChange) {
                        if (isActive) {
                          onColorFilterChange(null);
                        } else {
                          onSelectFolder('all'); // Switch to "All" scope
                          onColorFilterChange(hex);
                        }
                      }
                    }}
                    className={`w-full group relative cursor-pointer transition-all text-sm h-auto ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Flex align="center" gap="md" className="w-full">
                      <div className="shrink-0">
                        {isActive ? (
                          <CheckCircle2 size={16} style={{ color: hex }} />
                        ) : (
                          <Circle size={16} className="text-gray-600 group-hover:text-gray-400" />
                        )}
                      </div>

                      <Flex
                        align="center"
                        justify="center"
                        className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-glass-border-light transition-all"
                        style={{
                          backgroundColor: `${hex}15`, // 10% opacity hex
                          borderColor: isActive ? hex : 'transparent',
                        }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hex }} />
                      </Flex>

                      <Stack spacing="none" className="flex-1 min-w-0 text-left">
                        <p
                          className={`font-medium text-sm truncate ${isActive ? 'text-white' : ''}`}
                        >
                          {colorName}
                        </p>
                        <p className="text-xs opacity-60">
                          {count} {t('items')}
                        </p>
                      </Stack>
                    </Flex>
                  </GlassCard>
                );
              })}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
