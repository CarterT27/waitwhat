# WaitWhat — Technical Specification

A Convex-powered real-time lecture engagement platform.

## 1. Overview

### 1.1 Purpose

WaitWhat enables real-time student engagement during live lectures through:
- Live transcription display
- AI-powered Q&A grounded in lecture content
- Teacher-triggered comprehension quizzes (CFU)
- "I'm lost" signals with spike detection

### 1.2 Success Criteria (POC Demo)

The following flow must work end-to-end:
1. Teacher starts session → join code appears
2. Students join → transcript updates live
3. Student asks AI question → receives grounded response
4. Teacher launches quiz → students answer
5. Teacher sees quiz accuracy update in real-time
6. Students hit "lost" → teacher sees spike indicator

---

## 2. User Roles

| Role | Capabilities |
|------|-------------|
| **Teacher** | Start session, upload slides, trigger quizzes, view insights (quiz stats, lost spikes) |
| **Student** | Join via code, view transcript, ask AI questions, take quizzes, mark "I'm lost" |

---

## 3. Architecture

### 3.1 System Components

```
┌─────────────────┐     ┌─────────────────┐
│  Teacher UI     │     │   Student UI    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Convex    │
              │  Backend    │
              └──────┬──────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌────────▼────────┐
│  Transcription  │    │   LLM Provider  │
│    Producer     │    │  (Q&A + Quiz)   │
└─────────────────┘    └─────────────────┘
```

### 3.2 Technology Stack

- **Backend**: Convex (single source of truth + real-time updates)
- **Frontend**: React (Teacher Console + Student UI)
- **Transcription**: LiveKit STT → Convex mutations
- **AI**: LLM for Q&A and quiz generation

### 3.3 Real-time Strategy

Clients subscribe to Convex queries. No custom WebSocket implementation required—Convex handles real-time updates automatically when mutations write new data.

---

## 4. Data Model

### 4.1 Tables

#### `sessions`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `code` | string | Unique, human-readable join code (e.g., "blue-tiger") |
| `status` | "live" \| "ended" | Session state |
| `createdAt` | number | Timestamp |
| `contextText` | string? | Uploaded slides/context |
| `activeQuizId` | ID? | Currently active quiz |

#### `transcriptLines`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `sessionId` | ID | Foreign key to sessions |
| `text` | string | Transcript segment |
| `createdAt` | number | Timestamp |

> **Note**: Append-only design avoids conflicts and enables efficient real-time sync.

#### `quizzes`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `sessionId` | ID | Foreign key to sessions |
| `createdAt` | number | Timestamp |
| `questions` | Question[] | Array of quiz questions |

**Question Schema:**
```typescript
{
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
}
```

#### `quizResponses`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `quizId` | ID | Foreign key to quizzes |
| `studentId` | string | Student identifier |
| `answers` | number[] | Selected choice indices |
| `createdAt` | number | Timestamp |

#### `lostEvents`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `sessionId` | ID | Foreign key to sessions |
| `studentId` | string | Student identifier |
| `createdAt` | number | Timestamp |

#### `questions`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ID | Primary key |
| `sessionId` | ID | Foreign key to sessions |
| `studentId` | string | Student identifier |
| `question` | string | Student's question |
| `answer` | string? | AI-generated answer |
| `createdAt` | number | Timestamp |

---

## 5. API Surface (Convex Functions)

### 5.1 Mutations (Writes)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `createSession` | — | `{ sessionId, code }` | Start new lecture session |
| `uploadSlides` | `sessionId, slidesText` | — | Add context for AI |
| `joinSession` | `code` | `{ sessionId, studentId }` | Student joins via code |
| `appendTranscriptLine` | `sessionId, { text }` | — | Add transcript segment |
| `launchQuiz` | `sessionId` | `{ quizId }` | Generate and activate quiz |
| `submitQuiz` | `quizId, studentId, answers` | — | Record student responses |
| `markLost` | `sessionId, studentId` | — | Record "I'm lost" event |
| `askQuestion` | `sessionId, studentId, question` | `{ questionId }` | Submit question to AI |
| `saveAnswer` | `questionId, answer` | — | Store AI response |

### 5.2 Queries (Real-time Reads)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSessionByCode` | `code` | `session` | Lookup session by join code |
| `getSession` | `sessionId` | `session` | Get session details |
| `listTranscript` | `sessionId, limit?` | `transcriptLines[]` | Last N transcript lines (default 200) |
| `getActiveQuiz` | `sessionId` | `quiz \| null` | Current quiz if any |
| `getQuizStats` | `quizId` | `{ perQuestionAccuracy, choiceDistributions }` | Quiz analytics |
| `getLostSpikeStats` | `sessionId` | `{ last60sCount, last5mCount, buckets[] }` | Lost event analytics |
| `listRecentQuestions` | `sessionId, limit?` | `questions[]` | Recent Q&A (default 20) |

