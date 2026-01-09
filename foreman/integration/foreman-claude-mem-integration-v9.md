# Foreman + Claude-Mem Integration Specification v9

## Executive Summary

v9 addresses **context containment**: How do we ensure orchestrating agents read only navigation-level memory while subagents read detail-level memory? How do we automate memory creation as projects grow? How do we unify `/add-functionality` and `/start-issue` patterns?

**Core Insight**: The foreman memory system already has two distinct layers:
1. **Navigation Layer** (Root + Service Map): WHERE things are
2. **Detail Layer** (Subtree CLAUDE.md): HOW things work

The problem: Orchestrators currently read too much detail. The solution: Orchestrators read navigation, subagents read detail.

**Key Additions:**
1. Automated memory opportunity detection (mirrors agent opportunity detection)
2. Navigation-only orchestrator reading pattern
3. Unified command pattern for `/add-functionality` and `/start-issue`
4. Area-scoped subagent launching with memory containment

---

## Part 1: Navigation vs Detail Memory Layers

### Current Memory Architecture (Review)

The foreman memory system already defines distinct content layers:

**Root CLAUDE.md (Navigation Layer):**
```markdown
# Project Memory

## Context Discovery Protocol
1. Identify the domain - What am I modifying?
   - Backend services: services/, api/
   - Frontend: web/, apps/
   - Shared: packages/, libs/

2. Read the local CLAUDE.md - Each domain has its own memory

## Service Map
- Backend: services/ - API services and business logic
- Frontend: web/ - React application
- Database: db/ - Migrations and queries
- Docs: docs/ - API specs and security policies
```

**Subtree CLAUDE.md (Detail Layer):**
```markdown
# Billing Service Memory

## Purpose & Entry Points
- Handles subscription and payment processing
- Main entry: src/services/billing/index.ts

## Patterns
- Uses Stripe SDK for payment processing
- Event-driven architecture with BullMQ queues
- Idempotency keys required for all mutations

## Dos & Don'ts
- MUST validate webhook signatures
- NEVER store card numbers
- ALWAYS use correlation IDs in logs

## Dependencies
@../../docs/security/CLAUDE.md
@../../docs/api/CLAUDE.md
```

### The Context Containment Problem

**Current (Problematic) Pattern:**
```
Orchestrator Agent
├── Reads root CLAUDE.md (100 tokens)
├── Reads src/services/CLAUDE.md (120 tokens)
├── Reads src/services/billing/CLAUDE.md (100 tokens)  ← Detail!
├── Reads src/services/auth/CLAUDE.md (90 tokens)      ← Detail!
├── Reads src/api/CLAUDE.md (110 tokens)               ← Detail!
└── Total: 520 tokens of memory context

Then launches subagent that RE-READS much of this...
```

**v9 Pattern (Context Containment):**
```
Orchestrator Agent
├── Reads root CLAUDE.md (100 tokens)
│   → Service Map tells WHERE things are
│   → Context Discovery tells HOW to navigate
├── Determines: "Billing work needed"
└── Launches billing-scoped subagent
    └── Subagent reads src/services/billing/CLAUDE.md (100 tokens)
        → Has full detail for its scope
        → Doesn't duplicate orchestrator's navigation reading

Total orchestrator context: 100 tokens (not 520)
Subagent has exactly what it needs for its area
```

### Navigation Layer Content Requirements

For orchestrators to function with ONLY root-level reading, root CLAUDE.md must contain:

```markdown
## Service Map (Enhanced for Orchestration)

### Functional Areas
| Area | Path | Primary Function | Key Agent |
|------|------|------------------|-----------|
| Billing | src/services/billing/ | Payments, subscriptions | backend-architect |
| Auth | src/services/auth/ | Authentication, sessions | backend-architect |
| Users | src/api/users/ | User CRUD, profiles | backend-architect |
| Web App | web/src/ | React frontend | frontend-developer |
| Notifications | src/services/notifications/ | Email, push | backend-architect |

### Cross-Cutting Concerns
| Concern | Location | When to Reference |
|---------|----------|-------------------|
| Security | docs/security/ | Auth, validation, secrets |
| API Contracts | docs/api/ | New endpoints, changes |
| Database | db/ | Schema changes, migrations |

### Functionality Keywords
(Helps orchestrator match user requests to areas)

- "payment", "subscription", "billing", "stripe" → Billing
- "login", "auth", "session", "token" → Auth
- "user", "profile", "account" → Users
- "email", "notification", "alert" → Notifications
- "ui", "component", "page", "form" → Web App
```

