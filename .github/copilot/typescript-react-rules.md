# TypeScript & React Ruleset

## Component Structure

### Functional Components
```typescript
import React from "react";

interface MyComponentProps {
	title: string;
	isActive?: boolean;
	onAction: (id: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, isActive = false, onAction }) => {
	// Component implementation
};
```

### Custom Hooks
```typescript
import { useState, useEffect } from "react";

export const useCustomHook = (initialValue: string) => {
	const [value, setValue] = useState<string>(initialValue);
	
	useEffect(() => {
		// Effect logic
	}, [value]);
	
	return { value, setValue };
};
```

## Import Organization

Always organize imports in this order:
1. React imports
2. External library imports
3. Internal imports using @/ alias

```typescript
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useLibrary } from "@/shared/contexts/LibraryContext";
import { Button } from "@/shared/components";
import { formatDate } from "@/shared/utils";
```

## State Management

### Local State
```typescript
const [items, setItems] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
```

### Context Pattern (Split Contexts)
```typescript
// Context definition
const LibraryStateContext = createContext<LibraryState | undefined>(undefined);
const LibraryDispatchContext = createContext<LibraryDispatch | undefined>(undefined);

// Provider
export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, dispatch] = useReducer(libraryReducer, initialState);
	
	return (
		<LibraryStateContext.Provider value={state}>
			<LibraryDispatchContext.Provider value={dispatch}>
				{children}
			</LibraryDispatchContext.Provider>
		</LibraryStateContext.Provider>
	);
};

// Hooks
export const useLibraryState = () => {
	const context = useContext(LibraryStateContext);
	if (!context) throw new Error("useLibraryState must be used within LibraryProvider");
	return context;
};

export const useLibraryDispatch = () => {
	const context = useContext(LibraryDispatchContext);
	if (!context) throw new Error("useLibraryDispatch must be used within LibraryProvider");
	return context;
};
```

## Type Safety

### Interface Definitions
```typescript
interface Photo {
	readonly id: string;
	readonly path: string;
	readonly name: string;
	readonly size: number;
	readonly dateTaken: Date | null;
	metadata?: PhotoMetadata;
}

interface PhotoMetadata {
	width: number;
	height: number;
	format: string;
	exif?: ExifData;
}
```

### Type Guards
```typescript
const isPhoto = (item: unknown): item is Photo => {
	return (
		typeof item === "object" &&
		item !== null &&
		"id" in item &&
		"path" in item &&
		typeof (item as Photo).id === "string"
	);
};
```

## Performance Optimization

### React.memo
```typescript
export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ data, onAction }) => {
	// Component logic
}, (prevProps, nextProps) => {
	// Custom comparison function (optional)
	return prevProps.data.id === nextProps.data.id;
});
```

### useMemo
```typescript
const sortedItems = useMemo(() => {
	return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### useCallback
```typescript
const handleAction = useCallback((id: string) => {
	// Handler logic
}, [dependencies]);
```

## Code Style

- **Indentation**: Use tabs
- **Quotes**: Use double quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: Keep under 100 characters when reasonable
- **Arrow Functions**: Prefer arrow functions for components and callbacks
- **Destructuring**: Always destructure props and context values

## Anti-Patterns to Avoid

❌ Don't use `any` type
```typescript
// Bad
const handleData = (data: any) => { ... };

// Good
const handleData = (data: unknown) => {
	if (isValidData(data)) {
		// Type-safe handling
	}
};
```

❌ Don't mutate state directly
```typescript
// Bad
items.push(newItem);
setItems(items);

// Good
setItems([...items, newItem]);
```

❌ Don't use default exports
```typescript
// Bad
export default MyComponent;

// Good
export const MyComponent: React.FC = () => { ... };
```

❌ Don't forget to clean up effects
```typescript
// Bad
useEffect(() => {
	window.addEventListener("resize", handleResize);
}, []);

// Good
useEffect(() => {
	window.addEventListener("resize", handleResize);
	return () => window.removeEventListener("resize", handleResize);
}, [handleResize]);
```
