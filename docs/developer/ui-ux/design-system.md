# 🎨 Design System - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/index.css` et configuration Tailwind CSS v4

---

## 📋 Vue d'Ensemble

Lumina Portfolio utilise un design system moderne basé sur Tailwind CSS v4 avec des tokens personnalisés, des thèmes dynamiques et des effets glass morphism.

---

## 🎯 Thème et Couleurs

### **Palette de Couleurs Principale**

```css
:root {
	/* Dynamic Theme Colors (modifiées par ThemeContext) */
	--color-primary: #3b82f6; /* Bleu principal */
	--color-secondary: #a855f7; /* Violet */
	--color-tertiary: #10b981; /* Vert */
	--color-quaternary: #f59e0b; /* Orange */
	--color-quinary: #f43f5e; /* Rose */
	--color-accent: #f59e0b; /* Orange clair */
}
```

### **Couleurs de Surface**

```css
@theme {
	--color-background: #0a0a0a; /* Fond principal */
	--color-surface: #121212; /* Surface cartes */
	--color-text-primary: #ffffff; /* Texte principal */
	--color-text-secondary-dim: rgba(255, 255, 255, 0.6);
	--color-text-tertiary-dim: rgba(255, 255, 255, 0.4);
}
```

### **Palette de Tags**

```typescript
const COLOR_PALETTE: Record<string, string> = {
	"1": "#ef4444", // Red
	"2": "#f97316", // Orange
	"3": "#eab308", // Yellow
	"4": "#22c55e", // Green
	"5": "#3b82f6", // Blue
	"6": "#a855f7", // Purple
};
```

---

## 🪟 Glass Morphism

### **Tokens Glass**

```css
@theme {
	/* Arrière-plans glass */
	--color-glass-bg: rgba(10, 10, 10, 0.8);
	--color-glass-bg-accent: rgba(255, 255, 255, 0.05);
	--color-glass-bg-active: rgba(255, 255, 255, 0.1);

	/* Bordures glass */
	--color-glass-border: rgba(255, 255, 255, 0.1);
	--color-glass-border-light: rgba(255, 255, 255, 0.05);

	/* Effets de flou */
	--glass-blur: blur(12px);
	--glass-blur-lg: blur(24px);
	--surface-opacity: 0.8;
}
```

### **Utilisation**

```css
/* Carte glass morphism */
.glass-card {
	background: var(--color-glass-bg-accent);
	backdrop-filter: var(--glass-blur);
	border: 1px solid var(--color-glass-border-light);
}

/* État hover/actif */
.glass-card:hover {
	background: var(--color-glass-bg-active);
	border-color: var(--color-glass-border);
}
```

---

## 📏 Spacing Scale

### **Échelle d'Espacement**

```css
:root {
	--spacing-xs: 0.25rem; /* 4px */
	--spacing-sm: 0.5rem; /* 8px */
	--spacing-md: 1rem; /* 16px */
	--spacing-lg: 1.5rem; /* 24px */
	--spacing-xl: 2rem; /* 32px */
	--spacing-2xl: 3rem; /* 48px */
	--spacing-3xl: 4rem; /* 64px */
}
```

### **Classes Tailwind Correspondantes**

```css
/* Mapping vers Tailwind */
.spacing-xs {
	padding: 4px;
}
.spacing-sm {
	padding: 8px;
}
.spacing-md {
	padding: 16px;
}
.spacing-lg {
	padding: 24px;
}
.spacing-xl {
	padding: 32px;
}
.spacing-2xl {
	padding: 48px;
}
.spacing-3xl {
	padding: 64px;
}
```

---

## 🔤 Typography Scale

### **Échelle Typographique**

```css
:root {
	--text-xs: 0.75rem; /* 12px */
	--text-sm: 0.875rem; /* 14px */
	--text-base: 1rem; /* 16px */
	--text-lg: 1.125rem; /* 18px */
	--text-xl: 1.25rem; /* 20px */
	--text-2xl: 1.5rem; /* 24px */
}
```

