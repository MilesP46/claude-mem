# Foreman + Claude-Mem Integration Specification v13

## Executive Summary

v13 addresses **context-level DRY**: preventing duplication between agent instructions and memory content. The solution is a **hybrid reference model** where agents LEVERAGE the memory system rather than DUPLICATE it.

**Core Insight**: Foreman's memory system already solves context bloat through bottom-up loading, on-demand subtrees, and functional dependencies. Agents should reference this system, not recreate it.

**The Update Friction Resolution**: Memories update without CLI restart. Agent updates require restart. Therefore: Keep agents LEAN (methodology + variance-critical values only). Everything else comes from memory at runtime.

---

## Part 1: The Context Duplication Problem

### What v11-v12 Proposed (Problematic)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  v11-v12 APPROACH: Embed Memory in Specialist                           │
│                                                                          │
│  SPECIALIST AGENT (1000-1800 tokens):                                   │
│  ├── Methodology (WHAT): 500-800 tokens                                 │
│  ├── File ownership map: 100-150 tokens  ← DUPLICATES memory           │
│  ├── Placement rules: 50-100 tokens      ← DUPLICATES memory           │
│  ├── DRY references: 50-100 tokens       ← DUPLICATES memory           │
│  └── Exact configurations: 200-400 tokens ← NEEDED for consistency     │
│                                                                          │
│  PLUS at runtime:                                                        │
│  ├── Memory loads via bottom-up traversal                               │
│  └── Same file ownership, placement, DRY content loads AGAIN           │
│                                                                          │
│  RESULT: Same content loaded twice = DRY violation at context level    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Real Problem

If specialist embeds memory content AND memory loads at runtime:
- **Context duplication**: Same information twice in context window
- **Update divergence**: Memory updates don't reach embedded agent content
- **Restart friction**: Agent changes require CLI restart, memory changes don't

---

## Part 2: Foreman's Memory System Architecture

### Bottom-Up Loading Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FOREMAN MEMORY LOADING (Already Solved)                                 │
│                                                                          │
│  Editing: services/api/routes/users.js                                  │
│                                                                          │
│  LOADS (bottom-up, on-demand):                                          │
│  1. services/api/routes/CLAUDE.md (if exists)                           │
│  2. services/api/CLAUDE.md                                              │
│  3. services/CLAUDE.md (if exists)                                      │
│  4. Root CLAUDE.md                                                      │
│  5. Dependencies via @path (security, API, DB, ops)                     │
│                                                                          │
│  NOT LOADED:                                                             │
│  - Siblings (services/workers/)                                         │
│  - Cousins (apps/web/)                                                  │
│  - Other subtrees (packages/)                                           │
│                                                                          │
│  TOTAL: ~5-8 relevant files, not 20+                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Implementation | Purpose |
|-----------|----------------|---------|
| Bottom-up | File → parent → root | Load relevant context only |
| On-demand | Subtrees load when working there | No cross-contamination |
| Root zero imports | Navigation only, no @path | Prevents cascade from top |
| Functional deps | @path in Dependencies section | Selective cross-cutting |
| Content delegation | Child owns details, parent references | No duplication |

**This system already prevents context bloat. Agents should leverage it, not recreate it.**

---

## Part 3: The Hybrid Reference Model

