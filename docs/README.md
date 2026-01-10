# 📖 README - Lumina Portfolio

**Desktop Photo Gallery with AI-Powered Intelligence**

---

## 🎯 Vue d'Ensemble

Lumina Portfolio est une application desktop moderne pour la gestion de photos avec intelligence artificielle. Construite avec React + Tauri, elle offre une expérience utilisateur exceptionnelle pour organiser, taguer et explorer vos collections photo.

### **✨ Caractéristiques Principales**

- 🤖 **Analyse IA** : Description automatique et tagging avec Gemini AI
- 🏷️ **Système de Tags** : Tags manuels et IA avec fusion intelligente
- 📁 **Collections** : Organisez vos photos par projets/thèmes
- 🎨 **Interface Moderne** : Design glass morphism avec animations fluides
- ⚡ **Performance** : Virtualisation pour milliers de photos
- 🔒 **Local-First** : Vos données restent sur votre machine

---

## 🚀 Quick Start

### **Prérequis**

- Node.js 18+ (recommandé 20+)
- macOS, Windows ou Linux

### **Installation**

```bash
# 1. Cloner le projet
git clone https://github.com/groovybronx/portf84.git
cd portf84

# 2. Installer les dépendances
npm install

# 3. Démarrer l'application
npm run tauri:dev
```

### **Premiers Pas**

1. **Créez votre première collection** : Cliquez sur "New Collection"
2. **Ajoutez des photos** : Importez depuis un dossier local
3. **Explorez l'IA** : Lancez l'analyse automatique
4. **Organisez** : Utilisez les tags et dossiers virtuels

---

## 📚 Documentation

### **👤 Pour les Utilisateurs**

- [**Installation**](./getting-started/installation.md) - Guide complet d'installation
- [**Interface**](./user-guide/interface.md) - Découverte de l'interface
- [**Fonctionnalités**](./user-guide/features.md) - Guide des fonctionnalités
- [**Raccourcis**](./user-guide/keyboard-shortcuts.md) - Raccourcis clavier

### **💻 Pour les Développeurs**

- [**Setup**](./developer/setup.md) - Environnement de développement
- [**Architecture**](./developer/architecture.md) - Architecture système
- [**API**](./developer/api.md) - Référence API complète
- [**UI Components**](./developer/ui-ux/components.md) - Librairie de composants
- [**Design System**](./developer/ui-ux/design-system.md) - Tokens et design system
- [**Database**](./developer/database/schema.md) - Schema et requêtes

---

## 🏗️ Architecture Technique

### **Frontend**

- **React 18.3.1** : Framework UI avec TypeScript strict
- **Tailwind CSS v4** : Styling moderne avec @theme syntax
- **Framer Motion** : Animations fluides et micro-interactions
- **@tanstack/react-virtual** : Virtualisation pour grandes collections

### **Backend**

- **Tauri v2** : Runtime desktop (Rust)
- **SQLite** : Base de données locale avec plugin Tauri SQL
- **Plugins** : File system, dialogues, système d'exploitation

### **IA et Services**

- **Gemini AI** : Analyse d'images et génération de tags
- **i18next** : Internationalisation (français/anglais)

---

## 🎨 Interface Utilisateur

### **Navigation Principale**

```
┌─────────────────────────────────────────────────────┐
│  TopBar (recherche, actions, settings)              │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│  Sidebar    │         Main Content                  │
│  (Collections│         (Photo Grid)                  │
│   + Tags)   │                                       │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

### **Concepts Clés**

- **Collections** : Espaces de travail pour vos projets photo
- **Dossiers Virtuels** : Organisation automatique par tags/couleurs
- **Tags IA** : Tags générés automatiquement avec confiance
- **Tags Manuels** : Vos tags personnalisés
- **Color Tags** : Classification visuelle par couleur

---

## 🤖 Intelligence Artificielle

### **Fonctionnalités IA**

- **Analyse d'Images** : Description automatique des photos
- **Génération de Tags** : Tags pertinents basés sur le contenu
- **Confidence Scores** : Fiabilité de chaque tag IA
- **Batch Processing** : Traitement par lots optimisé

### **Integration Gemini**

```typescript
// Exemple d'utilisation
const analysis = await geminiService.analyzeImage(imageBuffer);
// Retourne : { description: "...", tags: [...], confidence: [...] }
```

---

## 🗄️ Gestion des Données

### **Stockage Local**

- **SQLite** : Base de données locale dans AppData
- **Métadonnées** : Informations enrichies stockées localement
- **Cache IA** : Résultats d'analyse mis en cache
- **Shadow Folders** : Dossiers virtuels miroirs

### **Structure des Données**

```
collections/
├── metadata/          # Métadonnées des fichiers
├── virtual_folders/    # Dossiers virtuels
├── tags/             # Système de tags normalisé
└── item_tags/        # Relations items-tags
```

---

## 🎯 Parcours d'Apprentissage

### **👤 Nouvel Utilisateur** (30 minutes)

1. [Installation](./getting-started/installation.md) → 10 min
2. [Interface](./user-guide/interface.md) → 15 min
3. [Fonctionnalités](./user-guide/features.md) → 5 min

### **💻 Développeur** (2 heures)

1. [Setup](./developer/setup.md) → 30 min
2. [Architecture](./developer/architecture.md) → 45 min
3. [API](./developer/api.md) → 30 min
4. [UI Components](./developer/ui-ux/components.md) → 15 min

### **🎨 Designer** (1 heure)

1. [Design System](./developer/ui-ux/design-system.md) → 30 min
2. [Components](./developer/ui-ux/components.md) → 30 min

---

## 🚀 Développement

### **Scripts Disponibles**

```bash
# Développement
npm run tauri:dev          # Dev server + Tauri
npm run dev                 # Vite dev server seul

