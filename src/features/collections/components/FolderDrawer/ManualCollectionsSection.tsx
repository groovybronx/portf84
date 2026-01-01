import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../../shared/components/Icon";
import { Button, Flex, Stack } from "../../../../shared/components/ui";
import { Folder as FolderType, Collection } from "../../../../shared/types";
import { FolderItem } from "./FolderItem";
import { useTheme } from "../../../../shared/contexts/ThemeContext";

interface ManualCollectionsSectionProps {
  folders: FolderType[];
  activeFolderId: Set<string>;
  onSelectFolder: (id: string) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  activeCollection: Collection | null;
  onColorFilterChange?: (color: string | null) => void;
}

export const ManualCollectionsSection: React.FC<ManualCollectionsSectionProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  activeCollection,
  onColorFilterChange,
}) => {
  const { t } = useTranslation("library");
  const { settings } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (id: string) => {
    onSelectFolder(id);
    onColorFilterChange?.(null);
  };

  const toggleSection = () => setIsExpanded(!isExpanded);

  // Count active selections within this section
  const selectedCount = folders.filter((f) => activeFolderId.has(f.id)).length;

  return (
    <div>
      <Flex
        align="center"
        justify="between"
        onClick={toggleSection}
        className={`group relative w-full mb-2 px-3 py-2 rounded-xl transition-all duration-300 border cursor-pointer ${
          isExpanded
            ? "bg-tertiary/10 border-tertiary/20 shadow-lg shadow-tertiary/20" 
            : "hover:bg-tertiary/5 border-transparent"
        }`}
      >
        <p className="text-xs uppercase font-bold tracking-wider flex items-center gap-2 text-tertiary">
          <Icon action={settings.tertiaryIcon} size={14} className="text-tertiary" />
          <span>{t('collections')}</span>
        </p>
        <Flex align="center" gap="sm">
          {selectedCount > 0 && !activeFolderId.has("all") && (
            <span className="text-tertiary text-[10px] bg-tertiary/10 px-2 py-0.5 rounded-full">
              {t('selectedCount', { count: selectedCount })}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder();
            }}
            disabled={!activeCollection}
            className="h-6 w-6 text-tertiary hover:text-white hover:bg-tertiary/20 rounded-md transition-colors"
            title={t('addCollection')}
          >
            <Icon action="add" size={14} />
          </Button>

          <Icon action="next"
            size={14}
            className={`transition-transform duration-300 text-secondary ${
              isExpanded ? "rotate-90" : "opacity-50"
            }`}
          />
        </Flex>


      </Flex>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {folders.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-3 italic">
                {t('noCollectionsCreated')}
              </p>
            ) : (
              <Stack gap="xs" className="pl-2">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId.has(folder.id)}
                    onSelect={handleSelect}
                    onDelete={onDeleteFolder}
                    iconAction="folder_heart"
                    iconColorClass="text-tertiary"
                    iconBgClass="bg-tertiary/10"
                  />
                ))}
              </Stack>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