### What Goes Where

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AGENT-MEMORY RESPONSIBILITY SPLIT (v13)                                 │
│                                                                          │
│  AGENT STATIC CONTENT (Embedded, doesn't change often):                 │
│  ─────────────────────────────────────────────────────                  │
│  • WHAT: Methodology, TDD workflow, quality gates                       │
│  • WHAT: Decision framework, scope adherence rules                      │
│  • WHAT: How to read and follow memory content                          │
│  • CRITICAL: Variance-critical values ONLY (minimal)                    │
│                                                                          │
│  MEMORY CONTENT (Runtime read, easy to update):                         │
│  ──────────────────────────────────────────────                         │
│  • WHERE: File ownership map                                            │
│  • WHERE: Module boundaries                                             │
│  • WHERE: Shared utilities (DRY references)                             │
│  • HOW: Pattern descriptions                                            │
│  • HOW: Implementation guidance                                         │
│  • DEPS: Cross-cutting concerns via @path                               │
│                                                                          │
│  RESULT: No duplication, easy updates, consistent where needed          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Agent Types in v13

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GENERAL AGENT (Reference Model)                                         │
│                                                                          │
│  Static (500-800 tokens):                                               │
│  • Methodology (TDD, quality gates)                                     │
│  • How to navigate and use memory system                                │
│                                                                          │
│  Runtime (via memory):                                                   │
│  • File ownership (WHERE)                                               │
│  • Patterns (HOW)                                                       │
│  • Shared utilities (DRY)                                               │
│  • Cross-cutting deps                                                   │
│                                                                          │
│  Risk: May interpret memory patterns differently each session           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SPECIALIST AGENT (Lean Hybrid Model)                                    │
│                                                                          │
│  Static (600-900 tokens):                                               │
│  • Methodology (same as general)                                        │
│  • Variance-critical values ONLY (~100-200 tokens)                      │
│    - Exact queue configuration values                                   │
│    - Exact retry parameters                                             │
│    - Exact timeout values                                               │
│    - NOT descriptions, NOT placement, NOT patterns                      │
│                                                                          │
│  Runtime (via memory - SAME as general):                                │
│  • File ownership (WHERE) - from memory                                 │
│  • Patterns (HOW) - from memory                                         │
│  • Shared utilities (DRY) - from memory                                 │
│  • Cross-cutting deps - from memory                                     │
│                                                                          │
│  Guarantee: Variance-critical values consistent, rest from memory       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: What Gets Embedded vs Referenced

### The Decision Matrix

| Content Type | General Agent | Specialist Agent | Reason |
|--------------|---------------|------------------|--------|
| Methodology (WHAT) | Static | Static | Defines agent identity |
| Quality gates | Static | Static | Consistency in process |
| File ownership (WHERE) | Runtime | **Runtime** | Memory is source of truth |
| Module boundaries | Runtime | **Runtime** | Memory is source of truth |
| Shared utilities | Runtime | **Runtime** | Memory is source of truth |
| Pattern descriptions | Runtime | **Runtime** | Easy to update |
| **Variance-critical values** | Runtime | **Static** | Must not vary |

### What Qualifies as "Variance-Critical"

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

### Example: Webhook Processor Specialist

**v11-v12 (Bloated):**
```markdown
# Webhook Processor Specialist (1500+ tokens)

## File Ownership (duplicates memory)
- Event dispatch: handler.ts
- Retry logic: retry.ts
- Dead letter: dead-letter.ts

## Placement Rules (duplicates memory)
- New retry variants → EXTEND retry.ts
- New event types → ADD to handler.ts

## DRY References (duplicates memory)
- Use @utils/retry.ts for base retry
- Use @utils/crypto.ts for signatures

## Exact Configurations (needed)
```typescript
const WEBHOOK_QUEUE_CONFIG = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
};
```

**v13 (Lean):**
```markdown
# Webhook Processor Specialist (700 tokens)

## Methodology
Standard TDD workflow. Follow memory for placement and patterns.

## Variance-Critical Values (ONLY these are embedded)
```typescript
// These exact values must be used - no interpretation
const WEBHOOK_QUEUE_CONFIG = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500
};

const SIGNATURE_VALIDATION = {
  algorithm: 'sha256',
  headerName: 'x-webhook-signature',
  timestampTolerance: 300 // seconds
};
```

## Memory Reference
Read billing/webhooks/CLAUDE.md for:
- File ownership (where to place code)
- Module boundaries (what belongs here)
- Pattern descriptions (how to implement)
- Cross-cutting dependencies (@security, @api)

---

## Part 5: Update Friction Resolution

### The Friction Matrix

| Change Type | Memory Update | Agent Update |
|-------------|---------------|--------------|
| CLI restart required? | No | Yes |
| Immediate effect? | Yes | After restart |
| Who can update? | Memory-manager agent | Human (typically) |
| Frequency | Often (after code changes) | Rare (variance detection) |

### The Solution

