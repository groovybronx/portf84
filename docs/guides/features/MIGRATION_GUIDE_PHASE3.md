# Phase 3 Migration Guide - Progressive Migration

**Status**: Phase 1 & 2 Complete | Phase 3 Ready to Execute  
**Scope**: ~100 files to migrate  
**Estimated Time**: 3-5 days  

---

## Migration Patterns

### Pattern 1: Button Migration

**Before** (Raw HTML):
```tsx
<button
  onClick={handleClick}
  className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80"
>
  Save
</button>
```

**After** (Standardized):
```tsx
import { Button } from "@/shared/components/ui/Button";

<Button variant="primary" onClick={handleClick}>
  Save
</Button>
```

---

### Pattern 2: Glass Surface Migration

**Before** (Inline styles):
```tsx
<div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl p-4">
  {content}
</div>
```

**After** (GlassCard):
```tsx
import { GlassCard } from "@/shared/components/ui/GlassCard";

<GlassCard variant="card" padding="md">
  {content}
</GlassCard>
```

---

### Pattern 3: Layout Migration

**Before** (Manual flexbox):
```tsx
<div className="flex items-center justify-between gap-4">
  {items}
</div>
```

**After** (Flex component):
```tsx
import { Flex } from "@/shared/components/ui/layout/Flex";

<Flex justify="between" align="center" gap="md">
  {items}
</Flex>
```

---

## Migration Checklist

### Phase 3.1: Button Migration (~60 files)

#### Navigation Features (20 buttons)
- [ ] [SearchField.tsx](../../../src/features/navigation/components/topbar/SearchField.tsx) - 2 buttons
- [ ] [TopBar.tsx](../../../src/features/navigation/components/TopBar.tsx) - 8 buttons
- [ ] [ViewToggle.tsx](../../../src/features/navigation/components/topbar/ViewToggle.tsx) - 3 buttons
- [ ] [SortControls.tsx](../../../src/features/navigation/components/topbar/SortControls.tsx) - 4 buttons
- [ ] [BatchActions.tsx](../../../src/features/navigation/components/topbar/BatchActions.tsx) - 3 buttons

#### Collections Features (15 buttons)
- [ ] FolderDrawer sub-components (7 files) - ~10 buttons
- [ ] CollectionManager.tsx - ~5 buttons

#### Tags Features (10 buttons)
- [ ] TagManager sub-components - ~7 buttons
- [ ] TagManagerModal.tsx - ~3 buttons

#### Other Features (15 buttons)
- [ ] Library components - ~8 buttons
- [ ] Vision components - ~7 buttons

---

### Phase 3.2: GlassCard Migration (~40 files)

**Priority Targets**:
1. TopBar & Navigation (~8 files)
2. FolderDrawer components (~7 files)
3. TagManager components (~5 files)
4. Library components (~12 files)
5. Modal/Overlay components (~8 files)

---

### Phase 3.3: Layout Refactoring (~30 files)

**Common Patterns to Replace**:
- `flex items-center gap-2` → `<Flex align="center" gap="sm">`
- `flex flex-col gap-4` → `<Stack spacing="md">`
- `grid grid-cols-3 gap-4` → `<Grid cols={3} gap="md">`

---

## Automated Migration Script (Optional)

Pour accélérer la migration, vous pouvez créer un script qui fait des remplacements pattern-based:

```bash
#!/bin/bash
# migrate-buttons.sh

# Find all .tsx files with raw <button> elements
find src/features -name "*.tsx" -type f -exec grep -l "<button" {} \;

# Example replacement (nécessite validation manuelle après)
# sed -i '' 's/<button className=".*hover:.*"/<Button variant="ghost"/g' file.tsx
```

**⚠️ Avertissement** : La migration automatique nécessite une validation rigoureuse pour chaque fichier.

---

## Success Metrics

**Objectifs Phase 3**:
- [ ] `<button>` HTML: 93 → <30 (-68%)
- [ ] Fichiers glass inline: 51 → <15 (-71%)
- [ ] Adoption `<Button>`: 24% → 67%+
- [ ] Build sans erreurs TypeScript
- [ ] Tests passants

---

## Next Steps

1. **Commencer par Navigation** (Impact visuel immédiat, scope limité)
2. **Migrer les FolderDrawer** (Usage intensif de glass styles)
3. **Refactorer les Layouts** (Simplification maximale)
4. **Validation progressive** (Build + Tests après chaque composant)

---

**Recommandation**: Procéder par fichier, tester après chaque migration, commiter régulièrement.
