import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Eye, Palette, Copy, X, Tag } from "lucide-react";
import { PortfolioItem, COLOR_PALETTE } from "../types";

interface ContextMenuProps {
  x: number;
  y: number;
  item: PortfolioItem;
  onClose: () => void;
  onAnalyze: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onColorTag: (item: PortfolioItem, color: string | undefined) => void;
  onAddTags: (item: PortfolioItem) => void;
  onOpen: (item: PortfolioItem) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onClose,
  onAnalyze,
  onDelete,
  onColorTag,
  onAddTags,
  onOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Check if click is outside the menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use 'mousedown' with capture:true to detect clicks even if other components (like items) stop propagation
    document.addEventListener("mousedown", handleClick, { capture: true });
    return () =>
      document.removeEventListener("mousedown", handleClick, { capture: true });
  }, [onClose]);

  // Adjust position if close to edge
  const adjustedX = Math.min(x, window.innerWidth - 240); // Increased margin
  const adjustedY = Math.min(y, window.innerHeight - 350); // Increased margin

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{ top: adjustedY, left: adjustedX }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent triggering drag selection in App background
      onContextMenu={(e) => e.preventDefault()} // Prevent native context menu on the custom menu
      className="fixed z-[var(--z-context-menu)] w-60 glass-surface border border-glass-border rounded-xl shadow-2xl py-2 overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-glass-border/10 mb-1 flex items-center justify-between">
        <p
          className="text-xs font-mono text-gray-500 truncate max-w-[150px]"
          title={item.name}
        >
          {item.name}
        </p>
        <button
          onClick={onClose}
          className="p-1 -mr-2 rounded-full hover:bg-glass-bg-accent text-gray-400 hover:text-white transition-colors"
          title="Close Menu"
        >
          <X size={14} />
        </button>
      </div>

      <button
        onClick={() => {
          onOpen(item);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-glass-bg-accent hover:text-white flex items-center gap-3 transition-colors"
      >
        <Eye size={16} className="text-blue-400" /> Open Fullscreen
      </button>

      <button
        onClick={() => {
          onAnalyze(item);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-glass-bg-accent hover:text-white flex items-center gap-3 transition-colors"
      >
        <Sparkles size={16} className="text-purple-400" /> Analyze with AI
      </button>

      <button
        onClick={() => {
          onAddTags(item);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-glass-bg-accent hover:text-white flex items-center gap-3 transition-colors"
      >
        <Tag size={16} className="text-green-400" /> Add Tag
      </button>

      <div className="my-1 border-t border-glass-border/10" />

      <div className="px-4 py-2">
        <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
          <Palette size={12} /> Color Tag
        </p>
        <div className="flex justify-between">
          {Object.entries(COLOR_PALETTE).map(([key, hex]) => (
            <button
              key={key}
              onClick={() => {
                onColorTag(item, hex);
                onClose();
              }}
              className={`w-5 h-5 rounded-full border border-transparent hover:scale-110 hover:border-white transition-all ${
                item.colorTag === hex ? "ring-2 ring-white/50" : ""
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          <button
            onClick={() => {
              onColorTag(item, undefined);
              onClose();
            }}
            className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-white"
            title="Remove Tag"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="my-1 border-t border-glass-border/10" />

      <button
        onClick={() => {
          onDelete(item.id);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
      >
        <Trash2 size={16} /> Delete Item
      </button>
    </motion.div>
  );
};