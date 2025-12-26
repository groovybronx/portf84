/**
 * Collections Management Module
 * CRUD operations for Collections (workspaces)
 */
import { getDB } from "./db";
import type {
	DBCollection,
	ParsedCollection,
} from "../../shared/types/database";

/**
 * Create a new collection
 */
export const createCollection = async (name: string): Promise<string> => {
	const db = await getDB();
	const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

	await db.execute(
		"INSERT INTO collections (id, name, createdAt, lastOpenedAt, isActive) VALUES (?, ?, ?, ?, ?)",
		[id, name, Date.now(), Date.now(), 1]
	);

	// Deactivate all other collections
	await db.execute("UPDATE collections SET isActive = 0 WHERE id != ?", [id]);

	console.log(`[Storage] Collection created: ${name} (${id})`);
	return id;
};

/**
 * Get all collections, ordered by last opened
 */
export const getCollections = async (): Promise<ParsedCollection[]> => {
	const db = await getDB();
	const collections = await db.select<DBCollection[]>(
		"SELECT * FROM collections ORDER BY createdAt ASC"
	);
	return collections.map((c) => ({
		...c,
		lastOpenedAt: c.lastOpenedAt ?? undefined,
		isActive: c.isActive === 1,
	}));
};

/**
 * Get the currently active collection
 */
export const getActiveCollection = async (): Promise<ParsedCollection | null> => {
	const db = await getDB();
	const results = await db.select<DBCollection[]>(
		"SELECT * FROM collections WHERE isActive = 1 LIMIT 1"
	);
	if (results.length === 0 || !results[0]) return null;
	const c = results[0];
	return {
		id: c.id,
		name: c.name,
		createdAt: c.createdAt,
		lastOpenedAt: c.lastOpenedAt ?? undefined,
		isActive: true,
	};
};

/**
 * Set a collection as active
 */
export const setActiveCollection = async (id: string): Promise<void> => {
	const db = await getDB();
	await db.execute("UPDATE collections SET isActive = 0");
	await db.execute(
		"UPDATE collections SET isActive = 1, lastOpenedAt = ? WHERE id = ?",
		[Date.now(), id]
	);
	console.log(`[Storage] Active collection set to: ${id}`);
};

/**
 * Delete a collection and clean up related data
 */
export const deleteCollection = async (id: string): Promise<void> => {
	const db = await getDB();
	// Foreign key constraints will cascade delete collection_folders and virtual_folders
	await db.execute("DELETE FROM collections WHERE id = ?", [id]);
	// Clean up metadata
	await db.execute(
		"UPDATE metadata SET collectionId = NULL WHERE collectionId = ?",
		[id]
	);
	console.log(`[Storage] Collection deleted: ${id}`);
};
