# Tag System - Technical Guide

## Overview

The Lumina Portfolio tag system is a robust, dual-persistence architecture that enables efficient organization, search, and analysis of portfolio items. The system supports both AI-generated and manual tags, with advanced features for similarity detection and intelligent merging.

## Architecture

### Storage Strategy: Dual Persistence

The tag system uses a **dual-persistence** approach for reliability and performance:

1. **JSON Storage** (Legacy/Backup): Tags stored as JSON arrays in the `metadata` table
   - `aiTags`: `["landscape", "nature"]`
   - `manualTags`: `["portfolio", "featured"]`
   - `aiTagsDetailed`: `[{"name": "sunset", "confidence": 0.95}]`

2. **Relational Storage** (Primary): Normalized tags in dedicated tables
   - `tags`: Unique tag definitions
   - `item_tags`: Many-to-many relationships between items and tags

### Database Schema

#### Tags Table
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,                    -- e.g., "tag-1234567890-abc123"
  name TEXT NOT NULL,                     -- Display name (original case)
  normalizedName TEXT NOT NULL,           -- Lowercase for deduplication
  type TEXT NOT NULL,                     -- 'ai' | 'manual' | 'ai_detailed'
  confidence REAL,                        -- AI confidence score (0-1)
  createdAt INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_tags_normalized 
  ON tags(normalizedName, type);
