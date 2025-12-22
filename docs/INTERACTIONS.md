# Interactions & Raccourcis

Lumina Portfolio est conçue pour être utilisée aussi efficacement à la souris qu'au clavier ("Power User Friendly").

## Souris & Gestes

### Navigation Générale

| Action | Résultat |
|--------|----------|
| **Clic Simple (Grille)** | Focus sur l'image (bordure blanche). En mode Sélection : coche l'image |
| **Double-Clic (Grille)** | Ouvre l'image en plein écran |
| **Bouton Info (Grille)** | Retourne la vignette (Flip Card 3D) |
| **Clic sur Tag (Verso)** | Filtre instantanément par ce tag |
| **Clic Droit** | Ouvre le Menu Contextuel |

### Drag-to-Select (Sélection Rectangle)

1. Cliquez et maintenez dans une zone vide de la grille
2. Tracez un rectangle pour sélectionner plusieurs images
3. Maintenir `Shift` ou `Ctrl` ajoute à la sélection existante

### Mode Plein Écran (ImageViewer)

| Action | Résultat |
|--------|----------|
| **Boutons ←/→** | Précédent / Suivant |
| **Clic hors image** | Fermer le visualiseur |
| **Roulette souris** | Navigation images |

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

| Recherche | Trouve |
|-----------|--------|
| "montgne" | "montagne" |
| "portra" | "portrait" |

**Champs recherchés** : nom de fichier, description AI, tags AI, tags manuels.

**Autosuggestion** : Propose dynamiquement les tags existants lors de la frappe.

### Tags Couleurs

Filtrage rapide via les pastilles colorées dans la TopBar.

---

## Raccourcis Clavier

L'application écoute les événements clavier globaux (sauf pendant la saisie de texte).

### Navigation

| Touche | Action | Contexte |
|--------|--------|----------|
| `↑` / `↓` | Monter/Descendre d'une rangée | Grille |
| `←` / `→` | Image précédente / suivante | Grille, Flow, Viewer |
| `Espace` | Ouvrir / Fermer le plein écran | Global |
| `Echap` | Fermer / Annuler | Global |

### Tags Couleurs Rapides

| Touche | Couleur |
|--------|---------|
| `1` | 🔴 Rouge |
| `2` | 🟠 Orange |
| `3` | 🟡 Jaune |
| `4` | 🟢 Vert |
| `5` | 🔵 Bleu |
| `6` | 🟣 Violet |
| `0` | ❌ Retirer le tag |

---

## États de Focus

Le système gère un état de **Focus** (`focusedId`) distinct de la **Sélection**.

- Le focus suit la navigation clavier ou le survol souris
- Permet d'appliquer un tag couleur rapide (`1-6`) sur une image juste en la survolant
- Évite de cliquer pour chaque action