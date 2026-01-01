# Feature: Vision (AI & Viewing)

**Directory**: `src/features/vision`

This feature encapsulates the "Single Image View" and the AI analysis logic.

## Components

### `ImageViewer` (`components/ImageViewer.tsx`)
A full-screen modal/overlay for viewing a single image.

**Capabilities**:
-   **Zoom/Pan**: Uses transform CSS (`scale`, `translate`). Mouse wheel to zoom, drag to pan.
-   **Navigation**: Left/Right arrow keys navigate the `processedItems` array (passed from Library).
-   **Metadata Panel**: A side panel displaying:
    -   Filename, Resolution, Size.
    -   **AI Description**: Editable text area.
    -   **Tags**: Chip input for manual or AI tags.
    -   **Color**: Color picker for the 6-color tagging system.
    -   **Histogram**: (Planned/Partial) RGB histogram.

**AI Trigger**:
The panel contains an "Analyze" button (Sparkles icon).
-   **Click**: Calls `analyzeImage` service.
-   **Loading**: Shows a shimmer effect.
-   **Result**: Automatically populates Description and Tags fields.

## Logic

### `useBatchAI` (`hooks/useBatchAI.ts`)
A hook designed for the Grid view to analyze multiple items.
-   **Queue System**: Maintains a queue of Item IDs.
-   **Concurrency**: Processes items one by one (or limited concurrency) to avoid API rate limits.
-   **Progress**: Reports to `ProgressContext`.
-   **Storage**: Saves results to SQLite immediately after each success.

### `geminiService` Integration
The `ImageViewer` calls `geminiService.analyzeImage(item)`.
-   **Input**: The current `PortfolioItem`.
-   **Process**: Reads file -> Base64 -> API.
-   **Output**: Updates the local item state and persists to DB via `updateItem` action.
