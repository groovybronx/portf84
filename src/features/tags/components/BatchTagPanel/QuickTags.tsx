import React from 'react';
import { Button, Flex, Stack } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

interface QuickTagsProps {
  tags: string[];
  appliedTags: Set<string>;
  onToggle: (tag: string) => void;
}

/**
 * QuickTags - Shows frequently used tags for quick access
 * Tags can be toggled on/off with a single click
 */
export const QuickTags: React.FC<QuickTagsProps> = ({ tags, appliedTags, onToggle }) => {
  const { t } = useTranslation('tags');

  if (tags.length === 0) return null;

  return (
    <Stack spacing="sm">
      <Flex align="center" gap="sm">
        <span className="text-sm font-medium text-white">⚡ {t('quickTags')}</span>
      </Flex>
      <Flex wrap="wrap" gap="sm">
        {tags.map((tag) => {
          const isApplied = appliedTags.has(tag);
          return (
            <Button
              key={tag}
              variant="ghost"
              size="sm"
              onClick={() => onToggle(tag)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                isApplied
                  ? 'bg-blue-500/30 border-blue-500/50 text-blue-200 font-medium'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {tag}
            </Button>
          );
        })}
      </Flex>
    </Stack>
  );
};
