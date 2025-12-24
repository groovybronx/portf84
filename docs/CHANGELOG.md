# Changelog

Dernière mise à jour : 24/12/2024 à 19:10

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## 🎯 État Actuel du Projet

**Session en cours** : Finalisation Sidebar Persistante & Documentation

**Progression** :
- ✅ Sidebar Persistante : 12/12 tâches (100% complété)
  - Pin/Unpin, Push content layout, TopBar fix
- ✅ Amélioration UX Sélection : 8/8 tâches (100% complété)
- ✅ Raffinement Déplacement & Focus : 4/4 tâches (100% complété)
- ✅ Audit complet Documentation : 6/6 fichiers sync (100% complété)

**Prochaines étapes** :
- [x] Push final et validation utilisateur

**Dernière modification** : 24/12/2024 à 19:10

## [24/12/2024 - 19:10] - Implémentation de la Sidebar Persistante

### Type : Nouveau Feature / UX

**Composant** : `App.tsx`, `FolderDrawer.tsx`, `TopBar.tsx`, `index.css`

**Changements** :

- **Sidebar Pinned (Persistance)** :
  - Ajout d'une fonctionnalité "Épingler" (Pin) dans la barre latérale.
  - Lorsque la barre est épinglée, elle **pousse** le contenu principal au lieu de s'afficher en overlay.
  - Synchronisation intelligente entre le mode "Drawer" (flottant) et le mode "Pinned" (persistant).
- **Refonte Layout App** :
  - Passage à une structure `flex-row` au niveau de la racine pour supporter le décalage dynamique du contenu.
  - Gestion indépendante du scroll entre la barre latérale et la galerie photo.
- **Optimisation TopBar** :
  - Correction de l'interception des clics : la TopBar ne bloque plus l'accès à la sidebar.
  - Décalage automatique de la TopBar vers la droite lorsque la sidebar est fixe.
- **Raffinement UX** :
  - Suppression du bouton "fermer" (X) redondant en mode épinglé.
  - Unpinning automatique ferme désormais la barre pour une transition propre.

**Impact** : Une gestion de l'espace beaucoup plus flexible pour les utilisateurs intensifs de dossiers et de collections.

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md` : Nouveau layout flex-row.
- `docs/COMPONENTS.md` : Mise à jour des props `isSidebarPinned` et logique unifiée.
- `docs/INTERACTIONS.md` : Description du système de pinning.

## [24/12/2024 - 18:35] - Amélioration de la Persistance de Sélection

### Type : Amélioration UX

**Composant** : `SelectionContext.tsx`, `useItemActions.ts`

**Changements** :

- **Persistance Visuelle** : Les icônes de sélection (checkboxes) restent désormais affichées après avoir relâché la souris lors d'une sélection par rectangle (Drag-Select).
- **Actions Groupées (Fix)** : Les raccourcis clavier (touches 1-6 pour les couleurs) et les actions de la TopBar s'appliquent désormais à **l'ensemble des images sélectionnées** par défaut.
- **Désactivation Propre** : La sélection et ses indicateurs visuels disparaissent dès que l'utilisateur clique dans une zone vide ou désélectionne manuellement tous les items.

**Impact** : Une expérience de sélection beaucoup plus robuste et prévisible, facilitant le tagging de masse.

**Documentation mise à jour** :
- `docs/INTERACTIONS.md` : Clarification de la persistance des indicateurs de sélection.

## Historique des Modifications

---

## [24/12/2024 - 18:25] - Raffinement Navigation et Terminologie "Library"

### Type : Amélioration UX / Cohérence

**Composant** : `App.tsx`, `TopBar.tsx`, `FolderDrawer.tsx`, `LibraryContext.tsx`

**Changements** :

- **Terminologie "Library"** :
  - Renommage de "All Photos" en **"Library"** dans la TopBar et la Sidebar.
  - Standardisation de l'icône `Layers` pour la vue racine de la bibliothèque.
- **Navigation & Focus** :
  - Suppression du changement automatique de dossier après un déplacement d'item ou la création d'une collection.
  - L'utilisateur reste désormais **focus sur son contexte actuel**, évitant les interruptions de flux.
- **Raffinement Déplacement** :
  - Filtrage exclusif des **Collections Manuelles** dans la modale de déplacement.
  - Thème **Violet** et icône `FolderHeart` pour toutes les collections virtuelles.

**Impact** : Une navigation plus fluide, prévisible et visuellement cohérente avec l'identité premium du projet.

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/INTERACTIONS.md` : Mise à jour iconographie et comportements de navigation.

## [24/12/2024 - 17:42] - Amélioration de l'UX de Sélection

### Type : Amélioration UX

**Composant** : `App.tsx`, `SelectionContext.tsx`, `PhotoCard.tsx`, `PhotoList.tsx`, `BatchActions.tsx`, `index.css`

**Changements** :

- **Expérience de Sélection** :
  - **Auto-Validation** : Désormais, le mode sélection s'arrête automatiquement au relâchement de la souris après un drag-select.
  - **Reset Intelligent** : Cliquer dans le vide ou sur une image non sélectionnée réinitialise la sélection.
  - **Suppression du bouton "Done"** : Interface épurée car l'action est désormais implicite.
  - **Désactivation du style natif** : Plus de voile bleu de sélection textuelle forcée par le navigateur.
  - **Ajustement Visuel** : Opacité du rectangle de sélection fixée à 30%.

**Impact** : Une navigation beaucoup plus fluide et "native" qui élimine les clics inutiles pour valider ou annuler une sélection.

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Mise à jour
- `docs/COMPONENTS.md` : Les sections sur la sélection sont désormais à jour avec ce nouveau comportement (auto-exit).

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
