# Standalone Commands Analysis

## Overview

Standalone commands are commands that operate independently without being part of the chain-* orchestration pattern or having a direct command-agent duo relationship. These commands typically orchestrate multiple agents, provide utility functions, or serve as entry points for specific workflows.

## Commands Identified

### apply-chore-refactors
- **Purpose**: Sequentially apply refactoring work documented in docs/development/chores/ directory after chore PRs are reviewed
- **Agents Used**:
  - `chore-refactorer` (sequential, one per documentation file)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `gh pr merge [PR_NUMBER] --merge --delete-branch`
  - `rm docs/development/chores/pr-[NUMBER]-[title].md`
- **Workflow**:
  1. Discovery - Find all .md files in docs/development/chores/
  2. Sequential launch of chore-refactorer agents (one at a time)
  3. After each successful refactoring: merge PR, delete branch, delete documentation file
  4. Generate summary report
- **Dependencies**: Works after `/review-chore-prs` command; connected via documentation files

---

### cleanup-docs
- **Purpose**: Clean up loose scratchpad .md files scattered throughout the project, consolidate into proper docs/ folder
- **Agents Used**:
  - `md-scratchpad-cleanup` (parallel, one per target file)
  - `documentation-updater` (parallel for documentation creation, single for validation)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `rm [scratchpad-files]` (after validation)
- **Workflow**:
  1. Stage 0: Discovery - Find all loose .md files excluding standard locations
  2. Stage 1: Parallel cleanup agents for each target file
  3. Stage 2: Parallel documentation-updater agents to create proper docs
  4. Stage 3: Single validation agent + deletion of original files
- **Dependencies**: None

---

### create-project-agent-command-duo
- **Purpose**: Intelligently create project-level agent-command pairs by analyzing existing patterns and leveraging reusable components
- **Agents Used**:
  - `command-agent-duo` (single agent for final creation)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**:
  - `@instructions/coordination/agent-command-creation-standards.md`
  - `@instructions/coordination/orchestration-patterns.md`
  - `@templates/coordination/*.md`
- **Scripts Executed**: None
- **Workflow**:
  1. Phase 1: Parse & Validate arguments (path, context, git, git-instructions)
  2. Phase 2: Scan existing patterns in agents/commands directories
  3. Phase 3: Determine strategy (orchestration type A/B/C/D, agent strategy)
  4. Phase 4: User confirmation with proposed plan
  5. Phase 5: Prepare detailed instructions for command-agent-duo
  6. Phase 6: Execute - launch agent
  7. Phase 7: Report results
- **Dependencies**: References templates and instructions for standards

---

### dead-code-review
- **Purpose**: Orchestrate comprehensive dead code analysis by launching multiple parallel agents to identify removable code with 100% certainty
- **Agents Used**:
  - `dead-code-reviewer` (parallel, 3-7 agents based on directory size)
  - `surgical-edits` (parallel for removal execution)
  - `verify-ui` (if frontend changes involved)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `mkdir -p foreman/docs/dead_code/$(date +%Y-%m-%d)-[brief-name]`
  - `find [directory] -type f ... | wc -l`
- **Workflow**:
  1. Phase 1: Setup & Analysis - validate directory, determine agent count
  2. Phase 2: Launch parallel analysis agents with distinct focus areas
  3. Phase 3: Synthesis - cross-validate findings, create _summary.md
  4. Phase 4: User approval
  5. Phase 5: Surgical implementation (post-approval)
  6. Phase 6: Finalization and report
- **Dependencies**: None

---

### error-explorer
- **Purpose**: Launch parallel deep-dive error analysis to definitively identify root cause and required fixes
- **Agents Used**:
  - `error-explorer` (parallel, minimum 5 agents with different focus areas)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly
- **Scripts Executed**: None
- **Workflow**:
  1. Launch 5+ parallel error-explorer agents with distinct focuses:
     - Primary Error Path Agent
     - Entry Point Agent
     - Configuration Agent
     - State Management Agent
     - Integration Boundaries Agent
  2. Synthesis: Collect findings, cross-validate, resolve conflicts
  3. Output: Concise no-code response with root cause, files to modify, recommended fix
- **Dependencies**: Often followed by `/error-fix` command

---

### error-fix
- **Purpose**: Fix identified errors by launching surgical-fixes agent, verifying the fix through appropriate testing, and iterating until resolved
- **Agents Used**:
  - `surgical-fixes` (single agent per iteration)
  - `verify-ui` (if frontend involved)
  - `error-explorer` (for re-analysis if fix fails)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly
- **Scripts Executed**: Various test commands depending on project type
- **Workflow**:
  1. Phase 1: Parse & Analyze - extract error context from previous `/error-explorer` output
  2. Phase 2: Implement fix via surgical-fixes agent
  3. Phase 3: Verification (Path A: Frontend with verify-ui, Path B: Backend/Script)
  4. Phase 4: Iterative loop if error persists (max 3 iterations)
  5. Phase 5: Success report
- **Dependencies**: Requires prior `/error-explorer` analysis in conversation

---

