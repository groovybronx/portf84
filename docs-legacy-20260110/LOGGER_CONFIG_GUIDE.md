# 🎯 Guide Simple de Configuration des Logs

## 📋 État Actuel

La migration a réussi avec **153 remplacements** mais il y a des erreurs d'imports à corriger. Voici comment configurer les niveaux de log manuellement.

## 🔧 Configuration Rapide des Niveaux

### 1. Dans votre composant principal (App.tsx)

```typescript
import { logger } from './shared/utils/logger';

// Configuration selon l'environnement
if (process.env.NODE_ENV === 'development') {
  // Développement : debug désactivé par défaut
  logger.setLevels(['info', 'warn', 'error']);
  logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
} else if (process.env.NODE_ENV === 'production') {
  // Production : seulement warnings et erreurs
  logger.setLevels(['warn', 'error']);
  logger.setContexts(['security', 'performance', 'app']);
}
```

### 2. Configuration par défaut (déjà dans logger.ts)

Le logger est déjà configuré automatiquement selon `NODE_ENV` :

```typescript
// Dans src/shared/utils/logger.ts (lignes 240-247)
if (process.env.NODE_ENV === 'development') {
  logger.setLevels(['debug', 'info', 'warn', 'error']);
} else {
  logger.setLevels(['warn', 'error']); // Production
}
```

## 🎯 Utilisation des Logs

### Logs Contextuels

```typescript
// Logs de stockage
logger.storage('Collection created', { name, id });

// Logs de performance
logger.performance('Image processing completed', { duration: 1500 });

// Logs de sécurité
logger.security('API key validation failed', error);

// Logs UI
logger.ui('Button clicked', { action: 'open-settings' });

// Logs réseau
logger.network('API request completed', { url, status });

// Logs applicatifs
logger.app('User logged in', { userId });
```

### Logs Génériques

```typescript
// Debug (développement seulement)
logger.debug('Variable value', { variable: value });

// Info (développement)
logger.info('Process started', { step: 1 });

// Warning (toujours affiché)
logger.warn('Deprecated feature used', { feature: 'old-api' });

// Error (toujours affiché)
logger.error('Critical error', { error: exception });
```

## 🚀 Configuration pour la Production

### Option 1: Variables d'environnement

```bash
# Pour la production
export NODE_ENV=production

# Pour le développement
export NODE_ENV=development
```

### Option 2: Configuration manuelle

```typescript
// Dans votre fichier d'entrée principal
import { logger } from './shared/utils/logger';

// Force la configuration production
logger.setLevels(['warn', 'error']);
logger.setContexts(['security', 'performance', 'app']);
```

## 🎨 Personnalisation des Contextes

Vous pouvez activer/désactiver des contextes spécifiques :

```typescript
// Seulement les logs de stockage
logger.setContexts(['storage']);

// Stockage + sécurité
logger.setContexts(['storage', 'security']);

// Tous les contextes (développement)
logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
```

## 📊 Niveaux de Log Disponibles

- **`debug`** : Informations détaillées pour le débogage
- **`info`** : Informations générales sur le fonctionnement
- **`warn`** : Avertissements qui n'empêchent pas le fonctionnement
- **`error`** : Erreurs critiques qui affectent le fonctionnement

## 🎯 Contextes Disponibles

- **`app`** : Logs généraux de l'application
- **`storage`** : Opérations de base de données et fichiers
- **`ui`** : Interactions utilisateur et composants
- **`network`** : Requêtes API et communications réseau
- **`performance`** : Métriques et performances
- **`security`** : Authentification et sécurité

## 🔍 Exemple Complet

```typescript
import { logger } from './shared/utils/logger';

// Configuration au démarrage de l'app
const configureLogging = () => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Développement : tout voir
    logger.setLevels(['debug', 'info', 'warn', 'error']);
    logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
  } else {
    // Production : seulement l'essentiel
    logger.setLevels(['warn', 'error']);
    logger.setContexts(['security', 'performance', 'app']);
  }
};

// Utilisation dans vos composants
const MyComponent = () => {
  const handleClick = () => {
    logger.ui('Button clicked', { component: 'MyComponent' });
  };

  const loadData = async () => {
    try {
      logger.storage('Loading data', { source: 'api' });
      const data = await fetchData();
      logger.info('Data loaded successfully', { count: data.length });
    } catch (error) {
      logger.error('Failed to load data', { error });
    }
  };

  return <button onClick={handleClick}>Load Data</button>;
};
```

## ✅ Résultat Attendu

Une fois configuré, les logs s'afficheront selon votre environnement :

- **Développement** : Tous les logs avec contexte et timestamp
- **Production** : Seulement les warnings et erreurs critiques
- **Tests** : Configuration minimale pour éviter le bruit

## 🎯 Prochaines Étapes

1. **Corriger les imports** : Utiliser le script `fix-logger-imports.cjs`
2. **Tester la configuration** : Vérifier que les logs s'affichent correctement
3. **Ajuster les niveaux** : Personnaliser selon vos besoins spécifiques
4. **Monitor en production** : Surveiller les logs d'erreur et performance

---

**Note** : La configuration automatique dans `logger.ts` devrait fonctionner pour la plupart des cas. Personnalisez uniquement si vous avez des besoins spécifiques.
