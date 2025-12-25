Dernière mise à jour : 25/12/2024 à 01:46

# Composants UI & UX

L'interface repose sur une séparation stricte entre les composants de présentation ("Dumb Components") et le conteneur logique (`App.tsx`).

## Architecture Générale

```
src/features/
├── library/components/
│   ├── PhotoGrid.tsx       # Grille virtuelle (Masonry)
│   ├── PhotoCarousel.tsx   # Vue carrousel standard
│   ├── CinematicCarousel.tsx # Vue carrousel 3D immersive (expérimental)
│   ├── PhotoList.tsx       # Vue liste détaillée
│   ├── PhotoCard.tsx       # Re-export (voir PhotoCard/)
│   ├── PhotoCard/          # Composant décomposé
│   │   ├── index.tsx         # Assemblage principal
│   │   ├── PhotoCardFront.tsx # Face avant (image)
│   │   ├── PhotoCardBack.tsx  # Face arrière (métadonnées)
│   │   ├── PhotoCardBadges.tsx # Badges
│   │   └── usePhotoCardFlip.ts # Hook flip
│   └── ViewRenderer.tsx    # Rendu conditionnel des vues
├── navigation/components/
│   ├── TopBar.tsx          # Barre d'outils principale
│   └── topbar/             # Sous-composants (Search, ColorFilter, etc.)
├── collections/components/
│   ├── FolderDrawer.tsx    # Panneau latéral navigation (Projets)
│   ├── CollectionManager.tsx
│   ├── CreateFolderModal.tsx
│   └── MoveToFolderModal.tsx
├── vision/components/
│   └── ImageViewer.tsx     # Plein écran + métadonnées
├── tags/components/
│   └── AddTagModal.tsx     # Modal ajout tags
└── shared/
    ├── components/
    │   ├── ContextMenu.tsx     # Menu clic-droit
    │   ├── SettingsModal.tsx   # Configuration API key
    │   ├── ErrorBoundary.tsx   # Isolation erreurs
    │   └── ui/                 # UI Kit (Button, Modal, GlassCard)
    └── hooks/
        ├── useKeyboardShortcuts.ts  # Raccourcis clavier globaux
        ├── useModalState.ts         # Gestion état des modales
        ├── useItemActions.ts        # Actions sur les items
        ├── useBatchAI.ts            # Traitement AI par lot
        └── useSessionRestore.ts     # Restauration de session

src/shared/
├── types/
│   ├── types.ts          # Types principaux (PortfolioItem, Folder, etc.)
│   └── database.ts       # Types stricts pour SQLite (DBMetadata, ParsedCollection, etc.)
└── theme/
    └── animations.ts     # Variants Framer Motion centralisés
```

---

## 1. PhotoGrid (Mode Grille Virtuelle)

Affiche une maçonnerie fluide d'images, capable de gérer des milliers d'items sans ralentissement.

## 2. PhotoCarousel (Mode Flow)

Vue immersive défilante centrée sur l'image active.

### Fonctionnalités

- **Navigation Clavier** : Flèches gauche/droite.
- **Support Tactile/Souris** : Swipe gauche/droite pour changer d'image.
- **Scrubber Interactif** : 
  - Barre de progression située en bas.
  - Permet le **défilement rapide** (Scrubbing) via Drag & Drop.
  - Click-to-Jump pour atteindre rapidement une position approximative.
  
### Architecture

Utilise Framer Motion pour des transitions fluides et `useEffect` pour gérer le déchargement mémoire des images hors écran (Off-screen cleaning).

---

## 3. PhotoCard (Vignette Optimisée)

**Problème du CSS `column-count`** : Il remplit les colonnes verticalement, ce qui casse l'ordre chronologique et empêche la virtualisation.

**Solution** : Distribution JavaScript en colonnes + Virtualisation par colonne

