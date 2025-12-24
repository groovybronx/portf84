# Instructions de Gestion de la Documentation Technique

## 1. Source de Vérité et Connaissance Persistante

- **Référence absolue :** Tu dois utiliser les fichiers listés au point 2 comme ta source de connaissance principale.
- **Consultation systématique :** Avant de répondre à une question sur l'état du projet ou de proposer une modification, consulte obligatoirement ces documents pour t'assurer que ta compréhension est alignée avec l'état actuel réel.

---

## 2. Périmètre (Fichiers cibles dans `docs/`)

Les documents suivants doivent être maintenus à jour :

- `docs/README.md` - Point d'entrée et guide de démarrage
- `docs/ARCHITECTURE.md` - Structure technique et patterns
- `docs/COMPONENTS.md` - Composants UI/UX et hooks
- `docs/AI_SERVICE.md` - Intégration Gemini AI
- `docs/INTERACTIONS.md` - UX et raccourcis utilisateur
- `docs/CHANGELOG.md` - Suivi chronologique des modifications

---

## 3. Règles de Modification (CRITIQUE)

### Horodatage Strict (Ligne 1)

- **FORMAT OBLIGATOIRE** : `Dernière mise à jour : JJ/MM/AAAA à HH:MM`
- **EMPLACEMENT** : La TOUTE PREMIÈRE LIGNE de chaque document (sauf README.md)
- **MISE À JOUR** : Lors d'une modification, tu dois **remplacer** l'ancien horodatage en ligne 1 par le nouveau
- **INTERDICTION** : Ne place JAMAIS l'horodatage au milieu ou à la fin du document

### Édition Partielle Uniquement

- Il est strictement **INTERDIT** de remplacer la totalité d'un fichier
- Ne modifie que les informations nécessaires
- Préserve toujours la structure existante (titres, listes) après la ligne 1

---

## 4. Rôle de Chaque Document

### README.md - Point d'Entrée

**Rôle** : Index général et guide de démarrage rapide

**Contenu** :

- Stack technologique (tableau des versions)
- Sommaire avec liens vers les autres docs
- Installation rapide (prérequis, commandes dev/build)
- Conventions de code (résumé)
- Configuration de base (API keys, permissions)

**Quand modifier** :

- ✅ Ajout/suppression d'une dépendance majeure
- ✅ Changement de version d'une technologie clé
- ✅ Ajout d'un nouveau document dans `docs/`
- ✅ Modification des commandes d'installation/build
- ❌ Changements mineurs de composants
- ❌ Ajout de fonctionnalités (sauf si impact stack)

---

### ARCHITECTURE.md - Structure Technique

**Rôle** : Architecture globale, flux de données, patterns techniques

**Contenu** :

- Vue d'ensemble (diagrammes Mermaid)
- Stack technologique détaillée
- Architecture de code (structure `src/`)
- État global (Contexts, patterns)
- Approche Local-First (SQLite, Asset Protocol)
- Optimisations (virtualisation, memo, code splitting)
- Flux de données (diagrammes de séquence)
- Déploiement Tauri (build, permissions, CI/CD)
- Stratégie de tests

**Quand modifier** :

- ✅ Ajout/suppression d'un Context
- ✅ Modification de la structure `src/` (nouveaux dossiers features/)
- ✅ Changement dans le schéma SQLite
- ✅ Ajout de patterns d'optimisation
- ✅ Modification des permissions Tauri
- ✅ Changement dans le flux de données
- ❌ Ajout de composants UI (→ COMPONENTS.md)
- ❌ Modification d'interactions (→ INTERACTIONS.md)

---

### COMPONENTS.md - Composants UI/UX

**Rôle** : Documentation détaillée de tous les composants React et hooks

**Contenu** :

- Architecture générale (arbre des composants)
- Composants de vue (PhotoGrid, Carousel, List, etc.)
- Composants UI (TopBar, Modals, Menus)
- Custom Hooks (useKeyboardShortcuts, useModalState, etc.)
- Détails d'implémentation (code snippets)
- Props et interfaces TypeScript
- Bénéfices et optimisations

**Quand modifier** :

- ✅ Création d'un nouveau composant React
- ✅ Création d'un nouveau custom hook
- ✅ Modification significative d'un composant existant
- ✅ Ajout de props ou changement d'interface
- ✅ Refactorisation de composants (extraction, fusion)
- ✅ Changement dans l'arbre des composants
- ❌ Corrections de bugs CSS mineurs
- ❌ Changements de couleurs/styles sans impact structurel

---

