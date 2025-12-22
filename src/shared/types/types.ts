export interface AiTagDetailed {
	name: string;
	confidence: number;
}

export interface Collection {
	id: string;
	name: string;
	createdAt: number;
	lastOpenedAt?: number;
	isActive: boolean;
}

export interface SourceFolder {
	id: string;
	collectionId: string;
	path: string;
	name: string;
	addedAt: number;
	itemCount?: number; // Computed at runtime
}

export interface PortfolioItem {
	id: string;
	file?: File;
	path?: string;
	url: string;
	name: string;
	type: string;
	size: number;
	lastModified: number;
	width?: number;
	height?: number;
	aiDescription?: string;
	aiTags?: string[];
	aiTagsDetailed?: AiTagDetailed[];
	collectionId?: string; // NEW: Link to parent Collection
	virtualFolderId?: string; // RENAMED from folderId for clarity
	colorTag?: string; // Hex code for the color tag
	manualTags?: string[];
	// Legacy support
	folderId?: string; // @deprecated - use virtualFolderId instead
}

export interface Folder {
	id: string;
	name: string;
	items: PortfolioItem[];
	createdAt: number;
	isVirtual?: boolean; // True if created within the app, false if physical disk folder
	path?: string; // Absolute path for physical folders
	collectionId: string; // NEW: Link to parent Collection
	sourceFolderId?: string; // NEW: Link to source folder (for shadow folders)
}

export enum ViewMode {
	GRID = "GRID",
	CAROUSEL = "CAROUSEL",
	LIST = "LIST",
}

export type SortOption = "date" | "name" | "size";
export type SortDirection = "asc" | "desc";

// Predefined Color Palette for tagging
export const COLOR_PALETTE: Record<string, string> = {
	"1": "#ef4444", // Red
	"2": "#f97316", // Orange
	"3": "#eab308", // Yellow
	"4": "#22c55e", // Green
	"5": "#3b82f6", // Blue
	"6": "#a855f7", // Purple
};
