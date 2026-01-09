# 📊 Plan de Décomposition de App.tsx

## 🎯 Objectif

**App.tsx** fait actuellement **682 lignes** et contient trop de responsabilités. Ce plan vise à le décomposer en composants plus petits et maintenables.

---

## 📊 Analyse Actuelle

### Problèmes Identifiés
- **682 lignes** dans un seul fichier
- **25 imports** différents
- **15+ hooks** et contextes
- **8+ modales** et overlays
- **Layout complexe** avec sidebars
- **Gestion d'état** étendue

### Structure Actuelle
```tsx
App.tsx (682 lignes)
├── Imports (25 lignes)
├── Local State (10 lignes)
├── Context Consumption (50 lignes)
├── Custom Hooks (30 lignes)
├── Event Handlers (100 lignes)
├── JSX Layout (200 lignes)
├── Modals (150 lignes)
└── Overlays (50 lignes)
```

---

## 🏗️ Plan de Décomposition en 4 Phases

### **Phase 1: Extraction des Layouts (Priorité Haute)**

#### 1.1 Créer `AppLayout.tsx`
**Fichier**: `src/features/layout/AppLayout.tsx`
**Responsabilité**: Structure JSX principale avec décalages dynamiques

```tsx
interface AppLayoutProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  tagHub: React.ReactNode;
  isFolderDrawerOpen: boolean;
  isSidebarPinned: boolean;
  isTagHubOpen: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  topBar,
  sidebar,
  mainContent,
  tagHub,
  isFolderDrawerOpen,
  isSidebarPinned,
  isTagHubOpen
}) => {
  return (
    <div className="main-app bg-surface h-screen overflow-hidden flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-(--z-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

      {/* TopBar - Always visible */}
      {topBar}

      {/* App Layout: Sidebar + Main Content */}
      <div className={`flex-1 flex flex-row overflow-hidden relative transition-all duration-300 ${
        (isFolderDrawerOpen || isSidebarPinned) ? 'pl-80' : ''
      } ${
        isTagHubOpen ? 'pr-[min(20rem,20vw)]' : ''
      }`}>
        {sidebar}
        {mainContent}
      </div>

      {/* TagHub */}
      {tagHub}
    </div>
  );
};
```

#### 1.2 Créer `MainLayout.tsx`
**Fichier**: `src/features/layout/MainLayout.tsx`
**Responsabilité**: Logique de redimensionnement et transitions

```tsx
interface MainLayoutProps {
  children: React.ReactNode;
  folderDrawer: React.ReactNode;
  isFolderDrawerOpen: boolean;
  isSidebarPinned: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  folderDrawer,
  isFolderDrawerOpen,
  isSidebarPinned
}) => {
  return (
    <>
      {/* Sidebar / Folder Drawer */}
      {folderDrawer}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-full">
        {children}
      </div>
    </>
  );
};
```

---

### **Phase 2: Extraction des Handlers (Priorité Haute)**

#### 2.1 Créer `useAppHandlers.ts`
**Fichier**: `src/shared/hooks/useAppHandlers.ts`
**Responsabilité**: Toutes les fonctions de gestion d'événements

```tsx
interface AppHandlers {
  handleDirectoryPicker: () => Promise<void>;
  handleShareSelected: () => Promise<void>;
  handleRunBatchAI: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  toggleColorTags: () => void;
}

export const useAppHandlers = (): AppHandlers => {
  // Implémentation des handlers
  // Extraite depuis App.tsx lignes ~250-350
};
```

#### 2.2 Créer `useSidebarLogic.ts`
**Fichier**: `src/shared/hooks/useSidebarLogic.ts`
**Responsabilité**: Logique spécifique aux sidebars

```tsx
interface SidebarLogic {
  isSidebarPinned: boolean;
  setIsSidebarPinned: (value: boolean) => void;
  handleSidebarToggle: () => void;
}

export const useSidebarLogic = (): SidebarLogic => {
  // Logique de toggle des sidebars
  // Extraite depuis App.tsx lignes ~414-425
};
```

---

### **Phase 3: Extraction des Modales (Priorité Moyenne)**

#### 3.1 Créer `AppModals.tsx`
**Fichier**: `src/features/modals/AppModals.tsx`
**Responsabilité**: Toutes les modales centralisées

```tsx
interface AppModalsProps {
  isCollectionManagerOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isMoveModalOpen: boolean;
  isAddTagModalOpen: boolean;
  isSettingsOpen: boolean;
  isShortcutsHelpOpen: boolean;
  // ... autres props et handlers
}

export const AppModals: React.FC<AppModalsProps> = (props) => {
  return (
    <>
      <CollectionManager {...props} />
      <CreateFolderModal {...props} />
      <MoveToFolderModal {...props} />
      <AddTagModal {...props} />
      <SettingsModal {...props} />
      <KeyboardShortcutsHelp {...props} />
    </>
  );
};
```

#### 3.2 Créer `AppOverlays.tsx`
**Fichier**: `src/features/overlays/AppOverlays.tsx`
**Responsabilité**: ContextMenu, ImageViewer, LoadingOverlay

```tsx
interface AppOverlaysProps {
  contextMenu: ContextMenuState;
  selectedItem: PortfolioItem | null;
  // ... autres props
}

export const AppOverlays: React.FC<AppOverlaysProps> = (props) => {
  return (
    <>
      <LoadingOverlay />
      <ContextMenu {...props} />
      <ImageViewer {...props} />
    </>
  );
};
```

---

### **Phase 4: Refactor Final (Priorité Basse)**

