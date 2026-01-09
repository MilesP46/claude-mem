# Impact Assessment: Frontend Settings UI for Collection Controls

**Date:** 2026-01-05
**Change Type:** Frontend
**Estimated Complexity:** Low

## Executive Summary

### Change Overview
Add two new controls to ContextSettingsModal: a toggle for CLAUDE_MEM_COLLECTION_ENABLED and a text input for CLAUDE_MEM_ALLOWED_PROJECTS. These follow existing patterns in the modal.

### Scope
- Backend: No (UI only)
- Frontend: Yes - 4 files
- Database: No
- Tests: 0 files (no existing tests for modal)

### Impact Radius
- Files directly modified: 4
- Files indirectly affected: 0
- Total files in impact chain: 4

### Risk Level
Low - Uses established component patterns (ToggleSwitch, FormField), no new dependencies.

---

## Impact Map

### Frontend Impacts
- **Components:** `ContextSettingsModal.tsx` - add new CollapsibleSection
- **State Management:** `useSettings.ts` - add new settings to state mapping
- **Types:** `types.ts` - add new Settings interface properties
- **Constants:** `settings.ts` - add default values

---

## Detailed Logic Chains

### Chain 1: ToggleSwitch Component Pattern

**Entry Point:** ToggleSwitch component (line 143-177)
**Exit Point:** formState update via toggleBoolean

**Files Involved:**
1. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/components/ContextSettingsModal.tsx:143-177` - ToggleSwitch definition
2. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/components/ContextSettingsModal.tsx:206-210` - toggleBoolean handler

**Logic Flow:**
1. ToggleSwitch receives: id, label, description, checked (boolean), onChange callback
2. checked is derived from `formState[KEY] === 'true'` (string comparison)
3. onChange calls toggleBoolean(key) which flips 'true'/'false' strings
4. updateSetting(key, newValue) updates formState via setFormState

**Pattern to follow:**
```
<ToggleSwitch
  id="collection-enabled"
  label="Collection Enabled"
  description="Enable/disable observation collection"
  checked={formState.CLAUDE_MEM_COLLECTION_ENABLED === 'true'}
  onChange={() => toggleBoolean('CLAUDE_MEM_COLLECTION_ENABLED')}
/>
```

### Chain 2: FormField Text Input Pattern

**Entry Point:** FormField component (line 114-140)
**Exit Point:** formState update via updateSetting

**Files Involved:**
1. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/components/ContextSettingsModal.tsx:114-140` - FormField wrapper
2. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/components/ContextSettingsModal.tsx:197-200` - updateSetting handler

**Logic Flow:**
1. FormField provides label and optional tooltip wrapper
2. Input onChange calls updateSetting(key, e.target.value) directly
3. Settings stored as strings (comma-separated for arrays)

**Pattern to follow:**
```
<FormField label="Allowed Projects" tooltip="Comma-separated project names">
  <input
    type="text"
    value={formState.CLAUDE_MEM_ALLOWED_PROJECTS || ''}
    onChange={(e) => updateSetting('CLAUDE_MEM_ALLOWED_PROJECTS', e.target.value)}
    placeholder="project1,project2"
  />
</FormField>
```

### Chain 3: Settings Save Flow

**Entry Point:** Save button click
**Exit Point:** API POST to /api/settings

**Files Involved:**
1. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/components/ContextSettingsModal.tsx:202-204` - handleSave
2. `/Users/miles/CodingMac/claude-mem/src/ui/viewer/hooks/useSettings.ts:60-81` - saveSettings POST

**Logic Flow:**
1. handleSave calls onSave(formState)
2. useSettings.saveSettings POSTs entire formState to /api/settings
3. Backend handles persistence - no frontend validation needed

---

## Change Execution Plan

### Phase 1: Type Definitions

1. **types.ts** - Add to Settings interface:
   - `CLAUDE_MEM_COLLECTION_ENABLED?: string;`
   - `CLAUDE_MEM_ALLOWED_PROJECTS?: string;`

2. **settings.ts** - Add defaults:
   - `CLAUDE_MEM_COLLECTION_ENABLED: 'true'`
   - `CLAUDE_MEM_ALLOWED_PROJECTS: ''`

### Phase 2: State Management

3. **useSettings.ts:16-53** - Add to settings mapping:
   - `CLAUDE_MEM_COLLECTION_ENABLED: data.CLAUDE_MEM_COLLECTION_ENABLED || DEFAULT_SETTINGS.CLAUDE_MEM_COLLECTION_ENABLED`
   - `CLAUDE_MEM_ALLOWED_PROJECTS: data.CLAUDE_MEM_ALLOWED_PROJECTS || DEFAULT_SETTINGS.CLAUDE_MEM_ALLOWED_PROJECTS`

### Phase 3: UI Controls

4. **ContextSettingsModal.tsx** - Add new CollapsibleSection after "Advanced" section (line 561):

**Placement:** New section "Collection Controls" at end of settings-column, before closing `</div>` at line 562.

**Structure:**
```
<CollapsibleSection
  title="Collection Controls"
  description="Control observation collection behavior"
  defaultOpen={false}
>
  <ToggleSwitch
    id="collection-enabled"
    label="Collection Enabled"
    description="Enable or disable observation collection"
    checked={formState.CLAUDE_MEM_COLLECTION_ENABLED === 'true'}
    onChange={() => toggleBoolean('CLAUDE_MEM_COLLECTION_ENABLED')}
  />
  <FormField
    label="Allowed Projects"
    tooltip="Comma-separated list of projects. Leave empty to allow all."
  >
    <input
      type="text"
      value={formState.CLAUDE_MEM_ALLOWED_PROJECTS || ''}
      onChange={(e) => updateSetting('CLAUDE_MEM_ALLOWED_PROJECTS', e.target.value)}
      placeholder="project1,project2 (empty = all)"
    />
  </FormField>
</CollapsibleSection>
```

---

## Risk Assessment

### Breaking Changes
- None - additive changes only

### Backward Compatibility
- Full - defaults match current behavior (enabled, all projects)

### UI Considerations
- No validation needed - backend handles interpretation
- Empty allowed projects field = all projects allowed

---

## Dependencies & Prerequisites

### Technical Dependencies
- Backend must support new settings keys in /api/settings endpoint
- Backend must handle these settings in collection logic

---

## Notes

### Assumptions Made
- Backend API accepts any settings keys (existing pattern)
- No UI-level validation required for project names

### Open Questions
- Should there be visual feedback when collection is disabled?
- Consider: warning indicator in header when collection is off
