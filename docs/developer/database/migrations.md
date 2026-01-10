# 🗄️ Database Migrations - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src-tauri/src/` et `src/services/storage/db.ts`

---

## 📋 Vue d'Ensemble

Ce guide décrit le système de migrations de base de données de Lumina Portfolio. Les migrations assurent la cohérence du schéma lors des mises à jour de l'application.

---

## 🎯 Architecture des Migrations

### **Versionnement du Schéma**

```typescript
// Version actuelle du schéma
export const DB_VERSION = "1.0.0";

// Historique des versions
export const DB_VERSIONS = {
	"1.0.0": "Initial schema with collections, folders, metadata, tags",
	"1.1.0": "Added normalized tags system",
	"1.2.0": "Added smart collections",
	"1.3.0": "Added tag aliases and merges",
} as const;
```

### **Structure des Migrations**

```typescript
// src-tauri/src/migrations/mod.rs
pub mod v1_0_0;
pub mod v1_1_0;
pub mod v1_2_0;
pub mod v1_3_0;

pub type MigrationResult = Result<(), String>;

pub trait Migration {
    fn version(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn up(&self, db: &Connection) -> MigrationResult;
    fn down(&self, db: &Connection) -> MigrationResult;
}
```

---

## 🔄 Système de Migrations

### **Manager de Migrations**

```typescript
// src/services/storage/migrations.ts
export class MigrationManager {
	private db: Database;
	private currentVersion: string;

	constructor(db: Database) {
		this.db = db;
		this.currentVersion = "1.0.0";
	}

	async migrate(): Promise<void> {
		try {
			// 1. Créer la table de migrations si elle n'existe pas
			await this.createMigrationTable();

			// 2. Obtenir la version actuelle
			const currentDbVersion = await this.getCurrentVersion();

			// 3. Exécuter les migrations nécessaires
			if (currentDbVersion < this.currentVersion) {
				await this.runMigrations(currentDbVersion, this.currentVersion);
			}

			// 4. Mettre à jour la version
			await this.updateVersion(this.currentVersion);
		} catch (error) {
			throw new Error(`Migration failed: ${error.message}`);
		}
	}

	private async createMigrationTable(): Promise<void> {
		await this.db.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        version TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL,
        description TEXT
      )
    `);
	}

	private async getCurrentVersion(): Promise<string> {
		const result = await this.db.select("SELECT MAX(version) as version FROM migrations");
		return result[0]?.version || "0.0.0";
	}

	private async runMigrations(fromVersion: string, toVersion: string): Promise<void> {
		const migrations = this.getMigrationsBetween(fromVersion, toVersion);

		for (const migration of migrations) {
			console.log(`Running migration: ${migration.version} - ${migration.description}`);

			try {
				await migration.up(this.db);
				await this.recordMigration(migration);
			} catch (error) {
				console.error(`Migration ${migration.version} failed:`, error);
				throw error;
			}
		}
	}

	private async recordMigration(migration: Migration): Promise<void> {
		await this.db.execute(
			"INSERT INTO migrations (version, applied_at, description) VALUES (?, ?, ?)",
			[migration.version, Date.now(), migration.description]
		);
	}
}
```

---

## 📝 Migrations Spécifiques

### **Migration 1.0.0 - Schéma Initial**

```typescript
// src/services/storage/migrations/v1_0_0.ts
export const migration_1_0_0: Migration = {
	version: "1.0.0",
	description: "Initial schema with collections, folders, metadata, tags",

	async up(db: Database): Promise<void> {
		// Collections table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        lastOpenedAt INTEGER,
        isActive INTEGER DEFAULT 1
      )
    `);

		// Collection folders table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS collection_folders (
        id TEXT PRIMARY KEY,
        collectionId TEXT NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        addedAt INTEGER NOT NULL,
        FOREIGN KEY (collectionId) REFERENCES collections(id)
      )
    `);

		// Virtual folders table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS virtual_folders (
        id TEXT PRIMARY KEY,
        collectionId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        isVirtual INTEGER DEFAULT 1,
        sourceFolderId TEXT,
        FOREIGN KEY (collectionId) REFERENCES collections(id)
      )
    `);

		// Metadata table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        id TEXT PRIMARY KEY,
        collectionId TEXT,
        virtualFolderId TEXT,
        aiDescription TEXT,
        aiTags TEXT,
        aiTagsDetailed TEXT,
        colorTag TEXT,
        manualTags TEXT,
        isHidden INTEGER DEFAULT 0,
        lastModified INTEGER
      )
    `);

		// Tags table (legacy)
		await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalizedName TEXT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL,
        parentId TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (parentId) REFERENCES tags(id)
      )
    `);

		// Item tags relation
		await db.execute(`
      CREATE TABLE IF NOT EXISTS item_tags (
        itemId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        addedAt INTEGER NOT NULL,
        PRIMARY KEY (itemId, tagId),
        FOREIGN KEY (itemId) REFERENCES metadata(id),
        FOREIGN KEY (tagId) REFERENCES tags(id)
      )
    `);

		// Handles table (legacy)
		await db.execute(`
      CREATE TABLE IF NOT EXISTS handles (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL UNIQUE,
        isRoot INTEGER DEFAULT 0
      )
    `);
	},

	async down(db: Database): Promise<void> {
		// Drop all tables in reverse order
		await db.execute("DROP TABLE IF EXISTS item_tags");
		await db.execute("DROP TABLE IF EXISTS tags");
		await db.execute("DROP TABLE IF EXISTS metadata");
		await db.execute("DROP TABLE IF EXISTS virtual_folders");
		await db.execute("DROP TABLE IF EXISTS collection_folders");
		await db.execute("DROP TABLE IF EXISTS collections");
		await db.execute("DROP TABLE IF EXISTS handles");
	},
};
```

