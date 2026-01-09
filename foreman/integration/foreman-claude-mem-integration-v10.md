# Foreman + Claude-Mem Integration Specification v10

## Executive Summary

v10 addresses **cross-cutting coordination and dynamic context injection**: How do we select agents when work spans multiple areas with shared cross-cutting concerns? How do we inject agent suggestions at prompt time without bloat? How do we handle areas without specialized agents? How do we separate static methodology from dynamic requirements?

**Core Insight**: Cross-cutting concerns create a shared context problem. When multiple areas reference the same cross-cutting CLAUDE.md, multiple agents might redundantly load it. The solution is **coordinating agent selection** and **context deduplication**.

**Key Additions:**
1. Cross-cutting aware agent selection (single coordinator vs sequential handoff)
2. Hook-driven agent suggestions at UserPromptSubmit
3. WHAT-not-HOW orchestration pattern for general agents
4. Static/dynamic separation via observation-backed patterns

---

## Part 1: Cross-Cutting Concerns in Agent Selection

### The Cross-Cutting Context Problem

Foreman's memory system has cross-cutting CLAUDE.md files:
- `docs/security/CLAUDE.md` - Authentication, authorization, input validation
- `docs/api/CLAUDE.md` - API contracts, versioning, error formats
- `docs/ops/CLAUDE.md` - Logging, metrics, tracing
- `db/CLAUDE.md` - Schema, migrations, query patterns

These are imported via `@` syntax in area CLAUDE.md Dependencies sections:

```markdown
# src/services/billing/CLAUDE.md

## Dependencies
@../../docs/security/CLAUDE.md
@../../docs/api/CLAUDE.md
```

```markdown
# src/api/payments/CLAUDE.md

## Dependencies
@../../docs/security/CLAUDE.md
@../../docs/api/CLAUDE.md
```

**The Problem:**
```
Work item: "Update billing webhook to include new payment status in API"

Affected areas:
- src/services/billing/ (webhook logic)
- src/api/payments/ (API response)

Both areas import:
- docs/security/CLAUDE.md
- docs/api/CLAUDE.md

If we launch two agents:
- Agent 1 loads: billing/CLAUDE.md + security + api = ~280 tokens
- Agent 2 loads: payments/CLAUDE.md + security + api = ~280 tokens
- Shared cross-cutting: ~200 tokens DUPLICATED
```

### Solution: Cross-Cutting Aware Agent Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AGENT SELECTION WITH CROSS-CUTTING ANALYSIS                             │
│                                                                          │
│  Input: Work item affecting multiple areas                               │
│                                                                          │
│  Step 1: Identify affected areas                                         │
│  - src/services/billing/                                                │
│  - src/api/payments/                                                    │
│                                                                          │
│  Step 2: Analyze cross-cutting overlap                                   │
│  - Read each area's Dependencies section (without loading content)       │
│  - billing imports: @security, @api                                     │
│  - payments imports: @security, @api                                    │
│  - Overlap: security (100%), api (100%)                                 │
│                                                                          │
│  Step 3: Calculate coordination score                                    │
│  - High overlap (>70%) + same suggested agent → SINGLE COORDINATOR      │
│  - Medium overlap (40-70%) → SEQUENTIAL WITH HANDOFF                    │
│  - Low overlap (<40%) → PARALLEL INDEPENDENT                            │
│                                                                          │
│  Step 4: Select execution strategy                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Strategy 1: Single Coordinating Agent (High Overlap)

When affected areas share >70% of cross-cutting concerns AND are covered by the same agent type:

```typescript
interface CoordinatedExecution {
  strategy: 'single_coordinator';
  agent: string;
  scope: string[];              // All affected areas
  cross_cutting_load: string[]; // Load once, applies to all
  work_items: WorkItem[];       // Sequential within single agent
}

// Example
const execution: CoordinatedExecution = {
  strategy: 'single_coordinator',
  agent: 'backend-architect',
  scope: ['src/services/billing/', 'src/api/payments/'],
  cross_cutting_load: ['docs/security/CLAUDE.md', 'docs/api/CLAUDE.md'],
  work_items: [
    { area: 'src/services/billing/', task: 'Update webhook to emit new status' },
    { area: 'src/api/payments/', task: 'Add status field to API response' }
  ]
};

// Single agent loads cross-cutting ONCE, handles both areas
// Context: ~380 tokens (not ~560 with duplication)
```

