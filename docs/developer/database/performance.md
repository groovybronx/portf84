# ⚡ Database Performance - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src-tauri/src/` et optimisations SQLite

---

## 📋 Vue d'Ensemble

Ce guide décrit les stratégies d'optimisation de performance pour la base de données SQLite de Lumina Portfolio, garantissant des temps de réponse rapides même avec des milliers de photos.

---

## 🎯 Objectifs de Performance

### **Cibles de Performance**

- **Query Time** : < 50ms pour les requêtes courantes
- **Batch Operations** : 100-500 items par batch
- **Memory Usage** : < 100MB pour les opérations normales
- **Startup Time** : < 2s pour l'initialisation
- **Concurrent Users** : Support pour 10+ requêtes simultanées

### **Métriques de Surveillance**

- **Query Performance** : Temps d'exécution moyen
- **Database Size** : Taille et croissance de la base de données
- **Index Usage** : Efficacité des indexes
- **Memory Usage** : Utilisation de la mémoire SQLite

---

## 🏗️ Architecture de Performance

### **Connection Pooling**

```typescript
// src-tauri/src/db_pool.rs
use std::sync::Mutex;
use std::collections::HashMap;

pub struct DbPool {
    connections: Arc<Mutex<HashMap<String, Database>>>,
    max_connections: usize,
}

impl DbPool {
    pub fn new(max_connections: usize) -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
            max_connections,
        }
    }

    pub async fn get_connection(&self, key: &str) -> Result<Database, String> {
        let mut connections = self.connections.lock().unwrap();

        if let Some(db) = connections.get(key) {
            return Ok(db);
        }

        if connections.len() >= self.max_connections {
            return Err("Maximum connections reached".to_string());
        }

        // Créer une nouvelle connexion
        let db = Database::open(key).map_err(|e| e.to_string())?;
        connections.insert(key.to_string(), db);
        Ok(db)
    }

    pub fn release_connection(&self, key: &str) {
        let mut connections = self.connections.lock().unwrap();
        connections.remove(key);
    }
}
```

### **Async Query Executor**

```typescript
// src/services/storage/async_executor.ts
export class AsyncQueryExecutor {
	private queue: QueryTask[] = [];
	private isProcessing = false;
	private maxConcurrency = 5;

	async execute<T>(query: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({
				query,
				resolve,
				reject,
				timestamp: Date.now(),
			});

			this.processQueue();
		});
	}

	private async processQueue(): Promise<void> {
		if (this.isProcessing || this.queue.length === 0) {
			return;
		}

		this.isProcessing = true;

		const batch = this.queue.splice(0, Math.min(this.maxConcurrency, this.queue.length));

		try {
			await Promise.all(batch.map((task) => task.query()));
			batch.forEach((task) => task.resolve());
		} catch (error) {
			batch.forEach((task) => task.reject(error));
		}

		this.isProcessing = false;

		// Continuer si des tâches sont en attente
		if (this.queue.length > 0) {
			setImmediate(() => this.processQueue());
		}
	}
}

interface QueryTask {
	query: () => Promise<any>;
	resolve: (value: any) => void;
	reject: (error: any) => void;
	timestamp: number;
}
```

---

## 🗄️ Optimisations de Schéma

### **Index Stratégiques**

```sql
-- Index primaires pour les requêtes fréquentes
CREATE INDEX idx_metadata_collection_id ON metadata(collectionId);
CREATE INDEX idx_metadata_virtual_folder_id ON metadata(virtualFolderId);
CREATE INDEX idx_metadata_last_modified ON metadata(lastModified DESC);
CREATE INDEX idx_metadata_ai_tags ON metadata(aiTags) WHERE ai_tags IS NOT NULL;

-- Index pour les tags
CREATE INDEX idx_tags_normalized_name ON tags(normalizedName);
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_parent_id ON tags(parentId);

-- Index pour les relations many-to-many
CREATE INDEX idx_item_tags_item_id ON item_tags(itemId);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tagId);
CREATE INDEX idx_item_tags_added_at ON item_tags(addedAt);

-- Index composés pour les requêtes complexes
CREATE INDEX idx_metadata_collection_modified ON metadata(collectionId, lastModified DESC);
CREATE INDEX idx_metadata_folder_modified ON metadata(virtualFolderId, lastModified DESC);

-- Index pour la recherche plein texte
CREATE VIRTUAL TABLE metadata_fts USING fts5(metadata, 'aiDescription', 'name');
CREATE TRIGGER metadata_fts_insert AFTER INSERT ON metadata BEGIN
  INSERT INTO metadata_fts(rowid, aiDescription, name) VALUES (new.id, new.aiDescription, new.name);
END;
CREATE TRIGGER metadata_fts_delete AFTER DELETE ON metadata BEGIN
  INSERT INTO metadata_fts(rowid, aiDescription, name) VALUES (old.id, old.aiDescription, old.name);
END;
CREATE TRIGGER metadata_fts_update AFTER UPDATE ON metadata BEGIN
  DELETE FROM metadata_fts WHERE rowid = new.id;
  INSERT INTO metadata_fts(rowid, aiDescription, name) VALUES (new.id, new.aiDescription, new.name);
END;
```

