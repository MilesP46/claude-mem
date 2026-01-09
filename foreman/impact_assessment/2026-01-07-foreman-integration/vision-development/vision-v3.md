# Forge Vision v3: The Planning Decision Layer

> "Simplicity is the ultimate sophistication."

---

## The Missing Layer

v1 gave us visual orchestration. v2 gave us VS Code integration with behavior learning and agent change review. But there's a layer we haven't addressed—the layer that makes everything else possible.

**The Planning Layer.**

When you run `/chain-plan-design-green`, a cascade of decisions flows through 7 agents:
- What templates should we use? (chain-prototype-researcher)
- What user flows make sense? (chain-ux-researcher)
- What components do we need? (chain-ui-designer)
- What's the API structure? (chain-system-architect)

These decisions are **made**, **logged**, and **stored**—but they're buried in markdown files across a release directory. You can't see them. You can't compare them. You can't easily change them.

v3 introduces the **Planning Decision Layer**: a React-based visualization and interaction system that surfaces every decision made during greenfield or brownfield planning, enables user control at key decision points, and creates a feedback loop that informs memory and identifies capability gaps.

---

## The Architecture Evolution

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FORGE v3 ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    PLANNING DECISION LAYER (NEW)                         │   │
│   │                                                                          │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│   │   │   Pipeline   │  │   Decision   │  │   Template   │  │ Capability │  │   │
│   │   │   Tracker    │  │   Explorer   │  │   Browser    │  │   Gaps     │  │   │
│   │   │              │  │              │  │              │  │            │  │   │
│   │   │ Where are we │  │ What was     │  │ What's being │  │ What's     │  │   │
│   │   │ in the chain?│  │ decided?     │  │ used? Alts?  │  │ missing?   │  │   │
│   │   └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │   │
│   │                                                                          │   │
│   │   ┌──────────────────────────────────────────────────────────────────┐  │   │
│   │   │                    Decision Setting Panel                         │  │   │
│   │   │                                                                   │  │   │
│   │   │  After research completes, SET your decisions before design      │  │   │
│   │   │  phase begins. Review scores. Override recommendations.          │  │   │
│   │   │  Lock decisions. Create decision branches.                       │  │   │
│   │   │                                                                   │  │   │
│   │   └──────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                        │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      ORCHESTRATION LAYER (v1/v2)                         │   │
│   │                                                                          │   │
│   │   ReactFlow Canvas │ Agent Changes │ Artifact Tree │ Behavior Learning  │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                        │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                        MEMORY LAYER (claude-mem)                         │   │
│   │                                                                          │   │
│   │   Observations │ Sessions │ Behaviors │ Forge Artifacts │ Decisions     │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## The Chain Workflow Visualized

Today, the chain workflow is a black box. Commands run. Files appear. You trust it worked.

### Pipeline Tracker

The Pipeline Tracker integrates with Claude Code's native `/plan` mode, extending it with chain-* awareness. When you enter plan mode, the tracker automatically detects active pipelines and surfaces their state:

- **Plan Mode Synergy**: Running `/plan` while a chain workflow is active shows the Pipeline Tracker
- **Session Persistence**: Pipelines use `/rename` to name sessions (e.g., "release-9-greenfield") and `/resume` for continuation
- **Subagent Awareness**: Each chain-* command runs as a resumable subagent, allowing pause/continue across sessions

The Pipeline Tracker shows exactly where you are in any chain workflow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PLANNING PIPELINE                                          Release 9 │ Greenfield│
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────────────────────────────┐  │
│  │ CONCEPT │───▶│  PLAN   │───▶│              DESIGN PHASE                   │  │
│  │  GEN    │    │  INIT   │    │                                             │  │
│  │   ✓     │    │   ✓     │    │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  └─────────┘    └─────────┘    │  │RESEARCH │  │   UX    │  │   UI    │     │  │
│                                │  │         │  │         │  │         │     │  │
│                                │  │ ✓ Done  │  │ ● Active│  │ ○ Next  │     │  │
│                                │  └─────────┘  └─────────┘  └─────────┘     │  │
│                                │        │            │            │          │  │
│                                │        │            │            │          │  │
│                                │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│                                │  │  ARCH   │  │ WHIMSY  │  │ ISSUES  │     │  │
│                                │  │         │  │         │  │         │     │  │
│                                │  │ ○ Queue │  │ ○ Queue │  │ ○ Queue │     │  │
│                                │  └─────────┘  └─────────┘  └─────────┘     │  │
│                                │                                             │  │
│                                └─────────────────────────────────────────────┘  │
│                                                     │                            │
│                                                     ▼                            │
│                                ┌─────────────────────────────────────────────┐  │
│                                │              EXECUTION PHASE                │  │
│                                │                                             │  │
│                                │  Issue 001 ✓ │ Issue 002 ● │ Issue 003 ○   │  │
│                                │  Issue 004 ○ │ Issue 005 ○ │ Issue 006 ○   │  │
│                                │                                             │  │
│                                └─────────────────────────────────────────────┘  │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Current: chain-ux-researcher │ Duration: 12m │ Decisions: 8 logged │ [Pause]   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline State Storage

