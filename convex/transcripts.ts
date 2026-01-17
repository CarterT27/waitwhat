import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Append a new transcript line (append-only for real-time performance)
export const appendTranscriptLine = mutation({
  args: {
    sessionId: v.id("sessions"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("transcriptLines", {
      sessionId: args.sessionId,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

// List transcript lines for a session (real-time subscription)
// Strategy: Fetch most recent N lines in desc order, then reverse to chronological.
// This approach is correct because Convex doesn't support offset-from-end queries.
// Without this pattern, we'd have to fetch ALL lines and slice, which is inefficient.
export const listTranscript = query({
  args: {
    sessionId: v.id("sessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;

    // Fetch most recent lines (desc order, take limit)
    const lines = await ctx.db
      .query("transcriptLines")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first) for display
    return lines.reverse();
  },
});
