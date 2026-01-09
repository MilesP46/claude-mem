# Forge: The Living Orchestration System

**Date:** 2026-01-07
**Assessment Type:** Vision + Architectural Strategy
**Scope:** Create Forge - a unified system where orchestration artifacts live in a database, relationships are visual, and the system learns how you work

---

## Executive Summary

We're not integrating foreman and claude-mem. We're **creating something new**.

**Forge** is a living orchestration system where commands, agents, skills, and rules are **nodes in a graph**. Where relationships have history. Where the system learns your behaviors and adapts. Where authoring is visual, immediate, and intelligent.

**The Core Vision:**
1. **Database-backed artifacts** - Commands, agents, skills stored in SQLite with relationships
2. **Visual editor** - @ autocomplete, double-click navigation, relationship graphs
3. **Behavior learning** - System observes how you work, stops asking questions
4. **Unified planning** - Greenfield and brownfield flow from the same source
5. **Skills at agent level** - Orchestrators stay lean, agents get superpowers

**See:** [vision-development/vision.md](./vision-development/vision.md) for the complete architectural vision synthesizing v1-v4 evolution:
- **v1:** Visual orchestration (database + relationship graphs)
- **v2:** VS Code integration (terminal observer + agent change review)
- **v3:** Planning decision layer (pipeline tracker + decision explorer)
- **v4:** The Bridge (external terminal ↔ VS Code real-time connection)

This evolution represents a fundamental shift: transforming claude-mem from passive memory into an active orchestration platform where artifacts are alive, decisions are visible, and terminals connect seamlessly to editors

**Critical Decisions Required:**
1. Database-first or file-first architecture?
2. Editor as standalone app or embedded in viewer?
3. Behavior learning scope (project vs cross-project)?
4. Migration strategy for existing foreman artifacts?

---

## Part 1: Integration Architecture Enhancement

### 1.1 Revised Layer Model

**Current (consolidated_integration.md):**
```
Layer 1: Memory (Source of Truth)
Layer 2: Agent (Execution)
Layer 3: Claude-Mem (Intelligence)
```

**Enhanced with Foreman:**
```
+-------------------------------------------------------------------------+
|  LAYER 0: ORCHESTRATION (Foreman Commands)                              |
|  - Workflow coordination (chain-*, duo, standalone)                     |
|  - Context: 100-200 tokens (routing only)                               |
|  - Skills: None (explicit command invocation only)                      |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|  LAYER 1: MEMORY (Hybrid Source of Truth)                               |
|  - CLAUDE.md hierarchy (foreman pattern)                                |
|  - Claude-mem observations (runtime intelligence)                       |
|  - Templates + Instructions (foreman pattern)                           |
|  - Updates: Without CLI restart                                         |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|  LAYER 2: AGENTS (Execution with Skills)                                |
|  - Methodology + variance-critical values (~700 tokens)                 |
|  - Skills available to agents for contextual triggering                 |
|  - Foreman scripts (log-activity, handoff-claude, etc.)                 |
|  - Updates: Requires CLI restart                                        |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|  LAYER 3: INTELLIGENCE (Claude-Mem + Foreman Patterns)                  |
|  - Observations (continuous)                                            |
|  - Variance detection                                                   |
|  - Activity logs (foreman pattern)                                      |
|  - Template-driven output validation                                    |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|  LAYER 4: THE BRIDGE (Terminal ↔ VS Code Integration)                  |
|  - Session Bridge: External terminal session tracking                   |
|  - Change Tracker: Real-time file change capture via PostToolUse hook   |
|  - WebSocket Hub: Multi-client synchronization (< 1s latency)           |
|  - Agent Change Review: Cursor-style inline diffs with Keep/Discard     |
|  - Hunk Processing: AI-summarized diffs (10-word descriptions)          |
|  - Context: Terminal session metadata, file change hunks                |
|  - Updates: Real-time via WebSocket                                     |
+-------------------------------------------------------------------------+
```

**Key Changes:**
- Layer 0 added for explicit orchestration separation
- Skills positioned at Layer 2 (agents), not Layer 0 (orchestrators)
- Foreman patterns (templates, activity logs) integrated at appropriate layers
- Hybrid memory model (CLAUDE.md + observations)

---

### 1.2 Skills Positioning Strategy

**Problem:** consolidated_integration.md doesn't address Skills. possible-skills-foreman-sub-synthesis.md suggests 15 Skills but doesn't clarify orchestrator vs agent usage.

**Solution: Skills for Agents, Not Orchestrators**

```
ORCHESTRATOR (Command)
├── Context: ~150 tokens (routing, WHAT/WHERE/WHY)
├── Skills: NONE (explicit command only)
└── Launches: Agents with appropriate context

AGENT (Specialized Worker)
├── Context: ~700 tokens (methodology + variance-critical)
├── Skills: AVAILABLE (15 Skills for contextual triggering)
│   ├── analyze-error (when agent encounters error)
│   ├── fix-error (when agent needs to fix)
│   ├── restructure (when agent sees >200 LOC file)
│   ├── dead-code (when agent detects unused code)
│   ├── verify-ui (after frontend changes)
│   └── ... (10 more)
└── Output: Delegates to Skills when appropriate
```

**Why This Matters:**
- Orchestrators stay lean (~150 tokens vs 700+ if Skills-aware)
- Agents gain contextual intelligence (trigger Skills based on work context)
- Skills become "agent superpowers" not user commands
- User invokes command → orchestrator routes → agent uses Skills autonomously

