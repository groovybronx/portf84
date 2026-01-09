# Guide Rapide: Consolidation UI/UX

**Pour**: Développeurs travaillant sur Lumina Portfolio  
**Objectif**: Référence rapide des patterns UI à utiliser/éviter

---

## 🎯 Objectif de la Consolidation

Centraliser et harmoniser l'interface utilisateur pour:
- ✅ Améliorer la cohérence visuelle
- ✅ Réduire la duplication de code
- ✅ Faciliter la maintenance
- ✅ Accélérer le développement

---

## ✅ Patterns à Utiliser (Recommandés)

### 1. Boutons

**❌ À ÉVITER**:
```tsx
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80">
  Click Me
</button>
```

**✅ À UTILISER**:
```tsx
import { Button } from "@/shared/components/ui";

<Button variant="primary" size="md">
  Click Me
</Button>
```

**Variantes disponibles**:
- `variant`: `primary` | `secondary` | `ghost` | `danger` | `glass`
- `size`: `sm` | `md` | `lg` | `icon`

### 2. Surfaces Glass

**❌ À ÉVITER**:
```tsx
<div className="bg-glass-bg border border-glass-border rounded-xl p-4 backdrop-blur-md">
  Content
</div>
```

**✅ À UTILISER**:
```tsx
import { GlassCard } from "@/shared/components/ui";

<GlassCard variant="base">
  Content
</GlassCard>
```

**Variantes disponibles**:
- `variant`: `base` | `accent` | `bordered`
- `hoverEffect`: `true` | `false`

### 3. Icônes

**❌ À ÉVITER**:
```tsx
import { Settings } from "lucide-react";
<Settings size={20} />
```

**✅ À UTILISER**:
```tsx
import { Icon } from "@/shared/components/Icon";

<Icon action="settings" size={20} />
```

**Avantages**:
- Registre centralisé (69 icônes)
- Cohérence du strokeWidth
- Facilite les changements globaux

### 4. Modales

**❌ À ÉVITER**:
```tsx
{isOpen && (
  <div className="fixed inset-0 z-50">
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-glass-bg border border-glass-border rounded-2xl">
      {content}
    </div>
  </div>
)}
```

**✅ À UTILISER**:
```tsx
import { Modal } from "@/shared/components/ui";

<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="Settings"
  size="md"
  footer={<Button>Save</Button>}
>
  {content}
</Modal>
```

### 5. Inputs

**❌ À ÉVITER**:
```tsx
<input 
  type="text"
  className="w-full bg-glass-bg-accent border border-glass-border 
             rounded-lg px-4 py-2 text-white"
/>
```

**✅ À UTILISER**:
```tsx
import { Input } from "@/shared/components/ui";

<Input 
  type="text"
  placeholder="Enter text..."
  leftIcon={<Icon action="search" />}
/>
```

---

## 🚀 Nouvelles Features (À Venir - Phase 2)

### 1. Composants de Layout

```tsx
// Stack - Pour empiler verticalement/horizontalement
import { Stack } from "@/shared/components/ui";

<Stack direction="vertical" spacing="md">
  <Item1 />
  <Item2 />
  <Item3 />
</Stack>

// Flex - Pour layouts flexbox simplifiés
import { Flex } from "@/shared/components/ui";

<Flex justify="between" align="center" gap="sm">
  <Left />
  <Right />
</Flex>

// Grid - Pour layouts en grille
import { Grid } from "@/shared/components/ui";

<Grid cols={3} gap="md" responsive>
  <Card1 />
  <Card2 />
  <Card3 />
</Grid>
```

### 2. Composants de Formulaire

```tsx
// SettingRow - Pour lignes de paramètres
import { SettingRow } from "@/shared/components/ui";

<SettingRow 
  label="API Key"
  description="Required for AI features"
  icon={<Icon action="key" />}
>
  <Input type="password" />
</SettingRow>

// ColorPicker - Pour sélection de couleur
import { ColorPicker } from "@/shared/components/ui";

<ColorPicker 
  value={color}
  onChange={setColor}
  colors={presetColors}
/>

// Tabs - Pour navigation par onglets
import { Tabs, Tab } from "@/shared/components/ui";

<Tabs value={activeTab} onChange={setActiveTab}>
  <Tab value="general">General</Tab>
  <Tab value="appearance">Appearance</Tab>
</Tabs>
```

---

## 🎨 Design Tokens (CSS Variables)

### Utilisation

**❌ À ÉVITER**:
```tsx
<div className="bg-[rgba(10,10,10,0.8)]">
```

**✅ À UTILISER**:
- **Opacity**: `bg-glass-bg` (80% opacity for readability).

```tsx
<div className="bg-glass-bg">
```

### Tokens Actuels

**Couleurs Glass**:
- `bg-glass-bg` - Background principal
- `bg-glass-bg-accent` - Background accentué
- `bg-glass-bg-active` - Background actif (hover)
- `border-glass-border` - Bordure standard
- `border-glass-border-light` - Bordure légère

