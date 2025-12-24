# Changelog

Dernière mise à jour : 24/12/2024 à 14:50

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## [24/12/2024 - 14:50] - Refactorisation App.tsx

### Type : Modification

**Composant** : `src/App.tsx` + nouveaux hooks et composant

**Changements** :

- **Extraction de 3 custom hooks** :
  - `useKeyboardShortcuts.ts` : Gestion centralisée des raccourcis clavier (navigation, sélection, color tagging)
  - `useModalState.ts` : Centralisation de l'état des 6 modales
  - `useItemActions.ts` : Actions métier (tagging, colors, move, analyze)
- **Extraction d'un composant** :
  - `ViewRenderer.tsx` : Rendu conditionnel des vues (Grid/Carousel/List)
- **Refactorisation de App.tsx** :
  - Réduction de 656 à 477 lignes (27% de réduction / 179 lignes)
  - Meilleure séparation des responsabilités
  - Code plus maintenable et testable
- **Mise à jour de `src/shared/hooks/index.ts`** : Exports des nouveaux hooks

**Impact** : Amélioration de la maintenabilité sans breaking changes

**Documentation mise à jour** :

- `docs/COMPONENTS.md` : Ajout section "Custom Hooks" avec documentation complète
- Architecture générale mise à jour avec les nouveaux hooks

---

## [24/12/2024 - 14:10] - Amélioration CinematicCarousel

### Type : Modification

**Composant** : `src/features/library/components/CinematicCarousel.tsx`

**Changements** :

- Ajout de la virtualisation (rendu de 7 images seulement : actuelle ± 3)
- Amélioration de la navigation clavier (← → Esc I)
- Refonte complète du système de positionnement 3D avec calculs dynamiques
- Gestion optimisée des z-index (300 pour contrôles, 250 pour navigation, 100-90 pour images)
- Ajout d'un overlay métadonnées avec effet glassmorphique
- Amélioration des transitions spring pour un mouvement plus fluide
- Ajout d'un indicateur de progression (jusqu'à 20 points)

**Impact** : Performances améliorées pour les grandes bibliothèques, UX plus riche

**Documentation mise à jour** :

- `docs/COMPONENTS.md` : Section CinematicCarousel enrichie avec détails techniques

---

## [24/12/2024 - 14:10] - Reformatage LibraryContext

### Type : Correction

**Composant** : `src/contexts/LibraryContext.tsx`

**Changements** :

- Reformatage de l'indentation (cosmétique uniquement)
- Aucun changement fonctionnel

---
