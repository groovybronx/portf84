# 🏷️ Tag Analysis - Lumina Portfolio

**Dernière mise à jour** : 10 janvier 2026
**Basé sur** : `src/services/geminiService.ts` et analyse de tags

---

## 📋 Vue d'Ensemble

Ce guide décrit le système d'analyse de tags de Lumina Portfolio, qui utilise l'IA pour analyser, regrouper, fusionner et optimiser les tags générés automatiquement pour une organisation efficace des photos.

---

## 🎯 Architecture de l'Analyse de Tags

### **Principes de Conception**

- **Similarity Detection** : Détection automatique de tags similaires
- **Smart Merging** : Fusion intelligente basée sur la confiance
- **Category Analysis** : Classification des tags par catégories
- **Usage Analytics** : Analyse de l'utilisation des tags
- **Performance Optimization** : Optimisation pour des milliers de tags

### **Configuration**

```typescript
// src/services/tagAnalysis.ts
export interface TagAnalysisConfig {
	similarityThreshold: number;
	minConfidence: number;
	maxTagsPerCategory: number;
	enableAutoMerge: boolean;
	enableCategoryAnalysis: boolean;
	batchSize: number;
	retryAttempts: number;
}

export const DEFAULT_TAG_ANALYSIS_CONFIG: TagAnalysisConfig = {
	similarityThreshold: 0.8,
	minConfidence: 0.5,
	maxTagsPerCategory: 50,
	enableAutoMerge: true,
	enableCategoryAnalysis: true,
	batchSize: 20,
	retryAttempts: 3,
};
```

---

## 🏷️ Service d'Analyse de Tags

### **Tag Analysis Service**

