# AI Integration Details

## Overview
Lumina Portfolio leverages **Google Gemini 2.0/1.5 Flash** for rapid, low-latency image analysis. The integration is direct (Client-to-API), meaning no intermediate backend server is required.

## Configuration

**API Key**:
-   Stored in `localStorage` key: `gemini_api_key`.
-   Can be set via the Settings UI.
-   Fallback: `.env` variable `VITE_GEMINI_API_KEY` (for dev).

## The Prompt Engineering

The application uses a structured prompt designed to force the LLM to return strict JSON.

**System/User Prompt**:
```text
Analyze this image.
1. Provide a concise description (max 2 sentences).
2. List 5-8 relevant tags.
3. List technical details/movements if applicable.

Return valid JSON only matching this structure:
{
  "description": "string",
  "tags": [ {"name": "string", "confidence": 0.0-1.0} ]
}
```

**MIME Type Handling**:
The image is sent as inline data with its original MIME type (e.g., `image/jpeg`, `image/png`).

## Data Structure

### Response Object
The service normalizes the AI response into two formats for the application:

1.  **Simple Tags** (`tags: string[]`):
    -   Used for search and filtering.
    -   Example: `["mountain", "snow", "sunset"]`

2.  **Detailed Tags** (`tagsDetailed: AiTagDetailed[]`):
    -   Used for display features that might utilize confidence scores.
    -   Structure:
        ```typescript
        interface AiTagDetailed {
            name: string;
            confidence: number; // 0.0 to 1.0
        }
        ```

## Cost & Quotas
-   **Model**: `gemini-3-flash-preview` (as seen in source) or `gemini-1.5-flash`.
-   **Flash Model**: Selected for its speed and lower cost (or free tier availability), as image analysis in a loop requires high throughput.
-   **Rate Limiting**: The application currently processes images sequentially or in small batches to respect standard API rate limits.

## Privacy Note
Images are sent to Google's servers for analysis. They are *not* stored by Lumina Portfolio's developers, but users are subject to Google's AI data processing terms.
