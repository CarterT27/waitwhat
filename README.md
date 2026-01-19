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

## Setup

### Prerequisites

You'll need accounts with:
- [Convex](https://convex.dev) - Real-time backend
- [LiveKit](https://livekit.io) - Audio infrastructure
- [Deepgram](https://deepgram.com) - Speech-to-text
- [Google AI Studio](https://aistudio.google.com) - Gemini API
- [Token Company](https://tokencompany.com) (optional) - Prompt compression

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy environment template:
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

### Environment Variables

Environment variables must be configured in **three different locations** depending on their purpose:

#### Frontend (`.env.local`)

| Variable | Description | Get From |
|----------|-------------|----------|
| `VITE_CONVEX_URL` | Convex deployment URL | Auto-set by `npx convex dev` |
| `VITE_LIVEKIT_URL` | LiveKit WebSocket URL | [LiveKit Dashboard](https://cloud.livekit.io) |

#### Convex Backend (Dashboard)

These must be set in the [Convex Dashboard](https://dashboard.convex.dev) under **Settings > Environment Variables**, not in local `.env` files.

| Variable | Required | Get From |
|----------|----------|----------|
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `LIVEKIT_API_KEY` | Yes | [LiveKit Dashboard](https://cloud.livekit.io) |
| `LIVEKIT_API_SECRET` | Yes | [LiveKit Dashboard](https://cloud.livekit.io) |
| `TRANSCRIPTION_SECRET` | Yes | Generate: `openssl rand -base64 32` |
| `TOKEN_COMPANY_API_KEY` | No | [Token Company](https://tokencompany.com) |
| `COMPRESSION_ENABLED` | No | Set to `"false"` to disable prompt compression |

#### Transcription Agent (`agent/.env`)

```bash
cd agent
cp .env.example .env
```

| Variable | Description | Get From |
|----------|-------------|----------|
| `LIVEKIT_URL` | LiveKit server URL | [LiveKit Dashboard](https://cloud.livekit.io) |
| `LIVEKIT_API_KEY` | LiveKit API key | Same as Convex Dashboard |
| `LIVEKIT_API_SECRET` | LiveKit API secret | Same as Convex Dashboard |
| `DEEPGRAM_API_KEY` | Deepgram API key | [Deepgram Console](https://console.deepgram.com) |
| `CONVEX_SITE_URL` | Convex HTTP endpoint | Shown after `npx convex dev` (format: `https://xxx.convex.site`) |
| `TRANSCRIPTION_SECRET` | Webhook auth secret | Must match Convex Dashboard setting |

### GitHub Secrets (CI/CD)

The transcription agent auto-deploys to LiveKit Cloud when changes are pushed to `main`. Configure these [repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets):

| Secret | Purpose |
|--------|---------|
| `LIVEKIT_URL` | LiveKit server URL |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `CONVEX_SITE_URL` | Production Convex HTTP endpoint |
| `TRANSCRIPTION_SECRET` | Must match production Convex setting |

## Transcription Agent (LiveKit Agents)

The transcription worker lives in `agent/`. It uses Deepgram Nova-3 for STT and sends transcripts to Convex via HTTP.

### Running Locally

```bash
cd agent
bun install
bun dev
```

See [Transcription Agent environment variables](#transcription-agent-agentenv) in the Setup section above.

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
