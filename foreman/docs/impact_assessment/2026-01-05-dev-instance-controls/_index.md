# Impact Assessment: Dev Instance Collection Controls

**Date:** 2026-01-05 (Revised v2)
**Change Type:** Full Stack (Backend + Frontend)
**Complexity:** Low-Moderate
**Risk Level:** Low

---

## Executive Summary

### Change Overview

Add collection controls to the forked claude-mem plugin:
- `CLAUDE_MEM_COLLECTION_ENABLED` - Global toggle to pause/resume collection
- `CLAUDE_MEM_ALLOWED_PROJECTS` - Filter which projects collect observations

### Architecture

**Single Instance Model:**
```
/Users/miles/CodingMac/claude-mem    ← Fork (SOURCE)
         │
         │  npm run build-and-sync
         ▼
~/.claude/plugins/marketplaces/thedotmack/  ← Deployed plugin
         │
         │  reads/writes
         ▼
~/.claude-mem/                       ← Data (PRESERVED)
├── claude-mem.db                    ← Existing memories
├── settings.json                    ← Configuration
└── logs/                            ← Logs
```

**Key Insight:** The database and settings are separate from the plugin code. Deploying your fork preserves all existing memories.

### Scope

- **Backend:** 3 files (settings, hooks, validation)
- **Frontend:** 4 files (UI, types, state)
- **Tests:** 3 new test files + 2 mock updates
- **Data:** Preserved (no migration needed)

---

## Impact Map

### Backend Changes

| File | Lines | Change Required |
|------|-------|-----------------|
| `src/shared/SettingsDefaultsManager.ts` | 48, 80, 108-110 | Add 2 settings to interface/defaults; modify `get()` for env vars |
| `src/services/worker/http/routes/SettingsRoutes.ts` | 105, 295 | Add 2 keys to settingKeys array; add boolean validation |
| `src/hooks/save-hook.ts` | 15, 27 | Add isProjectAllowed helper; inject collection check before worker call |

### Frontend Changes

| File | Lines | Change Required |
|------|-------|-----------------|
| `src/ui/viewer/types.ts` | ~65 | Add 2 optional properties to Settings interface |
| `src/ui/viewer/constants/settings.ts` | ~12 | Add 2 default values |
| `src/ui/viewer/hooks/useSettings.ts` | 20 | Add 2 settings to state mapping |
| `src/ui/viewer/components/ContextSettingsModal.tsx` | 562 | Add CollapsibleSection with toggle + FormField |

### Test Changes

| File | Type | Purpose |
|------|------|---------|
| `tests/shared/settings-defaults-manager.test.ts` | NEW | Unit tests for settings defaults |
| `tests/hooks/save-hook-collection.test.ts` | NEW | Tests for collection toggle/filtering |
| `tests/settings/validation.test.ts` | NEW | Tests for settings validation |
| `tests/context/context-builder.test.ts` | UPDATE | Add new settings to mock |
| `tests/gemini_agent.test.ts` | UPDATE | Add new settings to mock |

---

## New Settings Definitions

### CLAUDE_MEM_COLLECTION_ENABLED

- **Type:** String ('true' | 'false')
- **Default:** 'true'
- **Purpose:** Global toggle for observation collection
- **Use Case:** Pause collection when testing, resume when ready

### CLAUDE_MEM_ALLOWED_PROJECTS

- **Type:** String (comma-separated project paths)
- **Default:** '' (empty = all projects allowed)
- **Purpose:** Filter which projects collect observations
- **Matching:** cwd prefix match with path normalization
- **Examples:**
  - '' → Collect for all projects (default, current behavior)
  - '/Users/miles/CodingMac/claude-mem' → Only this project
  - '/path/a,/path/b' → Multiple specific projects

### Filtering Logic

```
1. If COLLECTION_ENABLED !== 'true' → SKIP (collection paused)
2. If ALLOWED_PROJECTS not empty AND project not in list → SKIP
3. Otherwise → COLLECT
```

---

## Detailed Logic Chains

### Chain 1: Settings Loading

**Entry Point:** `SettingsDefaultsManager.ts`
**Exit Point:** Runtime configuration in hooks

**Flow:**
1. `SettingsDefaultsManager.get()` checks `process.env[key]` first (new)
2. Falls back to `DEFAULTS[key]` if no env var
3. `loadFromFile()` merges file settings with defaults
4. Hooks read settings before collection decisions

### Chain 2: Collection Control in Hooks

**Entry Point:** PostToolUse hook receives tool data
**Exit Point:** Either collect to worker or skip silently

**Flow:**
1. `save-hook.ts` - Load settings BEFORE ensureWorkerRunning()
2. Check `CLAUDE_MEM_COLLECTION_ENABLED === 'true'`
   - If false: Return `STANDARD_HOOK_RESPONSE` immediately
3. Check `isProjectAllowed(cwd, CLAUDE_MEM_ALLOWED_PROJECTS)`
   - If not allowed: Return `STANDARD_HOOK_RESPONSE` immediately
