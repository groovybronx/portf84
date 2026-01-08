# 🏗️ Architecture - Lumina Portfolio

**System design and technical architecture for Lumina Portfolio v0.3.0-beta.1**

**Last Update**: January 8, 2026 (Updated with App.tsx modularization)

---

## 📋 Overview

Lumina Portfolio is built with a modern, feature-based architecture that prioritizes maintainability, performance, and developer experience. The application combines React frontend with Tauri native runtime for optimal desktop performance.

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18.3.1 + TypeScript | UI Framework |
| **Styling** | Tailwind CSS v4 | Design System |
| **State** | React Context + useReducer | Global State |
| **Animations** | Framer Motion v12 | UI Animations |
| **Runtime** | Tauri v2 | Native Desktop App |
| **Database** | SQLite (via plugin) | Local Storage |
| **AI** | Google Gemini API | Image Analysis |
| **Testing** | Vitest | Unit/Integration Tests |
| **Build** | Vite | Fast Development |

---

## 🏛️ Architectural Principles

### 1. Feature-Based Architecture

Code is organized by **feature** rather than by **type**:

```
✅ GOOD (Feature-Based)
src/features/library/components/PhotoGrid.tsx
src/features/library/hooks/useLibrary.ts
src/features/library/types.ts

❌ BAD (Type-Based)
src/components/PhotoGrid.tsx
src/hooks/useLibrary.ts
src/types/library.ts
```

### 2. Separation of Concerns

- **UI Layer**: React components and hooks
- **Business Logic**: Services and utilities
- **Data Layer**: SQLite storage and API integration
- **Shared Layer**: Reusable components and utilities

### 3. Performance First

- **React.memo** for expensive components
- **Virtualization** for large lists
- **Context splitting** to prevent unnecessary re-renders
- **Lazy loading** for heavy features

---

## 📁 Directory Structure

```
src/
├── features/                    # Feature modules
│   ├── library/               # Photo grid, view modes, infinite scroll
│   │   ├── components/         # Library-specific components
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── PhotoCard.tsx
│   │   │   └── ViewModeToggle.tsx
│   │   ├── hooks/              # Library-specific hooks
│   │   │   ├── useLibrary.ts
│   │   │   └── usePhotoSelection.ts
│   │   ├── types/              # Library types
│   │   │   └── library.ts
│   │   └── utils/              # Library utilities
│   │       ├── filtering.ts
│   │       └── sorting.ts
│   ├── navigation/            # TopBar, sidebar, navigation
│   │   ├── components/
│   │   │   ├── TopBar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── hooks/
│   │       └── useNavigation.ts
│   ├── layout/                # Layout components (NEW)
│   │   ├── AppLayout.tsx      # Main application layout
│   │   ├── MainLayout.tsx     # Content area layout
│   │   └── index.ts           # Layout exports
│   ├── overlays/              # Overlay and modal components (NEW)
│   │   ├── AppOverlays.tsx    # Context menu, image viewer, drag selection
│   │   ├── AppModals.tsx      # All modal dialogs
│   │   └── index.ts           # Overlay exports
│   ├── vision/                # AI analysis, image viewer
│   │   ├── components/
│   │   │   ├── ImageViewer.tsx
│   │   │   └── AnalysisPanel.tsx
│   │   └── services/
│   │       └── visionService.ts
│   ├── collections/           # Folders, shadow folders
│   │   ├── components/
│   │   │   ├── CollectionTree.tsx
│   │   │   └── CollectionManager.tsx
│   │   └── hooks/
│   │       └── useCollections.ts
│   └── tags/                  # Tag system, TagHub
│       ├── components/
│       │   ├── TagHub/
│       │   │   ├── index.tsx
│       │   │   ├── BrowseTab.tsx
│       │   │   ├── ManageTab.tsx
│       │   │   ├── FusionTab.tsx
│       │   │   └── SettingsTab.tsx
│       │   ├── TagManager.tsx
│       │   └── BatchTagPanel.tsx
│       ├── hooks/
│       │   └── useTags.ts
│       └── services/
│           └── tagAnalysisService.ts
├── shared/                    # Cross-cutting concerns
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Icon.tsx
│   │   └── index.ts
│   ├── contexts/              # Global state
│   │   ├── LibraryContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── ModalContext.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useModalState.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useDebounce.ts
│   │   ├── useAppHandlers.ts    # Main event handlers (NEW)
│   │   ├── useSidebarLogic.ts    # Sidebar state management (NEW)
│   │   └── index.ts              # Hook exports
│   ├── types/                 # Shared types
│   │   ├── common.ts
│   │   └── api.ts
│   └── utils/                 # Utility functions
│       ├── fileSystem.ts
│       ├── imageProcessing.ts
│       └── validation.ts
├── services/                  # Business logic & external services
│   ├── storage/               # Database services
│   │   ├── database.ts
│   │   ├── photos.ts
│   │   ├── tags.ts
│   │   └── collections.ts
│   ├── geminiService.ts       # AI integration
│   ├── libraryLoader.ts       # File system scanning
│   └── secureStorage.ts       # API key storage
├── i18n/                      # Internationalization
│   ├── locales/
│   │   ├── en.json
│   │   └── fr.json
│   └── index.ts
├── App.tsx                    # Main app component (MODULARIZED)
└── index.tsx                  # Entry point
```

