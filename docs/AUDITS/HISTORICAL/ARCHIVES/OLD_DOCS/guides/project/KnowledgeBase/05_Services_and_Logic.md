# Services & Business Logic

This document details the singleton services that handle the application's core logic.

## 1. Storage Service (`src/services/storageService.ts`)

**Role**: Interface between the Frontend and the SQLite Database.

### Key Responsibilities
-   **Database Initialization**:
    -   Checks if `dbInstance` exists.
    -   If not, connects to `lumina.db` via `Database.load`.
    -   Runs `CREATE TABLE IF NOT EXISTS` for all schema tables.
-   **Metadata Management**:
    -   `saveMetadata`: Upserts rows into the `metadata` table.
    -   `getMetadataBatch`: efficiently retrieves metadata for a list of file paths (IDs) in a single query loop.
-   **Folder Management**:
    -   `addFolderToCollection`: Atomically adds a source folder *and* creates its shadow folder.
    -   `getShadowFoldersWithSources`: Joins `virtual_folders` and `collection_folders` manually (in application logic) to return paired data for the UI.

### Concurrency Handling
The service uses a "Promise Singleton" pattern for initialization:
```typescript
let dbInitPromise: Promise<Database> | null = null;
// ...
if (dbInitPromise) return dbInitPromise; // Return running promise if init is in flight
```
This prevents race conditions if multiple components request the DB immediately on startup.

## 2. Gemini Service (`src/features/vision/services/geminiService.ts`)

**Role**: Handles communication with the Google Gemini API for image analysis.

### Workflow
1.  **Input**: Receives a `PortfolioItem` (which contains a `File` object).
2.  **Preprocessing**: Converts the `File` to a Base64 string.
3.  **API Call**:
    -   Uses `@google/genai` SDK.
    -   Model: `gemini-3-flash-preview` (or configured fallback).
    -   **Prompt**: See [AI_SERVICE.md](../../architecture/AI_SERVICE.md) for the specific prompt.
4.  **Parsing**:
    -   Expects a JSON response.
    -   Parses the JSON string.
    -   Normalizes tags (extracts string array from detailed object array if needed).
5.  **Output**: Returns `{ description, tags, tagsDetailed }`.

### Error Handling
-   Uses custom error classes (`ApiKeyError`, `NetworkError`, `GeminiError`).
-   Checks for missing API keys via secure storage or environment variables.
-   Catches JSON parse errors if the AI returns malformed text.

## 3. Library Loader (`src/services/libraryLoader.ts`)

**Role**: Scans the file system and aggregates data for the UI.

### The Scan Process
1.  **Recursive Scan**: Uses a helper function to walk through directories using `tauri-plugin-fs`.
2.  **Filtering**: Ignores system files (`.DS_Store`, `Thumbs.db`) and non-image extensions.
3.  **Batch Metadata Fetch**:
    -   Collects all found file paths.
    -   Calls `storageService.getMetadataBatch` with all paths.
4.  **Merge Strategy**:
    -   Iterates through scanned files.
    -   Lookups metadata in the fetched Map.
    -   Constructs the final `PortfolioItem` object.
    -   **Asset URL Generation**: calls `convertFileSrc` to create `asset://` URLs.

### Virtual Folder Logic
-   If scanning a **Source Folder**, it returns the physical hierarchy.
-   If loading a **Virtual Collection**, it queries `virtual_folder_items` (implied logic via metadata `virtualFolderId`) to find which images belong to the collection, regardless of their physical location.