---

## 6. Real-time Subscriptions

### 6.1 Student Subscriptions
- `listTranscript(sessionId)` — Live transcript updates
- `getActiveQuiz(sessionId)` — Quiz activation/deactivation
- `listRecentQuestions(sessionId)` — Q&A feed

### 6.2 Teacher Subscriptions
- `listTranscript(sessionId)` — Optional transcript monitor
- `getQuizStats(activeQuizId)` — Live quiz results
- `getLostSpikeStats(sessionId)` — Lost signal indicators

---

## 7. Transcription Pipeline

### 7.1 Flow
```
Teacher Mic → STT Service (LiveKit) → appendTranscriptLine() → Convex
```

### 7.2 Constraints
- Batch lines every ~0.5–2 seconds (not per-word)
- Append-only writes
- Clients render last N lines with auto-scroll

### 7.3 Demo Fallback
If STT is unreliable, use a "fake transcriber" script that pushes prepared transcript lines on a timer.

---

## 8. AI Engine

### 8.1 Context Builder

For both Q&A and quiz generation, build context from:
1. `contextText` (uploaded slides)
2. Last N transcript lines (or entire transcript if small)
3. Optional: recent Q&A pairs for continuity

### 8.2 Q&A Flow
1. `askQuestion()` stores question row
2. AI action reads context, generates grounded answer
3. `saveAnswer()` updates question row
4. Client receives update via subscription

### 8.3 Quiz Generation Flow
1. `launchQuiz()` gathers last 2–5 minutes of transcript + slides
2. LLM generates 3 MCQs in JSON format
3. Quiz stored in `quizzes` table
4. `sessions.activeQuizId` set to new quiz ID
5. Students receive quiz via `getActiveQuiz` subscription

### 8.4 Fallback
If LLM call fails, use a fixed fallback quiz payload.

---

## 9. Teacher Insights

### 9.1 Quiz Stats
Computed from `quizResponses`:
- Accuracy per question
- Choice distribution per question
- Top-missed questions

### 9.2 Lost Spikes
Computed from `lostEvents`:
- Count in last 60 seconds
- Count in last 5 minutes
- Time-bucketed histogram

---

## 10. UI Specifications

### 10.1 Teacher Console

| View | Components |
|------|------------|
| **Start Screen** | "Start Session" button |
| **Session Active** | Join code display, QR code, "Upload Slides" button, "Launch Quiz" button |
| **Insights Panel** | Quiz stats (live updating), Lost spike counter/graph |

### 10.2 Student UI

| View | Components |
|------|------------|
| **Join Screen** | Code input field, "Join" button, QR scanner option |
| **Session Room** | Transcript view (scrolling), "Ask AI" chat input, "I'm Lost" button |
| **Quiz Modal** | Appears when `activeQuizId` is set, MCQ interface, Submit button |

---

## 11. Build Phases

### Phase 1: Core Session + Transcript (1–2h)
- [ ] Convex schema setup (sessions, transcriptLines)
- [ ] `createSession`, `joinSession` mutations
- [ ] `appendTranscriptLine` mutation
- [ ] `listTranscript` query with real-time subscription
- [ ] Basic Teacher/Student UI with transcript display

### Phase 2: Quiz System (1–2h)
- [ ] Quiz tables (quizzes, quizResponses)
- [ ] `launchQuiz`, `submitQuiz` mutations
- [ ] `getActiveQuiz`, `getQuizStats` queries
- [ ] Quiz UI for students (modal)
- [ ] Quiz stats display for teacher

### Phase 3: Lost Signals (0.5–1h)
- [ ] lostEvents table
- [ ] `markLost` mutation
- [ ] `getLostSpikeStats` query
- [ ] "I'm Lost" button for students
- [ ] Spike indicator for teacher

### Phase 4: AI Integration + Polish (1–2h)
- [ ] questions table
- [ ] `askQuestion`, `saveAnswer` mutations
- [ ] `uploadSlides` mutation
- [ ] AI context builder
- [ ] Q&A UI for students
- [ ] Slide upload UI for teacher

---

## 12. Fallback Strategies

| Component | Primary | Fallback |
|-----------|---------|----------|
| Transcription | LiveKit STT | Scripted fake transcriber |
| Quiz Generation | LLM-generated | Static quiz payload |
| AI Q&A | LLM with context | Generic "unable to answer" response |

---

## 13. Future Considerations (Out of Scope for POC)

- Authentication/authorization
- Persistent student accounts
- Session recording/playback
- Analytics dashboard
- Multiple concurrent sessions per teacher
- Slide file upload (PDF/PPT parsing)
- Mobile-optimized UI