### **Table Partitionning**

```typescript
// src-tauri/src/partitions.rs
pub struct PartitionedMetadata {
    collection_id: String,
    partition_key: String, // e.g., "2024_01", "2024_02"
}

impl PartitionedMetadata {
    pub fn get_table_name(collection_id: &str, date: &str) -> String {
        let year = date.split('-')[0];
        let month = date.split('-')[1];
        format!("metadata_{}_{}", collection_id, year, month)
    }

    pub async fn create_partition_table(db: &Database, collection_id: &str, date: &str) -> Result<(), String> {
        let table_name = Self::get_table_name(collection_id, date);

        db.execute(&format!(
            "CREATE TABLE IF NOT EXISTS {} (
                id TEXT PRIMARY KEY,
                collection_id TEXT,
                virtual_folder_id TEXT,
                aiDescription TEXT,
                aiTags TEXT,
                aiTagsDetailed TEXT,
                colorTag TEXT,
                manualTags TEXT,
                isHidden INTEGER,
                lastModified INTEGER,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )",
            table_name
        )).map_err(|e| e.to_string())?;

        // Créer les indexes pour la partition
        db.execute(&format!(
            "CREATE INDEX IF NOT EXISTS idx_{}_collection_id ON {}(collection_id)",
            table_name, table_name
        ))?;

        db.execute(&format!(
            "CREATE INDEX IF NOT EXISTS idx_{}_last_modified ON {}(lastModified DESC)",
            table_name, table_name
        ))?;

        Ok(())
    }
}
```

---

## 🚀 Optimisations de Requêtes

### **Query Caching**

```typescript
// src/services/storage/cache.ts
export class QueryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 1000;
  private ttl = 5 * 60 * 1000; // 5 minutes

  async function get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async function set<T>(key: string, data: T): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      // Supprimer l'entrée la plus ancienne
      const oldestKey = this.cache.keys().next().value();
      if oldestKey {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async function invalidate(pattern?: string): Promise<void> {
    if (pattern) {
      // Supprimer les entrées correspondant au pattern
      for (const key in this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
}
```

### **Lazy Loading**

```typescript
// src/services/storage/lazy_loader.ts
export class LazyLoader {
  private loadedPages = new Map<string, any[]>();
  private pageSize = 100;
  private loadingPromises = new Map<string, Promise<any[]>>();

  async function loadPage<T>(
    queryName: string,
    page: number,
    query: () => Promise<T[]>
  ): Promise<T[]> {
    const cacheKey = `${queryName}_page_${page}`;

    // Vérifier si déjà chargé
    if (this.loadedPages.has(cacheKey)) {
      return this.loadedPages.get(cacheKey);
    }

    // Vérifier si déjà en cours de chargement
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Démarrer le chargement
    const promise = query();
    this.loadingPromises.set(cacheKey, promise);

    try {
      const result = await promise;
      this.loadedPages.set(cacheKey, result);
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  async function preloadNextPage<T>(
    queryName: string,
    currentPage: number,
    query: () => Promise<T[]>
  ): Promise<void> {
    const nextPage = currentPage + 1;
    await this.loadPage(queryName, nextPage, query);
  }

  function invalidateCache(queryName?: string): void {
    if (queryName) {
      const pattern = `${queryName}_page_`;
      for (const key of this.loadedPages.keys()) {
        if (key.startsWith(pattern)) {
          this.loadedPages.delete(key);
        }
      }
    } else {
      this.loadedPages.clear();
    }
  }
}
```

### **Batch Processing**

