# Guide de Version Sémantique Automatisée

## 🎯 Objectif

Ce guide explique comment fonctionne le workflow de release automatique avec gestion de version sémantique pour Lumina Portfolio.

## 🔄 Workflow de Release

### Déclenchement automatique

- **Branch main** : Crée des releases stables (patch/minor/major)
- **Branch develop** : Crée des pré-releases beta automatiquement
- **Manuel** : Possibilité de déclencher avec type de version spécifique

### Analyse des commits

Le workflow analyse les messages de commits selon les [Conventional Commits](https://www.conventionalcommits.org/) :

| Type de commit     | Impact sur version | Description                 |
| ------------------ | ------------------ | --------------------------- |
| `feat:`            | **minor**          | Nouvelle fonctionnalité     |
| `fix:`             | **patch**          | Correction de bug           |
| `perf:`            | **patch**          | Amélioration de performance |
| `refactor:`        | **patch**          | Refactoring                 |
| `BREAKING CHANGE:` | **major**          | Changement cassant          |

## 📝 Conventions de Commits

### Format recommandé

```
type(scope): description

[optional body]

[optional footer]
```

### Exemples

```bash
feat(library): add drag-and-drop support for photos
fix(ui): resolve sidebar toggle issue on mobile
perf(search): implement caching for search results
refactor(components): extract common button logic
BREAKING CHANGE: remove deprecated API endpoints
```

## 🚀 Types de Releases

### 1. Release Stable (main)

- Déclenchée sur la branche `main`
- Version : `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`
- Crée une release GitHub officielle
- Génère les builds pour toutes plateformes

### 2. Pré-release (develop)

- Déclenchée sur la branche `develop`
- Version : `1.0.0-beta.1`, `1.0.0-beta.2`
- Release GitHub en pré-release
- Builds pour testing uniquement

### 3. Release Manuel

- Déclenchée via `workflow_dispatch`
- Choix du type de version
- Possibilité de spécifier un tag de pré-release

## 🔧 Configuration

### Fichiers concernés

- `package.json` : Version frontend
- `src-tauri/Cargo.toml` : Version backend (sans pré-release)
- `CHANGELOG.md` : Historique des releases

### Permissions requises

Le workflow nécessite les permissions GitHub :

- `contents: write` : Pour modifier les fichiers et créer des tags
- `pull-requests: write` : Pour les interactions avec les PRs

## 📋 Processus de Release

### Étape 1 : Analyse

1. Récupération de la version actuelle
2. Analyse des commits depuis le dernier tag
3. Détermination du type de version nécessaire

### Étape 2 : Mise à jour

1. Mise à jour de `package.json`
2. Mise à jour de `src-tauri/Cargo.toml`
3. Commit des changements de version

### Étape 3 : Tagging

1. Création du tag Git `vX.Y.Z`
2. Push du tag vers le repository

### Étape 4 : Build

1. Build de l'application
2. Création de la release GitHub
3. Upload des assets (installateurs)

### Étape 5 : Documentation

1. Mise à jour du CHANGELOG (releases stables uniquement)
2. Génération des notes de release

## 🎛️ Déclenchement Manuel

### Via GitHub UI

1. Aller dans `Actions` → `Semantic Release`
2. Cliquer sur `Run workflow`
3. Choisir le type de version
4. Spécifier un tag de pré-release si nécessaire

### Types disponibles

- `patch` : `0.3.0` → `0.3.1`
- `minor` : `0.3.0` → `0.4.0`
- `major` : `0.3.0` → `1.0.0`
- `prerelease` : `0.3.0` → `0.3.1-beta.1`

## 🏗️ Build Matrix

Le workflow génère des builds pour :

- **macOS** : `.dmg` (Universal Silicon + Intel)
- **Linux** : `.AppImage`, `.deb`
- **Windows** : `.msi`

## 📊 Monitoring

### Résumé de Release

Chaque release génère un résumé dans l'onglet `Actions` avec :

- Version créée
- Type de release
- Statut des builds
- Liens vers les assets

### Logs

- Logs complets disponibles dans GitHub Actions
- Erreurs détaillées pour debugging
- Historique des versions créées

## 🔍 Dépannage

### Problèmes courants

#### 1. Version déjà existante

```
Error: tag 'v1.0.0' already exists
```

**Solution** : Vérifier les tags existants et incrémenter la version.

#### 2. Tests échoués

Le workflow s'arrête si les tests échouent.
**Solution** : Corriger les tests et relancer la release.

#### 3. Conflit de merge

Si des changements sont poussés pendant la release.
**Solution** : Relancer le workflow après résolution.

### Commandes utiles

```bash
# Lister les tags existants
git tag -l

# Vérifier la version actuelle
npm version

# Forcer une version spécifique
npm version 1.2.3 --no-git-tag-version
```

## 📚 Bonnes Pratiques

### 1. Commits propres

- Utiliser les conventional commits
- Messages clairs et descriptifs
- Éviter les commits de type "fix typo"

### 2. Branches

- `main` : Pour les releases stables
- `develop` : Pour le développement actif
- `feature/*` : Pour les nouvelles fonctionnalités

### 3. Testing

- Toujours tester avant de merger vers `main`
- Vérifier les builds sur `develop`
- Tester les pré-releases

### 4. Communication

- Annoncer les releases importantes
- Documenter les changements cassants
- Mettre à jour la documentation

## 🔄 Migration depuis l'ancien système

### Avant

- Release manuelle via GitHub UI
- Version mise à jour manuellement
- Builds séparés par plateforme

### Après

- Release entièrement automatisée
- Version sémantique automatique
- Builds multi-plateformes simultanés
- Documentation générée automatiquement

## 🎯 Prochaines améliorations - ✅ TERMINÉES

1. **✅ Intégration Slack** : Notifications de releases - **Implémenté**
2. **✅ Rollback automatique** : En cas d'échec critique - **Implémenté**
3. **✅ Release notes IA** : Génération automatique des notes - **Implémenté**
4. **✅ Tests E2E** : Intégration dans le workflow - **Implémenté**

### 🎉 Nouvelles Fonctionnalités Disponibles

- **Workflow Amélioré** : `.github/workflows/release-enhanced.yml`
- **Notifications Slack** : `.github/workflows/slack-notifier.yml`
- **Rollback Automatique** : `.github/workflows/rollback.yml`
- **Tests E2E** : Configuration Playwright + tests multi-plateformes
- **Release Notes IA** : Génération intelligente basée sur les commits

**Documentation complète** : [📖 Guide Enhanced Release](./ENHANCED_RELEASE_GUIDE.md)

---

## 📞 Support

Pour toute question sur le workflow de release :

1. Consulter les logs GitHub Actions
2. Vérifier la documentation GitHub
3. Contacter l'équipe de développement

---

_Ce document est mis à jour automatiquement lors de chaque release stable._
