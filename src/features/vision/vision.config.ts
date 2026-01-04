export const VISION_MODEL_ID = "gemini-3-flash-preview";

export const ANALYZE_IMAGE_PROMPT = `Analyze this image.
  1. Provide a concise description (max 2 sentences).
  2. List 5-8 relevant tags.

  Return valid JSON only matching this structure:
  {
    "description": "string",
    "tags": [ {"name": "string", "confidence": 0.0-1.0} ]
  }`;

export const ANALYZE_IMAGE_PROMPT_WITH_THINKING = `Analyze this image.
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
