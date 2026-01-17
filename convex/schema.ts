import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Question schema for quizzes
const questionSchema = v.object({
  prompt: v.string(),
  choices: v.array(v.string()),
  correctIndex: v.number(),
  explanation: v.string(),
  conceptTag: v.string(),
});

export default defineSchema({
  // Lecture sessions with join codes
  sessions: defineTable({
    code: v.string(), // Unique, human-readable join code (e.g., "blue-tiger")
    status: v.union(v.literal("live"), v.literal("ended")),
    createdAt: v.number(),
    contextText: v.optional(v.string()), // Uploaded slides/context for AI
    activeQuizId: v.optional(v.id("quizzes")), // Currently active quiz
  }).index("by_code", ["code"]),

  // Transcript segments - append-only for real-time performance
  transcriptLines: defineTable({
    sessionId: v.id("sessions"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),

  // Quiz definitions with MCQ questions
  quizzes: defineTable({
    sessionId: v.id("sessions"),
    createdAt: v.number(),
    questions: v.array(questionSchema),
  }).index("by_session", ["sessionId"]),

  // Student quiz responses
  quizResponses: defineTable({
    quizId: v.id("quizzes"),
    studentId: v.string(),
    answers: v.array(v.number()), // Selected choice indices
    createdAt: v.number(),
  })
    .index("by_quiz", ["quizId"])
    .index("by_quiz_student", ["quizId", "studentId"]),

  // "I'm lost" signals for spike detection
  lostEvents: defineTable({
    sessionId: v.id("sessions"),
    studentId: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),

  // Student Q&A with AI responses
  questions: defineTable({
    sessionId: v.id("sessions"),
    studentId: v.string(),
    question: v.string(),
    answer: v.optional(v.string()), // AI-generated answer
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),
});
