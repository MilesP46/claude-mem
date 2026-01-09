# Foreman Project Sub-Synthesis

## Executive Summary

Foreman is a sophisticated autonomous software development lifecycle management system that orchestrates the complete journey from concept ideation through production deployment. The system coordinates 32+ specialized agents, 18+ standalone commands, 15 command-agent duos, and 6 primary chain-* workflow commands through a unified architecture built on template-driven documentation, strict development standards, and parallel execution patterns.

The core innovation lies in foreman's separation of concerns: commands orchestrate workflows while agents perform specialized work; templates define document structure while instructions provide execution guidance; rules enforce standards while scripts automate operations. This layered approach enables autonomous operation with minimal user intervention, achieving true "autopilot" development where human interaction occurs only at defined decision points.

Key capabilities include:
- **Complete Release Lifecycle**: From concept Q&A through GitHub issue execution
- **Brownfield Updates**: Seamless plan revision without document drift markers
- **Impact-Driven Changes**: Assessment-first modification with verification loops
- **Error Resolution**: Multi-path error investigation and surgical fix application
- **Memory Management**: Hierarchical CLAUDE.md context system with depth-scaled limits
- **Parallel Execution**: 3-7 concurrent agents for complex analyses

## System Architecture Overview

### Component Hierarchy

```
                          FOREMAN SYSTEM ARCHITECTURE
                                    |
    +-------------------------------+-------------------------------+
    |               |               |               |               |
COMMANDS        AGENTS          RULES         TEMPLATES      INSTRUCTIONS
(18+ standalone) (32+ agents)   (8 .mdc files) (32 templates) (40+ instruction files)
(15 duos)
(6 chain-*)
    |               |               |               |               |
    +-------------------------------+-------------------------------+
                                    |
                              SCRIPTS (12 CLIs)
                                    |
                    [log-activity, handoff-claude, foreman-templates,
                     score-candidate, memory-update, send-agents, ...]
```

### Integration Flow

1. **Commands** initiate workflows by invoking agents and coordinating phases
2. **Agents** reference **rules** for standards compliance and **instructions** for execution guidance
3. **Agents** use **templates** to produce consistent documentation
4. **Scripts** provide CLI automation for logging, handoffs, and template management
5. **Rules** (alwaysApply: true) enforce standards across all operations

### Key Integration Points

| Component | Connects To | Integration Mechanism |
|-----------|-------------|----------------------|
| Commands → Agents | Task tool invocation | Prompt with context and instructions |
| Agents → Rules | `@foreman/rules/*.mdc` | Reference in agent frontmatter |
| Agents → Instructions | File reads | Agent instructions reference |
| Agents → Templates | File reads + Write | Template population with placeholders |
| Commands → Scripts | Bash execution | `log-activity`, `handoff-claude` CLIs |
| Scripts → File System | Atomic writes | Activity logs, YAML scores, configs |

## Core Workflow Flows

### Release Planning Flow (Greenfield)

The complete greenfield release planning workflow transforms user concepts into implementation-ready GitHub issues through six sequential phases.

```
USER INPUT
    |
    v
/chain-concept-gen ──────────────────────────────────────────────┐
    │ • Iterative Q&A to define release concepts                 │
    │ • Produces: concept-checklist.md, concept-qa-documentation.md
    │ • Templates: concept-checklist-template.md                 │
    │ • Logging: log-activity release <id> "Concept gen complete"│
    │                                                            │
    v [handoff-claude]                                           │
/chain-plan-init ────────────────────────────────────────────────┤
    │ • Creates release specification from concepts              │
    │ • Produces: release{{X}}-specification.md                  │
    │ • Templates: release-specification-template.md             │
    │ • Instructions: release-specification-template-instructions.md
    │                                                            │
    v [handoff-claude]                                           │
/chain-plan-design-green ────────────────────────────────────────┤
    │ • Orchestrates 6 specialized agents in sequence            │
    │ • Agent 1: chain-prototype-researcher                      │
    │   └─ Produces: recommendation-report.md, deployment-decision-matrix.md
    │ • Agent 2: chain-ux-researcher                             │
    │   └─ Produces: personas.md, user-flows.md, wireframes.md   │
    │ • Agent 3: chain-ui-designer                               │
    │   └─ Produces: design-system.md, component-specs.md        │
    │ • Agent 4: chain-system-architect                          │
    │   └─ Produces: api-design.md, database-schema.md           │
    │ • Agent 5: chain-whimsy-injector                           │
    │   └─ Enhances UI/UX with delightful interactions           │
    │ • Agent 6: chain-issue-builder                             │
    │   └─ Produces: issue-{{N}}.yaml files                      │
    │ • Cross-Agent Coordination: decision-reconciliation-template.md
    │ • User Decision Point: Deployment approach approval        │
    │                                                            │
    v [handoff-claude]                                           │
/chain-send-issues ──────────────────────────────────────────────┤
    │ • Agent: chain-issue-creator                               │
    │ • Creates GitHub issues from YAML plans                    │
    │ • Applies labels from labels.yaml                          │
    │ • Links issues to milestones                               │
    │                                                            │
    v [handoff-claude]                                           │
/chain-issue ────────────────────────────────────────────────────┘
    │ • Development workflow execution
    │ • Agents: chain-issue-updater → domain workers → reviewerpr
    │ • TDD enforcement: test-manager (RED phase)
    │ • Implementation: backend-worker, frontend-worker, ai-technician
    │ • Review: reviewerpr, documentation-updater, memory-manager
    v
DEPLOYED RELEASE
```