### **Hiérarchie Typographique**

```css
/* Titres */
.text-hero {
	font-size: 2.5rem;
	font-weight: 700;
}
.text-h1 {
	font-size: var(--text-2xl);
	font-weight: 600;
}
.text-h2 {
	font-size: var(--text-xl);
	font-weight: 600;
}
.text-h3 {
	font-size: var(--text-lg);
	font-weight: 500;
}

/* Corps */
.text-body {
	font-size: var(--text-base);
	font-weight: 400;
}
.text-small {
	font-size: var(--text-sm);
	font-weight: 400;
}
.text-caption {
	font-size: var(--text-xs);
	font-weight: 400;
}
```

---

## 🌊 Shadows

### **Échelle d'Ombres**

```css
:root {
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
	--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
	--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

### **Utilisation**

```css
.card-shadow {
	box-shadow: var(--shadow-md);
}
.modal-shadow {
	box-shadow: var(--shadow-xl);
}
.subtle-shadow {
	box-shadow: var(--shadow-sm);
}
```

---

## 🔄 Border Radius

### **Échelle de Rayons**

```css
:root {
	--radius-sm: 0.375rem; /* 6px */
	--radius-md: 0.5rem; /* 8px */
	--radius-lg: 0.75rem; /* 12px */
	--radius-xl: 1rem; /* 16px */
	--radius-2xl: 1.5rem; /* 24px */
	--radius-full: 9999px;
}
```

### **Applications**

```css
.button-radius {
	border-radius: var(--radius-md);
}
.card-radius {
	border-radius: var(--radius-lg);
}
.input-radius {
	border-radius: var(--radius-md);
}
.avatar-radius {
	border-radius: var(--radius-full);
}
```

---

## 📐 Z-Index Scale

### **Échelle de Profondeur**

```css
:root {
	--z-base: 0;
	--z-grid-item: 10;
	--z-carousel: 20;
	--z-topbar-underlay: 30;
	--z-topbar: 40;
	--z-controlbar: 50;
	--z-drawer-overlay: 60;
	--z-drawer: 70;
	--z-modal-overlay: 80;
	--z-modal: 90;
	--z-context-menu: 100;
	--z-image-viewer: 110;
	--z-overlay: 120;
}
```

### **Mapping des Composants**

```css
/* Layout */
.app-background {
	z-index: var(--z-base);
}
.photo-grid {
	z-index: var(--z-grid-item);
}
.carousel {
	z-index: var(--z-carousel);
}

/* Navigation */
.topbar-underlay {
	z-index: var(--z-topbar-underlay);
}
.topbar {
	z-index: var(--z-topbar);
}
.controlbar {
	z-index: var(--z-controlbar);
}

/* Overlays */
.drawer-overlay {
	z-index: var(--z-drawer-overlay);
}
.drawer {
	z-index: var(--z-drawer);
}
.modal-overlay {
	z-index: var(--z-modal-overlay);
}
.modal {
	z-index: var(--z-modal);
}
.context-menu {
	z-index: var(--z-context-menu);
}
.image-viewer {
	z-index: var(--z-image-viewer);
}
.global-overlay {
	z-index: var(--z-overlay);
}
```

---

## 🎭 Animations

### **Animation Float**

```css
@theme {
	--animate-float: float 6s ease-in-out infinite;
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}
```

### **Transitions Standards**

```css
/* Transitions UI */
.transition-base {
	transition: all 0.2s ease-in-out;
}

.transition-colors {
	transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-transform {
	transition: transform 0.2s ease;
}

/* Micro-interactions */
.hover-lift:hover {
	transform: translateY(-2px);
}

.active-scale:active {
	transform: scale(0.95);
}
```

---

## 🎨 Layout System

### **Layout Tokens**

```css
:root {
	--layout-pt: 9rem; /* Padding top pour TopBar */
}
```

### **Grid System**

```css
/* Photo Grid Responsive */
.photo-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-md);
}

