# Changelog

Dernière mise à jour : 24/12/2024 à 17:01

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## 🎯 État Actuel du Projet

**Session en cours** : Tests et corrections de bugs

**Progression** :
- ✅ Refactorisation App.tsx : 13/13 tâches (100% complété)
  - Code refactorisé : 656 → 477 lignes (-27%)
  - 3 hooks créés : `useKeyboardShortcuts`, `useModalState`, `useItemActions`
  - 1 composant créé : `ViewRenderer`
  - Tests unitaires créés : 32 tests (17 + 15)
- ✅ Règles de documentation créées et configurées (100% complété)
- ✅ Fix persistence des collections virtuelles (100% complété)
  - Collections virtuelles persistent après reload
  - Déduplication des shadow folders corrigée
  - Différenciation claire : source / shadow / collections

**Prochaines étapes** :
- [ ] Tests manuels (navigation, modales, vues, collections)
- [ ] Commit Git des changements

**Dernière modification** : 24/12/2024 à 17:01

---

## Historique des Modifications

---

## [24/12/2024 - 17:01] - Création tests unitaires pour hooks

### Type : Ajout

**Composant** : `tests/useKeyboardShortcuts.test.ts`, `tests/useItemActions.test.ts`

**Changements** :

- **Tests pour `useKeyboardShortcuts`** (17 tests) :
  - Navigation avec flèches (7 tests) : ArrowRight, ArrowLeft, ArrowUp, ArrowDown, limites
  - Sélection avec Space/Enter (3 tests)
  - Color tagging avec touches 0-6 (3 tests)
  - Exclusion inputs/textareas (2 tests)
  - Edge cases (2 tests) : liste vide, ID invalide

- **Tests pour `useItemActions`** (15 tests) :
  - `addTagsToSelection` (4 tests) : sélection multiple, context menu, déduplication
  - `applyColorTagToSelection` (4 tests) : fullscreen, sélection multiple, focused item
  - `analyzeItem` (2 tests) : analyse AI, gestion erreurs
  - `moveItemToFolder` (1 test) : déplacement et cleanup
  - `createFolderAndMove` (2 tests) : création dossier, vérification collection
  - `handleContextMove` (2 tests) : sélection et modal

**Résultats** :
- ✅ 40 tests passent (32 nouveaux + 8 existants)
- ✅ Aucune régression détectée
- ✅ Durée d'exécution : 2.62s

**Impact** : Couverture complète des hooks extraits lors de la refactorisation App.tsx, garantissant la stabilité du code

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Entrée ajoutée
- `docs/COMPONENTS.md` : Section tests ajoutée

---

## [24/12/2024 - 16:49] - Fix persistence collections virtuelles

### Type : Correction

**Composant** : `src/contexts/LibraryContext.tsx`

**Changements** :

- **Ajout d'un useEffect pour charger les collections virtuelles au démarrage** :
  - Charge automatiquement les collections virtuelles créées par l'utilisateur
  - Filtre pour exclure les shadow folders (avec `sourceFolderId`)
  - Les shadow folders sont chargés exclusivement par `loadFromPath`

- **Correction de la déduplication dans le reducer MERGE_FOLDERS** :
  - Comparaison par chemin (`path`) au lieu de l'ID
  - Évite les doublons de dossiers sources

**Impact** : Les collections virtuelles persistent maintenant correctement après un reload de l'application, et les shadow folders n'apparaissent plus en double

**Bugs corrigés** :
- Collections virtuelles disparaissaient après reload
- Shadow folders apparaissaient en double dans la liste

---

## [24/12/2024 - 16:27] - Création des règles de documentation et réorganisation

### Type : Ajout + Modification

**Composant** : `.agent/rules/` + `docs/`

**Changements** :

- **Nouvelles règles créées** :
  - `REGLES_LIMITE_TOKENS.md` : Gestion adaptative des limites de tokens (3 seuils : 80%, 90%, 95%)
  - `artifacts-antigravity.md` : Gestion du cycle de vie des artifacts et continuité multi-sessions
  - Enrichissement de `maintient-a-jour-documentation.md` : Instructions pour section "État Actuel"

- **Amélioration de `docs/CHANGELOG.md`** :
  - Ajout section "🎯 État Actuel du Projet" en haut
  - Structure améliorée pour suivi de session et progression
  - Meilleure continuité entre conversations Antigravity

- **Réorganisation de la documentation** :
  - Déplacement des anciens docs vers `docs/ARCHIVES/`
  - Création de `docs/Rules backup/` pour référence
  - Nettoyage des fichiers obsolètes

**Impact** : Amélioration significative de la continuité du contexte entre les sessions Antigravity et meilleure gestion de la documentation

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Structure enrichie
- `.agent/rules/` : 3 règles créées/mises à jour

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
