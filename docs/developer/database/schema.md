# 🗄️ Database Schema - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src-tauri/src/lib.rs` et `src/services/storage/db.ts`

---

## 📋 Vue d'Ensemble

Lumina Portfolio utilise SQLite comme base de données locale avec le plugin Tauri SQL. Le schéma est organisé autour des collections, dossiers virtuels, métadonnées et système de tags normalisé.

---

## 🏗️ Architecture Database

### **Stack Technique**

- **SQLite** : Base de données locale embarquée
- **Tauri SQL Plugin** : Interface TypeScript/SQLite
- **Connection String** : `sqlite:lumina.db` (par défaut)
- **Singleton Pattern** : Une seule connexion par application

### **Configuration**

```typescript
// Connection string
const connectionString = `sqlite:${DEFAULT_DB_NAME}`;

// Path personnalisé possible via localStorage
localStorage.setItem(STORAGE_KEYS.DB_PATH, "/custom/path");
```

---

## 📊 Structure des Tables

### **1. Collections** - Espaces de Travail

```sql
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,           -- UUID unique
  name TEXT NOT NULL,            -- Nom de la collection
  createdAt INTEGER NOT NULL,    -- Timestamp création
  lastOpenedAt INTEGER,          -- Dernière ouverture
  isActive INTEGER DEFAULT 1      -- État actif (0/1)
);
```

**Usage** : Espaces de travail principaux (ex: "Vacances 2024", "Projet Photo")

### **2. collection_folders** - Dossiers Sources

```sql
CREATE TABLE IF NOT EXISTS collection_folders (
  id TEXT PRIMARY KEY,           -- UUID unique
  collectionId TEXT NOT NULL,    -- Collection parente
  path TEXT NOT NULL,            -- Chemin système absolu
  name TEXT NOT NULL,            -- Nom affiché
  addedAt INTEGER NOT NULL       -- Timestamp ajout
);
```

**Usage** : Dossiers physiques du système liés à une collection

### **3. virtual_folders** - Dossiers Virtuels

```sql
CREATE TABLE IF NOT EXISTS virtual_folders (
  id TEXT PRIMARY KEY,           -- UUID unique
  collectionId TEXT NOT NULL,    -- Collection parente
  name TEXT NOT NULL,            -- Nom du dossier
  createdAt INTEGER NOT NULL,    -- Timestamp création
  isVirtual INTEGER DEFAULT 1,  -- Type (0=physique, 1=virtuel)
  sourceFolderId TEXT,           -- Source (pour shadow folders)
  FOREIGN KEY (collectionId) REFERENCES collections(id)
);
```

**Usage** : Dossiers créés dans l'application (organisés par tags, couleur, etc.)

### **4. metadata** - Métadonnées des Fichiers

```sql
CREATE TABLE IF NOT EXISTS metadata (
  id TEXT PRIMARY KEY,           -- Path du fichier (clé)
  collectionId TEXT,             -- Collection parente
  virtualFolderId TEXT,          -- Dossier virtuel
  aiDescription TEXT,            -- Description générée par IA
  aiTags TEXT,                   -- Tags IA (JSON string)
  aiTagsDetailed TEXT,           -- Tags détaillés (JSON string)
  colorTag TEXT,                 -- Code hexa couleur
  manualTags TEXT,               -- Tags manuels (JSON string)
  isHidden INTEGER DEFAULT 0,   -- Masqué (0/1)
  lastModified INTEGER           -- Timestamp modification fichier
);
```

**Usage** : Métadonnées enrichies pour chaque fichier photo

---

## 🏷️ Système de Tags Normalisé

### **5. tags** - Tags Uniques

```sql
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,           -- UUID unique
  name TEXT NOT NULL,            -- Nom du tag
  normalizedName TEXT NOT NULL,  -- Nom normalisé (lowercase)
  type TEXT NOT NULL,            -- Type: 'ai' | 'manual' | 'ai_detailed'
  confidence REAL,               -- Score confiance (0-1)
  parentId TEXT,                 -- Tag parent (hiérarchie)
  createdAt INTEGER NOT NULL,    -- Timestamp création
  FOREIGN KEY (parentId) REFERENCES tags(id)
);
```

### **6. item_tags** - Liaison Items ↔ Tags

```sql
CREATE TABLE IF NOT EXISTS item_tags (
  itemId TEXT NOT NULL,          -- ID de l'item (metadata.id)
  tagId TEXT NOT NULL,           -- ID du tag
  addedAt INTEGER NOT NULL,      -- Timestamp ajout
  PRIMARY KEY (itemId, tagId),
  FOREIGN KEY (itemId) REFERENCES metadata(id),
  FOREIGN KEY (tagId) REFERENCES tags(id)
);
```

