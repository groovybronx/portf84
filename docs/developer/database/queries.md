# 🔍 Database Queries - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/services/storage/` et optimisations SQL

---

## 📋 Vue d'Ensemble

Ce guide décrit les requêtes SQL optimisées utilisées dans Lumina Portfolio pour assurer des performances excellentes même avec des milliers de photos.

---

## 🎯 Architecture des Requêtes

### **Principes d'Optimisation**

- **Prepared Statements** : Toutes les requêtes utilisent des statements préparés
- **Indexes Stratégiques** : Index sur les colonnes fréquemment interrogées
- **Batch Operations** : Opérations en lot pour réduire les allers-retours
- **Lazy Loading** : Chargement progressif des données volumineuses

### **Performance Targets**

- **Query Time** : < 50ms pour les requêtes courantes
- **Batch Size** : 100-500 items par batch
- **Memory Usage** : < 100MB pour les opérations normales
- **Concurrent Queries** : Support pour 10+ requêtes simultanées

---

## 📊 Requêtes de Base

### **Collections**

```typescript
// src/services/storage/collections.ts
export class CollectionQueries {
	// Récupérer toutes les collections
	static async getAll(db: Database): Promise<DBCollection[]> {
		return await db.select(`
      SELECT id, name, createdAt, lastOpenedAt, isActive
      FROM collections
      ORDER BY lastOpenedAt DESC, createdAt DESC
    `);
	}

	// Récupérer la collection active
	static async getActive(db: Database): Promise<DBCollection | null> {
		const result = await db.select(`
      SELECT id, name, createdAt, lastOpenedAt, isActive
      FROM collections
      WHERE isActive = 1
      LIMIT 1
    `);
		return result[0] || null;
	}

	// Créer une collection
	static async create(db: Database, collection: DBCollection): Promise<void> {
		await db.execute(
			`
      INSERT INTO collections (id, name, createdAt, lastOpenedAt, isActive)
      VALUES (?, ?, ?, ?, ?)
    `,
			[
				collection.id,
				collection.name,
				collection.createdAt,
				collection.lastOpenedAt,
				collection.isActive ? 1 : 0,
			]
		);
	}

	// Mettre à jour une collection
	static async update(db: Database, id: string, updates: Partial<DBCollection>): Promise<void> {
		const fields = [];
		const values = [];

		if (updates.name !== undefined) {
			fields.push("name = ?");
			values.push(updates.name);
		}
		if (updates.lastOpenedAt !== undefined) {
			fields.push("lastOpenedAt = ?");
			values.push(updates.lastOpenedAt);
		}
		if (updates.isActive !== undefined) {
			fields.push("isActive = ?");
			values.push(updates.isActive ? 1 : 0);
		}

		if (fields.length > 0) {
			values.push(id);
			await db.execute(
				`
        UPDATE collections SET ${fields.join(", ")}
        WHERE id = ?
      `,
				values
			);
		}
	}

	// Supprimer une collection
	static async delete(db: Database, id: string): Promise<void> {
		await db.execute("DELETE FROM collections WHERE id = ?", [id]);
	}
}
```

### **Métadonnées**

