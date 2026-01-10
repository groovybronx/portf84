# 🎨 UI/UX Patterns - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/features/` et patterns d'interaction

---

## 📋 Vue d'Ensemble

Ce document décrit les patterns d'interaction et d'interface utilisateur utilisés dans Lumina Portfolio. Ces patterns assurent une expérience utilisateur cohérente et intuitive.

---

## 🎯 Patterns de Navigation

### **Pattern : Command Palette**

```typescript
// Commande rapide accessible partout
interface CommandPalette {
	isOpen: boolean;
	commands: Command[];
	onSelect: (command: Command) => void;
	onClose: () => void;
}

// Utilisation
<CommandPalette
	isOpen={isCommandPaletteOpen}
	commands={[
		{ id: "new-collection", label: "New Collection", icon: Plus },
		{ id: "import-folder", label: "Import Folder", icon: FolderOpen },
		{ id: "tag-hub", label: "Open Tag Hub", icon: Tags },
		{ id: "settings", label: "Settings", icon: Settings },
	]}
	onSelect={handleCommand}
	onClose={() => setIsCommandPaletteOpen(false)}
/>;
```

### **Pattern : Breadcrumbs**

```typescript
interface BreadcrumbItem {
	label: string;
	path: string;
	isActive: boolean;
	onClick: () => void;
}

// Utilisation
<Breadcrumb>
	<BreadcrumbItem label="Collections" path="/collections" isActive={false} />
	<BreadcrumbItem label="Vacances 2024" path="/collections/vacances-2024" isActive={true} />
	<BreadcrumbItem label="Beach" path="/collections/vacances-2024/beach" isActive={false} />
</Breadcrumb>;
```

---

## 🖱️ Patterns de Sélection

### **Pattern : Multi-Selection avec Keyboard Modifiers**

```typescript
// Hook pour gérer la sélection multiple
const useMultiSelection = () => {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

	const handleSelection = useCallback(
		(id: string, event: React.MouseEvent) => {
			const isShiftPressed = event.shiftKey;
			const isCommandPressed = event.metaKey || event.ctrlKey;

			if (!isShiftPressed && !isCommandPressed) {
				// Sélection simple
				setSelectedIds(new Set([id]));
				setLastSelectedId(id);
			} else if (isShiftPressed && lastSelectedId) {
				// Sélection continue
				const start = Math.min(lastSelectedId, id);
				const end = Math.max(lastSelectedId, id);
				const range = generateIdRange(start, end);
				setSelectedIds(new Set(range));
			} else if (isCommandPressed) {
				// Sélection multiple
				setSelectedIds((prev) => {
					const newSet = new Set(prev);
					if (newSet.has(id)) {
						newSet.delete(id);
					} else {
						newSet.add(id);
					}
					return newSet;
				});
			}
		},
		[lastSelectedId]
	);

	return { selectedIds, handleSelection };
};
```

### **Pattern : Drag Select (Rectangle Selection)**

```typescript
// Hook pour la sélection par glissement
const useDragSelect = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
	const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
	const [selection, setSelection] = useState<Rectangle | null>(null);

	const handleMouseDown = (e: React.MouseEvent, items: PortfolioItem[]) => {
		setIsDragging(true);
		setDragStart({ x: e.clientX, y: e.clientY });
		setSelection(null);
	};

	const handleMouseMove = (e: React.MouseEvent, items: PortfolioItem[]) => {
		if (!isDragging || !dragStart) return;

		const currentEnd = { x: e.clientX, y: e.clientY };
		const newSelection = {
			start: dragStart,
			end: currentEnd,
		};
		setSelection(newSelection);

		// Calculer les items dans la sélection
		const selectedItems = itemsInRectangle(items, newSelection);
		setSelectedIds(new Set(selectedItems.map((item) => item.id)));
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		setDragStart(null);
		setDragEnd(null);
	};

	return { isDragging, selection, handleMouseDown, handleMouseMove, handleMouseUp };
};
```

---

## 🎭️ Patterns de Modales et Overlays

### **Pattern : Modal Stack**

