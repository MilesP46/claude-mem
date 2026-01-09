# Foreman + Claude-Mem Integration Specification v8

## Executive Summary

v8 addresses **operational efficiency**: How do we avoid creating agents for small file sets when nested memories suffice? How do we decouple routing (`/add-functionality`) from agent creation? How do we ensure agent launches are context-efficient rather than context-duplicating? How do we define sessions in terms of actual file work?

**Core Corrections to v7:**

1. **Agent threshold must consider scope, not area.** A directory with 5 files shouldn't get an agent. A scope covering 15+ files across 3 subdirectories with concentrated prescriptive patterns might.

2. **`/add-functionality` routes; it doesn't create agents.** Agent opportunities emerge from observation patterns via hooks, not from routing commands.

3. **surgical-edits is the lightweight alternative to specialist agents.** Parent orchestrator decides: "Does this work item benefit from specialist knowledge, or is plan-driven execution sufficient?"

4. **Sessions are file-centric, not invocation-centric.** Hooks track files read/modified/created, enabling area-based work tracking.

---

## Part 1: Nested Memory vs Agent Threshold (Q1)

### The Problem with v7's Approach

v7 analyzed single directories in isolation:
```typescript
// v7 approach (FLAWED)
function shouldCreateAgent(analysis: AreaAnalysis): AgentRecommendation {
  if (analysis.prescriptive_ratio > 0.4) { return { recommend: true }; }
  // ...
}
```

This ignores:
- Whether nested CLAUDE.md files already provide coverage
- Whether the scope is substantial enough to justify agent overhead
- Whether prescriptive content is concentrated (needs agent) or distributed (memories work)

### Scope-Based Threshold Model

**Definition:** A *scope* is the tree of directories an agent would cover. An agent for `src/api/billing/` covers that directory and all descendants.

```typescript
interface ScopeAnalysis {
  root_path: string;

  // Scope metrics (whole subtree)
  total_files: number;           // All source files in scope
  total_directories: number;     // Subdirs with ≥1 source file
  total_loc: number;             // Lines of code in scope

  // Memory coverage
  claude_md_count: number;       // CLAUDE.md files in scope
  memory_coverage_ratio: number; // % of directories with CLAUDE.md
  total_memory_lines: number;    // Combined CLAUDE.md content

  // Prescriptive analysis
  prescriptive_density: number;  // MUST/NEVER per 100 LOC across scope
  prescriptive_concentration: number; // How clustered (0=spread, 1=single file)

  // Behavioral patterns (from observations)
  observation_count: number;     // Sessions touching this scope
  error_rate: number;            // Failure rate in scope
  avg_session_files: number;     // Files touched per session
}
```

### Scope Threshold Algorithm

```typescript
function shouldCreateAgentForScope(scope: ScopeAnalysis): AgentRecommendation {

  // GATE 1: Minimum scope size
  // Agent overhead isn't justified for small scopes
  if (scope.total_files < 8) {
    return {
      recommend: false,
      reason: `Scope too small (${scope.total_files} files). Minimum: 8 files.`
    };
  }

  // GATE 2: Minimum directory span
  // Single-directory scopes should use memory unless exceptional
  if (scope.total_directories < 2 && scope.prescriptive_density < 0.8) {
    return {
      recommend: false,
      reason: 'Single directory scope. Use nested memory instead.'
    };
  }

  // GATE 3: Memory coverage check
  // If nested memories already provide good coverage, don't duplicate
  if (scope.memory_coverage_ratio > 0.7 && scope.prescriptive_concentration < 0.5) {
    return {
      recommend: false,
      reason: 'Nested memories provide adequate coverage. Prescriptive content is distributed.'
    };
  }

  // EVALUATION: Does this scope benefit from agent?
  const benefitScore = calculateAgentBenefit(scope);

  if (benefitScore > 0.6) {
    return {
      recommend: true,
      reason: `High agent benefit score (${benefitScore.toFixed(2)}): ${explainBenefit(scope)}`,
      suggested_scope: scope.root_path,
      confidence: benefitScore
    };
  }

  return {
    recommend: false,
    reason: `Benefit score too low (${benefitScore.toFixed(2)}). Nested memory sufficient.`
  };
}

function calculateAgentBenefit(scope: ScopeAnalysis): number {
  let score = 0;

  // Factor 1: Prescriptive concentration (0-0.3)
  // High concentration = agent can enforce rules better than distributed memories
  score += scope.prescriptive_concentration * 0.3;

  // Factor 2: Error rate (0-0.25)
  // High errors suggest specialist knowledge would help
  if (scope.observation_count >= 5) {
    score += Math.min(scope.error_rate, 1) * 0.25;
  }

  // Factor 3: Scope complexity (0-0.25)
  // More files + directories = more coordination benefit
  const complexityFactor = Math.min((scope.total_files / 30) + (scope.total_directories / 8), 1);
  score += complexityFactor * 0.25;

  // Factor 4: Work frequency (0-0.2)
  // Frequently touched scopes benefit more from specialist
  const frequencyFactor = Math.min(scope.observation_count / 20, 1);
  score += frequencyFactor * 0.2;

  return score;
}
```

