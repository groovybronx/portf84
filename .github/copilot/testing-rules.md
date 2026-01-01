# Testing Ruleset - Vitest & React Testing Library

## Test File Organization

### Directory Structure
```
tests/
├── unit/              # Unit tests
│   ├── components/    # Component tests
│   ├── hooks/         # Custom hook tests
│   └── services/      # Service tests
├── integration/       # Integration tests
└── setup.ts          # Test configuration
```

### File Naming
- Test files: `*.test.ts` or `*.test.tsx`
- Mirror the source file structure
- Example: `src/features/library/PhotoGrid.tsx` → `tests/unit/components/PhotoGrid.test.tsx`

## Component Testing

### Basic Component Test
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/shared/components/Button";

describe("Button", () => {
	it("should render with correct text", () => {
		render(<Button>Click me</Button>);
		
		expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
	});
	
	it("should handle click events", async () => {
		const handleClick = vi.fn();
		const { user } = render(<Button onClick={handleClick}>Click me</Button>);
		
		await user.click(screen.getByRole("button"));
		
		expect(handleClick).toHaveBeenCalledTimes(1);
	});
	
	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Click me</Button>);
		
		expect(screen.getByRole("button")).toBeDisabled();
	});
});
```

### Testing with Context
```typescript
import { render, screen } from "@testing-library/react";
import { LibraryProvider } from "@/shared/contexts/LibraryContext";

const renderWithContext = (ui: React.ReactElement) => {
	return render(
		<LibraryProvider>
			{ui}
		</LibraryProvider>
	);
};

describe("PhotoGrid", () => {
	it("should display photos from context", () => {
		renderWithContext(<PhotoGrid />);
		
		expect(screen.getByRole("grid")).toBeInTheDocument();
	});
});
```

### Mocking Tauri APIs
```typescript
import { vi, beforeEach } from "vitest";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("LibraryLoader", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	
	it("should load photos from file system", async () => {
		const mockPhotos = [
			{ id: "1", path: "/path/to/photo1.jpg", name: "photo1.jpg" },
			{ id: "2", path: "/path/to/photo2.jpg", name: "photo2.jpg" },
		];
		
		vi.mocked(invoke).mockResolvedValue(mockPhotos);
		
		const photos = await loadPhotos("/test/path");
		
		expect(invoke).toHaveBeenCalledWith("load_photos", { path: "/test/path" });
		expect(photos).toEqual(mockPhotos);
	});
});
```

## Custom Hook Testing

### Testing Hook Logic
```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { usePhotos } from "@/shared/hooks/usePhotos";

describe("usePhotos", () => {
	it("should initialize with empty photos array", () => {
		const { result } = renderHook(() => usePhotos());
		
		expect(result.current.photos).toEqual([]);
		expect(result.current.isLoading).toBe(false);
	});
	
	it("should load photos on mount", async () => {
		const { result } = renderHook(() => usePhotos("/test/path"));
		
		expect(result.current.isLoading).toBe(true);
		
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
		
		expect(result.current.photos.length).toBeGreaterThan(0);
	});
});
```

## Service Testing

### Pure Function Testing
```typescript
import { describe, it, expect } from "vitest";
import { formatDate, calculateFileSize } from "@/shared/utils";

describe("formatDate", () => {
	it("should format date correctly", () => {
		const date = new Date("2024-01-15T10:30:00");
		
		expect(formatDate(date)).toBe("Jan 15, 2024");
	});
	
	it("should handle null dates", () => {
		expect(formatDate(null)).toBe("Unknown");
	});
});

describe("calculateFileSize", () => {
	it("should format bytes to KB", () => {
		expect(calculateFileSize(1024)).toBe("1 KB");
	});
	
	it("should format bytes to MB", () => {
		expect(calculateFileSize(1048576)).toBe("1 MB");
	});
});
```

### Async Service Testing
```typescript
import { describe, it, expect, vi } from "vitest";
import { analyzeImage } from "@/services/geminiService";

// Mock fetch
global.fetch = vi.fn();

