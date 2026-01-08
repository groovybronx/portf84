---
trigger: always_on
---

# Lumina Portfolio - Windsurf AI Rules

## TypeScript & React Conventions

### For files: `**/*.ts`, `**/*.tsx`

- Use strict TypeScript with explicit types for all function parameters, return values, and component props
- Use React.FC for functional components with typed props using interfaces
- Prefer named exports over default exports for better refactoring
- Use tabs for indentation, double quotes for strings, and semicolons at end of statements
- Import path alias @/ for all imports (maps to ./src/)
- Group imports: React first, then libraries, then local imports with @/ prefix
- Use feature-based architecture: organize code by domain (features/library, features/tags, etc.)
- Use Context API with split contexts for performance (separate state/dispatch)
- Custom hooks must start with 'use' prefix
- Use React.memo() for expensive components to prevent unnecessary re-renders
- Never mutate state directly - always create new objects/arrays
- Avoid 'any' type - use 'unknown' if type is truly unknown
- Use readonly for immutable data structures
- Keep components small and focused - single responsibility principle
- Prefer controlled components over uncontrolled
- Use arrow functions for components and callbacks
- Destructure props and context values
- Keep lines under 100 characters when reasonable

## Tailwind CSS Conventions

### For files: `**/*.tsx`, `**/*.jsx`

- Use Tailwind CSS v4 utility classes exclusively
- Follow mobile-first responsive design (sm:, md:, lg: breakpoints)
- Use clsx or tailwind-merge for conditional classes
- Prefer composition with utility classes over custom CSS
- Glass morphism effects: backdrop-blur-xl bg-white/10 border border-white/20
- Dark mode support: Use opacity variants and semi-transparent colors
- Prefer Framer Motion for complex animations, Tailwind for simple transitions
- Responsive grid: Use grid grid-cols-[auto-fit] with minmax() for photo galleries

## Rust & Tauri Conventions

### For files: `src-tauri/**/*.rs`

- Follow Rust standard conventions (rustfmt, clippy)
- Use Result<T, E> for error handling
- Prefer &str for borrowed strings, String for owned
- Use derive macros for common traits (Debug, Clone, Serialize, etc.)
- Keep Rust code minimal - business logic should be in TypeScript when possible
- Use Tauri plugins for system access (fs, dialog, sql, etc.)
- Commands should return Result<T, String> for JavaScript interop
- Keep commands focused and single-purpose
- Use @tauri-apps/plugin-sql for database access
- Use prepared statements to prevent SQL injection
- Use transactions for multi-step database operations

## Testing Conventions

### For files: `**/*.test.ts`, `**/*.test.tsx`, `tests/**/*.ts`, `tests/**/*.tsx`

- Use Vitest for unit tests
- Use React Testing Library for component tests
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (Tauri APIs, Gemini service)
- Test edge cases and error states
- Keep tests isolated - no shared state between tests
- Use descriptive test names: it('should display error message when API key is invalid')
- Mirror source structure in test directory
- Test accessibility using screen.getByRole, screen.getByLabelText

## Systematic Verification Rules

### For files: `**/*.ts`, `**/*.tsx`, `**/*.rs`

- ZERO REGRESSION: Self-correct before returning control to the user
- After every code modification, verify: 1) Check for new errors in current_problems, 2) Re-read modified files to verify syntax, imports, and types, 3) Run build/type-check for complex changes
- Avoid common errors: Do not delete interfaces/types still in use, watch for character duplication (>> or }}), ensure all new components are imported
- Run 'npm run type-check' or 'tsc --noEmit' when making complex TypeScript changes
- Never claim 'done' without technical certainty that code compiles and executes without visible errors
- Always verify: closing brackets/parentheses, import statements match usage, no missing dependencies
- Self-verification checklist: syntax correctness, type safety, import completeness, build validation

## Security Guidelines

### For files: `**/*.ts`, `**/*.tsx`, `**/*.rs`

