# Spécification : Gestionnaire de Tags avec Consolidation

## UI-005 : Gestionnaire de Tags avec Consolidation Intelligente

### Problématique

Au fur et à mesure que les images sont taggées (manuellement ou par AI), le nombre de tags dans la DB augmente exponentiellement. Beaucoup de tags ont des significations proches ou sont des variations du même concept (synonymes, pluriels, langues différentes).

### Objectifs

1. **Réduire la fragmentation** des tags
2. **Faciliter la recherche** en regroupant concepts similaires
3. **Améliorer la cohérence** du système de tags
4. **Suggérer automatiquement** des consolidations
5. **Support multilingue** : Adapter la consolidation à la langue de l'utilisateur (Français/Anglais)

### Paramètres de Configuration

- **Langue de préférence** : Menu déroulant [Français / Anglais] pour orienter les algorithmes de consolidation.
- **Analyse Sémantique (Gemini)** : Bouton Toggle Switch pour activer/désactiver l'analyse par IA (contrôle des coûts/tokens).

### Fonctionnalités Clés

#### 1. Interface de Gestion

- Liste exhaustive des tags avec statistiques d'utilisation.
- Actions : Renommer, Fusionner, Alias, Supprimer.
- Contrôles globaux pour la langue et l'IA.

#### 2. Intelligence & Similarité

- Algorithmes textuels (Levenshtein) pour les fautes de frappe et variations simples.
- Analyse sémantique via Gemini pour les synonymes conceptuels (ex: "Portrait" et "Face").
- Regroupement automatique par patterns (pluriels, b&w vs monochrome).

#### 3. Workflow de Fusion

1. Détection automatique des doublons potentiels.
2. Revue par l'utilisateur via une interface dédiée.
3. Fusion atomique en base de données (mise à jour de toutes les métadonnées liées).
4. Tracking historique des fusions effectuées.

### Architecture Technique

- **Base de données** : Nouvelles tables `tag_merges` et `tag_aliases`.
- **Backend (Tauri/Rust/TS)** : Services de calcul de similarité et intégration Gemini.
- **Frontend (React)** : Composants `TagManager`, `MergeModal` et `SuggestionsPanel`.

### Priorité & Effort

- **Priorité** : Moyenne (Crucial pour la scalabilité à long terme)
- **Effort estimé** : 2-3 jours de développement