### **Migration 1.1.0 - Tags Normalisés**

```typescript
// src/services/storage/migrations/v1_1_0.ts
export const migration_1_1_0: Migration = {
	version: "1.1.0",
	description: "Added normalized tags system with enhanced features",

	async up(db: Database): Promise<void> {
		// Add new columns to tags table
		await db.execute(`
      ALTER TABLE tags ADD COLUMN normalizedName TEXT NOT NULL DEFAULT ''
    `);

		// Update existing tags with normalized names
		await db.execute(`
      UPDATE tags SET normalizedName = LOWER(TRIM(name))
      WHERE normalizedName = ''
    `);

		// Add tag merges table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS tag_merges (
        id TEXT PRIMARY KEY,
        targetTagId TEXT NOT NULL,
        sourceTagId TEXT NOT NULL,
        sourceTagName TEXT,
        mergedAt INTEGER NOT NULL,
        mergedBy TEXT,
        itemIdsJson TEXT
      )
    `);

		// Add tag aliases table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS tag_aliases (
        id TEXT PRIMARY KEY,
        aliasName TEXT NOT NULL,
        targetTagId TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);

		// Add tag ignore matches table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS tag_ignore_matches (
        id TEXT PRIMARY KEY,
        tagId1 TEXT NOT NULL,
        tagId2 TEXT NOT NULL,
        reason TEXT,
        createdAt INTEGER NOT NULL
      )
    `);

		// Create indexes for performance
		await db.execute("CREATE INDEX IF NOT EXISTS idx_tags_normalized_name ON tags(normalizedName)");
		await db.execute("CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type)");
		await db.execute("CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(itemId)");
		await db.execute("CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tagId)");
	},

	async down(db: Database): Promise<void> {
		// Drop new tables
		await db.execute("DROP TABLE IF EXISTS tag_ignore_matches");
		await db.execute("DROP TABLE IF EXISTS tag_aliases");
		await db.execute("DROP TABLE IF EXISTS tag_merges");

		// Drop indexes
		await db.execute("DROP INDEX IF EXISTS idx_tags_normalized_name");
		await db.execute("DROP INDEX IF EXISTS idx_tags_type");
		await db.execute("DROP INDEX IF EXISTS idx_item_tags_item");
		await db.execute("DROP INDEX IF EXISTS idx_item_tags_tag");

		// Remove column (SQLite doesn't support DROP COLUMN, so recreate table)
		await db.execute(`
      CREATE TABLE tags_backup AS SELECT id, name, type, confidence, parentId, createdAt FROM tags
    `);
		await db.execute("DROP TABLE tags");
		await db.execute(`
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL,
        parentId TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (parentId) REFERENCES tags(id)
      )
    `);
		await db.execute("INSERT INTO tags SELECT * FROM tags_backup");
		await db.execute("DROP TABLE tags_backup");
	},
};
```