```sql
-- Track chain execution state
CREATE TABLE forge_pipeline_state (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('greenfield', 'brownfield')),
  current_command TEXT NOT NULL,      -- chain-ux-researcher, chain-issue, etc.
  current_phase TEXT NOT NULL,        -- concept, plan, design, execution
  current_step INTEGER,               -- For multi-step commands

  -- Session integration (Claude Code 2.1)
  session_name TEXT,                  -- Named via /rename for /resume support
  session_id TEXT,                    -- Claude Code session ID
  is_resumable BOOLEAN DEFAULT true,  -- Subagent resumption enabled

  started_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  -- Links to decision and artifact state
  decisions_count INTEGER DEFAULT 0,
  artifacts_generated JSON,           -- List of files created

  UNIQUE(project_id, release_id)
);
```

---

## Decision Explorer

Every decision made during planning is captured, visualized, and queryable.

### The Decision Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DECISION EXPLORER                                              Release 9        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Filter: [All Agents ▾] [All Types ▾] [All Status ▾]    Search: [____________]  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                          DECISION TIMELINE                                 │  │
│  │                                                                            │  │
│  │  RESEARCH ─────────────────────────────────────────────────────────────▶  │  │
│  │  │                                                                         │  │
│  │  ├─ DEC-001: UI Framework Selection                                       │  │
│  │  │  Agent: chain-prototype-researcher                                     │  │
│  │  │  Decision: React + shadcn/ui (Score: 8.5)                             │  │
│  │  │  Alternatives: Vue+Vuetify (7.2), Svelte+Skeleton (7.8)               │  │
│  │  │  Status: ✓ Locked                                                      │  │
│  │  │                                                                         │  │
│  │  ├─ DEC-002: Authentication Provider                                      │  │
│  │  │  Agent: chain-prototype-researcher                                     │  │
│  │  │  Decision: Supabase Auth (Score: 9.2)                                 │  │
│  │  │  Alternatives: Auth0 (8.1), Firebase Auth (7.9)                       │  │
│  │  │  Status: ✓ Locked                                                      │  │
│  │  │                                                                         │  │
│  │  UX ────────────────────────────────────────────────────────────────────▶  │  │
│  │  │                                                                         │  │
│  │  ├─ DEC-003: Primary User Flow                                            │  │
│  │  │  Agent: chain-ux-researcher                                            │  │
│  │  │  Decision: Dashboard-first with progressive disclosure                 │  │
│  │  │  ConceptID: CONCEPT-003 (User onboarding)                             │  │
│  │  │  Status: ✓ Locked                                                      │  │
│  │  │                                                                         │  │
│  │  ├─ DEC-004: Mobile Strategy                                              │  │
│  │  │  Agent: chain-ux-researcher                                            │  │
│  │  │  Decision: Responsive web (no native app)                              │  │
│  │  │  Status: ⚠ User Override (was: PWA)                                   │  │
│  │  │                                                                         │  │
│  │  UI ────────────────────────────────────────────────────────────────────▶  │  │
│  │  │                                                                         │  │
│  │  ├─ DEC-005: Component Library Mapping                                    │  │
│  │  │  Agent: chain-ui-designer                                              │  │
│  │  │  Decision: 12 shadcn components + 3 custom                            │  │
│  │  │  Depends: DEC-001 (UI Framework)                                       │  │
│  │  │  Status: ● Pending Review                                              │  │
│  │  │                                                                         │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  [Export Decisions] [Compare with Release 8] [View Decision Log]                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Decision Data Model

```sql
-- Every decision from planning phases
CREATE TABLE forge_planning_decisions (
  id TEXT PRIMARY KEY,                -- DEC-001, DEC-002, etc.
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  -- Decision metadata
  agent TEXT NOT NULL,                -- chain-prototype-researcher, chain-ux-researcher, etc.
  phase TEXT NOT NULL,                -- research, ux, ui, architecture
  category TEXT NOT NULL,             -- framework, auth, flow, component, api, database

  -- The decision itself
  title TEXT NOT NULL,
  description TEXT,
  decision_value TEXT NOT NULL,       -- The actual choice made
  decision_score REAL,                -- If scored (research phase)

  -- Alternatives considered
  alternatives JSON,                  -- [{value, score, rationale}, ...]

  -- Traceability
  concept_ids JSON,                   -- Links to concept-checklist.md concepts
  depends_on JSON,                    -- Other decision IDs this depends on
  source_file TEXT,                   -- Where this was logged (decision-log.md, etc.)
  source_line INTEGER,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',          -- Made by agent, not yet reviewed
    'locked',           -- Approved, cannot change without unlock
    'user_override',    -- User changed the agent's decision
    'inherited'         -- From previous release (brownfield)
  )),

  -- Override tracking
  original_value TEXT,                -- If user_override, what was the original?
  override_rationale TEXT,            -- Why user changed it

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  locked_at TIMESTAMP,
  locked_by TEXT                      -- 'auto' or 'user'
);

-- Decision dependencies (graph edges)
CREATE TABLE forge_decision_dependencies (
  id INTEGER PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  depends_on_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  dependency_type TEXT DEFAULT 'requires',  -- requires, informs, conflicts

  UNIQUE(decision_id, depends_on_id)
);

-- Index for fast lookups
CREATE INDEX idx_decisions_release ON forge_planning_decisions(project_id, release_id);
CREATE INDEX idx_decisions_agent ON forge_planning_decisions(agent);
CREATE INDEX idx_decisions_status ON forge_planning_decisions(status);
```

