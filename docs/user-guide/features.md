# 🎯 Fonctionnalités - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026

---

## 📋 Vue d'Ensemble

Lumina Portfolio offre un ensemble complet de fonctionnalités pour organiser, analyser et explorer vos photos avec l'aide de l'intelligence artificielle.

---

## 🤖 Intelligence Artificielle

### **Analyse d'Images avec Gemini**

#### **Description Automatique**

```typescript
// Analyse d'une image
const analysis = await geminiService.analyzeImage(imageBuffer);
// Résultat : {
//   description: "Un magnifique coucher de soleil sur une plage avec des vagues douces",
//   tags: ["coucher", "soleil", "plage", "océan", "orange", "nature"],
//   confidence: [0.95, 0.87, 0.92, 0.78, 0.89, 0.85]
// }
```

#### **Tags Intelligents**

- **Tags descriptifs** : Objets, scènes, concepts
- **Tags émotionnels** : Ambiance, mood
- **Tags techniques** : Composition, lumière
- **Scores de confiance** : Fiabilité de chaque tag

#### **Batch Processing**

```typescript
// Traitement par lots optimisé
const { addToQueue, processingQueue, progress } = useBatchAI();

// Ajouter plusieurs photos à la file
selectedPhotos.forEach((photo) => addToQueue(photo));

// Suivi de progression
console.log(`Progression: ${Math.round(progress * 100)}%`);
```

### **Configuration IA**

```typescript
// Settings IA
interface AISettings {
	apiKey: string; // Clé API Gemini
	batchSize: number; // Taille des lots (défaut: 5)
	confidence: number; // Seuil de confiance (défaut: 0.7)
	autoAnalyze: boolean; // Analyse automatique à l'import
}
```

---

## 🏷️ Système de Tags Avancé

### **Types de Tags**

#### **🤖 Tags IA**

- **Générés automatiquement** par analyse d'image
- **Confidence scores** : 0.0 à 1.0
- **Normalisés** : Lowercase, sans accents
- **Hiérarchiques** : Tags parents/enfants possibles

#### **✏️ Tags Manuels**

- **Personnalisés** : Vos propres tags
- **Flexibles** : Organisation selon vos besoins
- **Searchables** : Recherche instantanée
- **Batch operations** : Ajout/suppression en lot

#### **🎨 Color Tags**

- **6 couleurs prédéfinies** : Rouge, orange, jaune, vert, bleu, violet
- **Classification visuelle** : Basée sur les couleurs dominantes
- **Filtre rapide** : Voir toutes les photos d'une couleur
- **Combinaison** : Possible avec d'autres tags

### **Gestion des Tags**

#### **Tag Hub Central**

```typescript
<TagHub tabs={["browse", "manage", "fusion", "settings"]} onTagsUpdated={refreshMetadata} />
```

#### **Fusion Intelligente**

```typescript
// Fusion automatique de tags similaires
const mergeResult = await tagService.mergeTags({
	sourceTag: "coucher de soleil",
	targetTag: "coucher",
	strategy: "auto", // auto, manual, confidence
});
```

#### **Alias et Synonymes**

```typescript
// Créer des alias pour les tags
await tagService.createAlias({
	aliasName: "sunset",
	targetTag: "coucher",
});
```

---

## 📁 Collections et Dossiers

### **Collections**

```typescript
interface Collection {
	id: string;
	name: string;
	createdAt: number;
	lastOpenedAt?: number;
	isActive: boolean;
}
```

#### **Création et Gestion**

- **Collections illimitées** : Organisez par projets, années, thèmes
- **Dossiers sources** : Liez des dossiers physiques
- **Dossiers virtuels** : Créez des organisations logiques
- **Shadow folders** : Miroirs automatiques des dossiers sources

#### **Workflow Typique**

```typescript
// 1. Créer une collection
const collection = await storageService.createCollection({
	name: "Voyage Italie 2024",
});

// 2. Ajouter des dossiers sources
await storageService.addFolderToCollection(collection.id, {
	path: "/Users/photos/italie-2024",
	name: "Italie 2024",
});

// 3. Les shadow folders sont créés automatiquement
const shadowFolders = await storageService.getShadowFoldersWithSources(collection.id);
```

### **Dossiers Virtuels**

