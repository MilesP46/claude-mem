# Foreman Agents Synthesis

## Executive Summary

The foreman agent ecosystem consists of 44 agents organized into four patterns: **Chain Workflow Agents** (13 agents for release lifecycle phases), **Duo Agents** (10 agent-command pairs for specialized tasks), **Standalone Agents** (20 agents for architecture, implementation, documentation, infrastructure, and domain expertise), and **Tandem Coordination** (8 agent groups for complex workflows). Agents serve as the autonomous execution layer, handling specialized tasks with deep domain expertise while maintaining quality standards and zero-regression tolerance.

## Agent Architecture

### Four-Tier Agent Model

**Tier 1: Chain Workflow Agents (13 agents)**
- Purpose: Autonomous phase execution within release delivery pipelines
- Pattern: Sequential dependencies where each agent builds on prior outputs
- Agents: prototype-researcher, ux-researcher, ui-designer, system-architect, whimsy-injector, issue-builder, issue-creator, issue-updater, issue-plan-updater, ux-updater, ui-updater, architecture-updater, update-researcher
- Characteristic: Full tool access, structured outputs, research-first approach, seamless updates

**Tier 2: Duo Agents (10 agents)**
- Purpose: Paired execution with orchestration commands for specialized problem-solving
- Pattern: Command orchestrates workflow, agent executes autonomously
- Pairs: error-explorer, fix-issue, dead-code-reviewer, impact-assessment, memory-manager, chore-refactorer, vite-frontend-fix, surgical-fixes, pr-chore-reviewer, git-error-fixer
- Characteristic: 100% confidence standard, surgical precision, tool specialization, iterative verification

**Tier 3: Standalone Agents (20 agents)**
- Purpose: Independent specialized capabilities for specific domains
- Pattern: Autonomous operation with optional sprint/issue context
- Categories: Architecture/Analysis (3), Implementation/Verification (4), Documentation/Memory (2), Infrastructure/Frameworks (2), Domain Experts (7), Specialized Management (2)
- Characteristic: TDD/BDD methodology, sprint context integration, activity logging, pattern detection

**Tier 4: Tandem Coordination (8 groups)**
- Purpose: Multi-agent coordination through sequential handoffs or parallel execution
- Pattern: Shared context, coordinated phases, quality gates
- Groups: Issue management workflow, UX-UI design pipeline, architecture update chain, TDD chain, parent-worker orchestration, update agent coordination, error analysis & fix pipeline, quality & review chain
- Characteristic: Sequential dependencies, parallel with synthesis, bidirectional relationships, zero-regression tolerance

## Key Patterns

### Pattern 1: Chain Workflow Agents (Release Lifecycle Execution)

**Research Phase Agents**: prototype-researcher → ux-researcher

**Design Phase Agents**: ui-designer → system-architect → whimsy-injector

**Issue Planning Agents**: issue-builder → issue-creator → issue-updater → issue-plan-updater

**Update Agents**: ux-updater + ui-updater + architecture-updater (parallel), update-researcher

**Characteristics:**
- **Autonomous Operation**: All chain agents operate without user prompts, making independent decisions based on analysis
- **Full Tool Access**: Every chain agent has access to all tools for comprehensive research and implementation
- **Structured Outputs**: Agents produce standardized deliverables (flows, personas, specs, schemas, issues, YAML)
- **Sequential Dependencies**: Agents build on prior outputs (ux-researcher → ui-designer → system-architect)
- **Research-First Approach**: Prototype-researcher and update-researcher emphasize thorough analysis before recommendations
- **Seamless Updates**: Update agents (ux-updater, ui-updater, architecture-updater) make changes appearing as originally written (no change references)
- **Quality Focus**: Emphasis on completeness, accuracy, professional deliverables ready for implementation
- **Delight Layer**: whimsy-injector uniquely adds personality and joy to functional interfaces

