# Feature: Navigation

**Directory**: `src/features/navigation`

This feature handles the app chrome: Sidebar and TopBar.

## Components

### `TopBar` (`components/TopBar.tsx`)
The main control header.
-   **Composition**:
    -   `SearchField`: Debounced input writing to `LibraryContext`.
    -   `SortControls`: Dropdowns for Sort Option and Direction.
    -   `ViewToggle`: Icons to switch Grid/List/Carousel.
    -   `BatchActions`: Appears only when `selectionMode` is active. Contains "Tag", "Color", "Analyze", "Move", "Delete".
    -   `ColorPicker`: A quick filter bar (Red, Orange, Yellow, Green, Blue, Purple).

**Logic**:
The `TopBar` is largely a "dumb" component that dispatches actions to `LibraryDispatchContext`. It does not hold local state for the library data.

### `Sidebar` (`Sidebar.tsx`)
*Note: Located in `src/features/navigation/Sidebar.tsx` (imported in App.tsx).*

**Modes**:
-   **Pinned**: Static width, shifts the main content.
-   **Floating**: Overlay drawer for smaller screens.

**Sections**:
1.  **Library**: "All Photos", "Favorites" (filtered by heart tag), "Trash".
2.  **Collections**: List of user-created virtual albums.
    -   Supports Drag & Drop: Dropping an image here calls `moveItemsToFolder`.
3.  **Working Folders**: List of Source/Shadow folders.
    -   Indicates which physical folders are linked.

**Drag & Drop Targets**:
The Sidebar folder items are wrapped in `DropZone` logic. When a user drags a photo from the Grid, the Sidebar folders highlight to indicate they are valid targets.

## Integration
The navigation feature is the primary writer to the Global State (Contexts).
-   Typing in Search -> `dispatch({ type: "SET_SEARCH_TERM" })`
-   Clicking a Folder -> `dispatch({ type: "SET_ACTIVE_FOLDER_IDS" })`