#### **Types de Dossiers**

```typescript
interface VirtualFolder {
	id: string;
	collectionId: string;
	name: string;
	isVirtual: boolean;
	sourceFolderId?: string;
}
```

#### **Organisations Possibles**

- **Par tags** : Dossier automatique pour chaque tag
- **Par couleur** : Dossiers par color tag
- **Par date** : Dossiers mensuels/annuels
- **Personnalisés** : Vos propres organisations

---

## 🔍 Recherche et Filtrage

### **Recherche Multicritères**

#### **Recherche Texte**

```typescript
// Recherche dans les noms, descriptions, tags
const results = await searchService.search({
	query: "vacances plage",
	fields: ["name", "description", "tags"],
	fuzzy: true,
});
```

#### **Filtres Avancés**

```typescript
// Combinaison de filtres
const filteredItems = await filterService.apply({
	tags: ["vacances", "été"],
	colorTag: "#ef4444",
	dateRange: {
		start: new Date("2024-06-01"),
		end: new Date("2024-08-31"),
	},
	confidence: 0.8,
});
```

### **Smart Collections**

```typescript
// Collections dynamiques basées sur des filtres
const smartCollection = {
	name: "Photos de vacances 2024",
	filters: [
		{ type: "tag", value: "vacances" },
		{ type: "date", operator: "between", start: "2024-01-01", end: "2024-12-31" },
	],
	autoUpdate: true,
};
```

---

## 🖼️ Visualisation et Navigation

### **Modes d'Affichage**

#### **📱 Grid View**

- **Virtualisation** : Performant pour 1000+ photos
- **Taille variable** : Petites, moyennes, grandes miniatures
- **Sélection multiple** : Clic, shift+clic, cmd+clic
- **Drag-select** : Sélection par glissement de rectangle

#### **🎠 Carousel View**

- **Navigation fluide** : Transitions animées entre photos
- **Mode cinématique** : Plein écran avec contrôles minimalistes
- **Informations overlay** : Métadonnées et tags
- **Keyboard navigation** : Flèches, espace, escape

#### **📋 List View**

- **Détails complets** : Nom, taille, dimensions, date
- **Tri multiple** : Par date, nom, taille, type
- **Compact** : Maximum d'informations visibles

### **Navigation Intuitive**

#### **Keyboard Shortcuts**

```typescript
// Navigation principale
Ctrl/Cmd + T    // Ouvrir Tag Hub
Ctrl/Cmd + F    // Focus recherche
Ctrl/Cmd + A    // Tout sélectionner
→ ←            // Photo suivante/précédente
Space          // Mode plein écran
Esc            // Fermer modales/plein écran
```

#### **Gestures Touch**

- **Swipe** : Navigation entre photos
- **Pinch-to-zoom** : Zoom sur les photos
- **Tap** : Sélection rapide
- **Long press** : Menu contextuel

---

## 📤 Import et Export

### **Import de Photos**

#### **Dossiers Sources**

```typescript
// Import d'un dossier complet
const importResult = await libraryLoader.loadDirectory({
	path: "/Users/photos/vacances",
	options: {
		recursive: true, // Inclure sous-dossiers
		analyzeOnImport: true, // Analyse IA automatique
		generateThumbnails: true, // Créer miniatures
	},
});
```

#### **Fichiers Individuels**

```typescript
// Import de fichiers sélectionnés
const files = document.getElementById("fileInput").files;
await libraryLoader.importFiles(files);
```

### **Export et Partage**

#### **Export Sélectionné**

```typescript
// Exporter les photos sélectionnées
const exportOptions = {
	format: "original", // original, compressed, web
	includeMetadata: true, // Inclure les métadonnées
	folderStructure: "flat", // flat, byDate, byTag
};

await exportService.export(selectedPhotos, exportOptions);
```

#### **Partage Rapide**

```typescript
// Partager via système
await shareService.share({
	items: selectedPhotos,
	method: "system", // system, link, file
});
```

---

## ⚙️ Personnalisation

### **Thèmes et Apparence**

#### **Dark/Light Theme**

```typescript
// Changement de thème
const theme = {
	dark: {
		background: "#0a0a0a",
		surface: "#121212",
		text: "#ffffff",
	},
	light: {
		background: "#ffffff",
		surface: "#f8fafc",
		text: "#1f2937",
	},
};
```

