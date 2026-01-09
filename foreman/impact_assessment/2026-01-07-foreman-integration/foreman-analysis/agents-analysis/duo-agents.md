# Command-Agent Duo Analysis

This document catalogues all agents that operate as part of command-agent duo workflows in the foreman system.

---

## 1. impact-assessment + impact-change

**Agent:** `impact-assessment.md`
**Command:** `impact-change.md`

**Purpose:** Analyzes comprehensive impact of code changes by identifying affected areas and documenting complete logic chains file-by-file across the entire project.

**How Command Invokes Agent:**
- Command launches parallel impact-assessment agents (3-7 based on complexity)
- Uses Task tool with `subagent_type: "impact-assessment"`
- Each agent receives specific focus area (Backend, Frontend, Tests, etc.)
- Agents write findings to dated folder in `foreman/docs/impact_assessment/`

**Rules Referenced:**
- `@development-standards.mdc` (LOC limits)

**Templates/Instructions Referenced:**
- `@instructions/coordination/impact-change-orchestration.md`
- `@instructions/assessment/impact-assessment-qrg-format.md`
- `@instructions/assessment/gap-analysis-checklist.md`

**Workflow:**
1. Analyze complexity, create dated folder
2. Launch parallel assessment agents with focus assignments
3. Synthesize findings into `_index.md`
4. Gap analysis and dead code detection
5. User approval gate
6. Launch surgical-edits agents for implementation
7. UI verification (if frontend changes)
8. Final summary

**Outputs:** Impact assessment documents in `foreman/docs/impact_assessment/[YYYY-MM-DD]-[name]/`

**Dependencies:** Works with surgical-edits agent (Phase 4) and verify-ui agent (Phase 5)

---

## 2. surgical-edits + impact-change

**Agent:** `surgical-edits.md`
**Command:** `impact-change.md`

**Purpose:** Executes planned code changes with surgical precision following impact assessment plans exactly while ensuring tests are updated and pass with no silent failures.

**How Command Invokes Agent:**
- Launched after user approval in Phase 4
- Uses Task tool with `subagent_type: "surgical-edits"`
- Receives path to assessment and specific assignment (chain/phase)
- Multiple agents may run sequentially (backend before frontend)

**Rules Referenced:**
- `@development-standards.mdc` (LOC limits: <=150 goal, <=200 buffer)

**Workflow:**
1. Understand assignment from assessment document
2. Pre-change verification (read files, locate tests)
3. Execute changes following the plan exactly
4. Update related tests
5. Verification (run tests, check for regressions)
6. Silent failure check
7. Report completion

**Outputs:** Modified source files, updated tests, completion report

**Dependencies:** Depends on impact-assessment agent output; followed by verify-ui agent

---

## 3. verify-ui + impact-change / vite-UI-fix

**Agent:** `verify-ui.md`
**Command:** `impact-change.md`, `vite-UI-fix.md`

**Purpose:** Verifies frontend changes by testing actual UI behavior with Playwright, validating backend logic execution, and making minimal fixes while ensuring tests pass.

**How Command Invokes Agent:**
- Launched in Phase 5 of impact-change if frontend changes were made
- Also used by vite-UI-fix command
- Uses Task tool with `subagent_type: "verify-ui"`
- Receives path to assessment and list of UI flows changed

**Tools Used:**
- Full Playwright MCP browser tools suite
- Read, Edit, Bash, Glob, Grep

**Workflow:**
1. Read impact assessment, identify test scenarios
2. Setup verification environment
3. Test each modified UI flow with Playwright
4. Issue detection and analysis
5. Make minimal fixes
6. Comprehensive verification
7. Report results

**Outputs:** UI verification report with test scenarios, issues found/fixed, screenshots

**Dependencies:** Depends on surgical-edits completing frontend changes

---

## 4. vite-frontend-fix + vite-UI-fix

**Agent:** `vite-frontend-fix.md`
**Command:** `vite-UI-fix.md`

**Purpose:** Fixes Vite frontend UI/UX issues through iterative verification and repair using Playwright MCP.

**How Command Invokes Agent:**
- Command validates services are running first
- Launches vite-frontend-fix agent with issue description
- Uses Task tool with `subagent_type: "vite-frontend-fix"`

**Rules Referenced:**
- `@foreman/rules/development-standards.mdc` (Requirements 5, 11, 14, 16, 20)

