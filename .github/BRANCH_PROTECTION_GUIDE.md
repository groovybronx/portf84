# Guide de Protection des Branches GitHub - Lumina Portfolio

## 🎯 Objectif

Ce document décrit les règles de protection recommandées pour sécuriser les branches principales du projet **Lumina Portfolio** (`groovybronx/portf84`).

---

## 📋 Branches à Protéger

### 🔴 **Priorité Critique**
- `main` - Branche de production (déploiement stable)
- `develop` - Branche de développement principal

### 🟡 **Priorité Moyenne**
- `lumina-v2.01` - Version stable 2.01
- `luminaV2` - Version majeure V2

---

## 🛡️ Règles de Protection Recommandées

### 1. **Protection de `main` (Production)**

#### Configuration GitHub
```
Settings → Branches → Add branch protection rule
Branch name pattern: main
```

#### Règles à activer :

✅ **Require a pull request before merging**
- Require approvals: **1 minimum**
- Dismiss stale pull request approvals when new commits are pushed: ✅
- Require review from Code Owners: ✅ (si fichier CODEOWNERS existe)

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging: ✅
- Status checks requis :
  - `build` (CI build)
  - `test` (npm test)
  - `lint` (code quality)

✅ **Require conversation resolution before merging**
- Force tous les commentaires de review à être résolus

✅ **Require signed commits** (recommandé pour la sécurité)

✅ **Require linear history**
- Force rebase ou squash merge (pas de merge commits)

✅ **Do not allow bypassing the above settings**
- Même les admins doivent suivre les règles

🚫 **Restrict force pushes** : Activé
🚫 **Allow deletions** : Désactivé

---

### 2. **Protection de `develop` (Développement)**

#### Configuration GitHub
```
Settings → Branches → Add branch protection rule
Branch name pattern: develop
```

#### Règles à activer :

✅ **Require a pull request before merging**
- Require approvals: **1 minimum**
- Dismiss stale pull request approvals when new commits are pushed: ✅

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging: ✅
- Status checks requis :
  - `build`
  - `test`

✅ **Require conversation resolution before merging**

🔓 **Allow force pushes** : Désactivé (mais admins peuvent bypass si nécessaire)
🚫 **Allow deletions** : Désactivé

---

### 3. **Protection des Versions Stables** (`lumina-v2.01`, `luminaV2`)

#### Configuration GitHub
```
Settings → Branches → Add branch protection rule
Branch name pattern: lumina*
```

#### Règles à activer :

✅ **Require a pull request before merging**
- Require approvals: **2 minimum** (versions critiques)

✅ **Require status checks to pass before merging**

🚫 **Restrict force pushes** : Activé
🚫 **Allow deletions** : Désactivé

---

## 🔧 Configuration Étape par Étape

### Étape 1 : Accéder aux Paramètres

1. Aller sur : `https://github.com/groovybronx/portf84`
2. Cliquer sur **Settings** (onglet en haut)
3. Dans le menu latéral gauche, cliquer sur **Branches**

### Étape 2 : Ajouter une Règle pour `main`

1. Cliquer sur **Add branch protection rule**
2. Dans **Branch name pattern**, taper : `main`
3. Cocher les options listées ci-dessus (section "Protection de main")
4. Scroller en bas et cliquer sur **Create** ou **Save changes**

### Étape 3 : Répéter pour `develop`

1. Cliquer à nouveau sur **Add branch protection rule**
2. Dans **Branch name pattern**, taper : `develop`
3. Configurer selon les règles listées (section "Protection de develop")
4. Sauvegarder

### Étape 4 : Protéger les Versions Stables

1. **Add branch protection rule**
2. Dans **Branch name pattern**, utiliser un wildcard : `lumina*`
   - Cela protège automatiquement `lumina-v2.01`, `luminaV2`, `luminav2.011`
3. Configurer les règles strictes
4. Sauvegarder

---

## 📊 Workflow de Développement Recommandé

Avec ces protections, voici le workflow idéal :

```
feature/ma-nouvelle-feature
    ↓ (PR, tests, review)
develop
    ↓ (PR, tests, review x1-2)
main (production)
    ↓ (tag version)
lumina-v2.x (release stable)
```

### Créer une Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-descriptif
```

### Pousser et Créer une PR
```bash
git push origin feature/nom-descriptif
# Aller sur GitHub et créer une PR vers 'develop'
```

### Merger vers Production (après tests sur develop)
```bash
# Depuis GitHub UI, créer une PR : develop → main
# Attendre validation des tests + review
# Merger via GitHub (squash ou rebase)
```

---

## 🚨 Actions Interdites (avec ces protections)

❌ Push direct sur `main` sans PR  
❌ Force push sur `main` ou `develop`  
❌ Suppression accidentelle de branches protégées  
❌ Merge de PR non testée ou non reviewée  
❌ Merge de PR avec commentaires non résolus  

---

## 🔐 Sécurité Additionnelle

### Fichier CODEOWNERS (Optionnel mais Recommandé)

Créer `.github/CODEOWNERS` :

```
# Propriétaires du Code - Lumina Portfolio

# Définit qui doit reviewer les changements critiques

# Configuration et scripts de build
/src-tauri/**         @groovybronx
/vite.config.ts       @groovybronx
/package.json         @groovybronx

# Services critiques (API, Storage, Security)
/src/services/**      @groovybronx
/src/shared/hooks/**  @groovybronx

# Tests
/tests/**             @groovybronx

# Documentation
/docs/**              @groovybronx
README.md             @groovybronx

# Tout par défaut (si rien ne match ci-dessus)
*                     @groovybronx
```

### Signed Commits (GPG)

Pour activer les commits signés :

```bash
# Générer une clé GPG
gpg --full-generate-key

# Lister les clés
gpg --list-secret-keys --keyid-format=long

# Configurer Git pour signer automatiquement
git config --global user.signingkey [YOUR_KEY_ID]
git config --global commit.gpgsign true

# Ajouter la clé publique à GitHub
# Settings → SSH and GPG keys → New GPG key
```

---

## 📝 Checklist de Mise en Place

- [ ] Règle de protection créée pour `main`
- [ ] Règle de protection créée pour `develop`
- [ ] Règle de protection créée pour `lumina*` (versions)
- [ ] Fichier `.github/CODEOWNERS` créé (optionnel)
- [ ] CI/CD configuré pour status checks (GitHub Actions)
- [ ] Commits signés activés (GPG - optionnel)
- [ ] Équipe informée des nouvelles règles
- [ ] Tests manuels de push sur `main` (doit échouer)
- [ ] Test de création de PR vers `main` (doit requérir review)

---

## 🆘 En Cas de Besoin d'Override (Admin)

Si vous devez absolument bypass les règles (urgence) :

1. Aller dans **Settings → Branches → [Règle concernée]**
2. Temporairement décocher **Do not allow bypassing the above settings**
3. Faire l'action critique
4. **RE-COCHER immédiatement** la protection

⚠️ **À n'utiliser qu'en cas d'urgence absolue !**

---

## 📚 Ressources

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS Syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Signed Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

---

**Dernière mise à jour** : 30/12/2024  
**Auteur** : Antigravity AI Assistant