# 📖 User Guide - Lumina Portfolio

**Complete guide for using Lumina Portfolio v0.3.0-beta.1**

**Last Update**: January 8, 2026

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (LTS version recommended)
- **[Rust](https://rustup.rs/)** (stable toolchain)
- **Operating System**: macOS 10.15+, Windows 10+, or Linux

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/groovybronx/portf84.git
cd portf84
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables (Optional)

Create a `.env.local` file for local development:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: You can also configure the API key through the application settings after launch.

### Running the Application

#### Development Mode

```bash
# Launch the full application (Frontend + Tauri backend)
npm run tauri:dev

# Or launch only the frontend (web browser)
npm run dev
```

#### Production Build

```bash
# Build the native application (.dmg for macOS, .exe for Windows, .AppImage for Linux)
npm run tauri:build
```

---

## 🎨 Application Overview

Lumina Portfolio is a desktop photo gallery application with AI-powered intelligence. It provides:

- **📷 Photo Library Management** - Organize and browse your photo collection
- **🤖 AI-Powered Analysis** - Automatic image analysis and tagging
- **🏷️ Smart Tag System** - Advanced tagging with duplicate detection
- **📁 Collections** - Organize photos into folders and smart collections
- **🌍 Internationalization** - Support for English and French

---

## 📷 Library Feature

### Viewing Photos

The library is your main interface for browsing photos:

#### View Modes
- **Grid View** - Thumbnail grid with infinite scroll
- **List View** - Detailed list with metadata
- **Fullscreen** - Immersive photo viewing

#### Navigation
- **Scroll** - Navigate through photos
- **Click** - Select a photo to view details
- **Double-click** - Open fullscreen viewer
- **Drag & Drop** - Select multiple photos

#### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Space` | Play/pause slideshow |
| `←` `→` | Navigate photos |
| `Esc` | Exit fullscreen |
| `Ctrl+A` | Select all photos |

---

## 🤖 AI Vision Feature

### Automatic Image Analysis

Lumina Portfolio uses Google's Gemini AI to analyze your photos:

#### What AI Can Do
- **Object Detection** - Identify objects, people, scenes
- **Text Recognition** - Read text in images (OCR)
- **Face Detection** - Identify and group faces
- **Scene Analysis** - Understand photo context
- **Color Analysis** - Extract dominant colors

#### Using AI Analysis

1. **Batch Analysis**
   - Select multiple photos
   - Click "Analyze" button
   - AI processes all selected photos

2. **Individual Analysis**
   - Double-click a photo
   - Click "Analyze" in viewer
   - Results appear instantly

3. **Auto-Analysis**
   - New photos are analyzed automatically
   - Results stored as tags and metadata

#### AI Settings
- **API Key** - Configure Gemini API key in Settings
- **Analysis Quality** - Balance between speed and accuracy
- **Batch Size** - Number of photos processed simultaneously

---

## 🏷️ Tag System

### Comprehensive Tag Management

Lumina Portfolio features an advanced tag system with AI integration:

#### Tag Types
- **Manual Tags** - User-created tags (editable, blue)
- **AI Tags** - AI-generated tags (read-only, gray)
- **Aliases** - Synonyms for tags (purple hints)

#### Tag Hub Interface

Access Tag Hub via:
- **Keyboard Shortcut**: `Ctrl+T` (or `Cmd+T` on Mac)
- **TopBar Button**: Click the Tag icon

##### Browse Tab
- **Search** - Type to filter tags
- **Filters** - All, Manual, AI, Unused, Most Used
- **Multi-Tag Filtering** - Select multiple tags for AND logic

##### Manage Tab
- **Bulk Selection** - Select multiple tags
- **Statistics** - Real-time tag metrics
- **Bulk Actions** - Merge, delete selected tags

##### Fusion Tab
- **Smart Detection** - Find duplicate tags automatically
- **Merge Groups** - Review suggested merges
- **History** - Track merge operations

##### Settings Tab
- **Similarity Presets** - Strict, Balanced, Aggressive
- **Custom Thresholds** - Fine-tune detection
- **Preferences** - UI and behavior settings

#### Tag Workflows

##### Clean Up Duplicate Tags
1. Open Tag Hub (`Ctrl+T`)
2. Switch to Fusion tab
3. Review suggested groups
4. Click "Merge" on groups or "Merge All"
5. Check History for verification

##### Batch Tagging
1. Select photos (Ctrl+Click or Shift+Click)
2. Open Batch Tag Panel (`Ctrl+Shift+T`)
3. Add tags separated by commas
4. Preview and apply changes

##### Multi-Tag Filtering
1. Open Tag Hub
2. Click tags to select them
3. Photos with ALL selected tags are shown
4. Selected tags appear as chips in search bar

---

## 📁 Collections Feature

### Organize Your Photos

Collections help you organize photos into logical groups:

#### Collection Types
- **Folders** - Physical folders on disk
- **Shadow Folders** - Virtual folders without moving files
- **Smart Collections** - Dynamic collections based on criteria

#### Creating Collections

1. **Folder Collection**
   - Right-click in library
   - "Create Folder"
   - Name and organize

2. **Shadow Folder**
   - Right-click photos
   - "Add to Shadow Folder"
   - Create new or existing folder

3. **Smart Collection**
   - Click "New Smart Collection"
   - Set criteria (tags, dates, etc.)
   - Collection updates automatically

#### Managing Collections
- **Drag & Drop** - Move photos between collections
- **Right-Click** - Context menu for options
- **Bulk Operations** - Select multiple photos
- **Search** - Find collections quickly

---

## 🎨 User Interface

### Design System

Lumina Portfolio uses a modern glassmorphism design:

#### Visual Elements
- **Glass Morphism** - Translucent backgrounds with blur
- **Dark Theme** - Easy on the eyes for photo viewing
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Adapts to different screen sizes

#### Components
- **TopBar** - Main navigation and search
- **Sidebar** - Tool panels and options
- **Modals** - Dialogs and detailed views
- **Tooltips** - Helpful hints and information

### Interactions

#### Mouse Interactions
- **Click** - Primary action
- **Right-Click** - Context menu
- **Double-Click** - Open/Fullscreen
- **Drag & Drop** - Move and organize

#### Keyboard Shortcuts

##### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Open Tag Hub |
| `Ctrl+Shift+T` | Open Batch Tag Panel |
| `Ctrl+F` | Focus search |
| `Esc` | Close modal/exit fullscreen |

##### Navigation Shortcuts
| Shortcut | Action |
|----------|--------|
| `←` `→` | Navigate photos |
| `↑` `↓` | Navigate lists |
| `Home` `End` | Jump to start/end |
| `Page Up/Down` | Navigate pages |

##### Tag Shortcuts (Tag Hub)
| Shortcut | Action |
|----------|--------|
| `1-4` | Switch tabs (Browse, Manage, Fusion, Settings) |
| `/` | Focus search (Browse tab) |
| `Ctrl+A` | Select all (Manage tab) |
| `Delete` | Delete selected (Manage tab) |

---

## 🌍 Internationalization

### Language Support

Lumina Portfolio supports multiple languages:

#### Available Languages
- **English** (en) - Default language
- **French** (fr) - Full support

#### Changing Language
1. Open Settings
2. Select "Language" tab
3. Choose preferred language
4. Application restarts with new language

#### Contributing Translations
- Translation files in `src/i18n/locales/`
- Format: JSON key-value pairs
- Missing translations show in English

---

## ⚙️ Settings

### Application Configuration

Access Settings via:
- **Menu**: Settings → Preferences
- **Keyboard**: `Ctrl+,` (comma)

#### Settings Categories

##### General
- **Language** - Choose interface language
- **Theme** - Appearance options
- **Startup** - Launch behavior

##### Library
- **Watch Folders** - Auto-scan directories
- **Thumbnail Size** - Grid display size
- **Cache Settings** - Performance options

##### AI Service
- **API Key** - Gemini API configuration
- **Analysis Quality** - Speed vs accuracy
- **Batch Processing** - Concurrent operations

##### Tags
- **Tag Hub Settings** - Similarity thresholds
- **Auto-Tagging** - Automatic analysis
- **Tag Display** - Visual preferences

##### Advanced
- **Database** - Storage location
- **Logs** - Debug information
- **Performance** - Resource limits

---

## 🔍 Search and Filter

### Finding Photos

Lumina Portfolio offers powerful search capabilities:

#### Quick Search
- **Global Search** - `Ctrl+F` to search everything
- **Tag Search** - Search by tag names
- **File Search** - Search by filename

#### Advanced Filters
- **Date Range** - Filter by capture date
- **File Type** - Image format filtering
- **Size** - File size ranges
- **Tags** - Include/exclude tags
- **AI Tags** - Filter by AI-generated tags

#### Search Operators
- **AND** - `landscape sunset` (both tags)
- **OR** - `landscape OR sunset` (either tag)
- **NOT** - `landscape NOT sunset` (exclude)
- **Quotes** - `"landscape photo"` (exact phrase)

---

## 📊 Statistics and Insights

### Library Analytics

Monitor your photo collection with built-in statistics:

#### Overview Statistics
- **Total Photos** - Number of images in library
- **Library Size** - Disk space usage
- **Tags Count** - Total unique tags
- **Collections** - Number of collections

#### Tag Statistics
- **Most Used Tags** - Popular tags ranking
- **AI vs Manual** - Tag type distribution
- **Unused Tags** - Tags with no photos
- **Tag Growth** - Tags created over time

#### Photo Statistics
- **Upload Timeline** - Photos added over time
- **File Types** - Image format distribution
- **Size Distribution** - File size ranges
- **Analysis Coverage** - AI analysis percentage

---

## 🛠️ Troubleshooting

### Common Issues

#### Installation Problems
- **Node.js Version** - Ensure LTS version
- **Rust Installation** - Check with `rustc --version`
- **Permissions** - Run with appropriate permissions

#### Performance Issues
- **Large Libraries** - Increase cache size in settings
- **Slow Analysis** - Check API key and internet connection
- **Memory Usage** - Close other applications

#### AI Service Issues
- **API Key Invalid** - Verify Gemini API key
- **Rate Limits** - Check API quota
- **Network Issues** - Verify internet connection

#### Tag System Issues
- **Duplicate Tags** - Use Tag Hub Fusion feature
- **Missing Tags** - Check tag visibility settings
- **Slow Search** - Rebuild search index

### Getting Help

#### Resources
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Detailed solutions
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/groovybronx/portf84/discussions)** - Ask questions

