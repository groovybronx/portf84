import { GoogleGenAI } from "@google/genai";
import { PortfolioItem, AiTagDetailed } from "../types";

const processFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result?.toString().replace(/^data:(.*,)?/, "");
      if (encoded && (encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded || "");
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeImage = async (item: PortfolioItem): Promise<{ description: string; tags: string[]; tagsDetailed: AiTagDetailed[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await processFileToBase64(item.file);

    // Using gemini-3-flash-preview as it supports image input and JSON output
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: item.file.type,
              data: base64Data,
            },
          },
          {
            text: `Analyze this image for a professional portfolio. 
            1. Provide a concise, artistic description (max 2 sentences).
            2. List 5 relevant SEO keywords or tags with a confidence score (0.0 to 1.0).
            Return response in JSON format: 
            { 
              "description": "...", 
              "tags": [ 
                { "name": "tag1", "confidence": 0.95 },
                { "name": "tag2", "confidence": 0.8 }
              ] 
            }`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return { description: "Analysis failed", tags: [], tagsDetailed: [] };

    const json = JSON.parse(text);
    const tagsDetailed: AiTagDetailed[] = (json.tags || []).map((t: any) => ({
      name: t.name || String(t),
      confidence: typeof t.confidence === 'number' ? t.confidence : 1.0
    }));
    const tags = tagsDetailed.map(t => t.name);

    return {
      description: json.description || "No description available.",
      tags,
      tagsDetailed
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};