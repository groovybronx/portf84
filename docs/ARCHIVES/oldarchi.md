# Architecture Technique - Lumina Portfolio V2

## Vue d'Ensemble

Lumina Portfolio est une application native **Local-First** construite avec **Tauri v2**, offrant une expérience desktop haute performance sans backend externe.

```mermaid
graph TD
    A[React 19.2 + Vite] --> B[Tauri v2 Core]
    B --> C[SQLite Database]
    B --> D[Native File System]
    B --> E[Asset Protocol]
    A --> F[Gemini AI API]
```

## Stack Technologique

| Layer              | Technologie                       | Rôle                           |
| ------------------ | --------------------------------- | ------------------------------ |
| **Frontend**       | React 19.2 + Tailwind CSS v4        | Interface utilisateur          |
| **Runtime**        | Tauri v2                          | Bridge natif, sécurité, bundle |
| **Persistance**    | SQLite (`@tauri-apps/plugin-sql`) | Base de données locale         |
| **Fichiers**       | `@tauri-apps/plugin-fs`           | Accès système de fichiers      |
| **UI Native**      | `@tauri-apps/plugin-dialog`       | Sélecteur de dossiers natif    |
| **Virtualisation** | `@tanstack/react-virtual` 3.13    | Rendu UI optimisé              |

---

## Architecture de Code (Feature-Based)

Le projet suit une architecture **fractal modulaire** pour maximiser la maintenabilité.

```
src/
  ├── features/           # Domaines fonctionnels
  │   ├── library/        # Grille photos, cartes, carrousels (standard & 3D)
  │   ├── navigation/     # TopBar et composants associés
  │   ├── collections/    # Gestionnaire dossiers, Projets
  │   ├── vision/         # AI Analysis, ImageViewer
  │   └── tags/           # Système de tagging
├── shared/             # Ressources transverses
│   ├── components/     # UI Kit (Button, Modal, GlassCard)
│   ├── hooks/          # Hooks réutilisables
│   ├── types/          # Types globaux (PortfolioItem)
│   ├── utils/          # Fonctions utilitaires
│   └── theme/          # Design Tokens
├── contexts/           # État global optimisé
│   ├── CollectionsContext.tsx
│   ├── LibraryContext.tsx    # Split en State/Dispatch
│   ├── SelectionContext.tsx
│   ├── ProgressContext.tsx
│   └── ThumbnailContext.tsx  # NEW: Background generation state
├── services/           # Logique métier externe
│   ├── geminiService.ts
│   ├── libraryLoader.ts
│   ├── storageService.ts
│   └── thumbnailWorker.ts    # NEW: Background process worker
└── App.tsx             # Point d'entrée, composition
```

---

## État Global (Contexts Optimisés)

### Pattern "Context Split" (Performance)

Pour éviter les re-rendus globaux, `LibraryContext` est séparé en deux :

```typescript
// Contexte READ-ONLY (données)
const LibraryStateContext = createContext<LibraryContextState>();

// Contexte WRITE-ONLY (actions)
const LibraryDispatchContext = createContext<LibraryContextActions>();

// Hooks ciblés
export const useLibraryState = () => useContext(LibraryStateContext);
export const useLibraryActions = () => useContext(LibraryDispatchContext);

// Hook legacy (API compatible)
export const useLibrary = () => ({
  ...useLibraryState(),
  ...useLibraryActions(),
});
```

**Avantage** : Un composant utilisant uniquement `useLibraryActions()` ne se re-rend PAS lors des changements de données.

### Autres Contexts

| Contexte               | Responsabilité                             |
| ---------------------- | ------------------------------------------ |
| **CollectionsContext** | Gestion des workspaces multi-bibliothèques |
| **SelectionContext**   | Sélection multiple, drag-select            |
| **ProgressContext**    | Indicateurs de progression asynchrones     |

---

## Approche "Local-First" & Persistance

### 1. Projets et Shadow Folders

L'application organise les fichiers via des "Projets" isolés :

