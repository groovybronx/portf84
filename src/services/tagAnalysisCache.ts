/**
 * Tag Analysis Cache Module
 * Separate module to avoid circular dependencies between tagAnalysisService and storage/tags
 */

import { TagGroup } from './tagAnalysisService';

import { logger } from '../shared/utils/logger';
// Caching interface for analysis results
interface AnalysisCache {
  timestamp: number;
  tagHash: string; // Hash of all tag IDs
  tagCount: number;
  maxTags: number | undefined; // Track maxTags parameter
  results: TagGroup[];
}

// Global cache instance
let analysisCache: AnalysisCache | null = null;

// Cache TTL: 5 minutes
export const CACHE_TTL = 5 * 60 * 1000;

/**
 * Generate a simple hash of tag IDs for cache validation
 */
export const hashTagIds = (tagIds: string[]): string => {
  return [...tagIds].sort().join('|');
};

/**
 * Get the current cache if valid
 */
export const getCache = (
  tagHash: string,
  tagCount: number,
  maxTags: number | undefined,
  forceRefresh: boolean
): TagGroup[] | null => {
  const cacheValid =
    !forceRefresh &&
    analysisCache &&
    analysisCache.tagCount === tagCount &&
    analysisCache.tagHash === tagHash &&
    analysisCache.maxTags === maxTags &&
    Date.now() - analysisCache.timestamp < CACHE_TTL;

  if (cacheValid && analysisCache) {
    logger.debug('app', '[TagAnalysis] Cache HIT - Using cached analysis');
    return analysisCache.results;
  }

  return null;
};

/**
 * Store results in cache
 */
export const setCache = (
  tagHash: string,
  tagCount: number,
  maxTags: number | undefined,
  results: TagGroup[]
): void => {
  analysisCache = {
    timestamp: Date.now(),
    tagHash,
    tagCount,
    maxTags,
    results,
  };
};

/**
 * Invalidate the analysis cache
 * Should be called after tag operations: merge, delete, rename, create
 */
export const invalidateAnalysisCache = (): void => {
  analysisCache = null;
  logger.debug('app', '[TagAnalysis] Cache invalidated');
};