### Memory vs Agent Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCOPE IDENTIFIED: src/api/billing/                                      │
│                                                                          │
│  Subtree analysis:                                                       │
│  - 12 source files across 4 directories                                 │
│  - 3 nested CLAUDE.md files (75% coverage)                              │
│  - Prescriptive content: 18 rules                                       │
│    - 6 in src/api/billing/CLAUDE.md (concentrated)                      │
│    - 5 in src/api/billing/webhooks/CLAUDE.md                           │
│    - 7 in src/api/billing/subscriptions/CLAUDE.md                      │
│  - 15 sessions, 3 failures (20% error rate)                            │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE EVALUATION                                                          │
│                                                                          │
│  Gate 1: total_files (12) >= 8? ✓ PASS                                  │
│  Gate 2: total_directories (4) >= 2? ✓ PASS                             │
│  Gate 3: memory_coverage (75%) > 70%                                    │
│          AND prescriptive_concentration (0.33) < 0.5? → EVALUATION      │
│                                                                          │
│  Prescriptive rules are DISTRIBUTED (not concentrated)                   │
│  Memory coverage is HIGH                                                 │
│                                                                          │
│  BENEFIT SCORE: 0.42                                                     │
│  - Concentration factor: 0.33 * 0.3 = 0.10                              │
│  - Error rate factor: 0.20 * 0.25 = 0.05                                │
│  - Complexity factor: 0.55 * 0.25 = 0.14                                │
│  - Frequency factor: 0.75 * 0.2 = 0.15                                  │
│                                                                          │
│  RESULT: benefit_score (0.42) < 0.6 threshold                           │
│                                                                          │
│  RECOMMENDATION: NO AGENT                                                │
│  Reason: Nested memories provide good coverage. Rules are distributed.  │
│  Continue using memory-manager to maintain CLAUDE.md hierarchy.         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Contrast: When Agent IS Warranted

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCOPE IDENTIFIED: src/services/payments/                                │
│                                                                          │
│  Subtree analysis:                                                       │
│  - 18 source files across 3 directories                                 │
│  - 1 nested CLAUDE.md file (33% coverage)                               │
│  - Prescriptive content: 24 rules                                       │
│    - 20 in src/services/payments/CLAUDE.md (CONCENTRATED)               │
│    - 4 in src/services/payments/stripe/CLAUDE.md                        │
│  - 22 sessions, 8 failures (36% error rate)                            │
│                                                                          │
│  GATE EVALUATION                                                          │
│  Gate 1: total_files (18) >= 8? ✓ PASS                                  │
│  Gate 2: total_directories (3) >= 2? ✓ PASS                             │
│  Gate 3: memory_coverage (33%) > 70%? ✗ NO → CONTINUE TO BENEFIT        │
│                                                                          │
│  BENEFIT SCORE: 0.73                                                     │
│  - Concentration factor: 0.83 * 0.3 = 0.25                              │
│  - Error rate factor: 0.36 * 0.25 = 0.09                                │
│  - Complexity factor: 0.73 * 0.25 = 0.18                                │
│  - Frequency factor: 1.0 * 0.2 = 0.20                                   │
│                                                                          │
│  RESULT: benefit_score (0.73) >= 0.6 threshold                          │
│                                                                          │
│  RECOMMENDATION: CREATE AGENT                                            │
│  Reason: High prescriptive concentration (83% in root CLAUDE.md),       │
│          elevated error rate (36%), frequent access (22 sessions).       │
│                                                                          │
│  Create agent candidate for user approval.                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Decoupling /add-functionality from Agent Creation (Q2)

