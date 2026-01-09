# Duo-Workflow Commands Analysis

## Overview
Command-agent duo patterns in Foreman create a clear separation between orchestration (command) and execution (agent). The command handles workflow control, user interaction, and state management, while the agent focuses on autonomous task execution with specialized tools and context.

## Duos Identified
1. error-explorer (cmd) ↔ error-explorer (agent)
2. fix-issue (cmd) ↔ fix-issue (agent)
3. dead-code-review (cmd) ↔ dead-code-reviewer (agent)
4. impact-change (cmd) ↔ impact-assessment (agent)
5. manage-memory (cmd) ↔ memory-manager (agent)
6. apply-chore-refactors (cmd) ↔ chore-refactorer (agent)
7. vite-UI-fix (cmd) ↔ vite-frontend-fix (agent)
8. error-fix (cmd) ↔ surgical-fixes (agent)
9. review-chore-prs (cmd) ↔ pr-chore-reviewer (agent)
10. fix-git (cmd) ↔ git-error-fixer (agent)

## Detailed Analysis

### error-explorer / error-explorer
- **Command:** `/Users/miles/.my_coding/commands/error-explorer.md`
- **Agent:** `/Users/miles/.my_coding/agents/error-explorer.md`
- **Purpose:** Launch parallel deep-dive error analysis to identify root causes with 100% confidence
- **Command Role:** Orchestrate parallel agent launches for comprehensive error investigation
- **Agent Role:** Deep code analysis tracing entire logic flows to identify root causes
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** error-explorer-instructions.md
- **Scripts Referenced:** None
- **Workflow:** Command launches multiple error-explorer agents in parallel, each analyzing different aspects; agents trace logic flows without testing implementations

### fix-issue / fix-issue
- **Command:** `/Users/miles/.my_coding/commands/fix-issue.md`
- **Agent:** `/Users/miles/.my_coding/agents/fix-issue.md`
- **Purpose:** Make surgical modifications to single issues within issue planning system
- **Command Role:** Entry point and parameter validation
- **Agent Role:** Modify issue YAML, update planning documents (issue-plan.md, issue-map/, issue-overview.md, user-requirements.md)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** fix-issue-agent-instructions.md
- **Scripts Referenced:** None
- **Workflow:** Command validates inputs, agent makes surgical edits maintaining integrity across four planning documents

### dead-code-review / dead-code-reviewer
- **Command:** `/Users/miles/.my_coding/commands/dead-code-review.md`
- **Agent:** `/Users/miles/.my_coding/agents/dead-code-reviewer.md`
- **Purpose:** Orchestrate comprehensive dead code analysis with 100% certainty
- **Command Role:** Launch multiple parallel agents for thorough dead code identification
- **Agent Role:** Analyze codebase tracing logic and usage to identify removable code
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** dead-code-review-orchestration.md
- **Scripts Referenced:** None
- **Workflow:** Command launches parallel agents across codebase sections, agents only mark code as dead when absolutely certain

### impact-change / impact-assessment
- **Command:** `/Users/miles/.my_coding/commands/impact-change.md`
- **Agent:** `/Users/miles/.my_coding/agents/impact-assessment.md`
- **Purpose:** Orchestrate 6-phase workflow for implementing code changes through comprehensive assessment
- **Command Role:** Phase orchestration, user approval gates, agent coordination
- **Agent Role:** Analyze specific focus areas documenting complete logic chains and impacts
- **Rules Referenced:** development-standards.mdc, system-standards.mdc
- **Instructions Referenced:**
  - impact-change-orchestration.md
  - impact-assessment-qrg-format.md
  - gap-analysis-checklist.md
- **Scripts Referenced:** None
- **Workflow:** Command manages 6 phases (assessment, gap analysis, dead code, approval, surgical implementation, UI verification); launches 3-7 parallel impact-assessment agents per complexity

### manage-memory / memory-manager
- **Command:** `/Users/miles/.my_coding/commands/manage-memory.md`
- **Agent:** `/Users/miles/.my_coding/agents/memory-manager.md`
- **Purpose:** Generate, update, or maintain CLAUDE.md memory files across projects
- **Command Role:** Entry point for memory system management
- **Agent Role:** Analyze codebase, generate adjacency-oriented CLAUDE.md files, maintain memory hierarchy
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** memory-manager-instructions.md
- **Scripts Referenced:** None
- **Workflow:** Command triggers agent to scan codebase, agent generates/updates hierarchical CLAUDE.md system

