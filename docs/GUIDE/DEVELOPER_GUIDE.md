# 💻 Developer Guide - Lumina Portfolio

**Complete development workflow and best practices for Lumina Portfolio v0.3.0-beta.1**

**Last Update**: January 8, 2026

---

## 🚀 Quick Start

### Prerequisites

To build and contribute to Lumina Portfolio, you need:

#### Required Software
1. **Node.js**: v18 (LTS) or higher
2. **Package Manager**: `npm` (included with Node)
3. **Rust**: Stable toolchain
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

#### OS Dependencies
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: C++ Build Tools (via Visual Studio Installer)
- **Linux**: `webkit2gtk`, `gtk3`, `libappindicator3`

### Setup & Installation

#### 1. Clone Repository
```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Development Mode
```bash
npm run tauri:dev
```
- Frontend: `http://localhost:1420`
- Application Window: Opens automatically

---

## 🏗️ Project Architecture

### Feature-Based Architecture

We follow a **Feature-Based (Fractal)** architecture. Code is co-located by *feature* rather than *type*.

#### Directory Structure
```
src/
├── features/              # Feature modules
│   ├── library/           # Photo grid, view modes, infinite scroll
│   ├── navigation/        # TopBar, sidebar, navigation
│   ├── vision/            # AI analysis, image viewer, batch processing
│   ├── collections/       # Folders, shadow folders, management
│   └── tags/              # Tag system, TagHub, fusion algorithms
├── shared/                # Cross-cutting concerns
│   ├── components/        # Reusable UI (35+ components)
│   ├── contexts/          # Global state (React Context)
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Utility functions
├── services/              # Business logic & external services
│   ├── libraryLoader.ts   # File system scanning
│   ├── storage/           # Database services (SQLite)
│   ├── geminiService.ts   # AI integration (Gemini API)
│   └── secureStorage.ts   # API key storage
├── i18n/                  # Internationalization (EN/FR)
├── App.tsx                # Main app component
└── index.tsx              # Entry point
```

#### Architecture Principles

##### ✅ Good (Feature-Based)
```typescript
// Component co-located with feature
src/features/library/components/PhotoGrid.tsx
src/features/library/hooks/useLibrary.ts
src/features/library/types.ts
```

##### ❌ Bad (Type-Based)
```typescript
// Scattered by type
src/components/PhotoGrid.tsx
src/hooks/useLibrary.ts
src/types/library.ts
```

##### Rule of Thumb
- **Feature-specific**: Code used only within one feature → `src/features/[feature]/`
- **Shared/Generic**: Reusable across features → `src/shared/`
- **External Services**: API integrations → `src/services/`

---

## 💻 Development Workflow

### Daily Development

#### Starting Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Start development server
npm run tauri:dev
```

#### Making Changes
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow feature-based architecture
   - Write tests for new functionality
   - Update documentation if needed

3. **Test Changes**
   ```bash
   npm run test
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality

#### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Path Aliases**: Configured for clean imports
- **ESLint**: Enforces coding standards

#### Testing Strategy
- **Unit Tests**: Vitest for business logic
- **Component Tests**: React Testing Library
- **Integration Tests**: End-to-end workflows
- **Type Checking**: `tsc --noEmit` for validation

---

## 🧪 Testing

### Test Structure

#### Test Files Location
```
tests/
├── unit/                  # Unit tests for services/utils
├── components/            # Component tests
├── integration/           # Feature integration tests
└── setup.ts              # Test configuration
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Writing Tests

#### Unit Tests Example
```typescript
// tests/unit/services/libraryLoader.test.ts
import { describe, it, expect } from 'vitest';
import { scanDirectory } from '@/services/libraryLoader';

describe('libraryLoader', () => {
  it('should scan directory for images', async () => {
    const files = await scanDirectory('/test/path');
    expect(files).toBeInstanceOf(Array);
  });
});
```

#### Component Tests Example
```typescript
// tests/components/PhotoGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { PhotoGrid } from '@/features/library/components/PhotoGrid';

