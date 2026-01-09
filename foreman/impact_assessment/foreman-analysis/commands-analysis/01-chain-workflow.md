# Chain-Workflow Commands Analysis

## Overview
The chain-* command pattern orchestrates multi-phase release delivery workflows in the Foreman system. These commands sequence specialized agents through distinct phases: concept generation, planning, design, issue creation, and execution. Each command hands off to the next in a controlled pipeline, with user approval gates at critical decision points.

## Commands Identified
1. chain-concept-gen
2. chain-plan-init
3. chain-plan-design-green
4. chain-send-issues
5. chain-issue
6. chain-plan-design-update

## Detailed Analysis

### chain-concept-gen
- **Purpose:** Facilitate iterative Q&A to refine concepts into high-level requirements checklist
- **Location:** `/Users/miles/.my_coding/commands/chain-concept-gen.md`
- **Agents Used:** None (orchestrates user Q&A directly)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - `@foreman/instructions/planning/concept-checklist-template-instructions.md`
  - `@foreman/instructions/planning/concept-qa-documentation-template-instructions.md`
- **Scripts Referenced:**
  - `foreman-templates install`
  - `log-activity release <$1> "message"`
  - `handoff-claude "/chain-plan-init"`
  - `exit-shell`
- **Workflow:** 5-step process: initialize Foreman, understand concept, build checklist, conduct iterative Q&A (5 phases: vision, discovery, refinement, categorization, deployment context), achieve 95% confidence, handoff to planning

### chain-plan-init
- **Purpose:** Create release specification from concept checklist using template-driven approach
- **Location:** `/Users/miles/.my_coding/commands/chain-plan-init.md`
- **Agents Used:** None (template-driven autonomous work)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - `@foreman/instructions/planning/release-specification-template-instructions.md`
- **Scripts Referenced:**
  - `log-activity release <$1> "message"`
  - `handoff-claude "/chain-plan-design-green"`
  - `exit-shell`
- **Workflow:** 4-step process: read template instructions, read concept checklist, create release specification following template exactly, resolve outstanding questions autonomously, handoff to design phase

### chain-plan-design-green
- **Purpose:** Orchestrate complete design phase with 10 sequential steps including research, UX/UI/architecture design, coordination, issues
- **Location:** `/Users/miles/.my_coding/commands/chain-plan-design-green.md`
- **Agents Used:**
  - chain-prototype-researcher (modes: research, finalize)
  - chain-ux-researcher
  - chain-ui-design
  - chain-system-architect
  - chain-whimsy-injector
  - chain-issue-builder
- **Rules Referenced:**
  - `@foreman/instructions/coordination/agent-scope-impact-matrix.md`
  - `@foreman/instructions/coordination/cross-agent-coordination-request-template-instructions.md`
- **Instructions Referenced:**
  - `@foreman/templates/coordination/cross-agent-coordination-request-template.md`
  - User requirements review instructions
- **Scripts Referenced:**
  - `log-activity release $1 "message"`
  - `handoff-claude "/chain-send-issues"`
  - `exit-shell`
- **Workflow:**
  - Step 1-1b: Template research with deployment decision matrix review (user pause point)
  - Step 2: UX research (flows, personas, wireframes)
  - Step 3: UI design (components, design system)
  - Step 4: System architecture (API, database, infrastructure)
  - Step 5: Cross-agent coordination with optional user feedback
  - Step 6: Whimsy injection for delightful interactions
  - Step 7: Issue builder for sprint preparation
  - Step 8: User requirements review (user pause point)
  - Step 9-10: Handoff to issue generation with user approval gate

### chain-send-issues
- **Purpose:** Submit generated issues to GitHub with user requirements integration
- **Location:** `/Users/miles/.my_coding/commands/chain-send-issues.md`
- **Agents Used:** None (direct GitHub operations)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** GitHub issue workflow instructions
- **Scripts Referenced:**
  - `log-activity release $1 "message"`
  - `handoff-claude "/chain-issue"`
- **Workflow:** 3-step process: integrate user requirements into relevant issues, analyze and submit each issue to GitHub with prior art references, update issue-plan.md with GH issue numbers, handoff to first issue execution

