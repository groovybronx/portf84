# Animations

## Overview

Lumina Portfolio utilise Framer Motion pour créer des animations fluides et interactives qui améliorent l'expérience utilisateur sans surcharger l'interface. Le système d'animation est conçu pour être performant, accessible et personnalisable.

## Animation System

### Technology Stack

- **Framer Motion** v12.23.26 - Bibliothèque principale d'animations
- **React** - Gestion du cycle de vie des composants animés
- **Tailwind CSS** - Transitions CSS simples et utilitaires

### Animation Presets

Le système inclut des presets configurables via `src/shared/constants/animations.ts`:

```typescript
export type AnimationPreset = "soft" | "normal" | "snappy";

export const SPRING_PRESETS: Record<AnimationPreset, { stiffness: number; damping: number }> = {
	soft: { stiffness: 150, damping: 25 },
	normal: { stiffness: 200, damping: 20 },
	snappy: { stiffness: 300, damping: 15 },
};
```

#### Utilisation des Presets

```typescript
import { getSpringTransition } from "@/shared/constants/animations";

// Dans un composant Framer Motion
<motion.div
	transition={getSpringTransition()}
	animate={{ opacity: 1, y: 0 }}
	initial={{ opacity: 0, y: 20 }}
>
	Content
</motion.div>;
```

## Animation Patterns

### 1. Page Transitions

#### Apparition progressive (Fade In)

```typescript
<motion.div
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ duration: 0.5 }}
>
	<Component />
</motion.div>
```

#### Slide depuis les côtés

```typescript
<motion.div
	initial={{ x: -300 }}
	animate={{ x: 0 }}
	transition={{ type: "spring", stiffness: 200, damping: 20 }}
>
	<Sidebar />
</motion.div>
```

### 2. Component Animations

#### Cards interactives

```typescript
<motion.div
	whileHover={{ scale: 1.02 }}
	whileTap={{ scale: 0.98 }}
	transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
	<Card />
</motion.div>
```

#### Modals et Overlays

```typescript
<motion.div
	initial={{ opacity: 0, scale: 0.9 }}
	animate={{ opacity: 1, scale: 1 }}
	exit={{ opacity: 0, scale: 0.9 }}
	transition={{ type: "spring", stiffness: 300, damping: 25 }}
>
	<Modal />
</motion.div>
```

### 3. List Animations

#### Staggered Animations

```typescript
<motion.div>
	{items.map((item, index) => (
		<motion.div
			key={item.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
		>
			<ItemCard item={item} />
		</motion.div>
	))}
</motion.div>
```

### 4. Complex Animations

#### 3D Carousel (CinematicCarousel)

```typescript
<motion.div
	initial={{
		opacity: 0,
		scale: 0.5,
		x: 0,
		z: 0,
		rotateY: 0,
	}}
	animate={{
		opacity: style.opacity,
		scale: style.scale,
		x: style.translateX,
		z: style.translateZ,
		rotateY: style.rotateY,
	}}
	transition={{
		type: "spring",
		stiffness: 150,
		damping: 20,
		mass: 0.8,
	}}
>
	<Image />
</motion.div>
```

#### Photo Carousel Navigation

```typescript
<motion.div
	initial={{ x: initialX, scale, opacity: 0 }}
	animate={{
		x: xPosition,
		scale,
		opacity,
		zIndex,
	}}
	exit={{ x: offset > 0 ? 1200 : -1200, opacity: 0 }}
	transition={{
		x: { type: "tween", duration: 0.5, ease: [0.4, 0, 0.2, 1] },
		scale: { type: "tween", duration: 0.5, ease: [0.4, 0, 0.2, 1] },
		opacity: { type: "tween", duration: 0.3, ease: "easeOut" },
	}}
>
	<Photo />
</motion.div>
```

## Performance Optimization

### 1. Virtualization

Les grands carrousels utilisent la virtualisation pour ne rendre que les éléments visibles:

```typescript
// CinematicCarousel - Only render 7 images (current ± 3)
const getVisibleIndices = () => {
	const visible = [];
	for (let i = -3; i <= 3; i++) {
		const index = (currentIndex + i + items.length) % items.length;
		visible.push({ index, offset: i });
	}
	return visible;
};
```

### 2. Memory Management

Déchargement des images hors du viewport:

```typescript
// PhotoCarousel - Unload images with offset > 2
useEffect(() => {
	const imagesToUnload = items.filter((_, idx) => Math.abs(idx - currentIndex) > 2);

	imagesToUnload.forEach((item) => {
		const imgElements = document.querySelectorAll(`img[data-item-id="${item.id}"]`);
		imgElements.forEach((img) => {
			if (img instanceof HTMLImageElement && img.src) {
				img.src = ""; // Force garbage collection
			}
		});
	});
}, [currentIndex, items]);
```

### 3. GPU Acceleration

Utilisation de `transform` et `opacity` pour les animations performantes:

```typescript
// Bon - GPU accéléré
<motion.div
  animate={{
    transform: 'translateX(100px) scale(1.1)',
    opacity: 0.8
  }}
>

// Éviter - Layout thrashing
<motion.div
  animate={{
    left: 100,  // Provoque le reflow
    width: 200  // Provoque le repaint
  }}
>
```

## Accessibility

### Reduced Motion Support

```typescript
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();

<motion.div
	transition={shouldReduceMotion ? { duration: 0 } : getSpringTransition()}
	animate={{ opacity: 1 }}
	initial={{ opacity: 0 }}
>
	Content
</motion.div>;
```

