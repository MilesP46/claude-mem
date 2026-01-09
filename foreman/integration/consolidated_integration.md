# Foreman + Claude-Mem Integration Specification

## Executive Summary

This specification defines the integration between Foreman's orchestration architecture and Claude-Mem's intelligent memory system. The integration creates a three-layer model where Memory provides the source of truth for WHERE code goes and HOW patterns work, Agents provide execution guarantees for methodology and variance-critical values, and Claude-Mem provides the intelligence layer for observation, validation, and recommendations.

**Core Architecture Principles:**

1. **Memory as Source of Truth**: CLAUDE.md hierarchy is authoritative for file ownership, module boundaries, patterns, and cross-cutting dependencies
2. **Lean Hybrid Model**: Agents embed methodology + variance-critical values only (~600-900 tokens), everything else loads from memory at runtime
3. **Two-Dimensional Patchwork Prevention**: Implementation consistency (HOW) + Placement consistency (WHERE)
4. **Context-Level DRY**: No duplication between agent instructions and memory content
5. **Bottom-Up Context Loading**: File -> parent -> root -> @path dependencies

---

## Part 1: System Architecture

### Three-Layer Model

```
+-------------------------------------------------------------------------+
|  LAYER 1: MEMORY (Source of Truth)                                       |
|  ----------------------------------------------------------------        |
|  Content: WHERE (placement) + HOW (patterns)                             |
|  Updates: Without CLI restart                                            |
|  Owner: Memory-manager agent                                             |
|  Validates: Claude-mem observation                                       |
|                                                                          |
|  LAYER 2: AGENT (Execution)                                              |
|  ----------------------------------------------------------------        |
|  Content: WHAT (methodology) + CRITICAL (variance-critical values)       |
|  Updates: Requires CLI restart                                           |
|  Owner: Human/automated generation                                       |
|  Behavior: References memory for WHERE and most of HOW                   |
|                                                                          |
|  LAYER 3: CLAUDE-MEM (Intelligence)                                      |
|  ----------------------------------------------------------------        |
|  Content: Observations, patterns, variance detection                     |
|  Updates: Continuous (always observing)                                  |
|  Owner: Automated system                                                 |
|  Output: Memory update recommendations, specialist triggers              |
+-------------------------------------------------------------------------+
```

### System Components

```
+-------------------------------------------------------------------------+
|                              GITHUB                                      |
|                                |                                         |
|                    Webhooks    |    API (fallback)                       |
|                         |      |      |                                  |
+-------------------------+------+------+----------------------------------+
                          |      |      |
                          v      v      v
+-------------------------------------------------------------------------+
|  CLAUDE-MEM WORKER (persistent, localhost:37777)                         |
|                                                                          |
|  +---------------------------------------------------------------+      |
|  |  GITHUB SYNC SERVICE                                           |      |
|  |  - Webhook receiver                                            |      |
|  |  - Polling fallback                                            |      |
|  |  - Cache manager                                               |      |
|  |  - Session notifier                                            |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  +---------------------------------------------------------------+      |
|  |  ORCHESTRATION ENGINE                                          |      |
|  |  - Session hierarchy (parent/child tracking)                   |      |
|  |  - Restart queue (pending -> ready -> executing)               |      |
|  |  - Prompt boundary detection                                   |      |
|  |  - Terminal launcher                                           |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  +---------------------------------------------------------------+      |
|  |  CONTEXT ENGINE                                                |      |
|  |  - Foreman context assembly                                    |      |
|  |  - Label-based rule injection                                  |      |
|  |  - Pattern detection                                           |      |
|  |  - Agent refinement                                            |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  +---------------------------------------------------------------+      |
|  |  INTELLIGENCE LAYER                                            |      |
|  |  - Observation tracking                                        |      |
|  |  - Variance detection                                          |      |
|  |  - Memory validation                                           |      |
|  |  - Specialist triggers                                         |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  +---------------------------------------------------------------+      |
|  |  DATA LAYER                                                    |      |
|  |  SQLite: sessions, github_cache, artifacts, observations       |      |
|  |  Chroma: semantic search                                       |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
+----------------------------------+--------------------------------------+
                                   |
                   +---------------+---------------+
                   |               |               |
                   v               v               v
         +-----------------+ +-----------+ +-----------------+
         | HOOKS           | | VIEWER    | | CLI             |
         | (thin clients)  | | (React)   | | (user terminal) |
         |                 | |           | |                 |
         | - Notify worker | | - Editor  | | - Claude Code   |
         | - Query worker  | | - Browser | | - Conversation  |
         | - Inject context| | - Monitor | | - Tool use      |
         +-----------------+ +-----------+ +-----------------+
```

### Context Loading Model

The system uses bottom-up context loading:

```
Editing: services/api/routes/users.js

LOADS (bottom-up, on-demand):
1. services/api/routes/CLAUDE.md (if exists)
2. services/api/CLAUDE.md
3. services/CLAUDE.md (if exists)
4. Root CLAUDE.md
5. Dependencies via @path (security, API, DB, ops)

NOT LOADED:
- Siblings (services/workers/)
- Cousins (apps/web/)
- Other subtrees (packages/)

TOTAL: ~5-8 relevant files, not 20+
```

### Context Budget by Layer

| Layer | Static Cost | Dynamic Cost | Total | What It Knows | Guarantee |
|-------|-------------|--------------|-------|---------------|-----------|
| Orchestration | 0 | 100-200 | 100-200 | WHERE, WHO, WHAT | Routing only |
| Memory | N/A | 50-150/area | 50-150 | Patterns, conventions | Description only |
| General Agent | 500-800 | 100-300 | 650-1100 | Methodology, TDD | Follows patterns |
| Specialist (Lean) | 600-900 | 200-400 | 800-1300 | Methodology + values | Consistency |

---

## Part 2: Hook System

### Five Lifecycle Hooks

The system uses five lifecycle hooks that act as thin clients to the worker:

**1. SessionStart Hook**

Registers the session in the hierarchy and ensures navigation cache is ready.

```typescript
async function sessionStartHook(input: SessionStartInput): Promise<void> {
  const { session_id, parent_session_id } = input;

  await fetch('http://localhost:37777/api/sessions/register', {
    method: 'POST',
    body: JSON.stringify({
      session_id,
      parent_session_id: parent_session_id || null,
      root_session_id: parent_session_id
        ? await getRootSession(parent_session_id)
        : session_id
    })
  });
}
```

**2. UserPromptSubmit Hook**

Checks for pending restarts and injects agent suggestions.

