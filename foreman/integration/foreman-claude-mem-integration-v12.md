# Foreman + Claude-Mem Integration Specification v12

## Executive Summary

v12 addresses a second dimension of patchwork: **placement consistency**. v11 established that memories describe patterns while agents guarantee consistent implementation. v12 adds: memories encode **what-goes-where** while agents guarantee code lands in the **correct location**.

**Core Insight**: Patchwork has two dimensions:
1. **Implementation patchwork** (v11): Same pattern, different configurations
2. **Placement patchwork** (v12): Code scattered across wrong files/locations

**The Real Problem Solved**: General agents may implement correctly but put code in the wrong place, violating single-responsibility, DRY, and modular organization. Specialized agents guarantee both HOW to implement AND WHERE to place.

---

## Part 1: The Two-Dimensional Patchwork Problem

### Dimension 1: Implementation Patchwork (v11)

Memory says: "Use BullMQ with exponential backoff"

**Session 1**: `{ attempts: 3, delay: 1000 }`
**Session 2**: `{ attempts: 5, delay: 2000 }`

Same pattern, different configurations. Solved by specialized agents embedding EXACT configurations.

### Dimension 2: Placement Patchwork (v12 - NEW)

Memory says: "Billing logic in src/services/billing/"

**Session 1**: Adds payment retry to `src/services/billing/retry.ts` ✓
**Session 2**: Adds payment retry to `src/services/users/helpers.ts` ✗

Code works but violates single-responsibility. The billing area now has payment logic scattered in the users module.

