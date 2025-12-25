/**
 * Tags Management Module
 * CRUD operations for normalized tags
 */
import { getDB } from "./db";
import type {
	DBTag,
	DBItemTag,
	ParsedTag,
	TagType,
} from "../../shared/types/database";

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
	const id = `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
 * 2. Deletes source tags
 * 3. Keeps target tag description/metadata
 */
export const mergeTags = async (
	targetTagId: string,
	sourceTagIds: string[]
): Promise<void> => {
	const db = await getDB();
	
	try {
        // We simulate a transaction using sequential operations
        // Since sqlite plugin doesn't support explicit BEGIN TRANSACTION in raw execute for all drivers
        // But for this operation logic, we can proceed step by step.
        
		for (const sourceId of sourceTagIds) {
			if (sourceId === targetTagId) continue;

			// 1. Get all items associated with source tag
			const itemsWithSource = await getItemsWithTag(sourceId);

			// 2. For each item, add the target tag (ignore if already exists)
			for (const itemId of itemsWithSource) {
				await addTagToItem(itemId, targetTagId);
			}

			// 3. Delete the source tag (cascade will remove item_tags entries)
			await deleteTag(sourceId);
		}
		
		console.log(`[Storage] Merged ${sourceTagIds.length} tags into ${targetTagId}`);

	} catch (error) {
		console.error("Failed to merge tags:", error);
		throw error;
	}
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
