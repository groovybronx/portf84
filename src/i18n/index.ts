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
      },
      fr: {
        common: commonFR,
        tags: tagsFR,
        settings: settingsFR,
        library: libraryFR,
        errors: errorsFR,
      },
    },
    fallbackLng: 'en', // Default language if detection fails
    defaultNS: 'common', // Default namespace
    ns: ['common', 'tags', 'settings', 'library', 'errors'],
    
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
