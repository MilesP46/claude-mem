# Tandem Commands Analysis

## Overview
Tandem command patterns in Foreman enable complex workflows through command coordination. Commands work together through shared state (documentation files), sequential handoffs (explicit transitions), or coordinated phases. These relationships create powerful workflow chains while maintaining individual command independence.

## Tandem Groups Identified
1. Error Investigation & Resolution Cycle
2. Impact Assessment & Implementation Cycle
3. Issue-Change Review & Revision Cycle
4. Release Planning Chain
5. Design Phase Orchestration
6. Chore Review & Application Cycle
7. Plan Update & Planning Coordination
8. Refactoring & Code Cleanup Pipeline
9. Documentation Update Pipeline
10. Multi-Issue Execution Chain

## Detailed Analysis

### Error Investigation & Resolution Cycle
- **Commands:** error-explorer → error-fix
- **Purpose:** Comprehensive error investigation followed by surgical fixing
- **Coordination:** error-explorer identifies root causes; error-fix implements fixes using error-explorer's analysis
- **Sequence:**
  1. error-explorer runs first (MUST precede error-fix)
  2. error-fix references "previous assistant message" from error-explorer
  3. Extracts root cause, files to modify, logic flow
  4. Implements fixes iteratively until resolved
- **Rules Referenced:** development-standards.mdc
- **Instructions Referenced:**
  - error-explorer-instructions.md
  - error-fix-workflow.md
- **Scripts Referenced:** None

### Impact Assessment & Implementation Cycle
- **Commands:** impact-change → plan-change
- **Purpose:** Comprehensive change planning from assessment to granular work items
- **Coordination:** impact-change creates assessment docs; plan-change reads assessments and creates work plans
- **Sequence:**
  1. impact-change (Phase 1-3) creates _index.md assessment
  2. plan-change reads assessment path
  3. plan-change creates work item files for surgical implementation
- **Rules Referenced:**
  - development-standards.mdc
  - system-standards.mdc
- **Instructions Referenced:**
  - impact-change-orchestration.md
  - gap-analysis-checklist.md
  - change-planning-workflow.md
- **Scripts Referenced:** None

### Issue-Change Review & Revision Cycle
- **Commands:** impact-change-review → error-explorer → dead-code-review → error-fix (conditional)
- **Purpose:** Reassess and fix changes when issues arise post-implementation
- **Coordination:** Orchestrated reassessment with parallel analysis, synthesis, approval gates
- **Sequence:**
  1. Launch parallel error-explorer agents for root cause analysis
  2. Synthesize findings into revised assessment
  3. Launch dead-code-review to identify cleanup opportunities
  4. Perform gap analysis
  5. Wait for user approval
  6. Execute fixes (conditionally launches error-fix)
- **Rules Referenced:**
  - development-standards.mdc
  - system-standards.mdc
- **Instructions Referenced:**
  - impact-change-orchestration.md
  - gap-analysis-checklist.md
- **Scripts Referenced:** None

### Release Planning Chain
- **Commands:** chain-plan-init → chain-plan-design-green → chain-send-issues → chain-issue
- **Purpose:** Complete release lifecycle from specification to implementation
- **Coordination:** Sequential handoff structure using explicit handoff-claude commands
- **Sequence:**
  1. chain-plan-init creates release specification
  2. Handoff to chain-plan-design-green for complete design phase
  3. chain-plan-design-green creates design docs and issues
  4. Handoff to chain-send-issues to push issues to GitHub
  5. chain-send-issues updates issue-plan.md with GH numbers
  6. Handoff to chain-issue for first issue implementation
- **Rules Referenced:**
  - development-standards.mdc
  - system-standards.mdc
  - diagram-standard.mdc
- **Instructions Referenced:**
  - release-specification-template-instructions.md
  - agent-scope-impact-matrix.md
  - gh-issue-workflow.md
- **Scripts Referenced:**
  - handoff-claude --app iterm --cwd
  - log-activity release
  - exit-shell

### Design Phase Orchestration
- **Commands:** Internal to chain-plan-design-green
- **Purpose:** Sequential design phase with specialized agents for research, UX, UI, architecture
- **Coordination:** Sequential dependency chain; each agent builds on prior decisions
- **Sequence:**
  1. chain-prototype-researcher (research mode)
  2. User approval gate for deployment decisions
  3. chain-prototype-researcher (finalize mode)
  4. chain-ux-researcher (flows, personas, wireframes)
  5. chain-ui-design (components, design system)
  6. chain-system-architect (API, database, infrastructure)
  7. Cross-agent coordination analysis
  8. Optional user feedback for coordination uncertainty
  9. chain-whimsy-injector (delightful interactions)
  10. chain-issue-builder (sprint preparation)
