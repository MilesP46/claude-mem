# Foreman ↔ claude-mem Integration v2: Leveraging Existing Architecture

> **Foreman root**: `/Users/miles/.my_coding` — the source-of-truth for agents, commands, instructions, templates, and rules.

## Executive Summary

This document describes how to integrate claude-mem's observation/memory system with foreman's existing agent-command orchestration architecture. Unlike v1 which proposed new CLI tools and filesystem structures, this revision leverages foreman's established patterns:

- **Agents** (44) + **Commands** (25) as the execution layer
- **Instructions** + **Templates** as the crystallization layer
- **Rules** (`.mdc`) as the enforcement layer
- **Chain-* workflows** as the orchestration layer

---

## Design Principles (Revised)

### 1. Work WITH existing architecture, not around it
- No new CLI tools — use existing agent/command patterns
- No parallel filesystem — integrate with release-scoped docs
- No state files — leverage `.foreman-project` and release folders

### 2. Capture once, crystallize into existing formats
- Observations → candidate **instructions** or **rules**
- Pattern detection → **command-agent-duo** creation via existing agent
- Policy extraction → `.mdc` rule files with `globs` and `alwaysApply`

### 3. Progressive disclosure via existing mechanisms
- **chain-context-template.md** is the "agent Bible" — single authoritative source
- Brief indexes injected; heavy details fetched via `mem-search`
- Size budgets enforced at command level, not new tooling

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FOREMAN SYSTEM                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Agents     │  │  Commands    │  │ Instructions │          │
│  │   (44)       │←→│   (25)       │←→│   (44)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                ↓                  ↓                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Templates   │  │    Rules     │  │   Scripts    │          │
│  │              │  │   (.mdc)     │  │ send-agents  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE-MEM SYSTEM                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Observations │→ │   Worker     │→ │   SQLite     │          │
│  │ (PostToolUse)│  │  (37777)     │  │   + Chroma   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                                    ↓                  │
│  ┌──────────────┐                   ┌──────────────┐           │
│  │ SessionStart │                   │  mem-search  │           │
│  │ Context Inj. │                   │    Skill     │           │
│  └──────────────┘                   └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Observation Tagging (claude-mem fork)

**Goal**: Tag observations with foreman context for later querying.

**Implementation** (in `save-hook.ts`):

```typescript
// Detect foreman context from cwd
function getForemanContext(cwd: string): ForemanContext | null {
  // Check for .foreman-project in cwd or ancestors
  const foremanProject = findUpSync('.foreman-project', { cwd });
  if (!foremanProject) return null;

  // Check if inside a release folder
  const releaseMatch = cwd.match(/foreman\/release-(\d+)\//);
  const releaseId = releaseMatch ? releaseMatch[1] : null;

  // Check if inside issue-map
  const issueMatch = cwd.match(/issue-map\/issue-(\d+)/);
  const issueId = issueMatch ? issueMatch[1] : null;

  return { releaseId, issueId, projectId: foremanProject.id };
}
```

**Observation payload extension**:
```json
{
  "contentSessionId": "...",
  "tool_name": "Edit",
  "tool_input": {...},
  "cwd": "/path/to/project",
  "foreman_context": {
    "release_id": "3",
    "issue_id": "007",
    "project_id": "02d231dbc9d3b5ffc51d74c785f3a543"
  }
}
```

---

### 2. Context Injection (SessionStart hook)

**Goal**: Inject release/issue brief at session start using existing chain-context pattern.

**Current**: SessionStart injects recent observations as compact index.

**Enhanced**: When foreman context detected, additionally inject:
1. Release brief (from `release-X/docs/00-planning/`)
2. Active issue context (if in issue-map path)
3. Relevant past observations filtered by release/issue

**Size budget**: ≤ 4000 tokens total foreman context (following chain-context-template limits).

---

### 3. Policy Extraction (Worker enhancement)

**Goal**: Identify command preferences and policies from observations.

**Current observation types**: `discovery`, `decision`, `feature`, `bugfix`, `refactor`, `change`

**New observation type**: `policy`

**Extraction triggers** (in summary generation):
- User corrections: "don't run X, use Y instead"
- Repeated command patterns
- Environment-specific behavior
- Error recovery patterns

**Policy observation schema**:
```json
{
  "type": "policy",
  "category": "command-preference",
  "content": "For database reset, use `npm run db:reset` not `prisma migrate reset`",
  "scope": {
    "paths": ["packages/db"],
    "labels": ["backend", "db"],
    "mode": "dev"
  },
  "confidence": "validated",
  "frequency": 3
}
```

---