---

## 🔄 Data Flow Architecture

### 1. Unidirectional Data Flow

```
User Action → Component → Hook/Service → Database/API → State Update → UI Re-render
```

### 2. Context-Based State Management

#### Library Context
```typescript
interface LibraryState {
  photos: Photo[];
  selectedPhotos: string[];
  viewMode: 'grid' | 'list';
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

interface LibraryAction {
  type: 'SET_PHOTOS' | 'SELECT_PHOTO' | 'SET_FILTER' | 'SET_VIEW_MODE';
  payload?: any;
}
```

#### Settings Context
```typescript
interface SettingsState {
  language: 'en' | 'fr';
  theme: 'dark' | 'light';
  apiKey: string | null;
  preferences: UserPreferences;
}
```

### 3. Service Layer Pattern

#### Database Service
```typescript
class PhotoService {
  async getPhotos(filters?: FilterState): Promise<Photo[]>
  async addPhoto(photo: CreatePhotoDto): Promise<Photo>
  async updatePhoto(id: string, updates: UpdatePhotoDto): Promise<Photo>
  async deletePhoto(id: string): Promise<void>
}
```

#### AI Service
```typescript
class GeminiService {
  async analyzeImage(imagePath: string): Promise<AnalysisResult>
  async batchAnalyze(images: string[]): Promise<AnalysisResult[]>
  async generateTags(analysis: AnalysisResult): Promise<string[]>
}
```

---

## 🗄️ Database Architecture

### Schema Design

#### Core Tables
```sql
-- Photos table
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  analyzed_at DATETIME,
  thumbnail_path TEXT
);

-- Tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual', 'ai')),
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photo tags junction
CREATE TABLE photo_tags (
  photo_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Collections
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('folder', 'shadow', 'smart')),
  parent_id TEXT,
  criteria TEXT, -- JSON for smart collections
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Collection items
CREATE TABLE collection_items (
  collection_id TEXT NOT NULL,
  photo_id TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, photo_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

-- Analysis results (cache)
CREATE TABLE analysis_cache (
  photo_id TEXT PRIMARY KEY,
  analysis_data TEXT NOT NULL, -- JSON
  model_version TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);
```

### Database Service Pattern

#### Connection Management
```typescript
class DatabaseService {
  private db: Database | null = null;

  async getConnection(): Promise<Database> {
    if (!this.db) {
      this.db = await load('sqlite:lumina.db');
      await this.migrate();
    }
    return this.db;
  }

  private async migrate(): Promise<void> {
    // Run migrations
  }
}
```

