/**
 * Shared utilities for React component tests
 */
import { vi } from "vitest";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Create a mock mutation function that tracks calls
 */
export function createMockMutation<T = void>() {
  return vi.fn(() => Promise.resolve() as Promise<T>);
}

/**
 * Sample session data for testing
 */
export const sampleSession = {
  _id: "session-1" as Id<"sessions">,
  _creationTime: Date.now(),
  code: "blue-tiger-42",
  status: "live" as const,
  createdAt: Date.now(),
};

/**
 * Sample ended session data
 */
export const sampleEndedSession = {
  ...sampleSession,
  _id: "session-2" as Id<"sessions">,
  status: "ended" as const,
};

/**
 * Sample quiz data for testing
 */
export const sampleQuiz = {
  _id: "quiz-1" as Id<"quizzes">,
  _creationTime: Date.now(),
  sessionId: "session-1" as Id<"sessions">,
  createdAt: Date.now(),
  questions: [
    {
      prompt: "What is 2+2?",
      choices: ["3", "4", "5", "6"],
      correctIndex: 1,
      explanation: "Basic math",
      conceptTag: "arithmetic",
    },
    {
      prompt: "What color is the sky?",
      choices: ["Red", "Green", "Blue", "Yellow"],
      correctIndex: 2,
      explanation: "Rayleigh scattering",
      conceptTag: "science",
    },
  ],
};

/**
 * Sample transcript lines
 */
export const sampleTranscriptLines = [
  {
    _id: "line-1",
    _creationTime: Date.now(),
    sessionId: "session-1" as Id<"sessions">,
    text: "Welcome to today's lecture.",
    createdAt: Date.now() - 60000,
  },
  {
    _id: "line-2",
    _creationTime: Date.now(),
    sessionId: "session-1" as Id<"sessions">,
    text: "We will cover the basics of the topic.",
    createdAt: Date.now() - 30000,
  },
  {
    _id: "line-3",
    _creationTime: Date.now(),
    sessionId: "session-1" as Id<"sessions">,
    text: "Let's get started with the first concept.",
    createdAt: Date.now(),
  },
];

/**
 * Sample questions (Q&A)
 */
export const sampleQuestions = [
  {
    _id: "q-1",
    _creationTime: Date.now(),
    sessionId: "session-1" as Id<"sessions">,
    studentId: "student-123",
    question: "Can you explain this concept?",
    answer: "Yes, this concept refers to...",
    createdAt: Date.now() - 60000,
  },
  {
    _id: "q-2",
    _creationTime: Date.now(),
    sessionId: "session-1" as Id<"sessions">,
    studentId: "student-123",
    question: "What about the second point?",
    createdAt: Date.now(),
  },
];

/**
 * Sample lost stats data
 */
export const sampleLostStats = {
  last60sCount: 2,
  last5mCount: 5,
  buckets: Array.from({ length: 10 }, (_, i) => ({
    start: Date.now() - (10 - i) * 30000,
    end: Date.now() - (9 - i) * 30000,
    count: i === 9 ? 2 : 0,
  })),
};

/**
 * Sample lost stats with spike
 */
export const sampleLostStatsWithSpike = {
  ...sampleLostStats,
  last60sCount: 5,
  last5mCount: 8,
};

/**
 * Sample quiz stats
 */
export const sampleQuizStats = {
  totalResponses: 10,
  perQuestionAccuracy: [0.8, 0.6],
  choiceDistributions: [
    [1, 8, 1, 0],
    [2, 2, 6, 0],
  ],
  questions: sampleQuiz.questions,
};
