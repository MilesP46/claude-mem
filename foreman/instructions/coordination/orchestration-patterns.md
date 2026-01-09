# Orchestration Patterns

Patterns for coordinating multiple agents in commands, including sequential, parallel, and complex orchestration.

## Pattern Types

### Type A: Simple (1 Agent)

**Characteristics:**
- Single action, single agent
- Command launches one agent
- Standard workflow

**Structure:**
```
Command → Launch agent → Monitor → Report
```

**Use when:**
- Single, focused task
- No dependencies
- Simple transformation or validation

**Example:** "format TypeScript files", "validate API schemas"

**Size:** Command <250 lines

---

### Type B: Sequential Multi-Agent (2-3 Agents)

**Characteristics:**
- Multiple distinct phases with dependencies
- Each phase uses different agent
- Later phases depend on earlier completion
- Common: Backend → Frontend pattern

**Structure:**
```
Command → Phase 1: Launch agent-1 → Wait
        → Phase 2: Launch agent-2 with agent-1 output → Wait
        → Phase 3: Report results
```

**Agent Launch Pattern:**
```
Use Task tool sequentially:
1. Launch agent-1, wait for completion
2. Extract output/results from agent-1
3. Launch agent-2 with results from agent-1
4. Synthesize final results from both agents
```

**Use when:**
- Multiple distinct actions needed
- Actions have clear dependencies
- Output of one feeds into next
- "assess and implement" workflows

**Example:** "assess impact and implement changes", "analyze and fix errors"

**Dependencies:** Phase 2 requires Phase 1 completion

**Size:** Command 350-450 lines

---

### Type C: Parallel Multi-Instance (1 Agent, N Instances)

**Characteristics:**
- Same agent, multiple focus areas
- All instances run simultaneously
- Results synthesized by command
- Comprehensive analysis pattern

**Structure:**
```
Command → Determine instance count and focus areas
        → Launch N instances in parallel (single message, multiple Task calls)
        → Collect results from all instances
        → Synthesize unified findings
        → Report results
```

**Agent Launch Pattern:**
```
Launch all instances in parallel (single message):
- Task call 1: agent instance with focus [area-1]
- Task call 2: agent instance with focus [area-2]
- Task call N: agent instance with focus [area-N]
```

**Synthesis Logic:**
1. Collect findings from all instances
2. Cross-validate common discoveries
3. Resolve conflicts or differences
4. Merge into unified output
5. Note consensus and dissenting opinions

**Use when:**
- Comprehensive analysis needed
- Multiple perspectives valuable
- "from multiple angles" or "thorough investigation"
- Parallel processing increases confidence

**Example:** "comprehensive error analysis", "multi-angle impact assessment"

**Size:** Command 350-450 lines

---

### Type D: Complex Orchestration (3+ Agents, Mixed)

**Characteristics:**
- Multiple phases, mixed execution
- Some agents parallel, some sequential
- Conditional agent launches
- Dependencies across phases

**Structure:**
```
Command → Phase 1: Launch agent(s) [parallel or sequential]
        → Phase 2: Launch agent(s) dependent on Phase 1
        → Phase 3: Conditional agent if [condition met]
        → Phase 4: Final synthesis and reporting
```

**Patterns:**
- **Parallel within phases:** Multiple agents in single phase launch together
- **Sequential across phases:** Phase 2 waits for Phase 1 completion
- **Conditional launches:** Agent launched only if condition met

**Use when:**
- Multi-step workflow with various dependencies
- Some steps independent, others dependent
- Conditional logic required
- "assess, implement backend, implement frontend, verify UI"

**Example:** Full impact-change workflow with assessment, backend, frontend, and conditional UI verification

**Dependencies:** Must be explicitly documented

**Size:** Command up to 500 lines

---

## Orchestration Decision Factors

### Complexity Indicators

**Multi-agent indicators:**
- "analyze and fix" / "assess and implement"
- "comprehensive" / "end-to-end" / "full workflow"
- "validate and update" / "review and apply"
- Multiple distinct verbs/actions

**Parallel instance indicators:**
- "from multiple angles" / "various perspectives"
- "comprehensive analysis" / "thorough investigation"
- "all aspects" / "complete coverage"
- "ensure confidence" / "cross-validate"

**Verification indicators:**
- "ensure" / "verify" / "test" / "validate"
- Frontend path → suggests verify-ui needed
- "working correctly" / "no regressions"

### Agent Selection Strategy

**For each agent needed:**

1. **Leverage existing** if perfect match found
   - Check `.claude/agents/*.md` (project)
   - Check `~/.claude/agents/*.md` (personal)

2. **Base on personal** if relevant agent exists
   - Extract patterns
   - Adapt for project context
   - Create new project agent

3. **Create new** if no relevant agent found
   - Design from scratch
   - Follow templates
   - Apply best practices

## Synthesis Patterns

### Sequential Synthesis

**Pattern:** Each phase builds on previous
```
Phase 1 output → Phase 2 input
Phase 2 output → Phase 3 input
Final synthesis combines all phases
```

**Report includes:**
- Results from each phase
- How phases connected
- Final combined outcome

### Parallel Synthesis

**Pattern:** Cross-validate and merge
```
Instance 1 findings
Instance 2 findings    → Cross-validate → Resolve conflicts → Merge → Unified output
Instance N findings
```

**Report includes:**
- Common findings (consensus)
- Unique findings (single instance)
- Conflicts resolved
- Confidence levels

### Complex Synthesis

**Pattern:** Conditional and hierarchical
```
Phase 1 results → Inform Phase 2 strategy
Phase 2 results → Determine if Phase 3 needed
Phase 3 results → Final comprehensive synthesis
```

**Report includes:**
- Results from each phase
- Decision points and outcomes
- Conditional paths taken
- Complete workflow summary

## Task Tool Usage

### Sequential Launch

```markdown
Use Task tool, wait for completion:

<invoke Task with agent-1>

[After agent-1 completes]

<invoke Task with agent-2, include agent-1 output>
```

### Parallel Launch

```markdown
Use Task tool multiple times in SINGLE MESSAGE:

<invoke Task with agent instance 1>
<invoke Task with agent instance 2>
<invoke Task with agent instance N>

[After ALL agents complete]
```

**Critical:** Parallel launches must be in single message with multiple tool uses.

### Conditional Launch

```markdown
<invoke Task with agent-1>

[After agent-1 completes]

IF condition met:
  <invoke Task with agent-2>
ELSE:
  Skip to reporting
```

## Common Orchestration Patterns

### Backend → Frontend

Sequential pattern:
1. Backend changes first (API, services, data)
2. Wait for backend completion and tests passing
3. Frontend changes (components, state, UI)
4. Final verification

**Why:** Frontend depends on backend contracts

### Assess → Implement → Verify

Sequential pattern:
1. Assessment agent analyzes and creates plan
2. Implementation agent executes plan
3. Verification agent tests results

**Why:** Can't implement without plan, can't verify without implementation

### Multi-Angle Analysis → Synthesis

Parallel pattern:
1. Launch N analysis agents with different focus areas
2. Collect all findings
3. Synthesize unified analysis

**Why:** Multiple perspectives increase confidence and coverage

### Assess → Implement (Backend) → Implement (Frontend) → Verify UI

Complex pattern:
1. Assessment (single agent)
2. Backend implementation (may be parallel agents)
3. Frontend implementation (depends on backend, may be parallel)
4. UI verification (conditional on frontend changes)

**Why:** Dependencies require sequencing, parallelization optimizes where possible
