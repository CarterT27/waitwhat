/**
 * Tests for Gemini API response parsing utilities
 */
import { describe, it, expect } from "vitest";
import {
  extractAnswerFromGeminiResponse,
  getFinishReason,
  type GeminiResponse,
} from "../../utils/geminiUtils";

describe("geminiUtils", () => {
  describe("extractAnswerFromGeminiResponse", () => {
    it("should extract text from a simple single-part response", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "This is the answer." }],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe(
        "This is the answer."
      );
    });

    it("should filter out thinking parts (thought: true)", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "that is a great", thought: true }, // Thinking fragment
                { text: "Zen Browser is a privacy-focused web browser." }, // Actual answer
              ],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe(
        "Zen Browser is a privacy-focused web browser."
      );
    });

    it("should join multiple non-thinking parts with double newline", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "First paragraph." },
                { text: "Second paragraph." },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe(
        "First paragraph.\n\nSecond paragraph."
      );
    });

    it("should skip thinking parts when joining multiple parts", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "I should explain this clearly...", thought: true },
                { text: "First point." },
                { text: "Let me add more detail...", thought: true },
                { text: "Second point." },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe(
        "First point.\n\nSecond point."
      );
    });

    it("should return null when response has no candidates", () => {
      const response: GeminiResponse = {};

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });

    it("should return null when candidates array is empty", () => {
      const response: GeminiResponse = { candidates: [] };

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });

    it("should return null when content is missing", () => {
      const response: GeminiResponse = {
        candidates: [{ finishReason: "STOP" }],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });

    it("should return null when parts array is empty", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: { parts: [] },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });

    it("should return null when all parts are thinking parts", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: "thinking...", thought: true },
                { text: "more thinking...", thought: true },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });

    it("should handle parts without text property", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                { thought: false } as { text?: string; thought?: boolean },
                { text: "Valid text." },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe("Valid text.");
    });

    it("should trim whitespace from final answer", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "  Answer with whitespace.  " }],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBe(
        "Answer with whitespace."
      );
    });

    it("should return null for empty text after trimming", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "   " }],
            },
            finishReason: "STOP",
          },
        ],
      };

      expect(extractAnswerFromGeminiResponse(response)).toBeNull();
    });
  });

  describe("getFinishReason", () => {
    it("should return STOP for completed responses", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: { parts: [{ text: "Answer" }] },
            finishReason: "STOP",
          },
        ],
      };

      expect(getFinishReason(response)).toBe("STOP");
    });

    it("should return MAX_TOKENS when response was truncated", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: { parts: [{ text: "Truncated answer..." }] },
            finishReason: "MAX_TOKENS",
          },
        ],
      };

      expect(getFinishReason(response)).toBe("MAX_TOKENS");
    });

    it("should return SAFETY when blocked by safety filters", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: { parts: [] },
            finishReason: "SAFETY",
          },
        ],
      };

      expect(getFinishReason(response)).toBe("SAFETY");
    });

    it("should return undefined when no candidates", () => {
      const response: GeminiResponse = {};

      expect(getFinishReason(response)).toBeUndefined();
    });

    it("should return undefined when finishReason not set", () => {
      const response: GeminiResponse = {
        candidates: [
          {
            content: { parts: [{ text: "Answer" }] },
          },
        ],
      };

      expect(getFinishReason(response)).toBeUndefined();
    });
  });
});
