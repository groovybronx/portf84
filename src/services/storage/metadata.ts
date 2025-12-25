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
	console.log(`[Storage] Metadata saved for ${relativePath}`);

    // Sync tags to relational tables for Analysis/Fusion features
    try {
        // 1. Clear existing links for this item to avoid duplicates (safest approach on save)
        await removeAllTagsFromItem(relativePath);

        // 2. Sync AI Tags
        if (item.aiTags && item.aiTags.length > 0) {
            for (const tagName of item.aiTags) {
                const tagId = await getOrCreateTag(tagName, "ai");
                await addTagToItem(relativePath, tagId); // 2 args only
            }
        }

        // 3. Sync Manual Tags
        if (item.manualTags && item.manualTags.length > 0) {
            for (const tagName of item.manualTags) {
                const tagId = await getOrCreateTag(tagName, "manual");
                await addTagToItem(relativePath, tagId);
            }
        }
        console.log(`[Storage] Tags synced to relational DB for ${relativePath}`);
    } catch (err) {
        console.error(`[Storage] Failed to sync tags for ${relativePath}:`, err);
        // Be careful not to throw here, we don't want to break the main metadata save
    }
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
	const loadedIds = results.map(r => r.id);
    const itemTagsMap = new Map<string, { manual: string[]; ai: string[]; detailed: any[] }>();
    
    if (loadedIds.length > 0) {
        // Chunk the IDs to avoid SQLite limit arguments if necessary, though typical usage is safe-ish
        // For safety, let's process 500 IDs at a time or just simplicity for now (assuming reasonable batch size)
        
        // We can't easily do "WHERE itemId IN (...)" for massive lists standardly without chunking.
        // But for local app usage, let's try a single query first or loop if keys > 999.
        // Actually, let's stick to a simpler approach: 
        // If retrieving ALL (keys.length === 0), we can just select all item_tags.
        // If retrieving specific keys, filter by them.
        
        let tagsQuery = `
            SELECT it.itemId, t.name, t.type, t.confidence 
            FROM item_tags it
            JOIN tags t ON it.tagId = t.id
        `;
        
        let tagsRows: any[] = [];
        
        if (keys.length === 0) {
            // Fetch ALL tags for the collection items we just found
             if (collectionId) {
                 // optimization: we know 'results' are filtered, so we filter tags by the items we have
                 // But passing thousands of IDs to IN clause is bad.
                 // Better: JOIN metadata in the tag query itself?
                 tagsQuery += ` JOIN metadata m ON it.itemId = m.id WHERE m.collectionId = ?`;
                 tagsRows = await db.select(tagsQuery, [collectionId]);
             } else {
                 tagsRows = await db.select(tagsQuery);
             }
        } else {
            // Specific keys. If small enough, use IN. If large, looping is safer but slower.
            // Let's assume keys are reasonable (usually a folder's content).
             const placeholders = loadedIds.map(() => '?').join(',');
             tagsQuery += ` WHERE it.itemId IN (${placeholders})`;
             tagsRows = await db.select(tagsQuery, loadedIds);
        }

        // Group tags by itemId
        tagsRows.forEach(row => {
            if (!itemTagsMap.has(row.itemId)) {
                itemTagsMap.set(row.itemId, { manual: [], ai: [], detailed: [] });
            }
            const entry = itemTagsMap.get(row.itemId)!;
            
            if (row.type === 'manual') {
                entry.manual.push(row.name);
            } else if (row.type === 'ai') {
                entry.ai.push(row.name);
                if (row.confidence) {
                    entry.detailed.push({ name: row.name, confidence: row.confidence });
                }
            }
        });
    }

	results.forEach((meta) => {
        // Prefer relational tags if available, fallback to JSON (for safety/transitions)
        const relationalTags = itemTagsMap.get(meta.id);
        
		resultMap.set(meta.id, {
			id: meta.id,
			collectionId: meta.collectionId,
			virtualFolderId: meta.virtualFolderId,
			folderId: meta.virtualFolderId ?? undefined,
			aiDescription: meta.aiDescription,
			aiTags: relationalTags?.ai.length ? relationalTags.ai : JSON.parse(meta.aiTags || "[]"),
			aiTagsDetailed: relationalTags?.detailed.length ? relationalTags.detailed : JSON.parse(meta.aiTagsDetailed || "[]"),
			colorTag: meta.colorTag,
			manualTags: relationalTags?.manual.length ? relationalTags.manual : JSON.parse(meta.manualTags || "[]"),
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