describe('PhotoGrid', () => {
  it('should render photo grid', () => {
    render(<PhotoGrid photos={[]} />);
    expect(screen.getByTestId('photo-grid')).toBeInTheDocument();
  });
});
```

### Test Mocks

#### Tauri API Mocks
```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Mock Tauri APIs
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn(),
  exists: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-sql', () => ({
  load: vi.fn(),
  execute: vi.fn(),
}));
```

---

## 🔧 Common Development Tasks

### Adding a New Feature

#### 1. Create Feature Structure
```bash
mkdir -p src/features/your-feature/{components,hooks,types,utils}
```

#### 2. Implement Core Files
```typescript
// src/features/your-feature/types.ts
export interface YourFeatureProps {
  // Define props
}

// src/features/your-feature/components/YourComponent.tsx
export const YourComponent = ({ ...props }: YourFeatureProps) => {
  // Implementation
};

// src/features/your-feature/hooks/useYourFeature.ts
export const useYourFeature = () => {
  // Hook implementation
};
```

#### 3. Add Tests
```typescript
// tests/features/your-feature/YourComponent.test.tsx
import { render } from '@testing-library/react';
import { YourComponent } from '@/features/your-feature/components/YourComponent';

describe('YourComponent', () => {
  it('should render', () => {
    render(<YourComponent />);
  });
});
```

### Adding a Shared Component

#### 1. Create Component
```typescript
// src/shared/components/YourComponent.tsx
import React from 'react';

interface YourComponentProps {
  children: React.ReactNode;
  className?: string;
}

export const YourComponent = ({ children, className }: YourComponentProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
```

#### 2. Add Index Export
```typescript
// src/shared/components/index.ts
export { YourComponent } from './YourComponent';
```

#### 3. Add Tests
```typescript
// tests/shared/components/YourComponent.test.tsx
import { render } from '@testing-library/react';
import { YourComponent } from '@/shared/components/YourComponent';

describe('YourComponent', () => {
  it('should render children', () => {
    render(<YourComponent>Test</YourComponent>);
  });
});
```

### Working with State

#### React Context Pattern
```typescript
// src/features/your-feature/context/YourFeatureContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

interface State {
  // Define state
}

interface Action {
  type: string;
  payload?: any;
}

const YourFeatureContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const YourFeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <YourFeatureContext.Provider value={{ state, dispatch }}>
      {children}
    </YourFeatureContext.Provider>
  );
};

export const useYourFeature = () => {
  const context = useContext(YourFeatureContext);
  if (!context) {
    throw new Error('useYourFeature must be used within YourFeatureProvider');
  }
  return context;
};
```

---

## 🎨 UI Development

### Component Guidelines

#### Component Structure
```typescript
// src/features/library/components/PhotoGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoSelect: (photo: Photo) => void;
  className?: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoSelect,
  className = '',
}) => {
  return (
    <motion.div
      className={`photo-grid ${className}`}
      layout
    >
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onSelect={() => onPhotoSelect(photo)}
        />
      ))}
    </motion.div>
  );
};
```

#### Styling with Tailwind CSS
```typescript
// Use @theme syntax for design tokens
className="bg-background/80 backdrop-blur-md border-white/10"

// Responsive design
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

// State-based styling
className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
```

#### Animation with Framer Motion
```typescript
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.div>
```

### Design System

#### Colors
```typescript
// Use semantic color tokens
bg-background          // Main background
bg-surface            // Card/panel background
border-white/10        // Subtle borders
text-primary          // Main text
text-secondary        // Secondary text
```

#### Spacing
```typescript
// Use consistent spacing scale
p-4                   // 16px
m-6                   // 24px
gap-3                 // 12px
space-y-2             // 8px between children
```

#### Typography
```typescript
// Use semantic typography classes
text-lg font-semibold  // Large bold text
text-sm text-secondary // Small secondary text
```

---

## 🗃️ Database Development

### SQLite with Tauri

#### Database Schema
```sql
-- Photos table
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual', 'ai')),
  usage_count INTEGER DEFAULT 0
);