**Agent Launch Instruction:**
```markdown
You are working on a coordinated change spanning multiple areas.

## Scope
- src/services/billing/ (primary)
- src/api/payments/ (secondary)

## Cross-Cutting Context (load once)
Read these cross-cutting concerns first - they apply to ALL areas:
- docs/security/CLAUDE.md
- docs/api/CLAUDE.md

## Work Items (sequential)
1. In src/services/billing/: Update webhook to emit new payment status
2. In src/api/payments/: Add status field to API response

## Execution
1. Read cross-cutting concerns (security, API patterns)
2. Read src/services/billing/CLAUDE.md for billing patterns
3. Complete billing work item
4. Read src/api/payments/CLAUDE.md for API patterns
5. Complete API work item
6. Verify consistency across both areas
```

### Strategy 2: Sequential with Handoff (Medium Overlap)

When affected areas share 40-70% of cross-cutting concerns OR require different agent types:

```typescript
interface SequentialExecution {
  strategy: 'sequential_handoff';
  agents: Array<{
    agent: string;
    area: string;
    cross_cutting: string[];
  }>;
  handoff: {
    shared_context: string;     // What first agent learned that second needs
    cross_cutting_summary: string; // Avoid second agent re-reading
  };
}

// Example
const execution: SequentialExecution = {
  strategy: 'sequential_handoff',
  agents: [
    {
      agent: 'backend-architect',
      area: 'src/services/billing/',
      cross_cutting: ['docs/security/CLAUDE.md', 'docs/api/CLAUDE.md']
    },
    {
      agent: 'frontend-developer',
      area: 'web/src/components/billing/',
      cross_cutting: ['docs/api/CLAUDE.md']  // Only API, not security
    }
  ],
  handoff: {
    shared_context: 'New payment status "processing_retry" added to webhook',
    cross_cutting_summary: 'API uses camelCase, error format: { error: { code, message } }'
  }
};
```

**Handoff Protocol:**
```
Agent 1 (backend-architect):
├── Reads docs/security/CLAUDE.md
├── Reads docs/api/CLAUDE.md
├── Reads src/services/billing/CLAUDE.md
├── Completes billing work
└── Outputs handoff summary:
    "Added 'processing_retry' status to webhook payload.
     API contract: { status: 'processing_retry', retryCount: number }
     Security note: Status logged without PII."

Agent 2 (frontend-developer):
├── Receives handoff summary (NOT full cross-cutting files)
├── Reads web/src/components/billing/CLAUDE.md
├── Completes frontend work using handoff context
└── Does NOT re-read docs/api/CLAUDE.md (has summary)
```

### Strategy 3: Parallel Independent (Low Overlap)

When affected areas share <40% of cross-cutting concerns:

```typescript
interface ParallelExecution {
  strategy: 'parallel_independent';
  agents: Array<{
    agent: string;
    area: string;
    cross_cutting: string[];
  }>;
  // No handoff needed - work is independent
}
```

### Cross-Cutting Overlap Calculation