This enhanced Service Map lets orchestrators:
1. Match user requests to areas via keywords
2. Know which agent covers each area
3. Understand cross-cutting concern locations
4. Navigate WITHOUT reading subtree details

---

## Part 2: Automated Memory Coverage

### Memory Opportunity Detection

As projects develop, new directories are created that should have CLAUDE.md files. We need automated detection:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MEMORY OPPORTUNITY DETECTION PIPELINE                                   │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  HOOKS   │ ──►│ TRACK    │ ──►│ ANALYZE  │ ──►│ SURFACE  │          │
│  │          │    │          │    │          │    │          │          │
│  │ PostTool │    │ File     │    │ Adjacency│    │ Memory   │          │
│  │ Use      │    │ Creates  │    │ Check    │    │ Opport-  │          │
│  │          │    │          │    │          │    │ unities  │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                                                          │
│  Triggers:                                                               │
│  - New file created in directory without CLAUDE.md                      │
│  - Directory file count crosses adjacency threshold (≥3)                │
│  - Directory LOC crosses threshold (≥150)                               │
│  - Logical unit created (index.ts + 2+ supporting files)               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Memory Threshold vs Agent Threshold

| Aspect | Memory (CLAUDE.md) | Agent |
|--------|-------------------|-------|
| Minimum files | ≥3 source files | ≥8 source files |
| Minimum directories | 1 | ≥2 |
| Creation cost | Low (file write) | High (context overhead) |
| Detection frequency | Every session | Daily batch |
| Auto-creation | Yes (with user notification) | No (requires approval) |
| Threshold source | Adjacency heuristics | Benefit-cost analysis |

### Memory Opportunity Detection Implementation

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

// PostToolUse hook extension
async function detectMemoryOpportunities(
  session_id: string,
  file_path: string,
  operation: 'created' | 'modified'
): Promise<void> {

  if (operation !== 'created') return;

  const directory = path.dirname(file_path);

  // Skip if already has CLAUDE.md
  if (await hasCLAUDEmd(directory)) return;

  // Check adjacency thresholds
  const dirStats = await getDirectoryStats(directory);

  const meetsThreshold =
    dirStats.file_count >= 3 ||
    dirStats.loc_total >= 150 ||
    (dirStats.has_entrypoint && dirStats.file_count >= 2);

  if (meetsThreshold) {
    await createMemoryOpportunity({
      directory_path: directory,
      reason: determineReason(dirStats),
      current_state: dirStats,
      recommendation: 'create',
      confidence: calculateConfidence(dirStats)
    });

    // Notify frontend
    await notifyFrontend('memory_opportunity', { directory });
  }
}

// Background job for comprehensive scan
async function scanForMemoryGaps(): Promise<MemoryOpportunity[]> {
  const opportunities: MemoryOpportunity[] = [];

  // Get all directories with source files
  const directories = await getAllSourceDirectories();

  for (const dir of directories) {
    if (await hasCLAUDEmd(dir)) continue;

    const stats = await getDirectoryStats(dir);

    // Apply adjacency heuristics from memory-system-standards
    if (shouldHaveCLAUDEmd(stats)) {
      opportunities.push({
        directory_path: dir,
        reason: determineReason(stats),
        current_state: stats,
        recommendation: 'create',
        confidence: calculateConfidence(stats)
      });
    }
  }

  return opportunities;
}

