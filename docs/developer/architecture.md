# 🏗️ Architecture - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/App.tsx` (v0.3.0-beta.1)

---

## 📋 Vue d'Ensemble

Lumina Portfolio est une application desktop de photo gallery construite avec React + Tauri. L'architecture est organisée en couches modulaires avec une séparation claire des responsabilités.

### **Composant Principal**

- **`App.tsx`** : Point d'entrée unique (535 lignes après refactoring)
- **Orchestration** : Coordination de tous les modules et contextes
- **Refactoring** : Réduit de 682 lignes à structure modulaire (janvier 2026)

---

## 🏛️ Structure Architecturale

### **1. Couche Présentation (UI)**

```typescript
// Composants principaux
-AppShell - // Layout principal
	TopBar - // Barre de navigation supérieure
	FolderDrawer - // Panneau latéral des collections
	ViewRenderer - // Rendu des vues (grille/carousel)
	TagHub - // Panneau de gestion des tags
	ModalHost; // Hôte pour toutes les modales
```

### **2. Couche État (State Management)**

```typescript
// Contextes React - Gestion centralisée
-useCollections() - // Collections et dossiers sources
	useLibrary() - // Médiathèque (fichiers, dossiers, tags)
	useSelection(); // Sélection multiple et drag-select
```

### **3. Couche Services (Business Logic)**

```typescript
// Services externes
-storageService - // Persistance des données
	geminiService - // Analyse d'images (IA)
	libraryLoader - // Chargement des dossiers
	secureStorage; // Stockage sécurisé (API keys)
```

### **4. Couche Hooks (Custom Hooks)**

```typescript
// Hooks personnalisés
-useBatchAI() - // Traitement IA par lots
	useKeyboardShortcuts() - // Raccourcis clavier
	useModalState() - // Gestion des modales
	useItemActions() - // Actions sur les éléments
	useAppHandlers() - // Handlers principaux
	useSidebarLogic(); // Logique des sidebars
```

---

## 🔄 Flux de Données

### **Architecture Unidirectionnelle**

```
User Action → Custom Hook → Context → Service → Database
                ↓
            UI Update ← State Change ← Response
```

### **Exemple : Sélection d'une Photo**

```typescript
// 1. Action utilisateur
setSelectedItem(photo)

// 2. Hook personnalisé
useSelection() {
  selectedIds, setSelectedIds
}

// 3. Contexte global
SelectionContext {
  selectionMode, selectedIds, clearSelection
}

// 4. Service si nécessaire
storageService.updateItemMetadata(photo)
```

---

## 🎯 Patterns Architecturaux

### **1. Feature-Based Architecture**

```
src/
├── features/
│   ├── collections/     # Gestion des collections
│   ├── library/         # Médiathèque et vues
│   ├── navigation/      # Navigation et topbar
│   ├── tags/           # Système de tags
│   ├── overlays/       # Modales et overlays
│   └── layout/         # Layouts réutilisables
```

### **2. Context Split Pattern**

```typescript
// Séparation état/dispatch pour performance
const CollectionsContext = createContext();
const CollectionsDispatchContext = createContext();

// Utilisation
const collections = useCollections();
const dispatch = useCollectionsDispatch();
```

### **3. Custom Hooks Pattern**

```typescript
// Encapsulation de la logique complexe
const useAppHandlers = ({
	activeCollection,
	sourceFolders,
	addToQueue,
	// ... dépendances
}) => {
	return {
		handleDirectoryPicker,
		handleShareSelected,
		handleNext,
		handlePrev,
	};
};
```

---

## 🔧 Composants Clés

### **AppShell**

```typescript
interface AppShellProps {
	topBar: ReactNode;
	sidebar: ReactNode;
	mainContent: ReactNode;
	tagHub: ReactNode;
	isSidebarExpanded: boolean;
	isTagHubOpen: boolean;
}
```

### **ModalHost**

```typescript
// Gestion centralisée de toutes les modales
- Context menu
- Image viewer
- Batch tag panel
- Settings modal
- Collection manager
```

