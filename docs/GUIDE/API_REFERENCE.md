# 🔌 API Reference - Lumina Portfolio

**[API Reference](../../API_REFERENCE.md)** - Complete API documentation for services, hooks, and interfaces**

**Last Update**: January 8, 2026

---

## 📋 Overview

This document provides comprehensive API reference for all services, hooks, types, and interfaces in Lumina Portfolio. It serves as the technical reference for developers working with the codebase.

---

## 🏗️ Core Services

### Database Service

#### DatabaseService
```typescript
class DatabaseService {
  static async getConnection(): Promise<Database>
  static async executeQuery<T>(query: string, params?: any[]): Promise<T[]>
  static async executeCommand(query: string, params?: any[]): Promise<void>
  static async close(): Promise<void>
}
```

#### Usage Example
```typescript
import { DatabaseService } from '@/services/storage/database';

// Execute a query
const photos = await DatabaseService.executeQuery<Photo[]>(
  'SELECT * FROM photos ORDER BY created_at DESC'
);

// Execute a command
await DatabaseService.executeCommand(
  'INSERT INTO photos (id, path, filename) VALUES (?, ?, ?)',
  [photoId, path, filename]
);
```

---

### Photo Service

#### IPhotoService Interface
```typescript
interface IPhotoService {
  getPhotos(filters?: FilterState): Promise<Photo[]>
  getPhotoById(id: string): Promise<Photo | null>
  addPhoto(photo: CreatePhotoDto): Promise<Photo>
  updatePhoto(id: string, updates: UpdatePhotoDto): Promise<Photo>
  deletePhoto(id: string): Promise<void>
  analyzePhoto(id: string): Promise<AnalysisResult>
  getPhotoMetadata(id: string): Promise<PhotoMetadata>
}
```

#### PhotoService Implementation
```typescript
export class PhotoService implements IPhotoService {
  constructor(
    private photoRepo: PhotoRepository,
    private analysisService: GeminiService,
    private tagService: TagService
  ) {}

  async getPhotos(filters?: FilterState): Promise<Photo[]> {
    return this.photoRepo.findAll(filters);
  }

  async addPhoto(photo: CreatePhotoDto): Promise<Photo> {
    const newPhoto = await this.photoRepo.create(photo);

    // Trigger background analysis
    this.analyzePhoto(newPhoto.id).catch(console.error);

    return newPhoto;
  }

  async analyzePhoto(id: string): Promise<AnalysisResult> {
    const photo = await this.photoRepo.findById(id);
    if (!photo) throw new Error('Photo not found');

    const analysis = await this.analysisService.analyzeImage(photo.path);
    await this.saveAnalysis(id, analysis);

    const tags = await this.analysisService.generateTags(analysis);
    await this.tagService.addTagsToPhoto(id, tags);

    return analysis;
  }
}
```

---

### Tag Service

#### ITagService Interface
```typescript
interface ITagService {
  getAllTags(): Promise<Tag[]>
  getTagById(id: string): Promise<Tag | null>
  getTagByName(name: string): Promise<Tag | null>
  getOrCreateTag(name: string, type: TagType): Promise<Tag>
  deleteTag(id: string): Promise<void>
  updateTag(id: string, updates: UpdateTagDto): Promise<Tag>
  mergeTags(sourceIds: string[], targetId: string): Promise<void>
  getPhotoTags(photoId: string): Promise<Tag[]>
  addTagToPhoto(photoId: string, tagId: string, confidence?: number): Promise<void>
  removeTagFromPhoto(photoId: string, tagId: string): Promise<void>
  analyzeTagRedundancy(maxTags?: number): Promise<TagMergeGroup[]>
}
```

