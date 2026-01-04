import { GoogleGenAI } from "@google/genai";
import {
	ANALYZE_IMAGE_PROMPT,
	ANALYZE_IMAGE_PROMPT_WITH_THINKING,
	VISION_MODEL_ID,
} from "../vision.config";
import { PortfolioItem, AiTagDetailed } from "../../../shared/types";
import { STORAGE_KEYS } from "../../../shared/constants";
import i18next from "i18next";

// Helper to convert File/Blob to Base64 (Standard implementation)
const processFileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			// Result is "data:image/jpeg;base64,..."
			// We want just the base64 part
			let encoded = reader.result?.toString().replace(/^data:(.*,)?/, "");
			if (encoded) {
				// Fix padding if necessary (though usually FileReader is correct)
				const pad = encoded.length % 4;
				if (pad > 0) {
					encoded += "=".repeat(4 - pad);
				}
			}
			resolve(encoded || "");
		};
		reader.onerror = (error) => reject(error);
	});
};

export class GeminiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "GeminiError";
  }
}

export class ApiKeyError extends GeminiError {
  constructor() {
    super(i18next.t('errors:missingApiKey'), "MISSING_API_KEY");
    this.name = "ApiKeyError";
  }
}

export class NetworkError extends GeminiError {
  constructor(originalError: any) {
    super(i18next.t('errors:networkFailed'), "NETWORK_ERROR");
    this.name = "NetworkError";
    this.cause = originalError;
  }
}

import { secureStorage } from "../../../services/secureStorage";

const getApiKey = async (): Promise<string> => {
	// First try secure storage (App Data DB/File)
	const secureKey = await secureStorage.getApiKey();
	if (secureKey) return secureKey;

	// Fallback to localStorage (Legacy/Dev)
	const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
	if (storedKey) return storedKey;

	// Note: standard Vite env access
	// @ts-ignore
	if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
		// @ts-ignore
		return import.meta.env.VITE_GEMINI_API_KEY;
	}
	// Fallback for process.env (legacy/shim)
	if (typeof process !== "undefined" && process.env.GEMINI_API_KEY) {
		return process.env.GEMINI_API_KEY;
	}
	// Also check the specific define we set in vite.config
	if (typeof process !== "undefined" && process.env.API_KEY) {
		return process.env.API_KEY;
	}

	throw new ApiKeyError();
};

export const analyzeImage = async (
	item: PortfolioItem
): Promise<{
	description: string;
	tags: string[];
	tagsDetailed: AiTagDetailed[];
}> => {
	const apiKey = await getApiKey();

	if (!item.file && !item.url) {
		throw new Error(i18next.t('errors:fileUrlMissing'));
	}

	try {
		const ai = new GoogleGenAI({ apiKey });
		let base64Data = "";

		if (item.file) {
			base64Data = await processFileToBase64(item.file);
		} else if (item.url) {
			try {
				const response = await fetch(item.url);
				const blob = await response.blob();
				const file = new File([blob], item.name, { type: item.type });
				base64Data = await processFileToBase64(file);
			} catch (err) {
				console.error("Failed to fetch image from URL:", err);
				throw new Error(i18next.t('errors:failedToLoadImage'));
			}
		}

		// Using Gemini 3 Flash Preview as requested
		const modelId = VISION_MODEL_ID;

		const response = await ai.models.generateContent({
			model: modelId,
			contents: [
				{
					role: "user",
					parts: [
						{
							inlineData: {
								mimeType: item.type,
								data: base64Data,
							},
						},
						{
							text: ANALYZE_IMAGE_PROMPT,
						},
					],
				},
			],
			config: {
				responseMimeType: "application/json",
			},
		});

		const text = response.text;
		if (!text) {
			throw new Error(i18next.t('errors:emptyAiResponse'));
		}

		const json = JSON.parse(text);

		// Normalize response
		const tagsDetailed: AiTagDetailed[] = (json.tags || []).map((t: any) => ({
			name: t.name || String(t),
			confidence: typeof t.confidence === "number" ? t.confidence : 1.0,
		}));
		const tags = tagsDetailed.map((t) => t.name);

		return {
			description: json.description || i18next.t('errors:noDescriptionGenerated'),
			tags,
			tagsDetailed,
		};
	} catch (error: any) {
		console.error("Gemini Analysis Error:", error);
		if (error instanceof GeminiError) throw error;
		
		if (error.message?.includes("API key")) {
			throw new ApiKeyError();
		}
		if (error.message?.includes("network") || error.message?.includes("fetch")) {
			throw new NetworkError(error);
		}
		throw new GeminiError(error.message || i18next.t('errors:unknownAnalysisError'), "UNKNOWN_ERROR");
	}
};

