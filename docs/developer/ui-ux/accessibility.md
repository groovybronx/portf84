# ♿ Accessibility - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/shared/components/` et standards WCAG

---

## 📋 Vue d'Ensemble

Lumina Portfolio est conçu pour être accessible à tous les utilisateurs, y compris ceux utilisant des technologies d'assistance. Ce guide décrit les patterns d'accessibilité implémentés et les bonnes pratiques à suivre.

---

## 🎯 Objectifs d'Accessibilité

### **WCAG 2.1 AA Compléance**

- ✅ **Navigable** : Toute l'application est navigable au clavier
- ✅ **Keyboard Focus** : Le focus est visible et géré correctement
- ✅ **Screen Reader** : Compatible avec les lecteurs d'écran
- ✅ **Color Contrast** : Contraste de texte suffisant (4.5:1 minimum)
- ✅ **Resizable Text** : Le texte peut être redimensionné sans perte de contenu
- **Keyboard Navigation** : Toutes les fonctionnalités accessibles sans souris

---

## 🎨 Patterns d'Accessibilité

### **1. Sémantique HTML5**

```typescript
// ✅ Bon : Structure sémantique
<main>
  <header>
    <h1>Lumina Portfolio</h1>
    <nav>
      <button aria-label="Nouvelle collection">
        <Plus size={16} />
        Nouvelle collection
      </button>
    </nav>
  </header>
  <main>
    <section aria-label="Grille de photos">
      <h2>Vacances 2024</h2>
      <div role="grid" aria-label="Photos de vacances">
        <article>
          <img src="/photos/beach.jpg" alt="Plage tropicale au coucher du soleil" />
          <h3>Plage au coucher du soleil</h3>
        </article>
      </div>
    </section>
  </main>
</main>

// ❌ Éviter : Structure non sémantique
<div class="container">
  <div class="header">
    <h1>Lumina Portfolio</h1>
  </div>
  <div class="content">
    <div class="photos">
      <div class="photo">
        <img src="/photos/beach.jpg" />
      </div>
    </div>
  </div>
</div>
```

### **2. ARIA Labels Descriptifs**

```typescript
// ✅ Bon : Labels descriptifs précis
<Button
  icon={<Settings />}
  aria-label="Paramètres de l'application"
  onClick={openSettings}
>
  Paramètres
</Button>

// ✅ Bon : Labels pour les icônes
<button aria-label="Fermer la fenêtre">
  <X size={16} />
</button>

// ✅ Bon : Labels pour les champs de formulaire
<Input
  placeholder="Rechercher des photos..."
  aria-label="Recherchercher dans les photos par nom ou tags"
/>

// ❌ Éviter : Labels manquants
<button>Paramètres</button>
<img src="/icon.png" />
```

### **3. Roles et États**

```typescript
// ✅ Bon : Rôles appropriés
<button role="button">Cliquez-moi</button>
<nav role="navigation">Navigation principale</nav>
<main role="main">Contenu principal</main>
<aside role="complementary">Informations complémentaires</aside>

// ✅ Bon : États des éléments
<button aria-expanded={false}>Menu</button>
<input aria-invalid={hasError} />
<div aria-hidden={isHidden}>Contenu masqué</div>

// ❌ Éviter : Rôles incorrects
<div role="button">Bouton cliquable</div>
<span role="img">Image cliquable</span>
```

---

## 🎨 Composants Accessibles

### **Button Component**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  iconPosition = 'left',
  'aria-label',
  disabled = false,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled}
    >
      {icon && <span className="sr-only">{ariaLabel}</span>}
      {iconPosition === 'left' && icon && <span className="mr-2">{icon}</span>}
      {children}
      {iconPosition === 'right' && icon && <span className="ml-2">{icon}</span>}
    </button>
  );
};
```

### **Input Component**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Input: React.FC<InputProps> = ({
  leftIcon,
  rightIcon,
  error = false,
  'aria-label',
  'aria-describedby',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full group">
      {leftIcon && (
        <div className="absolute left-3 text-gray-500 group-focus-within:text-blue-400 pointer-events-none">
          {leftIcon}
        </div>
      )}

      <input
        {...props}
        aria-label={ariaLabel}
        aria-describedby={aria-describedby}
        className={cn(
          'w-full bg-glass-bg-accent border border-glass-border-light rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500',
          'focus:bg-glass-bg-active focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'pl-10': !!leftIcon,
            'pr-10': !!rightIcon,
            'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
          }
        )}
      />

      {rightIcon && (
        <div className="absolute right-3 text-gray-500">{rightIcon}</div>
      )}
    </div>
  );
};
```