### **7. tag_merges** - Historique de Fusions

```sql
CREATE TABLE IF NOT EXISTS tag_merges (
  id TEXT PRIMARY KEY,           -- UUID unique
  targetTagId TEXT NOT NULL,    -- Tag cible (conservé)
  sourceTagId TEXT NOT NULL,    -- Tag source (fusionné)
  sourceTagName TEXT,            -- Nom original du tag source
  mergedAt INTEGER NOT NULL,     -- Timestamp fusion
  mergedBy TEXT,                 -- Utilisateur/IA qui a fusionné
  itemIdsJson TEXT               -- IDs des items affectés (JSON)
);
```

### **8. tag_aliases** - Alias de Tags

```sql
CREATE TABLE IF NOT EXISTS tag_aliases (
  id TEXT PRIMARY KEY,           -- UUID unique
  aliasName TEXT NOT NULL,      -- Nom de l'alias
  targetTagId TEXT NOT NULL,    -- Tag cible
  createdAt INTEGER NOT NULL     -- Timestamp création
);
```

---

## 🔧 Tables Utilitaires

### **9. handles** - Handles Legacy (Déprécié)

```sql
CREATE TABLE IF NOT EXISTS handles (
  id TEXT PRIMARY KEY,           -- UUID unique
  path TEXT NOT NULL UNIQUE,    -- Chemin système
  isRoot INTEGER DEFAULT 0      -- Racine (0/1)
);
```

**Note** : Table legacy, sera supprimée dans une migration future

### **10. tag_ignore_matches** - Exclusions de Fusion

```sql
CREATE TABLE IF NOT EXISTS tag_ignore_matches (
  id TEXT PRIMARY KEY,           -- UUID unique
  tagId1 TEXT NOT NULL,          -- Premier tag
  tagId2 TEXT NOT NULL,          -- Second tag
  reason TEXT,                   -- Raison de l'exclusion
  createdAt INTEGER NOT NULL     -- Timestamp création
);
```

### **11. smart_collections** - Collections Intelligentes

```sql
CREATE TABLE IF NOT EXISTS smart_collections (
  id TEXT PRIMARY KEY,           -- UUID unique
  collectionId TEXT,            -- Collection parente
  name TEXT NOT NULL,            -- Nom de la smart collection
  filterRules TEXT,              -- Règles de filtrage (JSON)
  createdAt INTEGER NOT NULL,    -- Timestamp création
  updatedAt INTEGER              -- Timestamp mise à jour
);
```

---

## 🔗 Relations et Clés Étrangères

### **Diagramme des Relations**

```
collections (1) ──── (N) collection_folders
collections (1) ──── (N) virtual_folders
collections (1) ──── (N) metadata

virtual_folders (1) ──── (N) metadata

tags (1) ──── (N) item_tags
metadata (1) ──── (N) item_tags

tags (1) ──── (N) tags (hiérarchie)
tags (1) ──── (N) tag_merges (source/target)
tags (1) ──── (N) tag_aliases
```

### **Contraintes d'Intégrité**

```sql
-- Clés primaires
PRIMARY KEY (id)
PRIMARY KEY (itemId, tagId)  -- item_tags

-- Clés étrangères
FOREIGN KEY (collectionId) REFERENCES collections(id)
FOREIGN KEY (virtualFolderId) REFERENCES virtual_folders(id)
FOREIGN KEY (itemId) REFERENCES metadata(id)
FOREIGN KEY (tagId) REFERENCES tags(id)
FOREIGN KEY (parentId) REFERENCES tags(id)
```

---

## 📝 Types de Données

### **Types Utilisés**

- **TEXT** : Chaînes de caractères (UUID, noms, chemins)
- **INTEGER** : Nombres entiers (timestamps, booléens 0/1)
- **REAL** : Nombres flottants (scores de confiance)
- **JSON (dans TEXT)** : Données structurées (arrays, objets)

### **Conventions**

- **IDs** : UUID strings (ex: "550e8400-e29b-41d4-a716-446655440000")
- **Timestamps** : Unix timestamps en millisecondes
- **Booléens** : INTEGER 0 (false) ou 1 (true)
- **JSON** : String JSON valide pour les arrays/objets

---

## 🔄 Patterns de Données

### **Métadonnées JSON**