```typescript
// Gestion centralisée des modales
interface ModalState {
	activeModal: string | null;
	queue: string[];
}

const useModalStack = () => {
	const [state, setState] = useState<ModalState>({
		activeModal: null,
		queue: [],
	});

	const openModal = useCallback((modalId: string) => {
		setState((prev) => {
			if (prev.activeModal) {
				return {
					...prev,
					queue: [...prev.queue, modalId],
				};
			}
			return {
				...prev,
				activeModal: modalId,
				queue: [],
			};
		});
	}, []);

	const closeModal = useCallback((modalId?: string) => {
		setState((prev) => {
			const targetId = modalId || prev.activeModal;
			if (prev.activeModal === targetId) {
				return {
					...prev,
					activeModal: prev.queue.length > 0 ? prev.queue[0] : null,
					queue: prev.queue.slice(1),
				};
			}
			return prev;
		});
	}, []);

	return { state, openModal, closeModal };
};
```

### **Pattern : Context Menu**

```typescript
// Menu contextuel intelligent
interface ContextMenuState {
	x: number;
	y: number;
	item: PortfolioItem;
	isVisible: boolean;
	actions: ContextAction[];
}

const useContextMenu = () => {
	const [state, setState] = useState<ContextMenuState>({
		x: 0,
		y: 0,
		item: null,
		isVisible: false,
		actions: [],
	});

	const showContextMenu = useCallback(
		(e: React.MouseEvent, item: PortfolioItem, actions: ContextAction[]) => {
			e.preventDefault();
			e.stopPropagation();

			setState({
				x: e.clientX,
				y: e.clientY,
				item,
				isVisible: true,
				actions,
			});
		},
		[]
	);

	const hideContextMenu = useCallback(() => {
		setState((prev) => ({ ...prev, isVisible: false }));
	}, []);

	return { state, showContextMenu, hideContextMenu };
};
```

---

## 🔄 Patterns de Données

### **Pattern : Infinite Scroll avec Virtualization**

```typescript
// Virtualisation pour grandes collections
const useVirtualScroll = (items: PortfolioItem[], itemHeight: number = 200) => {
	const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
	const [containerHeight, setContainerHeight] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);

	const visibleItems = useMemo(() => {
		return items.slice(visibleRange.start, visibleRange.end);
	}, [items, visibleRange]);

	const handleScroll = useCallback(
		(e: React.UIEvent) => {
			const { scrollTop } = e.currentTarget;
			const start = Math.floor(scrollTop / itemHeight);
			const visibleCount = Math.ceil(containerHeight / itemHeight);
			const end = start + visibleCount;

			setVisibleRange({ start, end });
		},
		[containerHeight, itemHeight]
	);

	return { containerRef, visibleItems, handleScroll, setContainerHeight };
};
```

### **Pattern : Lazy Loading d'Images**

```typescript
// Lazy loading avec Intersection Observer
const useLazyImage = (src: string, placeholder?: string) => {
	const [imageSrc, setImageSrc] = useState(placeholder || "");
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const img = imgRef.current;
		if (!img) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isLoaded && !error) {
					setImageSrc(src);
					setIsLoaded(true);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(img);

		return () => observer.disconnect();
	}, [src, isLoaded, error]);

	const handleError = () => {
		setError(true);
		setIsLoaded(true);
	};

	return { imgRef, imageSrc, isLoaded, error, handleError };
};
```

---

## 🎨 Patterns d'Animation

### **Pattern : Staggered Animations**

```typescript
// Animations décalées pour les grilles
const useStaggeredAnimation = (index: number, baseDelay: number = 50) => {
	const delay = baseDelay * index;

	return {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		transition: { delay, duration: 0.3 },
	};
};

// Utilisation dans une grille
{
	items.map((item, index) => (
		<motion.div key={item.id} {...useStaggeredAnimation(index)} whileHover={{ scale: 1.05 }}>
			<PhotoCard photo={item} />
		</motion.div>
	));
}
```

### **Pattern : Layout Animations**

```typescript
// Animations de layout fluides
const useLayoutAnimation = (isVisible: boolean) => {
	return {
		initial: { opacity: 0, scale: 0.95 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.95 },
		transition: { duration: 0.2 },
	};
};

// Utilisation pour les modales
<AnimatePresence>
	<motion.div {...useLayoutAnimation(isModalOpen)}>
		<ModalContent />
	</motion.div>
</AnimatePresence>;
```