**Key Characteristics:**
- Sequential handoff via `handoff-claude` shell command
- Activity logging via `log-activity release <id> [agent <name>] "message"`
- Template-instruction pairs for all documentation
- User decision points at deployment and coordination phases
- ConceptID traceability throughout (CONCEPT-XXX)

### Plan Update Flow (Brownfield)

When existing plans require modification due to direction changes, the brownfield flow provides surgical updates that maintain document integrity.

```
DIRECTION CHANGE REQUEST
    |
    v
/chain-plan-design-update
    │
    ├── Phase 1: Research
    │   └── chain-update-researcher
    │       • Targeted research for plan updates
    │       • Identifies what needs to change
    │
    ├── Phase 2: UX Updates
    │   └── chain-ux-updater
    │       • Surgical UX documentation updates
    │       • Updates: personas.md, user-flows.md, wireframes.md
    │
    ├── Phase 3: UI Updates
    │   └── chain-ui-updater
    │       • Surgical UI documentation updates
    │       • Updates: design-system.md, component-specs.md
    │
    ├── Phase 4: Architecture Updates
    │   └── chain-architecture-updater
    │       • Surgical architecture documentation updates
    │       • Updates: api-design.md, database-schema.md
    │
    └── Phase 5: Issue Updates
        └── chain-issue-plan-updater
            • Create/modify issue YAML files
            • Update existing GitHub issues
    │
    v
UPDATED PLAN (seamlessly revised)
```

**Seamless Update Philosophy:**
- Documents appear as if originally written with new content
- No "updated", "changed", or revision markers
- Maintains full document integrity across revisions
- Updater agents make surgical modifications preserving context

### Impact Change Flow

For code changes that require comprehensive impact analysis before implementation.

```
CHANGE REQUEST (description + optional files)
    |
    v
/impact-change
    │
    ├── Phase 1: Assessment [Parallel]
    │   └── impact-assessment agents (3-7 based on complexity)
    │       • Each agent analyzes distinct impact area
    │       • Produces: impact_assessment/[date]-[name]/_index.md
    │       • Format: impact-assessment-qrg-format.md
    │
    ├── Phase 2: Gap Analysis
    │   └── gap-analysis-checklist.md verification
    │       • Completeness check (impacts, tests, dependencies, risk)
    │       • Gap filling with minimal, natural edits
    │
    ├── Phase 3: User Approval
    │   └── Present findings, await approval
    │
    ├── Phase 4: Implementation [Sequential by phase]
    │   └── surgical-edits agents
    │       • Backend changes first
    │       • Frontend changes second
    │       • Strict LOC limits (<=150 goal, <=200 buffer)
    │
    ├── Phase 5: UI Verification
    │   └── verify-ui agent
    │       • Playwright browser automation
    │       • Visual verification of changes
    │
    └── Phase 6: Summary
        • Completion report with all changes
    │
    v
VERIFIED CHANGE
```

**Orchestration Pattern:**
- Simple (1-2 files): 1 assessment agent
- Moderate (3-5 files): 3 assessment agents
- Complex (6+ files): 5-7 assessment agents
- Backend before frontend sequencing
- Iterative verification until pass

### Error Resolution Flow

Multi-path error investigation and resolution with parallel deep-dive analysis.

