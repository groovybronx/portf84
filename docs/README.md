# Lumina Portfolio - Documentation Technique

Bienvenue dans la documentation technique de **Lumina Portfolio**. Cette application est une galerie photo haute performance construite avec Tauri v2, offrant une expérience desktop native avec intelligence artificielle intégrée.

## Stack Technologique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 19.x | Framework UI |
| **Tailwind CSS** | 4.x | Styling (@theme syntax) |
| **Tauri** | 2.x | Runtime natif |
| **SQLite** | via plugin | Persistance locale |
| **Framer Motion** | 12.x | Animations |
| **Gemini AI** | @google/genai | Analyse d'images |
| **Vitest** | 4.x | Tests unitaires |

---

## Sommaire

1. [Architecture & Données](ARCHITECTURE.md)
   - Stack technologique Tauri v2
   - Base de données SQLite
   - Asset Protocol & permissions
   - Déploiement & CI/CD
   
2. [Composants UI & UX](COMPONENTS.md)
   - Système de vues (Grid, Flow, List)
   - Dialog natif Tauri
   - Moteur d'animation
   
3. [Service AI (Gemini)](AI_SERVICE.md)
   - Intégration de l'API
   - Ingénierie du Prompt
   - Batch processing
   
4. [Interactions & Raccourcis](INTERACTIONS.md)
   - Gestion du clavier
   - Système de tagging couleur
   - Drag & Drop

---

## Installation Rapide

### Prérequis

- **Node.js** (LTS recommandé)
- **Rust** (stable toolchain)
- **macOS** 10.15+ (pour le build natif)

### Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (Frontend + Tauri)
npm run tauri:dev

# Lancer uniquement le frontend (web)
npm run dev
```

### Build Production

```bash
# Générer l'application native (.dmg pour macOS)
npm run tauri:build
```

---

## Conventions de Code

| Convention | Description |
|------------|-------------|
| **Hooks-based** | État global dans `App.tsx` via hooks custom |
| **Glassmorphism** | `backdrop-blur` + couleurs semi-transparentes |
| **Performance** | `useMemo` pour tris/filtres, lazy loading images |
| **Persistance** | SQLite via `@tauri-apps/plugin-sql` |

---

## Configuration

### Clé API Gemini

Deux méthodes :

1. **Via l'interface** : Settings → Entrer la clé
2. **Via environnement** : Créer `.env.local` avec `VITE_GEMINI_API_KEY=your_key`

### Tauri Capabilities

Les permissions sont définies dans `src-tauri/capabilities/default.json`. Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour les détails.