---

## Template Browser

Templates are the DNA of the chain workflow. Every output document uses a template-instruction pair. The Template Browser makes this visible.

### Template Usage View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ TEMPLATE BROWSER                                               Release 9        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │ TEMPLATE CATEGORIES             │  │ TEMPLATE DETAIL                      │   │
│  │                                 │  │                                      │   │
│  │ ▾ Planning (4 templates)        │  │ release-specification-template.md    │   │
│  │   ├─ concept-checklist    ✓    │  │                                      │   │
│  │   ├─ release-specification ✓    │  │ ┌────────────────────────────────┐  │   │
│  │   ├─ deployment-decision   ✓    │  │ │ Status: ✓ Used                 │  │   │
│  │   └─ recommendation-report ✓    │  │ │ Output: release9-spec.md       │  │   │
│  │                                 │  │ │ Completeness: 100%             │  │   │
│  │ ▾ UX Research (4 templates)     │  │ └────────────────────────────────┘  │   │
│  │   ├─ user-flows           ✓    │  │                                      │   │
│  │   ├─ personas             ✓    │  │ Placeholders:                        │   │
│  │   ├─ wireframes           ●    │  │ ┌────────────────────────────────┐  │   │
│  │   └─ interaction-patterns ○    │  │ │ {{RELEASE_NUMBER}}    → 9      │  │   │
│  │                                 │  │ │ {{PROJECT_NAME}}      → Forge  │  │   │
│  │ ▾ UI Design (7 templates)       │  │ │ {{CONCEPT_SUMMARY}}   → ...    │  │   │
│  │   ├─ component-specs      ○    │  │ │ {{SCOPE_BOUNDARIES}}  → ...    │  │   │
│  │   ├─ design-system        ○    │  │ │ {{SUCCESS_METRICS}}   → ...    │  │   │
│  │   ├─ config-notes         ○    │  │ └────────────────────────────────┘  │   │
│  │   ├─ component-markups    ○    │  │                                      │   │
│  │   ├─ interactive-proto    ○    │  │ Instructions:                        │   │
│  │   ├─ ui-interaction       ○    │  │ ┌────────────────────────────────┐  │   │
│  │   └─ navigation-state     ○    │  │ │ • Fill all {{PLACEHOLDERS}}    │  │   │
│  │                                 │  │ │ • Reference concept-checklist  │  │   │
│  │ ▾ Architecture (4 templates)    │  │ │ • Include success metrics      │  │   │
│  │   ├─ api-design           ○    │  │ │ • Save to 00-planning/         │  │   │
│  │   ├─ service-integration  ○    │  │ └────────────────────────────────┘  │   │
│  │   ├─ database-schema      ○    │  │                                      │   │
│  │   └─ infrastructure-plan  ○    │  │ [View Template] [View Instructions] │   │
│  │                                 │  │ [View Output] [Edit Output]         │   │
│  │ ▾ Issue Planning (4 templates)  │  │                                      │   │
│  │   └─ ...                        │  │                                      │   │
│  │                                 │  │                                      │   │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                                  │
│  Legend: ✓ Complete │ ● In Progress │ ○ Pending                                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Template Tracking

```sql
-- Track template usage per release
CREATE TABLE forge_template_usage (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  template_path TEXT NOT NULL,        -- foreman/templates/planning/release-specification-template.md
  instructions_path TEXT NOT NULL,    -- foreman/instructions/planning/release-specification-template-instructions.md
  output_path TEXT,                   -- foreman/release-9/docs/00-planning/release9-specification.md

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),

  -- Completeness
  placeholders_total INTEGER,
  placeholders_filled INTEGER,
  completeness_pct REAL GENERATED ALWAYS AS (
    CASE WHEN placeholders_total > 0
    THEN (placeholders_filled * 100.0 / placeholders_total)
    ELSE 100 END
  ) STORED,

  -- Agent that filled it
  filled_by_agent TEXT,
  filled_at TIMESTAMP,

  UNIQUE(project_id, release_id, template_path)
);
```

---

## Decision Setting Panel

This is the breakthrough: **user control at decision points**.

After research completes but before design begins, the Decision Setting Panel lets you:
1. Review all research recommendations
2. Override scores or selections
3. Lock decisions to prevent agent changes
4. Create decision branches for comparison