```
┌─────────────────────────────────────────────────────────────────────────┐
│  UPDATE FRICTION RESOLUTION                                              │
│                                                                          │
│  FREQUENTLY CHANGING CONTENT → MEMORY (no restart needed):              │
│  • File ownership evolves as code is added/moved                        │
│  • Module boundaries shift with refactoring                             │
│  • Shared utilities expand with new helpers                             │
│  • Patterns evolve with architecture                                    │
│                                                                          │
│  RARELY CHANGING CONTENT → AGENT (restart acceptable):                  │
│  • Methodology (TDD workflow doesn't change often)                      │
│  • Quality gates (LOC limits are stable)                                │
│  • Variance-critical values (once established, rarely change)           │
│                                                                          │
│  RESULT: 90% of updates don't require restart                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Claude-Mem's Empowerment Role

### What Foreman's Memory System Does

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FOREMAN MEMORY SYSTEM (Existing Capability)                             │
│                                                                          │
│  • Creates CLAUDE.md files with patterns, dependencies, navigation      │
│  • Bottom-up generation (deepest first, then parents, then root)        │
│  • Content delegation (child owns details, parent references)           │
│  • Depth-scaled size limits (prevent context bloat)                     │
│  • Memory updates after code changes (memory-manager agent)             │
│  • Bottom-up loading at runtime (file → parent → root → deps)           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Claude-Mem Adds (Intelligence Layer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM EMPOWERMENT (New Capability)                                 │
│                                                                          │
│  1. OBSERVATION LAYER                                                    │
│     Track what patterns agents actually implement                       │
│     Record file placements, configurations used, utilities called       │
│                                                                          │
│  2. VARIANCE DETECTION                                                   │
│     Compare implementations across sessions                             │
│     Detect when same task produces different results                    │
│     Identify interpretation variance in memory patterns                 │
│                                                                          │
│  3. MEMORY VALIDATION                                                    │
│     Verify agents follow memory patterns                                │
│     Detect when implementations diverge from documented patterns        │
│     Alert when memory content isn't being followed                      │
│                                                                          │
│  4. UPDATE SUGGESTIONS                                                   │
│     Suggest memory updates when patterns drift                          │
│     Recommend file ownership updates after structural changes           │
│     Propose new shared utilities when duplication detected              │
│                                                                          │
│  5. ADJACENCY DETECTION                                                  │
│     Detect when new areas need CLAUDE.md                                │
│     Track file activity patterns                                        │
│     Surface promotion opportunities (subdir meeting thresholds)         │
│                                                                          │
│  6. STALENESS ALERTS                                                     │
│     Detect when memory patterns have drifted from actual code           │
│     Alert when documented utilities are no longer used                  │
│     Flag outdated file ownership maps                                   │
│                                                                          │
│  7. SPECIALIST TRIGGERS                                                  │
│     Surface when variance warrants specialist creation                  │
│     Identify variance-critical values from observation patterns         │
│     Generate specialist templates with minimal embedded content         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FOREMAN + CLAUDE-MEM INTEGRATED ARCHITECTURE                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     CLAUDE-MEM                                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │ Observation │→ │ Variance    │→ │ Specialist/Memory       │  │    │
│  │  │ Layer       │  │ Detection   │  │ Update Recommendations  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   FOREMAN MEMORY SYSTEM                          │    │
│  │                                                                   │    │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────────────────────┐   │    │
│  │  │ Root     │ ←─ │ Subtree  │ ←─ │ Cross-Cutting            │   │    │
│  │  │ CLAUDE.md│    │ CLAUDE.md│    │ (security, api, db, ops) │   │    │
│  │  └──────────┘    └──────────┘    └──────────────────────────┘   │    │
│  │       │              │                        │                  │    │
│  │       └──────────────┴────────────────────────┘                  │    │
│  │                      │                                           │    │
│  │              Bottom-Up Loading                                   │    │
│  └──────────────────────┼──────────────────────────────────────────┘    │
│                         │                                               │
│                         ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      AGENTS                                       │    │
│  │                                                                   │    │
│  │  ┌─────────────────┐         ┌─────────────────────────────┐    │    │
│  │  │ General Agent   │         │ Specialist Agent (Lean)     │    │    │
│  │  │                 │         │                             │    │    │
│  │  │ Static:         │         │ Static:                     │    │    │
│  │  │ • Methodology   │         │ • Methodology               │    │    │
│  │  │                 │         │ • Variance-critical values  │    │    │
│  │  │ Runtime:        │         │                             │    │    │
│  │  │ • Memory read   │         │ Runtime:                    │    │    │
│  │  │   for all else  │         │ • Memory read for all else  │    │    │
│  │  └─────────────────┘         └─────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Context Budget Comparison

### v11-v12 vs v13

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONTEXT BUDGET COMPARISON                                               │
│                                                                          │
│  v11-v12 SPECIALIST:                                                     │
│  ├── Agent instructions: 800-1500 tokens                                │
│  │   ├── Methodology: 500-800                                           │
│  │   ├── File ownership (embedded): 100-150 ← DUPLICATE                 │
│  │   ├── Placement rules (embedded): 50-100 ← DUPLICATE                 │
│  │   ├── DRY refs (embedded): 50-100 ← DUPLICATE                        │
│  │   └── Exact configs: 100-200                                         │
│  │                                                                       │
│  ├── Runtime memory load: 200-400 tokens                                │
│  │   ├── Area CLAUDE.md: 100-150 (same content again)                   │
│  │   └── Cross-cutting deps: 100-250                                    │
│  │                                                                       │
│  └── TOTAL: 1000-1900 tokens (with duplication)                         │
│                                                                          │
│  v13 SPECIALIST (Lean):                                                  │
│  ├── Agent instructions: 600-900 tokens                                 │
│  │   ├── Methodology: 500-800                                           │
│  │   └── Variance-critical values only: 100-200                         │
│  │                                                                       │
│  ├── Runtime memory load: 200-400 tokens                                │
│  │   ├── Area CLAUDE.md: 100-150 (source of truth)                      │
│  │   └── Cross-cutting deps: 100-250                                    │
│  │                                                                       │
│  └── TOTAL: 800-1300 tokens (no duplication)                            │
│                                                                          │
│  SAVINGS: ~200-600 tokens per specialist invocation                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 8: Specialist Creation in v13

### What Triggers Specialist Creation

Same as v11-v12, but now claude-mem observes and recommends:

```typescript
interface SpecialistRecommendation {
  area: string;
  trigger: 'variance_detected' | 'critical_area' | 'high_error_rate';

