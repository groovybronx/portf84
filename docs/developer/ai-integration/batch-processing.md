# 📦 Batch Processing - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/services/geminiService.ts` et traitement par lots

---

## 📋 Vue d'Ensemble

Ce guide décrit le système de traitement par lots de Lumina Portfolio, optimisé pour analyser efficacement des centaines de photos avec l'IA tout en respectant les limites de l'API et en offrant une expérience utilisateur fluide.

---

## 🎯 Architecture du Traitement par Lots

### **Principes de Conception**

- **Rate Limiting** : Respect strict des limites de l'API (60 requêtes/minute)
- **Progress Tracking** : Suivi en temps réel de la progression
- **Error Handling** : Gestion robuste des erreurs avec retry
- **Memory Management** : Optimisation de l'utilisation mémoire
- **User Feedback** : Feedback visuel continu pendant le traitement

### **Configuration**

```typescript
// src/services/batchProcessor.ts
export interface BatchProcessorConfig {
	batchSize: number;
	maxConcurrent: number;
	retryAttempts: number;
	retryDelay: number;
	progressCallback?: (progress: number, current: number, total: number) => void;
	errorCallback?: (error: string, item: any) => void;
	successCallback?: (result: any, item: any) => void;
}

export const DEFAULT_BATCH_CONFIG: BatchProcessorConfig = {
	batchSize: 10,
	maxConcurrent: 3,
	retryAttempts: 3,
	retryDelay: 1000,
	progressCallback: (progress, current, total) => {
		console.log(`Progress: ${progress}% (${current}/${total})`);
	},
};
```

---

## 🔄 Système de Traitement par Lots

### **Batch Processor Principal**

```typescript
// src/services/batchProcessor.ts
export class BatchProcessor<T, R> {
	private config: BatchProcessorConfig;
	private geminiService: GeminiService;
	private queue: ProcessingQueue<T>;
	private results: ProcessingResults<R>;
	private isProcessing = false;

	constructor(config: BatchProcessorConfig, geminiService: GeminiService) {
		this.config = config;
		this.geminiService = geminiService;
		this.queue = new ProcessingQueue<T>();
		this.results = new ProcessingResults<R>();
	}

	// Ajouter des items à la file d'attente
	async addToQueue(items: T[]): Promise<void> {
		for (const item of items) {
			this.queue.enqueue(item);
		}
	}

	// Démarrer le traitement
	async startProcessing(): Promise<BatchProcessingResult<R>> {
		if (this.isProcessing) {
			throw new Error("Processing already in progress");
		}

		this.isProcessing = true;
		const startTime = Date.now();

		try {
			await this.processItems();

			return {
				success: true,
				results: this.results.getAll(),
				processingTime: Date.now() - startTime,
				totalProcessed: this.results.size(),
				failedCount: this.results.getFailedCount(),
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				results: this.results.getAll(),
				processingTime: Date.now() - startTime,
				totalProcessed: this.results.size(),
				failedCount: this.results.getFailedCount(),
			};
		} finally {
			this.isProcessing = false;
		}
	}

	// Traiter les items
	private async processItems(): Promise<void> {
		const totalItems = this.queue.size();
		let processedCount = 0;

		while (!this.queue.isEmpty()) {
			// Créer un batch
			const batch = this.queue.dequeueBatch(this.config.batchSize);

			// Traiter le batch en parallèle
			const batchResults = await this.processBatch(batch);

			// Ajouter les résultats
			for (const result of batchResults) {
				this.results.add(result);
			}

			processedCount += batch.length;

			// Mettre à jour la progression
			const progress = (processedCount / totalItems) * 100;
			this.config.progressCallback?.(progress, processedCount, totalItems);

			// Petite pause entre les batches pour éviter de surcharger l'API
			if (!this.queue.isEmpty()) {
				await this.delay(this.config.retryDelay);
			}
		}
	}

	// Traiter un batch d'items
	private async processBatch(batch: T[]): Promise<BatchItemResult<R>[]> {
		const promises = batch.map((item) => this.processItemWithRetry(item));

		return Promise.all(promises);
	}

	// Traiter un item avec retry
	private async processItemWithRetry(item: T): Promise<BatchItemResult<R>> {
		let lastError: Error;

		for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
			try {
				const result = await this.processItem(item);

				// Callback de succès
				this.config.successCallback?.(result, item);

				return {
					success: true,
					result,
					item,
					attempts: attempt,
				};
			} catch (error) {
				lastError = error;

				// Si c'est la dernière tentative, callback d'erreur
				if (attempt === this.config.retryAttempts) {
					this.config.errorCallback?.(error.message, item);
				}

				// Attendre avant de réessayer
				if (attempt < this.config.retryAttempts) {
					const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
					await this.delay(delay);
				}
			}
		}

		return {
			success: false,
			error: lastError.message,
			item,
			attempts: this.config.retryAttempts,
		};
	}

	// Traitement d'un item individuel
	private async processItem(item: T): Promise<R> {
		// À implémenter dans les classes dérivées
		throw new Error("processItem must be implemented in subclass");
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
```