**Integration Points:**
- **Commands**: chain-concept-gen, chain-plan-init, chain-plan-design-green, chain-plan-design-update, chain-send-issues, chain-issue
- **Templates**: release-specification, issue-plan, user-flows, personas, wireframes, component-specs, design-system, api-design, database-schema, infrastructure-plan
- **Instructions**: UX research methodology, design system standards, architecture patterns, issue planning methodology, seamless update methodology

### Pattern 2: Duo Agents (Command-Agent Pairs)

**Analysis Duos**: error-explorer (read-only tracing), dead-code-reviewer (usage analysis), impact-assessment (logic chains)

**Modification Duos**: fix-issue (issue planning), surgical-fixes (targeted fixes), chore-refactorer (dependency migration)

**Verification Duos**: vite-frontend-fix (Playwright UI testing), pr-chore-reviewer (PR assessment), git-error-fixer (commit-time errors)

**System Duos**: memory-manager (CLAUDE.md hierarchy)

**Characteristics:**
- **100% Confidence Standard**: Analysis agents (error-explorer, dead-code-reviewer) only report findings with absolute certainty
- **Surgical Precision**: All agents maintain existing functionality while making targeted changes (no regressions)
- **Tool Specialization**: Each agent has tools matched to needs:
  - Read-only: error-explorer (tracing logic without execution)
  - Playwright MCP: vite-frontend-fix (full UI testing suite)
  - Full access: impact-assessment, memory-manager (comprehensive analysis)
- **Test Updates**: Implementation agents update tests appropriately matching code changes
- **Iterative Verification**: vite-frontend-fix and surgical-fixes iterate until tests pass
- **Documentation Coupling**: pr-chore-reviewer creates refactoring docs, chore-refactorer consumes them
- **Standards Compliance**: Agents reference @foreman/rules/development-standards.mdc, system-standards.mdc for consistency
- **Parallel Execution Support**: error-explorer, dead-code-reviewer, git-error-fixer designed for parallel launches
- **Quality Gates**: All implementation agents verify changes through testing (zero silent failures)

**Integration Points:**
- **Commands**: error-explorer, fix-issue, dead-code-review, impact-change, manage-memory, apply-chore-refactors, vite-UI-fix, error-fix, review-chore-prs, fix-git
- **Rules**: development-standards.mdc (≤200 LOC, DRY, type safety), system-standards.mdc (12-factor), memory-system-standards.mdc (CLAUDE.md hierarchy)
- **Instructions**: Deep logic tracing methodology, issue planning system structure, impact assessment QRG format, memory hierarchy adjacency principles, surgical fix methodology, seamless update methodology

### Pattern 3: Standalone Agents (Independent Specialists)

**Architecture & Analysis (3 agents):**
- backend-architecture-analyzer: Maps backend patterns, makes technical decisions before implementation
- frontend-component-analyzer: Scans frontend to detect patterns, ensures new components align with existing
- change-plan-builder: Creates fact-based granular change plans from impact assessments

**Implementation & Verification (4 agents):**
- surgical-edits: Executes planned changes with surgical precision following assessment plans
- verify-ui: Tests actual UI behavior with Playwright, validates backend logic
- code-restructurer: Restructures code to comply with ≤150-200 LOC limit, DRY, single-responsibility
- troubleshooting-investigator: Autonomously diagnoses and fixes test failures (unit/integration/UI)

**Documentation & Memory (2 agents):**
- documentation-updater: Creates/updates/restructures docs following project standards (QRG blocks, hierarchy, token budgets)
- md-scratchpad-cleanup: Cleans loose scratchpad .md files removing outdated content, preserving correct info

**Infrastructure & Frameworks (2 agents):**
- framework-manager: Initializes new projects or adds frameworks to existing (bootstrap, environment config, logging foundations)
- pipeline-manager: Initializes/retrofits CI/CD pipelines with automated testing (GitHub Actions, multi-environment deployment)

**Domain Experts (7 agents):**
- **Parent Agents (3)**: backend-architect, frontend-developer, ai-engineer
- **Worker Agents (3)**: backend-worker, frontend-worker, ai-technician
- **Test Agent (1)**: test-manager