- Never hardcode API keys or secrets in source code
- Use environment variables for sensitive data
- Validate and sanitize all user inputs
- Use prepared statements for SQL queries to prevent injection
- Follow principle of least privilege in Tauri capability files
- Validate all inputs from frontend in Rust commands
- Use Content Security Policy (CSP) appropriately

## Performance Optimization

### For files: `**/*.ts`, `**/*.tsx`

- Use @tanstack/react-virtual for infinite scroll in photo grids
- Lazy load images with Intersection Observer
- Memoize expensive computations with useMemo
- Debounce search inputs and AI batch operations
- Use Tauri's asset protocol for fast image loading
- Avoid large bundle sizes - lazy load features when possible
- Avoid unnecessary re-renders - use React.memo and context splitting
- Clean up event listeners and subscriptions to prevent memory leaks

## Error Handling

### For files: `**/*.ts`, `**/*.tsx`, `**/*.rs`

- Use Error Boundaries for React component errors
- Display user-friendly error messages
- Handle async errors with try-catch blocks
- Return descriptive error messages from Tauri commands
- Use Rust's Result type consistently
- Log errors with appropriate severity levels
- Fail gracefully - don't crash the app

## Accessibility (a11y)

### For files: `**/*.tsx`, `**/*.jsx`

- Use semantic HTML elements
- Provide ARIA labels for icon buttons
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Support screen readers
- Test with keyboard-only navigation

## Architecture Patterns

### For files: `src/**/*.ts`, `src/**/*.tsx`

- Use feature-based structure: features/ for domain-specific modules, shared/ for cross-cutting concerns, services/ for business logic
- Context split pattern: separate state and dispatch contexts for performance
- Service layer: geminiService.ts (AI), libraryLoader.ts (file system), storageService.ts (database)
- Modal pattern: Use useModalState hook for modal state management
- Selection pattern: Multi-select with Shift+Click for range, Cmd/Ctrl+Click for individual toggle
- Layout pattern: Flexible layout with pinned sidebar (fixed) vs floating drawer (overlay)
- Keep services pure and testable - no React dependencies

## Documentation Standards

### For files: `**/*.ts`, `**/*.tsx`, `**/*.rs`

- Comment why, not what (code should be self-explanatory)
- Use JSDoc for public APIs and complex functions
- Document edge cases and gotchas
- Keep comments concise and up-to-date
- Use descriptive variable and function names

## Project-Specific Patterns

### Tag System Implementation
- TagHub interface with 4 tabs: Browse, Manage, Fusion, Settings
- Use Levenshtein distance for tag similarity detection
- Implement caching for tag analysis results
- Batch operations for multi-tag management

### Photo Management
- Virtual scrolling for large photo collections
- Thumbnail generation and caching
- AI-powered tagging with Gemini API
- Folder and shadow folder organization

### State Management
- React Context with split state/dispatch for performance
- Local state for UI components, global state for application data
- Immutable updates with proper TypeScript types

## Code Quality Gates

### Before Committing
- Run `npm run type-check` to verify TypeScript compilation
- Run `npm test` to ensure all tests pass
- Check for console errors in development mode
- Verify accessibility with keyboard navigation test

### Performance Checks
- Monitor bundle size with `npm run build`
- Check for memory leaks in long-running operations
- Verify lazy loading is working for large features
- Test with large datasets (1000+ photos)

## Development Workflow

### Feature Development
1. Create feature branch from develop
2. Implement with TypeScript strict mode
3. Add comprehensive tests
4. Verify performance impact
5. Update documentation if needed
6. Submit pull request with description

### Bug Fixes
1. Reproduce issue in development
2. Add failing test case
3. Implement fix with proper error handling
4. Verify fix doesn't break existing functionality
5. Update tests to cover edge cases

## Integration Guidelines

### Gemini AI Integration
- Use environment variables for API keys
- Implement proper error handling for API failures
- Cache results to reduce API calls
- Handle rate limiting gracefully

### Database Operations
- Use prepared statements for all queries
- Implement proper transaction handling
- Handle database connection errors
- Validate all database inputs

### File System Operations
- Use Tauri's file system APIs
- Handle permission errors gracefully
- Implement proper file validation
- Support cross-platform paths