```
ERROR ENCOUNTERED
    |
    v
/error-explorer [Parallel - 5+ agents]
    │
    ├── Agent 1: Focus on error message analysis
    ├── Agent 2: Focus on stack trace investigation
    ├── Agent 3: Focus on dependency conflicts
    ├── Agent 4: Focus on configuration issues
    └── Agent 5: Focus on recent changes
    │
    │ • Each agent produces root cause hypothesis
    │ • NO Grep tool allowed (forces deeper analysis)
    │ • Produces definitive root cause identification
    │
    v [Conversation context handoff]
/error-fix [Sequential with iteration]
    │
    ├── Iteration 1:
    │   ├── surgical-fixes agent (targeted fix)
    │   └── Verification (tests/build)
    │
    ├── Iteration 2 (if needed):
    │   ├── Re-analyze failure
    │   └── Apply refined fix
    │
    └── Iteration 3 (max):
        └── Final attempt with accumulated context
    │
    │ • Max 3 iterations
    │ • UI verification via verify-ui if frontend
    │
    v
RESOLVED ERROR
```

**Error Resolution Paths:**
- `error-explorer` → `surgical-fixes`: Standard path
- `troubleshooting-investigator` → `surgical-edits`: Zero-regression resolution
- `git-error-fixer`: Commit-time errors (parallel per file/pair)

### Dead Code Review Flow

Comprehensive dead code analysis with 100% certainty requirement.

```
CODEBASE ANALYSIS REQUEST
    |
    v
/dead-code-review [Parallel - 3-7 agents]
    │
    ├── Agent 1: Backend layer analysis
    ├── Agent 2: Frontend layer analysis
    ├── Agent 3: API/Route analysis
    ├── Agent 4: Utility/Helper analysis
    └── Agent N: Configuration/Test analysis
    │
    │ • Produces: docs/dead_code/[date]-[name]/
    │ • 100% certainty requirement
    │ • Only fully removable code flagged
    │
    ├── User Approval Required
    │
    └── Implementation [Sequential]
        └── surgical-edits agents
            • Remove confirmed dead code
            • Run tests after each removal
    │
    v
CLEANED CODEBASE
```

### Memory Management Flow

Hierarchical CLAUDE.md management with bottom-up generation.

```
DIRECTORY TREE
    |
    v
/manage-memory
    │
    └── memory-manager agent [Sequential - bottom-up]
        │
        ├── Phase 1: Deepest directories first
        │   └── Generate CLAUDE.md per adjacency heuristics:
        │       • >=3 source files
        │       • Entrypoint + >=2 files
        │       • >=150 LOC total
        │       • Has config/test harness
        │       • Contains CLAUDE: local tag
        │
        ├── Phase 2: Work up directory tree
        │   └── Each CLAUDE.md summarizes children
        │   └── Size limits by depth:
        │       • L2: 120 lines
        │       • L3: 100 lines
        │       • L4: 75 lines
        │       • L5+: 50 lines
        │
        └── Phase 3: Root CLAUDE.md
            └── Minimal navigation guide
            └── Zero @ imports
            └── <=100 lines
    │
    │ • Sync to AGENTS.md via memory-update script
    │
    v
HIERARCHICAL CONTEXT SYSTEM
```

### Chore PR Pipeline

Review and apply refactoring from dependency PRs.

```
CHORE PRs (deps, deps-dev, ci)
    |
    v
/review-chore-prs [Sequential per PR]
    │
    └── pr-chore-reviewer agent
        │
        ├── Review PR changes
        ├── Assess refactoring needs
        └── Either:
            ├── Merge if no refactoring needed
            └── Create chore doc in docs/development/chores/
    │
    v [File system handoff]
/apply-chore-refactors [Sequential per chore]
    │
    └── chore-refactorer agent
        │
        ├── Read chore documentation
        ├── Apply refactoring
        └── Run tests between refactors
    │
    v
REFACTORED CODEBASE
```

## Component Relationships

### Commands to Agents Mapping

