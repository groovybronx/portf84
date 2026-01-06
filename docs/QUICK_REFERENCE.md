# ⚡ Quick Reference - Lumina Portfolio

**One-page developer cheat sheet for Lumina Portfolio v0.3.0-beta.1**

---

## 🚀 Common Commands

### Development
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

### Testing & Quality
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

### Tauri Utilities
```bash
# Show system info
npm run tauri:info             # Rust/Node/OS versions

# Generate app icons
npm run tauri:icon [icon.png]  # Create icon set from source

# Tauri CLI
npm run tauri -- [command]     # Direct Tauri CLI access
```

---

## 📁 Project Structure

```
lumina-portfolio/
├── src/                       # Frontend source
│   ├── features/              # Feature modules (feature-based architecture)
│   │   ├── library/           # Photo grid, view modes, infinite scroll
│   │   ├── navigation/        # TopBar, sidebar, navigation
│   │   ├── vision/            # AI analysis, image viewer, batch processing
│   │   ├── collections/       # Folders, shadow folders, management
│   │   └── tags/              # Tag system, TagHub, fusion algorithms
│   ├── shared/                # Cross-cutting concerns
│   │   ├── components/        # Reusable UI (35+ components)
│   │   ├── contexts/          # Global state (React Context)
│   │   ├── hooks/             # Custom hooks (useLibrary, useTags, etc.)
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Utility functions
│   ├── services/              # Business logic & external services
│   │   ├── libraryLoader.ts   # File system scanning
│   │   ├── storage/           # Database services (SQLite)
│   │   ├── geminiService.ts   # AI integration (Gemini API)
│   │   └── secureStorage.ts   # API key storage
│   ├── i18n/                  # Internationalization (EN/FR)
│   ├── App.tsx                # Main app component
│   └── index.tsx              # Entry point
├── src-tauri/                 # Rust backend (Tauri v2)
│   ├── src/                   # Rust source code
│   ├── capabilities/          # Tauri permissions
│   ├── icons/                 # App icons
│   └── tauri.conf.json        # Tauri configuration
├── docs/                      # Documentation
│   ├── INDEX.md               # 📍 Documentation master index
│   ├── QUICK_REFERENCE.md     # 📍 This file
│   ├── getting-started/       # Installation & setup
│   ├── guides/                # Technical guides
│   │   ├── architecture/      # System design (6 docs)
│   │   ├── features/          # Feature docs (6 docs)
│   │   └── project/           # Project info & KnowledgeBase (14 docs)
│   ├── workflows/             # Git & release workflows (5 docs)
│   └── AUDIT/                 # Audit reports (40+ reports)
└── tests/                     # Vitest test suite
```

---

## 🔑 Key File Locations

| What | Where |
|------|-------|
| **Main App** | `src/App.tsx` |
| **Library Context** | `src/shared/contexts/LibraryContext.tsx` |
| **Tag Service** | `src/services/storage/tagStorageService.ts` (672 lines) |
| **AI Service** | `src/features/vision/services/geminiService.ts` |
| **Database Schema** | `docs/guides/project/KnowledgeBase/03_Database_Schema_and_Storage.md` |
| **Component Library** | `src/shared/components/` (35+ components) |
| **Tauri Config** | `src-tauri/tauri.conf.json` |
| **TypeScript Config** | `tsconfig.json` |
| **Vite Config** | `vite.config.ts` |
| **Environment** | `.env.local` (create from `.env.example`) |

---

## ⌨️ Keyboard Shortcuts

### Global
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + O` | Open folder/project |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + ,` | Open settings |
| `Escape` | Close modal/deselect |

### Photo Grid
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all photos |
| `Ctrl/Cmd + D` | Deselect all |
| `Delete/Backspace` | Delete selected photos |
| `Space` | Open image viewer |
| `Arrow Keys` | Navigate photos |
| `Shift + Click` | Range selection |
| `Ctrl/Cmd + Click` | Multi-selection |

### Image Viewer
| Shortcut | Action |
|----------|--------|
| `Left/Right Arrow` | Previous/Next photo |
| `Escape` | Close viewer |
| `Space` | Play/pause slideshow |
| `+/-` | Zoom in/out |

### Tag Management
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + T` | Open TagHub |
| `Ctrl/Cmd + Shift + T` | Batch tag selected photos |
| `Enter` | Apply tags |
| `Escape` | Cancel tag operation |

---

## 🎨 UI Component Quick Guide

### Button Variants
```tsx
import { Button } from "@/shared/components";

