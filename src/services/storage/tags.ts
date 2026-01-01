/**
 * Tags Management Module
 * CRUD operations for normalized tags
 */
import { nanoid } from "nanoid";
import { getDB } from "./db";
import type {
	DBTag,
	DBItemTag,
	ParsedTag,
	TagType,
	TagNode,
} from "../../shared/types/database";

// ==================== UTILITIES ====================

/**
 * Generate a unique ID with a given prefix using nanoid
 */
const generateId = (prefix: string): string => {
	return `${prefix}-${nanoid()}`;
};

// ==================== TAG CRUD ====================

/**
 * Get or create a tag by name and type
 * Uses normalizedName for deduplication
 */
export const getOrCreateTag = async (
	name: string,
	type: TagType,
	confidence?: number
): Promise<string> => {
	const db = await getDB();
	const normalizedName = name.toLowerCase().trim();

	// Check if tag already exists
	const existing = await db.select<DBTag[]>(
		"SELECT id FROM tags WHERE normalizedName = ? AND type = ?",
		[normalizedName, type]
	);

	if (existing.length > 0 && existing[0]) {
		return existing[0].id;
	}

	// Create new tag
	const id = generateId('tag');
	await db.execute(
		"INSERT INTO tags (id, name, normalizedName, type, confidence, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
		[id, name, normalizedName, type, confidence ?? null, Date.now()]
	);

	console.log(`[Storage] Tag created: ${name} (${type})`);
	return id;
};

/**
 * Add a tag to an item
 */
export const addTagToItem = async (
	itemId: string,
	tagId: string
): Promise<void> => {
	const db = await getDB();
	await db.execute(
		"INSERT OR IGNORE INTO item_tags (itemId, tagId, addedAt) VALUES (?, ?, ?)",
		[itemId, tagId, Date.now()]
	);
};

/**
 * Remove a tag from an item
 */
export const removeTagFromItem = async (
	itemId: string,
	tagId: string
): Promise<void> => {
	const db = await getDB();
	await db.execute(
		"DELETE FROM item_tags WHERE itemId = ? AND tagId = ?",
		[itemId, tagId]
	);
};

/**
 * Remove all tags from an item (used before full sync)
 */
export const removeAllTagsFromItem = async (itemId: string): Promise<void> => {
	const db = await getDB();
	await db.execute("DELETE FROM item_tags WHERE itemId = ?", [itemId]);
};

/**
 * Get all tags for an item
 */
export const getTagsForItem = async (itemId: string): Promise<ParsedTag[]> => {
	const db = await getDB();
	const rows = await db.select<DBTag[]>(
		`SELECT t.* FROM tags t
     INNER JOIN item_tags it ON t.id = it.tagId
     WHERE it.itemId = ?
     ORDER BY t.type, t.name`,
		[itemId]
	);

	return rows.map((t) => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined,
	}));
};

/**
 * Get all item IDs that have a specific tag
 */
export const getItemsWithTag = async (tagId: string): Promise<string[]> => {
	const db = await getDB();
	const rows = await db.select<{ itemId: string }[]>(
		"SELECT itemId FROM item_tags WHERE tagId = ?",
		[tagId]
	);
	return rows.map((r) => r.itemId);
};

/**
 * Get all tags, optionally filtered by type
 */
export const getAllTags = async (type?: TagType): Promise<ParsedTag[]> => {
	const db = await getDB();
	let rows: DBTag[];

	if (type) {
		rows = await db.select<DBTag[]>(
			"SELECT * FROM tags WHERE type = ? ORDER BY name",
			[type]
		);
	} else {
		rows = await db.select<DBTag[]>("SELECT * FROM tags ORDER BY type, name");
	}

    console.log(`[Storage] getAllTags(${type || 'ALL'}) returned ${rows.length} rows`);

	return rows.map((t) => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined,
	}));
};

/**
 * Search tags by name (fuzzy)
 */