function shouldHaveCLAUDEmd(stats: DirectoryStats): boolean {
  // From memory-system-standards.mdc adjacency heuristics:
  // ≥3 source files
  if (stats.file_count >= 3) return true;

  // Entrypoint + ≥2 additional files
  if (stats.has_entrypoint && stats.file_count >= 2) return true;

  // ≥150 LOC total
  if (stats.loc_total >= 150) return true;

  // Logical architectural unit (detected by patterns)
  if (stats.is_logical_unit) return true;

  return false;
}
```

### Auto-Creation vs User Approval

**Memory (Low Cost → Auto-Create with Notification):**
```typescript
async function handleMemoryOpportunity(opp: MemoryOpportunity): Promise<void> {
  if (opp.confidence > 0.8) {
    // High confidence: auto-create and notify
    await launchMemoryManager(opp.directory_path);
    await notifyUser(`Created CLAUDE.md for ${opp.directory_path}`);
  } else {
    // Lower confidence: surface for approval
    await surfaceForApproval('memory', opp);
  }
}
```

**Agent (High Cost → Always Require Approval):**
```typescript
async function handleAgentOpportunity(opp: AgentCandidate): Promise<void> {
  // Always require user approval for agents
  await surfaceForApproval('agent', opp);
}
```

---

## Part 3: Unified Command Pattern

### The Problem: Inconsistent Context Reading

Currently, commands might read varying amounts of memory:
- Some read root + all affected subtrees (too much)
- Some read only root (maybe not enough for complex routing)
- Pattern is inconsistent

### The Solution: Unified Orchestration Pattern

Both `/add-functionality` and `/start-issue` should follow identical patterns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  UNIFIED COMMAND PATTERN                                                 │
│                                                                          │
│  PHASE 1: NAVIGATION (Orchestrator reads ONLY root)                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Read: Root CLAUDE.md                                           │    │
│  │  Extract:                                                       │    │
│  │  - Service Map (functional areas + paths + agents)              │    │
│  │  - Functionality Keywords (request → area mapping)              │    │
│  │  - Cross-Cutting Concerns (what exists where)                   │    │
│  │                                                                  │    │
│  │  DO NOT READ: Subtree CLAUDE.md files                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                     │                                    │
│                                     ▼                                    │
│  PHASE 2: ROUTING (Determine affected areas)                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Match user request to functional areas via:                     │    │
│  │  - Keyword matching ("payment" → Billing)                       │    │
│  │  - Path extraction (explicit paths in request)                  │    │
│  │  - Semantic understanding (LLM inference)                       │    │
│  │                                                                  │    │
│  │  Output: List of (area_path, suggested_agent) tuples            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                     │                                    │
│                                     ▼                                    │
│  PHASE 3: DELEGATION (Launch area-scoped subagents)                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  For each affected area:                                         │    │
│  │  - Create work item with area scope                             │    │
│  │  - Launch appropriate agent with area path                      │    │
│  │  - Subagent reads area's CLAUDE.md (detail layer)               │    │
│  │                                                                  │    │
│  │  Orchestrator DOES NOT read area memories                       │    │
│  │  Subagent has full context for its scoped work                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### /add-functionality Implementation

```markdown
---
argument-hint: <functionality-description>
description: Route new functionality to appropriate agents with navigation-only context
---

# /add-functionality Command

## Execution

### Phase 1: Navigation Context
```bash
# Read ONLY root CLAUDE.md
Read: ./CLAUDE.md
Extract: Service Map, Functionality Keywords, Cross-Cutting Concerns
```

### Phase 2: Area Routing
```
User: "Add email notifications for order status changes"

Keyword matches:
- "email" → Notifications (src/services/notifications/)
- "notification" → Notifications (src/services/notifications/)
- "order" → Orders (src/services/orders/) [if exists]

Affected areas:
- src/services/notifications/ (primary)
- src/services/orders/ (trigger source)
- src/events/ (event definitions)
```

### Phase 3: Work Item Generation
```yaml
# Generated issue YAML
title: Add email notifications for order status changes
affected_areas:
  - path: src/services/notifications/
    agent: backend-architect
    work: Implement email sending logic
  - path: src/services/orders/
    agent: backend-architect
    work: Add notification trigger on status change
  - path: src/events/
    agent: backend-architect
    work: Define OrderStatusChanged event

# Orchestrator did NOT read any area CLAUDE.md files
# Each subagent will read its area's CLAUDE.md when launched
```

### Phase 4: Launch Chain
```
Launch chain-issue with generated work items
Each work item executed by area-scoped agent
Agent reads area CLAUDE.md at execution time
```
```

### /start-issue Implementation

```markdown
---
argument-hint: <issue-number>
description: Begin work on GitHub issue with navigation-only context
---

# /start-issue Command

## Execution

### Phase 1: Fetch Issue Context
```bash
# Get issue details from GitHub (cached via worker)
GET /api/github/issues/{issue_number}
Extract: title, body, labels, affected_files (from comments)
```