<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
```

### Common Patterns
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

---

## 🏗️ Architecture Patterns

### Feature-Based Structure
```
features/library/
  ├── components/      # Feature-specific UI
  ├── hooks/           # Feature-specific hooks
  ├── services/        # Feature business logic
  ├── types/           # Feature types
  └── index.ts         # Barrel export
```

### Context Split Pattern (Performance)
```typescript
// Split state and dispatch for performance
const StateContext = createContext<State>();
const DispatchContext = createContext<Dispatch>();

// Consumers only re-render when their context changes
const state = useContext(StateContext);    // Read-only
const dispatch = useContext(DispatchContext); // Actions
```

### Service Layer Pattern
```typescript
// Pure functions, no React dependencies
export async function loadPhotos(path: string): Promise<Photo[]> {
  // Business logic
}
```

---

## 🗄️ Database (SQLite)

### Key Tables
```sql
-- Photos metadata
projects                    -- Main photo library entries

-- Tag system (95% complete, production-ready)
tags                        -- Tag definitions
photo_tags                  -- Photo-tag relationships
tag_groups                  -- Tag categories/groups

-- Collections
folders                     -- User-created folders
folder_photos               -- Folder-photo relationships
shadow_folders              -- Virtual smart folders

-- Settings
settings                    -- User preferences
```

### Access Pattern
```typescript
import Database from "@tauri-apps/plugin-sql";

const db = await Database.load("sqlite:lumina.db");
const photos = await db.select("SELECT * FROM projects WHERE path LIKE ?", [path]);
```

---

## 🤖 AI Integration (Gemini)

### Setup
```bash
# Option 1: Environment variable
# Create .env.local
VITE_GEMINI_API_KEY=your_api_key_here

# Option 2: Settings UI
# Settings → Enter API key (stored securely)
```

### Usage
```typescript
import { analyzeImage } from "@/features/vision/services/geminiService";

const result = await analyzeImage({
  imagePath: "/path/to/photo.jpg",
  apiKey: "...",
  options: { includeDescription: true }
});
// Returns: { tags: string[], description: string }
```

---

## 🌍 Internationalization (i18n)

### Supported Languages
- 🇬🇧 English (`en`)
- 🇫🇷 French (`fr`)

### Add Translation
```typescript
// src/i18n/locales/en/common.json
{
  "welcome": "Welcome to Lumina",
  "photos": "Photos",
  "photos_count": "{{count}} photo",
  "photos_count_plural": "{{count}} photos"
}

// Usage
const { t } = useTranslation("common");
t("welcome");                           // "Welcome to Lumina"
t("photos_count", { count: 5 });      // "5 photos"
```

### Namespaces
- `common` - Shared UI strings
- `tags` - Tag system
- `settings` - Settings page
- `library` - Photo library
- `errors` - Error messages

---

## 🐛 Troubleshooting Quick Fixes

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Rust installation
rustc --version        # Should be 1.70+

# Check Node version
node --version         # Should be 18+ LTS
```

### App Won't Start
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

### Database Issues
```bash
# Database location
# macOS: ~/Library/Application Support/com.lumina.portfolio/
# Windows: %APPDATA%\com.lumina.portfolio\
# Linux: ~/.config/com.lumina.portfolio/

# Reset database (WARNING: deletes all data)
# Delete the lumina.db file from above location
```

### TypeScript Errors
```bash
# Regenerate types
npx tsc --noEmit

# Check tsconfig.json path aliases
# Should have: "@/*": ["./src/*"]
```

### Port Already in Use
```bash
# Kill process on port 1420
# macOS/Linux:
lsof -ti:1420 | xargs kill -9

# Windows:
netstat -ano | findstr :1420
taskkill /PID [PID] /F
```

---

## 📊 Code Statistics (as of Jan 6, 2026)

| Metric | Value |
|--------|-------|
| **Version** | 0.3.0-beta.1 |
| **Status** | 95% Complete |
| **Total Tests** | 149 (all passing) |
| **Test Coverage** | ~75% (services/algorithms) |
| **UI Test Coverage** | ~5% (needs improvement) |
| **Documentation Files** | 54 markdown files |
| **Components** | 35+ reusable UI components |
| **Features** | 5 major features (all complete) |
| **Lines of Code** | ~15,000+ (estimated) |

