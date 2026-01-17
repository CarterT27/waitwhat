import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a human-readable join code (e.g., "blue-tiger")
function generateJoinCode(): string {
  const adjectives = [
    "red", "blue", "green", "swift", "calm", "bold", "warm", "cool",
    "bright", "dark", "wild", "gentle", "happy", "quiet", "loud", "soft"
  ];
  const nouns = [
    "tiger", "eagle", "river", "mountain", "forest", "ocean", "star", "moon",
    "wolf", "bear", "fox", "hawk", "storm", "flame", "frost", "wind"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

// Create a new lecture session
export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    const code = generateJoinCode();
    const sessionId = await ctx.db.insert("sessions", {
      code,
      status: "live",
      createdAt: Date.now(),
    });
    return { sessionId, code };
  },
});

// Join a session via join code
export const joinSession = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "live") {
      throw new Error("Session has ended");
    }

    // Generate a simple student ID (in production, use auth)
    const studentId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return { sessionId: session._id, studentId };
  },
});

// Get session by ID
export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

// Get session by join code
export const getSessionByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// Upload slides/context for AI
export const uploadSlides = mutation({
  args: {
    sessionId: v.id("sessions"),
    slidesText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      contextText: args.slidesText,
    });
  },
});

// End a session
export const endSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "ended",
      activeQuizId: undefined,
    });
  },
});