/* Responsive Breakpoints */
@media (min-width: 640px) {
	.photo-grid {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
}

@media (min-width: 1024px) {
	.photo-grid {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}
}
```

---

## 🌈 Thème Dynamique

### **Thème Context**

```typescript
// ThemeContext modifie les CSS variables
const theme = {
	primary: "#3b82f6",
	secondary: "#a855f7",
	tertiary: "#10b981",
	// ...
};

// Application via CSS
document.documentElement.style.setProperty("--color-primary", theme.primary);
```

### **Thèmes Prédéfinis**

```css
/* Dark Theme (default) */
[data-theme="dark"] {
	--color-background: #0a0a0a;
	--color-surface: #121212;
	--color-text-primary: #ffffff;
}

/* Light Theme */
[data-theme="light"] {
	--color-background: #ffffff;
	--color-surface: #f8fafc;
	--color-text-primary: #1f2937;
}
```

---

## 🔧 Utilitaires CSS

### **Classes Utilitaires**

```css
/* Glass utilities */
.glass {
	background: var(--color-glass-bg-accent);
	backdrop-filter: var(--glass-blur);
	border: 1px solid var(--color-glass-border-light);
}

.glass-hover:hover {
	background: var(--color-glass-bg-active);
	border-color: var(--color-glass-border);
}

/* Text utilities */
.text-primary {
	color: var(--color-text-primary);
}
.text-secondary {
	color: var(--color-text-secondary-dim);
}
.text-tertiary {
	color: var(--color-text-tertiary-dim);
}

/* Surface utilities */
.surface {
	background: var(--color-surface);
}
.surface-glass {
	background: var(--color-glass-bg);
}
.surface-accent {
	background: var(--color-glass-bg-accent);
}
```

---

## 📱 Responsive Design

### **Breakpoints**

```css
/* Tailwind CSS v4 breakpoints */
sm: 640px   /* Mobile large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

### **Patterns Responsive**

```css
/* Mobile-first approach */
.component {
	/* Mobile styles (default) */
	padding: var(--spacing-sm);
}

@media (min-width: 768px) {
	.component {
		/* Tablet+ styles */
		padding: var(--spacing-md);
	}
}

@media (min-width: 1024px) {
	.component {
		/* Desktop+ styles */
		padding: var(--spacing-lg);
	}
}
```

---

## 🎯 Bonnes Pratiques

### **1. Utilisation des Tokens**

```css
/* ✅ Bon - Utiliser les tokens */
.button {
	background: var(--color-primary);
	border-radius: var(--radius-md);
	padding: var(--spacing-sm) var(--spacing-md);
}

/* ❌ Éviter - Valeurs hardcodées */
.button {
	background: #3b82f6;
	border-radius: 8px;
	padding: 8px 16px;
}
```

### **2. Composition des Classes**

```css
/* ✅ Bon - Composition sémantique */
.card-primary {
	/* Base card */
	@apply glass-card;
	/* Variant */
	@apply border-blue-500/20;
	/* State */
	@apply hover:border-blue-500/40;
}
```

### **3. Performance CSS**

```css
/* ✅ Optimisé - Transform pour animations */
.animate-slide {
	transform: translateX(0);
	transition: transform 0.3s ease;
}

/* ❌ Éviter - Layout thrashing */
.animate-slide {
	left: 0;
	transition: left 0.3s ease;
}
```

---

## 📚 Références

- **Code source** : `src/index.css`
- **Configuration Tailwind** : `tailwind.config.js`
- **Tokens** : Variables CSS dans `:root`
- **Composants** : `src/shared/components/ui/`

---

## 🚀 Évolution du Design System

### **Roadmap**

1. **v1.0** : Tokens de base (complet)
2. **v1.1** : Thèmes multiples (light/dark)
3. **v1.2** : Animations avancées
4. **v2.0** : Design system tokens (DTCG)

### **Contribution**

- Ajouter de nouveaux tokens dans `:root`
- Documenter les nouvelles utilités
- Maintenir la cohérence visuelle
- Tester l'accessibilité