**Specialized Management (2 agents):**
- github-issue-creator: Adds new issues to existing releases with proper sequencing/agent mapping
- reviewerpr: Reviews PRs in Sandy Metz style (OO design principles, simplicity, maintainability)

**Characteristics:**
- **Autonomous Decision-Making**: All standalone agents make independent decisions based on codebase analysis without user prompts
- **Sprint Context Integration**: Domain experts and workers reference @foreman/current-sprint.md and GitHub issues
- **TDD/BDD Methodology**: Implementation agents follow strict TDD (RED-GREEN-REFACTOR) or BDD for frontend
- **Activity Logging**: Consistent use of `log-activity release` for progress tracking across agents
- **Full Tool Access**: Most standalone agents have access to all tools for comprehensive implementation
- **Quality Standards**: All agents enforce development standards (≤150 LOC, DRY, single-responsibility, type safety)
- **Zero Silent Failures**: Implementation agents ensure all errors handled properly and tests pass
- **Pattern Detection**: Analyzer agents ensure consistency with existing codebase patterns
- **Worker Pattern**: Worker agents execute focused subtasks within larger parent agent contexts (bottom-up implementation)
- **GitHub Integration**: Several agents integrate with gh CLI for issue management, comments, PR operations

**Integration Points:**
- **Rules**: development-standards.mdc, system-standards.mdc, tdd-development.mdc, test-organization.mdc, diagram-standard.mdc, memory-system-standards.mdc
- **Instructions**: Sprint context, GitHub issue details, bootstrap methodology, CI/CD pipeline patterns, OO design patterns, documentation hierarchy standards
- **Scripts**: log-activity release, gh issue comment, gh CLI operations
- **Commands**: Issue execution workflows (chain-issue), quality management (impact-change, dead-code-review), memory maintenance (manage-memory)

### Pattern 4: Tandem Coordination (Multi-Agent Workflows)

**8 Tandem Groups:**

1. **Issue Management Workflow**: chain-issue-builder → chain-issue-creator → chain-issue-updater → chain-issue-plan-updater
   - Sequential handoff with each building on prior output
   - Complete lifecycle from requirements breakdown to GitHub integration

2. **UX-UI Design Pipeline**: chain-ux-researcher → chain-ui-designer → chain-whimsy-injector
   - Sequential dependency chain transforming specs to designs with delight
   - Update coordination: chain-ux-updater + chain-ui-updater (parallel seamless updates)

3. **Architecture Update Chain**: chain-system-architect ↔ chain-architecture-updater
   - Bidirectional: architect creates, updater maintains
   - Updates appear as if originally written (no change references)

4. **Test-Driven Development Chain**: test-manager → (backend-architect | frontend-developer | ai-engineer)
   - Sequential: test-manager creates RED phase, implementation agents execute GREEN/REFACTOR
   - Tests define DONE - implementation complete when all pass

5. **Parent-Worker Orchestration**:
   - backend-architect → backend-worker (parallel instances)
   - frontend-developer → frontend-worker (parallel instances)
   - ai-engineer → ai-technician (parallel instances)
   - Parent launches multiple workers in parallel for bottom-up implementation

6. **Update Agent Coordination**: chain-ux-updater + chain-ui-updater + chain-architecture-updater
   - Parallel execution with coordinated output across UX, UI, architecture
   - Optional: chain-update-researcher runs first if new services/templates needed

7. **Error Analysis & Fix Pipeline**: error-explorer → surgical-fixes (via error-fix command)
   - error-explorer (multiple parallel instances) trace logic flows
   - Findings synthesized, surgical-fixes implements targeted fixes
   - Iteration continues until all tests pass

8. **Quality & Review Chain**: impact-assessment → troubleshooting-investigator → reviewerpr
   - Sequential quality gates from impact analysis through PR review
   - Zero-regression tolerance throughout pipeline

