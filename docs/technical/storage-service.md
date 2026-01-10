# Storage Service

## Overview

Le Storage Service de Lumina Portfolio est une couche d'abstraction unifiée qui gère toutes les opérations de stockage de l'application. Il combine SQLite pour la persistance des données, Tauri pour l'accès système sécurisé, et des optimisations pour la performance.

## Architecture

### Modular Structure

Le service est organisé en modules spécialisés dans `src/services/storage/`:

```
src/services/storage/
├── index.ts          # Point d'entrée principal
├── db.ts            # Connexion et initialisation SQLite
├── collections.ts   # Opérations CRUD sur les collections
├── folders.ts       # Dossiers virtuels et shadow folders
├── metadata.ts      # Métadonnées des items
├── handles.ts       # Gestion des handles de répertoires
└── tags.ts          # Gestion des tags
```

### Main Entry Point

`src/services/storageService.ts` sert de façade:

```typescript
/**
 * Storage Service - Main Entry Point
 *
 * This file is now a re-export of the modular storage service.
 * All functionality has been split into separate modules in ./storage/
 */

// Re-export everything from the modular storage service
export { storageService } from "./storage";

// Also export individual functions for direct imports
export * from "./storage";
```

## Database Layer

### SQLite Integration

Utilisation de `@tauri-apps/plugin-sql` pour la gestion SQLite:

```typescript
import { Database } from "@tauri-apps/plugin-sql";

// Connection initialization
const db = await Database.load("sqlite:lumina_portfolio.db");
```

### Schema Design

Base de données avec 11 tables principales:

#### Core Tables

- **collections**: Collections d'images
- **folders**: Dossiers virtuels
- **items**: Métadonnées des images
- **tags**: Tags et catégories
- **item_tags**: Association many-to-many items/tags

#### Supporting Tables

- **handles**: Handles de répertoires Tauri
- **metadata**: Métadonnées EXIF et AI
- **settings**: Configuration utilisateur
- **sessions**: Sessions utilisateur
- **migrations**: Version du schema

## Core Services

### Collections Service

```typescript
// src/services/storage/collections.ts
export const collectionsService = {
	async createCollection(name: string, description?: string): Promise<Collection> {
		const id = generateId();
		await db.execute(
			"INSERT INTO collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			[id, name, description, Date.now(), Date.now()]
		);
		return { id, name, description, created_at: Date.now(), updated_at: Date.now() };
	},

	async getCollections(): Promise<Collection[]> {
		return await db.select("SELECT * FROM collections ORDER BY updated_at DESC");
	},

	async updateCollection(id: string, updates: Partial<Collection>): Promise<void> {
		const fields = Object.keys(updates)
			.map((key) => `${key} = ?`)
			.join(", ");
		const values = Object.values(updates);
		await db.execute(`UPDATE collections SET ${fields}, updated_at = ? WHERE id = ?`, [
			...values,
			Date.now(),
			id,
		]);
	},

	async deleteCollection(id: string): Promise<void> {
		await db.execute("DELETE FROM collections WHERE id = ?", [id]);
	},
};
```

### Folders Service

```typescript
// src/services/storage/folders.ts
export const foldersService = {
	async createFolder(name: string, parentId?: string, isShadow = false): Promise<Folder> {
		const id = generateId();
		await db.execute(
			"INSERT INTO folders (id, name, parent_id, is_shadow, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			[id, name, parentId, isShadow, Date.now(), Date.now()]
		);
		return {
			id,
			name,
			parent_id: parentId,
			is_shadow: isShadow,
			created_at: Date.now(),
			updated_at: Date.now(),
		};
	},

	async getFolders(parentId?: string): Promise<Folder[]> {
		const query = parentId
			? "SELECT * FROM folders WHERE parent_id = ? ORDER BY name ASC"
			: "SELECT * FROM folders WHERE parent_id IS NULL ORDER BY name ASC";
		return await db.select(query, parentId ? [parentId] : []);
	},

	async getShadowFolders(): Promise<Folder[]> {
		return await db.select("SELECT * FROM folders WHERE is_shadow = 1 ORDER BY name ASC");
	},
};
```

### Items Service

