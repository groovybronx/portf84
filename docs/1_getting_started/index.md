# 🚀 Getting Started with Lumina Portfolio

Welcome to Lumina Portfolio! This guide will walk you through the installation process and initial setup of the application and your development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)**: LTS version recommended.
- **[Rust](https://rustup.rs/)**: Stable toolchain.
- **Operating System**: macOS 10.15+, Windows 10+, or a compatible Linux distribution.

## Installation

Follow these steps to get the application running on your local machine.

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

### 2. Install Dependencies

Next, install the necessary project dependencies using npm:

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

For local development, you can create a `.env.local` file in the root of the project to store your Gemini API key. This step is optional, as the key can also be configured through the application's settings menu after launch.

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: You can obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Running the Application

You can run the application in two different modes:

- **Development Mode**: This launches the full native application with hot-reloading enabled for both the frontend and the Tauri backend.
  ```bash
  npm run tauri:dev
  ```

- **Web-Only Mode**: For faster frontend iteration, you can run just the web-based frontend.
  ```bash
  npm run dev
  ```

### Build for Production

To build the native application for your operating system (.dmg, .exe, or .AppImage), run the following command:
```bash
npm run tauri:build
```

## GitHub Setup Guide

To ensure a smooth contribution process, follow these steps to configure your GitHub environment.

### Step 1: Configure `develop` as the Default Branch

1.  Navigate to the repository settings: [https://github.com/groovybronx/portf84/settings/branches](https://github.com/groovybronx/portf84/settings/branches)
2.  Click the swap icon (⇄) next to the "Default branch" section.
3.  Select **`develop`** from the dropdown and confirm the change.

### Step 2: Protect the `main` Branch

1.  On the same settings page, click **Add rule** under "Branch protection rules."
2.  Set the "Branch name pattern" to **`main`**.
3.  Enable the following options:
    - ☑ **Require a pull request before merging** (set to 1 approval).
    - ☑ **Require status checks to pass before merging**.
    - ☑ **Require conversation resolution before merging**.
4.  Save the new rule.

### Step 3: Clean Up Local Branches

The repository includes a script to help you remove obsolete local branches.

```bash
# Make sure the script is executable
chmod +x scripts/cleanup-branches.sh

# Run the script
./scripts/cleanup-branches.sh
```

### Step 4: Create a Release Branch

A script is also provided to standardize the creation of release branches.

```bash
# Make sure the script is executable
chmod +x scripts/create-release-branch.sh

# Run the script
./scripts/create-release-branch.sh
```

This will create a new release branch (e.g., `release/v0.2.0-beta.1`), update the `package.json` version, and push the branch to GitHub.

## Next Steps

With the application installed and the environment configured, you are ready to start exploring. For more detailed information, refer to the other sections of our documentation.

Happy coding! 🎉
