import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, ColorPicker, GlassCard } from '../ui';
import { Icon, ALL_ICONS } from '../Icon';
import { useTheme } from '../../contexts/ThemeContext';

import { logger } from '../../utils/logger';
// Wrapper for Settings Row
const FormRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <GlassCard variant="accent" padding="none" className="p-3">
    <div className="mb-3">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-[10px] text-white/40">{description}</div>
    </div>
    {children}
  </GlassCard>
);

export const ThemeCustomizer: React.FC = () => {
  const { t } = useTranslation(['settings']);
  const { settings, updateSetting, resetTheme } = useTheme();

  const colors = [
    { name: t('settings:colorBlue'), value: '#3b82f6' },
    { name: t('settings:colorPurple'), value: '#a855f7' },
    { name: t('settings:colorEmerald'), value: '#10b981' },
    { name: t('settings:colorRose'), value: '#f43f5e' },
    { name: t('settings:colorAmber'), value: '#f59e0b' },
    { name: t('settings:colorCyan'), value: '#06b6d4' },
    { name: t('settings:colorViolet'), value: '#8b5cf6' },
    { name: t('settings:colorFuchsia'), value: '#d946ef' },
    { name: t('settings:colorLime'), value: '#84cc16' },
    { name: t('settings:colorOrange'), value: '#f97316' },
  ];

  return (
    <Stack spacing="xl" className="max-w-lg">
      <Stack spacing="lg">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white/70">{t('settings:themeColors')}</h4>
          <Button
            onClick={resetTheme}
            variant="ghost"
            size="sm"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            {t('settings:resetDefaults')}
          </Button>
        </div>

        <Stack spacing="md">
          <FormRow
            label={t('settings:primaryInterface')}
            description={t('settings:primaryInterfaceDesc')}
          >
            <ColorPicker
              value={settings.primaryColor}
              onChange={(c) => updateSetting('primaryColor', c)}
              colors={colors}
              withIconPicker
              icon={settings.primaryIcon}
              onIconChange={(icon) => updateSetting('primaryIcon', icon)}
              availableIcons={ALL_ICONS}
              usedIcons={[
                settings.secondaryIcon,
                settings.tertiaryIcon,
                settings.quaternaryIcon,
                settings.quinaryIcon,
                settings.filtersIcon,
              ]}
            />
          </FormRow>

          <FormRow
            label={t('settings:aiIntelligence')}
            description={t('settings:aiIntelligenceDesc')}
          >
            <ColorPicker
              value={settings.secondaryColor}
              onChange={(c) => updateSetting('secondaryColor', c)}
              colors={colors}
              withIconPicker
              icon={settings.secondaryIcon}
              onIconChange={(icon) => updateSetting('secondaryIcon', icon)}
              availableIcons={ALL_ICONS}
              usedIcons={[
                settings.primaryIcon,
                settings.tertiaryIcon,
                settings.quaternaryIcon,
                settings.quinaryIcon,
                settings.filtersIcon,
              ]}
            />
          </FormRow>

          <FormRow label={t('settings:collections')} description={t('settings:collectionsDesc')}>
            <ColorPicker
              value={settings.tertiaryColor}
              onChange={(c) => updateSetting('tertiaryColor', c)}
              colors={colors}
              withIconPicker
              icon={settings.tertiaryIcon}
              onIconChange={(icon) => updateSetting('tertiaryIcon', icon)}
              availableIcons={ALL_ICONS}
              usedIcons={[
                settings.primaryIcon,
                settings.secondaryIcon,
                settings.quaternaryIcon,
                settings.quinaryIcon,
                settings.filtersIcon,
              ]}
            />
          </FormRow>

          <FormRow label={t('settings:workFolders')} description={t('settings:workFoldersDesc')}>
            <ColorPicker
              value={settings.quaternaryColor}
              onChange={(c) => updateSetting('quaternaryColor', c)}
              colors={colors}
              withIconPicker
              icon={settings.quaternaryIcon}
              onIconChange={(icon) => updateSetting('quaternaryIcon', icon)}
              availableIcons={ALL_ICONS}
              usedIcons={[
                settings.primaryIcon,
                settings.secondaryIcon,
                settings.tertiaryIcon,
                settings.quinaryIcon,
                settings.filtersIcon,
              ]}
            />
          </FormRow>

          <FormRow label={t('settings:projects')} description={t('settings:projectsDesc')}>
            <ColorPicker
              value={settings.quinaryColor}
              onChange={(c) => updateSetting('quinaryColor', c)}
              colors={colors}
              withIconPicker
              icon={settings.quinaryIcon}
              onIconChange={(icon) => updateSetting('quinaryIcon', icon)}
              availableIcons={ALL_ICONS}
              usedIcons={[
                settings.primaryIcon,
                settings.secondaryIcon,
                settings.tertiaryIcon,
                settings.quaternaryIcon,
                settings.filtersIcon,
              ]}
            />
          </FormRow>
        </Stack>
      </Stack>

      <Stack spacing="md" className="pt-6 border-t border-glass-border">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-white/70">{t('settings:glassOpacity')}</h4>
          <span className="text-xs text-white/40">
            {settings.glassBg.includes('0.9')
              ? t('settings:high')
              : settings.glassBg.includes('0.5')
              ? t('settings:low')
              : t('settings:medium')}
          </span>
        </div>
        <div className="flex gap-2 bg-glass-bg-accent p-1 rounded-lg border border-glass-border-light">
          {[
            { label: t('settings:highCoverage'), value: 'rgba(10, 10, 10, 0.95)' },
            { label: t('settings:balanced'), value: 'rgba(10, 10, 10, 0.8)' },
            { label: t('settings:frosted'), value: 'rgba(10, 10, 10, 0.5)' },
          ].map((option) => (
            <Button
              key={option.value}
              onClick={() => updateSetting('glassBg', option.value)}
              variant="ghost"
              size="sm"
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                settings.glassBg === option.value
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Stack>

      <div className="pt-6 border-t border-glass-border">
        <Button
          onClick={resetTheme}
          variant="ghost"
          size="sm"
          className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-2"
        >
          <Icon action="reset" size={12} /> {t('settings:resetTheme')}
        </Button>
      </div>
    </Stack>
  );
};
