# Lumina Portfolio - Documentation Technique

[![Version](https://img.shields.io/badge/version-0.3.0--beta.1-blue)](./RELEASE_NOTES_v0.3.0-beta.1.md)
[![Status](https://img.shields.io/badge/status-95%25%20Complete-brightgreen)](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md)
[![Docs](https://img.shields.io/badge/docs-54%20files-informational)](./INDEX.md)
[![Last Audit](https://img.shields.io/badge/last%20audit-Jan%206%2C%202026-success)](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md)

**Last Update**: January 6, 2026

---

## 🧭 Quick Navigation

<table>
<tr>
<td align="center" width="25%">

### 📚 Master Index
Complete visual guide
to all documentation

[**→ Browse INDEX.md**](./INDEX.md)

</td>
<td align="center" width="25%">

### ⚡ Quick Reference
One-page cheat sheet
with commands & tips

[**→ View Cheat Sheet**](./QUICK_REFERENCE.md)

</td>
<td align="center" width="25%">

### 🗺️ Documentation Map
Alternative navigation
with visual tree

[**→ Explore Map**](./DOCUMENTATION_MAP.md)

</td>
<td align="center" width="25%">

### 📊 Latest Audit
Comprehensive audit
from Jan 6, 2026

[**→ Read Summary**](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md)

</td>
</tr>
</table>

---

> 📢 **New Documentation Structure**: We've reorganized our documentation for better accessibility! Start with [INDEX.md](./INDEX.md) for a complete visual guide, or jump to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for a one-page developer cheat sheet.

Bienvenue dans la documentation technique de **Lumina Portfolio**. Cette application est une galerie photo haute performance construite avec Tauri v2, offrant une expérience desktop native avec intelligence artificielle intégrée.

## Stack Technologique

| Technologie                 | Version       | Rôle                    |
| --------------------------- | ------------- | ----------------------- |
| **React**                   | 18.3.1        | Framework UI            |
| **Tailwind CSS**            | 4.x           | Styling (@theme syntax) |
| **Tauri**                   | 2.x           | Runtime natif           |
| **SQLite**                  | via plugin    | Persistance locale      |
| **@tanstack/react-virtual** | 3.13          | Virtualisation UI       |
| **Framer Motion**           | 12.x          | Animations              |
| **Gemini AI**               | @google/genai | Image analysis          |
| **i18next**                 | 24.x          | Multilanguage support   |
| **Vitest**                  | 4.x           | Tests unitaires         |

---

## 📖 Sommaire

### 🏗️ Architecture & System (Status: ✅ Complete)

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [System Architecture](guides/architecture/ARCHITECTURE.md) | Feature-based structure, contexts, SQLite, CI/CD | Jan 5, 2026 |
| [Architecture Deep Dive](guides/project/KnowledgeBase/02_Architecture_Deep_Dive.md) | Detailed technical architecture | Jan 1, 2026 |
| [Database Schema](guides/project/KnowledgeBase/03_Database_Schema_and_Storage.md) | SQLite data model and storage | Jan 1, 2026 |
| [Tag System Architecture](guides/architecture/TAG_SYSTEM_ARCHITECTURE.md) | Tag system design and algorithms | Jan 2, 2026 |
| [AI Service](guides/architecture/AI_SERVICE.md) | Gemini AI integration and processing | Jan 1, 2026 |
| [Git Workflow](guides/architecture/GIT_WORKFLOW.md) | Git architecture and branching | Dec 2025 |

### ✨ UI Components & Features (Status: ✅ Complete)

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Component Library](guides/features/COMPONENTS.md) | 35+ reusable UI components | Jan 5, 2026 |
| [Design System](guides/features/DESIGN_SYSTEM.md) | Glass morphism styling guide | Jan 5, 2026 |
| [Interactions Guide](guides/features/INTERACTIONS.md) | Keyboard shortcuts, drag & drop | Dec 2025 |
| [i18n Guide](guides/features/I18N_GUIDE.md) | Multilanguage support (EN/FR) | Dec 2025 |
| [Tag System README](guides/features/TAG_SYSTEM_README.md) | Tag feature overview | Jan 2, 2026 |

### 💻 Development & Workflow (Status: ✅ Complete)

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Developer Guide](guides/project/KnowledgeBase/07_Developer_Guide.md) | Development workflow and testing | Jan 1, 2026 |
| [Best Practices](guides/project/bonne-pratique.md) | Coding standards and conventions | Dec 2025 |
| [Branch Strategy](workflows/BRANCH_STRATEGY.md) | Git branching model | Dec 2025 |
| [Release Process](workflows/CREATE_RELEASE_BRANCH_INSTRUCTIONS.md) | Creating and publishing releases | Dec 2025 |

### 🚀 Getting Started (Status: ✅ Complete)

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Getting Started](getting-started/README.md) | Installation and first steps | Dec 2025 |
| [Quick Start (GitHub)](getting-started/QUICK_START.md) | 10-minute GitHub setup | Dec 2025 |
| [Project Overview](guides/project/KnowledgeBase/01_Project_Overview.md) | High-level introduction | Jan 1, 2026 |
| [Troubleshooting & FAQ](guides/project/KnowledgeBase/08_Troubleshooting_and_FAQ.md) | Common issues and solutions | Jan 1, 2026 |

### 📦 Feature-Specific Guides (Status: ✅ Complete)

| Feature | Document | Last Updated |
|---------|----------|--------------|
| 📷 Library | [Library Feature](guides/project/KnowledgeBase/10_Feature_Library.md) | Jan 1, 2026 |
| 🧭 Navigation | [Navigation Feature](guides/project/KnowledgeBase/11_Feature_Navigation.md) | Jan 1, 2026 |
| 👁️ Vision (AI) | [Vision Feature](guides/project/KnowledgeBase/12_Feature_Vision.md) | Jan 1, 2026 |
| 📁 Collections | [Collections Feature](guides/project/KnowledgeBase/13_Feature_Collections.md) | Jan 1, 2026 |
| 🏷️ Tags | [Tags Feature](guides/project/KnowledgeBase/14_Feature_Tags.md) | Jan 1, 2026 |

### 🔍 Recent Audit Reports (Status: ✅ Fresh)

| Report | Date | Focus |
|--------|------|-------|
| [📊 Executive Summary](AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md) | Jan 6, 2026 | Overall health (95% complete) |
| [📝 Comprehensive Audit](AUDIT/2026-01-06_COMPREHENSIVE_PROGRESS_AND_DOCUMENTATION_AUDIT.md) | Jan 6, 2026 | Progress + documentation |
| [🎯 Action Plan](AUDIT/2026-01-06_ACTION_PLAN.md) | Jan 6, 2026 | Critical fixes |
| [🏷️ Tag System Audit](AUDIT/TAG_SYSTEM/2026-01-02_TAG_SYSTEM_COMPREHENSIVE_AUDIT.md) | Jan 2, 2026 | Tag system completeness |
| [🎨 UI Consolidation](AUDIT/UI_CONSOLIDATION/2026-01-05_FINAL_REPORT.md) | Jan 5, 2026 | UI component architecture |

---

## Installation Rapide

### Prérequis

- **Node.js** 18+ LTS (recommandé)
- **Rust** stable toolchain
- **macOS** 10.15+ / **Windows** 10+ / **Linux** (pour le build natif)

### Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (Frontend + Tauri)
npm run tauri:dev

# Lancer uniquement le frontend (web, port 1420)
npm run dev
```

### Build Production

```bash
# Générer l'application native
npm run tauri:build    # → .dmg (macOS) / .exe (Windows) / .AppImage (Linux)
```

**→ [Guide complet d'installation](./getting-started/README.md)**

---

## 📊 Current Status (Jan 6, 2026)

| Metric | Status | Details |
|--------|--------|---------|
| **Feature Completeness** | ✅ **95%** | All 5 major features complete |
| **Documentation** | ⚠️ **85%** | Recent audit identified updates needed |
| **Test Coverage** | ⚠️ **75%** | Services well-tested, UI tests needed |
| **UI Components** | ✅ **35+** | Comprehensive component library |
| **Stability** | ✅ **Stable** | Production-ready beta |

**📊 [View detailed audit →](./AUDIT/2026-01-06_EXECUTIVE_SUMMARY.md)**

---

## Stack Technologique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | ~5.8.2 | Type safety |
| **Tailwind CSS** | 4.x | Styling (@theme syntax) |
| **Tauri** | v2 (2.9.5) | Runtime natif |
| **SQLite** | via plugin | Persistance locale |
| **@tanstack/react-virtual** | 3.13.13 | Virtualisation UI |
| **Framer Motion** | 12.x | Animations |
| **Gemini AI** | @google/genai | Image analysis |
| **i18next** | 25.x | Multilanguage support |
| **Vitest** | 4.x | Tests unitaires |

**→ [Architecture détaillée](./guides/architecture/ARCHITECTURE.md)**

---

## Conventions de Code

| Convention         | Description                                     |
| ------------------ | ----------------------------------------------- |
| **Feature-Based**  | Architecture modulaire (`src/features`)         |
| **Context Split**  | Séparation State/Dispatch pour performance      |
| **React.memo**     | Optimisation rendu des composants critiques     |
| **Virtualisation** | `@tanstack/react-virtual` pour grilles infinies |
| **Glassmorphism**  | `backdrop-blur` + couleurs semi-transparentes   |
| **Persistance**    | SQLite via `@tauri-apps/plugin-sql`             |

---

## Configuration

### Clé API Gemini

Deux méthodes :

1. **Via l'interface** : Settings → Entrer la clé
2. **Via environnement** : Créer `.env.local` avec `VITE_GEMINI_API_KEY=your_key`

### Tauri Capabilities

Les permissions sont définies dans `src-tauri/capabilities/default.json`. Voir **[Architecture](./guides/architecture/ARCHITECTURE.md)** pour les détails.