**Coordination Mechanisms:**
- **Sequential Dependency Chains**: Agents execute in order with each building on prior (issue workflow, UX-UI pipeline, TDD chain)
- **Parallel Execution with Synthesis**: Multiple agents run simultaneously with coordinated outputs (parent-worker, update agents)
- **Bidirectional Relationships**: Creation and maintenance pairs (system-architect ↔ architecture-updater)
- **Quality Gate Progression**: Agents enforce quality at each step before passing to next
- **Context Handoff**: Sequential agents receive context from prior agents (test-manager defines DONE, implementation executes)
- **Specialized Coordination**: Different patterns for different workflows (sequential for dependencies, parallel for scale)

## Integration Points

### Rules Integration
- **Always Applied**: development-standards.mdc (≤200 LOC, DRY, type safety), system-standards.mdc (12-factor, containers), tdd-development.mdc (stub failures)
- **Contextual**: test-organization.mdc (≥90% coverage), memory-system-standards.mdc (CLAUDE.md limits), diagram-standard.mdc (Mermaid validation)
- **Referenced By**: All implementation agents (backend-architect, frontend-developer, ai-engineer, workers, test-manager, troubleshooting-investigator, framework-manager, pipeline-manager), duo agents (fix-issue, impact-assessment, memory-manager, vite-frontend-fix), chain agents (indirectly through templates)

### Instructions Integration
- **Planning**: Issue planning methodology, atomic issue breakdown, GitHub workflow integration
- **Coordination**: UX research methodology, design system standards, architecture patterns, seamless update methodology
- **Assessment**: Impact assessment QRG format, deep logic tracing, surgical fix methodology
- **Development**: Sprint context, GitHub issue details, TDD principles, bootstrap methodology, CI/CD patterns
- **Quality**: OO design principles (Sandy Metz), test failure diagnosis, documentation hierarchy standards

### Scripts Integration
- **Activity Logging**: log-activity release (used by 15+ agents: backend-architect, frontend-developer, ai-engineer, workers, test-manager, framework-manager, pipeline-manager, troubleshooting-investigator, github-issue-creator, reviewerpr, backend-architecture-analyzer, frontend-component-analyzer)
- **GitHub Integration**: gh issue comment, gh CLI operations (test-manager, backend-architect, frontend-developer, ai-engineer, github-issue-creator, reviewerpr, impact-assessment, troubleshooting-investigator)
- **No Terminal Management**: Agents don't use handoff-claude or exit-shell (command-level only)

### Templates Integration
- **Planning**: release-specification, issue-plan, concept-checklist, issue-overview, user-requirements (chain-issue-builder, chain-issue-creator)
- **UX Research**: user-flows, personas, wireframes, interaction-patterns (chain-ux-researcher, chain-ux-updater)
- **UI Design**: component-specs, design-system, design-config-notes, prototype-recommendations, deployment-decision-matrix (chain-ui-designer, chain-ui-updater, chain-prototype-researcher)
- **Architecture**: api-design, database-schema, infrastructure-plan, service-integration (chain-system-architect, chain-architecture-updater)
- **Pipeline**: github-actions-workflow (pipeline-manager)

### Commands Integration
- **Chain Commands**: All 13 chain agents support 6 chain commands (chain-concept-gen through chain-issue)
- **Duo Commands**: 10 duo agents paired with corresponding commands (error-explorer/error-explorer, dead-code-reviewer/dead-code-review, etc.)
- **Standalone Orchestration**: Multiple standalone agents support chain-issue workflow (test-manager, backend-architect, frontend-developer, ai-engineer, workers, troubleshooting-investigator, reviewerpr, documentation-updater, memory-manager)
- **Quality Commands**: Standalone agents support impact-change, dead-code-review, manage-memory commands

## Critical Success Factors

### Quality Standards
1. **100% Confidence Analysis**: error-explorer, dead-code-reviewer only report findings with absolute certainty
2. **Zero Silent Failures**: All implementation agents ensure proper error handling and test passage
3. **TDD/BDD Compliance**: test-manager creates RED phase, implementation agents execute GREEN/REFACTOR cycles
4. **Standards Enforcement**: ≤200 LOC, DRY, single-responsibility, type safety enforced by all implementation agents
5. **Test Coverage**: ≥90% line coverage maintained by domain experts and workers