```typescript
// src/services/tagAnalysisService.ts
export class TagAnalysisService {
	private config: TagAnalysisConfig;
	private geminiService: GeminiService;
	private tagCache: Map<string, TagAnalysisResult>;

	constructor(config: TagAnalysisConfig, geminiService: GeminiService) {
		this.config = config;
		this.geminiService = geminiService;
		this.tagCache = new Map();
	}

	// Analyser la similarité entre tags
	async analyzeSimilarity(tags: string[]): Promise<TagSimilarityAnalysis> {
		const timer = PerformanceMonitor.startTimer("tag-similarity-analysis");

		try {
			const similarities: TagSimilarity[] = [];

			// Analyser toutes les paires de tags
			for (let i = 0; i < tags.length; i++) {
				for (let j = i + 1; j < tags.length; j++) {
					const tag1 = tags[i];
					const tag2 = tags[j];

					// Vérifier le cache
					const cacheKey = `${tag1}-${tag2}`;
					let similarity = this.tagCache.get(cacheKey);

					if (!similarity) {
						// Analyser avec Gemini
						const result = await this.geminiService.analyzeTagSimilarity(tag1, tag2);

						if (result.success) {
							similarity = {
								tag1,
								tag2,
								similarity: result.result.similarity,
								explanation: result.result.explanation,
								confidence: 0.8,
							};

							// Mettre en cache
							this.tagCache.set(cacheKey, similarity);
						}
					}

					if (similarity && similarity.similarity >= this.config.similarityThreshold) {
						similarities.push(similarity);
					}
				}
			}

			timer();

			return {
				success: true,
				similarities,
				totalPairs: (tags.length * (tags.length - 1)) / 2,
				analyzedPairs: similarities.length,
				processingTime: timer.getDuration(),
			};
		} catch (error) {
			timer();

			return {
				success: false,
				error: error.message,
				similarities: [],
				totalPairs: 0,
				analyzedPairs: 0,
				processingTime: timer.getDuration(),
			};
		}
	}

	// Analyser les catégories de tags
	async analyzeCategories(tags: string[]): Promise<TagCategoryAnalysis> {
		const timer = PerformanceMonitor.startTimer("tag-category-analysis");

		try {
			const categories: TagCategory[] = [];

			// Analyser les tags par lots
			for (let i = 0; i < tags.length; i += this.config.batchSize) {
				const batch = tags.slice(i, i + this.config.batchSize);

				const categoryResult = await this.analyzeBatchCategories(batch);

				if (categoryResult.success) {
					categories.push(...categoryResult.categories);
				}
			}

			// Grouper par catégorie
			const groupedCategories = this.groupCategories(categories);

			timer();

			return {
				success: true,
				categories: groupedCategories,
				totalTags: tags.length,
				processingTime: timer.getDuration(),
			};
		} catch (error) {
			timer();

			return {
				success: false,
				error: error.message,
				categories: [],
				totalTags: tags.length,
				processingTime: timer.getDuration(),
			};
		}
	}

	// Analyser les catégories d'un batch
	private async analyzeBatchCategories(tags: string[]): Promise<BatchCategoryResult> {
		const prompt = `Analyze these tags and categorize them: ${tags.join(", ")}.
    Return categories like: nature, people, places, objects, emotions, colors, etc.
    Format: {"categories": [{"tag": "tag_name", "category": "category_name", "confidence": 0.9}]}`;

		const result = await this.geminiService.generateTags(prompt, {
			temperature: 0.3,
			maxTokens: 500,
		});

		if (!result.success) {
			return {
				success: false,
				error: result.error,
				categories: [],
			};
		}

		// Parser la réponse
		const categories = this.parseCategoryResponse(result.result.tags);

		return {
			success: true,
			categories,
		};
	}

	// Parser la réponse de catégorie
	private parseCategoryResponse(tags: string[]): TagCategory[] {
		const categories: TagCategory[] = [];

		// Logique de parsing simple - à améliorer selon la réponse réelle
		for (const tag of tags) {
			const category = this.inferCategory(tag);
			categories.push({
				tag,
				category,
				confidence: 0.7,
			});
		}

		return categories;
	}

	// Inférer la catégorie d'un tag
	private inferCategory(tag: string): string {
		const lowerTag = tag.toLowerCase();

		// Catégories prédéfinies
		const categories = {
			nature: [
				"tree",
				"flower",
				"sky",
				"water",
				"mountain",
				"forest",
				"beach",
				"ocean",
				"sun",
				"cloud",
			],
			people: ["person", "people", "man", "woman", "child", "family", "friend", "group", "crowd"],
			places: [
				"city",
				"building",
				"street",
				"house",
				"home",
				"office",
				"restaurant",
				"park",
				"museum",
			],
			objects: ["car", "phone", "computer", "book", "chair", "table", "camera", "bottle", "food"],
			emotions: ["happy", "sad", "angry", "excited", "calm", "peaceful", "energetic", "romantic"],
			colors: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white"],
			time: ["morning", "afternoon", "evening", "night", "dawn", "dusk", "sunset", "sunrise"],
			weather: ["sunny", "rainy", "cloudy", "snowy", "windy", "stormy", "clear", "foggy"],
		};

		// Trouver la catégorie correspondante
		for (const [category, keywords] of Object.entries(categories)) {
			if (keywords.some((keyword) => lowerTag.includes(keyword))) {
				return category;
			}
		}

		return "general";
	}

	// Grouper les catégories
	private groupCategories(categories: TagCategory[]): Map<string, TagCategory[]> {
		const grouped = new Map<string, TagCategory[]>();

		for (const category of categories) {
			if (!grouped.has(category.category)) {
				grouped.set(category.category, []);
			}
			grouped.get(category.category)!.push(category);
		}

		return grouped;
	}

	// Optimiser les tags
	async optimizeTags(tags: string[]): Promise<TagOptimizationResult> {
		const timer = PerformanceMonitor.startTimer("tag-optimization");

		try {
			// 1. Analyser la similarité
			const similarityAnalysis = await this.analyzeSimilarity(tags);

			// 2. Analyser les catégories
			const categoryAnalysis = await this.analyzeCategories(tags);

			// 3. Générer les recommandations
			const recommendations = this.generateRecommendations(similarityAnalysis, categoryAnalysis);

			timer();

			return {
				success: true,
				similarities: similarityAnalysis.similarities,
				categories: categoryAnalysis.categories,
				recommendations,
				processingTime: timer.getDuration(),
			};
		} catch (error) {
			timer();

			return {
				success: false,
				error: error.message,
				similarities: [],
				categories: new Map(),
				recommendations: [],
				processingTime: timer.getDuration(),
			};
		}
	}

	// Générer les recommandations
	private generateRecommendations(
		similarityAnalysis: TagSimilarityAnalysis,
		categoryAnalysis: TagCategoryAnalysis
	): TagRecommendation[] {
		const recommendations: TagRecommendation[] = [];

		// Recommandations de fusion
		for (const similarity of similarityAnalysis.similarities) {
			if (similarity.similarity >= this.config.similarityThreshold) {
				recommendations.push({
					type: "merge",
					tag1: similarity.tag1,
					tag2: similarity.tag2,
					confidence: similarity.similarity,
					reason: `Similarity: ${similarity.explanation}`,
					action: "merge",
				});
			}
		}

		// Recommandations de catégorie
		for (const [category, tags] of categoryAnalysis.categories) {
			if (tags.length > this.config.maxTagsPerCategory) {
				recommendations.push({
					type: "category_cleanup",
					category,
					tags: tags.map((t) => t.tag),
					confidence: 0.8,
					reason: `Too many tags in category ${category}`,
					action: "cleanup",
				});
			}
		}

		return recommendations;
	}
}
```

