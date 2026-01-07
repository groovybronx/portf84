/**
 * TagHub Settings Persistence
 * Stores user preferences for TagHub Browse tab in localStorage
 */

export interface TagHubSettings {
	// View preferences
	viewMode: 'grid' | 'list';
	sortBy: 'name' | 'usage' | 'date';
	sortDirection: 'asc' | 'desc';
	filterMode: 'all' | 'manual' | 'ai' | 'unused' | 'mostUsed';
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

		const parsed = JSON.parse(stored) as TagHubSettings;

		// Version migration
		if (parsed.version < CURRENT_VERSION) {
			return migrateTagHubSettings(parsed);
		}

		return parsed;
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
		// Handle quota exceeded
		if (error instanceof Error && error.name === 'QuotaExceededError') {
			alert('Storage quota exceeded. Please clear some browser data.');
		}
	}
};

/**
 * Reset TagHub settings to defaults
 */
export const resetTagHubSettings = (): TagHubSettings => {
	const defaults = { ...DEFAULT_TAGHUB_SETTINGS };
	saveTagHubSettings(defaults);
	return defaults;
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