- **Projet** = Workspace indépendant (anciennement "Collection")
- Chaque projet possède ses propres :
  - **Dossiers sources** (liens vers disque, lecture seule)
  - **Shadow folders** (clones virtuels auto-créés, modifiables)
  - **Collections** (albums manuels créés par l'utilisateur)
  - **Métadonnées** (tags AI, couleurs)

#### Shadow Folders (Architecture Non-Destructive)

Pour chaque dossier source ajouté, un **shadow folder** est automatiquement créé. Ce dossier virtuel :

- Contient les mêmes items que le dossier source
- Permet des modifications **non-destructives** (tags, déplacement vers collections)
- N'affecte jamais les fichiers sources originaux
- Est visible dans la section "Dossiers de Travail" du FolderDrawer

```
Dossier Source (/Photos/Vacances) [lecture seule]
    ↓ auto-création
Shadow Folder "Vacances" [modifiable]
    → Contient copies virtuelles des items
    → Modifications isolées
```

### 2. Base de Données Locale (SQLite)

SQLite via `@tauri-apps/plugin-sql` avec **4 tables** :

```sql
-- Collections (workspaces)
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  lastOpenedAt INTEGER,
  isActive INTEGER DEFAULT 0
);

-- Dossiers sources (physiques)
CREATE TABLE collection_folders (
  id TEXT PRIMARY KEY,
  collectionId TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  addedAt INTEGER NOT NULL,
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
);

-- Dossiers virtuels (albums + shadow folders)
CREATE TABLE virtual_folders (
  id TEXT PRIMARY KEY,
  collectionId TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  isVirtual INTEGER DEFAULT 1,
  sourceFolderId TEXT,  -- NEW: Lien vers source (shadow folders uniquement)
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
);

-- Métadonnées enrichies
CREATE TABLE metadata (
  id TEXT PRIMARY KEY,
  collectionId TEXT,
  virtualFolderId TEXT,
  aiDescription TEXT,
  aiTags TEXT,           -- JSON array
  aiTagsDetailed TEXT,   -- JSON avec confidence
  colorTag TEXT,
  manualTags TEXT,       -- JSON array
  thumbnailUrl TEXT,     -- NEW: Path to cached thumbnail
  lastModified INTEGER NOT NULL,
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE SET NULL
);
```

### 3. Asset Protocol (Tauri)

Tauri fournit un protocol sécurisé pour accéder aux images locales :

```typescript
import { convertFileSrc } from "@tauri-apps/api/core";

// Transforme un chemin absolu en URL asset://
const assetUrl = convertFileSrc("/Users/john/Photos/image.jpg");
// → "asset://localhost/Users/john/Photos/image.jpg"
```

**Configuration dans `tauri.conf.json`** :

```json
"security": {
  "assetProtocol": {
    "enable": true,
    "scope": ["$HOME/**"]
  }
}
```

---

## Optimisation des Performances

### Virtualisation UI (@tanstack/react-virtual)

Le rendu de milliers d'éléments DOM est résolu par la virtualisation :

- **Stratégie** : Virtual Masonry avec `@tanstack/react-virtual`
- **Implémentation** :
  - Calcul des positions absolues via AspectRatio
  - Distribution en colonnes (Masonry)
  - Rendu uniquement des items visibles (+buffer)
  - Auto-Scroll intelligent lors de la navigation clavier

```typescript
// PhotoGrid - Distribution Masonry
const cols = useMemo(() => {
  const columns: PortfolioItem[][] = Array.from(
    { length: gridColumns },
    () => []
  );
  items.forEach((item, index) => {
    const colIndex = index % gridColumns;
    const targetColumn = columns[colIndex];
    if (targetColumn) targetColumn.push(item);
  });
  return columns;
}, [items, gridColumns]);

// Virtualizer par colonne
const rowVirtualizer = useVirtualizer({
  count: colItems.length,
  getScrollElement: () => containerRef.current,
  estimateSize: (i) => {
    const item = colItems[i];
    if (item.width && item.height && columnWidth > 0) {
      return columnWidth / (item.width / item.height) + GAP;
    }
    return 300 + GAP;
  },
  overscan: 5,
});
```

### Génération de Thumbnails (Background Processing - Phase 6)

Pour garantir une fluidité maximale, l'application génère des vignettes (400px) en arrière-plan :

- **Optimisation (PERF-001)** : Les miniatures ne sont plus générées pendant le scan du disque, ce qui rend l'interface interactive instantanément.
- **Queueing (ThumbnailContext)** : Les images sans vignettes sont ajoutées à une file d'attente globale.
- **Worker (thumbnailWorker)** : Un service traite la queue avec une concurrence limitée (3 items max) pour préserver le CPU.
- **Caching** : Les miniatures sont stockées dans `AppData/thumbnails/` et persistées dans SQLite dès qu'elles sont prêtes.
- **Backend Rust** : Utilisation de la crate `image` via l'invoke `get_thumbnail` pour un redimensionnement haute performance.

### React.memo & Lazy Loading

```typescript
// PhotoCard optimisé
const PhotoCardComponent: React.FC<PhotoCardProps> = ({ item, isSelected, ... }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <div className="animate-pulse bg-white/5" />}
      <motion.img
        src={item.url}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
      />
    </>
  );
};

// Memoization avec comparaison custom
export const PhotoCard = React.memo(PhotoCardComponent, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.isSelected === next.isSelected &&
    prev.isFocused === next.isFocused
    // Ignore les fonctions (onSelect, etc.)
  );
});
```

### Code Splitting (Vite)

```typescript
// vite.config.ts
manualChunks(id) {
  if (id.includes("framer-motion")) return "vendor-framer";
  if (id.includes("lucide-react")) return "vendor-lucide";
  if (id.includes("react")) return "vendor-react";
  return "vendor";
}
```

---

## Flux de Données (Chargement & Fusion)

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dialog Plugin
    participant FS as Tauri FS
    participant DB as SQLite
    participant UI as React State

    U->>D: Sélectionne dossier
    D->>FS: readDir() récursif
    FS->>DB: Charge métadonnées existantes
    DB->>UI: Hydrate items avec AI tags, couleurs
    UI->>UI: Distribue vers folders physiques/virtuels
```

1. **Scan Disque** : `readDir()` récursif via `@tauri-apps/plugin-fs`
2. **Chargement DB** : Récupération des métadonnées et dossiers virtuels
3. **Hydratation** :
   - Chaque fichier est enrichi avec ses métadonnées (tags AI, couleurs)
   - Si `virtualFolderId` existe, l'item est déplacé dans le dossier virtuel
4. **Rendu** : État `folders` unifié (physiques + virtuels)

---

## Déploiement Tauri

### Build Commands

```bash
# Développement
npm run tauri:dev      # Frontend + Backend simultanés

# Production
npm run tauri:build    # Génère .dmg / .app pour macOS
```

### Capabilities & Permissions

Les permissions sont définies dans `src-tauri/capabilities/default.json` :

| Permission           | Scope      | Description          |
| -------------------- | ---------- | -------------------- |
| `fs:allow-read-dir`  | `$HOME/**` | Lecture des dossiers |
| `fs:allow-read-file` | `$HOME/**` | Lecture des fichiers |
| `sql:allow-*`        | Local DB   | Opérations SQLite    |
| `dialog:default`     | System     | Dialogs natifs       |

### GitHub Actions CI/CD

Le workflow `.github/workflows/release-macos.yml` :

- Trigger : Push sur `main` ou dispatch manuel
- Génère un draft release avec `.dmg` attaché
- Version automatique depuis `tauri.conf.json`

---

## Stratégie de Tests

L'application utilise **Vitest** pour garantir la fiabilité du cœur logique.

### Structure

- **`tests/`** : Dossier racine contenant tous les tests unitaires
  - `geminiService.test.ts` : Mock le SDK Google GenAI
  - `fileHelpers.test.ts` : Mock Tauri FS pour scan récursif

### Exécution

```bash
npm run test
```

- Environnement : `jsdom` (simulation DOM)
- Mocks : `@tauri-apps/plugin-fs`, `@tauri-apps/api/core`