### The Decision Setting Experience

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DECISION SETTING                                    Release 9 │ Post-Research   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Research phase complete. Review and set your decisions before design begins.   │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ DEPLOYMENT DECISIONS                                       [Lock All]     │  │
│  │                                                                            │  │
│  │ ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │ │ UI Framework                                              REQUIRED   │   │  │
│  │ │                                                                      │   │  │
│  │ │  ◉ React + shadcn/ui          Score: 8.5  ★ Recommended             │   │  │
│  │ │    • Best DX, excellent component quality                           │   │  │
│  │ │    • Strong TypeScript support                                      │   │  │
│  │ │    • Active community, regular updates                              │   │  │
│  │ │                                                                      │   │  │
│  │ │  ○ Vue 3 + Vuetify            Score: 7.2                            │   │  │
│  │ │    • Good component library                                         │   │  │
│  │ │    • Less TypeScript integration                                    │   │  │
│  │ │                                                                      │   │  │
│  │ │  ○ Svelte + Skeleton UI       Score: 7.8                            │   │  │
│  │ │    • Excellent performance                                          │   │  │
│  │ │    • Smaller ecosystem                                              │   │  │
│  │ │                                                                      │   │  │
│  │ │  ○ Other: [_______________]                                         │   │  │
│  │ │                                                                      │   │  │
│  │ │  [🔒 Lock Decision]  [View Full Analysis]                           │   │  │
│  │ └─────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │ ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │ │ Authentication                                            REQUIRED   │   │  │
│  │ │                                                                      │   │  │
│  │ │  ◉ Supabase Auth              Score: 9.2  ★ Recommended             │   │  │
│  │ │  ○ Auth0                      Score: 8.1                            │   │  │
│  │ │  ○ Firebase Auth              Score: 7.9                            │   │  │
│  │ │  ○ Custom JWT                 Score: 6.5                            │   │  │
│  │ │                                                                      │   │  │
│  │ │  [🔒 Lock Decision]  [View Full Analysis]                           │   │  │
│  │ └─────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │ ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │ │ Database                                                  REQUIRED   │   │  │
│  │ │                                                                      │   │  │
│  │ │  ◉ Supabase (PostgreSQL)      Score: 8.8  ★ Recommended             │   │  │
│  │ │  ○ PlanetScale (MySQL)        Score: 8.2                            │   │  │
│  │ │  ○ MongoDB Atlas              Score: 7.1                            │   │  │
│  │ │                                                                      │   │  │
│  │ │  [🔒 Lock Decision]  [View Full Analysis]                           │   │  │
│  │ └─────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ OPTIONAL SERVICES                                                          │  │
│  │                                                                            │  │
│  │ ☑ Analytics: Posthog (Score: 8.4)                    [Change] [Remove]    │  │
│  │ ☑ Error Tracking: Sentry (Score: 9.1)                [Change] [Remove]    │  │
│  │ ☐ Email: (not selected)                              [Add Service]        │  │
│  │ ☐ File Storage: (not selected)                       [Add Service]        │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ DECISION SUMMARY                                                           │  │
│  │                                                                            │  │
│  │  Required: 3 of 3 set                                                     │  │
│  │  Optional: 2 of 4 enabled                                                 │  │
│  │  Locked: 0 (lock to prevent agent modification)                           │  │
│  │                                                                            │  │
│  │  Estimated complexity: Medium (based on selections)                       │  │
│  │  Composition compatibility: ✓ All services integrate well                 │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  [Save & Continue to Design] [Save as Branch] [Reset to Recommendations]        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Decision Branches

Create alternative decision sets to compare approaches:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DECISION BRANCHES                                              Release 9        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │     main                    branch-a                  branch-b           │   │
│  │       │                        │                         │               │   │
│  │       ●───────────────────────●────────────────────────●               │   │
│  │       │                        │                         │               │   │
│  │   React +                  Vue 3 +                   Svelte +            │   │
│  │   shadcn/ui                Vuetify                   Skeleton            │   │
│  │   Supabase                 Firebase                  PlanetScale         │   │
│  │                                                                          │   │
│  │   Estimated:               Estimated:                Estimated:          │   │
│  │   12 issues                14 issues                 11 issues           │   │
│  │   ~3 weeks                 ~4 weeks                  ~3 weeks            │   │
│  │                                                                          │   │
│  │   [★ Active]               [Compare]                 [Compare]           │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  [Create New Branch] [Merge Branch into Main] [Delete Branch]                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```sql
-- Decision branches for comparison
CREATE TABLE forge_decision_branches (
  id TEXT PRIMARY KEY,                -- branch-a, branch-b, etc.
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Branch from main at this point
  branched_from TEXT DEFAULT 'main',
  branched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT false,    -- Only one active at a time
  merged_at TIMESTAMP,
  merged_into TEXT,

  UNIQUE(project_id, release_id, name)
);

-- Decisions can belong to branches
ALTER TABLE forge_planning_decisions ADD COLUMN branch_id TEXT DEFAULT 'main';
```

---

## Brownfield Decision Inheritance

When running `chain-plan-design-update` on an existing release, decisions from the original greenfield flow are inherited—but you can see exactly what's being reused.