#### Repository Pattern
```typescript
export class PhotoRepository {
  constructor(private db: DatabaseService) {}

  async findAll(filters?: FilterState): Promise<Photo[]> {
    const query = this.buildQuery(filters);
    return this.db.select<Photo[]>(query, params);
  }

  async findById(id: string): Promise<Photo | null> {
    const result = await this.db.select<Photo[]>(
      'SELECT * FROM photos WHERE id = ?',
      [id]
    );
    return result[0] || null;
  }

  async create(data: CreatePhotoDto): Promise<Photo> {
    const id = generateId();
    await this.db.execute(
      'INSERT INTO photos (id, path, filename, file_size) VALUES (?, ?, ?, ?)',
      [id, data.path, data.filename, data.fileSize]
    );
    return this.findById(id);
  }
}
```

---

## 🎨 Component Architecture

### 1. Component Hierarchy

```
App
├── MainLayout
│   ├── TopBar
│   │   ├── SearchBox
│   │   ├── ViewModeToggle
│   │   └── ActionButtons
│   ├── Sidebar
│   │   ├── CollectionTree
│   │   └── QuickFilters
│   └── MainContent
│       ├── Library
│       │   ├── PhotoGrid
│       │   │   └── PhotoCard[]
│       │   └── ViewModeToggle
│       ├── Vision
│       │   ├── ImageViewer
│       │   └── AnalysisPanel
│       └── Collections
│           └── CollectionManager
└── GlobalModals
    ├── TagHub
    ├── SettingsModal
    └── BatchTagPanel
```

### 2. Component Patterns

#### Smart vs Dumb Components
```typescript
// Smart Component (with logic)
export const PhotoGrid: React.FC = () => {
  const { photos, loading, error } = useLibrary();
  const { selectPhoto, selectMultiple } = usePhotoSelection();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onSelect={() => selectPhoto(photo.id)}
          onMultiSelect={() => selectMultiple(photo.id)}
        />
      ))}
    </div>
  );
};

// Dumb Component (presentational only)
interface PhotoCardProps {
  photo: Photo;
  onSelect: () => void;
  onMultiSelect: () => void;
  selected?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onSelect,
  onMultiSelect,
  selected = false
}) => {
  return (
    <motion.div
      className={`photo-card ${selected ? 'selected' : ''}`}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      onShiftClick={onMultiSelect}
    >
      <img src={photo.thumbnail_path} alt={photo.filename} />
      <div className="photo-info">
        <h3>{photo.filename}</h3>
      </div>
    </motion.div>
  );
};
```

#### Compound Components
```typescript
// Modal compound component
export const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Content: typeof ModalContent;
  Footer: typeof ModalFooter;
} = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={onClose}>
          <motion.div className="modal" onClick={(e) => e.stopPropagation()}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="modal-header">{children}</div>
);

export const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="modal-content">{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Usage
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>
    <h2>Edit Photo</h2>
  </Modal.Header>
  <Modal.Content>
    <PhotoEditor photo={photo} />
  </Modal.Content>
  <Modal.Footer>
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={onSave}>Save</Button>
  </Modal.Footer>
</Modal>
```

---

## 🔌 Service Architecture

### 1. Service Layer Pattern

#### Interface Definition
```typescript
interface IPhotoService {
  getPhotos(filters?: FilterState): Promise<Photo[]>;
  addPhoto(photo: CreatePhotoDto): Promise<Photo>;
  updatePhoto(id: string, updates: UpdatePhotoDto): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;
  analyzePhoto(id: string): Promise<AnalysisResult>;
}
```

#### Implementation
```typescript
export class PhotoService implements IPhotoService {
  constructor(
    private photoRepo: PhotoRepository,
    private analysisService: GeminiService,
    private tagService: TagService
  ) {}

  async getPhotos(filters?: FilterState): Promise<Photo[]> {
    return this.photoRepo.findAll(filters);
  }

  async addPhoto(photo: CreatePhotoDto): Promise<Photo> {
    const newPhoto = await this.photoRepo.create(photo);

    // Trigger analysis in background
    this.analyzePhoto(newPhoto.id).catch(console.error);

    return newPhoto;
  }

  async analyzePhoto(id: string): Promise<AnalysisResult> {
    const photo = await this.photoRepo.findById(id);
    if (!photo) throw new Error('Photo not found');

    const analysis = await this.analysisService.analyzeImage(photo.path);

    // Save analysis results
    await this.saveAnalysis(id, analysis);

    // Extract and save tags
    const tags = await this.analysisService.generateTags(analysis);
    await this.tagService.addTagsToPhoto(id, tags);

    return analysis;
  }
}
```

