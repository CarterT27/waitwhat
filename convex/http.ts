import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/transcription",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { sessionId, text, secret } = await request.json();
    if (secret !== process.env.TRANSCRIPTION_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    await ctx.runMutation(api.transcripts.appendTranscriptLine, { sessionId, text });
    return new Response("OK", { status: 200 });
  }),
});

export default http;