```typescript
async function userPromptSubmitHook(input: UserPromptSubmitInput): Promise<HookResult> {
  // Check for pending restart
  const pending = await fetch(
    `http://localhost:37777/api/orchestration/restart-pending/${input.session_id}`
  ).then(r => r.json());

  if (pending.should_restart) {
    console.log(JSON.stringify({
      result: 'block',
      message: `Restarting to load new artifact: ${pending.artifact_path}`
    }));

    await fetch('http://localhost:37777/api/orchestration/execute-restart', {
      method: 'POST',
      body: JSON.stringify({ session_id: input.session_id })
    });

    return;
  }

  // Agent suggestion injection
  const suggestions = await getAgentSuggestions(input.prompt);
  if (suggestions && suggestions.totalTokens < 100) {
    return {
      result: 'continue',
      context_injection: formatAgentSuggestions(suggestions)
    };
  }

  return { result: 'continue' };
}
```

**3. PostToolUse Hook**

Captures file operations, errors, and detects artifact writes.

```typescript
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  const { tool_name, tool_input, tool_result, session_id } = input;

  // File read tracking
  if (tool_name === 'Read' && tool_result?.success) {
    await recordFileOperation({
      session_id,
      file_path: tool_input.file_path,
      operation: 'read',
      timestamp: Date.now(),
      tool_name
    });
  }

  // File modification tracking
  if (tool_name === 'Edit' && tool_result?.success) {
    await recordFileOperation({
      session_id,
      file_path: tool_input.file_path,
      operation: 'modified',
      timestamp: Date.now(),
      tool_name,
      content_summary: summarizeChange(tool_input.old_string, tool_input.new_string)
    });
  }

  // Artifact write detection for restart
  if (isArtifactWrite(input)) {
    await fetch('http://localhost:37777/api/orchestration/restart-pending', {
      method: 'POST',
      body: JSON.stringify({
        session_id: input.session_id,
        artifact_path: input.tool_input.file_path
      })
    });
  }

  // Cross-cutting dependency tracking
  if (tool_name === 'Read' && tool_input.file_path.endsWith('CLAUDE.md')) {
    const imports = extractImports(tool_result?.content);
    await cacheCrossCuttingDeps(path.dirname(tool_input.file_path), imports);
  }
}
```

**4. Summary Hook**

Records session observations and summaries for compression.

```typescript
async function summaryHook(input: SummaryInput): Promise<void> {
  await fetch('http://localhost:37777/api/observations/summary', {
    method: 'POST',
    body: JSON.stringify({
      session_id: input.session_id,
      summary: input.summary,
      affected_areas: input.affected_areas,
      files_changed: input.files_changed
    })
  });
}
```

**5. SessionEnd Hook**

Marks session complete and triggers restart readiness check.

```typescript
async function sessionEndHook(input: SessionEndInput): Promise<void> {
  const { session_id } = input;

  const result = await fetch('http://localhost:37777/api/sessions/complete', {
    method: 'POST',
    body: JSON.stringify({ session_id })
  }).then(r => r.json());

  // Worker checks if all subagents done AND restart pending
}
```

### Prompt-Boundary Restart Mechanism

Restarts occur at prompt boundaries, not tool boundaries:

```
Timeline of a typical response:

User prompt: "Create a billing API agent"
    |
    v
Claude response starts
    |
    +-- Tool: Read existing agents (context)
    |
    +-- Tool: Write billing-agent.md  <-- Artifact written here
    |         |
    |         +-- Hook fires, records "restart pending"
    |
    +-- Tool: Read the new file (verification)
    |
    +-- Text: "I've created the billing-agent.md with..."
    |
    +-- Response complete
    |
    v
[SAFE RESTART POINT] <-- Restart happens HERE, not at artifact write
    |
    v
User's next prompt OR idle timeout
```

### Subagent Hierarchy Awareness

The system tracks parent-child relationships for subagent-aware restart queuing:

```sql
CREATE TABLE session_hierarchy (
  session_id TEXT PRIMARY KEY,
  parent_session_id TEXT,
  root_session_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  FOREIGN KEY (parent_session_id) REFERENCES session_hierarchy(session_id)
);

CREATE TABLE pending_restarts (
  id INTEGER PRIMARY KEY,
  root_session_id TEXT NOT NULL,
  triggered_by_session TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  active_subagents INTEGER DEFAULT 0,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP,

  FOREIGN KEY (root_session_id) REFERENCES session_hierarchy(session_id)
);
```

---

## Part 3: GitHub Integration

### GitHub Sync Service

The worker maintains a synchronized GitHub cache. CLI never calls GitHub directly.

```
+-------------------------------------------------------------------------+
|  GITHUB                                                                  |
|       |                                                                  |
|       | Webhooks (push)           Polling (pull, fallback)              |
|       |      |                           |                              |
|       v      v                           v                              |
|  +---------------------------------------------------------------+      |
|  |  GITHUB SYNC SERVICE (in worker)                               |      |
|  |                                                                |      |
|  |  +-----------------+  +-----------------+  +-----------------+ |      |
|  |  | Webhook Handler |  | Polling Service |  | Cache Manager   | |      |
|  |  | POST /webhook   |  | Every 30s       |  | SQLite tables   | |      |
|  |  +--------+--------+  +--------+--------+  +--------+--------+ |      |
|  |           |                    |                    |          |      |
|  |           +--------------------+--------------------+          |      |
|  |                               |                                |      |
|  |                               v                                |      |
|  |  +-----------------------------------------------------+       |      |
|  |  |  GITHUB CACHE                                        |       |      |
|  |  |  - issues: id, number, title, body, state, labels   |       |      |
|  |  |  - comments: id, issue_id, body, author, created_at |       |      |
|  |  |  - pull_requests: id, number, state, head, base     |       |      |
|  |  |  - pr_reviews: id, pr_id, state, body               |       |      |
|  |  +-----------------------------------------------------+       |      |
|  +----------------------------------------------------------------+      |
|                                    |                                     |
|                                    | Local API                           |
|                                    v                                     |
|  +---------------------------------------------------------------+      |
|  |  CLAUDE CODE CLI                                               |      |
|  |                                                                |      |
|  |  Instead of:                    Now:                           |      |
|  |  mcp__github__get_issue(42)  -> GET /api/github/issues/42     |      |
|  |  (slow, token-heavy)            (fast, minimal tokens)         |      |
|  +---------------------------------------------------------------+      |
+-------------------------------------------------------------------------+
```

### GitHub Cache Schema

```sql
CREATE TABLE github_issues (
  id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  state TEXT,
  labels JSON,
  assignees JSON,
  milestone TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(repo, number)
);