### 2. Dependency Injection

#### Service Container
```typescript
class ServiceContainer {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) throw new Error(`Service ${key} not found`);
    return factory();
  }
}

// Initialize services
const container = new ServiceContainer();
container.register('photoService', () => new PhotoService(
  container.get('photoRepository'),
  container.get('geminiService'),
  container.get('tagService')
));
```

---

## 🤖 AI Integration Architecture

### 1. Gemini Service Design

#### Service Interface
```typescript
interface GeminiService {
  analyzeImage(imagePath: string): Promise<ImageAnalysis>;
  batchAnalyze(imagePaths: string[]): Promise<ImageAnalysis[]>;
  generateTags(analysis: ImageAnalysis): Promise<string[]>;
  extractText(imagePath: string): Promise<string[]>;
  detectFaces(imagePath: string): Promise<FaceDetection[]>;
}
```

#### Implementation
```typescript
export class GeminiServiceImpl implements GeminiService {
  private ai: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async analyzeImage(imagePath: string): Promise<ImageAnalysis> {
    const model = this.ai.getGenerativeModel({ model: 'gemini-pro-vision' });

    const imageData = await this.loadImageAsBase64(imagePath);

    const prompt = `
      Analyze this image and provide:
      1. Objects present (list)
      2. Scene description (paragraph)
      3. Dominant colors (hex codes)
      4. Mood/atmosphere (adjectives)
      5. Technical details (lighting, composition)

      Respond in JSON format.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    return this.parseAnalysisResponse(result.response.text());
  }

  async batchAnalyze(imagePaths: string[]): Promise<ImageAnalysis[]> {
    const batchSize = 5; // API rate limits
    const results: ImageAnalysis[] = [];

    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(path => this.analyzeImage(path))
      );
      results.push(...batchResults);

      // Delay between batches to avoid rate limits
      if (i + batchSize < imagePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
```

### 2. Caching Strategy

#### Analysis Cache
```typescript
interface AnalysisCache {
  photoId: string;
  analysis: ImageAnalysis;
  modelVersion: string;
  createdAt: Date;
}

class AnalysisCacheService {
  private cache = new Map<string, AnalysisCache>();

  async get(photoId: string): Promise<ImageAnalysis | null> {
    const cached = this.cache.get(photoId);
    if (!cached) return null;

    // Check if cache is stale (older than 30 days)
    const age = Date.now() - cached.createdAt.getTime();
    if (age > 30 * 24 * 60 * 60 * 1000) {
      this.cache.delete(photoId);
      return null;
    }

    return cached.analysis;
  }

  async set(photoId: string, analysis: ImageAnalysis): Promise<void> {
    this.cache.set(photoId, {
      photoId,
      analysis,
      modelVersion: 'gemini-pro-vision',
      createdAt: new Date()
    });
  }
}
```

---

## 🎭 State Management Architecture

### 1. Context Pattern

#### Library Context
```typescript
interface LibraryContextType {
  state: LibraryState;
  actions: {
    setPhotos: (photos: Photo[]) => void;
    selectPhoto: (id: string) => void;
    selectMultiple: (ids: string[]) => void;
    clearSelection: () => void;
    setViewMode: (mode: ViewMode) => void;
    setFilters: (filters: FilterState) => void;
  };
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  const actions = useMemo(() => ({
    setPhotos: (photos: Photo[]) => dispatch({ type: 'SET_PHOTOS', payload: photos }),
    selectPhoto: (id: string) => dispatch({ type: 'SELECT_PHOTO', payload: id }),
    selectMultiple: (ids: string[]) => dispatch({ type: 'SELECT_MULTIPLE', payload: ids }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    setViewMode: (mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setFilters: (filters: FilterState) => dispatch({ type: 'SET_FILTERS', payload: filters })
  }), []);

  const value = { state, actions };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};
```

### 2. Performance Optimization

#### Context Splitting
```typescript
// Split large contexts to prevent unnecessary re-renders
const LibraryDataContext = createContext<LibraryDataState | null>(null);
const LibraryActionsContext = createContext<LibraryActions | null>(null);

// Components that only need data
export const useLibraryData = () => {
  const context = useContext(LibraryDataContext);
  if (!context) throw new Error('useLibraryData must be used within LibraryProvider');
  return context;
};

// Components that only need actions
export const useLibraryActions = () => {
  const context = useContext(LibraryActionsContext);
  if (!context) throw new Error('useLibraryActions must be used within LibraryProvider');
  return context;
};
```

#### Memoization
```typescript
// Expensive calculations in context
const filteredPhotos = useMemo(() => {
  return state.photos.filter(photo => {
    if (state.filters.search && !photo.filename.toLowerCase().includes(state.filters.search.toLowerCase())) {
      return false;
    }
    if (state.filters.tags.length > 0) {
      return state.filters.tags.every(tag => photo.tags.includes(tag));
    }
    return true;
  });
}, [state.photos, state.filters]);

// Debounced search
const debouncedSearch = useDebounce(state.filters.search, 300);
```

---

## 🔧 Build Architecture

### 1. Tauri Configuration

#### tauri.conf.json
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Lumina Portfolio",
    "version": "0.3.0-beta.1"
  },
  "plugins": {
    "fs": {
      "scope": ["$APPDATA/*", "$DOWNLOAD/*", "$DOCUMENT/*"]
    },
    "sql": {
      "preload": ["sqlite:lumina.db"]
    },
    "dialog": {},
    "notification": {}
  },
  "security": {
    "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
}
```

### 2. Vite Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@features': resolve(__dirname, 'src/features'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@services': resolve(__dirname, 'src/services')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', '@radix-ui/react-*'],
          utils: ['date-fns', 'lodash-es']
        }
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true
  }
});
```

---

## 🧪 Testing Architecture

### 1. Test Structure

```
tests/
├── unit/                   # Unit tests
│   ├── services/
│   │   ├── photoService.test.ts
│   │   └── geminiService.test.ts
│   ├── hooks/
│   │   └── useLibrary.test.ts
│   └── utils/
│       └── filtering.test.ts
├── components/             # Component tests
│   ├── PhotoGrid.test.tsx
│   ├── TagHub.test.tsx
│   └── SettingsModal.test.tsx
├── integration/            # Integration tests
│   ├── library.test.ts
│   └── tagging.test.ts
├── e2e/                   # End-to-end tests
│   ├── photo-upload.test.ts
│   └── tag-management.test.ts
└── setup.ts               # Test configuration
```

### 2. Test Utilities

#### Mock Services
```typescript
// tests/mocks/photoService.mock.ts
export const mockPhotoService = {
  getPhotos: vi.fn().mockResolvedValue(mockPhotos),
  addPhoto: vi.fn().mockResolvedValue(mockPhoto),
  updatePhoto: vi.fn().mockResolvedValue(mockPhoto),
  deletePhoto: vi.fn().mockResolvedValue(undefined),
  analyzePhoto: vi.fn().mockResolvedValue(mockAnalysis)
};