-- Photo tags junction
CREATE TABLE photo_tags (
  photo_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Database Service
```typescript
// src/services/storage/database.ts
import { load } from '@tauri-apps/plugin-sql';

let db: Awaited<ReturnType<typeof load>> | null = null;

export async function getDatabase() {
  if (!db) {
    db = await load('sqlite:lumina.db');
  }
  return db;
}

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const db = await getDatabase();
  return db.select(query, params);
}

export async function executeCommand(
  query: string,
  params?: any[]
): Promise<void> {
  const db = await getDatabase();
  await db.execute(query, params);
}
```

#### Type-Safe Queries
```typescript
// src/services/storage/photos.ts
import { executeQuery, executeCommand } from './database';

export interface Photo {
  id: string;
  path: string;
  filename: string;
  created_at: string;
  updated_at: string;
}

export async function getPhotos(): Promise<Photo[]> {
  return executeQuery<Photo>('SELECT * FROM photos ORDER BY created_at DESC');
}

export async function insertPhoto(photo: Omit<Photo, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const id = generateId();
  await executeCommand(
    'INSERT INTO photos (id, path, filename) VALUES (?, ?, ?)',
    [id, photo.path, photo.filename]
  );
  return id;
}
```

---

## 🔌 API Integration

### Gemini AI Service

#### Service Structure
```typescript
// src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';

export class GeminiService {
  private ai: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.ai = new GoogleGenerativeAI(apiKey);
    this.apiKey = apiKey;
  }

  async analyzeImage(imagePath: string): Promise<AnalysisResult> {
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-pro-vision' });

      const imageData = await this.loadImage(imagePath);
      const result = await model.generateContent([
        'Analyze this image and describe objects, people, and scenes.',
        imageData
      ]);

      return this.parseResponse(result.response.text());
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async loadImage(imagePath: string): Promise<any> {
    // Load and convert image for API
  }

  private parseResponse(response: string): AnalysisResult {
    // Parse AI response into structured data
  }
}
```

#### Error Handling
```typescript
// src/services/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(error.message, 'UNKNOWN_ERROR');
  }

  return new APIError('An unknown error occurred', 'UNKNOWN_ERROR');
}
```

---

## 🌍 Internationalization

### i18n Setup

#### Translation Files
```json
// src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "library": {
    "title": "Photo Library",
    "noPhotos": "No photos found"
  },
  "tags": {
    "addTag": "Add Tag",
    "aiTag": "AI Tag",
    "manualTag": "Manual Tag"
  }
}
```

```json
// src/i18n/locales/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer"
  },
  "library": {
    "title": "Bibliothèque de photos",
    "noPhotos": "Aucune photo trouvée"
  },
  "tags": {
    "addTag": "Ajouter un tag",
    "aiTag": "Tag IA",
    "manualTag": "Tag manuel"
  }
}
```

#### Using Translations
```typescript
// src/features/library/components/PhotoGrid.tsx
import { useTranslation } from 'react-i18next';

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('library.title')}</h1>
      {photos.length === 0 && (
        <p>{t('library.noPhotos')}</p>
      )}
    </div>
  );
};
```

---

## 🔧 Build and Deployment

### Build Commands

#### Development Builds
```bash
# Frontend only (browser)
npm run dev

# Full native app (development)
npm run tauri:dev

# Type checking
npm run type-check

# Linting
npm run lint
```

#### Production Builds
```bash
# Frontend bundle
npm run build

# Native application
npm run tauri:build

# Build all platforms
npm run build:all
```

#### Build Configuration
```typescript
// src-tauri/tauri.conf.json
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
  }
}
```

### Environment Variables

#### Development
```env
# .env.local
VITE_GEMINI_API_KEY=your_development_key
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEV_TOOLS=true
```

#### Production
```env
# .env.production
VITE_LOG_LEVEL=error
VITE_ENABLE_DEV_TOOLS=false
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 🐛 Debugging

### Common Issues

#### Tauri Development
- **Hot reload not working**: Check if port 1420 is available
- **Build fails**: Verify Rust toolchain installation
- **Database errors**: Check SQLite plugin installation

#### React Development
- **Component not rendering**: Check exports and imports
- **State not updating**: Verify context provider setup
- **Type errors**: Run `npm run type-check`

#### Performance Issues
- **Slow rendering**: Use React.memo for expensive components
- **Memory leaks**: Check useEffect cleanup functions
- **Large lists**: Implement virtualization

### Debug Tools

#### Browser DevTools
```typescript
// Enable in development
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

#### Tauri Debug
```rust
// src-tauri/src/main.rs
#[cfg(debug_assertions)]
tauri::Builder::default()
    .plugin(tauri_plugin_devtools::init()) // Enable devtools
```

#### Logging
```typescript
// src/shared/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

---

## 📏 Code Quality Standards

### TypeScript Best Practices

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions or computed types
type Status = 'loading' | 'success' | 'error';

// Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
```

#### Error Handling
```typescript
// Use Result pattern for operations
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

async function safeOperation<T>(): Promise<Result<T>> {
  try {
    const data = await riskyOperation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### React Best Practices

#### Component Design
```typescript
// Keep components small and focused
const PhotoCard = ({ photo, onSelect }: PhotoCardProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <img src={photo.thumbnail} alt={photo.filename} />
      <button onClick={() => onSelect(photo)}>View</button>
    </motion.div>
  );
};