### chain-issue
- **Purpose:** Execute individual GitHub issue through complete TDD/BDD development lifecycle
- **Location:** `/Users/miles/.my_coding/commands/chain-issue.md`
- **Agents Used:**
  - chain-issue-updater (planning and context)
  - test-manager (preflight testing)
  - backend-architect / frontend-developer / ai-engineer (parent agents with workers)
  - backend-worker / frontend-worker / ai-technician (worker agents)
  - framework-manager (conditional framework setup)
  - pipeline-manager (conditional pipeline setup)
  - troubleshooting-investigator (blocking issue resolution)
  - reviewerpr (PR review)
  - documentation-updater (post-merge docs)
  - memory-manager (post-merge memory)
- **Rules Referenced:**
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/diagram-standard.mdc`
- **Instructions Referenced:**
  - `@foreman/templates/github/labels.yaml`
  - `@foreman/instructions/github/gh-issue-workflow.md`
  - User testing validation template
- **Scripts Referenced:**
  - GH MCP/CLI operations (status, tags, branches, comments, labels)
  - User requirements integration
  - Type error resolution verification
- **Workflow:**
  - Step 1-2: Issue analysis, branch creation, label management
  - Step 3: Sequential agent planning and execution with parallel worker orchestration
  - Step 3.1-3.7: Chain-issue-updater → Test-Manager → Workers → Parent Agent → Type Checks → Next Agent
  - Step 4: Post-agent PR submission and label updates
  - Step 5: ReviewerPR agent review
  - Step 6: User testing validation with custom test template
  - Step 7: Merge with quality gates
  - Step 8: Documentation and memory updates
  - Step 9: Activity logging and completion

### chain-plan-design-update
- **Purpose:** Orchestrate minimal, seamless updates to existing release plans when direction changes
- **Location:** `/Users/miles/.my_coding/commands/chain-plan-design-update.md`
- **Agents Used:**
  - chain-update-researcher (conditional research)
  - chain-ux-updater
  - chain-ui-updater
  - chain-architecture-updater
  - chain-issue-plan-updater (parallel execution for each issue)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - `@foreman/instructions/coordination/orchestration-patterns.md`
  - `@foreman/instructions/coordination/impact-change-orchestration.md`
  - `@foreman/instructions/coordination/agent-scope-impact-matrix.md`
- **Scripts Referenced:**
  - `mkdir -p foreman/release-$1/docs/00-planning/update-$2`
- **Workflow:**
  - Step 0: Create update directory
  - Step 1: Analyze change impact against existing docs
  - Step 1a: Conditional research phase with user approval
  - Step 2-4: Sequential UX, UI, architecture updates (in-place, no new files)
  - Step 5: Issue plan analysis determining insertion points and modification rules
  - Step 6: User requirements creation (if needed)
  - Step 7: Parallel issue update agents
  - Step 8: Validation for open questions and change references
  - Step 9: User requirements review (if created)
  - Step 10: Completion report

## Pattern Summary

**Sequential Handoff Pattern**: Chain commands flow sequentially through release phases with explicit handoff instructions using `handoff-claude` script.

**Template-Driven Design**: All documentation uses template+instructions pairs from `@foreman/` structure with exact path references.

**Quality Gates**: User approval pauses at critical decision points (deployment, research approval, requirements review, user testing validation).

**Agent Orchestration**: Complex commands (design-green, issue) launch specialized agents sequentially with explicit completion verification before next agent.

**Activity Logging**: All commands use `log-activity release <$1> "message"` for continuous progress tracking.

**Issue Sequencing**: Issue creation respects completed work state with letter-suffix insertions (e.g., 4a, 4b for insertions near completed issue 4).

**Worker Orchestration**: Parent agents (backend-architect, frontend-developer, ai-engineer) can parallelize work via worker agents following bottom-up implementation order.

**Type Error Resolution**: Mandatory checks after any agent execution in statically-typed languages before proceeding.

**User Requirements Integration**: Embedded at multiple levels - in deployment decisions, issue creation, issue execution, and update workflows.
