# Command-Agent Duo Workflow Analysis

## Overview

The command-agent duo pattern is a workflow architecture where a command file orchestrates one or more specialized agent files to accomplish complex tasks. Commands handle high-level orchestration (phases, user approval, synthesis), while agents focus on specific deep-dive work. This pattern enables parallel execution, specialized expertise, and clear separation of concerns.

## Duos Identified

### 1. Impact Change Duo

- **Command**: `impact-change.md`
- **Agent**: `impact-assessment.md`, `surgical-edits.md`, `verify-ui.md`
- **Purpose**: Orchestrates comprehensive impact assessment and surgical implementation of code changes with parallel agents, verification, and UI testing
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**:
  - `@instructions/coordination/impact-change-orchestration.md`
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`
- **Scripts Executed**: None directly; uses Bash for `mkdir -p` folder creation
- **Workflow**:
  1. Command analyzes complexity and creates assessment folder
  2. Command launches 3-7 parallel `impact-assessment` agents based on complexity
  3. Each agent focuses on specific area (Backend, Frontend, Tests, etc.)
  4. Command synthesizes all agent reports into unified `_index.md`
  5. Command performs gap analysis and dead code detection
  6. Command awaits user approval before proceeding
  7. Command launches `surgical-edits` agents to implement approved changes
  8. If frontend changes made, command launches `verify-ui` agent
  9. Command provides final summary
- **Dependencies**:
  - `impact-assessment` agent (parallel, 3-7 instances)
  - `surgical-edits` agent (for implementation phase)
  - `verify-ui` agent (for UI verification phase)

---

### 2. Impact Change Review Duo

- **Command**: `impact-change-review.md`
- **Agent**: `error-explorer.md`, `impact-assessment.md`, `surgical-edits.md`, `verify-ui.md`
- **Purpose**: Re-runs assessment for a specific issue after a completed change cycle by pairing parallel error-explorer agents with fresh impact assessments
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**:
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`
- **Scripts Executed**: `ls -lt foreman/docs/impact_assessment/ | head -n 5`
- **Workflow**:
  1. Command loads context from existing `_index.md`
  2. Command launches 5+ parallel `error-explorer` agents to investigate new issues
  3. Command rewrites `_index.md` with error explorer synthesis (before new agents)
  4. Command launches 3-7 parallel `impact-assessment` agents with new context
  5. Command synthesizes new agent findings into updated `_index.md`
  6. Command performs gap analysis
  7. Command launches dead-code analysis agent if needed
  8. Command awaits user approval
  9. Command executes agentic implementation with `surgical-edits` agents
  10. If UI changes, launches `verify-ui` agent
- **Dependencies**:
  - `error-explorer` agent (parallel, 5+ instances)
  - `impact-assessment` agent (parallel, 3-7 instances)
  - `surgical-edits` agent (for execution phase)
  - `verify-ui` agent (for UI verification)

---

### 3. Error Explorer Duo

- **Command**: `error-explorer.md`
- **Agent**: `error-explorer.md`
- **Purpose**: Launch parallel deep-dive error analysis to definitively identify root cause and required fixes
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None directly
- **Scripts Executed**: None
- **Workflow**:
  1. Command receives issue description as argument
  2. Command launches 5+ parallel `error-explorer` agents with distinct focus areas:
     - Primary Error Path Agent
     - Entry Point Agent
     - Configuration Agent
     - State Management Agent
     - Integration Boundaries Agent
  3. Command waits for all agents to complete
  4. Command synthesizes findings (cross-validate, resolve conflicts, identify patterns)
  5. Command provides definitive root cause analysis with file:line references
- **Dependencies**:
  - `error-explorer` agent (parallel, 5+ instances with different focus areas)

---

### 4. Error Fix Duo

- **Command**: `error-fix.md`
- **Agent**: `surgical-fixes.md`, `error-explorer.md`, `verify-ui.md`
- **Purpose**: Fixes identified errors by launching surgical-fixes agent, verifying the fix through appropriate testing, and iterating until error is resolved
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None directly
- **Scripts Executed**: Various service start commands, API calls for verification
- **Workflow**:
  1. Command extracts error context from previous `/error-explorer` output
  2. Command determines if frontend is involved
  3. Command launches `surgical-fixes` agent with complete error analysis
  4. If frontend: Creates impact assessment and launches `verify-ui` agent
  5. If backend: Recreates scenario with script/service testing
  6. If error persists, command iterates (max 3 times):
     - Relaunches `error-explorer` for deeper analysis
     - Relaunches `surgical-fixes` with updated analysis
  7. Command provides success report