### Inheritance Visualization

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BROWNFIELD UPDATE                                   Release 9 │ Update 2        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Change: "Add real-time collaboration features"                                  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ INHERITED DECISIONS (from greenfield)                      [Unlock All]   │  │
│  │                                                                            │  │
│  │  🔒 DEC-001: UI Framework = React + shadcn/ui                             │  │
│  │     Status: Inherited, locked                                             │  │
│  │     [Unlock to Override]                                                  │  │
│  │                                                                            │  │
│  │  🔒 DEC-002: Auth = Supabase Auth                                         │  │
│  │     Status: Inherited, locked                                             │  │
│  │     [Unlock to Override]                                                  │  │
│  │                                                                            │  │
│  │  🔒 DEC-003: Database = Supabase (PostgreSQL)                             │  │
│  │     Status: Inherited, locked                                             │  │
│  │     [Unlock to Override]                                                  │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ NEW DECISIONS REQUIRED                                     [Research]     │  │
│  │                                                                            │  │
│  │  ⚠ Real-time Infrastructure                                               │  │
│  │    Options: Supabase Realtime, Pusher, Ably, Socket.io                   │  │
│  │    Recommendation: Supabase Realtime (integrates with existing DB)       │  │
│  │    Status: ● Needs User Decision                                          │  │
│  │                                                                            │  │
│  │  ⚠ Conflict Resolution Strategy                                           │  │
│  │    Options: Last-write-wins, OT, CRDT                                    │  │
│  │    Recommendation: CRDT (Yjs) for offline support                        │  │
│  │    Status: ● Needs User Decision                                          │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ IMPACT ANALYSIS                                                            │  │
│  │                                                                            │  │
│  │  Files to Update: 8                                                       │  │
│  │  New Issues: 4 (will be 007a, 007b, 007c, 007d)                          │  │
│  │  Modified Issues: 2 (006, 008)                                            │  │
│  │                                                                            │  │
│  │  Inherited decisions affected: 0 (no conflicts)                           │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  [Set New Decisions] [View Full Impact] [Proceed with Update]                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Capability Gap Identification

The Planning Decision Layer doesn't just visualize—it **learns**. By tracking decision patterns, template usage, and workflow friction, it identifies where new capabilities are needed.

Claude Code 2.1 makes capability creation seamless:
- **Skill hot-reload**: New skills in `~/.claude/skills` or `.claude/skills` are immediately available—no restart needed
- **Agent frontmatter hooks**: Agents can define scoped PreToolUse, PostToolUse, and Stop hooks for decision capture
- **Middleware capability**: PreToolUse hooks can now modify tool inputs, enabling decision interception and logging

### Gap Detection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CAPABILITY GAPS                                                     Analysis    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Based on patterns across 12 releases and 847 decisions:                        │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ SUGGESTED NEW CAPABILITIES                                                 │  │
│  │                                                                            │  │
│  │  🔧 COMMAND: /forge-realtime-setup                         Priority: High │  │
│  │     Pattern: 4 releases needed real-time features                         │  │
│  │     Current: Manual setup each time                                       │  │
│  │     Suggestion: Automate Supabase Realtime + Yjs integration             │  │
│  │     [Create Command] [Dismiss]                                            │  │
│  │                                                                            │  │
│  │  🤖 AGENT: forge-accessibility-reviewer                    Priority: Med  │  │
│  │     Pattern: Accessibility issues found in 67% of UI reviews              │  │
│  │     Current: Manual review, often missed                                  │  │
│  │     Suggestion: Auto-run WCAG checks after chain-ui-designer             │  │
│  │     [Create Agent] [Dismiss]                                              │  │
│  │                                                                            │  │
│  │  ⚡ SKILL: forge-migration-generator                       Priority: Med  │  │
│  │     Pattern: Database changes require manual migration writing            │  │
│  │     Current: chain-system-architect outputs schema, not migrations        │  │
│  │     Suggestion: Auto-generate Prisma/Drizzle migrations from schema      │  │
│  │     [Create Skill] [Dismiss]                                              │  │
│  │                                                                            │  │
│  │  📄 TEMPLATE: api-versioning-template                      Priority: Low  │  │
│  │     Pattern: API versioning decided ad-hoc in 8 releases                  │  │
│  │     Current: No standard template                                         │  │
│  │     Suggestion: Add versioning strategy to api-design template           │  │
│  │     [Create Template] [Modify Existing]                                   │  │
│  │                                                                            │  │
│  │  🪝 HOOK: post-design-validation                           Priority: High │  │
│  │     Pattern: Design phase often produces incomplete outputs               │  │
│  │     Current: Validation happens manually or in chain-issue-builder        │  │
│  │     Suggestion: Agent frontmatter Stop hook to validate completeness     │  │
│  │     [Create Hook] [Dismiss]                                               │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ DECISION PATTERN INSIGHTS                                                  │  │
│  │                                                                            │  │
│  │  • React selected in 92% of releases (consider making default)            │  │
│  │  • Supabase chosen for auth+db in 78% (consider bundled template)        │  │
│  │  • Mobile strategy overridden by user in 45% of cases                    │  │
│  │  • API pagination decided inconsistently (cursor: 40%, offset: 60%)      │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  [Export Analysis] [Configure Detection Rules] [View All Patterns]              │  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Gap Tracking

