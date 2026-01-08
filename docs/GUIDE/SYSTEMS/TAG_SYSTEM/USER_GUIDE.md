# Tag System - User Guide

**Version**: v0.3.0-beta.1
**Last update**: 2026-01-04

## Overview

The Tag System provides comprehensive photo organization with AI-powered tagging, smart duplicate detection, and centralized management through the Tag Hub interface.

## Opening Tag Hub

There are two ways to access the Tag Hub:

1. **Keyboard Shortcut**: Press `Ctrl+T` (or `Cmd+T` on Mac)
2. **TopBar Button**: Click the Tag icon in the top navigation bar

## Tag Hub Interface

The Tag Hub consists of 4 specialized tabs, each designed for specific tasks:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🏷️  Tag Hub                                                        ✕      │
│  Clean up your library by merging duplicate tags                          │
├────────────────────────────────────────────────────────────────────────────┤
│  [📁 Browse (1)] [✏️ Manage (2)] [🔄 Fusion (3)] [⚙️ Settings (4)]         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [TAB CONTENT AREA]                                                        │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1. Browse Tab (Keyboard: `1`)

**Purpose**: Explore and navigate all tags in your library

#### Features
- **Search**: Type to filter tags by name (Press `/` to focus search)
- **View Modes**: Switch between Grid and List view
- **Filters**:
  - All Tags
  - Manual Tags only
  - AI Tags only
  - Unused Tags
  - Most Used Tags
- **Multi-Tag Filtering**: Click multiple tags to filter photos that have ALL selected tags

#### Interface
```
┌────────────────────────────────────────────────────────────────────────────┐
│  🔍 [Search tags...                              ]  [Grid] [List]  [Sort]  │
├────────────────────────────────────────────────────────────────────────────┤
│  [All] [Manual] [AI] [Unused] [Most Used]                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │landscape │  │ portrait │  │  sunset  │  │  nature  │                  │
│  │ Manual   │  │    AI    │  │    AI    │  │ Manual   │                  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                  │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  urban   │  │ wildlife │  │  macro   │  │ abstract │                  │
│  │ Manual   │  │    AI    │  │ Manual   │  │    AI    │                  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                  │
│                                                                             │
│  Showing 1-8 of 125 tags                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Multi-Tag Filtering Workflow
1. Click tags to select them (they appear as chips in search bar)
2. Selected tags use AND logic - photos must have ALL selected tags
3. Click X on a chip to remove that tag from filter
4. Click "Clear All Tags" to remove all filters
5. Filtered item count displays in TopBar
6. Tag Hub stays open for easy multi-selection

#### Keyboard Shortcuts
- `/` - Focus search input
- `Esc` - Blur search input

### 2. Manage Tab (Keyboard: `2`)

**Purpose**: Perform CRUD operations and bulk editing

#### Features
- **Bulk Selection**: Click tags to select multiple
- **Statistics Panel**: Real-time metrics
  - Total tags count
  - Manual vs AI tags breakdown
  - Selected tags count
- **Bulk Actions** (when tags selected):
  - Merge Selected (2+ tags required)
  - Delete Selected

#### Interface
```
┌─────────────────────────────────────────────────────────────────┬──────────┐
│  ☐ Select All (Ctrl+A)                   All Tags (125)         │ 📊 Stats │
├─────────────────────────────────────────────────────────────────┤──────────┤
│  Selected: 3 tags                                               │ Total    │
│  [🔗 Merge Selected]  [🗑️ Delete Selected]                      │   125    │
├─────────────────────────────────────────────────────────────────┤──────────┤
│                                                                  │ Manual   │
│  ☑️ landscape [Manual]                                          │    67    │
│  ☑️ portrait  [AI]                                              │──────────┤
│  ☑️ sunset    [AI]                                              │ AI       │
│  ☐ nature     [Manual]                                          │    58    │
│  ☐ urban      [Manual]                                          │──────────┤
│  ☐ wildlife   [AI]                                              │ Selected │
│  ...                                                             │     3    │
│                                                                  │          │
└─────────────────────────────────────────────────────────────────┴──────────┘
```

#### Keyboard Shortcuts
- `Ctrl+A` - Select/Deselect all tags
- `Delete` - Delete selected tags

### 3. Fusion Tab (Keyboard: `3`)

**Purpose**: Smart duplicate detection and merging

#### Features
- **Automatic Detection**: Finds similar tags using:
  - Levenshtein distance (character similarity)
  - Jaccard similarity (word token matching)
- **Merge Direction**: Click tags or arrow button to change which tag to keep
- **Merge Options**:
  - Merge individual groups
  - Merge All button for batch processing
  - Ignore Group to skip suggestions
- **History**: View past merge operations

#### Interface
```
┌────────────────────────────────────────────────────────────────────────────┐
│  [📜 History]                                          [🔄 Refresh]         │
├────────────────────────────────────────────────────────────────────────────┤
│  Found 12 groups to merge                              [Merge All]          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ✓ landscape (342) ← KEEP   ⇄   × landscapes (23) × landschaft (5)  │ │
│  │                                  KEPT     DELETE                       │ │
│  │                                              [Merge] [Ignore Group]    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ✓ noir et blanc (45)  ⇄  × noir blanc (12) × black and white (34)  │ │
│  │       KEPT                      DELETE                                │ │
│  │  Similarity: 98% (token match)              [Merge] [Ignore Group]   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

#### How It Works
1. Tag Hub analyzes all tags for similarity
2. Groups similar tags together
3. Suggests which tag to keep (most used/longest)
4. You can change the target tag by clicking
5. Merge applies changes and updates all photos

