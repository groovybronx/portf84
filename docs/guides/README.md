# 📚 Lumina Portfolio - Technical Guides

This directory contains all technical documentation, guides, and reference materials for Lumina Portfolio.

---

## 📋 Directory Structure

```
guides/
├── architecture/       # System architecture and design
├── features/          # Feature-specific documentation
└── project/           # Project management and knowledge base
```

---

## 🏗️ Architecture

**[architecture/](./architecture/)** - System architecture and technical design

### Core Documents
- **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - Complete system architecture
  - Feature-based structure
  - React Context patterns
  - SQLite database design
  - Tauri integration
  - Performance optimizations

- **[AI_SERVICE.md](./architecture/AI_SERVICE.md)** - Gemini AI integration
  - API integration
  - Streaming responses
  - Prompt engineering
  - Batch processing
  - Error handling

- **[GIT_WORKFLOW.md](./architecture/GIT_WORKFLOW.md)** - Git workflow architecture
  - Branch management strategies
  - Commit conventions
  - Code review process

### Tag System Architecture
- **[TAG_SYSTEM_ARCHITECTURE.md](./architecture/TAG_SYSTEM_ARCHITECTURE.md)** - Tag system technical design
- **[TAG_SYSTEM_GUIDE.md](./architecture/TAG_SYSTEM_GUIDE.md)** - Tag system user guide

---

## ✨ Features

**[features/](./features/)** - Feature-specific guides and documentation

### UI/UX Components
- **[COMPONENTS.md](./features/COMPONENTS.md)** - Complete component library
  - Layout components (Sidebar, TopBar)
  - Photo display (Grid, Carousel, List views)
  - Interactive elements (PhotoCard, Modals)
  - Virtualization and lazy loading

### User Interactions
- **[INTERACTIONS.md](./features/INTERACTIONS.md)** - User interaction patterns
  - Keyboard shortcuts
  - Drag & drop functionality
  - Multi-selection
  - Color tag system
  - Navigation patterns

### Internationalization
- **[I18N_GUIDE.md](./features/I18N_GUIDE.md)** - i18n implementation guide
  - Configuration and namespaces
  - Adding new languages
  - Translation workflow
  - Best practices

### Tag System
- **[TAG_SYSTEM_README.md](./features/TAG_SYSTEM_README.md)** - Tag system feature overview

---

## 📁 Project

**[project/](./project/)** - Project management, history, and knowledge base

### Project Management
- **[CHANGELOG.md](./project/CHANGELOG.md)** - Version history and release notes
- **[REFACTORING_PLAN.md](./project/REFACTORING_PLAN.md)** - Planned refactoring work
- **[bonne-pratique.md](./project/bonne-pratique.md)** - Best practices (French)
- **[COMMERCIAL_AUDIT.md](./project/COMMERCIAL_AUDIT.md)** - Commercial audit report

### Knowledge Base

**[project/KnowledgeBase/](./project/KnowledgeBase/)** - Comprehensive project documentation

#### Overview & Architecture
1. **[01_Project_Overview.md](./project/KnowledgeBase/01_Project_Overview.md)** - Project summary
2. **[02_Architecture_Deep_Dive.md](./project/KnowledgeBase/02_Architecture_Deep_Dive.md)** - Deep architectural details
3. **[03_Database_Schema_and_Storage.md](./project/KnowledgeBase/03_Database_Schema_and_Storage.md)** - Database design

#### Development
4. **[04_Component_Library.md](./project/KnowledgeBase/04_Component_Library.md)** - Component reference
5. **[05_Services_and_Logic.md](./project/KnowledgeBase/05_Services_and_Logic.md)** - Business logic layer
6. **[06_AI_Integration.md](./project/KnowledgeBase/06_AI_Integration.md)** - AI integration details
7. **[07_Developer_Guide.md](./project/KnowledgeBase/07_Developer_Guide.md)** - Developer workflows
8. **[08_Troubleshooting_and_FAQ.md](./project/KnowledgeBase/08_Troubleshooting_and_FAQ.md)** - Common issues

#### Technical Details
9. **[09_State_Management.md](./project/KnowledgeBase/09_State_Management.md)** - State management patterns
10. **[10_Feature_Library.md](./project/KnowledgeBase/10_Feature_Library.md)** - Library feature details
11. **[11_Feature_Navigation.md](./project/KnowledgeBase/11_Feature_Navigation.md)** - Navigation system
12. **[12_Feature_Vision.md](./project/KnowledgeBase/12_Feature_Vision.md)** - Vision/AI features
13. **[13_Feature_Collections.md](./project/KnowledgeBase/13_Feature_Collections.md)** - Collections management
14. **[14_Feature_Tags.md](./project/KnowledgeBase/14_Feature_Tags.md)** - Tag system implementation

---

## 🎯 Quick Navigation

### For New Developers
Start here:
1. [Project Overview](./project/KnowledgeBase/01_Project_Overview.md)
2. [Architecture](./architecture/ARCHITECTURE.md)
3. [Developer Guide](./project/KnowledgeBase/07_Developer_Guide.md)
4. [Components](./features/COMPONENTS.md)

### For Understanding Specific Features
- **Photo Management**: [Component Library](./project/KnowledgeBase/04_Component_Library.md)
- **AI Features**: [AI Service](./architecture/AI_SERVICE.md) and [AI Integration](./project/KnowledgeBase/06_AI_Integration.md)
- **Tag System**: [Tag Architecture](./architecture/TAG_SYSTEM_ARCHITECTURE.md) and [Tag Guide](./architecture/TAG_SYSTEM_GUIDE.md)
- **Collections**: [Collections Feature](./project/KnowledgeBase/13_Feature_Collections.md)
- **Search**: [Interactions Guide](./features/INTERACTIONS.md)

### For Contributing
- [Best Practices](./project/bonne-pratique.md)
- [Developer Guide](./project/KnowledgeBase/07_Developer_Guide.md)
- [Refactoring Plan](./project/REFACTORING_PLAN.md)

### For Troubleshooting
- [Troubleshooting & FAQ](./project/KnowledgeBase/08_Troubleshooting_and_FAQ.md)
- [Developer Guide](./project/KnowledgeBase/07_Developer_Guide.md)

---

## 🔧 Technical Stack Reference

### Frontend
- **React 19** - UI framework
- **TypeScript ~5.8** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **@tanstack/react-virtual** - List virtualization

### Backend
- **Tauri 2.9** - Native runtime
- **Rust** - Backend language
- **SQLite** - Local database

### AI & Services
- **Google Gemini** - Image analysis
- **i18next** - Internationalization

### Development
- **Vite 6** - Build tool
- **Vitest 4** - Testing framework

For detailed version information, see [Project Overview](./project/KnowledgeBase/01_Project_Overview.md).

---

## 🆘 Additional Resources

- **[Getting Started](../getting-started/README.md)** - Installation and setup
- **[Workflows](../workflows/README.md)** - Git and GitHub workflows
- **[Main Documentation](../README.md)** - Documentation hub
- **[Root README](../../README.md)** - Project homepage

---

**Explore the guides to master Lumina Portfolio! 📖**
