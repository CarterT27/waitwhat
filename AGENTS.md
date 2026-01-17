# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WaitWhat is a Convex-powered real-time lecture engagement platform. Teachers start sessions with join codes, students join to view live transcripts, ask AI questions, take quizzes, and signal when they're lost.

## Technology Stack

- **Backend**: Convex (real-time database, mutations/queries, no custom WebSocket needed)
- **Frontend**: React (Teacher Console + Student UI)
- **Transcription**: LiveKit STT → Convex mutations
- **AI**: LLM for Q&A and quiz generation

## Architecture

The system uses Convex's real-time subscriptions for all live updates. Clients subscribe to queries; Convex handles sync automatically when mutations write data.

### Data Model (6 tables)

- `sessions` - Lecture sessions with join codes, status, contextText, activeQuizId
- `transcriptLines` - **Append-only** transcript segments (critical for real-time performance)
- `quizzes` - Quiz definitions with MCQ questions array
- `quizResponses` - Student answers to quizzes
- `lostEvents` - "I'm lost" signals for spike detection
- `questions` - Student Q&A pairs with AI responses

### Key Design Decisions

1. **Append-only transcripts**: Never update existing lines; always append new ones
2. **Real-time via Convex queries**: No custom WebSocket implementation
3. **Context building for AI**: Combine slides + recent transcript + Q&A for grounded responses
4. **Fallback strategies**: Quiz generation, STT, and AI responses all need graceful degradation

## Build Phases

Implementation follows 4 phases in order (each depends on the previous):

1. **Core Session + Transcript**: Schema, session management, real-time transcript
2. **Quiz System**: Quiz tables, launch/submit mutations, stats queries, modal UI
3. **Lost Signals**: lostEvents table, markLost mutation, spike detection
4. **AI Integration**: questions table, askQuestion/saveAnswer, slide upload, context builder

## Commands

Once the project is set up with Convex:

```bash
npx convex dev          # Start Convex dev server with hot reload
npx convex deploy       # Deploy to production
npm run dev             # Start frontend dev server (after React setup)
```

## API Surface

### Mutations (Writes)
- `createSession`, `joinSession` - Session management
- `appendTranscriptLine` - Add transcript segment
- `uploadSlides` - Add context for AI
- `launchQuiz`, `submitQuiz` - Quiz operations
- `markLost` - Record "I'm lost" event
- `askQuestion`, `saveAnswer` - Q&A operations

### Queries (Real-time Reads)
- `getSession`, `getSessionByCode` - Session lookup
- `listTranscript` - Last N lines (default 200)
- `getActiveQuiz`, `getQuizStats` - Quiz data and analytics
- `getLostSpikeStats` - Lost event analytics (60s, 5m windows)
- `listRecentQuestions` - Q&A feed (default 20)