---

## 📊 Types de Données

### **Types d'Analyse**

```typescript
// src/shared/types/tagAnalysis.ts
export interface TagSimilarity {
	tag1: string;
	tag2: string;
	similarity: number;
	explanation: string;
	confidence: number;
}

export interface TagSimilarityAnalysis {
	success: boolean;
	similarities: TagSimilarity[];
	totalPairs: number;
	analyzedPairs: number;
	processingTime: number;
	error?: string;
}

export interface TagCategory {
	tag: string;
	category: string;
	confidence: number;
}

export interface TagCategoryAnalysis {
	success: boolean;
	categories: Map<string, TagCategory[]>;
	totalTags: number;
	processingTime: number;
	error?: string;
}

export interface TagRecommendation {
	type: "merge" | "cleanup" | "category_cleanup" | "remove";
	tag1?: string;
	tag2?: string;
	category?: string;
	tags?: string[];
	confidence: number;
	reason: string;
	action: string;
}

export interface TagOptimizationResult {
	success: boolean;
	similarities: TagSimilarity[];
	categories: Map<string, TagCategory[]>;
	recommendations: TagRecommendation[];
	processingTime: number;
	error?: string;
}

export interface BatchCategoryResult {
	success: boolean;
	categories: TagCategory[];
	error?: string;
}
```

---

## 🔄 Système de Fusion de Tags

### **Tag Merger**

