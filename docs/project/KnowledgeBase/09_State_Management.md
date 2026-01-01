# State Management Deep Dive

Lumina Portfolio uses **React Context** for state management, but with specific optimization patterns to handle high-frequency updates and large datasets.

## 1. LibraryContext (The Core)
**Location**: `src/contexts/LibraryContext.tsx`

This context manages the photos, folders, and view settings. It uses the **Split Context Pattern** to separate data (State) from behavior (Dispatch).

### Architecture
-   **`LibraryStateContext`**: Contains `folders`, `items`, `viewMode`, `searchTerm`, etc. Components that *render* data subscribe to this.
-   **`LibraryDispatchContext`**: Contains functions like `loadFromPath`, `setSearchTerm`, `updateItem`. Components that *trigger* actions (buttons, inputs) subscribe to this.

**Why?** A component that only needs to *set* the search term shouldn't re-render when the search term *changes*.

### State Interface
```typescript
interface LibraryState {
  folders: Folder[];          // Physical & Virtual folders
  activeFolderIds: Set<string>; // "all" or specific IDs
  viewMode: ViewMode;         // GRID, LIST, CAROUSEL
  gridColumns: number;        // 2-8
  searchTerm: string;
  selectedTag: string | null;
  activeColorFilter: string | null;
  sortOption: "date" | "name" | "size";
  sortDirection: "asc" | "desc";
  autoAnalyzeEnabled: boolean;
  useCinematicCarousel: boolean;
}
```

### Key Actions
-   `loadFromPath(path)`: Scans a physical directory, creates a source folder, merges metadata, and updates state.
-   `mergeFolders`: Complex reducer action that handles merging new scan results with existing virtual folders (Shadow Folders) to ensure metadata isn't lost during a refresh.
-   `batchUpdateItems`: Updates multiple items efficiently (used by AI analysis when processing a queue).

## 2. CollectionsContext (Workspaces)
**Location**: `src/contexts/CollectionsContext.tsx`

Manages "Collections" (distinct workspaces/libraries).

### Logic
-   **Active Collection**: Only one collection is active at a time. Changing the active collection triggers a DB reload of all folders and metadata.
-   **Source Folders**: Tracks which physical directories belong to the current collection.
-   **Persistence**: All changes (add/remove collection, add source folder) are immediately awaited against `storageService` before updating the React state.

### Usage
```typescript
const { activeCollection, switchCollection } = useCollections();
// switchCollection triggers a full re-mount of LibraryContext data
```

## 3. SelectionContext (Interaction)
**Location**: `src/contexts/SelectionContext.tsx`

Manages selection state (single, multi, drag-box).

### Drag Selection Optimization
This context implements a high-performance drag-select using `requestAnimationFrame` and `useRef`.
-   **`itemRefs`**: A `Map<string, HTMLElement>` holding direct DOM references to every `PhotoCard`.
-   **`rectCache`**: Cached `DOMRect` of every item, calculated *once* when the mouse goes down. This prevents layout thrashing during the drag.
-   **`rafId`**: The selection logic runs inside `requestAnimationFrame` to stay synced with the screen refresh rate (60fps).

### State
```typescript
interface SelectionState {
  selectionMode: boolean;     // Visual checkbox mode
  selectedIds: Set<string>;   // Selected Item IDs
  isDragSelecting: boolean;   // Is user currently dragging?
  dragBox: Rect | null;       // Visual box coordinates
}
```

## 4. ProgressContext (Async Feedback)
**Location**: `src/contexts/ProgressContext.tsx`

A global queue for background tasks (e.g., "Analyzing 5 images...", "Moving files...").

### Interface
```typescript
interface ProgressTask {
  id: string;
  label: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'error';
}
```
Components subscribe to `tasks` to render a toast or progress bar. Services use `addTask` / `updateTask` to report status.