---

## 🔔 Patterns de Formulaires

### **Pattern : Progressive Enhancement**

```typescript
// Formulaire avec validation progressive
const useFormValidation = () => {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const validateField = useCallback((name: string, value: string, rules: ValidationRules) => {
		const error = rules[name](value);
		setErrors((prev) => ({ ...prev, [name]: error }));
		setTouched((prev) => ({ ...prev, [name]: true }));
		return !error;
	}, []);

	const validateForm = useCallback((data: FormData) => {
		const errors = Object.keys(data).reduce((acc, key) => {
			const error = validationRules[key](data[key]);
			return error ? { ...acc, [key]: error } : acc;
		}, {});

		setErrors(errors);
		return Object.keys(errors).length === 0;
	}, []);

	return { errors, touched, validateField, validateForm };
};
```

### **Pattern : Auto-save**

```typescript
// Sauvegarde automatique avec debounce
const useAutoSave = (
	data: any,
	saveFunction: (data: any) => Promise<void>,
	delay: number = 1000
) => {
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	const debouncedSave = useMemo(
		() =>
			debounce(async (saveData: any) => {
				await saveFunction(saveData);
				setLastSaved(new Date());
			}, delay),
		[saveFunction, delay]
	);

	useEffect(() => {
		debouncedSave(data);
	}, [data, debouncedSave]);

	return { lastSaved };
};
```

---

## 🎯 Patterns d'Accessibilité

### **Pattern : Keyboard Navigation**

```typescript
// Navigation complète au clavier
const useKeyboardNavigation = () => {
	const [focusedIndex, setFocusedIndex] = useState(0);
	const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setFocusedIndex((prev) => Math.min(prev + 1, itemsRef.current.length - 1));
				break;
			case "ArrowUp":
				e.preventDefault();
				setFocusedIndex((prev) => Math.max(prev - 1, 0));
				break;
			case "Home":
				e.preventDefault();
				setFocusedIndex(0);
				break;
			case "End":
				e.preventDefault();
				setFocusedIndex(itemsRef.current.length - 1);
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				itemsRef.current[focusedIndex]?.click();
				break;
		}
	}, []);

	useEffect(() => {
		itemsRef.current[focusedIndex]?.focus();
	}, [focusedIndex]);

	return { focusedIndex, handleKeyDown };
};
```

### **Pattern : ARIA Labels**

```typescript
// Composant bouton accessible
const AccessibleButton = ({ icon, children, ...props }: ButtonProps) => (
	<button
		{...props}
		aria-label={children?.toString()}
		aria-describedby={icon ? `${children} icon` : undefined}
	>
		{icon && <span className="sr-only">{children} icon</span>}
		{children}
	</button>
);

// Composant avec tooltip accessible
const TooltipButton = ({ tooltip, children, ...props }: TooltipButtonProps) => (
	<div className="relative inline-block">
		<button {...props}>{children}</button>
		<div
			role="tooltip"
			className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded"
		>
			{tooltip}
		</div>
	</div>
);
```

---

## 🔄 Patterns de Performance

### **Pattern : Memoization Intelligente**

```typescript
// Memoisation basée sur les props pertinentes
const MemoizedPhotoCard = React.memo<PhotoCardProps>(
	({ photo, isSelected, onSelect, ...props }) => {
		return <PhotoCard photo={photo} isSelected={isSelected} onSelect={onSelect} {...props} />;
	},
	(prevProps, nextProps) => {
		return (
			prevProps.photo.id === nextProps.photo.id &&
			prevProps.isSelected === nextProps.isSelected &&
			prevProps.onSelect === nextProps.onSelect
		);
	}
);
```

### **Pattern : Callback Memoization**

```typescript
// Optimisation des callbacks dans les listes
const useOptimizedCallbacks = () => {
	const memoizedCallbacks = useMemo(
		() => ({
			onPhotoSelect: (id: string) => {
				// Logique de sélection optimisée
			},
			onTagAdd: (id: string, tag: string) => {
				// Logique d'ajout de tag optimisée
			},
			onColorApply: (ids: string[], color: string) => {
				// Logique d'application de couleur optimisée
			},
		}),
		[]
	);

	return memoizedCallbacks;
};
```

