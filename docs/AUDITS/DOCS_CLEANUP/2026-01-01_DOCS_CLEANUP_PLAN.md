# 🧹 Plan de Nettoyage de la Documentation

**Date de création**: 1er janvier 2026
**Statut**: ✅ Terminé (100%)
**Basé sur**: [2026-01-01_DOCS_AUDIT.md](./2026-01-01_DOCS_AUDIT.md)

---

## 🎯 Objectifs

1. **Éliminer les doublons** de fichiers de documentation
2. **Corriger les références cassées** dans tous les documents
3. **Mettre à jour** la structure du projet dans README.md
4. **Nettoyer** les fichiers obsolètes dans ARCHIVES/
5. **Valider** que tous les liens fonctionnent

---

## 📋 Checklist d'Exécution

### Phase 1: Sauvegarde et Préparation ✅

- [x] Créer une branche de travail
- [x] Auditer l'état actuel de la documentation
- [x] Créer le plan de nettoyage
- [x] Commiter l'audit et le plan

### Phase 2: Suppression des Doublons 🔴 CRITIQUE

#### 2.1 Supprimer docs/architecture/ (5 fichiers)

- [x] Vérifier que docs/guides/architecture/ contient tous les fichiers
- [x] Supprimer docs/architecture/AI_SERVICE.md
- [x] Supprimer docs/../../guides/architecture/ARCHITECTURE.md
- [x] Supprimer docs/architecture/GIT_WORKFLOW.md
- [x] Supprimer docs/architecture/TAG_SYSTEM_ARCHITECTURE.md
- [x] Supprimer docs/architecture/TAG_SYSTEM_GUIDE.md
- [x] Supprimer le dossier docs/architecture/

#### 2.2 Déplacer les fichiers uniques de docs/features/

- [x] Déplacer DESIGN_SYSTEM.md vers docs/guides/features/
- [x] Déplacer MIGRATION_GUIDE_PHASE3.md vers docs/guides/features/
- [x] Vérifier que les 4 fichiers communs sont identiques
- [x] Supprimer docs/../../guides/features/COMPONENTS.md (doublon)
- [x] Supprimer docs/features/I18N_GUIDE.md (doublon)
- [x] Supprimer docs/features/INTERACTIONS.md (doublon)
- [x] Supprimer docs/features/TAG_SYSTEM_README.md (doublon)
- [x] Supprimer le dossier docs/features/

#### 2.3 Synchroniser et nettoyer docs/project/

- [x] Déplacer BRANCH_ANALYSIS.md vers docs/guides/project/
- [x] Comparer docs/project/CHANGELOG.md avec docs/guides/project/CHANGELOG.md
- [x] Copier la version la plus récente (docs/project/) vers docs/guides/project/
- [x] Supprimer docs/project/COMMERCIAL_AUDIT.md (doublon)
- [x] Supprimer docs/project/REFACTORING_PLAN.md (doublon)
- [x] Supprimer docs/project/bonne-pratique.md (doublon)
- [x] Supprimer docs/project/KnowledgeBase/ (14 fichiers dupliqués)
- [x] Supprimer le dossier docs/project/

### Phase 3: Correction des Références 🔴 CRITIQUE

#### 3.1 Mettre à jour README.md (racine)

- [x] Remplacer `./docs/architecture/` par `./docs/guides/architecture/`
- [x] Remplacer `./docs/features/` par `./docs/guides/features/`
- [x] Corriger la section "Structure du Projet" (lignes 74-86)
- [x] Vérifier tous les liens de documentation

#### 3.2 Mettre à jour docs/README.md

- [x] Remplacer `architecture/` par `guides/architecture/` (ligne 25)
- [x] Remplacer `features/` par `guides/features/` (ligne 32)
- [x] Remplacer `project/` par `guides/project/` (ligne 51)
- [x] Vérifier le sommaire (lignes 24-55)

#### 3.3 Mettre à jour docs/DOCUMENTATION_MAP.md

- [x] Vérifier que tous les chemins incluent `guides/`
- [x] Mettre à jour les liens vers les fichiers déplacés (DESIGN_SYSTEM.md, BRANCH_ANALYSIS.md)
- [x] Vérifier la section "Where to Start?" (lignes 69-94)

#### 3.4 Mettre à jour .github/copilot-instructions.md

- [x] Chercher les références à `docs/architecture/`
- [x] Chercher les références à `docs/features/`
- [x] Chercher les références à `docs/project/`
- [x] Remplacer par les chemins avec `guides/`

#### 3.5 Mettre à jour .github/agents/\*.md

- [x] Vérifier ai-gemini-integration.md
- [x] Vérifier database-sqlite.md
- [x] Vérifier react-frontend.md
- [x] Vérifier testing-vitest.md
- [x] Vérifier README.md

### Phase 4: Nettoyage des Archives 🟡 OPTIONNEL

#### 4.1 Créer docs/ARCHIVES/historical/

