# 🔌 API Reference - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/shared/types/` et `src/services/`

---

## 📋 Vue d'Ensemble

Cette documentation décrit l'API interne de Lumina Portfolio : services, hooks, types et interfaces utilisés par les développeurs.

---

## 🏗️ Types et Interfaces Principales

### **PortfolioItem** - Élément du Portfolio

```typescript
interface PortfolioItem {
	id: string; // Identifiant unique
	file?: File; // Fichier (si uploadé)
	path?: string; // Chemin système
	url: string; // URL d'affichage
	name: string; // Nom du fichier
	type: string; // Type MIME
	size: number; // Taille en octets
	lastModified: number; // Timestamp modification

	// Dimensions (images)
	width?: number;
	height?: number;

	// IA et Tags
	aiDescription?: string; // Description générée par IA
	aiTags?: string[]; // Tags générés par IA
	aiTagsDetailed?: AiTagDetailed[]; // Tags détaillés avec confiance

	// Organisation
	collectionId?: string; // Collection parente
	virtualFolderId?: string; // Dossier virtuel
	colorTag?: string; // Code hexa couleur
	manualTags?: string[]; // Tags manuels

	// Legacy
	folderId?: string; // @deprecated
}
```

### **Collection** - Collection de Photos

```typescript
interface Collection {
	id: string; // Identifiant unique
	name: string; // Nom de la collection
	createdAt: number; // Timestamp création
	lastOpenedAt?: number; // Dernière ouverture
	isActive: boolean; // État actif
}
```

### **Folder** - Dossier de Photos

```typescript
interface Folder {
	id: string; // Identifiant unique
	name: string; // Nom du dossier
	items: PortfolioItem[]; // Contenu
	createdAt: number; // Timestamp création
	isVirtual?: boolean; // Virtuel ou physique
	path?: string; // Chemin (physique)
	collectionId: string; // Collection parente
	sourceFolderId?: string; // Source (shadow folders)
}
```

### **AiTagDetailed** - Tag IA Détaillé

```typescript
interface AiTagDetailed {
	name: string; // Nom du tag
	confidence: number; // Score de confiance (0-1)
}
```

---

## 🗄️ Storage Service API

### **Collections**

```typescript
// Créer une collection
const collection = await storageService.createCollection({
	name: "Vacances 2024",
});

// Récupérer toutes les collections
const collections = await storageService.getCollections();

// Récupérer la collection active
const active = await storageService.getActiveCollection();

// Définir la collection active
await storageService.setActiveCollection(collectionId);

// Supprimer une collection
await storageService.deleteCollection(collectionId);
```

### **Dossiers Virtuels**

```typescript
// Créer un dossier virtuel
const folder = await storageService.saveVirtualFolder({
	id: "folder-123",
	collectionId: "collection-456",
	name: "Nature",
	createdAt: Date.now(),
	sourceFolderId: "source-789",
});

// Supprimer un dossier virtuel
await storageService.deleteVirtualFolder(folderId);

// Récupérer les dossiers virtuels
const folders = await storageService.getVirtualFolders();

// Créer un dossier shadow (miroir)
const shadowFolder = await storageService.createShadowFolder(collectionId, sourceFolderId);

// Récupérer les paires shadow/source
const pairs = await storageService.getShadowFoldersWithSources(collectionId);
```

### **Métadonnées**

```typescript
// Sauvegarder les métadonnées d'un item
await storageService.saveMetadata(itemId, {
	collectionId: "collection-123",
	virtualFolderId: "folder-456",
	aiDescription: "Une belle photo de coucher de soleil",
	aiTags: ["coucher", "soleil", "nature"],
	aiTagsDetailed: [
		{ name: "sunset", confidence: 0.95 },
		{ name: "nature", confidence: 0.87 },
	],
	colorTag: "#ef4444",
	manualTags: ["vacances", "été"],
});

// Récupérer les métadonnées en lot
const metadata = await storageService.getMetadataBatch([itemId1, itemId2]);
```

### **Tags Normalisés**

```typescript
// Créer ou récupérer un tag
const tag = await storageService.getOrCreateTag("paysage", "ai");

// Ajouter un tag à un item
await storageService.addTagToItem(itemId, tagId);

// Retirer un tag d'un item
await storageService.removeTagFromItem(itemId, tagId);

// Récupérer les tags d'un item
const tags = await storageService.getTagsForItem(itemId);

// Récupérer les items avec un tag
const items = await storageService.getItemsWithTag(tagId);

// Récupérer tous les tags
const allTags = await storageService.getAllTags();

// Rechercher des tags
const searchResults = await storageService.searchTags("nat");

// Supprimer un tag
await storageService.deleteTag(tagId);

// Ajouter plusieurs tags à un item
await storageService.addTagsToItem(itemId, [tagId1, tagId2]);

// Récupérer les tags groupés par type
const groupedTags = await storageService.getTagsGroupedForItem(itemId);
```

---

## 🎣 Custom Hooks API

### **useCollections()** - Gestion des Collections

