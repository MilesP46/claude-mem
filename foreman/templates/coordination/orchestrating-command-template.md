# Orchestrating Command Template

Template for creating orchestrating commands that coordinate multiple agents. See @instructions/coordination/or

Based on [Anthropic Slash-Command Documentation](https://docs.claude.com/en/docs/agent-sdk/slash-commands#common-slash-commands)

## Structure by Type

### Type B: Sequential Multi-Agent

```markdown
---
description: [CONTEXT-based description]
argument-hint: [If accepts arguments]
allowed-tools: Task, Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# [Command Name]

[1-2 sentence intro describing sequential workflow]

## Workflow

Sequential phases with dependencies.

---

## PHASE 1: [FIRST PHASE NAME]

### Step 1.1: [Setup/Parse]

[Parse arguments, setup, initial analysis]

### Step 1.2: Launch [Agent-1]

Use Task tool:

```
[Agent-1 prompt including PATH, CONTEXT, specific focus]
```

### Step 1.3: Process Results

[Extract output from agent-1, validate, prepare for phase 2]

---

## PHASE 2: [SECOND PHASE NAME]

### Step 2.1: Verify Phase 1 Complete

[Check phase 1 completed successfully]

### Step 2.2: Launch [Agent-2]

Use Task tool with output from Phase 1:

```
[Agent-2 prompt including:
- PATH and CONTEXT
- Results/output from agent-1
- Dependencies on Phase 1]
```

### Step 2.3: Process Results

[Extract output from agent-2, validate]

---

## PHASE 3: REPORT

### Collect Results

[Gather results from all phases]

### Provide Summary

```markdown
## [Command Name] Complete ✓

### Phase 1: [Name]
[Results summary]

### Phase 2: [Name]
[Results summary]

### Overall Results
[Combined summary]
```

---

## Guidelines

**DO:**
- Wait for phase completion before next phase
- Pass phase outputs to dependent phases
- Report comprehensive results

**DON'T:**
- Launch phases in parallel if dependencies exist
- Skip verification between phases
```

**Size:** 350-450 lines

---

### Type C: Parallel Multi-Instance

```markdown
---
description: [CONTEXT-based description]
argument-hint: [If accepts arguments]
allowed-tools: Task, Read, Write, Edit, Bash, Glob, Grep
model: claude-sonnet-4-5-20250929
---

# [Command Name]

[1-2 sentence intro describing parallel analysis]

## Workflow

Launches multiple instances of [agent] in parallel, synthesizes results.

---

## PHASE 1: DETERMINE INSTANCES

### Analyze Task

[Analyze complexity, determine instance count]

**Instance count:** [3-7 based on complexity]

### Define Focus Areas

Assign each instance a specific focus:
1. Instance 1: [Focus area]
2. Instance 2: [Focus area]
N. Instance N: [Focus area]

---

## PHASE 2: LAUNCH PARALLEL INSTANCES

### Launch All Instances

Use Task tool with **MULTIPLE CALLS IN SINGLE MESSAGE**:

```
Instance 1 prompt:
[Agent prompt with focus area 1, PATH, CONTEXT]

Instance 2 prompt:
[Agent prompt with focus area 2, PATH, CONTEXT]

Instance N prompt:
[Agent prompt with focus area N, PATH, CONTEXT]
```

### Monitor Completion

Wait for ALL instances to complete.

---

## PHASE 3: SYNTHESIZE RESULTS

### Step 3.1: Collect Findings

[Gather results from all instances]

### Step 3.2: Cross-Validate

[Identify common findings across instances]

### Step 3.3: Resolve Conflicts

[Handle differences or conflicts between instances]

### Step 3.4: Create Unified Output

[Merge findings into coherent result]

---

## PHASE 4: REPORT

```markdown
## [Command Name] Complete ✓

### Analysis Summary

[High-level summary]

### Findings

**Consensus (N/N agents):**
[Common findings all agents agreed on]

**Majority (N/N agents):**
[Findings most agents identified]

**Unique Insights:**
[Findings from single agents worth noting]

### Confidence Level

[Based on consensus and evidence]

### Recommendations

[Actionable recommendations from synthesis]
```

---

## Guidelines

**DO:**
- Launch all instances in parallel (single message)
- Cross-validate findings
- Note confidence levels
- Synthesize into unified output

**DON'T:**
- Launch instances sequentially
- Skip synthesis step
- Ignore minority opinions
```

**Size:** 350-450 lines

---

### Type D: Complex Orchestration

```markdown
---
description: [CONTEXT-based description]
argument-hint: [If accepts arguments]
allowed-tools: Task, Read, Write, Edit, Bash, Glob, Grep
model: claude-sonnet-4-5-20250929
---

# [Command Name]

[1-2 sentence intro describing complex workflow]

## Workflow

Multi-phase with mixed parallel/sequential execution and conditional logic.

---

## PHASE 1: [FIRST PHASE]

[Phase 1 structure - may be parallel or sequential agents]

**Dependencies:** None

---

## PHASE 2: [SECOND PHASE]

[Phase 2 structure - depends on Phase 1]

**Dependencies:** Requires Phase 1 completion

**Execution:** [Parallel/Sequential based on dependencies within phase]

---

## PHASE 3: [CONDITIONAL PHASE]

### Step 3.1: Determine If Needed

[Check condition based on previous phases]

**IF** [condition met]:
  Launch [agent] for [purpose]
**ELSE**:
  Skip to Phase 4

### Step 3.2: Execute (If Needed)

[Agent launch and execution]

---

## PHASE 4: FINAL SYNTHESIS

[Combine all phase results]

---

## PHASE 5: REPORT

```markdown
## [Command Name] Complete ✓

[Comprehensive report including all phases]
```

---

## Guidelines

**DO:**
- Document dependencies clearly
- Respect sequencing requirements
- Handle conditional logic properly
- Provide comprehensive reporting

**DON'T:**
- Violate dependencies
- Skip phases incorrectly
- Omit conditional paths from reporting
```

**Size:** Up to 500 lines

---

## Common Elements

### Agent Launch Pattern

**Sequential:**
```markdown
Use Task tool:

[Launch agent-1 prompt]

[Wait for completion]

Use Task tool:

[Launch agent-2 prompt with agent-1 output]
```

**Parallel:**
```markdown
Use Task tool with multiple calls in SINGLE MESSAGE:

[Launch agent-1 prompt]
[Launch agent-2 prompt]
[Launch agent-N prompt]
```

### Synthesis Pattern

1. Collect all agent outputs
2. Cross-validate common findings
3. Resolve conflicts
4. Merge into unified result
5. Report with confidence levels

### Reporting Pattern

```markdown
## [Command Name] Complete ✓

### [Phase/Agent] Results
[Summary]

### Overall Summary
[Combined results]

### Integration
[How pieces fit together]

Ready to use/Next steps
```

## Size Guidelines

- **Sequential (Type B):** 350-450 lines
- **Parallel (Type C):** 350-450 lines
- **Complex (Type D):** Up to 500 lines

Apply progressive disclosure and concise language throughout.
