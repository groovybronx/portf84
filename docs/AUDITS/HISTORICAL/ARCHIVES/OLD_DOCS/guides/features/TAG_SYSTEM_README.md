# Tag System - Quick Reference

## Overview

The Lumina Portfolio tag system provides robust organization and search capabilities with:
- **Dual persistence**: JSON backup + relational database
- **AI & manual tags**: Separate tracking of automated and user-created tags
- **Smart fusion**: Automatic detection of similar tags with merge capability
- **Alias support**: Synonyms and corrections for consistent tagging
- **Merge history**: Complete audit trail of consolidation operations

## Key Files

- **Storage**: `src/services/storage/tags.ts`
- **Analysis**: `src/services/tagAnalysisService.ts`
- **UI Components**: `src/features/tags/components/`
- **Types**: `src/shared/types/database.ts`
- **Tests**: `tests/tagSystem.test.ts`

## Common Operations

### Add a Tag
```typescript
import { getOrCreateTag, addTagToItem } from './services/storage/tags';

const tagId = await getOrCreateTag('landscape', 'manual');
await addTagToItem(itemId, tagId);
```

### Remove a Tag
```typescript
import { removeTagFromItem } from './services/storage/tags';

await removeTagFromItem(itemId, tagId);
```

### Find Similar Tags
```typescript
import { analyzeTagRedundancy } from './services/tagAnalysisService';

const groups = await analyzeTagRedundancy();
// Returns: [{ target: Tag, candidates: Tag[] }]
```

### Merge Tags
```typescript
import { mergeTags } from './services/storage/tags';

await mergeTags(targetTagId, [sourceId1, sourceId2]);
// Consolidates all items to target tag
```

### Choose Merge Direction
```typescript
// In Smart Tag Fusion UI:
// - Click on the ⇄ arrow to cycle through tags as target
// - Click on any candidate tag to set it as the new target
// - The tag in BLUE is kept, tags with STRIKETHROUGH are deleted
```

### Create Tag Alias
```typescript
import { createTagAlias } from './services/storage/tags';

await createTagAlias('b&w', targetTagId);
// Users typing "b&w" will see suggestion for target tag
```

## Database Schema

### Core Tables

**tags** - Unique tag definitions
- `id`: Primary key
- `name`: Display name (original case)
- `normalizedName`: Lowercase for deduplication
- `type`: 'ai' | 'manual' | 'ai_detailed'
- `confidence`: AI confidence score (optional)
- `createdAt`: Timestamp

**item_tags** - Many-to-many relationships
- `itemId`: Reference to portfolio item
- `tagId`: Reference to tag
- `addedAt`: Timestamp

**tag_merges** - Merge history
- `targetTagId`: Tag that was kept
- `sourceTagId`: Tag that was merged/deleted
- `mergedAt`: Timestamp
- `mergedBy`: 'user' | 'auto'

**tag_aliases** - Synonym mappings
- `aliasName`: The alias/synonym
- `targetTagId`: The canonical tag
- `createdAt`: Timestamp

## Similarity Detection

The system uses two algorithms to detect similar tags:

### 1. Levenshtein Distance
Detects typos and simple variations:
- Distance ≤ 1: Always match
- Distance ≤ 2 + length > 5: Match

Examples:
- "landscape" ↔ "landscapes" ✓
- "portrait" ↔ "portait" ✓

### 2. Jaccard Similarity
Detects multi-word variations:
- Tokenizes and removes stop words
- Calculates intersection/union ratio
- Threshold: 80%

Examples:
- "noir et blanc" ↔ "noir blanc" ✓
- "black and white" ↔ "white black" ✓

## UI Components

### TagManager
Location: `src/features/tags/components/TagManager.tsx`

Features:
- Display all tags (AI + manual)
- Add/remove manual tags
- Autocomplete from existing tags
- Alias suggestions with visual hint

### TagManagerModal
Location: `src/features/tags/components/TagManagerModal.tsx`

Features:
- Smart Tag Fusion interface
- Automatic similarity detection
- Individual or batch merge operations
- Database resync utility

## Testing

Run the tag system tests:
```bash
npm test tests/tagSystem.test.ts
```

Coverage includes:
- Levenshtein distance calculations
- Token-based similarity
- Normalization and stop words
- Merge operations
- Alias management
- Edge cases

## Performance Notes

- **Large datasets (>5000 tags)**: Analysis may take several seconds
- **Indexes**: Database has indexes on `normalizedName`, `itemId`, and `tagId`
- **Optimization**: Consider limiting analysis to specific tag types for faster results

## Migration & Sync

If tags are missing from the relational database:
```typescript
import { syncAllTagsFromMetadata } from './services/storage/tags';

await syncAllTagsFromMetadata();
```

This reads all JSON tag arrays and ensures they exist in the tags table.

## Future Enhancements

1. **AI Semantic Merging**: Use Gemini API to detect conceptual synonyms
2. **Tag Hierarchy**: Parent-child relationships for better organization
3. **Batch Import/Export**: JSON configuration files for tag setups
4. **Usage Analytics**: Dashboard showing tag frequency and trends
5. **Multilingual Support**: Language-aware similarity detection

## Documentation

For detailed technical documentation:

- **Full Guide**: [TAG_SYSTEM_GUIDE.md](../architecture/TAG_SYSTEM_GUIDE.md)
- **Knowledge Base**: [14_Feature_Tags.md](../project/KnowledgeBase/14_Feature_Tags.md)
- **Original Requirements**: [TAG_CONSOLIDATION_SPEC.md](../../ARCHIVES/historical/TAG_CONSOLIDATION_SPEC.md) - Original specification

---

**Version**: 1.0  
**Last Updated**: 2025-12-30  
**Questions?** See the full technical guide for detailed information.