| Command | Primary Agent(s) | Execution Pattern |
|---------|-----------------|-------------------|
| `/chain-concept-gen` | (self-executing) | Interactive Q&A |
| `/chain-plan-init` | (self-executing) | Template population |
| `/chain-plan-design-green` | prototype-researcher, ux-researcher, ui-designer, system-architect, whimsy-injector, issue-builder | Sequential phases |
| `/chain-plan-design-update` | update-researcher, ux-updater, ui-updater, architecture-updater, issue-plan-updater | Sequential phases |
| `/chain-send-issues` | chain-issue-creator | Single agent |
| `/chain-issue` | chain-issue-updater, domain workers, reviewerpr, memory-manager | Mixed |
| `/impact-change` | impact-assessment (3-7x), surgical-edits, verify-ui | Parallel assessment, sequential implementation |
| `/error-explorer` | error-explorer (5+x) | Parallel |
| `/error-fix` | surgical-fixes, verify-ui | Sequential with iteration |
| `/dead-code-review` | dead-code-reviewer (3-7x), surgical-edits | Parallel analysis, sequential removal |
| `/manage-memory` | memory-manager | Sequential (bottom-up) |
| `/fix-git` | git-error-fixer | Parallel (per file) |
| `/vite-UI-fix` | vite-frontend-fix, verify-ui | Iterative |
| `/plan-change` | change-plan-builder | Mixed |
| `/review-chore-prs` | pr-chore-reviewer | Sequential per PR |
| `/apply-chore-refactors` | chore-refactorer | Sequential per chore |

### Agents to Rules Mapping

| Rule File | Agents That Reference | Application |
|-----------|----------------------|-------------|
| `development-standards.mdc` | 25+ agents (all implementation agents) | LOC limits, code quality, DRY |
| `system-standards.mdc` | 15+ agents (architecture, implementation) | 12-factor app, container standards |
| `tdd-development.mdc` | 8 agents (test-manager, workers, architects) | RED-GREEN-REFACTOR enforcement |
| `test-organization.mdc` | test-manager, chain-issue-updater | Test directory structure |
| `documentation-rules.mdc` | documentation-updater, restructure-docs | Token limits, QRG format |
| `diagram-standard.mdc` | documentation-updater | Mermaid diagram standards |
| `memory-system-standards.mdc` | memory-manager | CLAUDE.md size limits, adjacency |
| `logging-standard.mdc` | backend-architecture-analyzer | Logging patterns |

**Rule Application Hierarchy:**
```
alwaysApply: true (automatically loaded)
├── development-standards.mdc
├── system-standards.mdc
└── tdd-development.mdc

alwaysApply: false (contextually loaded)
├── documentation-rules.mdc (globs: docs/**/*.md)
├── test-organization.mdc
├── diagram-standard.mdc
├── logging-standard.mdc
└── memory-system-standards.mdc
```

### Agents to Instructions Mapping

| Instruction Category | Instructions | Using Agents |
|---------------------|--------------|--------------|
| **Architecture** | api-design-template-instructions, database-schema-template-instructions, infrastructure-plan-template-instructions, service-integration-template-instructions | chain-system-architect, chain-architecture-updater |
| **Coordination** | agent-scope-impact-matrix, orchestration-patterns, impact-change-orchestration, agent-command-creation-standards | chain-plan-design-green, command-agent-duo |
| **Planning** | release-specification-template-instructions, concept-checklist-template-instructions, issue-plan-template-instructions, granular-change-plan-instructions | chain-plan-init, chain-concept-gen, chain-issue-builder, plan-change |
| **Assessment** | gap-analysis-checklist, impact-assessment-qrg-format | impact-assessment, impact-change |
| **Memory** | root-claude-instructions, subtree-claude-instructions, context-loading-model, cross-cutting-instructions | memory-manager |
| **UI Design** | component-specs-template-instructions, design-system-template-instructions, ui-interaction-patterns-template-instructions | chain-ui-designer, chain-ui-updater |
| **UX Research** | personas-template-instructions, user-flows-template-instructions, wireframes-template-instructions | chain-ux-researcher, chain-ux-updater |
| **GitHub** | gh-issue-instructions, gh-issue-workflow, labels-instructions | chain-issue-creator, chain-send-issues |

### Templates and Instructions Pairing

Every template has a corresponding instruction file following the naming pattern `{template-name}-instructions.md`:

