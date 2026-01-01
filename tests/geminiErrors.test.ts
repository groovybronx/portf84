import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiError, ApiKeyError, NetworkError } from '../src/features/vision/services/geminiService';

// Mock i18next before it is used
vi.mock('i18next', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors:missingApiKey': 'Missing Gemini API Key',
        'errors:networkFailed': 'Network Error',
        'errors:unknownAnalysisError': 'Unknown Analysis Error',
        'errors:fileUrlMissing': 'File or URL missing',
        'errors:failedToLoadImage': 'Failed to load image',
        'errors:emptyAiResponse': 'Empty AI Response',
        'errors:noDescriptionGenerated': 'No description generated',
        'errors:noJsonFound': 'No JSON found in response',
        'errors:unknownStreamError': 'Unknown Stream Error',
      };
      return translations[key] || key;
    },
  },
}));

describe('GeminiService Errors', () => {
  it('ApiKeyError should have correct code and message', () => {
    const error = new ApiKeyError();
    expect(error).toBeInstanceOf(GeminiError);
    expect(error.code).toBe('MISSING_API_KEY');
    expect(error.message).toContain('Missing Gemini API Key');
    expect(error.name).toBe('ApiKeyError');
  });

  it('NetworkError should wrap original error', () => {
    const original = new Error('Failed to fetch');
    const error = new NetworkError(original);
    expect(error).toBeInstanceOf(GeminiError);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.name).toBe('NetworkError');
    expect(error.cause).toBe(original);
  });
});
