/**
 * Shared utilities for Convex integration tests
 */
import { convexTest } from "convex-test";
import schema from "../schema";

// Import all Convex modules for testing
export const modules = import.meta.glob("../**/*.ts");

/**
 * Create a new test context with fresh database
 */
export function createTestContext() {
  return convexTest(schema, modules);
}

/**
 * Sample quiz questions for testing
 */
export const sampleQuizQuestions = [
  {
    prompt: "What is 2+2?",
    choices: ["3", "4", "5", "6"],
    correctIndex: 1,
    explanation: "Basic arithmetic: 2+2=4",
    conceptTag: "arithmetic",
  },
  {
    prompt: "What color is the sky?",
    choices: ["Red", "Green", "Blue", "Yellow"],
    correctIndex: 2,
    explanation: "The sky appears blue due to Rayleigh scattering",
    conceptTag: "science",
  },
  {
    prompt: "Which planet is closest to the sun?",
    choices: ["Venus", "Mercury", "Earth", "Mars"],
    correctIndex: 1,
    explanation: "Mercury is the closest planet to the sun",
    conceptTag: "astronomy",
  },
];

/**
 * Single question for simple tests
 */
export const singleQuestion = {
  prompt: "Test question",
  choices: ["A", "B", "C", "D"],
  correctIndex: 0,
  explanation: "Test explanation",
  conceptTag: "test",
};