### fix-git
- **Purpose**: Fix git commit errors by launching parallel agents for each affected file
- **Agents Used**:
  - `git-error-fixer` (parallel, one per file or file-pair)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**: None
- **Workflow**:
  1. Parse error log from $ARGUMENTS
  2. Group related files (test files with implementation files)
  3. Launch git-error-fixer agents in parallel
  4. Verify tests pass after fixes
- **Dependencies**: None

---

### fix-issue
- **Purpose**: Make surgical modifications to a single issue in the issue planning system while maintaining integrity across all four planning documents
- **Agents Used**:
  - `fix-issue` (single agent)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/planning/issue-plan-template-instructions.md`
  - `@foreman/instructions/planning/issue-overview-template-instructions.md`
  - `@foreman/instructions/planning/user-requirements-template-instructions.md`
- **Scripts Executed**:
  - GitHub MCP tools for issue comment updates
- **Workflow**:
  1. Step 1: Validate issue file path
  2. Step 2: Collect modification context
  3. Step 3: Launch fix-issue agent
  4. Step 4: Process agent results
  5. Step 5: GitHub issue comment update (or provide replacement content)
  6. Step 6: Final summary
- **Dependencies**: Works with foreman release planning system

---

### format-claude-file
- **Purpose**: Optimize agent or slash command files by removing excessive length while retaining all context and applying best practices
- **Agents Used**: None (self-executing command)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly (references Anthropic's guidelines)
- **Scripts Executed**: None
- **Workflow**:
  1. Step 1: Locate the file (search agents/, commands/ directories)
  2. Step 2: Read and analyze structure
  3. Step 3: Apply best practices (frontmatter, content structure)
  4. Step 4: Optimize content (consolidate, simplify, reduce)
  5. Step 5: Preserve essential context
  6. Step 6: Apply optimization via Edit tool
  7. Step 7: Report results with metrics
- **Dependencies**: None

---

### impact-change
- **Purpose**: Orchestrate comprehensive impact assessment and surgical implementation of code changes with parallel agents, verification, and UI testing
- **Agents Used**:
  - `impact-assessment` (parallel, 3-7 agents based on complexity)
  - `surgical-edits` (sequential or parallel based on dependencies)
  - `verify-ui` (if frontend changes)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**:
  - `@instructions/coordination/impact-change-orchestration.md`
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`
- **Scripts Executed**:
  - `mkdir -p foreman/docs/impact_assessment/[YYYY-MM-DD]-[brief-name]`
- **Workflow**:
  1. Phase 1: Impact Assessment - parallel agents analyze change
  2. Phase 2: Gap Analysis - verify completeness
  3. Phase 2.5: Dead Code Detection
  4. Phase 3: User Approval
  5. Phase 4: Surgical Implementation - phased agent execution
  6. Phase 5: UI Verification (if frontend)
  7. Phase 6: Final Summary
- **Dependencies**: Creates documentation in foreman/docs/impact_assessment/

---

### impact-change-review
- **Purpose**: Reassess a completed change when new issues arise by pairing error-explorer agents with fresh impact assessments
- **Agents Used**:
  - `error-explorer` (parallel, minimum 5 agents)
  - `impact-assessment` (parallel, 3-7 agents)
  - `surgical-edits` (for execution)
  - `verify-ui` (if frontend)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**:
  - `@instructions/assessment/impact-assessment-qrg-format.md`
  - `@instructions/assessment/gap-analysis-checklist.md`
- **Scripts Executed**:
  - `ls -lt foreman/docs/impact_assessment/ | head -n 5`
- **Workflow**:
  1. Phase 1: Load Context (no attempt folders)
  2. Phase 2: Parallel error-explorer agents
  3. Phase 3: Rewrite _index.md (extremely concise)
  4. Phase 4: Updated impact assessment with new context
  5. Phase 5: Gap Analysis
  6. Phase 5.5: Dead Code Review
  7. Phase 6: User Approval
  8. Phase 7: Agentic Execution
- **Dependencies**: Works with existing impact assessment folders

---

### manage-memory
- **Purpose**: Update CLAUDE.md files for a directory and all descendants using memory-manager agent
- **Agents Used**:
  - `memory-manager` (sequential, one per directory)
- **Rules Referenced**:
  - `rules/memory-system-standards.mdc` (referenced for adjacency heuristics)
- **Instructions Referenced**: None explicitly
- **Scripts Executed**: None
- **Workflow**:
  - **Assessment Mode** (when $1 is assessment file):
    1. A: Structural Gaps - create CLAUDE.md files
    2. B: Size Violations - condense via promotion/delegation
    3. C: Navigation Gaps - update parent navigation
    4. D: Dependency Violations - output manual instructions
  - **Directory Mode**:
    1. Step 1: Analyze complete directory tree
    2. Step 2: Identify directories to process (depth-scaled thresholds)
    3. Step 3: Process directories bottom-up (deepest-first)
    4. Step 4: Process parent directory
- **Dependencies**: Works with memory system validation assessments

---