**Example:**
```
User: /impact-change "Refactor authentication"
  → impact-change command (orchestrator, no Skills)
    → Launches 5 impact-assessment agents
      → Agent 1 (Backend) encounters >200 LOC file
        → Agent triggers 'restructure' Skill autonomously
      → Agent 2 (Frontend) modifies UI component
        → Agent triggers 'verify-ui' Skill autonomously
      → Agent 3 detects dead code from refactoring
        → Agent triggers 'dead-code' Skill autonomously
```

---

### 1.3 Template System Integration

**Gap:** consolidated_integration.md defines memory patterns but doesn't integrate foreman's template-driven documentation system (32 templates + instructions).

**Integration Strategy:**

```
TEMPLATES AS MEMORY ANCHORS
├── Template Files (foreman/templates/*.md)
│   └── Mustache syntax: {{PLACEHOLDER}}
│
├── Instruction Files (foreman/instructions/*-instructions.md)
│   └── Section-by-section guidance
│
├── CLAUDE.md References
│   └── "@foreman/templates/release-specification-template.md"
│   └── "Follow template structure for consistency"
│
└── Claude-Mem Validation
    └── Observation: "Agent output matches template structure"
    └── Variance: "Agent deviated from template format"
    └── Recommendation: "Update agent to follow template"
```

**Storage Location:**
- Templates: `~/.my_coding/foreman/templates/` (static, version-controlled)
- Instructions: `~/.my_coding/foreman/instructions/` (static)
- CLAUDE.md: Project-local `.claude/CLAUDE.md` (runtime)
- Observations: `~/.claude-mem/claude-mem.db` (runtime)

**Benefits:**
- Template-driven output becomes observable pattern
- Variance detection catches template non-compliance
- CLAUDE.md references templates (single source of truth)
- No template content duplication in agents

---

### 1.4 Activity Logging Unification

**Gap:** Foreman uses `log-activity` script (28+ agents). Claude-mem uses observations. No unification strategy defined.

**Unified Observation Model:**

```typescript
interface UnifiedObservation {
  // Claude-mem core
  session_id: string;
  timestamp: number;
  type: 'tool_use' | 'agent_activity' | 'template_output' | 'variance_detected';

  // Foreman activity log fields
  release_id?: string;
  sprint_id?: string;
  agent_name?: string;
  task_id?: string;
  activity_message: string;

  // Template compliance
  template_used?: string;
  template_compliance: boolean;

  // Variance detection
  variance_type?: 'implementation' | 'placement' | 'template';
  variance_severity?: 'low' | 'medium' | 'high';
}
```

**Implementation:**
- Replace foreman's `log-activity` Bash script with claude-mem observation API
- Agents call: `POST /api/observations/activity` instead of `log-activity`
- Backward compatible: Keep `log-activity` as thin wrapper to API
- Worker processes async, returns immediately (no agent blocking)

**Migration Path:**
1. Create observation API endpoint matching log-activity interface
2. Update foreman agents to use API (or keep Bash wrapper)
3. Deprecate file-based activity logs
4. Unify querying: `mem-search "activity agent:backend-worker"`

---

## Part 2: Component Integration

### 2.1 Memory System Convergence

**Current State:**
- Foreman: Hierarchical CLAUDE.md with depth-scaled limits (100→75→50 lines)
- Claude-mem: Memory validation + staleness detection
- Integration spec: CLAUDE.md as source of truth

**Gaps:**
1. Who owns CLAUDE.md generation? memory-manager agent vs foreman memory-update script
2. How do templates reference CLAUDE.md?
3. Where do cross-cutting dependencies (@path imports) live?
4. How does claude-mem validate CLAUDE.md freshness?

**Unified Memory Architecture:**

```
CLAUDE.md HIERARCHY (Source of Truth)
├── Root CLAUDE.md (≤100 lines, navigation only)
│   ├── Service map (functional areas)
│   ├── Agent routing rules
│   ├── Cross-cutting concerns (references only, no @imports at root)
│   └── Template references: "@foreman/templates/*"
│
├── Subtree CLAUDE.md (≤150 lines, scaled by depth)
│   ├── File ownership map
│   ├── Shared utilities (DRY enforcement)
│   ├── Module boundaries
│   ├── Extension vs creation guidance
│   ├── Patterns (implementation guidance)
│   ├── Dependencies: @path imports to cross-cutting
│   └── Template references: Relevant templates for this area
│
└── Generation & Validation
    ├── Generator: memory-manager agent (authoritative)
    ├── Trigger: /manage-memory command
    ├── Validator: claude-mem staleness detection
    ├── Observations: Track CLAUDE.md reads/updates
    └── Variance: Detect when implementations diverge from memory
```

**Authoritative Decision:**
- **memory-manager agent** is authoritative for CLAUDE.md generation
- **foreman memory-update script** DEPRECATED, replaced by memory-manager
- **claude-mem observations** validate memory accuracy continuously
- **Staleness detection** triggers memory-manager when drift detected

---

### 2.2 GitHub Integration Enhancement

**Current Integration Spec:** GitHub sync service with webhook + polling, 80% token savings.

**Foreman Enhancement:** Foreman uses `gh` CLI extensively (chain-issue-creator, chain-send-issues, reviewerpr). Integration spec doesn't address this.

**Enhanced GitHub Strategy:**

