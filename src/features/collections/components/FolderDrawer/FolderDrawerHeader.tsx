import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../../shared/components/Icon';
import { Button, Flex, Stack } from '../../../../shared/components/ui';

interface FolderDrawerHeaderProps {
  isPinned: boolean;
  onTogglePin?: () => void;
  totalItems?: number;
  onAdd?: () => void;
}

export const FolderDrawerHeader: React.FC<FolderDrawerHeaderProps> = ({
  isPinned,
  onTogglePin,
  totalItems = 0,
  onAdd,
}) => {
  const { t } = useTranslation(['library', 'navigation']);
  return (
    <Flex justify="between" align="center" className="mb-6">
      <Stack spacing="none">
        <Flex align="center" gap="sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flex align="center" gap="sm">
              <Icon action="library" className="text-primary" /> {t('library:library')}
            </Flex>
          </h2>
          {onAdd && (
            <Button
              variant="glass-icon"
              size="icon-sm"
              onClick={onAdd}
              title={t('library:manageProjects')}
              aria-label="Add project"
            >
              <Icon action="add" size={16} />
            </Button>
          )}
        </Flex>
        <span className="text-xs text-gray-500 font-medium ml-8">
          {t('library:itemCount', { count: totalItems })}
        </span>
      </Stack>
      <Flex align="center" gap="xs">
        {onTogglePin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePin}
            className={`rounded-full transition-all duration-300 ${
              isPinned
                ? 'text-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-glass-bg-accent'
            }`}
            title={isPinned ? t('navigation:unpinLibrary') : t('navigation:pinLibrary')}
          >
            <Icon
              action="pin"
              size={18}
              className={`transition-transform duration-300 ${
                isPinned ? 'fill-current' : 'rotate-45'
              }`}
            />
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