### Phase 2: Navigation Context
```bash
# Read ONLY root CLAUDE.md
Read: ./CLAUDE.md
Extract: Service Map, identify areas from issue context
```

### Phase 3: Area Determination
```
Issue #42: "Fix subscription renewal webhook handling"

From issue body/labels:
- mentions: src/services/billing/webhooks/
- labels: [billing, webhooks, bug]

From Service Map:
- Billing: src/services/billing/ → backend-architect
- Webhooks: cross-cutting security concern

Affected areas:
- src/services/billing/webhooks/ (primary)
```

### Phase 4: Launch with Area Scope
```
Launch backend-architect with:
- scope: src/services/billing/webhooks/
- issue_context: GitHub issue #42 details
- instruction: "Read area CLAUDE.md, then fix webhook handling"

Subagent execution:
1. Reads src/services/billing/webhooks/CLAUDE.md
2. Has full context for this specific area
3. Executes fix within scope
```
```

### Pattern Alignment Table

| Phase | /add-functionality | /start-issue |
|-------|-------------------|--------------|
| Input | User description | GitHub issue number |
| Navigation Read | Root CLAUDE.md | Root CLAUDE.md |
| Area Determination | Keyword + semantic match | Issue labels + mentioned paths |
| Output | Issue YAML with area assignments | Direct agent launch with area scope |
| Subagent Trigger | chain-issue workflow | Direct Task tool launch |
| Memory Reading | Subagent reads area CLAUDE.md | Subagent reads area CLAUDE.md |

**Critical Alignment**: Both commands follow the same navigation-then-delegation pattern. Orchestrator reads root only. Subagents read area details.

---

## Part 4: Root CLAUDE.md Enhancements

For this pattern to work, root CLAUDE.md needs orchestration-supporting content:

### Current Root Template Gaps

Current root CLAUDE.md has:
- ✅ Context Discovery Protocol
- ✅ Service Map
- ❌ Functionality keyword mapping
- ❌ Agent assignment by area
- ❌ Cross-cutting concern summary

### Enhanced Root Template

```markdown
# Project Memory

## Quick Start
- Install: npm install
- Dev: npm run dev
- Test: npm test

## Orchestration Guide

### Functional Areas
| Area | Path | Keywords | Primary Agent |
|------|------|----------|---------------|
| Billing | src/services/billing/ | payment, subscription, invoice, stripe | backend-architect |
| Auth | src/services/auth/ | login, logout, session, token, jwt | backend-architect |
| Users | src/api/users/ | user, profile, account, settings | backend-architect |
| Notifications | src/services/notifications/ | email, sms, push, alert | backend-architect |
| Web App | web/src/ | component, page, form, ui, button | frontend-developer |
| Database | db/ | migration, schema, table, query | backend-architect |

### Cross-Cutting Concerns
| Concern | Location | Affects |
|---------|----------|---------|
| Security | docs/security/ | All API endpoints, auth flows |
| API Contracts | docs/api/ | Public endpoints, integrations |
| Observability | docs/ops/ | Production services |

### Agent Routing Rules
- Backend changes (services/, api/, db/) → backend-architect
- Frontend changes (web/, apps/) → frontend-developer
- Multi-area changes → sequential agents per area
- Cross-cutting concerns → read concern CLAUDE.md, apply to affected areas

## Context Discovery Protocol

**For orchestrating commands (not subagents):**
1. Read this root file for navigation
2. Match request keywords to Functional Areas table
3. Identify affected areas and their agents
4. Delegate to area-scoped subagents
5. DO NOT read subtree CLAUDE.md files

**For executing subagents:**
1. Read the area's CLAUDE.md for patterns and rules
2. Read cross-cutting concerns via @ imports
3. Execute within your area scope

## Service Map

### Backend
- services/ - Business logic services
  - billing/ - Payment and subscription handling
  - auth/ - Authentication and sessions
  - notifications/ - Email and push notifications
- api/ - REST endpoints
  - users/ - User management
  - orders/ - Order processing

### Frontend
- web/ - React application
  - components/ - Reusable UI components
  - pages/ - Route pages
  - hooks/ - Custom React hooks

