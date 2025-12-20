# Architecture Technique

## Approche "Local-First" & Persistance

Lumina Portfolio fonctionne sans backend, mais utilise des technologies avancées du navigateur pour offrir une expérience persistante comparable à une application native.

### 1. Système de Fichiers Hybride
L'application gère deux types de sources de données unifiées dans l'interface :

1.  **Dossiers Physiques (Physical Folders)** : 
    - Provenance : Disque dur local via `FileSystemDirectoryHandle`.
    - Comportement : Lecture seule sur la structure (on reflète le disque).
    - Persistance : Le "Handle" (lien sécurisé) est stocké.
    
2.  **Dossiers Virtuels (Collections)** :
    - Provenance : Création interne à l'application.
    - Comportement : Structure purement logique stockée en base de données.
    - Persistance : La définition du dossier est stockée dans IndexedDB, les items sont liés par référence.

### 2. Base de Données Locale (IndexedDB)
Nous utilisons une couche d'abstraction légère sur IndexedDB (Stores) pour stocker **trois** types de données :

- **Handles (`handles`)** : Les références vers les dossiers racines physiques autorisés.
  - *Clé* : Nom du dossier.
  - *Donnée* : `FileSystemDirectoryHandle` + `isRoot` flag.
  - *Gestion* : Permet la restauration de session et la suppression définitive du lien (Unlink).

- **Dossiers Virtuels (`virtual_folders`)** : La structure des collections créées par l'utilisateur.
  - *Donnée* : ID, Nom, Date de création, flag `isVirtual`.
  - *Note* : Ne contient pas les fichiers eux-mêmes, juste la structure.

- **Métadonnées (`metadata`)** : Les enrichissements (AI, Tags, Couleurs) et les liaisons.
  - *Clé* : Chemin relatif du fichier ou nom unique.
  - *Valeur* : JSON (Description, Tags, **folderId**).
  - *Logique* : Le `folderId` dans les métadonnées détermine l'appartenance d'un fichier à une collection virtuelle.

## Optimisation des Performances

### Virtualisation & Infinite Scroll
Le rendu de milliers d'éléments DOM (`div`, `img`) est le goulot d'étranglement principal.
- **Stratégie** : "Infinite Scroll" dans `PhotoGrid`.
- **Implémentation** : 
  - On ne rend initialement que les 20-30 premiers items.
  - Un "Sentinel" (div invisible) en bas de page est observé via `IntersectionObserver`.
  - Lorsqu'il devient visible, on charge le chunk suivant d'images.
  - Cela maintient le DOM léger et le défilement fluide (60fps).

### Gestion de la Mémoire
- **Blobs** : Les URLs créées via `URL.createObjectURL` sont révoquées agressivement lors du changement de dossier ou de la fermeture de l'app pour éviter les fuites RAM.
- **Vignettes** : Pour l'instant, le navigateur gère le décodage. Une évolution future pourrait utiliser `createImageBitmap` dans un Web Worker.

## Flux de Données (Chargement & Fusion)

1. **Scan Disque** : Lecture récursive du Handle physique -> Génération d'une liste de fichiers bruts.
2. **Chargement DB** : Récupération des dossiers virtuels et des métadonnées.
3. **Hydratation & Distribution** : 
   - Pour chaque fichier scanné, on vérifie s'il possède un `folderId` stocké dans ses métadonnées.
   - Si oui, il est déplacé dans le dossier virtuel correspondant.
   - Sinon, il reste dans son dossier physique d'origine.
4. **Rendu** : L'état `folders` final est une fusion des dossiers physiques restants et des dossiers virtuels peuplés.
5. **Suppression** :
   - *Virtuel* : Supprime l'entrée dans `virtual_folders`.
   - *Physique* : Supprime le Handle dans `handles` et révoque l'accès au prochain démarrage.