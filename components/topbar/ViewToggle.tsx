import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LayoutGrid,
  Layers,
  LayoutList,
  LucideIcon,
} from "lucide-react";
import { ViewMode } from "../../types";

interface ViewToggleProps {
  currentViewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  isViewMenuOpen: boolean;
  setIsViewMenuOpen: (open: boolean) => void;
}

const viewModes: { id: ViewMode; icon: LucideIcon; label: string }[] = [
  { id: ViewMode.GRID, icon: LayoutGrid, label: "Grid" },
  { id: ViewMode.CAROUSEL, icon: Layers, label: "Flow" },
  { id: ViewMode.LIST, icon: LayoutList, label: "Detail" },
];

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentViewMode,
  onModeChange,
  isViewMenuOpen,
  setIsViewMenuOpen,
}) => {
  const currentModeData =
    viewModes.find((m) => m.id === currentViewMode) || viewModes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass-bg-accent border border-glass-border-light hover:bg-glass-bg-active transition-colors min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2">
          <currentModeData.icon size={16} className="text-blue-400" />
          <span className="text-sm font-medium">{currentModeData.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${
            isViewMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isViewMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-32 glass-surface border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsViewMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-glass-bg-active transition-colors ${
                  currentViewMode === mode.id
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-gray-300"
                }`}
              >
                <mode.icon size={16} />
                {mode.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
