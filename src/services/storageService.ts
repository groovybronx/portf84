/**
 * Storage Service - Main Entry Point
 * 
 * This file is now a re-export of the modular storage service.
 * All functionality has been split into separate modules in ./storage/
 * 
 * @see ./storage/db.ts - Database connection and initialization
 * @see ./storage/collections.ts - Collections CRUD operations
 * @see ./storage/folders.ts - Virtual folders and shadow folders
 * @see ./storage/metadata.ts - Item metadata operations
 * @see ./storage/handles.ts - Legacy directory handles
 */

// Re-export everything from the modular storage service
export { storageService } from "./storage";

// Also export individual functions for direct imports
export * from "./storage";
