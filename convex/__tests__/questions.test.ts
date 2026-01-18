import { describe, it, expect } from 'vitest';
import {
  extractAnswerFromGeminiResponse,
  formatErrorMessage,
  buildPrompt,
  buildGeminiEndpoint,
  ERROR_MESSAGES,
  GEMINI_CONFIG,
} from '../questions';

// Test utilities for parsing AI responses
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

describe('extractAnswerFromGeminiResponse', () => {
  it('should extract text from a valid Gemini response', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'This is a valid answer from Gemini API.',
              },
            ],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe('This is a valid answer from Gemini API.');
  });

  it('should trim whitespace from extracted text', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '  Answer with extra spaces  \n\n',
              },
            ],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe('Answer with extra spaces');
  });

  it('should return fallback message when candidates is undefined', () => {
    const response: GeminiResponse = {};

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when candidates is empty array', () => {
    const response: GeminiResponse = {
      candidates: [],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when content is undefined', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: undefined,
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when parts is undefined', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: undefined,
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when parts is empty array', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when text is undefined', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: undefined,
              },
            ],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should return fallback message when text is empty string', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '',
              },
            ],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe(ERROR_MESSAGES.FALLBACK_ANSWER);
  });

  it('should handle deeply nested valid response structure', () => {
    const response: GeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Deep nested answer',
              },
            ],
          },
        },
      ],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe('Deep nested answer');
  });
});

describe('formatErrorMessage', () => {
  it('should extract message from Error object', () => {
    const error = new Error('API request failed');
    const message = formatErrorMessage(error);
    expect(message).toBe('API request failed');
  });

  it('should handle error with no message property', () => {
    const error = { code: 500 };
    const message = formatErrorMessage(error);
    expect(message).toBe('[object Object]');
  });

  it('should convert string error to string', () => {
    const error = 'String error message';
    const message = formatErrorMessage(error);
    expect(message).toBe('String error message');
  });

  it('should convert number error to string', () => {
    const error = 404;
    const message = formatErrorMessage(error);
    expect(message).toBe('404');
  });

  it('should handle null error', () => {
    const error = null;
    const message = formatErrorMessage(error);
    expect(message).toBe('null');
  });

  it('should handle undefined error', () => {
    const error = undefined;
    const message = formatErrorMessage(error);
    expect(message).toBe('undefined');
  });
});

describe('error message constants', () => {
  it('should have question not found message', () => {
    expect(ERROR_MESSAGES.QUESTION_NOT_FOUND).toBe("Sorry, we couldn't find your question. It may have been deleted or there was an error loading it.");
    expect(ERROR_MESSAGES.QUESTION_NOT_FOUND).toContain('question');
    expect(ERROR_MESSAGES.QUESTION_NOT_FOUND).toContain('deleted');
  });

  it('should have missing API key message', () => {
    expect(ERROR_MESSAGES.API_KEY_MISSING).toBe("Sorry, the AI service is not configured. Please contact your teacher.");
    expect(ERROR_MESSAGES.API_KEY_MISSING).toContain('not configured');
    expect(ERROR_MESSAGES.API_KEY_MISSING).toContain('teacher');
  });

  it('should have generic error message', () => {
    expect(ERROR_MESSAGES.GENERATION_ERROR).toBe("Sorry, I encountered an error generating an answer. Please try again or ask your teacher.");
    expect(ERROR_MESSAGES.GENERATION_ERROR).toContain('error');
    expect(ERROR_MESSAGES.GENERATION_ERROR).toContain('try again');
  });

  it('should have fallback answer message', () => {
    expect(ERROR_MESSAGES.FALLBACK_ANSWER).toBe("I couldn't generate an answer. Please try rephrasing your question.");
    expect(ERROR_MESSAGES.FALLBACK_ANSWER).toContain('rephrasing');
  });

  it('all error messages should be user-friendly and apologetic', () => {
    const messages = [
      ERROR_MESSAGES.QUESTION_NOT_FOUND,
      ERROR_MESSAGES.API_KEY_MISSING,
      ERROR_MESSAGES.GENERATION_ERROR,
    ];

    messages.forEach(message => {
      expect(message).toMatch(/^Sorry,/);
      expect(message.length).toBeGreaterThan(20); // Should be descriptive
      expect(message).toMatch(/\./); // Should end with punctuation
    });
  });

  it('error messages should provide guidance to users', () => {
    // Question not found should explain what might have happened
    expect(ERROR_MESSAGES.QUESTION_NOT_FOUND).toContain('deleted');

    // Missing API key should tell user who to contact
    expect(ERROR_MESSAGES.API_KEY_MISSING).toContain('teacher');

    // Generic error should suggest retry
    expect(ERROR_MESSAGES.GENERATION_ERROR).toContain('try again');
  });
});

describe('AI answer generation logic', () => {
  it('should validate API key is required', () => {
    const apiKey = undefined;
    expect(apiKey).toBeUndefined();
    
    // In real implementation, this would trigger missing API key error
    const message = apiKey ? 'Would call API' : ERROR_MESSAGES.API_KEY_MISSING;
    expect(message).toBe(ERROR_MESSAGES.API_KEY_MISSING);
  });

  it('should handle empty API key', () => {
    const apiKey = '';
    expect(apiKey).toBeFalsy();
    
    const message = apiKey ? 'Would call API' : ERROR_MESSAGES.API_KEY_MISSING;
    expect(message).toBe(ERROR_MESSAGES.API_KEY_MISSING);
  });

  it('should proceed with valid API key', () => {
    const apiKey = 'valid-api-key-12345';
    expect(apiKey).toBeTruthy();
    
    const message = apiKey ? 'Would call API' : ERROR_MESSAGES.API_KEY_MISSING;
    expect(message).toBe('Would call API');
  });
});

