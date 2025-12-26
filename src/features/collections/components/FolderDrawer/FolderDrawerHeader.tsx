import React from "react";
import { Layers, Pin, Plus } from "lucide-react";
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
            <Layers className="text-blue-500" /> Library
            </h2>
            {onAdd && (
                <button 
                    onClick={onAdd}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Gérer les projets"
                >
                    <Plus size={16} />
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
                ? "text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title={isPinned ? "Détacher la bibliothèque" : "Fixer la bibliothèque"}
          >
            <Pin
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
