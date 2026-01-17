import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
