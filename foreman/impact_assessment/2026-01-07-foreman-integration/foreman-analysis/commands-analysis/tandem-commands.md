# Tandem Command Workflows Analysis

## Overview

This analysis identifies commands in the foreman project that work in tandem with other commands - commands that frequently call, depend on, or coordinate with other commands in orchestrated workflows. Tandem relationships fall into several patterns: explicit handoffs (one command directly launches another), implicit dependencies (output of one becomes input to another), and orchestration chains (multi-step pipelines).

## Tandem Workflows Identified

### 1. Release Planning Chain (chain-concept-gen -> chain-plan-init -> chain-plan-design-green -> chain-send-issues -> chain-issue)

- **Commands Involved**:
  - `/chain-concept-gen`
  - `/chain-plan-init`
  - `/chain-plan-design-green`
  - `/chain-send-issues`
  - `/chain-issue`

- **Purpose**: Complete end-to-end release lifecycle from concept ideation through implementation execution

- **Rules Referenced**:
  - None explicitly referenced in chain commands

- **Instructions Referenced**:
  - `@foreman/instructions/planning/concept-checklist-template-instructions.md`
  - `@foreman/instructions/planning/concept-qa-documentation-template-instructions.md`
  - `@foreman/instructions/planning/release-specification-template-instructions.md`
  - `@foreman/instructions/coordination/agent-scope-impact-matrix.md`
  - `@foreman/instructions/coordination/cross-agent-coordination-request-template-instructions.md`
  - `@foreman/instructions/github/gh-issue-workflow.md`

- **Scripts Executed**:
  - `foreman-templates install`
  - `log-activity release <release_number> "<message>"`
  - `handoff-claude "/chain-plan-init" "<release_number>" --app iterm --cwd "<project_root>"`
  - `handoff-claude "/chain-plan-design-green" "<release_number>" --app iterm --cwd "<project_root>"`
  - `handoff-claude "/chain-send-issues" "<release_number>" --app iterm --cwd "<project_root>"`
  - `handoff-claude "/chain-issue" "<issue_number>" --app iterm --cwd "<project_root>"`
  - `exit-shell`

- **Workflow**:
  1. `/chain-concept-gen` - User provides concept; iterative Q&A refines into concept-checklist.md
  2. Handoff via `handoff-claude` to `/chain-plan-init`
  3. `/chain-plan-init` - Creates release specification from concept checklist
  4. Handoff via `handoff-claude` to `/chain-plan-design-green`
  5. `/chain-plan-design-green` - Orchestrates 10-step design phase launching multiple agents (chain-prototype-researcher, chain-ux-researcher, chain-ui-design, chain-system-architect, chain-whimsy-injector, chain-issue-builder)
  6. Handoff via `handoff-claude` to `/chain-send-issues`
  7. `/chain-send-issues` - Submits generated issues to GitHub
  8. Handoff via `handoff-claude` to `/chain-issue`
  9. `/chain-issue` - Works through individual GitHub issues, chaining to next issue on completion

- **Dependencies**:
  - Templates: `@foreman/templates/planning/*`
  - Agents: chain-prototype-researcher, chain-ux-researcher, chain-ui-design, chain-system-architect, chain-whimsy-injector, chain-issue-builder, chain-issue-updater, test-manager, reviewpr, documentation-updater, memory-manager, troubleshooting-investigator

---

### 2. Error Investigation and Fix Chain (error-explorer -> error-fix)

- **Commands Involved**:
  - `/error-explorer`
  - `/error-fix`

- **Purpose**: Comprehensive error root cause analysis followed by iterative fix implementation with verification

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - None (uses Task tool for agent coordination)

- **Workflow**:
  1. `/error-explorer` launches 5+ parallel error-explorer agents with different investigation focuses (Primary Error Path, Entry Point, Configuration, State Management, Integration Boundaries)
  2. Agents investigate from different angles and report findings
  3. Command synthesizes findings into unified root cause analysis with file:line references
  4. User runs `/error-fix <replication-steps> [additional-considerations]`
  5. `/error-fix` extracts error analysis from previous message (CRITICAL dependency)
  6. Launches surgical-fixes agent to implement minimal fix
  7. Verifies fix through appropriate testing (Playwright for frontend, script execution for backend)
  8. Iterates up to 3 times if error persists, relaunching error-explorer for deeper analysis
  9. Creates impact assessment document for frontend changes

- **Dependencies**:
  - Agents: error-explorer, surgical-fixes, verify-ui
  - Previous conversation context required for error-fix

---

### 3. Chore PR Pipeline (review-chore-prs -> apply-chore-refactors)

- **Commands Involved**:
  - `/review-chore-prs`
  - `/apply-chore-refactors`

