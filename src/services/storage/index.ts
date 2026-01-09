/**
 * Storage Service - Unified Export
 *
 * This module re-exports all storage functions as a single storageService object
 * for backward compatibility with existing code.
 */

// Re-export individual modules for direct imports
export * from './db';
export * from './collections';
export * from './folders';
export * from './metadata';
export * from './handles';
export * from './tags';

// Import all functions for the unified storageService object
import { resetDatabase } from './db';
import {
  createCollection,
  getCollections,
  getActiveCollection,
  setActiveCollection,
  deleteCollection,
} from './collections';
import {
  saveVirtualFolder,
  deleteVirtualFolder,
  getVirtualFolders,
  createShadowFolder,
  getShadowFolder,
  getShadowFoldersWithSources,
  getManualCollections,
  addFolderToCollection,
  removeFolderFromCollection,
  getCollectionFolders,
  debugListAllCollectionFolders,
  getColorName,
  groupItemsByColorTag,
  groupItemsByTag,
} from './folders';
import { saveMetadata, getMetadataBatch } from './metadata';
import {
  addDirectoryHandle,
  getDirectoryHandles,
  removeDirectoryHandle,
  clearHandles,
} from './handles';
import {
  getOrCreateTag,
  addTagToItem,
  removeTagFromItem,
  getTagsForItem,
  getItemsWithTag,
  getAllTags,
  searchTags,
  deleteTag,
  clearTagsForItem,
  addTagsToItem,
  getTagsGroupedForItem,
} from './tags';

/**
 * Unified storage service object
 * Provides backward compatibility with existing code that uses storageService.xxx()
 */
export const storageService = {
  // Database
  resetDatabase,

  // Collections
  createCollection,
  getCollections,
  getActiveCollection,
  setActiveCollection,
  deleteCollection,

  // Folders
  saveVirtualFolder,
  deleteVirtualFolder,
  getVirtualFolders,
  createShadowFolder,
  getShadowFolder,
  getShadowFoldersWithSources,
  getManualCollections,
  addFolderToCollection,
  removeFolderFromCollection,
  getCollectionFolders,
  debugListAllCollectionFolders,

  // Auto-Grouping
  getColorName,
  groupItemsByColorTag,
  groupItemsByTag,

  // Metadata
  saveMetadata,
  getMetadataBatch,

  // Handles (Legacy)
  addDirectoryHandle,
  getDirectoryHandles,
  removeDirectoryHandle,
  clearHandles,

  // Tags (Normalized)
  getOrCreateTag,
  addTagToItem,
  removeTagFromItem,
  getTagsForItem,
  getItemsWithTag,
  getAllTags,
  searchTags,
  deleteTag,
  clearTagsForItem,
  addTagsToItem,
  getTagsGroupedForItem,
};
