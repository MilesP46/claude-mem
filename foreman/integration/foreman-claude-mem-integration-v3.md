# Foreman + Claude-Mem Integration Specification v3

## Executive Summary

This document specifies how claude-mem enhances foreman's existing orchestration system. Claude-mem does NOT replace foreman's agent-command architecture; it provides persistent memory that makes foreman's existing patterns more intelligent over time.

**Core Insight**: Foreman orchestrates development through GitHub issues → agent sequences → command-agent duos. Claude-mem captures patterns from this orchestration and uses them to:
1. Reduce context window bloat by persisting context locally
2. Enable automatic duo creation based on detected patterns
3. Pre-digest rules/instructions for instant injection based on issue labels
4. Refine project-level agents based on accumulated observations

---

## Part 1: Understanding What Exists

### 1.1 Foreman's Current Architecture

**Personal Level** (`~/.claude/` via `.my_coding/`):
- Agents: Reusable patterns (backend-architect, frontend-developer, etc.)
- Commands: Slash commands that orchestrate agents
- Instructions: Templates and standards
- Rules: MDC convention files

**Project Level** (`.claude/` in each project):
- Agents: Project-specific implementations
- Commands: Project-specific workflows

### 1.2 The Chain-Issue Workflow (Source of Truth)

```
/chain-issue 42
    ↓
GitHub Issue #42 (source of truth)
    ↓
chain-issue-updater → Creates context comments on GitHub
    ↓
Agent sequence from issue-042.yaml:
  - backend-architect (setup)
  - frontend-developer (implementation)
  - test-manager (validation)
    ↓
Each agent reads GitHub comments for context
    ↓
Post-implementation: ReviewerPR → merge → close
```

**Current Pain Point**: Every agent re-reads GitHub comments. Context grows with each cycle.

### 1.3 Issue YAML Structure

```yaml
# issue-042.yaml (4-tier structure)
sequence_number: "042"
title: "Add user preferences API"
type: feat
priority: P1
status: todo
area: api
phase: dev

scope:
  problem: "Users cannot save preferences"
  non_goals: ["Admin preferences", "Bulk operations"]

acceptance_criteria:
  - given: "Authenticated user"
    when: "POST /api/preferences"
    then: "Preferences saved to database"

workflow:
  parallel_execution: false
  capability_block: "user-management"

agents:
  required_agents:
    - agent: backend-architect
      role: implementer
      execution_phase: setup
      folders:
        primary: ["src/api/", "src/services/"]
        excluded: ["src/ui/"]
      globals:
        error_handling: "structured-errors"
        logging_system: "pino"
```

### 1.4 Command-Agent-Duo Creation (Currently Manual)

```bash
/create-project-agent-command-duo src/api "validate API responses" true "conventional commits"
```

**7-Phase Process**:
1. Parse arguments
2. Scan existing patterns
3. Determine strategy (Type A-D)
4. **User confirmation** ← Blocking gate
5. Prepare extraction instructions
6. Execute via command-agent-duo agent
7. Report results

**Current Limitation**: Entirely manual. User must know when to invoke and with what arguments.

---

## Part 2: What Claude-Mem Provides

### 2.1 The Memory Layer

Claude-mem already captures:
- Tool usage patterns
- Decision rationale
- Error patterns and fixes
- File modification history
- Session context

**New capability needed**: Structured observation types for foreman integration.

### 2.2 New Observation Types

```typescript
enum ForemanObservationType {
  // Issue lifecycle
  ISSUE_START = 'foreman:issue:start',
  ISSUE_AGENT_CYCLE = 'foreman:issue:agent_cycle',
  ISSUE_COMPLETE = 'foreman:issue:complete',

  // Context capture
  GITHUB_COMMENT_POSTED = 'foreman:github:comment_posted',
  AGENT_CONTEXT_CONSUMED = 'foreman:agent:context_consumed',

  // Pattern detection
  PATTERN_DETECTED = 'foreman:pattern:detected',
  DUO_CANDIDATE = 'foreman:duo:candidate',

  // Agent refinement
  AGENT_SUCCESS = 'foreman:agent:success',
  AGENT_FAILURE = 'foreman:agent:failure',
  AGENT_REFINEMENT = 'foreman:agent:refinement'
}
```

---

## Part 3: The Integration Points

### 3.1 Local Context Persistence

**Problem**: chain-issue-updater posts comments to GitHub. Every agent re-reads them.

**Solution**: Capture locally when posting.

