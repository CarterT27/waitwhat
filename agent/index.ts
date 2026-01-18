import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as silero from '@livekit/agents-plugin-silero';
import { fileURLToPath } from 'node:url';

const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL!;
const TRANSCRIPTION_SECRET = process.env.TRANSCRIPTION_SECRET!;

async function saveTranscript(sessionId: string, text: string) {
  if (!text.trim()) return;
  console.log(`[Transcript] ${sessionId}: ${text}`);

  try {
    const response = await fetch(`${CONVEX_SITE_URL}/transcription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, text, secret: TRANSCRIPTION_SECRET }),
    });
    if (!response.ok) {
      console.error(`Failed to save: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving transcript:', error);
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    console.log('Prewarming: loading VAD model...');
    proc.userData.vad = await silero.VAD.load();
    console.log('VAD model loaded');
  },

  entry: async (ctx: JobContext) => {
    const sessionId = ctx.room.name; // Room name = Convex session ID
    console.log(`Agent joining room: ${sessionId}`);

    const session = new voice.AgentSession({
      stt: new deepgram.STT({ model: 'nova-2' }),
      vad: ctx.proc.userData.vad as silero.VAD,
    });

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (event) => {
      if (event.isFinal) {
        saveTranscript(sessionId, event.transcript);
      }
    });

    await session.start({
      agent: new voice.Agent({ instructions: 'Transcription agent' }),
      room: ctx.room,
      outputOptions: {
        audioEnabled: false,        // Don't publish audio
        transcriptionEnabled: false, // Don't publish to room (we POST to Convex)
      },
    });

    console.log(`Agent connected to room: ${sessionId}`);
  },
});

cli.runApp(new WorkerOptions({
  agent: fileURLToPath(import.meta.url),
  initializeProcessTimeout: 180000, // 3 minutes for container environments
}));
