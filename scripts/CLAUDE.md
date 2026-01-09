# Scripts Memory

## Purpose & Entry Points

Development utilities for building, publishing, and maintaining claude-mem. Contains build automation, release management, database utilities, and debugging tools.

**Key Entry Points:**
- `build-hooks.js` - Primary build script (bundles hooks, worker, MCP server via esbuild)
- `sync-marketplace.cjs` - Deploy to Claude marketplace with beta branch protection
- `publish.js` - Interactive release script (version bump, build, git tag, push)

## Patterns

- **Runtime:** TypeScript utilities use `bun:sqlite` directly; JS scripts use Node.js
- **Execution:** Scripts are standalone CLIs with `#!/usr/bin/env` shebangs
- **Dry-run first:** Database-modifying scripts (cleanup, fix) default to dry-run mode, require `--execute` flag
- **Port/path conventions:** Worker API at localhost:37777, database at `~/.claude-mem/claude-mem.db`

## Key Scripts by Category

**Build System:**
- `build-hooks.js` - esbuild bundler for hooks/worker/MCP (outputs to `plugin/scripts/`)
- `build-viewer.js` - React viewer build
- `smart-install.js` - Auto-installs Bun/uv if missing

**Release/Deploy:**
- `publish.js` - Interactive semver release (patch/minor/major)
- `sync-marketplace.cjs` - Rsync to marketplace + cache, triggers worker restart
- `generate-changelog.js` - Generates CHANGELOG.md from GitHub releases

**Database Utilities:**
- `cleanup-duplicates.ts` - Removes observation duplicates from batching bugs
- `export-memories.ts` / `import-memories.ts` - Portable JSON export/import

**Debugging/Analysis:**
- `check-pending-queue.ts` / `clear-failed-queue.ts` - Queue inspection
- `fix-corrupted-timestamps.ts` - Timestamp repair utilities
- `transcript-to-markdown.ts` - Convert transcripts for analysis

## Dos & Don'ts

**Do:**
- Run database scripts with dry-run first (no flags), then `--execute`
- Use `npm run build-and-sync` for normal development (not raw scripts)
- Check beta branch status before marketplace sync

**Don't:**
- Run `cleanup-duplicates.ts --execute` without reviewing dry-run output
- Modify `publish.js` without understanding git tag workflow
- Skip smart-install.js Bun/uv checks in CI pipelines

## Documented Subdirectories

- `bug-report/` - Bug report collection and diagnostic tools
- `extraction/` - XML extraction utilities for transcript analysis
- `translate-readme/` - README translation automation
- `anti-pattern-test/` - Error handling anti-pattern detection (run before commits)

**Other:** `types/` (shared export types for memory utilities)