```typescript
// src/services/tagMerger.ts
export class TagMerger {
	private db: Database;
	private config: TagAnalysisConfig;

	constructor(db: Database, config: TagAnalysisConfig) {
		this.db = db;
		this.config = config;
	}

	// Fusionner des tags similaires
	async mergeSimilarTags(threshold: number = 0.8): Promise<TagMergeResult> {
		const timer = PerformanceMonitor.startTimer("tag-merge-similar");

		try {
			// 1. Récupérer tous les tags
			const tags = await TagQueries.getAll(this.db);

			// 2. Analyser la similarité
			const tagNames = tags.map((t) => t.name);
			const similarityAnalysis = await this.analyzeTagSimilarities(tagNames);

			// 3. Identifier les paires à fusionner
			const mergePairs = similarityAnalysis.similarities.filter((s) => s.similarity >= threshold);

			// 4. Exécuter les fusions
			const mergeResults = await this.executeMerges(mergePairs);

			timer();

			return {
				success: true,
				mergedPairs: mergePairs,
				mergeResults,
				processingTime: timer.getDuration(),
			};
		} catch (error) {
			timer();

			return {
				success: false,
				error: error.message,
				mergedPairs: [],
				mergeResults: [],
				processingTime: timer.getDuration(),
			};
		}
	}

	// Analyser les similarités de tags
	private async analyzeTagSimilarities(tags: string[]): Promise<TagSimilarityAnalysis> {
		const similarities: TagSimilarity[] = [];

		// Analyser toutes les paires
		for (let i = 0; i < tags.length; i++) {
			for (let j = i + 1; j < tags.length; j++) {
				const tag1 = tags[i];
				const tag2 = tags[j];

				// Utiliser une heuristique simple pour la similarité
				const similarity = this.calculateSimilarity(tag1, tag2);

				if (similarity >= this.config.similarityThreshold) {
					similarities.push({
						tag1,
						tag2,
						similarity,
						explanation: this.generateSimilarityExplanation(tag1, tag2, similarity),
						confidence: similarity,
					});
				}
			}
		}

		return {
			success: true,
			similarities,
			totalPairs: (tags.length * (tags.length - 1)) / 2,
			analyzedPairs: similarities.length,
			processingTime: 0,
		};
	}

	// Calculer la similarité entre deux tags
	private calculateSimilarity(tag1: string, tag2: string): number {
		const lower1 = tag1.toLowerCase();
		const lower2 = tag2.toLowerCase();

		// Similarité exacte
		if (lower1 === lower2) {
			return 1.0;
		}

		// Similarité de préfixe
		if (lower1.startsWith(lower2) || lower2.startsWith(lower1)) {
			return 0.9;
		}

		// Similarité de sous-chaîne
		if (lower1.includes(lower2) || lower2.includes(lower1)) {
			return 0.8;
		}

		// Similarité Levenshtein
		const distance = this.levenshteinDistance(lower1, lower2);
		const maxLength = Math.max(lower1.length, lower2.length);
		const similarity = 1 - distance / maxLength;

		return similarity;
	}

	// Distance de Levenshtein
	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) {
			matrix[0][i] = i;
		}

		for (let j = 0; j <= str2.length; j++) {
			matrix[j][0] = j;
		}

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1,
					matrix[j - 1][i] + 1,
					matrix[j - 1][i - 1] + indicator
				);
			}
		}

		return matrix[str2.length][str1.length];
	}

	// Générer l'explication de similarité
	private generateSimilarityExplanation(tag1: string, tag2: string, similarity: number): string {
		if (similarity >= 0.9) {
			return "Very similar - likely the same concept";
		} else if (similarity >= 0.7) {
			return "Similar - related concepts";
		} else if (similarity >= 0.5) {
			return "Somewhat similar - related but distinct";
		} else {
			return "Not similar - different concepts";
		}
	}

	// Exécuter les fusions
	private async executeMerges(mergePairs: TagSimilarity[]): Promise<TagMergeExecution[]> {
		const results: TagMergeExecution[] = [];

		for (const pair of mergePairs) {
			try {
				const result = await this.mergeTagPair(pair.tag1, pair.tag2);
				results.push(result);
			} catch (error) {
				results.push({
					success: false,
					tag1: pair.tag1,
					tag2: pair.tag2,
					error: error.message,
				});
			}
		}

		return results;
	}

	// Fusionner une paire de tags
	private async mergeTagPair(tag1: string, tag2: string): Promise<TagMergeExecution> {
		// Trouver les tags dans la base de données
		const tag1Record = await this.findTagByName(tag1);
		const tag2Record = await this.findTagByName(tag2);

		if (!tag1Record || !tag2Record) {
			throw new Error("One or both tags not found");
		}

		// Déterminer le tag cible (le plus utilisé)
		const targetTag = await this.determineTargetTag(tag1Record.id, tag2Record.id);
		const sourceTag = targetTag === tag1Record.id ? tag2Record.id : tag1Record.id;

		// Déplacer tous les items du tag source vers le tag cible
		await this.moveItemsToTag(sourceTag, targetTag);

		// Supprimer le tag source
		await TagQueries.delete(this.db, sourceTag);

		return {
			success: true,
			tag1,
			tag2,
			targetTag: targetTag === tag1Record.id ? tag1 : tag2,
			sourceTag: sourceTag === tag1Record.id ? tag1 : tag2,
		};
	}

	// Trouver un tag par son nom
	private async findTagByName(name: string): Promise<ParsedTag | null> {
		const result = await this.db.select(
			"SELECT id, name, type, confidence, parentId, createdAt FROM tags WHERE name = ?",
			[name]
		);

		return result.length > 0 ? result[0] : null;
	}

	// Déterminer le tag cible
	private async determineTargetTag(tag1Id: string, tag2Id: string): Promise<string> {
		// Compter le nombre d'items pour chaque tag
		const count1 = await this.getTagItemCount(tag1Id);
		const count2 = await this.getTagItemCount(tag2Id);

		return count1 >= count2 ? tag1Id : tag2Id;
	}

	// Compter le nombre d'items pour un tag
	private async getTagItemCount(tagId: string): Promise<number> {
		const result = await this.db.select("SELECT COUNT(*) as count FROM item_tags WHERE tagId = ?", [
			tagId,
		]);

		return result[0].count;
	}

	// Déplacer les items vers le tag cible
	private async moveItemsToTag(sourceTagId: string, targetTagId: string): Promise<void> {
		await this.db.execute("UPDATE item_tags SET tagId = ? WHERE tagId = ?", [
			targetTagId,
			sourceTagId,
		]);
	}
}
```

