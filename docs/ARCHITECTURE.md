# WaitWhat Architecture

## AI Integration Approach

WaitWhat uses **Convex HTTP actions** with OpenAPI-compatible LLM endpoints for AI features.

### Architecture

```
Client Request → Convex HTTP Action → OpenAPI LLM Endpoint → Convex Mutation
```

- **Convex HTTP Actions**: Handle LLM API calls (supports any OpenAPI-compatible provider)
- **Environment Variables**: Store API keys securely in Convex dashboard
- **Fallback Strategy**: Graceful degradation if LLM unavailable

### Planned AI Features

1. **Quiz Generation** - Generate MCQ questions from transcript + slide context
2. **Q&A Responses** - Answer student questions using lecture context
3. **Transcript Summarization** - Provide key takeaways (future)

### Implementation Pattern

```typescript
// convex/ai.ts
export const generateQuizQuestions = httpAction(async (ctx, request) => {
  const { sessionId, context } = await request.json();

  // Call OpenAPI-compatible LLM endpoint
  const response = await fetch(process.env.LLM_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({ prompt: buildQuizPrompt(context) }),
  });

  const questions = parseQuizResponse(await response.json());

  // Store via mutation
  await ctx.runMutation(internal.quizzes.launchQuiz, { sessionId, questions });
});
```

### AI Implementation Status

- [ ] Set up Convex HTTP actions for AI
- [ ] Quiz generation endpoint
- [ ] Q&A response endpoint
- [ ] Error handling and fallbacks

---

## Transcription Pipeline (Planned)

Real-time transcription will use LiveKit STT to convert teacher audio to text.

### Planned Architecture

```
Teacher Mic → LiveKit Room → STT Service → appendTranscriptLine() → Convex
```

### Implementation Status

- [x] Convex schema for transcriptLines
- [x] appendTranscriptLine mutation
- [x] listTranscript query with real-time subscriptions
- [ ] LiveKit integration
- [ ] Teacher audio capture UI
- [ ] STT service configuration

### Testing Without LiveKit

For testing, manually insert transcript lines via the Convex dashboard
or use the Convex CLI to call appendTranscriptLine directly:

```bash
npx convex run transcripts:appendTranscriptLine '{"sessionId": "<session-id>", "text": "Test transcript line"}'
```