```typescript
// src/services/storage/batch_processor.ts
export class BatchProcessor {
	private static readonly BATCH_SIZE = 500;
	private static readonly MAX_CONCURRENT_BATCHES = 3;

	static async processBatch<T>(
		items: T[],
		processor: (batch: T[]) => Promise<void>
	): Promise<void> {
		const batches = this.createBatches(items);

		const promises = batches.map((batch) => this.processSingleBatch(batch, processor));

		await Promise.all(promises);
	}

	private static createBatches<T>(items: T[]): T[][] {
		const batches: T[][] = [];

		for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
			batches.push(items.slice(i, i + this.BATCH_SIZE));
		}

		return batches;
	}

	private static async processSingleBatch<T>(
		batch: T[],
		processor: (batch: T[]) => Promise<void>
	): Promise<void> {
		const startTime = performance.now();

		try {
			await processor(batch);

			const duration = performance.now() - startTime;
			console.log(`Batch processed ${batch.length} items in ${duration.toFixed(2)}ms`);
		} catch (error) {
			console.error(`Batch processing failed: ${error.message}`);
			throw error;
		}
	}
}
```

---

## 📊 Monitoring de Performance

### **Performance Metrics**

```typescript
// src/services/storage/performance_monitor.ts
export class PerformanceMonitor {
	private metrics: Map<string, PerformanceMetric> = new Map();

	static startTimer(operation: string): () => void {
		const startTime = performance.now();

		return () => {
			const endTime = performance.now();
			const duration = endTime - startTime;

			this.recordMetric(operation, duration);
		};
	}

	static recordMetric(operation: string, duration: number): void {
		const existing = this.metrics.get(operation) || {
			count: 0,
			totalTime: 0,
			minTime: Infinity,
			maxTime: 0,
			avgTime: 0,
		};

		const updated = {
			count: existing.count + 1,
			totalTime: existing.totalTime + duration,
			minTime: Math.min(existing.minTime, duration),
			maxTime: Math.max(existing.maxTime, duration),
			avgTime: (existing.totalTime + duration) / (existing.count + 1),
		};

		this.metrics.set(operation, updated);

		// Alerte si la performance est mauvaise
		if (duration > 1000) {
			console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
		}
	}

	static getMetrics(): Map<string, PerformanceMetric> {
		return this.metrics;
	}

	static getSlowOperations(threshold: number = 500): string[] {
		const slowOps: string[] = [];

		for (const [operation, metric] of this.metrics) {
			if (metric.avgTime > threshold) {
				slowOps.push(operation);
			}
		}

		return slowOps;
	}

	static resetMetrics(): void {
		this.metrics.clear();
	}
}

interface PerformanceMetric {
	count: number;
	totalTime: number;
	minTime: number;
	maxTime: number;
	avgTime: number;
}
```

### **Database Size Monitoring**

```typescript
// src/services/storage/size_monitor.ts
export class SizeMonitor {
	static async getDatabaseSize(db: Database): Promise<DatabaseSize> {
		const result = await db.select(`
      SELECT
        page_count * page_size as size,
        page_count
      FROM pragma_page_count()
    `);

		const stats = await db.select(`
      SELECT
        (SELECT COUNT(*) FROM metadata) as metadata_count,
        (SELECT COUNT(*) FROM tags) as tags_count,
        (SELECT COUNT(*) FROM item_tags) as item_tags_count
    `);

		return {
			sizeBytes: result[0].size,
			pageCount: result[0].page_count,
			metadataCount: stats[0].metadata_count,
			tagsCount: stats[0].tags_count,
			itemTagsCount: stats[0].item_tags_count,
		};
	}

	static async getTableSizes(db: Database): Promise<TableSize[]> {
		const tables = await db.select(`
      SELECT
        name,
        sql
      FROM sqlite_master
      WHERE type = 'table'
    `);

		const sizes: TableSize[] = [];

		for (const table of tables) {
			try {
				const result = await db.select(`SELECT COUNT(*) as count FROM ${table.name}`);
				sizes.push({
					name: table.name,
					rowCount: result[0].count,
				});
			} catch (error) {
				console.warn(`Failed to get size for table ${table.name}: ${error}`);
			}
		}

		return sizes;
	}

	static async checkDatabaseHealth(db: Database): Promise<DatabaseHealth> {
		const size = await this.getDatabaseSize(db);
		const tableSizes = await this.getTableSizes(db);

		const health: DatabaseHealth = {
			sizeBytes: size.sizeBytes,
			sizeMB: size.sizeBytes / (1024 * 1024),
			pageCount: size.pageCount,
			tableCount: tableSizes.length,
			totalRows: tableSizes.reduce((sum, table) => sum + table.rowCount, 0),
			isHealthy: size.sizeMB < 1000 && size.pageCount < 10000,
		};

		if (!health.isHealthy) {
			console.warn("Database health check failed:", health);
		}

		return health;
	}
}

interface DatabaseSize {
	sizeBytes: number;
	pageCount: number;
	metadataCount: number;
	tagsCount: number;
	itemTagsCount: number;
}

interface TableSize {
	name: string;
	rowCount: number;
}

interface DatabaseHealth {
	sizeBytes: number;
	sizeMB: number;
	pageCount: number;
	tableCount: number;
	totalRows: number;
	isHealthy: boolean;
}
```

