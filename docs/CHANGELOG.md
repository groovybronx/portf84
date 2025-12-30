# Changelog

Dernière mise à jour : 30/12/2025 à 19:05

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## 🎯 État Actuel du Projet

**Session en cours** : Synchronisation GitHub & Évolution Système de Tags

**Progression** :
- ✅ Synchronisation GitHub (develop) : 100% complété
- ✅ Intégration Système de Tags (Alias, Fusion, Historique) : 100% complété
- ✅ Documentation Technique (TAG_SYSTEM_GUIDE/README) : 100% complété
- ✅ Couverture Tests (84 tests au total) : 100% complété

**Prochaines étapes** :
- [ ] Stabiliser les nouvelles fonctionnalités de fusion d'alias
- [ ] Optimisation des performances sur les grandes collections de tags
- [ ] Exploration de la fusion sémantique via Gemini AI

**Dernière modification** : 30/12/2025 à 19:05

## [30/12/2025 - 19:05] - Évolution Majeure : Système de Tags & Synchronisation GitHub

### Type : Feature / Refactor / Documentation / Testing

**Composants** :
- `src/features/tags/` (TagManager, TagManagerModal)
- `src/services/storage/` (db.ts, tags.ts)
- `src/services/tagAnalysisService.ts`
- `docs/TAG_SYSTEM_GUIDE.md` (Nouveau)
- `docs/TAG_SYSTEM_README.md` (Nouveau)
- `tests/tagSystem.test.ts` (Nouveau)

**Changements** :

**1. Système de Tags Robuste** :
- **Gestion des Alias** : Création de la table `tag_aliases` pour lier des termes similaires (typos, pluriels) à un tag parent. Suggestions intelligentes dans l'UI.
- **Historique de Fusion** : Création de la table `tag_merges` pour garder une trace d'audit de toutes les fusions effectuées.
- **Fusion par Lot (Batch Merge)** : Possibilité de fusionner toutes les suggestions de redondance en une seule opération sécurisée.
- **Normalisation Avancée** : Amélioration de la détection de similarité (Levenshtein, Jaccard, suppression des stop words FR/EN).

**2. Documentation Technique** :
- Création d'un guide complet (`TAG_SYSTEM_GUIDE.md`) détaillant les algorithmes, les schémas de base de données et les flux de données.
- Création d'un README rapide pour les opérations courantes.

**3. Qualité et Tests** :
- Ajout de 41 nouveaux tests unitaires pour le système de tags, portant le total à 84 tests.
- 100% de réussite sur l'ensemble de la suite de tests.
- Optimisation pour les large datasets (> 5000 tags).

**Impact** : Une gestion de bibliothèque beaucoup plus intelligente et robuste, éliminant la fragmentation des tags et offrant une base technique documentée pour les évolutions IA futures.

---

## [30/12/2025 - 17:20] - Nettoyage et Organisation du Repository

### Type : Maintenance / Documentation

**Composants** :
- `docs/KnowledgeBase/` (anciennement `Knowledgedoc/`)
- `src/services/geminiService.ts` (supprimé)
- `.github/` (templates ajoutés)

**Changements** :

**1. Documentation** :
- Centralisation de la base de connaissances dans `docs/KnowledgeBase/`.
- Suppression des fichiers et dossiers temporaires de documentation.
- Mise à jour du README pour inclure la nouvelle structure.

**2. Clean Code** :
- Élimination de la redondance du service Gemini en supprimant la version legacy de `src/services/`.
- La logique a été déplacée vers le dossier de la fonctionnalité 'vision'.

**3. GitHub Setup** :
- Standardisation des contributions via des templates d'Issue (Bug, Feature) et de Pull Request.

**Impact** : Meilleure clarté du code pour les développeurs, structure de documentation unifiée, et standardisation des processus collaboratifs.

**Documentation mise à jour** :
- `docs/README.md`
- `docs/CHANGELOG.md`
- `docs/KnowledgeBase/`

---

### Type : Correction / Quality Assurance

**Composants** :
- `tests/useItemActions.test.ts`
- `tests/useKeyboardShortcuts.test.ts`

