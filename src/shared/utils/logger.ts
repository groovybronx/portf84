/**
 * Utilitaire de logging conditionnel pour le développement et la production
 *
 * Ce utilitaire remplace les appels directs à console.log pour permettre
 * un contrôle fin des logs selon l'environnement et le niveau de verbosité.
 *
 * Usage:
 *   import { logger } from './src/shared/utils/logger';
 *   logger.log('Debug message', data);
 *   logger.error('Error occurred', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = 'app' | 'storage' | 'ui' | 'network' | 'performance' | 'security';

interface LogEntry {
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private isDevelopment: boolean;
  private enabledLevels: Set<LogLevel>;
  private enabledContexts: Set<LogContext>;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';

    // Niveaux activés par environnement
    this.enabledLevels = new Set<LogLevel>(
      this.isDevelopment
        ? (['info', 'warn', 'error'] as LogLevel[])
        : (['warn', 'error'] as LogLevel[])
    ); // En production, seulement les warnings et erreurs

    // Contextes toujours activés
    this.enabledContexts = new Set<LogContext>([
      'app',
      'storage',
      'ui',
      'network',
      'performance',
      'security',
    ] as LogContext[]);
  }

  /**
   * Configure les niveaux de log activés
   */
  setLevels(levels: LogLevel[]): void {
    this.enabledLevels = new Set(levels);
  }

  /**
   * Configure les contextes de log activés
   */
  setContexts(contexts: LogContext[]): void {
    this.enabledContexts = new Set(contexts);
  }

  /**
   * Vérifie si un log doit être affiché
   */
  private shouldLog(level: LogLevel, context: LogContext): boolean {
    return this.enabledLevels.has(level) && this.enabledContexts.has(context);
  }

  /**
   * Formate le message de log
   */
  private formatMessage(level: LogLevel, context: LogContext, message: string): string {
    const timestamp = new Date().toISOString();
    const levelEmoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return `${timestamp} ${levelEmoji[level]} [${context.toUpperCase()}] ${message}`;
  }

  /**
   * Ajoute une entrée à l'historique
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Log de niveau debug
   */
  debug(context: LogContext, message: string, data?: any): void {
    if (!this.shouldLog('debug', context)) return;

    const entry: LogEntry = {
      level: 'debug',
      context,
      message,
      data,
      timestamp: new Date(),
    };

    this.addToHistory(entry);
    console.debug(this.formatMessage('debug', context, message), data || '');
  }

  /**
   * Log de niveau info
   */
  info(context: LogContext, message: string, data?: any): void {
    if (!this.shouldLog('info', context)) return;

    const entry: LogEntry = {
      level: 'info',
      context,
      message,
      data,
      timestamp: new Date(),
    };

    this.addToHistory(entry);
    console.info(this.formatMessage('info', context, message), data || '');
  }

  /**
   * Log de niveau warning
   */
  warn(context: LogContext, message: string, data?: any): void {
    if (!this.shouldLog('warn', context)) return;

    const entry: LogEntry = {
      level: 'warn',
      context,
      message,
      data,
      timestamp: new Date(),
    };

    this.addToHistory(entry);
    console.warn(this.formatMessage('warn', context, message), data || '');
  }

  /**
   * Log de niveau error (toujours affiché)
   */
  error(context: LogContext, message: string, data?: any): void {
    // Les erreurs sont toujours affichées, peu importe la configuration
    const entry: LogEntry = {
      level: 'error',
      context,
      message,
      data,
      timestamp: new Date(),
    };

    this.addToHistory(entry);
    console.error(this.formatMessage('error', context, message), data || '');
  }

  /**
   * Log de performance
   */
  performance(message: string, data?: any): void {
    this.info('performance', message, data);
  }

  /**
   * Log de sécurité
   */
  security(message: string, data?: any): void {
    this.warn('security', message, data);
  }

  /**
   * Log de stockage
   */
  storage(message: string, data?: any): void {
    this.info('storage', message, data);
  }

  /**
   * Log d'interface utilisateur
   */
  ui(message: string, data?: any): void {
    this.debug('ui', message, data);
  }

  /**
   * Log réseau
   */
  network(message: string, data?: any): void {
    this.info('network', message, data);
  }

  /**
   * Log applicatif
   */
  app(message: string, data?: any): void {
    this.info('app', message, data);
  }

  /**
   * Récupère l'historique des logs
   */
  getHistory(level?: LogLevel, context?: LogContext): LogEntry[] {
    return this.logHistory.filter((entry) => {
      if (level && entry.level !== level) return false;
      if (context && entry.context !== context) return false;
      return true;
    });
  }

  /**
   * Vide l'historique des logs
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Exporte les logs au format JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Compatibilité avec les anciens appels console.log
   * @deprecated Utiliser logger.debug() ou logger.info() à la place
   */
  log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }
}

// Instance singleton
export const logger = new Logger();

// Export des types pour utilisation externe
export type { LogLevel, LogContext, LogEntry };

// Configuration par défaut pour le développement
if (process.env.NODE_ENV === 'development') {
  logger.setLevels(['warn', 'error']);
} else {
  logger.setLevels(['warn', 'error']);
}