| Template | Instruction File | Used By |
|----------|------------------|---------|
| `release-specification-template.md` | `release-specification-template-instructions.md` | chain-plan-init |
| `concept-checklist-template.md` | `concept-checklist-template-instructions.md` | chain-concept-gen |
| `api-design-template.md` | `api-design-template-instructions.md` | chain-system-architect |
| `database-schema-template.md` | `database-schema-template-instructions.md` | chain-system-architect |
| `component-specs-template.md` | `component-specs-template-instructions.md` | chain-ui-designer |
| `design-system-template.md` | `design-system-template-instructions.md` | chain-ui-designer |
| `personas-template.md` | `personas-template-instructions.md` | chain-ux-researcher |
| `user-flows-template.md` | `user-flows-template-instructions.md` | chain-ux-researcher |
| `wireframes-template.md` | `wireframes-template-instructions.md` | chain-ux-researcher |
| `issue-map-template.yaml` | `issue-plan-template-instructions.md` | chain-issue-builder |

**Instruction Content Pattern:**
1. **How to use**: Step-by-step process
2. **Placeholders**: List of all `{{...}}` placeholders
3. **Section guidance**: Purpose and format for each section
4. **Quality checklist**: Validation requirements

### Script Integration Points

| Script | Invoked By | Purpose |
|--------|------------|---------|
| `log-activity` | 28+ agents | Activity logging with release/sprint/agent context |
| `handoff-claude` | chain-* commands | Launch new Claude session for workflow handoff |
| `exit-shell` | chain-* commands | Gracefully exit terminal after handoff |
| `foreman-templates` | foreman-update, setup-all | Install/update templates, rules, instructions |
| `foreman-update` | Manual | Meta-update of .my_coding tooling |
| `memory-update` | manage-memory | Sync CLAUDE.md to AGENTS.md |
| `send-agents` | setup-all | Copy agents to Claude CLI directory |
| `send-commands` | setup-all | Copy commands to Claude CLI directory |
| `score-candidate` | chain-prototype-researcher | Score OSS candidates |
| `score-composition` | chain-prototype-researcher | Compute optimal compositions |

**Script Usage in Agent Workflow:**
```bash
# Activity logging (all agents)
log-activity release 1 agent backend-worker "Completed API endpoint implementation"

# Chain handoff (chain-* commands)
handoff-claude "/chain-plan-init" "release 1" --app terminal

# Exit after handoff
exit-shell --close-window

# OSS scoring (prototype-researcher)
score-candidate release 1 type template name "React-Admin" mhit 8 mtotal 10 ...
score-composition release 1 from-yaml must auth,crud,dashboard timebox 40
```

## Orchestration Patterns

### Pattern Types

| Pattern | Size Limit | Example Commands |
|---------|------------|------------------|
| **Simple** (1 agent) | <250 lines | fix-issue, cleanup-docs |
| **Sequential** (2-3 agents) | 350-450 lines | error-fix (fixes → verify) |
| **Parallel** (N instances) | 350-450 lines | error-explorer, impact-change assessment |
| **Complex** (3+ mixed) | up to 500 lines | chain-plan-design-green |

### Agent Launch Patterns

**Sequential Launch:**
```
Command → Agent 1 → Agent 2 → Agent 3 → Synthesis
```

**Parallel Launch:**
```
Command → [Agent 1, Agent 2, Agent 3, Agent 4, Agent 5] → Synthesis
```

**Conditional Launch:**
```
Command → Assessment → If complex: [Parallel agents] else: Single agent → Implementation
```

### Synthesis Patterns

**Parallel Synthesis:**
1. Launch N agents with distinct focus areas
2. Collect all agent outputs
3. Synthesize findings into unified output
4. Apply to next phase

**Sequential Synthesis:**
1. Agent 1 produces output
2. Agent 2 receives Agent 1 output as context
3. Agent 3 receives cumulative context
4. Final synthesis incorporates all phases

### Common Orchestration Flows

| Flow | Pattern | Agents |
|------|---------|--------|
| Assess → Implement → Verify | Sequential | impact-assessment → surgical-edits → verify-ui |
| Backend → Frontend | Sequential | backend-worker → frontend-worker |
| Analysis → Approval → Fix | Sequential with gate | dead-code-reviewer → user → surgical-edits |
| Multi-Focus Investigation | Parallel | error-explorer (5x) |
| Tiered Complexity | Conditional | 1/3/5-7 agents based on file count |

## Key Strengths and Unique Features

### 1. Autonomous-First Design
Commands operate without user intervention except at defined decision points. This enables long-running workflows (hours) while maintaining user control at critical junctures:
- Deployment decisions (chain-plan-design-green)
- Implementation approval (impact-change, dead-code-review)
- Research validation (chain-plan-design-update)

