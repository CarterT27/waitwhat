# WaitWhat

Real-time lecture engagement platform powered by Convex.

## Features

- Live transcription display (LiveKit + Deepgram)
- AI-powered Q&A (Gemini 2.5 Flash)
- Teacher-triggered comprehension quizzes (AI-generated from transcript content since last quiz)
- "I'm lost" signals with spike detection
- QR code join for students
- Session notes export (PDF)

## Built With

### Core Infrastructure

- [Convex](https://convex.dev) - Real-time database and backend platform
- [Google Gemini 2.5 Flash](https://ai.google.dev/gemini-api) - AI model for Q&A, quiz generation, and session summaries
- [LiveKit](https://livekit.io) - Real-time audio infrastructure for live transcription
- [Deepgram Nova-3](https://deepgram.com) - Speech-to-text transcription engine
- [Token Company](https://www.tokencompany.com) - Prompt compression API for reduced token costs

### Frontend & Tooling

- [React 19](https://react.dev) - UI framework
- [TanStack Router](https://tanstack.com/router) & [Start](https://tanstack.com/start) - Type-safe routing and SSR
- [TailwindCSS 4](https://tailwindcss.com) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide React](https://lucide.dev) - Icon system
- [Vite 7](https://vite.dev) - Build tool and dev server
- [TypeScript 5](https://www.typescriptlang.org) - Type-safe JavaScript
- [Vitest](https://vitest.dev) - Unit testing framework
- [LiveKit Client SDK](https://docs.livekit.io/realtime/) - Real-time audio integration
- [qrcode](https://www.npmjs.com/package/qrcode) - QR code generation for session join
- [jsPDF](https://github.com/parallax/jsPDF) - PDF export for session notes
- [LiveKit Agents](https://docs.livekit.io/agents/) - Transcription worker framework
- [TSX](https://tsx.is) - TypeScript execution for agent runtime

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

## Quiz Generation

When a teacher generates a quiz, the AI uses transcript content **since the last quiz** (not a fixed 5-minute window). This prevents overlap when quizzes are generated in quick succession.

| Scenario | Behavior |
|----------|----------|
| First quiz in session | Uses last 5 minutes of transcript |
| Subsequent quizzes | Uses content since previous quiz's creation time |
| Very long gap | Still applies 100-line limit to cap context size |

A feature flag (`USE_SINCE_LAST_QUIZ` in `convex/quizzes.ts`) can revert to the legacy 5-minute window behavior if needed.

## Documentation

See [SPEC.md](./SPEC.md) for full technical specification.
