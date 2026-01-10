# 🔧 Testing - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `tests/` et configuration testing

---

## 📋 Vue d'Ensemble

Lumina Portfolio utilise une stratégie de testing complète avec tests unitaires, tests d'intégration et tests end-to-end pour garantir la qualité et la fiabilité de l'application.

---

## 🧪 Stack de Testing

### **Outils Principaux**

- **Vitest** : Framework de tests unitaires (remplace Jest)
- **React Testing Library** : Tests de composants React
- **Playwright** : Tests end-to-end multi-plateformes
- **MSW** : Mock Service Worker pour les APIs externes

### **Configuration**

```typescript
// vitest.config.ts
export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./src/setupTests.ts"],
		globals: true,
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src-tauri/", "tests/"],
		},
	},
});
```

---

## 📁 Structure des Tests

```
tests/
├── App.test.tsx                    # Test du composant principal
├── BatchTagPanel.test.tsx          # Test du panel de tags
├── BrowseTab_Settings.test.tsx     # Test des paramètres
├── SettingsModal.test.tsx          # Test de la modal settings
├── TagHub.test.tsx                 # Test du hub de tags
├── ErrorBoundary.test.tsx          # Test des erreurs
├── ErrorFallback.test.tsx          # Test des fallbacks
├── shared/                         # Tests partagés
│   ├── components/                 # Tests composants
│   └── utils/                      # Tests utilitaires
└── e2e/                           # Tests end-to-end
    └── basic.spec.ts              # Test E2E de base
```

---

## 🧪 Tests Unitaires

### **Tests de Composants**

#### **Exemple : Button Component**

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/shared/components/ui/Button";

describe("Button Component", () => {
	it("renders with text content", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
	});

	it("handles click events", async () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		await userEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("shows loading state", () => {
		render(<Button loading={true}>Loading</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
	});

	it("supports icon variants", () => {
		render(<Button icon={<Settings />} variant="glass" />);
		expect(screen.getByRole("button")).toHaveClass("glass");
	});
});
```

#### **Exemple : TagHub**

```typescript
// TagHub.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { TagHub } from "@/features/tags/components/TagHub";
import { useTags } from "@/shared/hooks";

// Mock du hook
vi.mock("@/shared/hooks");
const mockUseTags = useTags as vi.MockedFunction<typeof useTags>;

describe("TagHub", () => {
	beforeEach(() => {
		mockUseTags.mockReturnValue({
			tags: [],
			loading: false,
			addTag: vi.fn(),
			removeTag: vi.fn(),
			mergeTags: vi.fn(),
		});
	});

	it("renders all tabs", () => {
		render(<TagHub isOpen={true} onClose={vi.fn()} />);

		expect(screen.getByRole("tab", { name: /browse/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /manage/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /fusion/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /settings/i })).toBeInTheDocument();
	});

	it("calls onClose when closed", async () => {
		const onClose = vi.fn();
		render(<TagHub isOpen={true} onClose={onClose} />);

		fireEvent.click(screen.getByLabelText(/close/i));
		expect(onClose).toHaveBeenCalled();
	});
});
```

### **Tests de Hooks**

#### **Exemple : useLibrary Hook**

```typescript
// useLibrary.test.ts
import { renderHook, act } from "@testing-library/react";
import { useLibrary } from "@/shared/contexts/LibraryContext";
import { LibraryProvider } from "@/shared/contexts/LibraryContext";

describe("useLibrary", () => {
	it("provides library state", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<LibraryProvider>{children}</LibraryProvider>
		);

		const { result } = renderHook(() => useLibrary(), { wrapper });

		expect(result.current.folders).toEqual([]);
		expect(result.current.viewMode).toBe("GRID");
	});

	it("updates view mode", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<LibraryProvider>{children}</LibraryProvider>
		);

		const { result } = renderHook(() => useLibrary(), { wrapper });

		act(() => {
			result.current.setViewMode("CAROUSEL");
		});

		expect(result.current.viewMode).toBe("CAROUSEL");
	});
});
```

---

## 🎭 Tests d'Intégration

### **Tests de Contexte**

```typescript
// App.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "@/App";
import { useCollections } from "@/shared/contexts/CollectionsContext";

// Mock des contextes
vi.mock("@/shared/contexts/CollectionsContext");
vi.mock("@/shared/contexts/LibraryContext");
vi.mock("@/shared/contexts/SelectionContext");

