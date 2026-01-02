# 🗺️ Guide de Migration de la Documentation

**Pour les contributeurs du projet Lumina Portfolio**

**Date**: 1er janvier 2026  
**Statut**: 📢 Actif

---

## 🎯 Pourquoi ce Guide ?

La documentation de Lumina Portfolio a été **nettoyée et réorganisée** pour :
- ✅ Éliminer les doublons (29 fichiers dupliqués)
- ✅ Corriger les références cassées
- ✅ Simplifier la navigation
- ✅ Améliorer la maintenabilité

Ce guide vous aide à **mettre à jour vos signets et références** vers la nouvelle structure.

---

## 📋 Changements Principaux

### ❌ Anciens Chemins (SUPPRIMÉS)

```
docs/
├── architecture/          ❌ SUPPRIMÉ
├── features/              ❌ SUPPRIMÉ
└── project/               ❌ SUPPRIMÉ
```

### ✅ Nouveaux Chemins (À UTILISER)

```
docs/
├── guides/
│   ├── architecture/      ✅ UTILISER
│   ├── features/          ✅ UTILISER
│   └── project/           ✅ UTILISER
├── getting-started/       ✅ UTILISER
└── workflows/             ✅ UTILISER
```

---

## 🔄 Table de Correspondance

### Documentation Architecture

| Ancien Chemin | Nouveau Chemin | Statut |
|---------------|----------------|--------|
| `docs/architecture/ARCHITECTURE.md` | `docs/guides/architecture/ARCHITECTURE.md` | ✅ Déplacé |
| `docs/architecture/AI_SERVICE.md` | `docs/guides/architecture/AI_SERVICE.md` | ✅ Déplacé |
| `docs/architecture/GIT_WORKFLOW.md` | `docs/guides/architecture/GIT_WORKFLOW.md` | ✅ Déplacé |
| `docs/architecture/TAG_SYSTEM_ARCHITECTURE.md` | `docs/guides/architecture/TAG_SYSTEM_ARCHITECTURE.md` | ✅ Déplacé |
| `docs/architecture/TAG_SYSTEM_GUIDE.md` | `docs/guides/architecture/TAG_SYSTEM_GUIDE.md` | ✅ Déplacé |

### Documentation Features

| Ancien Chemin | Nouveau Chemin | Statut |
|---------------|----------------|--------|
| `docs/features/COMPONENTS.md` | `docs/guides/features/COMPONENTS.md` | ✅ Déplacé |
| `docs/features/I18N_GUIDE.md` | `docs/guides/features/I18N_GUIDE.md` | ✅ Déplacé |
| `docs/features/INTERACTIONS.md` | `docs/guides/features/INTERACTIONS.md` | ✅ Déplacé |
| `docs/features/TAG_SYSTEM_README.md` | `docs/guides/features/TAG_SYSTEM_README.md` | ✅ Déplacé |
| `docs/features/DESIGN_SYSTEM.md` | `docs/guides/features/DESIGN_SYSTEM.md` | ✅ Déplacé |
| `docs/features/MIGRATION_GUIDE_PHASE3.md` | `docs/guides/features/MIGRATION_GUIDE_PHASE3.md` | ✅ Déplacé |

### Documentation Project

| Ancien Chemin | Nouveau Chemin | Statut |
|---------------|----------------|--------|
| `docs/project/CHANGELOG.md` | `docs/guides/project/CHANGELOG.md` | ✅ Synchronisé |
| `docs/project/COMMERCIAL_AUDIT.md` | `docs/guides/project/COMMERCIAL_AUDIT.md` | ✅ Déplacé |
| `docs/project/REFACTORING_PLAN.md` | `docs/guides/project/REFACTORING_PLAN.md` | ✅ Déplacé |
| `docs/project/bonne-pratique.md` | `docs/guides/project/bonne-pratique.md` | ✅ Déplacé |
| `docs/project/BRANCH_ANALYSIS.md` | `docs/guides/project/BRANCH_ANALYSIS.md` | ✅ Déplacé |
| `docs/project/KnowledgeBase/*` | `docs/guides/project/KnowledgeBase/*` | ✅ Déplacé (14 fichiers) |

### Documentation Workflows