---

## 📊 Types de Fusion

### **Types de Fusion**

```typescript
// src/shared/types/tagMerge.ts
export interface TagMergeResult {
	success: boolean;
	mergedPairs: TagSimilarity[];
	mergeResults: TagMergeExecution[];
	processingTime: number;
	error?: string;
}

export interface TagMergeExecution {
	success: boolean;
	tag1: string;
	tag2: string;
	targetTag?: string;
	sourceTag?: string;
	error?: string;
}

export interface TagMergeConfig {
	autoMerge: boolean;
	similarityThreshold: number;
	minUsageCount: number;
	preserveOriginal: boolean;
	createAlias: boolean;
}
```

---

## 🎯 Hook React pour l'Analyse de Tags

### **useTagAnalysis Hook**

```typescript
// src/hooks/useTagAnalysis.ts
export const useTagAnalysis = (config: TagAnalysisConfig, geminiService: GeminiService) => {
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [results, setResults] = useState<TagOptimizationResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const analyzeTags = useCallback(
		async (tags: string[]) => {
			setIsAnalyzing(true);
			setProgress(0);
			setError(null);

			try {
				const analysisService = new TagAnalysisService(config, geminiService);

				const result = await analysisService.optimizeTags(tags);

				setResults(result);
				return result;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsAnalyzing(false);
				setProgress(100);
			}
		},
		[config, geminiService]
	);

	const mergeSimilarTags = useCallback(
		async (threshold: number = 0.8) => {
			setIsAnalyzing(true);
			setError(null);

			try {
				const merger = new TagMerger(db, config);

				const result = await merger.mergeSimilarTags(threshold);

				return result;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsAnalyzing(false);
			}
		},
		[config]
	);

	const reset = useCallback(() => {
		setIsAnalyzing(false);
		setProgress(0);
		setResults(null);
		setError(null);
	}, []);

	return {
		isAnalyzing,
		progress,
		results,
		error,
		analyzeTags,
		mergeSimilarTags,
		reset,
	};
};
```

---

## 🎨 Interface Utilisateur

### **Tag Analysis Modal**

```typescript
// src/components/TagAnalysisModal.tsx
export const TagAnalysisModal: React.FC<TagAnalysisModalProps> = ({
	isOpen,
	onClose,
	tags,
	onComplete,
}) => {
	const { isAnalyzing, progress, results, error, analyzeTags, reset } = useTagAnalysis(
		DEFAULT_TAG_ANALYSIS_CONFIG,
		geminiService
	);

	const handleAnalyze = async () => {
		try {
			const result = await analyzeTags(tags);
			onComplete?.(result);
		} catch (err) {
			console.error("Tag analysis failed:", err);
		}
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="lg">
			<div className="p-6">
				<h2 className="text-xl font-semibold mb-4">Analyse de Tags</h2>

				<div className="mb-4">
					<p className="text-sm text-gray-600">{tags.length} tags à analyser</p>
				</div>

				{isAnalyzing && (
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Analyse en cours...</span>
							<span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				{results && !isAnalyzing && (
					<div className="mb-4">
						<h3 className="text-sm font-medium mb-2">Résultats de l'Analyse</h3>

						<div className="space-y-4">
							{/* Similarités */}
							<div>
								<h4 className="text-sm font-medium text-gray-700">Tags Similaires</h4>
								<div className="mt-1 space-y-1">
									{results.similarities.slice(0, 5).map((similarity, index) => (
										<div key={index} className="flex justify-between text-sm">
											<span>
												{similarity.tag1} ↔ {similarity.tag2}
											</span>
											<span className="text-gray-600">
												{(similarity.similarity * 100).toFixed(1)}%
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Catégories */}
							<div>
								<h4 className="text-sm font-medium text-gray-700">Catégories</h4>
								<div className="mt-1 space-y-1">
									{Array.from(results.categories.entries()).map(([category, tags]) => (
										<div key={category} className="flex justify-between text-sm">
											<span>{category}</span>
											<span className="text-gray-600">{tags.length} tags</span>
										</div>
									))}
								</div>
							</div>

							{/* Recommandations */}
							<div>
								<h4 className="text-sm font-medium text-gray-700">Recommandations</h4>
								<div className="mt-1 space-y-1">
									{results.recommendations.slice(0, 5).map((rec, index) => (
										<div key={index} className="text-sm">
											<span className="font-medium">{rec.type}:</span> {rec.reason}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="flex justify-end space-x-3">
					<Button variant="outline" onClick={handleClose}>
						{isAnalyzing ? "Annuler" : "Fermer"}
					</Button>
					{!isAnalyzing && !results && <Button onClick={handleAnalyze}>Analyser les tags</Button>}
				</div>
			</div>
		</Modal>
	);
};
```