CREATE TABLE github_comments (
  id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  body TEXT,
  author TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (repo, issue_number) REFERENCES github_issues(repo, number)
);

CREATE TABLE github_sync_state (
  repo TEXT PRIMARY KEY,
  last_webhook_at TIMESTAMP,
  last_poll_at TIMESTAMP,
  etag TEXT,
  status TEXT DEFAULT 'active'
);
```

### Worker API Endpoints for GitHub

```
GET  /api/github/issues/:number              Cached issue data
GET  /api/github/issues/:number/comments     Cached comments
POST /api/github/issues/:number/comments     Post + cache
GET  /api/github/prs/:number                 Cached PR data
GET  /api/github/prs/:number/status          Aggregated status checks
```

### Token Savings from Caching

| Operation | Before (Direct API) | After (Cached) | Savings |
|-----------|---------------------|----------------|---------|
| Get issue context | ~2000 tokens | ~400 tokens | 80% |
| Get issue comments | ~3000 tokens | ~800 tokens | 73% |
| Post comment | ~500 tokens | ~100 tokens | 80% |
| Check PR status | ~1500 tokens | ~200 tokens | 87% |

---

## Part 4: Memory System

### CLAUDE.md Hierarchy

The Foreman memory system uses a hierarchical structure with bottom-up loading:

**Root CLAUDE.md (Navigation Layer)**:
```markdown
# Project Memory

## Context Discovery Protocol
1. Identify the domain - What am I modifying?
   - Backend services: services/, api/
   - Frontend: web/, apps/
   - Shared: packages/, libs/

2. Read the local CLAUDE.md - Each domain has its own memory

## Orchestration Guide

### Functional Areas
| Area | Path | Keywords | Primary Agent |
|------|------|----------|---------------|
| Billing | src/services/billing/ | payment, subscription | backend-architect |
| Auth | src/services/auth/ | login, session, token | backend-architect |
| Users | src/api/users/ | user, profile, account | backend-architect |

### Cross-Cutting Concerns
| Concern | Location | Affects |
|---------|----------|---------|
| Security | docs/security/ | All API endpoints |
| API Contracts | docs/api/ | Public endpoints |

### Agent Routing Rules
- Backend changes (services/, api/, db/) -> backend-architect
- Frontend changes (web/, apps/) -> frontend-developer
- Multi-area changes -> sequential agents per area

## Service Map
- Backend: services/ - API services and business logic
- Frontend: web/ - React application
- Database: db/ - Migrations and queries
```

**Subtree CLAUDE.md (Detail Layer)**:
```markdown
# Billing Service Memory

## Purpose & Entry Points
- Handles subscription and payment processing
- Main entry: src/services/billing/index.ts

## File Ownership Map
| Concern | Owner File | Never In |
|---------|------------|----------|
| Payment processing | processor.ts | webhooks/, users/ |
| Subscription logic | subscriptions.ts | processor.ts |
| Webhook handling | webhooks/handler.ts | processor.ts |
| Retry logic | webhooks/retry.ts | Top-level billing/ |

