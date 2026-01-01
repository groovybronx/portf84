# Configuration GitHub - Guide Pas à Pas

Ce document explique comment configurer GitHub pour protéger la branche `main`, définir `develop` comme branche par défaut, et gérer les branches du projet.

## 🎯 Objectifs

1. ✅ Protéger la branche `main` (interdire les modifications directes)
2. ✅ Définir `develop` comme branche par défaut
3. ✅ Nettoyer les branches inutiles
4. ✅ Créer une nouvelle branche pour la prochaine beta release

---

## 📝 Étape 1 : Définir `develop` comme Branche Par Défaut

### Instructions :

1. Aller sur votre dépôt GitHub : **https://github.com/groovybronx/portf84**

2. Cliquer sur l'onglet **Settings** (⚙️) en haut de la page

3. Dans la barre latérale gauche, cliquer sur **Branches**

4. Sous "Default branch", vous verrez actuellement `main`
   
5. Cliquer sur l'icône de changement (⇄) ou le bouton **Switch to another branch**

6. Dans le menu déroulant, sélectionner **`develop`**

7. Cliquer sur **Update**

8. Une boîte de dialogue de confirmation apparaîtra. Cliquer sur **"I understand, update the default branch"**

✅ **Résultat** : `develop` est maintenant la branche par défaut. Les nouveaux clones utiliseront `develop` et les PRs cibleront `develop` par défaut.

---

## 🔒 Étape 2 : Protéger la Branche `main`

### Instructions :

1. Toujours dans **Settings → Branches**

2. Sous "Branch protection rules", cliquer sur **Add rule** (ou **Add branch protection rule**)

3. Dans le champ "Branch name pattern", entrer : **`main`**

4. Activer les options suivantes :

### Protection de Base :

- ☑ **Require a pull request before merging**
  - ☑ **Require approvals** : Mettre au minimum **1**
  - ☑ **Dismiss stale pull request approvals when new commits are pushed**
  - ☑ **Require review from Code Owners** (si vous avez un fichier CODEOWNERS)

### Vérifications de Statut :

- ☑ **Require status checks to pass before merging**
  - ☑ **Require branches to be up to date before merging**
  - Ajouter les vérifications CI (tests, builds) comme requis si disponibles

### Paramètres Additionnels :

- ☑ **Require conversation resolution before merging**
- ☑ **Include administrators** (recommandé - les admins suivent aussi les règles)
- ☑ **Restrict who can push to matching branches** (optionnel)
  - Si activé, seuls les utilisateurs/équipes spécifiés peuvent push

### Option Maximale (Verrouillage Complet) :

- ☑ **Lock branch** - Empêche TOUS les pushes directs, même avec les vérifications passées
  - ⚠️ Utilisez cette option si vous voulez que `main` soit STRICTEMENT en lecture seule

5. Faire défiler vers le bas et cliquer sur **Create** ou **Save changes**

✅ **Résultat** : La branche `main` est maintenant protégée. Personne ne peut y pusher directement, même avec les droits d'admin.

---

## 🧹 Étape 3 : Nettoyer les Branches Inutiles

### Option A : Script Automatique (Recommandé)

Utiliser le script fourni dans le dépôt :

```bash
cd /chemin/vers/portf84
./scripts/cleanup-branches.sh
```

Le script va :
- Identifier les branches obsolètes
- Vous demander confirmation
- Supprimer les branches de façon sécurisée

### Option B : Suppression Manuelle

Pour supprimer des branches une par une :

```bash
# Lister toutes les branches distantes
git branch -r

# Supprimer une branche spécifique
git push origin --delete nom-de-la-branche
```

### Branches à Supprimer :

Les branches suivantes peuvent être supprimées en toute sécurité :