---

## 🖼️ Traitement d'Images par Lots

### **Image Batch Processor**

```typescript
// src/services/imageBatchProcessor.ts
export class ImageBatchProcessor extends BatchProcessor<PhotoItem, AnalysisResult> {
	constructor(config: BatchProcessorConfig, geminiService: GeminiService) {
		super(config, geminiService);
	}

	// Traitement d'une image individuelle
	protected async processItem(item: PhotoItem): Promise<AnalysisResult> {
		// Convertir l'image en buffer
		const imageBuffer = await this.getImageBuffer(item);

		// Analyser avec Gemini
		const result = await this.geminiService.analyzeImage(imageBuffer, {
			temperature: 0.7,
			maxTokens: 500,
			includeColors: true,
			includeObjects: true,
			includeMood: true,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.result;
	}

	// Obtenir le buffer de l'image
	private async getImageBuffer(item: PhotoItem): Promise<ArrayBuffer> {
		if (item.file) {
			return await item.file.arrayBuffer();
		} else if (item.url) {
			const response = await fetch(item.url);
			return await response.arrayBuffer();
		} else {
			throw new Error("No image source available");
		}
	}
}
```

### **Tag Batch Processor**

```typescript
// src/services/tagBatchProcessor.ts
export class TagBatchProcessor extends BatchProcessor<string, TagGenerationResult> {
	constructor(config: BatchProcessorConfig, geminiService: GeminiService) {
		super(config, geminiService);
	}

	// Traitement d'un tag individuel
	protected async processItem(item: string): Promise<TagGenerationResult> {
		const result = await this.geminiService.generateTags(item, {
			temperature: 0.5,
			maxTokens: 100,
			maxTags: 10,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		return result.result;
	}
}
```

---

## 📊 File d'Attente et Résultats

### **File d'Attente**

```typescript
// src/services/processingQueue.ts
export class ProcessingQueue<T> {
	private items: T[] = [];
	private processing = new Set<T>();

	// Ajouter un item
	enqueue(item: T): void {
		this.items.push(item);
	}

	// Ajouter plusieurs items
	enqueueAll(items: T[]): void {
		this.items.push(...items);
	}

	// Retirer un batch
	dequeueBatch(batchSize: number): T[] {
		const batch: T[] = [];

		while (batch.length < batchSize && this.items.length > 0) {
			const item = this.items.shift();
			if (item) {
				batch.push(item);
				this.processing.add(item);
			}
		}

		return batch;
	}

	// Marquer un item comme traité
	markProcessed(item: T): void {
		this.processing.delete(item);
	}

	// Vérifier si la file est vide
	isEmpty(): boolean {
		return this.items.length === 0 && this.processing.size === 0;
	}

	// Obtenir la taille totale
	size(): number {
		return this.items.length + this.processing.size;
	}

	// Obtenir les items en cours de traitement
	getProcessingItems(): T[] {
		return Array.from(this.processing);
	}
}
```

