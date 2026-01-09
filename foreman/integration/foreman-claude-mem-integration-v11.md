# Foreman + Claude-Mem Integration Specification v11

## Executive Summary

v11 addresses the **fundamental purpose question**: Why do specialized agents exist when memories provide patterns? The answer: **memories describe, agents guarantee**. A general agent reading memory might implement "use BullMQ for queues" differently each session. A specialized agent GUARANTEES the same queue configuration, retry logic, and error handling every time.

**Core Insight**: Cross-cutting concerns are secondary. The primary value of specialized agents is **consistency enforcement** in areas where patchwork implementations are unacceptable.

**The Real Question Answered**: What should each layer know, at what context cost, and what can it guarantee?

---

## Part 1: The Patchwork Problem

### Why Memories Alone Are Insufficient

Memory says:
```markdown
## Patterns
- Use BullMQ for async job processing
- Implement retry with exponential backoff
- Log all job failures with correlation IDs
```

**General Agent Session 1:**
```typescript
// Interprets "exponential backoff" as:
const queue = new Queue('webhooks', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  }
});
```

**General Agent Session 2:**
```typescript
// Different interpretation of same memory:
const queue = new Queue('webhooks', {
  defaultJobOptions: {
    attempts: 5,  // Different!
    backoff: { type: 'exponential', delay: 2000 }  // Different!
  }
});
```

**The Result**: Patchwork. Same patterns, inconsistent implementation. Both "follow" the memory, but produce different behavior.

### What Specialized Agents Guarantee

**Webhook Specialist Agent (embedded instructions):**
```markdown
## Queue Configuration (EXACT)
When creating BullMQ queues for webhooks:
```typescript
const WEBHOOK_QUEUE_CONFIG = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 500
  }
};
```
NEVER deviate from this configuration.
```

Every invocation produces identical queue setup. No interpretation variance.

---

## Part 2: Context Budget Analysis

### The Four Layers and Their Costs

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONTEXT BUDGET BY LAYER                                                 │
│                                                                          │
│  LAYER              TOKENS    WHAT IT KNOWS           GUARANTEE         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ORCHESTRATION      100-200   WHERE (areas)           Routing only      │
│  (root + routing)             WHO (agents)            No implementation │
│                               WHAT (outcome)          knowledge         │
│                                                                          │
│  MEMORY             50-150    Patterns               Description only   │
│  (per area)                   Conventions            No enforcement     │
│                               Do/Don't               Interpretation     │
│                                                       varies            │
│                                                                          │
│  GENERAL AGENT      500-800   Methodology            Good practice     │
│  (instructions)               TDD workflow           Pattern following  │
│                               Quality gates          May interpret      │
│                                                       differently       │
│                                                                          │
│  SPECIALIZED AGENT  800-1500  EXACT implementations  Consistency       │
│  (area-embedded)              Specific configs       Same every time   │
│                               Enforced patterns      No variance       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Each Layer Should Know

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION LAYER                                                     │
│                                                                          │
│  SHOULD KNOW:                  SHOULD NOT KNOW:                         │
│  ─────────────                 ────────────────                         │
│  • Service map (areas)         • Implementation patterns                │
│  • Agent capabilities          • How to configure queues                │
│  • Routing rules               • Database schemas                       │
│  • What outcome is needed      • API response formats                   │
│  • Whether specialist exists   • Retry logic details                    │
│                                                                          │
│  CONTEXT SOURCE:               CONTEXT COST:                            │
│  Root CLAUDE.md only           100-200 tokens                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  MEMORY LAYER (Area CLAUDE.md)                                           │
│                                                                          │
│  PROVIDES:                     CANNOT GUARANTEE:                        │
│  ──────────                    ─────────────────                        │
│  • Pattern descriptions        • Exact implementation                   │
│  • Technology choices          • Consistent configuration               │
│  • Do/Don't guidelines         • Same approach each time                │
│  • Cross-cutting imports       • Enforcement of rules                   │
│                                                                          │
│  CONTEXT SOURCE:               CONTEXT COST:                            │
│  Area CLAUDE.md + imports      50-150 tokens per area                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  GENERAL AGENT LAYER                                                     │
│                                                                          │
│  KNOWS:                        READS AT RUNTIME:                        │
│  ──────                        ────────────────                         │
│  • TDD methodology             • Area CLAUDE.md                         │
│  • Quality gates               • Cross-cutting imports                  │
│  • Activity logging            • GitHub issue context                   │
│  • Scope adherence             • Existing code patterns                 │
│                                                                          │
│  CONTEXT SOURCE:               CONTEXT COST:                            │
│  Agent instructions (static)   500-800 tokens (instructions)            │
│  + runtime memory reads        + 100-300 tokens (memories)              │
│                                                                          │
│  GUARANTEE LEVEL:                                                        │
│  Follows patterns but may interpret differently each session            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SPECIALIZED AGENT LAYER                                                 │
│                                                                          │
│  EMBEDS:                       MAY SKIP READING:                        │
│  ───────                       ────────────────                         │
│  • Exact configurations        • Area CLAUDE.md (already knows)         │
│  • Specific code patterns      • Some cross-cutting (embedded)          │
│  • Enforced workflows          • Pattern descriptions                   │
│  • Error handling specifics                                             │
│                                                                          │
│  CONTEXT SOURCE:               CONTEXT COST:                            │
│  Agent instructions (dense)    800-1500 tokens (instructions)           │
│  Minimal runtime reads         + 0-100 tokens (only novel context)      │
│                                                                          │
│  GUARANTEE LEVEL:                                                        │
│  Same implementation every time - no interpretation variance            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: When Specialists Are Required

