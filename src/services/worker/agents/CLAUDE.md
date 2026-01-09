# Agents Memory

## Purpose & Entry Points

Shared utilities for SDK, Gemini, and OpenRouter agents. Extracts common patterns for response processing, SSE broadcasting, error handling, and session cleanup.

- `index.ts` - barrel export for all utilities

## Patterns

- **Single-responsibility modules** - Each file handles one concern (response processing, broadcasting, errors, cleanup)
- **Provider-agnostic** - Utilities work across Claude SDK, Gemini, and OpenRouter agents
- **Optional worker refs** - All functions accept undefined worker for testing scenarios
- **Fire-and-forget Chroma sync** - Vector sync is async, failures non-critical

## Key APIs

| Export | Purpose |
|--------|---------|
| `processAgentResponse()` | Parse XML, atomic DB save, Chroma sync, SSE broadcast |
| `broadcastObservation()` | SSE broadcast for new observations |
| `broadcastSummary()` | SSE broadcast for new summaries |
| `shouldFallbackToClaude()` | Check if error triggers Claude fallback |
| `isAbortError()` | Detect user cancellation |
| `cleanupProcessedMessages()` | Reset session state after processing |

**Types:** `WorkerRef`, `ObservationSSEPayload`, `SummarySSEPayload`, `StorageResult`, `ResponseProcessingContext`, `ParsedResponse`, `FallbackAgent`, `BaseAgentConfig`

## Dos & Don'ts

- **DO** use `memorySessionId` (not `contentSessionId`) for FK constraints
- **DO** add assistant responses to `session.conversationHistory` for provider interop
- **DON'T** block on Chroma sync - failures are non-critical, use fire-and-forget
- **DON'T** track pending message IDs - claim-and-delete pattern handles this

## Dependencies

None - internal worker infrastructure with no cross-cutting concerns.

## Documented Subdirectories

None - leaf directory.
