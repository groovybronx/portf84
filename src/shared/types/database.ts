/**
 * Database Types - Strict interfaces for SQLite operations
 * These types match the actual DB schema and should be used instead of `any`
 */

// ==================== RAW DATABASE TYPES ====================
// These match exactly what is stored/returned from SQLite

/** Raw metadata row from database */
export interface DBMetadata {
  id: string;
  collectionId: string | null;
  virtualFolderId: string | null;
  aiDescription: string | null;
  aiTags: string | null; // JSON string
  aiTagsDetailed: string | null; // JSON string
  colorTag: string | null;
  manualTags: string | null; // JSON string
  isHidden: number; // 0 or 1
  lastModified: number;
}

/** Parsed metadata with JSON fields deserialized */
export interface ParsedMetadata {
  id: string;
  collectionId: string | null;
  virtualFolderId: string | null;
  folderId?: string | null; // Backward compat alias for virtualFolderId
  aiDescription: string | null;
  aiTags: string[];
  aiTagsDetailed: Array<{ name: string; confidence: number }>;
  colorTag: string | null;
  manualTags: string[];
  isHidden?: boolean;
  lastModified: number;
}

/** Raw virtual folder row from database */
export interface DBVirtualFolder {
  id: string;
  collectionId: string;
  name: string;
  createdAt: number;
  isVirtual: number; // 0 or 1
  sourceFolderId: string | null;
}

/** Parsed virtual folder with boolean conversion - compatible with Folder type */
export interface ParsedVirtualFolder {
  id: string;
  collectionId: string;
  name: string;
  createdAt: number;
  isVirtual: boolean;
  sourceFolderId?: string; // Changed from null to undefined for compatibility
  items: []; // Always empty array from DB, populated later
}

/** Raw collection row from database */
export interface DBCollection {
  id: string;
  name: string;
  createdAt: number;
  lastOpenedAt: number | null;
  isActive: number; // 0 or 1
}

/** Parsed collection with proper types for frontend usage */
export interface ParsedCollection {
  id: string;
  name: string;
  createdAt: number;
  lastOpenedAt?: number; // Converted from null to undefined for frontend
  isActive: boolean;
}

/** Raw collection folder (source folder) from database */
export interface DBCollectionFolder {
  id: string;
  collectionId: string;
  path: string;
  name: string;
  addedAt: number;
}

/** Raw handle row from database */
export interface DBHandle {
  id: string;
  path: string;
  isRoot: number; // 0 or 1
}

/** Parsed handle with boolean conversion */
export interface ParsedHandle {
  id: string;
  path: string;
  isRoot: boolean;
}

// ==================== INPUT TYPES ====================
// Types for function parameters

/** Input for saving metadata */
export interface MetadataInput {
  collectionId?: string;
  virtualFolderId?: string;
  folderId?: string; // Backward compat
  aiDescription?: string;
  aiTags?: string[];
  aiTagsDetailed?: Array<{ name: string; confidence: number }>;
  colorTag?: string;
  manualTags?: string[];
}

/** Input for saving virtual folder */
export interface VirtualFolderInput {
  id: string;
  collectionId: string;
  name: string;
  createdAt: number;
  sourceFolderId?: string | null;
}

// ==================== RESULT TYPES ====================

/** Shadow folder paired with its source */
export interface ShadowFolderPair {
  shadowFolder: ParsedVirtualFolder;
  sourceFolder: DBCollectionFolder;
}

// ==================== NORMALIZED TAGS ====================

export type TagType = 'ai' | 'manual' | 'ai_detailed';

/** Raw tag row from database */
export interface DBTag {
  id: string;
  name: string;
  normalizedName: string;
  type: TagType;
  confidence: number | null;
  parentId: string | null;
  createdAt: number;
}

/** Parsed tag for frontend usage */
export interface ParsedTag {
  id: string;
  name: string;
  type: TagType;
  confidence?: number;
  parentId?: string;
}

/** Hierarchical tag node for tree display */
export interface TagNode extends ParsedTag {
  children: TagNode[];
}

/** Raw item-tag relation from database */
export interface DBItemTag {
  itemId: string;
  tagId: string;
  addedAt: number;
}

/** Raw tag merge record from database */
export interface DBTagMerge {
  id: string;
  targetTagId: string;
  sourceTagId: string;
  sourceTagName: string | null;
  mergedAt: number;
  mergedBy: string | null;
}

/** Raw tag alias from database */
export interface DBTagAlias {
  id: string;
  aliasName: string;
  targetTagId: string;
  createdAt: number;
}
