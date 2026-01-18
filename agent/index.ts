/**
 * LiveKit Transcription Agent
 *
 * This agent listens to the teacher's audio in a LiveKit room and transcribes it
 * using Deepgram STT, then saves the transcripts to Convex.
 *
 * DEPLOYMENT:
 * - LOCAL: Run with `bun dev` (loads .env automatically)
 * - LIVEKIT CLOUD: Auto-deployed via GitHub Actions on push to main
 *
 * Required environment variables (set in .env for local, GitHub secrets for Cloud):
 * - LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
 * - DEEPGRAM_API_KEY
 * - CONVEX_SITE_URL, TRANSCRIPTION_SECRET
 */

import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  voice,
  AutoSubscribe,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as silero from '@livekit/agents-plugin-silero';
import { fileURLToPath } from 'node:url';

// Validate required environment variables at startup
const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
const TRANSCRIPTION_SECRET = process.env.TRANSCRIPTION_SECRET;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL ?? 'nova-3';

if (!CONVEX_SITE_URL || !TRANSCRIPTION_SECRET || !DEEPGRAM_API_KEY) {
  console.error('Missing required environment variables:', {
    CONVEX_SITE_URL: CONVEX_SITE_URL ? '✓' : '✗ missing',
    TRANSCRIPTION_SECRET: TRANSCRIPTION_SECRET ? '✓' : '✗ missing',
    DEEPGRAM_API_KEY: DEEPGRAM_API_KEY ? '✓' : '✗ missing',
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
    try {
      const t0 = Date.now();
      const sinceStart = () => `${Date.now() - t0}ms`;

      console.log('Entry function started');
      console.log('Job ID:', ctx.job.id);
      console.log('Room from job:', ctx.job.room?.name);
      console.log('Room SID:', ctx.job.room?.sid);
      // The participant that triggered the job is useful for debugging dispatch/race issues.
      // (Field presence depends on LiveKit Agents runtime.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobAny = ctx.job as any;
      if (jobAny?.participant) {
        console.log('Job participant:', jobAny.participant);
      }
      console.log('Connecting to room...');
      await ctx.connect(undefined, AutoSubscribe.AUDIO_ONLY);
      console.log(`[${sinceStart()}] Connected to room`);

      const sessionId = ctx.room.name;
      if (!sessionId) {
        console.error('Room name is required for session ID');
        return;
      }

      // ---- Room instrumentation (debug) ----
      // These logs help confirm whether we're actually seeing the teacher participant and audio tracks,
      // and whether subscription events fire (race-condition troubleshooting).
      const logRoomState = (label: string) => {
        const participants = Array.from(ctx.room.remoteParticipants.values());
        console.log(`[${sinceStart()}] ${label}`, {
          remoteParticipantCount: participants.length,
          remoteParticipants: participants.map((p: any) => ({
            identity: p.identity,
            audioPubs: p.audioTrackPublications?.size ?? 0,
            videoPubs: p.videoTrackPublications?.size ?? 0,
          })),
        });
      };

      logRoomState('Room state after connect');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safePub = (pub: any) => ({
        kind: pub?.kind,
        source: pub?.source,
        isSubscribed: pub?.isSubscribed,
        sid: pub?.trackSid,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ensureSubscribedToAllRemoteAudio = (participant?: any) => {
        const participants = participant ? [participant] : Array.from(ctx.room.remoteParticipants.values());
        for (const p of participants) {
          const pubs = Array.from(p.audioTrackPublications?.values?.() ?? []);
          for (const pub of pubs) {
            try {
              if (pub && pub.isSubscribed !== true && typeof pub.setSubscribed === 'function') {
                pub.setSubscribed(true);
              }
            } catch (e) {
              console.warn(`[${sinceStart()}] Failed to force-subscribe audio`, {
                participant: p?.identity,
                error: e,
              });
            }
          }
        }
      };

      ctx.room.on('participantConnected', (p: any) => {
        console.log(`[${sinceStart()}] participantConnected`, { identity: p?.identity });
        logRoomState('Room state after participantConnected');
        ensureSubscribedToAllRemoteAudio(p);
      });

      ctx.room.on('participantDisconnected', (p: any) => {
        console.log(`[${sinceStart()}] participantDisconnected`, { identity: p?.identity });
        logRoomState('Room state after participantDisconnected');
      });

      ctx.room.on('trackPublished', (pub: any, participant: any) => {
        console.log(`[${sinceStart()}] trackPublished`, {
          participant: participant?.identity,
          publication: safePub(pub),
        });
        ensureSubscribedToAllRemoteAudio(participant);
      });

      ctx.room.on('trackSubscribed', (track: any, pub: any, participant: any) => {
        console.log(`[${sinceStart()}] trackSubscribed`, {
          participant: participant?.identity,
          kind: track?.kind,
          publication: safePub(pub),
        });
      });

      ctx.room.on('trackUnpublished', (pub: any, participant: any) => {
        console.log(`[${sinceStart()}] trackUnpublished`, {
          participant: participant?.identity,
          publication: safePub(pub),
        });
      });

      ctx.room.on('trackUnsubscribed', (track: any, pub: any, participant: any) => {
        console.log(`[${sinceStart()}] trackUnsubscribed`, {
          participant: participant?.identity,
          kind: track?.kind,
          publication: safePub(pub),
        });
      });

      // ---- Wait for teacher participant (avoid starting a session with no user) ----
      // This is a key race: sometimes the room's participant list isn't populated immediately after connect.
      // Starting the AgentSession with no remote participants can result in "no input" forever.
      const waitForTeacher = async (timeoutMs = 15000): Promise<any | null> => {
        const findTeacher = () =>
          Array.from(ctx.room.remoteParticipants.values()).find((p: any) => p?.identity === 'teacher') ??
          null;

        const existing = findTeacher();
        if (existing) return existing;

        return await new Promise((resolve) => {
          const onParticipant = () => {
            const teacher = findTeacher();
            if (teacher) {
              ctx.room.off('participantConnected', onParticipant);
              resolve(teacher);
            }
          };
          ctx.room.on('participantConnected', onParticipant);

          setTimeout(() => {
            ctx.room.off('participantConnected', onParticipant);
            resolve(findTeacher());
          }, timeoutMs);
        });
      };

      const teacher = await waitForTeacher();
      if (!teacher) {
        console.warn(
          `[${sinceStart()}] Teacher participant not found within timeout; starting anyway`,
        );
        logRoomState('Room state before starting AgentSession (no teacher)');
      } else {
        console.log(`[${sinceStart()}] Teacher participant detected`, { identity: teacher.identity });
        ensureSubscribedToAllRemoteAudio(teacher);
      }

      // Wait for audio track to be subscribed before starting session
      const waitForAudioSubscription = async (participant: any, timeoutMs = 10000): Promise<boolean> => {
        const checkSubscribed = () => {
          const pubs = Array.from(participant.audioTrackPublications?.values?.() ?? []);
          return pubs.some((pub: any) => pub.isSubscribed === true);
        };

        if (checkSubscribed()) return true;

        return new Promise((resolve) => {
          const onSubscribed = () => {
            if (checkSubscribed()) {
              ctx.room.off('trackSubscribed', onSubscribed);
              resolve(true);
            }
          };
          ctx.room.on('trackSubscribed', onSubscribed);

          setTimeout(() => {
            ctx.room.off('trackSubscribed', onSubscribed);
            resolve(checkSubscribed());
          }, timeoutMs);
        });
      };

      if (teacher) {
        const hasAudio = await waitForAudioSubscription(teacher);
        if (!hasAudio) {
          console.warn(`[${sinceStart()}] No audio track subscribed for teacher within timeout`);
        } else {
          console.log(`[${sinceStart()}] Audio track subscribed for teacher`);
        }
      }

      console.log(`[${sinceStart()}] Starting transcription session for room`, { sessionId });

    const session = new voice.AgentSession({
      stt: new deepgram.STT({ model: DEEPGRAM_MODEL }),
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
      inputOptions: {
        audioEnabled: true,
      },
      outputOptions: {
        audioEnabled: false,        // Don't publish audio
        transcriptionEnabled: false, // Don't publish to room (we POST to Convex)
      },
    });

    console.log(`[${sinceStart()}] AgentSession started`, { sessionId });
    } catch (error) {
      console.error('Error in entry function:', error);
      throw error;
    }
  },
});

cli.runApp(new WorkerOptions({
  agent: fileURLToPath(import.meta.url),
  // No agentName = auto-dispatch (agent joins any room with participants)
  initializeProcessTimeout: 360000, // 6 minutes - VAD model loading is slow on small VMs
}));