---

## 🎨 Patterns de State Management

### **Pattern : State Reducer**

```typescript
// Reducer pour les opérations sur les collections
interface CollectionState {
	collections: Collection[];
	activeCollection: string | null;
	isLoading: boolean;
}

type CollectionAction =
	| { type: "SET_COLLECTIONS"; payload: Collection[] }
	| { type: "ADD_COLLECTION"; payload: Collection }
	| { type: "REMOVE_COLLECTION"; payload: string }
	| { type: "SET_ACTIVE_COLLECTION"; payload: string | null }
	| { type: "SET_LOADING"; payload: boolean };

const collectionReducer = (state: CollectionState, action: CollectionAction): CollectionState => {
	switch (action.type) {
		case "SET_COLLECTIONS":
			return { ...state, collections: action.payload };
		case "ADD_COLLECTION":
			return { ...state, collections: [...state.collections, action.payload] };
		case "REMOVE_COLLECTION":
			return {
				...state,
				collections: state.collections.filter((c) => c.id !== action.payload),
				activeCollection: state.activeCollection === action.payload ? null : state.activeCollection,
			};
		case "SET_ACTIVE_COLLECTION":
			return { ...state, activeCollection: action.payload };
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		default:
			return state;
	}
};
```

### **Pattern : Context Split**

```typescript
// Séparation état/dispatch pour la performance
const CollectionContext = createContext<CollectionState | undefined>(undefined);
const CollectionDispatchContext = createContext<React.Dispatch<CollectionAction> | undefined>(
	undefined
);

const CollectionProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(collectionReducer, initialState);

	return (
		<CollectionContext.Provider value={state}>
			<CollectionDispatchContext.Provider value={dispatch}>
				{children}
			</CollectionDispatchContext.Provider>
		</CollectionContext.Provider>
	);
};

// Hooks optimisés
const useCollections = () => {
	const state = useContext(CollectionContext);
	const dispatch = useContext(CollectionDispatchContext);

	return {
		...state,
		createCollection: (collection: Collection) =>
			dispatch({ type: "ADD_COLLECTION", payload: collection }),
		removeCollection: (id: string) => dispatch({ type: "REMOVE_COLLECTION", payload: id }),
		setActiveCollection: (id: string | null) =>
			dispatch({ type: "SET_ACTIVE_COLLECTION", payload: id }),
		setLoading: (loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading }),
	};
};
```

---

## 🎯 Patterns de Thème

### **Pattern : Theme Provider**

```typescript
interface Theme {
	colors: {
		primary: string;
		background: string;
		surface: string;
		text: string;
	};
	spacing: Record<string, string>;
	typography: Record<string, string>;
}

const lightTheme: Theme = {
	colors: {
		primary: "#3b82f6",
		background: "#ffffff",
		surface: "#f8fafc",
		text: "#1f2937",
	},
	// ... autres propriétés
};

const darkTheme: Theme = {
	colors: {
		primary: "#60a5fa",
		background: "#0a0a0a",
		surface: "#121212",
		text: "#ffffff",
	},
	// ... autres propriétés
};

const ThemeProvider = ({
	children,
	theme = darkTheme,
}: {
	children: React.ReactNode;
	theme?: Theme;
}) => {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
```

### **Pattern : CSS-in-JS avec Tokens**

