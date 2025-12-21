import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, X, Plus } from "lucide-react";

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (tag: string) => void;
  selectedCount: number;
  availableTags: string[];
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onClose,
  onAddTag,
  selectedCount,
  availableTags,
}) => {
  const [tag, setTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTag("");
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const suggestions = availableTags
    .filter((t) => t.toLowerCase().includes(tag.toLowerCase()))
    .slice(0, 5);

  const handleSubmit = (e: React.FormEvent, selectedTag?: string) => {
    e.preventDefault();
    const finalTag = selectedTag || tag;
    if (finalTag.trim()) {
      onAddTag(finalTag.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm glass-surface rounded-2xl shadow-2xl p-6 border border-glass-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Tag size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Add Tag</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Adding tag to{" "}
              <span className="text-white font-medium">{selectedCount}</span>{" "}
              item{selectedCount > 1 ? "s" : ""}.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => {
                    setTag(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="Enter tag name..."
                  className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  autoFocus
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && tag && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-glass-border rounded-lg shadow-xl z-20 overflow-hidden">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                        onMouseDown={() =>
                          handleSubmit(
                            { preventDefault: () => {} } as React.FormEvent,
                            suggestion
                          )
                        }
                      >
                        <Tag size={12} className="text-gray-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tag.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
