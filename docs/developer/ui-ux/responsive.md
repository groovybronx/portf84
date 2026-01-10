# 📱 Responsive Design - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/index.css` et Tailwind CSS v4

---

## 📋 Vue d'Ensemble

Lumina Portfolio utilise une approche mobile-first pour le responsive design, garantissant une expérience utilisateur optimale sur tous les appareils, des smartphones aux écrans larges.

---

## 🎯 Breakpoints System

### **Breakpoints Définis**

```css
/* Tailwind CSS v4 breakpoints */
sm: 640px   /* Mobile large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

### **Approche Mobile-First**

```css
/* Base styles (mobile-first) */
.photo-grid {
	display: grid;
	grid-template-columns: repeat(1, minmax(200px, 1fr));
	gap: var(--spacing-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
	.photo-grid {
		grid-template-columns: repeat(2, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}
}

/* Desktop and up */
@media (min-width: 1024px) {
	.photo-grid {
		grid-template-columns: repeat(3, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}
}

/* Large desktop and up */
@media (min-width: 1280px) {
	.photo-grid {
		grid-template-columns: repeat(4, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}
}
```

---

## 🎨 Layout Patterns

### **1. Container Pattern**

```typescript
// Container responsive avec padding adaptative
const ResponsiveContainer = ({ children, className }: ContainerProps) => (
	<div className={cn("w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12", "max-w-7xl", className)}>
		{children}
	</div>
);
```

### **2. Grid Pattern**

```typescript
// Grille de photos responsive
const PhotoGrid = ({ photos }: PhotoGridProps) => (
	<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
		{photos.map((photo) => (
			<PhotoCard key={photo.id} photo={photo} />
		))}
	</div>
);
```

### **3. Flex Pattern**

```typescript
// Layout flexible pour les sidebars
const ResponsiveLayout = ({ sidebar, children }: LayoutProps) => (
	<div className="flex flex-col lg:flex-row gap-6">
		<aside className="w-full lg:w-64 lg:flex-shrink-0">{sidebar}</aside>
		<main className="flex-1 min-w-0">{children}</main>
	</div>
);
```

---

## 📱 Mobile Patterns

### **Mobile Navigation**

```typescript
// Navigation mobile avec hamburger menu
const MobileNavigation = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="lg:hidden">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 rounded-lg hover:bg-glass-bg-active"
				aria-label="Toggle navigation"
			>
				<Menu size={24} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, x: -300 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -300 }}
						className="fixed inset-0 z-50 bg-black/50"
					>
						<div className="w-64 h-full bg-glass-bg-accent p-4">
							<NavigationItems />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};
```

### **Mobile Touch Gestures**

```typescript
// Support des gestes tactiles
const useTouchGestures = () => {
	const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
	const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(null);
		setTouchStart({
			x: e.targetTouches[0].clientX,
			y: e.targetTouches[0].clientY,
		});
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd({
			x: e.targetTouches[0].clientX,
			y: e.targetTouches[0].clientY,
		});
	};

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const deltaX = touchEnd.x - touchStart.x;
		const deltaY = touchEnd.y - touchStart.y;

		// Swipe horizontal
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (deltaX > 50) {
				onSwipeRight();
			} else if (deltaX < -50) {
				onSwipeLeft();
			}
		}

		setTouchStart(null);
		setTouchEnd(null);
	};

	return { handleTouchStart, handleTouchMove, handleTouchEnd };
};
```

---

## 💻 Desktop Patterns

### **Desktop Navigation**

```typescript
// Navigation desktop avec hover states
const DesktopNavigation = () => (
	<nav className="hidden lg:flex items-center space-x-4">
		<NavigationItem href="/collections">Collections</NavigationItem>
		<NavigationItem href="/tags">Tags</NavigationItem>
		<NavigationItem href="/settings">Settings</NavigationItem>
	</nav>
);