### Architecture Separation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TWO INDEPENDENT SYSTEMS                           │
│                                                                          │
│  ┌────────────────────────────┐    ┌────────────────────────────────┐   │
│  │  ROUTING SYSTEM            │    │  INTELLIGENCE SYSTEM           │   │
│  │  /add-functionality        │    │  Agent Opportunity Detection   │   │
│  │                            │    │                                │   │
│  │  - Parses user intent      │    │  - Hooks capture work          │   │
│  │  - Queries project essence │    │  - Observations aggregate      │   │
│  │  - Matches to existing     │    │  - Patterns detected           │   │
│  │    agents                  │    │  - Scope analysis runs         │   │
│  │  - Routes to appropriate   │    │  - Candidates surface          │   │
│  │    executor                │    │  - User approves → agent       │   │
│  │                            │    │                                │   │
│  │  DOES NOT: create agents   │    │  DOES NOT: route work          │   │
│  │  DOES NOT: suggest agents  │    │  DOES NOT: invoke agents       │   │
│  │  DOES NOT: modify infra    │    │  DOES NOT: parse user intent   │   │
│  │                            │    │                                │   │
│  └────────────────────────────┘    └────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### /add-functionality: Pure Routing

```markdown
---
argument-hint: <functionality-description>
description: Route new functionality to appropriate existing agents
---

# /add-functionality Command

Routes functionality requests to appropriate existing agents.

## What This Command Does

1. Parse user's functionality description
2. Query project essence for affected layers
3. Match affected areas to existing agents
4. Generate issue YAML with agent sequence
5. Launch chain-issue workflow

## What This Command Does NOT Do

- Does NOT suggest new agent creation
- Does NOT analyze agent candidates
- Does NOT modify agent instructions
- Does NOT update agent infrastructure

Agent infrastructure changes happen through the Intelligence System (hook-driven).
```

**Execution Flow:**

