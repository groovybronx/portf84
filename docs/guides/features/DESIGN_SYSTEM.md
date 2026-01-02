# Design System - Lumina Portfolio

**Version**: 1.0 (Phase 1 Complete)  
**Date**: 2026-01-01

---

## Table of Contents
1. [Principles](#principles)
2. [Design Tokens](#design-tokens)
3. [UI Components](#ui-components)
4. [Usage Guidelines](#usage-guidelines)
5. [Accessibility](#accessibility)

---

## Principles

### Core Values
- **Cohérence**: Tous les composants suivent les mêmes patterns visuels
- **Réutilisabilité**: Code DRY (Don't Repeat Yourself)
- **Maintenabilité**: Changements centralisés
- **Accessibilité**: WCAG AA minimum

### Glassmorphism
Le design system utilise un effet glassmorphism cohérent :
- Backdrop blur standardisé
- Opacité contrôlée
- Borders subtiles

---

## Design Tokens

### Colors

#### Theme Colors (Dynamiques)
```css
--color-primary: #3b82f6      /* Interface principale */
--color-secondary: #a855f7    /* Intelligence AI */
--color-tertiary: #10b981     /* Collections */
--color-quaternary: #f59e0b   /* Dossiers de travail */
--color-quinary: #f43f5e      /* Projets */
```

#### Glass Colors
```css
--color-glass-bg: rgba(10, 10, 10, 0.8)
--color-glass-bg-accent: rgba(255, 255, 255, 0.05)
--color-glass-bg-active: rgba(255, 255, 255, 0.1)
--color-glass-border: rgba(255, 255, 255, 0.1)
--color-glass-border-light: rgba(255, 255, 255, 0.05)
```

### Spacing Scale
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

### Typography Scale
```css
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
```

### Shadow Scale
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

### Border Radius Scale
```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-full: 9999px
```

### Z-Index Scale
```css
--z-base: 0
--z-grid-item: 10
--z-carousel: 20
--z-topbar: 40
--z-drawer: 70
--z-modal: 90
--z-context-menu: 100
--z-image-viewer: 110
--z-overlay: 120
```

---

## UI Components

### Primitives

#### Button
**Variants**: `primary`, `secondary`, `ghost`, `danger`, `glass`, `glass-icon`, `close`, `nav-arrow`  
**Sizes**: `sm`, `md`, `lg`, `icon`, `icon-lg`, `icon-sm`

```tsx
import { Button } from "@/shared/components/ui";

// Bouton d'action principal
<Button variant="primary" size="md">
  Save
</Button>

// Bouton icône glass
<Button variant="glass-icon" size="icon">
  <Icon action="settings" />
</Button>

// Bouton de fermeture
<Button variant="close" size="icon">
  <Icon action="close" />
</Button>
```

#### Input
```tsx
import { Input } from "@/shared/components/ui";

<Input 
  type="text"
  placeholder="Search..."
  leftIcon={<Icon action="search" />}
/>
```

### Surfaces

#### GlassCard
**Variants**: `base`, `accent`, `bordered`, `panel`, `card`, `overlay`  
**Props**: `padding` (none|sm|md|lg), `border` (boolean), `hoverEffect` (boolean)

```tsx
import { GlassCard } from "@/shared/components/ui";

// Card standard
<GlassCard variant="card" padding="md">
  {content}
</GlassCard>

// Panneau latéral
<GlassCard variant="panel" border={false}>
  {drawer content}
</GlassCard>

// Overlay plein écran
<GlassCard variant="overlay" padding="none">
  {overlay content}
</GlassCard>
```

#### Modal
```tsx
import { Modal } from "@/shared/components/ui";

<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="Settings"
  size="md"
>
  {content}
</Modal>
```

### Utilities

#### Icon
**69 icônes centralisées**

```tsx
import { Icon } from "@/shared/components/Icon";

<Icon action="settings" size={20} />
```

---

## Usage Guidelines

### Patterns à Utiliser

#### ✅ Boutons
```tsx
// Correct: Utiliser le composant Button
<Button variant="primary" size="md">Click Me</Button>

// ❌ À éviter: Bouton HTML avec styles inline
<button className="px-4 py-2 bg-primary...">Click Me</button>
```

#### ✅ Surfaces Glass
```tsx
// Correct: Utiliser GlassCard
<GlassCard variant="card">Content</GlassCard>

// ❌ À éviter: Styles glass inline
<div className="bg-glass-bg backdrop-blur-md...">Content</div>
```

#### ✅ Icônes
```tsx
// Correct: Registre centralisé
<Icon action="settings" size={20} />

// ❌ À éviter: Import direct de Lucide
import { Settings } from "lucide-react";
<Settings size={20} />
```

### Spacing
Utiliser les tokens CSS au lieu de classes Tailwind quand possible :
```css
/* Correct */
padding: var(--spacing-md);

/* Acceptable avec Tailwind */
className="p-4"
```

---

## Accessibility

### Standards
- **WCAG AA** minimum
- **Contraste de couleurs**: Minimum 4.5:1
- **Focus visible**: Tous les éléments interactifs
- **ARIA labels**: Sur tous les boutons icône

### Exemples
```tsx
// Bouton accessible
<Button 
  variant="close" 
  aria-label="Close dialog"
>
  <Icon action="close" />
</Button>

// Modal accessible
<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="Settings"  // Utilisé pour aria-labelledby
>
  {content}
</Modal>
```

---

## Phase 2 Preview (Layouts)

Les composants suivants seront ajoutés en Phase 2:
- `Stack` - Empilage vertical/horizontal
- `Flex` - Wrapper flexbox déclaratif
- `Grid` - Grid responsive
- `Container` - Conteneur responsive

---

**Dernière mise à jour**: 2026-01-01  
**Maintenu par**: Équipe technique
