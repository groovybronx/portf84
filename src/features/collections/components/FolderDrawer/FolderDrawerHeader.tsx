import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../../shared/components/Icon';
import { Button, Flex, Stack } from '../../../../shared/components/ui';

interface FolderDrawerHeaderProps {
  totalItems?: number;
  onAdd?: () => void;
  onClose?: () => void;
}

export const FolderDrawerHeader: React.FC<FolderDrawerHeaderProps> = ({
  totalItems = 0,
  onAdd,
  onClose,
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
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-text-secondary hover:text-text-primary hover:bg-glass-bg-accent transition-all duration-300"
            title="Close"
          >
            <Icon action="close" size={18} className="transition-transform duration-300" />
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
