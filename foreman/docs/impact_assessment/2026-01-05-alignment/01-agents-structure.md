# Foreman Agents Structure Analysis

## Overview

**Total Agents:** 44 markdown files in `/Users/miles/.my_coding/agents/`
**File Format:** Markdown (.md) with YAML frontmatter headers
**Organization:** Flat directory structure with semantic naming conventions

## Naming Patterns

1. **Role-Based**: `ai-engineer.md`, `frontend-developer.md`, `backend-architect.md`
2. **Chain/Orchestration**: `chain-system-architect.md`, `chain-issue-updater.md`, `chain-ux-researcher.md`
3. **Surgical/Targeted**: `surgical-fixes.md`, `surgical-edits.md`, `code-restructurer.md`
4. **Analysis**: `error-explorer.md`, `impact-assessment.md`, `dead-code-reviewer.md`
5. **Worker/Service**: `backend-worker.md`, `frontend-worker.md`, `ai-technician.md`
6. **Meta/Framework**: `memory-manager.md`, `command-agent-duo.md`, `fix-issue.md`

## Agent File Structure

**Common Frontmatter Fields:**
- `name` - Agent identifier (kebab-case)
- `description` - Purpose and usage examples
- `allowed-tools` - Tools available (Read, Edit, Write, Bash, Glob, Grep, etc.)
- `model` - Claude model designation (opus, sonnet, haiku)

**Common Content Sections:**
1. Core Responsibilities
2. Activity Logging (log-activity bash commands)
3. Workflow Protocol / Execution Process
4. Phase-based workflows (Review → Plan → Implement → Verify)
5. Output Format / Deliverables
6. References to external standards/rules (@foreman/rules/, @instructions/)

## Command Pairing Evidence

**Dual Agent-Command System Confirmed:**
- 26 complementary commands in `/Users/miles/.my_coding/commands/`
- `/error-explorer` agent paired with `/error-fix` command
- `/dead-code-reviewer` agent paired with `/dead-code-review` command
- `chain-*` agents paired with corresponding orchestrating commands
- `/impact-change` command orchestrates multiple agents in parallel

## Scope/Path Restrictions

**Allowed-Tools Restrictions:**
- Read-Only Agents (error-explorer): `Read, Glob, Bash(ls:*), Bash(cat:*)`
- Full-Access Agents (ai-engineer): `Read, Edit, Write, Bash, Glob, Grep`

**Path/Scope Restrictions:**
- Agents respect `@foreman/` path references
- Release-scoped agents reference `@foreman/release-{{X}}/` templates
- Activity logging tied to release context: `log-activity release <release-id> agent <name> "message"`
