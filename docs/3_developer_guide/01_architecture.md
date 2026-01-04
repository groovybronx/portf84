# Lumina Portfolio - Technical Architecture

This document provides a detailed overview of Lumina Portfolio's technical architecture, including its core technologies, code structure, data management, and performance optimization strategies.

## System Overview

Lumina Portfolio is a **Local-First** native desktop application built with **Tauri v2**. It is designed for high performance and operates without an external backend.

### Core Technologies

| Layer              | Technology                        | Role                                   |
| ------------------ | --------------------------------- | -------------------------------------- |
| **Frontend**       | React 19 & Tailwind CSS v4        | User interface and styling             |
| **Runtime**        | Tauri v2                          | Native bridge, security, and bundling  |
| **Data Persistence** | SQLite (`@tauri-apps/plugin-sql`) | Local database for metadata storage    |
| **File System**    | `@tauri-apps/plugin-fs`           | Access to the native file system       |
| **UI Virtualization**| `@tanstack/react-virtual`         | Optimized rendering for large datasets |

## Code Architecture

The project follows a **feature-based modular architecture** to ensure maintainability and scalability.

```
src/
├── features/
│   ├── library/       # Photo grid, carousels, and cards
│   ├── navigation/    # TopBar and main navigation
│   ├── collections/   # Folder and project management
│   ├── vision/        # AI analysis and image viewer
│   └── tags/          # Tag management system
├── shared/
│   ├── components/    # Reusable UI components (UI Kit)
│   ├── contexts/      # Global state management
│   ├── hooks/         # Custom, reusable hooks
│   ├── types/         # Global TypeScript types
│   └── utils/         # Utility functions
├── services/
│   ├── storage/       # SQLite database modules
│   └── geminiService.ts # Gemini AI integration
└── App.tsx            # Main application entry point
```

### State Management

To optimize performance and prevent unnecessary re-renders, the global state is managed using a **"Context Split"** pattern. The primary `LibraryContext` is divided into two separate contexts:

-   `LibraryStateContext`: Provides read-only access to the application's data.
-   `LibraryDispatchContext`: Provides write-only access to actions that modify the state.

This separation ensures that components that only need to dispatch actions do not re-render when the application's data changes.

## Data Persistence and Local-First Approach

Lumina Portfolio is designed to be fully functional offline. All data is stored locally in a SQLite database.

### Database Schema

The SQLite database consists of four main tables:

-   `collections`: Manages workspaces or "projects."
-   `collection_folders`: Stores links to physical source folders on disk.
-   `virtual_folders`: Manages virtual albums and "shadow folders."
-   `metadata`: Stores enriched data, including AI-generated descriptions, tags, and color labels.

### Asset Protocol

Tauri's `asset://` protocol is used to securely and efficiently load local images. This approach avoids loading entire images into memory and respects the application's file system permissions.

## AI Integration with Gemini

The application leverages the `@google/genai` SDK to analyze images and generate rich metadata.

### Configuration

-   **Model**: `gemini-3-flash-preview` is used for all AI-related tasks.
-   **API Key Management**: The Gemini API key is securely stored and retrieved, with priority given to a secure local store, followed by `localStorage` (for development) and environment variables.
-   **CORS**: As a native Tauri application, there are no Cross-Origin Resource Sharing (CORS) restrictions, allowing for direct API calls to Google's services.

### Analysis Workflow

-   **Streaming Support**: The AI service supports streaming, which provides real-time feedback during the analysis process (the "Thinking Process").
-   **Batch Processing**: A queue-based system (`useBatchAI` hook) manages the analysis of multiple images, preventing API rate-limiting and ensuring the UI remains responsive.
-   **Error Handling**: The system includes robust error handling for issues such as missing API keys, malformed JSON responses, and network errors.

## Performance Optimizations

Several strategies are employed to ensure a smooth and responsive user experience, even with large photo libraries.

-   **UI Virtualization**: The `@tanstack/react-virtual` library is used to render only the items that are currently visible in the viewport, significantly reducing the number of DOM elements.
-   **Memoization and Lazy Loading**: `React.memo` is used to prevent unnecessary re-renders of components like `PhotoCard`. Images are also lazy-loaded to improve initial load times.
-   **Code Splitting**: Vite is configured to split the code into logical chunks, which are loaded on demand.

## Testing Strategy

The application's logic is tested using **Vitest**.

-   **Structure**: Tests are co-located in the `tests/` directory and cover critical logic, including custom hooks, services, and UI components.
-   **Environment**: Tests are run in a `jsdom` environment, which simulates a browser DOM.
-   **Mocks**: External dependencies, such as Tauri plugins and the Gemini SDK, are mocked to isolate the code under test.