// tests/setup.ts
import { vi } from 'vitest';
import { mockPhotoService } from './mocks/photoService.mock';

// Mock Tauri APIs
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn(),
  exists: vi.fn()
}));

vi.mock('@tauri-apps/plugin-sql', () => ({
  load: vi.fn().mockResolvedValue({
    select: vi.fn(),
    execute: vi.fn()
  })
}));

// Provide mock services
vi.mock('@/services/photoService', () => ({
  PhotoService: vi.fn(() => mockPhotoService)
}));
```

---

## 📈 Performance Architecture

### 1. Rendering Optimization

#### Virtualization
```typescript
// Large list virtualization
import { FixedSizeList as List } from 'react-window';

export const VirtualPhotoGrid: React.FC<{ photos: Photo[] }> = ({ photos }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PhotoRow photos={photos.slice(index * 4, (index + 1) * 4)} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={Math.ceil(photos.length / 4)}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### Image Optimization
```typescript
// Progressive image loading
export const ProgressiveImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
  }, [src]);

  return (
    <div className="progressive-image">
      {loading && <ImagePlaceholder />}
      <img
        src={imageSrc || placeholderSrc}
        alt={alt}
        style={{ opacity: loading ? 0.5 : 1 }}
      />
    </div>
  );
};
```

### 2. Memory Management

#### Image Cache
```typescript
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private maxSize = 100; // Max cached images

  get(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  set(src: string, img: HTMLImageElement): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(src, img);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

---

## 🔒 Security Architecture

### 1. API Key Management

#### Secure Storage
```typescript
export class SecureStorageService {
  async storeApiKey(key: string): Promise<void> {
    await SecureStorage.set('gemini_api_key', key);
  }

  async getApiKey(): Promise<string | null> {
    return await SecureStorage.get('gemini_api_key');
  }

  async deleteApiKey(): Promise<void> {
    await SecureStorage.delete('gemini_api_key');
  }
}
```

### 2. File System Security

#### Path Validation
```typescript
export function validateImagePath(path: string): boolean {
  // Normalize path
  const normalized = path.normalize(path);

  // Check for directory traversal
  if (normalized.includes('..')) return false;

  // Check allowed extensions
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(normalized).toLowerCase();
  return allowedExts.includes(ext);
}
```

### 3. Content Security Policy

#### CSP Configuration
```json
{
  "security": {
    "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'https://generativelanguage.googleapis.com'"
  }
}
```

---

## 🚀 Deployment Architecture

### 1. Build Pipeline

#### GitHub Actions
```yaml
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run tauri:build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: src-tauri/target/release/bundle/
```

### 2. Distribution Strategy

#### Auto-Update
```typescript
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": ["https://releases.lumina.app/{{target}}/{{arch}}/{{current_version}}"],
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDBEQzE5QjZENjA0QjM5OQ"
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### 1. Error Tracking

#### Sentry Integration
```typescript
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0
  });
};

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};
```

### 2. Performance Monitoring

#### Metrics Collection
```typescript
export class PerformanceMonitor {
  static measureRender<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${name}: ${end - start}ms`);

    // Send to analytics
    analytics.track('performance', {
      metric: name,
      duration: end - start
    });

    return result;
  }
}
```

---

## 🔮 Future Architecture Considerations

### 1. Scalability

#### Plugin Architecture
```typescript
interface Plugin {
  name: string;
  version: string;
  init(): Promise<void>;
  destroy(): Promise<void>;
}

