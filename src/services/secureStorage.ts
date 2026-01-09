import { BaseDirectory, writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';

import { logger } from '../shared/utils/logger';
const SECRETS_FILE = 'secrets.json';

interface Secrets {
  gemini_api_key?: string;
  [key: string]: string | undefined;
}

/**
 * Service to handle secure storage of sensitive data.
 * In desktop mode, it uses the AppConfig directory via Tauri's FS plugin.
 * In browser mode (fallback), it warns and uses localStorage.
 */
export const secureStorage = {
  isTauri: () => typeof window !== 'undefined' && '__TAURI__' in window,

  saveApiKey: async (apiKey: string): Promise<void> => {
    try {
      if (secureStorage.isTauri()) {
        const configExists = await exists('', { baseDir: BaseDirectory.AppConfig });

        if (!configExists) {
          // Ensure the directory exists
          await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
        }

        let secrets: Secrets = {};
        if (await exists(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig })) {
          const content = await readTextFile(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig });
          secrets = JSON.parse(content);
        }

        secrets.gemini_api_key = apiKey;
        await writeTextFile(SECRETS_FILE, JSON.stringify(secrets, null, 2), {
          baseDir: BaseDirectory.AppConfig,
        });
      } else {
        // Fallback for dev mode in browser
        logger.warn('storage', 'Using localStorage for API key (Browser Mode).');
        localStorage.setItem('gemini_api_key', apiKey);
      }
    } catch (error) {
      logger.error('storage', 'Failed to save API key securely:', error);
      throw error;
    }
  },

  getApiKey: async (): Promise<string | null> => {
    try {
      if (secureStorage.isTauri()) {
        if (await exists(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig })) {
          const content = await readTextFile(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig });
          const secrets: Secrets = JSON.parse(content);
          return secrets.gemini_api_key || null;
        }
        return null;
      } else {
        return localStorage.getItem('gemini_api_key');
      }
    } catch (error) {
      logger.error('storage', 'Failed to retrieve API key:', error);
      return null;
    }
  },

  clearApiKey: async (): Promise<void> => {
    try {
      if (secureStorage.isTauri()) {
        if (await exists(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig })) {
          const content = await readTextFile(SECRETS_FILE, { baseDir: BaseDirectory.AppConfig });
          const secrets: Secrets = JSON.parse(content);
          delete secrets.gemini_api_key;
          await writeTextFile(SECRETS_FILE, JSON.stringify(secrets, null, 2), {
            baseDir: BaseDirectory.AppConfig,
          });
        }
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    } catch (error) {
      logger.error('storage', 'Failed to clear API key:', error);
    }
  },
};