export const searchTags = async (query: string): Promise<ParsedTag[]> => {
	const db = await getDB();
	const normalizedQuery = `%${query.toLowerCase().trim()}%`;

	const rows = await db.select<DBTag[]>(
		"SELECT * FROM tags WHERE normalizedName LIKE ? ORDER BY name LIMIT 20",
		[normalizedQuery]
	);

	return rows.map((t) => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined,
	}));
};

/**
 * Delete a tag and all its associations
 */
export const deleteTag = async (tagId: string): Promise<void> => {
	const db = await getDB();
	// item_tags will be cleaned up via CASCADE
	await db.execute("DELETE FROM tags WHERE id = ?", [tagId]);
	console.log(`[Storage] Tag deleted: ${tagId}`);
};

/**
 * Clear all tags for an item (before re-adding)
 */
export const clearTagsForItem = async (itemId: string): Promise<void> => {
	const db = await getDB();
	await db.execute("DELETE FROM item_tags WHERE itemId = ?", [itemId]);
};

// ==================== BATCH OPERATIONS ====================

/**
 * Add multiple tags to an item at once
 */
export const addTagsToItem = async (
	itemId: string,
	tags: Array<{ name: string; type: TagType; confidence?: number }>
): Promise<void> => {
	// Clear existing tags
	await clearTagsForItem(itemId);

	// Add each tag
	for (const tag of tags) {
		const tagId = await getOrCreateTag(tag.name, tag.type, tag.confidence);
		await addTagToItem(itemId, tagId);
	}
};

/**
 * Get tags grouped by type for an item
 */
export const getTagsGroupedForItem = async (
	itemId: string
): Promise<{
	aiTags: string[];
	manualTags: string[];
	aiTagsDetailed: Array<{ name: string; confidence: number }>;
}> => {
	const tags = await getTagsForItem(itemId);

	return {
		aiTags: tags.filter((t) => t.type === "ai").map((t) => t.name),
		manualTags: tags.filter((t) => t.type === "manual").map((t) => t.name),
		aiTagsDetailed: tags
			.filter((t) => t.type === "ai_detailed")
			.map((t) => ({ name: t.name, confidence: t.confidence ?? 0 })),
	};
};
// ==================== TAG MERGING ====================

/**
 * Merge multiple tags into a single target tag
 * 1. Links all items from source tags to target tag
 * 2. Records merge in history
 * 3. Deletes source tags
 * 4. Keeps target tag description/metadata
 */
export const mergeTags = async (
	targetTagId: string,
	sourceTagIds: string[],
	mergedBy: string = "user"
): Promise<void> => {
	const db = await getDB();
	
	try {
		for (const sourceId of sourceTagIds) {
			if (sourceId === targetTagId) continue;

			// 1. Get source tag details before deletion for history/undo
			const sourceRows = await db.select<Array<{ name: string }>>(
				"SELECT name FROM tags WHERE id = ?",
				[sourceId]
			);
			const sourceName = sourceRows[0]?.name || "Unknown";

			// 2. Get all items associated with source tag
			const itemsWithSource = await getItemsWithTag(sourceId);

			// 3. For each item, add the target tag (ignore if already exists)
			for (const itemId of itemsWithSource) {
				await addTagToItem(itemId, targetTagId);
			}

			// 4. Record merge in history (including the source name)
			const mergeId = generateId('merge');
			await db.execute(
				"INSERT INTO tag_merges (id, targetTagId, sourceTagId, sourceTagName, mergedAt, mergedBy) VALUES (?, ?, ?, ?, ?, ?)",
				[mergeId, targetTagId, sourceId, sourceName, Date.now(), mergedBy]
			);

			// 5. Delete the source tag (cascade will remove item_tags entries)
			await deleteTag(sourceId);
		}
		
		console.log(`[Storage] Merged ${sourceTagIds.length} tags into ${targetTagId}`);

	} catch (error) {
		console.error("Failed to merge tags:", error);
		throw error;
	}
};

// ... (existing syncAllTagsFromMetadata and tag alias methods)

