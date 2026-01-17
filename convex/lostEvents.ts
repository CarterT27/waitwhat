import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record an "I'm lost" event
export const markLost = mutation({
  args: {
    sessionId: v.id("sessions"),
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lostEvents", {
      sessionId: args.sessionId,
      studentId: args.studentId,
      createdAt: Date.now(),
    });
  },
});

// Get lost spike statistics (real-time)
export const getLostSpikeStats = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Get all lost events in the last 5 minutes
    const recentEvents = await ctx.db
      .query("lostEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.gte(q.field("createdAt"), fiveMinutesAgo))
      .collect();

    // Count events in different time windows
    const last60sCount = recentEvents.filter(
      (e) => e.createdAt >= oneMinuteAgo
    ).length;
    const last5mCount = recentEvents.length;

    // Create time buckets (30-second intervals for last 5 minutes = 10 buckets)
    const bucketSize = 30 * 1000; // 30 seconds
    const bucketCount = 10;
    const buckets: { start: number; end: number; count: number }[] = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketEnd = now - i * bucketSize;
      const bucketStart = bucketEnd - bucketSize;
      const count = recentEvents.filter(
        (e) => e.createdAt >= bucketStart && e.createdAt < bucketEnd
      ).length;
      buckets.unshift({ start: bucketStart, end: bucketEnd, count });
    }

    return {
      last60sCount,
      last5mCount,
      buckets,
    };
  },
});
