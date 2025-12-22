# Composants UI & UX

L'interface repose sur une séparation stricte entre les composants de présentation ("Dumb Components") et le conteneur logique (`App.tsx`).

## Architecture Générale

```
components/
├── PhotoGrid.tsx       # Vue grille avec masonry
├── PhotoCarousel.tsx   # Vue carrousel 3D
├── PhotoList.tsx       # Vue liste détaillée
├── PhotoCard.tsx       # Vignette interactive (flip)
├── ImageViewer.tsx     # Plein écran + métadonnées
├── TopBar.tsx          # Barre d'outils principale
├── FolderDrawer.tsx    # Panneau latéral navigation
├── ContextMenu.tsx     # Menu clic-droit
├── TagManager.tsx      # Gestion tags manuels
├── AddTagModal.tsx     # Modal ajout tags
├── SettingsModal.tsx   # Configuration API key
└── topbar/             # Sous-composants TopBar
```

---

## 1. PhotoGrid (Mode Grille)

Affiche une maçonnerie fluide d'images avec un ordre de lecture optimisé.

### Architecture : Maçonnerie Distribuée (JS-Distributed Masonry)

- *Problème du CSS pur (`column-count`)* : Il remplit les colonnes verticalement, ce qui casse l'ordre chronologique.
- *Solution* : Algorithme JavaScript pour distribuer les items horizontalement (Item 1 → Col 1, Item 2 → Col 2...).

### PhotoCard (Vignette Interactive)

- **Flip Animation** : `framer-motion` pour un retournement à 180° révélant les métadonnées.
- **Optimisation 3D** : `preserve-3d` et `backface-visibility` pour performances fluides.

### Slider de Colonnes

| Position Slider | Colonnes | Résultat |
|-----------------|----------|----------|
| Gauche | 8 | Petites vignettes |
| Droite | 2 | Grandes vignettes |

---

## 2. TopBar

La barre d'outils principale avec trois zones distinctes :

| Zone | Contenu | Comportement |
|------|---------|--------------|
| **Gauche** | Bibliothèque, Paramètres | Fixe |
| **Centre** | Recherche, Filtres couleurs, Curseurs | Scrollable |
| **Droite** | Sélecteur Vue, Dropdowns | Fixe |

### Smart Search

Remplace l'ancien menu "Tags". Barre de recherche unifiée avec autosuggestion basée sur :
- Tags AI
- Tags manuels
- Noms de fichiers

---

## 3. FolderDrawer (Gestionnaire de Dossiers)

Panneau latéral coulissant pour la navigation.

### Sélection de Dossier

Utilise `@tauri-apps/plugin-dialog` pour le sélecteur natif :

```typescript
import { open } from "@tauri-apps/plugin-dialog";

const selected = await open({
  directory: true,
  multiple: false,
  title: "Select Photo Folder",
});
```

### Distinction Visuelle

| Type | Icône | Description |
|------|-------|-------------|
| **Physique** | 💾 HardDrive (Bleu) | Dossier réel sur disque |
| **Virtuel** | 💜 FolderHeart | Collection logique créée dans l'app |

---

## 4. PhotoCarousel (Mode Flow 3D)

Carrousel circulaire haute performance optimisé pour 60fps.

### Optimisations

- **Background Statique** : Dégradé fixe au lieu d'image dynamique
- **Virtualisation Stricte** : Seules les images visibles (`VISIBLE_RANGE`) sont rendues
- **Accélération Matérielle** : `will-change: transform, opacity`

---

## 5. ImageViewer (Plein Écran)

Visualiseur modal pour inspection détaillée.

### Fonctionnalités

- Navigation clavier (Flèches Gauche/Droite)
- Lecture métadonnées EXIF (via `exif-js`)
- **TagManager intégré** : Ajout/Suppression rapide de tags
- Déclenchement analyse AI
- Tags couleurs modifiables

---

## 6. ContextMenu (Clic-Droit)

Menu contextuel personnalisé avec positionnement `fixed`.

### Actions Disponibles

| Action | Description |
|--------|-------------|
| **Analyze (AI)** | Lance l'analyse Gemini |
| **Add Tags** | Ouvre modal taguage |
| **Move to Collection** | Déplace vers dossier virtuel |
| **Color Tag** | Applique couleur (1-6) |
| **Delete** | Suppression logique |

### Intelligence Contextuelle

Si on clique-droit sur un item non sélectionné, il devient l'unique sélection avant d'exécuter l'action.

---

## 7. TagManager & Autosuggestion

Composant dédié à la gestion des tags manuels.

- **Autosuggestion** : Propose les tags existants lors de la saisie
- **Persistance** : Sauvegarde immédiate dans SQLite
- **Contextes** : ImageViewer sidebar, AddTagModal (batch)

---

## 8. SettingsModal (Paramètres)

Modale de configuration globale.

- **Accès** : Icône "Roue crantée" dans la TopBar
- **Fonction** : Définir la **Clé API Gemini**
- **Persistance** : `localStorage` (survit aux sessions)

---

## 9. URLs d'Images

Les images locales utilisent le protocol `asset://` de Tauri :

```typescript
import { convertFileSrc } from "@tauri-apps/api/core";

// Chemin local → URL asset
const url = convertFileSrc("/Users/john/photo.jpg");
// → "asset://localhost/Users/john/photo.jpg"
```

Cette approche :
- Évite le chargement en mémoire (streaming natif)
- Respecte les permissions Tauri ACL
- Fonctionne offline sans serveur