# Interactions & Raccourcis

Lumina Portfolio est conçue pour être utilisée aussi efficacement à la souris qu'au clavier ("Power User Friendly").

## Souris & Gestes

### Navigation Générale
- **Clic Simple (Grille)** : Met le focus sur l'image (bordure blanche). Si le mode Sélection est actif, cela coche l'image.
- **Double-Clic (Grille)** : Ouvre l'image en plein écran.
- **Clic Droit (Grille)** : Ouvre le **Menu Contextuel Personnalisé** (Analyse AI, Tag Couleur, Suppression).
- **Drag-to-Select (Glisser-Déposer)** :
  - Cliquez et maintenez le bouton gauche de la souris dans une zone vide de la grille.
  - Tracez un rectangle pour sélectionner plusieurs images.
  - Maintenir `Shift` ou `Ctrl` permet d'ajouter à la sélection existante.

### Mode Plein Écran (ImageViewer)
- **Roulette / Clic Boutons** : Précédent / Suivant.
- **Clic hors image** : Fermer le visualiseur.

## Recherche & Filtrage

- **Recherche Floue (Fuzzy Search)** :
  - La barre de recherche utilise `Fuse.js`.
  - Elle tolère les fautes de frappe (ex: "montgne" trouvera "montagne").
  - Elle cherche dans le nom de fichier, la description AI et les tags AI.
- **Tags Couleurs** : Filtrage rapide via la barre supérieure (clic sur une pastille couleur).

## Raccourcis Clavier

L'application écoute les événements clavier globaux (sauf lors de la saisie de texte).

### Navigation
| Touche | Action | Contexte |
|--------|--------|----------|
| `Flèches (Haut/Bas)` | Monter/Descendre d'une rangée (tient compte du nombre de colonnes) | Grille |
| `Flèches (Gauche/Droite)` | Image précédente / suivante | Grille, Flow, Viewer |
| `Entrée` | Ouvrir l'image sélectionnée | Grille, Flow |
| `Echap` | Fermer le visualiseur / Annuler la sélection / Fermer les tiroirs | Global |

### Gestion & Organisation
| Touche | Action | Détails |
|--------|--------|---------|
| `1` - `6` | Appliquer un Tag Couleur | 1=Rouge, 2=Orange, 3=Jaune, 4=Vert, 5=Bleu, 6=Violet |
| `0` | Retirer le Tag Couleur | Efface le tag de l'image focus ou de la sélection |

### États de Focus
Le système gère un état de "Focus" (`focusedId`) distinct de la "Sélection".
- Le focus suit la navigation clavier ou le survol souris.
- Il permet d'appliquer un tag couleur rapide (`1-6`) sur une image juste en la survolant, sans avoir besoin de cliquer dessus.