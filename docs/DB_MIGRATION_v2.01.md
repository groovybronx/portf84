## Notes d'Architecture - Migration DB v2.01

### Problème actuel

Le schéma SQLite utilise `CREATE TABLE IF NOT EXISTS` qui ne permet pas d'ajouter de nouvelles colonnes aux tables existantes.

### Nouvelles colonnes nécessaires

1. `virtual_folders.sourceFolderId` TEXT - Lien vers le dossier source
2. `metadata.isHidden` INTEGER DEFAULT 0 - Suppression virtuelle

### Options

#### Option A : ALTER TABLE au runtime (Auto-migration)

```sql
-- Vérifier si la colonne existe, sinon l'ajouter
PRAGMA table_info(virtual_folders);
-- Si sourceFolderId n'existe pas:
ALTER TABLE virtual_folders ADD COLUMN sourceFolderId TEXT;

PRAGMA table_info(metadata);
-- Si isHidden n'existe pas:
ALTER TABLE metadata ADD COLUMN isHidden INTEGER DEFAULT 0;
```

**Avantage** : Préserve les données existantes
**Inconvénient** : Complexité de migration

####Option B : DB Reset (Recommandé, validé par user)

- Supprimer `lumina.db`
- Le schéma sera recréé proprement au prochain lancement
- L'utilisateur doit re-créer ses projets

**Avantage** : Simple, propre, nouvelle terminologie cohérente
**Inconvénient** : Perte des données existantes (accepté)

### Implémentation retenue : Option B

Les nouveaux champs sont déjà dans le code des nouvelles fonctions :

- `createShadow Folder` utilise `sourceFolderId`
- `saveVirtualFolder` supporte `sourceFolderId`
- `hideImage` utilise `isHidden`

**Action pour l'utilisateur** : Au prochain test, supprimer manuellement le fichier `lumina.db` ou utiliser `storageService.resetDatabase()` (TODO: implémenter la suppression du fichier DB via Tauri FS API).

### Prochaine étape (Phase 3)

Adapter `LibraryContext` et `CollectionsContext` pour utiliser les shadow folders.