```typescript
interface CrossCuttingAnalysis {
  area: string;
  imports: string[];          // @ imports from Dependencies section
}

function calculateOverlap(areas: CrossCuttingAnalysis[]): number {
  if (areas.length < 2) return 1.0;

  // Find common imports across all areas
  const allImports = new Set(areas.flatMap(a => a.imports));
  const commonImports = areas[0].imports.filter(imp =>
    areas.every(a => a.imports.includes(imp))
  );

  return commonImports.length / allImports.size;
}

function selectExecutionStrategy(
  workItem: WorkItem,
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

### Impact on Agent Opportunity Detection

Cross-cutting awareness affects when we recommend agent creation:

```typescript
function shouldCreateAgentForScope(scope: ScopeAnalysis): AgentRecommendation {
  // ... existing checks from v8 ...

  // NEW: Cross-cutting coordination check
  const crossCuttingDeps = scope.areas.flatMap(a => a.cross_cutting_imports);
  const uniqueDeps = [...new Set(crossCuttingDeps)];

  // If scope has many unique cross-cutting dependencies,
  // a specialized agent that understands all of them is valuable
  if (uniqueDeps.length >= 3 && scope.prescriptive_concentration > 0.5) {
    return {
      recommend: true,
      reason: 'Multiple cross-cutting concerns with concentrated prescriptive patterns',
      cross_cutting_specialization: uniqueDeps
    };
  }

  // ... rest of checks ...
}
```

---

## Part 2: Hook-Driven Agent Suggestions

### The Opportunity: UserPromptSubmit Context Injection

When a prompt is submitted, the hook can analyze it and inject minimal agent guidance:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USERRPROMPTSUBMIT HOOK: AGENT SUGGESTION INJECTION                      │
│                                                                          │
│  Prompt: "Fix the subscription renewal webhook"                          │
│                                                                          │
│  Hook Analysis:                                                          │
│  1. Extract keywords: [subscription, renewal, webhook]                   │
│  2. Match to areas: src/services/billing/ (webhook, subscription)       │
│  3. Check for specialized agents: billing-specialist? NO                │
│  4. Identify general agents: backend-architect covers billing           │
│  5. Check observation patterns: High error rate in billing webhooks     │
│                                                                          │
│  Injected Context (50-80 tokens):                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  <agent-suggestions>                                             │    │
│  │  Area: src/services/billing/webhooks/                           │    │
│  │  Suggested: backend-architect (general coverage)                │    │
│  │  Note: No specialized agent exists. Consider area CLAUDE.md.    │    │
│  │  Pattern: Recent sessions show webhook signature issues.        │    │
│  │  </agent-suggestions>                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// UserPromptSubmit hook extension
async function injectAgentSuggestions(
  prompt: string,
  session_id: string
): Promise<AgentSuggestion | null> {

  // Step 1: Extract likely areas from prompt
  const keywords = extractKeywords(prompt);
  const matchedAreas = await matchKeywordsToAreas(keywords);

  if (matchedAreas.length === 0) return null;

  // Step 2: Find agents for matched areas
  const agentMatches: AgentMatch[] = [];

  for (const area of matchedAreas) {
    const specialized = await findSpecializedAgent(area.path);
    const general = await findGeneralAgent(area.path);

    agentMatches.push({
      area: area.path,
      specialized: specialized?.name || null,
      general: general.name,
      hasSpecialized: !!specialized
    });
  }

  // Step 3: Get relevant observation patterns
  const patterns = await getRelevantPatterns(matchedAreas.map(a => a.path));

  // Step 4: Build minimal suggestion context
  return {
    areas: matchedAreas.map(a => a.path),
    agents: agentMatches,
    patterns: patterns.slice(0, 2),  // Max 2 patterns to keep context minimal
    totalTokens: estimateTokens(agentMatches, patterns)
  };
}

// Hook integration
async function userPromptSubmitHook(input: UserPromptSubmitInput): Promise<HookResult> {
  const suggestions = await injectAgentSuggestions(input.prompt, input.session_id);

  if (suggestions && suggestions.totalTokens < 100) {
    // Inject as context, not blocking
    return {
      result: 'continue',
      context_injection: formatAgentSuggestions(suggestions)
    };
  }

  return { result: 'continue' };
}

function formatAgentSuggestions(suggestions: AgentSuggestion): string {
  const lines = ['<agent-suggestions>'];

  for (const match of suggestions.agents) {
    lines.push(`Area: ${match.area}`);
    if (match.hasSpecialized) {
      lines.push(`Specialized: ${match.specialized}`);
    } else {
      lines.push(`General: ${match.general} (no specialized agent)`);
    }
  }

  if (suggestions.patterns.length > 0) {
    lines.push(`Recent patterns: ${suggestions.patterns.join('; ')}`);
  }

  lines.push('</agent-suggestions>');
  return lines.join('\n');
}
```

### Context Budget for Suggestions

```typescript
const SUGGESTION_BUDGET = {
  max_areas: 3,           // Don't suggest more than 3 areas
  max_patterns: 2,        // At most 2 observation patterns
  max_tokens: 100,        // Hard limit on injection size
  pattern_max_chars: 80   // Truncate pattern descriptions
};

function enforceContextBudget(suggestions: AgentSuggestion): AgentSuggestion {
  return {
    areas: suggestions.areas.slice(0, SUGGESTION_BUDGET.max_areas),
    agents: suggestions.agents.slice(0, SUGGESTION_BUDGET.max_areas),
    patterns: suggestions.patterns
      .slice(0, SUGGESTION_BUDGET.max_patterns)
      .map(p => truncate(p, SUGGESTION_BUDGET.pattern_max_chars)),
    totalTokens: Math.min(suggestions.totalTokens, SUGGESTION_BUDGET.max_tokens)
  };
}
```