#### **Personnalisation Avancée**

- **Taille des miniatures** : 3 tailles prédéfinies
- **Qualité d'aperçu** : Optimisée vs Haute qualité
- **Animations** : Activées/désactivées
- **Layout** : Largeur de sidebar, position des panels

### **Préférences Utilisateur**

```typescript
interface UserPreferences {
	language: "fr" | "en";
	theme: "dark" | "light";
	thumbnailSize: "small" | "medium" | "large";
	autoAnalyze: boolean;
	confidence: number;
	animations: boolean;
	sidebarWidth: number;
}
```

---

## 🔧 Outils et Utilitaires

### **Métadonnées EXIF**

```typescript
// Lecture des métadonnées EXIF
const exifData = await exifService.readExif(photoPath);
// Résultat : {
//   camera: "Canon EOS R5",
//   lens: "RF 24-70mm f/2.8L",
//   settings: { iso: 400, aperture: 2.8, shutter: 1/250 },
//   gps: { latitude: 43.2965, longitude: 5.3698 }
// }
```

### **Dimensions et Informations**

```typescript
// Commande Tauri pour les dimensions
const dimensions = await get_image_dimensions(photoPath);
// Résultat : { width: 6000, height: 4000, size: 24576000 }
```

### **Validation et Nettoyage**

```typescript
// Nettoyage automatique des tags
const cleanupResult = await tagService.cleanup({
	removeDuplicates: true,
	mergeSimilar: true,
	removeUnused: true,
	confidence: 0.5,
});
```

---

## 📊 Statistiques et Rapports

### **Statistiques de Collection**

```typescript
const stats = await statsService.getCollectionStats(collectionId);
// Résultat : {
//   totalPhotos: 1250,
//   totalSize: "2.4 GB",
//   topTags: ["vacances", "été", "plage"],
//   colorDistribution: { red: 120, blue: 340, green: 180 },
//   dateRange: { start: "2024-06-01", end: "2024-08-31" }
// }
```

### **Rapports d'Utilisation**

```typescript
// Rapport d'activité
const report = await statsService.generateReport({
	period: "month",
	type: "usage",
	metrics: ["imports", "analysis", "exports"],
});
```

---

## 🎯 Workflows Recommandés

### **Workflow 1 : Nouvelle Collection**

1. **Créer la collection** avec un nom descriptif
2. **Importer les photos** depuis les dossiers sources
3. **Lancer l'analyse IA** sur les nouvelles photos
4. **Organiser avec des tags** manuels si nécessaire
5. **Créer des dossiers virtuels** par thème

### **Workflow 2 : Organisation par Tags**

1. **Analyser toutes les photos** avec IA
2. **Fusionner les tags similaires** dans le Tag Hub
3. **Créer des alias** pour les synonymes
4. **Organiser les photos** par tags dans les dossiers virtuels
5. **Appliquer des color tags** pour classification visuelle

### **Workflow 3 : Recherche Avancée**

1. **Utiliser la recherche** pour trouver des photos spécifiques
2. **Combiner les filtres** : tags + couleur + date
3. **Créer une smart collection** pour les recherches fréquentes
4. **Exporter les résultats** pour partage ou sauvegarde

---

## 📚 Références

- **[Interface Guide](./interface.md)** : Guide complet de l'interface
- **[Keyboard Shortcuts](./keyboard-shortcuts.md)** : Raccourcis clavier
- **[Developer API](../developer/api.md)** : Référence technique

---

## 🚀 Prochaines Fonctionnalités

### **En Développement**

- **Smart Collections** : Collections dynamiques basées sur des filtres
- **Face Recognition** : Reconnaissance faciale pour taguer les personnes
- **Duplicate Detection** : Détection automatique des doublons
- **Advanced Search** : Recherche par similarité d'image

### **Futures**

- **Cloud Sync** : Synchronisation optionnelle avec le cloud
- **Mobile App** : Version mobile companion
- **Web Interface** : Accès web aux collections
- **AI Enhanced** : Plus de modèles IA et fonctionnalités

---

**Explorez toutes ces fonctionnalités et transformez votre gestion de photos ! 🎉**
