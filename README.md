<div align="center">

# ✨ Lumina Portfolio

**Galerie Photo Intelligente • Application Desktop Native**

![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)

</div>

---

## 🚀 Fonctionnalités

- **📁 Gestion Hybride** : Dossiers physiques + Collections virtuelles
- **🤖 Analyse AI** : Tags et descriptions automatiques via Gemini
- **🎨 Color Tags** : Organisation rapide par couleur (1-6)
- **🔍 Smart Search** : Recherche floue avec autosuggestion
- **⚡ Performance** : Infinite scroll, lazy loading, code splitting
- **💾 Local-First** : SQLite embarqué, fonctionne offline

---

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://rustup.rs/) (stable)
- macOS 10.15+ / Windows 10+ / Linux

### Développement

```bash
# Cloner le repo
git clone https://github.com/your-username/lumina-portfolio.git
cd lumina-portfolio

# Installer les dépendances
npm install

# Lancer en mode dev (Frontend + Tauri)
npm run tauri:dev
```

### Build Production

```bash
# Générer l'app native (.dmg / .exe / .AppImage)
npm run tauri:build
```

---

## ⚙️ Configuration

### Clé API Gemini

**Option 1** : Via l'interface
- Ouvrir l'application
- Cliquer sur ⚙️ (Paramètres)
- Entrer votre clé API

**Option 2** : Via fichier `.env.local`
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🗂️ Structure du Projet

```
lumina-portfolio/
├── components/          # Composants React
├── hooks/               # Hooks custom (useLibrary, useBatchAI, etc.)
├── services/            # Services (Gemini, Storage, Loader)
├── tests/               # Tests Vitest
├── docs/                # Documentation technique
└── src-tauri/           # Backend Rust Tauri
    ├── capabilities/    # Permissions ACL
    └── tauri.conf.json  # Configuration Tauri
```

---

## 🧪 Tests

```bash
# Exécuter les tests
npm run test
```

---

## 📚 Documentation

> **📍 [Documentation Map](./docs/DOCUMENTATION_MAP.md)** - Complete visual guide to all documentation

La documentation est organisée en trois sections principales :

### 🚀 [Getting Started](./docs/getting-started/README.md)
**Démarrage rapide et installation**
- [Quick Start Guide](./docs/getting-started/QUICK_START.md) - Configuration GitHub en 10 minutes
- Guide d'installation complet
- Configuration de l'environnement

### 📖 [Technical Guides](./docs/guides/README.md)
**Documentation technique approfondie**
- **[Architecture](./docs/guides/architecture/ARCHITECTURE.md)** - Stack, SQLite, déploiement
- **[Composants](./docs/guides/features/COMPONENTS.md)** - UI/UX détaillé
- **[AI Service](./docs/guides/architecture/AI_SERVICE.md)** - Intégration Gemini
- **[Interactions](./docs/guides/features/INTERACTIONS.md)** - Raccourcis clavier
- **[Knowledge Base](./docs/guides/project/KnowledgeBase/01_Project_Overview.md)** - Documentation complète

### 🔄 [Workflows](./docs/workflows/README.md)
**Git, GitHub et processus de développement**
- [Stratégie de Branches](./docs/workflows/BRANCH_STRATEGY.md) - Workflow Git
- [Configuration GitHub](./docs/workflows/CONFIGURATION_GITHUB_FR.md) - Guide de configuration
- [Gestion des Releases](./docs/workflows/CREATE_RELEASE_BRANCH_INSTRUCTIONS.md) - Création de releases
- [Scripts Utilitaires](./scripts/README.md) - Scripts de gestion des branches
### 🤖 GitHub Copilot Configuration

Ce projet inclut une configuration complète pour GitHub Copilot avec des règles personnalisées qui aident à générer du code conforme aux conventions du projet :

- **[Copilot Instructions](/.github/copilot-instructions.md)** - Instructions principales pour Copilot
- **[Copilot Rules](/.github/copilot-rules.json)** - Configuration JSON des règles
- **[Règles TypeScript/React](/.github/copilot/typescript-react-rules.md)** - Conventions frontend
- **[Règles Rust/Tauri](/.github/copilot/rust-tauri-rules.md)** - Conventions backend
- **[Règles de Test](/.github/copilot/testing-rules.md)** - Patterns de test
- **[Règles de Sécurité](/.github/copilot/security-rules.md)** - Bonnes pratiques de sécurité
- **[Exemples](/.github/copilot/EXAMPLES.md)** - Exemples de code avec Copilot

Consultez [`.github/copilot/README.md`](/.github/copilot/README.md) pour plus d'informations sur l'utilisation de ces règles.

#### 🔧 Maintenance de la Configuration

Un script de maintenance est disponible pour valider et maintenir la configuration GitHub :

```bash
# Valider la configuration
./scripts/maintain-github-config.sh

# Mode interactif avec corrections
./scripts/maintain-github-config.sh --fix
```

**Documentation :**
- [Guide de Maintenance](/.github/MAINTENANCE_GUIDE.md) - Procédures complètes
- [Référence Rapide](/.github/QUICK_REFERENCE.md) - Commandes essentielles
- [Agents Copilot](/.github/agents/README.md) - Agents experts par domaine

---

## 📄 License

MIT © 2025