#### TagService Implementation
```typescript
export class TagService implements ITagService {
  constructor(private db: DatabaseService) {}

  async getAllTags(): Promise<Tag[]> {
    return this.db.executeQuery<Tag[]>(
      'SELECT * FROM tags ORDER BY usage_count DESC, name ASC'
    );
  }

  async getOrCreateTag(name: string, type: TagType = 'manual'): Promise<Tag> {
    // Try to find existing tag
    const existing = await this.db.executeQuery<Tag[]>(
      'SELECT * FROM tags WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new tag
    const id = generateId();
    await this.db.executeCommand(
      'INSERT INTO tags (id, name, type) VALUES (?, ?, ?)',
      [id, name, type]
    );

    return this.getTagById(id);
  }

  async mergeTags(sourceIds: string[], targetId: string): Promise<void> {
    await this.db.transaction(async () => {
      // Update all photo_tags to point to target tag
      for (const sourceId of sourceIds) {
        await this.db.executeCommand(
          'UPDATE photo_tags SET tag_id = ? WHERE tag_id = ?',
          [targetId, sourceId]
        );
      }

      // Delete source tags
      for (const sourceId of sourceIds) {
        await this.db.executeCommand(
          'DELETE FROM tags WHERE id = ?',
          [sourceId]
        );
      }

      // Update target tag usage count
      await this.updateTagUsageCount(targetId);
    });
  }
}
```

---

### Gemini Service

#### IGeminiService Interface
```typescript
interface IGeminiService {
  analyzeImage(imagePath: string): Promise<ImageAnalysis>
  batchAnalyze(imagePaths: string[]): Promise<ImageAnalysis[]>
  generateTags(analysis: ImageAnalysis): Promise<string[]>
  extractText(imagePath: string): Promise<string[]>
  detectFaces(imagePath: string): Promise<FaceDetection[]>
  isConfigured(): boolean
}
```