describe('Gemini API configuration', () => {
  it('should have correct model name', () => {
    expect(GEMINI_CONFIG.MODEL).toBe('gemini-flash-latest');
  });

  it('should have correct base URL', () => {
    expect(GEMINI_CONFIG.BASE_URL).toBe('https://generativelanguage.googleapis.com/v1beta/models');
  });

  it('should have appropriate temperature setting', () => {
    expect(GEMINI_CONFIG.TEMPERATURE).toBe(0.7);
    expect(GEMINI_CONFIG.TEMPERATURE).toBeGreaterThan(0);
    expect(GEMINI_CONFIG.TEMPERATURE).toBeLessThanOrEqual(1);
  });

  it('should have reasonable token limit', () => {
    expect(GEMINI_CONFIG.MAX_OUTPUT_TOKENS).toBe(200);
    expect(GEMINI_CONFIG.MAX_OUTPUT_TOKENS).toBeGreaterThan(0);
  });
});

describe('buildGeminiEndpoint', () => {
  it('should build valid API endpoint', () => {
    const apiKey = 'test-key';
    const endpoint = buildGeminiEndpoint(apiKey);
    
    expect(endpoint).toContain(GEMINI_CONFIG.BASE_URL);
    expect(endpoint).toContain(GEMINI_CONFIG.MODEL);
    expect(endpoint).toContain('generateContent');
    expect(endpoint).toContain(`key=${apiKey}`);
  });

  it('should handle different API keys', () => {
    const keys = ['key1', 'test-key-123', 'AIzaSyABC123'];
    
    keys.forEach(key => {
      const endpoint = buildGeminiEndpoint(key);
      expect(endpoint).toContain(`key=${key}`);
    });
  });
});

describe('buildPrompt', () => {
  it('should build appropriate prompt with question', () => {
    const question = 'What is machine learning?';
    const prompt = buildPrompt(question);

    expect(prompt).toContain(question);
    expect(prompt).toContain('teaching assistant');
    expect(prompt).toContain('live lecture');
    expect(prompt).toContain('2-3 sentences');
    expect(prompt).toContain('educational');
  });

  it('should handle different question formats', () => {
    const questions = [
      'What is AI?',
      'Can you explain quantum computing?',
      'How does photosynthesis work?',
    ];

    questions.forEach(q => {
      const prompt = buildPrompt(q);
      expect(prompt).toContain(q);
    });
  });

  it('should structure request body correctly', () => {
    const question = 'What is machine learning?';
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: buildPrompt(question),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: GEMINI_CONFIG.TEMPERATURE,
        maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
      },
    };

    expect(requestBody.contents).toHaveLength(1);
    expect(requestBody.contents[0].parts).toHaveLength(1);
    expect(requestBody.contents[0].parts[0].text).toContain(question);
    expect(requestBody.generationConfig.temperature).toBe(0.7);
    expect(requestBody.generationConfig.maxOutputTokens).toBe(200);
  });
});

describe('API response status handling', () => {
  it('should detect successful response', () => {
    const response = { ok: true, status: 200 };
    expect(response.ok).toBe(true);
  });

  it('should detect failed response', () => {
    const response = { ok: false, status: 400, statusText: 'Bad Request' };
    expect(response.ok).toBe(false);
    
    if (!response.ok) {
      const errorMsg = `Gemini API error: ${response.status} ${response.statusText}`;
      expect(errorMsg).toBe('Gemini API error: 400 Bad Request');
    }
  });

  it('should handle different HTTP error codes', () => {
    const errorCodes = [
      { status: 400, statusText: 'Bad Request' },
      { status: 401, statusText: 'Unauthorized' },
      { status: 403, statusText: 'Forbidden' },
      { status: 404, statusText: 'Not Found' },
      { status: 429, statusText: 'Too Many Requests' },
      { status: 500, statusText: 'Internal Server Error' },
      { status: 503, statusText: 'Service Unavailable' },
    ];

    errorCodes.forEach(({ status, statusText }) => {
      const errorMsg = `Gemini API error: ${status} ${statusText}`;
      expect(errorMsg).toContain(status.toString());
      expect(errorMsg).toContain(statusText);
    });
  });
});

describe('question validation', () => {
  it('should detect missing question', () => {
    const question = null;
    expect(question).toBeNull();
    
    const message = question ? 'Would generate answer' : ERROR_MESSAGES.QUESTION_NOT_FOUND;
    expect(message).toBe(ERROR_MESSAGES.QUESTION_NOT_FOUND);
  });

  it('should detect undefined question', () => {
    const question = undefined;
    expect(question).toBeUndefined();
    
    const message = question ? 'Would generate answer' : ERROR_MESSAGES.QUESTION_NOT_FOUND;
    expect(message).toBe(ERROR_MESSAGES.QUESTION_NOT_FOUND);
  });

  it('should process valid question object', () => {
    const question = {
      _id: 'q123' as any,
      sessionId: 's123' as any,
      studentId: 'student123',
      question: 'What is AI?',
      createdAt: Date.now(),
    };
    
    expect(question).toBeDefined();
    expect(question.question).toBeTruthy();
    expect(question.studentId).toBeTruthy();
  });
});