```typescript
const {
	collections, // Collection[]
	activeCollection, // Collection | null
	sourceFolders, // SourceFolder[]
	isLoading, // boolean
	createCollection, // (name: string) => Promise<void>
	switchCollection, // (collectionId: string) => Promise<void>
	deleteCollection, // (collectionId: string) => Promise<void>
	addSourceFolder, // (path: string) => Promise<void>
	removeSourceFolder, // (path: string) => Promise<void>
} = useCollections();
```

### **useLibrary()** - Gestion de la Médiathèque

```typescript
const {
	folders, // Folder[]
	activeFolderIds, // Set<string>
	loadFromPath, // (path: string) => Promise<void>
	importFiles, // (files: FileList) => Promise<void>
	updateItems, // (items: PortfolioItem[]) => void
	createFolder, // (name: string) => Promise<void>
	deleteFolder, // (folderId: string) => Promise<void>
	toggleFolderSelection, // (folderId: string) => void
	moveItemsToFolder, // (itemIds: string[], folderId: string) => Promise<void>
	clearLibrary, // () => void
	viewMode, // ViewMode
	gridColumns, // number
	activeColorFilter, // string | null
	setActiveColorFilter, // (color: string | null) => void
	availableTags, // string[]
	processedItems, // PortfolioItem[]
	currentItems, // PortfolioItem[]
	toggleTag, // (tag: string) => void
	useCinematicCarousel, // boolean
	setCinematicCarousel, // (enabled: boolean) => void
	refreshMetadata, // () => Promise<void>
} = useLibrary();
```

### **useSelection()** - Gestion de la Sélection

```typescript
const {
	selectionMode, // boolean
	selectedIds, // Set<string>
	setSelectedIds, // (ids: Set<string>) => void
	clearSelection, // () => void
	isDragSelecting, // boolean
	dragBox, // DragBox | null
	handleMouseDown, // (e: MouseEvent, viewMode: ViewMode, items: PortfolioItem[]) => void
	handleMouseMove, // (e: MouseEvent, items: PortfolioItem[]) => void
	handleMouseUp, // () => void
} = useSelection();
```

### **useBatchAI()** - Traitement IA par Lots

```typescript
const {
  addToQueue,            // (item: PortfolioItem) => void
  processingQueue,       // PortfolioItem[]
  isProcessing,          // boolean
  progress,              // number (0-1)
} = useBatchAI(updateItem: (item: PortfolioItem) => void);
```

### **useKeyboardShortcuts()** - Raccourcis Clavier

```typescript
useKeyboardShortcuts({
	processedItems, // PortfolioItem[]
	focusedId, // string | null
	setFocusedId, // (id: string | null) => void
	setSelectedItem, // (item: PortfolioItem | null) => void
	applyColorTagToSelection, // (color: string) => void
	gridColumns, // number
	onOpenBatchTagPanel, // () => void
	onOpenHelp, // () => void
	onSelectAll, // () => void
	onDelete, // () => void
	onClearSelection, // () => void
	selectedItem, // PortfolioItem | null
});
```

### **useModalState()** - Gestion des Modales

```typescript
const {
	state: overlayState, // OverlayState
	openOverlay, // (key: OverlayKey) => void
	closeOverlay, // (key: OverlayKey) => void
	tagHubActiveTab, // string
	setTagHubActiveTab, // (tab: string) => void
} = useModalState();
```

### **useItemActions()** - Actions sur les Éléments

```typescript
const {
	addTagsToSelection, // (tags: string[]) => Promise<void>
	applyColorTagToSelection, // (color: string) => Promise<void>
	analyzeItem, // (item: PortfolioItem) => Promise<void>
	moveItemToFolder, // (item: PortfolioItem, folderId: string) => Promise<void>
	createFolderAndMove, // (name: string, items: PortfolioItem[]) => Promise<void>
	handleContextMove, // () => Promise<void>
	handleContextAddTag, // (tag: string) => Promise<void>
} = useItemActions(options);
```

### **useAppHandlers()** - Handlers Principaux

```typescript
const {
	handleDirectoryPicker, // () => Promise<void>
	handleShareSelected, // () => Promise<void>
	handleNext, // () => void
	handlePrev, // () => void
	toggleColorTags, // () => void
} = useAppHandlers(options);
```

### **useSidebarLogic()** - Logique des Sidebars

```typescript
const {
	isSidebarPinned, // boolean
	setIsSidebarPinned, // (pinned: boolean) => void
	handleSidebarToggle, // () => void
} = useSidebarLogic(options);
```

---

## 🎨 Types UI

### **ViewMode** - Modes d'Affichage

```typescript
enum ViewMode {
	GRID = "GRID", // Grille de miniatures
	CAROUSEL = "CAROUSEL", // Carousel cinématique
	LIST = "LIST", // Liste détaillée
}
```

### **SortOption** - Options de Tri

```typescript
type SortOption = "date" | "name" | "size";
type SortDirection = "asc" | "desc";
```

### **COLOR_PALETTE** - Palette de Couleurs