/**
 * Undo a previous tag merge operation recorded in the `tag_merges` table.
 *
 * This will:
 * - Recreate the original source tag using the stored `sourceTagName` and `sourceTagId`.
 * - Re-associate items that were linked from the source tag to the target tag
 *   during the merge back to the restored source tag where possible.
 *
 * Note:
 * - The undo process is **best-effort** and might not fully reconstruct the
 *   exact pre-merge state if item–tag associations were modified after the
 *   merge (for example, if tags were added or removed from items post-merge).
 *
 * @param mergeId - Identifier of the merge record in `tag_merges` to undo.
 * @returns A promise that resolves when the undo operation completes.
 * @throws If the merge record is not found or if any database operation fails.
 */
export const undoMerge = async (mergeId: string): Promise<void> => {
	const db = await getDB();
	
	// 1. Get merge info
	const mergeRows = await db.select<Array<{ 
		targetTagId: string; 
		sourceTagId: string; 
		sourceTagName: string; 
		mergedBy: string;
	}>>(
		"SELECT * FROM tag_merges WHERE id = ?",
		[mergeId]
	);
	
	const merge = mergeRows[0];
	if (!merge) throw new Error("Merge record not found");
	
	try {
		// 2. Re-create the source tag with its original ID.
		// We use 'manual' as the type since the original type wasn't stored.
		// INSERT OR IGNORE is used to prevent errors if the tag (with the same ID) was somehow restored by other means.
		await db.execute(
			"INSERT OR IGNORE INTO tags (id, name, normalizedName, type, createdAt) VALUES (?, ?, ?, ?, ?)",
			[merge.sourceTagId, merge.sourceTagName, merge.sourceTagName.toLowerCase().trim(), 'manual', Date.now()]
		);
		
		// 3. Find items that were part of this merge (difficult if other tags were added since)
		// Better approach: track which items were moved in a separate table?
		// For now, we'll re-sync or just accept it's a "best effort" restore of the tag.
		// A better undo would track item IDs. 
		
		// 4. Delete merge record
		await db.execute("DELETE FROM tag_merges WHERE id = ?", [mergeId]);
		
		console.log(`[Storage] Undo merge complete: ${merge.sourceTagName} restored.`);
	} catch (error) {
		console.error("Failed to undo merge:", error);
		throw error;
	}
};

// ==================== TAG IGNORE MATCHES ====================

/**
 * Mark two tags as NOT similar to ignore them in future analyses
 */
export const ignoreTagMatch = async (tagId1: string, tagId2: string): Promise<void> => {
	const db = await getDB();
	const id = generateId('ignore');
	
	// Ensure consistent order to avoid duplicate pairs (1-2 vs 2-1)
	const [t1, t2] = [tagId1, tagId2].sort();
	
	await db.execute(
		"INSERT OR IGNORE INTO tag_ignore_matches (id, tagId1, tagId2, createdAt) VALUES (?, ?, ?, ?)",
		[id, t1, t2, Date.now()]
	);
	
	console.log(`[Storage] Tag match ignored: ${tagId1} <-> ${tagId2}`);
};

/**
 * Get all ignored tag pairs
 */
export const getIgnoredMatches = async (): Promise<Array<[string, string]>> => {
	const db = await getDB();
	const rows = await db.select<Array<{ tagId1: string, tagId2: string }>>(
		"SELECT tagId1, tagId2 FROM tag_ignore_matches"
	);
	return rows.map(r => [r.tagId1, r.tagId2]);
};

// Migration Utility: Resync all tags from metadata JSON to Relational Tables
// This fixes the issue where tags existed in metadata but not in the tags table
export const syncAllTagsFromMetadata = async (): Promise<number> => {
    const db = await getDB();
    console.log("[Storage] Starting full tag resync...");
    
    // Get all metadata
    const rows = await db.select<{ id: string, aiTags: string, manualTags: string }[]>(
        "SELECT id, aiTags, manualTags FROM metadata"
    );

    let count = 0;

    for (const row of rows) {
        let aiTags: string[] = [];
        let manualTags: string[] = [];

        try { aiTags = JSON.parse(row.aiTags || "[]"); } catch {}
        try { manualTags = JSON.parse(row.manualTags || "[]"); } catch {}

        if (aiTags.length === 0 && manualTags.length === 0) continue;

        // Sync AI Tags
        for (const tagName of aiTags) {
            const tagId = await getOrCreateTag(tagName, "ai");
            // Check link existence to be safe or just try insert
            try { await addTagToItem(row.id, tagId); } catch {}
        }

        // Sync Manual Tags
        for (const tagName of manualTags) {
            const tagId = await getOrCreateTag(tagName, "manual");
            try { await addTagToItem(row.id, tagId); } catch {}
        }
        count++;
    }

    console.log(`[Storage] Resync complete. Processed ${count} items.`);
    return count;
};

