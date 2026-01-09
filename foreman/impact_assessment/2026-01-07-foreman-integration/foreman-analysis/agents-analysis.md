# Agents Analysis Synthesis

## Executive Summary

The foreman agent system is a comprehensive, hierarchical framework for orchestrating the complete software development lifecycle from concept to implementation. It employs 32+ specialized agents organized across four primary categories: chain-* workflow agents for greenfield/brownfield planning, command-agent duos for targeted operations, standalone specialists for focused tasks, and tandem workflows for coordinated multi-agent execution.

The system emphasizes autonomous operation, template-driven documentation, TDD enforcement, strict LOC limits (150-200), and comprehensive decision logging. Agents communicate through GitHub issues, structured comments, and shared documentation artifacts in release-specific folder structures.

## Agent Categories

### Chain-* Workflow Agents

Chain-* agents form the backbone of the planning and design workflow, operating in sequence to produce complete release documentation from concept through implementation-ready issues.

**Greenfield Agents (New Releases):**
- `chain-prototype-researcher` - Research templates, APIs, services with scoring formulas; produces recommendation reports
- `chain-ux-researcher` - Translate specs into user flows, personas, wireframes, interaction patterns
- `chain-ui-designer` - Create design systems, component specs, config notes from UX research
- `chain-system-architect` - Define API design, database schemas, service integrations, infrastructure plans
- `chain-whimsy-injector` - Enhance UI/UX with delightful interactions and personality
- `chain-issue-builder` - Create atomic issue plans with MVP-first sequencing
- `chain-issue-creator` - Convert planning documents to GitHub issues with proper labels

**Updater Agents (Brownfield Modifications):**
- `chain-update-researcher` - Targeted research for plan updates
- `chain-ux-updater` - Surgical UX documentation updates
- `chain-ui-updater` - Surgical UI documentation updates
- `chain-architecture-updater` - Surgical architecture documentation updates
- `chain-issue-plan-updater` - Create/modify issue YAML files and GitHub issues
- `chain-issue-updater` - Pre-agent context preparation and folder scoping

**Chain Commands (Orchestrators):**
- `/chain-concept-gen` - Iterative concept definition
- `/chain-plan-init` - Release specification creation
- `/chain-plan-design-green` - Complete greenfield design workflow
- `/chain-plan-design-update` - Plan revision for direction changes
- `/chain-send-issues` - GitHub issue submission
- `/chain-issue` - Development workflow execution

### Command-Agent Duo Agents

Command-agent duos pair orchestrating commands with specialized execution agents for targeted operations. The command handles discovery, validation, and coordination while the agent performs the actual work.

**Analysis and Implementation Duos:**
| Agent | Command | Pattern |
|-------|---------|---------|
| `impact-assessment` | `impact-change` | 3-7 parallel agents per analysis |
| `surgical-edits` | `impact-change` | Sequential per-phase execution |
| `verify-ui` | `impact-change`, `vite-UI-fix` | Post-implementation verification |
| `error-explorer` | `error-explorer` | Multiple parallel deep-dive analysis |
| `surgical-fixes` | `error-fix` | Single targeted fix execution |
| `dead-code-reviewer` | `dead-code-review` | Parallel codebase analysis |

**Maintenance and Quality Duos:**
| Agent | Command | Pattern |
|-------|---------|---------|
| `memory-manager` | `manage-memory` | CLAUDE.md file generation/maintenance |
| `git-error-fixer` | `fix-git` | Parallel file-grouped error fixing |
| `pr-chore-reviewer` | `review-chore-prs` | Sequential PR review |
| `chore-refactorer` | `apply-chore-refactors` | Sequential refactoring |
| `md-scratchpad-cleanup` | `cleanup-docs` | Parallel markdown cleanup |
| `fix-issue` | `fix-issue` | Surgical issue plan modifications |
| `command-agent-duo` | `create-project-agent-command-duo` | Agent/command pair creation |

### Standalone Agents

Standalone agents operate as focused specialists, invoked by commands or other agents for specific tasks.

**Implementation Workers (3 agents):**
- `backend-worker` - Backend subtask implementation with TDD
- `frontend-worker` - Frontend subtask implementation with TDD
- `ai-technician` - AI/ML subtask implementation with TDD

**Architecture Specialists (3 agents):**
- `backend-architect` - Backend systems design and oversight
- `backend-architecture-analyzer` - Pattern detection and technical decisions
- `frontend-component-analyzer` - Frontend pattern analysis and component identification

**Development Leads (3 agents):**
- `frontend-developer` - Master frontend development coordination
- `ai-engineer` - AI/ML implementation and integration oversight

**Testing & Quality (2 agents):**
- `test-manager` - Creates failing tests (RED phase) for TDD workflow
- `troubleshooting-investigator` - Zero-regression issue resolution

**Error & Fix Specialists (4 agents):**
- `error-explorer` - Deep root cause analysis
- `surgical-edits` - Precision code changes per impact assessment
- `surgical-fixes` - Targeted error fixes
- `git-error-fixer` - Commit-time error resolution

**Additional Categories:**
- Impact & Change Analysis (2): `impact-assessment`, `change-plan-builder`
- Code Quality & Review (5): `dead-code-reviewer`, `code-restructurer`, `reviewerpr`, `pr-chore-reviewer`, `chore-refactorer`
- UI Verification & Fix (2): `vite-frontend-fix`, `verify-ui`
- Documentation & Memory (3): `documentation-updater`, `memory-manager`, `md-scratchpad-cleanup`
- Planning & Issue Management (2): `fix-issue`, `github-issue-creator`
- Infrastructure & DevOps (2): `framework-manager`, `pipeline-manager`
- Creation & Orchestration (1): `command-agent-duo`

### Tandem Agent Workflows