### **Résultats de Traitement**

```typescript
// src/services/processingResults.ts
export class ProcessingResults<R> {
	private results: Map<string, BatchItemResult<R>> = new Map();

	// Ajouter un résultat
	add(result: BatchItemResult<R>): void {
		const key = this.getKey(result.item);
		this.results.set(key, result);
	}

	// Obtenir tous les résultats
	getAll(): BatchItemResult<R>[] {
		return Array.from(this.results.values());
	}

	// Obtenir les résultats réussis
	getSuccessful(): BatchItemResult<R>[] {
		return this.getAll().filter((result) => result.success);
	}

	// Obtenir les résultats échoués
	getFailed(): BatchItemResult<R>[] {
		return this.getAll().filter((result) => !result.success);
	}

	// Obtenir le nombre total
	size(): number {
		return this.results.size;
	}

	// Obtenir le nombre d'échecs
	getFailedCount(): number {
		return this.getFailed().length;
	}

	// Obtenir le nombre de succès
	getSuccessCount(): number {
		return this.getSuccessful().length;
	}

	// Obtenir le taux de succès
	getSuccessRate(): number {
		const total = this.size();
		return total > 0 ? (this.getSuccessCount() / total) * 100 : 0;
	}

	// Effacer les résultats
	clear(): void {
		this.results.clear();
	}

	private getKey(item: any): string {
		// À implémenter selon le type d'item
		return item.id || item.name || JSON.stringify(item);
	}
}
```

---

## 🎯 Types de Données

### **Types de Traitement**

```typescript
// src/shared/types/batch.ts
export interface PhotoItem {
	id: string;
	name: string;
	file?: File;
	url?: string;
	path?: string;
	metadata?: any;
}

export interface BatchItemResult<R> {
	success: boolean;
	result?: R;
	error?: string;
	item: any;
	attempts: number;
}

export interface BatchProcessingResult<R> {
	success: boolean;
	results: BatchItemResult<R>[];
	processingTime: number;
	totalProcessed: number;
	failedCount: number;
	error?: string;
}

export interface ProcessingStats {
	totalItems: number;
	processedItems: number;
	failedItems: number;
	successRate: number;
	averageProcessingTime: number;
	totalProcessingTime: number;
	errors: string[];
}
```

---

## 🎯 Hook React pour le Traitement par Lots

### **useBatchProcessing Hook**

```typescript
// src/hooks/useBatchProcessing.ts
export const useBatchProcessing = <T, R>(
	processor: BatchProcessor<T, R>,
	config: BatchProcessorConfig
) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentItem, setCurrentItem] = useState<T | null>(null);
	const [results, setResults] = useState<BatchItemResult<R>[]>([]);
	const [error, setError] = useState<string | null>(null);

	const processItems = useCallback(
		async (items: T[]) => {
			setIsProcessing(true);
			setProgress(0);
			setResults([]);
			setError(null);

			try {
				// Configurer les callbacks
				const processorConfig: BatchProcessorConfig = {
					...config,
					progressCallback: (progress, current, total) => {
						setProgress(progress);
					},
					errorCallback: (errorMsg, item) => {
						console.error(`Error processing item: ${errorMsg}`, item);
					},
					successCallback: (result, item) => {
						setCurrentItem(item);
					},
				};

				// Créer le processeur
				const batchProcessor = new BatchProcessor<T, R>(processorConfig, processor);

				// Ajouter les items à la file
				await batchProcessor.addToQueue(items);

				// Démarrer le traitement
				const processingResult = await batchProcessor.startProcessing();

				if (processingResult.success) {
					setResults(processingResult.results);
				} else {
					setError(processingResult.error || "Processing failed");
				}

				return processingResult;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsProcessing(false);
				setCurrentItem(null);
			}
		},
		[processor, config]
	);

	const reset = useCallback(() => {
		setIsProcessing(false);
		setProgress(0);
		setCurrentItem(null);
		setResults([]);
		setError(null);
	}, []);

	return {
		isProcessing,
		progress,
		currentItem,
		results,
		error,
		processItems,
		reset,
		stats: {
			total: results.length,
			successful: results.filter((r) => r.success).length,
			failed: results.filter((r) => !r.success).length,
			successRate:
				results.length > 0 ? (results.filter((r) => r.success).length / results.length) * 100 : 0,
		},
	};
};
```

