import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeImage } from "../src/features/vision/services/geminiService";

// Hoist the mock function so it can be used in vi.mock
const { mockGenerateContent } = vi.hoisted(() => {
	return { mockGenerateContent: vi.fn() };
});

vi.mock("@google/genai", () => {
	return {
		GoogleGenAI: class {
			constructor() {
				return {
					models: {
						generateContent: mockGenerateContent,
					},
				};
			}
		},
	};
});

describe("geminiService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		// Default mock response
		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify({
				description: "Test description",
				tags: [{ name: "Test Tag", confidence: 0.9 }],
			}),
		});
	});

	const mockItem = {
		id: "1",
		url: "blob:test",
		name: "test.jpg",
		type: "image/jpeg",
		file: new File([""], "test.jpg", { type: "image/jpeg" }),
		dimensions: { width: 100, height: 100 },
		dateAdded: Date.now(),
		size: 1024,
		lastModified: Date.now(),
	};

	it("should use basic gemini-3-flash-preview model", async () => {
		localStorage.setItem("gemini_api_key", "fake-key");

		await analyzeImage(mockItem);

		// Verify correct model usage: gemini-3-flash-preview
		expect(mockGenerateContent).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "gemini-3-flash-preview",
			})
		);
	});

	it("should parse valid JSON response correctly", async () => {
		localStorage.setItem("gemini_api_key", "fake-key");

		const result = await analyzeImage(mockItem);

		expect(result.description).toBe("Test description");
		expect(result.tags).toContain("Test Tag");
	});
});