```typescript
// Utilisation des tokens CSS dans les composants
const StyledCard = styled.div<{ variant?: 'primary' | 'secondary' }>`
  ${({ theme, variant }) => css`
    background: ${variant === 'primary' ? theme.colors.primary : theme.colors.surface};
    color: ${theme.colors.text};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    box-shadow: ${theme.shadows.md};
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `;
```

---

## 🎯 Patterns d'Erreur

### **Pattern : Error Boundary**

```typescript
class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="error-boundary">
					<h2>Something went wrong.</h2>
					<details>
						{this.state.error && this.state.error.toString()}
						<br />
						{this.state.error.stack}
					</details>
				</div>
			);
		}

		return this.props.children;
	}
}
```

### **Pattern : Error Recovery**

```typescript
const useErrorRecovery = () => {
	const [error, setError] = useState<Error | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const retry = useCallback(() => {
		setRetryCount((prev) => prev + 1);
		setError(null);
	}, []);

	const handleError = useCallback((error: Error) => {
		setError(error);
		setRetryCount(0);
	}, []);

	const reset = useCallback(() => {
		setError(null);
		setRetryCount(0);
	}, []);

	return { error, retryCount, retry, handleError, reset };
};
```

---

## 📚 Patterns de Testing

### **Pattern : Test Utilities**

```typescript
// Utilitaires de test réutilisables
export const renderWithProviders = (component: React.ComponentType, options = {}) => {
	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider>
			<CollectionProvider>
				<Router>{children}</Router>
			</CollectionProvider>
		</ThemeProvider>
	);

	return render(component, { wrapper, ...options });
};

// Mock des hooks pour les tests
export const mockUseCollections = () => ({
	collections: [],
	activeCollection: null,
	isLoading: false,
	createCollection: vi.fn(),
	removeCollection: vi.fn(),
	setActiveCollection: vi.fn(),
	setLoading: vi.fn(),
});
```

### **Pattern : Test Scenarios**

```typescript
// Scénarios de test E2E réutilisables
export const testPhotoImport = async (page: Page) => {
  // 1. Ouvrir l'application
  await page.goto('/');

  // 2. Créer une collection
  await page.click('[data-testid="new-collection-button"]');
  await page.fill('[data-testid="collection-name-input"]', 'Test Collection');
  await page.click('[data-testid="create-collection-submit"]');

  // 3. Importer des photos
  await page.click('[data-testid="import-folder-button"]');
  // Simuler la sélection de dossier
  await page.setInputFiles('[data-testid="folder-input"] ['/path/to/photos']);
  await page.click('[data-testid="import-confirm"]');

  // 4. Vérifier l'importation
  await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
  await expect(page.locator('[data-testid="photo-item"]')).toHaveCount(10);
};
```

---

## 🎯 Patterns de Performance

### **Pattern : Debounce**

```typescript
// Utilitaire debounce réutilisable
const useDebounce = <T extends (...args: Parameters<typeof debounce>) => {
  const [debouncedValue, setDebouncedValue] = useState<T | null>(null);
  const debouncedCallback = useRef<((...args: Parameters<typeof debounce>) => void)>();

  useEffect(() => {
    debouncedCallback.current = debounce((...args) => {
      setDebouncedValue(args[0]);
    }, 300);
  }, []);

  return [debouncedValue, debouncedCallback];
};
```

### **Pattern : Throttle**

```typescript
// Utilitaire throttle pour les événements fréquents
const useThrottle = <T extends (...args: Parameters<typeof throttle>) => {
  const [throttledValue, setThrottledValue] = useState<T | null>(null);
  const lastExecuted = useRef<number>(0);

  const throttledCallback = useRef<((...args: Parameters<typeof throttle>) => void)>();

  useEffect(() => {
    throttledCallback.current = throttle((...args) => {
      setThrottledValue(args[0]);
      lastExecuted.current = Date.now();
    }, 1000);
  }, []);

  return [throttledValue, throttledCallback.current];
};
```

---

## 📚 Références

### **Patterns React**

- **[React Patterns](https://reactpatterns.com/)** : Patterns React modernes
- **[React Hooks Patterns](https://usehooks.com/)** : Hooks personnalisés
- **[React Testing Library](https://testing-library.com/docs/)** : Best practices

### **Design Systems**

- **[Material Design Patterns](https://material.io/design/)** : Patterns Material Design
- **[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)** : Guidelines Apple
- **[Google Material Design](https://material.io/design/)** : Guidelines Google

### **Performance**

- **[Web Performance Optimization](https://web.dev/performance/)** : Optimisations web
- **[React Performance](https://react.dev/learn/react/render-and-performance/)** : Performance React

---

**Ces patterns assurent une expérience utilisateur cohérente et performante ! 🎯**