#### Debug Information
- **Logs** - Check application logs for errors
- **System Info** - View in Help → About
- **Console** - Browser developer tools (web mode)

---

## 📚 Advanced Features

### Power User Tips

#### Batch Operations
- **Select Multiple** - Ctrl+Click or Shift+Click
- **Batch Tag** - Select photos, then `Ctrl+Shift+T`
- **Batch Move** - Drag to collections
- **Batch Analysis** - Select and click Analyze

#### Keyboard Navigation
- **Tab Navigation** - Move between UI elements
- **Arrow Keys** - Navigate lists and grids
- **Enter** - Confirm actions
- **Space** - Toggle selections

#### Productivity Features
- **Quick Tags** - Frequently used tags
- **Recent Tags** - Recently applied tags
- **Smart Suggestions** - AI tag recommendations
- **Auto-Complete** - Tag name suggestions

---

## 🔄 Updates and Maintenance

### Keeping Current

#### Application Updates
- **Auto-Update** - Check for updates on launch
- **Manual Check** - Help → Check for Updates
- **Release Notes** - View what's new

#### Library Maintenance
- **Database Optimization** - Settings → Maintenance
- **Cache Clearing** - Free up disk space
- **Tag Cleanup** - Use Tag Hub regularly
- **Backup** - Export library settings

