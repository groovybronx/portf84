import React from 'react';
import { Flex, Stack } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

import { logger } from '../../../../shared/utils/logger';
interface PreviewChange {
  type: 'add' | 'remove';
  tag: string;
  itemCount: number;
}

interface PreviewSectionProps {
  changes: PreviewChange[];
  totalItems: number;
}

/**
 * PreviewSection - Shows a preview of changes before they're applied
 * Displays what will be added/removed and to how many items
 */
export const PreviewSection: React.FC<PreviewSectionProps> = ({ changes, totalItems }) => {
  const { t } = useTranslation('tags');

  if (changes.length === 0) return null;

  const additions = changes.filter((c) => c.type === 'add');
  const removals = changes.filter((c) => c.type === 'remove');

  return (
    <Stack spacing="sm" className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
      <Flex align="center" gap="sm">
        <span className="text-sm font-medium text-white">📊 {t('preview')}</span>
        <span className="text-xs text-gray-400">
          {t('itemsWillBeUpdated', { count: totalItems })}
        </span>
      </Flex>

      <Stack spacing="xs" className="text-sm">
        {additions.length > 0 && (
          <Flex align="start" gap="sm">
            <span className="text-green-400 shrink-0">+</span>
            <span className="text-gray-300">
              {t('tagsAddedToItems', {
                count: additions.length,
                items: totalItems,
              })}
              {': '}
              <span className="text-green-300 font-medium">
                {additions.map((a) => a.tag).join(', ')}
              </span>
            </span>
          </Flex>
        )}

        {removals.length > 0 && (
          <Flex align="start" gap="sm">
            <span className="text-red-400 shrink-0">−</span>
            <span className="text-gray-300">
              {t('tagsRemovedFromItems', {
                count: removals.length,
                items: totalItems,
              })}
              {': '}
              <span className="text-red-300 font-medium">
                {removals.map((r) => r.tag).join(', ')}
              </span>
            </span>
          </Flex>
        )}
      </Stack>
    </Stack>
  );
};
