# Copilot Instructions for Lumina Portfolio

## Project Overview

Lumina Portfolio is a **Local-First** desktop photo gallery application built with **Tauri v2**, **React 19**, and **SQLite**. The app features AI-powered image analysis via Gemini, hybrid folder/collection management, and an optimized UI with infinite scroll and lazy loading.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend**: Tauri v2 (Rust), SQLite
- **AI**: Google Gemini API (@google/genai)
- **Testing**: Vitest, React Testing Library
- **UI Libraries**: Framer Motion, Lucide React, TanStack Virtual
- **i18n**: i18next, react-i18next (English, French)

---

## TypeScript/React Guidelines

### General Principles
- Use **strict TypeScript** with `noUncheckedIndexedAccess: true`
- Follow **functional programming** patterns - prefer pure functions and immutability
- Use `React.FC` for functional components with typed props
- Prefer **named exports** over default exports for better refactoring
- Use **feature-based architecture** - organize code by domain (features/library, features/tags, etc.)

### Type Safety
- Always define explicit types for props, state, and function parameters
- Use interfaces for component props and object shapes
- Avoid `any` - use `unknown` if type is truly unknown
- Use `readonly` for immutable data structures
- Leverage TypeScript utility types (`Partial<>`, `Pick<>`, `Omit<>`, etc.)

### React Patterns
- Use Context API with split contexts for performance (separate state/dispatch)
- Custom hooks should start with `use` prefix (e.g., `useLibrary`, `useBatchAI`)
- Keep components small and focused - single responsibility principle
- Use composition over inheritance
- Prefer controlled components over uncontrolled
- Use `React.memo()` for expensive components to prevent unnecessary re-renders

### State Management
- Local state: `useState` for component-specific state
- Global state: React Context (avoid prop drilling)
- For complex state: useReducer pattern
- Never mutate state directly - always create new objects/arrays

### Imports
- Use path alias `@/` for imports (configured in tsconfig.json)
- Group imports: React first, then libraries, then local imports
- Example:
  ```typescript
  import React, { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { useLibrary } from "@/shared/contexts/LibraryContext";
  import { Button } from "@/shared/components";
  ```

### Code Style
- Use **tabs for indentation** (based on existing code)
- Use **double quotes** for strings
- Add **semicolons** at end of statements
- Use arrow functions for components and callbacks
- Destructure props and context values
- Keep lines under 100 characters when reasonable

---

## Tailwind CSS Guidelines

### Styling Conventions
- Use **Tailwind CSS v4** utility classes
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Use `clsx` or `tailwind-merge` for conditional classes
- Prefer composition with utility classes over custom CSS
- Use Tailwind's color palette and spacing scale consistently

### Component Styling Patterns
- Glass morphism effects: `backdrop-blur-xl bg-white/10 border border-white/20`
- Dark mode support: Use opacity variants and semi-transparent colors
- Animations: Prefer Framer Motion for complex animations, Tailwind for simple transitions
- Responsive grid: Use `grid grid-cols-[auto-fit]` with `minmax()` for photo galleries

---

## Rust/Tauri Backend Guidelines

### General Rust Conventions
- Follow Rust standard conventions (rustfmt, clippy)
- Use `Result<T, E>` for error handling
- Prefer `&str` for borrowed strings, `String` for owned
- Use `derive` macros for common traits (Debug, Clone, Serialize, etc.)

### Tauri-Specific
- Keep Rust code minimal - business logic should be in TypeScript when possible
- Use Tauri plugins for system access (fs, dialog, sql, etc.)
- Respect Tauri's security model - use capability files for permissions
- Commands should return `Result<T, String>` for JavaScript interop
- Keep commands focused and single-purpose

### SQLite/Database
- Use `@tauri-apps/plugin-sql` for database access
- All database operations should be in `services/storage/` modules
- Use prepared statements to prevent SQL injection
- Keep database schema migrations tracked in documentation
- Use transactions for multi-step operations

---

## Testing Guidelines

### Test Organization
- Test files: `*.test.ts` or `*.test.tsx` in the `/tests` directory
- Mirror source structure in test directory
- Use descriptive test names: `it("should display error message when API key is invalid")`

### Testing Patterns
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (Tauri APIs, Gemini service)
- Test edge cases and error states
- Keep tests isolated - no shared state between tests

