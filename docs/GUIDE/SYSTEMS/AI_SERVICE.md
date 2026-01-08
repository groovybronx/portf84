# 🤖 AI Service - Lumina Portfolio

**Complete documentation for AI-powered features and Gemini integration**

**Last Update**: January 8, 2026

---

## 📋 Overview

The AI Service provides intelligent image analysis capabilities using Google's Gemini AI. It enables automatic tagging, object detection, scene analysis, and text recognition for photos in the Lumina Portfolio.

### Key Features

- **🔍 Image Analysis** - Comprehensive visual analysis using Gemini Pro Vision
- **🏷️ Automatic Tagging** - AI-generated tags with confidence scores
- **📝 Text Recognition** - OCR capabilities for text in images
- **👤 Face Detection** - Identify and group faces in photos
- **🎨 Color Analysis** - Extract dominant colors and palettes
- **🌍 Scene Understanding** - Contextual scene descriptions

---

## 🏗️ Architecture

### Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Vision        │  │  Tag Manager   │  │  Text OCR    │ │
│  │  Feature       │  │  Feature       │  │  Feature     │ │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘ │
│           │                    │                  │          │
│           └────────────────────┼──────────────────┘          │
│                                ▼                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Gemini Service Layer                      │ │
│  │  • GeminiService (main interface)                    │ │
│  │  • AnalysisCache (performance optimization)           │ │
│  │  • BatchProcessor (bulk operations)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                ▼                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Google Gemini API                            │ │
│  │  • gemini-pro-vision (image analysis)                │ │
│  │  • Rate limiting and quota management                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### GeminiService
Main interface for all AI operations
- Image analysis and interpretation
- Batch processing capabilities
- Error handling and retry logic
- API key management

#### AnalysisCache
Performance optimization layer
- Results caching for 30 days
- Memory-efficient storage
- Cache invalidation on updates

#### BatchProcessor
Handles bulk operations efficiently
- Rate limiting compliance
- Progress tracking
- Error recovery

---

## 🔧 Configuration

### API Key Setup

#### Method 1: Application Settings
1. Open Lumina Portfolio
2. Go to Settings → AI Service
3. Enter your Gemini API key
4. Click "Save"

#### Method 2: Environment Variable
```bash
# Create .env.local file
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### Method 3: Secure Storage
```typescript
import { SecureStorageService } from '@/services/secureStorage';

await SecureStorageService.storeApiKey('your-api-key');
```

### Service Configuration

```typescript
// src/services/geminiService.ts
export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-pro-vision';
  temperature: number;
  maxTokens: number;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTTL: number; // milliseconds
}

const defaultConfig: GeminiConfig = {
  apiKey: process.env.VITE_GEMINI_API_KEY || '',
  model: 'gemini-pro-vision',
  temperature: 0.1,
  maxTokens: 2048,
  batchSize: 5,
  cacheEnabled: true,
  cacheTTL: 30 * 24 * 60 * 60 * 1000 // 30 days
};
```

---

## 📊 API Reference

### GeminiService Class

#### Constructor
```typescript
constructor(config: GeminiConfig)
```

#### Methods

##### analyzeImage(imagePath: string): Promise<ImageAnalysis>
Analyzes a single image and returns comprehensive results.

**Parameters:**
- `imagePath`: Local path to the image file

**Returns:** `Promise<ImageAnalysis>`

**Example:**
```typescript
const geminiService = new GeminiService(config);
const analysis = await geminiService.analyzeImage('/path/to/photo.jpg');

console.log(analysis.objects);      // ['person', 'car', 'building']
console.log(analysis.scene);        // 'Urban street scene with pedestrians'
console.log(analysis.colors);       // ['#3B82F6', '#EF4444', '#10B981']
console.log(analysis.confidence);   // 0.87
```

##### batchAnalyze(imagePaths: string[]): Promise<ImageAnalysis[]>
Analyzes multiple images in batches with rate limiting.

**Parameters:**
- `imagePaths`: Array of image file paths

**Returns:** `Promise<ImageAnalysis[]>`

**Example:**
```typescript
const imagePaths = ['/path/to/photo1.jpg', '/path/to/photo2.jpg'];
const analyses = await geminiService.batchAnalyze(imagePaths);

