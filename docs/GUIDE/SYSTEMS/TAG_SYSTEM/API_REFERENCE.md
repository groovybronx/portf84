# Tag System API Reference

## Overview

This document provides a comprehensive reference for all tag system services, hooks, types, and interfaces.

## Core Types

### Tag Type
```typescript
interface Tag {
  id: string;
  name: string;
  type: 'manual' | 'ai';
  usage_count: number;
  created_at: string;
  updated_at: string;
}
```

### Tag Merge Group
```typescript
interface TagMergeGroup {
  id: string;
  tags: Tag[];
  similarity: number;
  match_type: 'levenshtein' | 'jaccard' | 'semantic';
  recommended_target: string;
}
```

### Analysis Cache
```typescript
interface AnalysisCache {
  timestamp: number;
  tagHash: string;
  tagCount: number;
  maxTags: number;
  results: TagMergeGroup[];
}
```

## Services

### Tag Storage Service (`src/services/storage/tags.ts`)

#### Basic CRUD Operations

##### `getAllTags(): Promise<Tag[]>`
Retrieves all tags from the database.

**Returns**: Array of Tag objects

**Example**:
```typescript
const tags = await getAllTags();
console.log(`Found ${tags.length} tags`);
```

##### `getOrCreateTag(name: string): Promise<Tag>`
Gets an existing tag or creates a new one if it doesn't exist.

**Parameters**:
- `name`: Tag name (case-insensitive)

**Returns**: Tag object

**Example**:
```typescript
const tag = await getOrCreateTag('landscape');
console.log(`Tag ID: ${tag.id}, Type: ${tag.type}`);
```

##### `deleteTag(id: string): Promise<void>`
Deletes a tag and all its associations.

**Parameters**:
- `id`: Tag ID to delete

**Example**:
```typescript
await deleteTag('tag-123');
```

##### `renameTag(id: string, newName: string): Promise<void>`
Renames a tag and updates all references.

**Parameters**:
- `id`: Tag ID to rename
- `newName`: New tag name

**Example**:
```typescript
await renameTag('tag-123', 'new-landscape');
```

#### Advanced Operations

##### `mergeTags(sourceIds: string[], targetId: string): Promise<void>`
Merges multiple source tags into a target tag.

**Parameters**:
- `sourceIds`: Array of source tag IDs
- `targetId`: Target tag ID to keep

**Example**:
```typescript
await mergeTags(['tag-1', 'tag-2'], 'tag-3');
```

##### `bulkDeleteTags(ids: string[]): Promise<void>`
Deletes multiple tags in a single transaction.

**Parameters**:
- `ids`: Array of tag IDs to delete

**Example**:
```typescript
await bulkDeleteTags(['tag-1', 'tag-2', 'tag-3']);
```

#### Tag Associations

##### `addItemTag(itemId: string, tagId: string): Promise<void>`
Associates a tag with an item.

**Parameters**:
- `itemId`: Item ID
- `tagId`: Tag ID

**Example**:
```typescript
await addItemTag('photo-123', 'tag-456');
```

##### `removeItemTag(itemId: string, tagId: string): Promise<void>`
Removes a tag association from an item.

**Parameters**:
- `itemId`: Item ID
- `tagId`: Tag ID

**Example**:
```typescript
await removeItemTag('photo-123', 'tag-456');
```

##### `getItemTags(itemId: string): Promise<Tag[]>`
Gets all tags associated with an item.

**Parameters**:
- `itemId`: Item ID

**Returns**: Array of Tag objects

**Example**:
```typescript
const tags = await getItemTags('photo-123');
```

### Tag Analysis Service (`src/services/tagAnalysisService.ts`)

#### Core Analysis Functions

##### `analyzeTagRedundancy(maxTags?: number, forceRefresh?: boolean): Promise<TagMergeGroup[]>`
Analyzes tags for potential duplicates and merges.

**Parameters**:
- `maxTags`: Optional limit on number of tags to analyze
- `forceRefresh`: Bypass cache and force fresh analysis

**Returns**: Array of TagMergeGroup objects

**Example**:
```typescript
// Analyze all tags
const groups = await analyzeTagRedundancy();

// Analyze only first 100 tags
const limitedGroups = await analyzeTagRedundancy(100);

// Force fresh analysis
const freshGroups = await analyzeTagRedundancy(undefined, true);
```