```typescript
// src/services/storage/metadata.ts
export class MetadataQueries {
	// Récupérer les métadonnées en lot
	static async getBatch(db: Database, itemIds: string[]): Promise<ParsedMetadata[]> {
		if (itemIds.length === 0) return [];

		const placeholders = itemIds.map(() => "?").join(",");
		const rows = await db.select(
			`
      SELECT
        id, collectionId, virtualFolderId, aiDescription,
        aiTags, aiTagsDetailed, colorTag, manualTags,
        isHidden, lastModified
      FROM metadata
      WHERE id IN (${placeholders})
      ORDER BY lastModified DESC
    `,
			itemIds
		);

		return rows.map((row) => this.parseMetadataRow(row));
	}

	// Sauvegarder les métadonnées
	static async save(db: Database, metadata: ParsedMetadata): Promise<void> {
		await db.execute(
			`
      INSERT OR REPLACE INTO metadata (
        id, collectionId, virtualFolderId, aiDescription,
        aiTags, aiTagsDetailed, colorTag, manualTags,
        isHidden, lastModified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
			[
				metadata.id,
				metadata.collectionId,
				metadata.virtualFolderId,
				metadata.aiDescription,
				JSON.stringify(metadata.aiTags),
				JSON.stringify(metadata.aiTagsDetailed),
				metadata.colorTag,
				JSON.stringify(metadata.manualTags),
				metadata.isHidden ? 1 : 0,
				metadata.lastModified,
			]
		);
	}

	// Recherche de métadonnées
	static async search(
		db: Database,
		query: string,
		options: SearchOptions = {}
	): Promise<ParsedMetadata[]> {
		const { limit = 100, offset = 0, collectionId, tags } = options;

		let sql = `
      SELECT id, collectionId, virtualFolderId, aiDescription,
             aiTags, aiTagsDetailed, colorTag, manualTags,
             isHidden, lastModified
      FROM metadata
      WHERE 1=1
    `;

		const params: any[] = [];

		// Filtre de recherche
		if (query) {
			sql += ` AND (aiDescription LIKE ? OR name LIKE ?)`;
			params.push(`%${query}%`, `%${query}%`);
		}

		// Filtre de collection
		if (collectionId) {
			sql += ` AND collectionId = ?`;
			params.push(collectionId);
		}

		// Filtre de tags
		if (tags && tags.length > 0) {
			const tagPlaceholders = tags.map(() => "?").join(",");
			sql += `
        AND id IN (
          SELECT DISTINCT itemId
          FROM item_tags
          WHERE tagId IN (${tagPlaceholders})
        )
      `;
			params.push(...tags);
		}

		sql += ` ORDER BY lastModified DESC LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const rows = await db.select(sql, params);
		return rows.map((row) => this.parseMetadataRow(row));
	}

	// Statistiques de métadonnées
	static async getStats(db: Database, collectionId?: string): Promise<MetadataStats> {
		let sql = `
      SELECT
        COUNT(*) as total_items,
        SUM(CASE WHEN aiDescription IS NOT NULL THEN 1 ELSE 0 END) as with_ai_description,
        SUM(CASE WHEN aiTags IS NOT NULL AND aiTags != '[]' THEN 1 ELSE 0 END) as with_ai_tags,
        SUM(CASE WHEN colorTag IS NOT NULL THEN 1 ELSE 0 END) as with_color_tag,
        SUM(CASE WHEN manualTags IS NOT NULL AND manualTags != '[]' THEN 1 ELSE 0 END) as with_manual_tags,
        AVG(CASE WHEN isHidden = 0 THEN 1 ELSE 0 END) * 100 as visible_percentage
      FROM metadata
    `;

		const params: any[] = [];

		if (collectionId) {
			sql += ` WHERE collectionId = ?`;
			params.push(collectionId);
		}

		const result = await db.select(sql, params);
		return {
			totalItems: result[0]?.total_items || 0,
			withAIDescription: result[0]?.with_ai_description || 0,
			withAITags: result[0]?.with_ai_tags || 0,
			withColorTag: result[0]?.with_color_tag || 0,
			withManualTags: result[0]?.with_manual_tags || 0,
			visiblePercentage: result[0]?.visible_percentage || 0,
		};
	}

	private static parseMetadataRow(row: any): ParsedMetadata {
		return {
			id: row.id,
			collectionId: row.collectionId,
			virtualFolderId: row.virtualFolderId,
			folderId: row.virtualFolderId, // Backward compatibility
			aiDescription: row.aiDescription,
			aiTags: row.aiTags ? JSON.parse(row.aiTags) : [],
			aiTagsDetailed: row.aiTagsDetailed ? JSON.parse(row.aiTagsDetailed) : [],
			colorTag: row.colorTag,
			manualTags: row.manualTags ? JSON.parse(row.manualTags) : [],
			isHidden: Boolean(row.isHidden),
			lastModified: row.lastModified,
		};
	}
}
```

### **Tags**

```typescript
// src/services/storage/tags.ts
export class TagQueries {
	// Récupérer tous les tags
	static async getAll(db: Database): Promise<ParsedTag[]> {
		const rows = await db.select(`
      SELECT id, name, normalizedName, type, confidence, parentId, createdAt
      FROM tags
      ORDER BY normalizedName ASC
    `);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			confidence: row.confidence,
			parentId: row.parentId,
		}));
	}

	// Récupérer les tags d'un item
	static async getForItem(db: Database, itemId: string): Promise<ParsedTag[]> {
		const rows = await db.select(
			`
      SELECT t.id, t.name, t.normalizedName, t.type, t.confidence, t.parentId, t.createdAt
      FROM tags t
      JOIN item_tags it ON t.id = it.tagId
      WHERE it.itemId = ?
      ORDER BY t.normalizedName ASC
    `,
			[itemId]
		);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			confidence: row.confidence,
			parentId: row.parentId,
		}));
	}

	// Récupérer les tags avec leurs items
	static async getWithItems(db: Database): Promise<TagWithItems[]> {
		const rows = await db.select(`
      SELECT
        t.id, t.name, t.normalizedName, t.type, t.confidence, t.parentId, t.createdAt,
        COUNT(it.itemId) as itemCount
      FROM tags t
      LEFT JOIN item_tags it ON t.id = it.tagId
      GROUP BY t.id, t.name, t.normalizedName, t.type, t.confidence, t.parentId, t.createdAt
      ORDER BY itemCount DESC, t.normalizedName ASC
    `);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			confidence: row.confidence,
			parentId: row.parentId,
			itemCount: row.itemCount,
		}));
	}

	// Recherche de tags
	static async search(
		db: Database,
		query: string,
		options: TagSearchOptions = {}
	): Promise<ParsedTag[]> {
		const { limit = 50, type } = options;

		let sql = `
      SELECT id, name, normalizedName, type, confidence, parentId, createdAt
      FROM tags
      WHERE normalizedName LIKE ?
    `;
		const params = [`%${query.toLowerCase()}%`];

		if (type) {
			sql += ` AND type = ?`;
			params.push(type);
		}

		sql += ` ORDER BY normalizedName ASC LIMIT ?`;
		params.push(limit);

		const rows = await db.select(sql, params);
		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			confidence: row.confidence,
			parentId: row.parentId,
		}));
	}

	// Ajouter un tag à un item
	static async addToItem(db: Database, itemId: string, tagId: string): Promise<void> {
		await db.execute(
			`
      INSERT OR IGNORE INTO item_tags (itemId, tagId, addedAt)
      VALUES (?, ?, ?)
    `,
			[itemId, tagId, Date.now()]
		);
	}

	// Retirer un tag d'un item
	static async removeFromItem(db: Database, itemId: string, tagId: string): Promise<void> {
		await db.execute(
			`
      DELETE FROM item_tags
      WHERE itemId = ? AND tagId = ?
    `,
			[itemId, tagId]
		);
	}

	// Nettoyer les tags inutilisés
	static async cleanupUnused(db: Database): Promise<number> {
		await db.execute(`
      DELETE FROM tags
      WHERE id NOT IN (
        SELECT DISTINCT tagId FROM item_tags
      )
    `);

		const result = await db.select("SELECT changes() as deleted");
		return result[0].deleted;
	}
}
```

---

## 🔍 Requêtes Complexes

### **Recherche Avancée**

```typescript
// src/services/storage/search.ts
export class SearchQueries {
	// Recherche multi-critères
	static async advancedSearch(db: Database, criteria: SearchCriteria): Promise<SearchResult> {
		let sql = `
      SELECT m.id, m.name, m.aiDescription, m.aiTags, m.colorTag,
             m.collectionId, m.virtualFolderId, m.lastModified,
             c.name as collection_name,
             vf.name as folder_name
      FROM metadata m
      LEFT JOIN collections c ON m.collectionId = c.id
      LEFT JOIN virtual_folders vf ON m.virtualFolderId = vf.id
      WHERE 1=1
    `;

		const params: any[] = [];

		// Filtre textuel
		if (criteria.query) {
			sql += ` AND (m.aiDescription LIKE ? OR m.name LIKE ?)`;
			params.push(`%${criteria.query}%`, `%${criteria.query}%`);
		}

		// Filtre de collection
		if (criteria.collectionId) {
			sql += ` AND m.collectionId = ?`;
			params.push(criteria.collectionId);
		}

		// Filtre de tags
		if (criteria.tags && criteria.tags.length > 0) {
			const tagPlaceholders = criteria.tags.map(() => "?").join(",");
			sql += `
        AND m.id IN (
          SELECT DISTINCT itemId
          FROM item_tags
          WHERE tagId IN (${tagPlaceholders})
        )
      `;
			params.push(...criteria.tags);
		}

		// Filtre de couleur
		if (criteria.colorTag) {
			sql += ` AND m.colorTag = ?`;
			params.push(criteria.colorTag);
		}

		// Filtre de date
		if (criteria.dateRange) {
			sql += ` AND m.lastModified BETWEEN ? AND ?`;
			params.push(criteria.dateRange.start, criteria.dateRange.end);
		}

		// Filtre de visibilité
		if (criteria.includeHidden === false) {
			sql += ` AND m.isHidden = 0`;
		}

		// Tri
		const sortField = criteria.sortBy || "lastModified";
		const sortDirection = criteria.sortOrder || "DESC";
		sql += ` ORDER BY m.${sortField} ${sortDirection}`;

		// Pagination
		const limit = criteria.limit || 100;
		const offset = criteria.offset || 0;
		sql += ` LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const rows = await db.select(sql, params);

		return {
			items: rows.map((row) => this.parseSearchResult(row)),
			total: await this.getTotalCount(db, criteria),
		};
	}

	// Compter le nombre total de résultats
	private static async getTotalCount(db: Database, criteria: SearchCriteria): Promise<number> {
		let sql = `
      SELECT COUNT(*) as total
      FROM metadata m
      WHERE 1=1
    `;
		const params: any[] = [];

		// Appliquer les mêmes filtres que la recherche principale
		if (criteria.query) {
			sql += ` AND (m.aiDescription LIKE ? OR m.name LIKE ?)`;
			params.push(`%${criteria.query}%`, `%${criteria.query}%`);
		}

		if (criteria.collectionId) {
			sql += ` AND m.collectionId = ?`;
			params.push(criteria.collectionId);
		}

		if (criteria.tags && criteria.tags.length > 0) {
			const tagPlaceholders = criteria.tags.map(() => "?").join(",");
			sql += `
        AND m.id IN (
          SELECT DISTINCT itemId
          FROM item_tags
          WHERE tagId IN (${tagPlaceholders})
        )
      `;
			params.push(...criteria.tags);
		}

		const result = await db.select(sql, params);
		return result[0].total;
	}

	private static parseSearchResult(row: any): SearchResultItem {
		return {
			id: row.id,
			name: row.name,
			aiDescription: row.aiDescription,
			aiTags: row.aiTags ? JSON.parse(row.aiTags) : [],
			colorTag: row.colorTag,
			collectionId: row.collectionId,
			collectionName: row.collection_name,
			folderName: row.folder_name,
			virtualFolderId: row.virtualFolderId,
			lastModified: row.lastModified,
		};
	}
}
```

### **Analyse de Tags**

```typescript
// src/services/storage/analytics.ts
export class AnalyticsQueries {
	// Statistiques de tags par collection
	static async getTagStatsByCollection(db: Database): Promise<TagStatsByCollection[]> {
		const rows = await db.select(`
      SELECT
        c.id as collection_id,
        c.name as collection_name,
        t.id as tag_id,
        t.name as tag_name,
        t.type as tag_type,
        COUNT(it.itemId) as item_count,
        AVG(t.confidence) as avg_confidence
      FROM collections c
      LEFT JOIN metadata m ON c.id = m.collectionId
      LEFT JOIN item_tags it ON m.id = it.itemId
      LEFT JOIN tags t ON it.tagId = t.id
      GROUP BY c.id, c.name, t.id, t.name, t.type
      ORDER BY c.name, item_count DESC
    `);

		return rows.map((row) => ({
			collectionId: row.collection_id,
			collectionName: row.collection_name,
			tagId: row.tag_id,
			tagName: row.tag_name,
			tagType: row.tag_type,
			itemCount: row.item_count,
			avgConfidence: row.avg_confidence,
		}));
	}