```typescript
// src/services/storage/metadata.ts
export const itemsService = {
	async createItem(item: Omit<PortfolioItem, "id">): Promise<PortfolioItem> {
		const id = generateId();
		await db.execute(
			`INSERT INTO items (id, name, url, folder_id, collection_id, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				id,
				item.name,
				item.url,
				item.folderId,
				item.collectionId,
				JSON.stringify(item.metadata),
				Date.now(),
				Date.now(),
			]
		);
		return { ...item, id };
	},

	async getItems(collectionId?: string, folderId?: string): Promise<PortfolioItem[]> {
		let query = "SELECT * FROM items WHERE 1=1";
		const params: any[] = [];

		if (collectionId) {
			query += " AND collection_id = ?";
			params.push(collectionId);
		}

		if (folderId) {
			query += " AND folder_id = ?";
			params.push(folderId);
		}

		query += " ORDER BY updated_at DESC";

		const rows = await db.select(query, params);
		return rows.map((row) => ({
			...row,
			metadata: JSON.parse(row.metadata || "{}"),
		}));
	},
};
```

### Tags Service

```typescript
// src/services/storage/tags.ts
export const tagsService = {
	async createTag(name: string, color?: string, category?: string): Promise<Tag> {
		const id = generateId();
		await db.execute(
			"INSERT INTO tags (id, name, color, category, created_at) VALUES (?, ?, ?, ?, ?)",
			[id, name, color, category, Date.now()]
		);
		return { id, name, color, category, created_at: Date.now() };
	},

	async getTags(): Promise<Tag[]> {
		return await db.select("SELECT * FROM tags ORDER BY name ASC");
	},

	async addItemTag(itemId: string, tagId: string): Promise<void> {
		await db.execute(
			"INSERT OR IGNORE INTO item_tags (item_id, tag_id, created_at) VALUES (?, ?, ?)",
			[itemId, tagId, Date.now()]
		);
	},

	async removeItemTag(itemId: string, tagId: string): Promise<void> {
		await db.execute("DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?", [itemId, tagId]);
	},

	async getItemTags(itemId: string): Promise<Tag[]> {
		return await db.select(
			`
      SELECT t.* FROM tags t
      JOIN item_tags it ON t.id = it.tag_id
      WHERE it.item_id = ?
      ORDER BY t.name ASC
    `,
			[itemId]
		);
	},
};
```

## Advanced Features

### Shadow Folders

Les shadow folders sont des dossiers virtuels qui reflètent la structure du système de fichiers:

```typescript
export const shadowFoldersService = {
	async createShadowFolder(path: string, name?: string): Promise<Folder> {
		const folderName = name || path.split("/").pop() || "Untitled";
		return await foldersService.createFolder(folderName, undefined, true);
	},

	async syncShadowFolder(folderId: string, path: string): Promise<void> {
		// Scan filesystem for images
		const files = await scanDirectory(path);

		// Update database with new/removed files
		for (const file of files) {
			const exists = await db.select("SELECT id FROM items WHERE url = ?", [file.path]);

			if (exists.length === 0) {
				await itemsService.createItem({
					name: file.name,
					url: file.path,
					folderId,
					collectionId: null,
					metadata: { size: file.size, modified: file.modified },
				});
			}
		}
	},
};
```

### Batch Operations

Support des opérations par lot pour la performance:

```typescript
export const batchService = {
	async createItems(items: Omit<PortfolioItem, "id">[]): Promise<PortfolioItem[]> {
		const createdItems: PortfolioItem[] = [];

		await db.transaction(async () => {
			for (const item of items) {
				const created = await itemsService.createItem(item);
				createdItems.push(created);
			}
		});

		return createdItems;
	},

	async updateItems(updates: { id: string; data: Partial<PortfolioItem> }[]): Promise<void> {
		await db.transaction(async () => {
			for (const { id, data } of updates) {
				await itemsService.updateItem(id, data);
			}
		});
	},
};
```

### Search and Filtering

```typescript
export const searchService = {
	async searchItems(query: string, filters?: SearchFilters): Promise<PortfolioItem[]> {
		let sql = `
      SELECT DISTINCT i.* FROM items i
      LEFT JOIN item_tags it ON i.id = it.item_id
      LEFT JOIN tags t ON it.tag_id = t.id
      WHERE 1=1
    `;
		const params: any[] = [];

		// Text search
		if (query) {
			sql += " AND (i.name LIKE ? OR i.metadata LIKE ?)";
			params.push(`%${query}%`, `%${query}%`);
		}

		// Tag filters
		if (filters?.tags?.length) {
			const tagPlaceholders = filters.tags.map(() => "?").join(",");
			sql += ` AND t.id IN (${tagPlaceholders})`;
			params.push(...filters.tags);
		}

		// Date range
		if (filters?.dateFrom) {
			sql += " AND i.created_at >= ?";
			params.push(filters.dateFrom);
		}

		if (filters?.dateTo) {
			sql += " AND i.created_at <= ?";
			params.push(filters.dateTo);
		}

		sql += " ORDER BY i.updated_at DESC LIMIT ? OFFSET ?";
		params.push(filters?.limit || 50, filters?.offset || 0);

		return await db.select(sql, params);
	},
};
```

## Performance Optimizations

### Connection Pooling

```typescript
class DatabasePool {
	private connections: Database[] = [];
	private maxConnections = 5;

