import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Quiz Functions
 *
 * TODO: LLM Integration for Quiz Generation
 * - Quiz questions will be generated via Convex HTTP actions calling OpenAPI-compatible LLM endpoints
 * - See /docs/ARCHITECTURE.md for the planned AI integration approach
 * - The HTTP action will call this mutation with generated questions
 */

// Launch a new quiz with provided questions (questions are required)
export const launchQuiz = mutation({
  args: {
    sessionId: v.id("sessions"),
    questions: v.array(
      v.object({
        prompt: v.string(),
        choices: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.string(),
        conceptTag: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.questions.length === 0) {
      throw new Error("Quiz must have at least one question");
    }

    const quizId = await ctx.db.insert("quizzes", {
      sessionId: args.sessionId,
      createdAt: Date.now(),
      questions: args.questions,
    });

    // Set as active quiz on session
    await ctx.db.patch(args.sessionId, {
      activeQuizId: quizId,
    });

    return { quizId };
  },
});

// Submit quiz responses
export const submitQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    studentId: v.string(),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if student already submitted using compound index for O(1) lookup
    const existing = await ctx.db
      .query("quizResponses")
      .withIndex("by_quiz_student", (q) =>
        q.eq("quizId", args.quizId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      throw new Error("Already submitted");
    }

    await ctx.db.insert("quizResponses", {
      quizId: args.quizId,
      studentId: args.studentId,
      answers: args.answers,
      createdAt: Date.now(),
    });
  },
});

// Get active quiz for a session
export const getActiveQuiz = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session?.activeQuizId) {
      return null;
    }
    return await ctx.db.get(session.activeQuizId);
  },
});

// Get quiz statistics (real-time)
export const getQuizStats = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const responses = await ctx.db
      .query("quizResponses")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const totalResponses = responses.length;
    const questionCount = quiz.questions.length;

    // Calculate per-question accuracy and choice distributions
    const perQuestionAccuracy: number[] = [];
    const choiceDistributions: number[][] = [];

    for (let i = 0; i < questionCount; i++) {
      const question = quiz.questions[i];
      const choiceCount = question.choices.length;
      const distribution = new Array(choiceCount).fill(0);
      let correct = 0;

      for (const response of responses) {
        const answer = response.answers[i];
        if (answer !== undefined && answer >= 0 && answer < choiceCount) {
          distribution[answer]++;
          if (answer === question.correctIndex) {
            correct++;
          }
        }
      }

      perQuestionAccuracy.push(totalResponses > 0 ? correct / totalResponses : 0);
      choiceDistributions.push(distribution);
    }

    return {
      totalResponses,
      perQuestionAccuracy,
      choiceDistributions,
      questions: quiz.questions,
    };
  },
});

// Close active quiz
export const closeQuiz = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      activeQuizId: undefined,
    });
  },
});

// Check if a student has already submitted a quiz
// Used by frontend to avoid showing quiz modal for already-submitted quizzes
export const hasStudentSubmitted = query({
  args: {
    quizId: v.id("quizzes"),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("quizResponses")
      .withIndex("by_quiz_student", (q) =>
        q.eq("quizId", args.quizId).eq("studentId", args.studentId)
      )
      .first();

    return existing !== null;
  },
});
