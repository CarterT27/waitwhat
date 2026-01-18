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
  args: { roomName: v.optional(v.string()) },
  handler: async (ctx, args) => {
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
      roomName: args.roomName,
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

    // Generate a unique student ID
    const studentId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Store student in database
    await ctx.db.insert("students", {
      sessionId: session._id,
      studentId,
      isLost: false,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    });

    return { sessionId: session._id, studentId };
  },
});

// Get the number of active students in a session
export const getStudentCount = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const students = await ctx.db
      .query("students")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Filter active students (seen in last 15 seconds)
    const now = Date.now();
    const activeStudents = students.filter(s => (s.lastSeen ?? 0) > now - 15000);
    return activeStudents.length;
  },
});

// Get the number of active, lost students
export const getLostStudentCount = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const lostStudents = await ctx.db
      .query("students")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isLost"), true))
      .collect();

    // Filter active students (seen in last 15 seconds)
    const now = Date.now();
    const activeLostStudents = lostStudents.filter(s => (s.lastSeen ?? 0) > now - 15000);
    return activeLostStudents.length;
  },
});

// Set "I'm lost" status for a student
export const setLostStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.string(),
    isLost: v.boolean(),
  },
  handler: async (ctx, args) => {
    const studentRecord = await ctx.db
      .query("students")
      .withIndex("by_session_student", (q) =>
        q.eq("sessionId", args.sessionId).eq("studentId", args.studentId)
      )
      .first();

    if (studentRecord) {
      await ctx.db.patch(studentRecord._id, {
        isLost: args.isLost,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("students", {
        sessionId: args.sessionId,
        studentId: args.studentId,
        isLost: args.isLost,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      });
    }

    if (args.isLost) {
      await ctx.db.insert("lostEvents", {
        sessionId: args.sessionId,
        studentId: args.studentId,
        createdAt: Date.now(),
      });
    }
  },
});

// Heartbeat to keep student active
export const keepAlive = mutation({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_session_student", (q) =>
        q.eq("sessionId", args.sessionId).eq("studentId", args.studentId)
      )
      .first();

    if (student) {
      await ctx.db.patch(student._id, {
        lastSeen: Date.now(),
      });
    }
  },
});

// Get current state for a student
export const getStudentState = query({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_session_student", (q) =>
        q.eq("sessionId", args.sessionId).eq("studentId", args.studentId)
      )
      .first();

    return student;
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