### 4. Crystallization Pipeline

**Goal**: Convert high-confidence policies into foreman artifacts.

**NOT**: New `crystallized/*.md` files
**YES**: Existing foreman formats

#### A. Candidate Instructions

When policy frequency ≥ 3 and confidence = "validated":

1. Generate candidate instruction file
2. Place in `.my_coding/instructions/<category>/`
3. Reference from relevant agents via `@instructions/`

Example output:
```markdown
# Database Reset Instructions

## When to use
When resetting local development database during backend work.

## Canonical command
```bash
npm run db:reset
```

## Do NOT use
- `prisma migrate reset` (skips seed data)
- `prisma db push --force-reset` (destroys migrations)

## Context
Validated from 3 observations across releases 2, 3.
```

#### B. Rule Generation

When policy is environment/glob-scoped:

1. Generate candidate `.mdc` rule
2. Place in `.my_coding/rules/`
3. Set appropriate `globs` and `alwaysApply`

Example output:
```yaml
---
description: Database commands for backend packages
globs:
  - "packages/db/**"
alwaysApply: false
---
1. Database reset: Use `npm run db:reset`, never raw Prisma commands
2. Migration creation: Use `npm run db:migrate:create` with descriptive name
```

#### C. Duo Creation

When policy represents reusable agent+command pattern:

1. Use existing `command-agent-duo` agent
2. Follow `agent-command-creation-standards.md` instruction
3. Use `simple-command-template.md` or `agent-template.md`

---

### 5. Query Enhancement (mem-search)

**Goal**: Enable foreman-aware memory queries.

**Current**: `mem-search` queries by keywords, dates, types.

**Enhanced filters**:
```
/mem-search release:3 issue:007 type:policy
/mem-search release:3 paths:packages/db
/mem-search project:02d231db type:decision
```

**Implementation**: Add `foreman_context` to search index, expose via search API.

---

## Workflow Integration

### Starting Work on an Issue

**Current chain-issue workflow**:
1. Read issue YAML from `issue-map/issue-XXX.yaml`
2. Load chain-context with decision matrix
3. Execute with appropriate agent

**Enhanced with claude-mem**:
1. Read issue YAML (unchanged)
2. Query claude-mem: `GET /api/search?release=X&issue=XXX&limit=10`
3. Inject relevant observations into chain-context
4. Execute with appropriate agent (unchanged)

### Closing an Issue

**Current**: Update issue YAML status, optionally update GitHub.

**Enhanced**:
1. Update issue YAML (unchanged)
2. Extract candidate policies from session observations
3. If high-confidence policies found, prompt for promotion:
   - Generate instruction draft
   - Generate rule draft
   - Generate duo candidate (if applicable)
4. User approves/rejects promotions

---

## Implementation Checklist

### claude-mem Fork

- [ ] Add foreman context detection in `save-hook.ts`
- [ ] Extend observation schema with `foreman_context` field
- [ ] Add `policy` observation type to extraction prompts
- [ ] Index `foreman_context` fields for search
- [ ] Add foreman filters to search API

### Foreman Integration

- [ ] Create `claude-mem-bridge` agent for policy promotion
- [ ] Create `/promote-policies` command using existing duo-creation patterns
- [ ] Update `chain-issue` to query claude-mem for context
- [ ] Add instruction template for policy-to-instruction conversion
- [ ] Add rule template for policy-to-rule conversion

### Scripts

- [ ] Extend `send-agents` to sync bridge agent
- [ ] Extend `send-commands` to sync promotion command

---

## What's NOT Changing

1. **No new CLI tools** — existing agent/command system handles all operations
2. **No active-issue.json** — release/issue context derived from paths
3. **No parallel filesystem** — crystallization outputs to existing locations
4. **No GitHub wrappers** — use GitHub MCP tools directly
5. **No custom state files** — `.foreman-project` is sufficient

---

## Size Budgets (Unchanged from chain-context patterns)

| Context Type | Max Tokens |
|--------------|------------|
| Issue brief | 2000 |
| Release context | 1500 |
| Related observations | 1500 |
| Active policies | 1000 |
| **Total injected** | **6000** |

---

## References

- Foreman agents: `/Users/miles/.my_coding/agents/`
- Foreman commands: `/Users/miles/.my_coding/commands/`
- Foreman instructions: `/Users/miles/.my_coding/instructions/`
- Foreman templates: `/Users/miles/.my_coding/templates/`
- Foreman rules: `/Users/miles/.my_coding/rules/`
- claude-mem docs: https://docs.claude-mem.ai
- Claude Code hooks: https://code.claude.com/docs/en/hooks
