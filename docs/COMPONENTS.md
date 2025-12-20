# Composants UI & UX

L'interface repose sur une séparation stricte entre les composants de présentation ("Dumb Components") et le conteneur logique (`App.tsx`).

## 1. PhotoGrid (Mode Grille)
Affiche une maçonnerie fluide d'images avec un ordre de lecture optimisé.

- **Architecture : Maçonnerie Distribuée (JS-Distributed Masonry)**
  - *Problème du CSS pur (`column-count`)* : Il remplit les colonnes verticalement (A, B, C sont l'un sous l'autre), ce qui casse l'ordre chronologique visuel.
  - *Solution* : Le composant utilise un algorithme JavaScript pour distribuer les items dans les colonnes une par une (Item 1 -> Col 1, Item 2 -> Col 2...).
  - **Résultat** : On conserve l'imbrication verticale compacte ("Masonry") tout en gardant un ordre de lecture visuel horizontal de gauche à droite.

- **Interaction Double-Clic**
  - **Clic Simple** : Sélectionne / Focus l'image (affiche les infos au survol, permet la navigation clavier).
  - **Double-Clic** : Ouvre l'image en plein écran (`ImageViewer`).
  - **Mode Sélection** : En mode sélection, le clic simple ajoute/retire l'image de la sélection.

- **Feature Clé : Slider de Colonnes**
  - Le slider dans la `TopBar` contrôle dynamiquement le nombre de tableaux de colonnes générés par le script.
  - **Logique Inversée** : 
    - Slider à Gauche = Max Colonnes (8) = Petites vignettes.
    - Slider à Droite = Min Colonnes (2) = Grandes vignettes.

- **Support Drag-to-Select** :
  - Le composant accepte une prop `registerItemRef`. Il attache cette référence à chaque `div` conteneur de carte.
  - Cela permet au parent de calculer si le rectangle de sélection intersecte la carte via ses coordonnées DOM.

## 2. PhotoCarousel (Mode Flow 3D)
Un carrousel circulaire avec effet de profondeur 3D.

- **Mathématiques 3D** :
  - Chaque carte est positionnée absolument.
  - `zIndex` est calculé en fonction de la distance au centre (`absOffset`).
  - `transform: rotateY(...) translateZ(...)` crée l'effet de profondeur.
  - **Wrap-around** : Logique circulaire pour que la dernière image mène à la première.

```typescript
// Exemple simplifié de la logique de profondeur
z: absOffset === 0 ? 0 : -80 * absOffset, 
rotateY: -Math.sign(offset) * 45, // Rotation max 45deg
filter: blur(${absOffset}px) // Flou progressif pour simuler la profondeur de champ
```

## 3. ImageViewer (Plein Écran)
Le visualiseur modal pour une inspection détaillée.

- **Fonctionnalités** :
  - Navigation clavier (Flèches).
  - Lecture des métadonnées EXIF (via `exif-js`).
  - Déclenchement de l'analyse AI.
  - Affichage des tags couleurs et modification en direct.

## 4. TopBar
La barre d'outils principale, repensée pour la responsivité.

- **Architecture Layout** : Divisée en 3 zones pour éviter les problèmes de superposition (z-index clipping) sur petits écrans :
  1.  **Zone Gauche (Fixe)** : Boutons d'épingle et de Bibliothèque. Ne scrolle jamais.
  2.  **Zone Centrale (Scrollable)** : Contient la recherche, les filtres couleurs et les curseurs. Utilise `overflow-x-auto`.
  3.  **Zone Droite (Fixe)** : Le sélecteur de Vue (Dropdown).

- **Fonctionnalités** :
  - Filtres hybrides (Clic simple = Filtre, Clic en mode sélection = Tagging).
  - Feedback visuel instantané.

## 5. ControlBar (Barre Flottante Basse)
Barre d'actions contextuelles.

- **Comportement Dual** :
  - **Mode Normal** : Affiche les onglets de vue (Grid, Flow, Detail).
  - **Mode Sélection** : Se transforme pour afficher les actions de masse (Déplacer, Partager, Annuler).
- **Design** : Utilisation de `backdrop-blur-xl` pour l'effet "verre dépoli" moderne.