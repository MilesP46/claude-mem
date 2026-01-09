# Foreman Commands Synthesis

## Executive Summary

The foreman command system consists of 24 commands organized into four patterns: **Chain Workflows** (6 commands orchestrating release lifecycles), **Duo Workflows** (10 command-agent pairs for specialized tasks), **Standalone Commands** (8 independent utilities), and **Tandem Workflows** (10 coordination patterns). Commands serve as orchestration layer, handling workflow control, user interaction, and multi-agent coordination.

## Command Architecture

### Three-Tier Command Model

**Tier 1: Release Orchestration (Chain-*)**
- Purpose: End-to-end release delivery from concept to production
- Pattern: Sequential handoffs with explicit `handoff-claude` transitions
- Commands: chain-concept-gen → chain-plan-init → chain-plan-design-green → chain-send-issues → chain-issue
- Quality Gates: User approval at concept (95% confidence), deployment decisions, requirements review, user testing
- Characteristic: Template-driven, agent-sequencing, activity logging

**Tier 2: Task Execution (Duo + Standalone)**
- Purpose: Focused problem-solving and maintenance tasks
- Pattern: Command orchestrates, agent executes (duos) or direct operation (standalone)
- Duos: error-explorer/fix, impact-change, memory management, code quality
- Standalone: Documentation cleanup, planning updates, architecture maintenance
- Characteristic: Surgical precision, parallel/sequential execution, 100% confidence analysis

**Tier 3: Workflow Coordination (Tandem)**
- Purpose: Complex multi-command workflows
- Pattern: Shared state, sequential chains, coordinated phases
- Examples: Error analysis→fix, assessment→planning, chore review→refactoring
- Characteristic: Documentation coupling, state machines, quality gates

## Key Patterns

### Pattern 1: Chain Orchestration (Release Delivery)

**Full Chain**: concept-gen → plan-init → design-green → send-issues → issue (×N) → complete

**Characteristics:**
- Sequential handoffs: `handoff-claude "/next-command" --app iterm --cwd $PWD`
- User approval gates: deployment decisions, requirements review, user testing
- Agent sequencing: Each chain step launches specialized agents (prototype-researcher, ux-researcher, ui-designer, system-architect, whimsy-injector, issue-builder)
- Activity logging: `log-activity release <id> "message"` at every step
- Template-driven: Every document follows template+instruction pairs

**Design Phase (within chain-plan-design-green):**
1. Prototype research (with deployment decision matrix)
2. UX research (flows, personas, wireframes)
3. UI design (components, design system, tokens)
4. System architecture (API, database, infrastructure)
5. Cross-agent coordination (impact analysis)
6. Whimsy injection (delightful interactions)
7. Issue planning (atomic, sequential issues for TDD)

**Issue Execution (chain-issue):**
1. Issue analysis & branch creation
2. chain-issue-updater (planning, folder scoping)
3. test-manager (RED phase - failing tests)
4. Parent agents with worker parallelization (GREEN/REFACTOR phases)
5. Type error resolution
6. troubleshooting-investigator (conditional on failures)
7. ReviewerPR (Sandy Metz style)
8. User testing validation
9. Merge with quality gates
10. documentation-updater & memory-manager (post-merge)

### Pattern 2: Duo Orchestration (Command-Agent Pairs)

**10 Duos:** error-explorer, fix-issue, dead-code-review, impact-change, manage-memory, apply-chore-refactors, vite-UI-fix, error-fix, review-chore-prs, fix-git

**Command Responsibilities:**
- Workflow control and state management
- User interaction and approval gates
- Multi-agent coordination (parallel/sequential)
- Result synthesis

**Agent Responsibilities:**
- Autonomous task execution
- Specialized tool usage
- 100% confidence analysis (where applicable)
- Test updates and verification

**Parallel Duos:** error-explorer (multiple agents per error), dead-code-review (multiple agents per codebase section), fix-git (one agent per file)

**Sequential Duos:** review-chore-prs (one PR at a time), apply-chore-refactors (one refactoring doc at a time)

**Iterative Duos:** error-fix (iterate until passing), vite-UI-fix (iterate until UI correct)

### Pattern 3: Standalone Operations

**8 Commands:** cleanup-docs, create-project-agent-command-duo, format-claude-file, impact-change-review, new-issue, plan-change, restructure-docs, update-plans

**Categories:**
- **Documentation Management**: cleanup-docs, restructure-docs, format-claude-file
- **Planning Support**: plan-change, update-plans, new-issue
- **Error Recovery**: impact-change-review
- **Meta-Operations**: create-project-agent-command-duo

**Characteristics:**
- Single-purpose focus
- Agent delegation (except format-claude-file)
- Independent invocation
- Natural sequential relationships but operational independence

### Pattern 4: Tandem Coordination

**10 Tandem Groups:**

1. **Error Investigation → Resolution**: error-explorer → error-fix
2. **Impact Assessment → Implementation**: impact-change → plan-change
3. **Issue Review → Revision**: impact-change-review → error-explorer → dead-code-review → error-fix
4. **Release Chain**: chain-plan-init → chain-plan-design-green → chain-send-issues → chain-issue
5. **Design Orchestration**: Within chain-plan-design-green (7-agent sequence)
6. **Chore Management**: review-chore-prs → apply-chore-refactors
7. **Plan Updates**: update-plans ↔ chain-plan-design-update (bidirectional)
8. **Code Cleanup**: format-claude-file → cleanup-docs → dead-code-review
9. **Docs Refresh**: restructure-docs → cleanup-docs → manage-memory
10. **Multi-Issue Execution**: chain-issue (self-repeating with internal orchestration)