| Ancien Chemin | Nouveau Chemin | Statut |
|---------------|----------------|--------|
| `docs/BRANCH_STRATEGY.md` | `docs/workflows/BRANCH_STRATEGY.md` | ✅ Déjà en place |
| `docs/CONFIGURATION_GITHUB_FR.md` | `docs/workflows/CONFIGURATION_GITHUB_FR.md` | ✅ Déjà en place |
| `docs/CREATE_RELEASE_BRANCH_INSTRUCTIONS.md` | `docs/workflows/CREATE_RELEASE_BRANCH_INSTRUCTIONS.md` | ✅ Déjà en place |
| `docs/GITHUB_SETUP_SUMMARY.md` | `docs/workflows/GITHUB_SETUP_SUMMARY.md` | ✅ Déjà en place |

### Getting Started

| Ancien Chemin | Nouveau Chemin | Statut |
|---------------|----------------|--------|
| `docs/QUICK_START.md` | `docs/getting-started/QUICK_START.md` | ✅ Déjà en place |

---

## 🔗 Mettre à Jour Vos Liens

### Si vous avez des bookmarks

**Remplacez**:
```
https://github.com/groovybronx/portf84/blob/main/docs/architecture/ARCHITECTURE.md
```

**Par**:
```
https://github.com/groovybronx/portf84/blob/main/docs/guides/architecture/ARCHITECTURE.md
```

### Si vous avez des liens dans des documents

**Rechercher et remplacer** :
```bash
# Dans vos documents locaux
find . -name "*.md" -exec sed -i 's|docs/architecture/|docs/guides/architecture/|g' {} +
find . -name "*.md" -exec sed -i 's|docs/features/|docs/guides/features/|g' {} +
find . -name "*.md" -exec sed -i 's|docs/project/|docs/guides/project/|g' {} +
```

### Si vous avez des scripts

**Exemple** - Mettre à jour un script bash :
```bash
# Avant
DOC_PATH="docs/architecture/ARCHITECTURE.md"

# Après
DOC_PATH="docs/guides/architecture/ARCHITECTURE.md"
```

---

## 📚 Navigation Rapide

### Points d'Entrée Principaux

1. **[README.md](../README.md)** - Page d'accueil du projet
2. **[docs/README.md](./README.md)** - Hub de documentation
3. **[docs/DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md)** - Carte complète

### Par Section

- **Getting Started**: [docs/getting-started/README.md](./getting-started/README.md)
- **Technical Guides**: [docs/guides/README.md](./guides/README.md)
- **Workflows**: [docs/workflows/README.md](./workflows/README.md)

### Par Type de Documentation

- **Architecture**: [docs/guides/architecture/](./guides/architecture/)
- **Features**: [docs/guides/features/](./guides/features/)
- **Project Management**: [docs/guides/project/](./guides/project/)
- **Knowledge Base**: [docs/guides/project/KnowledgeBase/](./guides/project/KnowledgeBase/)

---

## ❓ FAQ

### Q: Pourquoi les anciens fichiers ont-ils été supprimés ?

**R**: Ils étaient des **doublons complets** (copies identiques) des fichiers dans `docs/guides/`. Garder les deux versions créait :
- De la confusion sur quelle version utiliser
- Des risques de mise à jour partielle
- Des difficultés de maintenance

### Q: Mes anciens liens fonctionnent-ils encore ?

**R**: Non, les anciens chemins (`docs/architecture/`, `docs/features/`, `docs/project/`) ont été supprimés. Vous devez mettre à jour vos liens vers `docs/guides/`.

### Q: Comment trouver un document rapidement ?

**R**: Utilisez [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) qui contient :
- Une carte visuelle de toute la documentation
- Des tableaux de navigation par rôle
- Des liens rapides par sujet

### Q: Y a-t-il des fichiers qui ont changé de nom ?

**R**: Non, seuls les **chemins** ont changé. Les noms de fichiers sont identiques.

### Q: Comment contribuer à la documentation maintenant ?

**R**: 
1. Utiliser uniquement les chemins dans `docs/guides/`
2. Consulter le [Developer Guide](./guides/project/KnowledgeBase/07_Developer_Guide.md)
3. Vérifier les liens avec le script de validation (voir ci-dessous)

### Q: Que faire si je trouve un lien cassé ?

**R**: 
1. Créer une issue sur GitHub avec le label `documentation`
2. Indiquer le fichier et le lien cassé
3. (Optionnel) Proposer une Pull Request avec la correction

