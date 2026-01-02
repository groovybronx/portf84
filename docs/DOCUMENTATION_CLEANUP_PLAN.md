# 🧹 Plan de Nettoyage de la Documentation

**Date de création**: 1er janvier 2026  
**Statut**: 📋 Plan Prêt à Exécuter  
**Basé sur**: [DOCUMENTATION_AUDIT_2026.md](./DOCUMENTATION_AUDIT_2026.md)

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
- [ ] Commiter l'audit et le plan

### Phase 2: Suppression des Doublons 🔴 CRITIQUE

#### 2.1 Supprimer docs/architecture/ (5 fichiers)
- [ ] Vérifier que docs/guides/architecture/ contient tous les fichiers
- [ ] Supprimer docs/architecture/AI_SERVICE.md
- [ ] Supprimer docs/architecture/ARCHITECTURE.md
- [ ] Supprimer docs/architecture/GIT_WORKFLOW.md
- [ ] Supprimer docs/architecture/TAG_SYSTEM_ARCHITECTURE.md
- [ ] Supprimer docs/architecture/TAG_SYSTEM_GUIDE.md
- [ ] Supprimer le dossier docs/architecture/

#### 2.2 Déplacer les fichiers uniques de docs/features/
- [ ] Déplacer DESIGN_SYSTEM.md vers docs/guides/features/
- [ ] Déplacer MIGRATION_GUIDE_PHASE3.md vers docs/guides/features/
- [ ] Vérifier que les 4 fichiers communs sont identiques
- [ ] Supprimer docs/features/COMPONENTS.md (doublon)
- [ ] Supprimer docs/features/I18N_GUIDE.md (doublon)
- [ ] Supprimer docs/features/INTERACTIONS.md (doublon)
- [ ] Supprimer docs/features/TAG_SYSTEM_README.md (doublon)
- [ ] Supprimer le dossier docs/features/

#### 2.3 Synchroniser et nettoyer docs/project/
- [ ] Déplacer BRANCH_ANALYSIS.md vers docs/guides/project/
- [ ] Comparer docs/project/CHANGELOG.md avec docs/guides/project/CHANGELOG.md
- [ ] Copier la version la plus récente (docs/project/) vers docs/guides/project/
- [ ] Supprimer docs/project/COMMERCIAL_AUDIT.md (doublon)
- [ ] Supprimer docs/project/REFACTORING_PLAN.md (doublon)
- [ ] Supprimer docs/project/bonne-pratique.md (doublon)
- [ ] Supprimer docs/project/KnowledgeBase/ (14 fichiers dupliqués)
- [ ] Supprimer le dossier docs/project/

### Phase 3: Correction des Références 🔴 CRITIQUE

#### 3.1 Mettre à jour README.md (racine)
- [ ] Remplacer `./docs/architecture/` par `./docs/guides/architecture/`
- [ ] Remplacer `./docs/features/` par `./docs/guides/features/`
- [ ] Corriger la section "Structure du Projet" (lignes 74-86)
- [ ] Vérifier tous les liens de documentation

#### 3.2 Mettre à jour docs/README.md
- [ ] Remplacer `architecture/` par `guides/architecture/` (ligne 25)
- [ ] Remplacer `features/` par `guides/features/` (ligne 32)
- [ ] Remplacer `project/` par `guides/project/` (ligne 51)
- [ ] Vérifier le sommaire (lignes 24-55)

#### 3.3 Mettre à jour docs/DOCUMENTATION_MAP.md
- [ ] Vérifier que tous les chemins incluent `guides/`
- [ ] Mettre à jour les liens vers les fichiers déplacés (DESIGN_SYSTEM.md, BRANCH_ANALYSIS.md)
- [ ] Vérifier la section "Where to Start?" (lignes 69-94)

#### 3.4 Mettre à jour .github/copilot-instructions.md
- [ ] Chercher les références à `docs/architecture/`
- [ ] Chercher les références à `docs/features/`
- [ ] Chercher les références à `docs/project/`
- [ ] Remplacer par les chemins avec `guides/`

#### 3.5 Mettre à jour .github/agents/*.md
- [ ] Vérifier ai-gemini-integration.md
- [ ] Vérifier database-sqlite.md
- [ ] Vérifier react-frontend.md
- [ ] Vérifier testing-vitest.md
- [ ] Vérifier README.md

### Phase 4: Nettoyage des Archives 🟡 OPTIONNEL

