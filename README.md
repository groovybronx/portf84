<div align="center">

# ✨ Lumina Portfolio

**Galerie Photo Intelligente • Application Desktop Native**

![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)
![Version](https://img.shields.io/badge/version-0.3.0--beta.1-green)

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
├── src/
│   ├── components/      # Composants React
│   ├── hooks/           # Hooks custom (useLibrary, useBatchAI, etc.)
│   ├── services/        # Services (Gemini, Storage, Loader)
│   ├── features/        # Feature modules
│   └── shared/          # Code partagé
├── docs/                # Documentation technique
├── src-tauri/           # Backend Rust Tauri
│   ├── capabilities/    # Permissions ACL
│   └── tauri.conf.json  # Configuration Tauri
└── tests/               # Tests Vitest
```

---

## 🧪 Tests

```bash
# Exécuter les tests
npm run test
```

---

## 🔧 Dépannage

### Erreur Build Tauri : `undefined is not an object (evaluating '$.Activity')`

**Symptôme :** L'application plante au démarrage en production avec une erreur React dans le bundle vendor.

**Cause :** React 19.x est incompatible avec Framer Motion 12.x. React 19 introduit une nouvelle API `Activity` qui cause des erreurs de bundling avec Framer Motion.

**Solution Implémentée :** Le projet utilise maintenant React 18.3.1 (dernière version stable React 18) pour assurer la compatibilité avec Framer Motion.

Si vous rencontrez toujours l'erreur :

1. Vérifiez que toutes les dépendances sont à jour : `npm install`
2. Supprimez `node_modules` et le cache : `rm -rf node_modules dist && npm install`
3. Assurez-vous que `react` et `react-dom` sont en version **18.3.1**
4. Vérifiez que `@types/react` et `@types/react-dom` sont installés

**Note :** Ne mettez pas à jour vers React 19 tant que Framer Motion n'est pas officiellement compatible. Suivez [l'issue GitHub #2668](https://github.com/motiondivision/motion/issues/2668) pour les mises à jour.

---

## 📚 Documentation

### 📖 Guides Principaux

- [📋 Release Notes v0.3.0-beta.1](./docs/RELEASE_NOTES_v0.3.0-beta.1.md) - **Nouveautés de cette version**
- [🏗️ Architecture](./docs/guides/architecture/ARCHITECTURE.md) - Stack, SQLite, déploiement
- [🎨 Composants](./docs/guides/features/COMPONENTS.md) - UI/UX détaillé
- [🎨 Design System](./docs/guides/features/DESIGN_SYSTEM.md) - Système de design complet
- [🤖 AI Service](./docs/guides/architecture/AI_SERVICE.md) - Intégration Gemini
- [⌨️ Interactions](./docs/guides/features/INTERACTIONS.md) - Raccourcis clavier
- [🏷️ TagHub Guide](./docs/TAG_HUB_USER_GUIDE.md) - Guide utilisateur système de tags
- [🌐 i18n Guide](./docs/guides/features/I18N_GUIDE.md) - Internationalisation

### Gestion Git & GitHub

- [🚀 Quick Start](./docs/getting-started/QUICK_START.md) - Guide rapide en 10 minutes
- [Résumé Configuration GitHub](./docs/workflows/GITHUB_SETUP_SUMMARY.md) - Vue d'ensemble complète
- [Stratégie de Branches](./docs/guides/architecture/GIT_WORKFLOW.md) - Workflow Git et gestion des branches
- [Configuration GitHub](./docs/workflows/CONFIGURATION_GITHUB_FR.md) - Guide de configuration du dépôt
- [Scripts Utilitaires](./scripts/README.md) - Scripts de gestion des branches

### 💼 Analyse Commerciale & Qualité

- [📊 Analyse Qualitative & Étude de Marché 2026](./docs/ANALYSE_QUALITATIVE_ET_MARCHE_2026.md) - **Analyse complète (87 pages)** - Qualité technique, analyse concurrentielle, projections financières
- [📋 Synthèse Exécutive Commercialisation](./docs/SYNTHESE_EXECUTIVE_COMMERCIALISATION.md) - **Résumé (1 page)** - Verdict GO/NO-GO, roadmap de lancement 6 semaines
- [📊 Project Health Report](./docs/PROJECT_HEALTH_REPORT.md) - Score de santé 87/100, métriques de code, couverture de tests

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