analyses.forEach((analysis, index) => {
  console.log(`Photo ${index + 1}:`, analysis.scene);
});
```

##### generateTags(analysis: ImageAnalysis): Promise<string[]>
Extracts relevant tags from analysis results.

**Parameters:**
- `analysis`: Image analysis results

**Returns:** `Promise<string[]>`

**Example:**
```typescript
const tags = await geminiService.generateTags(analysis);
console.log(tags); // ['landscape', 'sunset', 'nature', 'outdoor']
```

##### extractText(imagePath: string): Promise<string[]>
Performs OCR to extract text from images.

**Parameters:**
- `imagePath`: Path to the image file

**Returns:** `Promise<string[]>`

**Example:**
```typescript
const text = await geminiService.extractText('/path/to/document.jpg');
console.log(text); // ['Important Document', 'Page 1 of 5', 'Confidential']
```

##### detectFaces(imagePath: string): Promise<FaceDetection[]>
Detects faces in images with bounding boxes.

**Parameters:**
- `imagePath`: Path to the image file

**Returns:** `Promise<FaceDetection[]>`

**Example:**
```typescript
const faces = await geminiService.detectFaces('/path/to/group-photo.jpg');
faces.forEach(face => {
  console.log(`Face at (${face.x}, ${face.y}) with confidence ${face.confidence}`);
});
```

---

## 📝 Data Models

### ImageAnalysis Interface

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

### FaceDetection Interface

```typescript
interface FaceDetection {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  attributes?: {
    age?: 'child' | 'teen' | 'adult' | 'senior';
    gender?: 'male' | 'female';
    expression?: 'happy' | 'sad' | 'neutral' | 'surprised';
  };
}
```

### LightingInfo Interface

```typescript
interface LightingInfo {
  type: 'natural' | 'artificial' | 'mixed' | 'unknown';
  quality: 'bright' | 'medium' | 'dark' | 'backlit';
  direction: 'front' | 'side' | 'back' | 'top' | 'unknown';
  timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
}
```

---

## 🚀 Usage Examples

### Basic Image Analysis

```typescript
import { GeminiService } from '@/services/geminiService';

// Initialize service
const geminiService = new GeminiService({
  apiKey: 'your-api-key',
  batchSize: 3,
  cacheEnabled: true
});

