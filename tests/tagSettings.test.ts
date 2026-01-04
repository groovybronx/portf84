import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadTagSettings,
  saveTagSettings,
  resetTagSettings,
  DEFAULT_TAG_SETTINGS,
  TagSettings
} from '../src/shared/utils/tagSettings';

describe('Tag Settings Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset mocks if any
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return defaults when no settings stored', () => {
    const settings = loadTagSettings();
    expect(settings).toEqual(DEFAULT_TAG_SETTINGS);
  });

  it('should save and load settings', () => {
    const custom: TagSettings = {
      ...DEFAULT_TAG_SETTINGS,
      levenshteinThreshold: 3,
      jaccardThreshold: 90,
    };
    saveTagSettings(custom);
    const loaded = loadTagSettings();
    expect(loaded.levenshteinThreshold).toBe(3);
    expect(loaded.jaccardThreshold).toBe(90);
    // lastUpdated will be different
    expect(loaded.lastUpdated).toBeGreaterThan(0);
  });

  it('should reset to defaults', () => {
    const reset = resetTagSettings();
    const { lastUpdated, ...expectedDefaults } = DEFAULT_TAG_SETTINGS;
    expect(reset).toMatchObject(expectedDefaults);
    
    // Verify it persisted the reset
    const loaded = loadTagSettings();
    expect(loaded).toEqual(reset);
  });

  it('should migrate old version', () => {
    const oldSettings = { version: 0, levenshteinThreshold: 1 };
    localStorage.setItem('lumina_tag_settings', JSON.stringify(oldSettings));
    
    // Should call migrateSettings internal logic
    const loaded = loadTagSettings();
    
    expect(loaded.version).toBe(1); // CURRENT_VERSION
    expect(loaded.levenshteinThreshold).toBe(1); // Should preserve valid old values
  });

  it('should handle load errors gracefully', () => {
    // Mock getItem to throw
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    const settings = loadTagSettings();
    expect(settings).toEqual(DEFAULT_TAG_SETTINGS);
  });
});
