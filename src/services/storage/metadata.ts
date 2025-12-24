/**
 * Metadata Management Module
 * AI Tags, Colors, Folder Assignment operations
 */
import { getDB } from "./db";
import type {
	DBMetadata,
	ParsedMetadata,
	MetadataInput,
} from "../../shared/types/database";

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
		console.log(`[Storage] Metadata saved.`);
	} catch (e) {
		console.error(`[Storage] Failed to save metadata:`, e);
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
