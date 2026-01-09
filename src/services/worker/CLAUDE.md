# Worker Service Memory

## Purpose & Entry Points

Express HTTP server (port 37777) handling all claude-mem operations. Managed by PM2. Routes HTTP requests to services, MCP server, and database layer.

- **Entry:** `WorkerService.ts` - slim orchestrator (~150 lines)
- **Request Flow:** Hook -> HTTP -> Route Handler -> MCP/Service -> Database

## Patterns

- **Route organization:** Feature-based route classes (Session, Data, Search, Settings, Viewer)
- **Dependency injection:** Route classes receive only needed services
- **Bound methods:** All handlers use `.bind(this)` for context preservation
- **Consistent errors:** Try/catch with `logger.failure()` in all handlers
- **Agent abstraction:** SDKAgent, GeminiAgent, OpenRouterAgent share response processing via `agents/` utilities

## Key APIs

| Service | Purpose |
|---------|---------|
| `SessionManager` | Event-driven session lifecycle, message queues |
| `DatabaseManager` | Single long-lived SQLite connection, ChromaSync access |
| `SearchManager` | Delegates to `search/SearchOrchestrator` for queries |
| `SDKAgent` | Claude Agent SDK subprocess, event-driven query loop |
| `GeminiAgent` | Gemini API with rate limiting, fallback to Claude |
| `OpenRouterAgent` | OpenRouter API, dynamic model selection across providers |
| `SSEBroadcaster` | Real-time updates to connected clients |

**HTTP Routes:** SessionRoutes, DataRoutes, SearchRoutes, SettingsRoutes, ViewerRoutes

## Dos & Don'ts

- DO use `memorySessionId` (not `contentSessionId`) for FK constraints
- DO add assistant responses to `session.conversationHistory` for provider interop
- DO check `isChromaAvailable()` before assuming semantic search
- DON'T block on Chroma sync - failures non-critical, use fire-and-forget
- DON'T access search strategies directly - use `SearchOrchestrator` methods

## Dependencies

None - internal worker infrastructure with no cross-cutting concerns.

## Documented Subdirectories

- `agents/` - Shared utilities for SDK/Gemini/OpenRouter agents (response processing, broadcasting, error handling)
- `search/` - Search orchestration with strategy pattern, fallback logic, result formatting
- `http/routes/` - Feature-based HTTP route handlers

**Other:** `events/` (session event broadcasting), `session/` (completion handler), `validation/` (privacy checks)

## Architecture Notes

**MCP vs Direct DB Split:**
- Search operations -> MCP server (mem-search)
- Session/data operations -> Direct DB access via service layer

**Agent System:**
- Three agents: SDKAgent (Claude SDK), GeminiAgent (Google), OpenRouterAgent (100+ models)
- All use shared `agents/` utilities for XML parsing, DB sync, SSE broadcast
- GeminiAgent/OpenRouterAgent can fallback to Claude on errors
