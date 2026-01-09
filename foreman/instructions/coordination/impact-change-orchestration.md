# Impact Change Orchestration Instructions

## Workflow Phases

### Phase 1: Impact Assessment
1. Analyze change complexity (simple/moderate/complex)
2. Create assessment folder: `foreman/docs/impact_assessment/[YYYY-MM-DD]-[brief-name]/`
3. Launch 3-7 parallel impact-assessment agents with specific focus areas
4. Synthesize findings into unified assessment
5. Check document length and create `_index.md` with QRG block
6. Update master TOC

### Phase 2: Gap Analysis
1. Verify assessment completeness using checklist
2. Identify true gaps (verify with Grep/Glob/Read)
3. Fill gaps naturally with minimal edits
4. Save completed assessment

### Phase 3: User Approval
1. Present summary to user
2. Wait for explicit approval ("approved", "proceed", "go ahead", "yes")
3. Handle revisions or cancellation

### Phase 4: Surgical Implementation
1. Parse assessment for execution plan
2. Determine agent assignment strategy
3. Execute Phase 1 (Backend) - sequential before frontend
4. Execute Phase 2 (Frontend) - after backend complete
5. Execute additional phases as needed

### Phase 5: UI Verification
1. Determine if frontend changes made
2. Launch verify-ui agent if needed
3. Monitor and review results

### Phase 6: Final Summary
1. Collect all results
2. Provide comprehensive summary
3. Offer next steps

## Agent Assignment Strategies

**Simple (1-3 files):** 1 surgical-edits agent for complete change

**Moderate (backend + frontend):** Sequential agents per phase

**Complex (multiple chains):** Parallel within phases, sequential across phases

## Sequencing Rules

- Backend (Phase 1) must complete before Frontend (Phase 2)
- Within phase: parallel if independent, sequential if dependent
- Always wait for dependencies to complete

## Error Handling

**Assessment failures:** Relaunch failed agents, manually combine if needed
**Approval issues:** Wait indefinitely, ask for clarification
**Implementation failures:** Review error, relaunch once, stop if unrecoverable
**Verification failures:** Report to user, don't report success if tests fail