### The Consistency Requirement Matrix

| Area Characteristic | Memory + General | Specialized Required |
|---------------------|------------------|---------------------|
| Routine CRUD | ✓ Sufficient | Not needed |
| Standard API endpoints | ✓ Sufficient | Not needed |
| Payment processing | ✗ Risk of variance | ✓ Required |
| Webhook handling | ✗ Risk of variance | ✓ Required |
| Authentication flows | ✗ Risk of variance | ✓ Required |
| Compliance-sensitive | ✗ Risk of variance | ✓ Required |
| High error rate area | ✗ Proven problematic | ✓ Required |
| Multi-step workflows | ✗ Step variance risk | ✓ Required |

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

### Variance Detection

Claude-mem can detect when general agents produce inconsistent implementations:

```typescript
interface ImplementationPattern {
  area: string;
  pattern_type: string;        // 'queue_config', 'retry_logic', 'error_handling'
  implementation: string;       // Normalized code signature
  session_id: string;
  timestamp: number;
}

async function detectVariance(area: string): Promise<VarianceReport> {
  const patterns = await getImplementationPatterns(area, { days: 30 });

  // Group by pattern type
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
      ? 'Specialist agent recommended to enforce consistency'
      : 'Memory + general agent sufficient'
  };
}
```

---

## Part 4: Orchestration Decision Framework