```sql
-- Track identified capability gaps
CREATE TABLE forge_capability_gaps (
  id INTEGER PRIMARY KEY,
  project_id TEXT,                    -- NULL for cross-project patterns

  -- Gap classification
  gap_type TEXT NOT NULL CHECK (gap_type IN (
    'command', 'agent', 'skill', 'template', 'hook', 'rule'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Evidence
  pattern_description TEXT,
  evidence_count INTEGER DEFAULT 1,
  evidence_releases JSON,             -- Release IDs where pattern observed

  -- Priority scoring
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  impact_score REAL,                  -- Calculated from evidence

  -- Status
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified',      -- Gap detected
    'acknowledged',    -- User saw it
    'in_progress',     -- Being addressed
    'implemented',     -- Capability created
    'dismissed'        -- User dismissed
  )),

  -- If implemented
  implemented_artifact_id TEXT,       -- Reference to forge_artifacts
  implemented_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Memory Integration

The Planning Decision Layer feeds directly into claude-mem's observation system, creating a rich context for future sessions.

### Decision → Observation Flow

```typescript
// When a decision is made/locked
async function recordDecisionToMemory(decision: PlanningDecision) {
  // Create observation for memory
  await claudeMem.createObservation({
    type: 'decision',
    obs_type: 'planning_decision',
    title: `${decision.phase} decision: ${decision.title}`,
    content: JSON.stringify({
      decision_id: decision.id,
      release_id: decision.release_id,
      category: decision.category,
      value: decision.decision_value,
      score: decision.decision_score,
      alternatives: decision.alternatives,
      rationale: decision.description,
      concept_ids: decision.concept_ids,
      locked: decision.status === 'locked'
    }),
    files_involved: [decision.source_file],
    project_id: decision.project_id
  });

  // If user override, create special observation
  if (decision.status === 'user_override') {
    await claudeMem.createObservation({
      type: 'decision',
      obs_type: 'user_override',
      title: `User overrode ${decision.title}`,
      content: JSON.stringify({
        original: decision.original_value,
        new: decision.decision_value,
        rationale: decision.override_rationale
      }),
      project_id: decision.project_id
    });
  }
}
```

### Context Injection

When starting a new session, the Planning Decision Layer provides context using Claude Code 2.1's `@import` syntax. Project CLAUDE.md files can reference planning context:

```markdown
# Project CLAUDE.md

@.forge/planning-context.md
@.forge/active-decisions.md
```

The Planning Decision Layer auto-generates these importable files:

```markdown
<!-- .forge/planning-context.md (auto-generated) -->

## Planning Context

### Active Release: 9

**Locked Decisions:**
- UI Framework: React + shadcn/ui (DEC-001)
- Authentication: Supabase Auth (DEC-002)
- Database: Supabase PostgreSQL (DEC-003)

**Recent Overrides:**
- Mobile Strategy: Changed from PWA to Responsive Web (DEC-004)
  Rationale: "Team doesn't have PWA expertise"

**Current Phase:** Design (chain-ui-designer active)

**Pending Decisions:**
- Component mapping (DEC-005) - needs review
```

This keeps context modular—agents only load planning context when the `@import` is present, reducing noise for sessions that don't need it.

---

## React Component Architecture

### Planning Dashboard

```tsx
// src/webview/react/components/planning/PlanningDashboard.tsx
import { PipelineTracker } from './PipelineTracker';
import { DecisionExplorer } from './DecisionExplorer';
import { TemplateBrowser } from './TemplateBrowser';
import { DecisionSettingPanel } from './DecisionSettingPanel';
import { CapabilityGaps } from './CapabilityGaps';
import { usePlanningState } from '../hooks/usePlanningState';

export function PlanningDashboard() {
  const { release, pipeline, decisions, templates, gaps } = usePlanningState();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'decisions' | 'templates' | 'gaps'>('pipeline');

  // Show Decision Setting Panel when research is complete but design hasn't started
  const showDecisionSetting = pipeline?.current_phase === 'design' &&
    pipeline?.current_command === 'chain-prototype-researcher' &&
    pipeline?.current_step === 'finalize_pending';

  return (
    <div className="planning-dashboard">
      <header className="planning-header">
        <h1>Planning: Release {release?.id}</h1>
        <span className="pipeline-type">{pipeline?.pipeline_type}</span>
      </header>

      {showDecisionSetting && (
        <DecisionSettingPanel
          decisions={decisions.filter(d => d.phase === 'research')}
          onLock={handleLockDecision}
          onOverride={handleOverrideDecision}
          onContinue={handleContinueToDesign}
        />
      )}

      <nav className="planning-tabs">
        <button onClick={() => setActiveTab('pipeline')} data-active={activeTab === 'pipeline'}>
          Pipeline
        </button>
        <button onClick={() => setActiveTab('decisions')} data-active={activeTab === 'decisions'}>
          Decisions ({decisions.length})
        </button>
        <button onClick={() => setActiveTab('templates')} data-active={activeTab === 'templates'}>
          Templates
        </button>
        <button onClick={() => setActiveTab('gaps')} data-active={activeTab === 'gaps'}>
          Capability Gaps ({gaps.length})
        </button>
      </nav>

      <main className="planning-content">
        {activeTab === 'pipeline' && <PipelineTracker pipeline={pipeline} />}
        {activeTab === 'decisions' && <DecisionExplorer decisions={decisions} />}
        {activeTab === 'templates' && <TemplateBrowser templates={templates} release={release} />}
        {activeTab === 'gaps' && <CapabilityGaps gaps={gaps} />}
      </main>
    </div>
  );
}
```

### Decision Setting Component

```tsx
// src/webview/react/components/planning/DecisionSettingPanel.tsx
interface DecisionSettingPanelProps {
  decisions: PlanningDecision[];
  onLock: (id: string) => void;
  onOverride: (id: string, newValue: string, rationale: string) => void;
  onContinue: () => void;
}

