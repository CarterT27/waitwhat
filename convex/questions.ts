import { mutation, query, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
    console.log("generateAnswer action started for questionId:", args.questionId);

    // Get the question from the database
    const question = await ctx.runQuery(internal.questions.getQuestionInternal, {
      questionId: args.questionId,
    });

    if (!question) {
      console.error("Question not found:", args.questionId);
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: "Sorry, we couldn't find your question. It may have been deleted or there was an error loading it.",
      });
      return;
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set in environment variables");
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: "Sorry, the AI service is not configured. Please contact your teacher.",
      });
      return;
    }

    try {
      // Call Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful teaching assistant for a live lecture. A student has asked the following question:\n\n"${question.question}"\n\nProvide a clear, concise, and helpful answer. Keep it brief (2-3 sentences) and educational.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
              // Disable thinking mode for simple Q&A (Gemini 2.5 feature)
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API response error body:", errorBody);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Log the full response for debugging
      console.log("Gemini API response:", JSON.stringify(data, null, 2));

      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;

      // Log finish reason to understand why response might be truncated
      if (finishReason && finishReason !== "STOP") {
        console.warn("Gemini response finishReason:", finishReason);
      }

      // Extract text from response parts only (not thinking parts)
      // Gemini 2.5 models may return thinking parts (thought: true) vs response parts
      const parts = candidate?.content?.parts || [];
      const responseParts = parts.filter(
        (part: { text?: string; thought?: boolean }) =>
          part.text && !part.thought // Exclude thinking parts
      );
      const allText = responseParts
        .map((part: { text: string }) => part.text)
        .join("\n\n");

      const answer = allText.trim() ||
        "I couldn't generate an answer. Please try rephrasing your question.";

      // Save the answer
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: answer.trim(),
      });
    } catch (error) {
      console.error("Error generating answer:", (error as Error)?.message || error);
      await ctx.runMutation(internal.questions.saveAnswerInternal, {
        questionId: args.questionId,
        answer: "Sorry, I encountered an error generating an answer. Please try again or ask your teacher.",
      });
    }
  },
});

// List recent questions for a session (real-time)
export const listRecentQuestions = query({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.optional(v.string()), // Optional for backward compatibility, but required for privacy
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let questionsQuery = ctx.db
      .query("questions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId));

    // If studentId is provided, filter questions to only show their own
    // Note: In a real app we might want to also allow the teacher to see all questions
    // but for the student view, we want isolation.
    // Since we don't have a multi-field index with studentId yet for sorting, we do in-memory filter or add index.
    // Given the volume is likely low per session, we can filter in memory or simply filter by adding studentId check.
    
    // Ideally we'd use a specific index, but for now we'll fetch then filter or just return all if no studentId
    // Optimization: We can't easily chain .filter with .order on a different index without streaming.
    // Let's just fetch and filter for now as MVP improvement.
    
    // Better approach: If studentId is provided, use filter. 
    // BUT we want to order by createdAt desc.
    
    const questions = await questionsQuery.order("desc").take(limit * 5); // Take more to allow filtering

    if (args.studentId) {
      return questions
        .filter(q => q.studentId === args.studentId)
        .slice(0, limit)
        .reverse();
    }

    // Return in chronological order (oldest first)
    return questions.slice(0, limit).reverse();
  },
});

// Get a single question by ID
export const getQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});
