import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Folder as FolderType, COLOR_PALETTE } from "../../../../shared/types";
import { getColorName } from "../../../../services/storage/folders";

interface ColorFiltersSectionProps {
  folders: FolderType[];
  activeColorFilter?: string | null;
  onColorFilterChange?: (color: string | null) => void;
  onSelectFolder: (id: string) => void; // To reset to 'all' when picking boolean
}

export const ColorFiltersSection: React.FC<ColorFiltersSectionProps> = ({
  folders,
  activeColorFilter,
  onColorFilterChange,
  onSelectFolder,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSection = () => setIsExpanded(!isExpanded);

  return (
    <div>
      <button
        onClick={toggleSection}
        className={`w-full flex items-center justify-between mb-2 px-3 py-2 rounded-xl transition-all duration-300 border ${
          isExpanded
            ? "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]"
            : "hover:bg-amber-500/5 border-transparent"
        }`}
      >
        <p className="text-xs uppercase font-bold tracking-wider flex items-center gap-2 text-amber-400">
          <Palette size={14} className="text-amber-400" />
          <span>Filtres Couleur</span>
        </p>
        <ChevronRight
          size={14}
          className={`transition-transform duration-300 text-amber-400 ${
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
            <div className="space-y-1 pl-2">
              {Object.entries(COLOR_PALETTE).map(([key, hex]) => {
                const colorName = getColorName(hex);
                // Count items with this color (unique items across all folders)
                const uniqueItems = new Set();
                folders.forEach((f) =>
                  f.items
                    .filter((i) => i.colorTag === hex)
                    .forEach((i) => uniqueItems.add(i.id))
                );
                const count = uniqueItems.size;

                const isActive = activeColorFilter === hex;

                return (
                  <button
                    key={hex}
                    onClick={() => {
                      if (onColorFilterChange) {
                        if (isActive) {
                          onColorFilterChange(null);
                        } else {
                          onSelectFolder("all"); // Switch to "All" scope
                          onColorFilterChange(hex);
                        }
                      }
                    }}
                    className={`w-full group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all text-sm ${
                      isActive
                        ? "bg-glass-bg-active text-white border border-glass-border"
                        : "text-gray-400 hover:bg-glass-bg-accent hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="shrink-0">
                      {isActive ? (
                        <CheckCircle2 size={16} style={{ color: hex }} />
                      ) : (
                        <Circle
                          size={16}
                          className="text-gray-600 group-hover:text-gray-400"
                        />
                      )}
                    </div>

                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-glass-border-light transition-all"
                      style={{
                        backgroundColor: `${hex}15`, // 10% opacity hex
                        borderColor: isActive ? hex : "transparent",
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className={`font-medium text-sm truncate ${
                          isActive ? "text-white" : ""
                        }`}
                      >
                        {colorName}
                      </p>
                      <p className="text-xs opacity-60">{count} items</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