---

## 🎨 Interface Utilisateur

### **Batch Processing Modal**

```typescript
// src/components/BatchProcessingModal.tsx
export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
	isOpen,
	onClose,
	items,
	processor,
	onComplete,
}) => {
	const { isProcessing, progress, currentItem, results, error, processItems, reset } =
		useBatchProcessing(processor, DEFAULT_BATCH_CONFIG);

	const handleStart = async () => {
		try {
			const result = await processItems(items);
			onComplete?.(result);
		} catch (err) {
			console.error("Batch processing failed:", err);
		}
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="lg">
			<div className="p-6">
				<h2 className="text-xl font-semibold mb-4">Analyse par Lots</h2>

				<div className="mb-4">
					<p className="text-sm text-gray-600">{items.length} photos à analyser</p>
				</div>

				{isProcessing && (
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Progression</span>
							<span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
						{currentItem && (
							<p className="text-sm text-gray-600 mt-2">Traitement de : {currentItem.name}</p>
						)}
					</div>
				)}

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				{!isProcessing && results.length > 0 && (
					<div className="mb-4">
						<h3 className="text-sm font-medium mb-2">Résultats</h3>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Succès:</span>
								<span className="text-green-600">{results.filter((r) => r.success).length}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Échecs:</span>
								<span className="text-red-600">{results.filter((r) => !r.success).length}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Taux de succès:</span>
								<span>
									{((results.filter((r) => r.success).length / results.length) * 100).toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				)}

				<div className="flex justify-end space-x-3">
					<Button variant="outline" onClick={handleClose}>
						{isProcessing ? "Annuler" : "Fermer"}
					</Button>
					{!isProcessing && results.length === 0 && (
						<Button onClick={handleStart}>Commencer l'analyse</Button>
					)}
				</div>
			</div>
		</Modal>
	);
};
```

---

## 📊 Monitoring et Statistiques

### **Batch Processing Analytics**

```typescript
// src/services/batchAnalytics.ts
export class BatchAnalytics {
	private static processingHistory: ProcessingSession[] = [];

	static recordSession(session: ProcessingSession): void {
		this.processingHistory.push(session);

		// Garder seulement les 100 dernières sessions
		if (this.processingHistory.length > 100) {
			this.processingHistory = this.processingHistory.slice(-100);
		}
	}

	static getStats(): BatchProcessingStats {
		const sessions = this.processingHistory;

		if (sessions.length === 0) {
			return {
				totalSessions: 0,
				totalItems: 0,
				averageProcessingTime: 0,
				averageSuccessRate: 0,
				totalErrors: 0,
				mostCommonErrors: [],
			};
		}

		const totalItems = sessions.reduce((sum, session) => sum + session.totalItems, 0);
		const averageProcessingTime =
			sessions.reduce((sum, session) => sum + session.processingTime, 0) / sessions.length;
		const averageSuccessRate =
			sessions.reduce((sum, session) => sum + session.successRate, 0) / sessions.length;
		const totalErrors = sessions.reduce((sum, session) => sum + session.failedCount, 0);

		// Analyser les erreurs les plus communes
		const errorCounts = new Map<string, number>();
		sessions.forEach((session) => {
			session.errors.forEach((error) => {
				const count = errorCounts.get(error) || 0;
				errorCounts.set(error, count + 1);
			});
		});

		const mostCommonErrors = Array.from(errorCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([error, count]) => ({ error, count }));

		return {
			totalSessions: sessions.length,
			totalItems,
			averageProcessingTime,
			averageSuccessRate,
			totalErrors,
			mostCommonErrors,
		};
	}

	static getRecentSessions(limit: number = 10): ProcessingSession[] {
		return this.processingHistory.slice(-limit);
	}

	static clearHistory(): void {
		this.processingHistory = [];
	}
}

interface ProcessingSession {
	id: string;
	timestamp: number;
	totalItems: number;
	processedItems: number;
	failedCount: number;
	successRate: number;
	processingTime: number;
	errors: string[];
}

interface BatchProcessingStats {
	totalSessions: number;
	totalItems: number;
	averageProcessingTime: number;
	averageSuccessRate: number;
	totalErrors: number;
	mostCommonErrors: Array<{ error: string; count: number }>;
}
```

