import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonEN from './locales/en/common.json';
import commonFR from './locales/fr/common.json';
import tagsEN from './locales/en/tags.json';
import tagsFR from './locales/fr/tags.json';
import settingsEN from './locales/en/settings.json';
import settingsFR from './locales/fr/settings.json';
import libraryEN from './locales/en/library.json';
import libraryFR from './locales/fr/library.json';
import errorsEN from './locales/en/errors.json';
import errorsFR from './locales/fr/errors.json';
import navigationEN from './locales/en/navigation.json';
import navigationFR from './locales/fr/navigation.json';
import shortcutsEN from './locales/en/shortcuts.json';
import shortcutsFR from './locales/fr/shortcuts.json';

// Configure i18next
i18n
  .use(LanguageDetector) // Auto-detect user language
  .use(initReactI18next) // React bindings
  .init({
    resources: {
      en: {
        common: commonEN,
        tags: tagsEN,
        settings: settingsEN,
        library: libraryEN,
        errors: errorsEN,
        navigation: navigationEN,
        shortcuts: shortcutsEN,
      },
      fr: {
        common: commonFR,
        tags: tagsFR,
        settings: settingsFR,
        library: libraryFR,
        errors: errorsFR,
        navigation: navigationFR,
        shortcuts: shortcutsFR,
      },
    },
    fallbackLng: 'en', // Default language if detection fails
    defaultNS: 'common', // Default namespace
    ns: ['common', 'tags', 'settings', 'library', 'errors', 'navigation', 'shortcuts'],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then browser language
      caches: ['localStorage'], // Persist in localStorage
      lookupLocalStorage: 'lumina_language', // LocalStorage key
    },

    react: {
      useSuspense: false, // Disable to avoid loading issues
    },
  });

export default i18n;
