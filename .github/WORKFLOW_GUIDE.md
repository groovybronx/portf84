# 🚀 Workflow GitHub Actions - Configuration Standard

## 📋 Fichiers Créés

### 1. **pr-checks.yml** - Workflow Spécialisé pour les PR

- **7 jobs complets** : Qualité, Tests, Build, Sécurité, Commits, Performance, Documentation
- **Validation multi-niveaux** : TypeScript, ESLint, Tests unitaires + E2E, Audit sécurité
- **Rapport automatique** : Résumé des validations dans les commentaires de PR
- **Artifacts** : Build et coverage conservés 7 jours

### 2. **ci-enhanced.yml** - Pipeline CI/CD Amélioré

- **Matrix testing** : Tests sur Node.js 18 et 20
- **Jobs optimisés** : Build, Qualité, Sécurité, Release, Notifications
- **Release automatisé** : Semantic Release sur la branche main
- **Artifacts détaillés** : Build, coverage, rapports de sécurité

### 3. **.releaserc.cjs** - Configuration Semantic Release Corrigée

- **Format CommonJS** : Compatible avec ES modules
- **Branches configurées** : main, develop (beta), release/_ (rc), feature/_ (alpha)
- **Intégration GitHub** : Releases automatiques avec commentaires
- **Tag format standard** : `v{version}`

## 🔧 Configuration Requise

### Secrets GitHub à créer :

```
CODECOV_TOKEN          # Token pour Codecov (optionnel)
LHCI_GITHUB_APP_TOKEN  # Token pour Lighthouse CI (optionnel)
NPM_TOKEN             # Token pour publication NPM (si privé)
SLACK_WEBHOOK         # Webhook Slack pour notifications (optionnel)
```

### Scripts npm recommandés à ajouter dans `package.json` :

```json
{
	"scripts": {
		"lint:eslint": "eslint src --ext .ts,.tsx",
		"lint:format": "prettier --check src/**/*.{ts,tsx}",
		"check:circular": "madge --circular src/",
		"analyze:size": "npm run build && npx bundlesize"
	}
}
```

## 📊 Comparaison avec Workflow Actuel

| Feature           | Actuel (ci.yml)       | Nouveau (pr-checks.yml)    |
| ----------------- | --------------------- | -------------------------- |
| **Jobs**          | 3 (build, test, lint) | 7 spécialisés              |
| **Tests**         | Unitaires seulement   | Unitaires + E2E + Coverage |
| **Sécurité**      | ❌ Non                | ✅ Audit dépendances       |
| **Performance**   | ❌ Non                | ✅ Lighthouse CI           |
| **Documentation** | ❌ Non                | ✅ Validation liens        |
| **Multi-node**    | ❌ Non                | ✅ Matrix 18/20            |
| **PR Summary**    | ❌ Non                | ✅ Commentaire auto        |

## 🎯 Avantages

### ✅ **Qualité Code**

- Validation TypeScript stricte
- ESLint + Prettier intégrés
- Tests complets avec coverage
- Détection dépendances circulaires

### ✅ **Sécurité**

- Audit automatique des dépendances
- Détection des vulnérabilités
- Rapports détaillés conservés

### ✅ **Performance**

- Tests multi-versions Node.js
- Analyse de taille de bundle
- Lighthouse CI pour performance web

### ✅ **Expérience Développeur**

- Rapports clairs dans les PR
- Artifacts disponibles pour debug
- Notifications Slack (optionnel)

## 🔄 Migration Recommandée

1. **Phase 1** : Ajouter `pr-checks.yml` (coexiste avec `ci.yml`)
2. **Phase 2** : Tester sur quelques PRs
3. **Phase 3** : Remplacer `ci.yml` par `ci-enhanced.yml`
4. **Phase 4** : Supprimer l'ancien `ci.yml`

## 🚀 Utilisation

### Pour les PR :

- Le workflow `pr-checks.yml` s'exécute automatiquement
- Un commentaire résumé est ajouté à chaque PR
- Les artifacts sont disponibles pour debug

### Pour les pushes :

- Le workflow `ci-enhanced.yml` s'exécute sur main/develop
- Release automatique sur main avec Semantic Release
- Notifications Slack si configuré

## 📝 Notes

- Les secrets optionnels peuvent être ignorés (jobs continuent en warning)
- Les scripts manquants sont ignorés gracieusement
- Configuration compatible avec projet existant
- Peut être adapté selon besoins spécifiques