### AI_SERVICE.md - Intégration Gemini

**Rôle** : Documentation complète du service d'intelligence artificielle

**Contenu** :

- Configuration (modèle, API key, authentification)
- Workflow d'analyse (simple, stream, thinking process)
- Batch processing (useBatchAI)
- Gestion des erreurs
- Persistance des résultats
- Limites et optimisations futures

**Quand modifier** :

- ✅ Changement de modèle Gemini
- ✅ Modification du prompt d'analyse
- ✅ Ajout de fonctionnalités AI (ex: thinking process)
- ✅ Changement dans le batch processing
- ✅ Modification de la gestion d'erreurs API
- ✅ Ajout de nouvelles optimisations
- ❌ Changements UI liés à l'affichage des résultats (→ COMPONENTS.md)
- ❌ Modifications de la persistance SQLite (→ ARCHITECTURE.md)

---

### INTERACTIONS.md - UX et Raccourcis

**Rôle** : Documentation des interactions utilisateur (souris, clavier, gestes)

**Contenu** :

- Souris & gestes (clic, double-clic, drag-select)
- Configuration & paramètres
- Recherche & filtrage (fuzzy search, tags couleurs)
- Raccourcis clavier (navigation, tags, actions)
- États de focus & sélection
- Auto-scroll

**Quand modifier** :

- ✅ Ajout/modification de raccourcis clavier
- ✅ Changement dans la navigation (souris ou clavier)
- ✅ Modification du système de sélection
- ✅ Ajout de gestes ou interactions
- ✅ Changement dans le filtrage/recherche
- ❌ Implémentation technique des raccourcis (→ COMPONENTS.md si hook)
- ❌ Changements visuels sans impact UX

---

### CHANGELOG.md - Historique des Modifications

**Rôle** : Journal chronologique + État actuel du projet

**Emplacement** : Le fichier doit impérativement se trouver dans `docs/CHANGELOG.md`

**Contenu** :

