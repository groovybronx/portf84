# Architecture Deep Dive

## High-Level Architecture

Lumina Portfolio follows a standard Tauri v2 architecture, separating the application into two distinct processes that communicate via an IPC (Inter-Process Communication) bridge.

```mermaid
graph TD
    subgraph "Frontend (Webview)"
        React[React 19 App]
        Services[TypeScript Services]
        State[Context State]
    end

    subgraph "Backend (Core Process)"
        Tauri[Tauri Core (Rust)]
        Plugins[Tauri Plugins]
        SQLite[SQLite DB]
    end

    React <-->|IPC / Commands| Tauri
    Services <-->|IPC / Plugins| Plugins
    Plugins <-->|Native Access| SQLite
    Plugins <-->|Native Access| FileSystem
```

## The "Local-First" Philosophy

The application is designed to be **Local-First**, meaning:
1.  **Primary Source of Truth**: The local SQLite database (`lumina.db`) and the local file system.
2.  **Offline Capability**: The app functions fully offline (except for AI analysis which requires an internet connection).
3.  **Data Sovereignty**: User data is never sent to a cloud server managed by the app developers. AI analysis sends data directly to Google's API only when requested.

## Frontend Architecture

### Fractal Structure
The `src/` directory is organized by features rather than technical layers, promoting modularity.

```
src/
├── features/           # Self-contained feature modules
│   ├── library/        # Main photo grid, viewing logic
│   ├── navigation/     # Sidebar, Topbar
│   ├── collections/    # Collection management logic
│   └── vision/         # AI analysis components
├── services/           # Singleton services for external logic
├── contexts/           # Global state providers
└── shared/             # Reusable UI components and hooks
```

### State Management: The Split Context Pattern

To ensure high performance with large datasets, the application avoids a single monolithic global state that triggers app-wide re-renders. Instead, it uses the **Split Context Pattern**.

**Example: LibraryContext**
The library state is split into two separate contexts:
1.  `LibraryStateContext`: Holds the data (`items`, `loading`, `viewMode`).
2.  `LibraryDispatchContext`: Holds the actions (`setItems`, `updateItem`, `refresh`).

**Benefit**: Components that only need to *trigger* an action (like a button in the toolbar) consume `LibraryDispatchContext`. Consequently, they do **not** re-render when the `items` list changes, significantly reducing the render load during bulk updates.

```typescript
// Usage
const { dispatch } = useLibraryActions(); // No re-render on data change
const { items } = useLibraryState();      // Re-renders only on data change
```

## Backend & Data Persistence

### SQLite Integration
The app uses `@tauri-apps/plugin-sql` to interface with a local SQLite database.
-   **Database File**: `lumina.db` (located in the app's app_data directory).
-   **Initialization**: The schema is checked and initialized in `storageService.ts` on startup.

### File System Access
-   **Reading**: Uses `@tauri-apps/plugin-fs` to scan directories recursively.
-   **Displaying**: Uses the Tauri **Asset Protocol**.
    -   Local path: `/Users/me/photo.jpg`
    -   Asset URL: `asset://localhost/Users/me/photo.jpg`
    -   This allows the webview to load local images securely without standard browser security blocking local file access.

### Permissions & Security
Tauri v2 uses a capability-based permission system (`src-tauri/capabilities/default.json`).
-   `fs:allow-read-dir`: Scoped to `$HOME/**`.
-   `fs:allow-read-file`: Scoped to `$HOME/**`.
-   `sql:allow-*`: Full access to the local database file.
-   `dialog:default`: Permission to open system file pickers.

## Performance Strategies

1.  **Virtualization**: The `PhotoGrid` uses `@tanstack/react-virtual` to render only the DOM nodes currently visible in the viewport. This is critical for scrolling through libraries of 10,000+ images.
2.  **Masonry Layout**: A custom implementation calculates absolute positions for images to create a tightly packed "masonry" look without vertical gaps, optimized for varying aspect ratios.
3.  **Lazy Loading**: Images use `loading="lazy"` and `decoding="async"` hints.
4.  **Memoization**: `React.memo` is aggressively used on list items (`PhotoCard`) to prevent re-renders when parent states (like selection count) change, unless the specific item is affected.