**Tools Used:**
- Full Playwright MCP browser tools suite
- GitHub MCP tools for issue context
- Read, Write, Edit, Bash, Glob, Grep

**Workflow:**
1. Environment setup & context gathering
2. Issue reproduction with Playwright
3. Root cause analysis
4. Iterative fix & verify loop (max 5 iterations)
5. Test restructuring (only after fix)
6. Silent error prevention

**Outputs:** Fixed code, updated tests, YAML-formatted resolution report

**Dependencies:** None (standalone fix agent)

---

## 5. error-explorer + error-explorer (command)

**Agent:** `error-explorer.md`
**Command:** `error-explorer.md`

**Purpose:** Deep code analysis to trace through entire logic flows and identify root causes of errors with 100% confidence. Does not test implementations, only reads and understands code logic.

**How Command Invokes Agent:**
- Command launches parallel error-explorer agents
- Uses Task tool with `subagent_type: "error-explorer"`
- Each agent focuses on specific aspect of the error

**Tools Used:**
- Read, Glob, Bash(ls, cat, find, tree)
- NO Grep (reads full files instead)

**Workflow:**
1. Context gathering (error description, logs, entry points)
2. Code path tracing (backwards from error, forwards from entry)
3. Root cause identification (distinguish symptoms from causes)
4. Evidence documentation with file:line references

**Outputs:** Root cause analysis with complete logic flow, confidence level, evidence

**Dependencies:** Feeds into error-fix workflow

---

## 6. surgical-fixes + error-fix

**Agent:** `surgical-fixes.md`
**Command:** `error-fix.md`

**Purpose:** Executes targeted fixes for identified errors while preserving all existing and intended functionality, updating tests appropriately.

**How Command Invokes Agent:**
- Launched after error-explorer completes analysis
- Uses Task tool with `subagent_type: "surgical-fixes"`
- Receives error analysis, root cause location, evidence

**Rules Referenced:**
- `@foreman/rules/development-standards.mdc`

**Workflow:**
1. Understand the error from analysis
2. Implement the fix (targeted edits, error handling)
3. Update tests
4. Verify the fix (run tests, check side effects)
5. Report completion

**Outputs:** Fixed files, updated tests, completion report with verification

**Dependencies:** Depends on error-explorer agent output

---

## 7. dead-code-reviewer + dead-code-review

**Agent:** `dead-code-reviewer.md`
**Command:** `dead-code-review.md`

**Purpose:** Analyzes codebases to identify dead code with 100% certainty through comprehensive logic tracing and usage analysis.

**How Command Invokes Agent:**
- Command launches parallel dead-code-reviewer agents
- Uses Task tool with `subagent_type: "dead-code-reviewer"`
- Each agent focuses on different area/focus

**Tools Used:**
- Read, Glob, Grep, Bash(ls, find, tree)

**Workflow:**
1. Context understanding (scope, entry points, tech stack)
2. Usage mapping (build usage graph, check all import patterns)
3. Dead code identification (verification steps, confidence assessment)
4. Categorization (high/medium/low priority)

**Outputs:** Dead code analysis with evidence, confidence levels, removal strategy

**Dependencies:** None (standalone analysis)

---

## 8. memory-manager + manage-memory

**Agent:** `memory-manager.md`
**Command:** `manage-memory.md`

**Purpose:** Generates, updates, or maintains CLAUDE.md memory files across a project using adjacency-oriented hierarchical memory system.

**How Command Invokes Agent:**
- Command supports Assessment Mode and Directory Mode
- Uses Task tool with `subagent_type: "memory-manager"`
- Passes workflow number (1: Full Project, 2: Targeted Area, 3: Parent Aggregation)

**Rules Referenced:**
- `rules/memory-system-standards.mdc` (depth-scaled size limits, adjacency heuristics)

**Instructions Referenced:**
- `foreman/instructions/memory/root-claude-instructions.md`
- `foreman/instructions/memory/subtree-claude-instructions.md`
- `foreman/instructions/memory/cross-cutting-instructions.md`
- `foreman/instructions/memory/promotion-demotion-process.md`
- `foreman/instructions/memory/context-loading-model.md`

**Workflow (varies by mode):**
- Workflow 1: Full project generation (bottom-up)
- Workflow 2: Targeted area update (local scope only)
- Workflow 3: Parent aggregation (navigation layer)

