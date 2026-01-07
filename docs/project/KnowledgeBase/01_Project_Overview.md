# Project Overview: Lumina Portfolio

## Introduction
**Lumina Portfolio** is a high-performance, local-first native desktop application designed for photographers and creatives to manage, analyze, and showcase their image portfolios. Built with **Tauri v2** and **React 19.2**, it bridges the gap between a lightweight file viewer and a robust digital asset manager (DAM).

The core philosophy is **"Hybrid Management"**: users can manage their physical files on disk while simultaneously organizing them into virtual collections, enriched with AI-generated metadata, without altering the original files.

## Core Value Proposition
-   **Local-First & Privacy**: All data, including the database and analyzed metadata, resides locally on the user's machine. No cloud dependencies for storage.
-   **AI-Powered Organization**: Integrates Google Gemini AI to automatically tag, describe, and categorize images.
-   **Performance**: Optimized for large libraries using virtualization, lazy loading, and native Rust backend operations.
-   **Non-Destructive**: Uses "Shadow Folders" to mirror physical directories, allowing safe organization without moving actual files.

## Technology Stack

### Frontend
-   **Framework**: [React 19.2](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **State Management**: React Context (Split Pattern)
-   **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual/v3)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Backend (Runtime)
-   **Core**: [Tauri v2](https://v2.tauri.app/) (Rust)
-   **Database**: SQLite (via `@tauri-apps/plugin-sql`)
-   **File System**: Native FS access (via `@tauri-apps/plugin-fs`)
-   **Dialogs**: Native OS dialogs (via `@tauri-apps/plugin-dialog`)

### AI Services
-   **Provider**: Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`)
-   **Integration**: Direct API calls via `@google/genai` SDK

## Key Features

### 1. Hybrid File Management
-   **Source Folders**: Links to physical directories on the user's disk (Read-Only context).
-   **Shadow Folders**: Virtual mirrors of source folders that allow metadata enrichment and virtual organization.
-   **Manual Collections**: Purely virtual albums for curating specific sets of images independent of file location.

### 2. Intelligent Analysis
-   **Auto-Tagging**: Generates 5-8 relevant tags per image.
-   **Smart Descriptions**: Creates concise 1-2 sentence descriptions.
-   **Technical Extraction**: Identifies camera movements or technical details where applicable.
-   **Confidence Scores**: Stores confidence levels for generated tags.

### 3. Advanced Search & Filtering
-   **Fuzzy Search**: powered by `fuse.js` for forgiving search queries.
-   **Color Filtering**: 6-color coding system for rapid visual sorting.
-   **Tag Filtering**: Filter by AI-generated or manual tags.

### 4. High-Performance UI
-   **Masonry Grid**: Adaptive layout that handles images of varying aspect ratios.
-   **Virtual Scrolling**: Renders only visible items to support libraries of thousands of images.
-   **Optimized Rendering**: Uses `React.memo` and context splitting to minimize re-renders.

## Roadmap & Status
Current Version: **v0.1.0** (Alpha/Beta)

-   [x] Basic Library Management (Scan/View)
-   [x] SQLite Persistence
-   [x] Gemini AI Integration
-   [x] Virtual Collections
-   [ ] Advanced Batch Operations
-   [ ] Export/Share Functionality
-   [ ] Dark/Light Mode Toggle (Currently Dark Mode Default)
