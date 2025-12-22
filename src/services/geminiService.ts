import { GoogleGenAI } from "@google/genai";
import { PortfolioItem, AiTagDetailed } from "../shared/types";

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
  const storedKey = localStorage.getItem("gemini_api_key");
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

  if (!item.file) {
    throw new Error("Cannot analyze image: File object not available.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await processFileToBase64(item.file);

    // Using a known model that supports JSON schema or structured prompt

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
                    3. List technical details/movements if applicable.
                    
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