- **Purpose**: Automated review and processing of dependency update PRs with refactoring documentation

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - `gh pr list --json number,title --limit 100`
  - `gh pr merge [PR_NUMBER] --merge --delete-branch`
  - `mkdir -p docs/development/chores`
  - `rm docs/development/chores/pr-[NUMBER]-[title].md`

- **Workflow**:
  1. `/review-chore-prs` discovers all open chore PRs (deps, deps-dev, ci)
  2. Launches pr-chore-reviewer agents sequentially for each PR
  3. Safe PRs (no code changes needed) are merged immediately
  4. PRs requiring refactoring get documented in `docs/development/chores/pr-[NUMBER]-[title].md`
  5. User runs `/apply-chore-refactors`
  6. `/apply-chore-refactors` discovers documentation files in `docs/development/chores/`
  7. Launches chore-refactorer agents sequentially for each documented PR
  8. After successful refactoring, merges PR and deletes documentation file
  9. Failed refactorings retain documentation for manual review

- **Dependencies**:
  - Agents: pr-chore-reviewer, chore-refactorer
  - Shared state: `docs/development/chores/*.md` files

---

### 4. Impact Change Workflow (impact-change -> plan-change)

- **Commands Involved**:
  - `/impact-change`
  - `/plan-change`

- **Purpose**: Comprehensive impact assessment for code changes followed by granular change planning

- **Rules Referenced**:
  - None explicitly referenced in impact-change
  - `@rules/documentation-rules.mdc` in plan-change

- **Instructions Referenced**:
  - `@instructions/coordination/impact-change-orchestration.md`
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`
  - `@instructions/planning/granular-change-plan-instructions.md`

- **Scripts Executed**:
  - `mkdir -p foreman/docs/impact_assessment/[YYYY-MM-DD]-[brief-name]`
  - `mkdir -p foreman/docs/change_plan/[type]/[date]-[name]`

- **Workflow**:
  1. `/impact-change <change-description>` creates assessment folder
  2. Launches 3-7 parallel impact-assessment agents based on complexity
  3. Synthesizes findings into `_index.md` with QRG format
  4. Performs gap analysis and dead code detection
  5. Presents summary for user approval
  6. After approval, executes surgical implementation with surgical-edits agents
  7. Verifies UI changes with verify-ui agent
  8. User can optionally run `/plan-change` with assessment path
  9. `/plan-change` creates granular work item plans (3-7 items)
  10. Launches change-plan-builder agents in parallel/sequential based on dependencies
  11. Creates documentation hierarchy with `_index.md` and numbered plan files

- **Dependencies**:
  - Agents: impact-assessment, surgical-edits, verify-ui, change-plan-builder
  - Output of `/impact-change` serves as input to `/plan-change`

---

### 5. Impact Change Review Workflow (impact-change-review with embedded error-explorer and impact-assessment)

- **Commands Involved**:
  - `/impact-change-review`
  - (Embeds `/error-explorer` pattern)
  - (Embeds `/impact-change` pattern)

- **Purpose**: Reassesses completed changes when new issues arise by combining error exploration with fresh impact assessment

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`

- **Scripts Executed**:
  - `ls -lt foreman/docs/impact_assessment/ | head -n 5`

- **Workflow**:
  1. Locates existing `_index.md` from prior change cycle (no attempt folders)
  2. Launches 5+ parallel error-explorer agents with focus areas
  3. Rewrites `_index.md` with historical context and error explorer synthesis (before new assessment agents)
  4. Launches 3-7 parallel impact-assessment agents with inline context packet
  5. Synthesizes new agent findings into `_index.md`
  6. Performs gap analysis
  7. Optionally performs dead code review
  8. Presents for user approval
  9. After approval, executes surgical implementation
  10. Verifies UI changes if applicable

- **Dependencies**:
  - Agents: error-explorer, impact-assessment, surgical-edits, verify-ui
  - Prior `_index.md` from completed change cycle

---

### 6. Dead Code Review Workflow (dead-code-review -> surgical implementation)

- **Commands Involved**:
  - `/dead-code-review`

- **Purpose**: Comprehensive dead code analysis with 100% certainty threshold, followed by surgical removal

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - `ls -la [directory]`
  - `find [directory] -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l`
  - `mkdir -p foreman/docs/dead_code/$(date +%Y-%m-%d)-[brief-name]`

- **Workflow**:
  1. Validates directory and determines complexity
  2. Creates timestamped output folder
  3. Launches 3-7 parallel analysis agents with distinct focus areas
  4. Agents identify dead code with 100% certainty
  5. Cross-validates findings across agents
  6. Creates unified `_summary.md` with filetree overview
  7. Presents for user approval
  8. After approval, launches surgical-edits agents for removal
  9. Executes backend removals before frontend
  10. Verifies UI if frontend changes involved
  11. Updates filetree with checkmarks for completed removals