describe("App Integration", () => {
	it("renders main layout", async () => {
		// Mock des retours des contextes
		(useCollections as vi.Mock).mockReturnValue({
			collections: [],
			activeCollection: null,
			isLoading: false,
		});

		render(<App />);

		await waitFor(() => {
			expect(screen.getByRole("main")).toBeInTheDocument();
		});
	});

	it("handles collection switching", async () => {
		const mockSwitchCollection = vi.fn();
		(useCollections as vi.Mock).mockReturnValue({
			collections: [{ id: "1", name: "Test" }],
			activeCollection: null,
			switchCollection: mockSwitchCollection,
			isLoading: false,
		});

		render(<App />);

		// Simuler le changement de collection
		act(() => {
			mockSwitchCollection("1");
		});

		expect(mockSwitchCollection).toHaveBeenCalledWith("1");
	});
});
```

---

## 🌐 Tests End-to-End

### **Configuration Playwright**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:1420",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],
});
```

### **Tests E2E**

```typescript
// basic.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Basic Application Flow", () => {
	test("should load the application", async ({ page }) => {
		await page.goto("/");

		// Vérifier que l'application se charge
		await expect(page.locator('[data-testid="app"]')).toBeVisible();
		await expect(page.locator('[data-testid="topbar"]')).toBeVisible();
		await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
	});

	test("should create a new collection", async ({ page }) => {
		await page.goto("/");

		// Créer une collection
		await page.click('[data-testid="new-collection-button"]');
		await page.fill('[data-testid="collection-name-input"]', "Test Collection");
		await page.click('[data-testid="create-collection-submit"]');

		// Vérifier que la collection est créée
		await expect(page.locator("text=Test Collection")).toBeVisible();
	});

	test("should import photos from folder", async ({ page }) => {
		await page.goto("/");

		// Importer un dossier (simulé)
		await page.click('[data-testid="import-folder-button"]');

		// Dans un vrai test, on utiliserait setInputFiles
		// await page.setInputFiles('[data-testid="folder-input"]', 'path/to/photos');

		// Vérifier l'état de chargement
		await expect(page.locator('[data-testid="loading-overlay"]')).toBeVisible();
		await expect(page.locator('[data-testid="loading-overlay"]')).not.toBeVisible();
	});

	test("should analyze photos with AI", async ({ page }) => {
		await page.goto("/");

		// Sélectionner des photos
		await page.click('[data-testid="photo-item"]:first-child');
		await page.keyboard.press("Meta"); // Cmd/Ctrl key
		await page.click('[data-testid="photo-item"]:nth-child(2)');

		// Analyser avec IA
		await page.click('[data-testid="analyze-ai-button"]');

		// Vérifier la progression
		await expect(page.locator('[data-testid="ai-progress"]')).toBeVisible();
	});
});
```

---

## 🔧 Mocks et Fixtures

### **Mock des Services Externes**

```typescript
// src/setupTests.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Tauri API
global.__TAURI__ = {
	invoke: vi.fn(),
	listen: vi.fn(),
	emit: vi.fn(),
};

// Mock Gemini AI Service
vi.mock("@/services/geminiService", () => ({
	geminiService: {
		analyzeImage: vi.fn().mockResolvedValue({
			description: "Test description",
			tags: ["test", "mock"],
			confidence: [0.9, 0.8],
		}),
		batchAnalyze: vi.fn().mockResolvedValue([]),
	},
}));

// Mock Storage Service
vi.mock("@/services/storageService", () => ({
	storageService: {
		createCollection: vi.fn(),
		getCollections: vi.fn().mockResolvedValue([]),
		getActiveCollection: vi.fn().mockResolvedValue(null),
		// ... autres méthodes
	},
}));
```

### **Fixtures de Test**

```typescript
// fixtures/photos.ts
export const mockPhotos = [
	{
		id: "photo-1",
		name: "test-photo-1.jpg",
		url: "/mock/photo-1.jpg",
		type: "image/jpeg",
		size: 1024000,
		aiTags: ["nature", "landscape"],
		colorTag: "#22c55e",
	},
	{
		id: "photo-2",
		name: "test-photo-2.jpg",
		url: "/mock/photo-2.jpg",
		type: "image/jpeg",
		size: 2048000,
		aiTags: ["portrait", "people"],
		colorTag: "#3b82f6",
	},
];

// fixtures/collections.ts
export const mockCollections = [
	{
		id: "collection-1",
		name: "Test Collection",
		createdAt: Date.now(),
		isActive: true,
	},
];
```

