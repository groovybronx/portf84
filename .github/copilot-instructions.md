# Copilot Instructions for Lumina Portfolio

## Project Overview

Lumina Portfolio is a **Local-First** desktop photo gallery application built with **Tauri v2**, **React 18.3.1**, and **SQLite**. The app features AI-powered image analysis via Gemini, hybrid folder/collection management, and an optimized UI with infinite scroll and lazy loading.

## Tech Stack

- **Frontend**: React 18.3.1, TypeScript, Tailwind CSS v4, Vite
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
- Test locally before pushing
- Frontend changes: verify in browser (port 1420)
- Tauri changes: test in native app window

### Git Workflow

#### Branch Strategy
- **Main branch**: `main` - production-ready code
- **Feature branches**: `feature/description` or `feature/component-name`
- **Bug fixes**: `fix/description` or `fix/issue-number`
- **Hotfixes**: `hotfix/description` for critical production issues
- Branch naming: use lowercase with hyphens (e.g., `feature/ai-batch-processing`)

#### Merge Strategy
- Use **squash and merge** for pull requests to keep main branch history clean
- Single commit per PR in main branch
- Preserve detailed commit history in feature branches for development context

#### Commit Message Conventions
- Use descriptive, imperative mood messages (e.g., "Add batch AI processing feature")
- Format: `<type>: <description>` for structured commits
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `test:` - Adding or updating tests
  - `chore:` - Maintenance tasks
- Keep commits atomic and focused on single logical changes
- Reference issue numbers when applicable (e.g., "fix: Resolve memory leak in image loader (#123)")

#### Pull Request Process
1. Create feature branch from main
2. Make focused, well-tested changes
3. Update documentation if needed
4. Run linters, build, and tests locally
5. Open PR with clear description of changes
6. Address code review feedback
7. Squash and merge after approval
8. Delete feature branch after merge

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
- Architecture docs: `/docs/guides/architecture/` (ARCHITECTURE.md, TAG_SYSTEM_ARCHITECTURE.md, etc.)
- Feature docs: `/docs/guides/features/` (COMPONENTS.md, I18N_GUIDE.md, INTERACTIONS.md, etc.)
- Project docs: `/docs/guides/project/` (CHANGELOG.md, bonne-pratique.md, KnowledgeBase/)
- Audit reports: `/docs/AUDIT/`
- User-facing docs: README.md
- Copilot docs: `.github/copilot/` (EXAMPLES.md, README.md, REGLES_VERIFICATION.md)
- Custom agents: `.github/agents/` (20+ specialized agents for different domains)
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
- React 18.3.1 / React DOM 18.3.1
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
### Important Conventions
- Use tabs for indentation (not spaces)
- Double quotes for strings
- Semicolons at end of statements
- Feature-based architecture with barrel exports (index.ts)

---

## Quick Reference

### Key Dependencies
- React 18.3.1
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

### Path Aliases
- `@/*` → `./src/*` (configured in tsconfig.json)

---

## Custom Agents

This project uses **20+ specialized GitHub Copilot agents** for different domains and tasks. These agents provide expert assistance for specific areas of the codebase.

### Available Agents

Agents are located in `.github/agents/` and include:

#### Domain Agents
- **project-architecture** - Overall architecture and structure
- **react-frontend** - React 18.3.1, TypeScript, Tailwind CSS v4
- **tauri-rust-backend** - Rust backend and Tauri v2
- **database-sqlite** - SQLite schema and queries
- **ai-gemini-integration** - AI features and Gemini API
- **testing-vitest** - Vitest and React Testing Library
- **i18n-manager** - Internationalization (i18next)

#### Quality & Maintenance Agents
- **code-cleaner** - Code cleanup and optimization
- **code-quality-auditor** - Quality audits and technical debt
- **bug-hunter** - Bug detection and analysis
- **security-auditor** - Security vulnerabilities and best practices
- **performance-optimizer** - Performance bottlenecks and optimization
- **test-coverage-improver** - Test coverage improvements