#### 4.1 Créer `AppProvider.tsx`
**Fichier**: `src/shared/providers/AppProvider.tsx`
**Responsabilité**: Combine tous les contextes et hooks

```tsx
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CollectionsProvider>
      <LibraryProvider>
        <SelectionProvider>
          {children}
        </SelectionProvider>
      </LibraryProvider>
    </CollectionsProvider>
  );
};
```

#### 4.2 Simplifier `App.tsx`
**Fichier**: `src/App.tsx` (réduit à ~50 lignes)

```tsx
const App: React.FC = () => {
  const handlers = useAppHandlers();
  const sidebarLogic = useSidebarLogic();
  const { contextMenu, selectedItem } = useAppState();

  const topBar = (
    <TopBar
      folderName={activeFolderName}
      onOpenFolders={sidebarLogic.handleSidebarToggle}
      onMoveSelected={() => setIsMoveModalOpen(true)}
      onShareSelected={handlers.handleShareSelected}
      // ... autres props
    />
  );

  const sidebar = (
    <FolderDrawer
      isOpen={isFolderDrawerOpen || sidebarLogic.isSidebarPinned}
      onClose={sidebarLogic.handleSidebarClose}
      // ... autres props
    />
  );

  const mainContent = (
    <MainLayout folderDrawer={sidebar}>
      <ErrorBoundary featureName="library">
        <main className="flex-1 relative z-(--z-grid-item) overflow-y-auto custom-scrollbar h-full">
          <ViewRenderer />
        </main>
      </ErrorBoundary>
    </MainLayout>
  );

  const tagHub = (
    <TagHub
      isOpen={isTagHubOpen}
      onClose={() => setIsTagHubOpen(false)}
      // ... autres props
    />
  );

  return (
    <AppProvider>
      <AppLayout
        topBar={topBar}
        sidebar={sidebar}
        mainContent={mainContent}
        tagHub={tagHub}
        isFolderDrawerOpen={isFolderDrawerOpen}
        isSidebarPinned={sidebarLogic.isSidebarPinned}
        isTagHubOpen={isTagHubOpen}
      />
      <AppModals />
      <AppOverlays />
    </AppProvider>
  );
};
```

---

## 📁 Structure des Fichiers Finale

```
src/
├── App.tsx (50 lignes)
├── features/
│   ├── layout/
│   │   ├── AppLayout.tsx (~80 lignes)
│   │   ├── MainLayout.tsx (~40 lignes)
│   │   └── index.ts
│   ├── modals/
│   │   ├── AppModals.tsx (~60 lignes)
│   │   └── index.ts
│   └── overlays/
│       ├── AppOverlays.tsx (~50 lignes)
│       └── index.ts
├── shared/
│   ├── hooks/
│   │   ├── useAppHandlers.ts (~100 lignes)
│   │   ├── useSidebarLogic.ts (~30 lignes)
│   │   └── index.ts
│   └── providers/
│       ├── AppProvider.tsx (~20 lignes)
│       └── index.ts
```

---

## 🎯 Bénéfices Attendus

### Avantages
- ✅ **App.tsx** : 682 → 50 lignes (-92%)
- ✅ **Maintenabilité** : Chaque fichier a une responsabilité unique
- ✅ **Testabilité** : Hooks et composants isolés
- ✅ **Réutilisabilité** : Layouts réutilisables
- ✅ **Performance** : Lazy loading possible
- ✅ **Lisibilité** : Code plus clair et organisé

### Migration
- 🔄 **Progressive** : Phase par phase sans casser l'app
- 🔄 **Backward compatible** : Tests existants fonctionnent
- 🔄 **Incremental** : Chaque phase apporte des bénéfices

---

## 🚀 Plan d'Action

### Semaine 1: Phase 1 (Layouts)
- [ ] Créer `src/features/layout/AppLayout.tsx`
- [ ] Créer `src/features/layout/MainLayout.tsx`
- [ ] Extraire la structure JSX de App.tsx
- [ ] Tester et valider

### Semaine 2: Phase 2 (Handlers)
- [ ] Créer `src/shared/hooks/useAppHandlers.ts`
- [ ] Créer `src/shared/hooks/useSidebarLogic.ts`
- [ ] Extraire les handlers de App.tsx
- [ ] Tester et valider

### Semaine 3: Phase 3 (Modales)
- [ ] Créer `src/features/modals/AppModals.tsx`
- [ ] Créer `src/features/overlays/AppOverlays.tsx`
- [ ] Extraire les modales et overlays
- [ ] Tester et valider

### Semaine 4: Phase 4 (Finalisation)
- [ ] Créer `src/shared/providers/AppProvider.tsx`
- [ ] Simplifier App.tsx final
- [ ] Nettoyage et optimisation
- [ ] Documentation finale

---

## 📊 Métriques de Succès

### Avant
- **App.tsx**: 682 lignes
- **Complexité**: Élevée
- **Maintenabilité**: Difficile
- **Testabilité**: Limitée

### Après
- **App.tsx**: 50 lignes
- **Complexité**: Faible
- **Maintenabilité**: Facile
- **Testabilité**: Complète

---

## 🔍 Checklist de Validation

Pour chaque phase:
- [ ] **Tests passent**: Aucune régression
- [ ] **TypeScript compile**: Pas d'erreurs
- [ ] **Performance stable**: Pas de régression
- [ ] **Code review**: Approuvé par l'équipe
- [ ] **Documentation**: Mise à jour

---

*Créé le 8 janvier 2026*
*Dernière mise à jour: 8 janvier 2026*