4. If both checks pass: Proceed with existing flow

**Performance Benefit:** Disabled collection skips 15-second worker startup wait.

### Chain 3: UI Settings Management

**Entry Point:** User opens Context Settings modal
**Exit Point:** Settings saved to `~/.claude-mem/settings.json`

**Flow:**
1. `ContextSettingsModal.tsx` - New "Collection Controls" section
2. ToggleSwitch for `CLAUDE_MEM_COLLECTION_ENABLED`
3. FormField text input for `CLAUDE_MEM_ALLOWED_PROJECTS`
4. Save button POSTs to `/api/settings`
5. Worker persists to settings.json

---

## Change Execution Plan

### Phase 1: Backend Settings Infrastructure

**Files:** `SettingsDefaultsManager.ts`, `SettingsRoutes.ts`

1. Add interface properties (line ~48):
   ```typescript
   CLAUDE_MEM_COLLECTION_ENABLED: string;
   CLAUDE_MEM_ALLOWED_PROJECTS: string;
   ```

2. Add defaults (line ~80):
   ```typescript
   CLAUDE_MEM_COLLECTION_ENABLED: 'true',
   CLAUDE_MEM_ALLOWED_PROJECTS: '',
   ```

3. Modify `get()` method (line 108-110) for env var support:
   ```typescript
   static get(key: keyof SettingsDefaults): string {
     return process.env[key] || this.DEFAULTS[key];
   }
   ```

4. Add to settingKeys array (SettingsRoutes.ts line ~105):
   ```typescript
   'CLAUDE_MEM_COLLECTION_ENABLED',
   'CLAUDE_MEM_ALLOWED_PROJECTS',
   ```

5. Add CLAUDE_MEM_COLLECTION_ENABLED to boolean validation array (line ~295)

### Phase 2: Backend Collection Logic

**File:** `save-hook.ts`

1. Add imports (line ~13):
   ```typescript
   import path from 'path';
   import { SettingsDefaultsManager } from '../shared/SettingsDefaultsManager.js';
   ```

2. Add helper function (line ~15):
   ```typescript
   function isProjectAllowed(cwd: string, allowedProjects: string): boolean {
     if (!allowedProjects) return true; // Empty = all allowed
     const normalized = path.normalize(cwd);
     const allowed = allowedProjects.split(',').map(p => path.normalize(p.trim()));
     return allowed.some(p => normalized.startsWith(p));
   }
   ```

3. Inject collection check (line 27, BEFORE ensureWorkerRunning):
   ```typescript
   // Validate input first (moved from later)
   if (!input) {
     throw new Error('saveHook requires input');
   }

   const { session_id, cwd, tool_name, tool_input, tool_response } = input;

   // Check collection settings before waiting for worker
   const settingsPath = path.join(
     SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'),
     'settings.json'
   );
   const settings = SettingsDefaultsManager.loadFromFile(settingsPath);

   // Step 1: Check global toggle
   if (settings.CLAUDE_MEM_COLLECTION_ENABLED !== 'true') {
     console.log(STANDARD_HOOK_RESPONSE);
     return;
   }

   // Step 2: Check allowlist
   if (!isProjectAllowed(cwd, settings.CLAUDE_MEM_ALLOWED_PROJECTS)) {
     console.log(STANDARD_HOOK_RESPONSE);
     return;
   }

   // Now safe to wait for worker
   await ensureWorkerRunning();
   ```

### Phase 3: Frontend Types & Constants

**Files:** `types.ts`, `settings.ts`, `useSettings.ts`

1. Add to Settings interface (types.ts ~65):
   ```typescript
   CLAUDE_MEM_COLLECTION_ENABLED?: string;
   CLAUDE_MEM_ALLOWED_PROJECTS?: string;
   ```

2. Add to DEFAULT_SETTINGS (settings.ts ~12):
   ```typescript
   CLAUDE_MEM_COLLECTION_ENABLED: 'true',
   CLAUDE_MEM_ALLOWED_PROJECTS: '',
   ```

3. Add to settings mapping in useSettings.ts (line ~20)

### Phase 4: Frontend UI Controls

**File:** `ContextSettingsModal.tsx`

Add new CollapsibleSection after line 561:

```tsx
<CollapsibleSection
  title="Collection Controls"
  description="Control observation collection behavior"
  defaultOpen={false}
>
  <ToggleSwitch
    id="collection-enabled"
    label="Collection Enabled"
    description="Enable or disable observation collection globally"
    checked={formState.CLAUDE_MEM_COLLECTION_ENABLED === 'true'}
    onChange={() => toggleBoolean('CLAUDE_MEM_COLLECTION_ENABLED')}
  />

  <FormField
    label="Allowed Projects"
    tooltip="Comma-separated project paths. Leave empty to collect for all projects."
  >
    <input
      type="text"
      className="input-text"
      value={formState.CLAUDE_MEM_ALLOWED_PROJECTS || ''}
      onChange={(e) => updateSetting('CLAUDE_MEM_ALLOWED_PROJECTS', e.target.value)}
      placeholder="/path/to/project1,/path/to/project2 (empty = all)"
    />
  </FormField>
</CollapsibleSection>
```

