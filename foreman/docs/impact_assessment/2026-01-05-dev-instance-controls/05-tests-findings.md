# Impact Assessment: Tests & Validation

**Date:** 2026-01-05
**Focus:** Test Coverage for Dev Instance Controls
**Estimated Complexity:** Medium

## Executive Summary

No existing unit tests cover SettingsDefaultsManager directly or validateSettings logic in SettingsRoutes. Tests rely on mocking SettingsDefaultsManager. New tests required for collection toggle and project filtering.

## Test Coverage Gaps

### No Direct Tests Exist For:
- `/Users/miles/CodingMac/claude-mem/src/shared/SettingsDefaultsManager.ts` - No unit tests
- `/Users/miles/CodingMac/claude-mem/src/services/worker/http/routes/SettingsRoutes.ts:233` - validateSettings method
- `/Users/miles/CodingMac/claude-mem/src/hooks/save-hook.ts` - No unit tests for hook logic

### Existing Test Patterns to Follow:
1. **Bun test framework** with `describe`, `it`, `expect`, `mock`, `beforeEach`, `afterEach`
2. **Mock module pattern** - Mock SettingsDefaultsManager before imports (see `/Users/miles/CodingMac/claude-mem/tests/gemini_agent.test.ts:13-31`)
3. **Server tests** - HTTP endpoint testing pattern in `/Users/miles/CodingMac/claude-mem/tests/server/server.test.ts`

## Required Test Files

### 1. NEW: tests/shared/settings-defaults-manager.test.ts

Test cases:
- `getAllDefaults()` returns complete SettingsDefaults object
- `get(key)` returns correct default values
- `getInt(key)` parses integer correctly
- `getBool(key)` returns true/false correctly
- `loadFromFile()` returns defaults when file missing
- `loadFromFile()` merges file settings with defaults
- `loadFromFile()` handles new CLAUDE_MEM_COLLECTION_ENABLED field
- `loadFromFile()` handles new CLAUDE_MEM_ALLOWED_PROJECTS field

### 2. NEW: tests/settings/validation.test.ts

Test cases for validateSettings in SettingsRoutes:
- Valid CLAUDE_MEM_COLLECTION_ENABLED values ('true', 'false')
- Invalid CLAUDE_MEM_COLLECTION_ENABLED values rejected
- Valid CLAUDE_MEM_ALLOWED_PROJECTS (empty string, comma-separated)
- ALLOWED_PROJECTS with spaces, special chars handled

### 3. NEW: tests/hooks/save-hook-collection.test.ts

Test cases:
- Collection enabled: observation sent to worker
- Collection disabled: early return, no worker call
- Project in ALLOWED_PROJECTS: observation sent
- Project NOT in ALLOWED_PROJECTS: early return
- Empty ALLOWED_PROJECTS: all projects allowed
- Settings file missing: use defaults (enabled)

### 4. UPDATE: tests/context/context-builder.test.ts

Current mock at line 37-55 needs new fields:
```typescript
CLAUDE_MEM_COLLECTION_ENABLED: 'true',
CLAUDE_MEM_ALLOWED_PROJECTS: '',
```

### 5. UPDATE: tests/gemini_agent.test.ts

Current mock at line 13-31 needs new fields in loadFromFile return object.

## Test Strategy

### Settings Defaults and Loading
1. Create isolated unit tests for SettingsDefaultsManager
2. Test default values for new fields (COLLECTION_ENABLED=true, ALLOWED_PROJECTS='')
3. Test loadFromFile properly merges new fields
4. Test backward compatibility (old settings files without new fields)

### Collection Toggle Behavior
1. Mock settings with collection disabled
2. Verify save-hook exits early without HTTP call
3. Mock settings with collection enabled
4. Verify save-hook proceeds normally

### Project Filtering Logic
1. Test helper function: `isProjectAllowed(cwd, allowedProjects)`
2. Empty string = all allowed
3. Single project match
4. Multiple projects, one matches
5. No match = blocked
6. Case sensitivity considerations

### Settings Validation
1. Boolean string validation for COLLECTION_ENABLED
2. String validation for ALLOWED_PROJECTS (no format restrictions, just trimming)

## Files Requiring Mock Updates

| File | Line | Change |
|------|------|--------|
| `/Users/miles/CodingMac/claude-mem/tests/context/context-builder.test.ts` | 37-55 | Add new settings to mock |
| `/Users/miles/CodingMac/claude-mem/tests/gemini_agent.test.ts` | 13-31 | Add new settings to mock |

## Testing Commands

```bash
# Run all tests
npm test

# Run specific new test file
npx bun test tests/shared/settings-defaults-manager.test.ts
npx bun test tests/hooks/save-hook-collection.test.ts
```

## Notes

- Hook tests in cursor-hook-outputs.test.ts test shell script behavior, not TypeScript logic
- No existing integration tests for settings API endpoints
- Server tests provide good pattern for HTTP testing but don't cover settings routes
