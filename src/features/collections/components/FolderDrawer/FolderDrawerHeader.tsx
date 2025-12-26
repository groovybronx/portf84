import React from "react";
import { Icon } from "../../../../shared/components/Icon";
import { Button } from "../../../../shared/components/ui";

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
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon action="library" className="text-primary" /> Library
            </h2>
            {onAdd && (
                <button 
                    onClick={onAdd}
                    className="p-1 rounded-full hover:bg-glass-bg-accent text-text-secondary hover:text-text-primary transition-colors"
                    title="Gérer les projets"
                >
                    <Icon action="add" size={16} />
                </button>
            )}
        </div>
        <span className="text-xs text-gray-500 font-medium ml-8">
            {totalItems} éléments
        </span>
      </div>
      <div className="flex items-center gap-1">
        {onTogglePin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePin}
            className={`rounded-full transition-all duration-300 ${
              isPinned
                ? "text-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "text-text-secondary hover:text-text-primary hover:bg-glass-bg-accent"
            }`}
            title={isPinned ? "Détacher la bibliothèque" : "Fixer la bibliothèque"}
          >
            <Icon
              action="pin"
              size={18}
              className={`transition-transform duration-300 ${
                isPinned ? "fill-current" : "rotate-45"
              }`}
            />
          </Button>
        )}
      </div>
    </div>
  );
};