	// Tags les plus populaires
	static async getPopularTags(db: Database, limit: number = 50): Promise<PopularTag[]> {
		const rows = await db.select(
			`
      SELECT
        t.id,
        t.name,
        t.type,
        COUNT(it.itemId) as item_count,
        AVG(t.confidence) as avg_confidence,
        MAX(it.addedAt) as last_used
      FROM tags t
      LEFT JOIN item_tags it ON t.id = it.tagId
      GROUP BY t.id, t.name, t.type
      ORDER BY item_count DESC, t.name ASC
      LIMIT ?
    `,
			[limit]
		);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			itemCount: row.item_count,
			avgConfidence: row.avg_confidence,
			lastUsed: row.last_used,
		}));
	}

	// Analyse de similarité de tags
	static async getSimilarTags(
		db: Database,
		tagId: string,
		threshold: number = 0.8
	): Promise<SimilarTag[]> {
		// Récupérer d'abord les items du tag cible
		const targetItems = await db.select(
			`
      SELECT itemId FROM item_tags WHERE tagId = ?
    `,
			[tagId]
		);

		if (targetItems.length === 0) return [];

		const itemIds = targetItems.map((row) => row.itemId);
		const placeholders = itemIds.map(() => "?").join(",");

		const rows = await db.select(
			`
      SELECT
        t.id,
        t.name,
        t.type,
        COUNT(it.itemId) as common_items,
        COUNT(it.itemId) * 1.0 / ? as similarity
      FROM tags t
      JOIN item_tags it ON t.id = it.tagId
      WHERE t.id != ? AND it.itemId IN (${placeholders})
      GROUP BY t.id, t.name, t.type
      HAVING similarity >= ?
      ORDER BY similarity DESC, common_items DESC
      LIMIT 10
    `,
			[tagId, targetItems.length, threshold]
		);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			commonItems: row.common_items,
			similarity: row.similarity,
		}));
	}
}
```

---

## 🚀 Requêtes de Performance

### **Batch Operations**

```typescript
// src/services/storage/batch.ts
export class BatchQueries {
	// Insertion en lot de métadonnées
	static async insertMetadataBatch(db: Database, metadata: ParsedMetadata[]): Promise<void> {
		if (metadata.length === 0) return;

		const values = metadata.map((m) => [
			m.id,
			m.collectionId,
			m.virtualFolderId,
			m.aiDescription,
			JSON.stringify(m.aiTags),
			JSON.stringify(m.aiTagsDetailed),
			m.colorTag,
			JSON.stringify(m.manualTags),
			m.isHidden ? 1 : 0,
			m.lastModified,
		]);

		const placeholders = metadata.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(",");

		await db.execute(
			`
      INSERT INTO metadata (
        id, collectionId, virtualFolderId, aiDescription,
        aiTags, aiTagsDetailed, colorTag, manualTags,
        isHidden, lastModified
      ) VALUES ${placeholders}
    `,
			values.flat()
		);
	}