export function DecisionSettingPanel({
  decisions,
  onLock,
  onOverride,
  onContinue
}: DecisionSettingPanelProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [overrideRationales, setOverrideRationales] = useState<Record<string, string>>({});

  const requiredDecisions = decisions.filter(d => d.category !== 'optional');
  const optionalDecisions = decisions.filter(d => d.category === 'optional');

  const allRequiredSet = requiredDecisions.every(d =>
    selectedValues[d.id] || d.decision_value
  );

  return (
    <div className="decision-setting-panel">
      <header>
        <h2>Set Your Decisions</h2>
        <p>Research phase complete. Review recommendations and lock your decisions before design begins.</p>
      </header>

      <section className="required-decisions">
        <h3>Required Decisions</h3>
        {requiredDecisions.map(decision => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            selectedValue={selectedValues[decision.id]}
            onSelect={(value) => setSelectedValues(prev => ({ ...prev, [decision.id]: value }))}
            onLock={() => onLock(decision.id)}
            onOverride={(value, rationale) => onOverride(decision.id, value, rationale)}
          />
        ))}
      </section>

      <section className="optional-decisions">
        <h3>Optional Services</h3>
        {optionalDecisions.map(decision => (
          <OptionalServiceCard
            key={decision.id}
            decision={decision}
            enabled={!!selectedValues[decision.id]}
            onToggle={(enabled) => setSelectedValues(prev => ({
              ...prev,
              [decision.id]: enabled ? decision.decision_value : undefined
            }))}
          />
        ))}
      </section>

      <footer>
        <div className="summary">
          <span>Required: {requiredDecisions.filter(d => selectedValues[d.id] || d.status === 'locked').length} of {requiredDecisions.length}</span>
          <span>Locked: {decisions.filter(d => d.status === 'locked').length}</span>
        </div>
        <div className="actions">
          <button onClick={() => window.location.reload()}>Reset to Recommendations</button>
          <button onClick={onContinue} disabled={!allRequiredSet} className="primary">
            Save & Continue to Design
          </button>
        </div>
      </footer>
    </div>
  );
}
```

---

## API Endpoints

### Planning Endpoints

```typescript
// src/services/worker/http/routes/PlanningRoutes.ts

