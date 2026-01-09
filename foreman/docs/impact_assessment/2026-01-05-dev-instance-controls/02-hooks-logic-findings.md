# Impact Assessment: Backend Hooks & Collection Logic

**Date:** 2026-01-05
**Change Type:** Backend
**Estimated Complexity:** Low

## Executive Summary

### Change Overview
Add collection controls to save-hook.ts via two new settings: CLAUDE_MEM_COLLECTION_ENABLED (global toggle) and CLAUDE_MEM_ALLOWED_PROJECTS (path allowlist). When disabled or project not allowed, hook returns STANDARD_HOOK_RESPONSE immediately without calling worker.

### Scope
- Backend: Yes - save-hook.ts and SettingsDefaultsManager.ts
- Frontend: No
- Database: No
- Tests: 2 files requiring updates

### Impact Radius
- Files directly modified: 2
- Files indirectly affected: 1 (worker-utils.ts for settings access pattern)
- Test files requiring updates: 2
- Total files in impact chain: 5

### Risk Level
Low - Early return pattern is safe; no database or API changes

---

## Impact Map

### Backend Impacts
- **Hook Layer:** save-hook.ts gains settings check before worker call
- **Settings Layer:** SettingsDefaultsManager.ts adds 2 new setting keys

### Infrastructure Impacts
- **Configuration:** settings.json gains CLAUDE_MEM_COLLECTION_ENABLED and CLAUDE_MEM_ALLOWED_PROJECTS keys

---

## Detailed Logic Chains

### Chain 1: Save Hook Current Flow

**Entry Point:** stdin JSON (PostToolUseInput)
**Exit Point:** STANDARD_HOOK_RESPONSE to stdout

**Files Involved:**
1. `src/hooks/save-hook.ts:74-89` - stdin parsing entry point
2. `src/hooks/save-hook.ts:26-70` - saveHook() main function
3. `src/shared/worker-utils.ts:117-141` - ensureWorkerRunning()
4. `src/hooks/hook-response.ts:8-11` - STANDARD_HOOK_RESPONSE constant

**Logic Flow:**

1. **Entry: save-hook.ts:74-89**
   - stdin.on('data') collects input chunks
   - stdin.on('end') parses JSON to PostToolUseInput
   - Calls saveHook(parsed)

2. **Step: save-hook.ts:26-28**
   - ensureWorkerRunning() called FIRST (current behavior)
   - Blocks until worker is healthy

3. **Step: save-hook.ts:30-67**
   - Validates input, extracts cwd
   - POSTs to worker /api/sessions/observations
   - Returns after response check

4. **Exit: save-hook.ts:69**
   - console.log(STANDARD_HOOK_RESPONSE)

---

### Chain 2: Proposed Collection Check Injection Point

**Location:** BEFORE ensureWorkerRunning() call

**Rationale:**
- Settings can be read from disk without worker
- SettingsDefaultsManager.loadFromFile() already exists
- Avoids 15-second worker startup wait when collection disabled
- Pattern matches getWorkerPort() in worker-utils.ts

**Proposed Injection (save-hook.ts:27):**
```
// Check collection enabled BEFORE waiting for worker
const settings = loadCollectionSettings();
if (!settings.collectionEnabled) {
  console.log(STANDARD_HOOK_RESPONSE);
  return;
}
if (!isProjectAllowed(cwd, settings.allowedProjects)) {
  console.log(STANDARD_HOOK_RESPONSE);
  return;
}
await ensureWorkerRunning();
```

---

### Chain 3: Settings Loading Pattern

**Reference:** worker-utils.ts:23-32 (getWorkerPort pattern)

**Existing Pattern:**
```typescript
const settingsPath = path.join(
  SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'),
  'settings.json'
);
const settings = SettingsDefaultsManager.loadFromFile(settingsPath);
```

**New Settings Required in SettingsDefaultsManager.ts:14-52:**
```typescript
CLAUDE_MEM_COLLECTION_ENABLED: string;  // 'true' | 'false'
CLAUDE_MEM_ALLOWED_PROJECTS: string;    // Comma-separated paths or '*'
```

**Defaults in SettingsDefaultsManager.ts:58-96:**
```typescript
CLAUDE_MEM_COLLECTION_ENABLED: 'true',  // Enabled by default
CLAUDE_MEM_ALLOWED_PROJECTS: '*',       // All projects allowed by default
```

---

### Chain 4: Project Path Matching Logic

**Input:** cwd from PostToolUseInput (e.g., "/Users/miles/CodingMac/claude-mem")
**Settings:** CLAUDE_MEM_ALLOWED_PROJECTS (e.g., "/Users/miles/work,/Users/miles/personal")

**Matching Rules:**
1. If allowedProjects === '*' -> allow all (default behavior)
2. If allowedProjects is empty string -> block all collection
3. Otherwise, split by comma and check if cwd starts with any allowed path
4. Use path.normalize() on both sides for cross-platform safety
5. Case-insensitive comparison on Windows (process.platform === 'win32')

**Implementation Location:** New function in save-hook.ts or shared utility

---

## Change Execution Plan

### Phase 1: SettingsDefaultsManager Updates

1. **Add interface keys (SettingsDefaultsManager.ts:14-52)**
   - Add CLAUDE_MEM_COLLECTION_ENABLED: string
   - Add CLAUDE_MEM_ALLOWED_PROJECTS: string

2. **Add defaults (SettingsDefaultsManager.ts:58-96)**
   - CLAUDE_MEM_COLLECTION_ENABLED: 'true'
   - CLAUDE_MEM_ALLOWED_PROJECTS: '*'

### Phase 2: Save Hook Updates

1. **Add imports (save-hook.ts:9-13)**
   - Add path import
   - Add SettingsDefaultsManager import

2. **Add helper function (save-hook.ts:~15)**
   - isProjectAllowed(cwd: string, allowedProjects: string): boolean

3. **Add early return logic (save-hook.ts:27)**
   - Load settings from file
   - Check CLAUDE_MEM_COLLECTION_ENABLED
   - Check project allowlist
   - Return STANDARD_HOOK_RESPONSE if blocked

---

## Risk Assessment

### Breaking Changes
- None - defaults preserve current behavior (collection enabled, all projects allowed)

### Backward Compatibility
- Fully compatible - existing installations continue working unchanged

### Performance Implications
- Improved: Hooks skip worker startup when collection disabled
- Minor overhead: One settings file read per hook invocation (mitigable with caching)

---

## Testing Strategy

### Unit Test Updates
- `src/hooks/__tests__/save-hook.test.ts` - Add tests for disabled collection, project filtering
- `src/shared/__tests__/SettingsDefaultsManager.test.ts` - Add tests for new settings defaults

### Test Cases
1. Collection disabled -> returns STANDARD_HOOK_RESPONSE without worker call
2. Project not in allowlist -> returns STANDARD_HOOK_RESPONSE
3. Project in allowlist -> proceeds to worker
4. Wildcard '*' allows all projects
5. Empty allowlist blocks all projects
6. Path normalization handles trailing slashes
7. Windows case-insensitive matching (if applicable)

---

## Notes & Considerations

### Path Normalization Edge Cases
- Trailing slashes: "/path/to/project/" vs "/path/to/project"
- Symlinks: May need realpath resolution for accurate matching
- Home directory: Should support "~/" shorthand expansion

### Caching Consideration
- Could cache settings like getWorkerPort() does
- Trade-off: Requires worker restart to pick up changes vs file read overhead
- Recommendation: Cache with clearable mechanism like clearPortCache()

### Input Validation
- cwd is validated as required field (save-hook.ts:45-47)
- Empty cwd already throws error before reaching collection check