- **Dependencies**:
  - `surgical-fixes` agent (primary fix implementation)
  - `error-explorer` agent (for re-analysis on iterations)
  - `verify-ui` agent (for frontend verification)
  - Requires prior `/error-explorer` run

---

### 5. Dead Code Review Duo

- **Command**: `dead-code-review.md`
- **Agent**: `dead-code-reviewer.md`, `surgical-edits.md`, `verify-ui.md`
- **Purpose**: Orchestrates comprehensive dead code analysis by launching multiple parallel agents to identify removable code with 100% certainty
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**:
  - `ls -la [directory]`
  - `find [directory] -type f ... | wc -l`
  - `mkdir -p foreman/docs/dead_code/$(date +%Y-%m-%d)-[name]`
- **Workflow**:
  1. Command validates directory and determines complexity
  2. Command creates output folder for findings
  3. Command launches 3-7 parallel `dead-code-reviewer` agents based on size:
     - 3 agents: Source, Tests, Configuration
     - 5 agents: Core, UI, Utilities, Tests, Config
     - 7 agents: Full breakdown by layer
  4. Command monitors all agents for completion
  5. Command synthesizes findings (cross-validate, resolve conflicts)
  6. Command creates unified analysis in `_summary.md`
  7. Command awaits user approval
  8. If approved, launches `surgical-edits` agents for removal
  9. If frontend changes, launches `verify-ui` agent
  10. Command provides final report
- **Dependencies**:
  - `dead-code-reviewer` agent (parallel, 3-7 instances)
  - `surgical-edits` agent (for removal implementation)
  - `verify-ui` agent (for UI verification if applicable)

---

### 6. Manage Memory Duo

- **Command**: `manage-memory.md`
- **Agent**: `memory-manager.md`
- **Purpose**: Update CLAUDE.md files for directory and all descendants using memory-manager agent
- **Rules Referenced**:
  - `rules/memory-system-standards.mdc` (adjacency heuristics)
- **Instructions Referenced**: None directly
- **Scripts Executed**: None (file system operations handled by agent)
- **Workflow**:
  1. Command detects input mode (Assessment Mode vs Directory Mode)
  2. **Assessment Mode**: Parses validation issues and fixes sequentially
     - Structural Gaps: Launch `memory-manager` for missing CLAUDE.md
     - Size Violations: Launch `memory-manager` with promotion/delegation
     - Navigation Gaps: Launch `memory-manager` for parent updates
  3. **Directory Mode**:
     - Analyzes complete directory tree
     - Calculates nesting levels and applies depth-scaled thresholds
     - Processes directories bottom-up (deepest first)
     - Launches `memory-manager` with Workflow 2 (Targeted) or Workflow 3 (Parent Aggregation)
  4. Sequential processing to prevent API concurrency errors
- **Dependencies**:
  - `memory-manager` agent (sequential, one at a time)

---

### 7. Fix Git Duo

- **Command**: `fix-git.md`
- **Agent**: `git-error-fixer.md`
- **Purpose**: Fix git commit errors by launching parallel agents for each affected file
- **Rules Referenced**: None directly (agents follow commit-time fixes playbook)
- **Instructions Referenced**: Commit-time fixes playbook (referenced in agent instructions)
- **Scripts Executed**: None directly
- **Workflow**:
  1. Command parses git error log from arguments
  2. Command identifies all file paths with errors
  3. Command groups related files (test files with implementation files)
  4. Command launches parallel `git-error-fixer` agents (one per file or file-pair)
  5. Each agent receives:
     - Specific file path(s)
     - Relevant error messages
     - Instructions to follow commit-time fixes playbook
  6. Agents fix errors and verify tests pass
- **Dependencies**:
  - `git-error-fixer` agent (parallel, one per file/file-pair)

---

### 8. Fix Issue Duo