### Phase 5: Build & Deploy

```bash
cd /Users/miles/CodingMac/claude-mem
npm run build-and-sync
```

This:
- Compiles TypeScript hooks to `plugin/scripts/`
- Builds React UI to `plugin/ui/`
- Rsyncs to `~/.claude/plugins/marketplaces/thedotmack/`
- Restarts worker

**Database is preserved** - `~/.claude-mem/` is untouched by this process.

### Phase 6: Tests

**Create 3 new test files:**

1. `tests/shared/settings-defaults-manager.test.ts` - Settings defaults and loading
2. `tests/hooks/save-hook-collection.test.ts` - Collection toggle and filtering
3. `tests/settings/validation.test.ts` - Validation for new settings

**Update 2 existing mocks:**

1. `tests/context/context-builder.test.ts` - Add new settings to mock
2. `tests/gemini_agent.test.ts` - Add new settings to mock

---

## Data Preservation

### Existing Data Location

```
~/.claude-mem/
├── claude-mem.db        ← SQLite database with all memories (PRESERVED)
├── settings.json        ← Configuration (PRESERVED, new keys added)
├── chroma/              ← Vector embeddings (PRESERVED)
└── logs/                ← Log files (PRESERVED)
```

### Why Data is Safe

1. **Separate locations:** Plugin code (`~/.claude/plugins/...`) is separate from data (`~/.claude-mem/`)
2. **rsync targets plugin only:** `build-and-sync` only touches the plugin directory
3. **Settings merge:** New settings keys are added to existing settings.json, not replaced
4. **Database untouched:** SQLite file is never modified by deployment

### Pre-Deployment Backup (Recommended)

```bash
# Create timestamped backup before first deployment
cp -r ~/.claude-mem ~/.claude-mem-backup-$(date +%Y%m%d)
```

---

## Risk Assessment

### Breaking Changes
None - all changes are additive with backward-compatible defaults.

### Backward Compatibility
- `COLLECTION_ENABLED` defaults to 'true' (current behavior)
- `ALLOWED_PROJECTS` defaults to '' (all projects, current behavior)
- Existing settings.json files continue working

### Performance
- **Improved:** Disabled collection skips 15-second worker startup
- **Minimal overhead:** One settings file read per hook invocation

### Data Safety
- Database completely separate from plugin code
- No migration required
- Backup recommended but not strictly necessary

---

## Workflow After Implementation

### Daily Development

```bash
# Work on claude-mem project with collection enabled for it
# Other projects: configure ALLOWED_PROJECTS via UI or disable entirely
```

### Testing Changes

```bash
# 1. Make code changes in fork
cd /Users/miles/CodingMac/claude-mem

# 2. Build and deploy
npm run build-and-sync

# 3. Test in Claude Code (memories go to same ~/.claude-mem/claude-mem.db)
```

### Getting Upstream Updates

```bash
cd /Users/miles/CodingMac/claude-mem
git fetch upstream
git merge upstream/main    # Review changes, resolve conflicts
npm run build-and-sync     # Deploy merged version
```

**Important:** Avoid `/plugin update claude-mem` as this may pull from upstream and overwrite your fork's changes.

---

## Dependencies & Sequencing

**Phase Order:**
1. Backend Settings (Phase 1) - FIRST
2. Backend Hooks (Phase 2) - depends on Phase 1
3. Frontend Types/Constants (Phase 3) - can parallel with Phase 2
4. Frontend UI (Phase 4) - depends on Phase 3
5. Build & Deploy (Phase 5) - after all code changes
6. Tests (Phase 6) - can be done last or in parallel

---

## Testing Strategy

### Test Coverage

1. **Settings Defaults** (settings-defaults-manager.test.ts)
   - Default values for new settings
   - Environment variable override behavior
   - File loading with new fields

2. **Collection Logic** (save-hook-collection.test.ts)
   - Collection enabled: proceeds normally
   - Collection disabled: early return without worker call
   - Project filtering: allowed vs not allowed

3. **Validation** (validation.test.ts)
   - Boolean string validation for COLLECTION_ENABLED

### Test Commands

```bash
npm test                                              # All tests
npx bun test tests/shared/settings-defaults-manager.test.ts
npx bun test tests/hooks/save-hook-collection.test.ts
```

---

## Summary

**What we're adding:**
- Toggle to pause/resume collection
- Project filter to control which projects collect memories
- UI controls in Context Settings modal

**What's preserved:**
- All existing memories in `~/.claude-mem/claude-mem.db`
- All existing settings
- Current behavior when using defaults

**Deployment:**
- Single command: `npm run build-and-sync`
- Deploys fork to plugin location
- Data directory untouched
