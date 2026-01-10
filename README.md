<div align="center">

# ✨ Lumina Portfolio

**Galerie Photo Intelligente • Application Desktop Native**

![Version](https://img.shields.io/badge/version-1.0.0-green)

</div>

---

## 🚀 Fonctionnalités Principales

- **📁 Gestion Hybride** : Dossiers physiques + Collections virtuelles avec shadow folders
- **🤖 Analyse AI Avancée** : Tags et descriptions automatiques via Gemini avec batch processing
- **🎨 Color Tags** : Organisation rapide par couleur (1-6) avec regroupement intelligent
- **🔍 Smart Search** : Recherche floue avec autosuggestion et filtres avancés
- **⚡ Performance Optimisée** : Infinite scroll, lazy loading, virtualisation, code splitting
- **💾 Local-First Robuste** : SQLite embarqué avec transactions, fonctionne offline
- **🎯 Interface Modulaire** : Architecture feature-based avec composants réutilisables
- **🌐 Internationalisation** : Support multilingue (Français, Anglais) avec i18next
- **🎨 Design System Cohérent** : Glassmorphism, animations Framer Motion, Tailwind v4
- **🔧 Déploiement Multi-Plateforme** : macOS, Windows, Linux via Tauri v2

---

## 🏗️ Architecture Technique

### **Feature-Based Architecture**

- **Séparation claire** : Code organisé par domaine métier (features/collections, features/tags, etc.)
- **Composants modulaires** : App.tsx refactorisé (682 → 50 lignes) avec AppLayout, AppOverlays
- **Réutilisabilité** : Hooks personnalisés et composants partagés dans shared/

### **Performance & UX**

- **Virtualisation** : @tanstack/react-virtual pour les grilles de photos infinies
- **Lazy Loading** : Code splitting automatique et chargement différé
- **Context Splitting** : Séparation state/dispatch pour optimiser les re-renders
- **Animations fluides** : Framer Motion avec glassmorphism design

### **Qualité & Tests**

- **171/171 tests** : Couverture complète avec Vitest + React Testing Library
- **TypeScript strict** : Sécurité de types maximale
- **ESLint + Prettier** : Code consistent et maintenable
- **CI/CD robuste** : Workflows GitHub Actions avec releases automatiques

---

- **Photographes** : Organisez et cataloguez vos shootings
- **Créateurs** : Gérez vos assets visuels et inspirations
- **Familles** : Classifiez et retrouvez facilement vos souvenirs
- **Professionnels** : Archivez et recherchez vos documents visuels

---

## 🌟 Points Forts

### 🎨 Interface Moderne

- Design épuré et intuitif
- Mode sombre/clair automatique
- Animations fluides et micro-interactions

### 🧠 Intelligence Artificielle

- Analyse automatique des images
- Tags contextuels pertinents
- Descriptions générées en français

### ⚡ Vitesse

- Démarrage instantané
- Navigation sans latence
- Gestion optimisée des grandes collections

### � Confidentialité

- 100% local, aucun cloud
- Vos données restent sur votre machine
- Pas de tracking ni de télémétrie

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
│   ├── features/        # Architecture orientée fonctionnalités
│   │   ├── collections/ # Gestion des collections virtuelles
│   │   ├── layout/      # Layouts principaux (AppLayout, MainLayout)
│   │   ├── library/     # Gestion de la bibliothèque photo
│   │   ├── navigation/  # Navigation et TopBar
│   │   ├── overlays/    # Modals et overlays (AppOverlays, AppModals)
│   │   ├── tags/        # Système de tags et TagHub
│   │   └── vision/      # IA et analyse d'images
│   ├── shared/          # Code partagé et réutilisable
│   │   ├── components/  # Composants UI partagés
│   │   ├── constants/   # Constantes et configurations
│   │   ├── contexts/    # Contextes React globaux
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── theme/       # Thème et styles
│   │   ├── types/       # Types TypeScript
│   │   └── utils/       # Utilitaires et helpers
│   ├── services/        # Services métier (API, stockage)
│   ├── i18n/           # Internationalisation
│   └── App.tsx         # Point d'entrée principal (modulaire)
├── src-tauri/          # Backend Rust Tauri
│   ├── capabilities/   # Permissions et capacités
│   └── tauri.conf.json # Configuration Tauri
└── tests/              # Tests automatisés (171/171 ✅)
```

---

## � Documentation

Lumina Portfolio dispose d'une documentation complète et moderne, organisée pour chaque type d'utilisateur.

### 🚀 **Démarrage Rapide**

- **[📖 Installation](./docs/getting-started/installation.md)** - Guide d'installation complet
- **[⚡ Tour rapide](./docs/getting-started/quick-tour.md)** - Découverte en 5 minutes
- **[🎯 Premiers pas](./docs/getting-started/first-steps.md)** - Utilisation de base

### 👤 **Guide Utilisateur**

- **[🖥️ Interface](./docs/user-guide/interface.md)** - Navigation et fonctionnalités
- **[⚡ Fonctionnalités](./docs/user-guide/features.md)** - Guide complet des features
- **[⌨️ Raccourcis clavier](./docs/user-guide/keyboard-shortcuts.md)** - Raccourcis et productivité
- **[🔧 Dépannage](./docs/user-guide/troubleshooting.md)** - Problèmes courants et solutions

### 🛠️ **Documentation Développeur**

- **[⚙️ Installation dev](./docs/developer/setup.md)** - Environnement de développement
- **[🏗️ Architecture](./docs/developer/architecture.md)** - Structure système et patterns
- **[🔌 API Reference](./docs/developer/api.md)** - Services et hooks
- **[🧪 Tests](./docs/developer/testing.md)** - Stratégie de testing
- **[🤝 Contribuer](./docs/developer/contributing.md)** - Guidelines de contribution

#### **UI/UX Design**

- **[🎨 Design System](./docs/developer/ui-ux/design-system.md)** - Composants et tokens
- **[🧩 Composants](./docs/developer/ui-ux/components.md)** - Bibliothèque UI
- **[📐 Patterns](./docs/developer/ui-ux/patterns.md)** - Patterns d'interface
- **[♿ Accessibilité](./docs/developer/ui-ux/accessibility.md)** - A11y et inclusive design
- **[✨ Animations](./docs/developer/ui-ux/animations.md)** - Framer Motion et interactions
- **[📱 Responsive](./docs/developer/ui-ux/responsive.md)** - Design multi-écrans

#### **Base de Données**

- **[🗄️ Schema](./docs/developer/database/schema.md)** - Structure et relations
- **[🔄 Migrations](./docs/developer/database/migrations.md)** - Évolutions du schema
- **[⚡ Queries](./docs/developer/database/queries.md)** - Requêtes et performance
- **[🚀 Performance](./docs/developer/database/performance.md)** - Optimisations
- **[💾 Backup](./docs/developer/database/backup-restore.md)** - Sauvegarde et restauration
- **[🐛 Debugging](./docs/developer/database/debugging.md)** - Débogage et monitoring

#### **Intelligence Artificielle**

- **[🤖 Service Gemini](./docs/developer/ai-integration/gemini-service.md)** - Integration IA
- **[📦 Batch Processing](./docs/developer/ai-integration/batch-processing.md)** - Traitement par lots
- **[🏷️ Tag Analysis](./docs/developer/ai-integration/tag-analysis.md)** - Analyse de tags

### 🔧 **Documentation Technique**

- **[💾 Storage Service](./docs/technical/storage-service.md)** - Architecture de stockage
- **[⚡ Performance](./docs/technical/performance.md)** - Optimisations globales
- **[🚀 Déploiement](./docs/technical/deployment.md)** - Build et distribution

### 📋 **Références**

- **[📝 Changelog](./docs/reference/changelog.md)** - Historique des versions
- **[❓ FAQ](./docs/reference/faq.md)** - Questions fréquentes
- **[📖 Glossaire](./docs/reference/glossary.md)** - Termes techniques

---

## � Installation Simple

1. Téléchargez la dernière version depuis [GitHub Releases](https://github.com/groovybronx/portf84/releases)
2. Installez l'application comme n'importe quel logiciel
3. Lancez et commencez à organiser vos photos !

---

## 🎮 Utilisation

### Premiers Pas

1. **Importez** vos dossiers de photos existants
2. **Laissez l'IA** analyser et taguer automatiquement
3. **Organisez** avec les collections virtuelles
4. **Recherchez** instantanément n'importe quelle photo

### Raccourcis Clavier

- `Ctrl/Cmd + F` : Recherche rapide
- `Ctrl/Cmd + T` : Ouvrir le gestionnaire de tags
- `Espace` : Mode plein écran
- `Échap` : Fermer les modales

### 📝 Types de Commits

```bash
feat(library): add drag-and-drop support     # → Version mineure (1.0.0 → 1.1.0)
fix(ui): resolve sidebar toggle issue       # → Version de patch (1.0.0 → 1.0.1)
BREAKING CHANGE: remove deprecated API     # → Version majeure (1.0.0 → 2.0.0)
```

### 🎯 Déclenchement

- **Branche `main`** : Release stable automatique ✅
- **Branche `develop`** : Pré-release beta automatique
- **Manuel** : Choix du type de version via GitHub UI

### 📦 Résultats

- Version mise à jour dans `package.json` et `Cargo.toml`
- Tag Git créé (`v1.2.3`)
- Release GitHub avec assets multi-plateformes
- CHANGELOG généré automatiquement

### ⚙️ Configuration Technique

- **Fichier de configuration** : `.releaserc.cjs` (racine du projet)
- **Branches configurées** : `main`, `develop` (beta), `release/*` (rc)
- **Plugins actifs** : commit-analyzer, release-notes, changelog, npm, github
- **Tests requis** : 171 tests passent avant toute release

### 🔧 Maintenance Récents (v1.0.0 - Janvier 2026)

- ✅ **Refactorisation majeure App.tsx** : Réduction de 682 à ~50 lignes avec architecture modulaire (AppLayout, AppOverlays, hooks personnalisés)
- ✅ **Migration composants Button** : Standardisation complète vers design system (Phases 1-3)
- ✅ **Amélioration architecture** : Passage à feature-based architecture avec séparation claire des responsabilités
- ✅ **Optimisation performance** : Context splitting, memoization, lazy loading amélioré
- ✅ **Correction CI/CD** : Résolution avertissements React act(), configuration ES modules, hooks Git adaptés
- ✅ **Tests complets** : 171/171 tests passant avec couverture améliorée
- ✅ **Documentation complète** : Refonte from scratch avec 25+ documents techniques, guides utilisateur et références
- ✅ **Changelog automatisé** : Configuration Semantic Release pour génération automatique
- ✅ **Nettoyage legacy** : Suppression de 96 fichiers obsolètes, structure moderne et maintenable

**📚 Documentation complète** : [📖 Documentation](./docs/README.md) | **🤝 Contribuer** : [GitHub](https://github.com/groovybronx/portf84)

---

## � Tips & Astuces

- **Color Tags** : Utilisez les couleurs pour marquer rapidement les photos à traiter
- **Collections Virtuelles** : Créez des albums sans dupliquer les fichiers
- **Recherche IA** : Tapez des descriptions comme "photos de plage en été"
- **Batch Processing** : Sélectionnez plusieurs photos pour un traitement groupé

---

## 📄 License

MIT © 2026

---

## 🤝 Contribuer

Ce projet est développé avec passion. Retrouvez le code source et contribuez sur [GitHub](https://github.com/groovybronx/portf84).

---

<div align="center">

**Made with ❤️ pour les amoureux de la photo**

# </div>

MIT © 2026