export const analyzeImageStream = async (
	item: PortfolioItem,
	onThinking: (text: string) => void,
	enableThinking: boolean = false
): Promise<{
	description: string;
	tags: string[];
	tagsDetailed: AiTagDetailed[];
}> => {
	const apiKey = await getApiKey();

	if (!item.file && !item.url) {
		throw new Error(i18next.t('errors:fileUrlMissing'));
	}

	try {
		const ai = new GoogleGenAI({ apiKey });
		let base64Data = "";

		if (item.file) {
			base64Data = await processFileToBase64(item.file);
		} else if (item.url) {
			// Fallback: Fetch blob from local asset URL
			try {
				const response = await fetch(item.url);
				const blob = await response.blob();
				const file = new File([blob], item.name, { type: item.type });
				base64Data = await processFileToBase64(file);
			} catch (err) {
				console.error("Failed to fetch image from URL:", err);
				throw new Error(i18next.t('errors:failedToLoadImage'));
			}
		}
		const modelId = VISION_MODEL_ID;

		// Prompt engineering for optional Thinking Process
		let prompt = ANALYZE_IMAGE_PROMPT;

		if (enableThinking) {
			prompt = ANALYZE_IMAGE_PROMPT_WITH_THINKING;
		}

		const result = await ai.models.generateContentStream({
			model: modelId,
			contents: [
				{
					role: "user",
					parts: [
						{
							inlineData: {
								mimeType: item.type,
								data: base64Data,
							},
						},
						{ text: prompt },
					],
				},
			],
			config: {
				// When thinking is enabled, we need standard text response to stream the thinking part first
				// We will parse the JSON manually from the second part
				responseMimeType: enableThinking ? "text/plain" : "application/json",
			},
		});

		let fullText = "";
		let thinkingText = "";

		for await (const chunk of result) {
			const chunkText = (chunk.text as string) || "";
			fullText += chunkText;

			if (enableThinking) {
				// Stream thinking part only (before separator)
				const parts = fullText.split("---JSON---");
				if (parts.length === 1) {
					// Still thinking
					thinkingText = parts[0] || "";
					onThinking(thinkingText);
				}
			}
		}

		// Extract JSON
		let jsonString = fullText;
		if (enableThinking) {
			const parts = fullText.split("---JSON---");
			if (parts.length < 2) {
				// Fallback: try to find the start of JSON
				const jsonStart = fullText.indexOf("{");
				if (jsonStart !== -1) {
					jsonString = fullText.substring(jsonStart);
				} else {
					throw new Error(i18next.t('errors:noJsonFound'));
				}
			} else {
				jsonString = parts[1] || "";
			}
		}

		// Clean up potential markdown code blocks if the model adds them despite MIME type
		jsonString = jsonString
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const json = JSON.parse(jsonString);

		const tagsDetailed: AiTagDetailed[] = (json.tags || []).map((t: any) => ({
			name: t.name || String(t),
			confidence: typeof t.confidence === "number" ? t.confidence : 1.0,
		}));
		const tags = tagsDetailed.map((t) => t.name);

		return {
			description: json.description || i18next.t('errors:noDescriptionGenerated'),
			tags,
			tagsDetailed,
		};
	} catch (error: any) {
		console.error("Gemini Stream Error:", error);
		if (error instanceof GeminiError) throw error;

		if (error.message?.includes("API key")) {
			throw new ApiKeyError();
		}
		if (error.message?.includes("network") || error.message?.includes("fetch")) {
			throw new NetworkError(error);
		}
		throw new GeminiError(error.message || i18next.t('errors:unknownStreamError'), "UNKNOWN_ERROR");
	}
};