```
User: /add-functionality "email notifications for order changes"
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: PARSE INTENT                                                    │
│                                                                          │
│  Domain: notifications                                                   │
│  Integration: email                                                      │
│  Trigger: order status changes                                          │
│  Implied areas: events/, services/email/, templates/                    │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: QUERY PROJECT ESSENCE                                           │
│                                                                          │
│  Affected layers:                                                        │
│  - Events layer (src/events/) → existing agent: backend-architect       │
│  - Services layer (src/services/) → existing agent: backend-architect   │
│  - Templates layer (src/templates/) → existing agent: backend-architect │
│  - Database (notification prefs) → existing agent: backend-architect    │
│                                                                          │
│  All affected areas have existing coverage.                             │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: GENERATE ISSUE YAML                                             │
│                                                                          │
│  Creates issue with:                                                     │
│  - Title: "Add email notifications for order status changes"            │
│  - Agent sequence: [backend-architect]                                  │
│  - Affected areas: [src/events/, src/services/email/, ...]             │
│  - Labels: [feature, notifications]                                     │
│                                                                          │
│  NO agent creation suggestions. NO infrastructure changes.              │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: LAUNCH CHAIN-ISSUE                                              │
│                                                                          │
│  Workflow begins with existing agents.                                   │
│  Hooks track work (see Intelligence System below).                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Intelligence System: Hook-Driven Agent Detection

Agent opportunities emerge from observation patterns, not from user commands:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE PIPELINE                                                   │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  HOOKS   │ ──►│ OBSERVE  │ ──►│ ANALYZE  │ ──►│ SURFACE  │          │
│  │          │    │          │    │          │    │          │          │
│  │ PostTool │    │ Write    │    │ Scope    │    │ Frontend │          │
│  │ Use      │    │ Observ-  │    │ Analysis │    │ Notifi-  │          │
│  │          │    │ ation    │    │ Job      │    │ cation   │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│       │               │               │               │                 │
│       │               │               │               │                 │
│       ▼               ▼               ▼               ▼                 │
│  Captures:       Stores:          Runs:           Shows:               │
│  - Files read    - Type-tagged    - Daily job     - Candidate          │
│  - Files edited    observations   - Scope-based     cards              │
│  - Errors        - Area-linked      analysis      - Confidence         │
│  - Tool use      - Searchable     - Threshold       scores             │
│                                     checks        - One-click          │
│                                                     create             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hook → Observation Flow:**

```typescript
// PostToolUse hook captures work patterns
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  const { tool_name, tool_input, tool_result, session_id } = input;

  // Track file operations
  if (tool_name === 'Read') {
    await recordFileAccess(session_id, tool_input.file_path, 'read');
  }

  if (tool_name === 'Edit' || tool_name === 'Write') {
    await recordFileAccess(session_id, tool_input.file_path, 'modified');

    // Detect prescriptive content being added
    if (containsPrescriptivePatterns(tool_input.new_string)) {
      await recordPrescriptiveWrite(session_id, tool_input.file_path, tool_input.new_string);
    }
  }

  // Track errors
  if (tool_result?.error) {
    await recordError(session_id, tool_name, tool_result.error);
  }
}

// Background job analyzes accumulated observations
async function analyzeAgentOpportunities(): Promise<void> {
  const recentSessions = await getSessionsLast30Days();

  // Group by scope (directory subtrees)
  const scopeGroups = groupByScope(recentSessions);

  for (const [scopePath, sessions] of scopeGroups) {
    const scopeAnalysis = await buildScopeAnalysis(scopePath, sessions);
    const recommendation = shouldCreateAgentForScope(scopeAnalysis);

    if (recommendation.recommend && !hasExistingAgent(scopePath)) {
      await createAgentCandidate(scopePath, scopeAnalysis, recommendation);
      await notifyFrontend('agent_candidate_available', { scopePath });
    }
  }
}

// Runs daily
scheduleJob('0 3 * * *', analyzeAgentOpportunities);
```

---

## Part 3: Context-Efficient Agent Dispatch (Q3)

### The Context Duplication Problem

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NAIVE APPROACH (WASTEFUL)                                               │
│                                                                          │
│  Parent Agent (Claude Code CLI)                                          │
│  ├── Reads src/services/billing/service.ts (500 tokens)                 │
│  ├── Reads src/services/billing/types.ts (300 tokens)                   │
│  ├── Reads src/services/billing/CLAUDE.md (200 tokens)                  │
│  └── Decides: "Need billing specialist for this"                        │
│                                                                          │
│  Launches → Billing Specialist Agent                                     │
│             ├── Reads src/services/billing/service.ts (500 tokens AGAIN)│
│             ├── Reads src/services/billing/types.ts (300 tokens AGAIN)  │
│             ├── Reads src/services/billing/CLAUDE.md (200 tokens AGAIN) │
│             └── Does the work                                           │
│                                                                          │
│  DUPLICATED CONTEXT: 1000 tokens wasted                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### The surgical-edits Alternative

The key insight from reading surgical-edits.md: it's a **plan-following executor** with limited scope. It:
- Receives explicit instructions from parent
- Makes precise, targeted changes
- Doesn't need domain-specific knowledge (parent provides it)
- Has minimal context overhead

**When to use surgical-edits vs specialist:**

```typescript
interface WorkItem {
  area: string;
  description: string;
  estimated_files: number;
  requires_coordination: boolean;  // Multiple concerns (DB + API + validation)
  novelty: 'routine' | 'new_pattern' | 'complex_integration';
}