---

## 🔧 Optimisations de Configuration

### **SQLite Configuration**

```rust
// src-tauri/src/db_config.rs
use sqlite::{Connection, Result};

pub fn configure_connection() -> Result<Connection, String> {
    let conn = Connection::open("lumina.db")?;

    // Configuration de performance
    conn.pragma_update(None, "PRAGMA synchronous = OFF")?;
    conn.pragma_update(None, "PRAGMA journal_mode = WAL")?;
    conn.pragma_update(None, "PRAGMA cache_size = 10000")?;
    conn.pragma_update(None, "PRAGMA temp_store = MEMORY")?;
    conn.pragma_update(None, "PRAGMA mmap_size = 268435456")?; // 256MB

    // Configuration de sécurité
    conn.pragma_update(None, "PRAGMA foreign_keys = ON")?;
    conn.pragma_update(None, "PRAGMA secure_delete = ON")?;

    Ok(conn)
}
```

### **Query Optimization Settings**

```typescript
// src/services/storage/query_config.ts
export const QUERY_CONFIG = {
	// Taille des batches
	BATCH_SIZE: 500,

	// Timeout des requêtes
	QUERY_TIMEOUT: 30000, // 30 secondes

	// Cache settings
	CACHE_TTL: 5 * 60 * 1000, // 5 minutes
	CACHE_MAX_SIZE: 1000,

	// Pagination
	DEFAULT_PAGE_SIZE: 100,
	MAX_PAGE_SIZE: 1000,

	// Concurrency
	MAX_CONCURRENT_QUERIES: 5,
	MAX_CONCURRENT_BATCHES: 3,

	// Monitoring
	SLOW_QUERY_THRESHOLD: 500, // ms
	MEMORY_WARNING_THRESHOLD: 100, // MB
	DATABASE_SIZE_WARNING: 1000, // MB
};
```

---

## 🧪 Tests de Performance

### **Performance Tests**

```typescript
// tests/performance/database.test.ts
describe("Database Performance", () => {
	let db: Database;

	beforeAll(async () => {
		db = await Database.load(":memory:");
		await initializeDatabase(db);
	});

	test("should handle 1000 metadata queries efficiently", async () => {
		const startTime = performance.now();

		// Insérer 1000 métadonnées de test
		const metadata = Array.from({ length: 1000 }, (_, i) => ({
			id: `test-${i}`,
			collectionId: `collection-${i % 10}`,
			aiDescription: `Test description ${i}`,
			aiTags: [`tag-${i % 10}`, `tag-${(i + 1) % 10}`],
			colorTag: "#ff0000",
			manualTags: [`manual-${i % 5}`],
			isHidden: false,
			lastModified: Date.now(),
		}));

		await BatchProcessor.processBatch(metadata, async (batch) => {
			await MetadataQueries.saveBatch(db, batch);
		});

		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(duration).toBeLessThan(5000); // Should complete in <5s
		console.log(`Inserted 1000 metadata in ${duration.toFixed(2)}ms`);
	});

	test("should search efficiently with FTS", async () => {
		// Insérer des données de test avec recherche plein texte
		await insertTestData(db, 1000);

		const startTime = performance.now();

		const results = await MetadataQueries.search(db, "test description", {
			limit: 100,
		});

		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(results).toHaveLength(100);
		expect(duration).toBeLessThan(100); // Should complete in <100ms
		console.log(`FTS search completed in ${duration.toFixed(2)}ms`);
	});

	test("should handle concurrent queries", async () => {
		const promises = Array.from({ length: 10 }, (_, i) =>
			MetadataQueries.getBatch(db, [`item-${i}`, `item-${i + 100}`])
		);

		const startTime = performance.now();
		const results = await Promise.all(promises);
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(results).toHaveLength(10);
		expect(duration).toBeLessThan(1000); // Should complete in <1s
		console.log(`10 concurrent queries completed in ${duration.toFixed(2)}ms`);
	});
});

async function insertTestData(db: Database, count: number): Promise<void> {
	const metadata = Array.from({ length: count }, (_, i) => ({
		id: `test-${i}`,
		collectionId: `collection-${i % 10}`,
		aiDescription: `Test description ${i} with some content`,
		aiTags: [`tag-${i % 10}`, `tag-${(i + 1) % 10}`],
		colorTag: "#ff0000",
		manualTags: [`manual-${i % 5}`],
		isHidden: false,
		lastModified: Date.now(),
	}));

	await BatchProcessor.processBatch(metadata, async (batch) => {
		await MetadataQueries.saveBatch(db, batch);
	});
}
```