// Use memo for expensive components
export const PhotoGrid = React.memo<PhotoGridProps>(({ photos }) => {
  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
});
```

#### Custom Hooks
```typescript
// Custom hooks for reusable logic
export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getPhotos();
      setPhotos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { photos, loading, error, refetch: loadPhotos };
};
```

---

## 🔄 Git Workflow

### Branch Strategy

#### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Critical fixes

#### Commit Convention
```bash
# Format: type(scope): description
feat: add photo grid component
fix: resolve memory leak in image viewer
docs: update API documentation
test: add unit tests for tag service
refactor: optimize database queries
```

#### Pull Request Process
1. **Create feature branch**
2. **Make changes with tests**
3. **Ensure tests pass**
4. **Create PR with description**
5. **Request code review**
6. **Merge after approval**

---

## 📚 Additional Resources

### Documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System design details
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[User Guide](./USER_GUIDE.md)** - End-user documentation

### External Resources
- **[Tauri Documentation](https://tauri.app/)**
- **[React Documentation](https://react.dev/)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**

### Community
- **[GitHub Discussions](https://github.com/groovybronx/portf84/discussions)**
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)**

---

## ⚡ Quick Reference

### Common Commands

#### Development
```bash
# Install dependencies
npm install

# Start dev server (frontend only)
npm run dev                    # → http://localhost:1420

# Start full app (frontend + Tauri)
npm run tauri:dev              # → Native window

# Build for production
npm run build                  # Frontend bundle
npm run tauri:build            # Native app (.dmg, .exe, .AppImage)
```

#### Testing & Quality
```bash
# Run tests
npm test                       # Vitest test suite (149 tests)

# Type checking
npx tsc --noEmit              # TypeScript validation

# Lint (if configured)
npm run lint                   # ESLint

# Preview production build
npm run preview                # Test production build locally
```

#### Tauri Utilities
```bash
# Show system info
npm run tauri:info             # Rust/Node/OS versions

# Generate app icons
npm run tauri:icon [icon.png]  # Create icon set from source