function selectExecutor(
  item: WorkItem,
  availableAgents: Agent[],
  parentContext: ContextSnapshot
): ExecutionDecision {

  // Find matching specialist
  const specialist = availableAgents.find(a => a.covers(item.area));

  // Calculate context cost of launching specialist
  const specialistCost = specialist
    ? estimateAgentContextCost(specialist, item)
    : Infinity;

  // Calculate context cost of surgical-edits with inline instructions
  const surgicalCost = estimateSurgicalEditsCost(item, parentContext);

  // Calculate benefit of specialist knowledge
  const specialistBenefit = calculateSpecialistBenefit(item, specialist);

  // Decision
  if (!specialist) {
    // No specialist available - use surgical-edits
    return {
      executor: 'surgical-edits',
      reason: 'No specialist agent available for this area',
      instructions: generateInlineInstructions(item, parentContext)
    };
  }

  if (specialistBenefit - specialistCost > 0.3) {
    // Specialist's domain knowledge outweighs context cost
    return {
      executor: specialist.name,
      reason: `Specialist benefit (${specialistBenefit.toFixed(2)}) exceeds cost (${specialistCost.toFixed(2)})`,
      contextHandoff: buildContextHandoff(item, parentContext)
    };
  }

  // surgical-edits with parent-generated instructions
  return {
    executor: 'surgical-edits',
    reason: 'Context efficiency: parent provides instructions, surgical-edits executes',
    instructions: generateInlineInstructions(item, parentContext)
  };
}

function calculateSpecialistBenefit(item: WorkItem, specialist: Agent | undefined): number {
  if (!specialist) return 0;

  let benefit = 0;

  // Coordination benefit (multiple concerns)
  if (item.requires_coordination) {
    benefit += 0.3;
  }

  // Novelty benefit (specialist knows area patterns)
  if (item.novelty === 'new_pattern') benefit += 0.2;
  if (item.novelty === 'complex_integration') benefit += 0.4;

  // Historical success (fewer errors with specialist)
  const historicalErrorReduction = getHistoricalErrorReduction(specialist, item.area);
  benefit += historicalErrorReduction * 0.3;

  return benefit;
}
```

### Context Handoff Protocol

When specialist IS launched, minimize duplication:

```typescript
interface ContextHandoff {
  // Files parent already read - specialist should NOT re-read
  already_read: Array<{
    path: string;
    summary: string;      // Key content parent extracted
    relevant_lines?: string; // Specific sections relevant to task
  }>;

  // Area constraints parent identified
  constraints: string[];

  // Parent's understanding of what needs to happen
  task_context: string;

  // Specific questions for specialist to answer
  questions?: string[];
}

// Parent builds handoff before launching specialist
function buildContextHandoff(item: WorkItem, parentContext: ContextSnapshot): ContextHandoff {
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
      `Files already understood: ${parentContext.files_read.map(f => f.path).join(', ')}`,

    questions: item.requires_coordination
      ? ['How should DB changes coordinate with API changes?']
      : undefined
  };
}
```

### Orchestrator Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PARENT ORCHESTRATOR DECISION TREE                                       │
│                                                                          │
│  For each work item in execution plan:                                   │
│                                                                          │
│  1. DETERMINE AREA                                                       │
│     └── Which directories are affected?                                 │
│                                                                          │
│  2. CHECK SPECIALIST AVAILABILITY                                        │
│     ├── Is there an agent covering this area?                           │
│     │   └── Yes: Continue to benefit analysis                           │
│     └── No: Use surgical-edits with inline instructions                 │
│                                                                          │
│  3. CALCULATE BENEFIT vs COST                                            │
│     ├── Benefit factors:                                                │
│     │   - Coordination needed? (+0.3)                                   │
│     │   - New pattern? (+0.2)                                           │
│     │   - Complex integration? (+0.4)                                   │
│     │   - Historical error reduction? (+0-0.3)                          │
│     │                                                                    │
│     ├── Cost factors:                                                   │
│     │   - Agent instruction tokens                                      │
│     │   - Expected file re-reads                                        │
│     │   - Communication overhead                                        │
│     │                                                                    │
│     └── If (benefit - cost) > 0.3: Launch specialist                   │
│         Else: Use surgical-edits                                        │
│                                                                          │
│  4. EXECUTE                                                              │
│     ├── Specialist: Build context handoff, launch agent                │
│     └── Surgical-edits: Generate inline instructions, launch           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Inline Instructions for surgical-edits

When parent chooses surgical-edits, it generates focused instructions:

```markdown
## Inline Instructions (Parent-Generated)

