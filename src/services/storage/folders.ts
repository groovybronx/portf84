/**
 * Folders Management Module
 * Virtual folders, Shadow folders, and Collection folders operations
 */
import { getDB } from "./db";
import type {
	DBVirtualFolder,
	DBCollectionFolder,
	ParsedVirtualFolder,
	VirtualFolderInput,
	ShadowFolderPair,
} from "../../shared/types/database";

// ==================== VIRTUAL FOLDERS ====================

/**
 * Save or update a virtual folder
 */
export const saveVirtualFolder = async (folder: VirtualFolderInput): Promise<void> => {
	const db = await getDB();
	await db.execute(
		"INSERT OR REPLACE INTO virtual_folders (id, collectionId, name, createdAt, isVirtual, sourceFolderId) VALUES (?, ?, ?, ?, ?, ?)",
		[
			folder.id,
			folder.collectionId,
			folder.name,
			folder.createdAt,
			1,
			folder.sourceFolderId || null,
		]
	);
};

/**
 * Delete a virtual folder
 */
export const deleteVirtualFolder = async (id: string): Promise<void> => {
	const db = await getDB();
	await db.execute("DELETE FROM virtual_folders WHERE id = ?", [id]);
};

/**
 * Get all virtual folders, optionally filtered by collection
 */
export const getVirtualFolders = async (
	collectionId?: string
): Promise<ParsedVirtualFolder[]> => {
	const db = await getDB();
	let rawFolders: DBVirtualFolder[];
	if (collectionId) {
		rawFolders = await db.select<DBVirtualFolder[]>(
			"SELECT * FROM virtual_folders WHERE collectionId = ?",
			[collectionId]
		);
		console.log(
			`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders for collection ${collectionId}`
		);
	} else {
		rawFolders = await db.select<DBVirtualFolder[]>(
			"SELECT * FROM virtual_folders"
		);
		console.log(
			`[Storage] getVirtualFolders: Loaded ${rawFolders.length} virtual folders (all collections)`
		);
	}
	return rawFolders.map((f) => ({
		...f,
		items: [] as [],
		isVirtual: f.isVirtual === 1,
		sourceFolderId: f.sourceFolderId ?? undefined,
	}));
};

// ==================== SHADOW FOLDERS ====================

/**
 * Create a shadow folder for a source folder
 */
export const createShadowFolder = async (
	collectionId: string,
	sourceFolderId: string,
	name: string
): Promise<string> => {
	const db = await getDB();
	const id = `shadow-${Date.now()}-${Math.random()
		.toString(36)
		.substring(2, 9)}`;

	await db.execute(
		"INSERT INTO virtual_folders (id, collectionId, name, createdAt, isVirtual, sourceFolderId) VALUES (?, ?, ?, ?, ?, ?)",
		[id, collectionId, name, Date.now(), 1, sourceFolderId]
	);

	console.log(
		`[Storage] Shadow folder created: ${name} (${id}) for source ${sourceFolderId}`
	);
	return id;
};

/**
 * Get shadow folder for a source folder
 */
export const getShadowFolder = async (
	sourceFolderId: string
): Promise<ParsedVirtualFolder | null> => {
	const db = await getDB();
	const results = await db.select<DBVirtualFolder[]>(
		"SELECT * FROM virtual_folders WHERE sourceFolderId = ? LIMIT 1",
		[sourceFolderId]
	);
	if (results.length === 0 || !results[0]) return null;
	const f = results[0];
	return {
		id: f.id,
		collectionId: f.collectionId,
		name: f.name,
		createdAt: f.createdAt,
		items: [] as [],
		isVirtual: f.isVirtual === 1,
		sourceFolderId: f.sourceFolderId ?? undefined,
	};
};

/**
 * Get all shadow folders with their source folder pairs
 */