```typescript
// 1. Distribution Masonry (JS-Distributed)
const cols = useMemo(() => {
  const columns: PortfolioItem[][] = Array.from(
    { length: gridColumns },
    () => []
  );
  items.forEach((item, index) => {
    const colIndex = index % gridColumns;
    columns[colIndex].push(item);
  });
  return columns;
}, [items, gridColumns]);

// 2. Virtualizer par colonne
const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => scrollElement.current,
  estimateSize: (i) => {
    const item = items[i];
    if (item.width && item.height && columnWidth > 0) {
      return columnWidth / (item.width / item.height) + GAP;
    }
    return 300 + GAP; // Fallback
  },
  overscan: 5,
});
```

### Auto-Scroll intelligent

Lors de la navigation clavier, la grille **centre automatiquement** l'élément actif :

```typescript
// Détection du focus + scroll
const scrollTarget = useMemo(() => {
  if (!focusedId) return null;
  const index = items.findIndex((i) => i.id === focusedId);
  if (index === -1) return null;

  return {
    colIndex: index % gridColumns,
    rowIndex: Math.floor(index / gridColumns),
  };
}, [focusedId, items, gridColumns]);

// Transmission au virtualizer
<VirtualColumn
  scrollToIndex={
    scrollTarget?.colIndex === index ? scrollTarget.rowIndex : null
  }
/>;

// Dans VirtualColumn
useEffect(() => {
  if (
    scrollToIndex !== null &&
    scrollToIndex >= 0 &&
    scrollToIndex < items.length
  ) {
    // behavior: 'smooth' pour une transition fluide
    rowVirtualizer.scrollToIndex(scrollToIndex, { align: "center", behavior: "smooth" });
  }
}, [scrollToIndex, rowVirtualizer]);
```

### PhotoCard (Vignette Optimisée)

**Optimisations appliquées** :

1. **React.memo** : Ne se redessine que si ses propres props changent

```typescript
export const PhotoCard = React.memo(PhotoCardComponent, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.isSelected === next.isSelected &&
    prev.isFocused === next.isFocused &&
    prev.selectionMode === next.selectionMode &&
    prev.showColorTags === next.showColorTags &&
    prev.selectedTag === next.selectedTag
  );
});
```

2. **Lazy Loading avec Skeleton** :

```typescript
const [isLoaded, setIsLoaded] = useState(false);

return (
  <GlassCard className="bg-gray-900/50">
    {!isLoaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
    <motion.img
      src={item.url}
      loading="lazy"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      onLoad={() => setIsLoaded(true)}
    />
  </GlassCard>
);
```

3. **Flip Animation** : `framer-motion` pour un retournement 3D révélant les métadonnées

```typescript
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  style={{ transformStyle: "preserve-3d" }}
>
  <GlassCard style={{ backfaceVisibility: "hidden" }}>
    {/* Face avant : Image */}
  </GlassCard>
  <GlassCard style={{ transform: "rotateY(180deg)" }}>
    {/* Face arrière : Métadonnées */}
  </GlassCard>
</motion.div>
```

4. **Affichage Dossier/Collection** (24/12/2024) :

Le dos de la carte affiche maintenant le nom du dossier ou de la collection virtuelle avec une icône colorée :

- **Shadow folders** : Icône `HardDrive` bleue (`text-blue-400`, `bg-blue-500/10`)
- **Collections virtuelles** : Icône `FolderHeart` violette (`text-purple-400`, `bg-purple-500/10`)

Les couleurs correspondent exactement à celles de la sidebar (`FolderDrawer`) pour une cohérence visuelle.

**Props** :
```typescript
interface PhotoCardProps {
  item: PortfolioItem;
  isSelected: boolean;
  isFocused: boolean;
  selectionMode: boolean;
  showColorTags: boolean;
  onSelect: (item: PortfolioItem) => void;
  onToggleSelect: (id: string) => void;
  onFocus: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => void;
  onHover: (item: PortfolioItem | null) => void;
  registerItemRef?: (id: string, el: HTMLElement | null) => void;
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
  folders?: Folder[];        // NEW: Pour afficher le nom du dossier
  collections?: Collection[]; // NEW: Pour afficher le nom de la collection
}
```

