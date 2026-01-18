# WaitWhat

Real-time lecture engagement platform powered by Convex.

## Features

- Live transcription display (LiveKit + Deepgram)
- AI-powered Q&A (Gemini 2.5 Flash)
- Teacher-triggered comprehension quizzes (AI-generated)
- "I'm lost" signals with spike detection
- QR code join for students
- Session notes export (PDF)

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy environment template and add your keys:
   ```bash
   cp .env.example .env.local
   ```

3. Start Convex dev server:
   ```bash
   npx convex dev
   ```

4. Start frontend (in another terminal):
   ```bash
   bun run dev
   ```

## Transcription Agent (LiveKit Agents)

The transcription worker lives in `agent/`. It uses Deepgram Nova-3 for STT and sends transcripts to Convex via HTTP.

### Running Locally

```bash
cd agent
cp .env.example .env  # Add your credentials
bun install
bun dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `LIVEKIT_URL` | LiveKit server URL |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `DEEPGRAM_API_KEY` | Deepgram API key for STT |
| `CONVEX_SITE_URL` | Convex deployment URL |
| `TRANSCRIPTION_SECRET` | Shared secret for Convex HTTP endpoint |

### Docker Notes

If deploying in Docker, make sure the image includes **system CA certificates** (`ca-certificates`). `@livekit/rtc-node` uses a native (Rust) engine that relies on the OS trust store; without it you can hit connect failures like **"failed to retrieve region info"** against LiveKit Cloud.

## Documentation

See [SPEC.md](./SPEC.md) for full technical specification.