```
GITHUB INTEGRATION (Hybrid)
├── Primary: GitHub Sync Service (webhook + polling)
│   └── For: Issue fetching, comment retrieval, PR status
│   └── Benefits: 80% token savings, instant updates
│
├── Secondary: GH CLI (direct, transactional)
│   └── For: Issue creation, PR merging, label updates
│   └── Benefits: Atomic operations, error handling
│   └── Cache update: Trigger webhook after GH CLI operation
│
└── Observation Layer
    └── Track: All GitHub operations (read + write)
    └── Validate: Cache consistency
    └── Alert: Webhook failures, cache misses
```

**Implementation:**
- Agents use GH CLI for writes (chain-issue-creator, reviewerpr)
- Agents use sync service API for reads (get issue context)
- After GH CLI write, POST to `/api/github/cache/invalidate/:issue`
- Worker refetches from GitHub, updates cache, notifies observers

**Token Savings:**
- Reads: 80% savings (sync service)
- Writes: 0% savings (direct, but infrequent)
- Net: ~70% savings overall (reads >> writes)

---

### 2.3 Skills Distribution Strategy

**From possible-skills-foreman-sub-synthesis.md:** 15 Skills recommended, tiered by priority.

**Distribution by Context:**

```
TOP-LEVEL (User Interaction)
├── Orchestration Commands (7 slash commands)
│   ├── /chain-plan-design-green
│   ├── /chain-issue
│   ├── /impact-change
│   └── ... (4 more)
└── Skills: NONE at this level

AGENT-LEVEL (Autonomous Agents)
├── Analysis Skills (read-only, safe)
│   ├── analyze-error → Used by: troubleshooting-investigator
│   ├── dead-code → Used by: dead-code-reviewer
│   └── explore → Used by: impact-assessment agents
│
├── Fix Skills (modify code, test-verified)
│   ├── fix-error → Used by: surgical-fixes
│   ├── fix-git-errors → Used by: git-error-fixer
│   ├── fix-ui-bug → Used by: vite-frontend-fix
│   └── troubleshoot-tests → Used by: troubleshooting-investigator
│
├── Workflow Skills (orchestration support)
│   ├── restructure → Used by: code-restructurer
│   ├── verify-ui → Used by: verify-ui agent
│   └── surgical-edit → Used by: surgical-edits
│
└── Utility Skills (maintenance)
    ├── update-memory → Used by: memory-manager
    ├── update-docs → Used by: documentation-updater
    └── apply-chore → Used by: chore-refactorer
```

**Agent Skill Awareness:**
- Agents include frontmatter: `available_skills: [analyze-error, fix-error, restructure]`
- When agent encounters skill trigger context, invokes Skill tool
- Orchestrator remains unaware of Skills (keeps context low)

**Example Agent Enhancement:**

```markdown
---
name: backend-worker
model: opus
tools: [Read, Write, Edit, Bash, Glob, Grep]
available_skills: [analyze-error, fix-error, restructure, dead-code]
---

# Backend Worker Agent

## Methodology
[existing methodology]

## Skill Usage
- **analyze-error**: When encountering unexpected errors during implementation
- **restructure**: When file exceeds 200 LOC during implementation
- **dead-code**: After refactoring, check for orphaned code
- **fix-error**: When tests fail, delegate to fix-error Skill

## Work Protocol
[existing protocol, now with Skills available]
```

---

### 2.4 Parallel Execution Coordination

**Foreman Pattern:** Commands launch 3-7 agents in parallel for complex analysis (error-explorer, impact-assessment, dead-code-review).

**Integration Gap:** consolidated_integration.md doesn't address how parallel agents coordinate through claude-mem worker.

**Coordination Strategy:**

```
PARALLEL AGENT COORDINATION
├── Orchestrator (Command)
│   └── Launches: N agents via Task tool (single message, parallel)
│
├── Claude-Mem Worker (Coordinator)
│   ├── Session hierarchy: Tracks parent → children relationships
│   ├── Observation streams: Per-agent observations in real-time
│   ├── Synthesis trigger: When all children complete
│   └── Context assembly: Aggregate findings for next phase
│
└── Synthesis Agent (Post-Processing)
    ├── Reads: All agent observations
    ├── Merges: Findings into unified _index.md
    ├── Validates: Template compliance
    └── Outputs: Single coherent document
```

**Implementation:**
- Command creates root session, launches children
- Each agent reports to worker: `POST /api/observations/agent-complete`
- Worker tracks completion: `SELECT COUNT(*) FROM session_hierarchy WHERE parent = ? AND status = 'complete'`
- When all complete, worker notifies orchestrator: `GET /api/orchestration/synthesis-ready`
- Orchestrator launches synthesis agent with context: All child observations

**Benefits:**
- Parallel execution preserved (foreman strength)
- Observations captured per agent (claude-mem strength)
- Synthesis phase leverages accumulated intelligence
- No context duplication (each agent sees only its scope)

---

## Part 3: Workflow Integration

### 3.1 TDD Enforcement Integration

**Foreman Pattern:** test-manager agent creates failing tests before implementation (TDD RED phase).

**Integration Gap:** consolidated_integration.md doesn't mention test-manager or TDD enforcement.

**TDD Integration:**

