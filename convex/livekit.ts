"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { AccessToken } from "livekit-server-sdk";

export const generateToken = action({
  args: {
    sessionId: v.id("sessions"),
    identity: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) throw new Error("LiveKit not configured");

    const token = new AccessToken(apiKey, apiSecret, {
      identity: args.identity,
      ttl: "2h",
    });
    token.addGrant({
      room: args.sessionId,
      roomJoin: true,
      canPublish: args.identity === "teacher",
      canSubscribe: true,
    });
    return { token: await token.toJwt() };
  },
});