---

## 🧪 Tests de l'Analyse de Tags

### **Tests Unitaires**

```typescript
// tests/tagAnalysis.test.ts
describe("TagAnalysisService", () => {
	let tagAnalysisService: TagAnalysisService;
	let mockGeminiService: jest.Mocked<GeminiService>;

	beforeEach(() => {
		mockGeminiService = {
			analyzeTagSimilarity: jest.fn(),
			generateTags: jest.fn(),
		} as any;

		tagAnalysisService = new TagAnalysisService(DEFAULT_TAG_ANALYSIS_CONFIG, mockGeminiService);
	});

	test("should analyze tag similarity", async () => {
		const tags = ["nature", "natural", "tree", "forest"];

		mockGeminiService.analyzeTagSimilarity.mockResolvedValue({
			success: true,
			result: { similarity: 0.9, explanation: "Very similar" },
			tokensUsed: 5,
		});

		const result = await tagAnalysisService.analyzeSimilarity(tags);

		expect(result.success).toBe(true);
		expect(result.similarities).toHaveLength(6); // 4C2 = 6 paires
		expect(mockGeminiService.analyzeTagSimilarity).toHaveBeenCalledTimes(6);
	});

	test("should analyze tag categories", async () => {
		const tags = ["tree", "flower", "car", "house"];

		mockGeminiService.generateTags.mockResolvedValue({
			success: true,
			result: { tags: ["nature", "nature", "places", "places"], confidence: [0.8, 0.8, 0.7, 0.7] },
			tokensUsed: 10,
		});

		const result = await tagAnalysisService.analyzeCategories(tags);

		expect(result.success).toBe(true);
		expect(result.categories.size).toBeGreaterThan(0);
		expect(mockGeminiService.generateTags).toHaveBeenCalledTimes(1);
	});

	test("should optimize tags", async () => {
		const tags = ["nature", "natural", "tree", "forest"];

		mockGeminiService.analyzeTagSimilarity.mockResolvedValue({
			success: true,
			result: { similarity: 0.9, explanation: "Very similar" },
			tokensUsed: 5,
		});

		mockGeminiService.generateTags.mockResolvedValue({
			success: true,
			result: { tags: ["nature", "nature", "nature", "nature"], confidence: [0.8, 0.8, 0.8, 0.8] },
			tokensUsed: 10,
		});

		const result = await tagAnalysisService.optimizeTags(tags);

		expect(result.success).toBe(true);
		expect(result.similarities).toHaveLength(6);
		expect(result.categories.size).toBeGreaterThan(0);
		expect(result.recommendations.length).toBeGreaterThan(0);
	});
});
```

### **Tests d'Intégration**

