# Audit d'Architecture - Portf84

Date: 4 Janvier 2026

## Synthèse
L'application a grandi organiquement, ce qui est normal. Cependant, certains fichiers ont accumulé trop de responsabilités ("God Components"), ce qui rend la maintenance difficile, le risque de régression élevé, et les performances potentielles moindres (re-renders inutiles).

Ce document identifie les points critiques et propose un plan de découpage.

## 1. Analyse des Fichiers Critiques

Les fichiers suivants ont été identifiés comme nécessitant une intervention prioritaire en raison de leur taille et de leur complexité cyclomatique.

### A. `src/App.tsx` (682 lignes) - Priorité Haute 🔴
**Problème :** Ce fichier agit comme un "God Component". Il gère tout :
- Le routing (bien que simple).
- Le layout global (TopBar, Sidebar).
- La gestion d'état locale (sélection, focus, hover).
- L'orchestration de **toutes** les modales de l'application.
- Les écouteurs d'événements globaux (clavier, drag selection).
- Les menus contextuels.

**Conséquences :**
- Chaque fois qu'une modale s'ouvre/se ferme, tout l'arbre de l'application risque de se re-rendre.
- Difficile de lire le flux de données.
- Fichier "fourre-tout".

**Recommandation de Découpage :**
1.  Créer `src/components/layouts/MainLayout.tsx` pour gérer la structure (Sidebar, MainContent, TopBar).
2.  Créer `src/features/modals/ModalManager.tsx` (ou `GlobalModals.tsx`) pour regrouper toutes les déclarations de modales et alléger le JSX de `App`.
3.  Extraire la logique de sélection (drag box) dans un composant dédié `src/features/selection/SelectionOverlay.tsx`.

### B. `src/shared/contexts/LibraryContext.tsx` (785 lignes) - Priorité Haute 🔴
**Problème :** Mélange les définitions de types, le reducer (très long), les actions, les calculs dérivés complexes (`useMemo` de filtrage/tri sur toute la librairie), et le provider.
**Conséquences :**
- La logique métier est noyée dans le code React.
- Difficile de tester unitairement la logique de filtrage ou de réduction sans monter le composant.
- Problèmes de performance : les filtres recalculent tout à chaque changement de contexte.

**Recommandation de Découpage :**
1.  Extraire les types dans `src/shared/contexts/library/types.ts`.
2.  Extraire le reducer dans `src/shared/contexts/library/reducer.ts`.
3.  Extraire la logique de filtrage (les gros `useMemo`) dans des fichiers utilitaires purs : `src/features/library/utils/filterItems.ts`.
4.  Créer des hooks personnalisés pour les actions : `src/shared/contexts/library/useLibraryActions.ts`.

### C. `src/shared/components/SettingsModal.tsx` (674 lignes) - Priorité Moyenne 🟠
**Problème :** Contient le code UI de tous les onglets (Général, Langue, Apparence, Stockage, Raccourcis) dans un seul fichier.
**Conséquences :**
- Fichier long et difficile à naviguer.
- Mélange de logique de configuration (API keys, DB path) et de présentation pure.

**Recommandation de Découpage :**
1.  Créer un dossier `src/features/settings/components/tabs/`.
2.  Extraire chaque onglet dans son propre composant :
    - `GeneralTab.tsx`
    - `AppearanceTab.tsx`
    - `StorageTab.tsx`
    - `ShortcutsTab.tsx`
    - `LanguageTab.tsx`
3.  `SettingsModal` ne deviendra qu'un "shell" qui gère la navigation entre onglets.

## 2. Plan d'Action Suggéré

| Phase | Tâche | Impact | Difficulté |
|-------|-------|--------|------------|
| 1 | **Découpage de `App.tsx`** | Réduit la complexité cognitive immédiate, améliore la structure globale. | ⭐⭐ |
| 2 | **Refactor `SettingsModal`** | Facile à faire, bon échauffement, nettoie un gros morceau d'UI. | ⭐ |
| 3 | **Refactor `LibraryContext`** | Critique pour la stabilité et testabilité, mais plus délicat (coeur du réacteur). | ⭐⭐⭐ |

## 3. Autres Observations

- **`src/services/storage/tags.ts` (724 lignes)** : Bien que long, ce fichier est cohérent (Service Layer). Il pourrait être divisé par thèmes (ex: `tagsCRUD.ts`, `tagsMerge.ts`, `tagsSearch.ts`) si besoin, mais ce n'est pas urgent car le couplage est faible.
- **Dossiers `features` vs `shared`** : L'architecture actuelle utilise déjà des features, ce qui est très bien. Le découpage proposé ci-dessus renforcera cette structure.