```
CHAIN-ISSUE WORKFLOW (Enhanced)
├── Step 1: chain-issue-updater
│   └── Reads GitHub issue, creates development plan
│
├── Step 2: test-manager (RED Phase) ← MISSING FROM INTEGRATION SPEC
│   └── Creates failing tests (preflight mode)
│   └── Validates: Tests fail with NotImplementedError
│   └── Observation: "Test baseline established for issue #N"
│
├── Step 3: Parent agents + workers (GREEN Phase)
│   └── Implement functionality to pass tests
│   └── Skills available: analyze-error, fix-error, restructure
│   └── Observation: "Implementation passes tests for issue #N"
│
├── Step 4: code-restructurer (REFACTOR Phase)
│   └── Optimize while maintaining test passage
│   └── Skill: restructure (if files >200 LOC)
│   └── Observation: "Refactored within LOC limits"
│
└── Step 5: reviewerpr (Review)
    └── Sandy Metz-style review
    └── Observation: "PR approved with OO design compliance"
```

**Claude-Mem Enhancement:**
- Observation type: `tdd_phase` (red/green/refactor)
- Variance detection: "Agent skipped RED phase" (alert)
- Template validation: Test files match test-organization.mdc
- Staleness: "Tests haven't run in N commits" (trigger test-manager)

---

### 3.2 ConceptID Traceability

**Foreman Pattern:** CONCEPT-XXX IDs link concepts → specs → flows → components → issues.

**Integration Gap:** consolidated_integration.md doesn't preserve this traceability.

**Traceability Integration:**

```
CONCEPTID LAYER (New)
├── Concept Generation (chain-concept-gen)
│   └── Creates: CONCEPT-001, CONCEPT-002, ...
│   └── Stored in: concept-qa-documentation.md
│
├── Release Specification (chain-plan-init)
│   └── Maps: Features → Concepts
│   └── Format: "Implements: CONCEPT-001, CONCEPT-003"
│
├── User Flows (chain-ux-researcher)
│   └── Maps: Flows → Concepts
│   └── Format: "Implements Concepts: CONCEPT-001"
│
├── Components (chain-ui-designer)
│   └── Maps: Components → Concepts
│   └── Format: "Supports Concepts: CONCEPT-001, CONCEPT-002"
│
├── Issues (chain-issue-builder)
│   └── Maps: Issues → Concepts
│   └── Format: "Delivers Concepts: CONCEPT-001"
│
└── Claude-Mem Observations
    ├── Query: "What implements CONCEPT-001?"
    ├── Timeline: Concept creation → implementation → PR → deployment
    └── Variance: "Issue implemented features not in original concept"
```

**Implementation:**
- Add `concept_ids: string[]` to observations
- Index on concept_ids for fast querying
- Timeline view: Show all observations for a concept
- Validation: Detect when implementation diverges from concept

---

### 3.3 Impact Change Flow Enhancement

**Current Spec:** 6-phase impact-change workflow (assessment → gap → approval → implementation → verification → summary).

**Foreman Enhancement:** Include dead code detection (Phase 2.5), template validation, TDD enforcement.

**Enhanced Flow:**

```
IMPACT-CHANGE (Enhanced with Foreman + Skills)
├── Phase 1: Assessment (3-7 parallel agents)
│   └── Agents use: explore Skill (codebase understanding)
│   └── Observation: Per-agent findings
│   └── Synthesis: Unified _index.md (template: impact-assessment-qrg-format.md)
│
├── Phase 2: Gap Analysis
│   └── Validate: gap-analysis-checklist.md
│   └── Fill gaps: Minimal, natural edits
│
├── Phase 2.5: Dead Code Detection (NEW)
│   └── Agent uses: dead-code Skill
│   └── Output: "Dead Code to Remove" section in _index.md
│   └── Observation: "N files/functions marked for removal"
│
├── Phase 3: User Approval
│   └── Present: Assessment + dead code findings
│   └── Gate: Explicit approval required
│
├── Phase 4: Implementation (Sequential: Backend → Frontend)
│   └── surgical-edits agents
│   └── Skills available: fix-error, restructure, analyze-error
│   └── TDD: test-manager creates tests first (if new features)
│   └── Observation: Per-file modifications
│
├── Phase 5: UI Verification (Conditional)
│   └── verify-ui agent (if frontend changes)
│   └── Skill: verify-ui (Playwright-based)
│   └── Observation: "UI flows verified: login, checkout, ..."
│
└── Phase 6: Summary
    └── Template: impact-change-summary-template.md (NEW)
    └── ConceptID: Link to original concepts (if release work)
    └── Observation: Complete change documentation
```

---

## Part 4: Implementation Priorities

### 4.1 Critical Path (Must Have)

**Priority 1: Core Integration**
1. Unified observation model (activity logs → observations)
2. Memory convergence (memory-manager as authoritative)
3. Template system integration (CLAUDE.md references templates)
4. Skills positioning (agents, not orchestrators)
5. GitHub enhancement (sync service + gh CLI)

**Priority 2: Workflow Enhancements**
6. TDD enforcement integration (test-manager in chain-issue)
7. ConceptID traceability (observations indexed by concept)
8. Parallel coordination (worker tracks session hierarchy)
9. Dead code detection (Phase 2.5 in impact-change)
10. Template validation (claude-mem observes compliance)

**Priority 2.5: The Bridge (Must Have for v1)**

The Bridge connects external terminal execution to VS Code change review - the killer feature that makes Forge feel magical.

- [ ] 11a. **Database schema for sessions and changes**
  - Tables: forge_sessions (session hierarchy), forge_changes (file hunks)
  - Migration: migration008 includes session/change tables
  - Dependencies: None (foundational)