```typescript
// tests/integration/tagAnalysis.test.ts
describe("Tag Analysis Integration", () => {
	let tagAnalysisService: TagAnalysisService;
	let db: Database;

	beforeAll(async () => {
		const config = {
			apiKey: process.env.GEMINI_API_KEY,
			model: "gemini-pro",
		};
		const geminiService = new GeminiService(config);

		tagAnalysisService = new TagAnalysisService(DEFAULT_TAG_ANALYSIS_CONFIG, geminiService);

		db = await Database.load(":memory:");
		await initializeDatabase(db);
	});

	test("should integrate with database operations", async () => {
		// Créer des tags de test
		const tags = ["nature", "natural", "tree", "forest", "car", "vehicle"];

		// Insérer les tags dans la base de données
		for (const tagName of tags) {
			await TagQueries.create(db, {
				id: `tag-${tagName}`,
				name: tagName,
				type: "ai",
				confidence: 0.8,
			});
		}

		// Analyser les tags
		const result = await tagAnalysisService.optimizeTags(tags);

		expect(result.success).toBe(true);
		expect(result.similarities.length).toBeGreaterThan(0);
		expect(result.categories.size).toBeGreaterThan(0);
		expect(result.recommendations.length).toBeGreaterThan(0);

		// Vérifier que les recommandations sont pertinentes
		const mergeRecommendations = result.recommendations.filter((r) => r.type === "merge");
		expect(mergeRecommendations.length).toBeGreaterThan(0);
	});
});
```

---

## 📚 Références

### **Documentation Technique**

- **[Gemini API Documentation](https://ai.google.dev/gemini/docs/guides/guidelines/)** : Documentation officielle
- **[Tag Analysis Algorithms](https://en.wikipedia.org/wiki/Tag_analysis)** : Algorithmes d'analyse de tags
- **[Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)** : Distance de Levenshtein

### **Patterns d'Analyse**

- **[Similarity Detection](https://medium.com/@davidlondon/similarity-detection-algorithms-5a6a8e3b5a6a)** : Algorithmes de similarité
- **[Category Classification](https://en.wikipedia.org/wiki/Text_classification)** : Classification de texte
- **[Tag Optimization](https://www.researchgate.net/publication/Tag_optimization_algorithms)** : Optimisation de tags

### **Performance**

- **[Caching Strategies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)** : Stratégies de cache
- **[Batch Processing](https://medium.com/@davidlondon/batch-processing-patterns-in-javascript-5a8c0b4c8f8a)** : Patterns de traitement par lots
- **[Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)** : Gestion mémoire

---

## 🎯 Checklist d'Analyse de Tags

### **✅ Checklist d'Analyse**

- [ ] **Similarity Detection** : Détection de similarité robuste
- [ ] **Category Analysis** : Classification automatique des tags
- [ ] **Performance** : Optimisation pour des milliers de tags
- [ ] **Caching** : Cache des résultats d'analyse
- [ ] **Error Handling** : Gestion robuste des erreurs

### **✅ Checklist de Fusion**

- [ ] **Smart Merging** : Fusion intelligente basée sur l'utilisation
- [ ] **Data Integrity** : Préservation de l'intégrité des données
- [ ] **Rollback** : Possibilité d'annuler les fusions
- [ ] **Logging** : Logs détaillés des opérations
- [ ] **Testing** : Tests complets des opérations

### **✅ Checklist d'Interface**

- [ ] **Progress Feedback** : Feedback continu pendant l'analyse
- [ ] **Results Display** : Affichage clair des résultats
- [ ] **Recommendations** : Recommandations actionnables
- [ ] **Error Messages** : Messages d'erreur clairs
- [ ] **User Control** : Contrôle utilisateur sur les actions

---

## 🎯 Patterns Émergents

### **Future Features**

- **AI-Enhanced Similarity** : Similarité améliorée par l'IA
- **Context-Aware Analysis** : Analyse basée sur le contexte
- **Multi-Language Support** : Support multilingue
- **Real-time Analysis** : Analyse en temps réel

### **Évolutions Techniques**

- **Machine Learning** : Modèles ML pour la similarité
- **Graph Analysis** : Analyse de graphes de tags
- **Semantic Analysis** : Analyse sémantique
- **Knowledge Graph** : Graphe de connaissances

---

**Le système d'analyse de tags de Lumina Portfolio offre une organisation intelligente et automatique de vos tags ! 🏷️**