#### GeminiService Implementation
```typescript
export class GeminiService implements IGeminiService {
  private ai: GoogleGenerativeAI;
  private cache: AnalysisCache;

  constructor(config: GeminiConfig) {
    this.ai = new GoogleGenerativeAI(config.apiKey);
    this.cache = new AnalysisCache(config.cacheTTL);
  }

  async analyzeImage(imagePath: string): Promise<ImageAnalysis> {
    // Check cache first
    const cached = await this.cache.get(imagePath);
    if (cached) {
      return { ...cached, cacheHit: true };
    }

    const startTime = performance.now();

    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-pro-vision' });
      const imageData = await this.loadImageAsBase64(imagePath);

      const prompt = `
        Analyze this image and provide:
        1. Objects present (array)
        2. Scene description (string)
        3. Dominant colors (hex codes array)
        4. Mood/atmosphere (adjectives array)
        5. Technical details (lighting, composition)

        Respond in JSON format.
      `;

      const result = await model.generateContent([prompt, {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }]);

      const analysis = this.parseAnalysisResponse(result.response.text());
      const processingTime = performance.now() - startTime;

      const finalAnalysis: ImageAnalysis = {
        ...analysis,
        id: generateId(),
        imagePath,
        analyzedAt: new Date(),
        modelVersion: 'gemini-pro-vision',
        processingTime,
        cacheHit: false
      };

      // Cache the result
      await this.cache.set(imagePath, finalAnalysis);

      return finalAnalysis;
    } catch (error) {
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  async batchAnalyze(imagePaths: string[]): Promise<ImageAnalysis[]> {
    const batchSize = 5;
    const results: ImageAnalysis[] = [];

    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(path => this.analyzeImage(path))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to analyze ${batch[index]}:`, result.reason);
        }
      });

      // Rate limiting delay
      if (i + batchSize < imagePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
```

---

## 🪝 Custom Hooks

### useLibrary Hook

#### Interface
```typescript
interface UseLibraryReturn {
  photos: Photo[];
  selectedPhotos: string[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  filters: FilterState;

  // Actions
  setPhotos: (photos: Photo[]) => void;
  selectPhoto: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: FilterState) => void;
  refreshPhotos: () => Promise<void>;
}
```

#### Implementation
```typescript
export const useLibrary = (): UseLibraryReturn => {
  const { state, actions } = useContext(LibraryContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const photos = await PhotoService.getPhotos(state.filters);
      actions.setPhotos(photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [state.filters, actions]);

  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  return {
    ...state,
    loading,
    error,
    refreshPhotos
  };
};
```

### useTags Hook

#### Interface
```typescript
interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;

  // Actions
  createTag: (name: string, type?: TagType) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  updateTag: (id: string, updates: UpdateTagDto) => Promise<Tag>;
  mergeTags: (sourceIds: string[], targetId: string) => Promise<void>;
  getTagUsage: (id: string) => Promise<number>;
}
```

#### Implementation
```typescript
export const useTags = (): UseTagsReturn => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tagService = new TagService();
      const allTags = await tagService.getAllTags();
      setTags(allTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (name: string, type: TagType = 'manual') => {
    const tagService = new TagService();
    const newTag = await tagService.getOrCreateTag(name, type);
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    const tagService = new TagService();
    await tagService.deleteTag(id);
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    loading,
    error,
    createTag,
    deleteTag,
    updateTag: async (id, updates) => {
      const tagService = new TagService();
      const updated = await tagService.updateTag(id, updates);
      setTags(prev => prev.map(tag => tag.id === id ? updated : tag));
      return updated;
    },
    mergeTags: async (sourceIds, targetId) => {
      const tagService = new TagService();
      await tagService.mergeTags(sourceIds, targetId);
      await loadTags(); // Refresh tags
    },
    getTagUsage: async (id) => {
      const tagService = new TagService();
      const tag = await tagService.getTagById(id);
      return tag?.usage_count || 0;
    }
  };
};
```

### useModalState Hook

#### Interface
```typescript
interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
```

#### Implementation
```typescript
export const useModalState = (initialState = false): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
};
```

---

## 📝 Data Types

### Core Types

#### Photo
```typescript
interface Photo {
  id: string;
  path: string;
  filename: string;
  file_size: number;
  width?: number;
  height?: number;
  format: string;
  created_at: string;
  updated_at: string;
  analyzed_at?: string;
  thumbnail_path?: string;
}
```

#### Tag
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

#### Collection
```typescript
interface Collection {
  id: string;
  name: string;
  type: 'folder' | 'shadow' | 'smart';
  parent_id?: string;
  criteria?: string; // JSON for smart collections
  created_at: string;
  updated_at: string;
}
```

### Analysis Types

#### ImageAnalysis
```typescript
interface ImageAnalysis {
  id: string;
  imagePath: string;
  analyzedAt: Date;
  modelVersion: string;
  confidence: number;

  // Visual analysis
  objects: string[];
  scene: string;
  mood: string[];
  colors: string[];

  // Technical details
  lighting: LightingInfo;
  composition: CompositionInfo;
  technical: TechnicalInfo;

  // Extracted content
  tags: string[];
  text: string[];
  faces: FaceDetection[];

  // Metadata
  processingTime: number;
  cacheHit: boolean;
}
```

#### FaceDetection
```typescript
interface FaceDetection {
  id: string;
  boundingBox: BoundingBox;
  confidence: number;
  attributes?: FaceAttributes;
}

