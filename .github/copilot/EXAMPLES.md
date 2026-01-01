# Quick Reference - GitHub Copilot Examples

This file provides quick examples of how GitHub Copilot will help you write code that follows the Lumina Portfolio conventions.

## 🎯 React Components

### Basic Component
**Type this:**
```typescript
// PhotoCard.tsx
export const PhotoCard
```

**Copilot completes with:**
```typescript
export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, isSelected, onSelect }) => {
	return (
		<div 
			className="relative cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden"
			onClick={() => onSelect(photo.id)}
		>
			<img 
				src={photo.path} 
				alt={photo.name}
				className="w-full h-full object-cover"
			/>
		</div>
	);
};

interface PhotoCardProps {
	photo: Photo;
	isSelected: boolean;
	onSelect: (id: string) => void;
}
```

### Component with State
**Type this:**
```typescript
export const SearchBar
```

**Copilot suggests:**
```typescript
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
	const [query, setQuery] = useState<string>("");
	
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(query);
	};
	
	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search photos..."
				className="flex-1 px-4 py-2 rounded-lg bg-white/10"
			/>
			<button type="submit" className="px-4 py-2 rounded-lg bg-blue-500">
				Search
			</button>
		</form>
	);
};

interface SearchBarProps {
	onSearch: (query: string) => void;
}
```

## 🪝 Custom Hooks

**Type this:**
```typescript
// usePhotos.ts
export const usePhotos
```

**Copilot completes with:**
```typescript
export const usePhotos = (folderId?: string) => {
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
		const loadPhotos = async () => {
			setIsLoading(true);
			setError(null);
			
			try {
				const result = await invoke<Photo[]>("load_photos", { 
					folderId: folderId ?? null 
				});
				setPhotos(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load photos");
			} finally {
				setIsLoading(false);
			}
		};
		
		loadPhotos();
	}, [folderId]);
	
	return { photos, isLoading, error };
};
```

## 🦀 Tauri Commands

**Type this:**
```rust
// src-tauri/src/commands/photos.rs
#[command]
pub fn load_photos
```

**Copilot completes with:**
```rust
#[command]
pub fn load_photos(folder_id: Option<String>) -> Result<Vec<Photo>, String> {
	// Validate input
	if let Some(ref id) = folder_id {
		if id.is_empty() {
			return Err("Folder ID cannot be empty".to_string());
		}
	}
	
	// Database query would go here
	// For example:
	let photos = query_photos(folder_id)
		.map_err(|e| format!("Database error: {}", e))?;
	
	Ok(photos)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Photo {
	pub id: String,
	pub path: String,
	pub name: String,
	pub size: i64,
}
```

## 🗄️ Database Operations

**Type this:**
```rust
#[command]
pub async fn save_photo
```

**Copilot suggests:**
```rust
#[command]
pub async fn save_photo(
	photo: Photo,
	db: State<'_, Database>
) -> Result<(), String> {
	sqlx::query!(
		"INSERT INTO photos (id, path, name, size, date_added) VALUES (?, ?, ?, ?, ?)",
		photo.id,
		photo.path,
		photo.name,
		photo.size,
		chrono::Utc::now().to_rfc3339()
	)
	.execute(&db.pool)
	.await
	.map_err(|e| format!("Failed to save photo: {}", e))?;
	
	Ok(())
}
```

## 🧪 Testing

### Component Test
**Type this:**
```typescript
// PhotoCard.test.tsx
describe("PhotoCard", () => {
	it("should
```

**Copilot completes with:**
```typescript
describe("PhotoCard", () => {
	it("should render photo with correct attributes", () => {
		// Arrange
		const mockPhoto: Photo = {
			id: "1",
			path: "/test/photo.jpg",
			name: "photo.jpg",
			size: 1024,
			dateTaken: new Date("2024-01-01"),
		};
		
		// Act
		render(<PhotoCard photo={mockPhoto} isSelected={false} onSelect={vi.fn()} />);
		
		// Assert
		const img = screen.getByRole("img", { name: /photo\.jpg/i });
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", mockPhoto.path);
	});
	
	it("should call onSelect when clicked", async () => {
		const mockPhoto: Photo = {
			id: "1",
			path: "/test/photo.jpg",
			name: "photo.jpg",
			size: 1024,
			dateTaken: null,
		};
		const handleSelect = vi.fn();
		
		render(<PhotoCard photo={mockPhoto} isSelected={false} onSelect={handleSelect} />);
		
		const card = screen.getByRole("img").parentElement;
		await userEvent.click(card!);
		
		expect(handleSelect).toHaveBeenCalledWith("1");
	});
});
```

### Hook Test
**Type this:**
```typescript
describe("usePhotos", () => {
	it("should
```

