# Tandem Agents Analysis

## Overview
Tandem agent patterns enable complex workflows through agent coordination. Agents work together through sequential handoffs, parallel execution with synthesis, or coordinated phases. These relationships create powerful execution chains while maintaining individual agent autonomy.

## Tandem Groups Identified
1. Issue Management Workflow
2. UX-UI Design Pipeline
3. Architecture Update Chain
4. Test-Driven Development Chain
5. Parent-Worker Orchestration
6. Update Agent Coordination
7. Error Analysis & Fix Pipeline
8. Quality & Review Chain

## Detailed Analysis

### Issue Management Workflow
- **Agents:** chain-issue-builder → chain-issue-creator → chain-issue-updater → chain-issue-plan-updater
- **Purpose:** Complete issue lifecycle from planning to GitHub integration
- **Coordination:** Sequential handoff with each agent building on prior output
- **Sequence:**
  1. chain-issue-builder breaks down requirements into atomic issues
  2. chain-issue-creator converts issue plans into GitHub issues
  3. chain-issue-updater enhances with work scope documentation and folder scoping
  4. chain-issue-plan-updater handles YAML modifications and GitHub updates with letter-suffix sequencing
- **Rules Referenced:** development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Issue planning methodology, GitHub workflow integration
- **Scripts Referenced:** log-activity, gh CLI

### UX-UI Design Pipeline
- **Agents:** chain-ux-researcher → chain-ui-designer → chain-whimsy-injector
- **Purpose:** Transform specifications into complete UI designs with delightful interactions
- **Coordination:** Sequential dependency chain where each agent builds on prior decisions
- **Sequence:**
  1. chain-ux-researcher creates user flows, personas, wireframes, interaction patterns
  2. chain-ui-designer transforms wireframes into production-ready design systems with tokens and component specs
  3. chain-whimsy-injector enhances UI with delightful interactions, animations, personality-filled copy
- **Update Coordination:** chain-ux-updater and chain-ui-updater make seamless updates when plans change
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** UX research methodology, design system standards, delight patterns
- **Scripts Referenced:** None

### Architecture Update Chain
- **Agents:** chain-system-architect ↔ chain-architecture-updater
- **Purpose:** Create and maintain technical architecture documentation
- **Coordination:** Bidirectional - architect creates, updater maintains
- **Sequence:**
  1. chain-system-architect creates comprehensive architecture docs (API design, database schemas, service integrations, infrastructure)
  2. chain-architecture-updater makes surgical updates when plans change
  3. Updates appear as if originally written (no change references)
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Architecture documentation standards, seamless update methodology
- **Scripts Referenced:** None

### Test-Driven Development Chain
- **Agents:** test-manager → (backend-architect | frontend-developer | ai-engineer)
- **Purpose:** TDD workflow with failing tests defining DONE before implementation
- **Coordination:** Sequential - test-manager creates RED phase, implementation agents execute GREEN/REFACTOR
- **Sequence:**
  1. test-manager creates intentionally failing tests based on acceptance criteria
  2. Implementation agents (domain experts) execute TDD cycle to pass tests
  3. Tests define DONE - implementation complete when all tests pass
- **Rules Referenced:** development-standards.mdc, system-standards.mdc, tdd-development.mdc, test-organization.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** gh issue comment, log-activity release

### Parent-Worker Orchestration
- **Agents:** Parent Agents ↔ Worker Agents (parallel execution)
- **Purpose:** Parent agents orchestrate work, worker agents execute focused subtasks in parallel
- **Coordination:** Parent launches multiple workers in parallel for bottom-up implementation
- **Sequence:**
  - **Backend:** backend-architect → backend-worker (parallel instances)
  - **Frontend:** frontend-developer → frontend-worker (parallel instances)
  - **AI/ML:** ai-engineer → ai-technician (parallel instances)
- **Rules Referenced:** development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** log-activity release, gh issue comment

### Update Agent Coordination
- **Agents:** chain-ux-updater + chain-ui-updater + chain-architecture-updater (parallel execution)
- **Purpose:** Coordinate seamless updates across UX, UI, and architecture documentation
- **Coordination:** Parallel execution with coordinated output
- **Sequence:**
  1. Launched in parallel when plan changes require updates
  2. Each updates specific domain (UX flows, UI specs, architecture docs)
  3. All make surgical, seamless changes appearing as original content
  4. No change references allowed
- **Optional Research:** chain-update-researcher runs first if new services/templates needed
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Seamless update methodology, coordination patterns
- **Scripts Referenced:** None

### Error Analysis & Fix Pipeline
- **Agents:** error-explorer → surgical-fixes (via error-fix command coordination)
- **Purpose:** Comprehensive error investigation followed by targeted fixing
- **Coordination:** Sequential with explicit dependency
- **Sequence:**
  1. error-explorer (multiple parallel instances) trace logic flows to identify root causes
  2. Findings synthesized by orchestrating command
  3. surgical-fixes implements targeted fixes based on root cause analysis
  4. Iteration continues until all tests pass
- **Rules Referenced:** development-standards.mdc
- **Instructions Referenced:** Error analysis methodology, surgical fix patterns
- **Scripts Referenced:** None

### Quality & Review Chain
- **Agents:** impact-assessment → troubleshooting-investigator → reviewerpr
- **Purpose:** Comprehensive quality assurance from impact analysis through PR review
- **Coordination:** Sequential quality gates
- **Sequence:**
  1. impact-assessment analyzes change impacts and documents logic chains
  2. troubleshooting-investigator fixes test failures maintaining zero-regression
  3. reviewerpr reviews PR in Sandy Metz style and makes refined improvements
- **Rules Referenced:** development-standards.mdc, system-standards.mdc, Sandy Metz POODR
- **Instructions Referenced:** Impact assessment methodology, test failure diagnosis, OO design principles
- **Scripts Referenced:** log-activity release, gh CLI

## Pattern Summary

**Sequential Dependency Chains**: Agents execute in specific order with each building on prior output (issue workflow, UX-UI pipeline, TDD chain).

**Parallel Execution with Synthesis**: Multiple agents run simultaneously with coordinated outputs (parent-worker orchestration, update agent coordination).

**Bidirectional Relationships**: Some agents have creation and maintenance pairs (system-architect ↔ architecture-updater).

**Quality Gate Progression**: Agents enforce quality at each step before passing to next agent (test-manager → implementation → troubleshooting → review).

**Context Handoff**: Sequential agents receive context from prior agents (test-manager defines DONE, implementation agents execute).

**Specialized Coordination**: Different tandem patterns for different workflows (sequential for dependencies, parallel for scale).

**Zero-Regression Tolerance**: All chains maintain functionality throughout pipeline (troubleshooting-investigator, surgical-fixes).

**Standards Enforcement**: Chains enforce development standards at multiple points (TDD methodology, LOC limits, type safety).

**Seamless Updates**: Update agents coordinate to make changes appear original across multiple documentation domains.

**Work Decomposition**: Parent-worker pattern decomposes work into parallel subtasks for efficient execution.
