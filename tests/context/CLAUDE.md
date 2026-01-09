# Context Tests Memory

## Purpose & Entry Points
- Tests for the context generation system (`src/services/context/`)
- Entry: `bun test tests/context/` or individual test files

## Patterns
- **Framework:** Bun test (`bun:test` - describe/it/expect/mock/beforeEach)
- **Mocking:** `mock.module()` for dependency isolation (logger, SessionStore, ModeManager, SettingsDefaultsManager)
- **Test Data:** Helper functions per file (`createTestObservation()`, `createTestConfig()`, `createTestEconomics()`)
- **Structure:** Describe blocks mirror source module exports

## Key Test Coverage
- `context-builder.test.ts` - `generateContext()`, `loadContextConfig()` (end-to-end context generation)
- `observation-compiler.test.ts` - `queryObservations()`, `querySummaries()`, `buildTimeline()`, `getPriorSessionMessages()`
- `token-calculator.test.ts` - `calculateObservationTokens()`, `calculateTokenEconomics()`, `CHARS_PER_TOKEN_ESTIMATE`
- `formatters/markdown-formatter.test.ts` - All `renderMarkdown*()` functions (17 exports)

## Dos & Don'ts
- DO mock dependencies before importing modules that use them (order matters)
- DO use helper functions for consistent test data creation
- DON'T import source modules at top level if they have side effects
- DON'T rely on real database - mock SessionStore

## Documented Subdirectories

**Other:** `formatters/` (single test file for MarkdownFormatter)
