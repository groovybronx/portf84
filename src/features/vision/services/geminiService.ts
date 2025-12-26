import { GoogleGenAI } from "@google/genai";
import { PortfolioItem, AiTagDetailed } from "../../../shared/types";
import { STORAGE_KEYS } from "../../../shared/constants";

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

const getApiKey = (): string => {
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

	throw new Error("Missing Gemini API Key. Please configure it in Settings.");
};

export const analyzeImage = async (
	item: PortfolioItem
): Promise<{
	description: string;
	tags: string[];
	tagsDetailed: AiTagDetailed[];
}> => {
	const apiKey = getApiKey();

	if (!item.file && !item.url) {
		throw new Error("Cannot analyze image: File object and URL not available.");
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
				throw new Error("Failed to load image file from disk.");
			}
		}

		// Using Gemini 3 Flash Preview as requested
		const modelId = "gemini-3-flash-preview";

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
							text: `Analyze this image. 
                    1. Provide a concise description (max 2 sentences).
                    2. List 5-8 relevant tags.
                    
                    Return valid JSON only matching this structure:
                    {
                      "description": "string",
                      "tags": [ {"name": "string", "confidence": 0.0-1.0} ]
                    }`,
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
			throw new Error("Empty response from AI");
		}

		const json = JSON.parse(text);

		// Normalize response
		const tagsDetailed: AiTagDetailed[] = (json.tags || []).map((t: any) => ({
			name: t.name || String(t),
			confidence: typeof t.confidence === "number" ? t.confidence : 1.0,
		}));
		const tags = tagsDetailed.map((t) => t.name);

		return {
			description: json.description || "No description generated.",
			tags,
			tagsDetailed,
		};
	} catch (error) {
		console.error("Gemini Analysis Error:", error);
		throw error;
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
	const apiKey = getApiKey();

	if (!item.file && !item.url) {
		throw new Error("Cannot analyze image: File object and URL not available.");
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
				throw new Error("Failed to load image file from disk.");
			}
		}
		const modelId = "gemini-3-flash-preview";

		// Prompt engineering for optional Thinking Process
		let prompt = `Analyze this image.
    1. Provide a concise description (max 2 sentences).
    2. List 5-8 relevant tags.
    
    Return valid JSON only matching this structure:
    {
      "description": "string",
      "tags": [ {"name": "string", "confidence": 0.0-1.0} ]
    }`;

		if (enableThinking) {
			prompt = `Analyze this image.
      STEP 1: THINKING PROCESS
      Analyze the image composition, style, lighting, and subject matter step-by-step. 
      Explain your reasoning for choosing specific tags.
      
      STEP 2: FINAL OUTPUT
      After your analysis, output the separator "---JSON---" and then the final JSON object.
      
      Structure:
      [Your thinking process here...]
      ---JSON---
      {
        "description": "string",
        "tags": [ {"name": "string", "confidence": 0.0-1.0} ]
      }`;
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
					throw new Error("Failed to parse AI response: No JSON found.");
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
			description: json.description || "No description generated.",
			tags,
			tagsDetailed,
		};
	} catch (error) {
		console.error("Gemini Stream Error:", error);
		throw error;
	}
};
