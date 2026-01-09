# Commands Analysis Synthesis

## Executive Summary

The foreman command system is a sophisticated orchestration framework designed for autonomous software development lifecycle management. It encompasses four distinct command categories: chain-* workflow commands for end-to-end release planning, command-agent duos for parallel task execution, standalone commands for focused operations, and tandem workflows for multi-command coordination. The system emphasizes autonomous operation, template-driven documentation, parallel agent execution, and user decision points at critical junctures.

The command ecosystem comprises approximately 18 standalone commands, 15 command-agent duos, 6 primary chain-* commands with 15 supporting agents, and 12 documented tandem workflows. Commands orchestrate specialized agents rather than performing work directly, enabling scalable parallel execution and clear separation of concerns.

## Command Categories

### Chain-* Workflow Commands

The chain-* workflow provides an end-to-end pipeline for software release lifecycle management, from concept generation through issue execution.

**Primary Commands:**
- `chain-concept-gen`: Iterative Q&A to define release concepts, producing concept checklists
- `chain-plan-init`: Creates release specifications from concept checklists
- `chain-plan-design-green`: Orchestrates complete design phase with 6 specialized agents
- `chain-send-issues`: Submits generated issues to GitHub with proper labeling
- `chain-issue`: Executes development work through coordinated agent cycles
- `chain-plan-design-update`: Revises existing plans when direction changes

**Key Characteristics:**
- Sequential handoff via `handoff-claude` shell command
- Activity logging via `log-activity` script
- Template-instruction pairs for all documentation
- User decision points at deployment, coordination, and testing phases
- Seamless update philosophy (no change markers in revised documents)

**Supporting Agents (15 total):**
- Research: chain-prototype-researcher, chain-update-researcher
- Design: chain-ux-researcher, chain-ui-designer, chain-whimsy-injector
- Architecture: chain-system-architect
- Planning: chain-issue-builder, chain-issue-creator, chain-issue-updater, chain-issue-plan-updater
- Updates: chain-ux-updater, chain-ui-updater, chain-architecture-updater

### Command-Agent Duo Commands

The duo pattern pairs orchestrating commands with specialized agents for complex task execution. Commands handle phases and synthesis while agents perform deep-dive work.

**Identified Duos (15 total):**

| Duo | Primary Agents | Execution Pattern |
|-----|---------------|-------------------|
| Impact Change | impact-assessment, surgical-edits, verify-ui | Parallel assessment, sequential implementation |
| Impact Change Review | error-explorer, impact-assessment, surgical-edits | Parallel exploration, parallel assessment |
| Error Explorer | error-explorer | Parallel (5+ agents) |
| Error Fix | surgical-fixes, verify-ui | Sequential with iteration (max 3) |
| Dead Code Review | dead-code-reviewer, surgical-edits | Parallel analysis, sequential removal |
| Manage Memory | memory-manager | Sequential (bottom-up) |
| Fix Git | git-error-fixer | Parallel (per file/pair) |
| Fix Issue | fix-issue | Single agent |
| Plan Change | change-plan-builder | Mixed execution |
| Apply Chore Refactors | chore-refactorer | Sequential |
| Review Chore PRs | pr-chore-reviewer | Parallel or sequential |
| Vite UI Fix | vite-frontend-fix, verify-ui | Iterative |
| Create Duo | command-agent-duo | Single agent |
| Cleanup Docs | md-scratchpad-cleanup | Single agent |
| Restructure Docs | documentation-updater | Single agent |

### Standalone Commands

Standalone commands operate independently without chain-* orchestration or explicit duo relationships. They typically serve as entry points or provide utility functions.

**Statistics:**
- Total standalone commands: 18
- Commands using parallel agents: 9
- Commands using sequential agents: 6
- Commands using mixed strategies: 3
- Self-executing commands (no agents): 1

**Key Commands:**
- `format-claude-file`: Optimizes agent/command files without agents
- `new-issue`: Adds issues to existing releases via chain-issue-creator
- `update-plans`: Updates planning docs after implementation
- `restructure-docs`: Reorganizes documentation hierarchy
- `manage-memory`: Hierarchical CLAUDE.md management

### Tandem Command Workflows

Tandem workflows coordinate multiple commands through explicit handoffs, shared state, or conversation context.

**Primary Workflows (12 documented):**

1. **Release Planning Chain**: concept-gen -> plan-init -> design-green -> send-issues -> issue
2. **Error Investigation Chain**: error-explorer -> error-fix
3. **Chore PR Pipeline**: review-chore-prs -> apply-chore-refactors
4. **Impact Change Workflow**: impact-change -> plan-change
5. **Impact Change Review**: Embedded error-explorer + impact-assessment
6. **Dead Code Review**: Analysis -> approval -> surgical implementation
7. **Release Update Chain**: Internal agent orchestration via chain-plan-design-update
8. **Documentation Cleanup**: Multi-stage pipeline via cleanup-docs
9. **Issue Management**: new-issue, update-plans, fix-issue coordination
10. **Memory Management**: Hierarchical bottom-up processing
11. **Vite UI Fix**: Service validation + iterative verification
12. **Agent-Command Creation**: Pattern analysis + command-agent-duo delegation

