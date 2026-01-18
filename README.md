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

## Documentation

See [SPEC.md](./SPEC.md) for full technical specification.