### The Development Standards Foundation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DEVELOPMENT STANDARDS THAT DRIVE "WHAT-GOES-WHERE"                     │
│                                                                          │
│  1. DRY (Don't Repeat Yourself)                                         │
│     Before writing code, search for existing helpers                    │
│     → Memory must tell you WHERE to look                                │
│                                                                          │
│  2. Single-Responsibility                                               │
│     One concern per module/class                                        │
│     → Memory must define FILE OWNERSHIP                                 │
│                                                                          │
│  3. Modularity                                                          │
│     Small sub-folders over monolithic files                             │
│     → Memory must encode MODULE BOUNDARIES                              │
│                                                                          │
│  4. ≤150 LOC per file                                                   │
│     Split into helpers/sub-folders when exceeded                        │
│     → File structure planning required BEFORE implementation            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Memory as "What-Goes-Where" Map

### Current Memory Format (Insufficient)

```markdown
# Billing Memory

## Purpose & Entry Points
- Handles payment processing
- Main entry: src/services/billing/index.ts

## Patterns
- Use BullMQ for queues
- Stripe for payments
```

**Problem**: Tells you WHAT the area does, not WHERE each concern lives.

### Enhanced Memory Format (v12)

```markdown
# Billing Memory

## Purpose & Entry Points
- Handles payment processing, subscriptions, webhooks
- Main entry: src/services/billing/index.ts

## File Ownership Map
│ Concern              │ Owner File                          │ Never In           │
│──────────────────────│─────────────────────────────────────│────────────────────│
│ Payment processing   │ processor.ts                        │ webhooks/, users/  │
│ Subscription logic   │ subscriptions.ts                    │ processor.ts       │
│ Webhook handling     │ webhooks/handler.ts                 │ processor.ts       │
│ Retry logic          │ webhooks/retry.ts                   │ Top-level billing/ │
│ Stripe integration   │ providers/stripe.ts                 │ Direct in handler  │

## Shared Utilities (DRY Enforcement)
- Retry helper: @../../utils/retry.ts (USE THIS, don't create new)
- Crypto/signing: @../../utils/crypto.ts (for signature validation)
- Error types: @../../errors/billing.ts (extend, don't duplicate)

## Module Boundaries (Single Responsibility)
- billing/ owns: payment, subscription, invoice, webhook
- billing/ NEVER handles: user auth, session management, notification
- When billing needs user data: Import from @../users/, never duplicate

## Extension vs Creation
- New payment method? → Extend processor.ts or add to providers/
- New webhook type? → Extend webhooks/handler.ts, add case
- New subscription tier? → Extend subscriptions.ts
- Cross-cutting concern? → Add to appropriate @utils/ or @shared/

## Patterns
- BullMQ for async jobs (config in constants/queues.ts)
- Stripe SDK via providers/stripe.ts (never direct import elsewhere)

## Dependencies
@../../docs/api/CLAUDE.md
@../../docs/security/CLAUDE.md
```

---

## Part 3: The DRY Enforcement Protocol

### Pre-Implementation Search (Critical)

Development standards rule #1: "Before writing code, search the codebase for similar logic or helpers."

Memory must facilitate this search:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DRY ENFORCEMENT WORKFLOW                                                │
│                                                                          │
│  Task: "Add retry logic for failed webhook processing"                  │
│                                                                          │
│  STEP 1: Check Memory for Shared Utilities                              │
│  ─────────────────────────────────────────                              │
│  Memory says: "Retry helper: @../../utils/retry.ts"                     │
│                                                                          │
│  STEP 2: Read Shared Utility                                            │
│  ───────────────────────────                                            │
│  Found: utils/retry.ts with exponentialBackoff() function               │
│  Assessment: Matches need - USE THIS                                    │
│                                                                          │
│  STEP 3: Determine Placement                                            │
│  ──────────────────────────                                             │
│  Memory says: "Retry logic → webhooks/retry.ts"                         │
│  Memory says: "Webhook handling → webhooks/handler.ts"                  │
│                                                                          │
│  STEP 4: Implementation                                                  │
│  ────────────────────────                                               │
│  Location: src/services/billing/webhooks/retry.ts                       │
│  Approach: Import from utils/retry.ts, wrap for webhook-specific needs  │
│                                                                          │
│  RESULT: No duplicate helper created, code in correct location          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Happens Without DRY Enforcement

```typescript
// Session 1: Creates src/utils/retry.ts
export function exponentialBackoff(fn, options) { ... }

// Session 2: Doesn't find it, creates src/services/billing/helpers/retry.ts
export function retryWithBackoff(operation, config) { ... }

// Session 3: Doesn't find either, creates src/services/users/utils/retry-helper.ts
export function attemptWithRetry(action, settings) { ... }
```

Three implementations of the same pattern. Memory should prevent this.

---

## Part 4: File Structure Planning Before Implementation

### The Chain-Issue Pattern

From foreman's chain-issue workflow, implementation requires pre-planning:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FILE STRUCTURE PLANNING (Before Any Code)                               │
│                                                                          │
│  Task: "Add webhook retry with dead letter queue"                       │
│                                                                          │
│  STEP 1: Analyze Current Structure                                       │
│  ────────────────────────────────                                        │
│  src/services/billing/webhooks/                                         │
│  ├── handler.ts (145 LOC - near limit)                                  │
│  ├── types.ts (40 LOC)                                                  │
│  └── index.ts (15 LOC)                                                  │
│                                                                          │
│  STEP 2: Plan File Structure                                             │
│  ────────────────────────────                                            │
│  New feature needs ~100 LOC. handler.ts + 100 would exceed 200 limit.   │
│                                                                          │
│  Decision: Create new file for retry logic                              │
│                                                                          │
│  Planned structure:                                                      │
│  src/services/billing/webhooks/                                         │
│  ├── handler.ts (145 LOC - unchanged)                                   │
│  ├── retry.ts (NEW - retry logic ~80 LOC)                               │
│  ├── dead-letter.ts (NEW - DLQ logic ~60 LOC)                           │
│  ├── types.ts (40 LOC + new types ~20 LOC)                              │
│  └── index.ts (15 LOC + new exports)                                    │
│                                                                          │
│  STEP 3: Bottom-Up Implementation Order                                  │
│  ──────────────────────────────────────                                  │
│  1. types.ts (leaf - no dependencies on new code)                       │
│  2. dead-letter.ts (leaf - depends only on types)                       │
│  3. retry.ts (depends on dead-letter.ts)                                │
│  4. handler.ts (update to use retry.ts)                                 │
│  5. index.ts (update exports)                                           │
│                                                                          │
│  STEP 4: Memory Update (After Implementation)                            │
│  ──────────────────────────────────────────                              │
│  Update File Ownership Map:                                              │
│  - Retry logic: webhooks/retry.ts (NEW)                                 │
│  - Dead letter handling: webhooks/dead-letter.ts (NEW)                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Memory Enables File Structure Planning

Memory's File Ownership Map tells the planner:
- Where new concerns SHOULD go (webhooks/ for webhook-related)
- Where new concerns SHOULD NOT go (top-level billing/)
- What already exists (handler.ts for event dispatch)
- Where to extend vs create new

---

## Part 5: Orchestration with Placement Awareness

### Enhanced Routing with "Where" Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION RECEIVES TASK                                             │
│                                                                          │
│  "Add retry logic for failed Stripe webhooks"                           │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ROUTE TO MODULE (Root memory - 100 tokens)                      │
│                                                                          │
│  Keywords: "stripe", "webhooks", "retry"                                │
│  Service Map: stripe → billing, webhooks → billing/webhooks             │
│                                                                          │
│  Route: src/services/billing/webhooks/                                  │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: IDENTIFY FILE PLACEMENT (Area memory - 100 tokens)              │
│                                                                          │
│  File Ownership Map says:                                                │
│  - Retry logic → webhooks/retry.ts                                      │
│  - Webhook handling → webhooks/handler.ts                               │
│                                                                          │
│  Shared Utilities says:                                                  │
│  - Retry helper: @../../utils/retry.ts (USE THIS)                       │
│                                                                          │
│  Placement Decision:                                                     │
│  - Primary file: webhooks/retry.ts (create or extend)                   │
│  - Import from: utils/retry.ts (DRY enforcement)                        │
│  - Integration point: handler.ts (add call to retry)                    │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: CHECK FOR SPECIALIST                                            │
│                                                                          │
│  Query: Agent covering src/services/billing/webhooks/?                  │
│                                                                          │
│  IF SPECIALIST EXISTS (webhook-processor):                              │
│  ├── Specialist embeds:                                                 │
│  │   • File ownership map (knows WHERE)                                 │
│  │   • Exact implementations (knows HOW)                                │
│  │   • Shared utility locations (enforces DRY)                          │
│  └── Guarantee: Correct placement + consistent implementation           │
│                                                                          │
│  IF NO SPECIALIST (general backend-architect):                          │
│  ├── Must read area memory for file ownership                           │
│  ├── Must search for shared utilities                                   │
│  ├── May interpret placement differently                                │
│  └── Risk: Placement variance                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Specialized Agents with Placement Guarantees

### What Specialists Embed (v11 + v12)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WEBHOOK-PROCESSOR SPECIALIST                                            │
│                                                                          │
│  v11 CONTENT (Implementation Guarantee):                                │
│  ─────────────────────────────────────────                              │
│  ## Exact Configurations                                                │
│  ```typescript                                                          │
│  const WEBHOOK_QUEUE_CONFIG = {                                         │
│    defaultJobOptions: {                                                 │
│      attempts: 3,                                                       │
│      backoff: { type: 'exponential', delay: 1000 }                      │
│    }                                                                    │
│  };                                                                     │
│  ```                                                                    │
│  NEVER deviate from this configuration.                                 │
│                                                                          │
│  v12 CONTENT (Placement Guarantee):                                     │
│  ────────────────────────────────────                                   │
│  ## File Ownership (Embedded)                                           │
│  - Event dispatch: handler.ts                                           │
│  - Retry logic: retry.ts                                                │
│  - Dead letter: dead-letter.ts                                          │
│  - Types: types.ts                                                      │
│                                                                          │
│  ## Placement Rules                                                      │
│  - New retry variants → EXTEND retry.ts, never create new file          │
│  - New event types → ADD to handler.ts switch, add type to types.ts     │
│  - Shared logic → IMPORT from utils/, never duplicate                   │
│                                                                          │
│  ## DRY References (Embedded)                                           │
│  - Use @utils/retry.ts for base retry                                   │
│  - Use @utils/crypto.ts for signature validation                        │
│  - Use @errors/billing.ts for error types                               │
│                                                                          │
│  ## Never Create                                                         │
│  - helpers/ folder (use utils/)                                         │
│  - New retry implementation (extend existing)                           │
│  - Payment logic here (belongs in processor.ts)                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Dual Guarantee

| Agent Type | Implementation Guarantee | Placement Guarantee |
|------------|-------------------------|---------------------|
| General + Memory | Follows patterns (may vary) | Reads ownership (may misplace) |
| Specialized | EXACT configuration | EXACT file location |

---

## Part 7: Context Budget with Placement Awareness

### Updated Layer Costs

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONTEXT BUDGET BY LAYER (v12 Enhanced)                                  │
│                                                                          │
│  LAYER              TOKENS    WHAT IT KNOWS                  GUARANTEE  │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ORCHESTRATION      100-200   WHERE (module)                 Routes     │
│                               WHO (agent)                    correctly  │
│                               WHAT (outcome)                            │
│                                                                          │
│  MEMORY             100-200   File ownership map             Describes  │
│  (enhanced v12)               Shared utility locations       placement  │
│                               Module boundaries              Cannot     │
│                               Extension vs creation          enforce    │
│                               Implementation patterns                   │
│                                                                          │
│  GENERAL AGENT      500-800   Methodology                    Follows    │
│  (instructions)               Quality gates                  memory     │
│                               How to read memory             May vary   │
│                                                                          │
│  RUNTIME READS      200-400   File ownership (WHERE)         Depends on │
│  (general only)               Shared utilities (DRY)         reading    │
│                               Patterns (HOW)                 accuracy   │
│                                                                          │
│  SPECIALIZED AGENT  1000-1800 EXACT implementations          Guarantees │
│  (v12 enhanced)               EXACT file placements          HOW and    │
│                               Embedded DRY references        WHERE      │
│                               Embedded ownership map                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Specialists Are Larger in v12

v11 specialist: 800-1500 tokens (implementation only)
v12 specialist: 1000-1800 tokens (implementation + placement)

Additional content:
- File ownership map (~100-150 tokens)
- Placement rules (~50-100 tokens)
- DRY references (~50-100 tokens)

**Trade-off**: Higher static cost, but eliminates placement variance.

---

## Part 8: Memory Update Procedure

### Post-Implementation Memory Sync (Inspired by Chain-Issue)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MEMORY UPDATE WORKFLOW                                                  │
│                                                                          │
│  After implementation completes, update memory to reflect changes:      │
│                                                                          │
│  STEP 1: Identify Changed Files                                          │
│  ──────────────────────────────                                          │
│  Session tracked: [files_created, files_modified, files_deleted]        │
│                                                                          │
│  Created: webhooks/retry.ts, webhooks/dead-letter.ts                    │
│  Modified: webhooks/handler.ts, webhooks/types.ts, webhooks/index.ts    │
│                                                                          │
│  STEP 2: Determine Memory Impact                                         │
│  ───────────────────────────────                                         │
│  New files created in area → Update File Ownership Map                  │
│  New shared utilities used → Verify DRY references                      │
│  Module boundaries shifted → Update boundary documentation              │
│                                                                          │
│  STEP 3: Update Area Memory                                              │
│  ──────────────────────────                                              │
│  Update billing/webhooks/CLAUDE.md:                                     │
│                                                                          │
│  ## File Ownership Map                                                   │
│  + │ Retry logic        │ retry.ts         │ handler.ts      │          │
│  + │ Dead letter queue  │ dead-letter.ts   │ Top-level       │          │
│                                                                          │
│  STEP 4: Propagate to Specialist (If Exists)                            │
│  ───────────────────────────────────────────                             │
│  If webhook-processor exists:                                            │
│  - Flag specialist for review (file structure changed)                  │
│  - Option: Auto-update specialist's embedded ownership map              │
│  - Option: Surface for human review before updating                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Memory as Living Documentation

Memory isn't static. After each implementation:
1. Track what files were created/modified
2. Update File Ownership Map
3. Verify DRY references still accurate
4. Update specialist embeddings if needed

---

## Part 9: Placement Variance Detection

### Detecting Wrong-Location Code

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
    // Check if file belongs in its module
    const expectedModule = await getExpectedModule(file.concerns);
    if (file.module !== expectedModule) {
      violations.push({
        type: 'wrong_module',
        description: `${file.path} contains ${file.concerns} but is in ${file.module}`,
        suggested_location: `${expectedModule}/${file.name}`
      });
    }

    // Check for duplicate utilities
    const existingUtilities = await findSimilarUtilities(file.exports);
    if (existingUtilities.length > 0) {
      violations.push({
        type: 'duplicate_utility',
        description: `${file.path} duplicates functionality in ${existingUtilities}`,
        suggested_location: 'Use existing utilities, extend if needed'
      });
    }

    // Check for responsibility leaks
    const moduleOwnership = await getModuleOwnership(file.module);
    for (const concern of file.concerns) {
      if (!moduleOwnership.owns.includes(concern)) {
        violations.push({
          type: 'responsibility_leak',
          description: `${file.module} shouldn't handle ${concern}`,
          suggested_location: moduleOwnership.should_be_in[concern]
        });
      }
    }
  }

  return {
    session_id: session.id,
    has_violations: violations.length > 0,
    violations,
    recommendation: violations.length > 0
      ? 'Placement variance detected - consider specialist or memory enhancement'
      : 'Placement correct'
  };
}
```

---

## Part 10: Extension vs Creation Decision Framework

### When to Extend Existing Files

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EXTENSION vs CREATION DECISION TREE                                     │
│                                                                          │
│  Task: Add new functionality                                            │
│                                                                          │
│                    ┌──────────────────┐                                 │
│                    │ Does existing    │                                 │
│                    │ file handle this │                                 │
│                    │ concern?         │                                 │
│                    └────────┬─────────┘                                 │
│                             │                                           │
│              ┌──────────────┴──────────────┐                            │
│              │                             │                            │
│              ▼                             ▼                            │
│          ┌───────┐                     ┌───────┐                        │
│          │  YES  │                     │  NO   │                        │
│          └───┬───┘                     └───┬───┘                        │
│              │                             │                            │
│              ▼                             ▼                            │
│  ┌─────────────────────┐      ┌─────────────────────┐                   │
│  │ File < 150 LOC?     │      │ Shared utility      │                   │
│  └──────────┬──────────┘      │ exists?             │                   │
│             │                 └──────────┬──────────┘                   │
│    ┌────────┴────────┐           ┌───────┴───────┐                      │
│    │                 │           │               │                      │
│    ▼                 ▼           ▼               ▼                      │
│ ┌─────┐          ┌─────┐     ┌─────┐         ┌─────┐                    │
│ │ YES │          │ NO  │     │ YES │         │ NO  │                    │
│ └──┬──┘          └──┬──┘     └──┬──┘         └──┬──┘                    │
│    │                │           │               │                       │
│    ▼                ▼           ▼               ▼                       │
│ EXTEND          SPLIT &      IMPORT &      CREATE in                    │
│ existing        CREATE       WRAP for      correct                      │
│ file            helper       specific      module                       │
│                 file         needs                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Memory Guides the Decision

Memory's File Ownership Map provides:
- **Which file owns which concern** → Know where to extend
- **LOC estimates** → Know when to split
- **Shared utilities** → Know where to import from
- **Module boundaries** → Know where to create new

---

## Part 11: What v12 Adds Over v11

| Capability | v11 | v12 |
|------------|-----|-----|
| Implementation consistency | ✓ Agents guarantee | ✓ Maintained |
| Placement consistency | Not addressed | **✓ File ownership maps** |
| DRY enforcement | Implicit | **✓ Explicit utility references** |
| File structure planning | Not mentioned | **✓ Pre-implementation planning** |
| Module boundaries | Not explicit | **✓ What belongs where** |
| Extension vs creation | Not addressed | **✓ Decision framework** |
| Memory update workflow | Not detailed | **✓ Post-implementation sync** |
| Placement variance detection | Not mentioned | **✓ Wrong-location detection** |
| Specialist content | Implementation only | **✓ Implementation + placement** |

---

## Part 12: Complete Two-Dimensional Guarantee

### The Full Patchwork Prevention Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PATCHWORK PREVENTION (v12 Complete Model)                               │
│                                                                          │
│                      ┌─────────────────┐                                │
│                      │ MEMORY LAYER    │                                │
│                      │                 │                                │
│                      │ Describes:      │                                │
│                      │ • HOW (patterns)│                                │
│                      │ • WHERE (files) │                                │
│                      │ • DRY (utils)   │                                │
│                      └────────┬────────┘                                │
│                               │                                         │
│         ┌─────────────────────┴─────────────────────┐                   │
│         │                                           │                   │
│         ▼                                           ▼                   │
│  ┌──────────────────┐                     ┌──────────────────┐          │
│  │ GENERAL AGENT    │                     │ SPECIALIST AGENT │          │
│  │                  │                     │                  │          │
│  │ Reads memory for:│                     │ Embeds:          │          │
│  │ • Patterns       │                     │ • EXACT configs  │          │
│  │ • File ownership │                     │ • EXACT files    │          │
│  │ • Utility refs   │                     │ • EXACT DRY refs │          │
│  │                  │                     │                  │          │
│  │ Risk:            │                     │ Guarantee:       │          │
│  │ • May vary HOW   │                     │ • Same HOW       │          │
│  │ • May vary WHERE │                     │ • Same WHERE     │          │
│  └──────────────────┘                     └──────────────────┘          │
│                                                                          │
│  VARIANCE DETECTION                                                      │
│  ───────────────────                                                     │
│  Claude-mem tracks:                                                      │
│  • Implementation patterns (v11) → Detect HOW variance                  │
│  • File placements (v12) → Detect WHERE variance                        │
│                                                                          │
│  When variance detected → Recommend specialist with both guarantees     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 13: Enhanced Memory Template (v12)

### Complete "What-Goes-Where" Memory Format

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
- {SCENARIO_1} → Extend {FILE}, don't create new
- {SCENARIO_2} → Add to {FILE}, new case/branch
- {SCENARIO_3} → Create in {FOLDER}/ (new concern)

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

## Part 14: Success Metrics (v12)

1. **Implementation Consistency** (v11): 95%+ identical configs from specialists
2. **Placement Consistency** (v12 NEW): 95%+ code in correct module from specialists
3. **DRY Compliance**: <5% utility duplication across sessions
4. **Single Responsibility**: <10% cross-module concern leakage
5. **File Size Compliance**: 90%+ files under 150 LOC
6. **Memory Update Rate**: 100% of structural changes reflected in memory
7. **Variance Detection**: 90%+ of both HOW and WHERE variance detected within 3 sessions

---

## Appendix A: Layer Responsibility Matrix (v12 Enhanced)

| Responsibility | Orchestration | Memory | General Agent | Specialist |
|----------------|---------------|--------|---------------|------------|
| Route to module | ✓ | | | |
| Know file ownership | | ✓ | Reads | Embeds |
| Know shared utilities | | ✓ | Reads | Embeds |
| Know module boundaries | | ✓ | Reads | Embeds |
| Describe patterns | | ✓ | | |
| **Guarantee placement** | | | | ✓ |
| **Guarantee implementation** | | | | ✓ |
| Enforce DRY | | Describes | Follows | Guarantees |
| Update after changes | | System | Reports | Reports |

---

## Appendix B: The Two-Dimensional Equation

```
MEMORY describes:
  - HOW (patterns, configs)
  - WHERE (file ownership, boundaries)
  - DRY (shared utilities)

GENERAL AGENT + MEMORY:
  - follows(HOW) // may vary
  - reads(WHERE) // may misplace

SPECIALIZED AGENT:
  - guarantees(EXACT_HOW) // no implementation variance
  - guarantees(EXACT_WHERE) // no placement variance

// Upgrade conditions (v12 enhanced):
if (implementation_variance_detected(area) ||
    placement_variance_detected(area) ||
    is_critical(area)) {
  upgrade(area, from: 'memory+general', to: 'specialist');
}
```

---

## Appendix C: Key Foreman Patterns Incorporated

From `development-standards.mdc`:
- DRY: Search before writing
- Single-Responsibility: One concern per module
- Modularity: Small sub-folders
- ≤150 LOC per file

From `chain-issue.md`:
- File Structure Planning before implementation
- Bottom-Up Implementation Order (leaf first)
- Memory-Manager update after completion
- Worker scope definition with boundaries

From `chain-issue-updater.md`:
- Folder Scoping (primary, secondary, excluded)
- Non-Opinionated Discovery (map terrain, don't prescribe)
- File Structure Plan in worker scope
- Bottom-Up Dependency Analysis
