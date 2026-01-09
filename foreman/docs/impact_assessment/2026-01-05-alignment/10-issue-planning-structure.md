# Issue Planning Structure Analysis

## Issue Definition (YAML)

**File**: `issue-XXX.yaml` - 4-tier structure

### TIER 1: Identification
- `sequence_number`, `title`, `short_description`
- `type`: feat | fix | chore | refactor
- `priority`: P0 (critical) | P1 (high) | P2 (normal)
- `status`: todo | in-progress | blocked | review | done
- `area`: api | ui | db | infra | security | devex | docs
- `phase`: dev | build | deploy (**CRITICAL**: dev must precede build)

### TIER 2: Planning & Requirements
- `delivers_concepts`: Array of concept IDs
- `scope.problem`, `scope.non_goals`
- `acceptance_criteria`: Given/When/Then format
- `dependencies.blocks` / `blocked_by`

### TIER 3: Execution & Orchestration
- `workflow.parallel_execution`: Boolean
- `workflow.capability_block`: Named capability
- `agents.required_agents`: Array with role assignments

### TIER 4: Quality & Integration
- `github.labels`: type, priority, status, area, phase, release, sprint, concept
- `quality.testing.strategy`, `deployment.rollback_plan`

## Agent Sequence

**Defined in YAML**: `execution.agents.required_agents` array

**Agent Object Structure**:
- `agent`: Name (backend-architect, frontend-developer, etc.)
- `role`: implementer | reviewer | consultant | tester
- `execution_phase`: setup | implementation | validation | review
- `folders.primary`, `folders.secondary`, `folders.excluded`
- `globals`: Agent-specific patterns (error_handling, logging_system)

**Sequencing**: Tasks ordered by execution_phase dependency

## Context Packaging

**Chain-Context Template** (the "agent Bible"):
- Per-agent YAML blocks with:
  - `decisions`: Decision matrix with options, rationale, rules applied
  - `scope_of_work`: files to modify/create, new endpoints, db changes
  - `decision_rules_ledger`: Which rules apply to which decisions
  - `impact_matrix`: Affected entities (API, Event, DB, UI)
  - `test_plan`: What/how to test
  - `architecture_analysis`: Detected stack, patterns, conventions

**Key**: "NO QUESTIONS - ALL DECISIONS FINAL" - marks implementation ready

## Label/Tag Behavior

**Labels affect behavior**:
- `type:feat` → Prompt classification triggers context selection
- `phase:dev` → Development work; must complete before build
- `area:api` → Restricts agent folder access
- `parallel-ok` / `sequential` → Execution model

**Rule Enforcement**:
- `MUST`: Non-negotiable (security, compliance)
- `SHOULD`: Best practice (logging, error handling)