**Outputs:** CLAUDE.md files, navigation updates cascaded to root

**Dependencies:** None (memory system generator)

---

## 9. git-error-fixer + fix-git

**Agent:** `git-error-fixer.md`
**Command:** `fix-git.md`

**Purpose:** Fixes git commit-time errors by parsing error logs and launching parallel agents for each affected file.

**How Command Invokes Agent:**
- Command parses git error log to extract file paths and errors
- Groups related files (test + implementation pairs)
- Launches git-error-fixer agents in parallel
- Uses Task tool with `subagent_type: "git-error-fixer"`

**File Pairing Patterns:**
- JavaScript/TypeScript: `*.test.js`, `*.spec.ts` with source files
- Python: `test_*.py` with modules
- Go: `*_test.go` with packages
- Java: `*Test.java` with implementation classes

**Workflow:**
1. Read assigned file(s)
2. Understand errors from provided messages
3. Apply playbook (unused variables, imports, types, etc.)
4. Make minimal edits
5. Run tests if available
6. Report completion

**Outputs:** Fixed files, test results

**Dependencies:** None (standalone fix agent)

---

## 10. pr-chore-reviewer + review-chore-prs

**Agent:** `pr-chore-reviewer.md`
**Command:** `review-chore-prs.md`

**Purpose:** Reviews chore PRs (deps, deps-dev, ci) to determine if major refactoring is needed before merging.

**How Command Invokes Agent:**
- Command discovers chore PRs via `gh pr list`
- Launches pr-chore-reviewer agents ONE AT A TIME (sequential)
- Uses Task tool with `subagent_type: "pr-chore-reviewer"`

**Decision Criteria:**
- Safe to merge: Only dependency/config files changed, tests pass
- Requires refactoring: Application code needs modifications

**Workflow:**
1. Fetch PR information via gh CLI
2. Analyze changed files
3. Identify dependency changes (major/minor/patch)
4. Search codebase for usage
5. Check tests and build
6. Review breaking changes
7. Make decision (merge or flag for refactoring)

**Outputs:** Merged PRs or documentation in `docs/development/chores/`

**Dependencies:** Creates work for chore-refactorer agent

---

## 11. chore-refactorer + apply-chore-refactors

**Agent:** `chore-refactorer.md`
**Command:** `apply-chore-refactors.md`

**Purpose:** Performs refactoring work for chore PRs based on documentation created by review-chore-prs.

**How Command Invokes Agent:**
- Command discovers refactoring docs via Glob
- Launches chore-refactorer agents ONE AT A TIME (sequential)
- Uses Task tool with `subagent_type: "chore-refactorer"`

**Workflow:**
1. Read documentation file
2. Read official documentation (migration guides)
3. Process each file (read, apply changes, verify)
4. Update imports/dependencies
5. Run tests
6. Fix test failures
7. Handle edge cases

**Outputs:** Refactored files, test updates, completion report

**Dependencies:** Depends on pr-chore-reviewer documentation

---

## 12. md-scratchpad-cleanup + cleanup-docs

**Agent:** `md-scratchpad-cleanup.md`
**Command:** `cleanup-docs.md`

**Purpose:** Cleans up loose markdown scratchpad files by removing outdated content while preserving correct and relevant information.

**How Command Invokes Agent:**
- Stage 1: Launches md-scratchpad-cleanup agents in PARALLEL
- Uses Task tool with `subagent_type: "md-scratchpad-cleanup"`

**Workflow:**
1. Read the file
2. Analyze content section by section
3. Verify claims using Grep and Glob
4. Apply decision tree (keep/remove)
5. Edit the file
6. Review changes

**Outputs:** Cleaned markdown files

**Dependencies:** Feeds into documentation-updater for consolidation

---

## 13. code-restructurer + restructure-docs

**Agent:** `code-restructurer.md`
**Command:** `restructure-docs.md`

**Purpose:** Restructures documentation files into proper hierarchy with splitting, QRG blocks, and link updates.

**How Command Invokes Agent:**
- Command validates inputs and analyzes source file
- Launches documentation-updater agent (code-restructurer for code)
- Uses Task tool with `subagent_type: "documentation-updater"`

**Rules Referenced:**
- `@rules/documentation-rules.mdc` (token limits, hierarchy)
- `@development-standards.mdc` (LOC limits)

