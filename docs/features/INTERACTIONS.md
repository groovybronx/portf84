# Interactions & Raccourcis

Dernière mise à jour : 26/12/2024 à 16:00

Lumina Portfolio est conçue pour être utilisée aussi efficacement à la souris qu'au clavier ("Power User Friendly").

## Souris & Gestes

### Navigation Générale

| Action                   | Résultat                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Clic Simple (Grille)** | Focus sur l'image + **Auto-Scroll** (centre l'élément). En mode Sélection : coche l'image |
| **Double-Clic (Grille)** | Ouvre l'image en plein écran (ImageViewer)                                                |
| **Bouton Info (Grille)** | Retourne la vignette (Flip Card 3D 180°)                                                  |
| **Clic sur Tag (Verso)** | Filtre instantanément par ce tag                                                          |
| **Clic Droit**           | Ouvre le Menu Contextuel                                                                  |
| **Ctrl + Clic**          | Ajoute à la sélection multiple                                                            |

1. Cliquez et maintenez sur une zone vide ou une image (si Shift/Ctrl n'est pas maintenu, la sélection actuelle reset)
2. Tracez un rectangle pour sélectionner plusieurs images (**seuil de 5px** avant activation)
3. Maintenir `Shift` ou `Ctrl` ajoute à la sélection existante
4. **Auto-Validation** : Dés que vous relâchez le bouton de la souris, le mode sélection se ferme (BatchActions reste visible tant qu'il y a des items)
5. **Reset Rapide** : Cliquez dans le vide ou sur une image non sélectionnée pour réinitialiser toute la sélection
6. **Performance** : Grâce à `React.memo` et un cache de rectangles calculé au `onMouseDown`, le rectangle se dessine à 60fps sans re-rendus inutiles.

**Implémentation** :

```typescript
// SelectionContext - Drag-select implementation
const handleMouseMove = (e: MouseEvent) => {
	if (!dragStartPos.current) return;

	// Seuil de 5px pour éviter les micros-mouvements
	if (!state.isDragSelecting && (width > 5 || height > 5)) {
		dispatch({ type: "SET_IS_DRAG_SELECTING", payload: true });
	}

	if (state.isDragSelecting) {
		// Calcul du rectangle + Détection intersection via rectCache (getBoundingClientRect pré-calculé)
		// ...
	}
};

const handleMouseUp = () => {
	if (state.isDragSelecting) {
		dispatch({ type: "SET_IS_DRAG_SELECTING", payload: false });
		// Auto-exit selection mode
		if (state.selectedIds.size > 0) {
			dispatch({ type: "SET_SELECTION_MODE", payload: false });
		}
	}
};
```

### Mode Plein Écran (ImageViewer)

### Mode Plein Écran (ImageViewer)

> [!NOTE]
> Les raccourcis ci-dessous sont les **valeurs par défaut**. Vous pouvez les personnaliser dans **Settings > Shortcuts**.

| Action              | Touche par défaut           |
| ------------------- | --------------------------- |
| **Précédent**       | `←` (Gauche)                |
| **Suivant**         | `→` (Droite)                |
| **Haut / Bas**      | `↑` / `↓` (Navigation grille)|
| **Ouvrir / Fermer** | `Espace` ou `Entrée`        |
| **Quitter**         | `Echap`                     |
| **Roulette souris** | Navigation images (scroll)  |
| **Scrubber Drag**   | Défilement rapide           |
| **Tags Couleur**    | Touches `1` à `6`           |
| **Effacer Tags**    | Touche `0`                  |

### Mode Sélection (Grid)

| Action                  | Touche par défaut           | Context                       |
| ----------------------- | --------------------------- | ----------------------------- |
| **Batch Tag Panel**     | `Ctrl/Cmd + Shift + T`      | Grid (selection mode)         |

---

## Configuration & Paramètres

### Gestion Clé API Gemini

1. Cliquez sur l'icône **⚙️ Réglages** (Roue crantée) en haut à gauche
2. Entrez votre clé Gemini API
3. Validez par "Entrée" ou en fermant la modale
4. La clé est persistée dans `localStorage` pour les prochaines sessions

> [!TIP]
> L'application native n'a pas de restriction CORS. Les appels API fonctionnent directement.

---

## Recherche & Filtrage

### Recherche Floue (Fuzzy Search)

La barre de recherche utilise `Fuse.js` avec tolérance aux fautes :

| Recherche | Trouve     |
| --------- | ---------- |
| "montgne" | "montagne" |
| "portra"  | "portrait" |
| "paysge"  | "paysage"  |

**Champs recherchés** : nom de fichier, description AI, tags AI, tags manuels.

**Implémentation** :

```typescript
// LibraryContext - processedItems
const processedItems = useMemo(() => {
	let filtered = filteredByFolder;

	if (state.searchTerm) {
		const term = state.searchTerm.toLowerCase();
		filtered = filtered.filter(
			(item) =>
				item.name.toLowerCase().includes(term) ||
				item.aiDescription?.toLowerCase().includes(term) ||
				item.aiTags?.some((tag) => tag.toLowerCase().includes(term)) ||
				item.manualTags?.some((tag) => tag.toLowerCase().includes(term))
		);
	}

	return filtered;
}, [filteredByFolder, state.searchTerm]);
```

**Autosuggestion** : Propose dynamiquement les tags existants lors de la frappe (via `availableTags`).

### Tags Couleurs

Filtrage rapide via les pastilles colorées dans la TopBar.

| Couleur   | Touche | Hex       |
| --------- | ------ | --------- |
| 🔴 Rouge  | `1`    | `#ef4444` |
| 🟠 Orange | `2`    | `#f97316` |
| 🟡 Jaune  | `3`    | `#eab308` |
| 🟢 Vert   | `4`    | `#22c55e` |
| 🔵 Bleu   | `5`    | `#3b82f6` |
| 🟣 Violet | `6`    | `#a855f7` |
| ❌ Retirer | `0`    | N/A       |

> [!TIP]
> Le menu contextuel utilise un système de **surbrillance fluide** (Glide Effect) : lorsque vous déplacez la souris entre les items, le surlignage glisse de façon organique pour une sensation "Apple-like" premium.

## Sidebar & Navigation Library

La barre latérale s'active via l'icône `Layers` dans la TopBar ou en glissant depuis le bord gauche.

### Structure & Navigation Projets

La barre latérale structure votre travail par **Projets** (Collections).

- **Rotation de Projet** :
  - Le projet **Actif** est toujours en haut, affiché sous forme d'une grande carte.
  - Les projets **Inactifs** sont listés en dessous sous forme compacte.
  - **Clic** sur un projet inactif : Il "swape" sa place avec le projet actif via une animation fluide.

- **Contenu d'un Projet** :
  - **Library** : Toutes les photos du projet.
  - **Dossiers de Travail (Bleu)** : Vos dossiers physiques.
  - **Collections (Violet)** : Vos albums virtuels.
  - **Filtres (Ambre)** : Accès rapide par couleur tag.

### Épinglage (Pinning)

L'utilisateur peut fixer la barre latérale pour qu'elle reste toujours visible et ne recouvre pas ses photos.

- **📌 Icône Épingle** : Située en haut à droite de la sidebar.
  - **Click** : Alterne entre le mode épinglé et le mode flottant.
  - **Automatisme** : Si vous désactivez l'épingle (Unpin), la barre se ferme automatiquement pour libérer l'espace.
- **Synchronisation** : L'icône de bibliothèque dans la TopBar permet également de basculer cet état. Si la barre est épinglée, cliquer sur l'icône dans la TopBar la détachera et la fermera.

### Indépendance du Scroll

Le scroll de la sidebar est totalement indépendant de celui de la galerie. Vous pouvez explorer vos collections tout en gardant une vue fixe sur vos photos.

---

## Raccourcis Clavier

L'application écoute les événements clavier globaux (sauf pendant la saisie de texte).

### Navigation (Grille)

| Touche    | Action                         | Comportement                                       |
| --------- | ------------------------------ | -------------------------------------------------- |
| `↑` / `↓` | Monter/Descendre d'une rangée  | Navigation verticale (suit les colonnes visuelles) |
| `←` / `→` | Image précédente / suivante    | Navigation horizontale (ordre chronologique)       |
| `Espace`  | Ouvrir / Fermer le plein écran | Toggle ImageViewer                                 |
| `Echap`   | Fermer / Annuler               | Ferme modales, désélection, ou SortImageViewer     |
| `Enter`   | Ouvrir en plein écran          | Si une image est focusée                           |

**Implémentation Auto-Scroll** :

```typescript
// App.tsx - Keyboard Navigation
useEffect(() => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.target instanceof HTMLInputElement) return;

		const currentIndex = focusedId
			? processedItems.findIndex((i) => i.id === focusedId)
			: -1;

		let newIndex = currentIndex;

		switch (e.key) {
			case "ArrowRight":
				newIndex = Math.min(processedItems.length - 1, currentIndex + 1);
				break;
			case "ArrowLeft":
				newIndex = Math.max(0, currentIndex - 1);
				break;
			case "ArrowDown":
				newIndex = Math.min(
					processedItems.length - 1,
					currentIndex + gridColumns
				);
				break;
			case "ArrowUp":
				newIndex = Math.max(0, currentIndex - gridColumns);
				break;
		}

		if (newIndex !== currentIndex) {
			const targetItem = processedItems[newIndex];
			if (targetItem) {
				setFocusedId(targetItem.id);
				// L'Auto-Scroll est géré par PhotoGrid via scrollTarget
			}
		}
	};

	window.addEventListener("keydown", handleKeyDown);
	return () => window.removeEventListener("keydown", handleKeyDown);
}, [focusedId, processedItems, gridColumns]);
```

### Tags Couleurs Rapides (Hover ou Sélection)

| Touche | Couleur    | Action                |
| ------ | ---------- | --------------------- |
| `1`    | 🔴 Rouge   | Applique tag rouge    |
| `2`    | 🟠 Orange  | Applique tag orange   |
| `3`    | 🟡 Jaune   | Applique tag jaune    |
| `4`    | 🟢 Vert    | Applique tag vert     |
| `5`    | 🔵 Bleu    | Applique tag bleu     |
| `6`    | 🟣 Violet  | Applique tag violet   |
| `0`    | ❌ Retirer | Retire le tag couleur |

**Cible** : Image focusée OU sélection multiple OU image sous la souris (selon contexte).

```typescript
// useKeyboardShortcuts.ts
useEffect(() => {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.target instanceof HTMLInputElement) return;

		// Logic for arrows, space, enter, 0-6...
	};

	window.addEventListener("keydown", handleKeyDown);
	return () => window.removeEventListener("keydown", handleKeyDown);
}, [/* dependencies */]);
```

---

## États de Focus & Sélection

Le système gère deux états distincts :

### Focus (`focusedId`)

- Suit la navigation clavier OU le clic simple
- Affiche une bordure blanche autour de l'élément
- **Auto-Scroll** : La grille centre automatiquement l'élément focusé lors de la navigation clavier
- Permet d'appliquer un tag couleur rapide (`1-6`) sans cliquer

### Sélection (`selectedIds`)

- Mode multi-sélection activé via `Ctrl + Clic` ou Drag-Select
- Affiche une bordure bleue + icône "Check" (top-right)
- **Persistance** : Les indicateurs restent visibles après le relâchement du clic (Drag-Select) tant que des items sont sélectionnés.
- Les actions de masse (Move, Tag, Analyze, Color Tags 1-6) s'appliquent systématiquement à toute la sélection active.
- **Désactivation** : Clic dans une zone vide, clic sur image non sélectionnée, ou touche `Echap`
- **Native Style** : Désactivé via CSS (`::selection`) pour éviter le voile bleu du navigateur flux.

**Interaction** :

- `Clic Simple` : Focus uniquement
- `Ctrl + Clic` : Ajoute à la sélection (toggle)
- `Drag Rectangle` : Sélection multiple
- `Double-Clic` : Ouvre en plein écran (ignore sélection)

### Comportement post-action

Pour garantir un flux de travail ininterrompu :
- **Déplacement d'items** : Après avoir déplacé des items vers une collection, l'application **conserve le focus** sur le dossier ou la collection actuelle. Elle ne bascule JAMAIS automatiquement vers la cible.
- **Création de collection** : La création d'une nouvelle collection ou le "Create & Move" ne change pas la vue active de l'utilisateur.

---

## Auto-Scroll (Navigation Clavier)

Lors de la navigation clavier, la grille virtuelle **centre automatiquement** l'élément actif :

```typescript
// PhotoGrid - Auto-Scroll Logic
const scrollTarget = useMemo(() => {
	if (!focusedId) return null;
	const index = items.findIndex((i) => i.id === focusedId);
	if (index === -1) return null;

	return {
		colIndex: index % gridColumns,
		rowIndex: Math.floor(index / gridColumns),
	};
}, [focusedId, items, gridColumns]);

// VirtualColumn - Scroll Effect
useEffect(() => {
	if (
		scrollToIndex !== null &&
		scrollToIndex >= 0 &&
		scrollToIndex < items.length
	) {
		rowVirtualizer.scrollToIndex(scrollToIndex, { align: "center" });
	}
}, [scrollToIndex, rowVirtualizer]);
```

**Comportement** :

- ↑↓←→ : L'image se centre dans le viewport
- Smooth scroll natif (géré par le virtualizer)
- Fonctionne même avec 10,000+ images (virtualisation)
