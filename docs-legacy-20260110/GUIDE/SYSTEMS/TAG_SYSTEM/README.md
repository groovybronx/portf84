# Tag System Documentation

## Overview

The Lumina Portfolio tag system provides comprehensive photo organization capabilities with AI-powered tagging, smart duplicate detection, and centralized management through the Tag Hub interface.

## Quick Access

| Document | Audience | Purpose |
|----------|----------|---------|
| [User Guide](./USER_GUIDE.md) | End Users | Complete workflow documentation |
| [Architecture](./ARCHITECTURE.md) | Developers | Technical implementation details |
| [API Reference](./API_REFERENCE.md) | Developers | Service interfaces and types |
| [Performance](./PERFORMANCE.md) | DevOps | Optimizations and benchmarks |

## Key Features

### 🏷️ **Tag Hub** - Centralized Management
- **Access**: `Ctrl+T` or TopBar button
- **4 Tabs**: Browse, Manage, Fusion, Settings
- **Keyboard-first**: Full keyboard navigation
- **Real-time**: Live statistics and updates

### 🤖 **AI Integration**
- **Automatic tagging**: AI-generated tags (read-only)
- **Manual tags**: User-created tags (editable)
- **Visual distinction**: Clear UI separation
- **Smart suggestions**: Context-aware tag recommendations

### 🔄 **Smart Fusion**
- **Duplicate detection**: Levenshtein + Jaccard algorithms
- **Configurable thresholds**: Strict/Balanced/Aggressive presets
- **Batch operations**: Merge all or individual groups
- **History tracking**: Complete audit trail

### ⚡ **Performance Optimized**
- **Caching**: 99% faster on repeated analyses
- **Memory efficient**: 50% reduction in memory usage
- **Scalable**: Handles 10K+ tags efficiently
- **Background processing**: Non-blocking operations

## Getting Started

### For Users
1. Press `Ctrl+T` to open Tag Hub
2. Browse existing tags in the **Browse** tab
3. Clean duplicates using the **Fusion** tab
4. Configure preferences in **Settings** tab

### For Developers
1. Review [Architecture](./ARCHITECTURE.md) for system overview
2. Check [API Reference](./API_REFERENCE.md) for service interfaces
3. See [Performance](./PERFORMANCE.md) for optimization details

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    TAG SYSTEM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Tag Hub       │  │  Tag Manager   │  │ Batch Panel  │ │
│  │  (Central)     │  │  (Per-Item)    │  │ (Selection)  │ │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘ │
│           │                    │                  │          │
│           └────────────────────┼──────────────────┘          │
│                                ▼                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Storage Services Layer                     │ │
│  │  • tags.ts: CRUD, merge, aliases                       │ │
│  │  • tagAnalysisService.ts: Similarity detection         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                ▼                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Database Layer (SQLite)                       │ │
│  │  • tags (definitions)                                   │ │
│  │  • item_tags (associations)                             │ │
│  │  • tag_merges (history)                                 │ │
│  │  • tag_aliases (synonyms)                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Analysis Time (10K tags) | 48.2s | 15.2s | -68% |
| Cached Analysis | 48.2s | 0.5s | -99% |
| Memory Usage | 125 MB | 62 MB | -50% |
| Bundle Size Impact | N/A | 263 KB | Minimal |

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+T` | Open Tag Hub | Global |
| `1-4` | Switch tabs | Tag Hub |
| `/` | Focus search | Browse tab |
| `Ctrl+A` | Select all | Manage tab |
| `Delete` | Delete selected | Manage tab |
| `Ctrl+Shift+T` | Batch tag panel | Items selected |

## Version History

- **v0.3.0-beta.1** (2026-01-04): Tag Hub implementation complete
- **v0.2.x**: Individual tag components
- **v0.1.x**: Basic tag functionality

## Related Documentation

- [Audit Reports](../AUDIT/TAG_SYSTEM/) - Historical analysis and proposals
- [Deprecated Files](../DEPRECATED/TAG_SYSTEM_OLD/) - Legacy documentation
- [Implementation Guides](../../guides/) - Step-by-step tutorials

## Support

For questions or issues:
1. Check the [User Guide](./USER_GUIDE.md) for workflow help
2. Review [Architecture](./ARCHITECTURE.md) for technical questions
3. Consult audit reports for historical context
4. Contact development team for implementation issues