```
chain-issue-updater posts to GitHub
    ↓
claude-mem hook intercepts (PostToolUse on mcp__github__add_issue_comment)
    ↓
Store locally with issue reference:
{
  type: 'foreman:github:comment_posted',
  issue_number: 42,
  comment_type: 'agent_plan',  // or 'test_spec', 'completion_report', etc.
  content: <full comment>,
  agent: 'chain-issue-updater',
  timestamp: ...
}
    ↓
Future agents query local memory instead of GitHub
```

**Implementation**: New hook in claude-mem that detects GitHub comment creation for issues in `.foreman-project` projects.

### 3.2 Dynamic Context Loading for /start-issue N

**Current**: `/chain-issue N` reads from GitHub each time.

**Enhanced**: `/start-issue N` loads context dynamically from:

1. **Issue YAML** (issue-NNN.yaml):
   - Agent sequence
   - Folder scopes
   - Phase labels
   - Acceptance criteria

2. **Local Memory** (claude-mem):
   - Previously posted comments for this issue
   - Error patterns from prior attempts
   - Decision rationale

3. **Pre-Digested Rules** (based on labels):
   - `phase:dev` → No build tests
   - `area:api` → API design rules
   - `type:feat` → Feature implementation patterns

```
/start-issue 42
    ↓
Read issue-042.yaml
    ↓
claude-mem query: "foreman:github:comment_posted WHERE issue_number=42"
    ↓
Label-based rule injection:
  - phase:dev → inject no-build-test rule
  - area:api → inject api-design rules
    ↓
Construct context package
    ↓
Launch first agent in sequence
```

### 3.3 Automatic Duo Creation

**Vision**: Claude-mem detects patterns during issue work and suggests/creates duos automatically.

**Pattern Detection Triggers**:

1. **Repeated folder access patterns**:
   ```
   Observation: backend-architect accessed src/api/billing/*.ts in 5 consecutive issues
   Pattern: billing API specialization emerging
   Candidate: billing-api-specialist agent
   ```

2. **Recurring error-fix cycles**:
   ```
   Observation: troubleshooting-investigator fixed same error type 3 times
   Pattern: Error pattern established
   Candidate: Auto-inject prevention rule
   ```

3. **Agent sequence stabilization**:
   ```
   Observation: Issues with area:api always use backend-architect → test-manager
   Pattern: API workflow standardized
   Candidate: api-workflow-orchestrator command
   ```

**Automatic Creation Flow**:

```
Pattern detected
    ↓
Calculate confidence score (frequency × recency × consistency)
    ↓
If confidence > threshold:
    ↓
Create duo candidate observation:
{
  type: 'foreman:duo:candidate',
  pattern_type: 'folder_specialization',
  suggested_name: 'billing-api-specialist',
  evidence: [observation_ids],
  confidence: 0.87,
  suggested_scope: {
    path: 'src/api/billing',
    context: 'billing API implementation and maintenance'
  }
}
    ↓
Surface to user during /morning-report or session start
    ↓
User approves → Auto-invoke /create-project-agent-command-duo with detected args
```

### 3.4 Project-Level Agent Refinement

**How agents get better over time**:

1. **Success/Failure Tracking**:
   ```
   After each agent completes:
   {
     type: 'foreman:agent:success' | 'foreman:agent:failure',
     agent: 'backend-architect',
     issue_number: 42,
     folders_touched: ['src/api/users/'],
     patterns_used: ['structured-errors', 'pino-logging'],
     outcome: 'success' | 'needed_fix' | 'blocked'
   }
   ```

2. **Refinement Detection**:
   ```
   Query: "foreman:agent:failure WHERE agent='backend-architect' AND folders CONTAINS 'billing'"
   Finding: backend-architect fails on billing 40% of time
   Refinement: Add billing-specific instruction to backend-architect.md
   ```

3. **Automatic Instruction Injection**:
   ```
   When backend-architect starts on billing folder:
   - Query failures for this agent + folder combo
   - Inject preventive instructions based on past failures
   ```

### 3.5 Pre-Digested Rules Based on Labels

**Rule Pre-Processing** (on project registration):

```
Scan .my_coding/rules/*.mdc
    ↓
Index by applicable labels:
{
  'phase:dev': [no-build-tests.mdc, dev-workflow.mdc],
  'area:api': [api-design.mdc, rest-conventions.mdc],
  'type:feat': [feature-implementation.mdc],
  'type:fix': [bug-fix-workflow.mdc]
}
    ↓
Store in claude-mem with tag structure
```

**Runtime Injection**:

```
Issue labels: [phase:dev, area:api, type:feat]
    ↓
Query: rules WHERE labels INTERSECT issue_labels
    ↓
Inject relevant rule summaries into agent context
```

---

## Part 4: Implementation Phases

### Phase 1: Local Context Capture (Foundation)

**Goal**: Stop re-reading GitHub comments.

**Changes**:
1. New PostToolUse hook handler for `mcp__github__add_issue_comment`
2. Detect if comment is for a foreman-managed project
3. Store with issue_number and comment_type tags
4. New search endpoint: `/api/search/foreman/issue/{N}/comments`

**Validation**: Agent can query local memory instead of GitHub API.

### Phase 2: Dynamic /start-issue Command

**Goal**: Single command that adapts based on issue context.

**Changes**:
1. New `/start-issue` command in `.my_coding/commands/`
2. Reads issue-NNN.yaml for agent sequence
3. Queries claude-mem for local context
4. Assembles and launches first agent

**Validation**: `/start-issue 42` produces same result as current workflow but faster.

### Phase 3: Label-Based Rule Injection

**Goal**: Automatic rule application based on issue labels.

**Changes**:
1. Rule indexing during project registration
2. Label → rule mapping stored in claude-mem
3. Context assembly includes relevant rules automatically

**Validation**: Agent context includes correct rules without manual specification.

### Phase 4: Pattern Detection Engine

**Goal**: Detect duo candidates automatically.

**Changes**:
1. Pattern analysis on observation stream
2. Confidence scoring algorithm
3. Candidate surfacing in morning report

**Validation**: System suggests reasonable duo candidates after 5+ issues.

### Phase 5: Automatic Duo Creation

**Goal**: One-click duo creation from detected patterns.

**Changes**:
1. Duo candidate → creation argument mapping
2. User approval workflow
3. Auto-invocation of creation command

**Validation**: Approved candidate results in working duo.

### Phase 6: Agent Refinement Loop

**Goal**: Agents improve based on history.

**Changes**:
1. Success/failure tracking per agent + folder
2. Refinement suggestion generation
3. Instruction injection based on history

**Validation**: Repeated failures in same area decrease over time.

---

## Part 5: Data Model

### 5.1 Foreman Project Registration

```json
// .foreman-project (existing file, enhanced)
{
  "project_name": "my-saas-app",
  "issue_dir": "foreman/release-1/issue-map/",
  "claude_mem_enabled": true,
  "rule_labels": {
    "phase:dev": ["no-build-tests"],
    "area:api": ["api-design", "rest-conventions"]
  }
}
```

### 5.2 Observation Schema Extensions

```typescript
interface ForemanIssueObservation {
  type: 'foreman:issue:start' | 'foreman:issue:complete';
  issue_number: number;
  project: string;
  agent_sequence: string[];
  labels: string[];
}

interface ForemanCommentObservation {
  type: 'foreman:github:comment_posted';
  issue_number: number;
  comment_type: 'agent_plan' | 'test_spec' | 'worker_scope' | 'completion_report';
  content: string;
  agent: string;
}

interface ForemanPatternObservation {
  type: 'foreman:pattern:detected';
  pattern_type: 'folder_specialization' | 'error_recurrence' | 'workflow_stabilization';
  evidence: number[];  // observation IDs
  confidence: number;
}

interface ForemanDuoCandidate {
  type: 'foreman:duo:candidate';
  suggested_name: string;
  suggested_scope: {
    path: string;
    context: string;
    include_git: boolean;
    git_instructions?: string;
  };
  pattern_evidence: number[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'created';
}
```

### 5.3 Search Endpoints

```
GET /api/search/foreman/issue/{N}/comments
GET /api/search/foreman/issue/{N}/history
GET /api/search/foreman/agent/{name}/performance
GET /api/search/foreman/patterns/candidates
GET /api/search/foreman/rules/by-labels?labels=phase:dev,area:api
```

---

## Part 6: Integration with Existing Workflows

### 6.1 Impact-Change Workflow Enhancement

**Current**: impact-change creates assessment, surgical-edits implements.

**Enhanced**: Claude-mem captures assessment findings for reuse.

```
impact-change launches assessment agents
    ↓
Each agent writes findings
    ↓
claude-mem captures each finding with:
{
  type: 'foreman:impact:finding',
  change_name: '2026-01-05-user-prefs',
  focus: 'database-schema',
  findings: <content>,
  agent: 'impact-assessment'
}
    ↓
If impact-change-review needed (change failed):
    ↓
Query prior findings + error-explorer results
    ↓
Richer context for reassessment
```