---

## Part 3: WHAT-not-HOW for General Agents

### The Problem: Orchestrator Over-Specification

When no specialized agent exists, orchestrators sometimes:
- Try to provide detailed HOW instructions (bloating context)
- Read area CLAUDE.md themselves (duplicating what subagent will read)
- Micromanage instead of delegating

### The Solution: WHAT-not-HOW Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR KNOWS                    SUBAGENT LEARNS                   │
│  ─────────────────                    ───────────────                    │
│  WHAT: Outcome needed                 HOW: From area CLAUDE.md           │
│  WHERE: Which area                    PATTERNS: From area conventions    │
│  WHO: Which agent type                CONSTRAINTS: From Do/Don't         │
│  WHY: Business context                DEPENDENCIES: From @ imports       │
│                                                                          │
│  Orchestrator provides:               Subagent reads:                    │
│  - "Implement retry logic"            - Area patterns                    │
│  - "In billing webhooks"              - Error handling conventions       │
│  - "Using backend-architect"          - Queue configuration              │
│  - "For failed Stripe events"         - Security requirements            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Orchestrator Launch Template

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

### Example: No Specialized Agent

```
User: "Add retry logic for failed Stripe webhooks"

Orchestrator Analysis:
├── Area: src/services/billing/webhooks/
├── Specialized agent: NONE
├── General agent: backend-architect
└── Orchestrator knows: WHAT (retry logic), WHERE (webhooks), WHY (failed events)

Orchestrator Launch (WHAT-not-HOW):
┌─────────────────────────────────────────────────────────────────────────┐
│  Task for backend-architect                                              │
│                                                                          │
│  WHAT: Implement retry logic for failed Stripe webhook events           │
│  WHERE: src/services/billing/webhooks/                                  │
│  WHY: Failed webhook events are currently lost, need retry mechanism    │
│                                                                          │
│  Instructions:                                                           │
│  1. Read src/services/billing/webhooks/CLAUDE.md                        │
│  2. Follow @ imports for security and API patterns                      │
│  3. Implement retry logic using the patterns you find                   │
│  4. You determine HOW - the area memory has the conventions             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

backend-architect Execution:
├── Reads src/services/billing/webhooks/CLAUDE.md
│   → Learns: "Uses BullMQ for queues"
│   → Learns: "Idempotency required"
│   → Learns: "3 retry attempts max"
├── Follows @docs/security/CLAUDE.md
│   → Learns: "Validate signatures before processing"
├── Implements retry logic using discovered patterns
└── Orchestrator never specified queue library, retry count, etc.
```

### Enforcing WHAT-not-HOW

```typescript
interface OrchestratorLaunch {
  what: string;          // Outcome description (required)
  where: string;         // Area path (required)
  why: string;           // Business context (required)
  how?: never;           // EXPLICITLY FORBIDDEN
}

function validateOrchestratorLaunch(launch: OrchestratorLaunch): void {
  if ('how' in launch) {
    throw new Error(
      'Orchestrator should not specify HOW. ' +
      'The subagent learns HOW from area CLAUDE.md.'
    );
  }

  if (launch.what.includes('using') || launch.what.includes('with')) {
    console.warn(
      'Launch description may contain HOW details. ' +
      'Consider: describe outcome, not implementation.'
    );
  }
}

function buildLaunchPrompt(launch: OrchestratorLaunch): string {
  return `
## Task for subagent

### WHAT (Outcome)
${launch.what}

### WHERE (Scope)
Area: ${launch.where}

### WHY (Context)
${launch.why}

### Instructions
1. Read ${launch.where}/CLAUDE.md for patterns and constraints
2. Follow @ imports for cross-cutting concerns
3. Implement the outcome using area conventions
4. You determine HOW based on what you learn from the area memory
`.trim();
}
```

---

## Part 4: Static vs Dynamic Separation

### The Problem: Methodology in Commands

Commands like `/start-issue` and `/add-functionality` currently might include:
- How to plan (static methodology)
- TDD workflow (static methodology)
- Agent sequencing patterns (static methodology)

This bloats command execution with repeated instructions.