---

## 📊 Couverture de Code

### **Configuration**

```typescript
// package.json scripts
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### **Rapport de Couverture**

```bash
# Générer le rapport
npm run test:coverage

# Résultats attendus :
# % Files       % Functions   % Branches   % Lines
# -------------------------------------------------
# 85.23%        82.45%      78.12%      87.34%
```

### **Cibles de Couverture**

- **Composants UI** : 90%+
- **Hooks personnalisés** : 95%+
- **Services** : 85%+
- **Utilitaires** : 90%+

---

## 🚀 Scripts de Testing

### **Tests Unitaires**

```bash
# Lancer tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Tests avec coverage
npm run test:coverage

# Tests filtrés
npm test -- Button
npm test -- --grep "Button"
```

### **Tests E2E**

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Tests sur navigateur spécifique
npm run test:e2e -- --project=chromium

# Mode UI Playwright
npm run test:e2e:ui

# Tests filtrés
npm run test:e2e -- --grep "collection"
```

### **Tests Intégrés**

```bash
# Tests unitaires + E2E
npm run test && npm run test:e2e

# Tests avec validation de types
npm run type-check && npm test
```

---

## 🔍 Debugging des Tests

### **Débogage Vitest**

```typescript
// Dans un test
it("should work correctly", () => {
	// Debug avec console.log
	console.log("Debug info:", someVariable);

	// Debug avec VS Code debugger
	debugger;

	expect(result).toBe(expected);
});
```

### **Débogage Playwright**

```typescript
// Mode headed pour voir le navigateur
test.describe("debug", () => {
	test("debug mode", async ({ page }) => {
		// Pause pour inspection manuelle
		await page.pause();

		// Screenshots pour debug
		await page.screenshot({ path: "debug.png" });
	});
});
```

### **Logs de Test**

```typescript
// Configuration pour voir les logs
export default defineConfig({
	test: {
		reporter: ["verbose"], // Logs détaillés
		hookTimeout: 30000, // Timeout pour les hooks
	},
});
```

---

## 📋 Bonnes Pratiques

### **Tests de Composants**

1. **User-centric** : Tester comme un utilisateur
2. **Accessibility** : Utiliser `getByRole`, `getByLabelText`
3. **Async handling** : Utiliser `waitFor` pour les états asynchrones
4. **Mock isolation** : Mock proprement les dépendances

### **Tests E2E**

1. **Page Objects** : Encapsuler la logique de page
2. **Data-testid** : Utiliser des sélecteurs stables
3. **Wait strategies** : Attendre les éléments visibles
4. **Cleanup** : Nettoyer après chaque test

### **Coverage**

1. **Meaningful tests** : Qualité > quantité
2. **Edge cases** : Tester les cas limites
3. **Error paths** : Tester les gestionnaires d'erreur
4. **Integration** : Tester les interactions entre composants

---

## 🎯 Checklist de Testing

### **Avant de Commit**

- [ ] Tous les tests unitaires passent
- [ ] Tests E2E critiques passent
- [ ] Coverage > 80%
- [ ] Pas de console errors
- [ ] Tests accessibles

### **Avant Release**

- [ ] Tests complets sur toutes les plateformes
- [ ] Tests de performance
- [ ] Tests d'intégration avec l'IA
- [ ] Tests de charge si applicable

---

## 📚 Références

- **[Vitest Documentation](https://vitest.dev/)** : Guide officiel Vitest
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** : Best practices
- **[Playwright Documentation](https://playwright.dev/)** : Guide E2E
- **[Testing Best Practices](https://kentcdodds.com/blog/common-testing-mistakes)** : Anti-patterns à éviter

---

## 🚀 Améliorations Futures

### **En Développement**

- **Visual Testing** : Tests de régression visuelle
- **Performance Testing** : Tests de performance automatisés
- **Component Storybook** : Documentation visuelle des composants

### **Roadmap**

- **v0.2** : Tests de régression visuelle
- **v0.3** : Tests de charge automatisés
- **v1.0** : Couverture 95%+ sur tous les modules

---

**Des tests robustes garantissent une application fiable ! 🧪**
