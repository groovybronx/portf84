import React from 'react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KEYBOARD_SHORTCUTS, ShortcutCategory } from '../constants/shortcuts';

interface KeyboardShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation(['shortcuts', 'common']);

    // Group shortcuts by category
    const groupedShortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<ShortcutCategory, typeof KEYBOARD_SHORTCUTS>);

    const categories = Object.values(ShortcutCategory);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-(--z-modal-overlay)"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-background border border-white/10 rounded-xl shadow-2xl z-(--z-modal) flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-glass-bg-accent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Keyboard className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{t('shortcuts:title')}</h2>
                                    <p className="text-xs text-white/50">{t('shortcuts:description')}</p>
                                </div>
                            </div>
                            <Button 
                                onClick={onClose}
                                variant="close"
                                size="icon"
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {categories.map(category => {
                                    const shortcuts = groupedShortcuts[category];
                                    if (!shortcuts?.length) return null;

                                    return (
                                        <div key={category} className="space-y-4">
                                            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                                                {t(`shortcuts:category.${category}`)}
                                                <div className="h-px bg-purple-500/20 flex-1" />
                                            </h3>
                                            <div className="space-y-2">
                                                {shortcuts.map(shortcut => (
                                                    <div key={shortcut.id} className="flex items-center justify-between group">
                                                        <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                                                            {t(shortcut.label as any)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {shortcut.keys.map((key, i) => (
                                                                <kbd 
                                                                    key={i}
                                                                    className="px-2 py-1 min-w-[24px] text-center bg-white/5 border border-white/10 rounded text-xs font-mono text-white/90 shadow-sm"
                                                                >
                                                                    {key}
                                                                </kbd>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-glass-bg-accent text-center text-xs text-white/40">
                            {t('shortcuts:footerHint')}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