---

## 🎯 Critical TODOs (Jan 6, 2026)

From [latest audit](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md):

### 🔴 Critical (Week 1-2)
1. **Enable BatchTagPanel UI Access** - 349-line component has no button/shortcut
2. **Fix Settings Persistence** - TagHub settings reset every session
3. **Update React Version Docs** - 10+ docs reference React 19 (actual: 18.3.1)

### 🟡 High Priority (Week 3-4)
4. **Add UI Component Tests** - Only 4 UI tests out of 149 total
5. **Document Component Props** - Add JSDoc to all exported components
6. **Consolidate Tag Docs** - 4 different tag system docs (some redundant)

---

## 📚 Documentation Quick Links

| Topic | Document |
|-------|----------|
| **Master Index** | [INDEX.md](./INDEX.md) |
| **Getting Started** | [getting-started/README.md](./getting-started/README.md) |
| **Architecture** | [guides/architecture/ARCHITECTURE.md](./guides/architecture/ARCHITECTURE.md) |
| **Components** | [guides/features/COMPONENTS.md](./guides/features/COMPONENTS.md) |
| **Developer Guide** | [guides/project/KnowledgeBase/07_Developer_Guide.md](./guides/project/KnowledgeBase/07_Developer_Guide.md) |
| **Latest Audit** | [AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md) |
| **Troubleshooting** | [guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md](./guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md) |

---

## 🎨 ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      LUMINA PORTFOLIO                            │
│                    v0.3.0-beta.1 (95% Complete)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18.3.1)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  features/  │  │   shared/    │  │      services/         │ │
│  ├─────────────┤  ├──────────────┤  ├────────────────────────┤ │
│  │ • library   │  │ • components │  │ • libraryLoader        │ │
│  │ • navigation│  │ • contexts   │  │ • geminiService (AI)   │ │
│  │ • vision    │  │ • hooks      │  │ • storage/             │ │
│  │ • collections│ │ • types      │  │   - tagStorageService  │ │
│  │ • tags      │  │ • utils      │  │   - metadataStorage    │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TAURI RUNTIME (v2)                            │
│                   (Rust + WebView Bridge)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
          ┌──────────────────┐  ┌─────────────────┐
          │  SQLite Database │  │  File System    │
          ├──────────────────┤  ├─────────────────┤
          │ • projects       │  │ • Photo files   │
          │ • tags           │  │ • Thumbnails    │
          │ • photo_tags     │  │ • Cache         │
          │ • folders        │  └─────────────────┘
          │ • settings       │
          └──────────────────┘

                    External APIs
          ┌──────────────────────────────┐
          │  Google Gemini AI (Optional) │
          │  • Image analysis            │
          │  • Tag generation            │
          │  • Description generation    │
          └──────────────────────────────┘
```

---

## 🔗 External Resources

| Resource | URL |
|----------|-----|
| **React 18 Docs** | https://react.dev/ |
| **Tauri v2 Docs** | https://tauri.app/v2/ |
| **TypeScript Docs** | https://www.typescriptlang.org/docs/ |
| **Tailwind CSS v4** | https://tailwindcss.com/ |
| **Vitest** | https://vitest.dev/ |
| **Gemini API** | https://ai.google.dev/gemini-api/docs |
| **i18next** | https://www.i18next.com/ |

---

## 💡 Pro Tips

1. **Use feature branches**: Follow [Git Workflow](./workflows/BRANCH_STRATEGY.md)
2. **Test locally first**: `npm test` before committing
3. **Check TypeScript**: `npx tsc --noEmit` catches type errors
4. **Use path aliases**: Import with `@/` instead of relative paths
5. **Follow conventions**: See [Best Practices](./guides/project/bonne-pratique.md)
6. **Read the audit**: [Latest audit](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md) has recent issues
7. **Check existing components**: Avoid duplicating UI components
8. **Use Context split**: Separate state/dispatch for performance
9. **Write tests**: Add Vitest tests for new features
10. **Document as you go**: Add JSDoc for public APIs

---

<div align="center">

**Quick Reference Card** - Print or bookmark this page! 📖

[🏠 Master Index](./INDEX.md) | [📚 Documentation Map](./DOCUMENTATION_MAP.md) | [🚀 Getting Started](./getting-started/README.md)

</div>
