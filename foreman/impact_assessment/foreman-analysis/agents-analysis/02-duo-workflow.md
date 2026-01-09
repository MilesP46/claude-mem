# Duo-Workflow Agents Analysis

## Overview
Duo-workflow agents are the execution counterparts to orchestration commands. While commands handle workflow control, user interaction, and multi-agent coordination, duo agents focus purely on autonomous task execution with specialized tools and deep domain expertise.

## Duos Identified
1. error-explorer
2. fix-issue
3. dead-code-reviewer
4. impact-assessment
5. memory-manager
6. chore-refactorer
7. vite-frontend-fix
8. surgical-fixes
9. pr-chore-reviewer
10. git-error-fixer

## Detailed Analysis

### error-explorer
- **Purpose:** Deep code analysis tracing entire logic flows to identify root causes with 100% confidence
- **Location:** `/Users/miles/.my_coding/agents/error-explorer.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/error-explorer.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Deep logic tracing methodology
- **Scripts Referenced:** None
- **Tools Used:** Read, Glob, Bash (read-only tools)
- **Workflow:** Trace logic flows without testing implementations → Identify root causes → Document evidence with 100% confidence

### fix-issue
- **Purpose:** Make surgical modifications to single issues within issue planning system while maintaining integrity
- **Location:** `/Users/miles/.my_coding/agents/fix-issue.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/fix-issue.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Issue planning system structure, YAML schema
- **Scripts Referenced:** None
- **Tools Used:** Read, Edit, Write, Grep, Glob, Bash
- **Workflow:** Modify issue YAML → Update four planning documents (issue-plan.md, issue-map/, issue-overview.md, user-requirements.md) → Maintain consistency

### dead-code-reviewer
- **Purpose:** Analyze codebase to identify removable code with 100% certainty through logic tracing
- **Location:** `/Users/miles/.my_coding/agents/dead-code-reviewer.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/dead-code-review.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Dead code identification methodology
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access for comprehensive analysis)
- **Workflow:** Trace logic and usage → Only mark code as dead when absolutely certain → Provide removal recommendations

### impact-assessment
- **Purpose:** Analyze specific focus areas documenting complete logic chains and impacts for code changes
- **Location:** `/Users/miles/.my_coding/agents/impact-assessment.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/impact-change.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Impact assessment methodology, QRG format
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Document complete logic chains → Identify impacts → Create sequencing analysis → Output structured report (target ≤150 LOC)

### memory-manager
- **Purpose:** Generate, update, or maintain CLAUDE.md memory files across projects using adjacency-oriented approach
- **Location:** `/Users/miles/.my_coding/agents/memory-manager.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/manage-memory.md`
- **Rules Referenced:** @foreman/rules/memory-system-standards.mdc
- **Instructions Referenced:** Memory hierarchy structure, adjacency principles
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Analyze codebase → Generate hierarchical CLAUDE.md system → Maintain memory hierarchy → Enforce size limits

### chore-refactorer
- **Purpose:** Execute refactoring changes from specific chore documentation files sequentially
- **Location:** `/Users/miles/.my_coding/agents/chore-refactorer.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/apply-chore-refactors.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Dependency migration patterns
- **Scripts Referenced:** None
- **Tools Used:** Read, Edit, Bash, Grep, Glob
- **Workflow:** Read chore documentation → Apply dependency migration changes → Update imports → Run tests → Handle edge cases

### vite-frontend-fix
- **Purpose:** Fix Vite frontend UI/UX issues through iterative verification and repair using Playwright
- **Location:** `/Users/miles/.my_coding/agents/vite-frontend-fix.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/vite-UI-fix.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc
- **Instructions Referenced:** UI testing methodology, iterative repair patterns
- **Scripts Referenced:** None
- **Tools Used:** Full Playwright MCP suite, Read, Write, Edit, Bash, Glob, Grep, GitHub tools
- **Workflow:** Recreate issues using Playwright → Test end-to-end in dev environment → Apply fixes iteratively → Validate backend logic → Ensure tests pass

### surgical-fixes
- **Purpose:** Execute targeted fixes for identified errors while preserving all existing and intended functionality
- **Location:** `/Users/miles/.my_coding/agents/surgical-fixes.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/error-fix.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Surgical fix methodology, test update patterns
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Execute targeted fixes → Update tests appropriately → Preserve functionality → Iterate until error resolved

### pr-chore-reviewer
- **Purpose:** Review chore PRs to determine if ready to merge or needs refactoring documentation
- **Location:** `/Users/miles/.my_coding/agents/pr-chore-reviewer.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/review-chore-prs.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** PR review criteria, refactoring detection patterns
- **Scripts Referenced:** None
- **Tools Used:** Read, Bash, Grep, Glob
- **Workflow:** Review PR determining merge readiness → Create refactoring documentation if major work needed → Sequential execution for dependency/CI PRs

### git-error-fixer
- **Purpose:** Fix git commit-time errors in single file or related file pair
- **Location:** `/Users/miles/.my_coding/agents/git-error-fixer.md`
- **Command Partner:** `/Users/miles/.my_coding/commands/fix-git.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Git error playbooks, linter fix patterns
- **Scripts Referenced:** None
- **Tools Used:** Read, Edit, Bash, Grep, Glob
- **Workflow:** Fix git pre-commit hook errors → Fix linter errors → Fix type checker errors → Minimal edits only → Run tests

## Pattern Summary

**100% Confidence Standard**: Analysis agents (error-explorer, dead-code-reviewer) only report findings with absolute certainty.

**Surgical Precision**: All agents maintain existing functionality while making targeted changes (no regressions allowed).

**Tool Specialization**: Each agent has tools matched to its needs (Playwright for UI testing, read-only for analysis, full access for implementation).

**Test Updates**: Implementation agents update tests appropriately to match code changes (surgical-fixes, vite-frontend-fix, chore-refactorer).

**Iterative Verification**: Several agents iterate until success (vite-frontend-fix, surgical-fixes with error-fix command coordination).

**Documentation Coupling**: Some agents communicate through documentation files (pr-chore-reviewer creates files, chore-refactorer consumes them).

**Autonomous Decision-Making**: All agents make confident decisions based on codebase analysis without asking questions.

**Standards Compliance**: Agents reference development and system standards to ensure consistency (@foreman/rules/development-standards.mdc).

**Parallel Execution Support**: Some agents designed for parallel launches (error-explorer, dead-code-reviewer, git-error-fixer).

**Quality Gates**: All implementation agents verify changes through testing before completion (zero silent failures).