**Couleurs Thème** (dynamiques):
- `text-primary` / `bg-primary` - Interface principale
- `text-secondary` / `bg-secondary` - Intelligence AI
- `text-tertiary` / `bg-tertiary` - Collections
- `text-quaternary` / `bg-quaternary` - Dossiers
- `text-quinary` / `bg-quinary` - Projets

**Z-Index**:
```css
z-(--z-modal)       /* 90 - Modales */
z-(--z-drawer)      /* 70 - Drawers */
z-(--z-topbar)      /* 40 - TopBar */
z-(--z-context-menu) /* 100 - Menus contextuels */
```

### Tokens À Venir (Phase 1)

**Spacing**:
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

**Typography**:
```css
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
```

**Shadows**:
```css
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

**Border Radius**:
```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

---

## 📋 Checklist: Nouveau Composant

Lors de la création d'un nouveau composant:

- [ ] **1. Consulter** `DESIGN_SYSTEM.md` (à venir)
- [ ] **2. Réutiliser** composants du UI Kit quand possible
- [ ] **3. Utiliser** design tokens CSS au lieu de valeurs hardcodées
- [ ] **4. Préférer** composants partagés aux `<div>` avec classes inline
- [ ] **5. Suivre** les patterns établis (voir exemples ci-dessus)
- [ ] **6. Tester** visuellement sur différentes tailles d'écran
- [ ] **7. Documenter** si création d'un nouveau pattern

---

## 🔄 Migration Progressive

### Priorités

**Phase 1 (En cours)**: Fondations
- Étendre `Button` et `GlassCard`
- Créer design tokens complets
- Documentation

**Phase 2**: Layouts
- Créer `Stack`, `Flex`, `Grid`
- Migrer exemples

**Phase 3**: Migration
- Remplacer `<button>` par `<Button>`
- Remplacer styles glass inline par `<GlassCard>`

**Phase 4**: Polish
- Simplifier `SettingsModal`
- Créer overlays manquants

### Règles de Migration

1. **Nouveaux composants**: DOIVENT utiliser nouveaux patterns
2. **Composants existants**: Migration progressive (pas d'urgence)
3. **Pas de breaking changes**: Anciens patterns continuent de fonctionner
4. **Tests visuels**: À chaque changement important

---

## 🆘 Questions Fréquentes

### Q: Dois-je migrer tous mes `<button>` maintenant?

**R**: Non. Nouveaux composants utilisent `<Button>`, anciens migrent progressivement.

### Q: Puis-je encore utiliser Tailwind directement?

**R**: Oui, mais privilégiez les composants UI quand disponibles. Tailwind reste utile pour spacing, colors, etc.

### Q: Comment savoir quel composant utiliser?

**R**: Consultez `/docs/../../guides/features/COMPONENTS.md` et les exemples dans ce guide.

### Q: Et si j'ai besoin d'un style custom?

**R**: Utilisez la prop `className` des composants UI pour personnaliser:
```tsx
<Button variant="primary" className="my-custom-class">
```

### Q: Que faire si un composant UI n'existe pas?

**R**: 
1. Vérifiez si prévu dans phases futures
2. Créez avec patterns existants
3. Proposez ajout au UI Kit si réutilisable

---

## 📚 Ressources

**Documentation Principale**:
- `/docs/AUDIT/2026-01-01_UI_CONSOLIDATION_AUDIT.md` - Audit complet
- `/docs/AUDIT/2026-01-01_UI_COMPONENT_ARCHITECTURE.md` - Architecture visuelle
- `/docs/../../guides/features/COMPONENTS.md` - Documentation composants existants

**Composants UI**:
- `/src/shared/components/ui/` - UI Kit
- `/src/shared/components/Icon.tsx` - Registre d'icônes
- `/src/index.css` - Design tokens CSS

**Exemples**:
- `/src/features/navigation/` - Bonne utilisation de UI Kit
- `/src/features/collections/ActionModals.tsx` - Patterns modales

---

## 💡 Tips

1. **Import groupé**: Importez plusieurs composants UI en une ligne
   ```tsx
   import { Button, Modal, Input, GlassCard } from "@/shared/components/ui";
   ```

2. **Composition**: Combinez composants UI pour créer des patterns complexes
   ```tsx
   <GlassCard>
     <Flex justify="between" align="center">
       <h2>Title</h2>
       <Button variant="ghost" size="icon">
         <Icon action="close" />
       </Button>
     </Flex>
   </GlassCard>
   ```

3. **Cohérence**: Suivez les patterns existants avant d'en créer de nouveaux

4. **Performance**: Utilisez `React.memo()` pour composants lourds

5. **Accessibilité**: Composants UI incluent ARIA labels de base, mais personnalisez si besoin

---

**Dernière mise à jour**: 1er janvier 2026  
**Version**: 1.0  
**Contact**: Voir documentation principale pour questions