	async getConnection(): Promise<Database> {
		if (this.connections.length > 0) {
			return this.connections.pop()!;
		}

		return await Database.load("sqlite:lumina_portfolio.db");
	}

	releaseConnection(connection: Database): void {
		if (this.connections.length < this.maxConnections) {
			this.connections.push(connection);
		} else {
			connection.close();
		}
	}
}
```

### Query Optimization

```typescript
// Prepared statements for frequently used queries
const preparedStatements = {
	getItems: await db.prepare(
		"SELECT * FROM items WHERE collection_id = ? ORDER BY updated_at DESC"
	),
	getItemTags: await db.prepare(
		"SELECT t.* FROM tags t JOIN item_tags it ON t.id = it.tag_id WHERE it.item_id = ?"
	),
	getCollectionItems: await db.prepare(
		"SELECT COUNT(*) as count FROM items WHERE collection_id = ?"
	),
};

export const optimizedService = {
	async getCollectionItems(collectionId: string): Promise<PortfolioItem[]> {
		return await preparedStatements.getItems.select(collectionId);
	},
};
```

### Caching Layer

```typescript
class StorageCache {
	private cache = new Map<string, { data: any; timestamp: number }>();
	private ttl = 5 * 60 * 1000; // 5 minutes

	set(key: string, data: any): void {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	get(key: string): any | null {
		const entry = this.cache.get(key);
		if (!entry || Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}
		return entry.data;
	}

	invalidate(pattern: string): void {
		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		}
	}
}
```

## Error Handling

### Transaction Rollback

```typescript
export const transactionService = {
	async executeWithTransaction<T>(operations: () => Promise<T>): Promise<T> {
		try {
			await db.execute("BEGIN TRANSACTION");
			const result = await operations();
			await db.execute("COMMIT");
			return result;
		} catch (error) {
			await db.execute("ROLLBACK");
			throw error;
		}
	},
};
```

### Data Validation

```typescript
export const validationService = {
	validateItem(item: PortfolioItem): ValidationResult {
		const errors: string[] = [];

		if (!item.name || item.name.trim().length === 0) {
			errors.push("Item name is required");
		}

		if (!item.url || !isValidUrl(item.url)) {
			errors.push("Invalid URL format");
		}

		return { isValid: errors.length === 0, errors };
	},
};
```

## Migration System

### Version Control

```typescript
export const migrationService = {
	async getCurrentVersion(): Promise<number> {
		const result = await db.select("SELECT version FROM migrations ORDER BY version DESC LIMIT 1");
		return result[0]?.version || 0;
	},

	async runMigrations(): Promise<void> {
		const currentVersion = await this.getCurrentVersion();
		const migrations = getMigrationsAfter(currentVersion);

		for (const migration of migrations) {
			await db.transaction(async () => {
				await migration.up(db);
				await db.execute("INSERT INTO migrations (version, applied_at) VALUES (?, ?)", [
					migration.version,
					Date.now(),
				]);
			});
		}
	},
};
```

### Example Migration

```typescript
export const migrations = [
	{
		version: 1,
		description: "Create initial tables",
		up: async (db: Database) => {
			await db.execute(`
        CREATE TABLE collections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);

			await db.execute(`
        CREATE TABLE items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          folder_id TEXT,
          collection_id TEXT,
          metadata TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (folder_id) REFERENCES folders(id),
          FOREIGN KEY (collection_id) REFERENCES collections(id)
        )
      `);
		},
	},
	{
		version: 2,
		description: "Add color tags to items",
		up: async (db: Database) => {
			await db.execute("ALTER TABLE items ADD COLUMN color_tag TEXT");
		},
	},
];
```

## Testing

### Unit Tests

```typescript
import { storageService } from "@/services/storageService";

describe("StorageService", () => {
	beforeEach(async () => {
		await storageService.clearDatabase();
		await storageService.initializeDatabase();
	});

	test("should create collection", async () => {
		const collection = await storageService.collections.create({
			name: "Test Collection",
			description: "Test description",
		});

		expect(collection.id).toBeDefined();
		expect(collection.name).toBe("Test Collection");
	});

	test("should handle transactions", async () => {
		await expect(
			storageService.transaction(async () => {
				await storageService.collections.create({ name: "Collection 1" });
				throw new Error("Test error");
			})
		).rejects.toThrow("Test error");

		const collections = await storageService.collections.getAll();
		expect(collections).toHaveLength(0);
	});
});
```

### Integration Tests

```typescript
describe("Storage Integration", () => {
	test("should handle large dataset", async () => {
		const items = Array.from({ length: 1000 }, (_, i) => ({
			name: `Item ${i}`,
			url: `file://test/${i}.jpg`,
			folderId: null,
			collectionId: null,
			metadata: {},
		}));

		const startTime = performance.now();
		await storageService.items.createBatch(items);
		const duration = performance.now() - startTime;

		expect(duration).toBeLessThan(1000); // Should complete in <1s

		const retrievedItems = await storageService.items.getAll();
		expect(retrievedItems).toHaveLength(1000);
	});
});
```

## Monitoring and Debugging

### Performance Metrics

```typescript
export class StorageMetrics {
	private metrics = {
		queries: 0,
		totalQueryTime: 0,
		cacheHits: 0,
		cacheMisses: 0,
	};

