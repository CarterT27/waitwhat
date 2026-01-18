/**
 * Utilities for parsing Gemini API responses
 */

export interface GeminiPart {
  text?: string;
  thought?: boolean;
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
  finishReason?: string;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

/**
 * Extracts the answer text from a Gemini API response.
 * Filters out thinking parts (thought: true) and joins remaining text parts.
 * Gemini 2.5 models may return thinking parts vs response parts.
 */
export function extractAnswerFromGeminiResponse(
  data: GeminiResponse
): string | null {
  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts) {
    return null;
  }

  const parts = candidate.content.parts;

  // Filter out thinking parts and extract text from response parts only
  const responseParts = parts.filter(
    (part) => part.text && !part.thought // Exclude thinking parts
  );

  const allText = responseParts.map((part) => part.text).join("\n\n");

  return allText.trim() || null;
}

/**
 * Gets the finish reason from a Gemini API response.
 * Useful for debugging truncated responses.
 */
export function getFinishReason(data: GeminiResponse): string | undefined {
  return data.candidates?.[0]?.finishReason;
}
