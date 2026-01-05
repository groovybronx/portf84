import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, GlassCard } from '../../../shared/components/ui';

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
  const { t } = useTranslation(['tags', 'common']);
  const [tag, setTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTag('');
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

          <GlassCard
            variant="overlay"
            padding="lg"
            border
            className="relative w-full max-w-sm rounded-2xl shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('tags:addTagTitle')}</h2>
                </div>
                <Button variant="close" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                {t('tags:addingTagTo', { count: selectedCount })}.
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
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={t('tags:enterTagName')}
                    className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    autoFocus
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && tag && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-glass-border rounded-lg shadow-xl z-20 overflow-hidden">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="ghost"
                          className="w-full justify-start gap-2 rounded-none"
                          onMouseDown={() =>
                            handleSubmit(
                              { preventDefault: () => {} } as React.FormEvent,
                              suggestion
                            )
                          }
                        >
                          <Tag size={12} className="text-gray-500" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={onClose}>
                    {t('common:cancel')}
                  </Button>
                  <Button type="submit" disabled={!tag.trim()} leftIcon={<Plus size={16} />}>
                    {t('tags:addTag')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </GlassCard>
        </div>
      )}
    </AnimatePresence>
  );
};