```json
// aiTags field
["sunset", "beach", "ocean", "golden-hour"]

// aiTagsDetailed field
[
  { "name": "sunset", "confidence": 0.95 },
  { "name": "beach", "confidence": 0.87 },
  { "name": "ocean", "confidence": 0.92 }
]

// manualTags field
["vacances", "été-2024", "famille"]
```

### **Hiérarchie de Tags**

```sql
-- Tag parent
INSERT INTO tags (id, name, normalizedName, type, parentId)
VALUES ('tag-1', 'nature', 'nature', 'manual', NULL);

-- Tags enfants
INSERT INTO tags (id, name, normalizedName, type, parentId)
VALUES ('tag-2', 'paysage', 'paysage', 'manual', 'tag-1'),
       ('tag-3', 'animaux', 'animaux', 'manual', 'tag-1');
```

---

## 🚀 Performance et Index

### **Index Recommandés**

```sql
-- Recherche rapide par collection
CREATE INDEX idx_metadata_collection ON metadata(collectionId);

-- Recherche rapide par dossier
CREATE INDEX idx_metadata_folder ON metadata(virtualFolderId);

-- Recherche rapide de tags
CREATE INDEX idx_tags_name ON tags(normalizedName);
CREATE INDEX idx_tags_type ON tags(type);

-- Jointures optimisées
CREATE INDEX idx_item_tags_item ON item_tags(itemId);
CREATE INDEX idx_item_tags_tag ON item_tags(tagId);
```

### **Optimisations**

- **Singleton connection** : Évite les connexions multiples
- **Prepared statements** : Via Tauri SQL plugin
- **Batch operations** : Transactions pour les mises à jour multiples

---

## 🔍 Requêtes Courantes

### **Récupérer les Photos d'une Collection**

```sql
SELECT m.*, vf.name as folderName
FROM metadata m
LEFT JOIN virtual_folders vf ON m.virtualFolderId = vf.id
WHERE m.collectionId = ?
ORDER BY m.lastModified DESC;
```

### **Rechercher par Tags**

```sql
SELECT DISTINCT m.*
FROM metadata m
JOIN item_tags it ON m.id = it.itemId
JOIN tags t ON it.tagId = t.id
WHERE t.normalizedName LIKE '%?%'
ORDER BY m.lastModified DESC;
```

### **Statistiques de Tags**

```sql
SELECT t.name, COUNT(it.itemId) as count
FROM tags t
JOIN item_tags it ON t.id = it.tagId
GROUP BY t.id, t.name
ORDER BY count DESC;
```

---

## 🛠️ Commandes Tauri

### **Backend Rust**

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn get_image_dimensions(path: String) -> Result<ImageDimensions, String> {
    match imagesize::size(&path) {
        Ok(dim) => {
            let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
            Ok(ImageDimensions {
                width: dim.width,
                height: dim.height,
                size,
            })
        },
        Err(e) => Err(e.to_string()),
    }
}
```

### **Plugins Tauri Utilisés**

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())  // Database
    .plugin(tauri_plugin_fs::init())                        // File system
    .plugin(tauri_plugin_dialog::init())                    // Dialogues
    .plugin(tauri_plugin_os::init())                        // Info système
    .plugin(tauri_plugin_process::init())                   // Processus
```

---

## 📝 Migration et Évolution

### **Version Actuelle** : v1.0

- Collections et dossiers virtuels
- Système de tags normalisé
- Métadonnées IA enrichies

### **Futures Évolutions**

- **v1.1** : Smart collections avec filtres complexes
- **v1.2** : Indexation 全文 pour recherche
- **v2.0** : Support multi-database

### **Migration Patterns**

```sql
-- Exemple de migration
ALTER TABLE metadata ADD COLUMN aiDescription TEXT;
UPDATE metadata SET aiDescription = generated_description WHERE aiDescription IS NULL;
```

---

## 📚 Références

- **Code source** : `src-tauri/src/lib.rs`
- **Service DB** : `src/services/storage/db.ts`
- **Types DB** : `src/shared/types/database.ts`
- **Plugin SQL** : `@tauri-apps/plugin-sql`

---

## 🔧 Debugging et Maintenance

### **Commandes SQL Utiles**

```sql
-- Vérifier l'intégrité
PRAGMA integrity_check;

-- Analyser les performances
EXPLAIN QUERY PLAN SELECT * FROM metadata WHERE collectionId = ?;

-- Nettoyer les tags orphelins
DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tagId FROM item_tags);
```

### **Backup et Restore**

```bash
# Export
sqlite3 lumina.db .dump > backup.sql

# Import
sqlite3 new_lumina.db < backup.sql
```
