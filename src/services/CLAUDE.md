# Services Memory

## Purpose & Entry Points

Backend service layer orchestrating persistent memory functionality. The `WorkerService` class in `worker-service.ts` is the main entry point - it starts the Express API server, initializes databases, connects to MCP, and coordinates all service modules.

- `worker-service.ts` - Main orchestrator with CLI (start/stop/restart/status/cursor commands)
- `worker-types.ts` - Shared type definitions for sessions, SSE, pagination, database records

## Patterns

- **Slim Orchestrator**: WorkerService delegates to specialized modules (server/, infrastructure/, worker/)
- **Constructor Injection**: Services receive dependencies via constructor (DatabaseManager, SessionManager)
- **Background Initialization**: HTTP server starts immediately, slow init (DB, MCP) runs async
- **Singleton Pattern**: ModeManager uses getInstance() for mode profile access
- **Async Iterators**: SessionQueueProcessor yields messages with EventEmitter wake-ups

## Key APIs & Interactions

**WorkerService** (main class):
- `start()` - Binds HTTP server, triggers background init
- `shutdown()` - Graceful cleanup via GracefulShutdown
- `processPendingQueues()` - Recovers orphaned session work
- `broadcastProcessingStatus()` - SSE notifications

**worker-types.ts** exports:
- `ActiveSession`, `PendingMessage`, `PendingMessageWithId`
- `Observation`, `Summary`, `UserPrompt`, `DBSession`
- `SSEEvent`, `PaginatedResult`, `PaginationParams`

**Callers**: Hooks call worker HTTP endpoints; worker calls sqlite/, worker/, infrastructure/

## Dos & Don'ts

- DO use DatabaseManager for all DB access (not direct sqlite calls)
- DO register routes via `server.registerRoutes()` pattern
- DO handle signals via `createSignalHandler` for proper cleanup
- DON'T block HTTP server start with slow initialization
- DON'T access MCP client before `mcpReady` flag is true

## Documented Subdirectories

- `context/` - Context generation pipeline (ContextBuilder, sections, formatters)
- `infrastructure/` - Process management, health monitoring, graceful shutdown
- `integrations/` - IDE integrations (Cursor hooks installer)
- `server/` - Express HTTP server, middleware, error handling
- `sqlite/` - SQLite database layer (SessionStore, PendingMessageStore)
- `worker/` - Business logic, AI agents, route handlers

**Other:** `domain/` (ModeManager singleton), `queue/` (SessionQueueProcessor), `sync/` (ChromaSync vector DB)