Tandem workflows coordinate multiple agents in structured patterns for complex development tasks.

**Architect/Worker Pattern:**
- Backend Architect + Backend Worker
- Frontend Developer + Frontend Worker
- AI Engineer + AI Technician

**Analysis/Fix Pattern:**
- Error Explorer + Surgical Fixes
- Troubleshooting Investigator + Surgical Edits
- Impact Assessment + Change Plan Builder

**Contract/Implementation Pattern:**
- Test Manager + Implementation Agents (backend-architect, frontend-developer, ai-engineer)

**Sequential Pipeline Pattern:**
- Chain UX Researcher + Chain UI Designer
- Chain System Architect + Chain Architecture Updater
- Chain Issue Builder + GitHub Issue Creator

**Review/Refactor Pattern:**
- PR Chore Reviewer + Chore Refactorer
- Dead Code Reviewer + Documentation Updater

**Fix/Verify Loop Pattern:**
- Vite Frontend Fix + Verify UI

## Cross-Category Patterns

### Shared Standards Enforcement
All agents reference common rules for consistency:
- `@foreman/rules/development-standards.mdc` - LOC limits (<=150 goal, <=200 buffer), code quality
- `@foreman/rules/system-standards.mdc` - Architecture and system patterns
- `@foreman/rules/tdd-development.mdc` - RED-GREEN-REFACTOR cycle enforcement

### Model Distribution
- **Opus (87.5%)**: Complex reasoning, implementation, architectural decisions
- **Sonnet (12.5%)**: Lightweight analysis, pattern detection, verification

### Tool Usage Patterns
- **Standard file operations**: Read, Edit, Bash, Grep, Glob
- **UI testing**: mcp__playwright__* (browser automation)
- **GitHub integration**: mcp__github__*, gh CLI
- **Restricted analysis tools**: Some agents limit tools (e.g., error-explorer uses NO Grep)

### GitHub Issue Integration
- Progress tracked via structured comments with worker scope identifiers
- Labels used for workflow state (`tdd:red`, `todo`, agent assignments)
- Draft PRs coordinate TDD workflow stages

### Parallel vs Sequential Execution
| Pattern | Examples |
|---------|----------|
| Parallel execution | impact-assessment (3-7 agents), error-explorer, dead-code-reviewer, git-error-fixer |
| Sequential execution | pr-chore-reviewer, chore-refactorer, surgical-edits (per-phase) |
| Hybrid | chain-issue-plan-updater (parallel for multiple issues within orchestration) |

## Agent Ecosystem Map

```
                                    PLANNING PHASE
                                         |
    /chain-concept-gen -----> /chain-plan-init -----> /chain-plan-design-green
                                                              |
         +----------------------------------------------------+
         |                    |                    |          |
         v                    v                    v          v
    chain-prototype-     chain-ux-          chain-ui-    chain-system-
      researcher        researcher          designer     architect
         |                    |                    |          |
         +--------------------+--------------------+----------+
                              |
                              v
                     chain-whimsy-injector
                              |
                              v
                     chain-issue-builder
                              |
                              v
                      /chain-send-issues --> chain-issue-creator
                              |
                              v
                         GitHub Issues
                              |
                    +---------+---------+
                    |         |         |
                    v         v         v
              backend-  frontend-   ai-engineer
              architect developer       |
                  |         |           |
                  v         v           v
              backend-  frontend-   ai-technician
               worker    worker
                              |
                              v
                         test-manager (TDD RED phase)
                              |
                              v
                    [Implementation GREEN phase]
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
   error-explorer       impact-assessment     verify-ui
        |                     |                     |
        v                     v                     v
   surgical-fixes       surgical-edits       vite-frontend-fix


                           SUPPORT AGENTS
    +------------------------------------------------------------------+
    | memory-manager | documentation-updater | code-restructurer       |
    | dead-code-reviewer | troubleshooting-investigator | git-error-fixer |
    +------------------------------------------------------------------+
```

## Key Insights

### 1. Separation of Concerns
The system strictly separates planning (chain-* agents), implementation (architect/worker tandems), and verification (verify-ui, test-manager). This enables autonomous operation with minimal user intervention.

### 2. Surgical Modification Philosophy
Updater agents (chain-*-updater) make "seamless" changes that appear as if originally written, preventing documentation drift and maintaining consistency.

### 3. TDD as First-Class Citizen
Test-manager creates failing tests before implementation agents begin, enforcing the RED-GREEN-REFACTOR cycle through GitHub labels (`tdd:red`) and CI configuration.

### 4. Hierarchical Delegation
Architect agents (backend-architect, frontend-developer, ai-engineer) coordinate worker agents (backend-worker, frontend-worker, ai-technician) through structured GitHub comments with scope identifiers.

### 5. Decision Traceability
All chain-* agents log decisions to `coordination/decision-log.md` using the decision reconciliation template, enabling audit trails across agent boundaries.

### 6. Activity Logging
Agents use structured activity logging for progress tracking, enabling visibility into autonomous operations without requiring synchronous communication.

### 7. Folder Scoping
The chain-issue-updater agent classifies folders as primary, secondary, or excluded to restrict agent context, improving focus and reducing token usage.

### 8. Research-Driven Prototyping
The prototype-researcher agent uses systematic scoring formulas (`score-candidate`, `score-composition` bash commands) to evaluate technology choices objectively.

### 9. Resilient Error Handling
Multiple error resolution paths exist: error-explorer for deep analysis, surgical-fixes for targeted fixes, troubleshooting-investigator for zero-regression resolution, and git-error-fixer for commit-time issues.

### 10. Memory System Integration
The memory-manager agent maintains hierarchical CLAUDE.md files with depth-scaled size limits and adjacency heuristics, enabling consistent context across agent invocations.
