# The Forge Vision

> "The people who are crazy enough to think they can change the world are the ones who do."

---

## What We're Building

We're not integrating foreman and claude-mem. We're **creating something new**.

**Forge** — A living orchestration system where commands, agents, skills, and rules are nodes in a graph. Where relationships have history. Where the system learns how you work and adapts to you. Where authoring is visual, immediate, and intelligent.

---

## The Problem with Today

```
TODAY'S ORCHESTRATION
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  📄 command.md ──(references)──> 📄 agent.md           │
│                                   │                     │
│                    (references)───┘                     │
│                    ↓                                    │
│                  📄 skill.md                            │
│                    │                                    │
│                    (references)                         │
│                    ↓                                    │
│                  📄 template.md                         │
│                                                         │
│  All dead text. No validation. No history.             │
│  No understanding. No learning.                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

You write `Task tool with subagent_type='backend-worker'`. Does that agent exist? Is it spelled right? What does it actually do? How many times has it failed? You won't know until runtime.

---

## The Forge Architecture

```
THE LIVING GRAPH
┌─────────────────────────────────────────────────────────┐
│                                                         │
│       ┌───────────────────────────────────────┐         │
│       │         ARTIFACT DATABASE             │         │
│       │                                       │         │
│       │  ┌─────────┐    edge    ┌─────────┐  │         │
│       │  │ Command │──────────▶│  Agent  │  │         │
│       │  │  Node   │  (127 runs │  Node   │  │         │
│       │  │         │   80% ✓)   │         │  │         │
│       │  └────┬────┘            └────┬────┘  │         │
│       │       │                      │       │         │
│       │       │ edge                 │ edge  │         │
│       │       │ (auto-detected)      │       │         │
│       │       ▼                      ▼       │         │
│       │  ┌─────────┐            ┌─────────┐  │         │
│       │  │Template │            │  Skill  │  │         │
│       │  │  Node   │            │  Node   │  │         │
│       │  └─────────┘            └─────────┘  │         │
│       │                                       │         │
│       └───────────────────────────────────────┘         │
│                         │                               │
│                         ▼                               │
│       ┌───────────────────────────────────────┐         │
│       │         BEHAVIOR LAYER                │         │
│       │                                       │         │
│       │  • User runs npm run dev (92%)       │         │
│       │  • User prefers test-after (78%)     │         │
│       │  • User always verifies UI           │         │
│       │  • User uses conventional commits    │         │
│       │                                       │         │
│       └───────────────────────────────────────┘         │
│                         │                               │
│                         ▼                               │
│       ┌───────────────────────────────────────┐         │
│       │         EXECUTION HISTORY             │         │
│       │                                       │         │
│       │  Session 1: command → agent → skill   │         │
│       │  Session 2: command → agent (failed)  │         │
│       │  Session 3: command → agent → skill   │         │
│       │                                       │         │
│       └───────────────────────────────────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## The Editor

