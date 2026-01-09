import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { logger } from './shared/utils/logger';
import {
  loadTagHubSettings,
  saveTagHubSettings,
  resetTagHubSettings,
  DEFAULT_TAGHUB_SETTINGS,
  type TagHubSettings,
  type ViewMode,
  type FilterMode,
} from '../src/shared/utils/tagHubSettings';

describe('TagHub Settings Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return defaults when no settings stored', () => {
    const settings = loadTagHubSettings();
    expect(settings).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should save and load settings', () => {
    const custom: TagHubSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      viewMode: 'list',
      filterMode: 'manual',
      showUsageCount: false,
    };
    saveTagHubSettings(custom);
    const loaded = loadTagHubSettings();
    expect(loaded.viewMode).toBe('list');
    expect(loaded.filterMode).toBe('manual');
    expect(loaded.showUsageCount).toBe(false);
    // lastUpdated will be different
    expect(loaded.lastUpdated).toBeGreaterThan(0);
  });

  it('should reset to defaults', () => {
    // Save custom settings first
    const custom: TagHubSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      viewMode: 'list',
    };
    saveTagHubSettings(custom);

    // Reset
    const reset = resetTagHubSettings();
    const { lastUpdated, ...expectedDefaults } = DEFAULT_TAGHUB_SETTINGS;
    expect(reset).toMatchObject(expectedDefaults);
    
    // Verify it persisted the reset
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(reset);
  });

  it('should migrate old version', () => {
    const oldSettings = { version: 0, viewMode: 'list', filterMode: 'manual' };
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(oldSettings));
    
    const loaded = loadTagHubSettings();
    
    expect(loaded.version).toBe(1); // CURRENT_VERSION
    expect(loaded.viewMode).toBe('list'); // Should preserve valid old values
    expect(loaded.filterMode).toBe('manual'); // Should preserve valid old values
  });

  it('should handle load errors gracefully', () => {
    // Mock getItem to throw
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    const settings = loadTagHubSettings();
    expect(settings).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should validate viewMode enum values', () => {
    const invalidSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      viewMode: 'invalid',
    };
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(invalidSettings));
    
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should validate filterMode enum values', () => {
    const invalidSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      filterMode: 'invalid',
    };
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(invalidSettings));
    
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should validate showUsageCount is boolean', () => {
    const invalidSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      showUsageCount: 'true', // String instead of boolean
    };
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(invalidSettings));
    
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should handle invalid JSON gracefully', () => {
    localStorage.setItem('lumina_taghub_settings', 'invalid json{');
    
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should handle null stored value', () => {
    localStorage.setItem('lumina_taghub_settings', 'null');
    
    const loaded = loadTagHubSettings();
    expect(loaded).toEqual(DEFAULT_TAGHUB_SETTINGS);
  });

  it('should update version and lastUpdated when saving', () => {
    const custom: TagHubSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      viewMode: 'list',
      version: 0, // Will be overridden
      lastUpdated: 0, // Will be overridden
    };
    
    const beforeSave = Date.now();
    saveTagHubSettings(custom);
    const afterSave = Date.now();
    
    const loaded = loadTagHubSettings();
    expect(loaded.version).toBe(1);
    expect(loaded.lastUpdated).toBeGreaterThanOrEqual(beforeSave);
    expect(loaded.lastUpdated).toBeLessThanOrEqual(afterSave);
  });

  it('should handle QuotaExceededError', () => {
    // Mock setItem to throw QuotaExceededError
    const error = new Error('QuotaExceededError');
    error.name = 'QuotaExceededError';
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw error;
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Should not throw, just log
    expect(() => saveTagHubSettings(DEFAULT_TAGHUB_SETTINGS)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should validate all enum properties together', () => {
    const settings = {
      viewMode: 'grid' as ViewMode,
      sortBy: 'usage' as const,
      sortDirection: 'desc' as const,
      filterMode: 'all' as FilterMode,
      showUsageCount: true,
      version: 1,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(settings));
    const loaded = loadTagHubSettings();
    
    expect(loaded.viewMode).toBe('grid');
    expect(loaded.sortBy).toBe('usage');
    expect(loaded.sortDirection).toBe('desc');
    expect(loaded.filterMode).toBe('all');
    expect(loaded.showUsageCount).toBe(true);
  });

  it('should migrate settings with different version number', () => {
    const futureSettings = {
      ...DEFAULT_TAGHUB_SETTINGS,
      version: 99, // Future version
    };
    localStorage.setItem('lumina_taghub_settings', JSON.stringify(futureSettings));
    
    const loaded = loadTagHubSettings();
    expect(loaded.version).toBe(1); // Should reset to current version
  });
});