### What to Test
- Component rendering and user interactions
- Custom hooks behavior
- Service functions and business logic
- Error handling and edge cases
- Accessibility (use `screen.getByRole`, `screen.getByLabelText`)

### Running Tests
```bash
npm run test    # Run all tests
```

---

## Build and Development

### Commands
```bash
npm install              # Install dependencies
npm run dev              # Frontend only (Vite dev server)
npm run tauri:dev        # Full app with Tauri backend
npm run build            # Build frontend
npm run tauri:build      # Build native app (.dmg/.exe/.AppImage)
npm run test             # Run tests
```

### Environment Setup
- Copy `.env.example` to `.env.local` for local development
- Add `VITE_GEMINI_API_KEY` for AI features
- Never commit `.env` files or secrets

### Development Workflow
- Feature branches: `feature/description` or `fix/description`
- Keep commits atomic and well-described
- Test locally before pushing
- Frontend changes: verify in browser (port 1420)
- Tauri changes: test in native app window

---

## Architecture Patterns

### Feature-Based Structure
```
src/
  ├── features/           # Domain-specific modules
  │   ├── library/        # Photo grid, view modes
  │   ├── navigation/     # TopBar, navigation
  │   ├── collections/    # Folders and collections
  │   ├── vision/         # AI analysis, image viewer
  │   └── tags/           # Tag system
  ├── shared/             # Cross-cutting concerns
  │   ├── components/     # Reusable UI components
  │   ├── contexts/       # Global state (React Context)
  │   ├── hooks/          # Custom hooks
  │   ├── types/          # TypeScript types
  │   └── utils/          # Utility functions
  ├── services/           # Business logic and external services
  │   └── storage/        # Database services (metadata, tags, collections)
  └── i18n/               # Internationalization (locales, config)
```

### Context Split Pattern
For performance, split contexts into state and dispatch:
```typescript
const LibraryStateContext = createContext<State>();
const LibraryDispatchContext = createContext<Dispatch>();
```
### Service Layer
- `features/vision/services/geminiService.ts`: AI image analysis (Gemini API)
- `services/libraryLoader.ts`: File system scanning and image loading
- `services/storage/`: SQLite database operations (metadata, tags, collections, folders)
- `services/tagAnalysisService.ts`: Tag deduplication and similarity analysis
- `services/secureStorage.ts`: Secure API key storage
- Keep services pure and testable - no React dependenciesing
- `storageService.ts`: SQLite database operations (CRUD)
- Keep services pure and testable - no React dependencies

---

## Performance Considerations

### Optimization Strategies
- Use `@tanstack/react-virtual` for infinite scroll in photo grids
- Lazy load images with Intersection Observer
- Code splitting: separate vendor chunks (React, Framer Motion, Lucide)
- Memoize expensive computations with `useMemo`
- Debounce search inputs and AI batch operations
- Use Tauri's asset protocol for fast image loading

### Avoid
- Large bundle sizes - lazy load features when possible
- Unnecessary re-renders - use React.memo and context splitting
- Blocking the UI thread - use Web Workers for heavy computation
- Memory leaks - clean up event listeners and subscriptions

---

## Security Guidelines

### API Keys and Secrets
- Never hardcode API keys in source code
- Use environment variables for sensitive data
- Add secret files to `.gitignore`
- Validate and sanitize user inputs

### Tauri Security
- Follow principle of least privilege in capability files
- Validate all inputs from frontend in Rust commands
- Use Content Security Policy (CSP) appropriately
- Keep Tauri and dependencies updated

---

## Documentation Standards

### Code Comments
- Comment **why**, not **what** (code should be self-explanatory)
### Documentation Files
- Architecture docs: `/docs/architecture/` (ARCHITECTURE.md, TAG_SYSTEM_ARCHITECTURE.md, etc.)
- Feature docs: `/docs/features/` (COMPONENTS.md, I18N_GUIDE.md, INTERACTIONS.md, etc.)
- Project docs: `/docs/project/` (CHANGELOG.md, bonne-pratique.md, KnowledgeBase/)
- Audit reports: `/docs/AUDIT/`
- User-facing docs: README.md
- Use Markdown for all documentation
- Include code examples where helpful
- Technical docs: `/docs` directory (ARCHITECTURE.md, COMPONENTS.md, etc.)
- User-facing docs: README.md
- Use Markdown for all documentation
- Include code examples where helpful