- [ ] 11b. **Session bridge infrastructure (terminal → worker)**
  - Service: SessionBridge.ts manages session lifecycle
  - Hook enhancement: SessionStart registers terminal sessions
  - API: POST /api/v2/forge/sessions/register
  - Dependencies: Database schema (11a)

- [ ] 11c. **PostToolUse hook enhancement (change capture)**
  - Hook: PostToolUse captures before/after content on Edit/Write
  - Service: ChangeTracker.ts stores file hunks
  - Processing: HunkProcessor.ts parses unified diffs
  - Dependencies: Session bridge (11b)

- [ ] 11d. **WebSocket hub (real-time broadcasting)**
  - Service: WebSocketHub.ts extends SSEBroadcaster
  - Protocol: JSON events (terminal-output, file-change, agent-status)
  - Latency target: < 100ms from tool use to VS Code notification
  - Dependencies: Change capture (11c)

- [ ] 11e. **VS Code agent change decorations (inline diffs)**
  - Provider: AgentChangeDecorationProvider.ts
  - UI: Green background for additions, red for deletions, agent icon in gutter
  - Hover: Session info, agent name, 10-word hunk summary
  - Dependencies: WebSocket hub (11d)

- [ ] 11f. **CodeLens Keep/Discard actions**
  - Provider: AgentChangeCodeLensProvider.ts
  - UI: "Keep" / "Discard" buttons above each hunk
  - Action: Keep marks accepted, Discard reverts hunk
  - Dependencies: Agent change decorations (11e)

**Timeline:** 4-5 weeks (parallel with Phase 3: Planning Layer backend work)
**Risk:** HIGH - New architecture, VS Code API learning curve, WebSocket stability
**Success Criteria:** Sub-second latency, >95% change attribution accuracy, >85% hunk acceptance rate

---

### 4.2 High Value (Should Have)

**Priority 3: Intelligence Layer**
11. Variance detection for templates (not just implementation)
12. Staleness alerts for CLAUDE.md (trigger memory-manager)
13. Specialist triggers based on foreman patterns
14. Activity log querying via mem-search
15. Skills usage analytics (which agents use which Skills)

**Priority 4: Developer Experience**
16. Skills catalog in docs/skills/
17. Template browser UI (view all templates)
18. ConceptID timeline view (trace concept → code)
19. Agent skill usage dashboard (which Skills triggered when)
20. Unified CLI: `foreman` command (replaces scattered scripts)

---

### 4.3 Nice to Have (Could Have)

**Priority 5: Advanced Features**
21. Auto-template selection (claude-mem recommends template)
22. Cross-project ConceptID tracking (shared concepts)
23. Template versioning (track changes over time)
24. Agent performance analytics (avg tokens, success rate)
25. Skills marketplace (share custom Skills)

---

## Part 5: Migration Strategy

### 5.1 Phased Rollout

**Phase 1: Foundation (Weeks 1-2)**
- Create unified observation API
- Integrate memory-manager as authoritative
- Position Skills at agent layer
- Update 5 core agents with Skills awareness

**Phase 2: Workflows (Weeks 3-4)**
- Enhance chain-issue with TDD enforcement
- Add ConceptID tracking to observations
- Integrate dead code detection in impact-change
- Test parallel coordination with worker

**Phase 3: Intelligence (Weeks 5-6)**
- Implement template validation
- Add staleness detection for CLAUDE.md
- Create variance detection for templates
- Build Skills usage analytics

**Phase 4: Polish (Weeks 7-8)**
- Create Skills catalog documentation
- Build ConceptID timeline view
- Develop template browser UI
- Consolidate CLI commands into unified `foreman` tool

---

### 5.2 Backward Compatibility

**Preserve During Migration:**
- Foreman slash commands continue working
- log-activity script remains (as API wrapper)
- Existing CLAUDE.md files respected
- gh CLI usage patterns unchanged
- Template files at ~/.my_coding/foreman/templates/

**Deprecate Gracefully:**
- foreman memory-update script → memory-manager agent
- File-based activity logs → observations API
- Hardcoded template content in agents → CLAUDE.md references

**New Patterns:**
- Skills available to agents (opt-in per agent)
- Unified observation API (new, coexists with old)
- ConceptID tracking (additive)

---

## Part 6: Risks and Mitigations

### 6.1 Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Skills trigger unexpectedly at orchestrator level | High | Medium | Position Skills at agent layer only, explicit guard |
| Template system conflicts with lean agent model | Medium | Medium | Templates referenced in CLAUDE.md, not embedded in agents |
| log-activity → observations breaks existing workflows | High | Low | Keep log-activity as API wrapper, phased migration |
| Parallel agents overwhelm worker | Medium | Low | Worker thread pool + queuing, rate limiting |
| Memory-manager conflicts with user CLAUDE.md edits | Medium | Medium | Git-aware updates, user edits preserved, conflicts reported |
| ConceptID queries slow with large observation count | Low | High | Index on concept_ids, materialized views for timeline |

---

### 6.2 Mitigation Details

**Skills Guard (Orchestrator Protection):**
```typescript
// In orchestrator frontmatter
---
name: chain-issue
available_skills: []  # Explicitly empty
block_skills: true    # Guard against accidental Skills usage
---
```

**Template Reference Pattern:**
```markdown
# In subtree CLAUDE.md
## Template References
When creating release specifications, use:
- @foreman/templates/release-specification-template.md
- Follow: @foreman/instructions/release-specification-template-instructions.md

Do NOT embed template content in agents. Reference templates via @foreman/ paths.
```