**Copilot suggests:**
```typescript
describe("usePhotos", () => {
	it("should load photos on mount", async () => {
		// Arrange
		const mockPhotos: Photo[] = [
			{ id: "1", path: "/photo1.jpg", name: "photo1.jpg", size: 1024, dateTaken: null },
			{ id: "2", path: "/photo2.jpg", name: "photo2.jpg", size: 2048, dateTaken: null },
		];
		
		vi.mocked(invoke).mockResolvedValue(mockPhotos);
		
		// Act
		const { result } = renderHook(() => usePhotos("folder-1"));
		
		// Assert
		expect(result.current.isLoading).toBe(true);
		
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
		
		expect(result.current.photos).toEqual(mockPhotos);
		expect(result.current.error).toBeNull();
	});
});
```

## 🎨 Styling with Tailwind

**Type this:**
```typescript
<div className="photo-grid
```

**Copilot suggests:**
```typescript
<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
	{photos.map((photo) => (
		<PhotoCard key={photo.id} photo={photo} />
	))}
</div>
```

**Type this:**
```typescript
<div className="modal
```

**Copilot suggests:**
```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/50">
	<div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-2xl w-full">
		{/* Modal content */}
	</div>
</div>
```

## 🛡️ Security Patterns

### API Key Validation
**Type this:**
```typescript
const validateApiKey
```

**Copilot suggests:**
```typescript
const validateApiKey = (key: string): boolean => {
	if (!key || key.trim() === "") {
		throw new Error("API key is required");
	}
	
	if (key.length < 32) {
		throw new Error("Invalid API key format");
	}
	
	return true;
};
```

### Path Validation
**Type this:**
```rust
fn validate_path
```

**Copilot suggests:**
```rust
fn validate_path(path: &str) -> Result<PathBuf, String> {
	// Prevent directory traversal
	if path.contains("..") || path.contains("~") {
		return Err("Invalid path: directory traversal detected".to_string());
	}
	
	let path = Path::new(path);
	
	// Canonicalize to resolve symlinks and relative paths
	let canonical = path.canonicalize()
		.map_err(|e| format!("Invalid path: {}", e))?;
	
	Ok(canonical)
}
```

## 📦 Context Providers

**Type this:**
```typescript
// LibraryContext.tsx
export const LibraryProvider
```

**Copilot completes with:**
```typescript
const LibraryStateContext = createContext<LibraryState | undefined>(undefined);
const LibraryDispatchContext = createContext<LibraryDispatch | undefined>(undefined);

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

export const useLibraryState = () => {
	const context = useContext(LibraryStateContext);
	if (!context) {
		throw new Error("useLibraryState must be used within LibraryProvider");
	}
	return context;
};

export const useLibraryDispatch = () => {
	const context = useContext(LibraryDispatchContext);
	if (!context) {
		throw new Error("useLibraryDispatch must be used within LibraryProvider");
	}
	return context;
};
```

## 🔄 Error Handling

### Frontend
**Type this:**
```typescript
try {
	const result = await fetchData();
```

**Copilot suggests:**
```typescript
try {
	const result = await fetchData();
	setData(result);
	setError(null);
} catch (err) {
	const errorMessage = err instanceof Error 
		? err.message 
		: "An unexpected error occurred";
	setError(errorMessage);
	console.error("Failed to fetch data:", err);
}
```

### Backend
**Type this:**
```rust
match operation() {
```

**Copilot suggests:**
```rust
match operation() {
	Ok(result) => Ok(result),
	Err(e) => {
		eprintln!("Operation failed: {}", e);
		Err("Failed to complete operation".to_string())
	}
}
```

## 🚀 Performance Optimization

**Type this:**
```typescript
const sortedPhotos = useMemo
```

**Copilot suggests:**
```typescript
const sortedPhotos = useMemo(() => {
	return [...photos].sort((a, b) => {
		if (!a.dateTaken) return 1;
		if (!b.dateTaken) return -1;
		return b.dateTaken.getTime() - a.dateTaken.getTime();
	});
}, [photos]);
```

**Type this:**
```typescript
const MemoizedPhotoCard = React.memo
```

**Copilot suggests:**
```typescript
const MemoizedPhotoCard = React.memo<PhotoCardProps>(
	({ photo, isSelected, onSelect }) => {
		return <PhotoCard photo={photo} isSelected={isSelected} onSelect={onSelect} />;
	},
	(prevProps, nextProps) => {
		return (
			prevProps.photo.id === nextProps.photo.id &&
			prevProps.isSelected === nextProps.isSelected
		);
	}
);
```

## 💡 Tips for Getting Better Suggestions

1. **Start with descriptive names**: `export const PhotoGrid` is better than `export const Component`
2. **Add type hints**: Type the interface name to get props suggestions
3. **Use comments**: `// Component for displaying a grid of photos with infinite scroll`
4. **Follow patterns**: Copilot learns from existing code in the project
5. **Be specific**: `handlePhotoSelect` is better than `handleClick`

## ⚠️ When to Ignore Suggestions

- When Copilot suggests hardcoded secrets or API keys
- When suggestions don't follow the security guidelines
- When the pattern doesn't match project architecture
- When suggestions are overly complex for simple tasks
- When accessibility is missing from UI suggestions

Always review and test code suggestions before accepting them!