### The Solution: Observation-Backed Static Patterns

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STATIC PATTERNS                        DYNAMIC REQUIREMENTS             │
│  (Embedded in agents/observations)      (Injected per request)           │
│  ─────────────────────────────          ──────────────────────           │
│  How to plan                            What issue/functionality          │
│  TDD methodology                        Which areas affected              │
│  Error handling patterns                Current project state             │
│  Code style conventions                 Specific constraints              │
│  Agent sequencing                       Dependencies to consider          │
│                                                                          │
│  SOURCE: Agent instructions +           SOURCE: Request parsing +         │
│          Observation patterns                   Navigation lookup +        │
│          CLAUDE.md conventions                  GitHub issue context       │
│                                                                          │
│  LOADED: Agent initialization           LOADED: Per-request injection     │
│  (once per agent launch)                (hook at prompt time)            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Static Pattern Sources

**1. Agent Instructions (Already Loaded)**
```markdown
# backend-architect Agent

## Methodology (STATIC - embedded in agent)
- Use TDD: Write test first, then implementation
- Follow existing patterns in area CLAUDE.md
- Error handling: Use project's error classes
- Logging: Use structured logging with correlation IDs

## Execution (applies to every task)
1. Read area CLAUDE.md
2. Write failing test
3. Implement to pass test
4. Refactor if needed
5. Verify all tests pass
```

**2. Observation-Backed Patterns (Cached)**
```typescript
interface StaticPattern {
  pattern_id: string;
  source: 'observation' | 'convention' | 'agent_instruction';
  content: string;
  areas: string[];           // Which areas this applies to
  last_validated: timestamp; // When pattern was last confirmed
}

// Cached in worker, derived from observations
const cachedPatterns: StaticPattern[] = [
  {
    pattern_id: 'billing-queue-pattern',
    source: 'observation',
    content: 'Billing services use BullMQ with 3 retry attempts',
    areas: ['src/services/billing/'],
    last_validated: Date.now()
  },
  {
    pattern_id: 'api-error-format',
    source: 'convention',
    content: 'API errors use { error: { code, message, details } }',
    areas: ['src/api/'],
    last_validated: Date.now()
  }
];
```

### Dynamic Requirement Injection

Commands inject ONLY dynamic content:

```typescript
interface DynamicContext {
  // What's being requested
  request: {
    type: 'issue' | 'functionality';
    description: string;
    source?: string;           // GitHub issue URL, user description
  };

  // What areas are involved
  routing: {
    affected_areas: string[];
    suggested_agents: string[];
    cross_cutting: string[];
  };

  // Current state (if relevant)
  state?: {
    recent_changes: string[];  // Files modified recently
    failing_tests: string[];   // If any
    open_prs: string[];        // Related PRs
  };
}

// Command builds ONLY dynamic context
async function buildDynamicContext(input: CommandInput): Promise<DynamicContext> {
  return {
    request: {
      type: input.type,
      description: input.description,
      source: input.source
    },
    routing: await routeToAreas(input.description),
    state: await getCurrentState()
  };
}

// Command does NOT include:
// - How to plan (agent knows)
// - TDD methodology (agent knows)
// - Error handling patterns (area CLAUDE.md has)
// - Agent sequencing (orchestration pattern handles)
```

### Command Simplification

**Before (Bloated):**
```markdown
# /start-issue Command

## Planning Methodology
When starting an issue, follow these steps:
1. Analyze the issue requirements
2. Break down into subtasks
3. Identify affected areas
4. Select appropriate agents
5. Use TDD for implementation
6. Write tests before code
7. Follow error handling patterns
...
(200+ tokens of methodology)

## Execution
{dynamic content}
```

**After (Dynamic Only):**
```markdown
# /start-issue Command

## Purpose
Start work on a GitHub issue.

## Execution
1. Fetch issue context
2. Build dynamic routing context
3. Launch appropriate agent with WHAT-not-HOW

## Dynamic Context Injection
- Issue: {ISSUE_NUMBER}
- Areas: {ROUTED_AREAS}
- Agent: {SELECTED_AGENT}

(Agent already knows HOW to plan from its own instructions)
```

### Observation-to-Pattern Promotion

Claude-mem can detect when observations should become cached patterns:

```typescript
async function detectPatternCandidates(): Promise<PatternCandidate[]> {
  const observations = await getRecentObservations(30);

  // Group by area
  const areaGroups = groupByArea(observations);
  const candidates: PatternCandidate[] = [];

  for (const [area, obs] of areaGroups) {
    // Find repeated behaviors
    const behaviors = extractBehaviors(obs);
    const repeated = behaviors.filter(b => b.occurrences >= 3);

    for (const behavior of repeated) {
      candidates.push({
        area,
        pattern: behavior.description,
        occurrences: behavior.occurrences,
        confidence: behavior.occurrences / obs.length,
        source_observations: behavior.observation_ids
      });
    }
  }

  return candidates;
}

// Promoted patterns become static (cached)
async function promoteToStaticPattern(candidate: PatternCandidate): Promise<void> {
  await cachePattern({
    pattern_id: generatePatternId(candidate),
    source: 'observation',
    content: candidate.pattern,
    areas: [candidate.area],
    last_validated: Date.now()
  });
}
```

---

## Part 5: Unified Integration Model

### Complete Flow with All v10 Concepts

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER PROMPT: "Add retry logic for failed Stripe webhooks"               │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  USERPROMPTSUBMIT HOOK                                                   │
│                                                                          │
│  1. Extract keywords: [retry, Stripe, webhooks]                          │
│  2. Match areas: src/services/billing/webhooks/                         │
│  3. Check specialized agents: None                                       │
│  4. Identify general: backend-architect                                 │
│  5. Get patterns: "Webhook processing uses BullMQ"                      │
│                                                                          │
│  Inject (80 tokens):                                                     │
│  <agent-suggestions>                                                     │
│  Area: src/services/billing/webhooks/                                   │
│  Agent: backend-architect (no specialized agent)                        │
│  Pattern: Uses BullMQ for async processing                              │
│  </agent-suggestions>                                                    │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR (Root Memory Only)                                         │
│                                                                          │
│  Reads: ./CLAUDE.md (100 tokens)                                        │
│  - Service Map: billing → src/services/billing/                         │
│  - Agent routing: billing → backend-architect                           │
│                                                                          │
│  Does NOT read: Area CLAUDE.md (subagent will)                          │
│                                                                          │
│  Cross-cutting analysis:                                                 │
│  - src/services/billing/webhooks/ imports @security, @api              │
│  - Single area → Single coordinator strategy                            │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BUILD DYNAMIC CONTEXT (No static methodology)                           │
│                                                                          │
│  Dynamic only:                                                           │
│  - WHAT: "Implement retry logic for failed webhook events"              │
│  - WHERE: src/services/billing/webhooks/                                │
│  - WHY: "Failed events currently lost"                                  │
│                                                                          │
│  NOT included (static, agent knows):                                     │
│  - How to plan                                                          │
│  - TDD methodology                                                      │
│  - Error handling patterns                                              │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAUNCH SUBAGENT (WHAT-not-HOW)                                          │
│                                                                          │
│  To: backend-architect                                                   │
│                                                                          │
│  WHAT: Implement retry logic for failed Stripe webhook events           │
│  WHERE: src/services/billing/webhooks/                                  │
│  WHY: Failed webhook events are currently lost                          │
│                                                                          │
│  Instructions:                                                           │
│  1. Read area CLAUDE.md for patterns                                    │
│  2. Follow @ imports for cross-cutting                                  │
│  3. YOU determine HOW from what you learn                               │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SUBAGENT EXECUTION                                                      │
│                                                                          │
│  Reads area CLAUDE.md:                                                   │
│  - Pattern: BullMQ for queues                                           │
│  - Pattern: 3 retry attempts max                                        │
│  - Do: Validate signatures before processing                            │
│  - Don't: Process without idempotency check                             │
│                                                                          │
│  Follows @imports:                                                       │
│  - docs/security/CLAUDE.md → Webhook signature validation               │
│  - docs/api/CLAUDE.md → Error response format                           │
│                                                                          │
│  Implements using discovered patterns (TDD from agent instructions)     │
│                                                                          │
│  Context used:                                                           │
│  - Hook suggestion: 80 tokens                                           │
│  - Orchestrator navigation: 100 tokens                                  │
│  - Subagent area + cross-cutting: 280 tokens                           │
│  - Total: 460 tokens (minimal, no duplication)                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Implementation Requirements

### Database Extensions