- Horodatage : `Dernière mise à jour : JJ/MM/AAAA à HH:MM` (ligne 1)
- **Section "🎯 État Actuel du Projet"** (TOUJOURS en haut, après l'intro) :
  - **Session en cours** : Description du travail actuel
  - **Progression** : État détaillé des tâches avec pourcentages
  - **Prochaines étapes** : Liste des tâches restantes
  - **Dernière modification** : Horodatage de la dernière mise à jour
- Entrées chronologiques inversées (plus récent en haut)
- Format par entrée :

  ```markdown
  ## [JJ/MM/AAAA - HH:MM] - Titre de la modification

  ### Type : Ajout | Modification | Correction

  **Composant** : Fichier(s) concerné(s)

  **Changements** :

  - Liste détaillée des modifications

  **Impact** : Description de l'impact utilisateur/technique

  **Documentation mise à jour** :

  - Liste des fichiers docs/ modifiés
  ```

**Quand modifier** :

- ✅ **TOUJOURS** mettre à jour "État Actuel" lors de changements importants
- ✅ **TOUJOURS** lors d'un commit Git (ajouter entrée historique)
- ✅ À la fin de chaque session de travail
- ✅ Toute modification de code significative
- ✅ Ajout/suppression de fichiers
- ✅ Refactorisation majeure
- ✅ Corrections de bugs importants
- ❌ Modifications de documentation uniquement (sauf si c'est le sujet du commit)
- ❌ Changements de configuration mineurs

**Importance Critique** :

> [!IMPORTANT]
> La section "État Actuel" permet de maintenir le contexte entre les conversations.
> Elle doit être mise à jour systématiquement pour garantir la continuité du travail.

---

## 5. Matrice de Décision Rapide

| Modification                          | README | ARCHI | COMP | AI  | INTER | CHANGELOG |
| ------------------------------------- | ------ | ----- | ---- | --- | ----- | --------- |
| Nouveau composant React               | ❌     | ❌    | ✅   | ❌  | ❌    | ✅        |
| Nouveau custom hook                   | ❌     | ❌    | ✅   | ❌  | ❌    | ✅        |
| Nouveau Context                       | ❌     | ✅    | ❌   | ❌  | ❌    | ✅        |
| Modification schéma SQLite            | ❌     | ✅    | ❌   | ❌  | ❌    | ✅        |
| Nouveau raccourci clavier             | ❌     | ❌    | ❌   | ❌  | ✅    | ✅        |
| Changement modèle Gemini              | ✅     | ❌    | ❌   | ✅  | ❌    | ✅        |
| Refactorisation majeure (ex: App.tsx) | ❌     | ❌    | ✅   | ❌  | ❌    | ✅        |
| Ajout dépendance npm                  | ✅     | ✅    | ❌   | ❌  | ❌    | ✅        |
| Modification permissions Tauri        | ❌     | ✅    | ❌   | ❌  | ❌    | ✅        |
| Nouveau feature/ directory            | ✅     | ✅    | ❌   | ❌  | ❌    | ✅        |
| Correction bug CSS                    | ❌     | ❌    | ❌   | ❌  | ❌    | ❌        |

---

## 6. Workflow Git et Déclencheurs

### Avant d'exécuter un `git commit` ou `git push`

1. **Analyse & Comparaison** : Vérifie l'impact des changements sur la documentation
2. **Identification** : Détermine quels fichiers docs/ doivent être mis à jour (utilise la matrice)
3. **Mise à jour** :
   - Actualise les fichiers `.md` concernés
   - Met à jour l'horodatage (ligne 1) de chaque fichier modifié
   - Ajoute une entrée au `docs/CHANGELOG.md`
4. **Vérification** : Relis pour détecter les incohérences
5. **Commit** : Fais un commit séparé pour la documentation si nécessaire

### Checklist Avant Commit

- [ ] J'ai identifié tous les fichiers de documentation impactés
- [ ] J'ai mis à jour l'horodatage (ligne 1) de chaque fichier modifié
- [ ] J'ai ajouté une entrée détaillée au CHANGELOG.md
- [ ] J'ai vérifié la cohérence entre le code et la documentation
- [ ] J'ai relu les sections modifiées pour détecter les incohérences
- [ ] Le commit de documentation est prêt (séparé ou avec le code)

---

## 7. Modèle de Notification

> **[VÉRIFICATION DOC & CHANGELOG]**
>
> - **Code :** [Résumé bref des changements effectués]
> - **Impact Doc :** [Liste des fichiers modifiés dans docs/ + Horodatage mis à jour]
> - **Changelog :** [Entrée ajoutée au docs/CHANGELOG.md]
> - **Action :** Souhaites-tu que j'applique ces changements ? Si tu as un doute, demande-moi des précisions.

---

## 8. Exemples de Bonnes Pratiques

### ✅ BON : Commit avec documentation

```bash
# 1. Modifier le code
# 2. Mettre à jour COMPONENTS.md (horodatage + contenu)
# 3. Mettre à jour CHANGELOG.md
git add src/shared/hooks/useKeyboardShortcuts.ts docs/COMPONENTS.md docs/CHANGELOG.md
git commit -m "feat: Add useKeyboardShortcuts hook

- Extracted keyboard logic from App.tsx
- Updated COMPONENTS.md with hook documentation
- Added CHANGELOG entry"
```

### ✅ BON : Commits séparés

```bash
# 1. Commit du code
git commit -m "refactor: Extract custom hooks from App.tsx"

# 2. Commit de la documentation
git commit -m "docs: Update documentation for App.tsx refactoring"
```

### ❌ MAUVAIS : Commit sans documentation

```bash
# Code modifié mais documentation oubliée
git commit -m "feat: Add new hook"
# ❌ CHANGELOG.md non mis à jour
# ❌ COMPONENTS.md non mis à jour
```

---

## 9. Gestion des Conflits

Si plusieurs fichiers de documentation sont impactés par une seule modification :

1. **Mettre à jour TOUS les fichiers concernés**
2. **Utiliser le même horodatage** pour tous
3. **Référencer les autres docs modifiés** dans le CHANGELOG

**Exemple** :

```markdown
## [24/12/2024 - 14:50] - Refactorisation App.tsx

**Documentation mise à jour** :

- `docs/COMPONENTS.md` : Ajout section "Custom Hooks"
- `docs/ARCHITECTURE.md` : Mise à jour arbre src/shared/hooks/
```

---

## 10. Communication et Incertitude

- Si une modification a un impact ambigu sur la documentation, **ne devine pas**
- Demande des précisions à l'utilisateur avant toute modification de fichier
- Utilise le modèle de notification pour validation

---

## 11. Exceptions

**Les seuls cas où la documentation n'est PAS requise** :

1. Corrections de typos dans les commentaires
2. Reformatage de code (prettier, eslint)
3. Modifications de fichiers de configuration (.gitignore, .prettierrc)
4. Ajout de tests unitaires (sauf si nouvelle stratégie de test)
5. Modifications de README.md uniquement (pas de code)

**Dans tous les autres cas : DOCUMENTATION OBLIGATOIRE**