This is where magic happens.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Forge Editor                                              [▣] [—] [×]   │
├─────────────────────────────────────────────────────────────────────────┤
│ [+ Command] [+ Agent] [+ Skill] [Settings]        [▶ Run] [⟳ Sync]     │
├───────────────┬─────────────────────────────────┬───────────────────────┤
│ ARTIFACTS     │ CONTENT                         │ RELATIONSHIPS         │
│               │                                 │                       │
│ ▾ Commands    │ ---                             │      ┌───────────┐    │
│   └ forge-    │ name: forge-impact              │      │forge-impact│   │
│     impact    │ description: Comprehensive...   │      └─────┬─────┘    │
│   └ forge-    │ ---                             │            │          │
│     issue     │                                 │     ┌──────┴──────┐   │
│   └ forge-    │ # Impact Change                 │     ▼             ▼   │
│     plan      │                                 │ ┌───────┐   ┌───────┐ │
│               │ When user describes a change... │ │backend│   │verify │ │
│ ▾ Agents      │                                 │ │-assess│   │-ui    │ │
│   └ forge-    │ ## Phase 1: Assessment          │ └───────┘   └───────┘ │
│     backend   │                                 │     │           │     │
│   └ forge-    │ Launch @agent/forge-backend-    │     ▼           ▼     │
│     frontend  │ assess| with 5 parallel agents  │ ┌───────┐   ┌───────┐ │
│   └ forge-    │        ↑                        │ │analyze│   │skill/ │ │
│     assess    │  ┌─────┴──────────────────────┐ │ │-error │   │verify │ │
│               │  │ @ Autocomplete             │ │ └───────┘   └───────┘ │
│ ▾ Skills      │  │                            │ │                       │
│   └ forge-    │  │ @agent/forge-backend-worker│ │ 127 executions        │
│     analyze   │  │ @agent/forge-frontend-dev  │ │ 80% success rate      │
│   └ forge-    │  │ @skill/forge-analyze-error │ │ avg 2,847 tokens      │
│     fix-error │  │ @template/impact-qrg       │ │                       │
│               │  └────────────────────────────┘ │                       │
├───────────────┴─────────────────────────────────┴───────────────────────┤
│ EXECUTION HISTORY                                                        │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Today 3:42pm  │ ✓ Success │ 5 agents │ 2,341 tokens │ [View]       │ │
│ │ Today 2:15pm  │ ✗ Failed  │ 3 agents │ 1,892 tokens │ [View]       │ │
│ │ Yesterday     │ ✓ Success │ 5 agents │ 3,102 tokens │ [View]       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Makes This Different

**@ Autocomplete**
Type `@` anywhere in the content editor. Instantly see all artifacts you can reference:
- `@agent/forge-backend-worker`
- `@skill/forge-analyze-error`
- `@template/release-specification`
- `@rule/development-standards`

The reference becomes a **live link**. Validated. Tracked. Navigable.

**Double-Click Navigation**
See `@agent/forge-backend-assess` in your command? Double-click. You're now editing that agent. See what skills it uses. What templates it references. What rules apply.

**One level deeper. Always.**

**Relationship Graph**
The right panel shows you **what this artifact touches**. Not as text. As a visual graph. Color-coded by type. Edge thickness by usage frequency. Click any node to navigate there.

**Execution History**
Not just "this file exists." This file **ran 127 times**. **80% success rate**. **Average 2,847 tokens**. Click to see the observations from each run.

---

## The Database Model