### **Load Testing**

```typescript
// tests/load/database_load.test.ts
describe("Database Load Testing", () => {
	test("should handle high load scenarios", async () => {
		const db = await Database.load(":memory:");
		await initializeDatabase(db);

		// Simuler une charge élevée
		const startTime = performance.now();

		// 1000 opérations de lecture
		const readPromises = Array.from({ length: 1000 }, (_, i) =>
			MetadataQueries.getBatch(db, [`item-${i}`, `item-${i + 100}`])
		);

		// 100 opérations d'écriture
		const writePromises = Array.from({ length: 100 }, (_, i) =>
			MetadataQueries.save(db, {
				id: `load-test-${i}`,
				collectionId: `collection-${i}`,
				aiDescription: `Load test description ${i}`,
				aiTags: [`load-tag-${i}`],
				colorTag: "#ff0000",
				manualTags: [],
				isHidden: false,
				lastModified: Date.now(),
			})
		);

		await Promise.all([...readPromises, ...writePromises]);

		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(duration).toBeLessThan(10000); // Should complete in <10s
		console.log(`Load test completed in ${duration.toFixed(2)}ms`);
	});
});
```

---

## 📚 Références

### **SQLite Performance**

- **[SQLite Optimization Guide](https://www.sqlite.org/optimization.html)** : Guide officiel d'optimisation
- **[SQLite Performance](https://www.sqlite.org/understanding/understanding.html)** : Compréhension de la performance SQLite
- **[SQLite Query Planning](https://www.sqlite.org/queryplanner.html)** : Documentation EXPLAIN QUERY PLAN

### **Database Design**

- **[High Performance SQLite](https://github.com/anthonyfokidis/High-Performance-SQLite)** : Guide de performance SQLite
- **[SQLite Database Design](https://www.sqlite.org/datatype3.html)** : Documentation des types SQLite
- **[SQLite WAL Mode](https://www.sqlite.org/wal.html)** : Documentation du mode WAL

### **TypeScript Database**

- **[TypeORM Performance](https://typeorm.io/performance-optimization.html)** : Optimisations TypeORM
- **[Better-SQLite3 Performance](https://github.com/WiseLibs/better-sqlite3)** : Performance better-sqlite3
- **[Prisma Performance](https://www.prisma.io/docs/concepts/components/overview)** : Performance Prisma

---

## 🎯 Checklist de Performance

### **✅ Checklist d'Optimisation**

- [ ] **Indexes** : Index stratégiques sur les colonnes interrogées
- [ ] **Prepared Statements** : Toutes les requêtes utilisent des statements préparés
- [ ] **Batch Operations** : Taille de batch optimisée (100-500)
- [ ] **Connection Pooling** : Pool de connexions pour la concurrence
- [ ] **Query Caching** : Cache pour les requêtes fréquentes
- [ ] **Lazy Loading** : Chargement progressif des données volumineuses

### **✅ Checklist de Monitoring**

- [ ] **Performance Metrics** : Monitoring des temps d'exécution
- [ ] **Database Size** : Surveillance de la taille de la base de données
- [ ] **Query Analysis** : Analyse des plans d'exécution
- [ ] **Load Testing** : Tests de charge réguliers
- [ ] **Alerting** : Alertes pour les performances dégradées

### **✅ Checklist de Maintenance**

- [ ] **VACUUM** : Nettoyage régulier des données inutilisées
- [ ] **ANALYZE** : Analyse des requêtes lentes
- [ ] **OPTIMIZE** : Optimisation continue des requêtes
- [ ] **MONITOR** : Surveillance continue des métriques
- [ ] **TUNE** : Ajustement des paramètres de performance

---

## 🎯 Patterns Émergents

### **Future Optimizations**

- **Read Replicas** : Réplicas en lecture pour la scalabilité
- **Sharding** : Partitionnement horizontal des données
- **Caching Layer** : Cache applicatif distribué
- **Query Optimization AI** : Optimisation basée sur l'IA

### **Évolutions Techniques**

- **SQLite Extensions** : Extensions SQLite personnalisées
- **Custom Functions** : Fonctions SQL personnalisées
- **Virtual Tables** : Tables virtuelles pour les requêtes complexes
- **Generated Columns** : Colonnes générées pour les données calculées

---

**La base de données de Lumina Portfolio est optimisée pour garantir des performances exceptionnelles même avec des milliers de photos ! ⚡**
