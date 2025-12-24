# Changelog

Dernière mise à jour : 25/12/2024 à 00:10

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## 🎯 État Actuel du Projet

**Session en cours** : Refactorisation Phase 1 - Quick Wins

**Progression** :
- ✅ Phase 1 Quick Wins : 100% complétée
  - 4 index SQLite ajoutés
  - 18 types `any` remplacés par interfaces strictes
  - `database.ts` créé (110 lignes, 10 interfaces)
  - `animations.ts` créé (180 lignes, 15+ variants)

**Prochaines étapes** :
- [ ] Commit Git des changements Phase 1
- [ ] Phase 2 : Découpage `storageService.ts` en modules
- [ ] Phase 3 : Refactorisation UI

**Dernière modification** : 25/12/2024 à 00:10

## [25/12/2024 - 00:10] - Phase 1 Refactorisation : Quick Wins

### Type : Refactorisation / Performance

**Composants** : `storageService.ts`, `database.ts`, `animations.ts`

**Changements** :

### Type : Ajout

**Composant** : `PhotoCard.tsx`, `libraryLoader.ts`, `PhotoGrid.tsx`, `ViewRenderer.tsx`, `App.tsx`

**Changements** :

- Ajout de props `folders` et `collections` à `PhotoCard`
- Calcul du nom du dossier/collection via `virtualFolderId`
- Affichage sur le dos de la carte avec icône colorée :
  - 🔵 Shadow folders : icône `HardDrive` bleue (`text-blue-400`, `bg-blue-500/10`)
  - 🟣 Collections virtuelles : icône `FolderHeart` violette (`text-purple-400`, `bg-purple-500/10`)
- Fix `libraryLoader.ts` : ajout de `virtualFolderId` aux items assignés aux shadow folders
- Chaîne de props complète : `App.tsx` → `ViewRenderer` → `PhotoGrid` → `VirtualColumn` → `PhotoCard`

**Impact** : 

Amélioration de l'UX en affichant le contexte organisationnel de chaque image directement sur la carte. Les couleurs d'icônes correspondent exactement à celles de la sidebar (FolderDrawer) pour une cohérence visuelle parfaite.

**Documentation mise à jour** :

- `docs/COMPONENTS.md` : Ajout section props PhotoCard
- `docs/CHANGELOG.md` : Entrée complète

---

## [24/12/2024 - 22:22] - Fix TopBar Hover Detection

### Type : Correction Bug

**Composant** : `TopBar.tsx`

**Problème** :
- Après avoir "unpin" la TopBar en mode carousel, elle ne réapparaissait plus au survol
- Le conteneur avait `pointer-events-none` qui bloquait tous les événements de souris

**Solution** :
- Suppression de `pointer-events-none` du conteneur principal
- Les événements `onMouseEnter` et `onMouseLeave` fonctionnent maintenant correctement

**Impact** : La TopBar est maintenant accessible en mode unpinned, améliorant l'UX en mode carousel.

---

## [24/12/2024 - 22:06] - Phase 1 : Optimisations Performance (Quick Wins)

### Type : Performance

**Composants** : `PhotoCard.tsx`, `PhotoCarousel.tsx`, `PhotoGrid.tsx`

**Optimisations implémentées** :

- **Lazy Loading Natif** :
  - Ajout de `loading="lazy"` et `decoding="async"` sur toutes les images
  - PhotoCard : Transition d'opacité au chargement
  - PhotoCarousel : Attribut `data-item-id` pour identification

- **Déchargement Carousel** :
  - `useEffect` qui vide le `src` des images avec offset > 2
  - Libération automatique de la mémoire lors de la navigation
  - Limite de 10 images déchargées par cycle pour éviter surcharge

- **Overscan Augmenté** :
  - PhotoGrid : 5 → 10 éléments pré-rendus
  - Amélioration de la fluidité du scrolling

**Gains attendus** (1000 images) :
- Temps de chargement initial : **-60%**
- Mémoire carousel : **-60%** (5 images au lieu de toutes)
- Fluidité scrolling : **+20%**

**Impact** : Amélioration significative des performances pour les grandes galeries sans changement visible de l'UX.

---

## [24/12/2024 - 22:00] - Audit de Performance et Plan d'Optimisation

### Type : Analyse / Planification

**Composant** : Analyse globale de l'application

**Travaux effectués** :

- **Audit de Performance Complet** :
  - Analyse de l'architecture actuelle (virtualisation, contextes, rendu)
  - Identification de 6 problèmes majeurs de performance
  - Mesure de l'impact sur les grandes galeries (1000+ images)
  - Documentation détaillée dans `performance_audit.md`

