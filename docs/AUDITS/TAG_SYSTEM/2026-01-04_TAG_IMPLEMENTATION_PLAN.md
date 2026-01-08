# Plan d'Implémentation - Système de Tags
## Lumina Portfolio - Roadmap Complète

**Date**: 4 janvier 2026  
**Version**: 1.0  
**Basé sur**: Audit TAG_FEATURE_AUDIT_FINAL_FR.md  
**Statut**: 📋 **Ready to Execute**

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Phase 1: Fixes Critiques](#phase-1-fixes-critiques-sprint-1)
3. [Phase 2: Améliorations UX](#phase-2-améliorations-ux-sprint-2)
4. [Phase 3: Nouvelles Fonctionnalités](#phase-3-nouvelles-fonctionnalités-sprint-3)
5. [Phase 4: Optimisations](#phase-4-optimisations-et-polish)
6. [Dépendances et Risques](#dépendances-et-risques)
7. [Critères de Succès](#critères-de-succès)

---

## 🎯 Vue d'Ensemble

### Objectif Global

Compléter le système de tags de Lumina Portfolio de **95% à 98%** en implémentant les fonctionnalités manquantes critiques et en corrigeant les bugs identifiés.

### Priorisation

```
Phase 1 (2 semaines) : Fixes Critiques        → 🔴 Priority: HIGH
Phase 2 (2 semaines) : Améliorations UX       → 🟡 Priority: MEDIUM
Phase 3 (4+ semaines): Nouvelles Features     → 🟢 Priority: LOW-MEDIUM
Phase 4 (Ongoing)    : Optimisations & Polish → 🟢 Priority: LOW
```

### Ressources Estimées

| Phase | Effort Total | Développeurs | Durée |
|-------|-------------|--------------|-------|
| Phase 1 | 14 heures | 1 dev | 2 semaines |
| Phase 2 | 34 heures | 1 dev | 2 semaines |
| Phase 3 | 92 heures | 1-2 devs | 4-6 semaines |
| Phase 4 | Ongoing | 1 dev | Continuous |

---

## 🚨 Phase 1: Fixes Critiques (Sprint 1)

**Durée**: 2 semaines  
**Effort Total**: 14 heures  
**Objectif**: Corriger les bugs bloquants et intégrer le code orphelin

---

### 1.1 Intégrer BatchTagPanel 🔴

**Priority**: CRITICAL  
**Effort**: 8 heures  
**Issue**: Code complet (359 lignes) mais non accessible dans l'UI

#### Tâches Détaillées

##### Tâche 1.1.1: Créer State Dédié (1h)

**Fichier**: `src/App.tsx`

**Action**:
```typescript
// Ajouter après les autres états modaux (ligne ~145)
const {
  isOpen: isBatchTagPanelOpen,
  setIsOpen: setIsBatchTagPanelOpen
} = useModalState("batchTagPanel");
```

**Modifications**:
1. Import `useModalState` si pas déjà fait
2. Ajouter le nouveau state
3. Passer à `BatchTagPanel` au lieu de `isAddTagModalOpen`

**Tests**:
- [ ] State s'ouvre/ferme correctement
- [ ] Pas de conflit avec `isAddTagModalOpen`

---

##### Tâche 1.1.2: Ajouter Bouton dans TopBar (2h)

**Fichier**: `src/features/navigation/components/TopBar.tsx`

**Action**:
```typescript
// Ajouter dans la section des boutons (après le bouton Tag Hub)
<Button
  onClick={onOpenBatchTagPanel}
  disabled={selectedCount === 0}
  tooltip={t('tags:batchTagSelectedItems')}
  className="p-2 hover:bg-glass-bg-accent rounded-lg"
>
  <Tags size={20} />
  {selectedCount > 0 && (
    <span className="ml-2 text-xs bg-blue-500/20 px-2 py-0.5 rounded-full">
      {selectedCount}
    </span>
  )}
</Button>
```

**Props à ajouter**:
```typescript
interface TopBarProps {
  // ... existing props
  selectedCount: number;
  onOpenBatchTagPanel: () => void;
}
```

**Modifications dans App.tsx**:
```typescript
<TopBar
  // ... existing props
  selectedCount={selectedIds.size}
  onOpenBatchTagPanel={() => setIsBatchTagPanelOpen(true)}
/>
```

**i18n**:
```json
// locales/en/tags.json
{
  "batchTagSelectedItems": "Batch Tag ({{count}} selected)"
}

// locales/fr/tags.json
{
  "batchTagSelectedItems": "Tags Multiple ({{count}} sélectionnés)"
}
```

**Tests**:
- [ ] Bouton visible dans TopBar
- [ ] Disabled quand aucun item sélectionné
- [ ] Badge affiche le bon nombre
- [ ] Click ouvre BatchTagPanel
- [ ] Tooltip affiché correctement

---

##### Tâche 1.1.3: Update Keyboard Shortcut (1h)

**Fichier**: `src/shared/hooks/useKeyboardShortcuts.ts`

**Action**:
```typescript
// Modifier le shortcut existant
if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
  e.preventDefault();
  onOpenBatchTagPanel();
}
```

**Props à ajouter**:
```typescript
interface UseKeyboardShortcutsProps {
  // ... existing props
  onOpenBatchTagPanel: () => void;
}
```

**Modifications dans App.tsx**:
```typescript
useKeyboardShortcuts({
  // ... existing props
  onOpenBatchTagPanel: () => {
    if (selectedIds.size > 0) {
      setIsBatchTagPanelOpen(true);
    }
  },
});
```

**Tests**:
- [ ] `Ctrl+Shift+T` ouvre BatchTagPanel
- [ ] Ne fonctionne que si items sélectionnés
- [ ] Pas de conflit avec `Ctrl+T` (TagHub)

---

##### Tâche 1.1.4: Update Modal Rendering (1h)

**Fichier**: `src/App.tsx`

**Action**:
```typescript
{/* Remplacer la section actuelle */}
{/* AddTagModal - Simple Quick Add */}
<AddTagModal
  isOpen={isAddTagModalOpen && !isBatchTagPanelOpen}
  onClose={handleCloseAddTagModal}
  selectedCount={selectedIds.size}
  onAddTag={handleAddTag}
/>

{/* BatchTagPanel - Advanced Multi-Tag Interface */}
<BatchTagPanel
  isOpen={isBatchTagPanelOpen}
  onClose={() => setIsBatchTagPanelOpen(false)}
  selectedItems={selectedItemsArray}
  availableTags={availableTags}
  onApplyChanges={handleApplyBatchTags}
/>
```

**Tests**:
- [ ] Les deux modals ne s'ouvrent pas simultanément
- [ ] BatchTagPanel affiche les bon items
- [ ] Apply changes fonctionne
- [ ] Fermeture propre

---

##### Tâche 1.1.5: Documentation (1h)

**Fichiers**:
- `docs/TAG_HUB_USER_GUIDE.md`
- `docs/guides/features/TAG_SYSTEM_README.md`

**Contenu à ajouter**:
```markdown
### Batch Tagging

Pour taguer plusieurs images à la fois:

1. **Sélectionner les images** (Ctrl+Click ou Shift+Click)
2. **Ouvrir BatchTagPanel**:
   - Bouton dans TopBar (icône Tags)
   - Raccourci: `Ctrl+Shift+T`
3. **Visualiser les tags existants**:
   - **Common Tags**: Présents sur tous les items
   - **Partial Tags**: Présents sur certains items (avec barre de progression)
4. **Ajouter des tags**:
   - Taper dans le champ input
   - Séparer par virgules pour plusieurs tags
   - Utiliser Quick Tags (touches 1-9)
5. **Gérer les tags partiels**:
   - "Add to All": Ajoute à tous les items
   - "Remove from All": Supprime de tous
6. **Preview et Apply**: Vérifier les changements avant de confirmer
```

**Tests**:
- [ ] Documentation complète et claire
- [ ] Screenshots ajoutés
- [ ] Exemples fonctionnels

---

##### Tâche 1.1.6: Tests Unitaires (2h)

**Fichier**: `tests/BatchTagPanel.test.tsx` (nouveau)

**Tests à créer**:
```typescript
describe('BatchTagPanel', () => {
  it('should display common tags', () => {
    // Test affichage des tags communs
  });

  it('should display partial tags with progress', () => {
    // Test affichage des tags partiels
  });

  it('should allow multi-tag input', () => {
    // Test input comma-separated
  });

  it('should apply changes correctly', () => {
    // Test application des changements
  });

  it('should show preview before applying', () => {
    // Test preview section
  });

  it('should handle quick tags shortcuts', () => {
    // Test touches 1-9
  });
});
```

**Tests**:
- [ ] Tous les tests passent
- [ ] Coverage > 80% pour BatchTagPanel

---

**Acceptance Criteria** ✅:
- [x] Bouton visible dans TopBar quand items sélectionnés
- [x] Raccourci `Ctrl+Shift+T` fonctionnel
- [x] UI affiche common + partial tags correctement
- [x] Apply changes met à jour la DB
- [x] Pas de régression sur AddTagModal
- [x] Documentation complète
- [x] Tests unitaires ajoutés

---

### 1.2 Persister Settings du TagHub 🔴

**Priority**: HIGH  
**Effort**: 4 heures  
**Issue**: Configuration perdue à chaque session (TODO ligne 44)

#### Tâches Détaillées

##### Tâche 1.2.1: Créer Utilitaires Storage (1h)

**Fichier**: `src/shared/utils/tagSettings.ts` (nouveau)

**Code**:
```typescript
/**
 * Tag Settings Persistence
 * Stores user preferences in localStorage with versioning
 */

export interface TagSettings {
  // Thresholds
  levenshteinThreshold: number;
  jaccardThreshold: number;
  minUsageCount: number;

  // Preferences
  showAiTagsSeparately: boolean;
  suggestAliasesWhileTyping: boolean;
  autoMergeObviousDuplicates: boolean;
  confirmBeforeMerge: boolean;

  // Metadata
  version: number;
  lastUpdated: number;
}

const SETTINGS_KEY = 'lumina_tag_settings';
const CURRENT_VERSION = 1;

export const DEFAULT_TAG_SETTINGS: TagSettings = {
  levenshteinThreshold: 2,
  jaccardThreshold: 80,
  minUsageCount: 1,
  showAiTagsSeparately: true,
  suggestAliasesWhileTyping: true,
  autoMergeObviousDuplicates: false,
  confirmBeforeMerge: true,
  version: CURRENT_VERSION,
  lastUpdated: Date.now(),
};

/**
 * Load settings from localStorage
 */
export const loadTagSettings = (): TagSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_TAG_SETTINGS;
    }

    const parsed = JSON.parse(stored) as TagSettings;

    // Version migration
    if (parsed.version < CURRENT_VERSION) {
      return migrateSettings(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('[TagSettings] Failed to load:', error);
    return DEFAULT_TAG_SETTINGS;
  }
};

/**
 * Save settings to localStorage
 */
export const saveTagSettings = (settings: TagSettings): void => {
  try {
    const toSave: TagSettings = {
      ...settings,
      version: CURRENT_VERSION,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
    console.log('[TagSettings] Saved successfully');
  } catch (error) {
    console.error('[TagSettings] Failed to save:', error);
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please clear some browser data.');
    }
  }
};

/**
 * Reset settings to defaults
 */
export const resetTagSettings = (): TagSettings => {
  const defaults = { ...DEFAULT_TAG_SETTINGS };
  saveTagSettings(defaults);
  return defaults;
};

/**
 * Migrate settings from old version
 */
const migrateSettings = (old: Partial<TagSettings>): TagSettings => {
  console.log('[TagSettings] Migrating from version', old.version, 'to', CURRENT_VERSION);
  
  // Add migration logic here as versions evolve
  // Example:
  // if (old.version === 0) {
  //   // Add new fields with defaults
  // }

  return {
    ...DEFAULT_TAG_SETTINGS,
    ...old,
    version: CURRENT_VERSION,
    lastUpdated: Date.now(),
  };
};
```

**Tests**:
- [ ] `loadTagSettings()` returns defaults si rien en storage
- [ ] `saveTagSettings()` persiste correctement
- [ ] `resetTagSettings()` restaure les defaults
- [ ] Migration fonctionne (simuler old version)
- [ ] Gère quota exceeded gracefully

---

##### Tâche 1.2.2: Intégrer dans SettingsTab (2h)

**Fichier**: `src/features/tags/components/TagHub/SettingsTab.tsx`

**Modifications**:

1. **Imports**:
```typescript
import {
  loadTagSettings,
  saveTagSettings,
  resetTagSettings,
  DEFAULT_TAG_SETTINGS,
  type TagSettings
} from '@/shared/utils/tagSettings';
import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash'; // ou créer custom debounce
```

2. **Replace useState**:
```typescript
// Remplacer l'état local par settings persistés
const [settings, setSettings] = useState<TagSettings>(() => loadTagSettings());
```

3. **Debounced Save**:
```typescript
// Debounce pour éviter trop d'écritures
const debouncedSave = useCallback(
  debounce((settings: TagSettings) => {
    saveTagSettings(settings);
  }, 500),
  []
);

// Update settings et save
const updateSettings = (newSettings: TagSettings) => {
  setSettings(newSettings);
  debouncedSave(newSettings);
};
```

4. **Load on Mount**:
```typescript
useEffect(() => {
  const loaded = loadTagSettings();
  setSettings(loaded);
}, []);
```

5. **Reset Handler**:
```typescript
const handleReset = () => {
  if (confirm(t('tags:confirmResetSettings'))) {
    const defaults = resetTagSettings();
    setSettings(defaults);
  }
};
```

6. **Supprimer le TODO**:
```typescript
// AVANT:
// TODO: Persist settings to localStorage or database

// APRÈS:
// Settings automatically persisted to localStorage (debounced)
```

**i18n**:
```json
// locales/en/tags.json
{
  "confirmResetSettings": "Reset all tag settings to defaults? This cannot be undone."
}

// locales/fr/tags.json
{
  "confirmResetSettings": "Réinitialiser tous les paramètres de tags ? Cette action est irréversible."
}
```

**Tests**:
- [ ] Settings loadés au mount
- [ ] Changes saved automatiquement (debounced)
- [ ] Reset demande confirmation
- [ ] Settings persistent après reload
- [ ] Pas d'erreur si localStorage plein

---

##### Tâche 1.2.3: Tests Unitaires (1h)

**Fichier**: `tests/tagSettings.test.ts` (nouveau)

**Tests**:
```typescript
describe('Tag Settings Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return defaults when no settings stored', () => {
    const settings = loadTagSettings();
    expect(settings).toEqual(DEFAULT_TAG_SETTINGS);
  });

  it('should save and load settings', () => {
    const custom: TagSettings = {
      ...DEFAULT_TAG_SETTINGS,
      levenshteinThreshold: 3,
    };
    saveTagSettings(custom);
    const loaded = loadTagSettings();
    expect(loaded.levenshteinThreshold).toBe(3);
  });

  it('should reset to defaults', () => {
    saveTagSettings({ ...DEFAULT_TAG_SETTINGS, levenshteinThreshold: 3 });
    const reset = resetTagSettings();
    expect(reset).toEqual(DEFAULT_TAG_SETTINGS);
  });

  it('should migrate old version', () => {
    const oldSettings = { version: 0, levenshteinThreshold: 1 };
    localStorage.setItem('lumina_tag_settings', JSON.stringify(oldSettings));
    const loaded = loadTagSettings();
    expect(loaded.version).toBe(1);
  });
});
```

**Tests**:
- [ ] Tous les tests passent
- [ ] Coverage > 90%

---

**Acceptance Criteria** ✅:
- [x] Settings persistent après reload
- [x] Debounced save (pas de spam)
- [x] Reset button avec confirmation
- [x] Version tracking pour migrations futures
- [x] Gère quota exceeded
- [x] Tests unitaires complets

---

### 1.3 Ajouter Confirmation Dialogs 🟡

**Priority**: MEDIUM  
**Effort**: 2 heures  
**Issue**: Opérations destructives sans confirmation

#### Tâches Détaillées

##### Tâche 1.3.1: Créer Composant Dialog Réutilisable (1h)

**Fichier**: `src/shared/components/ui/ConfirmDialog.tsx` (nouveau)

**Code**:
```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning',
}) => {
  const { t } = useTranslation('common');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantColors = {
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-white/10 rounded-xl shadow-2xl z-[101] p-6"
          >
            {/* Icon + Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-lg bg-${variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-500/20`}>
                <AlertTriangle className={`w-6 h-6 ${variantColors[variant]}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-white/70 mt-1">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg"
              >
                {cancelText || t('cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg ${
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : variant === 'warning'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {confirmText || t('confirm')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

**Export**:
```typescript
// src/shared/components/ui/index.ts
export { ConfirmDialog } from './ConfirmDialog';
```

**Tests**:
- [ ] Composant render correctement
- [ ] Backdrop ferme le dialog
- [ ] Confirm déclenche callback
- [ ] Cancel ferme sans callback
- [ ] Variants affichent bonnes couleurs

---

##### Tâche 1.3.2: Intégrer dans FusionTab (30min)

**Fichier**: `src/features/tags/components/TagHub/FusionTab.tsx`

**Modifications**:
```typescript
import { ConfirmDialog } from '@/shared/components/ui';
import { useState } from 'react';

// Add state
const [showMergeAllConfirm, setShowMergeAllConfirm] = useState(false);

// Replace direct merge
const handleMergeAll = () => {
  setShowMergeAllConfirm(true);
};

const executeMergeAll = async () => {
  // Existing merge logic
  for (const group of groups) {
    await handleMerge(group);
  }
};

// Add dialog
<ConfirmDialog
  isOpen={showMergeAllConfirm}
  onClose={() => setShowMergeAllConfirm(false)}
  onConfirm={executeMergeAll}
  title={t('tags:confirmMergeAll')}
  message={t('tags:confirmMergeAllMessage', { count: groups.length })}
  variant="warning"
/>
```

**i18n**:
```json
{
  "confirmMergeAll": "Merge All Groups?",
  "confirmMergeAllMessage": "This will merge {{count}} tag groups. This action cannot be undone."
}
```

---

##### Tâche 1.3.3: Intégrer dans ManageTab (30min)

**Fichier**: `src/features/tags/components/TagHub/ManageTab.tsx`

**Modifications similaires pour**:
- Delete Selected
- Merge Selected

---

**Acceptance Criteria** ✅:
- [x] Merge All demande confirmation
- [x] Delete Selected demande confirmation
- [x] Reset Settings demande confirmation
- [x] Composant Dialog réutilisable
- [x] UI cohérente avec design system

---

## ✅ Phase 1 - Résumé

**Effort Total**: 14 heures  
**Durée**: 2 semaines (avec testing et review)

**Livrables**:
1. ✅ BatchTagPanel accessible et fonctionnel
2. ✅ Settings persistés dans localStorage
3. ✅ Confirmations pour opérations destructives
4. ✅ Tests unitaires ajoutés
5. ✅ Documentation mise à jour

**État après Phase 1**: **96% Complet**

---

## 🎨 Phase 2: Améliorations UX (Sprint 2)

**Durée**: 2 semaines  
**Effort Total**: 34 heures  
**Objectif**: Améliorer l'expérience utilisateur et la robustesse

---

### 2.1 Undo Functionality 🟡

**Priority**: MEDIUM-HIGH  
**Effort**: 16 heures  
**Impact**: Utilisateurs auront confiance pour merger

#### Tâches Détaillées

##### Tâche 2.1.1: Extend Database Schema (2h)

**Fichier**: `src/services/storage/db.ts`

**Action**:
```sql
-- Add migration
ALTER TABLE tag_merges ADD COLUMN sourceTagName TEXT;
ALTER TABLE tag_merges ADD COLUMN itemIdsJson TEXT;
```

**Migration Code**:
```typescript
export const migrateTagMergesV2 = async () => {
  const db = await getDB();
  
  try {
    // Check if columns exist
    const result = await db.select(
      "PRAGMA table_info(tag_merges)"
    );
    
    const hasSourceName = result.some(col => col.name === 'sourceTagName');
    const hasItemIds = result.some(col => col.name === 'itemIdsJson');
    
    if (!hasSourceName) {
      await db.execute(
        "ALTER TABLE tag_merges ADD COLUMN sourceTagName TEXT"
      );
      console.log('[Migration] Added sourceTagName to tag_merges');
    }
    
    if (!hasItemIds) {
      await db.execute(
        "ALTER TABLE tag_merges ADD COLUMN itemIdsJson TEXT"
      );
      console.log('[Migration] Added itemIdsJson to tag_merges');
    }
  } catch (error) {
    console.error('[Migration] Failed:', error);
  }
};
```

**Tests**:
- [ ] Migration s'exécute sans erreur
- [ ] Colonnes ajoutées correctement
- [ ] Migration idempotente (peut run multiple fois)

---

##### Tâche 2.1.2: Update mergeTags() (4h)

**Fichier**: `src/services/storage/tags.ts`

**Modifications**:
```typescript
/**
 * Merge multiple tags into one target tag
 * Now captures snapshot for undo capability
 */
export const mergeTags = async (
  targetTagId: string,
  sourceTagIds: string[]
): Promise<void> => {
  const db = await getDB();

  // Get target tag info
  const targetTag = await db.select<DBTag[]>(
    "SELECT * FROM tags WHERE id = ?",
    [targetTagId]
  );

  if (!targetTag.length) {
    throw new Error(`Target tag ${targetTagId} not found`);
  }

  for (const sourceId of sourceTagIds) {
    // Get source tag info for undo
    const sourceTag = await db.select<DBTag[]>(
      "SELECT * FROM tags WHERE id = ?",
      [sourceId]
    );

    if (!sourceTag.length) continue;

    // Capture items with source tag (for undo)
    const itemsWithSource = await db.select<{ itemId: string }[]>(
      "SELECT itemId FROM item_tags WHERE tagId = ?",
      [sourceId]
    );

    // Capture items with target tag (for undo)
    const itemsWithTarget = await db.select<{ itemId: string }[]>(
      "SELECT itemId FROM item_tags WHERE tagId = ?",
      [targetTagId]
    );

    // Create snapshot
    const snapshot = {
      sourceItems: itemsWithSource.map(i => i.itemId),
      targetItems: itemsWithTarget.map(i => i.itemId),
    };

    // Re-associate items
    for (const item of itemsWithSource) {
      await db.execute(
        "INSERT OR IGNORE INTO item_tags (itemId, tagId, addedAt) VALUES (?, ?, ?)",
        [item.itemId, targetTagId, Date.now()]
      );
    }

    // Log merge with snapshot
    await addMergeToHistory(
      targetTagId,
      sourceId,
      'user',
      sourceTag[0].name,
      JSON.stringify(snapshot)
    );

    // Delete source tag (CASCADE will handle item_tags)
    await db.execute("DELETE FROM tags WHERE id = ?", [sourceId]);
  }

  invalidateAnalysisCache();
  console.log(`[Storage] Merged ${sourceTagIds.length} tags into ${targetTagId}`);
};
```

**Update addMergeToHistory**:
```typescript
export const addMergeToHistory = async (
  targetTagId: string,
  sourceTagId: string,
  mergedBy: string,
  sourceTagName: string,
  itemIdsJson: string
): Promise<void> => {
  const db = await getDB();
  await db.execute(
    `INSERT INTO tag_merges 
     (id, targetTagId, sourceTagId, mergedAt, mergedBy, sourceTagName, itemIdsJson) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      generateId('merge'),
      targetTagId,
      sourceTagId,
      Date.now(),
      mergedBy,
      sourceTagName,
      itemIdsJson,
    ]
  );
};
```

**Tests**:
- [ ] Merge crée snapshot
- [ ] itemIdsJson est valide JSON
- [ ] sourceTagName capturé
- [ ] Backwards compatible avec old merges

---

##### Tâche 2.1.3: Implement undoMerge() (4h)

**Fichier**: `src/services/storage/tags.ts`

**Code**:
```typescript
/**
 * Undo a tag merge operation
 * Restores the source tag and original item associations
 */
export const undoMerge = async (mergeId: string): Promise<void> => {
  const db = await getDB();

  // Get merge record
  const merges = await db.select<any[]>(
    `SELECT * FROM tag_merges WHERE id = ?`,
    [mergeId]
  );

  if (!merges.length) {
    throw new Error(`Merge ${mergeId} not found`);
  }

  const merge = merges[0];

  // Parse snapshot
  let snapshot: { sourceItems: string[]; targetItems: string[] };
  try {
    snapshot = JSON.parse(merge.itemIdsJson);
  } catch (error) {
    throw new Error('Cannot undo merge: no snapshot available');
  }

  // Recreate source tag
  const sourceTagId = generateId('tag');
  await db.execute(
    `INSERT INTO tags (id, name, normalizedName, type, createdAt) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      sourceTagId,
      merge.sourceTagName,
      merge.sourceTagName.toLowerCase(),
      'manual', // Assume manual for restored tags
      Date.now(),
    ]
  );

  // Restore original associations
  for (const itemId of snapshot.sourceItems) {
    // Remove from target
    await db.execute(
      "DELETE FROM item_tags WHERE itemId = ? AND tagId = ?",
      [itemId, merge.targetTagId]
    );

    // Add to restored source
    await db.execute(
      "INSERT INTO item_tags (itemId, tagId, addedAt) VALUES (?, ?, ?)",
      [itemId, sourceTagId, Date.now()]
    );
  }

  // Delete merge record
  await db.execute("DELETE FROM tag_merges WHERE id = ?", [mergeId]);

  invalidateAnalysisCache();
  console.log(`[Storage] Undid merge ${mergeId}`);
};

/**
 * Get merges that can be undone (last 24h or 50 merges)
 */
export const getUndoableMerges = async (): Promise<any[]> => {
  const db = await getDB();
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  return await db.select(
    `SELECT * FROM tag_merges 
     WHERE mergedAt > ? AND itemIdsJson IS NOT NULL
     ORDER BY mergedAt DESC 
     LIMIT 50`,
    [twentyFourHoursAgo]
  );
};
```

**Tests**:
- [ ] Undo restore source tag
- [ ] Undo restore associations correctement
- [ ] Undo supprime merge record
- [ ] Error si pas de snapshot
- [ ] getUndoableMerges filtre correctement

---

##### Tâche 2.1.4: Update TagMergeHistory UI (4h)

**Fichier**: `src/features/tags/components/TagMergeHistory.tsx`

**Modifications**:
```typescript
import { undoMerge, getUndoableMerges } from '@/services/storage/tags';
import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui';

// Replace getMergeHistory() with getUndoableMerges()
const [undoableMerges, setUndoableMerges] = useState<any[]>([]);

useEffect(() => {
  const loadMerges = async () => {
    const merges = await getUndoableMerges();
    setUndoableMerges(merges);
  };
  if (isOpen) loadMerges();
}, [isOpen]);

// Add undo handler
const handleUndo = async (mergeId: string) => {
  try {
    await undoMerge(mergeId);
    // Refresh list
    const updated = await getUndoableMerges();
    setUndoableMerges(updated);
    // Notify parent
    onMergeUndone?.();
  } catch (error) {
    console.error('Undo failed:', error);
    alert(t('tags:undoFailed'));
  }
};

// Update render
{undoableMerges.map((merge) => (
  <div key={merge.id} className="...">
    {/* Existing info */}
    <div>...</div>
    
    {/* Undo button */}
    {merge.itemIdsJson && (
      <Button
        onClick={() => handleUndo(merge.id)}
        className="..."
        title={t('tags:undoMerge')}
      >
        <RotateCcw size={16} />
      </Button>
    )}
  </div>
))}
```

**i18n**:
```json
{
  "undoMerge": "Undo this merge",
  "undoFailed": "Failed to undo merge. See console for details.",
  "mergeUndone": "Merge undone successfully"
}
```

**Tests**:
- [ ] Liste affiche merges undoables
- [ ] Bouton Undo visible si snapshot existe
- [ ] Click undo refresh la liste
- [ ] Feedback utilisateur approprié

---

##### Tâche 2.1.5: Tests Unitaires (2h)

**Fichier**: `tests/tagUndo.test.ts` (nouveau)

**Tests**:
```typescript
describe('Tag Undo Functionality', () => {
  it('should capture snapshot during merge', async () => {
    // Test snapshot creation
  });

  it('should undo merge and restore source tag', async () => {
    // Test undo logic
  });

  it('should restore original associations', async () => {
    // Test item re-association
  });

  it('should delete merge record after undo', async () => {
    // Test cleanup
  });

  it('should only return undoable merges', async () => {
    // Test getUndoableMerges filter
  });
});
```

---

**Acceptance Criteria** ✅:
- [x] Merge capture snapshots
- [x] Undo restore tags et associations
- [x] UI affiche bouton undo si possible
- [x] Undo limité à 24h ou 50 merges
- [x] Tests unitaires complets
- [x] Documentation mise à jour

---

### 2.2 Keyboard Shortcuts Registry 🟡

**Priority**: MEDIUM  
**Effort**: 6 heures  
**Impact**: Meilleure UX, évite conflits

#### Tâches Détaillées

*(Détails similaires pour Phase 2.2 et 2.3...)*

---

### 2.3 Enhanced Testing 🟡

**Priority**: MEDIUM  
**Effort**: 12 heures

*(Détails...)*

---

## ✅ Phase 2 - Résumé

**Effort Total**: 34 heures  
**Durée**: 2 semaines

**Livrables**:
1. ✅ Undo functionality complète
2. ✅ Keyboard shortcuts centralisés
3. ✅ Coverage tests > 85%
4. ✅ Help overlay (`?` key)

**État après Phase 2**: **97% Complet**

---

## 🚀 Phase 3: Nouvelles Fonctionnalités (Sprint 3+)

**Durée**: 4-6 semaines  
**Effort Total**: 92 heures

### 3.1 Tag Hierarchy (40h)
### 3.2 Tag Import/Export (12h)
### 3.3 AI Semantic Similarity (40h)

*(Détails complets si Phase 1-2 approuvées)*

---

## 📊 Dépendances et Risques

### Dépendances

| Tâche | Dépend de | Blocker? |
|-------|-----------|----------|
| 1.1.3 (Keyboard) | 1.1.1 (State) | Oui |
| 1.1.4 (Render) | 1.1.1, 1.1.2 | Oui |
| 2.1.4 (UI Undo) | 2.1.3 (API) | Oui |
| 3.1 (Hierarchy) | - | Non |

### Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| localStorage quota | Faible | Medium | Fallback to defaults + user warning |
| Undo corruption | Faible | High | Extensive testing + snapshot validation |
| Performance (10K tags) | Medium | Medium | Virtualization + pagination |
| Merge race condition | Faible | High | UI locking during operations |

---

## 🎯 Critères de Succès

### Phase 1 Success Metrics

- [ ] BatchTagPanel accessible en < 2 clicks
- [ ] Settings persistent entre sessions
- [ ] 0 merge accidentels (confirmations)
- [ ] Tests coverage > 80%

### Phase 2 Success Metrics

- [ ] Undo success rate > 95%
- [ ] Keyboard shortcuts adoption > 30%
- [ ] Tests coverage > 85%
- [ ] 0 critical bugs

### Phase 3 Success Metrics

- [ ] Tag hierarchy adoptée par power users
- [ ] Import/Export utilisé pour backups
- [ ] AI suggestions accuracy > 70%

---

## 📅 Timeline Visuel

```
Week 1-2  : Phase 1 (Fixes Critiques)
  ├── 1.1 BatchTagPanel     [========]
  ├── 1.2 Settings          [====]
  └── 1.3 Confirmations     [==]

Week 3-4  : Phase 2 (Améliorations UX)
  ├── 2.1 Undo              [================]
  ├── 2.2 Shortcuts         [======]
  └── 2.3 Tests             [============]

Week 5-10 : Phase 3 (Nouvelles Features)
  ├── 3.1 Hierarchy         [========================================]
  ├── 3.2 Import/Export     [============]
  └── 3.3 AI Semantic       [========================================]

Week 11+  : Phase 4 (Continuous)
  └── Optimizations         [ongoing...]
```

---

## 🏁 Next Steps

1. **Review ce plan** avec l'équipe
2. **Approuver Phase 1** (high priority)
3. **Créer tickets** dans backlog
4. **Assign développeur** pour Phase 1
5. **Start Sprint 1**

---

**Auteur**: Meta Orchestrator Agent  
**Date**: 4 janvier 2026  
**Version**: 1.0  
**Status**: 📋 **Ready for Implementation**