##### `invalidateAnalysisCache(): void`
Clears the analysis cache manually.

**Example**:
```typescript
invalidateAnalysisCache();
```

#### Similarity Algorithms

##### `levenshteinDistance(a: string, b: string, threshold?: number): number`
Calculates the Levenshtein distance between two strings.

**Parameters**:
- `a`: First string
- `b`: Second string
- `threshold`: Optional early termination threshold

**Returns**: Distance value (lower = more similar)

**Example**:
```typescript
const distance = levenshteinDistance('landscape', 'landscpae', 2);
if (distance <= 2) {
  console.log('Tags are similar');
}
```

##### `areTokensSimilar(tag1: string, tag2: string, threshold?: number): boolean`
Checks if two tags have similar token sets.

**Parameters**:
- `tag1`: First tag name
- `tag2`: Second tag name
- `threshold`: Similarity threshold (0-1, default 0.8)

**Returns**: Boolean indicating similarity

**Example**:
```typescript
const similar = areTokensSimilar('black and white', 'noir blanc', 0.8);
if (similar) {
  console.log('Tags have similar tokens');
}
```

### Cache Service (`src/services/tagAnalysisCache.ts`)

#### Cache Management

##### `getAnalysisCache(): AnalysisCache | null`
Gets the current analysis cache.

**Returns**: AnalysisCache object or null

##### `setAnalysisCache(cache: AnalysisCache): void`
Sets the analysis cache.

**Parameters**:
- `cache`: AnalysisCache object to store

##### `clearAnalysisCache(): void`
Clears the analysis cache.

## React Hooks

### useModalState Hook (`src/shared/hooks/useModalState.ts`)

#### `useModalState(initialState?: boolean): [boolean, (state?: boolean) => void]`
Manages modal open/close state.

**Returns**: Tuple of [isOpen, setIsOpen]

**Example**:
```typescript
const [isTagHubOpen, setIsTagHubOpen] = useModalState(false);

// Open modal
setIsTagHubOpen(true);

// Close modal
setIsTagHubOpen(false);

// Toggle
setIsTagHubOpen();
```

### Custom Tag Hooks

#### `useTags(filter?: TagFilter): Tag[]`
Gets tags with optional filtering.

**Parameters**:
- `filter`: Optional filter object

**Returns**: Array of filtered Tag objects

**Example**:
```typescript
const allTags = useTags();
const manualTags = useTags({ type: 'manual' });
const unusedTags = useTags({ usage_count: 0 });
```

#### `useTagAnalysis(maxTags?: number): TagMergeGroup[]`
Gets tag analysis results.

**Parameters**:
- `maxTags`: Optional limit

**Returns**: Array of TagMergeGroup objects

**Example**:
```typescript
const mergeGroups = useTagAnalysis(100);
```

## Components

### Tag Hub Components (`src/features/tags/components/TagHub/`)

#### TagHub
Main container component with tab navigation.

