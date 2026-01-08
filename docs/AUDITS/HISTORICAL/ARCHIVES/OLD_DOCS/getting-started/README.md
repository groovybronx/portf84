# 🚀 Getting Started with Lumina Portfolio

Welcome to Lumina Portfolio! This guide will help you get started with the application.

## 📋 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [First Steps](#first-steps)
5. [Next Steps](#next-steps)

---

## Quick Start Guide

For a rapid configuration of GitHub and the development environment, see:
- **[Quick Start Guide](./QUICK_START.md)** - 10-minute setup for GitHub configuration

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (LTS version recommended)
- **[Rust](https://rustup.rs/)** (stable toolchain)
- **Operating System**: macOS 10.15+, Windows 10+, or Linux

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

Create a `.env.local` file for local development:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: You can also configure the API key through the application settings after launch.

---

## First Steps

### Run the Application in Development Mode

```bash
# Launch the full application (Frontend + Tauri backend)
npm run tauri:dev

# Or launch only the frontend (web browser)
npm run dev
```

### Build for Production

```bash
# Build the native application (.dmg for macOS, .exe for Windows, .AppImage for Linux)
npm run tauri:build
```

---

## Next Steps

Once you have the application running, explore these resources:

### 📚 **Documentation**
- **[Architecture Guide](../guides/architecture/ARCHITECTURE.md)** - Technical architecture overview
- **[Components Guide](../guides/features/COMPONENTS.md)** - UI/UX component details
- **[AI Service](../guides/architecture/AI_SERVICE.md)** - Gemini AI integration
- **[Interactions Guide](../guides/features/INTERACTIONS.md)** - Keyboard shortcuts and user interactions
- **[i18n Guide](../guides/features/I18N_GUIDE.md)** - Internationalization support

### 🔧 **Development Workflow**
- **[Git Workflow](../workflows/BRANCH_STRATEGY.md)** - Branch management and Git workflow
- **[GitHub Configuration](../workflows/CONFIGURATION_GITHUB_FR.md)** - GitHub repository setup
- **[Developer Guide](../guides/project/KnowledgeBase/07_Developer_Guide.md)** - In-depth development practices

### 🧪 **Testing**
```bash
# Run the test suite
npm run test
```

### 📖 **Knowledge Base**
Explore the comprehensive [Knowledge Base](../guides/project/KnowledgeBase/01_Project_Overview.md) for detailed information about:
- Project overview
- Database schema
- Component library
- Services and logic
- State management
- Feature-specific guides

---

## 💡 Tips

- **API Key**: For AI-powered image analysis, you'll need a Gemini API key. Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Development Mode**: Use `npm run tauri:dev` for the full native experience with hot reload
- **Web Mode**: Use `npm run dev` for faster frontend iteration (port 1420)
- **Documentation**: The `docs/` folder contains extensive technical documentation

---

## 🆘 Need Help?

- **[Troubleshooting Guide](../guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md)** - Common issues and solutions
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)** - Report bugs or request features
- **[Main Documentation](../README.md)** - Return to the main documentation hub

---

**Happy coding! 🎉**