### 2. Template-Driven Consistency
Every output document uses template-instruction pairs, ensuring:
- Consistent structure across all releases
- Complete placeholder coverage
- Quality checklists for validation
- ConceptID traceability throughout

### 3. Parallel-First Execution
Commands default to parallel agent execution when tasks are independent:
- error-explorer: 5+ agents simultaneously
- impact-assessment: 3-7 agents based on complexity
- dead-code-reviewer: 3-7 agents by codebase layer
- Reduces execution time significantly

### 4. Surgical Modification Philosophy
Updater agents (chain-*-updater) make "seamless" changes:
- Documents appear as if originally written
- No "updated", "changed", or revision markers
- Preserves document integrity across revisions

### 5. TDD as First-Class Citizen
Test-driven development enforced through:
- test-manager creates failing tests before implementation
- GitHub labels track TDD phase (`tdd:red`)
- Deliberate stub failures (NotImplementedError, throw new Error)
- CI integration enforces test passage

### 6. Memory System Architecture
Hierarchical CLAUDE.md files with:
- Bottom-up traversal model (file → parent → root)
- Depth-scaled size limits (100 → 50 lines)
- Adjacency heuristics for creation decisions
- Zero imports at root level

### 7. ConceptID Traceability
Full traceability from concepts through implementation:
- Release specs define CONCEPT-XXX IDs
- User flows map "Implements Concepts"
- Components map "Supports Concepts"
- Issues map "Delivers Concepts"

### 8. Model Distribution Strategy
Strategic model allocation:
- **Opus (87.5%)**: Complex reasoning, implementation, architecture
- **Sonnet (12.5%)**: Lightweight analysis, pattern detection, verification

### 9. Activity Logging Standard
All agents use standardized logging:
```bash
log-activity release <id> [sprint <id>] [agent <name>] [task <id>] "message"
```
Enables:
- Progress tracking across autonomous operations
- Context-efficient loading for subsequent operations
- Audit trail for agent activities

### 10. Iterative Verification
Fix-oriented commands implement iterative loops:
- Max iteration limits (typically 3)
- Fix → Verify → Re-analyze cycle
- Service validation before agent work
- UI verification via Playwright

## Integration Considerations

### For External Systems Integration

**GitHub Integration:**
- Issue creation via MCP tools or GH CLI
- PR review and merging through pr-chore-reviewer
- Label management via labels.yaml
- Milestone linking for releases

**CI/CD Integration:**
- GitHub Actions template (gh-actions-template.yml)
- Multi-stack support (Rails, Node, Python)
- Test validation gates
- Deployment automation readiness

**Terminal Integration:**
- AppleScript-based handoffs (Terminal, iTerm, Warp)
- macOS-specific (handoff-claude, exit-shell)
- Detached session execution

### For Custom Agent Development

**Agent Creation Standards:**
- <300 lines per agent
- Clear frontmatter (name, model, tools)
- Reference appropriate rules via `@foreman/rules/`
- Use log-activity for progress tracking
- Follow tool selection guidance (no Grep for error-explorer)

**Command Creation Standards:**
- Size varies by pattern type (250-500 lines)
- Use Task tool for agent invocation
- Implement synthesis patterns for multi-agent
- Include error handling per phase

### For Template Extension

**Template Requirements:**
- Use `{{PLACEHOLDER}}` syntax
- Include YAML blocks for structured data
- Provide ConceptID mapping fields
- Support Mermaid diagrams where applicable
- Create corresponding instruction file

### For Rule Addition

**Rule File Standards:**
- Use .mdc format with frontmatter
- Set alwaysApply appropriately (true for foundational, false for contextual)
- Use globs for pattern-matched loading
- Reference from agents via `@foreman/rules/`

### Critical Dependencies

1. **Node.js Environment**: All scripts require Node.js (ES modules)
2. **macOS for Handoffs**: Terminal automation is macOS-specific
3. **Claude CLI**: Commands and agents designed for Claude Code CLI
4. **GitHub Access**: Issue management requires GitHub MCP or CLI
5. **Playwright**: UI verification requires browser automation setup

### Token/LOC Awareness

The system maintains strict limits for AI context efficiency:
- Code files: <=150 LOC (buffer <=200)
- Root CLAUDE.md: <=100 lines
- Subtree CLAUDE.md: <=150 lines (scaled by depth)
- Documentation: Token-based limits (1,000-6,000)
- Agent files: <300 lines
- Command files: 250-500 lines (by pattern)
