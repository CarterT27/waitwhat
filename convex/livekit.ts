"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";

const TRANSCRIPTION_AGENT_NAME = "transcription-agent";

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

    // Dispatch transcription agent when teacher joins
    if (args.identity === "teacher") {
      token.roomConfig = new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName: TRANSCRIPTION_AGENT_NAME,
            metadata: JSON.stringify({ sessionId: args.sessionId }),
          }),
        ],
      });
    }

    return { token: await token.toJwt() };
  },
});
