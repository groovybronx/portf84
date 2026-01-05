import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button, Flex, Stack } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

interface PartialTag {
  name: string;
  count: number;
  total: number;
}

interface PartialTagsProps {
  tags: PartialTag[];
  onAddToAll: (tag: string) => void;
  onRemoveFromAll: (tag: string) => void;
}

/**
 * PartialTags - Shows tags that are present on SOME (but not all) selected items
 * Shows count and percentage with progress bar
 * Can be added to all or removed from all
 */
export const PartialTags: React.FC<PartialTagsProps> = ({ tags, onAddToAll, onRemoveFromAll }) => {
  const { t } = useTranslation('tags');

  if (tags.length === 0) return null;

  return (
    <Stack spacing="sm">
      <Flex align="center" gap="sm">
        <span className="text-sm font-medium text-white">⚠️ {t('partialTags')}</span>
        <span className="text-xs text-gray-400">({tags.length})</span>
      </Flex>
      <Stack spacing="sm" className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
        {tags.map((tag) => {
          const percentage = Math.round((tag.count / tag.total) * 100);
          return (
            <Stack
              spacing="xs"
              key={tag.name}
              className="p-2 bg-black/20 rounded border border-white/5"
            >
              <Flex align="center" justify="between" gap="sm">
                <Flex align="center" gap="sm" className="flex-1 min-w-0">
                  <span className="text-sm text-gray-300 font-medium truncate">{tag.name}</span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {tag.count}/{tag.total} ({percentage}%)
                  </span>
                </Flex>
                <Flex gap="xs" className="shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToAll(tag.name)}
                    className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/20 border border-green-500/30"
                    title={t('addToAll')}
                  >
                    <Plus size={12} />
                    <span className="hidden sm:inline ml-1">{t('addToAll')}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromAll(tag.name)}
                    className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/20 border border-red-500/30"
                    title={t('removeFromAll')}
                  >
                    <Minus size={12} />
                    <span className="hidden sm:inline ml-1">{t('removeFromAll')}</span>
                  </Button>
                </Flex>
              </Flex>
              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-yellow-500/60 h-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