### **ViewRenderer**

```typescript
// Rendu conditionnel selon le mode
- Grid view (avec virtualization)
- Carousel view (cinématique)
- Empty states
```

---

## 🗄️ Gestion de l'État

### **État Local vs Global**

```typescript
// État local (App.tsx)
const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
const [focusedId, setFocusedId] = useState<string | null>(null);

// État global (Contextes)
const { collections, activeCollection } = useCollections();
const { folders, currentItems } = useLibrary();
const { selectedIds, selectionMode } = useSelection();
```

### **Synchronisation des États**

```typescript
// Wrapper pour maintenir selectedItem synchronisé
const updateItems = (items: PortfolioItem[]) => {
	libraryUpdateItems(items);
	setSelectedItem((prev) => {
		if (!prev) return null;
		const updated = items.find((i) => i.id === prev.id);
		return updated || prev;
	});
};
```

---

## 🎨 UI Architecture

### **Layout System**

```typescript
// AppShell gère les offsets dynamiques
- TopBar : position absolue, z-40
- Sidebar : position fixe, overlay
- Main : flex-1 avec padding pour TopBar
- TagHub : panneau latéral droit
```

### **Responsive Design**

```typescript
// Mobile-first avec Tailwind CSS
- Grid responsive pour photo galleries
- Virtual scrolling pour grandes collections
- Touch interactions pour mobile/tablet
```

---

## 🔌 Intégrations Externes

### **Tauri (Backend Rust)**

```typescript
// Plugins Tauri utilisés
- @tauri-apps/plugin-sql      // Base de données SQLite
- @tauri-apps/plugin-fs       // Système de fichiers
- @tauri-apps/plugin-dialog   // Dialogues système
- @tauri-apps/plugin-os       // Informations système
```

### **Gemini AI (Google)**

```typescript
// Service d'analyse d'images
- geminiService.analyzeImage()
- geminiService.batchAnalyze()
- Tag generation et description
```

---

## 🚀 Performance

### **Optimisations Implémentées**

```typescript
// React.memo pour composants coûteux
- ViewRenderer, FolderDrawer, TagHub

// Virtualization pour grandes listes
- @tanstack/react-virtual pour photo grids

// Lazy loading
- Images avec Intersection Observer
- Composants avec React.lazy()

// Batch operations
- Traitement IA par lots
- Mises à jour groupées
```

---

## 🧪 Testing Architecture

### **Structure des Tests**

```
tests/
├── App.test.tsx              # Tests du composant principal
├── shared/
│   ├── components/           # Tests composants UI
│   └── utils/               # Tests utilitaires
└── e2e/
    └── basic.spec.ts        # Tests end-to-end
```

### **Outils de Testing**

- **Vitest** : Tests unitaires
- **React Testing Library** : Tests composants
- **Playwright** : Tests E2E
- **MSW** : Mocking des services

---

## 📊 Métriques

### **Complexité**

- **App.tsx** : 535 lignes (après refactoring)
- **Features** : 5 modules principaux
- **Contextes** : 3 contextes React
- **Hooks** : 6+ hooks personnalisés

### **Performance**

- **Bundle size** : Optimisé avec lazy loading
- **Memory** : Virtualization pour 1000+ photos
- **CPU** : Batch AI processing

---

## 🔮 Évolutions Futures

### **Architecture Scalable**

- **Modularité** : Chaque feature est indépendante
- **Extensibilité** : Facile d'ajouter de nouvelles features
- **Maintenabilité** : Séparation claire des responsabilités

### **Prochaines Améliorations**

- **Server-side rendering** : Pour les futures versions web
- **Web Workers** : Pour le traitement IA intensif
- **Cache avancé** : Pour les performances offline

---

## 📚 Références

- **Code source** : `src/App.tsx`
- **Types** : `src/shared/types/`
- **Services** : `src/services/`
- **Composants** : `src/shared/components/`
- **Features** : `src/features/`
