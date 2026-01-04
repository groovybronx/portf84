# Lumina Portfolio - User Guide

Welcome to the user guide for Lumina Portfolio. This document provides a comprehensive overview of the application's features and how to use them effectively.

## Core Interface

Lumina Portfolio's interface is designed to be both powerful and intuitive, with a clean layout that prioritizes your photos.

### Main Views

You can switch between three primary views to browse your photo library:

-   **Photo Grid**: A masonry-style grid that displays a large number of photos at once. It uses virtualization to ensure smooth scrolling, even with thousands of images.
-   **Photo Carousel**: A standard carousel view that focuses on a single image at a time, with smooth transitions and a convenient scrubber for quick navigation.
-   **Cinematic Carousel**: An immersive 3D carousel that provides a more dynamic browsing experience.

### Top Bar

The top bar provides access to essential controls and navigation:

-   **View Switcher**: Toggles between the Grid, Carousel, and Cinematic views.
-   **Smart Search**: A unified search bar that uses fuzzy search to find photos based on file names, AI descriptions, and manual or AI-generated tags.
-   **Color Filters**: Allows you to quickly filter your library by color tags.

### Folder Drawer

The folder drawer is a collapsible sidebar that organizes your work into **Projects**. Each project contains its own library, physical folders, and virtual collections.

-   **Pinning**: The drawer can be pinned to the side of the screen for persistent access or used as a floating panel.
-   **Sections**:
    -   **Work Folders**: Direct links to physical folders on your computer.
    -   **Collections**: Virtual albums for organizing photos without moving the underlying files.
    -   **Color Filters**: Smart folders that group images by their assigned color tag.

## Photo Management

Lumina Portfolio offers a range of tools for managing and organizing your photos.

### Photo Card

Each photo in the grid is represented by a **Photo Card**, which is optimized for performance and interactivity.

-   **Lazy Loading**: Images are loaded asynchronously with a skeleton placeholder to ensure a smooth browsing experience.
-   **Flip Animation**: Clicking the "info" button flips the card to reveal detailed metadata, including AI-generated descriptions and tags.
-   **Contextual Information**: The back of the card also displays the folder or collection the photo belongs to, with color-coded icons for easy identification.

### Image Viewer

Double-clicking a photo opens the **Image Viewer**, which provides a full-screen view and additional tools:

-   **AI Analysis**: A dedicated "Analyze" button triggers Gemini AI to generate a detailed description and relevant tags for the photo.
-   **Tag Management**: You can add or remove tags directly from the viewer.
-   **Color Tagging**: Assign color tags using the number keys (1-6) or remove them with the (0) key.

### Context Menu

Right-clicking a photo opens a context-sensitive menu with a variety of actions:

-   **Analyze (AI)**: Initiates AI analysis for the selected photo.
-   **Add Tags**: Opens a modal for adding manual tags.
-   **Move to Collection**: Moves the selected photo(s) to a virtual collection.
-   **Color Tag**: Applies a color tag to the selected photo(s).
-   **Open**: Opens the photo in the full-screen image viewer.
-   **Delete**: Moves the photo to the application's trash.

## Tag Hub

**Tag Hub** is a centralized interface for managing all the tags in your library. It can be opened with the `Ctrl+T` keyboard shortcut.

### Tabs

-   **Browse**: Explore and filter your tags. You can apply multiple tags to create highly specific filters.
-   **Manage**: Perform bulk operations on your tags, such as merging or deleting.
-   **Fusion**: An intelligent tool that automatically detects and suggests merges for similar or duplicate tags.
-   **Settings**: Configure the sensitivity of the tag fusion tool and other preferences.

## Interactions and Shortcuts

Lumina Portfolio is designed for efficiency, with extensive support for keyboard shortcuts and mouse gestures.

### Mouse Interactions

-   **Single-Click**: Focuses on a photo and auto-scrolls it into view.
-   **Double-Click**: Opens the photo in the full-screen viewer.
-   **Right-Click**: Opens the context menu.
-   **Drag-Select**: Click and drag to draw a selection box around multiple photos.

### Keyboard Shortcuts

-   **Navigation**: Use the arrow keys (`↑`, `↓`, `←`, `→`) to navigate between photos in the grid.
-   **Open/Close**: `Space` or `Enter` opens or closes the full-screen viewer.
-   **Color Tagging**: Use the number keys `1-6` to apply color tags and `0` to remove them.
-   **Exit**: `Escape` closes modals, cancels selections, or exits the full-screen viewer.
-   **Tag Hub**: `Ctrl+T` opens and closes the Tag Hub.

This guide covers the core features and workflows of Lumina Portfolio. For more detailed information on technical aspects or contribution guidelines, please refer to the developer and contribution guides.
