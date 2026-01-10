# 🖥️ Interface Utilisateur - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

L'interface de Lumina Portfolio est conçue pour être intuitive et efficace, avec une organisation en trois zones principales : la barre supérieure, la barre latérale et la zone de contenu principale.

---

## 🏗️ Structure de l'Interface

```
┌─────────────────────────────────────────────────────────┐
│                    TopBar                                  │
│  🔍 [Search]    📁 Collections    ⚙️ Settings      │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │            Main Content                  │
│             │                                           │
│ 📁 Vacation │    🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️    │
│ 📁 Nature   │    🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️    │
│ 📁 Family   │    🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️    │
│ 🏷️ Tags    │    🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️ 🖼️    │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
```

---

## 🎯 TopBar - Barre Supérieure

### **Composants Principaux**

- **🔍 Barre de recherche** : Recherche rapide de photos
- **📁 Nom du dossier actuel** : Navigation contextuelle
- **⚙️ Actions rapides** : Partager, analyser IA, paramètres
- **🎨 Contrôles d'affichage** : Mode grille/carousel, filtres

### **Fonctionnalités**

```typescript
// Recherche de photos
<SearchInput placeholder="Search photos..." />

// Actions rapides
<Button icon={<Share />} onClick={handleShare}>
  Share Selected
</Button>

// Mode d'affichage
<ViewModeSelector
  modes={['GRID', 'CAROUSEL', 'LIST']}
  currentMode={viewMode}
  onModeChange={setViewMode}
/>
```

---

## 📂 Sidebar - Barre Latérale

### **Sections Principales**

#### **1. Collections**

- **📁 Collections actives** : Vos projets photo
- **➕ New Collection** : Créer une nouvelle collection
- **📊 Statistiques** : Nombre de photos par collection

#### **2. Dossiers Virtuels**

- **📂 All Photos** : Vue globale de toutes les photos
- **🏷️ Tags** : Dossiers organisés par tags
- **🎨 Colors** : Dossiers par couleur de tag
- **⭐ Favorites** : Photos favorites

#### **3. Gestion**

- **📥 Import Folder** : Ajouter un dossier source
- **🗂️ Manage Collections** : Gérer les collections
- **⚙️ Settings** : Paramètres de l'application

### **Interaction**

```typescript
// Sélection d'une collection
<CollectionItem
  collection={collection}
  isActive={collection.id === activeCollection?.id}
  onClick={() => switchCollection(collection.id)}
/>

// Dossier virtuel
<VirtualFolder
  folder={folder}
  itemCount={folder.items.length}
  onSelect={() => loadFolder(folder.id)}
/>
```

---

## 🖼️ Main Content - Zone Principale

### **Modes d'Affichage**

#### **📱 Grid View (Grille)**

- **Miniatures** : Aperçu des photos en grille
- **Virtualisation** : Performant pour 1000+ photos
- **Sélection** : Clic simple, multi-sélection avec Cmd/Ctrl
- **Drag-select** : Sélection par glissement

#### **🎠 Carousel View (Carrousel)**

- **Navigation** : Flèches et clavier pour naviguer
- **Mode cinématique** : Plein écran avec transitions fluides
- **Informations** : Métadonnées et tags visibles
- **Actions** : Analyser IA, tagger, partager

#### **📋 List View (Liste)**

- **Détails** : Nom, taille, date, dimensions
- **Tri** : Par date, nom, taille
- **Filtrage** : Par tags, couleur, date

### **Interactions**

```typescript
// Grille de photos
<PhotoGrid
  items={currentItems}
  selectedIds={selectedIds}
  onSelect={setSelectedIds}
  onContextMenu={handleContextMenu}
  viewMode="GRID"
/>

// Mode carousel
<PhotoCarousel
  items={currentItems}
  currentIndex={currentIndex}
  onNext={handleNext}
  onPrev={handlePrev}
  cinematic={useCinematicCarousel}
/>
```

---

## 🏷️ Système de Tags

### **Tags sur les Photos**

Chaque photo peut avoir plusieurs types de tags :

#### **🤖 Tags IA**

- **Générés automatiquement** par analyse d'image
- **Score de confiance** : Fiabilité de chaque tag
- **Exemples** : "paysage", "coucher de soleil", "plage"

#### **✏️ Tags Manuels**

- **Ajoutés par l'utilisateur**
- **Personnalisés** : Vos propres tags
- **Exemples** : "vacances", "famille", "projet"

#### **🎨 Color Tags**

- **Classification visuelle** par couleur dominante
- **6 couleurs** : Rouge, orange, jaune, vert, bleu, violet
- **Filtre rapide** : Voir toutes les photos d'une couleur

### **Interface des Tags**

```typescript
// Tags sur une photo
<TagCloud
  tags={photo.aiTags}
  manualTags={photo.manualTags}
  colorTag={photo.colorTag}
  onAddTag={addTag}
  onRemoveTag={removeTag}
/>

// Filtre par tags
<TagFilter
  availableTags={availableTags}
  selectedTags={selectedTags}
  onTagToggle={toggleTagFilter}
/>
```

---

## 🎛️ Panneau de Contrôle

### **Actions Rapides**

- **🤖 Analyser avec IA** : Analyse des photos sélectionnées
- **📤 Partager** : Exporter ou partager les sélections
- **🏷️ Ajouter Tags** : Ajouter des tags en lot
- **🎨 Color Tag** : Appliquer une couleur aux sélections