---

## 🛠️ Outils pour les Contributeurs

### Script de Validation de Liens

```bash
# Valider tous les liens dans la documentation
./scripts/validate-doc-links.sh

# Si vous n'avez pas le script, le créer :
cat > scripts/validate-doc-links.sh << 'EOF'
#!/bin/bash
echo "Validating documentation links..."
find docs README.md -name "*.md" -print0 | while IFS= read -r -d '' file; do
    [[ $file == *"/ARCHIVES/"* ]] || [[ $file == *"/AUDIT/"* ]] && continue
    echo "Checking $file..."
    grep -oP '\[.*?\]\(\K[^)]+' "$file" 2>/dev/null | while read -r link; do
        [[ $link == http* ]] || [[ $link == mailto:* ]] || [[ $link == \#* ]] && continue
        link_path="${link%%#*}"
        dir=$(dirname "$file")
        target="$dir/$link_path"
        target=$(realpath -m "$target" 2>/dev/null)
        if [[ ! -e "$target" ]]; then
            echo "  ❌ BROKEN: $link"
        fi
    done
done
echo "✅ Validation complete"
EOF
chmod +x scripts/validate-doc-links.sh
```

### Recherche de Références Obsolètes

```bash
# Chercher des références aux anciens chemins
grep -r "docs/architecture" . --include="*.md" | grep -v "docs/guides/architecture"
grep -r "docs/features" . --include="*.md" | grep -v "docs/guides/features"
grep -r "docs/project" . --include="*.md" | grep -v "docs/guides/project"
```

---

## 📅 Calendrier de Transition

### ✅ Phase 1 : Nettoyage (1er janvier 2026)
- Suppression des doublons
- Correction des références
- Validation des liens

### 📢 Phase 2 : Communication (1-7 janvier 2026)
- Annonce aux contributeurs
- Mise à jour des signets
- Support aux questions

### 🔒 Phase 3 : Finalisation (7-14 janvier 2026)
- Monitoring des liens cassés
- Corrections finales
- Documentation stabilisée

---

## 🎓 Bonnes Pratiques

### Pour les Nouveaux Contributeurs

1. **Toujours partir de** [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md)
2. **Utiliser les hubs de navigation** :
   - [getting-started/README.md](./getting-started/README.md)
   - [guides/README.md](./guides/README.md)
   - [workflows/README.md](./workflows/README.md)
3. **Vérifier les liens** avant de commiter

### Pour les Contributeurs Existants

1. **Mettre à jour vos bookmarks** locaux
2. **Réviser vos PRs en cours** pour les liens cassés
3. **Informer votre équipe** des nouveaux chemins

### Pour les Mainteneurs

1. **Valider les liens** dans chaque PR de documentation
2. **Utiliser le script de validation** dans CI/CD
3. **Monitorer les issues** avec le tag `documentation`

---

## 📞 Besoin d'Aide ?

### Documentation de Référence
- [2026-01-01_DOCS_AUDIT.md](./2026-01-01_DOCS_AUDIT.md) - Audit complet
- [2026-01-01_DOCS_CLEANUP_PLAN.md](./2026-01-01_DOCS_CLEANUP_PLAN.md) - Plan de nettoyage
- [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) - Carte de navigation

### Support
- **Issues GitHub**: [github.com/groovybronx/portf84/issues](https://github.com/groovybronx/portf84/issues)
- **Label**: `documentation`
- **Discussion**: Dans les PR de documentation

---

## ✨ Avantages de la Nouvelle Structure

### Pour Vous
- ✅ **Navigation plus claire** avec les hubs de section
- ✅ **Moins de confusion** (plus de doublons)
- ✅ **Liens fiables** (validation automatique)
- ✅ **Documentation à jour** (cohérente avec le code)

### Pour le Projet
- ✅ **Maintenance simplifiée**
- ✅ **Moins d'erreurs de documentation**
- ✅ **Meilleure expérience contributeur**
- ✅ **Base de connaissances solide**

---

**🚀 Bienvenue dans la nouvelle structure de documentation de Lumina Portfolio !**

---

**Date**: 1er janvier 2026  
**Auteur**: GitHub Copilot  
**Version**: 1.0  
**Projet**: Lumina Portfolio v0.2.0-beta.1
