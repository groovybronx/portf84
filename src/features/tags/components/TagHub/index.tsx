import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag as TagIcon, Search, Settings, Merge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Flex, GlassCard } from '@/shared/components/ui';
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
          {/* Side Panel - Glassmorphism Style */}
          <GlassCard
            as={motion.div}
            variant="panel"
            padding="none"
            className="fixed right-4 top-4 bottom-4 w-[min(20rem,20vw)] rounded-3xl shadow-2xl shadow-black/60 z-(--z-modal) flex flex-col overflow-hidden"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 shrink-0">
              <Flex align="center" justify="between">
                <Flex align="center" gap="sm">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <TagIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('tags:tagHub')}</h2>
                    <p className="text-xs text-white/60">{t('tags:cleanupLibrary')}</p>
                  </div>
                </Flex>
                <Button
                  onClick={onClose}
                  aria-label={t('common:close')}
                  className="p-1.5 hover:bg-glass-bg-accent rounded-full text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </Button>
              </Flex>

              {/* Tab Navigation */}
              <Flex gap="xs" className="mt-4 flex-wrap p-4">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                          : 'text-gray-400 hover:text-gray-300 bg-glass-bg hover:bg-glass-bg-active'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="text-[9px] opacity-60">({index + 1})</span>
                    </Button>
                  );
                })}
              </Flex>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'browse' && <BrowseTab {...(onSelectTag ? { onSelectTag } : {})} />}
              {activeTab === 'manage' && <ManageTab />}
              {activeTab === 'fusion' && (
                <FusionTab {...(onTagsUpdated ? { onTagsUpdated } : {})} />
              )}
              {activeTab === 'settings' && <SettingsTab />}
            </div>
          </GlassCard>
        </>
      )}
    </AnimatePresence>
  );
};