### Slider de Colonnes

| Position Slider | Colonnes | Résultat          |
| --------------- | -------- | ----------------- |
| Gauche          | 8        | Petites vignettes |
| Centre          | 4        | Équilibré         |
| Droite          | 2        | Grandes vignettes |

---

## 2. TopBar

La barre d'outils principale avec trois zones distinctes :

| **Droite** | Sélecteur Vue (Grid/Carousel/List)    | Fixe         |

### Adaptation au Pinning

La TopBar reçoit désormais la prop `isSidebarPinned`.

- **Pointer Events** : Le conteneur de la TopBar utilise `pointer-events-none` pour ne pas bloquer les clics sur la sidebar épinglée. Seule la "pill" centrale et ses boutons acceptent les clics (`pointer-events-auto`).
- **Layout Dynamique** : Si la sidebar est épinglée, la TopBar applique une marge à gauche (`left-80`) pour rester centrée par rapport à la zone de contenu utile.

### Optimisation Context

La TopBar utilise **uniquement** `useLibraryActions()` pour éviter les re-rendus :

```typescript
const TopBar: React.FC<TopBarProps> = ({ ... }) => {
  // ❌ Avant : re-render à chaque changement de données
  // const { setViewMode, setSearchTerm, folders } = useLibrary();

  // ✅ Après : pas affecté par les changements de données
  const { setViewMode, setSearchTerm } = useLibraryActions();
  const { folders } = useLibraryState(); // Only if needed
};
```

### Smart Search

Remplace l'ancien menu "Tags". Barre de recherche unifiée avec autosuggestion basée sur :

- Tags AI (`aiTags`)
- Tags manuels (`manualTags`)
- Noms de fichiers

**Implémentation** : Utilise `Fuse.js` pour recherche floue (tolérance fautes)

---

## 3. FolderDrawer (Gestionnaire de Dossiers)

Panneau latéral coulissant pour la navigation dans les Collections et Dossiers.

### Sélection de Dossier (Native)

Utilise `@tauri-apps/plugin-dialog` pour le sélecteur natif :

```typescript
import { open } from "@tauri-apps/plugin-dialog";

const selected = await open({
  directory: true,
  multiple: false,
  title: "Sélectionner un Dossier Source",
});
```

### Pinning & Persistance (Pin Logic)

Le `FolderDrawer` gère deux modes d'affichage via une logique de rendu unifiée (`isVisible`) :

- **`isPinned={true}`** : Rendu relatif (`relative`), s'intègre dans le flux flexbox de l'application.
- **`isPinned={false}`** : Rendu fixe (`fixed`), utilise les animations de transition spring et un backdrop.

Cette unification garantit que l'état interne du composant (scroll, sélections) est préservé lors de la transition entre le mode flottant et le mode épinglé.

| Icone       | État                      | Signification                                      |
| ----------- | ------------------------- | -------------------------------------------------- |
| 📚 Layers   | Racine (Library)          | Affiche tous les dossiers et items du Projet Actif |
| 💾 HardDrive | Physique (Source)         | Dossier synchronisé avec le système de fichiers    |
| 💜 FolderHeart | Virtuel (Collection)     | Collection manuelle cible de déplacements          |
| 📌 Unpin    | Actif (isPinned=true)      | La barre est fixée à gauche                        |
| 📌 Pin      | Inactif (isPinned=false)   | La barre est en mode drawer flottant               |

### Architecture Collections

- Une **Collection** = Un espace de travail isolé
- Chaque collection contient :
  - Dossiers sources (liens disque)
  - Dossiers virtuels (albums)
  - Métadonnées isolées

---

## 4. PhotoCarousel (Mode Flow 3D)

Carrousel circulaire haute performance optimisé pour 60fps.

### Optimisations

