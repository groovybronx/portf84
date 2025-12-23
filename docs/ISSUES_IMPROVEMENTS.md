# Issues, Bugs & Améliorations - Lumina Portfolio

**Date de création** : 2025-12-23  
**Statut** : En cours de recensement

---

## 🐛 Bugs Identifiés

### Priorité Haute

- [ ] **[BUG-001] Collections virtuelles disparaissent après redémarrage**
  - **Reproduction** :
    1. Créer une collection virtuelle (album manuel)
    2. Ajouter des images dedans
    3. Redémarrer l'application
    4. La collection a disparu
  - **Impact** : CRITIQUE - Perte de données utilisateur, fonctionnalité principale cassée
  - **Cause probable** : Collections virtuelles non sauvegardées en DB ou non chargées au démarrage
  - **Solution proposée** : Vérifier `storageService.createVirtualFolder()` et `libraryLoader.loadCollectionData()`

### Priorité Moyenne

- [ ] **[BUG-002] Drag-to-select met en surbrillance toutes les colonnes**

  - **Reproduction** :
    1. Passer en mode Grid
    2. Faire un drag-to-select sur quelques images
    3. Observer que TOUTES les images des colonnes touchées sont en surbrillance bleue
  - **Impact** : MOYEN - Confusion visuelle, difficulté à voir quelles images sont réellement sélectionnées
  - **Cause probable** : Logique de détection de collision sélectionne par colonne entière au lieu de par image individuelle
  - **Solution proposée** : Corriger `useSelection.ts` pour vérifier l'intersection exacte avec chaque image

- [ ] **[BUG-003] Sélection drag-to-select nécessite clic sur "Done"**

  - **Reproduction** :
    1. Faire un drag-to-select
    2. Relâcher la souris
    3. La sélection n'est pas validée, il faut cliquer "Done" dans la TopBar
  - **Impact** : MOYEN - UX non intuitive, étape supplémentaire inutile
  - **Attendu** : La sélection devrait être validée automatiquement au relâchement de la souris
  - **Solution proposée** : Modifier `handleMouseUp` pour sortir du mode sélection automatiquement

- [ ] **[BUG-006] Impossible de supprimer un dossier source et son shadow folder**
  - **Reproduction** :
    1. Ouvrir le menu de gauche (FolderDrawer)
    2. Ajouter un dossier source au projet
    3. Essayer de supprimer ce dossier source
    4. Aucune option de suppression disponible
  - **Impact** : MOYEN - Impossible de nettoyer/gérer les dossiers sources, accumulation de dossiers inutiles
  - **Solution proposée** : Ajouter bouton de suppression dans FolderDrawer avec confirmation, supprimer aussi le shadow folder associé

### Priorité Basse

- [ ] **[BUG-004] Navigation clavier ne scroll pas automatiquement en mode Grid**

  - **Reproduction** :
    1. Passer en mode Grid avec plusieurs images
    2. Sélectionner une image visible
    3. Utiliser les flèches du clavier pour naviguer vers le bas/haut
    4. L'image sélectionnée sort de l'écran mais la galerie ne scroll pas
  - **Impact** : MOYEN - Navigation clavier difficile, perte de contexte visuel
  - **Attendu** : La galerie devrait auto-scroller pour garder l'image sélectionnée visible
  - **Solution proposée** : Ajouter `scrollIntoView()` dans le gestionnaire de navigation clavier de PhotoGrid

- [ ] **[BUG-005] Nom de fichier déborde en mode Flow**
  - **Reproduction** :
    1. Passer en mode Flow (Carousel)
    2. Naviguer vers une image avec un nom très long
    3. Observer que le nom déborde de la surface de l'image
  - **Impact** : BASSE - Problème esthétique, lisibilité réduite
  - **Solution proposée** :
    - Utiliser `text-overflow: ellipsis` avec `overflow: hidden`
    - Adapter dynamiquement la taille de police selon la longueur
    - Ajouter un tooltip au survol pour voir le nom complet
  - **Voir aussi** : UI-001 pour personnalisation de l'affichage

---

## ✨ Améliorations UX/UI

### Interface

- [ ] **[UI-001] Menu contextuel pour personnaliser l'affichage des métadonnées**

  - **Justification** : Permettre à l'utilisateur de choisir quelles informations afficher (nom, tags, date, etc.)
  - **Emplacement** : Clic droit ou bouton dans TopBar
  - **Options suggérées** :
    - Afficher/masquer nom de fichier
    - Afficher/masquer tags
    - Afficher/masquer date
    - Afficher/masquer description AI
    - Taille de police (Petit/Moyen/Grand)
  - **Effort estimé** : Moyen

- [ ] **[UI-002] Fonction de renommage des collections virtuelles**

  - **Justification** : Actuellement impossible de renommer une collection virtuelle après sa création
  - **Emplacement** : Clic droit sur collection dans FolderDrawer ou bouton d'édition
  - **Fonctionnalité** :
    - Modal ou input inline pour renommer
    - Validation du nouveau nom (non vide, unique)
    - Mise à jour en DB et en mémoire
  - **Effort estimé** : Faible