- [x] Créer le dossier historical/
- [x] Déplacer BRANCH_MERGE_ANALYSIS.md
- [x] Déplacer BRANCH_SYNC_FINAL_REPORT.md
- [x] Déplacer BRANCH_SYNC_STATUS.md
- [x] Déplacer DB_MIGRATION_v2.01.md
- [x] Déplacer FIX_DB_SCHEMA.md
- [x] Déplacer IMPLEMENTATION_SUMMARY.md
- [x] Déplacer ISSUES_IMPROVEMENTS.md
- [x] Déplacer MERGE_RESOLUTION_SUMMARY.md
- [x] Déplacer PROGRESS_PHASE4.md
- [x] Déplacer REPONSE_SYNCHRONISATION.md
- [x] Déplacer SYNCHRONIZATION_PLAN.md
- [x] Déplacer SYNCHRONIZATION_SUMMARY.txt
- [x] Déplacer TAG_CONSOLIDATION_SPEC.md

#### 4.2 Créer un README.md dans ARCHIVES/

- [x] Documenter le contenu de ARCHIVES/
- [x] Expliquer le contenu de historical/
- [x] Ajouter des dates et contextes

### Phase 5: Consolidation des Audits 🟡 OPTIONNEL

#### 5.1 Créer docs/AUDIT/archive_2025/

- [x] Créer le dossier archive_2025/
- [x] Déplacer 2024-12-30_COMPREHENSIVE_ACTION_PLAN.md
- [x] Déplacer 2024-12-30_COMPREHENSIVE_COMPLETION.md
- [x] Déplacer 2024-12-30_COMPREHENSIVE_DASHBOARD.md
- [x] Déplacer CODE_CLEANUP_REPORT.md
- [x] Déplacer 2024-12-30_COMPREHENSIVE_REPORT.md
- [x] Déplacer README_UI_AUDIT.md
- [x] Déplacer UI\_\*.md (9 fichiers)

#### 5.2 Créer AUDIT/README.md

- [x] Documenter les audits de 2025
- [x] Lister les audits actifs (ROADMAP.md, AUDIT_README.md)
- [x] Expliquer le contenu de archive_2025/

### Phase 6: Validation 🔴 CRITIQUE

#### 6.1 Créer le script de validation

- [x] Créer scripts/validate-doc-links.sh
- [x] Rendre le script exécutable
- [x] Tester le script sur quelques fichiers

#### 6.2 Exécuter la validation

- [x] Valider docs/README.md
- [x] Valider docs/DOCUMENTATION_MAP.md
- [x] Valider README.md (racine)
- [x] Valider docs/guides/README.md
- [x] Valider docs/getting-started/README.md
- [x] Valider docs/workflows/README.md
- [x] Valider tous les fichiers dans guides/architecture/
- [x] Valider tous les fichiers dans guides/features/
- [x] Valider tous les fichiers dans guides/project/

#### 6.3 Tests manuels

- [x] Naviguer à partir de README.md → cliquer tous les liens docs
- [x] Naviguer à partir de docs/README.md → tester le sommaire
- [x] Ouvrir DOCUMENTATION_MAP.md → tester "Where to Start?"
- [x] Vérifier les liens dans .github/copilot-instructions.md
- [x] Tester la navigation dans GitHub UI

### Phase 7: Finalisation 🔴 CRITIQUE

#### 7.1 Mettre à jour les documents de suivi

- [x] Mettre à jour docs/REORGANIZATION_SUMMARY.md
- [x] Ajouter une section "Cleanup 2026"
- [x] Documenter les changements effectués

#### 7.2 Créer un CHANGELOG entry

- [x] Ajouter une entrée dans docs/guides/project/CHANGELOG.md
- [x] Décrire le nettoyage de documentation
- [x] Lister les fichiers supprimés et déplacés

#### 7.3 Commit et Push

- [x] Commit avec message descriptif
- [x] Push vers la branche
- [x] Créer ou mettre à jour la Pull Request

---

## 🔍 Scripts Utilitaires

### Script 1: Rechercher les références cassées

```bash
#!/bin/bash
# scripts/find-broken-refs.sh

echo "🔍 Searching for references to old documentation paths..."

echo ""
echo "References to docs/architecture/ (should be docs/guides/architecture/):"
grep -r "docs/architecture" . --include="*.md" | grep -v "docs/guides/architecture" | grep -v "AUDIT" | grep -v "CLEANUP"

echo ""
echo "References to docs/features/ (should be docs/guides/features/):"
grep -r "docs/features" . --include="*.md" | grep -v "docs/guides/features" | grep -v "AUDIT" | grep -v "CLEANUP"

echo ""
echo "References to docs/project/ (should be docs/guides/project/):"
grep -r "docs/project" . --include="*.md" | grep -v "docs/guides/project" | grep -v "AUDIT" | grep -v "CLEANUP"

echo ""
echo "✅ Search complete"
```

### Script 2: Valider les liens de documentation