### Infrastructure
- db/ - Database migrations and seeds
- docs/ - API specs, security policies, operations guides
```

### Root Enhancement Implementation

```typescript
// When generating/updating root CLAUDE.md, ensure orchestration content
async function ensureOrchestrationContent(rootPath: string): Promise<void> {
  const rootContent = await readFile(path.join(rootPath, 'CLAUDE.md'));

  // Check for required orchestration sections
  const hasOrchestrationGuide = rootContent.includes('## Orchestration Guide');
  const hasFunctionalAreas = rootContent.includes('### Functional Areas');
  const hasAgentRouting = rootContent.includes('### Agent Routing Rules');

  if (!hasOrchestrationGuide || !hasFunctionalAreas || !hasAgentRouting) {
    // Generate orchestration content from project analysis
    const projectAnalysis = await analyzeProjectStructure(rootPath);
    const orchestrationContent = generateOrchestrationContent(projectAnalysis);

    // Update root CLAUDE.md with orchestration content
    await updateRootWithOrchestration(rootPath, orchestrationContent);
  }
}

function generateOrchestrationContent(analysis: ProjectAnalysis): string {
  const functionalAreas = analysis.directories
    .filter(d => d.has_claude_md || d.is_significant)
    .map(d => ({
      area: d.name,
      path: d.path,
      keywords: extractKeywords(d),
      agent: determineAgent(d)
    }));

  return `
## Orchestration Guide

### Functional Areas
| Area | Path | Keywords | Primary Agent |
|------|------|----------|---------------|
${functionalAreas.map(a =>
  `| ${a.area} | ${a.path} | ${a.keywords.join(', ')} | ${a.agent} |`
).join('\n')}

### Agent Routing Rules
- Backend changes (services/, api/, db/) → backend-architect
- Frontend changes (web/, apps/) → frontend-developer
- Multi-area changes → sequential agents per area
`;
}
```

---

## Part 5: Subagent Memory Containment

### Launch Pattern with Memory Scope

When orchestrator launches a subagent, it specifies:
1. Area scope (directory path)
2. Work description
3. Context inheritance (what orchestrator already knows)

```typescript
interface ScopedAgentLaunch {
  agent_name: string;
  area_scope: string;           // Directory path for this agent's work
  work_description: string;     // What to do
  context_inheritance: {
    navigation_summary: string; // What orchestrator understood from root
    related_areas: string[];    // Other areas involved (for coordination)
    cross_cutting: string[];    // Which concerns apply
  };
  memory_instruction: string;   // Explicit instruction to read area CLAUDE.md
}