export function registerPlanningRoutes(app: Express): void {

  // Pipeline state
  app.get('/api/forge/planning/pipeline', async (req, res) => {
    const { project_id, release_id } = req.query;
    const pipeline = await db.query(`
      SELECT * FROM forge_pipeline_state
      WHERE project_id = ? AND release_id = ?
    `, [project_id, release_id]);
    res.json(pipeline[0] || null);
  });

  // Decisions CRUD
  app.get('/api/forge/planning/decisions', async (req, res) => {
    const { project_id, release_id, phase, status, branch_id } = req.query;
    const decisions = await db.query(`
      SELECT d.*,
        (SELECT json_group_array(depends_on_id)
         FROM forge_decision_dependencies
         WHERE decision_id = d.id) as dependencies
      FROM forge_planning_decisions d
      WHERE d.project_id = ?
        AND d.release_id = ?
        AND (? IS NULL OR d.phase = ?)
        AND (? IS NULL OR d.status = ?)
        AND d.branch_id = ?
      ORDER BY d.created_at
    `, [project_id, release_id, phase, phase, status, status, branch_id || 'main']);
    res.json(decisions);
  });

  app.post('/api/forge/planning/decisions/:id/lock', async (req, res) => {
    const { id } = req.params;
    await db.run(`
      UPDATE forge_planning_decisions
      SET status = 'locked', locked_at = CURRENT_TIMESTAMP, locked_by = 'user'
      WHERE id = ?
    `, [id]);

    // Record to memory
    const decision = await db.get('SELECT * FROM forge_planning_decisions WHERE id = ?', [id]);
    await recordDecisionToMemory(decision);

    res.json({ success: true });
  });

  app.post('/api/forge/planning/decisions/:id/override', async (req, res) => {
    const { id } = req.params;
    const { new_value, rationale } = req.body;

    const decision = await db.get('SELECT * FROM forge_planning_decisions WHERE id = ?', [id]);

    await db.run(`
      UPDATE forge_planning_decisions
      SET status = 'user_override',
          original_value = decision_value,
          decision_value = ?,
          override_rationale = ?
      WHERE id = ?
    `, [new_value, rationale, id]);

    // Record override to memory
    await recordDecisionToMemory({ ...decision, status: 'user_override', decision_value: new_value, override_rationale: rationale });

    res.json({ success: true });
  });

  // Templates
  app.get('/api/forge/planning/templates', async (req, res) => {
    const { project_id, release_id } = req.query;
    const templates = await db.query(`
      SELECT * FROM forge_template_usage
      WHERE project_id = ? AND release_id = ?
      ORDER BY template_path
    `, [project_id, release_id]);
    res.json(templates);
  });

  // Capability gaps
  app.get('/api/forge/planning/gaps', async (req, res) => {
    const { project_id, status } = req.query;
    const gaps = await db.query(`
      SELECT * FROM forge_capability_gaps
      WHERE (project_id = ? OR project_id IS NULL)
        AND (? IS NULL OR status = ?)
      ORDER BY priority DESC, impact_score DESC
    `, [project_id, status, status]);
    res.json(gaps);
  });

  app.post('/api/forge/planning/gaps/:id/dismiss', async (req, res) => {
    const { id } = req.params;
    await db.run(`
      UPDATE forge_capability_gaps
      SET status = 'dismissed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    res.json({ success: true });
  });

  // Decision branches
  app.get('/api/forge/planning/branches', async (req, res) => {
    const { project_id, release_id } = req.query;
    const branches = await db.query(`
      SELECT b.*,
        (SELECT COUNT(*) FROM forge_planning_decisions WHERE branch_id = b.id) as decision_count
      FROM forge_decision_branches b
      WHERE project_id = ? AND release_id = ?
    `, [project_id, release_id]);
    res.json(branches);
  });

  app.post('/api/forge/planning/branches', async (req, res) => {
    const { project_id, release_id, name, description } = req.body;
    const id = `branch-${Date.now()}`;

    await db.run(`
      INSERT INTO forge_decision_branches (id, project_id, release_id, name, description)
      VALUES (?, ?, ?, ?, ?)
    `, [id, project_id, release_id, name, description]);

    // Copy current main decisions to new branch
    await db.run(`
      INSERT INTO forge_planning_decisions
        (id, project_id, release_id, agent, phase, category, title, description,
         decision_value, decision_score, alternatives, concept_ids, depends_on,
         source_file, source_line, status, branch_id, created_at)
      SELECT
        id || '-' || ?, project_id, release_id, agent, phase, category, title, description,
        decision_value, decision_score, alternatives, concept_ids, depends_on,
        source_file, source_line, status, ?, created_at
      FROM forge_planning_decisions
      WHERE project_id = ? AND release_id = ? AND branch_id = 'main'
    `, [id, id, project_id, release_id]);

    res.json({ id });
  });
}
```

---

## Implementation Roadmap Update

### Phase 3.5: Planning Decision Layer (Week 3.5-4)

**Goal:** Surface and enable control of planning decisions.

1. Database migrations
   - `forge_pipeline_state` table
   - `forge_planning_decisions` table
   - `forge_decision_dependencies` table
   - `forge_template_usage` table
   - `forge_capability_gaps` table
   - `forge_decision_branches` table

2. Pipeline Tracker component
   - Visual chain progress
   - Phase indicators
   - Real-time updates via WebSocket

3. Decision Explorer component
   - Timeline view of decisions
   - Filtering by agent/phase/status
   - Decision detail view

4. Decision Setting Panel
   - Post-research decision review
   - Lock/override controls
   - Branch creation

5. Template Browser component
   - Template tree by category
   - Usage status per release
   - Completeness tracking

6. Capability Gaps component
   - Pattern detection logic
   - Gap prioritization
   - Create artifact actions

7. Memory integration
   - Decision → Observation flow
   - Context injection at session start

---

## Success Metrics Update

| Metric | Today | Phase 1 | Phase 3 | Phase 3.5 | Phase 5 |
|--------|-------|---------|---------|-----------|---------|
| Planning visibility | None | None | Pipeline only | Full decisions | Full + history |
| Decision control | File editing | File editing | File editing | UI control | UI + branches |
| Template tracking | Manual | Manual | Manual | Automated | Automated |
| Capability gap detection | Manual | Manual | Manual | Semi-auto | Fully auto |
| Brownfield decision inheritance | Manual copy | Manual copy | Manual copy | Visual inherit | Auto-inherit |
| Research → Design handoff | CLI wait | CLI wait | CLI wait | UI approval | UI + branches |

---

## The Vision Extended

v3 completes the picture.

**v1** gave us the ability to see and edit orchestration artifacts visually.

**v2** embedded that into VS Code, added behavior learning, and gave us surgical control over agent changes with Cursor-style review.

**v3** surfaces the *why* behind everything. Why did we choose React? (DEC-001, score 8.5, locked). Why Supabase? (DEC-002, score 9.2, integrates with DEC-003). Why is this issue shaped this way? (Follows from UX decision DEC-003, implements CONCEPT-003).

The Planning Decision Layer transforms chain-* from a series of commands into a **visible, controllable, learnable workflow**. You can:

1. **See** exactly where you are in any chain workflow
2. **Review** every decision made by every agent
3. **Set** your own decisions before design begins
4. **Branch** decision sets to compare approaches
5. **Inherit** decisions in brownfield without re-deciding
6. **Identify** capability gaps from cross-release patterns
7. **Learn** as decisions feed into memory for future context

This isn't just planning visibility. This is **planning mastery**.

---

*"Details matter. It's worth waiting to get it right."*

The chain workflow was already powerful.
Now it's also **transparent**.
Now it's also **controllable**.
Now it's also **intelligent**.

This is **Forge v3**.
