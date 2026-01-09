/**
 * Tag Settings Persistence
 * Stores user preferences in localStorage with versioning
 */

import { logger } from './logger';

export interface TagSettings {
  // Thresholds
  levenshteinThreshold: number;
  jaccardThreshold: number;
  minUsageCount: number;

  // Preferences
  similarityPreset: 'balanced' | 'strict' | 'aggressive';
  enableSemanticSimilarity: boolean;
  showAiTagsSeparately: boolean;
  suggestAliasesWhileTyping: boolean;
  autoMergeObviousDuplicates: boolean;
  confirmBeforeMerge: boolean;

  // Metadata
  version: number;
  lastUpdated: number;
}

const SETTINGS_KEY = 'lumina_tag_settings';
const CURRENT_VERSION = 1;

export const DEFAULT_TAG_SETTINGS: TagSettings = {
  levenshteinThreshold: 2,
  jaccardThreshold: 80,
  minUsageCount: 1,
  similarityPreset: 'balanced',
  enableSemanticSimilarity: false,
  showAiTagsSeparately: true,
  suggestAliasesWhileTyping: true,
  autoMergeObviousDuplicates: false,
  confirmBeforeMerge: true,
  version: CURRENT_VERSION,
  lastUpdated: Date.now(),
};

/**
 * Load settings from localStorage
 */
export const loadTagSettings = (): TagSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_TAG_SETTINGS;
    }

    const parsed = JSON.parse(stored) as TagSettings;

    // Version migration
    if (parsed.version < CURRENT_VERSION) {
      return migrateSettings(parsed);
    }

    return parsed;
  } catch (error) {
    logger.error('app', '[TagSettings] Failed to load:', error);
    return DEFAULT_TAG_SETTINGS;
  }
};

/**
 * Save settings to localStorage
 */
export const saveTagSettings = (settings: TagSettings): void => {
  try {
    const toSave: TagSettings = {
      ...settings,
      version: CURRENT_VERSION,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
    logger.debug('app', '[TagSettings] Saved successfully');
  } catch (error) {
    logger.error('app', '[TagSettings] Failed to save:', error);
    // Handle quota exceeded
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Simple alert or handling. In a real app maybe a toast.
      // Alert is native, good enough for now as per plan.
      alert('Storage quota exceeded. Please clear some browser data.');
    }
  }
};

/**
 * Reset settings to defaults
 */
export const resetTagSettings = (): TagSettings => {
  const defaults = { ...DEFAULT_TAG_SETTINGS };
  saveTagSettings(defaults);
  return loadTagSettings();
};

/**
 * Migrate settings from old version
 */
const migrateSettings = (old: Partial<TagSettings>): TagSettings => {
  logger.debug('app', '[TagSettings] Migrating from version', {
    from: old.version,
    to: CURRENT_VERSION,
  });

  // Add migration logic here as versions evolve
  // Example:
  // if (old.version === 0) {
  //   // Add new fields with defaults
  // }

  return {
    ...DEFAULT_TAG_SETTINGS,
    ...old,
    version: CURRENT_VERSION,
    lastUpdated: Date.now(),
  };
};
