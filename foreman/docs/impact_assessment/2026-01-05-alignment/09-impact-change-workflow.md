# Impact-Change Workflow Analysis

## Impact-Change Purpose

**Proactive planning and implementation for NEW changes**:
1. Creates impact assessment through parallel agents (3-7)
2. Synthesizes findings into `_index.md`
3. Performs gap analysis and dead code detection
4. Waits for user approval
5. Executes surgical implementation
6. Verifies UI if frontend changes

**When used**: Before implementing a change - planning phase

## Impact-Change-Review Purpose

**SPECIFICALLY for when the initial change FAILED**:
- Runs AFTER a prior change cycle completed with issues
- Assumes original `_index.md` exists but per-agent files deleted
- Pairs error-explorer agents with fresh impact-assessment agents
- Completely REWRITES `_index.md` with historical context + new findings
- Works directly in existing assessment folder (no "attempt folders")

**When used**: Post-implementation bugs/failures discovered

## Sequential Relationship

```
impact-change (initial)
    Plan → Assess → Gap Analysis → Approve → Implement → Verify
        ↓
    If issues found after implementation
        ↓
impact-change-review (reassessment)
    Error exploration → Context update → Fresh assessment → 
    Gap analysis → Approval → Re-execute
```

## Artifacts & Context Flow

**Impact-Change creates**:
- `foreman/docs/impact_assessment/[YYYY-MM-DD]-[name]/_index.md`
- `[NN]-[focus]-findings.md` (per-agent, later deleted)

**Impact-Change-Review creates**:
- `error-explorer-[NN]-[focus].md`
- `[NN]-[focus]-findings.md` (new)
- **Rewrites** `_index.md` with: Historical Context + Current Issue + Error Explorer Synthesis + New Assessment

## Reassessment Pattern

1. **Error exploration** (5+ agents) - understand what went wrong
2. **Immediate _index.md rewrite** - before new assessments, incorporating error findings
3. **Fresh assessment agents** - using rewritten _index.md as context
4. **Synthesis integration** - new findings populate "New Assessment Synthesis"
5. **Same approval → execution cycle**

**Pattern**: Error → Context Update → Fresh Assessment → Re-execute
