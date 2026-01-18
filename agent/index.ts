import { WorkerOptions, cli, defineAgent, JobContext } from "@livekit/agents";
import { STT } from "@livekit/agents-plugin-deepgram";

const CONVEX_URL = process.env.CONVEX_SITE_URL!;
const SECRET = process.env.TRANSCRIPTION_SECRET!;

async function saveTranscript(roomName: string, text: string) {
  await fetch(`${CONVEX_URL}/transcription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: roomName, text, secret: SECRET }),
  });
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log(`Joined room: ${ctx.room.name}`);

    const stt = new STT({ model: "nova-2" });

    for await (const participant of ctx.room.remoteParticipants.values()) {
      for await (const track of participant.trackPublications.values()) {
        if (track.kind === "audio" && track.track) {
          processAudioTrack(stt, ctx.room.name, track.track);
        }
      }
    }

    ctx.room.on("trackSubscribed", (track) => {
      if (track.kind === "audio") {
        processAudioTrack(stt, ctx.room.name, track);
      }
    });
  },
});

async function processAudioTrack(stt: STT, roomName: string, track: any) {
  const stream = stt.stream();

  track.on("audioFrame", (frame: any) => {
    stream.pushFrame(frame);
  });

  for await (const event of stream) {
    if (event.isFinal && event.alternatives?.[0]?.text?.trim()) {
      await saveTranscript(roomName, event.alternatives[0].text);
    }
  }
}

cli.runApp(new WorkerOptions({ agent: module.exports.default }));