```sql
-- Cross-cutting dependency cache
CREATE TABLE cross_cutting_deps (
  id INTEGER PRIMARY KEY,
  area_path TEXT NOT NULL,
  imports JSON NOT NULL,          -- Array of @import paths
  last_scanned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cc_deps_area ON cross_cutting_deps(area_path);

-- Static pattern cache
CREATE TABLE static_patterns (
  id INTEGER PRIMARY KEY,
  pattern_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,           -- 'observation' | 'convention' | 'agent_instruction'
  content TEXT NOT NULL,
  areas JSON NOT NULL,            -- Array of area paths
  occurrences INTEGER DEFAULT 1,
  last_validated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patterns_area ON static_patterns((json_each.value))
  WHERE json_each.value IS NOT NULL;
```

### New Worker Endpoints

```
# Cross-cutting analysis
POST /api/cross-cutting/analyze
  Body: { areas: string[] }
  Returns: { overlap: number, strategy: string, shared: string[] }

# Agent suggestions
POST /api/suggestions/agents
  Body: { prompt: string }
  Returns: { areas: string[], agents: AgentMatch[], patterns: string[] }

# Static patterns
GET  /api/patterns/:area           Get cached patterns for area
POST /api/patterns/promote         Promote observation to static pattern
```

### Hook Extensions

```typescript
// UserPromptSubmit: Agent suggestion injection
async function userPromptSubmitHook(input: UserPromptSubmitInput): Promise<HookResult> {
  // ... existing restart check ...

  // Agent suggestion injection
  const suggestions = await getAgentSuggestions(input.prompt);
  if (suggestions) {
    return {
      result: 'continue',
      context_injection: formatSuggestions(suggestions)
    };
  }

  return { result: 'continue' };
}

// PostToolUse: Cross-cutting dependency tracking
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  if (input.tool_name === 'Read' && input.file_path.endsWith('CLAUDE.md')) {
    // Extract and cache @imports
    const content = input.tool_result?.content;
    const imports = extractImports(content);
    await cacheCrossCuttingDeps(path.dirname(input.file_path), imports);
  }
}
```

---

## Part 7: What v10 Adds Over v9

| Capability | v9 | v10 |
|------------|----|----|
| Cross-cutting agent selection | Not addressed | Overlap-based strategy selection |
| Multi-area work | Sequential assumed | Coordinator/handoff/parallel strategies |
| Hook agent suggestions | None | Prompt-time injection (<100 tokens) |
| Orchestrator instructions | Unspecified | WHAT-not-HOW pattern enforced |
| General agent fallback | Implied | Explicit WHAT-WHERE-WHY template |
| Static methodology | In commands | Embedded in agents (not repeated) |
| Dynamic context | Mixed with static | Clean separation |
| Pattern caching | None | Observation-backed static patterns |

---

## Part 8: Success Metrics

1. **Cross-cutting deduplication**: 50%+ reduction in redundant cross-cutting reads
2. **Hook suggestion accuracy**: 80%+ of suggestions match final agent selection
3. **WHAT-not-HOW compliance**: 0 orchestrator launches with HOW instructions
4. **Command size reduction**: 60%+ reduction in command token count (static removed)
5. **Pattern promotion rate**: 10+ patterns promoted from observations per month

---

## Appendix A: Cross-Cutting Strategy Decision Table

| Overlap | Agent Types | Strategy | Context Savings |
|---------|-------------|----------|-----------------|
| >70% | Same | Single Coordinator | 40-50% |
| >70% | Different | Sequential Handoff | 30-40% |
| 40-70% | Same | Sequential Handoff | 20-30% |
| 40-70% | Different | Sequential Handoff | 20-30% |
| <40% | Any | Parallel Independent | 0% (no overlap) |

---

## Appendix B: WHAT-not-HOW Examples

**Good (WHAT-only):**
```
WHAT: Implement retry mechanism for failed events
WHERE: src/services/billing/webhooks/
WHY: Failed webhook events are currently lost
```

**Bad (includes HOW):**
```
WHAT: Implement retry mechanism using BullMQ with exponential backoff
WHERE: src/services/billing/webhooks/
WHY: Failed webhook events are currently lost

(BullMQ and exponential backoff are HOW - subagent learns from area CLAUDE.md)
```

**Good (outcome focus):**
```
WHAT: Ensure webhook events are not lost on processing failure
```

**Bad (implementation focus):**
```
WHAT: Add a dead-letter queue and retry worker for webhooks

(Dead-letter queue and retry worker are implementation details)
```