const NavigationItem = ({ href, children }: NavigationItemProps) => (
	<a href={href} className="px-3 py-2 rounded-lg hover:bg-glass-bg-active transition-colors">
		{children}
	</a>
);
```

### **Desktop Layout**

```typescript
// Layout desktop avec sidebar fixe
const DesktopLayout = ({ sidebar, children }: LayoutProps) => (
	<div className="flex h-screen">
		<aside className="w-64 bg-glass-bg-accent border-r border-glass-border-light">{sidebar}</aside>
		<main className="flex-1 overflow-auto">{children}</main>
	</div>
);
```

---

## 🎨 Component Patterns

### **Responsive Button**

```typescript
// Bouton adaptatif selon la taille d'écran
const ResponsiveButton = ({
	children,
	variant = "primary",
	size = "md",
	fullWidth = false,
	...props
}: ButtonProps) => (
	<Button
		variant={variant}
		size={size}
		fullWidth={fullWidth}
		className={cn(
			"text-sm sm:text-base",
			"px-3 py-2 sm:px-4 sm:py-3",
			fullWidth && "w-full sm:w-auto"
		)}
		{...props}
	>
		{children}
	</Button>
);
```

### **Responsive Card**

```typescript
// Carte adaptative
const ResponsiveCard = ({ children, className }: CardProps) => (
	<div
		className={cn(
			"bg-glass-bg-accent border border-glass-border-light rounded-lg",
			"p-4 sm:p-6",
			"shadow-sm sm:shadow-md",
			className
		)}
	>
		{children}
	</div>
);
```

### **Responsive Modal**

```typescript
// Modal adaptative
const ResponsiveModal = ({ isOpen, onClose, children, size = "md" }: ModalProps) => {
	const sizeClasses = {
		sm: "w-full max-w-sm",
		md: "w-full max-w-md",
		lg: "w-full max-w-lg",
		xl: "w-full max-w-xl",
		full: "w-full max-w-full",
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div
						className={cn(
							"bg-glass-bg-accent border border-glass-border-light rounded-lg",
							"max-h-[90vh] overflow-y-auto",
							sizeClasses[size]
						)}
					>
						{children}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
```

---

## 🎨 Typography Patterns

### **Responsive Typography**

```css
/* Typography scale */
.text-xs {
	font-size: var(--text-xs);
} /* 12px */
.text-sm {
	font-size: var(--text-sm);
} /* 14px */
.text-base {
	font-size: var(--text-base);
} /* 16px */
.text-lg {
	font-size: var(--text-lg);
} /* 18px */
.text-xl {
	font-size: var(--text-xl);
} /* 20px */
.text-2xl {
	font-size: var(--text-2xl);
} /* 24px */

/* Responsive typography */
.text-responsive {
	font-size: clamp(1rem, 2.5vw, 1.25rem);
}

.text-hero {
	font-size: clamp(1.5rem, 4vw, 3rem);
	line-height: 1.2;
}
```

### **Fluid Typography**

```typescript
// Typography fluide avec clamp()
const FluidText = ({ children, minSize, maxSize, minViewport, maxViewport }: FluidTextProps) => {
	const fluidSize = `clamp(${minSize}, ${minSize} + (${maxSize} - ${minSize}) * ((100vw - ${minViewport}) / (${maxViewport} - ${minViewport})), ${maxSize})`;

	return <span style={{ fontSize: fluidSize }}>{children}</span>;
};

// Utilisation
<FluidText minSize="1rem" maxSize="1.5rem" minViewport="320px" maxViewport="1200px">
	Texte fluide
</FluidText>;
```

---

## 🎨 Image Patterns

### **Responsive Images**

```typescript
// Images adaptatives avec srcset
const ResponsiveImage = ({ src, alt, sizes = "100vw", className }: ImageProps) => (
	<img
		src={src}
		alt={alt}
		sizes={sizes}
		srcSet={`
      ${src}?w=400 400w,
      ${src}?w=800 800w,
      ${src}?w=1200 1200w,
      ${src}?w=1600 1600w
    `}
		loading="lazy"
		className={cn("w-full h-auto object-cover", className)}
	/>
);
```

### **Picture Element**

```typescript
// Picture element pour différentes résolutions
const AdaptivePicture = ({ images, alt, className }: PictureProps) => (
	<picture className={className}>
		{images.map((image, index) => (
			<source key={index} media={image.media} srcSet={image.srcSet} />
		))}
		<img
			src={images[images.length - 1].src}
			alt={alt}
			loading="lazy"
			className="w-full h-auto object-cover"
		/>
	</picture>
);
```

---

## 🎨 Grid Patterns

### **Auto-fit Grid**

```css
/* Grid auto-fit pour les collections */
.photo-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: var(--spacing-md);
}

/* Grid avec contraintes */
.photo-grid-constrained {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
	gap: var(--spacing-md);
}
```

### **Masonry Grid**

```typescript
// Masonry grid pour différentes tailles
const MasonryGrid = ({ items }: MasonryGridProps) => (
	<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
		{items.map((item, index) => (
			<div key={item.id} className="break-inside-avoid mb-4">
				<PhotoCard photo={item} />
			</div>
		))}
	</div>
);
```

---

## 🎨 Utility Patterns

### **Responsive Utilities**

```typescript
// Utilitaires responsive personnalisés
const responsiveUtils = {
	// Espacement responsive
	spacing: {
		"py-responsive": "py-2 sm:py-4 md:py-6",
		"px-responsive": "px-2 sm:px-4 md:px-6",
		"p-responsive": "p-2 sm:p-4 md:p-6",
	},

	// Taille responsive
	size: {
		"w-responsive": "w-full sm:w-auto",
		"h-responsive": "h-auto sm:h-64",
		"max-w-responsive": "max-w-full sm:max-w-md",
	},

	// Affichage responsive
	display: {
		"hidden-mobile": "hidden sm:block",
		"hidden-desktop": "block sm:hidden",
		"flex-mobile": "flex sm:hidden",
		"flex-desktop": "hidden sm:flex",
	},
};
```

### **Conditional Rendering**

```typescript
// Rendu conditionnel basé sur la taille d'écran
const useResponsive = () => {
	const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("mobile");

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width < 768) setScreenSize("mobile");
			else if (width < 1024) setScreenSize("tablet");
			else setScreenSize("desktop");
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return {
		screenSize,
		isMobile: screenSize === "mobile",
		isTablet: screenSize === "tablet",
		isDesktop: screenSize === "desktop",
	};
};