### The Complete Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION AGENT RECEIVES TASK                                       │
│                                                                          │
│  "Add retry logic for failed Stripe webhooks"                           │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ROUTE (Read root only - 100 tokens)                             │
│                                                                          │
│  From Service Map:                                                       │
│  • "stripe" → billing area                                              │
│  • "webhooks" → billing/webhooks area                                   │
│  • Area: src/services/billing/webhooks/                                 │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: CHECK FOR SPECIALIST (Query agent registry)                     │
│                                                                          │
│  Query: "Agent covering src/services/billing/webhooks/?"                │
│                                                                          │
│  IF SPECIALIST EXISTS:                                                   │
│  ├── Agent: webhook-processor                                           │
│  ├── Scope: src/services/billing/webhooks/                              │
│  └── → Route to specialist (skip to Step 4a)                            │
│                                                                          │
│  IF NO SPECIALIST:                                                       │
│  └── → Continue to Step 3                                               │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: ASSESS SPECIALIST NEED (If no specialist exists)               │
│                                                                          │
│  Quick assessment:                                                       │
│  • Payment related? YES (Stripe)                                        │
│  • Multi-step workflow? YES (validate → process → retry)                │
│  • Historical error rate? 28% (from observations)                       │
│                                                                          │
│  Assessment: SPECIALIST RECOMMENDED                                      │
│                                                                          │
│  Options:                                                                │
│  A. Create specialist now (if user approves)                            │
│  B. Route to general with strong guidance                               │
│  C. Surface as agent opportunity for later                              │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4a: ROUTE TO SPECIALIST (If exists)                                │
│                                                                          │
│  Launch: webhook-processor                                               │
│  With: WHAT-only context                                                │
│                                                                          │
│  "Implement retry logic for failed Stripe webhook events"               │
│                                                                          │
│  Specialist ALREADY KNOWS:                                               │
│  • Exact queue configuration                                            │
│  • Signature validation pattern                                         │
│  • Idempotency implementation                                           │
│  • Error handling specifics                                             │
│                                                                          │
│  Specialist SKIPS READING:                                               │
│  • Area CLAUDE.md (embedded in instructions)                            │
│  • Cross-cutting security (embedded)                                    │
│                                                                          │
│  Context cost: 1200 tokens (specialist) + 50 tokens (dynamic)           │
│  Guarantee: CONSISTENT implementation                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4b: ROUTE TO GENERAL (If no specialist, assessed as not critical) │
│                                                                          │
│  Launch: backend-architect                                               │
│  With: WHAT-WHERE-WHY context                                           │
│                                                                          │
│  "WHAT: Implement retry logic for failed events                         │
│   WHERE: src/services/billing/webhooks/                                 │
│   WHY: Failed webhook events are currently lost"                        │
│                                                                          │
│  General agent MUST READ:                                               │
│  • Area CLAUDE.md (for patterns)                                        │
│  • Cross-cutting imports (for security, API)                            │
│                                                                          │
│  Context cost: 700 tokens (agent) + 200 tokens (memories) + 50 (dynamic)│
│  Guarantee: FOLLOWS PATTERNS but may interpret differently              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Guarantee Hierarchy

```
GUARANTEE STRENGTH
       ▲
       │
       │  ┌─────────────────────────────────────────────────┐
HIGH   │  │  SPECIALIZED AGENT                               │
       │  │  • Same implementation every time                │
       │  │  • Embedded exact configurations                 │
       │  │  • No interpretation variance                    │
       │  │  • Cost: 1000-1500 tokens                        │
       │  └─────────────────────────────────────────────────┘
       │
       │  ┌─────────────────────────────────────────────────┐
MEDIUM │  │  GENERAL AGENT + MEMORY                          │
       │  │  • Follows patterns but may vary                 │
       │  │  • Reads memory for guidance                     │
       │  │  • Good for routine work                         │
       │  │  • Cost: 700-1000 tokens                         │
       │  └─────────────────────────────────────────────────┘
       │
       │  ┌─────────────────────────────────────────────────┐
LOW    │  │  MEMORY ALONE (No agent)                         │
       │  │  • Descriptive only                              │
       │  │  • No execution                                  │
       │  │  • For documentation/reference                   │
       │  │  • Cost: 50-150 tokens                           │
       │  └─────────────────────────────────────────────────┘
       │
       └─────────────────────────────────────────────────────►
                                                    CONTEXT COST
```

---

## Part 5: Static vs Dynamic by Layer