- **Rules Referenced:**
  - agent-scope-impact-matrix.md
  - cross-agent-coordination-request-template-instructions.md
- **Instructions Referenced:**
  - Multiple design phase templates
  - User requirements review templates
- **Scripts Referenced:**
  - log-activity release
  - handoff-claude

### Chore Review & Application Cycle
- **Commands:** review-chore-prs → apply-chore-refactors
- **Purpose:** Review chore PRs, create refactoring documentation, apply changes sequentially
- **Coordination:** Shared state through docs/development/chores/ directory
- **Sequence:**
  1. review-chore-prs finds chore PRs (deps, deps-dev, ci)
  2. Launches pr-chore-reviewer agents sequentially
  3. Creates refactoring documentation files for PRs needing work
  4. apply-chore-refactors discovers files via Glob
  5. Launches chore-refactorer agents for each file
  6. On success: merges PR and deletes documentation file
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - pr-chore-review-workflow.md
  - chore-refactoring-workflow.md
- **Scripts Referenced:** None

### Plan Update & Planning Coordination
- **Commands:** update-plans ↔ chain-plan-design-update (bidirectional)
- **Purpose:** Update planning documentation incrementally or comprehensively
- **Coordination:** Dual-mode updates for different update scopes
- **Sequence:**
  - update-plans: Calls chain-system-architect for architecture reconciliation
  - Optionally calls chain-issue-updater for line reference reconciliation
  - chain-plan-design-update: Handles full impact analysis, conditional research, parallel issue updates
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - plan-update-workflow.md
  - orchestration-patterns.md
  - impact-change-orchestration.md
  - agent-scope-impact-matrix.md
- **Scripts Referenced:**
  - mkdir -p for update directories

### Refactoring & Code Cleanup Pipeline
- **Commands:** format-claude-file → cleanup-docs → dead-code-review
- **Purpose:** Sequential cleanup workflow for code and documentation
- **Coordination:** Can run sequentially or independently based on needs
- **Sequence:**
  1. format-claude-file optimizes agent/command files
  2. cleanup-docs consolidates scratchpad files into proper docs
  3. dead-code-review removes unused code
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - claude-file-optimization.md
  - scratchpad-cleanup-workflow.md
  - dead-code-review-orchestration.md
- **Scripts Referenced:** None

### Documentation Update Pipeline
- **Commands:** restructure-docs → cleanup-docs → manage-memory
- **Purpose:** Complete documentation system refresh
- **Coordination:** Sequential execution for full documentation maintenance
- **Sequence:**
  1. restructure-docs reorganizes hierarchy, splits large files
  2. cleanup-docs removes loose scratchpad files
  3. manage-memory updates CLAUDE.md files across project
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - documentation-hierarchy-standards.md
  - scratchpad-cleanup-workflow.md
  - memory-manager-instructions.md
- **Scripts Referenced:** None

### Multi-Issue Execution Chain
- **Commands:** chain-issue (repeating for each issue)
- **Purpose:** Execute GitHub issues sequentially through complete development lifecycle
- **Coordination:** Self-repeating pattern with internal multi-agent orchestration
- **Sequence:** For each issue:
  1. chain-issue-updater (agent planning and context)
  2. test-manager (preflight test creation)
  3. Parent agents (backend-architect, frontend-developer, ai-engineer)
  4. Worker agents (parallel execution: backend-worker, frontend-worker, ai-technician)
  5. Type error resolution verification
  6. troubleshooting-investigator (conditional on blocking issues)
  7. ReviewerPR (post-implementation review)
  8. User testing validation
  9. Merge with quality gates
  10. documentation-updater & memory-manager (post-merge)
  11. Activity logging
- **Rules Referenced:**
  - development-standards.mdc
  - system-standards.mdc
  - diagram-standard.mdc
- **Instructions Referenced:**
  - gh-issue-workflow.md
  - User testing validation template
- **Scripts Referenced:**
  - GH MCP/CLI operations
  - log-activity
  - Type error verification

## Pattern Summary

**Handoff Pattern**: Explicit transitions using handoff-claude with terminal app and working directory specifications.

**Documentation Coupling**: Commands share state via documentation files (assessments, plans, issue-maps, chore docs).

**Sequential Gating**: User approval pauses at critical decision points between command phases.

**Parallel→Sequential Orchestration**: Launch multiple agents in parallel, synthesize results serially.

**Dependency Injection**: Pass file paths and references between commands for context continuity.

**Activity Logging**: Continuous progress tracking via log-activity across command chains.

**Error Recovery Chains**: Conditional re-launching of error-explorer and error-fix on failures.

**State Machine Pattern**: Commands track state (pending, active, completed) and transition based on conditions.

**Workspace Isolation**: Each command operates in specific directories to avoid conflicts.

**Quality Gates**: Multiple verification points (type checks, tests, user validation) before progression.
