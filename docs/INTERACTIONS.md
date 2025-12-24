# Interactions & Raccourcis

Dernière mise à jour : 24/12/2024 à 17:49

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

| Action              | Résultat                    |
| ------------------- | --------------------------- |
| **Boutons ←/→**     | Image précédente / suivante |
| **Clic hors image** | Fermer le visualiseur       |
| **Echap**           | Fermer le visualiseur       |
| **Roulette souris** | Navigation images (scroll)  |
| **Touches 1-6**     | Applique tag couleur        |
| **Touche 0**        | Retire le tag couleur       |

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
- Les actions de masse (Move, Tag, Analyze) s'appliquent à la sélection
- **Désactivation** : Clic dans une zone vide, clic sur image non sélectionnée, ou touche `Echap`
- **Native Style** : Désactivé via CSS (`::selection`) pour éviter le voile bleu du navigateur flux.

**Interaction** :

- `Clic Simple` : Focus uniquement
- `Ctrl + Clic` : Ajoute à la sélection (toggle)
- `Drag Rectangle` : Sélection multiple
- `Double-Clic` : Ouvre en plein écran (ignore sélection)

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
