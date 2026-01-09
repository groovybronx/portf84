# Developer Guide

## Prerequisites

To build and contribute to Lumina Portfolio, you need the following installed:

1.  **Node.js**: v18 (LTS) or higher.
2.  **Package Manager**: `npm` (included with Node).
3.  **Rust**: Stable toolchain.
    -   Install via `rustup`: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
4.  **OS Dependencies**:
    -   **macOS**: Xcode Command Line Tools (`xcode-select --install`).
    -   **Windows**: C++ Build Tools (via Visual Studio Installer).
    -   **Linux**: `webkit2gtk`, `gtk3`, `libappindicator3`.

## Setup & Running

1.  **Clone the Repository**:
    ```bash
    git clone <repo-url>
    cd lumina-portfolio
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Development Mode**:
    This command runs the Vite dev server (frontend) and the Tauri dev process (backend) concurrently.
    ```bash
    npm run tauri:dev
    ```
    -   Frontend: `http://localhost:1420`
    -   Application Window: Opens automatically.

## Build for Production

To create a distributable binary (DMG, EXE, AppImage):

```bash
npm run tauri:build
```
The artifacts will be located in `src-tauri/target/release/bundle/`.

## Project Structure (Fractal)

We follow a **Feature-Based** (Fractal) architecture. Code is co-located by *feature* rather than *type*.

-   **Bad**: `src/components/PhotoGrid.tsx`, `src/actions/libraryActions.ts`
-   **Good**: `src/features/library/components/PhotoGrid.tsx`, `src/features/library/logic/actions.ts`

**Rule**: If a component is only used within "Vision" (AI features), it belongs in `src/features/vision/`. If it's generic (like a Button), it goes to `src/shared/components`.

## Testing

**Vitest** is the test runner.

-   **Run Tests**: `npm run test`
-   **Location**: `tests/` (Root level).
-   **Mocks**: Tauri APIs (`fs`, `sql`, `dialog`) are mocked in `tests/` to run in a Node/JSDOM environment without the Tauri Rust runtime.

## Common Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs only the web frontend (in browser, no native APIs). |
| `npm run tauri:dev` | Runs full native app in dev mode. |
| `npm run tauri:icon` | Generates app icons from source image. |
| `cargo test` | Runs Rust backend tests (in `src-tauri`). |