### **Migration 1.2.0 - Smart Collections**

```typescript
// src/services/storage/migrations/v1_2_0.ts
export const migration_1_2_0: Migration = {
	version: "1.2.0",
	description: "Added smart collections with dynamic filters",

	async up(db: Database): Promise<void> {
		// Add smart collections table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS smart_collections (
        id TEXT PRIMARY KEY,
        collectionId TEXT,
        name TEXT NOT NULL,
        filterRules TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER,
        FOREIGN KEY (collectionId) REFERENCES collections(id)
      )
    `);

		// Add collection type column
		await db.execute(`
      ALTER TABLE collections ADD COLUMN type TEXT DEFAULT 'manual'
    `);

		// Update existing collections
		await db.execute(`
      UPDATE collections SET type = 'manual' WHERE type IS NULL
    `);

		// Create indexes
		await db.execute(
			"CREATE INDEX IF NOT EXISTS idx_smart_collections_collection ON smart_collections(collectionId)"
		);
	},

	async down(db: Database): Promise<void> {
		await db.execute("DROP TABLE IF EXISTS smart_collections");

		// Remove column (SQLite workaround)
		await db.execute(`
      CREATE TABLE collections_backup AS SELECT id, name, createdAt, lastOpenedAt, isActive FROM collections
    `);
		await db.execute("DROP TABLE collections");
		await db.execute(`
      CREATE TABLE collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        lastOpenedAt INTEGER,
        isActive INTEGER DEFAULT 1
      )
    `);
		await db.execute("INSERT INTO collections SELECT * FROM collections_backup");
		await db.execute("DROP TABLE collections_backup");
	},
};
```

### **Migration 1.3.0 - Tag System Enhanced**

```typescript
// src/services/storage/migrations/v1_3_0.ts
export const migration_1_3_0: Migration = {
	version: "1.3.0",
	description: "Enhanced tag system with improved performance",

	async up(db: Database): Promise<void> {
		// Add tag statistics table
		await db.execute(`
      CREATE TABLE IF NOT EXISTS tag_stats (
        tagId TEXT PRIMARY KEY,
        itemCount INTEGER DEFAULT 0,
        lastUsed INTEGER,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (tagId) REFERENCES tags(id)
      )
    `);

		// Populate tag stats
		await db.execute(`
      INSERT INTO tag_stats (tagId, itemCount, createdAt)
      SELECT tagId, COUNT(*), MIN(addedAt)
      FROM item_tags
      GROUP BY tagId
    `);

		// Add tag categories
		await db.execute(`
      ALTER TABLE tags ADD COLUMN category TEXT DEFAULT 'general'
    `);

		// Update tag categories based on type
		await db.execute(`
      UPDATE tags SET category = 'ai' WHERE type = 'ai'
    `);
		await db.execute(`
      UPDATE tags SET category = 'manual' WHERE type = 'manual'
    `);
		await db.execute(`
      UPDATE tags SET category = 'ai_detailed' WHERE type = 'ai_detailed'
    `);

		// Create performance indexes
		await db.execute("CREATE INDEX IF NOT EXISTS idx_tag_stats_item_count ON tag_stats(itemCount)");
		await db.execute("CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category)");
	},

	async down(db: Database): Promise<void> {
		await db.execute("DROP TABLE IF EXISTS tag_stats");

		// Remove column
		await db.execute(`
      CREATE TABLE tags_backup AS SELECT id, name, normalizedName, type, confidence, parentId, createdAt FROM tags
    `);
		await db.execute("DROP TABLE tags");
		await db.execute(`
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalizedName TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL,
        confidence REAL,
        parentId TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (parentId) REFERENCES tags(id)
      )
    `);
		await db.execute("INSERT INTO tags SELECT * FROM tags_backup");
		await db.execute("DROP TABLE tags_backup");
	},
};
```

---

## 🔄 Exécution des Migrations

### **Initialisation de la Base de Données**

```typescript
// src/services/storage/db.ts
export const initializeDatabase = async (): Promise<Database> => {
	const db = await Database.load("sqlite:lumina.db");

	// Exécuter les migrations
	const migrationManager = new MigrationManager(db);
	await migrationManager.migrate();

	return db;
};
```

### **Vérification des Migrations**

```typescript
// src/services/storage/migrations.ts
export const verifyMigrations = async (db: Database): Promise<boolean> => {
	try {
		// Vérifier que toutes les migrations ont été appliquées
		const result = await db.select(`
      SELECT COUNT(*) as count FROM migrations
    `);

		const expectedMigrations = Object.keys(DB_VERSIONS).length;
		const appliedMigrations = result[0].count;

		return appliedMigrations === expectedMigrations;
	} catch (error) {
		console.error("Migration verification failed:", error);
		return false;
	}
};
```

---

## 🔧 Outils de Migration

### **Générateur de Migration**

```typescript
// scripts/generate-migration.ts
export const generateMigration = (version: string, description: string): void => {
	const template = `
export const migration_${version.replace(/\./g, "_")}: Migration = {
  version: '${version}',
  description: '${description}',

  async up(db: Database): Promise<void> {
    // TODO: Implement migration up
  },

  async down(db: Database): Promise<void> {
    // TODO: Implement migration down
  }
};
`;

	const filename = `src/services/storage/migrations/v${version.replace(/\./g, "_")}.ts`;
	fs.writeFileSync(filename, template);
	console.log(`Generated migration: ${filename}`);
};
```

### **Validation de Migration**

```typescript
// src/services/storage/migrations.ts
export const validateMigration = (migration: Migration): boolean => {
	try {
		// Vérifier que la version est valide
		if (!migration.version.match(/^\d+\.\d+\.\d+$/)) {
			throw new Error(`Invalid version format: ${migration.version}`);
		}

		// Vérifier que la description n'est pas vide
		if (!migration.description || migration.description.trim().length === 0) {
			throw new Error("Migration description cannot be empty");
		}

		return true;
	} catch (error) {
		console.error(`Migration validation failed: ${error.message}`);
		return false;
	}
};
```

---

## 📊 Monitoring des Migrations

### **Logs de Migration**

```typescript
// src/services/storage/migrations.ts
export class MigrationLogger {
	private logs: MigrationLog[] = [];

