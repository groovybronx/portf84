# Changelog

Dernière mise à jour : 24/12/2024 à 18:05

Ce fichier suit l'évolution du projet Lumina Portfolio.

---

## 🎯 État Actuel du Projet

**Session en cours** : Audit documentation et Raffinements UX

**Progression** :
- ✅ Amélioration UX Sélection : 5/5 tâches (100% complété)
  - Auto-validation, reset intelligent, suppression bouton "Done"
- ✅ Audit complet Documentation : 6/6 fichiers sync (100% complété)
- ✅ Raffinement Déplacement & Styles : 3/3 tâches (100% complété)

**Prochaines étapes** :
- [x] Push final et validation utilisateur

**Dernière modification** : 24/12/2024 à 18:05

---

## Historique des Modifications

---

## [24/12/2024 - 18:05] - Raffinement du Déplacement et Cohérence Visuelle

### Type : Amélioration UX / Cohérence

**Composant** : `ActionModals.tsx`, `FolderDrawer.tsx`

**Changements** :

- **Filtrage des Dossiers** : La modale "Move Items" ne propose désormais que les **Collections Manuelles**. Les shadow folders sont exclus pour éviter les erreurs de déplacement.
- **Cohérence Visuelle** :
  - Standardisation de l'icône `FolderHeart` pour toutes les collections manuelles (modale et sidebar).
  - Thème **Violet** harmonisé pour toutes les cibles de déplacement (icônes, boutons, hovers).
  - Bouton "Create New Collection" dans la modale passé en violet pour correspondre au thème.

**Impact** : Meilleure clarté dans l'organisation des fichiers et renforcement de l'identité visuelle des collections virtuelles.

**Documentation mise à jour** :
- `docs/ARCHITECTURE.md` : Terminologie "Manual Collections"
- `docs/COMPONENTS.md` & `docs/INTERACTIONS.md` : Clarification des cibles de déplacement.

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
