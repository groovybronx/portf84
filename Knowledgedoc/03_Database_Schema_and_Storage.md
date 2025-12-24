# Database Schema & Storage

## Overview
Lumina Portfolio uses **SQLite** as its persistent storage layer. The database is embedded within the application and accessed via the `@tauri-apps/plugin-sql` plugin.

**Database File**: `lumina.db`

## Schema Definition

The database consists of four primary tables designed to support the "Shadow Folder" architecture.

### 1. `collections`
Represents a workspace or a distinct library.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique ID (e.g., `col-173...`) |
| `name` | TEXT | NOT NULL | Display name of the collection |
| `createdAt` | INTEGER | NOT NULL | Timestamp (ms) |
| `lastOpenedAt` | INTEGER | | Timestamp for sorting MRU |
| `isActive` | INTEGER | DEFAULT 0 | Boolean flag (0/1) for current active collection |

### 2. `collection_folders`
Links physical directories on the user's disk to a collection. These are the **Source Folders**.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique ID |
| `collectionId` | TEXT | NOT NULL | FK referencing `collections.id` |
| `path` | TEXT | NOT NULL | Absolute system path to the directory |
| `name` | TEXT | NOT NULL | Folder name |
| `addedAt` | INTEGER | NOT NULL | Timestamp |

### 3. `virtual_folders`
Represents virtual containers. This table serves two purposes:
1.  **Shadow Folders**: Virtual mirrors of source folders.
2.  **Manual Collections**: User-created albums.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique ID |
| `collectionId` | TEXT | NOT NULL | FK referencing `collections.id` |
| `name` | TEXT | NOT NULL | Display name |
| `createdAt` | INTEGER | NOT NULL | Timestamp |
| `isVirtual` | INTEGER | DEFAULT 1 | Always 1 for this table |
| `sourceFolderId` | TEXT | | **Crucial**: If present, this is a Shadow Folder linked to a Source Folder. If NULL, it is a manual user collection. |

### 4. `metadata`
Stores enriched data for individual files (images). This enables the "Non-Destructive" feature, as this data is stored in SQLite, not in the image files themselves.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | **Relative Path** of the file (serves as unique ID) |
| `collectionId` | TEXT | | FK referencing `collections.id` |
| `virtualFolderId` | TEXT | | FK referencing `virtual_folders.id` |
| `aiDescription` | TEXT | | Generated description |
| `aiTags` | TEXT | | JSON Array of strings (e.g., `["landscape", "blue"]`) |
| `aiTagsDetailed` | TEXT | | JSON Array of objects with confidence (e.g., `[{"name":"sky", "confidence":0.9}]`) |
| `colorTag` | TEXT | | Color code (e.g., "red", "blue") |
| `manualTags` | TEXT | | JSON Array of user-added tags |
| `isHidden` | INTEGER | DEFAULT 0 | Soft delete / hide flag |
| `lastModified` | INTEGER | NOT NULL | Timestamp of last metadata update |

## Data Flow & Operations

### Initialization
The database connection is singleton-managed in `src/services/storageService.ts`. The schema is created via `IF NOT EXISTS` queries on app startup.

### Adding a Folder
1.  User selects a directory via Native Dialog.
2.  `storageService.addFolderToCollection` is called.
3.  A row is inserted into `collection_folders` (The Source).
4.  A corresponding row is automatically inserted into `virtual_folders` with `sourceFolderId` linking to the Source (The Shadow Folder).
5.  **Why?** The UI interacts with the Shadow Folder to allow users to "move" items into other virtual albums without affecting the physical Source Folder.

### File Scanning & Hydration
When a folder is opened:
1.  `tauri-plugin-fs` scans the physical directory for files.
2.  `storageService.getMetadataBatch` fetches metadata for these files from SQLite.
3.  The application merges the physical file data (name, size) with the stored metadata (AI tags, description).
4.  If a file has no metadata entry, it is displayed with raw file info.
5.  If a file is analyzed by AI, the result is saved to `metadata`.

### JSON Serialization
Since SQLite does not support native array types, tags are serialized as JSON strings before storage and parsed back into arrays upon retrieval.
-   `JSON.stringify(tags)` -> DB
-   `JSON.parse(dbValue)` -> App

## Legacy Tables
-   `handles`: A deprecated table used in earlier versions for file system handles. It is currently preserved but scheduled for removal.