- **Dependencies**:
  - Agents: dead-code analysis agents, surgical-edits, verify-ui

---

### 7. Release Update Chain (chain-plan-design-update with embedded research, UX, UI, Architecture updates)

- **Commands Involved**:
  - `/chain-plan-design-update`

- **Purpose**: Orchestrates plan revisions for existing releases when direction changes

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - `@instructions/coordination/orchestration-patterns.md`
  - `@instructions/coordination/impact-change-orchestration.md`
  - `@instructions/coordination/agent-scope-impact-matrix.md`

- **Scripts Executed**:
  - `mkdir -p foreman/release-$1/docs/00-planning/update-$2`

- **Workflow**:
  1. Creates update directory structure
  2. Analyzes change impact against existing documentation
  3. Creates impact-assessment.md in update folder
  4. Conditionally launches chain-update-researcher (if new services/templates needed)
  5. Pauses for user approval of research report
  6. Launches chain-ux-updater to minimally update UX docs in place
  7. Launches chain-ui-updater to minimally update UI docs in place
  8. Launches chain-architecture-updater to minimally update architecture docs
  9. Analyzes issue states and creates issue-manifest.yaml
  10. Creates new user requirements if needed
  11. Launches chain-issue-plan-updater agents in parallel for issue creation/modification
  12. Validates no open questions or change references remain
  13. Pauses for user review of new requirements

- **Dependencies**:
  - Agents: chain-update-researcher, chain-ux-updater, chain-ui-updater, chain-architecture-updater, chain-issue-plan-updater

---

### 8. Documentation Cleanup Pipeline (cleanup-docs)

- **Commands Involved**:
  - `/cleanup-docs`

- **Purpose**: Three-stage pipeline to clean, consolidate, and validate loose documentation files

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - `rm [scratchpad-file-1] [scratchpad-file-2] ...`

- **Workflow**:
  1. **Stage 0 (Discovery)**: Uses Glob to find loose .md files, excluding standard locations
  2. **Stage 1 (Cleanup)**: Launches md-scratchpad-cleanup agents in parallel for each target file
  3. **Stage 2 (Documentation)**: Launches documentation-updater agents in parallel to consolidate content into `docs/` hierarchy
  4. **Stage 3 (Validation)**: Launches single documentation-updater agent to validate links
  5. Deletes original scratchpad files only after all stages complete successfully

- **Dependencies**:
  - Agents: md-scratchpad-cleanup, documentation-updater

---

### 9. Issue Management Tandem (new-issue uses chain-issue-creator; update-plans uses chain-system-architect and chain-issue-updater)

- **Commands Involved**:
  - `/new-issue`
  - `/update-plans`
  - `/fix-issue`

- **Purpose**: Adding new issues to existing releases and updating planning documentation after implementation

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc` (fix-issue)
  - `@foreman/rules/system-standards.mdc` (fix-issue)

- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-map-template-instructions.md` (fix-issue)
  - `@foreman/instructions/planning/issue-plan-template-instructions.md` (fix-issue)
  - `@foreman/instructions/planning/issue-overview-template-instructions.md` (fix-issue)
  - `@foreman/instructions/planning/user-requirements-template-instructions.md` (fix-issue)

- **Scripts Executed**:
  - `log-activity release $1 agent new-issue "Added new issues: $ARGUMENTS"`
  - `log-activity release $1 agent update-plans "Updated planning docs and line refs from issue $2: $ARGUMENTS"`

- **Workflow**:
  **new-issue**:
  1. Validates release exists with issue-map/, issue-plan.md, issue-overview.md
  2. Queries activity logs for context-efficient loading
  3. Parses arguments for position, notes, and code references
  4. Launches chain-issue-creator with comprehensive context
  5. Agent updates issue-map/, issue-plan.md, issue-overview.md and creates GitHub issues
  6. Verifies integration and logs completion

  **update-plans**:
  1. Validates release and issue reference
  2. Analyzes implementation from PR and agent comments
  3. Launches chain-system-architect in "reconciliation" mode
  4. Launches chain-issue-updater for line reference reconciliation
  5. Verifies documentation updates and decision logging

  **fix-issue**:
  1. Validates issue file path
  2. Launches fix-issue agent with modification context
  3. Agent updates all four planning documents (issue-XXX.yaml, issue-plan.md, issue-overview.md, user-requirements.md)
  4. Attempts to update GitHub issue comment via GH MCP
  5. Provides replacement content if update fails

- **Dependencies**:
  - Agents: chain-issue-creator, chain-system-architect, chain-issue-updater, fix-issue