**Workflow:**
1. Validate inputs (source file, destination path)
2. Analyze source file (token count, structure)
3. Launch documentation-updater agent
4. Verification (structure, links, QRG blocks)

**Outputs:** Restructured documentation in `docs/` hierarchy

**Dependencies:** None (standalone restructuring)

---

## 14. fix-issue + fix-issue (command)

**Agent:** `fix-issue.md`
**Command:** `fix-issue.md`

**Purpose:** Makes surgical modifications to a single issue within the issue planning system while maintaining integrity across all four planning documents.

**How Command Invokes Agent:**
- Command validates issue file path
- Launches fix-issue agent with modification context
- Uses Task tool with `subagent_type: "fix-issue"`

**Rules Referenced:**
- `@foreman/rules/development-standards.mdc`
- `@foreman/rules/system-standards.mdc`

**Templates/Instructions Referenced:**
- `@foreman/instructions/planning/issue-map-template-instructions.md`
- `@foreman/instructions/planning/issue-plan-template-instructions.md`
- `@foreman/instructions/planning/issue-overview-template-instructions.md`
- `@foreman/instructions/planning/user-requirements-template-instructions.md`

**Documents Updated:**
1. `issue-map/issue-XXX.yaml`
2. `issue-plan.md`
3. `issue-overview.md`
4. `user-requirements.md`

**Workflow:**
1. Understand modification context
2. Read template instructions
3. Analyze impact scope
4. Make surgical modifications to all four documents
5. Validate consistency
6. Document changes

**Outputs:** Updated planning documents, change log

**Dependencies:** May trigger GitHub issue comment update

---

## 15. command-agent-duo + create-project-agent-command-duo

**Agent:** `command-agent-duo.md`
**Command:** `create-project-agent-command-duo.md`

**Purpose:** Creates project-specific agent-command pairs by analyzing existing patterns and adapting with project-specific context.

**How Command Invokes Agent:**
- Command scans existing patterns, determines orchestration type
- Presents confirmation to user
- Launches command-agent-duo agent with comprehensive brief
- Uses Task tool with `subagent_type: "command-agent-duo"`

**Orchestration Types:**
- Type A: Simple (1 agent + simple command)
- Type B: Sequential Multi-Agent (2-3 agents + orchestrating command)
- Type C: Parallel Multi-Instance (1 agent + orchestrating command)
- Type D: Complex Orchestration (3+ agents + orchestrating command)

**Instructions Referenced:**
- `@instructions/coordination/agent-command-creation-standards.md`
- `@instructions/coordination/orchestration-patterns.md`
- `@templates/coordination/agent-template.md`
- `@templates/coordination/simple-command-template.md`
- `@templates/coordination/orchestrating-command-template.md`

**Workflow:**
1. Parse assignment (orchestration type, strategy, templates)
2. Extract patterns (if leveraging existing)
3. Create files (agents and command)
4. Verify and report

**Outputs:** New agent and command files in `.claude/agents/` and `.claude/commands/`

**Dependencies:** References existing agents for pattern extraction

---

## Summary Table

| Agent | Command | Invocation Pattern | Parallel/Sequential |
|-------|---------|-------------------|---------------------|
| impact-assessment | impact-change | Multiple parallel (3-7) | Parallel |
| surgical-edits | impact-change | Per-phase | Sequential across phases |
| verify-ui | impact-change, vite-UI-fix | Single | Sequential |
| vite-frontend-fix | vite-UI-fix | Single | Sequential |
| error-explorer | error-explorer | Multiple parallel | Parallel |
| surgical-fixes | error-fix | Single | Sequential |
| dead-code-reviewer | dead-code-review | Multiple parallel | Parallel |
| memory-manager | manage-memory | Single per directory | Sequential |
| git-error-fixer | fix-git | Multiple parallel | Parallel |
| pr-chore-reviewer | review-chore-prs | One at a time | Sequential |
| chore-refactorer | apply-chore-refactors | One at a time | Sequential |
| md-scratchpad-cleanup | cleanup-docs | Multiple parallel | Parallel |
| code-restructurer | restructure-docs | Single | Sequential |
| fix-issue | fix-issue | Single | Sequential |
| command-agent-duo | create-project-agent-command-duo | Single | Sequential |