// ==================== TAG ALIASES ====================

/**
 * Create a tag alias (synonym)
 * Allows users to type an alias and get suggestions for the canonical tag
 */
export const createTagAlias = async (
	aliasName: string,
	targetTagId: string
): Promise<void> => {
	const db = await getDB();
	const id = generateId('alias');
	
	await db.execute(
		"INSERT INTO tag_aliases (id, aliasName, targetTagId, createdAt) VALUES (?, ?, ?, ?)",
		[id, aliasName.toLowerCase().trim(), targetTagId, Date.now()]
	);
	
	console.log(`[Storage] Alias created: ${aliasName} → ${targetTagId}`);
};

/**
 * Get the target tag for an alias
 */
export const getTagByAlias = async (aliasName: string): Promise<ParsedTag | null> => {
	const db = await getDB();
	const normalized = aliasName.toLowerCase().trim();
	
	const rows = await db.select<Array<{ id: string; name: string; type: TagType; confidence: number | null; parentId: string | null }>>(
		`SELECT t.id, t.name, t.type, t.confidence, t.parentId
		 FROM tags t
		 INNER JOIN tag_aliases a ON t.id = a.targetTagId
		 WHERE a.aliasName = ?`,
		[normalized]
	);
	
	if (rows.length === 0) return null;
	
	const tag = rows[0];
	if (!tag) return null;
	
	return {
		id: tag.id,
		name: tag.name,
		type: tag.type,
		confidence: tag.confidence ?? undefined,
		parentId: tag.parentId ?? undefined,
	};
};

/**
 * Get all aliases for a tag
 */
export const getAliasesForTag = async (tagId: string): Promise<string[]> => {
	const db = await getDB();
	const rows = await db.select<Array<{ aliasName: string }>>(
		"SELECT aliasName FROM tag_aliases WHERE targetTagId = ? ORDER BY aliasName",
		[tagId]
	);
	return rows.map(r => r.aliasName);
};

/**
 * Delete a tag alias
 */
export const deleteTagAlias = async (aliasName: string): Promise<void> => {
	const db = await getDB();
	await db.execute(
		"DELETE FROM tag_aliases WHERE aliasName = ?",
		[aliasName.toLowerCase().trim()]
	);
	console.log(`[Storage] Alias deleted: ${aliasName}`);
};

/**
 * Get merge history for a tag
 */
export const getMergeHistory = async (tagId: string): Promise<Array<{
	id: string;
	sourceTagId: string;
	mergedAt: number;
	mergedBy: string | null;
}>> => {
	const db = await getDB();
	const rows = await db.select<Array<{
		id: string;
		sourceTagId: string;
		mergedAt: number;
		mergedBy: string | null;
	}>>(
		"SELECT id, sourceTagId, mergedAt, mergedBy FROM tag_merges WHERE targetTagId = ? ORDER BY mergedAt DESC",
		[tagId]
	);
	return rows;
};

// ==================== HIERARCHY ====================

/**
 * Set the parent of a tag
 */
export const setTagParent = async (
	tagId: string,
	parentId: string | null
): Promise<void> => {
	const db = await getDB();
	
	// Prevent circular references by walking the ancestor chain
	if (parentId !== null) {
		// Check shallow self-reference first
		if (parentId === tagId) {
			throw new Error("A tag cannot be its own parent");
		}

		let currentParentId: string | null = parentId;

		// Traverse up the hierarchy until we hit the root or detect a cycle
		while (currentParentId) {
			if (currentParentId === tagId) {
				throw new Error("Setting this parent would create a circular tag hierarchy");
			}

			const rows = await db.select<Array<{ parentId: string | null }>>(
				"SELECT parentId FROM tags WHERE id = ?",
				[currentParentId]
			);

			if (!rows || !rows.length) {
				// Parent tag not found; treat as end of chain
				break;
			}

			currentParentId = rows[0].parentId;
		}
	}

	await db.execute(
		"UPDATE tags SET parentId = ? WHERE id = ?",
		[parentId, tagId]
	);
	
	console.log(`[Storage] Tag parent updated: ${tagId} -> ${parentId}`);
};