  variance_details?: {
    pattern_type: string;
    variants_observed: string[];
    sessions_affected: number;
  };

  // NEW: Extracted variance-critical values
  recommended_embeds: {
    name: string;
    value: any;
    reason: string;  // Why this value must not vary
  }[];

  // Everything else references memory
  memory_references: string[];  // Which CLAUDE.md files to reference
}
```

### Lean Specialist Template

```markdown
# {Area} Specialist

## Purpose
Specialized agent for {area} with consistency guarantees for variance-critical values.

## Methodology
[Standard TDD workflow, quality gates, scope adherence - same as general agent]

## Variance-Critical Values

**CRITICAL: These exact values must be used. No interpretation allowed.**

```typescript
// Queue Configuration
const {AREA}_QUEUE_CONFIG = {
  // Extracted from variance detection
};

// Retry Parameters
const {AREA}_RETRY_CONFIG = {
  // Extracted from variance detection
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

---

## Part 9: Memory System as Source of Truth

### The Principle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MEMORY IS SOURCE OF TRUTH                                               │
│                                                                          │
│  MEMORY PROVIDES:                                                        │
│  • File ownership (authoritative)                                       │
│  • Module boundaries (authoritative)                                    │
│  • Shared utilities (authoritative)                                     │
│  • Pattern descriptions (authoritative)                                 │
│  • Cross-cutting dependencies (authoritative)                           │
│                                                                          │
│  AGENTS PROVIDE:                                                         │
│  • Methodology (how to work)                                            │
│  • Quality gates (what standards to meet)                               │
│  • Variance-critical values (what must not change)                      │
│                                                                          │
│  CLAUDE-MEM PROVIDES:                                                    │
│  • Observation (what actually happened)                                 │
│  • Validation (did it match memory?)                                    │
│  • Detection (what needs updating?)                                     │
│  • Recommendations (what should change?)                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Update Flow

```
Code changes
    │
    ▼
Memory-manager updates CLAUDE.md
    │
    ▼
Agent reads updated memory at runtime (no restart needed)
    │
    ▼
Claude-mem observes implementation
    │
    ▼
Claude-mem detects variance or staleness
    │
    ▼