# Tauri CLI
npm run tauri -- [command]     # Direct Tauri CLI access
```

### Key File Locations

| What | Where |
|------|-------|
| **Main App** | `src/App.tsx` |
| **Library Context** | `src/shared/contexts/LibraryContext.tsx` |
| **Tag Service** | `src/services/storage/tagStorageService.ts` |
| **AI Service** | `src/features/vision/services/geminiService.ts` |
| **Database Schema** | `src/services/storage/database.ts` |
| **Component Library** | `src/shared/components/` (35+ components) |
| **Tauri Config** | `src-tauri/tauri.conf.json` |
| **TypeScript Config** | `tsconfig.json` |
| **Vite Config** | `vite.config.ts` |
| **Environment** | `.env.local` (create from `.env.example`) |

### Keyboard Shortcuts

#### Global
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + O` | Open folder/project |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + ,` | Open settings |
| `Escape` | Close modal/deselect |

#### Photo Grid
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all photos |
| `Ctrl/Cmd + D` | Deselect all |
| `Delete/Backspace` | Delete selected photos |
| `Space` | Open image viewer |
| `Arrow Keys` | Navigate photos |
| `Shift + Click` | Range selection |
| `Ctrl/Cmd + Click` | Multi-selection |

#### Image Viewer
| Shortcut | Action |
|----------|--------|
| `Left/Right Arrow` | Previous/Next photo |
| `Escape` | Close viewer |
| `Space` | Play/pause slideshow |
| `+/-` | Zoom in/out |

#### Tag Management
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + T` | Open TagHub |
| `Ctrl/Cmd + Shift + T` | Batch tag selected photos |
| `Enter` | Apply tags |
| `Escape` | Cancel tag operation |

### UI Component Quick Guide

#### Button Variants
```tsx
import { Button } from "@/shared/components";

<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
```

#### Common Patterns
```tsx
// Modal with state
import { useModalState } from "@/shared/hooks";
const modal = useModalState();
<Modal isOpen={modal.isOpen} onClose={modal.close}>...</Modal>

// Context access
import { useLibrary } from "@/shared/contexts/LibraryContext";
const { photos, dispatch } = useLibrary();

// Translation
import { useTranslation } from "react-i18next";
const { t } = useTranslation("common");
<h1>{t("welcome")}</h1>
```

### Troubleshooting Quick Fixes

#### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Rust installation
rustc --version        # Should be 1.70+

# Check Node version
node --version         # Should be 18+ LTS
```

#### App Won't Start
```bash
# Check Tauri installation
npm run tauri:info

# Rebuild native modules
npm run tauri:build -- --debug

# Check logs
# macOS: ~/Library/Logs/lumina-portfolio/
# Windows: %APPDATA%\lumina-portfolio\logs\
# Linux: ~/.config/lumina-portfolio/logs/
```

#### Database Issues
```bash
# Database location
# macOS: ~/Library/Application Support/com.lumina.portfolio/
# Windows: %APPDATA%\com.lumina.portfolio\
# Linux: ~/.config/com.lumina.portfolio/

# Reset database (WARNING: deletes all data)
# Delete the lumina.db file from above location
```

#### TypeScript Errors
```bash
# Regenerate types
npx tsc --noEmit

# Check tsconfig.json path aliases
# Should have: "@/*": ["./src/*"]
```

#### Port Already in Use
```bash
# Kill process on port 1420
# macOS/Linux:
lsof -ti:1420 | xargs kill -9

# Windows:
netstat -ano | findstr :1420
taskkill /PID [PID] /F
```

### Pro Tips

1. **Use feature branches**: Follow proper Git workflow
2. **Test locally first**: `npm test` before committing
3. **Check TypeScript**: `npx tsc --noEmit` catches type errors
4. **Use path aliases**: Import with `@/` instead of relative paths
5. **Follow conventions**: Maintain consistent code style
6. **Write tests**: Add Vitest tests for new features
7. **Document as you go**: Add JSDoc for public APIs
8. **Use React.memo**: Optimize expensive components
9. **Check existing components**: Avoid duplicating UI components
10. **Use Context split**: Separate state/dispatch for performance

---

<div align="center">

**Happy Coding!** 🚀✨

[🏠 Back to Documentation](./README.md) | [📖 User Guide](./USER_GUIDE.md) | [🏗️ Architecture](./ARCHITECTURE.md)

</div>
