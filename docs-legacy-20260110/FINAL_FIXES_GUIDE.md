# 🔧 Guide Final de Correction des Logs

## ✅ **État Actuel**

La migration a été réussie mais il reste quelques erreurs manuelles à corriger. Voici comment les résoudre rapidement.

## 🎯 **Erreurs Restantes à Corriger**

### **1. Imports incorrects**

Dans ces fichiers, corrigez les imports :

#### `src/services/storage/db.ts` (ligne 9)

```typescript
// Avant
import { logger } from './shared/utils/logger';

// Après
import { logger } from '../../shared/utils/logger';
```

#### `src/shared/constants/animations.ts` (ligne 4)

```typescript
// Avant
import { logger } from './shared/utils/logger';

// Après
import { logger } from '../utils/logger';
```

### **2. Appels logger avec 1 argument au lieu de 2**

Dans `src/services/storage/folders.ts`, corrigez ces lignes :

#### Ligne 54

```typescript
// Avant
logger.debug(`[Storage] Virtual folder saved: ${folder.name} (${folder.id})`, folder);

// Après
logger.debug('storage', `[Storage] Virtual folder saved: ${folder.name} (${folder.id})`, folder);
```

#### Ligne 59

```typescript
// Avant
logger.debug(`[Storage] Virtual folder deleted: ${folderId}`);

// Après
logger.debug('storage', `[Storage] Virtual folder deleted: ${folderId}`);
```

#### Ligne 89

```typescript
// Avant
logger.debug(`[Storage] Shadow folder created: ${name} (${id}) for source ${sourceFolderId}`);

// Après
logger.debug(
  'storage',
  `[Storage] Shadow folder created: ${name} (${id}) for source ${sourceFolderId}`
);
```

#### Ligne 134

```typescript
// Avant
logger.debug(`[Storage] Shadow folder deleted: ${shadowFolderId}`);

// Après
logger.debug('storage', `[Storage] Shadow folder deleted: ${shadowFolderId}`);
```

#### Ligne 148

```typescript
// Avant
logger.debug(`[Storage] All shadow folders deleted for collection: ${collectionId}`);

// Après
logger.debug('storage', `[Storage] All shadow folders deleted for collection: ${collectionId}`);
```

#### Ligne 309

```typescript
// Avant
logger.debug(`[Storage] ✅ Created folder "${folderName}" with ${count} items`);

// Après
logger.debug('storage', `[Storage] ✅ Created folder "${folderName}" with ${count} items`);
```

#### Ligne 339

```typescript
// Avant
logger.debug(`[Storage] ✅ Created folder "${folderName}" with ${count} items`);

// Après
logger.debug('storage', `[Storage] ✅ Created folder "${folderName}" with ${count} items`);
```

### **3. Erreurs de type dans logger.ts**

Dans `src/shared/utils/logger.ts`, corrigez les lignes 35 et 40 :

#### Ligne 35

```typescript
// Avant
this.enabledLevels = new Set(
  this.isDevelopment ? ['debug', 'info', 'warn', 'error'] : ['warn', 'error']
);

// Après
this.enabledLevels = new Set<LogLevel>(
  this.isDevelopment ? ['debug', 'info', 'warn', 'error'] : ['warn', 'error']
);
```

#### Ligne 40

```typescript
// Avant
this.enabledContexts = new Set(['app', 'storage', 'ui', 'network', 'performance', 'security']);

// Après
this.enabledContexts = new Set<LogContext>([
  'app',
  'storage',
  'ui',
  'network',
  'performance',
  'security',
]);
```

## 🚀 **Correction Rapide avec Scripts**

Vous pouvez utiliser les scripts créés pour accélérer :

```bash
# Corriger les imports restants
node scripts/fix-all-logger-imports.cjs

# Corriger les appels logger
node scripts/fix-logger-calls.cjs
```

## 🎯 **Vérification Finale**

Après corrections, testez :

```bash
# Vérifier que App.tsx compile
npx tsc --noEmit src/App.tsx

# Vérifier que folders.ts compile
npx tsc --noEmit src/services/storage/folders.ts

# Type-check complet
npm run type-check
```

## ✅ **Configuration des Niveaux**

Une fois les erreurs corrigées, configurez les niveaux dans votre App.tsx :

```typescript
import { logger } from './shared/utils/logger';

// Configuration selon l'environnement
if (process.env.NODE_ENV === 'development') {
  logger.setLevels(['debug', 'info', 'warn', 'error']);
  logger.setContexts(['app', 'storage', 'ui', 'network', 'performance', 'security']);
} else {
  logger.setLevels(['warn', 'error']);
  logger.setContexts(['security', 'performance', 'app']);
}
```

## 🎨 **Utilisation des Logs**

```typescript
// Logs contextuels
logger.storage('Collection created', { name, id });
logger.performance('Image processing completed', { duration: 1500 });
logger.security('API key validation failed', error);
logger.ui('Button clicked', { action: 'open-settings' });

// Logs génériques
logger.debug('app', 'Variable value', variable);
logger.info('app', 'Process started', { step: 1 });
logger.warn('app', 'Deprecated feature used', { feature: 'old-api' });
logger.error('app', 'Critical error', { error: exception });
```

---

**🎯 Après ces corrections, votre système de logging sera fully fonctionnel !**

Les logs s'afficheront automatiquement selon votre environnement avec le bon format et les bons contextes.