interface FaceAttributes {
  age?: 'child' | 'teen' | 'adult' | 'senior';
  gender?: 'male' | 'female';
  expression?: 'happy' | 'sad' | 'neutral' | 'surprised';
}
```

### UI Types

#### FilterState
```typescript
interface FilterState {
  search?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileTypes?: string[];
  minSize?: number;
  maxSize?: number;
}
```

#### ViewMode
```typescript
type ViewMode = 'grid' | 'list' | 'masonry';
```

---

## 🔧 Utility Functions

### File System

#### validateImagePath
```typescript
export function validateImagePath(path: string): boolean {
  try {
    const normalized = path.normalize(path);

    // Check for directory traversal
    if (normalized.includes('..')) return false;

    // Check allowed extensions
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(normalized).toLowerCase();
    return allowedExts.includes(ext);
  } catch {
    return false;
  }
}
```

#### generateThumbnail
```typescript
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  size = 200
): Promise<void> {
  const image = await Jimp.read(inputPath);

  await image
    .resize(size, Jimp.AUTO)
    .quality(80)
    .writeAsync(outputPath);
}
```

### Image Processing

#### getImageDimensions
```typescript
export async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
  const image = await Jimp.read(imagePath);
  return {
    width: image.bitmap.width,
    height: image.bitmap.height
  };
}
```

#### calculateAspectRatio
```typescript
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}
```

### String Utilities

#### slugify
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
```

#### truncate
```typescript
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
```

---

## 🎯 Event System

### Event Bus

#### EventBus Class
```typescript
class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();
```

#### Event Types
```typescript
export enum EventType {
  PHOTO_SELECTED = 'photo:selected',
  PHOTO_ANALYZED = 'photo:analyzed',
  TAG_CREATED = 'tag:created',
  TAG_DELETED = 'tag:deleted',
  TAGS_MERGED = 'tags:merged',
  COLLECTION_CREATED = 'collection:created',
  FILTER_CHANGED = 'filter:changed',
  VIEW_MODE_CHANGED = 'viewmode:changed'
}
```

---

## 🔍 Search and Filtering

### SearchService

#### Interface
```typescript
interface SearchService {
  searchPhotos(query: string, filters?: FilterState): Promise<Photo[]>
  searchTags(query: string): Promise<Tag[]>
  searchCollections(query: string): Promise<Collection[]>
  buildIndex(): Promise<void>
}
```

#### Implementation
```typescript
export class SearchService {
  private photoIndex: lunr.Index;
  private tagIndex: lunr.Index;
  private collectionIndex: lunr.Index;

  async searchPhotos(query: string, filters?: FilterState): Promise<Photo[]> {
    const searchResults = this.photoIndex.search(query);
    const photoIds = searchResults.map(result => result.ref);

    const photoService = new PhotoService();
    const photos = await Promise.all(
      photoIds.map(id => photoService.getPhotoById(id))
    );

    return photos.filter(Boolean) as Photo[];
  }

  async buildIndex(): Promise<void> {
    const photoService = new PhotoService();
    const photos = await photoService.getPhotos();

    this.photoIndex = lunr(function() {
      this.field('filename');
      this.field('path');
      this.ref('id');

      photos.forEach(photo => {
        this.add({
          id: photo.id,
          filename: photo.filename,
          path: photo.path
        });
      });
    });
  }
}
```

---

## 📊 Analytics and Monitoring

### MetricsService

#### Interface
```typescript
interface MetricsService {
  trackEvent(name: string, properties?: Record<string, any>): void
  trackPageView(path: string): void
  trackError(error: Error, context?: Record<string, any>): void
  trackPerformance(metric: string, duration: number): void
}
```

#### Implementation
```typescript
export class MetricsService {
  private enabled: boolean;

  constructor() {
    this.enabled = import.meta.env.PROD;
  }

  trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.enabled) return;

    // Send to analytics service
    console.log('Event:', name, properties);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.enabled) return;

    console.error('Error:', error.message, context);
  }

  trackPerformance(metric: string, duration: number): void {
    if (!this.enabled) return;

    console.log('Performance:', metric, duration);
  }
}
```

---

## 🧪 Testing Utilities

### Mock Services

#### MockPhotoService
```typescript
export class MockPhotoService implements IPhotoService {
  private photos: Photo[] = [];

  async getPhotos(filters?: FilterState): Promise<Photo[]> {
    return this.photos;
  }

  async addPhoto(photo: CreatePhotoDto): Promise<Photo> {
    const newPhoto: Photo = {
      id: generateId(),
      ...photo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.photos.push(newPhoto);
    return newPhoto;
  }

  // ... other methods
}
```