---

## Error Handling

### Frontend
- Use Error Boundaries for React component errors
- Display user-friendly error messages
- Log errors for debugging (console in dev, structured in prod)
- Handle async errors with try-catch

### Backend
- Return descriptive error messages from Tauri commands
- Use Rust's Result type consistently
- Log errors with appropriate severity levels
- Fail gracefully - don't crash the app

---

## Accessibility

### Guidelines
- Use semantic HTML elements
- Provide ARIA labels for icon buttons
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Support screen readers
- Test with keyboard-only navigation

---

## Common Patterns in This Project

### Modal Pattern
- Use `useModalState` hook for modal open/close state
- Modals should be self-contained with their own state
- Use Framer Motion for modal animations

### Selection Pattern
### AI Batch Processing
- Use `useVision` hook for analyzing single images
- Show progress with visual feedback components
- Allow cancellation of long-running operations
- Handle rate limits and API errors gracefully

### Internationalization (i18n)
- Use `useTranslation` hook from react-i18next
- Organize translations by namespace: `common`, `tags`, `settings`, `library`, `errors`
- Access translations: `t('namespace:key')` or `t('key', { ns: 'namespace' })`
- Supported languages: English (en), French (fr)
- Language auto-detection via browser settings
- All user-facing strings must be translatable
### AI Batch Processing
- Use `useBatchAI` hook for processing multiple images
- Show progress with UnifiedProgress component
- Allow cancellation of long-running operations

### Layout Pattern
- Flexible layout: pinned sidebar (fixed) vs floating drawer (overlay)
- Independent scroll containers for sidebar and main content
- Use flex-row with flex-1 for responsive layouts

---

### Key Dependencies
- React 19.2.3 / React DOM 19.2.3
- TypeScript ~5.8.2
- Tailwind CSS 4.1.18
- Tauri 2.9.5 (@tauri-apps/api 2.9.1, @tauri-apps/cli 2.1.0)
- Vite 6.2.0
- Vitest 4.0.16
- Framer Motion 12.23.26
- Lucide React 0.562.0
- @google/genai 1.34.0
- i18next 25.7.3 / react-i18next 16.5.0
- @tanstack/react-virtual 3.13.13
- fuse.js 7.0.0
- nanoid 5.1.6
### Branch Strategy
### Useful Aliases
- `@/*` → `./*` (root-level imports, including src/)

### Important Conventions
- Path alias resolves to project root, not just src/
- Use tabs for indentation (not spaces)
- Double quotes for strings
- Semicolons at end of statements
- Feature-based architecture with barrel exports (index.ts)fter merging
- Regularly sync with main branch

---

## Quick Reference

### Key Dependencies
- React 19.2.3
- TypeScript ~5.8.2
- Tailwind CSS 4.1.18
- Tauri 2.9.5
- Vite 6.2.0
- Vitest 4.0.16

### Important File Paths
- Frontend entry: `src/index.tsx`
- Main app: `src/App.tsx`
- Tauri config: `src-tauri/tauri.conf.json`
- Vite config: `vite.config.ts`
- TypeScript config: `tsconfig.json`

### Useful Aliases
- `@/*` → `./src/*`

---

## Code Quality and Verification

### Systematic Verification Rules (Zero Regression)

**Before completing any code change:**
1. **Self-correct before returning** - Don't let users discover syntax, import, or type errors
2. **After each edit, verify:**
   - Check for new errors in current_problems
   - Re-read modified files for syntax correctness
   - Verify imports match usage
   - Run type-check for complex changes: `npm run type-check` or `tsc --noEmit`

### Common Errors to Avoid
- Deleting types/interfaces still in use
- Character duplication (e.g., `>>`, `}}`)
- Missing imports for new components
- Unclosed brackets or parentheses

### Quality Commitment
> "Never claim 'done' without technical certainty that code compiles and executes without visible errors"

**See**: `.github/copilot/REGLES_VERIFICATION.md` for complete verification checklist

---

## When in Doubt

- Follow existing patterns in the codebase
- Prioritize code readability and maintainability
- Ask for clarification if requirements are unclear
- Write tests for new features and bug fixes
- Keep changes minimal and focused
- Document non-obvious decisions