**Coordination Mechanisms:**
- **Explicit Handoffs**: handoff-claude script with terminal/directory specs
- **Shared State**: Documentation files (assessments, plans, issue-maps, chore docs)
- **Sequential Gating**: User approvals between phases
- **Parallel→Serial**: Multiple agents execute in parallel, results synthesized serially

## Integration Points

### Rules Integration
- **Always Applied**: development-standards.mdc (≤200 LOC, DRY, type safety), system-standards.mdc (12-factor, containers), tdd-development.mdc (stub failures), diagram-standard.mdc (Mermaid validation)
- **Contextual**: test-organization.mdc (≥90% coverage), documentation-rules.mdc (token budgets), memory-system-standards.mdc (CLAUDE.md limits)
- **Referenced By**: chain-issue (all standards), impact-change workflows, all implementation commands

### Instructions Integration
- **Planning**: concept-checklist, release-specification, issue-planning methodologies
- **Coordination**: orchestration-patterns, agent-scope-impact-matrix, cross-agent-coordination
- **Assessment**: impact-assessment-qrg-format, gap-analysis-checklist, change-planning-workflow
- **GitHub**: gh-issue-workflow, issue-creation-workflow, pr-review-criteria
- **Agent-Specific**: Paired with each agent for methodology guidance

### Scripts Integration
- **Activity Logging**: log-activity (used by ALL commands for progress tracking)
- **Terminal Management**: handoff-claude, exit-shell (chain-* commands only)
- **File Sync**: send-agents, send-commands, memory-update (distribution across projects)
- **Project Management**: foreman-update, foreman-templates (system maintenance)

### Templates Integration
- **Planning**: release-spec, issue-plan, concept-checklist (chain-plan-init, chain-issue-builder)
- **Coordination**: agent-template, command-template, orchestration-workflow (create-project-agent-command-duo)
- **Architecture**: api-design, database-schema, infrastructure-plan (chain-system-architect, update-plans)
- **UI/UX**: component-specs, design-system, user-flows, personas (chain-ui-designer, chain-ux-researcher)
- **Pipeline**: github-actions-workflow (pipeline-manager via chain-issue)

## Critical Success Factors

### Quality Gates
1. **Concept Phase**: 95% confidence in requirements clarity
2. **Design Phase**: Deployment decision approval, requirements review
3. **Implementation Phase**: Type error resolution, test passage, user testing validation
4. **Merge Phase**: ReviewerPR approval, documentation complete, memory updated

### Consistency Mechanisms
1. **Template-Driven**: All documentation follows structured templates with instructions
2. **Activity Logging**: Continuous audit trail via log-activity
3. **Rules Enforcement**: Standards applied automatically by agents and validated by CI
4. **Letter-Suffix Sequencing**: Issue insertions (004a, 004b) maintain order near completed work

### Parallel Execution Strategies
1. **Worker Orchestration**: Parent agents (backend-architect, frontend-developer, ai-engineer) launch workers in parallel for bottom-up implementation
2. **Analysis Coverage**: error-explorer, dead-code-reviewer, fix-git launch multiple agents for comprehensive analysis
3. **Update Coordination**: chain-ux-updater, chain-ui-updater, chain-architecture-updater run in parallel for seamless updates

### Error Recovery
1. **Iterative Verification**: error-fix, vite-UI-fix iterate until tests pass
2. **Troubleshooting Investigation**: troubleshooting-investigator resolves blocking issues during chain-issue
3. **Impact Reassessment**: impact-change-review provides full reassessment when post-implementation issues arise

## Command Ecosystem Statistics

- **Total Commands**: 24
- **Chain Commands**: 6 (release lifecycle orchestration)
- **Duo Commands**: 10 (command-agent pairs)
- **Standalone Commands**: 8 (independent utilities)
- **Tandem Patterns**: 10 (multi-command workflows)
- **Agent Types Referenced**: 35+ (chain agents, duos, domain experts, workers)
- **Rules Referenced**: 7 (.mdc files for standards enforcement)
- **Instructions Referenced**: 30+ (methodology and template guidance)
- **Templates Used**: 25+ (structured documentation formats)
- **Scripts Integrated**: 10+ (logging, handoffs, synchronization)

## Next-Generation Opportunities

### Potential for Claude Code Skills Integration
- **Concept Development Skill**: Interactive Q&A with confidence tracking
- **Release Planning Skill**: Template-driven specification with deployment decisions
- **Issue Planning Skill**: Atomic issue breakdown with sequencing and agent mapping
- **Code Quality Skill**: Standards enforcement with surgical recommendations

### Potential for Claude-Mem Memory Integration
- **Navigation Cache**: Root CLAUDE.md functional area mapping for agent routing
- **Cross-Cutting Patterns**: Reusable patterns stored once, referenced by all agents
- **Issue Context**: Pre-assembled context from GitHub cache for faster chain-issue starts
- **Specialist Triggers**: Variance detection suggesting when specialist agents needed

### Potential for MCP Integration
- **GitHub Sync Service**: Cached issues/PRs/comments for token savings (80% reduction)
- **Playwright Integration**: Already used by vite-frontend-fix and verify-ui agents
- **Custom MCPs**: Foreman-specific operations (log-activity, template management, memory sync)