	// Mise à jour en lot de tags
	static async updateTagsBatch(db: Database, updates: TagUpdate[]): Promise<void> {
		if (updates.length === 0) return;

		// Utiliser une transaction pour garantir la cohérence
		await db.transaction(async () => {
			for (const update of updates) {
				await db.execute(
					`
          UPDATE tags
          SET name = ?, normalizedName = ?, type = ?, confidence = ?
          WHERE id = ?
        `,
					[update.name, update.name.toLowerCase(), update.type, update.confidence, update.id]
				);
			}
		});
	}

	// Suppression en lot d'items-tags
	static async removeItemTagsBatch(
		db: Database,
		itemIds: string[],
		tagIds: string[]
	): Promise<void> {
		if (itemIds.length === 0 || tagIds.length === 0) return;

		const itemPlaceholders = itemIds.map(() => "?").join(",");
		const tagPlaceholders = tagIds.map(() => "?").join(",");

		await db.execute(
			`
      DELETE FROM item_tags
      WHERE itemId IN (${itemPlaceholders}) AND tagId IN (${tagPlaceholders})
    `,
			[...itemIds, ...tagIds]
		);
	}
}
```

### **Lazy Loading**

```typescript
// src/services/storage/lazy.ts
export class LazyQueries {
	// Chargement progressif des métadonnées
	static async getMetadataPaginated(
		db: Database,
		options: PaginatedOptions
	): Promise<PaginatedResult<ParsedMetadata>> {
		const {
			limit = 100,
			offset = 0,
			collectionId,
			sortBy = "lastModified",
			sortOrder = "DESC",
		} = options;

		let sql = `
      SELECT id, collectionId, virtualFolderId, aiDescription,
             aiTags, aiTagsDetailed, colorTag, manualTags,
             isHidden, lastModified
      FROM metadata
      WHERE 1=1
    `;
		const params: any[] = [];

		if (collectionId) {
			sql += ` AND collectionId = ?`;
			params.push(collectionId);
		}

		sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const rows = await db.select(sql, params);
		const items = rows.map((row) => this.parseMetadataRow(row));

		// Compter le total pour la pagination
		const countSql = collectionId
			? `SELECT COUNT(*) as total FROM metadata WHERE collectionId = ?`
			: `SELECT COUNT(*) as total FROM metadata`;

		const countResult = await db.select(countSql, collectionId ? [collectionId] : []);
		const total = countResult[0].total;

		return {
			items,
			total,
			hasMore: offset + items.length < total,
		};
	}