- **Background Statique** : Dégradé CSS fixe au lieu d'image dynamique
- **Virtualisation Stricte** : Seules les images visibles (`VISIBLE_RANGE`) sont rendues
- **Accélération Matérielle** : `will-change: transform, opacity`

```typescript
const VISIBLE_RANGE = 5; // Nombre d'items montés simultanément

const visibleItems = useMemo(() => {
  const start = Math.max(0, currentIndex - Math.floor(VISIBLE_RANGE / 2));
  const end = Math.min(items.length, start + VISIBLE_RANGE);
  return items.slice(start, end);
}, [currentIndex, items]);
```

---

## 5. CinematicCarousel (Mode Flow 3D Immersif - Expérimental)

Un carrousel 3D dramatique utilisant `framer-motion` pour des effets de perspective et de rotation intenses avec virtualisation pour des performances optimales.

### Caractéristiques

- **Virtualisation intelligente** : Seules 7 images sont rendues simultanément (image actuelle ± 3), optimisant les performances même avec des milliers d'images
- **Perspective intense** : `perspective: 1500px` avec `transformStyle: preserve-3d` pour une profondeur maximale
- **Navigation circulaire** : Défilement infini dans les deux directions avec gestion des indices modulaires
- **Interactivité complète** :
  - Cliquabilité directe sur les images latérales pour naviguer instantanément
  - Navigation clavier (← → pour naviguer, Esc pour fermer, I pour toggle info)
  - Boutons de navigation avec icônes ChevronLeft/Right
- **Animations fluides** : Transitions `spring` (stiffness: 150, damping: 20) pour un mouvement naturel et physique
- **Gestion des z-index** : Système de couches avec z-index dynamiques (300 pour contrôles, 250 pour navigation, 100-90 pour images)
- **Overlay métadonnées** : Panneau d'information glassmorphique affichant nom, description AI, tags et position
- **Rendu conditionnel** : Activé via le toggle expérimental dans `SettingsModal`

### Positionnement 3D

Chaque image est positionnée selon son offset par rapport à l'image centrale :

```typescript
const getImageStyle = (offset: number) => {
  const translateX = offset * 500; // Espacement horizontal
  const translateZ = offset === 0 ? 250 : -Math.abs(offset) * 200; // Profondeur
  const rotateY = offset * -25; // Rotation perspective
  const scale =
    offset === 0 ? 1.1 : Math.max(0.6, 0.9 - Math.abs(offset) * 0.1);
  const opacity =
    offset === 0 ? 1 : Math.max(0.5, 0.85 - Math.abs(offset) * 0.15);
  const zIndex = 100 - Math.abs(offset) * 10;

  return { translateX, translateZ, rotateY, scale, opacity, zIndex };
};
```

### Indicateur de progression

Affiche jusqu'à 20 points de progression en bas de l'écran, avec l'item actuel mis en évidence par une barre élargie.

---

## 6. ImageViewer (Plein Écran)

Visualiseur modal pour inspection détaillée.

### Fonctionnalités

- Navigation clavier (Flèches Gauche/Droite, Esc pour fermer)
- **AI Analysis en direct** :
  - Bouton "Analyze" déclenche `analyzeImageStream()`
  - Affichage du "Thinking Process" en temps réel (streaming)
  - Persistance automatique des résultats
- **TagManager intégré** : Ajout/Suppression rapide de tags
- Tags couleurs modifiables (touches 1-6, 0 pour retirer)
- Lecture métadonnées EXIF (via `exif-js`)

### Thinking Process (Stream AI)

```typescript
const [thinking, setThinking] = useState("");
const [isAnalyzing, setIsAnalyzing] = useState(false);

const handleAnalyze = async () => {
  setIsAnalyzing(true);
  setThinking("");

  const result = await analyzeImageStream(
    item,
    (text) => setThinking(text), // Callback streaming
    true // Enable thinking
  );

  // Mise à jour de l'item avec les résultats
  onUpdateItem({ ...item, ...result });
  setIsAnalyzing(false);
};
```

