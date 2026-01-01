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