```sql
-- Every command, agent, skill, instruction, template, rule is a node
CREATE TABLE forge_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,  -- command, agent, skill, instruction, template, rule
  name TEXT NOT NULL,           -- forge-impact, forge-backend-worker, etc.
  description TEXT,
  content TEXT NOT NULL,        -- Full markdown content
  frontmatter JSON,             -- Parsed YAML frontmatter
  checksum TEXT,                -- Detect external edits

  -- Anthropic format compliance
  format_version TEXT DEFAULT '1.0',
  format_valid BOOLEAN DEFAULT true,
  format_errors JSON,           -- Any structure violations

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, artifact_type, name)
);

-- Edges: How artifacts connect
CREATE TABLE forge_relationships (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  target_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  relationship_type TEXT NOT NULL,  -- launches, uses_skill, references_template, applies_rule

  -- Where in the source does this reference occur?
  context_line INTEGER,
  context_text TEXT,

  -- Is this explicit (@reference) or inferred (from execution)?
  detection_method TEXT,  -- explicit, inferred, manual
  confidence REAL DEFAULT 1.0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Execution: When artifacts run
CREATE TABLE forge_executions (
  id INTEGER PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  session_id TEXT NOT NULL,
  parent_execution_id INTEGER REFERENCES forge_executions(id),

  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  status TEXT,  -- running, success, failure
  tokens_used INTEGER,

  -- Link to claude-mem observations
  observation_ids JSON,

  -- What artifacts were invoked?
  child_artifacts JSON
);

-- Behaviors: What we learn about the user
CREATE TABLE forge_behaviors (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  behavior_type TEXT NOT NULL,

  -- The pattern we detected
  pattern_key TEXT NOT NULL,    -- build_mode, test_strategy, script_preference
  pattern_value TEXT NOT NULL,  -- development, test-after, npm run dev

  -- Evidence
  evidence_count INTEGER DEFAULT 1,
  evidence_sessions JSON,

  -- Confidence grows with evidence
  confidence REAL DEFAULT 0.5,

  first_seen TIMESTAMP,
  last_seen TIMESTAMP,

  UNIQUE(project_id, behavior_type, pattern_key)
);

-- Planning: Track unified planning state
CREATE TABLE forge_planning (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  -- Where are we?
  planning_mode TEXT NOT NULL,   -- greenfield, brownfield, hybrid
  current_phase TEXT NOT NULL,   -- research, concept, design, architecture, issues, execution

  -- Phase-specific state
  phase_data JSON,

  -- Research findings (carry over between greenfield/brownfield)
  research_cache JSON,

  started_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Unified Planning

The breakthrough: **Greenfield and brownfield are not different workflows. They're the same workflow with different starting points.**

```
                    THE UNIFIED PLANNING SPECTRUM

     GREENFIELD                                      BROWNFIELD
         |                                               |
         |  Research   Concept   Design    Arch   Issues |
         |     |          |        |        |       |    |
         ▼     ▼          ▼        ▼        ▼       ▼    ▼
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    │  ┌──────────┐                                          │
    │  │ RESEARCH │◀──── Both paths start here              │
    │  │ PHASE    │      Templates, libraries, services      │
    │  └────┬─────┘      Scoring, composition                │
    │       │                                                │
    │       │  Greenfield: Full stack research              │
    │       │  Brownfield: Delta research (what's new?)     │
    │       ▼                                                │
    │  ┌──────────┐                                          │
    │  │ CONCEPT/ │      Greenfield: Q&A to define concepts │
    │  │  SCOPE   │      Brownfield: Scope the change       │
    │  └────┬─────┘                                          │
    │       │                                                │
    │       │  Concepts become the connective tissue        │
    │       │  ConceptIDs trace through to completion       │
    │       ▼                                                │
    │  ┌──────────┐                                          │
    │  │ DESIGN   │◀──── CONVERGED                          │
    │  │ PHASE    │      UX, UI, Architecture               │
    │  └────┬─────┘      Same agents, same templates        │
    │       │            Greenfield: Full generation        │
    │       │            Brownfield: Surgical updates       │
    │       ▼                                                │
    │  ┌──────────┐                                          │
    │  │ ISSUES   │◀──── IDENTICAL                          │
    │  │ PHASE    │      Both produce issue-map/*.yaml      │
    │  └────┬─────┘      Atomic, sequential, TDD-ready      │
    │       │                                                │
    │       ▼                                                │
    │  ┌──────────┐                                          │
    │  │EXECUTION │◀──── IDENTICAL                          │
    │  │ PHASE    │      RED → GREEN → REFACTOR             │
    │  └──────────┘      Same workflow, same verification   │
    │                                                        │
    └────────────────────────────────────────────────────────┘
```

### The Key Insight

Research is **cached**. When you do greenfield research, you learn:
- "React with shadcn/ui scores 8.5"
- "Supabase for auth scores 9.2"
- "Vercel for deployment scores 8.8"

When you later do brownfield ("add real-time sync"), the system:
1. Checks the cache: "What did we learn about this project?"
2. Does **delta research**: "What's needed for real-time that we don't have?"
3. Produces recommendations that **build on** prior decisions

No starting from scratch. No re-researching the same libraries. The intelligence persists.

---

## Behavior-Aware Execution

Today, `/impact-change` asks you:
- "Are you in development mode?"
- "What scripts should I run?"
- "Do you want UI verification?"

**Why is it asking?** It doesn't know. Every session starts fresh.

### The Forge Difference

```
SESSION START
     │
     ▼
┌────────────────────────────────────────────┐
│ BEHAVIOR LOOKUP                            │
│                                            │
│ Project: claude-mem                        │
│ Behaviors:                                 │
│   • build_mode: development (94% conf)    │
│   • test_strategy: test-after (81% conf)  │
│   • scripts:                              │
│       - npm run dev (142 uses)            │
│       - npm run test (98 uses)            │
│       - npm run build (12 uses)           │
│   • verification: always verify UI         │
│   • commit_style: conventional             │
│                                            │
└────────────────────────────────────────────┘
     │
     ▼
USER: /forge-impact "Change auth to JWT"
     │
     ▼
┌────────────────────────────────────────────┐
│ CONTEXT INJECTION (No Questions Asked)     │
│                                            │
│ Applying learned behaviors:                │
│ ✓ Development mode (no production build)  │
│ ✓ Run npm run dev after changes           │
│ ✓ Run npm run test for verification       │
│ ✓ Trigger verify-ui for frontend changes  │
│                                            │
└────────────────────────────────────────────┘
     │
     ▼
ASSESSMENT → IMPLEMENTATION → VERIFICATION
     │
     ▼
┌────────────────────────────────────────────┐
│ BEHAVIOR FEEDBACK                          │
│                                            │
│ Applied behaviors:                         │
│ • Ran npm run dev ✓                        │
│ • Ran npm run test ✓                       │
│ • Triggered verify-ui ✓                    │
│                                            │
│ Were these helpful? [Yes] [No] [Adjust]    │
│                                            │
└────────────────────────────────────────────┘
     │
     ▼
LEARNING LOOP
(Confidence increases or decreases based on feedback)
```

The system **learns**. Not by explicit teaching. By observation.

---

## Skills at the Right Layer

Skills are powerful. But they need to be wielded correctly.

**Wrong:** Skills at the orchestrator level
```
User: "Change auth to JWT"
  → Skill triggers at orchestrator
  → Orchestrator confused about role
  → Too much context for routing decision
```

**Right:** Skills at the agent level
```
User: "/forge-impact 'Change auth to JWT'"
  → Orchestrator routes (150 tokens)
  → Launches forge-backend-assess agent
    → Agent encounters >200 LOC file
    → Agent triggers forge-restructure Skill
    → Skill handles restructuring
    → Agent continues
  → Launches forge-verify-ui agent
    → Agent triggers forge-verify-ui Skill
    → Skill runs Playwright
    → Agent reports results
```

The orchestrator stays lean. Agents get superpowers.

```
LAYER RESPONSIBILITIES
┌─────────────────────────────────────────────────────────┐
│ ORCHESTRATOR (Command)                                  │
│                                                         │
│ Context: ~150 tokens                                    │
│ Knows: WHAT, WHERE, WHO, WHY                           │
│ Does: Routing only                                      │
│ Skills: NONE (explicitly blocked)                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ AGENT (Specialized Worker)                              │
│                                                         │
│ Context: ~700 tokens                                    │
│ Knows: Methodology + variance-critical values          │
│ Does: Implementation, analysis, verification           │
│ Skills: AVAILABLE (contextual triggering)              │
│                                                         │
│ Available Skills:                                       │
│   • forge-analyze-error (when encountering errors)     │
│   • forge-restructure (when file >200 LOC)             │
│   • forge-dead-code (after refactoring)                │
│   • forge-verify-ui (after frontend changes)           │
│   • forge-fix-error (when tests fail)                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ SKILL (Capability)                                      │
│                                                         │
│ Context: Inherited from agent                          │
│ Knows: Single focused capability                       │
│ Does: One thing exceptionally well                     │
│ Skills: None (leaf node)                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## The Naming Convention

To keep Forge artifacts distinct from your personal foreman installation:

| Type | Personal Foreman | Project Forge |
|------|-----------------|---------------|
| **Commands** | `/chain-issue` | `/forge-issue` |
| **Agents** | `backend-worker` | `forge-backend-worker` |
| **Skills** | N/A | `forge-analyze-error` |
| **Templates** | `release-specification-template.md` | `forge-release-template.md` |
| **Rules** | `development-standards.mdc` | `forge-dev-standards.mdc` |

Why "Forge"?
- **Craftsmanship**: Forging implies careful creation
- **Merging**: Forging two systems into one
- **Strength**: Forged metal is stronger than raw ore
- **Distinct**: No collision with `chain-`, `claude-`, or vanilla names

---

## The Database-File Sync

Artifacts live in the database. But they're also on disk for:
- Version control (git)
- External editing (vim, vscode)
- Claude Code CLI reading

```
SYNC ARCHITECTURE
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  .claude/                                                    │
│  ├── commands/              ◄──┐                             │
│  │   ├── forge-issue.md         │                            │
│  │   ├── forge-impact.md        │                            │
│  │   └── forge-plan.md          │                            │
│  │                              │ BIDIRECTIONAL SYNC         │
│  ├── agents/                    │                            │
│  │   ├── forge-backend.md       │ • File edit → DB update   │
│  │   └── forge-frontend.md      │ • DB edit → File write    │
│  │                              │ • Checksum for conflicts  │
│  ├── skills/                    │                            │
│  │   └── forge-analyze-error/   │                            │
│  │       └── SKILL.md       ◄───┘                            │
│  │                                                           │
│  └── CLAUDE.md                  (References, not content)    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ FORGE DATABASE (~/.claude-mem/forge.db)                      │
│                                                              │
│ forge_artifacts:                                             │
│   - id, type, name, content, frontmatter, checksum          │
│                                                              │
│ forge_relationships:                                         │
│   - source → target, type, line, confidence                 │
│                                                              │
│ forge_executions:                                            │
│   - artifact, session, status, tokens, observations         │
│                                                              │
│ forge_behaviors:                                             │
│   - pattern, evidence, confidence                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## The UI Components

### 1. Artifact Tree (Left Panel)

```typescript
interface ArtifactTreeProps {
  artifacts: Artifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContextMenu: (id: string, event: React.MouseEvent) => void;
}

// Features:
// - Grouped by type (Commands, Agents, Skills, etc.)
// - Drag-and-drop to reorder or create relationships
// - Context menu: Rename, Delete, Duplicate, View History
// - Badge showing execution count / success rate
```

### 2. Content Editor (Center Panel)

```typescript
interface ContentEditorProps {
  artifact: Artifact;
  onChange: (content: string) => void;
  onReferenceClick: (reference: Reference) => void;
}

// Features:
// - Monaco or CodeMirror with markdown highlighting
// - @ autocomplete for artifact references
// - Inline validation (format errors shown inline)
// - Click on @reference to navigate
// - Drag-drop from tree to insert reference
```

### 3. Relationship Graph (Right Panel)

```typescript
interface RelationshipGraphProps {
  centerId: string;
  relationships: Relationship[];
  executions: Execution[];
  onNodeClick: (id: string) => void;
}

// Features:
// - Force-directed graph (D3 or react-flow)
// - Center node = current artifact
// - Outgoing edges = what this uses
// - Incoming edges = what uses this
// - Edge thickness = execution frequency
// - Node color = artifact type
```

### 4. Execution History (Bottom Panel)

```typescript
interface ExecutionHistoryProps {
  artifactId: string;
  executions: Execution[];
  onExecutionSelect: (id: number) => void;
}

// Features:
// - Timeline of executions
// - Status, duration, tokens, agent count
// - Click to expand: See observations, child launches
// - Compare: Side-by-side with previous execution
```

### 5. Behavior Learning Panel (Settings)

```typescript
interface BehaviorLearningProps {
  behaviors: Behavior[];
  onOverride: (id: number, value: string) => void;
  onAccept: (id: number) => void;
  onClear: (id: number) => void;
}

// Features:
// - List of detected behaviors
// - Confidence meter per behavior
// - Evidence count and sessions
// - Override/Accept/Clear controls
// - "Apply to CLAUDE.md" button
```

---

## The Impact-Change Evolution

With behaviors and the database, `forge-impact` becomes intelligent:

```markdown
# forge-impact (Enhanced)

## Phase 0: Behavior Context (NEW)

Before any analysis, load project behaviors:

```typescript
const behaviors = await db.query(`
  SELECT pattern_key, pattern_value, confidence
  FROM forge_behaviors
  WHERE project_id = ? AND confidence > 0.7
`, [projectId]);
```

Inject into assessment context:
- Build mode: ${behaviors.build_mode}
- Scripts: ${behaviors.scripts}
- Verification: ${behaviors.verification_preference}

## Phase 1: Assessment

Launch parallel agents with behavior context.
Each agent knows:
- No need to ask about dev mode
- Which scripts to run
- Whether to trigger UI verification

## Phase 4: Implementation

After surgical edits:
- Auto-run learned scripts (npm run dev)
- Auto-run learned tests (npm run test)
- Auto-trigger verification (forge-verify-ui)

## Phase 6: Feedback

Present: "Applied these behaviors: [list]"
Ask: "Were they helpful?"
Update: Confidence based on response
```

---

## The Project CLAUDE.md

The CLAUDE.md becomes **generated from observations**, not manually maintained:

```markdown
# Project Memory (Auto-Generated by Forge)

## Learned Behaviors
<!-- Updated: 2026-01-07 15:42:00 -->

| Behavior | Value | Confidence |
|----------|-------|------------|
| Build Mode | development | 94% |
| Test Strategy | test-after | 81% |
| Verification | always verify UI | 88% |
| Commit Style | conventional | 95% |

## Frequently Used Scripts
1. `npm run dev` (142 invocations)
2. `npm run test` (98 invocations)
3. `npm run build` (12 invocations)

## Agent Performance
| Agent | Runs | Success | Avg Tokens |
|-------|------|---------|------------|
| forge-backend-worker | 127 | 84% | 2,341 |
| forge-frontend-dev | 98 | 79% | 1,892 |
| forge-assess | 145 | 91% | 3,102 |

## Skill Usage
- forge-analyze-error: 45 triggers (backend: 28, frontend: 17)
- forge-restructure: 12 triggers (avg file: 312 LOC → 89 LOC)
- forge-verify-ui: 67 triggers (92% pass rate)

## Research Cache
<!-- From last greenfield planning -->
| Category | Choice | Score | Rationale |
|----------|--------|-------|-----------|
| UI Framework | React + shadcn/ui | 8.5 | Best DX, component quality |
| Backend | Express + TypeScript | 8.8 | Team familiarity |
| Database | SQLite | 9.2 | Simplicity, portability |

## File Ownership
<!-- Inferred from agent activity -->
| Path | Primary Agent | Last Modified |
|------|--------------|---------------|
| src/hooks/*.ts | forge-backend-worker | 2026-01-07 |
| src/ui/viewer/*.tsx | forge-frontend-dev | 2026-01-06 |
| tests/*.test.ts | forge-test-manager | 2026-01-07 |
```

This isn't static documentation. It's **living memory**.

---

## Implementation Path

### Phase 1: Database Foundation (Week 1)

1. Create `forge_artifacts` table
2. Create `forge_relationships` table
3. Create `forge_executions` table
4. Create `forge_behaviors` table
5. Implement bidirectional file sync
6. Migrate existing foreman artifacts to database

### Phase 2: Core Editor (Week 2)

1. Artifact tree component
2. Content editor with @ autocomplete
3. Basic relationship graph
4. File ↔ DB sync watcher

### Phase 3: Intelligence Layer (Week 3)

1. Behavior detection from observations
2. Relationship inference from executions
3. Confidence scoring
4. Behavior feedback loop

### Phase 4: Unified Planning (Week 4)

1. `forge_planning` table
2. Research caching
3. Greenfield/brownfield detection
4. Phase state machine

### Phase 5: Full Integration (Week 5-6)

1. All foreman agents migrated to forge-*
2. All commands migrated
3. Skills created for agents
4. Behavior-aware impact-change
5. Living CLAUDE.md generation

---

## Success Metrics

| Metric | Today | Target |
|--------|-------|--------|
| Questions asked by impact-change | 3-5 | 0 |
| Time to navigate command → agent → skill | 30s (reading) | 2s (click) |
| Artifact validation | Runtime only | Edit-time |
| Behavior consistency | 0% | 85%+ |
| Research reuse (brownfield) | 0% | 70%+ |
| Context load (orchestrator) | Unknown | <200 tokens |
| Agent skill triggering | Manual | Automatic |

---

## The Vision

We're not building a tool. We're building a **craftsman's workbench**.

A place where orchestration is visual. Where relationships are tangible. Where the system learns how you work and adapts to you. Where greenfield and brownfield flow naturally from the same source. Where every artifact has history, has relationships, has meaning.

**Forge**: Where foreman meets memory. Where commands come alive. Where the future of orchestration authoring begins.

---

*"Design is not just what it looks like and feels like. Design is how it works."*