**Branches Copilot (anciennes) :**
- `copilot/add-tag-merge-history-component`
- `copilot/check-develop-main-sync`
- `copilot/create-specific-copilot-agents`
- `copilot/resolve-merge-conflicts-pr17`
- `copilot/set-up-copilot-instructions`
- `copilot/sub-pr-12`
- `copilot/sub-pr-17`
- `copilot/sub-pr-17-again`
- `copilot/sub-pr-28-again`

**Features Mergées :**
- `feat/app-development`
- `feat/raw-file-support`
- `feat/theme-system-v4`
- `feature/dynamic-configuration`
- `feature/knowledge-doc-8019855004813516228`

### Branches à GARDER :

- ✅ `main` - branche de production
- ✅ `develop` - branche d'intégration
- ✅ `copilot/setup-main-branch-protection` - branche actuelle (celle-ci!)

---

## 🚀 Étape 4 : Créer une Nouvelle Branche pour la Prochaine Beta Release

### Option A : Script Automatique (Recommandé)

```bash
cd /chemin/vers/portf84
./scripts/create-release-branch.sh
```

Le script va :
- Lire la version actuelle (0.1.0-beta.1)
- Suggérer la prochaine version (0.2.0-beta.1)
- Créer la branche `release/v0.2.0-beta.1`
- Mettre à jour `package.json`
- Pusher la nouvelle branche

### Option B : Création Manuelle

```bash
# S'assurer que develop est à jour
git checkout develop
git pull origin develop

# Créer la branche de release
git checkout -b release/v0.2.0-beta.1

# Mettre à jour la version dans package.json
# Modifier manuellement ou utiliser npm version
npm version 0.2.0-beta.1 --no-git-tag-version

# Commiter le changement
git add package.json
git commit -m "chore: Bump version to 0.2.0-beta.1"

# Pusher la nouvelle branche
git push -u origin release/v0.2.0-beta.1
```

### Prochaines Étapes après la Création :

1. **Mettre à jour le CHANGELOG.md** avec les notes de release
2. **Tester la release** de manière exhaustive
3. **Corriger les bugs** trouvés pendant les tests
4. **Créer une Pull Request** vers `main` quand prêt
5. **Après le merge dans main** :
   - Merger également dans `develop`
   - Créer un tag : `git tag -a v0.2.0-beta.1 -m "Release v0.2.0-beta.1"`
   - Pusher le tag : `git push origin v0.2.0-beta.1`

---

## ✅ Vérification Finale

### Vérifier que Tout est Configuré :

1. **Branche par défaut** :
   - Aller sur https://github.com/groovybronx/portf84
   - La page devrait montrer la branche `develop` par défaut

2. **Protection de main** :
   - Essayer de pusher directement sur `main` → devrait être refusé
   - Les PRs vers `main` devraient nécessiter une approbation

3. **Branches nettoyées** :
   - Exécuter `git branch -r` pour voir les branches restantes
   - Seules les branches actives devraient être listées

4. **Nouvelle branche de release** :
   - Vérifier que `release/v0.2.0-beta.1` existe sur GitHub
   - Vérifier que `package.json` a la bonne version

---

## 📚 Ressources Supplémentaires

- [Documentation complète de la stratégie de branches](./BRANCH_STRATEGY.md)
- [Guide GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Semantic Versioning](https://semver.org/)

---

## 🆘 Problèmes Courants

### "Je n'arrive pas à pusher sur main"

✅ **C'est normal !** La branche est maintenant protégée. Utilisez une Pull Request.

### "Les tests CI ne sont pas requis"

Si vous n'avez pas de tests CI configurés, vous pouvez ignorer cette option pour l'instant. Ajoutez-la plus tard quand vous aurez des workflows GitHub Actions.

### "Je veux quand même pusher sur main en cas d'urgence"

Vous pouvez temporairement désactiver la protection dans Settings → Branches, mais ce n'est PAS recommandé. Utilisez plutôt un hotfix avec PR.

---

**Dernière mise à jour :** 2026-01-01  
**Mainteneur :** Repository Admins
