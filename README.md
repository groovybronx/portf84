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

Voir le dossier [`docs/`](./docs/) pour la documentation technique complète :

- [Architecture](./docs/ARCHITECTURE.md) - Stack, SQLite, déploiement
- [Composants](./docs/COMPONENTS.md) - UI/UX détaillé
- [AI Service](./docs/AI_SERVICE.md) - Intégration Gemini
- [Interactions](./docs/INTERACTIONS.md) - Raccourcis clavier

---

## 📄 License

MIT © 2025
