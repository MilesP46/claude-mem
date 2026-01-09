# Foreman + Claude-Mem Integration Specification v7

## Executive Summary

v7 addresses the **intelligence layer**: when should knowledge become an agent vs remain as memory? How do we preemptively identify specialization opportunities? How do we route ad-hoc functionality requests to the right execution path?

**Core Insight**: Memory (CLAUDE.md) is **descriptive** - it tells you what exists and what patterns to follow. Agents are **prescriptive** - they have specific tools, scopes, and behaviors. The transition from memory to agent happens when:
1. An area accumulates enough specialized knowledge
2. That knowledge becomes prescriptive (DO/DON'T rules)
3. The area benefits from execution-level scoping

**Key Addition**: The `/add-functionality` universal command that intelligently routes requests to the right agents, identifies when new agents are needed, and triggers instruction updates when requirements evolve.

---

## Part 1: Addressing the Open Questions

### Q1: How do we avoid unnecessary agent creation and intelligently leverage memory?

**The Memory-Agent Spectrum**:

```
MEMORY (CLAUDE.md)                                AGENT
────────────────────────────────────────────────────────────────────────►
Descriptive                                        Prescriptive
"This area uses pino logging"                     "Always use pino with these specific config patterns"
"Errors follow structured format"                 "Intercept all errors, transform to this exact schema"
"Tests use vitest"                                "Run tests in this order, with these fixtures"

Low specialization                                 High specialization
General patterns                                  Specific workflows
Context for any agent                             Dedicated executor
```

**Decision Matrix: Memory vs Agent**:

| Signal | Memory (CLAUDE.md) | Agent |
|--------|-------------------|-------|
| Knowledge type | Patterns, conventions | Workflows, procedures |
| Language | "Uses...", "Follows..." | "Must...", "Always...", "Never..." |
| Scope | Informational | Enforceable |
| Applicability | Any agent working in area | Dedicated specialist |
| Trigger | Understanding needed | Execution needed |

**Detection Algorithm**:

```typescript
interface AreaAnalysis {
  path: string;
  claude_md_size: number;           // Lines in CLAUDE.md
  observation_count: number;        // Work sessions in this area
  prescriptive_ratio: number;       // % of MUST/NEVER vs descriptive content
  error_rate: number;               // Failures when working in this area
  distinct_patterns: number;        // Unique patterns/conventions
  access_frequency: number;         // How often this area is touched
}

function shouldCreateAgent(analysis: AreaAnalysis): AgentRecommendation {
  // High prescriptive content suggests agent would be valuable
  if (analysis.prescriptive_ratio > 0.4) {
    return { recommend: true, reason: 'High prescriptive content' };
  }

  // Frequent errors suggest specialized handling needed
  if (analysis.error_rate > 0.3 && analysis.observation_count > 5) {
    return { recommend: true, reason: 'High error rate - specialization would help' };
  }

  // Large CLAUDE.md with frequent access suggests natural split
  if (analysis.claude_md_size > 120 && analysis.access_frequency > 10) {
    return { recommend: true, reason: 'Dense area with frequent access' };
  }

  // Many distinct patterns suggest complexity warranting specialist
  if (analysis.distinct_patterns > 8) {
    return { recommend: true, reason: 'High pattern complexity' };
  }

  return { recommend: false, reason: 'Memory sufficient for this area' };
}
```

**Integration with Foreman Memory System**:

The foreman memory system already has:
- `memory-manager` agent - creates CLAUDE.md files
- `manage-memory` command - orchestrates memory updates
- `memory-system-standards.mdc` - rules for size limits, adjacency

**Claude-mem enhancement**:

```
CLAUDE.md content change detected
    ↓
Analyze change type:
- Adding prescriptive language? (MUST, NEVER, ALWAYS)
- Exceeding depth-scaled size limits?
- High density of DO/DON'T patterns?
    ↓
If thresholds met:
    ↓
Create agent candidate observation:
{
  type: 'foreman:agent:candidate',
  source: 'memory_analysis',
  area: 'src/api/billing/',
  rationale: 'CLAUDE.md exceeds 120 lines, 45% prescriptive content',
  suggested_scope: { folders: ['src/api/billing/'] },
  extracted_instructions: [
    'MUST use Stripe SDK version 12+',
    'NEVER store card numbers in logs',
    'ALWAYS validate webhook signatures'
  ]
}
```

**The Key Principle**: Claude-mem doesn't create agents automatically. It detects when memory has evolved to the point where an agent would be beneficial, extracts the prescriptive content, and presents this to the user for approval.

---

### Q2: How do we track project "essence" for preemptive agent identification?

**Project Essence Model**:

```typescript
interface ProjectEssence {
  // Structural layers
  layers: {
    name: string;           // "api", "services", "ui", "db"
    paths: string[];        // Directories comprising this layer
    responsibilities: string[];
    constraints: string[];  // "PCI compliance", "no external calls"
    preferred_agents: string[];
  }[];

  // Technical stack
  stack: {
    runtime: string;        // "Node.js 20"
    framework: string;      // "Express"
    database: string;       // "PostgreSQL"
    key_libraries: string[];
  };

  // Behavioral patterns
  patterns: {
    error_handling: string;   // "structured-errors with Sentry"
    logging: string;          // "pino with request correlation"
    testing: string;          // "vitest with msw mocks"
    deployment: string;       // "GitHub Actions to AWS"
  };

  // Specialized areas (derived from observations)
  specializations: {
    area: string;
    density_score: number;    // How much work happens here
    complexity_score: number; // How complex the patterns are
    agent_candidate: boolean;
    existing_agent?: string;
  }[];
}
```

**Building Project Essence**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SOURCES OF PROJECT ESSENCE                                              │
│                                                                          │
│  1. CLAUDE.md hierarchy (memory-manager output)                         │
│     → Structural understanding, patterns, conventions                    │
│                                                                          │
│  2. .foreman-project configuration                                       │
│     → Explicit layer definitions, constraints                           │
│                                                                          │
│  3. Claude-mem observations                                             │
│     → Behavioral patterns, where work happens, what fails               │
│                                                                          │
│  4. Issue history                                                       │
│     → Which areas get worked on, agent sequences used                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PROJECT ESSENCE ENGINE (worker background process)                      │
│                                                                          │
│  Continuous analysis:                                                    │
│  - Parse CLAUDE.md files for structural understanding                   │
│  - Aggregate observations by area                                       │
│  - Detect specialization emergence                                      │
│  - Track layer responsibilities and constraints                         │
│                                                                          │
│  Outputs:                                                                │
│  - project_essence.json (cached model)                                  │
│  - Specialization alerts                                                │
│  - Agent recommendations                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Preemptive Agent Identification**:

```typescript
// Worker background job
async function analyzeSpecializationOpportunities() {
  const essence = await getProjectEssence();
  const observations = await getRecentObservations(30); // Last 30 days

  // Group observations by area
  const areaStats = groupByArea(observations);

  for (const [area, stats] of Object.entries(areaStats)) {
    // Check if area is a specialization candidate
    const claudeMd = await getCLAUDEmd(area);

    const analysis: AreaAnalysis = {
      path: area,
      claude_md_size: claudeMd?.lineCount || 0,
      observation_count: stats.count,
      prescriptive_ratio: calculatePrescriptiveRatio(claudeMd),
      error_rate: stats.failures / stats.count,
      distinct_patterns: countDistinctPatterns(claudeMd),
      access_frequency: stats.accessCount
    };

    const recommendation = shouldCreateAgent(analysis);

    if (recommendation.recommend && !hasExistingAgent(area)) {
      await createAgentCandidate(area, analysis, recommendation);
    }
  }
}

// Run daily
scheduleJob('0 0 * * *', analyzeSpecializationOpportunities);
```

---

### Q2 (continued): The /add-functionality Command

**Purpose**: A universal entry point that routes functionality requests to the right execution path.

**Command Definition**:

```markdown
---
argument-hint: <functionality-description>
description: Intelligently route new functionality to appropriate agents and identify when new agents are needed
---

/add-functionality "payment processing with Stripe integration"
```

**Execution Flow**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  /add-functionality "payment processing with Stripe integration"         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: PARSE & UNDERSTAND                                              │
│                                                                          │
│  Extract intent:                                                         │
│  - Domain: "payment processing"                                         │
│  - Integration: "Stripe"                                                │
│  - Implied work: API endpoints, service layer, database, possibly UI    │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: IMPACT ANALYSIS                                                 │
│                                                                          │
│  Query project essence:                                                  │
│  - Which layers are affected?                                           │
│    → API layer (src/api/) - needs endpoint                              │
│    → Service layer (src/services/) - needs Stripe integration           │
│    → DB layer (src/db/) - needs payment tables                          │
│    → UI layer (src/ui/) - needs payment form (maybe)                    │
│                                                                          │
│  - What constraints apply?                                              │
│    → API layer: REST conventions, error format                          │
│    → Service layer: No external calls from controllers                  │
│    → DB layer: Migration required, audit logging                        │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: AGENT MATCHING                                                  │
│                                                                          │
│  For each affected layer, find best agent:                              │
│                                                                          │
│  API layer:                                                             │
│  - Existing agent: backend-architect ✓                                  │
│  - Specialization needed? Check observations for src/api/payments/      │
│    → No existing pattern → Use backend-architect                        │
│                                                                          │
│  Service layer:                                                         │
│  - Existing agent: backend-architect ✓                                  │
│  - Specialization needed? "Stripe" is new → Flag for instruction update │
│                                                                          │
│  DB layer:                                                              │
│  - Existing agent: backend-architect ✓                                  │
│  - Pattern: Standard migration workflow                                 │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: DETERMINE ACTION                                                │
│                                                                          │
│  Decision tree:                                                          │
│                                                                          │
│  A. All layers covered by existing agents, no new patterns?             │
│     → Route to existing agents with context                             │
│                                                                          │
│  B. New integration (Stripe) not in any agent's knowledge?              │
│     → Flag: "Agent instruction update needed"                           │
│     → Generate: Stripe-specific instructions to add                     │
│                                                                          │
│  C. Area would benefit from new specialized agent?                      │
│     → Present: "Create payments-specialist agent?"                      │
│     → If approved: Create agent, then route to it                       │
│                                                                          │
│  D. Completely new area with no coverage?                               │
│     → Present: "This requires new agent(s). Suggested:"                 │
│     → List proposed agents with scopes                                  │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: EXECUTE                                                         │
│                                                                          │
│  For this example:                                                       │
│                                                                          │
│  1. Create planning document (issue YAML):                              │
│     - Issue: "Add Stripe payment processing"                            │
│     - Agents: [backend-architect]                                       │
│     - Affected: [src/api/payments/, src/services/payments/, src/db/]    │
│                                                                          │
│  2. Flag instruction update:                                            │
│     - "backend-architect needs Stripe SDK patterns"                     │
│     - Generate suggested additions from Stripe docs + observations      │
│                                                                          │
│  3. Launch chain-issue workflow                                         │
│                                                                          │
│  4. After completion:                                                   │
│     - Update CLAUDE.md for affected areas                               │
│     - Analyze if payments/ now warrants specialized agent               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**When to Update Agent Instructions vs Create New Agent**:

```typescript
interface FunctionalityAnalysis {
  affected_layers: string[];
  existing_coverage: Map<string, string>;  // layer → agent
  new_patterns: string[];                   // Patterns not in any agent
  specialization_score: number;             // How specialized is this work
}

function determineAction(analysis: FunctionalityAnalysis): Action {
  // Case 1: Completely new area - need new agent
  if (analysis.existing_coverage.size === 0) {
    return {
      type: 'create_agent',
      suggestion: generateAgentSuggestion(analysis)
    };
  }

  // Case 2: Existing coverage but new patterns - update instructions
  if (analysis.new_patterns.length > 0 && analysis.specialization_score < 0.7) {
    return {
      type: 'update_instructions',
      agents: [...analysis.existing_coverage.values()],
      additions: generateInstructionAdditions(analysis.new_patterns)
    };
  }

  // Case 3: High specialization in existing area - consider split
  if (analysis.specialization_score > 0.7) {
    return {
      type: 'suggest_specialization',
      area: findMostSpecializedArea(analysis),
      rationale: 'This work is specialized enough to warrant dedicated agent'
    };
  }

  // Case 4: Existing agents sufficient
  return {
    type: 'route_existing',
    agents: [...analysis.existing_coverage.values()]
  };
}
```

---

### Q3: Frontend visualization of agent opportunities

**Agent Opportunity Dashboard**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM: AGENT OPPORTUNITIES                              [Refresh]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PROJECT HEALTH                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Coverage: 78%  │  Specializations: 3  │  Candidates: 2         │    │
│  │  ████████████░░░   🎯 billing          ⚡ src/api/webhooks/    │    │
│  │                    🎯 auth             ⚡ src/services/email/  │    │
│  │                    🎯 notifications                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  AGENT CANDIDATES (click to create)                                     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ⚡ src/api/webhooks/                              [Create Agent] │    │
│  │                                                                  │    │
│  │  Confidence: 87%                                                 │    │
│  │  Reason: High prescriptive content (52%), frequent access        │    │
│  │                                                                  │    │
│  │  Detected patterns:                                              │    │
│  │  • MUST validate webhook signatures                              │    │
│  │  • NEVER process duplicate events                                │    │
│  │  • ALWAYS log event ID before processing                         │    │
│  │                                                                  │    │
│  │  Suggested name: webhook-processor                               │    │
│  │  Suggested scope: src/api/webhooks/, src/services/webhook-*     │    │
│  │                                                                  │    │
│  │  [Preview Agent] [Create & Launch CLI] [Dismiss] [Details]       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ⚡ src/services/email/                            [Create Agent] │    │
│  │                                                                  │    │
│  │  Confidence: 72%                                                 │    │
│  │  Reason: 8 distinct patterns, 15% error rate                     │    │
│  │                                                                  │    │
│  │  Detected patterns:                                              │    │
│  │  • Template-based sending with Handlebars                        │    │
│  │  • Queue-based with retry logic                                  │    │
│  │  • Specific error handling for bounces                           │    │
│  │                                                                  │    │
│  │  [Preview Agent] [Create & Launch CLI] [Dismiss] [Details]       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  AREA HEAT MAP (work density over last 30 days)                         │
│                                                                          │
│  src/                                                                    │
│  ├── api/           ████████████████████ 45 sessions                    │
│  │   ├── users/     ████████ 18 sessions                                │
│  │   ├── billing/   ██████████████ 32 sessions (has agent)             │
│  │   └── webhooks/  ███████████ 24 sessions ⚡ candidate                │
│  ├── services/      ████████████████ 38 sessions                        │
│  │   ├── auth/      █████████████ 28 sessions (has agent)              │
│  │   └── email/     ████████ 16 sessions ⚡ candidate                   │
│  └── ui/            ██████████ 22 sessions                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**One-Click Agent Creation Flow**:

```
User clicks [Create & Launch CLI]
    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  CREATE AGENT: webhook-processor                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Name: webhook-processor                                                │
│  Scope: src/api/webhooks/, src/services/webhook-*                       │
│                                                                          │
│  Auto-generated instructions (from CLAUDE.md + observations):           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  You are a webhook processing specialist. You handle all        │    │
│  │  webhook-related code in this project.                          │    │
│  │                                                                  │    │
│  │  ## Critical Rules                                               │    │
│  │  - MUST validate webhook signatures before processing           │    │
│  │  - NEVER process duplicate events (check idempotency key)       │    │
│  │  - ALWAYS log event ID before any processing                    │    │
│  │                                                                  │    │
│  │  ## Patterns                                                     │    │
│  │  - Use WebhookEvent type from src/types/webhooks.ts             │    │
│  │  - Queue processing via BullMQ                                  │    │
│  │  - Error handling: WebhookProcessingError class                 │    │
│  │  ...                                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ☑ Create matching command (/webhook-task)                              │
│  ☑ Launch CLI after creation                                            │
│  ☐ Run memory-manager to update CLAUDE.md references                    │
│                                                                          │
│  [Create Agent] [Edit First] [Cancel]                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
On "Create Agent":
1. Write agent file to .claude/agents/webhook-processor.md
2. Write command file to .claude/commands/webhook-task.md (if checked)
3. Trigger CLI restart (per v6 mechanism)
4. New CLI session has webhook-processor available
```

---

## Part 2: Unified Intelligence Model

### The Four Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTENT                                      │
│                  "Add payment processing with Stripe"                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: ROUTING LAYER                                                  │
│  /add-functionality command                                              │
│  • Parse intent                                                          │
│  • Query project essence                                                 │
│  • Match to agents or identify gaps                                     │
│  • Route to execution                                                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: AGENT LAYER                                                    │
│  Specialized executors                                                   │
│  • Prescriptive instructions (MUST, NEVER, ALWAYS)                      │
│  • Scoped to specific areas                                             │
│  • Specific tool permissions                                            │
│  • Derived from memory + observations                                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: MEMORY LAYER                                                   │
│  CLAUDE.md hierarchy (foreman memory system)                            │
│  • Descriptive patterns (uses, follows, implements)                     │
│  • Depth-scaled, adjacency-oriented                                     │
│  • Context for any agent                                                │
│  • Managed by memory-manager                                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: OBSERVATION LAYER                                              │
│  Claude-mem observations                                                 │
│  • What's actually happening (tool use, decisions, errors)              │
│  • Behavioral patterns over time                                        │
│  • Source of truth for what works and what fails                       │
│  • Feeds into agent candidate detection                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Observations accumulate
    ↓
Pattern detection identifies clusters
    ↓
Memory (CLAUDE.md) captures patterns descriptively
    ↓
When prescriptive density exceeds threshold:
    ↓
Agent candidate surfaced
    ↓
User approves → Agent created
    ↓
Routing layer now has specialized executor
    ↓
Future work in that area uses specialized agent
    ↓
Observations track agent effectiveness
    ↓
Refinement loop continues
```

---

## Part 3: Implementation

### New Worker Components

```typescript
// Project Essence Service
class ProjectEssenceService {
  // Build and maintain project understanding
  async buildEssence(projectId: string): Promise<ProjectEssence>;
  async updateEssence(projectId: string, changes: EssenceUpdate): Promise<void>;
  async getLayerForPath(path: string): Promise<Layer | null>;
  async getConstraintsForPath(path: string): Promise<string[]>;
}

// Agent Candidate Service
class AgentCandidateService {
  // Detect and manage agent opportunities
  async analyzeArea(path: string): Promise<AreaAnalysis>;
  async detectCandidates(): Promise<AgentCandidate[]>;
  async createAgentFromCandidate(candidateId: string): Promise<Agent>;
  async extractInstructions(path: string): Promise<string[]>;
}

// Functionality Router Service
class FunctionalityRouterService {
  // Route /add-functionality requests
  async parseIntent(description: string): Promise<FunctionalityIntent>;
  async analyzeImpact(intent: FunctionalityIntent): Promise<ImpactAnalysis>;
  async matchAgents(impact: ImpactAnalysis): Promise<AgentMatch[]>;
  async determineAction(matches: AgentMatch[]): Promise<RoutingAction>;
  async execute(action: RoutingAction): Promise<ExecutionResult>;
}
```

### New Database Tables

```sql
-- Project essence cache
CREATE TABLE project_essence (
  project_id TEXT PRIMARY KEY,
  essence_json JSON NOT NULL,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP
);

-- Layer definitions
CREATE TABLE project_layers (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  paths JSON NOT NULL,            -- Array of path patterns
  responsibilities JSON,
  constraints JSON,
  preferred_agents JSON,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);

-- Agent candidates
CREATE TABLE agent_candidates (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  area_path TEXT NOT NULL,
  confidence REAL NOT NULL,
  rationale TEXT,
  detected_patterns JSON,         -- Extracted prescriptive patterns
  suggested_name TEXT,
  suggested_scope JSON,
  status TEXT DEFAULT 'pending',  -- pending | approved | rejected | created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);

-- Instruction update suggestions
CREATE TABLE instruction_updates (
  id INTEGER PRIMARY KEY,
  agent_name TEXT NOT NULL,
  trigger_source TEXT,            -- 'functionality_request' | 'observation_pattern'
  suggested_additions JSON,       -- Array of instruction strings
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### New API Endpoints

```
# Project Essence
GET  /api/essence/:projectId              Get project essence
POST /api/essence/:projectId/refresh      Force essence rebuild

# Agent Candidates
GET  /api/agents/candidates               List agent candidates
GET  /api/agents/candidates/:id           Get candidate details
POST /api/agents/candidates/:id/create    Create agent from candidate
POST /api/agents/candidates/:id/dismiss   Dismiss candidate

# Functionality Routing
POST /api/functionality/analyze           Analyze functionality request
POST /api/functionality/route             Execute routing decision

# Instruction Updates
GET  /api/instructions/updates            List pending instruction updates
POST /api/instructions/updates/:id/apply  Apply instruction update
```

---

## Part 4: What v7 Adds Over v6

| Capability | v6 | v7 |
|------------|----|----|
| Memory-agent boundary | Implicit | Explicit decision matrix |
| Project essence | None | Full structural understanding |
| Preemptive agent detection | Duo candidates only | Prescriptive content analysis |
| /add-functionality | None | Universal routing command |
| Agent instruction updates | Manual | Auto-detected, suggested |
| Frontend visualization | Basic | Heat maps, candidates, one-click creation |
| Layer-aware routing | None | Impact analysis by layer |

---

## Part 5: Success Metrics

1. **Agent Creation Precision**: 85%+ of suggested agents are useful (not dismissed)
2. **Instruction Update Relevance**: 80%+ of suggested updates are applied
3. **Routing Accuracy**: 90%+ of /add-functionality requests route to correct agents
4. **Memory-to-Agent Conversion**: Average 3 months from area creation to agent suggestion
5. **User Friction**: <3 clicks from candidate notification to working agent

---

## Appendix A: Memory vs Agent Examples

**Example 1: Memory Sufficient**

```markdown
# src/utils/CLAUDE.md

## Patterns
- Uses lodash for collection operations
- Prefers named exports
- Functions are pure (no side effects)
```

This is purely descriptive. Any agent can use these utils following these patterns. No specialized agent needed.

**Example 2: Agent Warranted**

```markdown
# src/api/webhooks/CLAUDE.md

## Critical Requirements
- MUST validate webhook signatures using crypto.timingSafeEqual
- MUST check idempotency key before processing (table: webhook_events)
- NEVER log raw webhook payload (contains PII)
- ALWAYS process in queue, never synchronously
- Error handling: WebhookError class with specific codes

## Patterns
- Event types defined in src/types/webhook-events.ts
- Signature header: X-Webhook-Signature
- Queue: BullMQ with 3 retry attempts
```

This is highly prescriptive with critical security/operational requirements. A `webhook-processor` agent would ensure these are always followed.

---

## Appendix B: /add-functionality Example Session

```
User: /add-functionality "email notifications for order status changes"

System: Analyzing functionality request...

Impact Analysis:
┌─────────────────────────────────────────────────────────────────────────┐
│ Affected Layers:                                                         │
│ • Services (src/services/) - email sending logic                        │
│ • Events (src/events/) - order status change events                     │
│ • Templates (src/templates/) - email templates                          │
│ • Database (src/db/) - notification preferences                         │
│                                                                          │
│ Agent Coverage:                                                          │
│ • Services: backend-architect ✓                                         │
│ • Events: backend-architect ✓                                           │
│ • Templates: No specialized agent (use backend-architect)               │
│ • Database: backend-architect ✓                                         │
│                                                                          │
│ New Patterns Detected:                                                   │
│ • Email templating (Handlebars) - not in current instructions           │
│ • Notification preferences table - new schema                           │
│                                                                          │
│ Recommendation:                                                          │
│ ✓ Route to backend-architect                                            │
│ ⚠ Suggest instruction update: Add email templating patterns            │
│                                                                          │
│ [Proceed] [Edit Plan] [Cancel]                                          │
└─────────────────────────────────────────────────────────────────────────┘

User: [Proceed]

System:
1. Created issue YAML: issue-047-email-notifications.yaml
2. Queued instruction update for backend-architect
3. Launching chain-issue workflow...

[CLI restarts with updated context]
```
