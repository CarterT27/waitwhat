import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import schema from "../../convex/schema";
import { modules } from "../testUtils";

function isLaunchAccepted(result: unknown): boolean {
  if (!result || typeof result !== "object") return false;
  const value = result as Record<string, unknown>;
  return value.scheduled === true || value.success === true;
}

describe("Quiz Launch Failure Modes", () => {
  const originalGeminiApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalGeminiApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalGeminiApiKey;
    }
  });

  it("blocks launch when generation fails (must not return launch-accepted)", async () => {
    delete process.env.GEMINI_API_KEY;

    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    let threw = false;
    let result: unknown;

    try {
      result = await t.action(api.quizzes.generateAndLaunchQuiz, { sessionId });
    } catch {
      threw = true;
    }

    // Requirement: failures should block launch and propagate failure to caller.
    expect(threw || isLaunchAccepted(result) === false).toBe(true);
  });

  it("is idempotent per session for concurrent launch requests", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      questions: [
                        {
                          prompt: "What is 2+2?",
                          choices: ["3", "4", "5", "6"],
                          correctIndex: 1,
                          explanation: "2+2 is 4.",
                          conceptTag: "arithmetic",
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    const [first, second] = await Promise.allSettled([
      t.action(api.quizzes.generateAndLaunchQuiz, { sessionId }),
      t.action(api.quizzes.generateAndLaunchQuiz, { sessionId }),
    ]);

    const acceptedCount = [first, second].filter(
      (outcome) => outcome.status === "fulfilled" && isLaunchAccepted(outcome.value)
    ).length;

    // Requirement: only one launch request should be accepted while another is in-flight.
    expect(acceptedCount).toBe(1);
  });

  it("does not let an older lock owner clear a newer lock", async () => {
    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    await t.mutation(internal.quizzes.acquireQuizGenerationLock, {
      sessionId,
      lockId: "lock-a",
    });

    // Simulate a newer owner taking over (e.g., after process-level recovery).
    await t.run(async (ctx) => {
      await ctx.db.patch(sessionId, { quizGenerationInFlightLockId: "lock-b" });
    });

    await t.mutation(internal.quizzes.clearQuizGenerationLock, {
      sessionId,
      lockId: "lock-a",
    });

    const session = await t.query(api.sessions.getSession, { sessionId });
    expect(session?.quizGenerationInFlightLockId).toBe("lock-b");
  });

  it("handles empty AI question arrays as structured failure (no thrown action error)", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      questions: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    let threw = false;
    let result: unknown;
    try {
      result = await t.action(internal.quizzes.generateQuiz, { sessionId });
    } catch {
      threw = true;
    }

    // Requirement: malformed AI output should not explode the action runtime.
    expect(threw).toBe(false);
    expect((result as { success?: boolean } | undefined)?.success).toBe(false);
  });

  it("handles malformed AI question objects as structured failure (no thrown action error)", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      questions: [
                        {
                          prompt: "Malformed question",
                          choices: ["A", "B", "C", "D"],
                          correctIndex: 0,
                          explanation: "Missing conceptTag on purpose",
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    let threw = false;
    let result: unknown;
    try {
      result = await t.action(internal.quizzes.generateQuiz, { sessionId });
    } catch {
      threw = true;
    }

    // Requirement: invalid schema from LLM should return a failure object, not throw.
    expect(threw).toBe(false);
    expect((result as { success?: boolean } | undefined)?.success).toBe(false);
  });

  it("does not drop transcript between generation start and quiz creation", async () => {
    const dateSpy = vi.spyOn(Date, "now");
    let now = 1_000;
    dateSpy.mockImplementation(() => now);

    const t = convexTest(schema, modules);
    const { sessionId } = await t.mutation(api.sessions.createSession, {});

    // Previous quiz in session (baseline cutoff for next generation).
    await t.mutation(internal.quizzes.launchQuizInternal, {
      sessionId,
      questions: [
        {
          prompt: "Q1",
          choices: ["A", "B", "C", "D"],
          correctIndex: 0,
          explanation: "Baseline quiz",
          conceptTag: "baseline",
        },
      ],
    });

    const previousQuiz = await t.query(internal.quizzes.getLastQuizForSession, {
      sessionId,
    });
    expect(previousQuiz).toBeDefined();

    // Generation starts: context snapshot taken at this time.
    now = 2_000;
    await t.query(internal.ai.context.buildContextForFeature, {
      featureType: "quiz_generation",
      sessionId,
      sinceTimestamp: previousQuiz!.createdAt,
    });

    // Transcript arrives while generation is in flight.
    now = 2_500;
    await t.mutation(api.transcripts.appendTranscriptLine, {
      sessionId,
      text: "segment-between-start-and-save",
    });

    // Quiz is persisted later, but createdAt should remain anchored to generation start.
    now = 3_000;
    await t.mutation(internal.quizzes.launchQuizInternal, {
      sessionId,
      createdAt: 2_000,
      questions: [
        {
          prompt: "Q2",
          choices: ["A", "B", "C", "D"],
          correctIndex: 1,
          explanation: "Second quiz",
          conceptTag: "followup",
        },
      ],
    });

    const latestQuiz = await t.query(internal.quizzes.getLastQuizForSession, {
      sessionId,
    });

    const nextContext = await t.query(internal.ai.context.buildContextForFeature, {
      featureType: "quiz_generation",
      sessionId,
      sinceTimestamp: latestQuiz!.createdAt,
    });

    // Requirement: no transcript segment should be skipped between consecutive quizzes.
    expect(nextContext.transcriptText).toContain("segment-between-start-and-save");
  });
});