```

**Key Fields:**
- `normalizedName`: Used for deduplication - prevents "Landscape" and "landscape" from being separate tags
- `type`: Distinguishes AI-generated vs user-created tags
- `confidence`: Stored for AI tags to indicate reliability

#### Item-Tags Junction Table
```sql
CREATE TABLE item_tags (
  itemId TEXT NOT NULL,                   -- FK to metadata.id
  tagId TEXT NOT NULL,                    -- FK to tags.id
  addedAt INTEGER NOT NULL,
  PRIMARY KEY (itemId, tagId),
  FOREIGN KEY (itemId) REFERENCES metadata(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_item_tags_item ON item_tags(itemId);
CREATE INDEX idx_item_tags_tag ON item_tags(tagId);
```

**Features:**
- Composite primary key ensures no duplicate tag-item associations
- Cascading deletes maintain referential integrity
- Indexes for efficient queries in both directions

#### Tag Merges History Table
```sql
CREATE TABLE tag_merges (
  id TEXT PRIMARY KEY,
  targetTagId TEXT NOT NULL,              -- Tag that was kept
  sourceTagId TEXT NOT NULL,              -- Tag that was merged (deleted)
  mergedAt INTEGER NOT NULL,
  mergedBy TEXT,                          -- 'user' or 'auto'
  FOREIGN KEY (targetTagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_tag_merges_target ON tag_merges(targetTagId);
CREATE INDEX idx_tag_merges_merged_at ON tag_merges(mergedAt);
```

**Purpose:**
- Tracks all merge operations for audit trail
- Enables undo functionality (future enhancement)
- Analytics on tag consolidation patterns

#### Tag Aliases Table
```sql
CREATE TABLE tag_aliases (
  id TEXT PRIMARY KEY,
  aliasName TEXT NOT NULL,                -- The alias/synonym
  targetTagId TEXT NOT NULL,              -- The canonical tag
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (targetTagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_tag_aliases_name ON tag_aliases(aliasName);
CREATE INDEX idx_tag_aliases_target ON tag_aliases(targetTagId);
```

**Purpose:**
- Supports automatic tag suggestions for synonyms
- Example: "B&W" → "black and white", "Portrait" → "face"
- User can type alias, system auto-suggests canonical tag

## Data Flow

### 1. Adding a Tag to an Item

```
User Types "sunset" → TagManager Component
    ↓
storageService.saveMetadata()
    ↓
┌─────────────────────────────────────┐
│ 1. Update JSON (metadata.manualTags)│
│    ["sunset", "landscape"]          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. getOrCreateTag("sunset", "manual")│
│    - Check if tag exists (normalized)│
│    - Create if new                   │
│    - Return tagId                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. addTagToItem(itemId, tagId)      │
│    - INSERT INTO item_tags           │
│    - OR IGNORE (prevent duplicates)  │
└─────────────────────────────────────┘
    ↓
UI Updates → Shows tag immediately
```

### 2. AI Tag Generation

```
AI Analysis Complete
    ↓
Returns: {
  tags: ["landscape", "sunset", "nature"],
  confidence: [0.95, 0.87, 0.92]
}
    ↓
┌─────────────────────────────────────┐
│ For each AI tag:                     │
│ 1. getOrCreateTag(name, "ai", conf)  │
│ 2. addTagToItem(itemId, tagId)       │
└─────────────────────────────────────┘
    ↓
Also stored in JSON for backup
```

### 3. Tag Removal

```
User Removes Tag "sunset"
    ↓
storageService.saveMetadata()
    ↓
┌─────────────────────────────────────┐
│ 1. Update JSON (remove from array)   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. removeTagFromItem(itemId, tagId)  │
│    DELETE FROM item_tags...          │
└─────────────────────────────────────┘
    ↓
Note: Tag remains in tags table
(may be used by other items)
```

### 4. Batch Synchronization

When inconsistencies are detected between JSON and relational storage:

```
syncAllTagsFromMetadata()
    ↓
┌─────────────────────────────────────┐
│ For each item in metadata:           │
│ 1. Parse JSON tags (ai + manual)     │
│ 2. getOrCreateTag() for each         │
│ 3. addTagToItem() - establish links  │
└─────────────────────────────────────┘
    ↓
Relational tables now in sync
```

## Similarity Detection Algorithms

### 1. Levenshtein Distance

**Purpose**: Detect typos, plurals, and minor variations

**Implementation**:
```javascript
levenshteinDistance("landscape", "landscapes") // → 1
levenshteinDistance("portait", "portrait")     // → 1
levenshteinDistance("noir", "black")           // → 5
```

**Matching Criteria**:
- Distance ≤ 1: Always match
- Distance ≤ 2 AND length > 5: Match (allows "photography" vs "photographie")

**Examples**:
- ✓ "landscape" ↔ "landscapes"
- ✓ "portrait" ↔ "portait"
- ✓ "photographie" ↔ "photography"
- ✗ "sunset" ↔ "sunrise" (distance 3)

### 2. Jaccard Similarity (Token-based)

**Purpose**: Detect multi-word tags with word order differences or stop words

**Process**:
1. **Tokenize**: Split into words, remove punctuation
2. **Filter**: Remove stop words ("et", "and", "le", "the", "de", "of")
3. **Compare**: Calculate Jaccard index

**Formula**:
```
Jaccard = |A ∩ B| / |A ∪ B|
```

**Threshold**: 0.8 (80% similarity)

**Examples**:
```javascript
"noir et blanc"      → tokens: ["noir", "blanc"]
"noir blanc"         → tokens: ["noir", "blanc"]
// Jaccard = 2/2 = 1.0 → MATCH ✓

"black and white"    → tokens: ["black", "white"]
"white black"        → tokens: ["black", "white"]
// Jaccard = 2/2 = 1.0 → MATCH ✓

"landscape nature"   → tokens: ["landscape", "nature"]
"landscape"          → tokens: ["landscape"]
// Jaccard = 1/2 = 0.5 → NO MATCH ✗
```

### 3. Combined Detection Strategy

```javascript
function areTagsSimilar(tag1, tag2) {
  // Normalize for comparison
  const norm1 = normalize(tag1.name);
  const norm2 = normalize(tag2.name);
  
  // Method 1: Direct similarity
  const dist = levenshteinDistance(norm1, norm2);
  if (dist <= 1 || (dist <= 2 && norm1.length > 5)) {
    return true;
  }
  
  // Method 2: Token similarity
  const tokens1 = tokenize(tag1.name);
  const tokens2 = tokenize(tag2.name);
  if (areTokensSimilar(tokens1, tokens2)) {
    return true;
  }
  
  return false;
}
```

## Tag Merging

### Process

1. **Detection**: `analyzeTagRedundancy()` identifies similar tag groups
2. **Review**: User confirms merges via Smart Tag Fusion modal
3. **Execution**: `mergeTags(targetTagId, sourceTagIds[])`

### Merge Algorithm

```
mergeTags(targetTagId, sourceTagIds)
    ↓
For each sourceId:
    ↓
┌─────────────────────────────────────┐
│ 1. Get all items with source tag    │
│    SELECT itemId FROM item_tags      │
│    WHERE tagId = sourceId            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Link items to target tag          │
│    For each item:                     │
│    INSERT OR IGNORE INTO item_tags    │
│    (itemId, targetTagId)              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Record merge in history           │
│    INSERT INTO tag_merges             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Delete source tag                 │
│    DELETE FROM tags WHERE id=sourceId │
│    (CASCADE removes item_tags)        │
└─────────────────────────────────────┘
    ↓
Result: All items now have target tag
        Source tag eliminated
```

**Key Features**:
- **Atomic**: Each merge completes fully or fails entirely
- **No Data Loss**: All item associations preserved
- **Deduplication**: OR IGNORE prevents duplicate associations
- **Auditable**: History tracked in tag_merges table

## UI Components

### TagManager Component

**Location**: `src/features/tags/components/TagManager.tsx`

**Features**:
- Display AI tags (read-only, gray style)
- Display manual tags (editable, blue style)
- Add new tags with autocomplete
- Remove tags with confirmation
- Suggestions dropdown from existing tags

**Data Flow**:
```
User Action → TagManager
    ↓
storageService.saveMetadata()
    ↓
onUpdateItem() callback
    ↓
Parent component re-renders
```

### TagManagerModal Component

**Location**: `src/features/tags/components/TagManagerModal.tsx`

**Smart Tag Fusion Interface**:

1. **Analysis Phase**:
   - Runs `analyzeTagRedundancy()` on modal open
   - Shows loading spinner during analysis
   - Displays count of similar tag groups found

2. **Review Phase**:
   - Lists each group: Target → [Candidates]
   - Visual distinction: Target (blue), Candidates (gray)
   - "Merge" button per group

3. **Execution Phase**:
   - Calls `mergeTags()` for selected group
   - Shows spinner during merge
   - Removes merged group from list
   - Calls `onTagsUpdated()` to refresh parent

4. **Completion**:
   - "Your tags are clean!" message when no duplicates
   - "Check Again" button to re-analyze
   - "Force Database Resync" for recovery

## Performance Considerations

### Large Dataset Optimization

For libraries with >10,000 tags:

1. **Lazy Loading**: Analyze in batches
2. **Caching**: Store analysis results temporarily
3. **Indexing**: Utilize database indexes for fast lookups
4. **Pagination**: Process similarity checks in chunks

### Query Optimization

**Good**:
```sql
-- Uses index on normalizedName
SELECT id FROM tags 
WHERE normalizedName = 'landscape' AND type = 'manual';
```

**Avoid**:
```sql
-- Forces full table scan
SELECT id FROM tags 
WHERE LOWER(name) = 'landscape';
```

## Error Handling

### Common Issues and Recovery

1. **JSON/Relational Mismatch**:
   - **Symptom**: Tags show in metadata but not in tag list
   - **Fix**: Run `syncAllTagsFromMetadata()`
   - **Prevention**: Always use `storageService.saveMetadata()`

2. **Orphaned Tags**:
   - **Symptom**: Tags with no item associations
   - **Impact**: None (minimal storage impact)
   - **Cleanup**: Manual query or future automated cleanup

3. **Duplicate Associations**:
   - **Prevention**: `PRIMARY KEY (itemId, tagId)` + `OR IGNORE`
   - **Symptom**: Should never occur
   - **Fix**: Database constraint prevents this

4. **Merge Conflicts**:
   - **Symptom**: Merge operation fails partway
   - **Recovery**: Re-run merge (idempotent operations)
   - **Audit**: Check tag_merges for partial entries

## Testing Strategy

### Unit Tests

1. **Tag CRUD Operations**:
   - Create tag with normalization
   - Prevent duplicate normalized tags
   - Delete tag cascades to item_tags
   - Add/remove item-tag associations

2. **Similarity Detection**:
   - Levenshtein distance calculation
   - Token-based similarity
   - Stop word filtering
   - Edge cases (empty strings, special chars)

3. **Merge Operations**:
   - Simple 2-tag merge
   - Multi-tag merge (3+ sources)
   - Merge with overlapping items
   - History tracking

### Integration Tests

1. **UI → Storage → DB**:
   - Add tag via TagManager
   - Verify both JSON and relational storage
   - Remove tag, verify cleanup
   - Batch operations

2. **Synchronization**:
   - Create mismatch scenario
   - Run resync
   - Verify consistency

3. **Smart Fusion Workflow**:
   - Load modal with test data
   - Verify analysis results
   - Execute merge
   - Verify UI updates

## Future Enhancements

### 1. AI-Powered Semantic Merging
- Integration with Gemini API for synonym detection
- Example: "portrait" + "face" + "person" → "portrait"

### 2. Tag Hierarchy
- Parent-child relationships: "photography" → "landscape photography"
- Automatic inheritance of parent tags

### 3. Tag Statistics
- Usage frequency dashboard
- Trending tags over time
- Most-used tag combinations

### 4. Batch Operations
- "Merge All" button for automatic consolidation
- Bulk tag editing across multiple items
- Import/export tag configurations

### 5. Multilingual Support
- Store translations in tag_aliases
- Language-aware similarity detection
- UI language preference integration

## References

### Code Files
- **Storage Service**: `src/services/storage/tags.ts`
- **Analysis Service**: `src/services/tagAnalysisService.ts`
- **UI Components**: `src/features/tags/components/`
- **Database Types**: `src/shared/types/database.ts`
- **Schema Init**: `src/services/storage/db.ts`

### Documentation
- Database Schema: `docs/KnowledgeBase/03_Database_Schema_and_Storage.md`
- Feature Overview: `docs/KnowledgeBase/14_Feature_Tags.md`
- Original Spec: `docs/ARCHIVES/TAG_CONSOLIDATION_SPEC.md`

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Maintainer**: Lumina Portfolio Team
