import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack } from '../ui';
import { Icon } from '../Icon';

import { logger } from '../../utils/logger';
export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation(['settings']);

  const languages = [
    {
      code: 'en',
      name: t('settings:langEnglish'),
      flag: '🇬🇧',
      nativeName: 'English',
    },
    {
      code: 'fr',
      name: t('settings:langFrench'),
      flag: '🇫🇷',
      nativeName: 'Français',
    },
  ];

  return (
    <Stack spacing="xl" className="max-w-lg">
      <Stack spacing="md">
        <Stack spacing="sm">
          <label className="text-sm font-medium text-white/70">
            {t('settings:selectLanguage')}
          </label>
          <p className="text-xs text-white/40 leading-relaxed">{t('settings:languageDesc')}</p>
        </Stack>

        {/* Language Selection */}
        <Stack spacing="sm">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              variant="glass"
              className={`w-full justify-between p-4 rounded-lg border transition-all group ${
                i18n.language === lang.code || i18n.language.startsWith(lang.code)
                  ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20'
                  : 'bg-glass-bg-accent border-glass-border hover:border-glass-border-light hover:bg-glass-bg-active'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{lang.nativeName}</div>
                  <div className="text-xs text-white/50">{lang.name}</div>
                </div>
              </div>
              {(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">{t('settings:active')}</span>
                  <Icon action="check" size={18} className="text-primary" />
                </div>
              )}
            </Button>
          ))}
        </Stack>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 mt-6">
          <Icon action="alert" className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-xs text-blue-200/80 space-y-1">
            <p className="font-medium">{t('settings:langSaved')}</p>
            <p className="text-blue-200/60">{t('settings:langSavedDesc')}</p>
          </div>
        </div>
      </Stack>
    </Stack>
  );
};
