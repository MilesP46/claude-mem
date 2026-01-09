# Standalone Commands Analysis

## Overview
Standalone commands in Foreman operate independently without being part of formal chain or duo structures. These commands provide discrete functionality for specific tasks, often launching agents or performing direct operations. Some have sequential relationships with other commands but maintain independent operation.

## Commands Identified
1. cleanup-docs
2. create-project-agent-command-duo
3. format-claude-file
4. impact-change-review
5. new-issue
6. plan-change
7. restructure-docs
8. update-plans

## Detailed Analysis

### cleanup-docs
- **Purpose:** Clean up loose scratchpad .md files, consolidate into proper docs/, remove originals
- **Location:** `/Users/miles/.my_coding/commands/cleanup-docs.md`
- **Agents Used:** md-scratchpad-cleanup
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** scratchpad-cleanup-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Launch md-scratchpad-cleanup agent to identify loose .md files, remove outdated content while preserving correct information, consolidate into formal documentation structure

### create-project-agent-command-duo
- **Purpose:** Intelligently create project-level agent-command pairs by analyzing existing patterns
- **Location:** `/Users/miles/.my_coding/commands/create-project-agent-command-duo.md`
- **Agents Used:** command-agent-duo
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - duo-creation-strategy.md
  - duo-pattern-extraction.md
- **Scripts Referenced:** None
- **Workflow:** Launch command-agent-duo agent with strategy, agent extracts patterns from existing duos, adapts with project-specific arguments

### format-claude-file
- **Purpose:** Optimize agent or command files by removing excessive length while retaining context
- **Location:** `/Users/miles/.my_coding/commands/format-claude-file.md`
- **Agents Used:** None (direct file operations)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** claude-file-optimization.md
- **Scripts Referenced:** None
- **Workflow:** Analyze file length, remove redundant content, apply formatting best practices, preserve all functional context

### impact-change-review
- **Purpose:** Reassess completed changes when new issues arise through parallel error analysis
- **Location:** `/Users/miles/.my_coding/commands/impact-change-review.md`
- **Agents Used:**
  - error-explorer (parallel agents)
  - impact-assessment (fresh assessment)
  - dead-code-reviewer
- **Rules Referenced:** development-standards.mdc, system-standards.mdc
- **Instructions Referenced:**
  - impact-change-orchestration.md
  - gap-analysis-checklist.md
- **Scripts Referenced:** None
- **Workflow:**
  - Phase 1: Launch parallel error-explorer agents for root cause analysis
  - Phase 2: Synthesize findings, rewrite prior assessment _index
  - Phase 3: Gap analysis, dead code review
  - Phase 4: User approval
  - Phase 5: Agentic execution (no attempt folders)

### new-issue
- **Purpose:** Add new issues to existing release using chain-issue-creator
- **Location:** `/Users/miles/.my_coding/commands/new-issue.md`
- **Agents Used:** chain-issue-creator
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** issue-creation-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Launch chain-issue-creator agent to analyze existing issue structure, add new issues with proper sequencing and agent mapping, create GitHub issues

### plan-change
- **Purpose:** Orchestrate comprehensive granular change planning through impact analysis
- **Location:** `/Users/miles/.my_coding/commands/plan-change.md`
- **Agents Used:** change-plan-builder
- **Rules Referenced:** development-standards.mdc, system-standards.mdc
- **Instructions Referenced:**
  - change-planning-workflow.md
  - impact-assessment-integration.md
- **Scripts Referenced:** None
- **Workflow:** Analyze impact assessments, verify against project structure, produce actionable surgical implementation guides, launch change-plan-builder agent

### restructure-docs
- **Purpose:** Restructure documentation file into proper hierarchy with splitting and link updates
- **Location:** `/Users/miles/.my_coding/commands/restructure-docs.md`
- **Agents Used:** documentation-updater (with restructure mode)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - documentation-hierarchy-standards.md
  - documentation-splitting-workflow.md
- **Scripts Referenced:** None
- **Workflow:** Launch documentation-updater agent in restructure mode to check token counts, split into hierarchy if needed, update cross-references

### update-plans
- **Purpose:** Update existing planning documentation for release using chain-system-architect
- **Location:** `/Users/miles/.my_coding/commands/update-plans.md`
- **Agents Used:** chain-system-architect
- **Rules Referenced:** None explicitly
- **Instructions Referenced:**
  - plan-update-workflow.md
  - architecture-reconciliation.md
- **Scripts Referenced:** None
- **Workflow:** Launch chain-system-architect agent to update technical architecture documentation based on changes, maintain consistency across API design, database schemas, infrastructure plans

## Pattern Summary

**Single-Purpose Focus**: Each standalone command addresses a specific discrete task without requiring coordination with other commands.

**Agent Delegation**: Most standalone commands delegate work to specialized agents rather than performing direct operations.

**Documentation Operations**: Several commands focus on documentation management (cleanup-docs, restructure-docs, format-claude-file).

**Planning Support**: Multiple commands support planning workflows (plan-change, update-plans, new-issue) but operate independently.

**Error Recovery**: impact-change-review provides recovery mechanism for completed changes that encounter issues.

**Meta-Operations**: Some commands operate on the Foreman system itself (create-project-agent-command-duo, format-claude-file).

**Architecture Updates**: update-plans and plan-change focus on maintaining architectural consistency.

**Independent Invocation**: All can be invoked directly by users without requiring prior command execution.

**Sequential Relationships**: Some have natural sequential relationships with other commands (cleanup-docs → manage-memory, plan-change follows impact-change) but maintain operational independence.
