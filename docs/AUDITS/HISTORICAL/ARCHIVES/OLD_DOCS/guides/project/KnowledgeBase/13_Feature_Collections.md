# Feature: Collections

**Directory**: `src/features/collections`

This feature manages the structural organization of the user's library.

## Concepts

### 1. Workspace (Collection)
A "Collection" in this context is a **Library Workspace**.
-   Example: "Professional Work", "Family Photos", "Archive 2023".
-   A user switches between workspaces. They are completely isolated databases logically (though they share the same SQLite file, filtered by `collectionId`).

### 2. Source Folders (Physical)
-   Linked directories on the hard drive.
-   The app "watches" these (currently via manual refresh or startup scan).
-   **Read-Only**: The app does not delete or move files *on disk* unless explicitly requested (delete command).

### 3. Shadow Folders (Virtual Mirror)
-   For every Source Folder, a Shadow Folder is created.
-   **Purpose**: To allow metadata (tags, colors) to be attached to files without writing sidecar files (`.xmp`) to the user's disk.
-   **Behavior**: When you browse a folder in the sidebar, you are technically browsing the *Shadow Folder*, which is populated by merging Physical File Data + DB Metadata.

### 4. Virtual Albums (Manual Collections)
-   Folders that exist *only* in the database.
-   Files can be "moved" here. In reality, the file stays on disk, but its reference is added to this virtual folder in the DB.

## Components

### `CollectionManager` (`components/CollectionManager.tsx`)
A modal to Create, Switch, or Delete workspaces.
-   Lists all rows from `collections` table.
-   Shows "Last Opened" date.

### `FolderDrawer` (`components/FolderDrawer.tsx`)
The list component used in the Sidebar.
-   **Recursive Rendering**: Can handle nested folders (though currently the app flattens structure mostly).
-   **Status Indicators**: Icons for "Disconnected" (if drive is missing) or "Syncing".

## Interactions
-   **Add Source**: Uses `tauri-plugin-dialog` to open OS native picker.
-   **Remove Source**: Unlinks the folder. *Does not delete files.*
-   **Delete Button (Phase 4.4)**: Working folders in the sidebar now have a trash icon that appears on hover. Clicking it removes the folder from the collection and automatically refreshes the UI.

## Folder Management (Phase 4.4)

**Quick Delete from Sidebar**: Users can now remove working folders directly from the sidebar without opening collection management.

**Implementation**:
- Delete button (trash icon) appears on hover for each working folder
- Clicking removes the folder from the active collection
- Library automatically clears and reloads remaining folders
- UI refreshes instantly without page reload

**User Experience**:
1. Expand "Working Folders" section in sidebar
2. Hover over a folder
3. Click trash icon to remove from collection
4. Folder disappears immediately from list

**Note**: This only removes the folder from the collection metadata - files on disk are not affected.