### Keyboard Navigation

Les animations ne doivent pas interférer avec la navigation au clavier:

```typescript
// Préserver le focus pendant les animations
<motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring" }} tabIndex={0}>
	<InteractiveElement />
</motion.div>
```

## Animation Components

### EmptyState Animations

```typescript
// Icon animation continue
<GlassCard
  animate={{
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  <FolderOpen />
</GlassCard>

// Pulse effect
<motion.div
  animate={{
    opacity: [0.5, 1, 0.5],
    scale: [0.8, 1, 0.8],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  <Sparkles />
</motion.div>
```

### Context Menu Animations

```typescript
<motion.div
	initial={{ opacity: 0, scale: 0.95, y: -10 }}
	animate={{ opacity: 1, scale: 1, y: 0 }}
	exit={{ opacity: 0, scale: 0.95, y: -10 }}
	transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
	<ContextMenuItems />
</motion.div>
```

### Loading States

```typescript
<motion.div
	animate={{ rotate: 360 }}
	transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
	<LoadingSpinner />
</motion.div>
```

## Best Practices

### 1. Animation Timing

- **Micro-interactions**: 150-300ms
- **Component transitions**: 300-500ms
- **Page transitions**: 500-800ms
- **Complex animations**: 800-1200ms

### 2. Easing Functions

```typescript
// Ease pour les entrées
easeIn: [0.4, 0, 1, 1];

// Ease pour les sorties
easeOut: [0, 0, 0.2, 1];

// Ease complet (entré/sortie)
easeInOut: [0.4, 0, 0.2, 1];
```

### 3. Spring Physics

```typescript
// Doux et lent
{ stiffness: 100, damping: 20 }

// Normal et équilibré
{ stiffness: 200, damping: 15 }

// Rapide et snappy
{ stiffness: 300, damping: 10 }
```

### 4. Performance Tips

- Utiliser `will-change` avec modération
- Éviter les animations sur `width`, `height`, `left`, `top`
- Préférer `transform` et `opacity`
- Limiter le nombre d'éléments animés simultanément
- Utiliser `AnimatePresence` pour les sorties propres

## Custom Animation Hooks

### useAnimationPreset

```typescript
import { useAnimation } from "framer-motion";
import { getSpringTransition } from "@/shared/constants/animations";

export const useAnimationPreset = () => {
	const controls = useAnimation();

	const animateWithPreset = async (values: any) => {
		await controls.start(values);
	};

	return { controls, animateWithPreset, transition: getSpringTransition() };
};
```

### useStaggeredAnimation

```typescript
export const useStaggeredAnimation = (itemCount: number, staggerDelay = 0.1) => {
	return useMemo(
		() =>
			Array.from({ length: itemCount }, (_, i) => ({
				initial: { opacity: 0, y: 20 },
				animate: { opacity: 1, y: 0 },
				transition: { delay: i * staggerDelay },
			})),
		[itemCount, staggerDelay]
	);
};
```

## Testing Animations

### Unit Tests

```typescript
import { render, screen } from "@testing-library/react";
import { AnimatePresence } from "framer-motion";

test("animation completes successfully", async () => {
	render(
		<AnimatePresence>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="animated-element">
				Content
			</motion.div>
		</AnimatePresence>
	);

	const element = screen.getByTestId("animated-element");
	expect(element).toBeInTheDocument();
});
```

### Performance Testing

```typescript
test("animation performance", () => {
	const startTime = performance.now();

	// Trigger animation

	const endTime = performance.now();
	const duration = endTime - startTime;

	expect(duration).toBeLessThan(100); // Should complete in <100ms
});
```

## Troubleshooting

### Common Issues

#### Animation Lag

- **Cause**: Trop d'éléments animés simultanément
- **Solution**: Utiliser la virtualisation ou réduire le nombre d'animations

#### Memory Leaks

- **Cause**: Animations non nettoyées dans `useEffect`
- **Solution**: Toujours retourner une fonction de nettoyage

#### Layout Thrashing

- **Cause**: Animations sur des propriétés de layout
- **Solution**: Utiliser `transform` et `opacity` uniquement

#### Mobile Performance

- **Cause**: Animations trop complexes pour mobile
- **Solution**: Détecter le device et ajuster les animations

### Debug Tools

```typescript
// Framer Motion DevTools
import { MotionConfig } from "framer-motion";

<MotionConfig transition={{ type: "spring" }}>
	<App />
</MotionConfig>;

// Performance monitoring
useEffect(() => {
	const observer = new PerformanceObserver((list) => {
		list.getEntries().forEach((entry) => {
			if (entry.entryType === "measure") {
				console.log(`${entry.name}: ${entry.duration}ms`);
			}
		});
	});

	observer.observe({ entryTypes: ["measure"] });

	return () => observer.disconnect();
}, []);
```

## Future Enhancements

### Planned Features

- **Gesture Animations**: Support complet des gestes tactiles
- **Physics-based Animations**: Intégration de moteurs physiques
- **Lottie Integration**: Support des animations Lottie -**Web Animations API**: Migration vers l'API native quand possible

### Performance Roadmap

- **OffscreenCanvas**: Rendu des animations hors écran
- **Web Workers**: Calculs d'animation dans les workers
- **GPU Shaders**: Accélération matérielle avancée
- **Predictive Animations**: Anticipation des interactions utilisateur
