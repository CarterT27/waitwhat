import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Word lists for human-readable join codes
const ADJECTIVES = [
  "red", "blue", "green", "swift", "calm", "bold", "warm", "cool",
  "bright", "dark", "wild", "gentle", "happy", "quiet", "loud", "soft"
];
const NOUNS = [
  "tiger", "eagle", "river", "mountain", "forest", "ocean", "star", "moon",
  "wolf", "bear", "fox", "hawk", "storm", "flame", "frost", "wind"
];

// Generate a human-readable join code (e.g., "blue-tiger-42")
// Total combinations: 16 * 16 * 100 = 25,600 unique codes
function generateJoinCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

// Maximum attempts to generate a unique code before failing
const MAX_CODE_GENERATION_ATTEMPTS = 10;

// Create a new lecture session
export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate a unique join code with collision detection
    let code: string;
    let attempts = 0;

    do {
      code = generateJoinCode();
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) {
        break;
      }

      attempts++;
      if (attempts >= MAX_CODE_GENERATION_ATTEMPTS) {
        throw new Error(
          "Failed to generate unique join code. Please try again."
        );
      }
    } while (true);

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

    // TODO: Replace with proper authentication (e.g., Convex Auth, Clerk, Auth0)
    // Current implementation uses ephemeral student IDs stored in sessionStorage.
    // For production:
    // - Implement user authentication
    // - Associate students with user accounts
    // - Track student participation history across sessions
    // See: https://docs.convex.dev/auth
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
