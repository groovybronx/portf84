/**
 * Clés de stockage localStorage centralisées
 * 
 * Centralisation de toutes les clés localStorage pour éviter les erreurs de typo
 * et faciliter la maintenance.
 */

export const STORAGE_KEYS = {
  /** Clé API Gemini pour l'analyse d'images */
  API_KEY: "gemini_api_key",
  
  /** Configuration des raccourcis clavier personnalisés */
  SHORTCUTS: "lumina_shortcuts_config",
  
  /** Chemin vers la base de données SQLite */
  DB_PATH: "lumina_db_path",
  
  /** Thème de l'application (dark/light) */
  THEME: "lumina_theme",
  
  /** Titre personnalisé de l'application */
  APP_TITLE: "app_title",
  
  /** Preset d'animation (soft/normal/snappy) */
  ANIMATION_PRESET: "animation_preset",
} as const;

/**
 * Type-safe keys pour TypeScript
 */
export type StorageKey = keyof typeof STORAGE_KEYS;
