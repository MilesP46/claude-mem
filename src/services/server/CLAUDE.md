# Server Memory

## Purpose & Entry Points

Express HTTP server wrapper extracted from worker-service monolith. Provides centralized server management with middleware, error handling, and core system endpoints.

- `index.ts` - Barrel export for all server components
- `Server.ts` - Main Server class with Express app lifecycle

## Patterns

- **Class-based server** - `Server` class wraps Express app + http.Server with lifecycle methods
- **RouteHandler interface** - Route modules implement `setupRoutes(app)` for registration
- **ServerOptions injection** - Initialization state, MCP readiness, shutdown/restart callbacks
- **Middleware re-export** - `Middleware.ts` re-exports from `../worker/http/middleware.js`
- **Error-last middleware** - `finalizeRoutes()` adds 404 + global error handlers last

## Key APIs & Interactions

**Exports:**
- `Server` - Main class: `listen()`, `close()`, `registerRoutes()`, `finalizeRoutes()`
- `AppError` - Custom error class with statusCode, code, details
- `errorHandler`, `notFoundHandler` - Express middleware
- `asyncHandler` - Wraps async handlers to catch promise rejections
- `createMiddleware`, `requireLocalhost` - Re-exported from worker/http

**Core Endpoints (built-in):**
- `GET /api/health` - Always responds, includes build/init/MCP status
- `GET /api/readiness` - Returns 503 until initialization complete
- `GET /api/version` - Built-in version from esbuild define
- `POST /api/admin/restart|shutdown` - Localhost-only process control

**Used By:** `worker-service.ts` creates Server instance, registers route handlers

## Dos & Don'ts

- DO call `finalizeRoutes()` after all route handlers registered (error handlers must be last)
- DO use `asyncHandler` wrapper for async route handlers to catch errors
- DO use `AppError` with appropriate statusCode for API errors
- DON'T register routes after `finalizeRoutes()` called
- DON'T expose admin endpoints externally (enforced by `requireLocalhost`)

## Dependencies

None - leaf module, no cross-cutting concerns needed.

## Documented Subdirectories

None (leaf directory).
