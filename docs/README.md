# 📚 Lumina Portfolio - Documentation Hub

**Last update:** January 1, 2026

Welcome to the **Lumina Portfolio** documentation hub! This is a high-performance photo gallery application built with Tauri v2, offering a native desktop experience with integrated artificial intelligence.

---

## 🗺️ Documentation Structure

The documentation is organized into three main sections:

### 🚀 **[Getting Started](./getting-started/README.md)**
**New to Lumina Portfolio? Start here!**
- Quick setup guides
- Installation instructions
- First steps and configuration
- Prerequisites and requirements

### 📚 **[Technical Guides](./guides/README.md)**
**Deep dive into the technical aspects**
- **[Architecture](./guides/architecture/)** - System design, databases, AI integration
- **[Features](./guides/features/)** - Components, interactions, i18n, tag system
- **[Project](./guides/project/)** - Changelog, knowledge base, best practices

### 🔄 **[Workflows](./workflows/README.md)**
**Git, GitHub, and development processes**
- Branch strategy and management
- GitHub configuration guides
- Release management
- Pull request workflow

### 📦 **[ARCHIVES](./ARCHIVES/)**
**Historical documentation and deprecated content**
- Previous implementation summaries
- Migration guides
- Old architecture documents

### 🔍 **[AUDIT](./AUDIT/)**
**Security and quality audits**
- Comprehensive audit reports
- Action plans
- Completion notices

---

## 🎯 Quick Links

### Getting Started
- **[Quick Start Guide](./getting-started/QUICK_START.md)** - 10-minute GitHub setup
- **[Installation Guide](./getting-started/README.md#installation)** - Full installation steps

### Architecture & Technical Design
- **[System Architecture](./guides/architecture/ARCHITECTURE.md)** - Complete technical overview
- **[AI Service](./guides/architecture/AI_SERVICE.md)** - Gemini AI integration
- **[Database Schema](./guides/project/KnowledgeBase/03_Database_Schema_and_Storage.md)** - SQLite design

### Features & Components
- **[Component Library](./guides/features/COMPONENTS.md)** - All UI components
- **[Interactions Guide](./guides/features/INTERACTIONS.md)** - Keyboard shortcuts and UX
- **[Tag System](./guides/architecture/TAG_SYSTEM_ARCHITECTURE.md)** - Tag architecture
- **[i18n Guide](./guides/features/I18N_GUIDE.md)** - Internationalization

### Development
- **[Developer Guide](./guides/project/KnowledgeBase/07_Developer_Guide.md)** - Development workflows
- **[Best Practices](./guides/project/bonne-pratique.md)** - Coding conventions
- **[Git Workflow](./workflows/BRANCH_STRATEGY.md)** - Branch strategy

### Troubleshooting
- **[FAQ & Troubleshooting](./guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md)** - Common issues

---

## 💻 Tech Stack

| Technology                  | Version | Role                  |
| --------------------------- | ------- | --------------------- |
| **React**                   | 19.x    | UI framework          |
| **TypeScript**              | ~5.8    | Type safety           |
| **Tailwind CSS**            | 4.x     | Styling               |
| **Tauri**                   | 2.x     | Native runtime        |
| **SQLite**                  | plugin  | Local database        |
| **@tanstack/react-virtual** | 3.13    | UI virtualization     |
| **Framer Motion**           | 12.x    | Animations            |
| **Gemini AI**               | latest  | Image analysis        |
| **i18next**                 | 24.x    | Multilanguage support |
| **Vitest**                  | 4.x     | Unit testing          |

---

## ⚡ Quick Start

### Prerequisites
- **[Node.js](https://nodejs.org/)** (LTS recommended)
- **[Rust](https://rustup.rs/)** (stable toolchain)
- **OS**: macOS 10.15+, Windows 10+, or Linux

### Development Mode

```bash
# Install dependencies
npm install

# Launch full app (Frontend + Tauri)
npm run tauri:dev

# Or frontend only (web browser)
npm run dev
```

### Production Build

```bash
# Build native application (.dmg/.exe/.AppImage)
npm run tauri:build
```

### Testing

```bash
# Run test suite
npm run test
```

---

## 📖 Documentation by Topic

### For New Contributors
1. [Getting Started](./getting-started/README.md)
2. [Project Overview](./guides/project/KnowledgeBase/01_Project_Overview.md)
3. [Developer Guide](./guides/project/KnowledgeBase/07_Developer_Guide.md)
4. [Git Workflow](./workflows/BRANCH_STRATEGY.md)

### For Feature Development
- [Architecture Guide](./guides/architecture/ARCHITECTURE.md)
- [Component Library](./guides/features/COMPONENTS.md)
- [State Management](./guides/project/KnowledgeBase/09_State_Management.md)
- [Best Practices](./guides/project/bonne-pratique.md)

### For AI Integration
- [AI Service Architecture](./guides/architecture/AI_SERVICE.md)
- [AI Integration Details](./guides/project/KnowledgeBase/06_AI_Integration.md)
- [Vision Feature](./guides/project/KnowledgeBase/12_Feature_Vision.md)

### For UI/UX Work
- [Components Guide](./guides/features/COMPONENTS.md)
- [Interactions Guide](./guides/features/INTERACTIONS.md)
- [i18n Guide](./guides/features/I18N_GUIDE.md)

---

## 🎨 Code Conventions

| Convention         | Description                                     |
| ------------------ | ----------------------------------------------- |
| **Feature-Based**  | Modular architecture (`src/features`)           |
| **Context Split**  | State/Dispatch separation for performance       |
| **React.memo**     | Optimized rendering for critical components     |
| **Virtualization** | `@tanstack/react-virtual` for infinite grids   |
| **Glassmorphism**  | `backdrop-blur` + semi-transparent colors       |
| **Persistence**    | SQLite via `@tauri-apps/plugin-sql`             |

---

## ⚙️ Configuration

### Gemini API Key

Two methods:

1. **Via UI**: Settings → Enter API key
2. **Via Environment**: Create `.env.local` with `VITE_GEMINI_API_KEY=your_key`

### Tauri Capabilities

Permissions are defined in `src-tauri/capabilities/default.json`. See the [Architecture Guide](./guides/architecture/ARCHITECTURE.md) for details.

---

## 🆘 Need Help?

- **[Troubleshooting Guide](./guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md)** - Common issues
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/groovybronx/portf84/discussions)** - Ask questions

---

## 📝 Contributing

See our [Git Workflow Guide](./workflows/BRANCH_STRATEGY.md) and [Developer Guide](./guides/project/KnowledgeBase/07_Developer_Guide.md) for contribution guidelines.

---

**Explore the documentation to master Lumina Portfolio! 🚀**