- [ ] **[UI-003] Loader animé pour images en chargement (mode Grid)**

  - **Justification** : Lors du scroll rapide en mode Grid, les images non chargées apparaissent comme vignettes noires, donnant l'impression de bug
  - **Solution proposée** :
    - Remplacer vignette noire par loader animé (3 barres verticales)
    - Utiliser CSS animations (pas styled-components, utiliser Tailwind/CSS vanilla)
    - Afficher pendant le lazy loading des images
  - **Composant suggéré** : Loader avec 3 barres animées (scale-up)
  - **Effort estimé** : Faible

- [ ] **[UI-004] Différenciation visuelle des collections virtuelles dans Move Items**

  - **Justification** : Dans le modal "Move Items", impossible de distinguer visuellement les collections virtuelles des dossiers sources
  - **Solution proposée** :
    - Utiliser la même icône que dans FolderDrawer (Library column)
    - Appliquer couleur différente (ex: bleu pour virtuelles, gris pour sources)
    - Uniformiser l'apparence entre FolderDrawer et Move Items modal
  - **Fichiers concernés** : `MoveItemsModal.tsx`, `FolderDrawer.tsx`
  - **Effort estimé** : Faible

- [ ] **[UI-005] Gestionnaire de Tags avec Consolidation Intelligente**

  - **Justification** : Au fil du temps, accumulation de tags similaires/redondants (synonymes, pluriels, variations)
  - **Fonctionnalité** :
    - Interface de gestion des tags (liste, renommer, fusionner, supprimer)
    - Détection automatique de tags similaires (algorithmes de similarité)
    - Suggestions de fusion avec score de confiance
    - Analyse sémantique via Gemini pour identifier synonymes
  - **Bénéfices** : Réduction fragmentation, meilleure recherche, cohérence
  - **Spécification** : Voir `TAG_CONSOLIDATION_SPEC.md`
  - **Effort estimé** : Moyen-Élevé (2-3 jours)

---

## ⚡ Optimisations Performance

### Chargement

- [ ] **[PERF-001] Mode Grid : Ralentissements et crashes avec grand nombre d'images** ⚠️ CRITIQUE
  - **Problème actuel** :
    - Chargement d'images pleine résolution en mode Grid
    - Ralentissements sévères lors du scroll
    - Crashes de l'app (écran noir) avec beaucoup d'images
    - Consommation mémoire excessive
  - **Gain attendu** :
    - Temps de chargement divisé par 5-10
    - Scroll fluide même avec 1000+ images
    - Stabilité de l'app
  - **Approche** :
    - **Génération de vignettes** : Script Tauri pour créer thumbnails adaptatifs (300-500px) lors de l'ajout de dossier
    - **Stockage vignettes** : Dossier `.lumina/thumbnails/` avec hash du fichier original
    - **Lazy loading amélioré** : Charger vignettes au lieu d'images pleines en Grid
    - **Cache intelligent** : LRU cache pour vignettes avec limite mémoire
    - **Virtualisation optimisée** : Vérifier @tanstack/react-virtual configuration
    - **Image pleine résolution** : Uniquement en mode Carousel/ImageViewer
  - **Technologies** :
    - Tauri `image` crate pour génération vignettes côté Rust
    - SQLite pour cache métadonnées vignettes
  - **Priorité** : CRITIQUE - Bloquant pour usage production

---

## 🧪 Tests de Performance

### Métriques à Mesurer

- [ ] **Temps de chargement initial** (bibliothèque vide → 1000 images)
- [ ] **FPS en mode Grid** (scroll rapide)
- [ ] **FPS en mode Carousel** (navigation)
- [ ] **Utilisation mémoire** (RAM)
- [ ] **Temps de recherche** (recherche texte + tags)
- [ ] **Temps d'analyse AI** (1 image, 10 images, 100 images)

### Scénarios de Test

1. **Charge légère** : 100 images
2. **Charge moyenne** : 1000 images
3. **Charge lourde** : 5000+ images

---

## 🎯 Priorisation Globale

### Sprint 1 (Urgent - Performance & Bugs Critiques)

1. **[PERF-001]** Génération et gestion des vignettes (Tauri/Rust)
2. **[BUG-001]** Correction de la persistance des collections virtuelles
3. **[BUG-002]** Correction de la surbrillance des colonnes en drag-select

### Sprint 2 (UX & Gestion)

1. **[UI-003]** Loader animé pour les images
2. **[BUG-006]** Suppression des dossiers sources
3. **[UI-002]** Renommage des collections virtuelles
4. **[UI-004]** Uniformisation visuelle Move Items

### Sprint 3 (Advanced Features)

1. **[UI-005]** Tag Manager & Consolidation Intelligente
2. **[BUG-004/005]** Polissage Grid & Flow modes