---

### 10. Memory Management (manage-memory)

- **Commands Involved**:
  - `/manage-memory`

- **Purpose**: Hierarchical CLAUDE.md file management with bottom-up directory processing

- **Rules Referenced**:
  - `rules/memory-system-standards.mdc`

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - None (uses Task tool for agent coordination)

- **Workflow**:
  **Assessment Mode** (when input is assessment file):
  1. Parses assessment file for structural gaps, size violations, navigation gaps, dependency violations
  2. Processes fixes SEQUENTIALLY to prevent API concurrency errors
  3. Launches memory-manager agents for each category

  **Directory Mode** (standard workflow):
  1. Analyzes complete directory tree with depth calculations
  2. Applies depth-scaled adjacency thresholds
  3. Processes directories bottom-up (deepest first)
  4. Sibling subdirectories can process in parallel
  5. Launches memory-manager with appropriate workflow (Targeted Area Update or Parent Aggregation)

- **Dependencies**:
  - Agent: memory-manager
  - Rules: memory-system-standards.mdc for depth-scaled thresholds

---

### 11. Vite UI Fix (vite-UI-fix)

- **Commands Involved**:
  - `/vite-UI-fix`

- **Purpose**: Frontend issue resolution with service validation and iterative Playwright-based verification

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`

- **Instructions Referenced**:
  - None explicitly referenced

- **Scripts Executed**:
  - `ps aux | grep "vite" | grep -v grep`
  - `lsof -i :5173 || netstat -an | grep 5173`
  - Various service status checks

- **Workflow**:
  1. Validates issue description
  2. Checks Vite dev server status
  3. Identifies required backend services based on issue type
  4. Reports service status and waits for user to start missing services
  5. Launches vite-frontend-fix agent with comprehensive context
  6. Agent uses Playwright MCP to reproduce, diagnose, and fix iteratively
  7. Verifies UI layer, backend state, and side effects
  8. Updates tests and ensures standards compliance

- **Dependencies**:
  - Agent: vite-frontend-fix
  - External: Vite dev server, potentially database, backend API, Redis, etc.

---

### 12. Agent-Command Creation (create-project-agent-command-duo)

- **Commands Involved**:
  - `/create-project-agent-command-duo`

- **Purpose**: Intelligently creates project-level agent-command pairs by analyzing patterns

- **Rules Referenced**:
  - None explicitly referenced

- **Instructions Referenced**:
  - `@instructions/coordination/agent-command-creation-standards.md`
  - `@instructions/coordination/orchestration-patterns.md`
  - `@templates/coordination/agent-template.md`
  - `@templates/coordination/simple-command-template.md`
  - `@templates/coordination/orchestrating-command-template.md`

- **Scripts Executed**:
  - None (uses Glob, Grep, Read for analysis)

- **Workflow**:
  1. Parses arguments (path, context, include-git, git-instructions)
  2. Validates intent and confirms with user
  3. Scans existing patterns in all agent/command locations
  4. Detects orchestration need and type (Simple, Sequential, Parallel, Complex)
  5. Determines agent strategy (Leverage existing, Base on personal, Create new)
  6. Presents confirmation summary and waits for user approval
  7. Prepares detailed instructions with template references
  8. Launches command-agent-duo agent with comprehensive brief
  9. Reports created files and usage

- **Dependencies**:
  - Agent: command-agent-duo
  - Existing patterns in ~/.claude/agents/, .claude/agents/, ~/.claude/commands/, .claude/commands/

---

## Summary of Tandem Relationships

| Workflow | Coordination Pattern | Connection Point |
|----------|---------------------|------------------|
| Release Planning Chain | Sequential handoff via `handoff-claude` | Shell command execution between commands |
| Error Investigation/Fix | Conversation context dependency | Previous message content extraction |
| Chore PR Pipeline | Shared file system state | `docs/development/chores/*.md` files |
| Impact Change + Plan | Output/input relationship | Assessment `_index.md` path |
| Impact Change Review | Embedded patterns | Error-explorer + impact-assessment patterns within one command |
| Dead Code Review | Internal phases | Analysis -> approval -> surgical implementation |
| Release Update Chain | Internal agent orchestration | Multiple updater agents coordinated sequentially |
| Documentation Cleanup | Multi-stage pipeline | Stage completion gates |
| Issue Management | Agent delegation | chain-issue-creator, chain-system-architect, chain-issue-updater |
| Memory Management | Hierarchical processing | Bottom-up directory tree traversal |
| Vite UI Fix | Service dependency | External service validation before agent launch |
| Agent-Command Creation | Pattern analysis + delegation | Existing pattern scanning before command-agent-duo launch |