```typescript
const COLOR_PALETTE: Record<string, string> = {
	"1": "#ef4444", // Red
	"2": "#f97316", // Orange
	"3": "#eab308", // Yellow
	"4": "#22c55e", // Green
	"5": "#3b82f6", // Blue
	"6": "#a855f7", // Purple
};
```

---

## 🗄️ Types Database

### **Types Bruts (SQLite)**

```typescript
interface DBMetadata {
	id: string;
	collectionId: string | null;
	virtualFolderId: string | null;
	aiDescription: string | null;
	aiTags: string | null; // JSON string
	aiTagsDetailed: string | null; // JSON string
	colorTag: string | null;
	manualTags: string | null; // JSON string
	isHidden: number; // 0 or 1
	lastModified: number;
}

interface DBVirtualFolder {
	id: string;
	collectionId: string;
	name: string;
	createdAt: number;
	isVirtual: number; // 0 or 1
	sourceFolderId: string | null;
}

interface DBCollection {
	id: string;
	name: string;
	createdAt: number;
	lastOpenedAt: number | null;
	isActive: number; // 0 or 1
}
```

### **Types Parsés (Frontend)**

```typescript
interface ParsedMetadata {
	id: string;
	collectionId: string | null;
	virtualFolderId: string | null;
	folderId?: string | null; // Backward compat
	aiDescription: string | null;
	aiTags: string[]; // Parsed from JSON
	aiTagsDetailed: Array<{ name: string; confidence: number }>;
	colorTag: string | null;
	manualTags: string[]; // Parsed from JSON
	isHidden?: boolean;
	lastModified: number;
}

interface ParsedVirtualFolder {
	id: string;
	collectionId: string;
	name: string;
	createdAt: number;
	isVirtual: boolean; // Converted from number
	sourceFolderId?: string;
	items: PortfolioItem[]; // Populated later
}

interface ParsedCollection {
	id: string;
	name: string;
	createdAt: number;
	lastOpenedAt?: number; // Converted from null
	isActive: boolean; // Converted from number
}
```

---

## 🏷️ Système de Tags

### **Types de Tags**

```typescript
type TagType = "ai" | "manual" | "ai_detailed";

interface DBTag {
	id: string;
	name: string;
	normalizedName: string;
	type: TagType;
	confidence: number | null;
	parentId: string | null;
	createdAt: number;
}

interface ParsedTag {
	id: string;
	name: string;
	type: TagType;
	confidence?: number;
	parentId?: string;
}

interface TagNode extends ParsedTag {
	children: TagNode[];
	count?: number;
}
```

### **Relations Tags-Items**

```typescript
interface DBItemTag {
	itemId: string;
	tagId: string;
	addedAt: number;
}

interface DBTagMerge {
	id: string;
	targetTagId: string;
	sourceTagId: string;
	sourceTagName: string | null;
	mergedAt: number;
	mergedBy: string | null;
	itemIdsJson?: string | null;
}

interface DBTagAlias {
	id: string;
	aliasName: string;
	targetTagId: string;
	createdAt: number;
}
```

---

## 📝 Exemples d'Utilisation

### **Créer une Collection avec Photos**

```typescript
// 1. Créer la collection
const collection = await storageService.createCollection({
	name: "Voyage Italie 2024",
});

// 2. Ajouter un dossier source
await storageService.addFolderToCollection(collection.id, {
	path: "/Users/photos/italie-2024",
	name: "Italie 2024",
});

// 3. Charger les photos
await loadFromPath("/Users/photos/italie-2024");

// 4. Activer la collection
await storageService.setActiveCollection(collection.id);
```

### **Analyser une Photo avec IA**

```typescript
// Ajouter à la file d'attente IA
const { addToQueue } = useBatchAI(updateItem);

// Pour une photo spécifique
const photo = currentItems.find((item) => item.id === "photo-123");
if (photo) {
	addToQueue(photo);
}
```

### **Gérer les Tags**

```typescript
// Ajouter des tags manuels
await storageService.addTagsToItem(photoId, ["vacances", "été", "famille"]);

// Ajouter un tag avec confiance IA
await storageService.getOrCreateTag("paysage", "ai");

// Filtrer par couleur
setActiveColorFilter("#ef4444"); // Rouge
```

---

## 🔍 Recherche et Filtrage

### **Recherche de Tags**

```typescript
// Rechercher des tags par nom
const results = await storageService.searchTags("nat");
// Retourne: ["nature", "natural", "native"]

// Récupérer les items avec un tag
const naturePhotos = await storageService.getItemsWithTag(tagId);
```

### **Groupement Automatique**

```typescript
// Grouper par couleur
const groupedByColor = await storageService.groupItemsByColorTag(items);

// Grouper par tag
const groupedByTag = await storageService.groupItemsByTag(items);

// Obtenir le nom d'une couleur
const colorName = await storageService.getColorName("#ef4444");
// Retourne: "Red"
```

---

## 📚 Références

- **Code source** : `src/shared/types/`
- **Services** : `src/services/storage/`
- **Hooks** : `src/shared/hooks/`
- **Contextes** : `src/shared/contexts/`