**log-activity Wrapper (Backward Compatible):**
```bash
#!/usr/bin/env node
// ~/.my_coding/foreman/scripts/log-activity.cjs
const args = process.argv.slice(2);
await fetch('http://localhost:37777/api/observations/activity', {
  method: 'POST',
  body: JSON.stringify(parseLogActivity(args))
});
```

---

## Part 7: The Real Questions

### 7.1 Architectural Decisions

**Q1: Data Model**
Where do artifacts live?
- [ ] **Option A (Recommended):** Database-first with file sync
  - Artifacts stored in `~/.claude-mem/forge.db`
  - Bidirectional sync to `.claude/` for CLI compatibility
  - Editor reads/writes to database
  - Relationships tracked in database
- [ ] Option B: File-first with database indexing
  - Artifacts stay in `.claude/` as files
  - Database indexes relationships and execution history
  - Less disruptive but less powerful

**Q2: Editor Architecture**
How do we build the visual editor?
- [ ] **Option A (Recommended):** Embedded in viewer
  - Extend existing React viewer UI
  - New route: `/editor` or `/forge`
  - Reuse authentication, theming, API layer
- [ ] Option B: Standalone Electron app
  - Full desktop experience
  - Offline support
  - But: separate codebase, maintenance burden

**Q3: Behavior Learning Scope**
What does the system learn?
- [ ] **Option A (Recommended):** Project-scoped
  - Behaviors learned per-project
  - No cross-project bleed
  - CLAUDE.md is project-specific anyway
- [ ] Option B: Cross-project with project override
  - Global preferences (commit style, test strategy)
  - Per-project overrides
  - More complex, more powerful

**Q4: Planning Unification**
How do greenfield and brownfield merge?
- [ ] **Option A (Recommended):** Single entry point with detection
  - `/forge-plan` detects intent
  - Greenfield: No release → full chain
  - Brownfield: Has release → scope chain
  - Research cache shared
- [ ] Option B: Separate commands with shared phases
  - `/forge-greenfield` and `/forge-brownfield`
  - Both use same design/architecture/issue agents
  - Clearer intent, less magic

---

### 7.2 Implementation Scope

**Q5: MVP Definition**
What ships first?
- [ ] **Option A (Recommended):** Database + Core Editor
  - Phase 1: Database tables, file sync
  - Phase 2: Artifact tree, content editor
  - Phase 3: @ autocomplete, relationship detection
  - Phase 4: Basic behavior learning
  - Timeline: 3-4 weeks
- [ ] Option B: Full Vision
  - All editor features
  - Complete behavior learning
  - Unified planning
  - Living CLAUDE.md
  - Timeline: 6-8 weeks
- [ ] Option C: Minimal Foundation
  - Database only (no editor)
  - API for artifact management
  - Let CLI do the editing
  - Timeline: 1-2 weeks

**Q6: Naming Convention**
How do we name Forge artifacts?
- [ ] **Option A (Recommended):** `forge-` prefix
  - Commands: `/forge-issue`, `/forge-impact`
  - Agents: `forge-backend-worker`
  - Skills: `forge-analyze-error`
  - Clear separation from personal foreman
- [ ] Option B: No prefix, project isolation
  - Commands: `/issue`, `/impact`
  - Rely on project-level `.claude/` isolation
  - Cleaner but risky if foreman installed

---

### 7.3 Technical Decisions

**Q7: Relationship Detection**
How do we build the graph?
- [ ] **Option A (Recommended):** Hybrid detection
  - Explicit: Parse `@type/name` references in content
  - Inferred: Track Task tool invocations at runtime
  - Manual: Allow user-created relationships in editor
- [ ] Option B: Explicit only
  - Require `@type/name` syntax
  - No inference
  - Simpler but less magical

**Q8: Skills at Agent Level**
How do agents know about Skills?
- [ ] **Option A (Recommended):** Frontmatter declaration
  ```yaml
  ---
  name: forge-backend-worker
  available_skills: [forge-analyze-error, forge-restructure]
  ---
  ```
  - Agent can invoke any declared Skill
  - Orchestrator has `available_skills: []` (blocked)
- [ ] Option B: Universal Skills
  - All agents see all Skills
  - Risk: wrong agent triggers wrong Skill
- [ ] Option C: Skill-triggered invocation
  - Skills declare "I work with these agents"
  - Reverse dependency direction

**Q9: Behavior Storage**
Where do learned behaviors live?
- [ ] **Option A (Recommended):** Database + CLAUDE.md sync
  - Primary: `forge_behaviors` table
  - Generated: CLAUDE.md "Learned Behaviors" section
  - User can override via CLAUDE.md edits
- [ ] Option B: CLAUDE.md only
  - Write behaviors directly to CLAUDE.md
  - Simpler but less queryable

**Q10: Research Cache**
How long does greenfield research persist?
- [ ] **Option A (Recommended):** Release-scoped
  - Cache lives with release
  - Brownfield on same release reuses cache
  - New release starts fresh (or can import)
- [ ] Option B: Project-scoped
  - Single cache per project
  - Always available for brownfield
  - Risk: stale recommendations

---

**Q11: Bridge Architecture**

How do we capture changes from external terminals and broadcast to VS Code?

