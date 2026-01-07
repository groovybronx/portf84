/**
 * TagHub Settings Persistence
 * Stores user preferences for TagHub Browse tab in localStorage
 */

// Export types for reuse
export type ViewMode = 'grid' | 'list';
export type FilterMode = 'all' | 'manual' | 'ai' | 'unused' | 'mostUsed';
export type SortBy = 'name' | 'usage' | 'date';
export type SortDirection = 'asc' | 'desc';

export interface TagHubSettings {
	// View preferences
	viewMode: ViewMode;
	sortBy: SortBy;
	sortDirection: SortDirection;
	filterMode: FilterMode;
	showUsageCount: boolean;

	// Metadata
	version: number;
	lastUpdated: number;
}

const SETTINGS_KEY = 'lumina_taghub_settings';
const CURRENT_VERSION = 1;

export const DEFAULT_TAGHUB_SETTINGS: TagHubSettings = {
	viewMode: 'grid',
	sortBy: 'usage',
	sortDirection: 'desc',
	filterMode: 'all',
	showUsageCount: true,
	version: CURRENT_VERSION,
	lastUpdated: Date.now(),
};

/**
 * Load TagHub settings from localStorage
 */
export const loadTagHubSettings = (): TagHubSettings => {
	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (!stored) {
			return DEFAULT_TAGHUB_SETTINGS;
		}

		const parsed = JSON.parse(stored) as Partial<TagHubSettings>;

		// Validate parsed object has expected structure
		if (!parsed || typeof parsed !== 'object') {
			console.warn('[TagHubSettings] Invalid stored data, using defaults');
			return DEFAULT_TAGHUB_SETTINGS;
		}

		// Version migration
		if (typeof parsed.version === 'number' && parsed.version !== CURRENT_VERSION) {
			return migrateTagHubSettings(parsed);
		}

		// Validate required properties
		const isValidEnum = (value: unknown, validValues: readonly string[]): boolean => {
			return typeof value === 'string' && validValues.includes(value);
		};

		const validViewModes = ['grid', 'list'] as const;
		const validSortBy = ['name', 'usage', 'date'] as const;
		const validSortDirection = ['asc', 'desc'] as const;
		const validFilterMode = ['all', 'manual', 'ai', 'unused', 'mostUsed'] as const;

		if (!isValidEnum(parsed.viewMode, validViewModes) ||
		    !isValidEnum(parsed.sortBy, validSortBy) ||
		    !isValidEnum(parsed.sortDirection, validSortDirection) ||
		    !isValidEnum(parsed.filterMode, validFilterMode) ||
		    typeof parsed.showUsageCount !== 'boolean') {
			console.warn('[TagHubSettings] Invalid property values, using defaults');
			return DEFAULT_TAGHUB_SETTINGS;
		}

		return parsed as TagHubSettings;
	} catch (error) {
		console.error('[TagHubSettings] Failed to load:', error);
		return DEFAULT_TAGHUB_SETTINGS;
	}
};

/**
 * Save TagHub settings to localStorage
 */
export const saveTagHubSettings = (settings: TagHubSettings): void => {
	try {
		const toSave: TagHubSettings = {
			...settings,
			version: CURRENT_VERSION,
			lastUpdated: Date.now(),
		};
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
		console.log('[TagHubSettings] Saved successfully');
	} catch (error) {
		console.error('[TagHubSettings] Failed to save:', error);
		// Handle quota exceeded - silently fail to avoid intrusive alerts
		// Note: This differs from tagSettings.ts which uses alert() for better UX
		if (error instanceof Error && error.name === 'QuotaExceededError') {
			console.error('[TagHubSettings] Storage quota exceeded. Settings may not persist.');
		}
	}
};

/**
 * Reset TagHub settings to defaults
 */
export const resetTagHubSettings = (): TagHubSettings => {
	const defaults = { ...DEFAULT_TAGHUB_SETTINGS };
	saveTagHubSettings(defaults);
	return loadTagHubSettings();
};

/**
 * Migrate TagHub settings from old version
 */
const migrateTagHubSettings = (old: Partial<TagHubSettings>): TagHubSettings => {
	console.log('[TagHubSettings] Migrating from version', old.version, 'to', CURRENT_VERSION);
	
	// Add migration logic here as versions evolve
	return {
		...DEFAULT_TAGHUB_SETTINGS,
		...old,
		version: CURRENT_VERSION,
		lastUpdated: Date.now(),
	};
};
