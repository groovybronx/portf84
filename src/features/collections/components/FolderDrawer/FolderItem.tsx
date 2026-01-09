import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, IconAction } from '../../../../shared/components/Icon';
import { Button, Flex, Stack, GlassCard } from '../../../../shared/components/ui';
import { Folder as FolderType } from '../../../../shared/types';

interface FolderItemProps {
  folder: FolderType;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  iconAction: IconAction;
  iconColorClass: string;
  iconBgClass: string;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isActive,
  onSelect,
  onDelete,
  iconAction,
  iconColorClass,
  iconBgClass,
}) => {
  const { t } = useTranslation('library');
  return (
    <GlassCard
      variant={isActive ? 'card' : 'accent'}
      padding="sm"
      border={isActive}
      className={`group relative cursor-pointer transition-all text-sm ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      onClick={() => onSelect(folder.id)}
    >
      <Flex align="center" gap="sm">
        <div
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(folder.id);
          }}
        >
          {isActive ? (
            <Icon action="check_circle" size={16} className="text-blue-500" />
          ) : (
            <Icon action="circle" size={16} className="text-gray-600 group-hover:text-gray-400" />
          )}
        </div>

        <Flex
          align="center"
          justify="center"
          className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-glass-border-light ${iconBgClass}`}
        >
          <Icon action={iconAction} size={16} className={iconColorClass} />
        </Flex>

        <Stack spacing="none" className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${isActive ? 'text-white' : iconColorClass}`}>
            {folder.name}
          </p>
          <span className="text-xs text-secondary-bright/50">
            {t('itemCount', { count: folder.items.length })}
          </span>
        </Stack>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete(folder.id);
            }}
            className="opacity-0 group-hover:opacity-100 h-7 w-7 text-gray-500 hover:text-red-400 hover:bg-red-500/20"
            title={t('deleteCollection')}
          >
            <Icon action="delete" size={14} />
          </Button>
        )}
      </Flex>
    </GlassCard>
  );
};
