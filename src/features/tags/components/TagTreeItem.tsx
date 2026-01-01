import React from "react";
import { motion } from "framer-motion";
import { Trash2, Star, ChevronRight } from "lucide-react";
import { Button } from "../../../shared/components/ui";

export interface TagTreeItemProps {
  tag: string;
  count: number;
  level?: number;
  onDelete?: (tag: string) => void;
  isManual?: boolean;
  onToggle?: () => void;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

export const TagTreeItem: React.FC<TagTreeItemProps> = ({
  tag,
  count,
  level = 0,
  onDelete,
  isManual = false,
  onToggle,
  isExpanded = false,
  hasChildren = false,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="group flex items-center gap-2 p-2 rounded-lg hover:bg-glass-bg-accent transition-colors"
      style={{ paddingLeft: `${(level * 12) + 8}px` }}
    >
      {hasChildren && (
        <Button
          variant="glass-icon"
          size="icon-sm"
          onClick={onToggle}
          className="shrink-0"
        >
          <ChevronRight
            size={12}
            className={`transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </Button>
      )}

      <div className="flex-1 flex items-center gap-2 min-w-0">
        {isManual && (
          <Star
            size={12}
            className="text-blue-400 fill-blue-400 shrink-0"
          />
        )}
        <span className="text-sm text-gray-300 truncate">{tag}</span>
        <span className="text-xs text-gray-500 shrink-0">({count})</span>
      </div>

      {onDelete && (
        <Button
          variant="glass-icon"
          size="icon-sm"
          onClick={() => onDelete(tag)}
          className="opacity-0 group-hover:opacity-100 shrink-0 hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 size={12} />
        </Button>
      )}
    </motion.div>
  );
};
