import { mutation, query, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Error messages
export const ERROR_MESSAGES = {
  QUESTION_NOT_FOUND: "Sorry, we couldn't find your question. It may have been deleted or there was an error loading it.",
  API_KEY_MISSING: "Sorry, the AI service is not configured. Please contact your teacher.",
  GENERATION_ERROR: "Sorry, I encountered an error generating an answer. Please try again or ask your teacher.",
  FALLBACK_ANSWER: "I couldn't generate an answer. Please try rephrasing your question.",
} as const;

// Gemini API configuration
export const GEMINI_CONFIG = {
  MODEL: "gemini-flash-latest",
  BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models",
  TEMPERATURE: 0.7,
  MAX_OUTPUT_TOKENS: 200,
} as const;

// Helper to extract answer from Gemini API response
export function extractAnswerFromGeminiResponse(data: any): string {
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || ERROR_MESSAGES.FALLBACK_ANSWER;
  return answer.trim();
}

// Helper to build the prompt for the AI
export function buildPrompt(question: string): string {
  return `You are a helpful teaching assistant for a live lecture. A student has asked the following question:\n\n"${question}"\n\nProvide a clear, concise, and helpful answer. Keep it brief (2-3 sentences) and educational.`;
}

// Helper to build the Gemini API endpoint
export function buildGeminiEndpoint(apiKey: string): string {
  return `${GEMINI_CONFIG.BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;
}

// Helper to format error messages from unknown errors
export function formatErrorMessage(error: unknown): string {
  return (error as Error)?.message || String(error);
}

// Ask a question (stores and returns ID; AI answer saved separately)
export const askQuestion = mutation({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.string(),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", {
      sessionId: args.sessionId,
      studentId: args.studentId,
      question: args.question,
      createdAt: Date.now(),
    });

    // Schedule AI answer generation
    await ctx.scheduler.runAfter(0, internal.questions.generateAnswer, {
      questionId,
    });

    return { questionId };
  },
});

// Save AI-generated answer to a question
export const saveAnswer = mutation({
  args: {
    questionId: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, {
      answer: args.answer,
    });
  },
});

// Internal mutation to save answer (called from action)
export const saveAnswerInternal = internalMutation({
  args: {
    questionId: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, {
      answer: args.answer,
    });
  },
});

// Internal query to get a question (called from action)
export const getQuestionInternal = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});

// Action to generate AI answer using Gemini API
export const generateAnswer = internalAction({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    // Get the question from the database
    const question = await ctx.runQuery(internal.questions.getQuestionInternal, {
      questionId: args.questionId,
    });

    if (!question) {
      console.error("Question not found:", args.questionId);
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: ERROR_MESSAGES.QUESTION_NOT_FOUND,
      });
      return;
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set in environment variables");
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: ERROR_MESSAGES.API_KEY_MISSING,
      });
      return;
    }

    try {
      // Call Gemini API
      const response = await fetch(
        buildGeminiEndpoint(apiKey),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: buildPrompt(question.question),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: GEMINI_CONFIG.TEMPERATURE,
              maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const answer = extractAnswerFromGeminiResponse(data);

      // Save the answer
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer,
      });
    } catch (error) {
      console.error("Error generating answer:", formatErrorMessage(error));
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: ERROR_MESSAGES.GENERATION_ERROR,
      });
    }
  },
});

// List recent questions for a session (real-time)
export const listRecentQuestions = query({
  args: {
    sessionId: v.id("sessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first)
    return questions.reverse();
  },
});

// Get a single question by ID
export const getQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});