	recordQuery(duration: number): void {
		this.metrics.queries++;
		this.metrics.totalQueryTime += duration;
	}

	recordCacheHit(): void {
		this.metrics.cacheHits++;
	}

	recordCacheMiss(): void {
		this.metrics.cacheMisses++;
	}

	getReport(): StorageReport {
		return {
			...this.metrics,
			averageQueryTime: this.metrics.totalQueryTime / this.metrics.queries,
			cacheHitRatio: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses),
		};
	}
}
```

### Debug Logging

```typescript
export const debugStorage = {
	async query<T>(sql: string, params?: any[]): Promise<T[]> {
		const startTime = performance.now();
		console.log(`[Storage] Query: ${sql}`, params);

		try {
			const result = await db.select<T>(sql, params);
			const duration = performance.now() - startTime;
			console.log(`[Storage] Query completed in ${duration.toFixed(2)}ms, ${result.length} rows`);
			return result;
		} catch (error) {
			const duration = performance.now() - startTime;
			console.error(`[Storage] Query failed in ${duration.toFixed(2)}ms:`, error);
			throw error;
		}
	},
};
```

## Security

### SQL Injection Prevention

```typescript
export const secureStorage = {
	async safeQuery(table: string, conditions: Record<string, any>): Promise<any[]> {
		// Whitelist allowed tables
		const allowedTables = ["collections", "items", "tags", "folders"];
		if (!allowedTables.includes(table)) {
			throw new Error("Table not allowed");
		}

		// Build parameterized query
		const columns = Object.keys(conditions);
		const placeholders = columns.map(() => "?");
		const values = Object.values(conditions);

		const query = `SELECT * FROM ${table} WHERE ${columns
			.map((col) => `${col} = ?`)
			.join(" AND ")}`;

		return await db.select(query, values);
	},
};
```

### Data Encryption

```typescript
export const encryptedStorage = {
	async encryptSensitiveData(data: string): Promise<string> {
		// Use Tauri's secure storage for sensitive data
		return await secureStorage.encrypt(data);
	},

	async decryptSensitiveData(encryptedData: string): Promise<string> {
		return await secureStorage.decrypt(encryptedData);
	},
};
```

## Future Enhancements

### Planned Features

- **Full-text Search**: Intégration de SQLite FTS5
- **Data Compression**: Compression des métadonnées volumineuses
- **Sync Service**: Synchronisation avec le cloud
- **Backup System**: Sauvegardes automatiques et restaurations
- **Analytics**: Analyse d'utilisation et optimisations

### Performance Roadmap

- **Connection Pooling**: Pool de connexions réutilisable
- **Query Optimization**: Index automatique et optimisation
- **Caching Strategy**: Cache multi-niveaux intelligent
- **Streaming**: Streaming des gros datasets
