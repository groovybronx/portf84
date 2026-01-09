# Instructions pour Créer la Branche Release v0.2.0-beta.1

Ce document explique les étapes à suivre **manuellement** pour créer la nouvelle branche de release.

## 🎯 Objectif

Créer la branche `release/v0.2.0-beta.1` à partir de `develop` pour commencer le développement de la prochaine version beta.

## 📋 Instructions Étape par Étape

### Méthode 1 : Utiliser le Script Automatisé (Recommandé)

```bash
# Depuis la racine du projet
./scripts/create-release-branch.sh
```

Le script vous guidera à travers le processus :
1. Affichera la version actuelle (0.1.0-beta.1)
2. Suggérera la prochaine version (0.2.0-beta.1)
3. Créera la branche
4. Mettra à jour package.json
5. Commettra et poussera les changements

### Méthode 2 : Création Manuelle

Si vous préférez créer la branche manuellement :

```bash
# 1. S'assurer que develop est à jour
git checkout develop
git pull origin develop

# 2. Créer la nouvelle branche de release
git checkout -b release/v0.2.0-beta.1

# 3. Mettre à jour la version dans package.json
# Changer "version": "0.1.0-beta.1" en "version": "0.2.0-beta.1"
sed -i.bak 's/"version": "0.1.0-beta.1"/"version": "0.2.0-beta.1"/' package.json
rm package.json.bak 2>/dev/null || true
# Note : Sur Linux (GNU sed), vous pouvez utiliser sed -i sans .bak

# Ou éditer manuellement le fichier package.json

# 4. Commiter le changement de version
git add package.json
git commit -m "chore: Bump version to 0.2.0-beta.1"

# 5. Pousser la nouvelle branche vers GitHub
git push -u origin release/v0.2.0-beta.1
```

## ✅ Vérification

Après avoir créé la branche, vérifiez :

1. **Sur GitHub** : https://github.com/groovybronx/portf84/branches
   - La branche `release/v0.2.0-beta.1` devrait être listée

2. **Version correcte** :
   ```bash
   git checkout release/v0.2.0-beta.1
   cat package.json | grep version
   ```
   Devrait afficher : `"version": "0.2.0-beta.1",`

## 📝 Prochaines Étapes

Une fois la branche créée :

### 1. Mettre à jour le CHANGELOG

Créer ou mettre à jour `CHANGELOG.md` avec les nouvelles fonctionnalités :

```markdown
## [0.2.0-beta.1] - YYYY-MM-DD

### Added
- Liste des nouvelles fonctionnalités

### Changed
- Modifications apportées

### Fixed
- Bugs corrigés
```

### 2. Développement et Tests

- Développer les nouvelles fonctionnalités dans cette branche
- Tester exhaustivement
- Corriger les bugs trouvés

### 3. Créer une Pull Request vers `main`

Quand la release est prête :

1. Aller sur GitHub : https://github.com/groovybronx/portf84/pulls
2. Cliquer sur "New Pull Request"
3. Base : `main` ← Compare : `release/v0.2.0-beta.1`
4. Créer la PR avec un titre clair : "Release v0.2.0-beta.1"
5. Demander des reviews
6. Merger après approbation

### 4. Après le Merge dans `main`

```bash
# 1. Merger la release dans develop aussi
git checkout develop
git pull origin develop
git merge release/v0.2.0-beta.1
git push origin develop

# 2. Créer un tag pour la release
git checkout main
git pull origin main
git tag -a v0.2.0-beta.1 -m "Release version 0.2.0-beta.1"
git push origin v0.2.0-beta.1

# 3. Supprimer la branche de release (optionnel)
git push origin --delete release/v0.2.0-beta.1
git branch -d release/v0.2.0-beta.1
```

## 🔄 Workflow Complet

```
develop (0.1.0-beta.1)
   ↓
   └─→ release/v0.2.0-beta.1 (créée)
          ↓ (tests, fixes)
          ├─→ main (via PR)
          │     ↓
          │   tag v0.2.0-beta.1
          │
          └─→ develop (merge back)
```

## 📚 Ressources

- [Guide de stratégie de branches](./BRANCH_STRATEGY.md)
- [Configuration GitHub](./CONFIGURATION_GITHUB_FR.md)
- [Semantic Versioning](https://semver.org/)

## 🆘 Problèmes Courants

### La branche existe déjà

```bash
# Supprimer la branche existante
git push origin --delete release/v0.2.0-beta.1
git branch -D release/v0.2.0-beta.1

# Recréer proprement
git checkout develop
git pull origin develop
git checkout -b release/v0.2.0-beta.1
```

### Erreur de permission lors du push

Assurez-vous que :
- Vous êtes authentifié avec GitHub
- Vous avez les droits de push sur le dépôt
- Votre token GitHub est valide

---

**Note** : Cette branche a été préparée mais doit être poussée manuellement car les scripts automatisés n'ont pas accès direct aux credentials GitHub dans cet environnement.