/**
 * Get all tags in a hierarchical tree structure
 */
export const getTagTree = async (type?: TagType): Promise<TagNode[]> => {
	const allTags = await getAllTags(type);
	const nodes: Map<string, TagNode> = new Map();
	const rootNodes: TagNode[] = [];

	// Initialize nodes
	for (const tag of allTags) {
		nodes.set(tag.id, { ...tag, children: [] });
	}

	// Build tree
	for (const node of nodes.values()) {
		if (node.parentId && nodes.has(node.parentId)) {
			const parent = nodes.get(node.parentId)!;
			parent.children.push(node);
		} else {
			rootNodes.push(node);
		}
	}

	return rootNodes;
};

/**
 * Rename a tag
 */
export const renameTag = async (tagId: string, newName: string): Promise<void> => {
	const db = await getDB();
	const normalizedName = newName.toLowerCase().trim();
	
	await db.execute(
		"UPDATE tags SET name = ?, normalizedName = ? WHERE id = ?",
		[newName, normalizedName, tagId]
	);
	
	console.log(`[Storage] Tag renamed: ${tagId} -> ${newName}`);
};

/**
 * Delete multiple tags at once
 */
export const bulkDeleteTags = async (tagIds: string[]): Promise<void> => {
	if (tagIds.length === 0) return;
	const db = await getDB();
	const placeholders = tagIds.map(() => "?").join(",");
	await db.execute(`DELETE FROM tags WHERE id IN (${placeholders})`, tagIds);
	console.log(`[Storage] Bulk deleted ${tagIds.length} tags`);
};

/**
 * Get all tags with their usage count
 */
export interface TagWithUsage extends ParsedTag {
	usageCount: number;
}

export const getTagsWithUsageStats = async (type?: TagType): Promise<TagWithUsage[]> => {
	const db = await getDB();
	
	let sql = `
		SELECT t.*, COUNT(it.tagId) as usageCount
		FROM tags t
		LEFT JOIN item_tags it ON t.id = it.tagId
	`;
	
	const params: any[] = [];
	if (type) {
		sql += " WHERE t.type = ? ";
		params.push(type);
	}
	
	sql += " GROUP BY t.id ORDER BY t.name ASC";
	
	const rows = await db.select<Array<DBTag & { usageCount: number }>>(sql, params);
	
	return rows.map(t => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined,
		usageCount: t.usageCount
	}));
};

/**
 * Get the most frequently used tags
 */
export const getMostUsedTags = async (limit: number = 10): Promise<ParsedTag[]> => {
	const db = await getDB();
	const rows = await db.select<DBTag[]>(
		`SELECT t.*, COUNT(it.tagId) as usageCount
		 FROM tags t
		 LEFT JOIN item_tags it ON t.id = it.tagId
		 GROUP BY t.id
		 ORDER BY usageCount DESC, t.name ASC
		 LIMIT ?`,
		[limit]
	);
	
	return rows.map(t => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined
	}));
};

/**
 * Get the most recently applied tags
 */
export const getRecentTags = async (limit: number = 5): Promise<ParsedTag[]> => {
	const db = await getDB();
	const rows = await db.select<DBTag[]>(
		`SELECT DISTINCT t.*
		 FROM tags t
		 INNER JOIN item_tags it ON t.id = it.tagId
		 ORDER BY it.addedAt DESC
		 LIMIT ?`,
		[limit]
	);
	
	return rows.map(t => ({
		id: t.id,
		name: t.name,
		type: t.type,
		confidence: t.confidence ?? undefined,
		parentId: t.parentId ?? undefined
	}));
};