# Build
npm run build               # Build frontend
npm run tauri:build         # Build application

# Testing
npm test                    # Tests unitaires
npm run test:e2e           # Tests end-to-end
npm run type-check          # Vérification TypeScript
```

### **Structure du Projet**

```
src/
├── features/              # Modules fonctionnels
│   ├── collections/       # Gestion collections
│   ├── library/           # Médiathèque
│   ├── navigation/        # Navigation
│   └── tags/             # Système de tags
├── shared/               # Code partagé
│   ├── components/        # Composants UI
│   ├── contexts/          # Contextes React
│   ├── hooks/            # Hooks personnalisés
│   └── types/            # Types TypeScript
├── services/             # Services externes
└── i18n/                 # Internationalisation
```

---

## 🧪 Testing

### **Tests Unitaires**

- **Vitest** : Tests des composants et hooks
- **React Testing Library** : Tests d'interface utilisateur
- **Coverage** : Rapport de couverture de code

### **Tests End-to-End**

- **Playwright** : Tests automatisés de l'application complète
- **Multi-plateforme** : Tests sur macOS, Windows, Linux

---

## 📱 Plateformes Supportées

### **Desktop**

- ✅ **macOS** : Intel et Apple Silicon
- ✅ **Windows** : Windows 10/11
- ✅ **Linux** : Ubuntu, Fedora, Arch

### **Configuration Recommandée**

- **RAM** : 8GB+ (16GB recommandé pour grandes collections)
- **Stockage** : 1GB+ (espace pour cache et métadonnées)
- **Processeur** : Multi-core pour traitement IA optimal

---

## 🔒 Sécurité et Confidentialité

### **Local-First**

- **Aucun cloud** : Vos photos restent sur votre machine
- **Pas de télémétrie** : Données non collectées
- **IA locale** : Traitement possible en local (optionnel)

### **API Keys**

- **Stockage sécurisé** : Clés API chiffrées
- **Configuration locale** : Pas d'exposition externe
- **Mode développement** : Fallback localStorage sécurisé

---

## 🤝 Contribuer

### **Comment Contribuer**

1. **Fork** le projet
2. **Créer** une branche feature
3. **Développer** avec tests
4. **Submit** une pull request

### **Guidelines**

- [**Developer Guide**](./developer/setup.md) - Setup et conventions
- [**Architecture**](./developer/architecture.md) - Comprendre la structure
- [**API**](./developer/api.md) - Utiliser l'API interne

---

## 📊 État du Projet

### **Version Actuelle**

- **Version** : 0.1.0
- **Status** : Beta stable
- **Fonctionnalités** : 95% complètes
- **Tests** : 75% de couverture

### **Roadmap**

- **v0.2** : Smart collections et filtres avancés
- **v0.3** : Mode multi-fenêtres
- **v1.0** : Version stable avec toutes les fonctionnalités

---

## 🆘 Support et Aide

### **Ressources**

- **📖 Documentation** : [docs/](./)
- **🐛 Issues** : [GitHub Issues](https://github.com/groovybronx/portf84/issues)
- **💬 Discussions** : [GitHub Discussions](https://github.com/groovybronx/portf84/discussions)

### **Commandes Utiles**

```bash
# Vérifier l'environnement
npm run tauri:info

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Debug avancé
npm run tauri:dev -- --debug
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](../LICENSE) pour plus de détails.

---

## 🎉 Remerciements

- **Tauri Team** : Framework desktop incroyable
- **Google Gemini** : API d'analyse d'images
- **Tailwind CSS** : Framework CSS moderne
- **React Community** : Écosystème de composants

---

**Lumina Portfolio** - Making photo management intelligent and delightful ✨

---

_Pour commencer : [Installation](./getting-started/installation.md) → [Developer Setup](./developer/setup.md)_