**Props**:
```typescript
interface TagHubProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### BrowseTab
Tag browsing and filtering interface.

**Props**:
```typescript
interface BrowseTabProps {
  tags: Tag[];
  onTagSelect: (tag: Tag) => void;
}
```

#### ManageTab
Tag management and bulk operations.

**Props**:
```typescript
interface ManageTabProps {
  tags: Tag[];
  onTagsChange: () => void;
}
```

#### FusionTab
Smart tag merging interface.

**Props**:
```typescript
interface FusionTabProps {
  mergeGroups: TagMergeGroup[];
  onMergeComplete: () => void;
}
```

#### SettingsTab
Similarity detection configuration.

**Props**:
```typescript
interface SettingsTabProps {
  settings: TagSettings;
  onSettingsChange: (settings: TagSettings) => void;
}
```

### Tag Manager (`src/features/tags/components/TagManager.tsx`)

**Props**:
```typescript
interface TagManagerProps {
  itemId: string;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  readonly?: boolean;
}
```

### Batch Tag Panel (`src/features/tags/components/BatchTagPanel.tsx`)

**Props**:
```typescript
interface BatchTagPanelProps {
  itemIds: string[];
  isOpen: boolean;
  onClose: () => void;
}
```

## Database Schema

### Tags Table
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('manual', 'ai')),
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Item Tags Table
```sql
CREATE TABLE item_tags (
  item_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### Tag Merges Table
```sql
CREATE TABLE tag_merges (
  id TEXT PRIMARY KEY,
  source_tag_ids TEXT NOT NULL, -- JSON array
  target_tag_id TEXT NOT NULL,
  merged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_tag_id) REFERENCES tags(id)
);
```

### Tag Aliases Table
```sql
CREATE TABLE tag_aliases (
  id TEXT PRIMARY KEY,
  tag_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(tag_id, alias)
);
```

## Internationalization

### Translation Keys

#### Tag Hub
```json
{
  "tagHub.title": "Tag Hub",
  "tagHub.browse": "Browse",
  "tagHub.manage": "Manage",
  "tagHub.fusion": "Fusion",
  "tagHub.settings": "Settings",
  "tagHub.searchPlaceholder": "Search tags...",
  "tagHub.selectAll": "Select All",
  "tagHub.mergeSelected": "Merge Selected",
  "tagHub.deleteSelected": "Delete Selected"
}
```

#### Tag Types
```json
{
  "tag.type.manual": "Manual",
  "tag.type.ai": "AI",
  "tag.filter.all": "All",
  "tag.filter.manual": "Manual",
  "tag.filter.ai": "AI",
  "tag.filter.unused": "Unused",
  "tag.filter.mostUsed": "Most Used"
}
```

#### Messages
```json
{
  "tag.merge.success": "Tags merged successfully",
  "tag.delete.success": "Tags deleted successfully",
  "tag.create.success": "Tag created successfully",
  "tag.error.duplicate": "Tag already exists",
  "tag.error.notFound": "Tag not found"
}
```

## Error Handling

### Common Errors

#### `TagNotFoundError`
Thrown when a tag ID doesn't exist.

```typescript
try {
  await deleteTag('non-existent-id');
} catch (error) {
  if (error instanceof TagNotFoundError) {
    console.error('Tag not found:', error.message);
  }
}
```

#### `DuplicateTagError`
Thrown when trying to create a tag that already exists.

```typescript
try {
  await getOrCreateTag('existing-tag');
} catch (error) {
  if (error instanceof DuplicateTagError) {
    console.error('Tag already exists:', error.message);
  }
}
```

#### `InvalidTagError`
Thrown when tag name validation fails.

```typescript
try {
  await getOrCreateTag(''); // Empty name
} catch (error) {
  if (error instanceof InvalidTagError) {
    console.error('Invalid tag name:', error.message);
  }
}
```

## Performance Considerations

### Caching
- Analysis results cached for 5 minutes
- Automatic invalidation on tag changes
- Manual cache invalidation available

### Memory Usage
- Levenshtein algorithm uses O(min(m,n)) space
- Rolling array technique for large strings
- Early termination for dissimilar strings

### Batch Operations
- Use `bulkDeleteTags` for multiple deletions
- Specify `maxTags` parameter for large datasets
- Consider background processing for very large operations

## Testing

### Unit Tests
```typescript
// Example test for tag creation
test('should create new tag', async () => {
  const tag = await getOrCreateTag('test-tag');
  expect(tag.name).toBe('test-tag');
  expect(tag.type).toBe('manual');
});

// Example test for similarity detection
test('should detect similar tags', () => {
  const similar = areTokensSimilar('black and white', 'noir blanc', 0.8);
  expect(similar).toBe(true);
});
```

### Integration Tests
```typescript
// Example integration test
test('should merge tags and update associations', async () => {
  const sourceTag = await getOrCreateTag('source');
  const targetTag = await getOrCreateTag('target');
  const itemId = 'test-item';

  await addItemTag(itemId, sourceTag.id);
  await mergeTags([sourceTag.id], targetTag.id);

  const tags = await getItemTags(itemId);
  expect(tags).toContainEqual(targetTag);
  expect(tags).not.toContainEqual(sourceTag);
});
```

## Migration Guide

### From v0.2.x to v0.3.0
1. Update imports: `TagManagerModal` → `TagHub`
2. Update keyboard shortcuts: New `Ctrl+T` shortcut
3. Update API calls: Use new service methods
4. Update styling: New Tailwind CSS classes

### Breaking Changes
- `TagManagerModal` deprecated (use `TagHub`)
- `analyzeTags()` renamed to `analyzeTagRedundancy()`
- Cache TTL changed from 10 minutes to 5 minutes
