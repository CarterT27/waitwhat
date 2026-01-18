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

// Validate required environment variables at startup
const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
const TRANSCRIPTION_SECRET = process.env.TRANSCRIPTION_SECRET;

if (!CONVEX_SITE_URL || !TRANSCRIPTION_SECRET) {
  console.error('Missing required environment variables:', {
    CONVEX_SITE_URL: CONVEX_SITE_URL ? '✓' : '✗ missing',
    TRANSCRIPTION_SECRET: TRANSCRIPTION_SECRET ? '✓' : '✗ missing',
  });
  process.exit(1);
}

async function saveTranscript(sessionId: string, text: string, maxRetries = 3) {
  if (!text.trim()) return;
  console.log(`[Transcript] ${sessionId}: ${text}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${CONVEX_SITE_URL}/transcription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, text, secret: TRANSCRIPTION_SECRET }),
      });
      if (response.ok) return;

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        console.error(`Failed to save (client error): ${response.status}`);
        return;
      }

      console.warn(`Failed to save (attempt ${attempt}/${maxRetries}): ${response.status}`);
    } catch (error) {
      console.warn(`Error saving transcript (attempt ${attempt}/${maxRetries}):`, error);
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
    }
  }
  console.error(`Failed to save transcript after ${maxRetries} attempts`);
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    console.log('Prewarming: loading VAD model...');
    proc.userData.vad = await silero.VAD.load();
    console.log('VAD model loaded');
  },

  entry: async (ctx: JobContext) => {
    const sessionId = ctx.room.name;
    if (!sessionId) {
      console.error('Room name is required for session ID');
      return;
    }
    console.log(`Agent joining room: ${sessionId}`);

    const session = new voice.AgentSession({
      stt: new deepgram.STT({ model: 'nova-3' }),
      vad: ctx.proc.userData.vad as silero.VAD,
    });

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (event) => {
      if (event.isFinal && event.transcript) {
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