#### Test Utilities
```typescript
export function createMockPhoto(overrides?: Partial<Photo>): Photo {
  return {
    id: generateId(),
    path: '/test/path.jpg',
    filename: 'test.jpg',
    file_size: 1024,
    format: 'jpeg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

export function createMockTag(overrides?: Partial<Tag>): Tag {
  return {
    id: generateId(),
    name: 'test-tag',
    type: 'manual',
    usage_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}
```

---

## 📚 Module Index

### Services
- **DatabaseService** - Database connection and queries
- **PhotoService** - Photo CRUD operations
- **TagService** - Tag management and analysis
- **GeminiService** - AI image analysis
- **SearchService** - Search and filtering
- **MetricsService** - Analytics and monitoring

### Hooks
- **useLibrary** - Photo library state and actions
- **useTags** - Tag management state and actions
- **useModalState** - Modal state management
- **useKeyboardShortcuts** - Keyboard shortcut handling
- **useDebounce** - Debounced values

### Types
- **Photo** - Photo data structure
- **Tag** - Tag data structure
- **Collection** - Collection data structure
- **ImageAnalysis** - AI analysis results
- **FilterState** - Search and filter configuration

### Utilities
- **File system** - Path validation and thumbnail generation
- **Image processing** - Dimension calculation and processing
- **String** - Text manipulation utilities
- **Event bus** - Application-wide event system

---

## 🔮 Future API Additions

### Planned Services

#### SyncService
```typescript
interface SyncService {
  syncPhotos(): Promise<void>
  syncTags(): Promise<void>
  syncSettings(): Promise<void>
  resolveConflicts(): Promise<ConflictResolution[]>
}
```

#### PluginService
```typescript
interface PluginService {
  loadPlugin(plugin: Plugin): Promise<void>
  unloadPlugin(name: string): Promise<void>
  executePluginAction(name: string, action: string, data: any): Promise<any>
}
```

### Enhanced Types

#### Advanced Filters
```typescript
interface AdvancedFilterState extends FilterState {
  aiConfidence?: { min: number; max: number };
  colorPalette?: string[];
  composition?: string[];
  lighting?: string[];
}
```

#### Smart Collections
```typescript
interface SmartCollectionCriteria {
  rules: CollectionRule[];
  operator: 'AND' | 'OR';
}

interface CollectionRule {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: any;
}
```

---

## 📚 Related Documentation

- **[Architecture](../../ARCHITECTURE.md)** - System architecture overview
- **[Developer Guide](../../DEVELOPER_GUIDE.md)** - Development workflow
- **[User Guide](../../USER_GUIDE.md)** - End-user documentation
- **[System Documentation](./SYSTEMS/)** - System-specific guides

---

## 🆘 API Troubleshooting

### Common Issues

#### Database Connection
- **Issue**: "Database connection failed"
- **Solution**: Check SQLite plugin installation and file permissions

#### API Rate Limits
- **Issue**: "Rate limit exceeded" from Gemini API
- **Solution**: Implement exponential backoff and reduce batch size

#### Memory Issues
- **Issue**: High memory usage during batch operations
- **Solution**: Process in smaller batches and implement proper cleanup

### Debug Mode

#### Enable Debug Logging
```typescript
// Enable debug mode
const DEBUG = process.env.NODE_ENV === 'development';

export const debug = {
  log: (message: string, data?: any) => {
    if (DEBUG) console.log(`[API] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[API] ${message}`, error);
  }
};
```

---

<div align="center">

**API Reference Documentation** - Complete technical reference for developers 🔌✨

[🏠 Back to Documentation](../../README.md) | [🏗️ Architecture](../../ARCHITECTURE.md) | [💻 Developer Guide](../../DEVELOPER_GUIDE.md)

</div>
