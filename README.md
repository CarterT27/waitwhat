# WaitWhat

Real-time lecture engagement platform powered by Convex.

## Features

- Live transcription display
- AI-powered Q&A (Gemini 2.5 Flash)
- Teacher-triggered comprehension quizzes
- "I'm lost" signals with spike detection

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

The transcription worker lives in `agent/`.

If you run/deploy it in Docker, make sure the image includes **system CA certificates** (`ca-certificates`). `@livekit/rtc-node` uses a native (Rust) engine that relies on the OS trust store; without it you can hit connect failures like **“failed to retrieve region info”** against LiveKit Cloud.

## Documentation

See [SPEC.md](./SPEC.md) for full technical specification.
