export interface AiTagDetailed {
  name: string;
  confidence: number;
}

export interface PortfolioItem {
  id: string;
  file: File;
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
  folderId?: string;
  colorTag?: string; // Hex code for the color tag
}

export interface Folder {
  id: string;
  name: string;
  items: PortfolioItem[];
  createdAt: number;
  isVirtual?: boolean; // True if created within the app, false if physical disk folder
}

export enum ViewMode {
  GRID = 'GRID',
  CAROUSEL = 'CAROUSEL',
  LIST = 'LIST',
}

export type SortOption = 'date' | 'name' | 'size';
export type SortDirection = 'asc' | 'desc';

// Predefined Color Palette for tagging
export const COLOR_PALETTE: Record<string, string> = {
  '1': '#ef4444', // Red
  '2': '#f97316', // Orange
  '3': '#eab308', // Yellow
  '4': '#22c55e', // Green
  '5': '#3b82f6', // Blue
  '6': '#a855f7', // Purple
};