### apply-chore-refactors / chore-refactorer
- **Command:** `/Users/miles/.my_coding/commands/apply-chore-refactors.md`
- **Agent:** `/Users/miles/.my_coding/agents/chore-refactorer.md`
- **Purpose:** Apply refactoring from documentation files sequentially
- **Command Role:** Discover chore documentation files, launch agents sequentially
- **Agent Role:** Execute refactoring changes from specific chore documentation file
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** chore-refactoring-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Command finds docs/development/chores/ files, launches chore-refactorer agent for each file sequentially

### vite-UI-fix / vite-frontend-fix
- **Command:** `/Users/miles/.my_coding/commands/vite-UI-fix.md`
- **Agent:** `/Users/miles/.my_coding/agents/vite-frontend-fix.md`
- **Purpose:** Fix Vite frontend UI/UX issues through iterative verification and repair
- **Command Role:** Entry point for UI bug fixing workflow
- **Agent Role:** Recreate issues using Playwright, test end-to-end in dev environment, apply fixes iteratively
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** vite-ui-fix-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Command launches agent with issue details, agent iterates until issue resolved and tests pass

### error-fix / surgical-fixes
- **Command:** `/Users/miles/.my_coding/commands/error-fix.md`
- **Agent:** `/Users/miles/.my_coding/agents/surgical-fixes.md`
- **Purpose:** Fix identified errors through surgical code changes with verification
- **Command Role:** Launch agent, verify fixes through appropriate testing, iterate until resolved
- **Agent Role:** Execute targeted fixes for identified errors while preserving functionality
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** error-fix-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Command launches surgical-fixes agent, verifies through testing, relaunches if needed until error resolved

### review-chore-prs / pr-chore-reviewer
- **Command:** `/Users/miles/.my_coding/commands/review-chore-prs.md`
- **Agent:** `/Users/miles/.my_coding/agents/pr-chore-reviewer.md`
- **Purpose:** Review chore PRs (deps, deps-dev, ci) to determine merge or refactoring needs
- **Command Role:** Find chore PRs, launch agents sequentially for each PR
- **Agent Role:** Review PR determining if ready to merge or needs refactoring documentation
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** pr-chore-review-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Command finds chore PRs, launches pr-chore-reviewer agent for each sequentially; agent either merges or creates refactoring docs

### fix-git / git-error-fixer
- **Command:** `/Users/miles/.my_coding/commands/fix-git.md`
- **Agent:** `/Users/miles/.my_coding/agents/git-error-fixer.md`
- **Purpose:** Fix git commit-time errors by launching parallel agents for affected files
- **Command Role:** Parse git error output, identify affected files, launch parallel agents
- **Agent Role:** Fix git errors in single file or related file pair
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** git-error-fixing-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Command parses git pre-commit/linter errors, launches git-error-fixer agent for each affected file in parallel

## Pattern Summary

**Orchestration-Execution Separation**: Commands handle workflow control, user gates, and multi-agent coordination; agents focus on autonomous execution.

**Parallel Launch Pattern**: Many commands launch multiple agent instances in parallel for comprehensive coverage (error-explorer, dead-code-review, fix-git).

**Sequential Launch Pattern**: Some commands launch agents sequentially to maintain order (review-chore-prs, apply-chore-refactors).

**Iterative Verification**: Several duos iterate until success (error-fix, vite-UI-fix) with verification loops.

**Documentation Coupling**: Some duos communicate through documentation files (review-chore-prs creates files, apply-chore-refactors consumes them).

**Specialized Tool Access**: Agents have access to specialized tools (Playwright for vite-frontend-fix, git operations for git-error-fixer).

**Surgical Precision**: Agents maintain existing functionality while making targeted changes (surgical-fixes, fix-issue).

**100% Certainty Requirement**: Analysis agents (error-explorer, dead-code-reviewer) only report findings with absolute confidence.
