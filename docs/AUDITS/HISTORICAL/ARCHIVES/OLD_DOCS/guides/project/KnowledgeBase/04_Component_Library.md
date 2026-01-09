# Component Library & UI Patterns

## Overview
Lumina Portfolio uses a custom component system built with **React 18.3.1**, **Tailwind CSS v4**, and **Framer Motion**. The UI is designed to be dark, sleek, and content-focused.

## Key Components

### `PhotoGrid` (`src/features/library/components/PhotoGrid.tsx`)
The central component of the application.
-   **Responsibility**: Renders the grid of images.
-   **Technology**: Uses `@tanstack/react-virtual` for masonry layout virtualization.
-   **Props**:
    -   `items`: Array of `PortfolioItem`.
    -   `onSelect`: Handler for selection.
-   **Logic**:
    -   Calculates column heights dynamically to place images in the shortest available column (Masonry).
    -   Virtualizer tracks the scroll position of the `main` container.

### `PhotoCard` (`src/features/library/components/PhotoCard/`)
Represents a single image unit.
-   **Optimization**: Wrapped in `React.memo` to prevent unnecessary re-renders during selection state changes of *other* items.
-   **Features**:
    -   Hover overlays for selection and quick actions.
    -   Displays AI badges and color tags.
    -   Handles drag-and-drop initiation.

### `FolderDrawer` (`src/features/collections/components/FolderDrawer/`)
The main navigation controller.
-   **Modes**:
    -   **Pinned**: Static width (`w-80`), pushes content.
    -   **Float**: Overlay mode with backdrop blur.
-   **Content**:
    -   Lists "Working Folders" (Shadow Folders).
    -   Lists "Collections" (Virtual Albums).
    -   Drag target for moving images.

### `ImageViewer` (`src/features/vision/ImageViewer.tsx`)
The full-screen detail view.
-   **Features**:
    -   Zoom/Pan capabilities.
    -   Sidebar for metadata editing (AI analysis trigger, tagging).
    -   Keyboard navigation (Arrow keys).

## Shared UI Kit (`src/shared/components/`)

### `GlassCard`
A wrapper component that implements the "Glassmorphism" effect used throughout the app.
-   **Styles**: `bg-gray-900/60 backdrop-blur-md border border-white/10`.

### `Button`
Standardized button component.
-   **Variants**: `primary` (Solid accent), `ghost` (Transparent), `outline`.
-   **Sizes**: `sm`, `md`, `lg`.

## UI Patterns

### Virtualization Strategy
To handle 10,000+ images without DOM bloat:
1.  **Measurement**: The aspect ratio of every image is known (either from metadata or calculated on load).
2.  **Projection**: The grid calculates exactly where each item *will* be positioned before it renders.
3.  **Windowing**: Only items within `scrollY` ± `overscan` (buffer) are mounted to the DOM.

### Animations
**Framer Motion** is used for:
-   **Page Transitions**: Smooth fades when switching views.
-   **Micro-interactions**: Hover scales on cards.
-   **Layout Animations**: `layout` prop used in the Sidebar to animate folder lists reordering.

### Tailwind v4 Configuration
The project uses the latest Tailwind v4.
-   **CSS Variables**: Theme colors are defined as CSS variables for dynamic runtime switching (future proofing for Light Mode).
-   **JIT**: Full Just-In-Time compilation is native to v4.
