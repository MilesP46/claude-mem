# SQLite Database Layer

## Purpose & Entry Points

Core persistence layer for claude-mem using Bun SQLite. Manages sessions, observations, summaries, prompts, and pending message queues with WAL mode, migrations, and optimized PRAGMA settings.

- `index.ts` - Module re-exports (use this for imports)
- `Database.ts` - `ClaudeMemDatabase` class, connection management, PRAGMA config
- `SessionStore.ts` - Legacy monolithic store (deprecated, use modular functions)
- `SessionSearch.ts` - FTS5 search (deprecated, Chroma is primary search)
- `PendingMessageStore.ts` - Work queue with claim-and-delete pattern
- `transactions.ts` - Cross-domain atomic operations

## Patterns

- **Modular Functions**: All CRUD split into domain subdirs (sessions/, observations/, summaries/, prompts/)
- **First Parameter Convention**: Functions take `db: Database` as first param (Bun SQLite instance)
- **Dual Timestamps**: ISO string (`created_at`) + epoch ms (`created_at_epoch`) for all records
- **JSON Columns**: Arrays stored as JSON strings, parsed on read (facts, concepts, files_read)
- **Prepared Statements**: All queries use parameterized statements (SQL injection safe)
- **WAL Mode**: Write-Ahead Logging enabled for concurrent reads during writes

## Key APIs & Interactions

**Initialization:**
- `new ClaudeMemDatabase(path?)` - Create connection with migrations
- `initializeDatabase()` - Legacy async init via DatabaseManager singleton

**Sessions:**
- `createSDKSession(db, contentId, project, prompt)` - Start new session
- `getSessionByContentId(db, id)` / `getSessionByMemoryId(db, id)` - Lookup

**Observations:**
- `storeObservation(db, sessionId, project, observation, ...)` - Insert observation
- `getObservationById(db, id)` / `getObservationsByIds(db, ids, filters)` - Retrieve

**Transactions:**
- `storeObservations(db, ...)` - Atomic multi-observation insert
- `storeObservationsAndMarkComplete(db, ...)` - Atomic insert + queue completion

**Queue:**
- `PendingMessageStore.enqueue(sessionDbId, contentId, message)` - Add to queue
- `PendingMessageStore.claimAndDelete(sessionDbId)` - Atomic claim and delete

**Called by:** Worker service routes, hook handlers, sync services
**Uses:** Bun SQLite, logger utility, shared paths

## Dos & Don'ts

- DO use `ClaudeMemDatabase` for new code (not deprecated `SessionStore`)
- DO use `created_at_epoch` for ordering (numeric, indexed)
- DO wrap multi-table writes in `db.transaction()` or use `transactions.ts`
- DON'T query `text` column in observations (deprecated, use title/subtitle/narrative)
- DON'T use SessionSearch for new search features (use Chroma vector search)
- DON'T bypass PendingMessageStore for queue operations (prevents duplicates)

## Dependencies

None (core infrastructure, no cross-cutting imports needed)

## Documented Subdirectories

**observations/** - Observation CRUD operations (store, get, recent, files)

**Other:** sessions/, summaries/, prompts/ (domain CRUD modules), migrations/ (schema versioning), timeline/ (timeline queries), import/ (bulk import)