### What's Static (Embedded, Not Repeated)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STATIC CONTENT (Loaded once per agent, not in commands)                 │
│                                                                          │
│  GENERAL AGENT STATIC:                                                   │
│  • TDD methodology ("RED-GREEN-REFACTOR")                               │
│  • Activity logging pattern                                             │
│  • Quality gates (LOC limits, coverage)                                 │
│  • Scope adherence rules                                                │
│  • GitHub workflow (comment editing, PR creation)                       │
│                                                                          │
│  SPECIALIZED AGENT STATIC:                                               │
│  • All of general agent static, PLUS:                                   │
│  • Exact configurations for area                                        │
│  • Specific code patterns to use                                        │
│  • Error handling implementations                                       │
│  • Integration patterns                                                 │
│  • What would be in area CLAUDE.md (embedded)                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What's Dynamic (Injected Per Request)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DYNAMIC CONTENT (Provided by orchestration, hooks, or context)         │
│                                                                          │
│  ORCHESTRATION PROVIDES:                                                 │
│  • WHAT (outcome description)                                           │
│  • WHERE (area path)                                                    │
│  • WHY (business context)                                               │
│  • GitHub issue reference                                               │
│  • Related areas (if multi-area)                                        │
│                                                                          │
│  HOOKS INJECT:                                                           │
│  • Agent suggestions (which specialist/general)                         │
│  • Recent patterns (from observations)                                  │
│  • Variance warnings (if detected)                                      │
│                                                                          │
│  RUNTIME READS (General agent only):                                     │
│  • Area CLAUDE.md                                                       │
│  • Cross-cutting imports                                                │
│  • Existing code patterns                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Context Budget Summary

| Layer | Static Cost | Dynamic Cost | Total | Reads Memory? |
|-------|-------------|--------------|-------|---------------|
| Orchestration | 0 | 100-200 | 100-200 | Root only |
| General Agent | 500-800 | 150-300 | 650-1100 | Yes, area + imports |
| Specialized Agent | 800-1500 | 50-100 | 850-1600 | Minimal/none |

**Key Insight**: Specialized agents have higher static cost but lower dynamic cost because they don't need to read memories - the patterns are embedded.

---

## Part 6: API Memory Spanning Multiple Areas

### The Problem

An API change might require:
- API endpoint modifications (src/api/payments/)
- Service layer changes (src/services/billing/)
- Database schema updates (db/migrations/)

The API memory (docs/api/CLAUDE.md) applies to all of these.

### The Solution: API as Cross-Cutting, Not Per-Area

```
┌─────────────────────────────────────────────────────────────────────────┐
│  API MEMORY HANDLING                                                     │
│                                                                          │
│  docs/api/CLAUDE.md is CROSS-CUTTING:                                   │
│  • Defines API contracts                                                │
│  • Specifies error formats                                              │
│  • Documents versioning                                                 │
│  • NOT area-specific patterns                                           │
│                                                                          │
│  HOW IT'S USED:                                                          │
│                                                                          │
│  By General Agent:                                                       │
│  • Area CLAUDE.md has @../../docs/api/CLAUDE.md in Dependencies         │
│  • Agent reads it when working on area                                  │
│  • API patterns loaded once per agent session                           │
│                                                                          │
│  By Specialized Agent:                                                   │
│  • API patterns EMBEDDED in specialist instructions                     │
│  • Specialist doesn't re-read docs/api/CLAUDE.md                        │
│  • Already knows: "Error format: { error: { code, message } }"         │
│                                                                          │
│  By Orchestrator:                                                        │
│  • Knows API exists as cross-cutting concern                            │
│  • Routes API changes to appropriate agents                             │
│  • Does NOT read docs/api/CLAUDE.md itself                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Multi-Area API Work

```
Task: "Update payment status response to include retry information"

Orchestrator Analysis:
├── Affects: src/api/payments/ (response format)
├── Affects: src/services/billing/ (status calculation)
├── Cross-cutting: docs/api/CLAUDE.md (API contracts)
│
├── Specialist check:
│   ├── billing-specialist exists? YES
│   └── Covers both billing + API? YES (embedded API patterns)
│
└── Decision: Route to billing-specialist
    • Single agent handles both areas
    • API patterns already embedded
    • No cross-cutting duplication
    • Consistent implementation guaranteed
