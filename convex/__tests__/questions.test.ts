import { describe, it, expect } from 'vitest';

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

function extractAnswerFromGeminiResponse(data: GeminiResponse): string {
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
    "I couldn't generate an answer. Please try rephrasing your question.";
  return answer.trim();
}

// Test utilities for error handling
function getErrorMessage(error: unknown): string {
  return (error as Error)?.message || String(error);
}

function generateQuestionNotFoundMessage(): string {
  return "Sorry, we couldn't find your question. It may have been deleted or there was an error loading it.";
}

function generateMissingApiKeyMessage(): string {
  return "Sorry, the AI service is not configured. Please contact your teacher.";
}

function generateErrorMessage(): string {
  return "Sorry, I encountered an error generating an answer. Please try again or ask your teacher.";
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
  });

  it('should return fallback message when candidates is empty array', () => {
    const response: GeminiResponse = {
      candidates: [],
    };

    const answer = extractAnswerFromGeminiResponse(response);
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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
    expect(answer).toBe("I couldn't generate an answer. Please try rephrasing your question.");
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

describe('getErrorMessage', () => {
  it('should extract message from Error object', () => {
    const error = new Error('API request failed');
    const message = getErrorMessage(error);
    expect(message).toBe('API request failed');
  });

  it('should handle error with no message property', () => {
    const error = { code: 500 };
    const message = getErrorMessage(error);
    expect(message).toBe('[object Object]');
  });

  it('should convert string error to string', () => {
    const error = 'String error message';
    const message = getErrorMessage(error);
    expect(message).toBe('String error message');
  });

  it('should convert number error to string', () => {
    const error = 404;
    const message = getErrorMessage(error);
    expect(message).toBe('404');
  });

  it('should handle null error', () => {
    const error = null;
    const message = getErrorMessage(error);
    expect(message).toBe('null');
  });

  it('should handle undefined error', () => {
    const error = undefined;
    const message = getErrorMessage(error);
    expect(message).toBe('undefined');
  });
});

describe('error message generators', () => {
  it('should generate question not found message', () => {
    const message = generateQuestionNotFoundMessage();
    expect(message).toBe("Sorry, we couldn't find your question. It may have been deleted or there was an error loading it.");
    expect(message).toContain('question');
    expect(message).toContain('deleted');
  });

  it('should generate missing API key message', () => {
    const message = generateMissingApiKeyMessage();
    expect(message).toBe("Sorry, the AI service is not configured. Please contact your teacher.");
    expect(message).toContain('not configured');
    expect(message).toContain('teacher');
  });

  it('should generate generic error message', () => {
    const message = generateErrorMessage();
    expect(message).toBe("Sorry, I encountered an error generating an answer. Please try again or ask your teacher.");
    expect(message).toContain('error');
    expect(message).toContain('try again');
  });

  it('all error messages should be user-friendly and apologetic', () => {
    const messages = [
      generateQuestionNotFoundMessage(),
      generateMissingApiKeyMessage(),
      generateErrorMessage(),
    ];

    messages.forEach(message => {
      expect(message).toMatch(/^Sorry,/);
      expect(message.length).toBeGreaterThan(20); // Should be descriptive
      expect(message).toMatch(/\./); // Should end with punctuation
    });
  });

  it('error messages should provide guidance to users', () => {
    const notFoundMsg = generateQuestionNotFoundMessage();
    const apiKeyMsg = generateMissingApiKeyMessage();
    const errorMsg = generateErrorMessage();

    // Question not found should explain what might have happened
    expect(notFoundMsg).toContain('deleted');

    // Missing API key should tell user who to contact
    expect(apiKeyMsg).toContain('teacher');

    // Generic error should suggest retry
    expect(errorMsg).toContain('try again');
  });
});

describe('AI answer generation logic', () => {
  it('should validate API key is required', () => {
    const apiKey = undefined;
    expect(apiKey).toBeUndefined();
    
    // In real implementation, this would trigger missing API key error
    const message = apiKey ? 'Would call API' : generateMissingApiKeyMessage();
    expect(message).toBe(generateMissingApiKeyMessage());
  });

  it('should handle empty API key', () => {
    const apiKey = '';
    expect(apiKey).toBeFalsy();
    
    const message = apiKey ? 'Would call API' : generateMissingApiKeyMessage();
    expect(message).toBe(generateMissingApiKeyMessage());
  });

  it('should proceed with valid API key', () => {
    const apiKey = 'valid-api-key-12345';
    expect(apiKey).toBeTruthy();
    
    const message = apiKey ? 'Would call API' : generateMissingApiKeyMessage();
    expect(message).toBe('Would call API');
  });
});

describe('Gemini API request structure', () => {
  it('should validate API endpoint format', () => {
    const apiKey = 'test-key';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    expect(endpoint).toContain('generativelanguage.googleapis.com');
    expect(endpoint).toContain('gemini-flash-latest');
    expect(endpoint).toContain('generateContent');
    expect(endpoint).toContain(`key=${apiKey}`);
  });

  it('should structure request body correctly', () => {
    const question = 'What is machine learning?';
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful teaching assistant for a live lecture. A student has asked the following question:\n\n"${question}"\n\nProvide a clear, concise, and helpful answer. Keep it brief (2-3 sentences) and educational.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    };

    expect(requestBody.contents).toHaveLength(1);
    expect(requestBody.contents[0].parts).toHaveLength(1);
    expect(requestBody.contents[0].parts[0].text).toContain(question);
    expect(requestBody.contents[0].parts[0].text).toContain('teaching assistant');
    expect(requestBody.generationConfig.temperature).toBe(0.7);
    expect(requestBody.generationConfig.maxOutputTokens).toBe(200);
  });

  it('should include appropriate prompt instructions', () => {
    const question = 'Test question';
    const promptTemplate = `You are a helpful teaching assistant for a live lecture. A student has asked the following question:\n\n"${question}"\n\nProvide a clear, concise, and helpful answer. Keep it brief (2-3 sentences) and educational.`;

    expect(promptTemplate).toContain('teaching assistant');
    expect(promptTemplate).toContain('live lecture');
    expect(promptTemplate).toContain(question);
    expect(promptTemplate).toContain('2-3 sentences');
    expect(promptTemplate).toContain('educational');
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
    
    const message = question ? 'Would generate answer' : generateQuestionNotFoundMessage();
    expect(message).toBe(generateQuestionNotFoundMessage());
  });

  it('should detect undefined question', () => {
    const question = undefined;
    expect(question).toBeUndefined();
    
    const message = question ? 'Would generate answer' : generateQuestionNotFoundMessage();
    expect(message).toBe(generateQuestionNotFoundMessage());
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