### Context (from parent's analysis)
- File: src/services/billing/subscription.ts
- Current behavior: renewSubscription() doesn't validate payment method
- Required change: Add payment validation before renewal

### Constraints (from area CLAUDE.md)
- MUST use StripeService for payment validation
- MUST log validation attempts with correlation ID
- NEVER store card details in logs

### Specific Changes
1. Import PaymentValidator from ./validators
2. Add validation call before line 45 (renewal logic)
3. Handle ValidationError with appropriate error response

### Test Updates
- Add test case: "rejects renewal with invalid payment"
- Update existing test: "successful renewal" to include valid payment mock
```

---

## Part 4: File-Based Session Definition (Q4)

### Current Model (Inadequate)

```typescript
// Current: Session = CLI invocation
interface Session {
  session_id: string;
  started_at: timestamp;
  ended_at: timestamp;
  project_id: string;
}
```

This doesn't capture WHERE work happened.

### File-Centric Session Model

```typescript
interface FileOperation {
  file_path: string;
  operation: 'read' | 'modified' | 'created' | 'deleted';
  timestamp: timestamp;
  tool_name: string;        // Which tool performed operation
  content_summary?: string; // For writes: brief description of changes
}

interface EnhancedSession {
  session_id: string;
  started_at: timestamp;
  ended_at: timestamp;
  project_id: string;

  // File-level tracking
  files_read: FileOperation[];
  files_modified: FileOperation[];
  files_created: FileOperation[];

  // Derived areas (computed from file paths)
  affected_areas: Array<{
    path: string;           // Directory path
    operations: number;     // Count of operations in this area
    primary_activity: 'reading' | 'writing' | 'mixed';
  }>;