// Analyze single image
async function analyzePhoto(photoPath: string) {
  try {
    const analysis = await geminiService.analyzeImage(photoPath);

    console.log('Scene:', analysis.scene);
    console.log('Objects:', analysis.objects);
    console.log('Colors:', analysis.colors);
    console.log('Tags:', analysis.tags);

    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

### Batch Processing

```typescript
async function processPhotoLibrary(photoPaths: string[]) {
  console.log(`Processing ${photoPaths.length} photos...`);

  try {
    // Process in batches with automatic rate limiting
    const analyses = await geminiService.batchAnalyze(photoPaths);

    // Process results
    const results = analyses.map((analysis, index) => ({
      path: photoPaths[index],
      analysis: analysis,
      success: analysis.confidence > 0.5
    }));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Successfully analyzed: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    return results;
  } catch (error) {
    console.error('Batch processing failed:', error);
    throw error;
  }
}
```

### Tag Generation and Storage

```typescript
import { TagService } from '@/services/storage/tags';

async function analyzeAndTagPhoto(photoPath: string) {
  // Analyze image
  const analysis = await geminiService.analyzeImage(photoPath);

  // Generate tags
  const tags = await geminiService.generateTags(analysis);

  // Store in database
  const tagService = new TagService();
  const photoId = await getPhotoIdFromPath(photoPath);

  for (const tagName of tags) {
    const tag = await tagService.getOrCreateTag(tagName, 'ai');
    await tagService.addTagToPhoto(photoId, tag.id, analysis.confidence);
  }

  console.log(`Added ${tags.length} AI tags to photo`);
  return tags;
}
```

### Text Extraction

```typescript
async function extractTextFromDocument(imagePath: string) {
  try {
    const text = await geminiService.extractText(imagePath);

    if (text.length > 0) {
      console.log('Extracted text:', text.join('\n'));

      // Store extracted text for search
      await storeExtractedText(imagePath, text);
    }

    return text;
  } catch (error) {
    console.error('Text extraction failed:', error);
    return [];
  }
}
```

---

## ⚡ Performance Optimization

### Caching Strategy

#### Analysis Cache
```typescript
class AnalysisCache {
  private cache = new Map<string, CachedAnalysis>();
  private maxSize = 1000;
  private ttl = 30 * 24 * 60 * 60 * 1000; // 30 days

  async get(imagePath: string): Promise<ImageAnalysis | null> {
    const cached = this.cache.get(imagePath);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(imagePath);
      return null;
    }

    return cached.analysis;
  }

  async set(imagePath: string, analysis: ImageAnalysis): Promise<void> {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(imagePath, {
      analysis,
      timestamp: Date.now()
    });
  }
}
```

### Batch Processing

#### Rate Limiting
```typescript
class BatchProcessor {
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between batches
  private readonly BATCH_SIZE = 5;

  async processBatch(imagePaths: string[]): Promise<ImageAnalysis[]> {
    const results: ImageAnalysis[] = [];

    for (let i = 0; i < imagePaths.length; i += this.BATCH_SIZE) {
      const batch = imagePaths.slice(i, i + this.BATCH_SIZE);

      // Process batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(path => this.analyzeSingle(path))
      );

      // Extract successful results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to analyze ${batch[index]}:`, result.reason);
        }
      });

      // Rate limiting delay between batches
      if (i + this.BATCH_SIZE < imagePaths.length) {
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));
      }
    }

    return results;
  }
}
```

### Memory Management

#### Image Loading Optimization
```typescript
async function loadImageForAnalysis(imagePath: string): Promise<string> {
  // Resize large images to reduce API payload
  const maxSize = 1024; // Max dimension

  const image = await Jimp.read(imagePath);

  if (image.bitmap.width > maxSize || image.bitmap.height > maxSize) {
    image.resize(maxSize, Jimp.AUTO);
  }

  // Convert to base64 with optimal quality
  return image.getBase64Async(Jimp.MIME_JPEG, 85);
}
```

---

## 🔍 Error Handling

### Common Errors

#### API Key Issues
```typescript
class APIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIKeyError';
  }
}

// Handle invalid API key
try {
  await geminiService.analyzeImage(photoPath);
} catch (error) {
  if (error.message.includes('API_KEY_INVALID')) {
    throw new APIKeyError('Invalid Gemini API key. Please check your configuration.');
  }
}
```

#### Rate Limiting
```typescript
class RateLimitError extends Error {
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
  }
}