---

## 6. ContextMenu (Clic-Droit)

Menu contextuel personnalisé avec positionnement `fixed`.

### Actions Disponibles

| Action                 | Description                  |
| ---------------------- | ---------------------------- |
| **Analyze (AI)**       | Lance l'analyse Gemini       |
| **Add Tags**           | Ouvre modal taguage          |
| **Move to Collection** | Déplace vers collection manuelle (icône violette) |
| **Color Tag (1-6)**    | Applique couleur rapide      |
| **Open**               | Ouvre en plein écran         |
| **Delete**             | Suppression logique (Trash)  |

### Intelligence Contextuelle

Si on clique-droit sur un item non sélectionné, il devient l'unique sélection avant d'exécuter l'action.

```typescript
const handleContextMove = (item: PortfolioItem) => {
  if (!selectedIds.has(item.id)) {
    clearSelection();
    setSelectedIds(new Set([item.id]));
  }
  setIsMoveModalOpen(true);
};
```

---

## 7. FolderDrawer (Barre Latérale)

Composant de navigation principal permettant de gérer les dossiers de travail, les collections et les filtres.

### Architecture

- **Structure Accordéon** : Trois sections pliables (`Dossiers de Travail`, `Collections`, `Filtres Couleur`).
- **État Persistant** : Les sections peuvent être ouvertes/fermées individuellement. Par défaut, elles sont fermées au démarrage.
- **Smart Color Folders** : Section générée dynamiquement affichant toutes les images par couleur, sans dossier physique.

### Sections

1.  **Dossiers de Travail (Bleu)** : Dossiers sources physiques sur le disque.
2.  **Collections (Violet)** : Dossiers virtuels crées manuellement dans l'app.
3.  **Filtres Couleur (Ambre)** : Filtres intelligents. Cliquer sur "Rouge" affiche toutes les images taguées en rouge, où qu'elles soient.

---

## 8. TagManager & Autosuggestion

Composant dédié à la gestion des tags manuels.

- **Autosuggestion** : Propose les tags existants lors de la saisie (via `availableTags`)
- **Persistance** : Sauvegarde immédiate dans SQLite via `storageService.saveMetadata()`
- **Contextes** : ImageViewer sidebar, AddTagModal (batch), ContextMenu

---

## 8. SettingsModal (Paramètres)

Modale de configuration globale.

- **Accès** : Icône "Roue crantée" dans la TopBar
- **Fonction principale** : Définir la **Clé API Gemini**
- **Persistance** : `localStorage` (survit aux sessions)

```typescript
const handleSaveKey = (key: string) => {
  localStorage.setItem("gemini_api_key", key);
  setIsSettingsOpen(false);
};
```

---

## 9. URLs d'Images (Asset Protocol)

Les images locales utilisent le protocol `asset://` de Tauri :

```typescript
import { convertFileSrc } from "@tauri-apps/api/core";

// Chemin local → URL asset
const url = convertFileSrc("/Users/john/photo.jpg");
// → "asset://localhost/Users/john/photo.jpg"
```

Cette approche :

- Évite le chargement en mémoire RAM (streaming natif)
- Respecte les permissions Tauri ACL
- Fonctionne offline sans serveur HTTP
- Supporte les MIME types natifs du système

---

## 10. Custom Hooks (Refactorisation App.tsx)

### useKeyboardShortcuts

**Responsabilité** : Gestion centralisée des raccourcis clavier globaux

**Fonctionnalités** :

- Navigation avec flèches (← → ↑ ↓)
- Sélection avec Space/Enter
- Color tagging avec touches 0-6
- Ignore les événements dans les inputs/textareas

**Usage** :

```typescript
useKeyboardShortcuts({
  processedItems,
  focusedId,
  setFocusedId,
  setSelectedItem,
  applyColorTagToSelection,
  gridColumns,
});
```

---

### useModalState

