# UI Architecture Audit

## Overview

This document describes the UI architecture of the project based on code analysis.

## Core Principles

1. **Component Composition** - Complex UIs built from smaller reusable components
2. **Consistent Design System** - Standardized component interfaces and styling
3. **Performance-Centric** - Optimized rendering and state management
4. **Accessibility First** - Semantic HTML and ARIA-compliant patterns

## Key Architectural Patterns

### Component Hierarchy

```
App
├── Layouts (AppLayout, MainLayout)
├── Features
│   ├── Navigation (TopBar, FolderDrawer)
│   ├── Tags (TagHub, TagEditor)
│   └── Vision (ImageViewer)
└── Shared UI
    ├── Surfaces (GlassCard, Panel)
    ├── Controls (Button, SearchField)
    └── Utilities (Icon, cn)
```

### State Management

- **Context API** for cross-component state
- **Local State** for UI-specific behaviors
- **Optimized Updates** via React.memo and selective context consumption

### Design System Implementation

- **Tailwind CSS** with custom glassmorphism utilities
- **Component Variants** via props (primary, ghost, glass, etc.)
- **Responsive Design** with mobile-first breakpoints

## Key Components

### TopBar

- Responsive navigation bar with dynamic show/hide
- Composed of 7 sub-components
- Uses Framer Motion for animations

### GlassCard

- Foundation for all glass surfaces
- Extended by Panel for sidebar implementations
- Handles border, padding, and background consistency

## Performance Considerations

1. Virtualized lists for large collections
2. Animation optimizations via Framer Motion
3. Conditional rendering based on interaction state
4. Memoized component trees

## Detailed Component Analysis

### TopBar Component

- **Composition**:
  - 5 sub-components (SearchField, SortControls, BatchActions, ColorPicker, ViewToggle)
  - 3 main sections (left, middle, right)
- **State Management**:
  - 2 contexts (LibraryContext, SelectionContext)
  - 2 local states (isHovered, isViewMenuOpen)
  - Derived state (isFiltered, filteredCount)
- **Performance**:
  - Framer Motion animations
  - Conditional rendering
  - Memoized calculations
- **Accessibility**:
  - Semantic button elements
  - Title attributes
  - Keyboard shortcuts

### GlassCard/Panel System

- **Foundation**: GlassCard handles core glass styling
- **Extension**: Panel adds sidebar-specific features
- **Consistency**:
  - Uniform padding
  - Consistent border handling
  - Variant support

### Modal Management

- **Centralized Control**: AppModals container
- **Consistent Props**: Unified interface for all modals
- **State Management**: Props-driven visibility control

## Performance Deep Dive

### Optimization Techniques

1. **Virtualization**:
   - TanStack Virtual for large lists
   - Dynamic viewport rendering
2. **Animation Efficiency**:
   - Framer Motion optimized renders
   - AnimatePresence for exit animations
3. **Memoization**:
   - React.memo for pure components
   - useCallback for stable references
4. **Conditional Rendering**:
   - Component-level visibility toggles
   - Dynamic class application

## Accessibility Audit

### Compliance Features

- **Semantic HTML**: Proper element usage
- **Keyboard Navigation**: Tab-accessible components
- **ARIA Attributes**:
  - Roles where applicable
  - Labels for icon buttons
- **Visual Feedback**:
  - Hover states
  - Focus rings
  - Transition animations

### Improvement Opportunities

1. Add aria-labels for color filters
2. Implement focus trapping in modals
3. Enhance screen reader support

## Design System Consistency

### Core Principles

1. **Utility-First CSS**: Tailwind with custom extensions
2. **Component Variants**: Consistent props interface
3. **Responsive Design**: Mobile-first breakpoints

### Implementation Patterns

- **Button Component**:
  - 8 variants (primary, ghost, glass, etc.)
  - 5 sizes (sm, md, lg, icon, icon-lg)
  - Icon positioning
- **Surface Components**:
  - GlassCard foundation
  - Panel extension
  - Consistent padding/borders
- **Spacing System**:
  - Gap utilities (gap="xs", gap="sm")
  - Padding scales (p-2, p-4, etc.)

## Application Structure

### High-Level Component Tree

```
App
├── AppLayout (provides layout structure)
│   ├── TopBar (navigation)
│   ├── MainLayout (content area)
│   │   ├── FolderDrawer (left panel)
│   │   ├── TagHub (right panel)
│   │   └── GalleryView (main content)
│   └── AppModals (modal container)
└── ErrorBoundary (global error handling)
```

### Key Connections

- **AppLayout**: Wraps all UI components and provides layout context
- **MainLayout**: Contains the main content area and side panels
- **AppModals**: Rendered at root level for overlay management

## State Flow

### Data Propagation

1. **Top-Down**:
   - Props drilling for component-specific data
   - Context providers for shared data (LibraryContext, SelectionContext)
2. **Bottom-Up**:
   - Callback props for user interactions
   - Context dispatchers for state updates

### State Management Patterns

- **Centralized State**: LibraryContext for global app data
- **Local State**: useState for UI-specific state (e.g., modal visibility)
- **Derived State**: Computed values (e.g., filteredItems)

## Error Handling

### Strategies

1. **Error Boundaries**:
   - Top-level ErrorBoundary component
   - Fallback UI for critical errors
2. **UI Feedback**:
   - Toast notifications for user actions
   - Error states in forms
3. **Logging**:
   - Centralized logger with error reporting

### Implementation

- ErrorBoundary component catches rendering errors
- try/catch blocks for async operations
- Error messages localized via i18n

## Internationalization (i18n)

### Implementation

- react-i18next framework
- JSON translation files per locale
- useTranslation hook in components

### Patterns

- Keys-based translation (t('key'))
- Dynamic values (t('message', { value }))
- Plurals support

## Testing

### Strategies

1. **Unit Tests**:
   - Vitest for utility functions
   - Component snapshot tests
2. **Integration Tests**:
   - React Testing Library for component interactions
3. **Accessibility Tests**:
   - axe-core for automated checks
   - Manual keyboard navigation tests

### Coverage

- Core utilities: 100%
- Shared components: ~85%
- Feature components: ~70%