## Shared Utilities (DRY Enforcement)
- Retry helper: @../../utils/retry.ts (USE THIS, don't create new)
- Crypto/signing: @../../utils/crypto.ts
- Error types: @../../errors/billing.ts

## Module Boundaries
- billing/ owns: payment, subscription, invoice, webhook
- billing/ NEVER handles: user auth, session management

## Extension vs Creation
- New payment method? -> Extend processor.ts or add to providers/
- New webhook type? -> Extend webhooks/handler.ts, add case
- New subscription tier? -> Extend subscriptions.ts

## Patterns
- BullMQ for async jobs
- Stripe SDK via providers/stripe.ts

## Dependencies
@../../docs/api/CLAUDE.md
@../../docs/security/CLAUDE.md
```

### Bottom-Up Loading

Memory loads from the file being edited upward to root:

```
File: src/services/billing/webhooks/handler.ts

Loading order:
1. src/services/billing/webhooks/CLAUDE.md (if exists)
2. src/services/billing/CLAUDE.md
3. src/services/CLAUDE.md (if exists)
4. Root CLAUDE.md (navigation only)
5. @path dependencies from Dependencies sections
```

### Memory Opportunity Detection

The system detects when directories need CLAUDE.md files:

```typescript
interface MemoryOpportunity {
  directory_path: string;
  reason: 'file_count' | 'loc_threshold' | 'logical_unit' | 'entrypoint_pattern';
  current_state: {
    file_count: number;
    loc_total: number;
    has_entrypoint: boolean;
    has_claude_md: boolean;
  };
  recommendation: 'create' | 'skip';
  confidence: number;
}

function shouldHaveCLAUDEmd(stats: DirectoryStats): boolean {
  // >=3 source files
  if (stats.file_count >= 3) return true;

  // Entrypoint + >=2 additional files
  if (stats.has_entrypoint && stats.file_count >= 2) return true;

  // >=150 LOC total
  if (stats.loc_total >= 150) return true;

  // Logical architectural unit
  if (stats.is_logical_unit) return true;

  return false;
}
```

### Memory vs Agent Thresholds

| Aspect | Memory (CLAUDE.md) | Agent |
|--------|-------------------|-------|
| Minimum files | >=3 source files | >=8 source files |
| Minimum directories | 1 | >=2 |
| Creation cost | Low (file write) | High (context overhead) |
| Detection frequency | Every session | Daily batch |
| Auto-creation | Yes (>80% confidence) | No (requires approval) |

---

## Part 5: Agent Architecture

### General vs Specialist Agents

**General Agent (Reference Model)**:
```
Static (500-800 tokens):
- Methodology (TDD, quality gates)
- How to navigate and use memory system

Runtime (via memory):
- File ownership (WHERE)
- Patterns (HOW)
- Shared utilities (DRY)
- Cross-cutting deps

Risk: May interpret memory patterns differently each session
```

**Specialist Agent (Lean Hybrid Model)**:
```
Static (600-900 tokens):
- Methodology (same as general)
- Variance-critical values ONLY (~100-200 tokens)
  - Exact queue configuration values
  - Exact retry parameters
  - Exact timeout values
  - NOT descriptions, NOT placement, NOT patterns

Runtime (via memory - SAME as general):
- File ownership (WHERE) - from memory
- Patterns (HOW) - from memory
- Shared utilities (DRY) - from memory

Guarantee: Variance-critical values consistent, rest from memory
```

### Lean Specialist Template

```markdown
# {Area} Specialist (~700 tokens)

## Methodology
Standard TDD workflow. Follow memory for placement and patterns.

## Variance-Critical Values (ONLY these are embedded)

**CRITICAL: These exact values must be used. No interpretation allowed.**

```typescript
const {AREA}_QUEUE_CONFIG = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500
};

const {AREA}_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000
};
```

## Memory Reference

For all other guidance, read the area memory:
- `{area}/CLAUDE.md` for file ownership and patterns
- Follow @path dependencies for cross-cutting concerns

Do NOT embed what memory provides. Trust the memory system.
```

### Variance-Critical Content Definition

```typescript
interface VarianceCriticalContent {
  // ONLY exact values that would cause implementation variance
  exact_configurations: {
    queue_config: object;      // { attempts: 3, delay: 1000 }
    retry_parameters: object;  // { maxRetries: 3, backoffMs: 1000 }
    timeout_values: object;    // { requestTimeout: 5000, socketTimeout: 30000 }
  };

  // NOT included (comes from memory):
  // - File ownership descriptions
  // - Pattern explanations
  // - Module boundary definitions
  // - Shared utility locations
  // - Implementation guidance
}
```

### Specialist Trigger Conditions

```typescript
interface AreaAssessment {
  area: string;
  characteristics: {
    is_payment_related: boolean;
    is_auth_related: boolean;
    is_compliance_sensitive: boolean;
    has_multi_step_workflow: boolean;
    historical_error_rate: number;
    implementation_variance_detected: boolean;
  };
}

function requiresSpecialist(assessment: AreaAssessment): boolean {
  const { characteristics: c } = assessment;

  // Critical areas ALWAYS need specialist
  if (c.is_payment_related) return true;
  if (c.is_auth_related) return true;
  if (c.is_compliance_sensitive) return true;

  // Multi-step workflows benefit from embedded sequencing
  if (c.has_multi_step_workflow) return true;

  // Proven problematic areas need consistency
  if (c.historical_error_rate > 0.25) return true;

  // Detected variance indicates memory isn't guaranteeing consistency
  if (c.implementation_variance_detected) return true;

  return false;
}
```

### Scope-Based Agent Threshold

```typescript
interface ScopeAnalysis {
  root_path: string;
  total_files: number;
  total_directories: number;
  total_loc: number;
  memory_coverage_ratio: number;
  prescriptive_density: number;
  prescriptive_concentration: number;
  observation_count: number;
  error_rate: number;
}

function shouldCreateAgentForScope(scope: ScopeAnalysis): AgentRecommendation {
  // Gate 1: Minimum scope size (>=8 files)
  if (scope.total_files < 8) {
    return { recommend: false, reason: 'Scope too small' };
  }

  // Gate 2: Minimum directory span (>=2 directories)
  if (scope.total_directories < 2 && scope.prescriptive_density < 0.8) {
    return { recommend: false, reason: 'Single directory scope' };
  }

  // Gate 3: Memory coverage check
  if (scope.memory_coverage_ratio > 0.7 && scope.prescriptive_concentration < 0.5) {
    return { recommend: false, reason: 'Nested memories sufficient' };
  }

  // Evaluation: Calculate benefit score
  const benefitScore = calculateAgentBenefit(scope);

  if (benefitScore > 0.6) {
    return { recommend: true, confidence: benefitScore };
  }

  return { recommend: false, reason: 'Benefit score too low' };
}

function calculateAgentBenefit(scope: ScopeAnalysis): number {
  let score = 0;

  // Factor 1: Prescriptive concentration (0-0.3)
  score += scope.prescriptive_concentration * 0.3;

  // Factor 2: Error rate (0-0.25)
  if (scope.observation_count >= 5) {
    score += Math.min(scope.error_rate, 1) * 0.25;
  }

  // Factor 3: Scope complexity (0-0.25)
  const complexityFactor = Math.min(
    (scope.total_files / 30) + (scope.total_directories / 8),
    1
  );
  score += complexityFactor * 0.25;

  // Factor 4: Work frequency (0-0.2)
  const frequencyFactor = Math.min(scope.observation_count / 20, 1);
  score += frequencyFactor * 0.2;

  return score;
}
```

---

## Part 6: Orchestration

### WHAT-not-HOW Pattern

Orchestrators specify WHAT (outcome), WHERE (scope), and WHY (context). They do NOT specify HOW - subagents learn HOW from area CLAUDE.md.

```
ORCHESTRATOR KNOWS                    SUBAGENT LEARNS
-----------------                    ---------------
WHAT: Outcome needed                 HOW: From area CLAUDE.md
WHERE: Which area                    PATTERNS: From area conventions
WHO: Which agent type                CONSTRAINTS: From Do/Don't
WHY: Business context                DEPENDENCIES: From @ imports
```

**Orchestrator Launch Template**:
```markdown
## Task for {AGENT_TYPE}

### WHAT (Outcome)
{DESCRIPTION_OF_DESIRED_OUTCOME}

### WHERE (Scope)
Area: {AREA_PATH}

### WHY (Context)
{BUSINESS_REASON_OR_ISSUE_REFERENCE}

### Instructions
1. Read {AREA_PATH}/CLAUDE.md for patterns and constraints
2. Follow @ imports for cross-cutting concerns
3. Implement the outcome using area conventions
4. You determine HOW based on what you learn from the area memory

DO NOT expect me to tell you HOW. The area CLAUDE.md contains the patterns.
```

### Cross-Cutting Coordination

When work spans multiple areas with shared cross-cutting concerns:

**Strategy 1: Single Coordinator (>70% overlap, same agent type)**
```typescript
interface CoordinatedExecution {
  strategy: 'single_coordinator';
  agent: string;
  scope: string[];
  cross_cutting_load: string[];
  work_items: WorkItem[];
}
```

**Strategy 2: Sequential with Handoff (40-70% overlap)**
```typescript
interface SequentialExecution {
  strategy: 'sequential_handoff';
  agents: Array<{
    agent: string;
    area: string;
    cross_cutting: string[];
  }>;
  handoff: {
    shared_context: string;
    cross_cutting_summary: string;
  };
}
```

**Strategy 3: Parallel Independent (<40% overlap)**
```typescript
interface ParallelExecution {
  strategy: 'parallel_independent';
  agents: Array<{
    agent: string;
    area: string;
    cross_cutting: string[];
  }>;
}
```

### Cross-Cutting Overlap Calculation

```typescript
function calculateOverlap(areas: CrossCuttingAnalysis[]): number {
  if (areas.length < 2) return 1.0;

  const allImports = new Set(areas.flatMap(a => a.imports));
  const commonImports = areas[0].imports.filter(imp =>
    areas.every(a => a.imports.includes(imp))
  );

  return commonImports.length / allImports.size;
}

function selectExecutionStrategy(
  affectedAreas: CrossCuttingAnalysis[]
): ExecutionStrategy {
  const overlap = calculateOverlap(affectedAreas);
  const agentTypes = new Set(affectedAreas.map(a => getAgentForArea(a.area)));

  if (overlap > 0.7 && agentTypes.size === 1) {
    return 'single_coordinator';
  }

  if (overlap >= 0.4 || agentTypes.size > 1) {
    return 'sequential_handoff';
  }

  return 'parallel_independent';
}
```

### Routing Framework

The `/add-functionality` command routes to existing agents without creating new ones:

```
User: /add-functionality "email notifications for order changes"
    |
    v
+-------------------------------------------------------------------------+
|  STEP 1: PARSE INTENT                                                    |
|                                                                          |
|  Domain: notifications                                                   |
|  Integration: email                                                      |
|  Trigger: order status changes                                          |
|  Implied areas: events/, services/email/, templates/                    |
+-------------------------------------------------------------------------+
    |
    v
+-------------------------------------------------------------------------+
|  STEP 2: QUERY PROJECT ESSENCE (Navigation Only)                         |
|                                                                          |
|  Read: Root CLAUDE.md only                                              |
|  Affected layers:                                                        |
|  - Events layer (src/events/) -> backend-architect                      |
|  - Services layer (src/services/) -> backend-architect                  |
|  - Templates layer (src/templates/) -> backend-architect                |
+-------------------------------------------------------------------------+
    |
    v
+-------------------------------------------------------------------------+
|  STEP 3: GENERATE ISSUE YAML                                             |
|                                                                          |
|  Creates issue with:                                                     |
|  - Title: "Add email notifications for order status changes"            |
|  - Agent sequence: [backend-architect]                                  |
|  - Affected areas: [src/events/, src/services/email/, ...]             |
|                                                                          |
|  NO agent creation suggestions. NO infrastructure changes.              |
+-------------------------------------------------------------------------+
    |
    v
+-------------------------------------------------------------------------+
|  STEP 4: LAUNCH CHAIN-ISSUE                                              |
|                                                                          |
|  Workflow begins with existing agents.                                   |
|  Hooks track work for intelligence system.                              |
+-------------------------------------------------------------------------+
```

### surgical-edits Alternative

When specialist benefit doesn't justify context cost, use `surgical-edits`:

```typescript
function selectExecutor(
  item: WorkItem,
  availableAgents: Agent[],
  parentContext: ContextSnapshot
): ExecutionDecision {

  const specialist = availableAgents.find(a => a.covers(item.area));
  const specialistBenefit = calculateSpecialistBenefit(item, specialist);
  const specialistCost = estimateAgentContextCost(specialist, item);

  if (!specialist) {
    return {
      executor: 'surgical-edits',
      reason: 'No specialist available',
      instructions: generateInlineInstructions(item, parentContext)
    };
  }

  if (specialistBenefit - specialistCost > 0.3) {
    return {
      executor: specialist.name,
      contextHandoff: buildContextHandoff(item, parentContext)
    };
  }

  return {
    executor: 'surgical-edits',
    reason: 'Context efficiency',
    instructions: generateInlineInstructions(item, parentContext)
  };
}
```

---

## Part 7: Consistency Guarantees

### Two-Dimensional Patchwork Prevention

**Dimension 1: Implementation Patchwork (HOW)**

Memory says: "Use BullMQ with exponential backoff"
- Session 1: `{ attempts: 3, delay: 1000 }`
- Session 2: `{ attempts: 5, delay: 2000 }`

Same pattern, different configurations. Solved by specialist embedding EXACT configurations.

**Dimension 2: Placement Patchwork (WHERE)**

Memory says: "Billing logic in src/services/billing/"
- Session 1: Adds payment retry to `src/services/billing/retry.ts` (correct)
- Session 2: Adds payment retry to `src/services/users/helpers.ts` (wrong)

Code works but violates single-responsibility. Solved by specialist embedding file ownership map.

### Variance Detection Algorithm

```typescript
interface ImplementationPattern {
  area: string;
  pattern_type: string;
  implementation: string;
  session_id: string;
  timestamp: number;
}

async function detectVariance(area: string): Promise<VarianceReport> {
  const patterns = await getImplementationPatterns(area, { days: 30 });

  const byType = groupBy(patterns, 'pattern_type');
  const variances: Variance[] = [];

  for (const [type, implementations] of Object.entries(byType)) {
    const unique = new Set(implementations.map(i => i.implementation));

    if (unique.size > 1) {
      variances.push({
        pattern_type: type,
        variant_count: unique.size,
        variants: [...unique],
        sessions_affected: implementations.length
      });
    }
  }

  return {
    area,
    has_variance: variances.length > 0,
    variances,
    recommendation: variances.length > 0
      ? 'Specialist agent recommended'
      : 'Memory + general agent sufficient'
  };
}
```

### Placement Variance Detection

```typescript
interface PlacementAssessment {
  file_created: string;
  expected_module: string;
  actual_module: string;
  concerns_in_file: string[];
  violations: PlacementViolation[];
}

interface PlacementViolation {
  type: 'wrong_module' | 'duplicate_utility' | 'responsibility_leak';
  description: string;
  suggested_location: string;
}

async function detectPlacementVariance(
  session: SessionRecord
): Promise<PlacementReport> {
  const violations: PlacementViolation[] = [];

  for (const file of session.files_created) {
    const expectedModule = await getExpectedModule(file.concerns);
    if (file.module !== expectedModule) {
      violations.push({
        type: 'wrong_module',
        description: `${file.path} contains ${file.concerns} but is in ${file.module}`,
        suggested_location: `${expectedModule}/${file.name}`
      });
    }

    const existingUtilities = await findSimilarUtilities(file.exports);
    if (existingUtilities.length > 0) {
      violations.push({
        type: 'duplicate_utility',
        description: `${file.path} duplicates functionality`,
        suggested_location: 'Use existing utilities'
      });
    }
  }

  return {
    session_id: session.id,
    has_violations: violations.length > 0,
    violations
  };
}
```

### DRY Enforcement Protocol

```
Task: "Add retry logic for failed webhook processing"

STEP 1: Check Memory for Shared Utilities
-----------------------------------------
Memory says: "Retry helper: @../../utils/retry.ts"

STEP 2: Read Shared Utility
---------------------------
Found: utils/retry.ts with exponentialBackoff() function
Assessment: Matches need - USE THIS

STEP 3: Determine Placement
---------------------------
Memory says: "Retry logic -> webhooks/retry.ts"
Memory says: "Webhook handling -> webhooks/handler.ts"

STEP 4: Implementation
----------------------
Location: src/services/billing/webhooks/retry.ts
Approach: Import from utils/retry.ts, wrap for webhook-specific needs

RESULT: No duplicate helper created, code in correct location
```

### Guarantee Hierarchy

```
GUARANTEE STRENGTH
       ^
       |
       |  +---------------------------------------------+
HIGH   |  |  SPECIALIZED AGENT                           |
       |  |  - Same implementation every time            |
       |  |  - Embedded exact configurations             |
       |  |  - Embedded file ownership                   |
       |  |  - No interpretation variance                |
       |  |  - Cost: 800-1300 tokens                     |
       |  +---------------------------------------------+
       |
       |  +---------------------------------------------+
MEDIUM |  |  GENERAL AGENT + MEMORY                      |
       |  |  - Follows patterns but may vary             |
       |  |  - Reads memory for guidance                 |
       |  |  - Good for routine work                     |
       |  |  - Cost: 650-1100 tokens                     |
       |  +---------------------------------------------+
       |
       |  +---------------------------------------------+
LOW    |  |  MEMORY ALONE (No agent)                     |
       |  |  - Descriptive only                          |
       |  |  - No execution                              |
       |  |  - For documentation/reference               |
       |  |  - Cost: 50-150 tokens                       |
       |  +---------------------------------------------+
       |
       +-------------------------------------------------->
                                                 CONTEXT COST
```

---

## Part 8: Session Management

### File-Centric Session Model

```typescript
interface FileOperation {
  file_path: string;
  operation: 'read' | 'modified' | 'created' | 'deleted';
  timestamp: number;
  tool_name: string;
  content_summary?: string;
}

interface EnhancedSession {
  session_id: string;
  started_at: number;
  ended_at: number;
  project_id: string;

  files_read: FileOperation[];
  files_modified: FileOperation[];
  files_created: FileOperation[];

  affected_areas: Array<{
    path: string;
    operations: number;
    primary_activity: 'reading' | 'writing' | 'mixed';
  }>;

  work_pattern: {
    exploration_ratio: number;
    concentration: number;
    primary_area: string;
  };
}
```

### Session Database Schema

```sql
CREATE TABLE file_operations (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  operation TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  content_summary TEXT,
  timestamp INTEGER NOT NULL,

  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX idx_file_ops_session ON file_operations(session_id);
CREATE INDEX idx_file_ops_path ON file_operations(file_path);

CREATE TABLE session_affected_areas (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  area_path TEXT NOT NULL,
  operation_count INTEGER NOT NULL,
  read_count INTEGER NOT NULL,
  write_count INTEGER NOT NULL,
  primary_activity TEXT NOT NULL,

  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX idx_affected_area_path ON session_affected_areas(area_path);
```

### Context Inheritance for Subagents

```typescript
interface ContextHandoff {
  already_read: Array<{
    path: string;
    summary: string;
    relevant_lines?: string;
  }>;

  constraints: string[];
  task_context: string;
  questions?: string[];
}

function buildContextHandoff(
  item: WorkItem,
  parentContext: ContextSnapshot
): ContextHandoff {
  return {
    already_read: parentContext.files_read
      .filter(f => f.path.startsWith(item.area))
      .map(f => ({
        path: f.path,
        summary: f.extracted_summary,
        relevant_lines: f.relevant_sections
      })),

    constraints: parentContext.identified_constraints
      .filter(c => c.area === item.area || c.area === 'global'),

    task_context: `Parent analyzed ${item.area}. ` +
      `Changes needed: ${item.description}. ` +
      `Files already understood: ${parentContext.files_read.map(f => f.path).join(', ')}`
  };
}
```

---

## Part 9: Planning Workflow

### Chain-Issue Integration

The system integrates with Foreman's chain-issue workflow for file structure planning:

```
+-------------------------------------------------------------------------+
|  FILE STRUCTURE PLANNING (Before Any Code)                               |
|                                                                          |
|  Task: "Add webhook retry with dead letter queue"                       |
|                                                                          |
|  STEP 1: Analyze Current Structure                                       |
|  --------------------------------                                        |
|  src/services/billing/webhooks/                                         |
|  +-- handler.ts (145 LOC - near limit)                                  |
|  +-- types.ts (40 LOC)                                                  |
|  +-- index.ts (15 LOC)                                                  |
|                                                                          |
|  STEP 2: Plan File Structure                                             |
|  ----------------------------                                            |
|  New feature needs ~100 LOC. handler.ts + 100 would exceed limit.       |
|                                                                          |
|  Decision: Create new file for retry logic                              |
|                                                                          |
|  Planned structure:                                                      |
|  src/services/billing/webhooks/                                         |
|  +-- handler.ts (145 LOC - unchanged)                                   |
|  +-- retry.ts (NEW - retry logic ~80 LOC)                               |
|  +-- dead-letter.ts (NEW - DLQ logic ~60 LOC)                           |
|  +-- types.ts (40 LOC + new types ~20 LOC)                              |
|  +-- index.ts (15 LOC + new exports)                                    |
|                                                                          |
|  STEP 3: Bottom-Up Implementation Order                                  |
|  --------------------------------------                                  |
|  1. types.ts (leaf - no dependencies on new code)                       |
|  2. dead-letter.ts (leaf - depends only on types)                       |
|  3. retry.ts (depends on dead-letter.ts)                                |
|  4. handler.ts (update to use retry.ts)                                 |
|  5. index.ts (update exports)                                           |
|                                                                          |
|  STEP 4: Memory Update (After Implementation)                            |
|  --------------------------------------------                            |
|  Update File Ownership Map:                                              |
|  - Retry logic: webhooks/retry.ts (NEW)                                 |
|  - Dead letter handling: webhooks/dead-letter.ts (NEW)                  |
+-------------------------------------------------------------------------+
```

### Extension vs Creation Decision Tree

```
Task: Add new functionality
                    +------------------+
                    | Does existing    |
                    | file handle this |
                    | concern?         |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
          +-------+                     +-------+
          |  YES  |                     |  NO   |
          +---+---+                     +---+---+
              |                             |
              v                             v
  +---------------------+      +---------------------+
  | File < 150 LOC?     |      | Shared utility      |
  +----------+----------+      | exists?             |
             |                 +----------+----------+
    +--------+--------+           +-------+-------+
    |                 |           |               |
    v                 v           v               v
 +-----+          +-----+     +-----+         +-----+
 | YES |          | NO  |     | YES |         | NO  |
 +--+--+          +--+--+     +--+--+         +--+--+
    |                |           |               |
    v                v           v               v
 EXTEND          SPLIT &      IMPORT &      CREATE in
 existing        CREATE       WRAP for      correct
 file            helper       specific      module
                 file         needs
```

---

## Part 10: CLI Integration

### Platform-Specific Terminal Launch

The worker manages CLI restarts across platforms:

```typescript
interface TerminalLaunch {
  platform: 'darwin' | 'linux' | 'win32';
  method: 'embedded' | 'external';
  terminal_app?: string;
  working_directory: string;
  command: string;
}

async function executeRestart(session_id: string): Promise<void> {
  const session = await getSession(session_id);
  const platform = process.platform;

  const launch: TerminalLaunch = {
    platform,
    method: 'external',
    working_directory: session.project_path,
    command: `claude --resume ${session.conversation_id}`
  };

  if (platform === 'darwin') {
    launch.terminal_app = 'Terminal.app'; // or iTerm2
    await launchMacTerminal(launch);
  } else if (platform === 'linux') {
    await launchLinuxTerminal(launch);
  } else if (platform === 'win32') {
    await launchWindowsTerminal(launch);
  }
}
```

### Worker Orchestration API

```
# Session Management
POST /api/sessions/register                  Register session in hierarchy
POST /api/sessions/complete                  Mark session done

# Restart Orchestration
GET  /api/orchestration/restart-pending/:id  Check if restart queued
POST /api/orchestration/restart-pending      Record artifact write
POST /api/orchestration/execute-restart      Execute pending restart

# Context Management
GET  /api/context/pending/:session_id        Get pending context injections
POST /api/context/inject                     Queue context for injection
```

---

## Part 11: Claude-Mem Intelligence Layer

### Seven Empowerment Roles

```
+-------------------------------------------------------------------------+
|  CLAUDE-MEM EMPOWERMENT ROLES                                            |
|                                                                          |
|  1. OBSERVATION LAYER                                                    |
|     Track what patterns agents actually implement                       |
|     Record file placements, configurations used, utilities called       |
|                                                                          |
|  2. VARIANCE DETECTION                                                   |
|     Compare implementations across sessions                             |
|     Detect when same task produces different results                    |
|     Identify interpretation variance in memory patterns                 |
|                                                                          |
|  3. MEMORY VALIDATION                                                    |
|     Verify agents follow memory patterns                                |
|     Detect when implementations diverge from documented patterns        |
|     Alert when memory content isn't being followed                      |
|                                                                          |
|  4. UPDATE SUGGESTIONS                                                   |
|     Suggest memory updates when patterns drift                          |
|     Recommend file ownership updates after structural changes           |
|     Propose new shared utilities when duplication detected              |
|                                                                          |
|  5. ADJACENCY DETECTION                                                  |
|     Detect when new areas need CLAUDE.md                                |
|     Track file activity patterns                                        |
|     Surface promotion opportunities (subdir meeting thresholds)         |
|                                                                          |
|  6. STALENESS ALERTS                                                     |
|     Detect when memory patterns have drifted from actual code           |
|     Alert when documented utilities are no longer used                  |
|     Flag outdated file ownership maps                                   |
|                                                                          |
|  7. SPECIALIST TRIGGERS                                                  |
|     Surface when variance warrants specialist creation                  |
|     Identify variance-critical values from observation patterns         |
|     Generate specialist templates with minimal embedded content         |
+-------------------------------------------------------------------------+
```

### Memory-to-Specialist Evolution

```
STAGE 1: Memory Only
--------------------
src/services/billing/CLAUDE.md:
"Uses BullMQ for queues. Implement retry with backoff."

General agents work here, interpret patterns each time.

STAGE 2: Variance Detected
--------------------------
Claude-mem detects:
- Session 1 used attempts: 3, delay: 1000
- Session 2 used attempts: 5, delay: 2000
- Session 3 used attempts: 3, delay: 500

Variance report: "Queue configuration inconsistent across sessions"

STAGE 3: Specialist Recommended
-------------------------------
System surfaces opportunity:
"Billing area has implementation variance. Recommend specialist."

STAGE 4: Specialist Created
---------------------------
User approves. System generates billing-specialist with:
- EXACT queue configuration (from most recent/correct implementation)
- Methodology (standard)
- Memory reference for everything else

STAGE 5: Memory Simplified
--------------------------
src/services/billing/CLAUDE.md updated:
"Handled by billing-specialist agent. See agent for variance-critical values."

Memory becomes pointer, specialist embeds only variance-critical content.
```

---

## Part 12: Implementation Details

### Complete Database Schema

```sql
-- Session hierarchy
CREATE TABLE session_hierarchy (
  session_id TEXT PRIMARY KEY,
  parent_session_id TEXT,
  root_session_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Pending restarts
CREATE TABLE pending_restarts (
  id INTEGER PRIMARY KEY,
  root_session_id TEXT NOT NULL,
  triggered_by_session TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  active_subagents INTEGER DEFAULT 0,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP
);

-- GitHub cache
CREATE TABLE github_issues (
  id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  state TEXT,
  labels JSON,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo, number)
);

CREATE TABLE github_comments (
  id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  body TEXT,
  author TEXT,
  created_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File operations
CREATE TABLE file_operations (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  operation TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  content_summary TEXT,
  timestamp INTEGER NOT NULL
);

-- Session affected areas
CREATE TABLE session_affected_areas (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  area_path TEXT NOT NULL,
  operation_count INTEGER NOT NULL,
  primary_activity TEXT NOT NULL
);

-- Agent candidates
CREATE TABLE agent_candidates (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  area_path TEXT NOT NULL,
  confidence REAL NOT NULL,
  rationale TEXT,
  detected_patterns JSON,
  suggested_name TEXT,
  suggested_scope JSON,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memory opportunities
CREATE TABLE memory_opportunities (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  directory_path TEXT NOT NULL,
  reason TEXT NOT NULL,
  file_count INTEGER,
  loc_total INTEGER,
  confidence REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Static pattern cache
CREATE TABLE static_patterns (
  id INTEGER PRIMARY KEY,
  pattern_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  areas JSON NOT NULL,
  occurrences INTEGER DEFAULT 1,
  last_validated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross-cutting dependency cache
CREATE TABLE cross_cutting_deps (
  id INTEGER PRIMARY KEY,
  area_path TEXT NOT NULL,
  imports JSON NOT NULL,
  last_scanned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Navigation cache
CREATE TABLE navigation_cache (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  root_claude_md_hash TEXT,
  functional_areas JSON,
  keyword_mapping JSON,
  agent_routing JSON,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Worker API Endpoints

```
# Session Management
POST /api/sessions/register                  Register session
POST /api/sessions/complete                  Mark complete

# Orchestration
GET  /api/orchestration/restart-pending/:id  Check pending restart
POST /api/orchestration/restart-pending      Record artifact write
POST /api/orchestration/execute-restart      Execute restart

# GitHub Integration
GET  /api/github/issues/:number              Cached issue
GET  /api/github/issues/:number/comments     Cached comments
POST /api/github/issues/:number/comments     Post + cache
GET  /api/github/prs/:number                 Cached PR
POST /api/webhooks/github                    Webhook receiver

# Context
GET  /api/context/pending/:session_id        Pending context
POST /api/context/inject                     Queue injection

# Foreman Integration
GET  /api/foreman/issue/:number/context      Pre-assembled context
GET  /api/foreman/rules/for-labels           Label-matched rules

# Memory & Agents
GET  /api/memory/opportunities               List opportunities
POST /api/memory/opportunities/:id/create    Create CLAUDE.md
GET  /api/agents/candidates                  List candidates
POST /api/agents/candidates/:id/create       Create agent

# Navigation
GET  /api/navigation/:projectId              Cached navigation
POST /api/navigation/:projectId/refresh      Rebuild cache

# Intelligence
POST /api/cross-cutting/analyze              Analyze overlap
POST /api/suggestions/agents                 Get suggestions
GET  /api/patterns/:area                     Cached patterns
```

### Success Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Restart Safety | 100% | Restarts occur at prompt boundaries |
| Subagent Handling | 100% | Session hierarchies tracked correctly |
| GitHub Cache Hit Rate | >95% | After warmup period |
| Webhook Latency | <1 second | From GitHub event to cache update |
| Token Reduction | 40%+ | For GitHub-related operations |
| Orchestrator Context | <200 tokens | Root memory only |
| Specialist Context | <1000 tokens | Lean hybrid model |
| Implementation Consistency | 95%+ | From specialist agents |
| Placement Consistency | 95%+ | Code in correct module |
| DRY Compliance | <5% | Utility duplication |
| Memory Coverage | 95%+ | Directories with CLAUDE.md |
| Variance Detection | 90%+ | Detected within 3 sessions |

---

## Appendix A: Memory Template (Complete)

```markdown
# {Area} Memory

## Purpose & Entry Points
- {WHAT_THIS_DOES}
- Main entry: {MAIN_ENTRY_FILE}

## File Ownership Map
| Concern | Owner File | Never In |
|---------|------------|----------|
| {CONCERN_1} | {FILE_1} | {EXCLUSIONS_1} |
| {CONCERN_2} | {FILE_2} | {EXCLUSIONS_2} |

## Shared Utilities (DRY Enforcement)
- {UTILITY_1}: @{PATH_1} (USE THIS, don't create new)
- {UTILITY_2}: @{PATH_2} (extend if needed)

## Module Boundaries
- This module owns: {OWNED_CONCERNS}
- This module NEVER handles: {EXCLUDED_CONCERNS}
- Cross-module needs: Import from @{OTHER_MODULE}, never duplicate

## Extension vs Creation
- {SCENARIO_1} -> Extend {FILE}, don't create new
- {SCENARIO_2} -> Add to {FILE}, new case/branch
- {SCENARIO_3} -> Create in {FOLDER}/ (new concern)

## Patterns (Implementation Guidance)
- {PATTERN_1}
- {PATTERN_2}

## Dependencies
@{CROSS_CUTTING_1}
@{CROSS_CUTTING_2}

## File Structure Notes
- Current largest: {FILE} ({LOC} LOC) - near/at limit
- Planned split: {FUTURE_SPLIT_IF_KNOWN}
```

---

## Appendix B: Lean Specialist Template (Complete)

```markdown
# {Area} Specialist (~700 tokens)

## Purpose
Specialized agent for {area} with consistency guarantees for variance-critical values.

## Methodology
Standard TDD workflow. Follow memory for placement and patterns.

## Variance-Critical Values

**CRITICAL: These exact values must be used. No interpretation allowed.**

```typescript
// Queue Configuration
const {AREA}_QUEUE_CONFIG = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500
};

// Retry Parameters
const {AREA}_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000,
  jitterMs: 100
};

// Timeout Values
const {AREA}_TIMEOUT_CONFIG = {
  requestTimeout: 5000,
  socketTimeout: 30000
};
```

## Memory Reference

For all other guidance, read the area memory:
- `{area}/CLAUDE.md` for file ownership and patterns
- Follow @path dependencies for cross-cutting concerns

Do NOT embed what memory provides. Trust the memory system.

## When to Embed vs Reference

| Need | Action |
|------|--------|
| Where to place code | Read memory |
| What patterns to follow | Read memory |
| Which utilities to use | Read memory |
| What exact config values | Use embedded values above |
```

---

## Appendix C: Context Loading Comparison

```
v11-v12 (Bloated):
Agent loads: 1500 tokens (methodology + embedded memory content)
Runtime loads: 400 tokens (memory again)
Total: 1900 tokens
Duplication: ~400 tokens

v13 (Lean):
Agent loads: 700 tokens (methodology + variance-critical only)
Runtime loads: 400 tokens (memory, source of truth)
Total: 1100 tokens
Duplication: 0 tokens

Savings: 800 tokens (42% reduction)
```

---

## Appendix D: Layer Responsibility Matrix

| Responsibility | Orchestration | Memory | General Agent | Specialist |
|----------------|---------------|--------|---------------|------------|
| Route to module | X | | | |
| Know file ownership | | X | Reads | Reference |
| Know shared utilities | | X | Reads | Reference |
| Know module boundaries | | X | Reads | Reference |
| Describe patterns | | X | | |
| Execute methodology | | | X | X |
| **Guarantee implementation** | | | | X |
| **Guarantee placement** | | | | X |
| Embed variance-critical | | | | X |
| Enforce DRY | | Describes | Follows | Reference |
| Detect variance | Hook | | | |