- **Command**: `fix-issue.md`
- **Agent**: `fix-issue.md`
- **Purpose**: Make surgical modifications to a single issue in the issue planning system while maintaining integrity across all four planning documents
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/planning/issue-plan-template-instructions.md`
  - `@foreman/instructions/planning/issue-overview-template-instructions.md`
  - `@foreman/instructions/planning/user-requirements-template-instructions.md`
- **Scripts Executed**: `gh pr merge`, `gh api` (via MCP)
- **Workflow**:
  1. Command validates issue file path and extracts release context
  2. Command collects modification context from arguments
  3. Command launches `fix-issue` agent with comprehensive instructions
  4. Agent reads and analyzes all four planning documents
  5. Agent makes surgical modifications following template instructions
  6. Agent validates changes across documents
  7. Command processes agent results
  8. Command attempts GitHub issue comment update via MCP
  9. Command provides final summary
- **Dependencies**:
  - `fix-issue` agent (single instance)
  - GitHub MCP tools for issue comment updates

---

### 9. Plan Change Duo

- **Command**: `plan-change.md`
- **Agent**: `change-plan-builder.md`
- **Purpose**: Orchestrates comprehensive granular change planning by analyzing impact assessments, creating structured documentation, and launching planning agents
- **Rules Referenced**:
  - `@rules/documentation-rules.mdc`
  - `@rules/development-standards.mdc`
- **Instructions Referenced**:
  - `@instructions/planning/granular-change-plan-instructions.md`
- **Scripts Executed**: `mkdir -p foreman/docs/change_plan/[type]/[date]-[name]`
- **Workflow**:
  1. Command locates impact assessment (prompts user if not provided)
  2. Command reads and analyzes assessment for change type and complexity
  3. Command identifies 3-7 work items and determines dependencies
  4. Command creates documentation structure (`_index.md`, stub files)
  5. Command updates master TOC
  6. Command executes parallel group (independent items launched simultaneously)
  7. Command executes sequential sets (dependent items launched in order)
  8. Each `change-plan-builder` agent creates detailed plan following instructions
  9. Command verifies all plans created and provides comprehensive report
- **Dependencies**:
  - `change-plan-builder` agent (parallel for independent items, sequential for dependent)

---

### 10. Apply Chore Refactors Duo

- **Command**: `apply-chore-refactors.md`
- **Agent**: `chore-refactorer.md`
- **Purpose**: Apply refactoring from docs/development/chores/ files sequentially
- **Rules Referenced**: None directly
- **Instructions Referenced**: None directly
- **Scripts Executed**:
  - `gh pr merge [PR_NUMBER] --merge --delete-branch`
  - `rm docs/development/chores/pr-[NUMBER]-[title].md`
- **Workflow**:
  1. Command discovers refactoring files via Glob pattern
  2. Command launches `chore-refactorer` agents **one at a time** (sequential)
  3. Each agent:
     - Reads documentation file
     - Applies documented changes
     - Runs tests to verify correctness
  4. After each successful refactoring:
     - Command merges PR via `gh pr merge`
     - Command deletes documentation file
  5. Failed refactorings retain documentation for manual review
  6. Command generates summary with success/failure breakdown
- **Dependencies**:
  - `chore-refactorer` agent (sequential, one at a time)
  - Relationship with `/review-chore-prs` (upstream command)

---

### 11. Review Chore PRs Duo

- **Command**: `review-chore-prs.md`
- **Agent**: `pr-chore-reviewer.md`
- **Purpose**: Review and merge chore PRs (deps, deps-dev, ci), or flag them for refactoring
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**: `gh pr list`, `gh pr merge`, GitHub MCP tools
- **Workflow**:
  1. Command discovers open chore PRs via `gh pr list` or MCP
  2. Command launches `pr-chore-reviewer` agents (parallel or sequential based on PR count)
  3. Each agent reviews PR for:
     - Breaking changes
     - Required refactoring
     - Safe to merge status
  4. Safe PRs are merged directly
  5. Complex PRs generate documentation in `docs/development/chores/`
  6. Command provides summary of merged vs flagged PRs
- **Dependencies**:
  - `pr-chore-reviewer` agent
  - Relationship with `/apply-chore-refactors` (downstream command)

---

### 12. Vite UI Fix Duo

- **Command**: `vite-UI-fix.md`
- **Agent**: `vite-frontend-fix.md`, `verify-ui.md`
- **Purpose**: Fix Vite frontend UI/UX issues through iterative verification and repair with comprehensive service validation
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**: Vite dev server commands, service validation commands
- **Workflow**:
  1. Command receives UI issue description
  2. Command launches `vite-frontend-fix` agent with issue context
  3. Agent analyzes and fixes the issue
  4. Command launches `verify-ui` agent to validate fixes
  5. If issues persist, iterates with additional fixes
  6. Command provides comprehensive fix report
- **Dependencies**:
  - `vite-frontend-fix` agent (primary fix implementation)
  - `verify-ui` agent (validation)

---

### 13. Create Project Agent-Command Duo

- **Command**: `create-project-agent-command-duo.md`
- **Agent**: `command-agent-duo.md`
- **Purpose**: Intelligently creates project-level agent-command pairs by analyzing existing patterns and leveraging reusable components
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**: None directly
- **Workflow**:
  1. Command analyzes existing patterns in commands/ and agents/ directories
  2. Command determines appropriate structure for new duo
  3. Command launches `command-agent-duo` agent with requirements
  4. Agent creates matched command and agent files
  5. Agent ensures consistency with existing patterns
  6. Command validates created files
- **Dependencies**:
  - `command-agent-duo` agent (single instance)

---

### 14. Cleanup Docs Duo

- **Command**: `cleanup-docs.md`
- **Agent**: `md-scratchpad-cleanup.md`
- **Purpose**: Clean up loose scratchpad .md files, consolidate into proper docs/, and remove originals
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**: File move and delete operations
- **Workflow**:
  1. Command discovers loose markdown files outside docs/
  2. Command analyzes which files should be consolidated
  3. Command launches `md-scratchpad-cleanup` agent
  4. Agent consolidates content into proper documentation structure
  5. Agent removes original scratchpad files
  6. Command verifies cleanup completion
- **Dependencies**:
  - `md-scratchpad-cleanup` agent

---

### 15. Restructure Docs Duo

- **Command**: `restructure-docs.md`
- **Agent**: `documentation-updater.md`
- **Purpose**: Restructure documentation file into proper hierarchy with splitting and link updates
- **Rules Referenced**: None specified
- **Instructions Referenced**: None specified
- **Scripts Executed**: None directly
- **Workflow**:
  1. Command receives documentation file path
  2. Command analyzes file structure and determines restructuring needs
  3. Command launches `documentation-updater` agent
  4. Agent splits large documentation into proper hierarchy
  5. Agent updates all internal and external links
  6. Agent ensures consistency across documentation
- **Dependencies**:
  - `documentation-updater` agent

---

## Summary Table

| Duo Name | Command | Primary Agent(s) | Execution Pattern |
|----------|---------|------------------|-------------------|
| Impact Change | impact-change.md | impact-assessment, surgical-edits, verify-ui | Parallel assessment, Sequential implementation |
| Impact Change Review | impact-change-review.md | error-explorer, impact-assessment, surgical-edits, verify-ui | Parallel exploration, Parallel assessment, Sequential implementation |
| Error Explorer | error-explorer.md | error-explorer | Parallel (5+ agents) |
| Error Fix | error-fix.md | surgical-fixes, error-explorer, verify-ui | Sequential with iteration (max 3) |
| Dead Code Review | dead-code-review.md | dead-code-reviewer, surgical-edits, verify-ui | Parallel analysis, Sequential removal |
| Manage Memory | manage-memory.md | memory-manager | Sequential (bottom-up) |
| Fix Git | fix-git.md | git-error-fixer | Parallel (per file/pair) |
| Fix Issue | fix-issue.md | fix-issue | Single agent |
| Plan Change | plan-change.md | change-plan-builder | Mixed (parallel independent, sequential dependent) |
| Apply Chore Refactors | apply-chore-refactors.md | chore-refactorer | Sequential |
| Review Chore PRs | review-chore-prs.md | pr-chore-reviewer | Parallel or Sequential |
| Vite UI Fix | vite-UI-fix.md | vite-frontend-fix, verify-ui | Sequential with iteration |
| Create Duo | create-project-agent-command-duo.md | command-agent-duo | Single agent |
| Cleanup Docs | cleanup-docs.md | md-scratchpad-cleanup | Single agent |
| Restructure Docs | restructure-docs.md | documentation-updater | Single agent |

## Common Patterns

### Parallel Agent Launch
Used when multiple independent investigations or analyses are needed:
- `error-explorer`: 5+ agents for multi-angle investigation
- `impact-assessment`: 3-7 agents for area-specific assessment
- `dead-code-reviewer`: 3-7 agents for codebase analysis

### Sequential Agent Execution
Used when order matters or to prevent concurrency issues:
- `manage-memory`: Bottom-up processing, one at a time
- `apply-chore-refactors`: Test validation between refactors
- Error fix iterations: Fix -> Verify -> Re-analyze if needed

### Mixed Execution
Used for complex workflows with both independent and dependent work:
- `plan-change`: Parallel for independent items, sequential for dependent
- `impact-change-review`: Parallel exploration, parallel assessment, sequential implementation

### Iteration Loops
Used for fix-verify-retry workflows:
- `error-fix`: Max 3 iterations of fix-verify-re-analyze
- `vite-UI-fix`: Iterative fix and verification