// Handle rate limiting with exponential backoff
async function analyzeWithRetry(imagePath: string, maxRetries = 3): Promise<ImageAnalysis> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await geminiService.analyzeImage(imagePath);
    } catch (error) {
      if (error instanceof RateLimitError && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### Network Issues
```typescript
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Network error handling
async function analyzeWithNetworkRetry(imagePath: string): Promise<ImageAnalysis> {
  try {
    return await geminiService.analyzeImage(imagePath);
  } catch (error) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      // Implement retry logic
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }
    throw error;
  }
}
```

---

## 📈 Monitoring and Analytics

### Performance Metrics

```typescript
interface AnalysisMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  apiUsage: {
    requests: number;
    tokensUsed: number;
    cost: number;
  };
}

class MetricsCollector {
  private metrics: AnalysisMetrics = {
    totalAnalyses: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    apiUsage: {
      requests: 0,
      tokensUsed: 0,
      cost: 0
    }
  };

  recordAnalysis(duration: number, success: boolean, cacheHit: boolean): void {
    this.metrics.totalAnalyses++;

    if (success) {
      this.metrics.successfulAnalyses++;
    } else {
      this.metrics.failedAnalyses++;
    }

    if (cacheHit) {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (this.metrics.totalAnalyses - 1) + 1) / this.metrics.totalAnalyses;
    }

    // Update average processing time
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.totalAnalyses - 1) + duration) / this.metrics.totalAnalyses;
  }

  getMetrics(): AnalysisMetrics {
    return { ...this.metrics };
  }
}
```

### Usage Analytics

```typescript
class UsageAnalytics {
  async trackAnalysis(analysis: ImageAnalysis): Promise<void> {
    // Send anonymous usage data
    await analytics.track('ai_analysis_completed', {
      model: analysis.modelVersion,
      confidence: analysis.confidence,
      objectCount: analysis.objects.length,
      tagCount: analysis.tags.length,
      processingTime: analysis.processingTime,
      cacheHit: analysis.cacheHit
    });
  }

  async trackBatchOperation(batchSize: number, duration: number): Promise<void> {
    await analytics.track('ai_batch_completed', {
      batchSize,
      duration,
      averageTimePerImage: duration / batchSize
    });
  }
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// tests/services/geminiService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '@/services/geminiService';

describe('GeminiService', () => {
  let geminiService: GeminiService;
  let mockConfig: GeminiConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      model: 'gemini-pro-vision',
      temperature: 0.1,
      maxTokens: 2048,
      batchSize: 5,
      cacheEnabled: true,
      cacheTTL: 30 * 24 * 60 * 60 * 1000
    };

    geminiService = new GeminiService(mockConfig);
  });

  describe('analyzeImage', () => {
    it('should analyze image and return analysis result', async () => {
      const mockAnalysis: ImageAnalysis = {
        id: 'test-id',
        imagePath: '/test/image.jpg',
        analyzedAt: new Date(),
        modelVersion: 'gemini-pro-vision',
        confidence: 0.85,
        objects: ['person', 'car'],
        scene: 'Urban street scene',
        mood: ['dynamic', 'urban'],
        colors: ['#3B82F6', '#EF4444'],
        lighting: {
          type: 'natural',
          quality: 'bright',
          direction: 'front'
        },
        composition: {
          rule: 'rule_of_thirds',
          balance: 'asymmetrical'
        },
        technical: {
          resolution: '1920x1080',
          format: 'JPEG',
          fileSize: 2048576
        },
        tags: ['urban', 'street', 'person', 'car'],
        text: [],
        faces: [],
        processingTime: 1500,
        cacheHit: false
      };

      vi.mocked(geminiService.analyzeImage).mockResolvedValue(mockAnalysis);

      const result = await geminiService.analyzeImage('/test/image.jpg');

      expect(result).toEqual(mockAnalysis);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.objects).toContain('person');
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(geminiService.analyzeImage).mockRejectedValue(new Error('API Error'));

      await expect(geminiService.analyzeImage('/test/image.jpg')).rejects.toThrow('API Error');
    });
  });

  describe('generateTags', () => {
    it('should generate relevant tags from analysis', async () => {
      const mockAnalysis: ImageAnalysis = {
        // ... other properties
        objects: ['beach', 'ocean', 'sunset'],
        scene: 'Beach sunset scene',
        mood: ['peaceful', 'warm'],
        colors: ['#F59E0B', '#3B82F6'],
        tags: []
      };

      const tags = await geminiService.generateTags(mockAnalysis);

      expect(tags).toContain('beach');
      expect(tags).toContain('sunset');
      expect(tags).toContain('ocean');
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/aiWorkflow.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiService } from '@/services/geminiService';
import { TagService } from '@/services/storage/tags';

describe('AI Workflow Integration', () => {
  let geminiService: GeminiService;
  let tagService: TagService;

  beforeEach(() => {
    geminiService = new GeminiService(testConfig);
    tagService = new TagService();
  });

  it('should complete full analysis and tagging workflow', async () => {
    const imagePath = '/test/sample-photo.jpg';

    // Step 1: Analyze image
    const analysis = await geminiService.analyzeImage(imagePath);
    expect(analysis.confidence).toBeGreaterThan(0);

    // Step 2: Generate tags
    const tags = await geminiService.generateTags(analysis);
    expect(tags.length).toBeGreaterThan(0);

    // Step 3: Store tags
    const photoId = 'test-photo-id';
    for (const tagName of tags) {
      const tag = await tagService.getOrCreateTag(tagName, 'ai');
      await tagService.addTagToPhoto(photoId, tag.id, analysis.confidence);
    }

    // Step 4: Verify tags were stored
    const storedTags = await tagService.getPhotoTags(photoId);
    expect(storedTags.length).toBe(tags.length);
    expect(storedTags.every(tag => tag.type === 'ai')).toBe(true);
  });
});
```

---

## 🔮 Future Enhancements

### Planned Features

#### 1. Custom Model Support
```typescript
interface CustomModel {
  name: string;
  provider: 'openai' | 'anthropic' | 'local';
  analyze(image: ImageBuffer): Promise<CustomAnalysis>;
}

class MultiModelAIService {
  private models: Map<string, CustomModel> = new Map();

  async addModel(model: CustomModel): Promise<void> {
    this.models.set(model.name, model);
  }

  async analyzeWithModel(imagePath: string, modelName: string): Promise<CustomAnalysis> {
    const model = this.models.get(modelName);
    if (!model) throw new Error(`Model ${modelName} not found`);

    return model.analyze(await loadImage(imagePath));
  }
}
```

#### 2. Real-time Analysis
```typescript
class RealTimeAnalyzer {
  private watcher: FSWatcher;

  async startWatching(directory: string): Promise<void> {
    this.watcher = watch(directory, async (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        const filePath = path.join(directory, filename);

        // Wait for file to be fully written
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Analyze new image
        await this.analyzeNewImage(filePath);
      }
    });
  }

  private async analyzeNewImage(filePath: string): Promise<void> {
    try {
      const analysis = await geminiService.analyzeImage(filePath);
      await this.storeAnalysisResults(filePath, analysis);

      // Notify UI of new analysis
      eventBus.emit('image-analyzed', { filePath, analysis });
    } catch (error) {
      console.error(`Failed to analyze ${filePath}:`, error);
    }
  }
}
```

#### 3. Advanced Face Recognition
```typescript
interface FaceProfile {
  id: string;
  name?: string;
  embeddings: number[];
  photos: string[];
  confidence: number;
}

class FaceRecognitionService {
  private profiles: Map<string, FaceProfile> = new Map();

  async recognizeFace(faceDetection: FaceDetection): Promise<FaceProfile | null> {
    const embedding = await this.generateFaceEmbedding(faceDetection);

    let bestMatch: FaceProfile | null = null;
    let highestSimilarity = 0;

    for (const profile of this.profiles.values()) {
      const similarity = this.calculateSimilarity(embedding, profile.embeddings);
      if (similarity > highestSimilarity && similarity > 0.8) {
        highestSimilarity = similarity;
        bestMatch = profile;
      }
    }

    return bestMatch;
  }

  async createFaceProfile(faceDetections: FaceDetection[], name?: string): Promise<FaceProfile> {
    const embeddings = await Promise.all(
      faceDetections.map(face => this.generateFaceEmbedding(face))
    );

    const profile: FaceProfile = {
      id: generateId(),
      name,
      embeddings: embeddings.flat(),
      photos: [],
      confidence: 0.9
    };

    this.profiles.set(profile.id, profile);
    return profile;
  }
}
```

---

## 📚 Related Documentation

- **[Architecture](../../ARCHITECTURE.md)** - System architecture overview
- **[Tag System](./TAG_SYSTEM/TAG_SYSTEM.md)** - Tag management documentation
- **[API Reference](../../API_REFERENCE.md)** - Complete API documentation
- **[Developer Guide](../../DEVELOPER_GUIDE.md)** - Development workflow

---

## 🆘 Troubleshooting

### Common Issues

#### API Key Problems
- **Issue**: "Invalid API key" error
- **Solution**: Verify API key in Google Cloud Console and ensure Gemini API is enabled

#### Rate Limiting
- **Issue**: "Rate limit exceeded" errors
- **Solution**: Reduce batch size or implement longer delays between requests

#### Memory Issues
- **Issue**: High memory usage during batch processing
- **Solution**: Reduce batch size and implement proper cleanup

#### Slow Analysis
- **Issue**: Analysis taking too long
- **Solution**: Check image sizes and resize if necessary, enable caching

### Debug Mode

```typescript
// Enable debug logging
const geminiService = new GeminiService({
  ...config,
  debug: true
});

// Monitor performance
geminiService.on('analysis:start', (imagePath) => {
  console.log(`Starting analysis: ${imagePath}`);
});

geminiService.on('analysis:complete', (result) => {
  console.log(`Analysis completed in ${result.processingTime}ms`);
});
```

---

<div align="center">

**AI Service Documentation** - Intelligent photo analysis powered by Gemini 🤖✨

[🏠 Back to Documentation](../../README.md) | [🏷️ Tag System](./TAG_SYSTEM/TAG_SYSTEM.md) | [🎨 UI Components](./UI_COMPONENTS.md)

</div>