**Changements** :

**1. Correction Tests `useItemActions` (17 erreurs)** :
- **Prop manquante** : Ajout de `setIsAddTagModalOpen: vi.fn()` à 13 tests qui ne fournissaient pas cette prop obligatoire (requise depuis l'ajout de `handleContextAddTag` dans le hook)
- **Types `undefined` vs `null`** : Correction de 4 instances où `mockItems[0]` (type `PortfolioItem | undefined`) était assigné à `selectedItem` (type `PortfolioItem | null`) via l'opérateur `?? null`
- **Assertion de type non-null** : Utilisation de l'assertion `!` pour 4 appels de fonction où `mockItems[0]` est garanti d'exister dans le contexte du test

**2. Correction Tests `useKeyboardShortcuts` (54 erreurs)** :
- **Types des mocks Vitest** : Ajout de type assertions explicites pour chaque mock car `vi.fn()` retourne `ReturnType<typeof vi.fn>` incompatible avec les types de fonctions spécifiques
  - `mockSetFocusedId: (id: string) => void`
  - `mockSetSelectedItem: (item: PortfolioItem) => void`
  - `mockApplyColorTagToSelection: (color: string | undefined) => void`

**Impact** :
- **Qualité** : Élimination totale des 71 erreurs TypeScript détectées par l'IDE
- **Fiabilité** : 43/43 tests passent avec succès (100% de réussite)
- **Build** : Compilation Vite réussie sans aucune erreur TypeScript
- **Maintenabilité** : Cohérence des types garantissant la capture correcte du comportement des hooks

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Entrée complète

---

## [30/12/2025 - 14:42] - Audit Fixes: Sécurité API & Robustesse Tests

### Type : Security / Stability / Testing

**Composants** :
- `src/services/secureStorage.ts` (nouveau)
- `src/features/vision/services/geminiService.ts`
- `src/shared/components/SettingsModal.tsx`
- `src/shared/components/ErrorBoundary.tsx`
- `src/index.tsx`
- `tests/App.test.tsx` (nouveau)
- `tests/geminiErrors.test.ts` (nouveau)
- `tests/useItemActions.test.ts`

**Changements** :

**1. Sécurisation Clé API Gemini** :
- Migration du stockage de `localStorage` vers `tauri-plugin-fs` (fichier `secrets.json` sécurisé dans AppConfig) pour la version Desktop.
- Fallback automatique vers `localStorage` en environnement Web/Dev.
- implémentation de `secureStorage` service pour abstraire la logique.
- Mise à jour de `SettingsModal` pour utiliser ce stockage asynchrone.

**2. Gestion Robuste des Erreurs** :
- Intégration globale de `ErrorBoundary` dans `index.tsx` pour capturer les crashs React.
- Création de classes d'erreurs spécifiques : `GeminiError`, `ApiKeyError`, `NetworkError`.
- Amélioration de `geminiService` pour throw ces erreurs spécifiques.
- Feedback utilisateur amélioré (alertes précises) dans `useItemActions` en cas d'échec AI.

**3. Test Coverage (Critical)** :
- **App Smoke Test** : Création de `tests/App.test.tsx` pour garantir que l'application démarre sans crash (mock complet de tous les Contexts et APIs Tauri).
- **Unit Tests** : Ajout de tests pour les nouvelles classes d'erreurs (`tests/geminiErrors.test.ts`).
- **Fix Tests Existants** : Correction des mocks dans `tests/useItemActions.test.ts` pour passer au vert (mocking complet de `useLibrary`, `useSelection`, etc.).

**Impact** :
- **Sécurité** : Clés API ne sont plus exposées facilement dans le localStorage.
- **Stabilité** : L'application ne crash plus silencieusement; les erreurs API sont gérées proprement.
- **Qualité** : La suite de tests passe (3/3 fichiers), offrant une base solide pour la suite.

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Entrée complète.

## [26/12/2025 - 22:08] - Configuration Dynamique et Constantes Centralisées

### Type : Refactorisation + Feature

**Composants** :
- `src/shared/constants/` (nouveau)
- `vite.config.ts`
- `src/services/storage/db.ts`
- `src/shared/utils/fileHelpers.ts`
- `src/features/vision/services/geminiService.ts`
- `src/shared/hooks/useLocalShortcuts.ts`
- `.env.example` (nouveau)

**Changements** :

**1. Système de Constantes Centralisées** :
- Création de `src/shared/constants/storage.ts` :
  - Centralisation de toutes les clés localStorage (API_KEY, SHORTCUTS, DB_PATH, THEME, APP_TITLE, ANIMATION_PRESET)
  - Type-safe avec TypeScript
- Création de `src/shared/constants/fileTypes.ts` :
  - Liste des extensions d'images supportées (png, jpg, jpeg, gif, webp, svg, bmp, ico, tiff, tif)
  - Helper `isImageFile()` pour validation
  - Helper `getImageExtensionRegex()` pour génération de regex
  - Map `IMAGE_MIME_TYPES` pour types MIME
- Création de `src/shared/constants/animations.ts` :
  - Presets d'animations configurables (soft/normal/snappy)
  - Helpers `getCurrentAnimationPreset()` et `setAnimationPreset()`
  - Fonction `getSpringTransition()` pour Framer Motion
- Création de `src/shared/constants/index.ts` pour exports centralisés

**2. Migration vers Constantes** :
- **geminiService.ts** : Utilisation de `STORAGE_KEYS.API_KEY` au lieu de "gemini_api_key" hardcodé
- **useLocalShortcuts.ts** : Utilisation de `STORAGE_KEYS.SHORTCUTS` au lieu de "lumina_shortcuts_config"
- **db.ts** : Utilisation de `STORAGE_KEYS.DB_PATH` et variable d'env `VITE_DB_NAME`
- **fileHelpers.ts** : Utilisation de `isImageFile()` et `IMAGE_MIME_TYPES` au lieu de regex hardcodé

**3. Configuration Serveur Dynamique** :
- **vite.config.ts** : 
  - Port configurable via `VITE_PORT` (défaut: 1420)
  - Host configurable via `VITE_HOST` (défaut: 0.0.0.0)
  - StrictPort configurable via `VITE_STRICT_PORT` (défaut: true)
  - Nom de DB configurable via `VITE_DB_NAME` (défaut: lumina.db)

**4. Fichier .env.example** :
- Documentation complète de toutes les variables d'environnement disponibles
- Sections : Gemini AI, Database, Dev Server, Supported Formats
- Guide pour configuration personnalisée

**Impact** :
- **Maintenabilité** : Élimination des chaînes hardcodées, réduction drastique des erreurs de typo
- **Flexibilité** : Configuration facile multi-environnement (dev/staging/prod)
- **Extensibilité** : Ajout de nouveaux formats d'images simplifié
- **Type-Safety** : TypeScript garantit l'utilisation correcte des constantes
- **Multi-Instance** : Support de plusieurs bases de données et configurations

**Bénéfices** :
- ✅ Centralisation : Toutes les constantes dans un seul endroit
- ✅ Type-Safe : Pas de "magic strings", autocomplete IDE
- ✅ Configurable : Variables d'environnement pour tous les paramètres critiques
- ✅ Évolutif : Architecture prête pour plugins et extensions futures

**Documentation mise à jour** :
- `docs/CHANGELOG.md` : Entrée complète
- `docs/ARCHITECTURE.md` : À mettre à jour
- `.env.example` : Créé avec documentation complète

## [26/12/2025 - 16:00] - Migration Contexts & Extension Icônes

### Type : Refactorisation + Feature

**Composants** : 
- `src/shared/contexts/` (nouveau)
- `src/shared/components/Icon.tsx`
- `src/shared/components/SettingsModal.tsx`
- Tous les imports dans l'application

**Changements** :

**1. Migration Contexts Architecture** :
- Déplacement de `src/contexts/` vers `src/shared/contexts/` pour cohérence architecturale
- Mise à jour de tous les imports dans l'application (App.tsx, FolderDrawer, TopBar, ViewRenderer, etc.)
- Suppression de l'ancien dossier `src/contexts/`
- Aucun changement fonctionnel, migration iso-fonctionnelle

**2. Extension Système d'Icônes** :
- Ajout de 30+ nouvelles icônes dans le registre `Icon.tsx`
- Nouvelles catégories : 
  - **Business** : box, briefcase, trophy, star, crown, award, target, rocket, flag
  - **Media** : camera, film, video, image
  - **Effects** : sparkles, zap, flame
- Total : ~40 icônes disponibles pour personnalisation

**3. Icon Picker dans Settings** :
- Nouvelle UI de sélection d'icônes pour chaque thème de couleur (Appearance tab)
- Clic sur la pastille de couleur → Grille de sélection d'icônes (8 colonnes, scrollable)
- Détection intelligente : Icônes déjà utilisées par d'autres thèmes grisées et non-sélectionnables
- Animation fluide d'expansion/collapse (Framer Motion)
- Intégration avec `ThemeContext` pour persistance
- Permet de personnaliser 5 catégories : Primary, AI, Collections, Work Folders, Projects

**Impact** :
- **Architecture** : Structure plus cohérente avec tous les éléments partagés dans `src/shared/`
- **UX** : Personnalisation visuelle complète des thèmes (couleur + icône)
- **Design** : Cohérence visuelle renforcée entre sidebar, badges et UI

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md` : Nouvelle structure src/shared/contexts/
- `docs/COMPONENTS.md` : Icon Picker et liste complète IconAction
- `docs/INTERACTIONS.md` : Horodatage
- `docs/CHANGELOG.md` : Entrée complète


    
### Type : UI / UX

**Composants** : `FolderDrawer/index.tsx`, `FolderDrawerHeader.tsx`

**Changements** :

- **Header Simplifié** : Ajout d'un bouton `+` discret dans l'en-tête "Library" pour gérer les projets.
- **Cleanup Footer** : Suppression de la zone footer "Gérer les projets" pour alléger l'interface et gagner de l'espace vertical.

**Documentation mise à jour** :
- `docs/CHANGELOG.md`

## [26/12/2025 - 11:55] - Loading Polish & Animations
    
### Type : UI / UX

**Composants** : `App.tsx`, `PhotoCarousel.tsx`, `PhotoList.tsx`, `LoadingSpinner`, `LoadingOverlay`

**Changements** :

- **Global Loader** : Ajout d'un `LoadingOverlay` au démarrage de l'application pour masquer l'initialisation des collections.
- **Carousel Loading** : Ajout d'un spinner de chargement et d'une transition d'opacité fluide pour les images haute résolution.
- **List Loading** : Ajout d'un effet `pulse` (Squelette) sur les vignettes en attendant le chargement des images.
- **UI Kit** : Création du composant réutilisable `LoadingSpinner`.

**Impact** : Élimination des "flashs" blancs et des affichages partiels. Sensation de fluidité accrue.

**Documentation mise à jour** :
- `docs/CHANGELOG.md`

## [26/12/2025 - 11:30] - Rotation Circulaire des Projets & Animations
    
### Type : Feature / UI

**Composants** : `FolderDrawer/index.tsx`, `storage/collections.ts`

**Changements** :

- **Rotation Circulaire (Smart Navigation)** : 
  - Lors de la sélection d'un projet, celui-ci "glisse" vers le haut (position active).
  - La liste se réorganise circulairement : le projet précédemment actif descend, et les autres suivent le mouvement sans perdre leur ordre relatif.
  - Correction du tri en base de données : Passage de `lastOpenedAt` à `createdAt` pour garantir une stabilité parfaite de la liste pendant la rotation.
- **Animations Premium** :
  - **Physique Fluide** : Utilisation de transitions `spring` (stiffness: 200, damping: 20) pour un effet organique avec un léger "rebond" à l'arrivée.
  - **Layout Sync** : Correction des distorsions de texte pendant l'animation en synchronisant le layout des contenus internes.
- **Interface Projet** :
  - Icône `Box` (Emerald) pour distinguer les Projets des dossiers physiques.
  - Design "Carte" proéminent pour le projet actif vs bouton simple pour les inactifs.

**Impact** : Une navigation entre projets ultra-fluide et spatialement cohérente ("Mental Model" de carrousel vertical).

**Documentation mise à jour** :
- `docs/CHANGELOG.md`
- `docs/COMPONENTS.md`
- `docs/INTERACTIONS.md`

## [26/12/2025 - 10:30] - Sidebar en Tree View & Navigation Projets

### Type : Feature / UI

**Composants** : `FolderDrawer/index.tsx`, `App.tsx`

**Changements** :

- **Tree View Navigation** : 
  - Transformation de la liste plate en une structure arborescente "Projets".
  - Cliquer sur un projet inactive le bascule immédiatement comme actif.
  - Le projet actif s'étend pour afficher ses contenus (Library, Dossiers, Collections).
- **Intégration "Library"** :
  - Le bouton "Library" (All Photos) est intégré comme premier élément du projet actif.
- **Support Multi-Projets** :
  - Visualisation immédiate de tous les projets disponibles dans la barre latérale.
  - Switch rapide entre projets sans passer par une modale.

**Impact** : Amélioration majeure de la navigation pour les utilisateurs gérant plusieurs projets simultanément.

**Documentation mise à jour** :
- `docs/CHANGELOG.md`

## [26/12/2025 - 09:45] - Refactoring FolderDrawer

### Type : Refactorisation

**Composants** : `src/features/collections/components/FolderDrawer/`

**Changements** :

- **Atomisation** : Découpage du fichier unique `FolderDrawer.tsx` (600+ lignes) en une structure modulaire de 6 composants dédiés.
- **Nouveaux Composants** :
  - `FolderDrawerHeader` & `ActiveCollectionBanner` pour l'entête.
  - `FolderItem` : Composant réutilisable pour l'affichage des lignes.
  - `ShadowFoldersSection`, `ManualCollectionsSection`, `ColorFiltersSection` : Sections isolées gérant leur propre état d'ouverture.
- **Maintenance** : Amélioration drastique de la lisibilité et de la séparation des responsabilités.

**Impact** : Aucune changement visible pour l'utilisateur (Iso-fonctionnel), mais base de code plus robuste.

**Documentation mise à jour** :
- `docs/COMPONENTS.md`
- `docs/CHANGELOG.md`

## [26/12/2025 - 09:24] - Import Multi-Dossiers

### Type : Feature / UX

**Composants** : `src/App.tsx`

**Changements** :

- **Sélection Multiple** : La modale d'importation de dossiers permet désormais de sélectionner plusieurs dossiers sources simultanément (via Cmd/Ctrl + Click ou Shift + Click).
- **Import Séquentiel** : L'application traite automatiquement la liste des dossiers sélectionnés pour les ajouter un par un à la collection active.
- **Prévention Doublons** : Empêche la réimportation d'un dossier déjà présent et avertit l'utilisateur le cas échéant.
- **Micro-Actions Sidebar** : Les gros boutons d'action sont remplacés par des icônes `+` discrètes au survol des en-têtes de section, épurant l'interface.

**Impact** : Gain de temps significatif lors de l'initialisation d'une collection avec de nombreux sous-dossiers dispersés.

**Documentation mise à jour** :
- `docs/CHANGELOG.md`

## [25/12/2025 - 04:30] - Tag Fusion UI Sync & Library Fixes

### Type : Bugfix

**Composants** : `metadata.ts`, `LibraryContext.tsx`, `App.tsx`

**Corrections** :
- **Source de Vérité Tag** : `getMetadataBatch` lit désormais les tags depuis les tables relationnelles (`tags`, `item_tags`) pour refléter immédiatement les fusions.
- **Auto-Refresh Library** : `TagManagerModal` déclenche un rechargement complet de la bibliothèque après une fusion.
- **Sync Sélection** : `App.tsx` synchronise désormais l'item sélectionné (Full Screen) avec les mises à jour de la bibliothèque.
- **Deduplication Dossiers** : Correction d'un bug dans `LibraryContext` qui dupliquait les Shadow Folders lors d'un `MERGE_FOLDERS` (fix "Duplicate Keys").

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md` : Clarification du flux de métadonnées.

## [25/12/2025 - 03:41] - Smart Tag Fusion

### Type : Feature

**Composants** : `TagManagerModal`, `tagAnalysisService`, `TopBar`

**Fonctionnalités** :
- **Détection Automatique** : Algorithme (Levenshtein) pour identifier les tags quasi-identiques (ex: "Montagne" vs "montagnes").
- **Fusion (Merge)** : Interface pour fusionner les doublons en un clic.
- **TopBar** : Nouveau bouton "Merge" accessible directement.
- **Backend** : Opération `mergeTags` transactionnelle dans SQLite (re-link items + delete source).

## [25/12/2025 - 03:32] - Settings & Shortcuts Refactor

### Type : Feature / Refactor

**Composants** : `src/shared/components/SettingsModal.tsx`, `src/shared/hooks/useKeyboardShortcuts.ts`

**Changements** :
- **Refonte UI Settings** : Nouvelle architecture à onglets (General / Storage / Shortcuts) pour accueillir les nouvelles options.
- **Raccourcis Configurables** : Nouvel onglet permettant de remapper toutes les touches principales (Navigation, Tags).
- **Restart Button** : Bouton de redémarrage automatique intégré lors du changement de dossier de BDD.
- **Backend Storage** : `useLocalShortcuts` gère désormais la persistance des préférences clavier.

## [25/12/2025 - 02:26] - Revert : Mode Loupe Désactivé

### Type : Revert / UX

**Composants** : `src/features/vision/components/ImageViewer.tsx`

**Raison** : Instabilité du Drag-to-Pan et conflits d'interaction persistants sur certaines configurations.

**Action** :
- Retrait complet de la logique de Zoom et Pan.
- Retour au comportement stable standard (Fit to screen).
- Fonctionnalité marquée comme "Reportée" pour réévaluation future.

## [25/12/2025 - 01:52] - Brand : Nouvelle Identité Visuelle

### Type : Improvement / Branding

**Composants** : `src-tauri/icons/`

**Changements** :

- Création et déploiement d'une **nouvelle icône d'application**.
- Design : Prisme/Objectif style Glassmorphism, sur fond sombre aux accents violets/bleus/ambres.
- Génération automatique de toutes les tailles (macOS .icns, Windows .ico, Linux .png) via `tauri icon`.

## [25/12/2025 - 01:46] - UX/UI : Navigation Sync & Smooth Scroll

### Type : Improvement / UX

**Composants** : `src/App.tsx`, `src/features/library/components/PhotoGrid.tsx`

**Changements** :

- **Synchronisation Focus** : Le défilement des images en mode plein écran (Space) met désormais à jour la position de la sélection dans la grille en arrière-plan. Au retour sur la grille, la vue est centrée sur la dernière image consultée.
- **Smooth Scroll** : Activation du défilement fluide (`behavior: 'smooth'`) sur la grille lors de la navigation au clavier. Élimine les sauts brusques.

**Impact** : Continuité visuelle parfaite entre les modes et sensation de navigation plus naturelle.

## [25/12/2025 - 01:36] - Feature : Scrubber Interactif

### Type : Feature / UI

**Composants** : `src/features/library/components/PhotoCarousel.tsx`

**Changements** :

- Ajout d'une **barre de défilement interactive** dans la vue Carrousel (Flow).
- Remplacement du compteur numérique par une barre de progression visuelle (points).
- Fonctionnalités du Scrubber :
  - **Click-to-Jump** : Sauter instantanément à n'importe quelle position.
  - **Drag & Drop** : Glisser pour défiler rapidement (scrubbing) à travers la collection.
  - **Hover Thumb** : Curseur visuel au survol pour plus de précision.

**Impact** : Amélioration majeure de la navigation dans les grandes collections en mode plein écran.

**Documentation mise à jour** :
- `docs/COMPONENTS.md`
- `docs/INTERACTIONS.md`

## [25/12/2025 - 01:20] - UI/UX : Smart Folders & Refonte Sidebar

### Type : Feature / UI

**Composants** : `src/features/collections/components/FolderDrawer.tsx`, `src/App.tsx`, `src/shared/components/ContextMenu.tsx`

**Changements** :

- **Smart Color Folders** :
  - Nouvelle section "Filtres Couleur" dans la barre latérale.
  - Filtrage instantané par couleur (plus besoin de créer des dossiers).
  - Suppression de l'option obsolète "Grouper par couleur" dans le menu contextuel.
- **Refonte Sidebar** :
  - Structure en accordéons pour "Dossiers de Travail", "Collections" et "Filtres Couleur".
  - Sections fermées par défaut au démarrage pour plus de clarté.
  - Code couleur distinctif et **persistant** pour chaque section (Bleu/Violet/Ambre).
  - Réorganisation : Dossiers de Travail > Collections > Filtres Couleur.

**Impact** : Navigation plus fluide, interface plus propre et intuitive.

**Documentation mise à jour** :
- `docs/CHANGELOG.md`
- `docs/COMPONENTS.md`
- `docs/INTERACTIONS.md`

## [25/12/2025 - 00:20] - Phase 3 Refactorisation : Décomposition PhotoCard

### Type : Refactorisation

**Composants** : `src/features/library/components/PhotoCard/`

**Changements** :

- Création dossier `PhotoCard/` avec 5 fichiers :
  - `index.tsx` : Composant principal assemblé (130 lignes)
  - `PhotoCardFront.tsx` : Face avant avec image + overlay (100 lignes)
  - `PhotoCardBack.tsx` : Face arrière avec métadonnées (190 lignes)
  - `PhotoCardBadges.tsx` : Badges couleur et sélection (55 lignes)
  - `usePhotoCardFlip.ts` : Hook pour animation flip (90 lignes)
- `PhotoCard.tsx` réduit de 364 à 8 lignes (re-export)

**Impact** : Séparation des responsabilités, meilleure maintenabilité.

**Documentation mise à jour** :
- `docs/REFACTORING_PLAN.md` : Phase 3 marquée complétée
- `docs/COMPONENTS.md` : Architecture mise à jour

## [25/12/2025 - 00:10] - Phase 2 Refactorisation : Découpage StorageService

### Type : Refactorisation

**Composants** : `src/services/storage/`

**Changements** :

- Création de 6 modules séparés :
  - `db.ts` : Connexion SQLite + initialisation schéma (140 lignes)
  - `collections.ts` : CRUD Collections (85 lignes)
  - `folders.ts` : Virtual + Shadow folders (235 lignes)
  - `metadata.ts` : Métadonnées items (130 lignes)
  - `handles.ts` : Directory handles legacy (55 lignes)
  - `index.ts` : Export unifié + storageService object (85 lignes)
- `storageService.ts` transformé en simple re-export (580 → 18 lignes)

**Impact** : Meilleure maintenabilité, code plus lisible, modules spécialisés.

**Documentation mise à jour** :
- `docs/REFACTORING_PLAN.md` : Phase 2 marquée complétée

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

## [24/12/2025 - 22:22] - Fix TopBar Hover Detection

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

## [24/12/2025 - 22:06] - Phase 1 : Optimisations Performance (Quick Wins)

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

## [24/12/2025 - 22:00] - Audit de Performance et Plan d'Optimisation

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

## [24/12/2025 - 21:45] - PhotoCarousel Multi-images avec Effet Coverflow

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

## [24/12/2025 - 20:00] - Fix Synchronisation Batch Updates

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

## [24/12/2025 - 19:50] - Micro-animations et Hover Highlight ContextMenu

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

## [24/12/2025 - 19:10] - Implémentation de la Sidebar Persistante

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

## [24/12/2025 - 18:35] - Amélioration de la Persistance de Sélection

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

## [24/12/2025 - 18:25] - Raffinement Navigation et Terminologie "Library"

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

## [24/12/2025 - 17:42] - Amélioration de l'UX de Sélection

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

## [24/12/2025 - 16:49] - Fix persistence collections virtuelles

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

## [24/12/2025 - 16:27] - Création des règles de documentation et réorganisation

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

## [24/12/2025 - 14:50] - Refactorisation App.tsx

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