### new-issue
- **Purpose**: Add new issues to an existing release using chain-issue-creator agent
- **Agents Used**:
  - `chain-issue-creator` (single agent)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `log-activity release $1 agent new-issue "Added new issues: $ARGUMENTS"`
- **Workflow**:
  1. Step 1: Validate release and gather context
  2. Step 2: Prepare functionality context (parse arguments)
  3. Step 3: Launch chain-issue-creator agent
  4. Step 4: Verify integration
- **Dependencies**: Works with foreman release system

---

### plan-change
- **Purpose**: Orchestrate comprehensive granular change planning by analyzing impact assessments, creating structured documentation, and launching planning agents
- **Agents Used**:
  - `change-plan-builder` (parallel or sequential based on dependencies)
- **Rules Referenced**:
  - `@rules/documentation-rules.mdc`
  - `@rules/development-standards.mdc`
- **Instructions Referenced**:
  - `@instructions/planning/granular-change-plan-instructions.md`
- **Scripts Executed**:
  - `mkdir -p foreman/docs/change_plan/[type]/[date]-[name]`
- **Workflow**:
  1. Phase 1: Locate impact assessment
  2. Phase 2: Analyze and determine structure (3-7 work items)
  3. Phase 3: Create documentation structure (_index.md, stub files)
  4. Phase 4: Launch planning agents (parallel groups, sequential sets)
  5. Phase 5: Final report
- **Dependencies**: Requires impact assessment from `/impact-change`

---

### restructure-docs
- **Purpose**: Restructure documentation file into proper hierarchy with splitting and link updates
- **Agents Used**:
  - `documentation-updater` (single agent)
- **Rules Referenced**:
  - `@rules/documentation-rules.mdc`
- **Instructions Referenced**: None explicitly
- **Scripts Executed**: None
- **Workflow**:
  1. Step 1: Validate inputs (source file, destination path)
  2. Step 2: Analyze source file (token count, structure needs)
  3. Step 3: Launch documentation-updater agent
  4. Step 4: Verification (structure, links, standards)
- **Dependencies**: None

---

### review-chore-prs
- **Purpose**: Review and merge chore PRs (deps, deps-dev, ci), or flag them for refactoring
- **Agents Used**:
  - `pr-chore-reviewer` (sequential, one per PR)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `gh pr list --json number,title --limit 100`
  - `mkdir -p docs/development/chores`
- **Workflow**:
  1. Step 1: Discover chore PRs via GitHub CLI
  2. Step 2: Sequential agent launch (one PR at a time)
  3. Step 3: Generate summary report
  4. Step 4: Create refactoring documentation for PRs requiring changes
- **Dependencies**: Creates documentation for `/apply-chore-refactors` command

---

### update-plans
- **Purpose**: Update existing planning docs for a release using chain-system-architect after implementation
- **Agents Used**:
  - `chain-system-architect` (single agent, reconciliation mode)
  - `chain-issue-updater` (single agent, line-reference-reconciliation mode)
- **Rules Referenced**: None explicitly
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `log-activity release $1 agent update-plans "Updated planning docs and line refs from issue $2: $ARGUMENTS"`
- **Workflow**:
  1. Step 1: Validate release and gather implementation context
  2. Step 2: Prepare implementation context
  3. Step 3: Launch chain-system-architect (reconciliation mode)
  4. Step 4: Update issue line references via chain-issue-updater
  5. Step 5: Verify documentation updates
- **Dependencies**: Works with foreman release planning system

---

### vite-UI-fix
- **Purpose**: Fix Vite frontend UI/UX issues through iterative verification and repair with comprehensive service validation
- **Agents Used**:
  - `vite-frontend-fix` (single agent)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly
- **Scripts Executed**:
  - `ps aux | grep "vite" | grep -v grep`
  - `lsof -i :5173 || netstat -an | grep 5173`
  - Various service status checks
- **Workflow**:
  1. Step 1: Validate issue description
  2. Step 2: Service validation (Vite, database, backend, etc.)
  3. Step 3: User confirmation for missing services
  4. Step 4: Launch vite-frontend-fix agent
  5. Step 5: Process agent results
  6. Step 6: Final summary
- **Dependencies**: Requires Vite dev server and related services to be running

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Standalone Commands | 18 |
| Commands Using Parallel Agents | 9 |
| Commands Using Sequential Agents | 6 |
| Commands Using Mixed Strategies | 3 |
| Commands with No Agents (Self-executing) | 1 |
| Commands Referencing Rules | 7 |
| Commands Referencing Instructions | 6 |
| Commands Executing Scripts | 11 |

## Common Patterns

1. **Orchestration Pattern**: Most standalone commands orchestrate one or more specialized agents
2. **Parallel-First**: Commands prefer parallel agent execution when tasks are independent
3. **User Approval Gates**: Several commands require explicit user approval before execution phases
4. **Documentation Integration**: Many commands create or update documentation in foreman/docs/
5. **Iterative Verification**: Commands like error-fix and vite-UI-fix use iterative fix-verify loops
6. **Service Validation**: Frontend-focused commands validate required services before proceeding