---

## 🧪 Tests du Traitement par Lots

### **Tests Unitaires**

```typescript
// tests/batchProcessor.test.ts
describe("BatchProcessor", () => {
	let processor: BatchProcessor<string, string>;
	let mockGeminiService: jest.Mocked<GeminiService>;

	beforeEach(() => {
		mockGeminiService = {
			analyzeImage: jest.fn(),
			generateTags: jest.fn(),
		} as any;

		processor = new BatchProcessor(DEFAULT_BATCH_CONFIG, mockGeminiService);
	});

	test("should process items in batches", async () => {
		const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);

		// Simuler des réponses réussies
		mockGeminiService.analyzeImage.mockResolvedValue({
			success: true,
			result: { description: "test", tags: ["test"] },
			tokensUsed: 10,
		});

		await processor.addToQueue(items);
		const result = await processor.startProcessing();

		expect(result.success).toBe(true);
		expect(result.totalProcessed).toBe(25);
		expect(result.failedCount).toBe(0);
		expect(mockGeminiService.analyzeImage).toHaveBeenCalledTimes(25);
	});

	test("should handle errors gracefully", async () => {
		const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);

		// Simuler des erreurs pour certains items
		mockGeminiService.analyzeImage
			.mockResolvedValueOnce({
				success: true,
				result: { description: "test", tags: ["test"] },
				tokensUsed: 10,
			})
			.mockRejectedValueOnce(new Error("API Error"))
			.mockResolvedValueOnce({
				success: true,
				result: { description: "test", tags: ["test"] },
				tokensUsed: 10,
			});

		await processor.addToQueue(items);
		const result = await processor.startProcessing();

		expect(result.success).toBe(true);
		expect(result.totalProcessed).toBe(10);
		expect(result.failedCount).toBe(1);
	});

	test("should respect rate limiting", async () => {
		const items = Array.from({ length: 20 }, (_, i) => `item-${i}`);

		mockGeminiService.analyzeImage.mockResolvedValue({
			success: true,
			result: { description: "test", tags: ["test"] },
			tokensUsed: 10,
		});

		const startTime = Date.now();

		await processor.addToQueue(items);
		await processor.startProcessing();

		const endTime = Date.now();
		const duration = endTime - startTime;

		// Avec 20 items et un batch size de 10, on devrait avoir 2 batches
		// Avec un délai de 1s entre les batches, le temps total devrait être > 1s
		expect(duration).toBeGreaterThan(1000);
	});
});
```

### **Tests d'Intégration**