### **Filtres**

- **🔍 Recherche** : Texte libre
- **🏷️ Tags** : Multi-sélection de tags
- **🎨 Couleurs** : Filtre par couleur de tag
- **📅 Date** : Filtrage par période

---

## ⚙️ Modales et Overlays

### **📝 Settings Modal**

```typescript
<SettingsModal
	isOpen={isSettingsOpen}
	onClose={() => setIsSettingsOpen(false)}
	sections={[
		"general", // Langue, thème
		"ai", // Configuration IA
		"storage", // Base de données
		"advanced", // Options avancées
	]}
/>
```

### **🏷️ Tag Hub**

```typescript
<TagHub
	isOpen={isTagHubOpen}
	onClose={() => setIsTagHubOpen(false)}
	tabs={["browse", "manage", "fusion", "settings"]}
	onTagsUpdated={refreshTags}
/>
```

### **📁 Collection Manager**

```typescript
<CollectionManager
	isOpen={isCollectionManagerOpen}
	onClose={() => setIsCollectionManagerOpen(false)}
	collections={collections}
	onCreate={createCollection}
	onDelete={deleteCollection}
	onSwitch={switchCollection}
/>
```

---

## 🎨 Design et Animations

### **Glass Morphism**

- **Arrière-plans translucides** avec backdrop-blur
- **Bordures subtiles** pour la profondeur
- **Effet de surbrillance** au survol

### **Animations Fluides**

```typescript
// Transitions de page
<AnimatePresence mode="wait">
  <motion.div
    key={viewMode}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <ViewRenderer viewMode={viewMode} />
  </motion.div>
</AnimatePresence>

// Micro-interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  <Button>Click me</Button>
</motion.button>
```

---

## ⌨️ Raccourcis Clavier

### **Navigation**

- **`Ctrl/Cmd + T`** : Ouvrir le Tag Hub
- **`Ctrl/Cmd + F`** : Focus sur la recherche
- **`Ctrl/Cmd + ,`** : Ouvrir les paramètres
- **`Esc`** : Fermer les modales

### **Sélection**

- **`Ctrl/Cmd + A`** : Tout sélectionner
- **`Ctrl/Cmd + C`** : Copier les sélections
- **`Ctrl/Cmd + V`** : Coller
- **`Shift + Clic`** : Sélection continue
- **`Ctrl/Cmd + Clic`** : Sélection multiple

### **Navigation Photos**

- **`→`** : Photo suivante
- **`←`** : Photo précédente
- **`Space`** : Mode plein écran
- **`Enter`** : Ouvrir la photo sélectionnée

---

## 📱 Responsive Design

### **Desktop (1024px+)**

- **Layout complet** avec sidebar et TopBar
- **Grille optimisée** pour grand écran
- **Panels latéraux** pour Tag Hub et collections

### **Tablet (768px-1024px)**

- **Sidebar repliable** pour plus d'espace
- **Grille adaptative** 2-3 colonnes
- **Touch interactions** optimisées

### **Mobile (<768px)**

- **Interface simplifiée** avec menu hamburger
- **Grille 1-2 colonnes**
- **Gestures** pour navigation

---

## 🔧 Personnalisation

### **Thèmes**

```typescript
// Dark theme (par défaut)
const darkTheme = {
	background: "#0a0a0a",
	surface: "#121212",
	text: "#ffffff",
	primary: "#3b82f6",
};

// Light theme
const lightTheme = {
	background: "#ffffff",
	surface: "#f8fafc",
	text: "#1f2937",
	primary: "#3b82f6",
};
```

### **Préférences**

- **Langue** : Français, Anglais
- **Taille des miniatures** : Petite, moyenne, grande
- **Qualité des aperçus** : Optimisée vs Haute qualité
- **Animations** : Activées/désactivées

---

## 🎯 Bonnes Pratiques d'Utilisation

### **Organisation Efficace**

1. **Créez des collections** par projet/thème
2. **Utilisez des tags** descriptifs
3. **Appliquez des couleurs** pour 分类 visuelle
4. **Favorisez les dossiers virtuels** vs physiques

### **Recherche Rapide**

1. **Utilisez la barre de recherche** pour trouver rapidement
2. **Combinez les filtres** : tags + couleur + date
3. **Enregistrez les recherches** fréquentes

### **Performance**

1. **Limitez les collections** à 10K photos maximum
2. **Utilisez les dossiers virtuels** pour organiser
3. **Nettoyez régulièrement** les tags inutilisés

---

## 📚 Références

- **[Fonctionnalités](./features.md)** : Guide détaillé des fonctionnalités
- **[Raccourcis](./keyboard-shortcuts.md)** : Liste complète des raccourcis
- **[Developer Setup](../developer/setup.md)** : Configuration avancée

---

## 🆘 Support

### **Problèmes Courants**

- **Interface lente** : Vérifiez la taille de la collection
- **Photos non visibles** : Vérifiez les permissions du dossier
- **Tags IA manquants** : Configurez votre clé API Gemini

### **Aide**

- **Documentation complète** : [docs/](../)
- **GitHub Issues** : [Signaler un problème](https://github.com/groovybronx/portf84/issues)
- **Discussions** : [Poser une question](https://github.com/groovybronx/portf84/discussions)

---

**Explorez Lumina Portfolio et organisez vos photos comme jamais auparavant ! 🎉**