class PluginManager {
  private plugins = new Map<string, Plugin>();

  async loadPlugin(plugin: Plugin): Promise<void> {
    await plugin.init();
    this.plugins.set(plugin.name, plugin);
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.destroy();
      this.plugins.delete(name);
    }
  }
}
```

### 2. Cloud Integration

#### Sync Service
```typescript
interface SyncService {
  syncPhotos(): Promise<void>;
  syncTags(): Promise<void>;
  syncSettings(): Promise<void>;
  resolveConflicts(): Promise<ConflictResolution[]>;
}
```

### 3. Advanced AI Features

#### Custom Models
```typescript
interface AIModel {
  name: string;
  version: string;
  analyze(image: ImageBuffer): Promise<AnalysisResult>;
  train(dataset: TrainingDataset): Promise<ModelMetrics>;
}
```

---

## 📚 Related Documentation

- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development workflow
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[System Documentation](./SYSTEMS/)** - System-specific guides
- **[User Guide](./USER_GUIDE.md)** - End-user documentation

---

---

## 🏗️ **Modular Architecture (January 2026)**

### App.tsx Modularization Overview

In January 2026, we completed a major architectural refactoring to improve maintainability and testability by extracting the monolithic `App.tsx` component (682 lines) into specialized modules.

### Architecture Changes

#### Before Refactoring
```
App.tsx (682 lines)
├── Layout logic (100+ lines)
├── Event handlers (200+ lines)
├── Overlay/modal management (200+ lines)
├── State management (100+ lines)
└── JSX structure (80+ lines)
```

#### After Refactoring
```
App.tsx (Clean structure)
├── Layout components → features/layout/
├── Event handlers → shared/hooks/
├── Overlays/modals → features/overlays/
└── Core logic → App.tsx (simplified)
```

### New Architectural Patterns

#### 1. Layout Component Pattern
```typescript
// features/layout/AppLayout.tsx
export const AppLayout: React.FC<AppLayoutProps> = ({
  topBar, sidebar, mainContent, tagHub,
  isFolderDrawerOpen, isSidebarPinned, isTagHubOpen
}) => (
  <div className="main-app bg-surface h-screen overflow-hidden flex flex-col">
    <div className="top-bar-area">{topBar}</div>
    <div className={`flex-1 flex flex-row ${dynamicPaddingClasses}`}>
      {sidebar}
      {mainContent}
    </div>
    {tagHub}
  </div>
);
```

#### 2. Hook-Based Logic Pattern
```typescript
// shared/hooks/useAppHandlers.ts
export const useAppHandlers = (params) => ({
  handleDirectoryPicker,
  handleShareSelected,
  handleRunBatchAI,
  handleNext,
  handlePrev,
  toggleColorTags,
});