// Orchestrator builds launch configuration
function buildScopedLaunch(
  workItem: WorkItem,
  navigationContext: NavigationContext
): ScopedAgentLaunch {
  return {
    agent_name: workItem.suggested_agent,
    area_scope: workItem.area_path,
    work_description: workItem.description,
    context_inheritance: {
      navigation_summary: `Working on: ${workItem.description}. ` +
        `This is part of a larger change affecting: ${navigationContext.all_areas.join(', ')}`,
      related_areas: navigationContext.all_areas.filter(a => a !== workItem.area_path),
      cross_cutting: navigationContext.applicable_concerns
    },
    memory_instruction:
      `First, read ${workItem.area_path}/CLAUDE.md for area-specific patterns and rules. ` +
      `Follow any @ imports for cross-cutting concerns. ` +
      `Then proceed with the work within your area scope.`
  };
}
```

### Subagent Execution Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SUBAGENT EXECUTION (Area-Scoped)                                        │
│                                                                          │
│  Receives from orchestrator:                                             │
│  - area_scope: src/services/billing/                                    │
│  - work_description: "Fix webhook signature validation"                  │
│  - context_inheritance: { navigation_summary, related_areas, ... }       │
│  - memory_instruction: "Read area CLAUDE.md first"                       │
│                                                                          │
│  Execution:                                                              │
│  1. Read src/services/billing/CLAUDE.md                                 │
│     → Gets: Purpose, Patterns, Dos/Don'ts, Dependencies                 │
│                                                                          │
│  2. Follow @ imports in Dependencies                                     │
│     → Read: docs/security/CLAUDE.md (for webhook security patterns)     │
│     → Read: docs/api/CLAUDE.md (for API contract)                       │
│                                                                          │
│  3. Execute work within area scope                                       │
│     → Has full context for billing area                                 │
│     → Has cross-cutting concern context                                 │
│     → Does NOT read unrelated areas                                     │
│                                                                          │
│  Context Containment:                                                    │
│  - Orchestrator: 100 tokens (root only)                                 │
│  - Subagent: 300 tokens (area + cross-cutting)                          │
│  - Total: 400 tokens (vs 600+ in non-contained model)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Complete Flow Example

### Scenario: User runs `/add-functionality "Stripe webhook retry logic"`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ORCHESTRATOR READS NAVIGATION ONLY                              │
│                                                                          │
│  Reads: ./CLAUDE.md (root)                                              │
│                                                                          │
│  Extracts from Functional Areas table:                                   │
│  - "stripe" keyword → Billing area (src/services/billing/)              │
│  - "webhook" keyword → Billing area (src/services/billing/)             │
│  - Primary agent: backend-architect                                     │
│                                                                          │
│  Does NOT read:                                                          │
│  - src/services/billing/CLAUDE.md (detail layer)                        │
│  - src/services/billing/webhooks/CLAUDE.md (detail layer)               │
│  - Any other subtree memories                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: ROUTING DECISION                                                │
│                                                                          │
│  Affected areas: [src/services/billing/webhooks/]                       │
│  Cross-cutting: [docs/security/ - webhook signatures]                   │
│  Agent: backend-architect                                               │
│                                                                          │
│  Orchestrator context: ~100 tokens (root only)                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: GENERATE WORK ITEM                                              │
│                                                                          │
│  {                                                                       │
│    area_scope: "src/services/billing/webhooks/",                        │
│    agent: "backend-architect",                                          │
│    description: "Implement Stripe webhook retry logic",                  │
│    memory_instruction: "Read area CLAUDE.md first"                      │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: LAUNCH AREA-SCOPED SUBAGENT                                     │
│                                                                          │
│  Task tool invocation:                                                   │
│  - agent: backend-architect                                             │
│  - prompt: "Working on: src/services/billing/webhooks/                  │
│             Task: Implement Stripe webhook retry logic                   │
│             First read src/services/billing/webhooks/CLAUDE.md          │
│             Follow @ imports for cross-cutting concerns"                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: SUBAGENT READS DETAIL LAYER                                     │
│                                                                          │
│  backend-architect reads:                                                │
│  1. src/services/billing/webhooks/CLAUDE.md (~80 tokens)                │
│     - Purpose: Handle Stripe webhooks                                   │
│     - Patterns: Signature validation, idempotency                       │
│     - Dos/Don'ts: MUST validate, NEVER process duplicates              │
│     - Dependencies: @../../../docs/security/CLAUDE.md                   │
│                                                                          │
│  2. docs/security/CLAUDE.md (~100 tokens)                               │
│     - Webhook signature validation patterns                             │
│     - Timing-safe comparison requirements                               │
│                                                                          │
│  Subagent context: ~180 tokens (area + cross-cutting)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: SUBAGENT EXECUTES WITH FULL AREA CONTEXT                        │
│                                                                          │
│  Has everything needed:                                                  │
│  - Area patterns (from area CLAUDE.md)                                  │
│  - Security requirements (from cross-cutting import)                    │
│  - Work description (from orchestrator)                                 │
│                                                                          │
│  Implements retry logic following all area-specific rules               │
│                                                                          │
│  TOTAL CONTEXT USED:                                                     │
│  - Orchestrator: 100 tokens                                             │
│  - Subagent: 180 tokens                                                 │
│  - Total: 280 tokens                                                    │
│                                                                          │
│  WITHOUT CONTAINMENT (orchestrator reads everything):                    │
│  - Would be: 500+ tokens with much duplication                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Implementation Requirements

### Database Tables

```sql
-- Memory opportunities (parallel to agent_candidates)
CREATE TABLE memory_opportunities (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  directory_path TEXT NOT NULL,
  reason TEXT NOT NULL,           -- 'file_count' | 'loc_threshold' | 'logical_unit'
  file_count INTEGER,
  loc_total INTEGER,
  confidence REAL NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'created' | 'dismissed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);

-- Navigation cache (for orchestrator quick lookup)
CREATE TABLE navigation_cache (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  root_claude_md_hash TEXT,       -- Hash to detect changes
  functional_areas JSON,          -- Parsed table from root
  keyword_mapping JSON,           -- Keyword → area mapping
  agent_routing JSON,             -- Area → agent mapping
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);
```

### New Worker Endpoints

```
# Memory Opportunities
GET  /api/memory/opportunities           List memory opportunities
POST /api/memory/opportunities/:id/create  Create CLAUDE.md from opportunity
POST /api/memory/opportunities/:id/dismiss Dismiss opportunity

# Navigation Cache
GET  /api/navigation/:projectId          Get cached navigation data
POST /api/navigation/:projectId/refresh  Rebuild navigation cache from root

# Area Routing
POST /api/routing/match                  Match request to areas
  Body: { description: string }
  Returns: { areas: [{ path, agent, keywords_matched }] }
```

### Hook Extensions

```typescript
// Extend PostToolUse for memory opportunity detection
async function detectMemoryOpportunity(
  session_id: string,
  file_path: string
): Promise<void> {
  const dir = path.dirname(file_path);

  // Check if directory now meets adjacency heuristics
  const stats = await getDirectoryStats(dir);

  if (shouldHaveCLAUDEmd(stats) && !await hasCLAUDEmd(dir)) {
    await createMemoryOpportunity(dir, stats);
  }
}

// Extend SessionStart for navigation cache
async function ensureNavigationCache(project_id: string): Promise<void> {
  const cache = await getNavigationCache(project_id);
  const rootHash = await hashFile('./CLAUDE.md');

  if (!cache || cache.root_claude_md_hash !== rootHash) {
    await rebuildNavigationCache(project_id);
  }
}
```

---

## Part 8: What v9 Adds Over v8

| Capability | v8 | v9 |
|------------|----|----|
| Memory opportunity detection | Not addressed | Mirrors agent detection with lower threshold |
| Auto-memory creation | None | High-confidence auto-create, else prompt |
| Orchestrator memory reading | Unspecified | Root only (navigation layer) |
| Subagent memory reading | Unspecified | Area CLAUDE.md + cross-cutting imports |
| Command pattern | Separate approaches | Unified navigation-then-delegation |
| Root CLAUDE.md | Standard template | Enhanced with Orchestration Guide |
| Navigation caching | None | Worker-cached for quick orchestrator lookup |
| Keyword → area mapping | None | Explicit in root, cached for routing |

---

## Part 9: Success Metrics

1. **Orchestrator Context Reduction**: 60%+ reduction in orchestrator memory reading
2. **Memory Coverage**: 95%+ of directories meeting adjacency heuristics have CLAUDE.md
3. **Auto-Creation Accuracy**: 90%+ of auto-created memories are useful (not deleted)
4. **Command Consistency**: `/add-functionality` and `/start-issue` use identical patterns
5. **Subagent Efficiency**: Subagents read only area-relevant memories

---

## Appendix A: Memory vs Agent Opportunity Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│  OPPORTUNITY DETECTION COMPARISON                                        │
│                                                                          │
│  MEMORY OPPORTUNITIES               AGENT OPPORTUNITIES                  │
│  ────────────────────               ────────────────────                 │
│  Threshold: ≥3 files                Threshold: ≥8 files, ≥2 dirs        │
│  Cost: Low (file write)             Cost: High (context overhead)        │
│  Detection: Every session           Detection: Daily batch               │
│  Action: Auto-create if >80%        Action: Always require approval      │
│          confidence                                                      │
│  Purpose: Enable navigation         Purpose: Specialized execution       │
│                                                                          │
│  Both detected via hooks + background analysis                          │
│  Both surfaced in frontend dashboard                                    │
│  Both contribute to project maturity                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Navigation Layer Content Checklist

For root CLAUDE.md to support orchestration:

- [ ] **Orchestration Guide** section present
- [ ] **Functional Areas** table with: Area, Path, Keywords, Primary Agent
- [ ] **Cross-Cutting Concerns** table with: Concern, Location, Affects
- [ ] **Agent Routing Rules** for backend/frontend/multi-area
- [ ] **Context Discovery Protocol** with orchestrator vs subagent instructions
- [ ] **Service Map** with plain-text navigation (no @ imports)
- [ ] Size ≤100 lines (navigation only, no details)
- [ ] NO subtree patterns or implementation details
