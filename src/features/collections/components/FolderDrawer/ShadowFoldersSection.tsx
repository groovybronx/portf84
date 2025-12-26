import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../../shared/components/Icon";
import { Button } from "../../../../shared/components/ui";
import { Folder as FolderType, Collection } from "../../../../shared/types";
import { FolderItem } from "./FolderItem";

interface ShadowFoldersSectionProps {
  folders: FolderType[];
  activeFolderId: Set<string>;
  onSelectFolder: (id: string) => void;
  onImportFolder: () => void;
  activeCollection: Collection | null;
  onColorFilterChange?: (color: string | null) => void;
}

export const ShadowFoldersSection: React.FC<ShadowFoldersSectionProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onImportFolder,
  activeCollection,
  onColorFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (id: string) => {
    onSelectFolder(id);
    onColorFilterChange?.(null);
  };

  const toggleSection = () => setIsExpanded(!isExpanded);

  return (
    <div>
      <button
        onClick={toggleSection}
        className={`group relative w-full flex items-center justify-between mb-2 px-3 py-2 rounded-xl transition-all duration-300 border ${
          isExpanded
            ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/20"
            : "hover:bg-primary/5 border-transparent"
        }`}
      >
        <p className="text-xs uppercase font-bold tracking-wider flex items-center gap-2 text-primary">
          <Icon action="hard_drive" size={14} className="text-primary" />
          <span>Dossiers de Travail</span>
        </p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isExpanded
                ? "bg-primary/20 text-primary"
                : "bg-primary/10 text-primary/70"
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
            className="h-6 w-6 text-primary hover:text-white hover:bg-primary/20 rounded-md transition-colors"
            title="Ajouter un dossier source"
          >
            <Icon action="add" size={14} />
          </Button>

          <Icon action="next"
            size={14}
            className={`transition-transform duration-300 text-primary ${
              isExpanded ? "rotate-90" : "opacity-50"
            }`}
          />

      </button>


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
                Aucun dossier de travail
              </p>
            ) : (
              <div className="space-y-1 pl-2">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId.has(folder.id)}
                    onSelect={handleSelect}
                    iconAction="hard_drive"
                    iconColorClass="text-primary"
                    iconBgClass="bg-primary/10"
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