### **Modal Component**

```typescript
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
	useEffect(() => {
		const originalOverflow = document.body.style.overflow;

		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = originalOverflow || "unset";
		}

		return () => {
			document.body.style.overflow = originalOverflow || "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={onClose}
			aria-modal={true}
			aria-labelledby={title ? "modal-title" : undefined}
		>
			<div
				className="bg-glass-bg-accent border border-glass-border-light rounded-lg shadow-xl max-w-90vw max-h-90vh overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<h2
						id="modal-title"
						className="text-xl font-semibold text-white px-6 py-4 border-b border-glass-border-light"
					>
						{title}
					</h2>
				)}

				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};
```

---

## ⌨️ Navigation Clavier

### **Shortcuts Essentiels**

```typescript
// Raccourcis implémentés
const keyboardShortcuts = {
	"Ctrl+F": "focus-search",
	"Ctrl+T": "open-tag-hub",
	"Ctrl+,": "new-collection",
	"Ctrl+O": "import-folder",
	"Ctrl+S": "share-selected",
	"Ctrl+A": "select-all",
	Escape: "close-modal",
	ArrowLeft: "previous-photo",
	ArrowRight: "next-photo",
	Space: "toggle-fullscreen",
	Enter: "open-photo",
};
```

### **Focus Management**

```typescript
// Hook pour la gestion du focus
const useFocusManagement = () => {
	const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

	const trapFocus = useCallback((e: KeyboardEvent) => {
		if (e.key === "Tab") {
			e.preventDefault();

			const focusableElements = document.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			const currentIndex = Array.from(focusableElements).indexOf(
				document.activeElement as HTMLElement
			);

			let nextIndex = currentIndex + 1;
			if (nextIndex >= focusableElements.length) {
				nextIndex = 0;
			}

			const nextElement = focusableElements[nextIndex] as HTMLElement;
			nextElement?.focus();
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", trapFocus);
		return () => {
			document.removeEventListener("keydown", trapFocus);
		};
	}, []);

	return { focusedElement, setFocusedElement };
};
```

---

## 🎨 Patterns d'Interaction

### **Drag and Drop Accessible**

```typescript
// Drag and drop avec support clavier
const useAccessibleDragDrop = () => {
	const [draggedItem, setDraggedItem] = useState<PortfolioItem | null>(null);
	const [dropZone, setDropZone] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, item: PortfolioItem) => {
		setDraggedItem(item);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", item.id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();

		const itemId = e.dataTransfer.getData("text/plain");
		// Logique de traitement du drop
	};

	return { draggedItem, handleDragStart, handleDragOver, handleDrop };
};
```

### **Context Menu Accessible**

```typescript
// Menu contextuel avec navigation clavier
const useContextMenu = () => {
	const [menuState, setMenuState] = useState({
		isOpen: false,
		x: 0,
		y: 0,
		items: [],
	});

	const showContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
		e.preventDefault();
		e.stopPropagation();

		const rect = e.currentTarget.getBoundingClientRect();

		setMenuState({
			isOpen: true,
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			items,
		});
	}, []);

	const hideContextMenu = useCallback(() => {
		setMenuState((prev) => ({ ...prev, isOpen: false }));
	}, []);

	useEffect(() => {
		const handleClick = () => hideContextMenu();
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
		};
	}, []);

	// Navigation au clavier
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (menuState.isOpen && e.key === "Escape") {
				hideContextMenu();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuState.isOpen]);

	return { menuState, showContextMenu, hideContextMenu };
};
```

