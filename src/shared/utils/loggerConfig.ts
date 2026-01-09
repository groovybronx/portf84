/**
 * Configuration des niveaux de log pour l'environnement
 *
 * Ce fichier permet de configurer finement les niveaux de log
 * selon les besoins spécifiques de l'application.
 */

import { logger } from './logger';

// Configuration par défaut selon l'environnement
export const configureLoggerForEnvironment = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment) {
    // Développement : debug désactivé par défaut
    logger.setLevels(['info', 'warn', 'error']);
    logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
    console.log('🔧 Logger configuré pour le développement (tous les niveaux activés)');
  } else if (isTest) {
    // Tests : seulement les erreurs et warnings critiques
    logger.setLevels(['error', 'warn']);
    logger.setContexts(['security', 'app']); // Contextes critiques seulement
    console.log('🧪 Logger configuré pour les tests (erreurs et warnings seulement)');
  } else if (isProduction) {
    // Production : warnings et erreurs seulement
    logger.setLevels(['warn', 'error']);
    logger.setContexts(['security', 'performance', 'app']); // Contextes critiques
    console.log('🚀 Logger configuré pour la production (warnings et erreurs seulement)');
  } else {
    // Par défaut : configuration intermédiaire
    logger.setLevels(['info', 'warn', 'error']);
    logger.setContexts(['app', 'storage', 'security', 'performance']);
    console.log('⚙️ Logger configuré avec les paramètres par défaut');
  }
};

// Configuration spécifique pour le debugging
export const enableDebugMode = () => {
  logger.setLevels(['debug', 'info', 'warn', 'error']);
  logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
  console.log('🐛 Mode debug activé (tous les logs)');
};

// Configuration pour la performance monitoring
export const enablePerformanceMode = () => {
  logger.setLevels(['warn', 'error']);
  logger.setContexts(['performance', 'security', 'app']);
  console.log('⚡ Mode performance activé (logs minimum)');
};

// Configuration pour le debugging de stockage
export const enableStorageDebugMode = () => {
  logger.setLevels(['debug', 'info', 'warn', 'error']);
  logger.setContexts(['storage', 'security', 'app']);
  console.log('💾 Mode debug stockage activé');
};

// Configuration pour le debugging UI
export const enableUIDebugMode = () => {
  logger.setLevels(['debug', 'info', 'warn', 'error']);
  logger.setContexts(['ui', 'app', 'security']);
  console.log('🎨 Mode debug UI activé');
};

// Export des configurations prédéfinies
export const LoggerPresets = {
  development: configureLoggerForEnvironment,
  debug: enableDebugMode,
  performance: enablePerformanceMode,
  storage: enableStorageDebugMode,
  ui: enableUIDebugMode,
};

// Appliquer la configuration automatiquement au chargement
configureLoggerForEnvironment();