// shared/hooks/useSidebarLogic.ts
export const useSidebarLogic = (params) => ({
  isSidebarPinned,
  setIsSidebarPinned,
  handleSidebarToggle,
  handleSidebarClose,
});
```

#### 3. Overlay Container Pattern
```typescript
// features/overlays/AppOverlays.tsx
export const AppOverlays: React.FC<AppOverlaysProps> = ({
  contextMenu, selectedItem, analyzeItem, isDragSelecting
}) => (
  <>
    <UnifiedProgress />
    <ContextMenu {...contextMenuProps} />
    <ImageViewer {...viewerProps} />
  </>
);
```

### Benefits Achieved

#### 1. **Improved Maintainability**
- **Single Responsibility**: Each component has one clear purpose
- **Easier Debugging**: Smaller components are easier to troubleshoot
- **Better Organization**: Related code is co-located

#### 2. **Enhanced Testability**
- **Focused Testing**: Each component can be tested independently
- **Better Mocks**: Smaller, more targeted test mocks
- **Higher Coverage**: Easier to achieve comprehensive test coverage (171/171 tests pass)

#### 3. **Increased Reusability**
- **Layout Components**: Can be reused across different app sections
- **Custom Hooks**: Logic can be shared between components
- **Overlay Components**: Standardized overlay patterns

#### 4. **Better Developer Experience**
- **Faster Development**: Easier to locate and modify code
- **Clearer Structure**: New developers can understand architecture quickly
- **Type Safety**: Better TypeScript support with focused interfaces

### Performance Impact

#### Positive Effects
- **Reduced Bundle Size**: Better tree-shaking with smaller modules
- **Improved Caching**: Smaller components cache better
- **Faster Hot Reload**: Changes affect smaller code sections

#### Considerations
- **Additional Imports**: More import statements
- **Component Props**: More prop drilling (managed with context)
- **Build Complexity**: Slightly more complex build process

### Migration Strategy

The refactoring followed a **progressive migration approach**:

1. **Phase 1**: Extract layout components (no breaking changes)
2. **Phase 2**: Extract custom hooks (maintain API compatibility)
3. **Phase 3**: Extract overlays/modals (preserve functionality)
4. **Testing**: Update tests alongside code changes
5. **Documentation**: Update architecture documentation

This approach ensured **zero downtime** and **maintained backward compatibility** throughout the refactoring process.

---

<div align="center">

**Lumina Portfolio Architecture** - Built for performance and maintainability 🏗️✨

[🏠 Back to Documentation](./README.md) | [💻 Developer Guide](./DEVELOPER_GUIDE.md) | [📖 API Reference](./API_REFERENCE.md)

</div>
