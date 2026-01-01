/**
 * Smart Collection Service
 * Handles saved searches and dynamic albums
 */
import { nanoid } from "nanoid";
import { getDB } from "./storage/db";

export interface SmartCollection {
	id: string;
	collectionId: string;
	name: string;
	query: string; // JSON string
	icon?: string;
	color?: string;
	createdAt: number;
}

export interface SmartCollectionInput {
	collectionId: string;
	name: string;
	query: any; // Query object to be stringified
	icon?: string;
	color?: string;
}

const generateId = (prefix: string): string => {
	return `${prefix}-${nanoid()}`;
};

/**
 * Create a new smart collection
 */
export const createSmartCollection = async (input: SmartCollectionInput): Promise<string> => {
	const db = await getDB();
	const id = generateId('smart');
	
	await db.execute(
		"INSERT INTO smart_collections (id, collectionId, name, query, icon, color, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
		[id, input.collectionId, input.name, JSON.stringify(input.query), input.icon || null, input.color || null, Date.now()]
	);
	
	return id;
};

/**
 * Get all smart collections for a specific collection
 */
export const getAllSmartCollections = async (collectionId: string): Promise<SmartCollection[]> => {
	const db = await getDB();
	const rows = await db.select<SmartCollection[]>(
		"SELECT * FROM smart_collections WHERE collectionId = ? ORDER BY createdAt DESC",
		[collectionId]
	);
	return rows;
};

/**
 * Delete a smart collection
 */
export const deleteSmartCollection = async (id: string): Promise<void> => {
	const db = await getDB();
	await db.execute("DELETE FROM smart_collections WHERE id = ?", [id]);
};

/**
 * Update a smart collection
 */
export const updateSmartCollection = async (id: string, updates: Partial<SmartCollectionInput>): Promise<void> => {
	const db = await getDB();
	const sets: string[] = [];
	const values: any[] = [];
	
	if (updates.name) { sets.push("name = ?"); values.push(updates.name); }
	if (updates.query) { sets.push("query = ?"); values.push(JSON.stringify(updates.query)); }
	if (updates.icon) { sets.push("icon = ?"); values.push(updates.icon); }
	if (updates.color) { sets.push("color = ?"); values.push(updates.color); }
	
	if (sets.length === 0) return;
	
	values.push(id);
	await db.execute(
		`UPDATE smart_collections SET ${sets.join(', ')} WHERE id = ?`,
		values
	);
};

/**
 * Resolve a smart collection to a list of item IDs
 */
export const resolveSmartCollection = async (id: string, collectionId: string): Promise<string[]> => {
	const db = await getDB();
	const rows = await db.select<Array<{ query: string }>>(
		"SELECT query FROM smart_collections WHERE id = ? AND collectionId = ?",
		[id, collectionId]
	);
	
	const row = rows[0];
	if (!row) return [];
	
	let queryObj: any;
	try {
		queryObj = JSON.parse(row.query);
	} catch (error) {
		// Malformed or corrupted query JSON: fail gracefully with no results
		console.error(`[SmartCollection] Failed to parse query for collection ${id}:`, error);
		return [];
	}
	
	// Build SQL query dynamically based on rules
	// We use EXISTS subqueries to correctly handle both AND/OR without multiple joins
	let sql = "SELECT m.id FROM metadata m";
	const conditions: string[] = ["m.collectionId = ?"];
	const params: any[] = [collectionId];
	
	if (queryObj.rules && Array.isArray(queryObj.rules)) {
		const ruleConditions: string[] = [];
		for (const rule of queryObj.rules) {
			if (rule.type === 'tag') {
				ruleConditions.push(`EXISTS (
					SELECT 1 FROM item_tags it 
					JOIN tags t ON it.tagId = t.id 
					WHERE it.itemId = m.id AND t.name = ?
				)`);
				params.push(rule.value);
			} else if (rule.type === 'color') {
				ruleConditions.push("m.colorTag = ?");
				params.push(rule.value);
			} else if (rule.type === 'not_tag') {
				ruleConditions.push(`NOT EXISTS (
					SELECT 1 FROM item_tags it 
					JOIN tags t ON it.tagId = t.id 
					WHERE it.itemId = m.id AND t.name = ?
				)`);
				params.push(rule.value);
			}
		}

		if (ruleConditions.length > 0) {
			const op = queryObj.operator === 'OR' ? ' OR ' : ' AND ';
			conditions.push(`(${ruleConditions.join(op)})`);
		}
	}
	
	sql += " WHERE " + conditions.join(" AND ");
	
	const results = await db.select<Array<{ id: string }>>(sql, params);
	return results.map(r => r.id);
};