	log(level: "info" | "warn" | "error", message: string, data?: any): void {
		const log: MigrationLog = {
			timestamp: Date.now(),
			level,
			message,
			data,
		};

		this.logs.push(log);
		console.log(`[${level.toUpperCase()}] ${message}`, data);
	}

	getLogs(): MigrationLog[] {
		return this.logs;
	}

	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}
}

interface MigrationLog {
	timestamp: number;
	level: "info" | "warn" | "error";
	message: string;
	data?: any;
}
```

### **Statistiques de Migration**

```typescript
// src/services/storage/migrations.ts
export const getMigrationStats = async (db: Database): Promise<MigrationStats> => {
	const result = await db.select(`
    SELECT
      COUNT(*) as total_migrations,
      MAX(applied_at) as last_migration,
      GROUP_CONCAT(version) as versions
    FROM migrations
  `);

	const stats: MigrationStats = {
		totalMigrations: result[0]?.total_migrations || 0,
		lastMigration: result[0]?.last_migration || null,
		versions: result[0]?.versions?.split(",") || [],
	};

	return stats;
};

interface MigrationStats {
	totalMigrations: number;
	lastMigration: number | null;
	versions: string[];
}
```

---

## 🔄 Rollback des Migrations

### **Rollback Manuel**

```typescript
// src/services/storage/migrations.ts
export const rollbackMigration = async (db: Database, targetVersion: string): Promise<void> => {
	try {
		const currentVersion = await getCurrentVersion(db);

		if (currentVersion === targetVersion) {
			console.log(`Already at version ${targetVersion}`);
			return;
		}

		const migrations = getMigrationsBetween(targetVersion, currentVersion);

		// Exécuter les migrations en ordre inverse
		for (const migration of migrations.reverse()) {
			console.log(`Rolling back migration: ${migration.version}`);
			await migration.down(db);

			// Supprimer l'enregistrement de migration
			await db.execute("DELETE FROM migrations WHERE version = ?", [migration.version]);
		}

		console.log(`Rollback completed to version ${targetVersion}`);
	} catch (error) {
		console.error(`Rollback failed: ${error.message}`);
		throw error;
	}
};
```

---

## 🧪 Tests de Migrations

### **Tests Unitaires**

```typescript
// tests/migrations.test.ts
describe("Database Migrations", () => {
	let db: Database;

	beforeEach(async () => {
		db = await Database.load(":memory:");
	});

	test("should run initial migration", async () => {
		const migration = migration_1_0_0;

		await migration.up(db);

		// Vérifier que les tables existent
		const tables = await db.select(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);

		expect(tables.map((t) => t.name)).toContain("collections");
		expect(tables.map((t) => t.name)).toContain("metadata");
		expect(tables.map((t) => t.name)).toContain("tags");
	});

	test("should rollback initial migration", async () => {
		const migration = migration_1_0_0;

		await migration.up(db);
		await migration.down(db);

		// Vérifier que les tables n'existent plus
		const tables = await db.select(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);

		expect(tables.map((t) => t.name)).not.toContain("collections");
		expect(tables.map((t) => t.name)).not.toContain("metadata");
	});
});
```

### **Tests d'Intégration**

```typescript
// tests/migration-integration.test.ts
describe("Migration Integration", () => {
	test("should migrate from 1.0.0 to 1.3.0", async () => {
		const db = await Database.load(":memory:");
		const migrationManager = new MigrationManager(db);

		// Simuler une base de données en version 1.0.0
		await migration_1_0_0.up(db);
		await db.execute(`
      INSERT INTO migrations (version, applied_at, description)
      VALUES ('1.0.0', ${Date.now()}, 'Initial schema')
    `);

		// Exécuter les migrations
		await migrationManager.migrate();

		// Vérifier que toutes les migrations ont été appliquées
		const result = await db.select("SELECT version FROM migrations ORDER BY version");
		expect(result.map((r) => r.version)).toEqual(["1.0.0", "1.1.0", "1.2.0", "1.3.0"]);
	});
});
```

---

## 📚 Références

### **SQLite Documentation**

- **[SQLite ALTER TABLE](https://sqlite.org/lang_altertable.html)** : Documentation ALTER TABLE
- **[SQLite Foreign Keys](https://sqlite.org/foreignkeys.html)** : Documentation foreign keys
- **[SQLite Transactions](https://sqlite.org/lang_transaction.html)** : Documentation transactions

### **Database Migration Patterns**

- **[Database Migrations](https://flywaydb.org/documentation/)** : Patterns de migration
- **[Version Control](https://www.liquibase.org/documentation/)** : Version control de schéma
- **[Migration Testing](https://martinfowler.com/articles/migrationTesting.html)** : Tests de migration

### **TypeScript Database**

- **[Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)** : SQLite pour TypeScript
- **[TypeORM](https://typeorm.io/)** : ORM TypeScript
- **[Prisma](https://www.prisma.io/)** : Database toolkit

---

## 🎯 Checklist de Migration

### **✅ Checklist de Développement**

- [ ] **Version** : Version unique et incrémentielle
- [ ] **Description** : Description claire de la migration
- [ ] **Up/Down** : Migration up et down implémentées
- [ ] **Tests** : Tests unitaires et d'intégration
- [ ] **Rollback** : Rollback possible et testé
- [ ] **Performance** : Impact sur la performance évalué

### **✅ Checklist de Déploiement**

- [ ] **Backup** : Backup de la base de données avant migration
- [ ] **Test** : Migration testée en environnement de test
- [ ] **Monitoring** : Logs et monitoring en place
- [ ] **Rollback** : Plan de rollback prêt
- [ ] **Validation** : Validation post-migration

### **✅ Checklist de Sécurité**

- [ ] **Permissions** : Vérification des permissions
- [ ] **Data Integrity** : Intégrité des données préservée
- [ ] **Backup** : Backup automatique avant migration
- [ ] **Audit** : Audit trail des modifications

---

## 🎯 Patterns Émergents

### **Future Patterns**

- **Zero-Downtime Migrations** : Migrations sans temps d'arrêt
- **Blue-Green Deployments** : Déploiements bleu-vert
- **Canary Releases** : Releases progressifs
- **Automated Rollback** : Rollback automatique

### **Évolutions**

- **Schema Registry** : Registre de schéma centralisé
- **Migration DSL** : Langage spécifique de migration
- **Data Validation** : Validation automatique des données
- **Performance Monitoring** : Monitoring en temps réel

---

**Le système de migrations de Lumina Portfolio assure une évolution sûre et contrôlée de la base de données ! 🗄️**