### Autonomous Operation
1. **No User Prompts**: All agents make independent decisions based on analysis and research
2. **Pattern Detection**: Analyzer agents (backend-architecture-analyzer, frontend-component-analyzer) ensure consistency
3. **Context Integration**: Domain experts and workers reference sprint context and GitHub issues automatically
4. **Activity Logging**: Comprehensive progress tracking via log-activity across 15+ agents
5. **GitHub Integration**: Seamless issue commenting, PR reviews, issue creation via gh CLI

### Execution Strategies
1. **Parent-Worker Orchestration**: Parents launch multiple workers in parallel for bottom-up implementation
2. **Parallel Analysis**: error-explorer, dead-code-reviewer, git-error-fixer support parallel launches
3. **Sequential Dependencies**: Chain agents execute in order (ux-researcher → ui-designer → system-architect)
4. **Iterative Verification**: vite-frontend-fix, surgical-fixes iterate until tests pass
5. **Seamless Updates**: Update agents (ux-updater, ui-updater, architecture-updater) make changes appearing original

### Coordination Mechanisms
1. **Structured Outputs**: Chain agents produce standardized deliverables feeding subsequent phases
2. **Documentation Coupling**: pr-chore-reviewer creates docs, chore-refactorer consumes them
3. **Context Handoff**: test-manager defines DONE, implementation agents execute
4. **Bidirectional Relationships**: system-architect creates, architecture-updater maintains
5. **Quality Gates**: troubleshooting-investigator → reviewerpr progression enforces quality at each step

## Agent Ecosystem Statistics

- **Total Agents**: 44
- **Chain Workflow Agents**: 13 (release lifecycle phases)
- **Duo Agents**: 10 (command-agent pairs)
- **Standalone Agents**: 20 (architecture, implementation, documentation, infrastructure, domain experts, specialized management)
  - Architecture/Analysis: 3
  - Implementation/Verification: 4
  - Documentation/Memory: 2
  - Infrastructure/Frameworks: 2
  - Domain Experts: 7 (3 parents + 3 workers + 1 test)
  - Specialized Management: 2
- **Tandem Agent Groups**: 8 (multi-agent workflows)
- **Commands Referenced**: 24 (all foreman commands)
- **Rules Referenced**: 7 (.mdc files for standards enforcement)
- **Instructions Referenced**: 30+ (methodology and template guidance)
- **Templates Used**: 25+ (structured documentation formats)
- **Scripts Integrated**: 3 (log-activity, gh CLI operations - no terminal management)

## Next-Generation Opportunities

### Potential for Claude Code Skills Integration
- **Test Creation Skill**: Interactive TDD workflow with test-manager for RED phase before implementation
- **Architecture Analysis Skill**: Progressive disclosure patterns from backend-architecture-analyzer and frontend-component-analyzer
- **Issue Planning Skill**: Template-driven atomic issue breakdown with chain-issue-builder
- **Quality Review Skill**: Sandy Metz-style PR review patterns from reviewerpr

### Potential for Claude-Mem Memory Integration
- **Agent Pattern Library**: Reusable agent workflows stored once (TDD cycle, parent-worker orchestration, sequential handoffs)
- **Sprint Context Cache**: Pre-assembled context from GitHub cache for faster agent starts
- **Variance Detection**: Lean hybrid model where agents embed only variance-critical values (~600-900 tokens), rest from memory
- **Specialist Triggers**: Memory system suggests when specialist agents needed (error-explorer for complex bugs, dead-code-reviewer after refactoring)

### Potential for MCP Integration
- **GitHub Sync Service**: Cached issues/PRs/comments for token savings (80% reduction) used by github-issue-creator, reviewerpr, test-manager
- **Playwright Integration**: Already used by vite-frontend-fix and verify-ui agents (full MCP suite)
- **Custom MCPs**: Agent-specific operations (activity logging, pattern detection, test orchestration)
