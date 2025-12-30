// TypeScript types for i18next autocomplete

// Available namespaces
export type Namespace = 'common' | 'tags' | 'settings' | 'library' | 'errors';

// Translation function type
export type TFunction = (key: string, options?: any) => string;

// Declare module for i18next TypeScript support
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof import('./locales/en/common.json');
      tags: typeof import('./locales/en/tags.json');
      settings: typeof import('./locales/en/settings.json');
      library: typeof import('./locales/en/library.json');
      errors: typeof import('./locales/en/errors.json');
    };
  }
}