---

## 🎨 Couleurs et Contraste

### **Contraste Suffisant**

```css
/* ✅ Bon : Contraste 4.5:1 minimum */
.text-primary {
	color: #ffffff;
	background: #3b82f6;
}

.text-secondary {
	color: #e5e7eb;
	background: #6b7280;
}

/* ✅ Bon : Contraste 7:1+ recommandé */
.text-on-surface {
	color: #ffffff;
	background: #0a0a0a;
}

/* ❌ Éviter : Contraste insuffisant */
.low-contrast {
	color: #999999;
	background: #ffffff;
}
```

### **Focus Indicators**

```css
/* ✅ Bon : Indicateurs de focus visibles */
.button:focus-visible {
	outline: 2px solid #3b82f6;
	outline-offset: 2px;
}

.input:focus-visible {
	outline: 2px solid #3b82f6;
	outline-offset: 2px;
}

/* ✅ Bon : Indicateurs de focus clairs */
.focus-ring {
	ring: 2px rgba(59, 130, 246, 0.5);
}
```

### **Color Blind Friendly**

```css
/* ✅ Bon : Palette accessible */
.accessible-colors {
	--primary: #0066cc;
	--secondary: #4d4d4d;
	--success: #16a34a;
	--warning: #f59e0b;
	--error: #dc262f;
	--info: #0ea5e9;
}

/* ❌ Éviter : Palette problématique */
.problematic-colors {
	--primary: #0066cc;
	--secondary: #4d4d4d;
	--success: #16a34a;
	--warning: #f59e0b;
	--error: #dc262f;
	--info: #0ea5e9;
}
```

---

## 📱 Screen Reader Support

### **Structure de la Page**

```typescript
// ✅ Bon : Structure hiérarchique claire
const PageHeader = () => (
	<header>
		<h1>Lumina Portfolio</h1>
		<nav aria-label="Navigation principale">
			<a href="/collections">Collections</a>
			<a href="/tags">Tags</a>
			<a href="/settings">Settings</a>
		</nav>
	</header>
);

// ✅ Bon : Landmarks pour navigation
const MainContent = () => (
	<main>
		<nav aria-label="Navigation secondaire">
			<a href="#photos" aria-describedby="photos-count">
				Photos (156)
			</a>
		</nav>
		<section id="photos" aria-describedby="photos-count">
			<h2>Mes photos</h2>
			<div role="grid" aria-label="Photos">
				{/* Photos ici */}
			</div>
		</section>
	</main>
);
```

### **Annonces pour les Lecteurs d'Écran**

```typescript
// ✅ Bon : Annonces descriptives
const PhotoCard = ({ photo, onSelect }: PhotoCardProps) => (
	<article>
		<img src={photo.url} alt={photo.description || `Photo de ${photo.name}`} loading="lazy" />
		<h3>{photo.name}</h3>
		<p>{photo.description}</p>
		<button onClick={() => onSelect(photo)} aria-label={`Ouvrir ${photo.name}`}>
			Ouvrir
		</button>
	</article>
);

// ✅ Bon : Annonces d'état
const StatusIndicator = ({ status, count }: StatusIndicatorProps) => (
	<span aria-live="polite" aria-atomic="true" aria-label={`${status}: ${count} éléments`}>
		{status} ({count})
	</span>
);
```

---

## 🎯 Tests d'Accessibilité

### **Tests Automatisés**

```typescript
// Tests d'accessibilité avec React Testing Library
describe("Button Accessibility", () => {
	it("should have proper ARIA labels", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Click me");
	});

	it("should support keyboard navigation", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button");

		fireEvent.keyPress(button, "{Enter}");
		expect(button).toHaveFocus();
	});

	it("should be disabled when loading", () => {
		render(<Button loading={disabled}>Loading...</Button>);
		const button = screen.getByRole("button");

		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-disabled", "true");
	});
});
```

### **Tests E2E avec Playwright**