**Responsabilité** : Centralisation de l'état des modales

**Modales gérées** :

- FolderDrawer
- CreateFolderModal
- MoveToFolderModal
- AddTagModal
- SettingsModal
- CollectionManager

**Usage** :

```typescript
const {
  isFolderDrawerOpen,
  setIsFolderDrawerOpen,
  // ... autres modales
} = useModalState();
```

**Bénéfice** : Réduit la duplication de code (6 useState → 1 hook)

---

### useItemActions

**Responsabilité** : Actions métier sur les items (tagging, colors, move, analyze)

**Actions disponibles** :

- `addTagsToSelection(tag)` : Ajoute un tag aux items sélectionnés
- `applyColorTagToSelection(color)` : Applique une couleur
- `analyzeItem(item)` : Lance l'analyse AI
- `moveItemToFolder(folderId)` : Déplace vers un dossier
- `createFolderAndMove(name)` : Crée un dossier et déplace
- `handleContextMove(item)` : Gère le déplacement depuis le menu contextuel

**Usage** :

```typescript
const {
  addTagsToSelection,
  applyColorTagToSelection,
  analyzeItem,
  // ...
} = useItemActions({
  currentItems,
  selectedIds,
  updateItem,
  clearSelection,
  // ...
});
```

**Bénéfice** : Logique métier isolée, testable, et réutilisable

---

### ViewRenderer

**Responsabilité** : Rendu conditionnel des vues (Grid/Carousel/List)

**Props** :

- `viewMode` : Mode de vue actuel
- `useCinematicCarousel` : Active le carousel 3D
- `currentItems` : Items à afficher
- `selectedItem` : Item sélectionné
- `focusedId` : ID de l'item focusé
- Callbacks : `onSelect`, `onHover`, `onContextMenu`, `onTagClick`, `onFocusChange`

**Usage** :

```typescript
<ViewRenderer
  viewMode={viewMode}
  useCinematicCarousel={useCinematicCarousel}
  currentItems={currentItems}
  selectedItem={selectedItem}
  focusedId={focusedId}
  onSelect={setSelectedItem}
  onHover={setHoveredItem}
  onContextMenu={(e, item) =>
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }
  onTagClick={setSelectedTag}
  onFocusChange={setFocusedId}
/>
```

**Bénéfice** : Simplifie App.tsx en extrayant 63 lignes de logique de rendu

---

## 11. Tests Unitaires

Les hooks personnalisés sont couverts par des tests unitaires complets utilisant **Vitest** et **@testing-library/react**.

### Tests pour useKeyboardShortcuts

**Fichier** : [tests/useKeyboardShortcuts.test.ts](file:///Users/davidmichels/gravity%20app/portf84/tests/useKeyboardShortcuts.test.ts)

**Couverture** : 17 tests

- Navigation (7 tests) : ArrowRight, ArrowLeft, ArrowUp, ArrowDown, limites
- Sélection (3 tests) : Space, Enter, comportement sans focus
- Color tagging (3 tests) : touches 1-6, touche 0, touches 7-9
- Exclusion (2 tests) : ignore inputs/textareas
- Edge cases (2 tests) : liste vide, ID invalide

### Tests pour useItemActions

**Fichier** : [tests/useItemActions.test.ts](file:///Users/davidmichels/gravity%20app/portf84/tests/useItemActions.test.ts)

**Couverture** : 15 tests

- `addTagsToSelection` (4 tests) : sélection multiple, context menu, déduplication
- `applyColorTagToSelection` (4 tests) : fullscreen, sélection multiple, focused item
- `analyzeItem` (2 tests) : analyse AI, gestion erreurs
- `moveItemToFolder` (1 test) : déplacement et cleanup
- `createFolderAndMove` (2 tests) : création dossier, vérification collection
- `handleContextMove` (2 tests) : sélection et modal

### Exécution

```bash
npm test
```

**Résultats** : 40 tests passent (32 nouveaux + 8 existants) en 2.62s
