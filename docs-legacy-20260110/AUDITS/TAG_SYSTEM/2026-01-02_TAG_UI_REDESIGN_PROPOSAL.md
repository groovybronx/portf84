# Tag Management UI/UX Redesign Proposal
## Date: 2026-01-02

## Table of Contents
1. [Vision Statement](#vision-statement)
2. [Design Principles](#design-principles)
3. [Centralized Tag Hub](#centralized-tag-hub)
4. [Enhanced Batch Tagging](#enhanced-batch-tagging)
5. [Improved Solo Tagging](#improved-solo-tagging)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Visual Design System](#visual-design-system)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Vision Statement

**Goal**: Create a unified, intuitive tag management system that empowers users to organize their photo library efficiently, whether working with single images or large batches.

**Core Principles**:
- **Centralized Access**: One hub for all tag operations
- **Context-Aware**: Show relevant tag actions based on current context
- **Progressive Disclosure**: Simple by default, powerful when needed
- **Keyboard-First**: Power users can work without touching the mouse
- **Visual Clarity**: Clear feedback on tag states and actions

---

## Design Principles

### 1. Centralization with Context
All tag features accessible from a central "Tag Hub", but also available in relevant contexts:
- Quick access from image viewer
- Batch operations from selection
- Global management from navigation

### 2. Progressive Disclosure
```
Basic User Path:
  Add tag → Done

Power User Path:
  Add tag → Configure auto-tag rules → Set up aliases → 
  Analyze duplicates → Batch merge → Create smart collections
```

### 3. Visual Hierarchy
```
Primary Actions (always visible):
  • Add tag
  • Remove tag
  • Search tags

Secondary Actions (on demand):
  • Merge duplicates
  • Rename tags
  • Bulk operations

Tertiary Actions (settings):
  • Configure thresholds
  • Manage aliases
  • View history
```

### 4. Feedback & Confirmation
- Immediate visual feedback for all actions
- Undo option for destructive operations
- Preview before committing batch changes
- Progress indicators for long operations

---

## Centralized Tag Hub

### Overview

**Component**: `TagHub` (new)
**Location**: Accessible from TopBar with prominent button + keyboard shortcut
**Mode**: Full-screen overlay or large modal

### Tab Structure

```
┌────────────────────────────────────────────────────────────┐
│  🏷️  Tag Hub                                         [✕]   │
├────────────────────────────────────────────────────────────┤
│  📁 Browse  |  ✏️ Manage  |  🔄 Fusion  |  ⚙️ Settings     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [TAB-SPECIFIC CONTENT]                                    │
│                                                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Tab 1: Browse

**Purpose**: Explore and navigate all tags

**Features**:
```
┌────────────────────────────────────────────────────────────┐
│  🔍 [Search tags...]              [Grid] [List]  [↕️ Sort] │
├────────────────────────────────────────────────────────────┤
│  Filters: [All] [Manual] [AI] [Unused] [Most Used]        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ landscape│  │ portrait │  │ sunset   │  │ nature   │  │
│  │   342    │  │   156    │  │   89     │  │   567    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ urban    │  │ wildlife │  │ macro    │  │ abstract │  │
│  │   234    │  │   123    │  │   67     │  │   45     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  Click tag to filter library                               │
│  Right-click for options (rename, delete, merge)           │
└────────────────────────────────────────────────────────────┘
```

**Interactions**:
- **Click tag**: Filter library to show only items with that tag
- **Hover**: Show preview tooltip with sample images
- **Right-click**: Context menu (Edit, Delete, Add Alias, Merge With...)
- **Select multiple**: Bulk operations, create smart collection

**Keyboard Shortcuts**:
- `Tab` / `Shift+Tab`: Navigate between tags
- `Enter`: Apply selected tag as filter
- `Ctrl+A`: Select all visible tags
- `/`: Focus search

### Tab 2: Manage

**Purpose**: CRUD operations, bulk editing, aliases

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  [+ Create New Tag]                    📊 Statistics        │
├────────────────────────────────────────────────────────────┤
│  Selected: 3 tags                                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Actions:                                            │   │
│  │  [🔗 Merge Selected]  [🗑️ Delete]  [📋 Export]    │   │
│  │  [🏷️ Add Alias]      [📁 Create Smart Collection] │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│  All Tags (1,234)                                          │
│                                                             │
│  ☑️ landscape (342) [✏️] [🗑️]    [AI]                    │
│     Aliases: "paysage"                                     │
│                                                             │
│  ☑️ portrait (156) [✏️] [🗑️]     [Manual]                │
│     No aliases                                             │
│                                                             │
│  ☑️ sunset (89) [✏️] [🗑️]        [AI]                    │
│     Aliases: "coucher de soleil", "dusk"                   │
│                                                             │
│  ⬜ nature (567) [✏️] [🗑️]        [Manual]                │
│     Related: "outdoor", "wildlife"                         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Features**:
- **Inline editing**: Click pencil to rename
- **Alias management**: Add synonyms directly
- **Bulk selection**: Checkbox for multi-select
- **Usage stats**: Items count per tag
- **Type indicator**: Visual badge for AI vs Manual
- **Related tags**: Suggest semantic connections

**Statistics Panel** (collapsible sidebar):
```
┌─────────────────────────┐
│ 📊 Statistics           │
├─────────────────────────┤
│ Total Tags: 1,234       │
│ Manual: 567             │
│ AI: 667                 │
│                         │
│ Most Used:              │
│  1. nature (567)        │
│  2. landscape (342)     │
│  3. portrait (156)      │
│                         │
│ Recently Added:         │
│  • macro (today)        │
│  • urban (2 days ago)   │
│                         │
│ Unused: 23 tags         │
│ [Clean Up]              │
└─────────────────────────┘
```

### Tab 3: Fusion (Existing TagManagerModal)

**Purpose**: Smart duplicate detection and merging

**Enhanced Features**:
```
┌────────────────────────────────────────────────────────────┐
│  Smart Tag Fusion                                          │
├────────────────────────────────────────────────────────────┤
│  Settings: [⚙️ Similarity: Balanced ▼]  [🔄 Analyze]      │
│                                                             │
│  Found 12 groups                         [Merge All]        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Group 1 of 12                           [Preview] [Merge]  │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ✓ landscape (342) ← KEEP                          │   │
│  │  ✗ landscapes (23) ← DELETE                        │   │
│  │  ✗ landschaft (5)  ← DELETE                        │   │
│  │                                                     │   │
│  │  Click ⇄ to cycle target                           │   │
│  │  Click any tag to make it target                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Group 2 of 12                           [Preview] [Merge]  │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ✓ noir et blanc (45) ← KEEP                       │   │
│  │  ✗ noir blanc (12) ← DELETE                        │   │
│  │  ✗ black and white (34) ← DELETE                   │   │
│  │                                                     │   │
│  │  Similarity: 98% (token match)                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  [Ignore All] [Review History]                             │
└────────────────────────────────────────────────────────────┘
```

**New Features**:
- **Preview Button**: Shows affected items before merge
- **Similarity Score**: Display match confidence (%)
- **Match Type**: Indicate why matched (Levenshtein, Token, Semantic)
- **Undo Banner**: After merge, show "Undo" for 10 seconds
- **Progress**: Real-time progress for batch merge

**Preview Modal**:
```
┌────────────────────────────────────────────┐
│  Merge Preview                       [✕]   │
├────────────────────────────────────────────┤
│  landscape (342) ← landscapes (23)         │
│                                            │
│  Items affected: 365 total                 │
│   • 342 already have "landscape"           │
│   • 23 will gain "landscape"               │
│   • "landscapes" will be deleted           │
│                                            │
│  Sample items:                             │
│  [🖼️] IMG_001.jpg                         │
│  [🖼️] IMG_045.jpg                         │
│  [🖼️] IMG_089.jpg                         │
│  ... and 362 more                          │
│                                            │
│     [Cancel]  [Confirm Merge]              │
└────────────────────────────────────────────┘
```

### Tab 4: Settings

**Purpose**: Configure similarity, ignored matches, preferences

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  Tag System Settings                                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Similarity Detection                                      │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Preset: ⚪ Strict  ⚫ Balanced  ⚪ Aggressive      │   │
│  │                                                     │   │
│  │  Levenshtein Threshold:  [──●────]  2              │   │
│  │  Character difference allowed (1-3)                │   │
│  │                                                     │   │
│  │  Jaccard Threshold:      [──────●─]  80%           │   │
│  │  Word similarity required (60-95%)                 │   │
│  │                                                     │   │
│  │  Min. Usage Count:       [●───────]  1             │   │
│  │  Ignore tags with fewer uses (0-10)                │   │
│  │                                                     │   │
│  │  ✅ Enable semantic similarity (requires API key)  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Ignored Matches (3)                [Clear All]            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  • "cat" ↔ "car" (manually ignored)          [✕]  │   │
│  │  • "art" ↔ "cart" (manually ignored)         [✕]  │   │
│  │  • "blue" ↔ "blur" (manually ignored)        [✕]  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Preferences                                               │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ✅ Show AI tags separately                        │   │
│  │  ✅ Suggest aliases while typing                   │   │
│  │  ✅ Auto-merge obvious duplicates (dist ≤ 1)       │   │
│  │  ⬜ Confirm before each merge (safer)              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│     [Reset to Defaults]           [Save Settings]          │
└────────────────────────────────────────────────────────────┘
```

**Interactive Sliders**:
- **Live Preview**: Show "X groups would be found" as slider moves
- **Test Mode**: Allow user to test with sample data
- **Save Presets**: Create custom presets for different workflows

---

## Enhanced Batch Tagging

### Current Flow (Problematic)
```
1. Select multiple items in grid
2. Right-click → Add Tag
3. Type one tag → Submit
4. Repeat for each tag needed
```

**Issues**: Tedious, no visibility of existing tags

### Proposed Flow

**Trigger**: Select multiple items → Batch Tag Panel appears

**Component**: `BatchTagPanel` (new, replaces `AddTagModal`)

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Batch Tagging: 15 items selected                     [✕]   │
├─────────────────────────────────────────────────────────────┤
│  Common Tags (on all 15 items):                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [nature (15/15) ✕]  [outdoor (15/15) ✕]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Partial Tags (on some items):                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  landscape (8/15) [+ Add to all] [− Remove from all]│   │
│  │  sunset (3/15) [+ Add to all] [− Remove from all]   │   │
│  │  portrait (5/15) [+ Add to all] [− Remove from all] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Add Tags:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Type to add tags, comma separated...]            │   │
│  │                                                     │   │
│  │  Suggestions: [landscape] [nature] [photo]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Preview: 15 items will be updated                          │
│  [Quick Tags: summer ⋅ vacation ⋅ family ⋅ travel]         │
│                                                             │
│                [Cancel]  [Apply Changes]                    │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
1. **Visibility**: See what tags are already applied
2. **Bulk Actions**: 
   - Add tag to all selected items
   - Remove tag from all selected items
   - Keep existing tags
3. **Smart Input**:
   - Add multiple tags in one action (comma-separated)
   - Autocomplete from existing tags
   - Quick tag buttons for frequently used tags
4. **Preview**: 
   - Show count of items that will change
   - Before/after state visualization
5. **Keyboard Shortcuts**:
   - `Ctrl+T`: Open batch tag panel
   - `Ctrl+Enter`: Apply changes
   - `Esc`: Cancel

### Visual States

**Tag Pills in Batch Panel**:
```
Full (all items):     [nature (15/15) ✕]     ← Blue, bold
Partial (some):       landscape (8/15)        ← Gray, italic
                      [+ Add] [− Remove]

New (being added):    [+summer]               ← Green, dashed
```

### Advanced Features (Future)

**Tag Operations**:
- **Replace**: Change "landscape" to "scenery" on all selected
- **Copy from**: Copy tags from one item to others
- **Propagate**: Tag first item, then apply to rest

**Filters During Batch**:
- Show only items missing certain tag
- Show only items with specific tag combination
- Visual highlighting in grid

---

## Improved Solo Tagging

### Current Implementation
`TagManager` component in ImageViewer sidebar works well but can be enhanced.

### Proposed Enhancements

#### 1. Quick Tag Shortcuts

**Feature**: Assign keyboard shortcuts to most-used tags

**UI**:
```
┌─────────────────────────────────┐
│  Tags                           │
├─────────────────────────────────┤
│  Manual Tags:                   │
│  [landscape ✕]  [nature ✕]     │
│                                 │
│  AI Tags:                       │
│  outdoor  sunset  mountain      │
│                                 │
│  Quick Tags (1-9):              │
│  1️⃣ landscape  2️⃣ portrait     │
│  3️⃣ nature     4️⃣ urban        │
│  5️⃣ sunset     6️⃣ wildlife     │
│                                 │
│  [Add tag...]                   │
└─────────────────────────────────┘
```

**Interaction**:
- Press `1-9` to toggle corresponding quick tag
- Visual feedback when tag applied
- Customize quick tags in settings

#### 2. Tag Suggestions from Similar Images

**Feature**: When viewing an image, suggest tags from similar images

**UI**:
```
┌─────────────────────────────────┐
│  Suggested Tags (from similar): │
│  [+ mountain] [+ hiking]        │
│  [+ outdoor]  [+ adventure]     │
│                                 │
│  Based on 12 similar images     │
└─────────────────────────────────┘
```

**Logic**:
- Use existing AI description similarity
- Find images with similar AI tags
- Suggest their manual tags
- Click to apply instantly

#### 3. Tag from Description

**Feature**: Parse AI description for potential tags

**UI**:
```
┌─────────────────────────────────┐
│  AI Description:                │
│  "A beautiful mountain          │
│  landscape with a sunset sky    │
│  and pine trees in foreground"  │
│                                 │
│  Extract Tags:                  │
│  [+ mountain] [+ landscape]     │
│  [+ sunset] [+ pine] [+ sky]    │
│                                 │
│  [Extract All]                  │
└─────────────────────────────────┘
```

**Benefit**: Leverage existing AI analysis more effectively

#### 4. Inline Tag Editing

**Current**: Click X to remove, type to add

**Enhanced**:
- Click tag to edit inline
- Drag to reorder (if order matters)
- Double-click to open tag details
- Right-click for options (alias, merge, etc.)

---

## Keyboard Shortcuts

### Global Shortcuts (Throughout App)

| Shortcut       | Action                         | Context        |
|----------------|--------------------------------|----------------|
| `Ctrl+T`       | Open Tag Hub                   | Anywhere       |
| `Ctrl+Shift+T` | Batch tag selection            | Grid with sel. |
| `Ctrl+F`       | Search tags                    | Tag Hub        |
| `/`            | Focus tag search               | Tag Hub        |
| `Escape`       | Close Tag Hub/Modal            | Any modal      |

### Tag Hub Shortcuts

| Shortcut       | Action                         | Tab            |
|----------------|--------------------------------|----------------|
| `1-4`          | Switch to tab 1-4              | Any            |
| `Tab`          | Navigate tags                  | Browse         |
| `Enter`        | Apply selected tag             | Browse         |
| `Space`        | Toggle tag selection           | Browse/Manage  |
| `Ctrl+A`       | Select all                     | Browse/Manage  |
| `Ctrl+D`       | Deselect all                   | Browse/Manage  |
| `Delete`       | Delete selected                | Manage         |
| `F2`           | Rename selected                | Manage         |
| `Ctrl+M`       | Merge selected                 | Manage         |

### Solo Tagging Shortcuts (ImageViewer)

| Shortcut       | Action                         |
|----------------|--------------------------------|
| `1-9`          | Toggle quick tag (customizable)|
| `T`            | Focus tag input                |
| `Ctrl+Enter`   | Add typed tag                  |
| `Backspace`    | Remove last tag                |

### Batch Tagging Shortcuts

| Shortcut       | Action                         |
|----------------|--------------------------------|
| `Ctrl+T`       | Open batch tag panel           |
| `Ctrl+Enter`   | Apply changes                  |
| `Ctrl+A`       | Add tag to all                 |
| `Ctrl+R`       | Remove tag from all            |
| `Escape`       | Cancel                         |

### Chord Sequences (Power Users)

**Inspired by vim/emacs**: Two-key combinations

| Sequence       | Action                         |
|----------------|--------------------------------|
| `G T`          | Go to Tag Hub                  |
| `G F`          | Go to Fusion tab               |
| `G S`          | Go to Settings tab             |
| `T A`          | Tag: Add to selection          |
| `T R`          | Tag: Remove from selection     |
| `T M`          | Tag: Merge duplicates          |
| `T C`          | Tag: Create smart collection   |

---

## Visual Design System

### Color Coding

**Tag Types**:
```
Manual Tag:   [landscape]      ← Blue (#3B82F6)
AI Tag:       [sunset]         ← Purple (#A855F7)
AI Detailed:  [mountain]       ← Purple with badge
System Tag:   [favorites]      ← Green (#10B981)
```

**Tag States**:
```
Applied:      [nature]         ← Solid background
Not Applied:  nature           ← Outline only
Partial:      landscape (8/15) ← Gradient fill
Suggested:    [+mountain]      ← Dashed outline
```

**Merge Operations**:
```
Target (keep):     [landscape]      ← Green border, checkmark
Candidate (delete): [landscapes]     ← Red border, strikethrough
Neutral:            [paysage]        ← Gray
```

### Icons

**Consistent Icon Usage**:
- 🏷️ Tag (general)
- ➕ Add tag
- ✏️ Edit/Rename
- 🗑️ Delete
- 🔄 Merge/Fusion
- 🔍 Search
- ⚙️ Settings
- 📊 Statistics
- 📜 History
- 🔗 Alias/Link
- 📁 Collection
- ⭐ Favorite

### Animation & Feedback

**Micro-interactions**:
- Tag pill bounces when added
- Fade out smoothly when removed
- Pulse when merging
- Shake if error (duplicate, etc.)
- Success checkmark animation

**Transitions**:
- Modal: Fade in with slight scale (0.95 → 1.0)
- Tabs: Slide left/right with fade
- List updates: Stagger animation (cascade effect)

**Progress Indicators**:
- Spinner for quick ops (< 2s expected)
- Progress bar for long ops (> 2s expected)
- Percentage for very long ops (> 10s expected)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal**: Create Tag Hub structure and migrate existing components

**Tasks**:
1. Create `TagHub.tsx` component with tab structure
2. Migrate TagManagerModal → "Fusion" tab
3. Create "Browse" tab with grid/list view
4. Add keyboard shortcut system
5. Implement tab navigation

**Deliverables**:
- Tag Hub accessible from TopBar
- Existing fusion functionality works in new UI
- Basic browse functionality

### Phase 2: Browse & Manage (Week 3-4)
**Goal**: Complete Browse and Manage tabs

**Tasks**:
1. Implement tag search with fuzzy matching
2. Add filtering (All, Manual, AI, Unused)
3. Create "Manage" tab with CRUD operations
4. Add inline editing and bulk operations
5. Implement statistics panel
6. Add context menus

**Deliverables**:
- Full tag browsing with search/filter
- Complete management interface
- Bulk operations functional

### Phase 3: Enhanced Batch Tagging (Week 5-6)
**Goal**: Replace AddTagModal with comprehensive batch panel

**Tasks**:
1. Create `BatchTagPanel.tsx` component
2. Implement tag overlap analysis
3. Add/remove tags in batch
4. Preview changes before apply
5. Quick tag suggestions
6. Keyboard shortcuts

**Deliverables**:
- New batch tagging panel
- Tag overlap visibility
- Smooth batch workflows

### Phase 4: Fusion Enhancements (Week 7-8)
**Goal**: Add preview and undo to merge operations

**Tasks**:
1. Implement merge preview modal
2. Add undo functionality using history table
3. Show similarity scores and types
4. Add configurable thresholds (settings tab)
5. Implement analysis caching
6. Progress indicators with cancellation

**Deliverables**:
- Merge preview before commit
- Undo merge operations
- Configurable similarity settings

### Phase 5: Solo Tagging Improvements (Week 9-10)
**Goal**: Enhance single-image tagging experience

**Tasks**:
1. Add quick tag shortcuts (1-9)
2. Implement tag suggestions from similar images
3. Tag extraction from AI descriptions
4. Inline tag editing enhancements
5. Keyboard-first navigation

**Deliverables**:
- Quick tag shortcuts functional
- Smart tag suggestions
- Enhanced solo tagging UX

### Phase 6: Polish & Performance (Week 11-12)
**Goal**: Optimize and refine the entire system

**Tasks**:
1. Performance audit and optimization
2. Add all animations and micro-interactions
3. Comprehensive keyboard shortcut guide
4. User testing and iteration
5. Documentation updates
6. Accessibility audit (WCAG 2.1)

**Deliverables**:
- Polished, performant UI
- Complete documentation
- Accessible to all users

### Phase 7: Advanced Features (Future)
**Goal**: Add semantic similarity and advanced analytics

**Tasks**:
1. Integrate Gemini for semantic similarity
2. Add tag relationship visualization
3. Advanced analytics dashboard
4. Multilingual stop word support
5. Export/import tag configurations

**Deliverables**:
- AI-powered synonym detection
- Visual tag relationships
- Comprehensive analytics

---

## Success Metrics

### Usability Metrics
- **Time to tag 100 images**: < 5 minutes (vs ~15 min currently)
- **Merge operation time**: < 30 seconds for typical dataset
- **User satisfaction**: > 8/10 in surveys
- **Error rate**: < 5% (accidental merges, etc.)

### Performance Metrics
- **Tag Hub load time**: < 500ms for 10K tags
- **Search response**: < 100ms for any query
- **Merge operation**: < 2s for 100 items affected
- **Memory usage**: < 50MB for 10K tags

### Adoption Metrics
- **Feature discovery**: > 90% of users find Tag Hub within first session
- **Daily active use**: Tag features used in > 80% of sessions
- **Keyboard shortcuts**: > 30% of power users adopt shortcuts
- **Merge usage**: > 50% of users with >100 tags run fusion

---

## Appendix A: Mockups

### Tag Hub - Full Interface
```
┌──────────────────────────────────────────────────────────────────────┐
│  🏷️  Tag Hub                     [Cmd+T]              [−] [□] [✕]   │
├──────────────────────────────────────────────────────────────────────┤
│  📁 Browse  |  ✏️ Manage  |  🔄 Fusion  |  ⚙️ Settings               │
├──────────────────────────────────────────────────────────────────────┤
│  🔍 [Search 1,234 tags...]         [⊞ Grid] [☰ List]  [↕️ Sort ▼]  │
│  Filters: [●All] [○Manual] [○AI] [○Unused] [○Most Used]             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │landscape │  │portrait  │  │sunset    │  │nature    │  │urban   ││
│  │  ★★★★★   │  │  ★★★☆☆   │  │  ★★☆☆☆   │  │  ★★★★★   │  │ ★★☆☆☆  ││
│  │   342    │  │   156    │  │   89     │  │   567    │  │  234   ││
│  │  Manual  │  │  Manual  │  │   AI     │  │  Manual  │  │ Manual ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │wildlife  │  │macro     │  │abstract  │  │colorful  │  │minimal ││
│  │  ★★★☆☆   │  │  ★☆☆☆☆   │  │  ★☆☆☆☆   │  │  ★★★☆☆   │  │ ★★☆☆☆  ││
│  │   123    │  │   67     │  │   45     │  │   189    │  │  78    ││
│  │  Manual  │  │   AI     │  │  Manual  │  │   AI     │  │ Manual ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                                       │
│  Showing 1-12 of 1,234                              [← Previous] [Next →]│
│                                                                       │
│  💡 Tip: Click any tag to filter your library. Right-click for more options.│
└──────────────────────────────────────────────────────────────────────┘
```

### Batch Tag Panel - Expanded View
```
┌────────────────────────────────────────────────────────────────┐
│  🏷️  Batch Tagging: 15 items selected               [✕]       │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📸 Preview: [🖼️] [🖼️] [🖼️] [🖼️] [🖼️] ... +10 more     │  │
│  └─────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Common Tags (on all 15/15 items):                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [nature ✕]  [outdoor ✕]  [summer ✕]                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚠️  Partial Tags (on some items):                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  landscape (8/15) [53%] [+ Add to all] [− Remove all]   │  │
│  │  ▓▓▓▓▓▓▓▓░░░░░░░                                        │  │
│  │                                                          │  │
│  │  sunset (3/15) [20%] [+ Add to all] [− Remove all]      │  │
│  │  ▓▓▓░░░░░░░░░░░░                                        │  │
│  │                                                          │  │
│  │  portrait (5/15) [33%] [+ Add to all] [− Remove all]    │  │
│  │  ▓▓▓▓▓░░░░░░░░░░                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ➕ Add Tags:                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [Type tag names, separated by commas...]               │  │
│  │                                                          │  │
│  │  💡 Suggestions: [landscape] [nature] [photography]     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚡ Quick Tags:                                                │
│  [vacation] [family] [travel] [friends] [event]               │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  📊 Preview: 15 items will be updated                          │
│  • 3 tags added to 7 items                                     │
│  • 1 tag removed from 12 items                                 │
│  • 2 tags unchanged                                            │
├────────────────────────────────────────────────────────────────┤
│                    [Cancel]  [Apply Changes]                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: User Research Questions

**To validate these designs, ask users**:
1. How do you currently find and apply tags?
2. What's frustrating about the current tag system?
3. How often do you need to tag multiple images at once?
4. Do you prefer keyboard shortcuts or mouse-driven interfaces?
5. How important is it to see tags applied to multiple items?
6. What features are missing from current tag management?

---

**Document Version**: 1.0  
**Author**: Lumina Portfolio Development Team  
**Date**: 2026-01-02  
**Status**: Proposal - Awaiting Feedback  
**Next Steps**: User testing with mockups, prioritize Phase 1 tasks
