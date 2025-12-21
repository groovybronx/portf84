import React from 'react';
import { PortfolioItem } from '../types';
import { motion } from 'framer-motion';
import { FileImage, Info, Tag, CheckCircle2, Circle } from 'lucide-react';

interface PhotoListProps {
  items: PortfolioItem[];
  onSelect: (item: PortfolioItem) => void;
  showColorTags?: boolean;
  onHover?: (item: PortfolioItem | null) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  registerItemRef?: (id: string, el: HTMLElement | null) => void;
}

export const PhotoList: React.FC<PhotoListProps> = ({ 
    items, 
    onSelect, 
    showColorTags, 
    onHover,
    selectionMode,
    selectedIds,
    onToggleSelect,
    registerItemRef
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto pt-(--layout-pt) pb-10 px-4 sm:px-8">
      <div className="space-y-2">
        {items.map((item, index) => {
          const isSelected = selectedIds?.has(item.id);
          return (
            <motion.div
              key={item.id}
              ref={(el) => {
                if (registerItemRef) registerItemRef(item.id, el);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={(e) => {
                e.stopPropagation();
                if (selectionMode && onToggleSelect) {
                  onToggleSelect(item.id);
                } else {
                  onSelect(item);
                }
              }}
              onMouseEnter={() => onHover?.(item)}
              onMouseLeave={() => onHover?.(null)}
              className={`group flex items-center gap-6 p-4 rounded-xl transition-colors cursor-pointer border relative overflow-hidden ${
                isSelected
                  ? "bg-blue-500/10 border-blue-500/50"
                  : "hover:bg-glass-bg-accent border-transparent hover:border-glass-border-light"
              }`}
            >
              {/* Color Tag Strip */}
              {showColorTags && item.colorTag && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: item.colorTag }}
                />
              )}

              {/* Selection Checkbox */}
              {selectionMode && (
                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle2
                      size={24}
                      fill="currentColor"
                      className="text-blue-500 bg-white rounded-full"
                    />
                  ) : (
                    <Circle
                      className="text-gray-500 group-hover:text-white"
                      size={24}
                    />
                  )}
                </div>
              )}

              <div className="w-24 h-24 sm:w-32 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-surface relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-medium transition-colors truncate ${
                    isSelected
                      ? "text-blue-400"
                      : "text-white group-hover:text-blue-400"
                  }`}
                >
                  {item.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-mono">
                  <span className="flex items-center gap-1">
                    <FileImage size={14} />{" "}
                    {item.type.split("/")[1].toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {item.aiDescription && (
                  <p className="mt-2 text-gray-400 text-sm italic line-clamp-1 border-l-2 border-blue-500/50 pl-3">
                    "{item.aiDescription}"
                  </p>
                )}
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2">
                {item.aiTags && (
                  <div className="flex gap-1">
                    {item.aiTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-glass-bg-accent px-2 py-1 rounded-md text-gray-400 border border-glass-border-light flex items-center gap-1"
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                {!selectionMode && (
                  <button className="p-2 rounded-full hover:bg-glass-bg-accent text-gray-600 hover:text-white transition-colors">
                    <Info size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};