- **Problèmes Identifiés** :
  - ❌ Pas de système de thumbnails → Images en pleine résolution (5MB chacune)
  - ❌ PhotoCarousel → 5 images simultanées en haute résolution
  - ❌ Pas de lazy loading natif
  - ❌ Pas de cache LRU → Rechargement constant
  - ❌ Métadonnées toutes en RAM → 50MB pour 10k images
  - ❌ Re-renders excessifs du contexte

- **Plan d'Optimisation en 3 Phases** :
  - **Phase 1 (Quick Wins)** : Lazy loading + overscan + context splitting
  - **Phase 2 (Structurel)** : Système de thumbnails Rust + cache LRU
  - **Phase 3 (Avancé)** : Web Workers + IndexedDB + prefetching

- **Gains Estimés** (1000 images) :
  - Temps de chargement : -80% (30s → 3s)
  - Mémoire : -90% (5GB → 500MB)
  - Fluidité : +200% (20fps → 60fps)

**Impact** : Roadmap claire pour supporter des galeries de 10 000+ images sans dégradation.

**Documentation créée** :
- `performance_audit.md` : Analyse détaillée et recommandations
- `implementation_plan_performance.md` : Plan d'implémentation avec code
- `task_performance.md` : 40 tâches organisées en checklist

---

## [24/12/2024 - 21:45] - PhotoCarousel Multi-images avec Effet Coverflow

### Type : Amélioration UI / Performance

**Composant** : `PhotoCarousel.tsx`

**Changements** :

- **Affichage Multi-images** :
  - Rendu simultané de 5 images (centrale + 2 de chaque côté)
  - Effet "coverflow" avec échelle et opacité adaptatives
  - Images latérales cliquables pour navigation rapide

- **Animations Optimisées** :
  - Transition `tween` au lieu de `spring` pour fluidité maximale
  - Durée : 0.5s avec courbe cubic-bezier personnalisée
  - Suppression du filtre `brightness` pour éliminer le lag

- **Positionnement Linéaire** :
  - Images arrivent depuis les bords (gauche/droite) au lieu du centre
  - Espacement configurable (400px par défaut)
  - Clés stables pour animations fluides

- **Ajustements Visuels** :
  - Hauteur limitée à 90vh pour éviter débordement
  - Titre en `text-sm font-light` avec wrapping intelligent
  - Badge de couleur réduit (4×4px)

**Impact** : Navigation visuelle immersive avec aperçu du contexte (images adjacentes).

**Documentation mise à jour** :
- Documentation complète en français du composant

---

## [24/12/2024 - 20:00] - Fix Synchronisation Batch Updates

### Type : Correction Performance / UX

**Composant** : `LibraryContext.tsx`, `useItemActions.ts`, `App.tsx`

**Changements** :

- **Synchronisation Atomique** :
  - Création d'une nouvelle action `BATCH_UPDATE_ITEMS` dans le reducer.
  - Les mises à jour de plusieurs items (couleurs, tags) sont désormais traitées en **une seule transition d'état**.
  - Suppression de la boucle d'appels à `updateItem` qui causait des écrasements d'état ("race conditions").
- **Réactivité Immédiate** :
  - L'interface se met à jour instantanément pour l'ensemble de la sélection sans nécessiter de rechargement de l'application.
- **Robustesse** :
  - Les mises à jour utilisent désormais une architecture "functional update" ou atomique, garantissant l'intégrité des données même lors d'actions rapides.

**Impact** : Une expérience utilisateur fluide et fiable pour la gestion de masse de la bibliothèque.

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md` : Note sur les mises à jour atomiques dans le flux de données.

## [24/12/2024 - 19:50] - Micro-animations et Hover Highlight ContextMenu

### Type : Amélioration UI / Premium Feel

**Composant** : `ContextMenu.tsx`

**Changements** :

- **Hover Highlight (Glide Effect)** :
  - Implémentation d'un arrière-plan de surbrillance partagé via `layoutId` (Framer Motion).
  - L'effet crée une transition fluide ("glissement") de la surbrillance lors du passage de la souris entre les éléments du menu.
- **Micro-animations d'icônes** :
  - Ajout d'un effet d'échelle (`scale-110`) sur les icônes au survol pour un retour visuel plus dynamique.
- **Raffinement Color Tags** :
  - Augmentation de l'échelle des pastilles de couleur au survol (`scale-125`) et ajout de transitions fluides.
- **Refactorisation structurelle** :
  - Nettoyage du code du `ContextMenu` pour utiliser une structure de données d'items, facilitant la maintenance.

**Impact** : Une sensation beaucoup plus "Apple-like" et premium lors de l'utilisation du menu contextuel.

**Documentation mise à jour** :
- `docs/INTERACTIONS.md` : Mention de l'effet de surbrillance fluide dans le menu contextuel.

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
