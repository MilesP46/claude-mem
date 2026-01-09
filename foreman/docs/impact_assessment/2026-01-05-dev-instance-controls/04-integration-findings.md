# Impact Assessment: Dev Instance Controls - Integration & Documentation

**Date:** 2026-01-05
**Change Type:** Configuration / Integration
**Estimated Complexity:** Low

## Executive Summary

### Change Overview
Enable local development on port 37778 with isolated data directory while production plugin runs on port 37777. Key challenge: preventing both instances from capturing the same project's Claude Code sessions.

### Scope
- Backend: Yes - port/data-dir configuration via settings
- Frontend: No changes needed
- Database: Yes - separate SQLite databases per instance
- Tests: 0 files requiring updates

### Impact Radius
- Files directly modified: 0 (configuration only)
- Files indirectly affected: All hooks (read settings at runtime)
- Configuration files: `~/.claude-mem-dev/settings.json` (new)

### Risk Level
Low - Configuration-only changes, no code modifications required

---

## Current Architecture Analysis

### How Hooks Find the Worker

**Entry Point:** `plugin/hooks/hooks.json`
- Hooks run via `${CLAUDE_PLUGIN_ROOT}/scripts/*.js`
- Each hook calls `ensureWorkerRunning()` then `getWorkerPort()`

**Port Resolution:** `src/shared/worker-utils.ts:23-31`
```
getWorkerPort() reads from SettingsDefaultsManager
  -> settingsPath = DATA_DIR + '/settings.json'
  -> DATA_DIR defaults to ~/.claude-mem
  -> CLAUDE_MEM_WORKER_PORT defaults to 37777
```

**Data Directory:** `src/shared/SettingsDefaultsManager.ts:76`
```
CLAUDE_MEM_DATA_DIR: join(homedir(), '.claude-mem')
```

### Key Insight
Settings are read from `CLAUDE_MEM_DATA_DIR/settings.json`. If DATA_DIR can be overridden before settings load, the entire instance isolation follows automatically.

---

## Integration Strategies

### Approach A: Disable Plugin, Use Local Hooks (NOT RECOMMENDED)

**Mechanism:**
1. Remove/disable plugin from `~/.claude/plugins/marketplaces/thedotmack/`
2. Build local hooks pointing to dev instance
3. Install local hooks in project or user scope

**Problems:**
- Loses memory collection in other projects
- Complex switching between dev/prod modes
- Risk of forgetting to re-enable production

**Verdict:** Too disruptive for daily workflow

---

### Approach B: Project Filtering Per Instance (PARTIAL SOLUTION)

**Mechanism:**
Add project allowlist/blocklist to settings:
```json
{
  "CLAUDE_MEM_ALLOWED_PROJECTS": ["other-project"],
  "CLAUDE_MEM_BLOCKED_PROJECTS": ["claude-mem"]
}
```

**Problems:**
- Requires code changes to implement filtering
- Both instances still run hooks on all projects (wasteful)
- Complex configuration management

**Verdict:** Unnecessary complexity; better solutions exist

---

### Approach C: Environment Variable Override (RECOMMENDED)

**Mechanism:**
The production plugin uses default settings. Dev sessions override via environment:

```bash
# In dev terminal before running Claude Code
export CLAUDE_MEM_DATA_DIR=~/.claude-mem-dev
```

**How It Works:**
1. `SettingsDefaultsManager.ts:76` defines default: `join(homedir(), '.claude-mem')`
2. Settings load from `$CLAUDE_MEM_DATA_DIR/settings.json`
3. Port, database, logs all derive from DATA_DIR

**Current Gap:** SettingsDefaultsManager does NOT check environment variables - it only provides compile-time defaults.

**Required Change:** Modify `SettingsDefaultsManager.get()` to check `process.env` first:
```typescript
static get(key: keyof SettingsDefaults): string {
  return process.env[key] || this.DEFAULTS[key];
}
```

**Files Affected:**
- `src/shared/SettingsDefaultsManager.ts:108-110` - Add env var check

---

## Recommended Solution: Dev Instance Setup

### Step 1: Create Dev Data Directory

```bash
mkdir -p ~/.claude-mem-dev
```

### Step 2: Create Dev Settings File

```json
// ~/.claude-mem-dev/settings.json
{
  "CLAUDE_MEM_WORKER_PORT": "37778",
  "CLAUDE_MEM_PROVIDER": "claude-sdk"
}
```

### Step 3: Start Dev Worker Manually

```bash
cd /Users/miles/CodingMac/claude-mem
CLAUDE_MEM_DATA_DIR=~/.claude-mem-dev npm run worker:start
```

### Step 4: Run Claude Code in Dev Mode

```bash
cd /Users/miles/CodingMac/claude-mem
CLAUDE_MEM_DATA_DIR=~/.claude-mem-dev claude
```

### Behavior
- Production plugin hooks load default settings (port 37777, ~/.claude-mem)
- Dev session's hooks inherit `CLAUDE_MEM_DATA_DIR` from environment
- Dev hooks connect to port 37778, write to ~/.claude-mem-dev/claude-mem.db
- No overlap, no duplicate collection

---

## Implementation Checklist

### Required Code Change (1 file, ~3 lines)

**File:** `src/shared/SettingsDefaultsManager.ts`
**Location:** Line 108-110 (get method)
**Change:** Check process.env before returning default

### Configuration (No Code)

1. Create `~/.claude-mem-dev/` directory
2. Create `~/.claude-mem-dev/settings.json` with port 37778
3. Document the workflow in project README or developer docs

---

## Risk Assessment

### Breaking Changes
None - environment variable override is additive

### Backward Compatibility
Full - existing behavior unchanged when env vars not set

### Performance Implications
None - single env var check per settings read (already cached)

### Security Considerations
None - local development only, no network exposure

---

## Notes

### Why This Works
Claude Code inherits environment from the shell that launches it. Hooks run as child processes of Claude Code, inheriting the same environment. Thus `CLAUDE_MEM_DATA_DIR` propagates through the entire stack.

### Alternative: Wrapper Script
If modifying SettingsDefaultsManager is undesirable, create a shell alias:
```bash
alias claude-dev='CLAUDE_MEM_DATA_DIR=~/.claude-mem-dev claude'
```

This works with current code if SettingsDefaultsManager already checks env (verify before relying on this).