```typescript
// Tests d'accessibilité avec Playwright
test.describe("Keyboard Navigation", () => {
	test("should navigate with keyboard", async ({ page }) => {
		await page.goto("/");

		// Navigation par Tab
		await page.keyboard.press("Tab");
		await expect(page.getByRole("navigation")).toBeFocused();

		// Navigation par flèches
		await page.keyboard.press("ArrowRight");
		expect(page.getByRole("img")).toBeFocused();

		// Échappement
		await page.keyboard.press("Escape");
		expect(page.getByRole("dialog")).not.toBeVisible();
	});
});
```

---

## 🔧 Outils d'Accessibilité

### **Utilitaires React**

```typescript
// Utilitaire pour vérifier les couleurs
const checkContrast = (foreground: string, background: string) => {
	const getContrast = (color1: string, color2: string) => {
		const luminance1 = getLuminance(color1);
		const luminance2 = getLuminance(color2);
		return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) - 0.05);
	};

	return checkContrast(foreground, background);
};

// Utilitaire pour les ARIA labels
const generateAriaLabel = (text: string, context?: string) => {
	const contextText = context ? ` (${context})` : "";
	return `${text}${contextText}`;
};
```

### **Hook d'Accessibilité**

```typescript
// Hook pour vérifier la conformité WCAG
const useAccessibilityCheck = () => {
	const [violations, setViolations] = useState<string[]>([]);

	const checkAccessibility = useCallback(() => {
		const violations = [];

		// Vérifier les couleurs
		const textElements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
		textElements.forEach((element) => {
			const computedStyle = window.getComputedStyle(element);
			const color = computedStyle.color;
			const background = computedStyle.backgroundColor;

			if (!checkContrast(color, background)) {
				violations.push(`Contrast insuffisant pour le texte sur ${element.tagName}`);
			}
		});

		// Vérifier les labels ARIA
		const elementsNeedingLabels = document.querySelectorAll(
			"button:not([aria-label]), input:not([aria-label]), textarea:not([aria-label])"
		);
		elementsNeedingLabels.forEach((element) => {
			violations.push(`Élément sans aria-label: ${element.tagName}`);
		});

		setViolations(violations);
	}, []);

	return { violations, checkAccessibility };
};
```

---

## 📚 Références

### **Standards WCAG**

- **[WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)** : Guidelines pour l'accessibilité web
- **[ARIA Authoring Practices](https://www.w3.org/TR/WAI-ARIA/)** : Meilleures pratiques ARIA
- **[Keyboard Navigation](https://www.w3.org/TR/WAI/UAUA/)** : Navigation au clavier

### **React Accessibility**

- **[React ARIA Guidelines](https://react.dev/learn/accessibility/)** : Guide React accessibilité
- **[React Testing Library](https://testing-library.com/docs/guide)** : Tests accessibilité
- **[Accessibility Testing](https://github.com/dequelabs/react-axe)** : Tests automatisés d'accessibilité

### **Design Systems**

- **[Material Design Accessibility](https://material.io/design/accessibility)** : Guidelines Material Design
- **[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)** : Guidelines Apple HIG
- **[Google Design Accessibility](https://design.google.com/design/accessibility/)** : Guidelines Google Design

---

## 🎯 Checklist d'Accessibilité

### **✅ Checklist de Développement**

- [ ] **Structure sémantique** : HTML5 approprié
- [ ] **ARIA labels** : Tous les éléments interactifs ont des labels
- **Keyboard navigation** : Toutes les fonctionnalités accessibles au clavier
- **Color contrast** : Contraste 4.5:1 minimum
- **Focus indicators** : États de focus visibles
- **Screen reader** : Compatible avec les lecteurs d'écran

### **✅ Checklist de Test**

- [ ] **Navigation clavier** : Test avec Tab, flèches, Escape
- [ ] **Screen reader** : Test avec NVDA, JAWS, VoiceOver
- [ ] **Color contrast** : Vérifier avec des outils
- [ ] **Zoom** : Test à 200% zoom
- **Voice control** : Test avec les commandes vocales si disponible

---

**Lumina Portfolio s'engage à offrir une expérience accessible à tous les utilisateurs ! ♿**