  // Work patterns
  work_pattern: {
    exploration_ratio: number;  // reads / total operations
    concentration: number;      // 1 = all in one area, 0 = spread out
    primary_area: string;       // Most active directory
  };
}
```

### Hook Integration for File Tracking

```typescript
// Enhanced PostToolUse hook
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

  // File creation tracking
  if (tool_name === 'Write' && tool_result?.success) {
    const isNew = !(await fileExistedBefore(tool_input.file_path, session_id));
    await recordFileOperation({
      session_id,
      file_path: tool_input.file_path,
      operation: isNew ? 'created' : 'modified',
      timestamp: Date.now(),
      tool_name,
      content_summary: summarizeContent(tool_input.content)
    });
  }

  // Update affected areas in real-time
  await updateSessionAffectedAreas(session_id);
}
```

### Using File-Based Tracking

**1. Memory Population by Area:**

```typescript
async function populateMemoriesFromSession(session: EnhancedSession): Promise<void> {
  for (const area of session.affected_areas) {
    // Tag observations with specific area
    const observations = session.observations.filter(o =>
      o.context?.files?.some(f => f.startsWith(area.path))
    );

    for (const obs of observations) {
      obs.affected_area = area.path;
      await saveObservation(obs);
    }
  }
}
```

**2. Agent Opportunity Detection:**

```typescript
async function detectAgentOpportunities(): Promise<void> {
  const sessions = await getRecentSessions(30); // Last 30 days

  // Group sessions by their primary affected area
  const areaWorkload: Map<string, AreaWorkStats> = new Map();

  for (const session of sessions) {
    for (const area of session.affected_areas) {
      const stats = areaWorkload.get(area.path) || createEmptyStats(area.path);

      stats.session_count++;
      stats.total_operations += area.operations;
      stats.modification_count += session.files_modified
        .filter(f => f.file_path.startsWith(area.path)).length;
      stats.error_count += session.errors
        .filter(e => e.context?.file?.startsWith(area.path)).length;

      areaWorkload.set(area.path, stats);
    }
  }

  // Identify high-activity areas for scope analysis
  for (const [areaPath, stats] of areaWorkload) {
    if (stats.session_count >= 5 && stats.modification_count >= 10) {
      const scopeAnalysis = await buildScopeAnalysis(areaPath, stats);
      const recommendation = shouldCreateAgentForScope(scopeAnalysis);

      if (recommendation.recommend) {
        await createAgentCandidate(areaPath, scopeAnalysis, recommendation);
      }
    }
  }
}
```

**3. Context Inheritance for Subagents:**

```typescript
// When parent launches subagent, pass file context
async function launchSubagentWithContext(
  agentName: string,
  task: string,
  parentSession: EnhancedSession
): Promise<SubagentResult> {

  // Determine which files parent already read in the target area
  const targetArea = extractTargetArea(task);
  const alreadyRead = parentSession.files_read
    .filter(f => f.file_path.startsWith(targetArea));

  // Build context inheritance
  const inheritance: ContextInheritance = {
    files_already_read: alreadyRead.map(f => f.file_path),
    parent_understanding: summarizeParentUnderstanding(parentSession, targetArea),
    skip_rereading: true
  };

  // Launch with inherited context
  return await launchAgent(agentName, task, { contextInheritance: inheritance });
}
```

### Database Schema Extensions

```sql
-- File operations table
CREATE TABLE file_operations (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  operation TEXT NOT NULL,      -- 'read' | 'modified' | 'created' | 'deleted'
  tool_name TEXT NOT NULL,
  content_summary TEXT,
  timestamp INTEGER NOT NULL,

  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX idx_file_ops_session ON file_operations(session_id);
CREATE INDEX idx_file_ops_path ON file_operations(file_path);
CREATE INDEX idx_file_ops_timestamp ON file_operations(timestamp);

-- Affected areas (denormalized for query efficiency)
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

---

## Part 5: Unified Model (v8 Complete Picture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        v8 COMPLETE ARCHITECTURE                          │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  HOOKS (Entry Point)                                               │  │
│  │  PostToolUse → File operations, errors, prescriptive writes       │  │
│  │  SessionEnd → Finalize session, compute affected areas            │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
│                                       │                                  │
│                                       ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  OBSERVATION LAYER                                                 │  │
│  │  - File-centric session tracking                                  │  │
│  │  - Affected area derivation                                       │  │
│  │  - Work pattern analysis                                          │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
│                                       │                                  │
│                                       ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  INTELLIGENCE LAYER (Background)                                   │  │
│  │  - Scope-based analysis (not single-directory)                    │  │
│  │  - Nested memory consideration                                    │  │
│  │  - Agent candidate detection (threshold: 0.6 benefit score)       │  │
│  │  - User approval workflow                                         │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
│                                       │                                  │
│                                       ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ROUTING LAYER (/add-functionality)                                │  │
│  │  - Parse intent                                                   │  │
│  │  - Match to EXISTING agents only                                  │  │
│  │  - Generate issue YAML                                            │  │
│  │  - Launch workflow                                                │  │
│  │  - DOES NOT create agents                                         │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
│                                       │                                  │
│                                       ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  EXECUTION LAYER (Parent Orchestrator)                             │  │
│  │  - For each work item:                                            │  │
│  │    - Calculate specialist benefit vs context cost                 │  │
│  │    - If benefit > cost + 0.3: Launch specialist with handoff      │  │
│  │    - Else: Generate inline instructions → surgical-edits          │  │
│  │  - Minimize context duplication                                   │  │
│  │  - Track file operations for session                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: What v8 Adds Over v7

| Capability | v7 | v8 |
|------------|----|----|
| Agent threshold | Single-directory analysis | Scope-based (subtree) analysis |
| Minimum agent size | Not specified | ≥8 files, ≥2 directories |
| Nested memory consideration | None | Memory coverage ratio check |
| /add-functionality | Creates agents | Routes only, no agent creation |
| Agent opportunity source | Command-time | Hook-driven background analysis |
| surgical-edits | Not mentioned | Core lightweight alternative |
| Specialist vs surgical decision | None | Benefit-cost calculation |
| Context handoff | None | Structured handoff protocol |
| Session definition | Invocation-based | File-centric with area tracking |
| Work pattern analysis | None | Concentration, exploration ratio |

---

## Part 7: Implementation Priorities

**Phase 1: File-Based Session Tracking**
- Extend PostToolUse hook for file operation capture
- Add `file_operations` and `session_affected_areas` tables
- Build session finalization that computes affected areas

**Phase 2: Scope-Based Agent Detection**
- Replace single-directory analysis with subtree scope analysis
- Add nested memory coverage calculation
- Implement benefit score with gates

**Phase 3: Executor Decision System**
- Implement specialist benefit calculation
- Build context handoff protocol
- Integrate surgical-edits as lightweight alternative

**Phase 4: Routing Decoupling**
- Refactor /add-functionality to routing-only
- Ensure no agent creation in routing path
- Move agent suggestions to background intelligence

---

## Appendix A: Threshold Comparison

**Memory Creation (from memory-system-standards.mdc):**
- ≥3 source files, OR
- Entrypoint + ≥2 additional files, OR
- ≥150 LOC total, OR
- Logical architectural unit

**Agent Creation (v8):**
- ≥8 source files in scope, AND
- ≥2 directories in scope, AND
- Memory coverage < 70% OR prescriptive concentration > 50%, AND
- Benefit score ≥ 0.6

The agent threshold is intentionally much higher because:
1. Agent overhead (context cost) is significant
2. Nested memories often provide sufficient coverage
3. surgical-edits handles routine work without specialist

---

## Appendix B: surgical-edits vs Specialist Example

**Scenario:** Add input validation to user registration endpoint

**Option A: Launch user-service specialist**
- Cost: 800 tokens (agent instructions) + 500 tokens (re-read files) = 1300 tokens
- Benefit: Specialist knows validation patterns (0.2) + no coordination (0.0) + routine task (0.0) = 0.2
- Net: 0.2 - 0.26 = -0.06 → DON'T USE SPECIALIST

**Option B: surgical-edits with inline instructions**
- Cost: 200 tokens (inline instructions)
- Parent generates:
  ```
  Add Zod validation to POST /users endpoint.
  Schema: email (string, email format), password (string, min 8 chars).
  Use ValidationError for failures.
  Update test: add case for invalid email.
  ```
- surgical-edits executes precisely

**Result:** 1100 tokens saved, same outcome.

---

## Appendix C: When Specialist IS Worth It

**Scenario:** Integrate Stripe webhooks for subscription billing

**Option A: Launch billing specialist**
- Cost: 1000 tokens (agent instructions) + 300 tokens (partial re-read) = 1300 tokens
- Benefit:
  - Complex integration (0.4)
  - New pattern (0.2)
  - Historical error reduction in billing area (0.2)
  - Total: 0.8
- Net: 0.8 - 0.26 = 0.54 → USE SPECIALIST

**Why specialist wins:**
- Specialist knows Stripe webhook signature validation patterns
- Specialist knows billing area's idempotency requirements
- Specialist knows queue-based processing patterns
- Parent would need to enumerate all these in inline instructions (more tokens than specialist cost)

**Result:** Specialist provides better outcome with acceptable overhead.
