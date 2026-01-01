# 🚀 Quick Start Guide - Configuration GitHub

**Guide rapide en 3 étapes pour configurer GitHub correctement.**

---

## Étape 1️⃣ : Configuration GitHub (5 minutes)

### A. Définir `develop` comme branche par défaut

1. Va sur https://github.com/groovybronx/portf84/settings/branches
2. Clique sur ⇄ à côté de "Default branch"
3. Sélectionne **`develop`**
4. Confirme

### B. Protéger la branche `main`

1. Sur la même page, clique **Add rule**
2. Branch name pattern : **`main`**
3. Active :
   - ☑ **Require a pull request before merging** (1 approbation)
   - ☑ **Require status checks to pass before merging**
   - ☑ **Require conversation resolution before merging**
4. Sauvegarde

✅ **Résultat** : `main` est maintenant protégée, `develop` est la branche par défaut

---

## Étape 2️⃣ : Nettoyer les Branches (2 minutes)

### Exécute le script de nettoyage

```bash
cd /chemin/vers/portf84
./scripts/cleanup-branches.sh
```

Le script va :
- Lister 14 branches obsolètes à supprimer
- Te demander confirmation
- Supprimer les branches

✅ **Résultat** : Dépôt propre, seulement `main` et `develop` restent (+ branches actives)

---

## Étape 3️⃣ : Créer la Branche Release (2 minutes)

### Exécute le script de release

```bash
cd /chemin/vers/portf84
./scripts/create-release-branch.sh
```

Le script va :
- Suggérer la version **0.2.0-beta.1**
- Créer la branche `release/v0.2.0-beta.1`
- Mettre à jour `package.json`
- Pousser la branche sur GitHub

✅ **Résultat** : Nouvelle branche de release prête pour le développement

---

## ✅ Vérification Finale

### Checklist

- [ ] Sur GitHub, la branche par défaut est `develop`
- [ ] Impossible de pusher directement sur `main` (test : `git push origin main`)
- [ ] Les branches `copilot/*` anciennes sont supprimées
- [ ] La branche `release/v0.2.0-beta.1` existe sur GitHub
- [ ] Le fichier `package.json` a la version `0.2.0-beta.1` dans la branche release

---

## 📚 Documentation Complète

Si tu as besoin de plus de détails :

- **Vue d'ensemble** : [GITHUB_SETUP_SUMMARY.md](./GITHUB_SETUP_SUMMARY.md)
- **Guide détaillé** : [CONFIGURATION_GITHUB_FR.md](./CONFIGURATION_GITHUB_FR.md)
- **Stratégie de branches** : [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)

---

## 🆘 Problèmes ?

### Le script ne fonctionne pas
```bash
chmod +x scripts/*.sh
```

### Erreur de permission GitHub
Vérifie que tu es bien authentifié :
```bash
git config user.name
git config user.email
```

### Besoin d'aide
Consulte [GITHUB_SETUP_SUMMARY.md](./GITHUB_SETUP_SUMMARY.md) section "Support"

---

**Temps total estimé : 10 minutes** ⏱️