#### 4.1 Créer docs/ARCHIVES/historical/
- [ ] Créer le dossier historical/
- [ ] Déplacer BRANCH_MERGE_ANALYSIS.md
- [ ] Déplacer BRANCH_SYNC_FINAL_REPORT.md
- [ ] Déplacer BRANCH_SYNC_STATUS.md
- [ ] Déplacer DB_MIGRATION_v2.01.md
- [ ] Déplacer FIX_DB_SCHEMA.md
- [ ] Déplacer IMPLEMENTATION_SUMMARY.md
- [ ] Déplacer ISSUES_IMPROVEMENTS.md
- [ ] Déplacer MERGE_RESOLUTION_SUMMARY.md
- [ ] Déplacer PROGRESS_PHASE4.md
- [ ] Déplacer REPONSE_SYNCHRONISATION.md
- [ ] Déplacer SYNCHRONIZATION_PLAN.md
- [ ] Déplacer SYNCHRONIZATION_SUMMARY.txt
- [ ] Déplacer TAG_CONSOLIDATION_SPEC.md

#### 4.2 Créer un README.md dans ARCHIVES/
- [ ] Documenter le contenu de ARCHIVES/
- [ ] Expliquer le contenu de historical/
- [ ] Ajouter des dates et contextes

### Phase 5: Consolidation des Audits 🟡 OPTIONNEL

#### 5.1 Créer docs/AUDIT/archive_2025/
- [ ] Créer le dossier archive_2025/
- [ ] Déplacer AUDIT_ACTION_PLAN.md
- [ ] Déplacer AUDIT_COMPLETION_NOTICE.md
- [ ] Déplacer AUDIT_DASHBOARD.md
- [ ] Déplacer CODE_CLEANUP_REPORT.md
- [ ] Déplacer COMPREHENSIVE_AUDIT_REPORT.md
- [ ] Déplacer README_UI_AUDIT.md
- [ ] Déplacer UI_*.md (9 fichiers)

#### 5.2 Créer AUDIT/README.md
- [ ] Documenter les audits de 2025
- [ ] Lister les audits actifs (ROADMAP.md, AUDIT_README.md)
- [ ] Expliquer le contenu de archive_2025/

### Phase 6: Validation 🔴 CRITIQUE

#### 6.1 Créer le script de validation
- [ ] Créer scripts/validate-doc-links.sh
- [ ] Rendre le script exécutable
- [ ] Tester le script sur quelques fichiers

#### 6.2 Exécuter la validation
- [ ] Valider docs/README.md
- [ ] Valider docs/DOCUMENTATION_MAP.md
- [ ] Valider README.md (racine)
- [ ] Valider docs/guides/README.md
- [ ] Valider docs/getting-started/README.md
- [ ] Valider docs/workflows/README.md
- [ ] Valider tous les fichiers dans guides/architecture/
- [ ] Valider tous les fichiers dans guides/features/
- [ ] Valider tous les fichiers dans guides/project/

#### 6.3 Tests manuels
- [ ] Naviguer à partir de README.md → cliquer tous les liens docs
- [ ] Naviguer à partir de docs/README.md → tester le sommaire
- [ ] Ouvrir DOCUMENTATION_MAP.md → tester "Where to Start?"
- [ ] Vérifier les liens dans .github/copilot-instructions.md
- [ ] Tester la navigation dans GitHub UI

### Phase 7: Finalisation 🔴 CRITIQUE

#### 7.1 Mettre à jour les documents de suivi
- [ ] Mettre à jour docs/REORGANIZATION_SUMMARY.md
- [ ] Ajouter une section "Cleanup 2026"
- [ ] Documenter les changements effectués

#### 7.2 Créer un CHANGELOG entry
- [ ] Ajouter une entrée dans docs/guides/project/CHANGELOG.md
- [ ] Décrire le nettoyage de documentation
- [ ] Lister les fichiers supprimés et déplacés

#### 7.3 Commit et Push
- [ ] Commit avec message descriptif
- [ ] Push vers la branche
- [ ] Créer ou mettre à jour la Pull Request

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
    
    # Extract markdown links [text](path)
    grep -oP '\[.*?\]\(\K[^)]+' "$file" 2>/dev/null | while read -r link; do
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
3. ✅ Lire l'audit complet (DOCUMENTATION_AUDIT_2026.md)

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
1. Consulter [DOCUMENTATION_AUDIT_2026.md](./DOCUMENTATION_AUDIT_2026.md)
2. Vérifier les scripts de validation
3. Créer une issue GitHub avec le tag `documentation`

---

## 📚 Références

- [DOCUMENTATION_AUDIT_2026.md](./DOCUMENTATION_AUDIT_2026.md) - Audit complet
- [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) - Carte de navigation
- [REORGANIZATION_SUMMARY.md](./REORGANIZATION_SUMMARY.md) - Historique de réorganisation

---

**🎯 Objectif**: Une documentation propre, cohérente et facile à maintenir pour Lumina Portfolio.

**Date de création**: 1er janvier 2026  
**Auteur**: GitHub Copilot  
**Version**: 1.0