```

---

## Part 7: Specialist Creation from Memory

### When Memory Evolves to Specialist

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MEMORY TO SPECIALIST EVOLUTION                                          │
│                                                                          │
│  STAGE 1: Memory Only                                                    │
│  ──────────────────────                                                  │
│  src/services/billing/CLAUDE.md:                                        │
│  "Uses BullMQ for queues. Implement retry with backoff."                │
│                                                                          │
│  General agents work here, interpret patterns each time.                │
│                                                                          │
│  STAGE 2: Variance Detected                                              │
│  ─────────────────────────────                                           │
│  Claude-mem detects:                                                     │
│  • Session 1 used attempts: 3, delay: 1000                              │
│  • Session 2 used attempts: 5, delay: 2000                              │
│  • Session 3 used attempts: 3, delay: 500                               │
│                                                                          │
│  Variance report: "Queue configuration inconsistent across sessions"    │
│                                                                          │
│  STAGE 3: Specialist Recommended                                         │
│  ───────────────────────────────                                         │
│  System surfaces opportunity:                                            │
│  "Billing area has implementation variance. Recommend specialist."      │
│                                                                          │
│  STAGE 4: Specialist Created                                             │
│  ───────────────────────────                                             │
│  User approves. System generates billing-specialist with:               │
│  • EXACT queue configuration (from most recent/correct implementation)  │
│  • Embedded patterns from CLAUDE.md                                     │
│  • Consistency guarantees                                               │
│                                                                          │
│  STAGE 5: Memory Simplified                                              │
│  ─────────────────────────                                               │
│  src/services/billing/CLAUDE.md updated:                                │
│  "Handled by billing-specialist agent. See agent for patterns."         │
│                                                                          │
│  Memory becomes pointer, specialist becomes source of truth.            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Specialist Instruction Generation

```typescript
async function generateSpecialistInstructions(
  area: string,
  varianceReport: VarianceReport
): Promise<string> {

  // Read current memory
  const memory = await readCLAUDEmd(area);

  // Get most recent (presumably correct) implementations
  const implementations = await getRecentImplementations(area, { limit: 5 });

  // Extract patterns that need to be EXACT
  const exactPatterns = varianceReport.variances.map(v => ({
    type: v.pattern_type,
    implementation: selectBestImplementation(v.variants, implementations)
  }));

  // Generate specialist instructions
  return `
# ${area.split('/').pop()} Specialist

You are a specialized agent for ${area}. Your implementations must be EXACT
to ensure consistency across sessions.

## Embedded Patterns (from area CLAUDE.md)
${memory.patterns.map(p => `• ${p}`).join('\n')}

## EXACT Implementations (no variance allowed)
${exactPatterns.map(p => `
### ${p.type}
\`\`\`typescript
${p.implementation}
\`\`\`
NEVER deviate from this implementation.
`).join('\n')}

## Cross-Cutting (embedded from imports)
${await embedCrossCutting(memory.dependencies)}

## When to Read Memory
You do NOT need to read ${area}/CLAUDE.md - these patterns are embedded above.
Only read memory if working on something NOT covered in your embedded patterns.
`.trim();
}
```

---

## Part 8: Complete Integration Flow

### With Specialist Present

```
User: "Fix the webhook retry logic - it's not retrying failed events"

┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION (100 tokens)                                              │
│                                                                          │
│  Reads: Root CLAUDE.md                                                  │
│  Routes: "webhook" + "retry" → src/services/billing/webhooks/           │
│  Checks: webhook-processor specialist? YES                              │
│  Decision: Route to specialist                                          │
│                                                                          │
│  Dynamic context: "Fix retry logic - events not retrying"               │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  WEBHOOK-PROCESSOR SPECIALIST (1200 tokens embedded)                     │
│                                                                          │
│  Already knows (embedded):                                               │
│  • Exact BullMQ configuration                                           │
│  • Signature validation (crypto.timingSafeEqual)                        │
│  • Idempotency pattern                                                  │
│  • Retry configuration: { attempts: 3, backoff: exponential, delay: 1000 }│
│  • Error handling: WebhookProcessingError class                         │
│                                                                          │
│  Reads at runtime: NOTHING (all embedded)                               │
│                                                                          │
│  Executes: Fixes retry logic using EXACT embedded patterns              │
│  Guarantee: Same implementation as every other session                  │
│                                                                          │
│  Total context: 1200 + 50 = 1250 tokens                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Without Specialist (General Agent)

```
User: "Fix the webhook retry logic - it's not retrying failed events"

┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION (100 tokens)                                              │
│                                                                          │
│  Reads: Root CLAUDE.md                                                  │
│  Routes: "webhook" + "retry" → src/services/billing/webhooks/           │
│  Checks: webhook-processor specialist? NO                               │
│  Assesses: Payment related + multi-step → SPECIALIST RECOMMENDED        │
│  Decision: Route to general (backend-architect) + surface opportunity   │
│                                                                          │
│  Dynamic context: WHAT-WHERE-WHY                                         │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND-ARCHITECT GENERAL (700 tokens embedded)                         │
│                                                                          │
│  Knows (embedded):                                                       │
│  • TDD methodology                                                      │
│  • Quality gates                                                        │
│  • How to read CLAUDE.md                                                │
│                                                                          │
│  Reads at runtime:                                                       │
│  • src/services/billing/webhooks/CLAUDE.md (100 tokens)                 │
│  • docs/security/CLAUDE.md (100 tokens)                                 │
│  • docs/api/CLAUDE.md (100 tokens)                                      │
│                                                                          │
│  Executes: Implements retry based on patterns read                      │
│  Guarantee: Follows patterns but MAY INTERPRET DIFFERENTLY              │
│                                                                          │
│  Total context: 700 + 300 + 50 = 1050 tokens                            │
│  (lower than specialist but NO consistency guarantee)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  POST-EXECUTION: VARIANCE TRACKING                                       │
│                                                                          │
│  Claude-mem records:                                                     │
│  • Implementation pattern used                                          │
│  • Configuration values                                                 │
│  • Area: src/services/billing/webhooks/                                 │
│                                                                          │
│  If variance detected with previous sessions:                           │
│  → Surface specialist opportunity with higher urgency                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 9: What v11 Adds Over v10

| Capability | v10 | v11 |
|------------|-----|-----|
| Cross-cutting focus | Primary concern | Secondary to consistency |
| Specialist purpose | Efficiency | **Consistency guarantee** |
| Memory limitation | Not explicit | **Cannot enforce, only describe** |
| Patchwork problem | Not addressed | **Core problem solved** |
| Context budget | Per-layer estimate | **Detailed by layer with guarantees** |
| Variance detection | Not mentioned | **Trigger for specialist creation** |
| Memory evolution | Static | **Evolves to specialist when needed** |
| Specialist generation | Manual | **Auto-generated from variance + memory** |
| API as cross-cutting | Mentioned | **Explicit embedding strategy** |

---

## Part 10: Success Metrics

1. **Consistency Rate**: 95%+ identical implementations from specialist agents
2. **Variance Detection**: 90%+ of variance cases detected within 3 sessions
3. **Specialist ROI**: Areas with specialists show 60%+ error rate reduction
4. **Context Efficiency**: Specialist total context within 20% of general agent
5. **Memory Simplification**: 50%+ reduction in memory size after specialist creation

---

## Appendix A: Layer Responsibility Matrix

| Responsibility | Orchestration | Memory | General Agent | Specialist |
|----------------|---------------|--------|---------------|------------|
| Know WHERE | ✓ | | | |
| Know WHAT outcome | ✓ | | | |
| Know WHO (agent) | ✓ | | | |
| Describe patterns | | ✓ | | |
| List conventions | | ✓ | | |
| Execute methodology | | | ✓ | ✓ |
| Follow patterns | | | ✓ | |
| **Guarantee patterns** | | | | ✓ |
| Embed exact config | | | | ✓ |
| Detect variance | Hook | | | |
| Create specialists | | | | System |

---

## Appendix B: The Guarantee Equation

```
GENERAL AGENT + MEMORY = follows(patterns) // may vary

SPECIALIZED AGENT = guarantees(exact_implementation) // no variance

// When to upgrade:
if (variance_detected(area) || is_critical(area)) {
  upgrade(area, from: 'memory+general', to: 'specialist');
}
```