export const getShadowFoldersWithSources = async (
	collectionId: string
): Promise<ShadowFolderPair[]> => {
	const shadowFolders = await getVirtualFolders(collectionId);
	const sourceFolders = await getCollectionFolders(collectionId);

	const results = shadowFolders
		.filter((vf) => vf.sourceFolderId)
		.map((shadow) => {
			const source = sourceFolders.find(
				(sf) => sf.id === shadow.sourceFolderId
			);
			return { shadowFolder: shadow, sourceFolder: source! };
		})
		.filter((pair) => pair.sourceFolder);

	console.log(
		`[Storage] getShadowFoldersWithSources: Found ${results.length} shadow folder pairs for collection ${collectionId}`
	);
	return results;
};

/**
 * Get manual collections (virtual folders without source)
 */
export const getManualCollections = async (
	collectionId: string
): Promise<ParsedVirtualFolder[]> => {
	const allVirtual = await getVirtualFolders(collectionId);
	const manualCollections = allVirtual.filter((vf) => !vf.sourceFolderId);
	console.log(
		`[Storage] getManualCollections: Found ${manualCollections.length} manual collections`
	);
	return manualCollections;
};

// ==================== COLLECTION FOLDERS (Source Folders) ====================

/**
 * Add a source folder to a collection
 */
export const addFolderToCollection = async (
	collectionId: string,
	path: string
): Promise<string> => {
	console.log(`[Storage] addFolderToCollection called with:`, {
		collectionId,
		path,
	});
	const db = await getDB();
	const name = path.split("/").pop() || "Folder";
	const id = `src-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

	console.log(`[Storage] Inserting into collection_folders:`, {
		id,
		collectionId,
		path,
		name,
	});

	try {
		// 1. Add source folder to collection_folders
		await db.execute(
			"INSERT INTO collection_folders (id, collectionId, path, name, addedAt) VALUES (?, ?, ?, ?, ?)",
			[id, collectionId, path, name, Date.now()]
		);
		console.log(
			`[Storage] ✅ Folder successfully added to collection: ${path}`
		);

		// Verify insertion
		const verify = await db.select<DBCollectionFolder[]>(
			"SELECT * FROM collection_folders WHERE id = ?",
			[id]
		);
		console.log(`[Storage] Verification - Inserted row:`, verify);

		// 2. Automatically create shadow folder (if not already exists)
		const existingShadow = await getShadowFolder(id);
		if (existingShadow) {
			console.log(
				`[Storage] ✅ Shadow folder already exists: ${existingShadow.id}, skipping creation`
			);
			return existingShadow.id;
		}

		const shadowId = await createShadowFolder(collectionId, id, name);
		console.log(`[Storage] ✅ Shadow folder created automatically: ${shadowId}`);

		return shadowId;
	} catch (error) {
		console.error(`[Storage] ❌ Error adding folder to collection:`, error);
		throw error;
	}
};

/**
 * Remove a source folder from a collection
 */
export const removeFolderFromCollection = async (
	collectionId: string,
	path: string
): Promise<void> => {
	const db = await getDB();
	await db.execute(
		"DELETE FROM collection_folders WHERE collectionId = ? AND path = ?",
		[collectionId, path]
	);
	console.log(`[Storage] Folder removed from collection: ${path}`);
};

/**
 * Get all source folders for a collection
 */
export const getCollectionFolders = async (
	collectionId: string
): Promise<DBCollectionFolder[]> => {
	const db = await getDB();
	const result = await db.select<DBCollectionFolder[]>(
		"SELECT * FROM collection_folders WHERE collectionId = ? ORDER BY addedAt DESC",
		[collectionId]
	);
	console.log(`[Storage] getCollectionFolders(${collectionId}):`, result);
	return result;
};

/**
 * DEBUG: List all collection folders in database
 */
export const debugListAllCollectionFolders = async (): Promise<DBCollectionFolder[]> => {
	const db = await getDB();
	const result = await db.select<DBCollectionFolder[]>(
		"SELECT * FROM collection_folders ORDER BY addedAt DESC"
	);
	console.log("[Storage] DEBUG - All collection_folders in DB:", result);
	return result;
};
