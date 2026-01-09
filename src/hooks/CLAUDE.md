# Hooks Memory

## Purpose & Entry Points

Claude Code lifecycle hooks - pure HTTP clients that delegate to worker service. Built from TypeScript to ESM, output to `plugin/scripts/*-hook.js`.

**5 Lifecycle Hooks:**
- `context-hook.ts` - SessionStart: injects memory context via `hookSpecificOutput.additionalContext`
- `new-hook.ts` - UserPromptSubmit: initializes session, starts SDK agent
- `save-hook.ts` - PostToolUse: sends tool observations to worker for storage
- `summary-hook.ts` - Stop: triggers session summary generation
- `user-message-hook.ts` - SessionStart: displays context info to user via stderr

## Patterns

- **Pure HTTP clients** - No native module deps, runtime-agnostic (Node.js or Bun)
- **Stdin/stdout protocol** - Read JSON from stdin, output response to stdout, exit
- **Worker-first** - Call `ensureWorkerRunning()` before any API calls
- **Fire-and-forget** - POST to worker, worker handles DB and privacy checks
- **No AbortSignal** - Removed due to Windows Bun cleanup issue (libuv assertion)

## Key APIs & Interactions

**Exports:**
- `STANDARD_HOOK_RESPONSE` - JSON response: `{ continue: true, suppressOutput: true }`
- Input interfaces: `SessionStartInput`, `UserPromptSubmitInput`, `PostToolUseInput`, `StopInput`

**Worker Endpoints Called:**
- `GET /api/context/inject` - Fetch context for injection (context-hook)
- `POST /api/sessions/init` - Initialize session, get sessionDbId (new-hook)
- `POST /sessions/{id}/init` - Start SDK agent (new-hook)
- `POST /api/sessions/observations` - Store tool observation (save-hook)
- `POST /api/sessions/summarize` - Generate session summary (summary-hook)

**Dependencies:**
- `../shared/worker-utils.js` - `ensureWorkerRunning()`, `getWorkerPort()`
- `../shared/hook-constants.js` - `HOOK_TIMEOUTS`, `HOOK_EXIT_CODES`
- `../utils/logger.js` - Logging with tool formatting

## Dos & Don'ts

**Do:**
- Always call `ensureWorkerRunning()` before fetch calls
- Use `STANDARD_HOOK_RESPONSE` for consistent hook output
- Check collection settings in save-hook before worker startup (avoids 15s wait)
- Strip privacy tags at hook layer (edge processing)

**Don't:**
- Add native module dependencies (breaks runtime agnosticism)
- Use AbortSignal.timeout (Windows Bun libuv assertion issue)
- Perform DB operations directly (delegate to worker)
- Skip input validation before async operations