	// Chargement progressif des tags
	static async getTagsPaginated(
		db: Database,
		options: PaginatedOptions
	): Promise<PaginatedResult<ParsedTag>> {
		const { limit = 50, offset = 0, type } = options;

		let sql = `
      SELECT id, name, normalizedName, type, confidence, parentId, createdAt
      FROM tags
      WHERE 1=1
    `;
		const params: any[] = [];

		if (type) {
			sql += ` AND type = ?`;
			params.push(type);
		}

		sql += ` ORDER BY normalizedName ASC LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const rows = await db.select(sql, params);
		const items = rows.map((row) => ({
			id: row.id,
			name: row.name,
			type: row.type,
			confidence: row.confidence,
			parentId: row.parentId,
		}));

		const countSql = type
			? `SELECT COUNT(*) as total FROM tags WHERE type = ?`
			: `SELECT COUNT(*) as total FROM tags`;

		const countResult = await db.select(countSql, type ? [type] : []);
		const total = countResult[0].total;

		return {
			items,
			total,
			hasMore: offset + items.length < total,
		};
	}

	private static parseMetadataRow(row: any): ParsedMetadata {
		return {
			id: row.id,
			collectionId: row.collectionId,
			virtualFolderId: row.virtualFolderId,
			folderId: row.virtualFolderId,
			aiDescription: row.aiDescription,
			aiTags: row.aiTags ? JSON.parse(row.aiTags) : [],
			aiTagsDetailed: row.aiTagsDetailed ? JSON.parse(row.aiTagsDetailed) : [],
			colorTag: row.colorTag,
			manualTags: row.manualTags ? JSON.parse(row.manualTags) : [],
			isHidden: Boolean(row.isHidden),
			lastModified: row.lastModified,
		};
	}
}
```

---

## 🔧 Optimisations

### **Indexes Stratégiques**

```sql
-- Index sur les colonnes fréquemment interrogées
CREATE INDEX idx_metadata_collection ON metadata(collectionId);
CREATE INDEX idx_metadata_folder ON metadata(virtualFolderId);
CREATE INDEX idx_metadata_modified ON metadata(lastModified);
CREATE INDEX idx_metadata_hidden ON metadata(isHidden);

CREATE INDEX idx_tags_normalized_name ON tags(normalizedName);
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_parent ON tags(parentId);

CREATE INDEX idx_item_tags_item ON item_tags(itemId);
CREATE INDEX idx_item_tags_tag ON item_tags(tagId);
CREATE INDEX idx_item_tags_added_at ON item_tags(addedAt);

-- Index composés pour les requêtes complexes
CREATE INDEX idx_metadata_collection_modified ON metadata(collectionId, lastModified);
CREATE INDEX idx_metadata_folder_modified ON metadata(virtualFolderId, lastModified);
```

### **Query Optimization**

```typescript
// Utiliser EXPLAIN QUERY PLAN pour analyser les requêtes
export async function analyzeQuery(
	db: Database,
	sql: string,
	params: any[] = []
): Promise<QueryPlan> {
	const result = await db.select(`EXPLAIN QUERY PLAN ${sql}`, params);
	return {
		sql,
		params,
		plan: result[0],
	};
}

// Exemple d'utilisation
const plan = await analyzeQuery(
	db,
	"SELECT * FROM metadata WHERE collectionId = ? ORDER BY lastModified DESC",
	["collection-123"]
);
console.log("Query plan:", plan);
```

---

## 📊 Monitoring et Debug

### **Performance Monitoring**

```typescript
// src/services/storage/monitoring.ts
export class QueryMonitor {
	private static queryStats: Map<string, QueryStats> = new Map();

	static async executeQuery<T>(
		db: Database,
		queryName: string,
		query: () => Promise<T>
	): Promise<T> {
		const startTime = performance.now();

		try {
			const result = await query();
			const endTime = performance.now();

			this.recordStats(queryName, endTime - startTime, true);
			return result;
		} catch (error) {
			const endTime = performance.now();
			this.recordStats(queryName, endTime - startTime, false);
			throw error;
		}
	}

	private static recordStats(queryName: string, duration: number, success: boolean): void {
		const existing = this.queryStats.get(queryName) || {
			count: 0,
			totalTime: 0,
			successCount: 0,
			failureCount: 0,
			avgTime: 0,
		};

		const updated = {
			count: existing.count + 1,
			totalTime: existing.totalTime + duration,
			successCount: existing.successCount + (success ? 1 : 0),
			failureCount: existing.failureCount + (success ? 0 : 1),
			avgTime: (existing.totalTime + duration) / (existing.count + 1),
		};

		this.queryStats.set(queryName, updated);

		// Log les requêtes lentes
		if (duration > 100) {
			console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
		}
	}

	static getStats(): Map<string, QueryStats> {
		return this.queryStats;
	}

	static resetStats(): void {
		this.queryStats.clear();
	}
}

interface QueryStats {
	count: number;
	totalTime: number;
	successCount: number;
	failureCount: number;
	avgTime: number;
}
```

---

## 🧪 Tests de Requêtes

### **Tests Unitaires**

```typescript
// tests/queries.test.ts
describe("Database Queries", () => {
	let db: Database;

	beforeEach(async () => {
		db = await Database.load(":memory:");
		await initializeDatabase(db);
	});

	test("should get collections efficiently", async () => {
		const collections = await CollectionQueries.getAll(db);
		expect(Array.isArray(collections)).toBe(true);
	});

	test("should search metadata with filters", async () => {
		// Insérer des données de test
		await MetadataQueries.save(db, {
			id: "test-1",
			collectionId: "collection-1",
			aiDescription: "Test description",
			aiTags: ["test", "sample"],
			colorTag: "#ff0000",
			manualTags: ["manual"],
			isHidden: false,
			lastModified: Date.now(),
		});

		const results = await MetadataQueries.search(db, "test", {
			collectionId: "collection-1",
			tags: ["test"],
		});

		expect(results).toHaveLength(1);
		expect(results[0].aiDescription).toContain("Test");
	});
});
```

### **Tests de Performance**

```typescript
// tests/performance.test.ts
describe("Query Performance", () => {
	let db: Database;

	beforeEach(async () => {
		db = await Database.load(":memory:");
		await initializeDatabase(db);
		// Insérer beaucoup de données de test
		await insertTestData(db, 1000);
	});

	test("should handle large datasets efficiently", async () => {
		const startTime = performance.now();

		const results = await MetadataQueries.getBatch(
			db,
			Array.from({ length: 1000 }, (_, i) => `item-${i}`)
		);

		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(results).toHaveLength(1000);
		expect(duration).toBeLessThan(100); // Should complete in <100ms
	});
});
```

---

## 📚 Références

### **SQLite Documentation**

- **[SQLite Performance](https://www.sqlite.org/optimization.html)** : Guide d'optimisation SQLite
- **[Query Planning](https://www.sqlite.org/queryplanner.html)** : Documentation EXPLAIN QUERY PLAN
- **[Indexes](https://www.sqlite.org/lang_createindex.html)** : Documentation des indexes

### **Database Design**

- **[Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)** : Normalisation de base de données
- **[Query Optimization](https://www.sqlshack.com/sql-tuning/)** : Techniques d'optimisation SQL
- **[Index Design](https://use-the-index-luke.com/)** : Guide de conception d'indexes

### **TypeScript Database**

- **[TypeORM](https://typeorm.io/)** : ORM TypeScript
- **[Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)** : SQLite pour TypeScript
- **[Prisma](https://www.prisma.io/)** : Database toolkit TypeScript

---

## 🎯 Checklist de Requêtes

### **✅ Checklist de Performance**

- [ ] **Prepared Statements** : Toutes les requêtes utilisent des statements préparés
- [ ] **Indexes** : Index appropriés sur les colonnes interrogées
- [ ] **Batch Size** : Taille de batch optimisée (100-500)
- [ ] **Pagination** : Pagination implémentée pour les grands ensembles
- [ ] **Monitoring** : Monitoring des requêtes lentes

### **✅ Checklist de Qualité**

- [ ] **Type Safety** : Types TypeScript pour tous les résultats
- [ ] **Error Handling** : Gestion d'erreurs robuste
- [ ] **Transactions** : Transactions pour les opérations multiples
- [ ] **Tests** : Tests unitaires et de performance
- [ ] **Documentation** : Documentation des requêtes complexes

---

**Les requêtes de Lumina Portfolio sont optimisées pour garantir des performances exceptionnelles même avec des milliers de photos ! 🔍**
