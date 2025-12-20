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

## 2. TopBar
La barre d'outils principale, repensée pour gérer les problèmes de superposition (z-index) et de responsivité.

- **Architecture Layout (3 Zones)** :
  1.  **Zone Gauche (Fixe)** : Boutons d'épingle et de Bibliothèque. Ne scrolle jamais.
  2.  **Zone Centrale (Scrollable)** : Contient la recherche, les filtres couleurs et les curseurs. Utilise `overflow-x-auto` pour s'adapter aux mobiles.
  3.  **Zone Droite (Fixe)** : Contient le sélecteur de Vue (Grid/Flow) et **sorti du flux** scrollable : les Dropdowns (Tags, Tri, Sélection).
  
- **Correction UX** : Les menus déroulants (Tags, Sort) ont été déplacés hors du conteneur `overflow-x-auto` de la zone centrale. Cela empêche qu'ils soient coupés ("clipping") par les limites du conteneur parent lorsqu'ils sont ouverts.

## 3. FolderDrawer (Gestionnaire de Dossiers)
Le panneau latéral coulissant pour la navigation.

- **Distinction Visuelle** :
  - **Dossiers Physiques** : Icône Disque Dur Bleu (`HardDrive`). Représente un dossier réel sur le disque.
  - **Collections Virtuelles** : Icône Dossier Violet avec Cœur/Étoile (`FolderHeart`). Représente un regroupement logique créé dans l'app.
- **Fonctionnalités** :
  - Importation depuis le disque.
  - Création de collections.
  - Suppression (Unlink pour physique, Delete pour virtuel).

## 4. PhotoCarousel (Mode Flow 3D)
Un carrousel circulaire haute performance optimisé pour maintenir 60fps même avec des images haute résolution.

- **Optimisations Critiques (v2)** :
  - **Background Statique** : Remplacement de l'image de fond dynamique par un dégradé fixe.
  - **Virtualisation Stricte** : Seules les images visibles (définies par `VISIBLE_RANGE`) sont rendues.
  - **Accélération Matérielle** : Utilisation de `will-change: transform, opacity`.

## 5. ImageViewer (Plein Écran)
Le visualiseur modal pour une inspection détaillée.
- Navigation clavier (Flèches).
- Lecture des métadonnées EXIF (via `exif-js`).
- Déclenchement de l'analyse AI.
- Affichage des tags couleurs et modification en direct.

## 6. ControlBar (Barre Flottante Basse)
Barre d'actions contextuelles.
- **Mode Normal** : Affiche les onglets de vue (Grid, Flow, Detail).
- **Mode Sélection** : Affiche les actions de masse (Déplacer, Partager, Annuler).

## 7. ContextMenu (Clic-Droit)
Menu contextuel personnalisé.
- Portal ou positionnement fixe (`fixed`) basé sur les coordonnées `clientX/Y`.
- Actions : Analyse AI, Tag Couleur, Suppression.