### 4. Settings Tab (Keyboard: `4`)

**Purpose**: Configure tag similarity detection and preferences

#### Features
- **Similarity Presets**:
  - **Strict**: Levenshtein 1, Jaccard 90%, Min usage 5
  - **Balanced**: Levenshtein 2, Jaccard 80%, Min usage 1 (Default)
  - **Aggressive**: Levenshtein 3, Jaccard 60%, Min usage 0
- **Custom Thresholds**:
  - Levenshtein Threshold (1-3 characters)
  - Jaccard Threshold (60-95% similarity)
  - Minimum Usage Count (0-10 uses)
- **Preferences**:
  - Show AI tags separately
  - Suggest aliases while typing
  - Auto-merge obvious duplicates
  - Confirm before each merge

#### Interface
```
┌────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Similarity Detection                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│  Preset: ⚪ Strict  ⚫ Balanced  ⚪ Aggressive                              │
│                                                                             │
│  Levenshtein Threshold:  [──●────]  2                                     │
│  Character difference allowed (1-3)                                        │
│                                                                             │
│  Jaccard Threshold:      [──────●─]  80%                                  │
│  Word similarity required (60-95%)                                         │
│                                                                             │
│  Min. Usage Count:       [●───────]  1                                    │
│  Ignore tags with fewer uses (0-10)                                        │
│                                                                             │
│  ✅ Enable semantic similarity (requires API key)                         │
├────────────────────────────────────────────────────────────────────────────┤
│  Preferences                                                               │
├────────────────────────────────────────────────────────────────────────────┤
│  ✅ Show AI tags separately                                [ON]           │
│  ✅ Suggest aliases while typing                          [ON]           │
│  ⬜ Auto-merge obvious duplicates                         [OFF]          │
│  ✅ Confirm before each merge (safer)                     [ON]           │
│                                                                             │
│  [Reset to Defaults]                               [💾 Save Settings]     │
└────────────────────────────────────────────────────────────────────────────┘
```

## Workflows

### Browse and Filter Tags
1. Open Tag Hub (`Ctrl+T`)
2. Switch to Browse tab
3. Use search or filters to find tags
4. Click tags to filter library

### Clean Up Duplicate Tags
1. Open Tag Hub (`Ctrl+T`)
2. Switch to Fusion tab (`3`)
3. Review suggested merge groups
4. Click arrow buttons to change merge direction if needed
5. Click "Merge" on individual groups or "Merge All"
6. Check History to verify merges

### Bulk Delete Unused Tags
1. Open Tag Hub (`Ctrl+T`)
2. Switch to Browse tab
3. Filter by "Unused Tags"
4. Switch to Manage tab (`2`)
5. Select tags to delete
6. Press `Delete` or click "Delete Selected"

### Batch Tagging
1. **Select images** (Ctrl+Click or Shift+Click)
2. **Open BatchTagPanel**:
   - Button in TopBar (Tags icon)
   - Shortcut: `Ctrl+Shift+T`
3. **View existing tags**:
   - **Common Tags**: Present on all selected items
   - **Partial Tags**: Present on some items (with progress bar)
4. **Add tags**:
   - Type in the input field
   - Separate multiple tags with commas
   - Use Quick Tags (keys 1-9)
5. **Manage partial tags**:
   - "Add to All": Adds the tag to all selected items
   - "Remove from All": Removes the tag from all selected items
6. **Preview and Apply**: Verify changes before confirming

### Customize Similarity Detection
1. Open Tag Hub (`Ctrl+T`)
2. Switch to Settings tab (`4`)
3. Choose a preset or adjust sliders
4. Toggle preferences as needed
5. Click "Save Settings"

## Tips & Tricks

- **Quick Tab Switching**: Use number keys `1-4` to switch tabs
- **Fast Search**: Press `/` anywhere to jump to search in Browse tab
- **Select All**: In Manage tab, press `Ctrl+A` to select all tags
- **Merge Direction**: Click on any tag in a merge group to make it the target
- **History Review**: Check merge history before doing batch operations

## Best Practices

1. **Start with Fusion**: Use Fusion tab first to clean up obvious duplicates
2. **Review Before Merge**: Always check merge groups before clicking "Merge All"
3. **Use Balanced Preset**: Default "Balanced" setting works well for most users
4. **Regular Maintenance**: Run Tag Hub weekly to keep tags clean
5. **Check Statistics**: Monitor tag counts in Manage tab to track library health

## Keyboard Shortcuts Reference

| Shortcut       | Action                                     |
| -------------- | ------------------------------------------ |
| `Ctrl+T`       | Open/Close Tag Hub                         |
| `Ctrl+Shift+T` | Open Batch Tag Panel (when items selected) |
| `1-4`          | Switch to tab 1-4                          |
| `/`            | Focus search (Browse tab)                  |
| `Ctrl+A`       | Select/Deselect all (Manage tab)           |
| `Delete`       | Delete selected tags (Manage tab)          |
| `Esc`          | Blur search input                          |

## Troubleshooting

**Issue**: Tag Hub button doesn't appear
- **Solution**: Refresh the application

**Issue**: Keyboard shortcuts don't work
- **Solution**: Make sure no input field is focused

**Issue**: Merge operations fail
- **Solution**: Check that database is not locked, try smaller batches

**Issue**: Tags not updating after merge
- **Solution**: Library metadata is refreshed automatically, wait a moment

## Future Enhancements

- Tag usage statistics in Browse tab
- Tag hierarchy visualization
- Export/Import tag configurations
- Smart collection creation from tag selections
- Tag preview with sample images
- Bulk tag renaming
- Tag alias management