Claude-mem recommends:
├── Memory update (if patterns drifted)
└── Specialist creation (if variance unacceptable)
```

---

## Part 10: Foreman Memory Integration Path

### Is Foreman's Memory System Ready for Claude-Mem?

| Foreman Capability | Claude-Mem Integration |
|--------------------|----------------------|
| CLAUDE.md creation | Claude-mem can suggest when to create |
| Bottom-up loading | Claude-mem respects this model |
| Content delegation | Claude-mem validates delegation is followed |
| Size limits | Claude-mem can alert when limits exceeded |
| Memory updates | Claude-mem can suggest specific updates |
| Cross-cutting deps | Claude-mem tracks which deps are actually used |

### Integration Strategy

**Phase 1: Observation Layer**
- Claude-mem observes agent behavior
- Tracks which memories are read
- Records implementation patterns

**Phase 2: Validation Layer**
- Compares implementations to memory content
- Detects variance from documented patterns
- Identifies memory drift

**Phase 3: Recommendation Layer**
- Suggests memory updates
- Recommends specialist creation
- Identifies variance-critical values to embed

**Phase 4: Automation (Future)**
- Auto-update memories based on patterns
- Auto-generate lean specialists
- Self-healing memory system

---

## Part 11: What v13 Adds Over v11-v12

| Capability | v11-v12 | v13 |
|------------|---------|-----|
| Context duplication | Embed memory content | **Reference memory, embed only values** |
| Update friction | Restart for any change | **Restart only for variance-critical** |
| Specialist size | 1000-1800 tokens | **600-900 tokens** |
| Memory relationship | Duplicates content | **Memory is source of truth** |
| Agent methodology | Embedded patterns | **Embedded methodology only** |
| Placement guidance | Embedded | **Runtime from memory** |
| Pattern guidance | Embedded | **Runtime from memory** |
| DRY references | Embedded | **Runtime from memory** |
| Claude-mem role | Variance detection | **Intelligence layer for memory system** |

---

## Part 12: Success Metrics

1. **Context Efficiency**: Specialist total context < 1000 tokens (vs 1500+ in v11-v12)
2. **Update Frequency**: 90%+ of changes handled by memory update (no restart)
3. **Duplication Elimination**: Zero content appears in both agent and memory
4. **Memory Adherence**: 95%+ of implementations follow memory patterns
5. **Variance Detection**: 90%+ of variance detected within 3 sessions
6. **Specialist Leanness**: Variance-critical embeds < 200 tokens per specialist

---

## Appendix A: The Three-Layer Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  THREE-LAYER MODEL (v13)                                                 │
│                                                                          │
│  LAYER 1: MEMORY (Source of Truth)                                       │
│  ─────────────────────────────────                                       │
│  Content: WHERE (placement) + HOW (patterns)                            │
│  Updates: Without CLI restart                                           │
│  Owner: Memory-manager agent                                            │
│  Validates: Claude-mem observation                                      │
│                                                                          │
│  LAYER 2: AGENT (Execution)                                              │
│  ──────────────────────────                                              │
│  Content: WHAT (methodology) + CRITICAL (variance values)               │
│  Updates: Requires CLI restart                                          │
│  Owner: Human/automated generation                                      │
│  Behavior: References memory for WHERE and most of HOW                  │
│                                                                          │
│  LAYER 3: CLAUDE-MEM (Intelligence)                                      │
│  ──────────────────────────────────                                      │
│  Content: Observations, patterns, variance detection                    │
│  Updates: Continuous (always observing)                                 │
│  Owner: Automated system                                                │
│  Output: Memory update recommendations, specialist triggers             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Context Loading Comparison

```
OLD (v11-v12):
Agent loads: 1500 tokens (methodology + embedded memory content)
Runtime loads: 400 tokens (memory again)
Total: 1900 tokens
Duplication: ~400 tokens

NEW (v13):
Agent loads: 700 tokens (methodology + variance-critical only)
Runtime loads: 400 tokens (memory, source of truth)
Total: 1100 tokens
Duplication: 0 tokens

Savings: 800 tokens (42% reduction)
```

---

## Appendix C: The Lean Specialist Equation

```
// v11-v12 (bloated)
SPECIALIST = methodology + embedded_WHERE + embedded_HOW + embedded_DRY + values
           = 800 + 150 + 100 + 100 + 200
           = 1350 tokens (before runtime memory load)

// v13 (lean)
SPECIALIST = methodology + variance_critical_values_only
           = 700 + 150
           = 850 tokens (memory provides the rest)

// Memory provides (runtime):
MEMORY = file_ownership + patterns + utilities + deps
       = 100 + 100 + 50 + 150
       = 400 tokens

// Total context:
v11-v12: 1350 + 400 = 1750 (with ~300 duplicated)
v13:     850 + 400 = 1250 (zero duplication)
```