- [ ] **Option A (Recommended): PostToolUse Hook + WebSocket**
  - **Pro:** Captures changes at tool use boundary (Edit/Write), terminal-agnostic
  - **Pro:** Real-time push to VS Code via WebSocket (sub-second latency)
  - **Pro:** Full session attribution (which agent, which issue, which terminal)
  - **Con:** Requires hook enhancement, WebSocket infrastructure
  - **Implementation:** Enhanced PostToolUse hook captures before/after file content, worker processes to hunks, WebSocket broadcasts to connected clients (VS Code extension, browser UI)

- [ ] **Option B: File System Watcher**
  - **Pro:** Simpler to implement (fs.watch on .claude/, src/, etc.)
  - **Con:** Higher latency (polling delay, race conditions)
  - **Con:** No session attribution (can't distinguish user edit vs Claude edit)
  - **Con:** Requires heuristics to guess which agent made change
  - **Implementation:** Worker watches file system, detects changes, attempts to correlate with recent sessions

**Recommendation:** Option A - The Bridge's value proposition is real-time attribution. Without knowing *which agent in which session made which change*, we lose the core UX benefit (Cursor-style review with context).

---

**Q12: Change Review Granularity**

How granular should the change review interface be?

- [ ] **Option A (Recommended): Per-Hunk Keep/Discard**
  - **Pro:** Surgical control (accept function signature, reject implementation)
  - **Pro:** Matches Cursor UX paradigm (users already familiar)
  - **Pro:** Enables learning (high acceptance rate → agent improving)
  - **Con:** More complex UI (CodeLens above each hunk, inline decorations)
  - **Implementation:** Unified diff parser → hunks, CodeLens provider shows Keep/Discard buttons above each hunk, gutter decorations show agent avatar + summary on hover

- [ ] **Option B: Per-File Accept/Reject**
  - **Pro:** Simpler UI (file-level badge, single action)
  - **Con:** All-or-nothing control (can't accept some changes, reject others)
  - **Con:** Misses learning opportunity (can't identify which parts of agent output are good)
  - **Implementation:** File badge shows "Agent changed this file", single Accept/Reject action

**Recommendation:** Option A - The effort to implement per-hunk review is justified by the superior UX and learning potential. If users can surgically accept/reject, we learn *what kinds of changes agents make well* vs *what needs improvement*.

---

## Part 8: Success Criteria

### 8.1 Measurable Outcomes

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Context Load** | | | |
| Orchestrator tokens | N/A | <200 | Via session tracking |
| Agent tokens (lean) | N/A | <1000 | Via session tracking |
| Memory load (per area) | N/A | <150 | CLAUDE.md line count |
| **Execution Efficiency** | | | |
| Parallel agent speedup | N/A | 3-5x | Wall clock time vs sequential |
| GitHub operation savings | 0% | 70% | Token count before/after |
| Template compliance | N/A | >95% | Validation observations |
| **Quality Metrics** | | | |
| Implementation variance | N/A | <5% | Variance detection observations |
| Placement variance | N/A | <5% | DRY enforcement observations |
| Test coverage | N/A | >90% | test-manager enforcement |
| **Intelligence** | | | |
| Staleness detection accuracy | N/A | >80% | Alert true positive rate |
| Specialist trigger accuracy | N/A | >90% | Recommendation acceptance rate |
| Skills usage relevance | N/A | >85% | Agent feedback + outcomes |

### Bridge-Specific Metrics

| Metric | Baseline | Target | Critical Threshold | Measurement Method |
|--------|----------|--------|-------------------|-------------------|
| **Performance** | | | | |
| Terminal → VS Code latency | N/A | <1s | >3s (fail) | Per-change timestamp tracking |
| PostToolUse hook execution time | <100ms | <150ms | >500ms (fail) | Hook instrumentation |
| WebSocket message delivery time | N/A | <50ms | >200ms (fail) | WebSocket ping/pong |
| **Accuracy** | | | | |
| Change attribution accuracy | N/A | >95% | <85% (fail) | Manual validation on test sessions |
| Hunk summary quality | N/A | >4/5 | <3/5 (fail) | User ratings |
| **Adoption** | | | | |
| Hunk acceptance rate | N/A | >85% | <60% (warning) | Keep vs Discard ratio |
| Review workflow adoption | 0% | >75% | <50% (warning) | VS Code users with extension enabled |
| External terminal usage | 0% | >60% | <30% (warning) | Sessions from external terminals vs integrated |

---

### 8.2 Qualitative Outcomes

**Developer Experience:**
- [ ] Natural language triggers work (Skills at agent level)
- [ ] Template-driven output is consistent
- [ ] ConceptID traceability enables quick navigation
- [ ] CLAUDE.md provides sufficient context
- [ ] Activity logs queryable via mem-search

**System Reliability:**
- [ ] Parallel agents coordinate without conflicts
- [ ] Memory updates preserve user edits
- [ ] GitHub cache stays synchronized
- [ ] Skills don't trigger unexpectedly
- [ ] TDD enforcement prevents regression

**Maintenance:**
- [ ] Single source of truth for memory (CLAUDE.md)
- [ ] Template changes propagate automatically
- [ ] Variance detection catches drift early
- [ ] Staleness alerts trigger timely updates
- [ ] Unified CLI reduces script sprawl

---

## Part 9: Next Steps After Approval

### 9.1 Immediate Actions (Day 1)

1. **Create assessment folder structure:**
   ```bash
   mkdir -p foreman/impact_assessment/2026-01-07-foreman-integration/{backend,frontend,worker,intelligence,integration}
   ```

2. **Launch 5 parallel impact-assessment agents** with focus areas:
   - Agent 1 (Backend): Worker API enhancements, observation model
   - Agent 2 (Frontend): Viewer UI updates for ConceptID timeline, template browser
   - Agent 3 (Worker): Parallel coordination, session hierarchy
   - Agent 4 (Intelligence): Variance detection, staleness alerts, template validation
   - Agent 5 (Integration): Skills positioning, GitHub hybrid, memory convergence

3. **Each agent produces:** `[NN]-[focus]-findings.md` in assessment folder

4. **Synthesis:** Unified `_index.md` following impact-assessment-qrg-format.md

---

### 9.2 Post-Assessment Actions

5. **Gap analysis** using gap-analysis-checklist.md
6. **User approval** gate before implementation
7. **Implementation** via surgical-edits agents (sequential phases)
8. **Verification** via test suite + UI verification
9. **Documentation** updates across both foreman and claude-mem
10. **Migration guide** for existing foreman users

---

## Appendix A: Architecture Diagrams

### A.1 Skills Flow

```
USER REQUEST
     |
     v
ORCHESTRATOR (Command)
     |
     +-- Context: ~150 tokens (WHAT/WHERE/WHY)
     +-- Skills: NONE (blocked)
     +-- Launches: AGENT
             |
             v
        AGENT (Specialized)
             |
             +-- Context: ~700 tokens (methodology + variance)
             +-- Skills: 15 available
             +-- Encounters: >200 LOC file during work
             +-- Triggers: restructure Skill
                     |
                     v
                RESTRUCTURE SKILL
                     |
                     +-- Launches: code-restructurer agent
                     +-- Validates: Tests pass after restructure
                     +-- Returns: Control to parent agent
```

### A.2 Memory Convergence

```
FOREMAN TEMPLATES (Static)
~/.my_coding/foreman/templates/*.md
         |
         v
    CLAUDE.md (Runtime Reference)
    .claude/CLAUDE.md
         |
         +-- "@foreman/templates/release-specification-template.md"
         +-- "Follow template structure"
         |
         v
    AGENT (Reads Memory)
    backend-worker agent
         |
         +-- Reads: CLAUDE.md for template reference
         +-- Uses: Template from ~/.my_coding/foreman/templates/
         +-- Produces: release-specification.md
         |
         v
    CLAUDE-MEM OBSERVATION
         |
         +-- Validates: Output matches template structure
         +-- Detects: Variance if structure differs
         +-- Recommends: "Update agent" or "Update template"
```

### A.3 Unified Activity Flow

```
AGENT EXECUTES WORK
      |
      v
POST /api/observations/activity
      |
      +-- Body: { release_id, sprint_id, agent_name, message }
      +-- Returns: Immediately (async processing)
      |
      v
CLAUDE-MEM WORKER
      |
      +-- Stores: Observation in sqlite
      +-- Indexes: By release_id, agent_name, concept_ids
      +-- Updates: Vector embeddings (Chroma)
      |
      v
QUERY VIA MEM-SEARCH
      |
      +-- "activity agent:backend-worker release:1"
      +-- Returns: All backend-worker activities for release 1
```

---

## Appendix B: File Structure

### B.1 Integrated Directory Structure

```
~/.my_coding/foreman/
├── commands/              # 24 command files (no changes)
├── agents/                # 44 agent files (add Skills awareness)
├── rules/                 # 8 .mdc files (no changes)
├── instructions/          # 40+ instruction files (no changes)
├── templates/             # 32 templates (no changes, referenced by CLAUDE.md)
└── scripts/               # 12 scripts (log-activity becomes API wrapper)

~/.claude-mem/
├── claude-mem.db          # SQLite with unified observations
├── chroma/                # Vector embeddings
└── settings.json          # Config (includes foreman integration flags)

~/.claude/
├── agents/                # Agents (copied from foreman, Skills-aware)
├── commands/              # Commands (copied from foreman)
└── skills/                # 15 Skills (new, for agents)

PROJECT/.claude/
├── CLAUDE.md              # Root (navigation, references @foreman/templates/)
└── [subtrees]/CLAUDE.md   # Subtrees (detail, @path imports, template refs)
```

---

## Appendix C: Recommended Reading Order

1. **This document** (_needs.md) - Start here for overview
2. **consolidated_integration.md** - Original integration spec
3. **foreman-sub-synthesis.md** - Foreman capabilities
4. **possible-skills-foreman-sub-synthesis.md** - Skills analysis
5. **[After approval]** Impact assessment findings (5 agent reports)
6. **[After assessment]** _index.md synthesis
7. **[After approval]** Implementation plan

---

## Summary

This assessment reveals that foreman and claude-mem are highly complementary but require careful integration of:

1. **Skills at agent level** (not orchestrator) for context efficiency
2. **Template system** integrated via CLAUDE.md references
3. **Unified observations** replacing log-activity files
4. **Memory convergence** with memory-manager as authority
5. **GitHub hybrid** (sync service + gh CLI)
6. **TDD enforcement** via test-manager in workflows
7. **ConceptID traceability** enabling concept → code navigation
8. **Parallel coordination** via worker session hierarchy

The enhanced architecture preserves foreman's strengths (orchestration, templates, TDD) while leveraging claude-mem's intelligence (observations, variance detection, staleness alerts, memory validation).

**Recommended MVP:** Foundation + Core Workflows (Priorities 1-10), targeting 2-week implementation after approval.

**Approval Required:** 10 strategic decisions (Q1-Q10) before launching impact-assessment agents.
