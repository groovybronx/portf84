import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, type IconAction } from './Icon';
import { open } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { useTranslation } from 'react-i18next';

import { secureStorage } from '../../services/secureStorage';
import { TabList, TabTrigger, Button, GlassCard, Stack } from './ui';
import { STORAGE_KEYS } from '../constants';
import { LanguageSelector } from './settings/LanguageSelector';
import { ShortcutEditor } from './settings/ShortcutEditor';
import { ThemeCustomizer } from './settings/ThemeCustomizer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useCinematicCarousel?: boolean;
  onToggleCinematicCarousel?: (enabled: boolean) => void;
}

type SettingsTab = 'general' | 'language' | 'appearance' | 'storage' | 'shortcuts';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  useCinematicCarousel = false,
  onToggleCinematicCarousel,
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [apiKey, setApiKey] = useState('');
  const [dbPath, setDbPath] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadSettings = async () => {
        // Load API Key
        try {
          const secureKey = await secureStorage.getApiKey();
          if (secureKey) {
            setApiKey(secureKey);
          } else {
            // Fallback check seulement si on n'est pas en mode Tauri
            if (!secureStorage.isTauri()) {
              const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
              if (storedKey) setApiKey(storedKey);
            }
          }
        } catch (e) {
          console.error('Failed to load secure key:', e);
          // Fallback en cas d'erreur
          const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
          if (storedKey) setApiKey(storedKey);
        }

        // Load DB Path
        const storedPath = localStorage.getItem(STORAGE_KEYS.DB_PATH);
        if (storedPath) setDbPath(storedPath);
        else setDbPath('');

        setIsSaved(false);
      };
      loadSettings();
    }
  }, [isOpen]);

  const handleSelectDbPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t('settings:selectDbLocation'),
      });
      if (selected && typeof selected === 'string') {
        setDbPath(selected);
      }
    } catch (err) {
      console.error('Failed to pick directory:', err);
    }
  };

  const handleSave = async () => {
    if (apiKey.trim()) {
      await secureStorage.saveApiKey(apiKey.trim());
      // Nettoyer localStorage seulement si on est en mode Tauri (pas en dev)
      if (secureStorage.isTauri()) {
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
      }
    } else {
      await secureStorage.clearApiKey();
    }

    if (dbPath) {
      localStorage.setItem(STORAGE_KEYS.DB_PATH, dbPath);
    } else {
      localStorage.removeItem(STORAGE_KEYS.DB_PATH);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = async () => {
    await secureStorage.clearApiKey();
    setApiKey('');
  };

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

          {/* Modal Container */}
          <GlassCard
            variant="base"
            padding="none"
            border={true}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] rounded-2xl! shadow-2xl z-(--z-modal) overflow-hidden flex"
          >
            {/* Sidebar Navigation */}
            <TabList>
              <h2 className="text-xl font-semibold text-white px-2 mb-4 flex items-center gap-2">
                <Icon action="layout_grid" className="w-5 h-5 text-primary" />
                {t('settings:settings')}
              </h2>

              <TabTrigger
                value="general"
                active={activeTab === 'general'}
                onClick={() => setActiveTab('general')}
                icon={<Icon action="key" size={18} />}
              >
                {t('settings:general')}
              </TabTrigger>
              <TabTrigger
                value="language"
                active={activeTab === 'language'}
                onClick={() => setActiveTab('language')}
                icon={<Icon action="globe" size={18} />}
              >
                {t('settings:language')}
              </TabTrigger>
              <TabTrigger
                value="appearance"
                active={activeTab === 'appearance'}
                onClick={() => setActiveTab('appearance')}
                icon={<Icon action="palette" size={18} />}
              >
                {t('settings:appearance')}
              </TabTrigger>
              <TabTrigger
                value="storage"
                active={activeTab === 'storage'}
                onClick={() => setActiveTab('storage')}
                icon={<Icon action="database" size={18} />}
              >
                {t('settings:storage')}
              </TabTrigger>
              <TabTrigger
                value="shortcuts"
                active={activeTab === 'shortcuts'}
                onClick={() => setActiveTab('shortcuts')}
                icon={<Icon action="keyboard" size={18} />}
              >
                {t('settings:shortcuts')}
              </TabTrigger>
            </TabList>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="h-16 border-b border-glass-border flex items-center justify-between px-8 shrink-0">
                <h3 className="text-lg font-medium text-white capitalize">
                  {activeTab === 'general'
                    ? t('settings:tabGeneral')
                    : activeTab === 'appearance'
                    ? t('settings:tabAppearance')
                    : activeTab === 'storage'
                    ? t('settings:tabStorage')
                    : activeTab === 'language'
                    ? t('settings:language')
                    : t('settings:tabShortcuts')}
                </h3>
                <Button onClick={onClose} variant="close" size="icon" aria-label="Close settings">
                  <Icon action="close" size={20} />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* TAB: GENERAL */}
                {activeTab === 'general' && (
                  <Stack spacing="xl" className="max-w-lg">
                    {/* API Key Section */}
                    <Stack spacing="md">
                      <Stack spacing="sm">
                        <label className="text-sm font-medium text-white/70">
                          {t('settings:geminiApiKey')}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-glass-bg-accent border border-glass-border rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                          />
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                          {t('settings:apiKeyRequired')}
                        </p>
                      </Stack>

                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                        <Icon action="alert" className="w-5 h-5 text-primary shrink-0" />
                        <div className="text-xs text-primary/80 space-y-1">
                          <p>{t('settings:apiKeyHelp')}</p>
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline"
                          >
                            {t('settings:getApiKey')} <Icon action="external_link" size={10} />
                          </a>
                        </div>
                      </div>

                      {apiKey && (
                        <Button
                          onClick={handleClear}
                          variant="ghost"
                          size="sm"
                          className="text-sm text-red-400 hover:text-red-300 underline"
                        >
                          {t('settings:removeKey')}
                        </Button>
                      )}
                    </Stack>

                    {/* Experiments Section */}
                    {onToggleCinematicCarousel && (
                      <Stack spacing="md" className="pt-6 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                          {t('settings:experimental')}
                        </h4>
                        <label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors -mx-3">
                          <div className="space-y-1">
                            <div className="text-sm text-white font-medium">
                              {t('settings:cinematicCarousel')}
                            </div>
                            <div className="text-xs text-white/40">
                              {t('settings:cinematicCarouselDesc')}
                            </div>
                          </div>
                          <div
                            onClick={() => onToggleCinematicCarousel(!useCinematicCarousel)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              useCinematicCarousel ? 'bg-blue-500' : 'bg-white/10'
                            }`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                useCinematicCarousel ? 'translate-x-5' : ''
                              }`}
                            />
                          </div>
                        </label>
                      </Stack>
                    )}
                  </Stack>
                )}

                {/* TAB: LANGUAGE */}
                {activeTab === 'language' && <LanguageSelector />}

                {/* TAB: APPEARANCE */}
                {activeTab === 'appearance' && <ThemeCustomizer />}

                {/* TAB: STORAGE */}
                {activeTab === 'storage' && (
                  <Stack spacing="xl" className="max-w-lg">
                    <Stack spacing="md">
                      <Stack spacing="sm">
                        <label className="text-sm font-medium text-white/70">
                          {t('settings:databaseLocation')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={dbPath || t('settings:defaultFolder')}
                            className="flex-1 bg-glass-bg-accent border border-glass-border rounded-lg px-4 py-3 text-white/50 text-xs font-mono truncate cursor-not-allowed"
                          />
                          <Button
                            onClick={handleSelectDbPath}
                            variant="glass"
                            size="md"
                            className="whitespace-nowrap"
                          >
                            {t('settings:change')}
                          </Button>
                        </div>
                      </Stack>

                      {dbPath && (
                        <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                          <p className="text-xs text-amber-200 flex items-center gap-2">
                            <Icon action="alert" size={14} /> {t('settings:restartRequired')}
                          </p>
                          <div className="flex gap-3 items-center">
                            <Button
                              onClick={() => setDbPath('')}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-white/50 hover:text-white underline"
                            >
                              {t('settings:resetDefault')}
                            </Button>
                            <Button
                              onClick={async () => {
                                if (dbPath) localStorage.setItem(STORAGE_KEYS.DB_PATH, dbPath);
                                await relaunch();
                              }}
                              variant="primary"
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg"
                            >
                              {t('settings:restartNow')}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-white/40 space-y-2 leading-relaxed p-4 bg-white/5 rounded-lg">
                        <p>
                          <strong>Note:</strong> {t('settings:dbNote')}
                        </p>
                        <p>{t('settings:dbNoteUseful')}</p>
                      </div>
                    </Stack>
                  </Stack>
                )}

                {/* TAB: SHORTCUTS */}
                {activeTab === 'shortcuts' && <ShortcutEditor />}
              </div>

              {/* Footer Actions (Global) */}
              <div className="p-6 border-t border-glass-border flex justify-end gap-3 bg-background/50 backdrop-blur-md">
                <Button
                  onClick={handleSave}
                  disabled={isSaved}
                  loading={isSaved}
                  variant="primary"
                  size="md"
                  className={`relative px-6 py-2.5 transition-all duration-300 overflow-hidden shadow-lg ${
                    isSaved ? 'ring-2 ring-green-500' : ''
                  }`}
                  icon={!isSaved && <Icon action="save" size={16} />}
                >
                  {isSaved ? t('settings:saved') : t('settings:saveChanges')}
                </Button>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </AnimatePresence>
  );
};