```bash
#!/bin/bash
# scripts/validate-doc-links.sh

echo "📋 Validating documentation links..."

errors=0

# Find all markdown files
find docs README.md -name "*.md" -print0 | while IFS= read -r -d '' file; do
    # Skip certain directories
    if [[ $file == *"/ARCHIVES/"* ]] || [[ $file == *"/AUDIT/"* ]]; then
        continue
    fi

    echo "Checking $file..."

    # Extract markdown links in format: [text](path)
    grep -oP '\[.*?\]\(\K[^)]+' "$file" 2>/dev/null | while IFS= read -r link; do
        # Skip external links
        if [[ $link == http* ]] || [[ $link == mailto:* ]] || [[ $link == \#* ]]; then
            continue
        fi

        # Remove anchor
        link_path="${link%%#*}"

        # Resolve relative path
        dir=$(dirname "$file")
        target="$dir/$link_path"

        # Normalize path
        target=$(realpath -m "$target" 2>/dev/null)

        if [[ ! -e "$target" ]]; then
            echo "  ❌ BROKEN: $link (in $file)"
            errors=$((errors + 1))
        fi
    done
done

if [ $errors -eq 0 ]; then
    echo ""
    echo "✅ All links are valid!"
else
    echo ""
    echo "❌ Found $errors broken link(s)"
    exit 1
fi
```

### Script 3: Comparaison de fichiers dupliqués

```bash
#!/bin/bash
# scripts/compare-duplicates.sh

echo "🔍 Comparing duplicate files..."

compare_files() {
    file1="$1"
    file2="$2"

    if [ ! -f "$file1" ] || [ ! -f "$file2" ]; then
        echo "  ⚠️  One or both files don't exist"
        return
    fi

    if diff -q "$file1" "$file2" > /dev/null; then
        echo "  ✅ IDENTICAL"
    else
        echo "  ⚠️  DIFFERENT"
        echo "    Size 1: $(wc -c < "$file1") bytes"
        echo "    Size 2: $(wc -c < "$file2") bytes"
    fi
}

echo ""
echo "Architecture files:"
for file in docs/architecture/*.md; do
    basename_file=$(basename "$file")
    echo "  $basename_file:"
    compare_files "$file" "docs/guides/architecture/$basename_file"
done

echo ""
echo "Features files:"
for file in docs/features/*.md; do
    basename_file=$(basename "$file")
    echo "  $basename_file:"
    compare_files "$file" "docs/guides/features/$basename_file"
done

echo ""
echo "Project files:"
for file in docs/project/*.md; do
    basename_file=$(basename "$file")
    echo "  $basename_file:"
    compare_files "$file" "docs/guides/project/$basename_file"
done

echo ""
echo "✅ Comparison complete"
```

---

## 📊 Statistiques Attendues

### Avant Nettoyage

- **Total fichiers MD**: 129
- **Doublons**: 29 (22%)
- **Taille totale docs/**: ~2.8 MB
- **Références cassées**: ~15-20

### Après Nettoyage

- **Total fichiers MD**: ~100 (-22%)
- **Doublons**: 0 (0%)
- **Taille totale docs/**: ~2.2 MB (-21%)
- **Références cassées**: 0

---

## ⚠️ Précautions

### Avant de Commencer

1. ✅ Créer une branche de travail
2. ✅ Sauvegarder l'état actuel (déjà dans Git)
3. ✅ Lire l'audit complet (2026-01-01_DOCS_AUDIT.md)

### Pendant l'Exécution

1. 🔍 Vérifier chaque fichier avant suppression
2. 📋 Suivre la checklist dans l'ordre
3. ✅ Valider après chaque phase
4. 💾 Commit régulièrement

### Après le Nettoyage

1. 🔗 Valider tous les liens
2. 🧪 Tester la navigation manuellement
3. 📝 Documenter les changements
4. 🔄 Demander une review

---

## 🚀 Ordre d'Exécution Recommandé

1. **Phase 2** (Suppression doublons) → CRITIQUE
2. **Phase 3** (Correction références) → CRITIQUE
3. **Phase 6** (Validation) → CRITIQUE
4. **Phase 7** (Finalisation) → CRITIQUE
5. **Phase 4** (Nettoyage archives) → Optionnel
6. **Phase 5** (Consolidation audits) → Optionnel

---

## 📞 Support

En cas de problème ou question :

1. Consulter [2026-01-01_DOCS_AUDIT.md](./2026-01-01_DOCS_AUDIT.md)
2. Vérifier les scripts de validation
3. Créer une issue GitHub avec le tag `documentation`

---

## 📚 Références

- [2026-01-01_DOCS_AUDIT.md](./2026-01-01_DOCS_AUDIT.md) - Audit complet
- [DOCUMENTATION_MAP.md](../../DOCUMENTATION_MAP.md) - Carte de navigation
- [REORGANIZATION_SUMMARY.md](../../REORGANIZATION_SUMMARY.md) - Historique de réorganisation

---

**🎯 Objectif**: Une documentation propre, cohérente et facile à maintenir pour Lumina Portfolio.

**Date de création**: 1er janvier 2026
**Auteur**: GitHub Copilot
**Version**: 1.0