describe("geminiService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	
	it("should analyze image successfully", async () => {
		const mockResponse = {
			description: "A beautiful sunset",
			tags: ["sunset", "nature"],
		};
		
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response);
		
		const result = await analyzeImage("base64-image-data");
		
		expect(result).toEqual(mockResponse);
	});
	
	it("should handle API errors", async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 400,
		} as Response);
		
		await expect(analyzeImage("invalid-data")).rejects.toThrow();
	});
});
```

## User Interaction Testing

### User Events
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("SearchBar", () => {
	it("should update search query on input", async () => {
		const user = userEvent.setup();
		const handleSearch = vi.fn();
		
		render(<SearchBar onSearch={handleSearch} />);
		
		const input = screen.getByRole("textbox");
		await user.type(input, "sunset");
		
		expect(input).toHaveValue("sunset");
		expect(handleSearch).toHaveBeenCalledWith("sunset");
	});
	
	it("should clear search on button click", async () => {
		const user = userEvent.setup();
		
		render(<SearchBar onSearch={vi.fn()} />);
		
		const input = screen.getByRole("textbox");
		await user.type(input, "test");
		
		const clearButton = screen.getByRole("button", { name: /clear/i });
		await user.click(clearButton);
		
		expect(input).toHaveValue("");
	});
});
```

## Accessibility Testing

### ARIA and Semantic HTML
```typescript
describe("PhotoCard accessibility", () => {
	it("should have accessible name", () => {
		render(<PhotoCard name="Sunset.jpg" />);
		
		expect(screen.getByRole("img", { name: /sunset/i })).toBeInTheDocument();
	});
	
	it("should support keyboard navigation", async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();
		
		render(<PhotoCard onSelect={handleSelect} />);
		
		const card = screen.getByRole("button");
		card.focus();
		
		expect(card).toHaveFocus();
		
		await user.keyboard("{Enter}");
		expect(handleSelect).toHaveBeenCalled();
	});
});
```

## Test Patterns

### AAA Pattern (Arrange, Act, Assert)
```typescript
it("should add photo to favorites", async () => {
	// Arrange
	const photo = { id: "1", name: "test.jpg" };
	const { user } = render(<PhotoCard photo={photo} />);
	
	// Act
	const favoriteButton = screen.getByRole("button", { name: /favorite/i });
	await user.click(favoriteButton);
	
	// Assert
	expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
});
```

### Test Isolation
```typescript
import { beforeEach, afterEach } from "vitest";

describe("StorageService", () => {
	let mockDb: Database;
	
	beforeEach(() => {
		// Setup fresh database for each test
		mockDb = createMockDatabase();
	});
	
	afterEach(() => {
		// Clean up after each test
		mockDb.close();
	});
	
	it("should save photo", async () => {
		const photo = { id: "1", name: "test.jpg" };
		await mockDb.savePhoto(photo);
		
		const saved = await mockDb.getPhoto("1");
		expect(saved).toEqual(photo);
	});
});
```

## Edge Cases and Error States

### Error Handling Tests
```typescript
describe("ErrorBoundary", () => {
	it("should catch and display errors", () => {
		const ThrowError = () => {
			throw new Error("Test error");
		};
		
		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);
		
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});
});

describe("AsyncComponent", () => {
	it("should handle loading state", () => {
		render(<AsyncComponent isLoading={true} />);
		
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});
	
	it("should handle error state", () => {
		const error = "Failed to load";
		render(<AsyncComponent error={error} />);
		
		expect(screen.getByText(error)).toBeInTheDocument();
	});
	
	it("should handle empty state", () => {
		render(<AsyncComponent data={[]} />);
		
		expect(screen.getByText(/no items found/i)).toBeInTheDocument();
	});
});
```

## Running Tests

### Commands
```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run with coverage report
```

### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./tests/setup.ts",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
});
```

## Anti-Patterns to Avoid

❌ Don't test implementation details
```typescript
// Bad: Testing internal state
expect(component.state.count).toBe(1);

// Good: Testing visible behavior
expect(screen.getByText("Count: 1")).toBeInTheDocument();
```

❌ Don't use arbitrary waits
```typescript
// Bad
await new Promise(resolve => setTimeout(resolve, 1000));

// Good
await waitFor(() => {
	expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

❌ Don't share state between tests
```typescript
// Bad
let sharedState = [];

it("test 1", () => {
	sharedState.push("item");
});

it("test 2", () => {
	expect(sharedState.length).toBe(1); // Flaky!
});

// Good: Use beforeEach for setup
let state: string[];

beforeEach(() => {
	state = [];
});
```