### 6.2 Chain-Issue Workflow Enhancement

**Current flow preserved**, with memory layer additions:

```
/chain-issue 42
    ↓
[EXISTING] Read GitHub issue
    ↓
[EXISTING] chain-issue-updater creates plan
    ↓
[NEW] claude-mem captures plan locally
    ↓
[EXISTING] Launch agent sequence
    ↓
[NEW] Each agent queries local memory first, GitHub as fallback
    ↓
[EXISTING] Complete workflow
    ↓
[NEW] Capture outcome for pattern detection
```

### 6.3 Morning Report Enhancement

```
/morning-report
    ↓
[EXISTING] GitHub activity summary
    ↓
[NEW] Pattern detection results:
  "Detected potential duo candidate: billing-api-specialist
   Evidence: 5 issues with focused billing folder work
   Confidence: 87%
   [Approve] [Dismiss] [Details]"
    ↓
[NEW] Agent performance summary:
  "backend-architect: 94% success rate
   Note: 3 failures in src/api/billing/ - consider specialization"
```

---

## Part 7: What This Does NOT Do

1. **Does NOT replace foreman's orchestration** - Enhances existing patterns
2. **Does NOT create new CLI tools** - Uses existing command/agent architecture
3. **Does NOT change GitHub as source of truth** - Adds local caching layer
4. **Does NOT automate without approval** - Pattern detection suggests, user approves
5. **Does NOT require new state files** - Uses existing .foreman-project

---

## Part 8: Success Metrics

1. **Context Window Reduction**: 50%+ reduction in GitHub API token usage per issue
2. **Pattern Detection Accuracy**: 80%+ of suggested duos are useful
3. **Agent Improvement**: Measurable decrease in failures for same agent+folder combinations
4. **Time to Context**: <2s to load full issue context (vs current GitHub round-trips)
5. **Duo Creation Efficiency**: From pattern detection to working duo in <5 minutes

---

## Appendix A: Example /start-issue Flow

```
User: /start-issue 42

System:
1. Read foreman/release-1/issue-map/issue-042.yaml
   - Title: "Add user preferences API"
   - Labels: [phase:dev, area:api, type:feat]
   - Agent sequence: [backend-architect, test-manager]

2. Query claude-mem:
   - Prior comments for issue 42: 3 found (plan, spec, partial implementation)
   - Rules for labels: api-design.mdc, no-build-tests.mdc

3. Construct context:
   ---
   # Issue 42: Add user preferences API

   ## Prior Work
   [Agent Plan from chain-issue-updater]
   ...

   ## Applicable Rules
   - API Design: REST conventions, structured errors
   - Phase: dev - no build tests required

   ## Agent Sequence
   1. backend-architect (current)
   2. test-manager (next)
   ---

4. Launch backend-architect with context
```

---

## Appendix B: Example Pattern Detection

```
Observation Stream (last 10 issues):
- Issue 35: backend-architect → src/api/billing/subscriptions.ts
- Issue 37: backend-architect → src/api/billing/invoices.ts
- Issue 38: backend-architect → src/api/billing/refunds.ts
- Issue 41: backend-architect → src/api/billing/payments.ts
- Issue 42: backend-architect → src/api/billing/plans.ts

Pattern Analysis:
- Folder: src/api/billing/ (100% of recent issues)
- Agent: backend-architect (100%)
- Outcome: 80% success, 20% needed troubleshooting

Candidate Generation:
{
  type: 'foreman:duo:candidate',
  suggested_name: 'billing-api-specialist',
  pattern_type: 'folder_specialization',
  suggested_scope: {
    path: 'src/api/billing',
    context: 'billing domain API implementation',
    include_git: true,
    git_instructions: 'conventional commits with billing: prefix'
  },
  confidence: 0.92,
  evidence: [obs_35, obs_37, obs_38, obs_41, obs_42]
}
```

---

## Appendix C: File Locations Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Personal Agents | `~/.claude/agents/` | Reusable patterns |
| Project Agents | `.claude/agents/` | Project-specific |
| Personal Commands | `~/.claude/commands/` | Reusable workflows |
| Project Commands | `.claude/commands/` | Project-specific |
| Issue YAMLs | `foreman/release-N/issue-map/` | Issue definitions |
| Foreman Config | `.foreman-project` | Project registration |
| Claude-Mem DB | `~/.claude-mem/` | Memory storage |
| Rules | `~/.my_coding/rules/` | MDC rule files |
| Instructions | `~/.my_coding/instructions/` | Template instructions |