#### Workflow Agents
- **meta-orchestrator** - Coordinates agents and manages workflow
- **pr-resolver** - PR analysis and conflict resolution
- **refactoring-tracker** - Multi-phase refactoring tracking
- **migration-assistant** - Version migrations and updates
- **dependency-manager** - Dependency management and updates
- **documentation-generator** - Documentation generation and maintenance
- **metrics-analyzer** - Project health metrics and statistics

### Using Custom Agents

To leverage custom agents effectively:
1. **Consult the agent README**: See `.github/agents/README.md` for detailed agent descriptions
2. **Choose the right agent**: Select the agent matching your task domain
3. **Provide context**: Give the agent relevant context and specific instructions
4. **Follow recommendations**: Apply agent suggestions to maintain code quality

**Example**: When working on React components, consult the `react-frontend` agent. For database schema changes, use the `database-sqlite` agent.

---

## Code Examples

For concrete code examples and patterns, see **`.github/copilot/EXAMPLES.md`**.

The examples file includes:
- React component patterns (functional components, hooks, state management)
- TypeScript typing examples (props, interfaces, utility types)
- Tailwind CSS styling patterns (glass morphism, responsive design)
- Custom hooks implementation
- Context API patterns
- Service layer examples
- Testing patterns with Vitest and React Testing Library
- i18n integration examples

**Quick Examples**:

### React Component with TypeScript
```typescript
import React, { useState } from "react";
import { useLibrary } from "@/shared/contexts/LibraryContext";

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

### Custom Hook with TypeScript
```typescript
export const usePhotoSelection = () => {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	
	const toggleSelection = (id: string) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};
	
	return { selectedIds, toggleSelection };
};
```

**See `.github/copilot/EXAMPLES.md` for more complete examples and patterns.**

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

## 🤖 Documentation RAG Agent

Ce projet utilise un agent RAG spécialisé pour accéder intelligemment à la documentation.

### Utilisation de l'Agent RAG

Pour toute question sur la documentation du projet, préférer l'agent RAG :
- `@documentation-rag-agent [question]` - Questions sur la documentation
- L'agent consulte automatiquement l'index de documentation (113+ documents)
- Toutes les réponses incluent des citations avec chemins de fichiers exacts

### Documentation comme Source de Vérité

Avant de répondre à une question sur le projet :
1. **Consulter d'abord l'agent RAG** ou l'index de documentation
2. Vérifier `docs/INDEX.md` et `docs/QUICK_REFERENCE.md`
3. **Toujours citer les sources** de documentation dans les réponses

### Quand Consulter l'Agent RAG

- Questions sur l'architecture du projet (TAG_SYSTEM_ARCHITECTURE.md, etc.)
- Guides d'utilisation des fonctionnalités
- État actuel du projet et métriques
- Décisions de conception passées
- Conventions et bonnes pratiques établies
- Historique des changements et refactoring

### Commandes Spéciales

```bash
# Recherche simple
@documentation-rag-agent Comment fonctionne X ?

# Recherche ciblée
@documentation-rag-agent search:"terme" in:guides/features

# Documents liés
@documentation-rag-agent related:"docs/path/file.md"

# Statistiques
@documentation-rag-agent stats
```

### Système RAG

Le système RAG utilise :
- **Recherche hybride** : Lexicale (40%) + Sémantique (60%)
- **Index automatique** : Reconstruit à chaque push de documentation
- **4 niveaux de priorité** : Critical, High, Normal, Archive
- **100+ mots-clés** : Extraction automatique pour recherche optimisée

**Guide complet** : `docs/RAG_AGENT_GUIDE.md`  
**Configuration** : `.github/copilot/rag-config.json`  
**Scripts** : `npm run rag:build`, `npm run rag:search`, `npm run rag:test`

---

## When in Doubt

- Follow existing patterns in the codebase
- Prioritize code readability and maintainability
- Ask for clarification if requirements are unclear
- Write tests for new features and bug fixes
- Keep changes minimal and focused
- Document non-obvious decisions
