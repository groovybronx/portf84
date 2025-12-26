import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../../shared/components/Icon";
import { Button } from "../../../../shared/components/ui";
import { Folder as FolderType, Collection } from "../../../../shared/types";
import { FolderItem } from "./FolderItem";

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
      <button
        onClick={toggleSection}
        className={`group relative w-full flex items-center justify-between mb-2 px-3 py-2 rounded-xl transition-all duration-300 border ${
          isExpanded
            ? "bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
            : "hover:bg-purple-500/5 border-transparent"
        }`}
      >
        <p className="text-xs uppercase font-bold tracking-wider flex items-center gap-2 text-purple-400">
          <Icon action="folder_heart" size={14} className="text-purple-400" />
          <span>Collections</span>
        </p>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && !activeFolderId.has("all") && (
            <span className="text-purple-400 text-[10px] bg-purple-500/10 px-2 py-0.5 rounded-full">
              {selectedCount} Sélectionnées
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
            className="h-6 w-6 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-md transition-colors"
            title="Nouvelle Collection Virtuelle"
          >
            <Icon action="add" size={14} />
          </Button>

          <Icon action="next"
            size={14}
            className={`transition-transform duration-300 text-purple-400 ${
              isExpanded ? "rotate-90" : "opacity-50"
            }`}
          />
        </div>


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
                Aucune collection créée
              </p>
            ) : (
              <div className="space-y-1 pl-2">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId.has(folder.id)}
                    onSelect={handleSelect}
                    onDelete={onDeleteFolder}
                    iconAction="folder_heart"
                    iconColorClass="text-purple-400"
                    iconBgClass="bg-purple-500/10"
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
