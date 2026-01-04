import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../../shared/components/Icon";
import { Button } from "../../../../shared/components/ui";
import { Folder as FolderType, Collection, SourceFolder } from "../../../../shared/types";
import { FolderItem } from "./FolderItem";
import { useTheme } from "../../../../shared/contexts/ThemeContext";

interface ShadowFoldersSectionProps {
  folders: FolderType[];
  sourceFolders: SourceFolder[];
  activeFolderId: Set<string>;
  onSelectFolder: (id: string) => void;
  onImportFolder: () => void;
  onRemoveFolder?: (path: string) => void;
  activeCollection: Collection | null;
  onColorFilterChange?: (color: string | null) => void;
}

export const ShadowFoldersSection: React.FC<ShadowFoldersSectionProps> = ({
  folders,
  sourceFolders,
  activeFolderId,
  onSelectFolder,
  onImportFolder,
  onRemoveFolder,
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

  return (
    <div>
      <div
        onClick={toggleSection}
        className={`group relative w-full flex items-center justify-between mb-2 px-3 py-2 rounded-xl transition-all duration-300 border cursor-pointer ${
          isExpanded
            ? "bg-quaternary/10 border-quaternary/20 shadow-lg shadow-quaternary/20"
            : "hover:bg-quaternary/5 border-transparent"
        }`}
      >
        <p className="text-xs uppercase font-bold tracking-wider flex items-center gap-2 text-quaternary">
          <Icon action={settings.quaternaryIcon} size={14} className="text-quaternary" />
          <span>{t('workFolders')}</span>
        </p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isExpanded
                ? "bg-quaternary/20 text-quaternary"
                : "bg-quaternary/10 text-quaternary/70"
            }`}
          >
            {folders.length}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onImportFolder();
            }}
            disabled={!activeCollection}
            className="h-6 w-6 text-quaternary hover:text-white hover:bg-quaternary/20 rounded-md transition-colors"
            title={t('addFolder')}
          >
            <Icon action="add" size={14} />
          </Button>

          <Icon action="next"
            size={14}
            className={`transition-transform duration-300 text-quaternary ${
              isExpanded ? "rotate-90" : "opacity-50"
            }`}
          />

      </div>


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
                {t('noWorkFolders')}
              </p>
            ) : (
              <div className="space-y-1 pl-2">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId.has(folder.id)}
                    onSelect={handleSelect}
                    onDelete={onRemoveFolder ? () => {
                      const sourceFolder = sourceFolders.find(sf => sf.id === folder.sourceFolderId);
                      if (sourceFolder?.path) {
                        onRemoveFolder(sourceFolder.path);
                      }
                    } : undefined}
                    iconAction="hard_drive"
                    iconColorClass="text-quaternary"
                    iconBgClass="bg-quaternary/10"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
