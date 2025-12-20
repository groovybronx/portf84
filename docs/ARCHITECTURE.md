# Architecture Technique

## Approche "Local-First" & Persistance

Lumina Portfolio fonctionne sans backend, mais utilise des technologies avancées du navigateur pour offrir une expérience persistante comparable à une application native.

### 1. Système de Fichiers (File System Access API)
Au lieu de l'input classique, nous privilégions `window.showDirectoryPicker()`.
- **Avantage** : Retourne un `FileSystemDirectoryHandle`.
- **Persistance** : Ce handle est sérialisable et stocké dans **IndexedDB**.
- **UX** : Au rechargement, l'utilisateur n'a pas besoin de re-sélectionner le dossier dans l'explorateur. Il doit simplement valider une demande de permission de sécurité rapide.

### 2. Base de Données Locale (IndexedDB)
Nous utilisons une couche d'abstraction légère sur IndexedDB pour stocker deux types de données :
- **Handles** : Les références vers les dossiers racines (pour la restauration de session).
- **Métadonnées** : Les analyses AI (Descriptions, Tags) et les Tags couleurs manuels.
  - *Clé* : Chemin relatif du fichier ou hash unique.
  - *Valeur* : JSON des métadonnées.
  - *Pourquoi ?* : Pour ne pas perdre les crédits API consommés ou le temps passé à trier lors d'un refresh.

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

## Flux de Données

1. **Init** : Vérification d'IndexedDB pour une session existante.
2. **Si Session** : Affichage bouton "Restaurer". Validation permission -> Scan récursif du Handle -> Hydratation avec métadonnées stockées.
3. **Si Nouveau** : Ouverture `showDirectoryPicker` -> Scan -> Indexation.
4. **Analyse AI** : Lancement à la demande. Résultat sauvegardé immédiatement dans IndexedDB.