## Cross-Category Patterns

### Agent Orchestration Strategies

**Parallel Execution** (for independent investigations):
- error-explorer: 5+ agents with distinct focus areas
- impact-assessment: 3-7 agents based on complexity
- dead-code-reviewer: 3-7 agents by codebase layer

**Sequential Execution** (when order matters):
- memory-manager: Bottom-up directory processing
- chore-refactorer: Test validation between refactors
- Error fix iterations: Fix -> Verify -> Re-analyze

**Mixed Execution** (complex workflows):
- plan-change: Parallel for independent items, sequential for dependent
- chain-plan-design-green: Sequential agent phases with internal parallelism

### Handoff Mechanisms

| Mechanism | Usage | Example |
|-----------|-------|---------|
| `handoff-claude` | Chain-* command transitions | chain-concept-gen -> chain-plan-init |
| Conversation context | Error workflows | error-explorer -> error-fix |
| File system state | Chore pipelines | docs/development/chores/*.md files |
| Assessment output | Impact workflows | _index.md path passing |

### User Decision Points

Commands pause for user input at critical junctures:
- Deployment decisions (chain-plan-design-green)
- Cross-agent coordination uncertainty
- User requirements review
- Testing validation (chain-issue)
- Research approval for updates
- Implementation approval (impact-change, dead-code-review)

### Documentation Integration

Commands consistently integrate with foreman documentation:
- Impact assessments: `foreman/docs/impact_assessment/[date]-[name]/`
- Dead code analysis: `foreman/docs/dead_code/[date]-[name]/`
- Change plans: `foreman/docs/change_plan/[type]/[date]-[name]/`
- Chore documentation: `docs/development/chores/`

## Command Ecosystem Map

```
                                    USER INPUT
                                        |
                     +------------------+------------------+
                     |                  |                  |
              [Release Planning]  [Change Management]  [Maintenance]
                     |                  |                  |
     +---------------+          +------+------+     +-----+-----+
     |                          |             |     |           |
chain-concept-gen         impact-change  error-explorer  review-chore-prs
     |                          |             |           |
chain-plan-init           [approval]     error-fix   apply-chore-refactors
     |                          |
chain-plan-design-green   plan-change
  |-- prototype-researcher      |
  |-- ux-researcher       change-plan-builder
  |-- ui-designer
  |-- system-architect
  |-- whimsy-injector
  |-- issue-builder
     |
chain-send-issues
     |
chain-issue ----------> [chain-plan-design-update]
  |-- issue-updater            |-- update-researcher
  |-- test-manager             |-- ux-updater
  |-- [domain workers]         |-- ui-updater
  |-- reviewerpr               |-- architecture-updater
  |-- documentation-updater    |-- issue-plan-updater
  |-- memory-manager

                    SUPPORTING COMMANDS
                           |
    +----------+----------+----------+----------+
    |          |          |          |          |
dead-code   manage-    fix-git   vite-UI-   format-
 review     memory                 fix     claude-file
```

## Key Insights

### 1. Autonomous-First Design
Commands operate without user intervention except at defined decision points. This enables long-running workflows while maintaining user control at critical junctures.

### 2. Agent Specialization
The system uses 30+ specialized agents, each with focused responsibilities. Commands orchestrate rather than execute, enabling clear separation of concerns and testability.

### 3. Template-Driven Consistency
Every output document uses template-instruction pairs, ensuring consistent documentation across the ecosystem. Templates live in `foreman/templates/` with corresponding instructions in `foreman/instructions/`.

### 4. Parallel-First Strategy
Commands default to parallel agent execution when tasks are independent, significantly reducing execution time for complex analyses like impact assessment and error exploration.

### 5. Seamless Update Philosophy
Plan update commands (chain-plan-design-update and updater agents) produce documents that appear as originally written, with no "updated" or "changed" markers. This maintains document integrity across revisions.

### 6. Activity Logging Standard
All chain-* commands use standardized logging via `log-activity release <id> [agent <name>] "message"`, enabling activity tracking and context-efficient loading for subsequent operations.

### 7. GitHub Integration
Multiple commands integrate with GitHub via MCP tools or GH CLI:
- Issue creation and management (chain-send-issues, chain-issue)
- PR review and merging (review-chore-prs, apply-chore-refactors)
- Comment updates (fix-issue, chain-issue-plan-updater)

### 8. Iterative Verification
Fix-oriented commands (error-fix, vite-UI-fix) implement iterative fix-verify loops with configurable iteration limits, ensuring issues are resolved before completing.

### 9. Service Validation
Frontend commands validate required services (Vite dev server, database, backend API) before proceeding, preventing wasted agent cycles on infrastructure issues.

### 10. Memory System Integration
The manage-memory command and memory-manager agent maintain hierarchical CLAUDE.md files following depth-scaled adjacency thresholds, ensuring context is available at appropriate directory levels.
