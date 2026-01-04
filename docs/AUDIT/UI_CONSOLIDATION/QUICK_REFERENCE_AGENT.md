# Guide de Référence Rapide - Agent GitHub Copilot

**Date**: 4 janvier 2026  
**Objectif**: Complétion rapide du refactoring UI/UX

---

## ⚡ Démarrage Rapide

### 1. Vérifier l'état actuel
\`\`\`bash
cd /home/runner/work/portf84/portf84

# Buttons restants
grep -r "<button" src --include="*.tsx" | wc -l
# Attendu: 2

# Fichiers glass
grep -r "bg-glass-bg\|backdrop-blur" src --include="*.tsx" -l | wc -l
# Attendu: ~30 fichiers

# Layouts migrés
# À compter manuellement (actuellement 0)
\`\`\`

### 2. Commencer Phase 3.1 (15 min)

**Fichier**: `src/features/navigation/components/topbar/SearchField.tsx`  
**Ligne**: 81-86

**Remplacer**:
\`\`\`tsx
<button onClick={(e) => { e.stopPropagation(); onTagToggle?.(tag); }} className="ml-1 hover:text-white">
  <X size={10} />
</button>
\`\`\`

**Par**:
\`\`\`tsx
<Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onTagToggle?.(tag); }} aria-label="Remove tag filter">
  <X size={10} />
</Button>
\`\`\`

**Ajouter import**:
\`\`\`tsx
import { Button } from "@/shared/components/ui";
\`\`\`

**Valider**:
\`\`\`bash
npm run build
npm run test
grep -r "<button" src --include="*.tsx" | wc -l  # Doit afficher: 1
\`\`\`

---

## 📋 Checklist Phase 3

### Jour 1 (Lundi)
- [ ] ✅ Migrer dernier button (15 min)
- [ ] ✅ Audit GlassCard (2h)
- [ ] ✅ Migration GlassCard (3h)

### Jour 2 (Mardi)
- [ ] 🔄 Scanner patterns layouts (2h)
- [ ] 🔄 Documenter patterns (2h)
- [ ] 🔄 Guide migration layouts (3h)

### Jour 3 (Mercredi)
- [ ] 🔄 Migrer SearchField.tsx (1.5h)
- [ ] 🔄 Migrer TopBar.tsx (1.5h)
- [ ] 🔄 Migrer ViewToggle + SortControls + BatchActions (3h)

### Jour 4 (Jeudi)
- [ ] 🔄 Migrer Collections (4 fichiers, 4h)
- [ ] 🔄 Migrer Tags (4 fichiers, 3h)

### Jour 5 (Vendredi)
- [ ] ✅ Tests complets (3h)
- [ ] ✅ Documentation (2h)
- [ ] ✅ Rapport Phase 3 (1h)

---

## 🎯 Commandes Essentielles

### Analyse
\`\`\`bash
# Buttons HTML
grep -r "<button" src --include="*.tsx" | wc -l

# Fichiers avec buttons
grep -r "<button" src --include="*.tsx" -l

# Glass styles
grep -r "bg-glass-bg\|backdrop-blur" src --include="*.tsx" -l

# Patterns flex
grep -r "flex items-center gap-" src --include="*.tsx" -l
grep -r "flex flex-col gap-" src --include="*.tsx" -l

# Patterns grid
grep -r "grid grid-cols-" src --include="*.tsx" -l
\`\`\`

### Validation
\`\`\`bash
# Build
npm run build

# Tests
npm run test

# TypeScript
npx tsc --noEmit

# Dev mode
npm run tauri:dev
\`\`\`

### Git
\`\`\`bash
# Status
git status

# Commit
git add .
git commit -m "feat(ui): migrate SearchField to Button component"

# Push
git push
\`\`\`

---

## 🔧 Patterns de Migration

### Pattern 1: Button
\`\`\`tsx
// ❌ AVANT
<button className="...">...</button>

// ✅ APRÈS
<Button variant="..." size="...">...</Button>
\`\`\`

### Pattern 2: GlassCard
\`\`\`tsx
// ❌ AVANT
<div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl p-4">
  {content}
</div>

// ✅ APRÈS
<GlassCard variant="card" padding="md">
  {content}
</GlassCard>
\`\`\`

### Pattern 3: Flex
\`\`\`tsx
// ❌ AVANT
<div className="flex items-center gap-2">
  {children}
</div>

// ✅ APRÈS
<Flex align="center" gap="sm">
  {children}
</Flex>
\`\`\`

### Pattern 4: Stack
\`\`\`tsx
// ❌ AVANT
<div className="flex flex-col gap-4">
  {children}
</div>

// ✅ APRÈS
<Stack spacing="md">
  {children}
</Stack>
\`\`\`

### Pattern 5: Grid
\`\`\`tsx
// ❌ AVANT
<div className="grid grid-cols-3 gap-4">
  {children}
</div>

// ✅ APRÈS
<Grid cols={3} gap="md">
  {children}
</Grid>
\`\`\`

---

## 📊 Métriques Cibles

| Métrique | Initial | Actuel | Objectif | Commande Validation |
|----------|---------|--------|----------|---------------------|
| Buttons | 93 | 2 | 1 | `grep -r "<button" src \| wc -l` |
| Glass | 51 | ~30 | <15 | Audit manuel |
| Layouts | 0 | 0 | 10+ | Liste migrations |
| Build | - | ✅ | ✅ | `npm run build` |
| Tests | 149 | 149 | 100% | `npm run test` |

---

## 🚨 En Cas de Problème

### Build Échoue
1. Lire l'erreur TypeScript
2. Vérifier les imports
3. Corriger les types
4. `npm run build` à nouveau

### Tests Échouent
1. Identifier le test cassé
2. Vérifier l'assertion
3. Mettre à jour si nécessaire
4. `npm run test` à nouveau

### Régression Visuelle
1. Screenshot avant/après
2. Vérifier les classes CSS
3. Tester responsive
4. Corriger si nécessaire

### Rollback
\`\`\`bash
# Annuler dernier commit
git reset --hard HEAD~1

# Ou revert commit spécifique
git revert <commit-hash>
\`\`\`

---

## 📁 Fichiers Prioritaires Phase 3

### Navigation (Jour 3)
1. `src/features/navigation/components/topbar/SearchField.tsx`
2. `src/features/navigation/components/topbar/TopBar.tsx`
3. `src/features/library/components/topbar/ViewToggle.tsx`
4. `src/features/library/components/topbar/SortControls.tsx`
5. `src/features/library/components/batch/BatchActions.tsx`

### Collections (Jour 4 - Matin)
6. `src/features/collections/components/FolderDrawer/index.tsx`
7. `src/features/collections/components/FolderDrawer/FolderDrawerHeader.tsx`
8. `src/features/collections/components/FolderDrawer/FolderItem.tsx`
9. `src/features/collections/components/CollectionManager.tsx`

### Tags (Jour 4 - Après-midi)
10. `src/features/tags/components/TagHub/BrowseTab.tsx`
11. `src/features/tags/components/TagHub/ManageTab.tsx`
12. `src/features/tags/components/TagManager.tsx`
13. `src/features/tags/components/BatchTagPanel/index.tsx`

---

## ✅ Validation Finale

### Avant de terminer Phase 3
\`\`\`bash
# 1. Vérifier buttons
test $(grep -r "<button" src --include="*.tsx" | wc -l) -eq 1
echo "✅ Buttons OK"

# 2. Build
npm run build
echo "✅ Build OK"

# 3. Tests
npm run test
echo "✅ Tests OK"

# 4. TypeScript
npx tsc --noEmit
echo "✅ TypeScript OK"

# 5. Bundle size
# Vérifier output build < 250KB gzipped
echo "✅ Bundle Size OK"
\`\`\`

### Checklist Finale
- [ ] 1 seul `<button>` HTML
- [ ] <15 fichiers glass features
- [ ] 10+ fichiers layouts migrés
- [ ] Build succès
- [ ] Tests 100% passent
- [ ] Aucune régression visuelle
- [ ] Documentation à jour

---

## 📚 Documentation Utile

**Plan Complet**: `docs/AUDIT/UI_CONSOLIDATION/2026-01-04_PLAN_COMPLETION_AGENT.md`

**Design System**: `docs/guides/features/DESIGN_SYSTEM.md`

**Guide Migration**: `docs/guides/features/MIGRATION_GUIDE_PHASE3.md`

**Composants**: `docs/guides/features/COMPONENTS.md`

---

## 💡 Bonnes Pratiques

### Code
- TypeScript strict (pas de `any`)
- Tabs pour indentation
- Double quotes pour strings
- Semicolons en fin de ligne

### Commits
- Messages descriptifs
- Commits atomiques
- Push réguliers

### Tests
- Tester après chaque changement
- Tests visuels + fonctionnels
- Vérifier responsive

### Documentation
- Documenter décisions importantes
- Ajouter exemples d'usage
- Screenshots si changement visuel

---

## 🎯 Objectif Final

**Phase 3 Complète = Production Ready à 100%**

Temps estimé: **3-4 jours**  
Date cible: **Vendredi 10 janvier 2026**

---

**Bon courage! 💪**