// Utilisation
const ResponsiveComponent = () => {
	const { isMobile, isDesktop } = useResponsive();

	return (
		<div>
			{isMobile && <MobileView />}
			{isDesktop && <DesktopView />}
		</div>
	);
};
```

---

## 🎨 Performance Patterns

### **Lazy Loading**

```typescript
// Lazy loading des composants
const LazyComponent = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, []);

	return (
		<div ref={ref}>
			{isVisible ? children : <div className="h-64 bg-glass-bg-accent animate-pulse" />}
		</div>
	);
};
```

### **Virtual Scrolling**

```typescript
// Virtual scrolling pour les grandes listes
const VirtualList = ({ items, itemHeight = 200, containerHeight = 400 }: VirtualListProps) => {
	const [scrollTop, setScrollTop] = useState(0);
	const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

	const visibleItems = useMemo(() => {
		const start = Math.floor(scrollTop / itemHeight);
		const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 1, items.length);
		return items.slice(start, end);
	}, [items, scrollTop, itemHeight, containerHeight]);

	const handleScroll = (e: React.UIEvent) => {
		setScrollTop(e.currentTarget.scrollTop);
	};

	return (
		<div style={{ height: containerHeight, overflow: "auto" }} onScroll={handleScroll}>
			<div style={{ height: items.length * itemHeight, position: "relative" }}>
				{visibleItems.map((item, index) => (
					<div
						key={item.id}
						style={{
							position: "absolute",
							top: (visibleRange.start + index) * itemHeight,
							height: itemHeight,
							width: "100%",
						}}
					>
						<ListItem item={item} />
					</div>
				))}
			</div>
		</div>
	);
};
```

---

## 🎨 Testing Patterns

### **Responsive Testing**

```typescript
// Tests de responsive avec Playwright
test.describe("Responsive Design", () => {
	const viewports = [
		{ name: "mobile", width: 375, height: 667 },
		{ name: "tablet", width: 768, height: 1024 },
		{ name: "desktop", width: 1280, height: 800 },
	];

	viewports.forEach(({ name, width, height }) => {
		test(`should display correctly on ${name}`, async ({ page }) => {
			await page.setViewportSize({ width, height });
			await page.goto("/");

			// Vérifier la navigation
			if (name === "mobile") {
				await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
				await expect(page.locator('[data-testid="desktop-menu"]')).not.toBeVisible();
			} else {
				await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible();
				await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
			}

			// Vérifier la grille
			const gridCols = name === "mobile" ? 1 : name === "tablet" ? 2 : 3;
			await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
		});
	});
});
```

---

## 📚 Références

### **Responsive Design Resources**

- **[Responsive Design Principles](https://web.dev/responsive/)** : Principes de responsive design
- **[CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)** : Documentation CSS Grid
- **[Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)** : Guide complet Flexbox

### **Tailwind CSS Resources**

- **[Responsive Design](https://tailwindcss.com/docs/responsive-design)** : Documentation Tailwind
- **[Breakpoints](https://tailwindcss.com/docs/breakpoints)** : Configuration des breakpoints
- **[Container Queries](https://tailwindcss.com/docs/container-queries)** : Container queries

### **Performance Resources**

- **[Web Performance](https://web.dev/performance/)** : Optimisations web
- **[Image Optimization](https://web.dev/learn/performance/optimize-images/)** : Optimisation d'images
- **[Lazy Loading](https://web.dev/learn/performance/lazy-loading/)** : Lazy loading

---

## 🎯 Checklist Responsive

### **✅ Checklist de Développement**

- [ ] **Mobile-first** : Design mobile-first appliqué
- [ ] **Breakpoints** : Breakpoints définis et cohérents
- [ ] **Images** : Images optimisées et adaptatives
- [ ] **Typography** : Typography fluide et lisible
- [ ] **Navigation** : Navigation adaptative selon l'appareil
- [ ] **Performance** : Lazy loading et virtualisation implémentés

### **✅ Checklist de Test**

- [ ] **Mobile** : Test sur smartphones (375px+)
- [ ] **Tablet** : Test sur tablettes (768px+)
- [ ] **Desktop** : Test sur desktop (1024px+)
- [ ] **Large Desktop** : Test sur grands écrans (1280px+)
- [ ] **Touch** : Test des gestes tactiles
- [ ] **Keyboard** : Test navigation au clavier

### **✅ Checklist d'Accessibilité**

- [ ] **Zoom** : Test à 200% zoom
- [ ] **Landscape** : Test orientation paysage
- [ ] **High DPI** : Test sur écrans haute résolution
- [ ] **Low Bandwidth** : Test sur connexion lente

---

## 🎯 Patterns Émergents

### **Future Patterns**

- **Container Queries** : Requêtes de conteneur CSS
- **Subgrid** : Sous-grilles CSS
- **Intrinsic Web Design** : Design intrinsèque
- **Variable Fonts** : Polices variables adaptatives

### **Évolutions**

- **CSS Houdini** : APIs CSS personnalisées
- **Web Components** : Composants web réutilisables
- **Progressive Enhancement** : Amélioration progressive
- **Adaptive Loading** : Chargement adaptatif

---

**Lumina Portfolio offre une expérience responsive optimale sur tous les appareils ! 📱**
