import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Launch a new quiz (in production, this would call LLM to generate questions)
export const launchQuiz = mutation({
  args: {
    sessionId: v.id("sessions"),
    questions: v.optional(
      v.array(
        v.object({
          prompt: v.string(),
          choices: v.array(v.string()),
          correctIndex: v.number(),
          explanation: v.string(),
          conceptTag: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Use provided questions or fallback quiz
    const questions = args.questions ?? [
      {
        prompt: "What is the main topic being discussed?",
        choices: ["Topic A", "Topic B", "Topic C", "Topic D"],
        correctIndex: 0,
        explanation: "This is a fallback quiz question.",
        conceptTag: "comprehension",
      },
      {
        prompt: "Which concept was just explained?",
        choices: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
        correctIndex: 1,
        explanation: "This is a fallback quiz question.",
        conceptTag: "recall",
      },
      {
        prompt: "What is the key takeaway?",
        choices: ["Takeaway A", "Takeaway B", "Takeaway C", "Takeaway D"],
        correctIndex: 2,
        explanation: "This is a fallback quiz question.",
        conceptTag: "synthesis",
      },
    ];

    const quizId = await ctx.db.insert("quizzes", {
      sessionId: args.sessionId,
      createdAt: Date.now(),
      questions,
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
    // Check if student already submitted
    const existing = await ctx.db
      .query("quizResponses")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
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
