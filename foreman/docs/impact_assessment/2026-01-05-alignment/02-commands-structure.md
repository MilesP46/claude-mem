# Foreman Commands Structure Analysis

## Overview

**Count**: 25 commands total (all `.md` format)
**Format**: YAML frontmatter + Markdown body
**Organization**: Flat directory structure at `/Users/miles/.my_coding/commands/`

## Naming Patterns

- **Verb-based**: `fix-git`, `fix-issue`, `error-explorer`, `cleanup-docs`
- **Chain-prefixed (Orchestration)**: 6 commands
  - `chain-plan-design-update` - Plan revision orchestration
  - `chain-plan-design-green` - New release planning
  - `chain-plan-init` - Specification creation
  - `chain-issue` - Issue execution workflow
  - `chain-send-issues` - GitHub issue submission
  - `chain-concept-gen` - Concept definition
- **Impact/Workflow-based**: `impact-change`, `impact-change-review`, `plan-change`

## Command File Structure

**Standard Frontmatter:**
```yaml
allowed-tools: [Task, Bash, Read, Write, Edit, Glob, Grep]
argument-hint: <param description>
description: Single-line command purpose
model: [opus|sonnet]
```

**Body Sections:**
1. Title & Overview
2. Arguments Reference ($1, $2, etc.)
3. Reference Instructions (@instructions/ files)
4. Guardrails/Constraints (DO/DON'T bullets)
5. Workflow (numbered steps)
6. Quality Gates

## Agent Invocation Patterns

1. **Direct Agent Launch**: `launch [agent-name] with: [parameters]`
2. **Parallel Agent Execution**: Multiple Task calls in single message
3. **Sequential Agent Chaining**: Later agents depend on earlier outputs

## Issue/Project Awareness

- **Release-scoped**: Parameters like `<release_number>`
- **Issue files**: `foreman/release-X/docs/00-planning/issue-map/issue-XXX.yaml`
- **Multi-document consistency**: 4 interrelated planning documents
- **GitHub integration**: Sync local YAML plans with GitHub issues
- **Path templates**: `@foreman/` prefix for file references
