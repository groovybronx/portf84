import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag as TagIcon, Search, Settings, Merge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, GlassCard, Flex, Stack } from '@/shared/components/ui';
import { TagHubTab } from '@/shared/hooks/useModalState';
import { BrowseTab } from './BrowseTab';
import { ManageTab } from './ManageTab';
import { FusionTab } from './FusionTab';
import { SettingsTab } from './SettingsTab';

interface TagHubProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TagHubTab;
  onTabChange: (tab: TagHubTab) => void;
  onTagsUpdated?: () => void;
  onSelectTag?: (tagName: string) => void;
}

export const TagHub: React.FC<TagHubProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onTagsUpdated,
  onSelectTag,
}) => {
  const { t } = useTranslation(['tags', 'common']);

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tab switching: 1-4
      if (e.key === '1') {
        onTabChange('browse');
      } else if (e.key === '2') {
        onTabChange('manage');
      } else if (e.key === '3') {
        onTabChange('fusion');
      } else if (e.key === '4') {
        onTabChange('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onTabChange]);

  const tabs = [
    { id: 'browse' as TagHubTab, label: t('tags:browse'), icon: Search },
    { id: 'manage' as TagHubTab, label: t('tags:manage'), icon: TagIcon },
    { id: 'fusion' as TagHubTab, label: t('tags:fusion'), icon: Merge },
    { id: 'settings' as TagHubTab, label: t('tags:settings'), icon: Settings },
  ];

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
            aria-label={t('common:closeModal')}
          />

          {/* Modal */}
          <GlassCard
            variant="base"
            padding="none"
            border
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl rounded-xl! shadow-2xl z-(--z-modal) flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <Flex align="center" justify="between">
                <Flex align="center" gap="md">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TagIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t('tags:tagHub')}</h2>
                    <p className="text-sm text-white/60">{t('tags:cleanupLibrary')}</p>
                  </div>
                </Flex>
                <Button
                  onClick={onClose}
                  aria-label={t('common:close')}
                  className="p-2 hover:bg-glass-bg-accent rounded-full text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </Button>
              </Flex>

              {/* Tab Navigation */}
              <Flex gap="sm" className="mt-4">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                          : 'bg-glass-bg-accent text-gray-400 hover:bg-glass-bg-accent-hover hover:text-gray-300'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      <span className="text-[10px] opacity-60 ml-1">({index + 1})</span>
                    </Button>
                  );
                })}
              </Flex>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'browse' && <BrowseTab onSelectTag={onSelectTag} />}
              {activeTab === 'manage' && <ManageTab />}
              {activeTab === 'fusion' && <FusionTab onTagsUpdated={onTagsUpdated} />}
              {activeTab === 'settings' && <SettingsTab />}
            </div>
          </GlassCard>
        </>
      )}
    </AnimatePresence>
  );
};