### Performance Tips

#### Optimize Performance
- **SSD Storage** - Faster photo loading
- **Sufficient RAM** - 8GB+ recommended
- **GPU Acceleration** - Enable if available
- **Background Processing** - Configure batch size

#### Storage Management
- **External Storage** - Store photos on external drives
- **Cache Management** - Regular cache cleanup
- **Compression** - Optimize image sizes
- **Archive Old Photos** - Move rarely used photos

---

## 🎉 Next Steps

Now that you're familiar with Lumina Portfolio, explore these resources:

### For Developers
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development workflow
- **[Architecture](./ARCHITECTURE.md)** - Technical details
- **[API Reference](./API_REFERENCE.md)** - Complete API docs

### For Advanced Users
- **[Tag System Documentation](./SYSTEMS/TAG_SYSTEM.md)** - Advanced tagging
- **[AI Service Guide](./SYSTEMS/AI_SERVICE.md)** - AI features
- **[Quick Reference](./QUICK_REFERENCE.md)** - Commands and shortcuts

### Community
- **[GitHub Discussions](https://github.com/groovybronx/portf84/discussions)** - Community support
- **[GitHub Issues](https://github.com/groovybronx/portf84/issues)** - Bug reports
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute

---

<div align="center">

**Enjoy using Lumina Portfolio!** 🎨✨

[🏠 Back to Documentation](./README.md) | [⚡ Quick Reference](./QUICK_REFERENCE.md) | [🔧 Troubleshooting](./TROUBLESHOOTING.md)

</div>