```typescript
// tests/integration/batchProcessing.test.ts
describe("Batch Processing Integration", () => {
	let processor: ImageBatchProcessor;
	let db: Database;

	beforeAll(async () => {
		const config = {
			apiKey: process.env.GEMINI_API_KEY,
			model: "gemini-pro",
		};
		const geminiService = new GeminiService(config);

		processor = new ImageBatchProcessor(DEFAULT_BATCH_CONFIG, geminiService);

		db = await Database.load(":memory:");
		await initializeDatabase(db);
	});

	test("should integrate with database operations", async () => {
		// Créer des photos de test
		const photos = Array.from({ length: 5 }, (_, i) => ({
			id: `photo-${i}`,
			name: `Test Photo ${i}`,
			file: new File(["test"], `photo-${i}.jpg`, { type: "image/jpeg" }),
		}));

		// Traiter les photos
		const result = await processor.processItems(photos);

		expect(result.success).toBe(true);
		expect(result.totalProcessed).toBe(5);

		// Sauvegarder les résultats dans la base de données
		for (const batchResult of result.results) {
			if (batchResult.success && batchResult.result) {
				await MetadataQueries.save(db, {
					id: batchResult.item.id,
					aiDescription: batchResult.result.description,
					aiTags: batchResult.result.tags,
					aiTagsDetailed: batchResult.result.confidence.map((c, i) => ({
						name: batchResult.result.tags[i],
						confidence: c,
					})),
				});
			}
		}

		// Vérifier que les données sont bien sauvegardées
		const saved = await MetadataQueries.getBatch(
			db,
			photos.map((p) => p.id)
		);
		expect(saved).toHaveLength(5);
		expect(saved[0].aiDescription).toBeTruthy();
		expect(saved[0].aiTags).toHaveLength(0);
	});
});
```

---

## 📚 Références

### **Documentation Technique**

- **[Gemini API Documentation](https://ai.google.dev/gemini/docs/guides/guidelines/)** : Documentation officielle
- **[Rate Limiting](https://ai.google.dev/guides/guides/rate-limiting)** : Documentation du rate limiting
- **[Error Handling](https://ai.google.dev/guides/guides/errors)** : Documentation des erreurs

### **Patterns de Traitement**

- **[Batch Processing Patterns](https://medium.com/@davidlondon/batch-processing-patterns-in-javascript-5a8c0b4c8f8a)** : Patterns de traitement par lots
- **[Queue Implementation](https://github.com/lukechilds/queue)** : Implémentation de file d'attente
- **[Promise Pooling](https://github.com/sindresorhus/p-queue)** : Pooling de promesses

### **Performance**

- **[Async/Await Best Practices](https://javascript.info/async-await)** : Meilleures pratiques async/await
- **[Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)** : Gestion mémoire
- **[Performance Monitoring](https://developer.mozilla.org/en-US/docs/Web/Performance)** : Monitoring de performance

---

## 🎯 Checklist de Traitement par Lots

### **✅ Checklist de Configuration**

- [ ] **Batch Size** : Taille de batch optimisée (10-20 items)
- [ ] **Rate Limiting** : Respect des limites de l'API
- [ ] **Retry Logic** : Retry avec backoff exponentiel
- [ ] **Timeout** : Timeout configuré pour éviter les blocages
- [ ] **Memory Management** : Gestion mémoire optimisée

### **✅ Checklist d'Interface**

- [ ] **Progress Tracking** : Suivi en temps réel de la progression
- [ ] **User Feedback** : Feedback visuel continu
- [ ] **Error Handling** : Messages d'erreur clairs
- [ ] **Cancel Option** : Possibilité d'annuler le traitement
- [ ] **Results Display** : Affichage des résultats détaillés

### **✅ Checklist de Performance**

- [ ] **Concurrent Processing** : Traitement parallèle optimisé
- [ ] **Memory Usage** : Utilisation mémoire contrôlée
- [ ] **API Efficiency** : Utilisation efficace de l'API
- [ ] **Error Recovery** : Récupération robuste des erreurs
- [ ] **Monitoring** : Monitoring des performances

---

## 🎯 Patterns Émergents

### **Future Features**

- **Smart Batching** : Batching intelligent basé sur la taille des images
- **Priority Queue** : File d'attente avec priorités
- **Distributed Processing** : Traitement distribué
- **AI-Enhanced Batching** : Batching optimisé par l'IA

### **Évolutions Techniques**

- **Web Workers** : Traitement en arrière-plan
- **Service Workers** : Traitement hors ligne
- **Streaming** : Streaming des résultats
- **Caching** : Cache des résultats de traitement

---

**Le système de traitement par lots de Lumina Portfolio offre une analyse IA efficace et scalable ! 📦**
