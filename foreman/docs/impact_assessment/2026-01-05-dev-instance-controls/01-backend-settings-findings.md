# Impact Assessment: Dev Instance Controls - Backend Settings

**Date:** 2026-01-05
**Change Type:** Backend
**Estimated Complexity:** Low
**Focus Area:** Settings & Configuration

## Executive Summary

Adding three new settings to control collection behavior and data directory for dev instances. Changes span the settings definition layer, validation layer, and UI type definitions.

### Scope
- Backend: Yes - SettingsDefaultsManager, SettingsRoutes
- Frontend: Yes - types.ts, constants/settings.ts
- Database: No
- Tests: 0 files (no existing settings tests found)

### Impact Radius
- Files directly modified: 4
- Files indirectly affected: 3 (consumers of settings)
- Total files in impact chain: 7

### Risk Level
Low - Additive changes only, no breaking modifications

---

## Impact Map

### Backend Impacts

| File | Line | Change Required |
|------|------|-----------------|
| `src/shared/SettingsDefaultsManager.ts` | 14-52 | Add 3 new properties to `SettingsDefaults` interface |
| `src/shared/SettingsDefaultsManager.ts` | 58-96 | Add 3 new default values to `DEFAULTS` object |
| `src/services/worker/http/routes/SettingsRoutes.ts` | 87-124 | Add 3 new keys to `settingKeys` array |
| `src/services/worker/http/routes/SettingsRoutes.ts` | 233-365 | Add validation for new settings |

### Frontend Impacts

| File | Line | Change Required |
|------|------|-----------------|
| `src/ui/viewer/types.ts` | 57-91 | Add 3 new optional properties to `Settings` interface |
| `src/ui/viewer/constants/settings.ts` | 5-39 | Add 3 new default values to `DEFAULT_SETTINGS` |

### Indirect Consumers (Read-Only Impact)

| File | Purpose |
|------|---------|
| `src/services/context/ContextConfigLoader.ts` | Loads settings - will auto-get defaults for new keys |
| `src/shared/worker-utils.ts` | Uses settings for port/host - unaffected |
| `src/shared/paths.ts` | Uses `CLAUDE_MEM_DATA_DIR` - needs update for `_DEV` variant |

---

## Detailed Logic Chains

### Chain 1: Settings Definition and Loading

**Entry Point:** `SettingsDefaultsManager.ts` - interface and defaults
**Exit Point:** Runtime configuration in all consumers

**Logic Flow:**

1. **src/shared/SettingsDefaultsManager.ts:14-52** - `SettingsDefaults` interface
   - Current: 38 properties defined
   - Required: Add `CLAUDE_MEM_COLLECTION_ENABLED`, `CLAUDE_MEM_ALLOWED_PROJECTS`, `CLAUDE_MEM_DATA_DIR_DEV`

2. **src/shared/SettingsDefaultsManager.ts:58-96** - `DEFAULTS` object
   - Required additions:
     - `CLAUDE_MEM_COLLECTION_ENABLED: 'true'`
     - `CLAUDE_MEM_ALLOWED_PROJECTS: ''` (empty = all)
     - `CLAUDE_MEM_DATA_DIR_DEV: ''` (empty = use DATA_DIR)

3. **src/shared/SettingsDefaultsManager.ts:133-171** - `loadFromFile()`
   - No changes needed - automatically merges new defaults with file settings

### Chain 2: Settings API Validation

**Entry Point:** POST `/api/settings` request
**Exit Point:** Updated `~/.claude-mem/settings.json`

**Logic Flow:**

1. **src/services/worker/http/routes/SettingsRoutes.ts:56-140** - `handleUpdateSettings`
   - Current: `settingKeys` array at lines 87-124 lists all updateable keys
   - Required: Add 3 new keys to array

2. **src/services/worker/http/routes/SettingsRoutes.ts:233-365** - `validateSettings`
   - Required validations:
     - `CLAUDE_MEM_COLLECTION_ENABLED`: boolean string ('true'/'false')
     - `CLAUDE_MEM_ALLOWED_PROJECTS`: comma-separated paths (any string valid)
     - `CLAUDE_MEM_DATA_DIR_DEV`: valid directory path or empty

### Chain 3: UI Type Synchronization

**Entry Point:** Settings interface in viewer
**Exit Point:** React settings components

**Logic Flow:**

1. **src/ui/viewer/types.ts:57-91** - `Settings` interface
   - Required: Add 3 new optional properties matching backend types

2. **src/ui/viewer/constants/settings.ts:5-39** - `DEFAULT_SETTINGS`
   - Required: Add 3 new default values matching `SettingsDefaultsManager.DEFAULTS`

---

## Change Execution Plan

### Phase 1: Backend Changes (Must Complete First)

1. **SettingsDefaultsManager.ts** - Add to interface (line ~48):
   ```
   CLAUDE_MEM_COLLECTION_ENABLED: string;
   CLAUDE_MEM_ALLOWED_PROJECTS: string;
   CLAUDE_MEM_DATA_DIR_DEV: string;
   ```

2. **SettingsDefaultsManager.ts** - Add to DEFAULTS (line ~80):
   ```
   CLAUDE_MEM_COLLECTION_ENABLED: 'true',
   CLAUDE_MEM_ALLOWED_PROJECTS: '',
   CLAUDE_MEM_DATA_DIR_DEV: '',
   ```

3. **SettingsRoutes.ts** - Add to settingKeys array (line ~105):
   ```
   'CLAUDE_MEM_COLLECTION_ENABLED',
   'CLAUDE_MEM_ALLOWED_PROJECTS',
   'CLAUDE_MEM_DATA_DIR_DEV',
   ```

4. **SettingsRoutes.ts** - Add validation (after line 306):
   - Add `CLAUDE_MEM_COLLECTION_ENABLED` to `booleanSettings` array
   - No validation needed for `CLAUDE_MEM_ALLOWED_PROJECTS` (any string)
   - Optional path validation for `CLAUDE_MEM_DATA_DIR_DEV`

### Phase 2: Frontend Changes

1. **types.ts** - Add to Settings interface:
   ```
   CLAUDE_MEM_COLLECTION_ENABLED?: string;
   CLAUDE_MEM_ALLOWED_PROJECTS?: string;
   CLAUDE_MEM_DATA_DIR_DEV?: string;
   ```

2. **constants/settings.ts** - Add to DEFAULT_SETTINGS:
   ```
   CLAUDE_MEM_COLLECTION_ENABLED: 'true',
   CLAUDE_MEM_ALLOWED_PROJECTS: '',
   CLAUDE_MEM_DATA_DIR_DEV: '',
   ```

---

## Dependencies & Prerequisites

### Sequencing
1. Backend SettingsDefaultsManager changes first
2. Backend SettingsRoutes changes second
3. Frontend types/constants can be done in parallel after backend

### Future Work (Not in Scope)
- Hook layer filtering based on `COLLECTION_ENABLED` and `ALLOWED_PROJECTS`
- paths.ts update to use `DATA_DIR_DEV` when set
- UI components to display/edit new settings

---

## Notes

### Assumptions
- `CLAUDE_MEM_ALLOWED_PROJECTS` uses comma-separated absolute paths
- Empty `ALLOWED_PROJECTS` means all projects are allowed
- Empty `DATA_DIR_DEV` means use standard `DATA_DIR`

### Validation Strategy
- `COLLECTION_ENABLED`: Reuse existing boolean validation pattern (lines 293-306)
- `ALLOWED_PROJECTS`: No validation (any comma-separated string)
- `DATA_DIR_DEV`: Optional - validate as path if provided, accept empty
