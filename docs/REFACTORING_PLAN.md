# Plan de Refactorisation - Lumina Portfolio

Dernière mise à jour : 25/12/2024 à 00:20

---

## 🎯 Objectif

Améliorer la maintenabilité, lisibilité et performance du code via une refactorisation structurée en 4 phases.

---

## 🏆 Forces Actuelles

| Aspect | Description |
|--------|-------------|
| **Architecture Feature-Based** | Découpage fonctionnel clair (`library/`, `navigation/`, `collections/`, `vision/`, `tags/`) |
| **Context Split Pattern** | `LibraryContext` séparé en State/Dispatch pour éviter les re-renders |
| **Virtualisation UI** | `@tanstack/react-virtual` pour le rendu de milliers d'items |
| **Custom Hooks** | Logique métier isolée (`useKeyboardShortcuts`, `useItemActions`, etc.) |
| **Tests Unitaires** | 40+ tests Vitest couvrant les hooks critiques |

---

## ⚠️ Faiblesses Identifiées

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `LibraryContext.tsx` | 688 | Trop de responsabilités, reducer non extrait |
| `storageService.ts` | 546 | 29 fonctions non modulaires |
| `App.tsx` | 519 | Encore trop de logique |
| `PhotoCard.tsx` | 364 | Composant monolithique |

### Autres Problèmes

- **Typage** : Multiples `any` dans `storageService.ts`
- **Base de données** : Aucun index SQLite, tags non normalisés
- **Duplication** : Logique de chargement dupliquée entre fichiers
- **Animations** : Variants Framer Motion non centralisés

---

## 📋 Plan de Refactorisation

### Phase 1 : Quick Wins (1-2 jours) ✅ COMPLÉTÉ

- [x] Ajouter index SQLite sur `metadata.collectionId`, `metadata.virtualFolderId`, `virtual_folders.sourceFolderId`, `collection_folders.collectionId`
- [x] Remplacer types `any` par interfaces strictes dans `storageService.ts` (18 remplacements)
- [x] Créer `src/shared/theme/animations.ts` pour centraliser les variants (15+ variants)

### Phase 2 : Refactorisation Services (2-3 jours) ✅ COMPLÉTÉ

Découpage de `storageService.ts` :

```
src/services/storage/
├── index.ts           # Export unifié + storageService object
├── db.ts              # Connexion SQLite + init schéma
├── collections.ts     # CRUD Collections
├── folders.ts         # Dossiers virtuels & Shadow
├── metadata.ts        # Métadonnées items
└── handles.ts         # Directory handles (legacy)
```

**Résultat** : `storageService.ts` réduit de 580 à 18 lignes (re-export)

Refactorisation de `LibraryContext.tsx` :
- [ ] Extraire reducer → `libraryReducer.ts`
- [ ] Extraire types → `libraryTypes.ts`
- [ ] Créer hooks spécialisés (`useLibraryLoader`, `useLibraryFilters`)

### Phase 3 : Refactorisation UI (2-3 jours) ✅ COMPLÉTÉ

Décomposition de `PhotoCard.tsx` :

```
src/features/library/components/PhotoCard/
├── index.tsx           # Composant principal (assemblage)
├── PhotoCardFront.tsx  # Face avant (image + overlay)
├── PhotoCardBack.tsx   # Face arrière (métadonnées)
├── PhotoCardBadges.tsx # Badges (couleur, sélection)
└── usePhotoCardFlip.ts # Hook animation flip
```

**Résultat** : `PhotoCard.tsx` réduit de 364 à 8 lignes (re-export)

Design System :

```
src/design-system/
├── tokens/           # colors, spacing, typography
├── primitives/       # Button, Card, Modal
└── patterns/         # GlassCard, ActionMenu, TagPill
```

### Phase 4 : Optimisation DB (1-2 jours)

- [ ] Créer table `tags` normalisée
- [ ] Créer table `item_tags` (many-to-many)
- [ ] Préparer table `thumbnails` pour cache images
- [ ] Implémenter migrations SQLite automatisées

---

## 🗄️ Schéma DB Proposé

### Index à Ajouter

```sql
CREATE INDEX idx_metadata_collection ON metadata(collectionId);
CREATE INDEX idx_metadata_virtualfolder ON metadata(virtualFolderId);
CREATE INDEX idx_virtualfolders_source ON virtual_folders(sourceFolderId);
```

### Nouvelle Table Tags

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'ai' | 'manual'
  createdAt INTEGER
);

CREATE TABLE item_tags (
  itemId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (itemId, tagId)
);
```

---

## 📊 Métriques Cibles

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Lignes max/fichier | 688 | < 300 |
| Fonctions par module | 29 | < 10 |
| Types `any` | ~15 | 0 |
| Couverture tests | ~40% | > 70% |
| Index SQLite | 0 | 4+ |

---

## ✅ Vérification Post-Refactorisation

```bash
# Build
npm run build

# Tests
npm run test

# TypeScript
npx tsc --noEmit

# Dev
npm run tauri:dev
```

---

## 📝 Historique des Modifications

| Date | Phase | Description |
|------|-------|-------------|
| 24/12/2024 | - | Création du plan initial |
| 25/12/2024 | 1 | Phase 1 complétée : Index SQLite, typage strict, animations centralisées |
| 25/12/2024 | 2 | Phase 2 complétée : Découpage storageService en 6 modules |
| 25/12/2024 | 3 | Phase 3 complétée : Décomposition PhotoCard en 5 sous-composants |
