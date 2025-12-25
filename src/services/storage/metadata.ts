/**
 * Metadata Management Module
 * AI Tags, Colors, Folder Assignment operations
 */
import { DBMetadata, ParsedMetadata, MetadataInput } from "../../shared/types/database";
import { getDB } from "./db";
import { getOrCreateTag, addTagToItem, removeAllTagsFromItem } from "./tags";

/**
 * Save or update metadata for an item
 */
export const saveMetadata = async (
	item: MetadataInput,
	relativePath: string,
	collectionId?: string
): Promise<void> => {
	const db = await getDB();
	const finalCollectionId = collectionId || item.collectionId;

	console.log(
		`[Storage] Saving metadata for: ${relativePath} (collection: ${finalCollectionId})`
	);
	try {
		await db.execute(
			`INSERT OR REPLACE INTO metadata 
        (id, collectionId, virtualFolderId, aiDescription, aiTags, aiTagsDetailed, colorTag, manualTags, lastModified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				relativePath,
				finalCollectionId || null,
				item.virtualFolderId || item.folderId || null,
				item.aiDescription,
				JSON.stringify(item.aiTags || []),
				JSON.stringify(item.aiTagsDetailed || []),
				item.colorTag,
				JSON.stringify(item.manualTags || []),
				Date.now(),
			]
		);
	console.log(`[Storage] Metadata saved for ${item.id || "unknown"}`);

    // Sync tags to relational tables for Analysis/Fusion features
    try {
        // 1. Clear existing links for this item to avoid duplicates (safest approach on save)
        await removeAllTagsFromItem(item.id!);

        // 2. Sync AI Tags
        if (item.aiTags && item.aiTags.length > 0) {
            for (const tagName of item.aiTags) {
                const tagId = await getOrCreateTag(tagName, "ai");
                await addTagToItem(item.id!, tagId, 1.0); // Default confidence 1.0 for now
            }
        }

        // 3. Sync Manual Tags
        if (item.manualTags && item.manualTags.length > 0) {
            for (const tagName of item.manualTags) {
                const tagId = await getOrCreateTag(tagName, "manual");
                await addTagToItem(item.id!, tagId, 1.0);
            }
        }
        console.log(`[Storage] Tags synced to relational DB for ${item.id}`);
    } catch (err) {
        console.error(`[Storage] Failed to sync tags for ${item.id}:`, err);
        // Be careful not to throw here, we don't want to break the main metadata save
    }
};

/**
 * Get metadata for multiple items in batch
 */
export const getMetadataBatch = async (
	keys: string[],
	collectionId?: string
): Promise<Map<string, ParsedMetadata>> => {
	const db = await getDB();
	const resultMap = new Map<string, ParsedMetadata>();

	let results: DBMetadata[] = [];
	if (keys.length === 0) {
		// No keys: return all metadata (optionally filtered by collection)
		if (collectionId) {
			results = await db.select<DBMetadata[]>(
				"SELECT * FROM metadata WHERE collectionId = ?",
				[collectionId]
			);
			console.log(
				`[Storage] getMetadataBatch: Loaded ${results.length} metadata for collection ${collectionId}`
			);
		} else {
			results = await db.select<DBMetadata[]>("SELECT * FROM metadata");
			console.log(
				`[Storage] getMetadataBatch: Loaded ${results.length} metadata (all collections)`
			);
		}
	} else {
		// With keys: fetch specific items (optionally filtered by collection)
		for (const key of keys) {
			let row: DBMetadata[];
			if (collectionId) {
				row = await db.select<DBMetadata[]>(
					"SELECT * FROM metadata WHERE id = ? AND collectionId = ?",
					[key, collectionId]
				);
			} else {
				row = await db.select<DBMetadata[]>(
					"SELECT * FROM metadata WHERE id = ?",
					[key]
				);
			}
			if (row.length > 0 && row[0]) results.push(row[0]);
		}
		console.log(
			`[Storage] getMetadataBatch: Loaded ${results.length}/${
				keys.length
			} metadata for collection ${collectionId || "all"}`
		);
	}

	results.forEach((meta) => {
		resultMap.set(meta.id, {
			id: meta.id,
			collectionId: meta.collectionId,
			virtualFolderId: meta.virtualFolderId,
			folderId: meta.virtualFolderId ?? undefined,
			aiDescription: meta.aiDescription,
			aiTags: JSON.parse(meta.aiTags || "[]"),
			aiTagsDetailed: JSON.parse(meta.aiTagsDetailed || "[]"),
			colorTag: meta.colorTag,
			manualTags: JSON.parse(meta.manualTags || "[]"),
			isHidden: meta.isHidden === 1,
			lastModified: meta.lastModified,
		});
	});
	return resultMap;
};

// ==================== VIRTUAL DELETION ====================

/**
 * Hide an image (virtual deletion)
 */
export const hideImage = async (imageId: string): Promise<void> => {
	const db = await getDB();
	await db.execute("UPDATE metadata SET isHidden = 1 WHERE id = ?", [imageId]);
	console.log(`[Storage] Image hidden: ${imageId}`);
};

/**
 * Unhide an image (restore from virtual deletion)
 */
export const unhideImage = async (imageId: string): Promise<void> => {
	const db = await getDB();
	await db.execute("UPDATE metadata SET isHidden = 0 WHERE id = ?", [imageId]);
	console.log(`[Storage] Image restored: ${imageId}`);
};
