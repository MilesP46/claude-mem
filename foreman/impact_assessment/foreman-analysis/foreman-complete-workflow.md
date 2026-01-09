# Foreman Complete Workflow Mapping

## Executive Summary

Foreman is a comprehensive software development orchestration system integrating 24 commands, 44 agents, 7 rules, 30+ instructions, 10+ scripts, and 25+ templates into cohesive workflows spanning concept generation through production deployment. The system enforces engineering standards (≤200 LOC, ≥90% coverage, TDD cycles), provides template-driven consistency, enables multi-agent coordination, and maintains comprehensive audit trails through activity logging.

## Complete Workflow Architecture

### Layer 1: Standards Enforcement (Rules)

**7 Rule Categories** (.mdc files with YAML frontmatter):

1. **development-standards.mdc** (alwaysApply: true)
   - ≤150 LOC excluding whitespace/comments, max 200 before split
   - DRY principle, single-responsibility, modularity
   - Type safety (no "any", no disabled checks)
   - Referenced by: ALL implementation agents, impact-change workflows, chain-issue

2. **system-standards.mdc** (alwaysApply: true)
   - Containerized stateless architecture (12-factor methodology)
   - Health checks at /healthz (liveness) and /readyz (readiness)
   - Logs to stdout/stderr only, graceful SIGTERM handling
   - Referenced by: ALL implementation agents, framework-manager, pipeline-manager

3. **tdd-development.mdc** (alwaysApply: true)
   - Stub/placeholder functions MUST include deliberate failure mechanisms
   - Python: raise NotImplementedError, JS/TS: throw new Error, Go: panic
   - Referenced by: test-manager, all domain experts and workers

4. **diagram-standard.mdc** (alwaysApply: true)
   - 9 error-prevention checks for Mermaid diagrams
   - WCAG ≥4.5:1 contrast for classDef
   - Referenced by: All planning agents, documentation-updater

5. **test-organization.mdc** (alwaysApply: false)
   - tests/ directory structure (unit, integration, e2e, fixtures, helpers, mocks)
   - ≥90% line coverage target
   - Referenced by: test-manager

6. **documentation-rules.mdc** (alwaysApply: false)
   - Token budgets: Getting Started (1-2K), Reference (2-4K), Architecture (3-6K)
   - Hierarchical structure for >6K token docs, QRG blocks, CI validation
   - Referenced by: documentation-updater

7. **memory-system-standards.mdc** (alwaysApply: false)
   - Root CLAUDE.md: 80-100 lines (max 150), Subtree: 100-150 lines (max 150)
   - Adjacency heuristics for memory placement
   - Referenced by: memory-manager

### Layer 2: Guidance System (Instructions)

**6 Instruction Categories** (30+ .md files):

1. **Planning Instructions**
   - concept-checklist-template-instructions.md (5-phase structure: vision, discovery, refinement, categorization, deployment)
   - release-specification-template-instructions.md (objectives, scope, architecture, timeline)
   - issue-planning-methodology.md (atomic, sequential issues for TDD/BDD)
   - Referenced by: chain-concept-gen, chain-plan-init, chain-issue-builder

2. **Coordination Instructions**
   - orchestration-patterns.md (WHAT-not-HOW pattern, coordination strategies)
   - agent-scope-impact-matrix.md (agent expertise, scope, sequencing)
   - cross-agent-coordination-request-template-instructions.md (multi-agent impact analysis)
   - Referenced by: chain-plan-design-green, chain-plan-design-update, impact-change

3. **Assessment Instructions**
   - impact-assessment-qrg-format.md (summary, impacts, logic chains, execution plan, risks, testing)
   - gap-analysis-checklist.md (verification for assessment completeness)
   - change-planning-workflow.md (fact-based granular planning)
   - duo-creation-strategy.md, duo-pattern-extraction.md (command-agent duo creation)
   - Referenced by: impact-change, impact-change-review, plan-change, create-project-agent-command-duo

4. **GitHub Instructions**
   - gh-issue-workflow.md (creation, branch management, development, PR, review, merge, documentation)
   - issue-creation-workflow.md (GitHub issues from plans with sequencing)
   - issue-documentation-standards.md (work scope, folder scoping, agent patterns)
   - pr-review-criteria.md (chore PR review, refactoring detection)
   - Referenced by: chain-issue, chain-send-issues, new-issue, review-chore-prs

5. **Agent-Specific Instructions**
   - error-explorer-instructions.md (deep logic tracing methodology)
   - memory-manager-instructions.md (adjacency-oriented CLAUDE.md generation)
   - surgical-fix-methodology.md (targeted fixes preserving functionality)
   - seamless-update-methodology.md (updates appearing as originally written)
   - vite-ui-fix-workflow.md (iterative UI verification with Playwright)
   - test-manager-methodology.md (intentionally failing tests defining DONE)
   - Referenced by: Corresponding agents and orchestrating commands

6. **Template Instructions**
   - 25+ template-instruction pairs providing section-by-section guidance
   - Referenced by: All chain-* agents, update-plans, documentation workflows

### Layer 3: Structured Artifacts (Templates)

**7 Template Categories** (25+ .md/.yml files with Mustache {{PLACEHOLDER}} syntax):

1. **Planning Templates (8)**
   - release-specification-template.md (complete release definition with {{CONCEPT_ID}})
   - issue-plan-template.md (atomic issues with letter-suffix support: 004a, 004b)
   - concept-checklist-template.md (5-phase checklist, ≥95% confidence scoring)
   - issue-overview-template.md (Mermaid flowchart with issue dependencies)
   - user-requirements-template.md (prioritized features, user journeys)

2. **Coordination Templates (5)**
   - agent-template.md (300 lines max, YAML frontmatter)
   - command-template.md (simple: 250 lines, orchestration: 350-500 lines)
   - cross-agent-coordination-request-template.md (multi-agent coordination)
   - orchestration-workflow-template.md (phase definitions, quality gates)
   - agent-assignment-matrix-template.md (YAML with per-agent instructions)

3. **Architecture Templates (4)**
   - api-design-template.md (RESTful/GraphQL specs, OpenAPI integration)
   - database-schema-template.md (entity definitions, Mermaid ER diagrams)
   - infrastructure-plan-template.md (services, scaling, monitoring, disaster recovery)
   - service-integration-template.md (external services, rate limiting, retry policies)

4. **UI Design Templates (7)**
   - component-specs-template.md (component hierarchy, props, state, styling, accessibility)
   - design-system-template.md (tokens, color palette, typography, spacing)
   - design-config-notes-template.md (framework rationale, library usage)
   - prototype-recommendations-template.md (template/library selection with scoring)
   - deployment-decision-matrix-template.md (hosting choices, infrastructure requirements)

5. **UX Research Templates (4)**
   - user-flows-template.md (Mermaid flow diagrams, decision points)
   - personas-template.md (3-5 personas: demographics, goals, pain points)
   - wireframes-template.md (ASCII or Mermaid layouts)
   - interaction-patterns-template.md (pattern catalog, accessibility considerations)

6. **Pipeline Templates (1)**
   - github-actions-workflow-template.yml (build, test, lint, security scan, deploy stages)

7. **GitHub Templates (1)**
   - labels.yaml (issue label taxonomy: type, status, priority, area)

### Layer 4: Automation Utilities (Scripts)

**7 Script Categories** (10+ executable files):

1. **Activity Logging**
   - log-activity: `log-activity release <id> [sprint <id>] agent <name> "message"`
   - Used by: 15+ agents (backend-architect, frontend-developer, all workers, test-manager, framework-manager, pipeline-manager, troubleshooting-investigator, github-issue-creator, reviewerpr, analyzers)

2. **Terminal Management** (command-level only)
   - handoff-claude: `handoff-claude "/next-command" --app iterm --cwd /path`
   - exit-shell: Clean session termination
   - Used by: chain-concept-gen, chain-plan-init, chain-plan-design-green, chain-send-issues

3. **File Synchronization**
   - send-agents: Syncs agents from foreman to projects (.my_coding/agents/)
   - send-commands: Syncs commands from foreman to projects (.my_coding/commands/)
   - memory-update: Syncs CLAUDE.md files across project hierarchy
   - Used by: Project setup, foreman distribution, memory-manager

4. **Project Management**
   - foreman-update: Self-update mechanism (pulls latest, rebuilds docs, syncs)
   - foreman-templates: Template management (install, update, list)
   - Used by: chain-concept-gen (template install), maintenance workflows

5. **Document Conversion**
   - md-to-pdf: Markdown to PDF conversion with code blocks, tables, diagrams
   - Used by: Documentation export workflows

6. **Code Analysis**
   - score-candidate: Code quality scoring against standards
   - score-composition: Architectural composition evaluation
   - Used by: Code review workflows, architecture analyzers

7. **Utility Validation**
   - shared-util-check: DRY enforcement validator (identifies duplicate utility functions)
   - Used by: Code quality audits, code-restructurer

### Layer 5: Execution Layer (Agents)

**44 Agents in 4 Categories**:

1. **Chain Workflow Agents (13)**: Autonomous phase execution in release pipelines
2. **Duo Agents (10)**: Paired execution with orchestration commands
3. **Standalone Agents (20)**: Independent specialized capabilities
4. **Tandem Coordination (8 groups)**: Multi-agent workflows

(See agents-analysis.md for detailed breakdown)

### Layer 6: Orchestration Layer (Commands)

**24 Commands in 4 Categories**:

1. **Chain Commands (6)**: Release lifecycle orchestration
2. **Duo Commands (10)**: Command-agent pairs
3. **Standalone Commands (8)**: Independent utilities
4. **Tandem Patterns (10 groups)**: Multi-command workflows

(See commands-analysis.md for detailed breakdown)

## Complete Workflow Mapping

### Workflow 1: Release Delivery (Concept to Production)

**Phase 1: Concept Generation**
- **Command**: chain-concept-gen
- **Agents**: None directly (interactive Q&A with user)
- **Templates**: concept-qa-documentation-template.md, concept-checklist-template.md
- **Instructions**: concept-checklist-template-instructions.md, 5-phase methodology
- **Rules**: None enforced yet (concept phase)
- **Scripts**: foreman-templates install, log-activity release, handoff-claude
- **Quality Gate**: ≥95% confidence in requirements clarity
- **Output**: foreman/release-X/docs/00-planning/concept-qa.md, concept-checklist.md
- **Handoff**: `handoff-claude "/chain-plan-init"`

**Phase 2: Release Specification**
- **Command**: chain-plan-init
- **Agents**: None directly (transforms concept into spec)
- **Templates**: release-specification-template.md, user-requirements-template.md
- **Instructions**: release-specification-template-instructions.md
- **Rules**: None enforced yet (planning phase)
- **Scripts**: log-activity release, handoff-claude
- **Quality Gate**: Complete specification with deployment decision matrix
- **Output**: foreman/release-X/docs/00-planning/releaseX-specification.md, user-requirements.md
- **Handoff**: `handoff-claude "/chain-plan-design-green"`

**Phase 3: Design Phase (Multi-Agent Orchestration)**
- **Command**: chain-plan-design-green
- **Agents**: 7-agent sequence
  1. chain-prototype-researcher (templates/libraries/services analysis with scoring)
  2. chain-ux-researcher (user flows, personas, wireframes, interaction patterns)
  3. chain-ui-designer (component specs, design system, tokens)
  4. chain-system-architect (API design, database schema, infrastructure, service integration)
  5. Cross-agent coordination (impact analysis if needed)
  6. chain-whimsy-injector (delightful interactions, animations, personality copy)
  7. chain-issue-builder (atomic sequential issues for TDD/BDD)
- **Templates**: All UX, UI, architecture, planning templates (15+ templates)
- **Instructions**: UX research methodology, design system standards, architecture patterns, issue planning methodology, orchestration patterns
- **Rules**: diagram-standard.mdc (Mermaid validation), indirectly development-standards for issue planning
- **Scripts**: log-activity release, handoff-claude
- **Quality Gates**: Deployment decision approval, requirements review, issue plan completeness
- **Output**:
  - foreman/release-X/docs/01-prototyping/ (recommendations, deployment-decision-matrix)
  - foreman/release-X/docs/02-ux-research/ (user-flows, personas, wireframes, interaction-patterns)
  - foreman/release-X/docs/03-ui-design/ (component-specs, design-system, design-config-notes)
  - foreman/release-X/docs/04-architecture/ (api-design, database-schema, infrastructure-plan, service-integration)
  - foreman/release-X/docs/05-issue-planning/ (issue-plan.md, issue-map/, issue-overview.md)
- **Handoff**: `handoff-claude "/chain-send-issues"`

**Phase 4: GitHub Issue Creation**
- **Command**: chain-send-issues
- **Agents**: chain-issue-creator
- **Templates**: labels.yaml (GitHub label taxonomy)
- **Instructions**: issue-creation-workflow.md, gh-issue-workflow.md
- **Rules**: None directly
- **Scripts**: gh CLI (create issues), log-activity release, handoff-claude
- **Quality Gate**: All issues created with proper labels, sequencing, agent assignments
- **Output**: GitHub issues for release-X with corresponding foreman/release-X/docs/05-issue-planning/issue-map/*.yaml
- **Handoff**: `handoff-claude "/chain-issue 001"` (start with first issue)

**Phase 5: Issue Implementation (Per Issue, Repeating)**
- **Command**: chain-issue
- **Agents**: Multi-step orchestration
  1. Issue analysis & branch creation
  2. chain-issue-updater (planning, folder scoping, agent patterns)
  3. test-manager (RED phase - intentionally failing tests)
  4. Parent agents (backend-architect | frontend-developer | ai-engineer)
     - Parent launches workers in parallel (backend-worker, frontend-worker, ai-technician)
     - Bottom-up implementation: stubs → implementation → integration
  5. Type error resolution (troubleshooting-investigator if needed)
  6. troubleshooting-investigator (conditional on test failures)
  7. reviewerpr (Sandy Metz style PR review, refined improvements)
  8. User testing validation
  9. Merge with quality gates
  10. documentation-updater & memory-manager (post-merge)
- **Templates**: None directly (agents follow existing specs from Phase 3)
- **Instructions**: Sprint context, GitHub issue details, TDD methodology, test-manager methodology, gh-issue-workflow.md, pr-review-criteria.md
- **Rules**: development-standards.mdc (≤200 LOC, DRY, type safety), system-standards.mdc (12-factor), tdd-development.mdc (stub failures), test-organization.mdc (≥90% coverage), diagram-standard.mdc, memory-system-standards.mdc
- **Scripts**: gh issue comment, log-activity release, gh CLI (PR operations), memory-update
- **Quality Gates**:
  - RED phase complete (all tests failing intentionally)
  - GREEN phase complete (all tests passing)
  - REFACTOR phase complete (code meets standards)
  - Type errors resolved
  - ReviewerPR approval
  - User testing passed
  - All documentation updated
- **Output**:
  - Implemented feature in codebase
  - Updated tests (unit, integration, e2e)
  - Updated documentation
  - Updated CLAUDE.md memory files
  - Merged PR
- **Handoff**: Repeat for next issue until all complete

**Phase 6: Release Completion**
- **Command**: User-triggered final steps (deployment, monitoring setup)
- **Agents**: pipeline-manager (if CI/CD setup needed), framework-manager (if infrastructure changes needed)
- **Templates**: github-actions-workflow-template.yml
- **Instructions**: CI/CD pipeline patterns, multi-environment deployment
- **Rules**: system-standards.mdc (health checks, graceful shutdown)
- **Scripts**: log-activity release (final summary)
- **Quality Gate**: All issues complete, tests passing, documentation updated, deployment successful
- **Output**: Production-ready release

### Workflow 2: Code Change Implementation (Impact-Driven)

**Phase 1: Impact Assessment**
- **Command**: impact-change
- **Agents**: 3-7 impact-assessment agents (parallel)
  - 3 agents: Backend, Frontend, Tests
  - 5 agents: Backend API, Backend Services, Frontend Components, Frontend State, Tests
  - 7 agents: Backend API, Backend Services, Backend Data, Frontend Components, Frontend State, Frontend Integration, Tests
- **Templates**: None directly (agents analyze existing code)
- **Instructions**: impact-assessment-qrg-format.md (summary, impacts, logic chains, execution plan, risks, testing)
- **Rules**: development-standards.mdc (≤150 LOC targets), system-standards.mdc
- **Scripts**: None
- **Quality Gate**: Assessment synthesis complete, all logic chains documented
- **Output**: foreman/docs/impact_assessment/[timestamp]-[name]/_index.md (unified assessment)

**Phase 2: Gap Analysis**
- **Command**: impact-change (same command, sequential phase)
- **Agents**: None (command performs analysis)
- **Templates**: None
- **Instructions**: gap-analysis-checklist.md (verification for completeness)
- **Rules**: None directly
- **Scripts**: None
- **Quality Gate**: All gaps filled, assessment verified complete
- **Output**: Updated _index.md with gap fills

**Phase 2.5: Dead Code Detection**
- **Command**: impact-change (same command, conditional phase)
- **Agents**: Analysis agent (identifies code becoming dead)
- **Templates**: None
- **Instructions**: Dead code identification methodology
- **Rules**: None directly
- **Quality Gate**: Code marked dead only with 100% certainty
- **Output**: "Dead Code to Remove" section in _index.md (if applicable)

**Phase 3: User Approval**
- **Command**: impact-change (same command, approval gate)
- **Agents**: None (waits for user input)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: Explicit user approval ("approved", "proceed", "go ahead", "yes", "implement it")
- **Output**: Approval signal to proceed

**Phase 4: Surgical Implementation**
- **Command**: impact-change (same command, execution phase)
- **Agents**: surgical-edits (1-N instances based on complexity)
  - Simple (1-3 files): 1 agent
  - Moderate (backend+frontend): Sequential agents per phase
  - Complex (multiple chains): Parallel within phases, sequential across dependent phases
- **Templates**: None directly (agents follow assessment plan)
- **Instructions**: impact-change-orchestration.md (agent assignment strategies), surgical-fix-methodology.md
- **Rules**: development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Scripts**: None
- **Quality Gate**: All changes implemented, tests updated, no silent failures, backend before frontend sequencing respected
- **Output**: Modified codebase with passing tests

**Phase 5: UI Verification (Conditional)**
- **Command**: impact-change (same command, conditional phase)
- **Agents**: verify-ui (if frontend changes made)
- **Templates**: None
- **Instructions**: UI verification methodology, Playwright testing patterns
- **Rules**: None directly
- **Scripts**: None
- **Quality Gate**: All UI flows tested, backend logic validated, minimal fixes applied, tests passing
- **Output**: Verified UI changes with passing Playwright tests

**Phase 6: Final Summary**
- **Command**: impact-change (same command, reporting phase)
- **Agents**: None (command synthesizes results)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: All tests passing, error handling in place, UI verified if applicable
- **Output**: Comprehensive completion summary with metrics and quality checklist

### Workflow 3: Error Investigation and Resolution

**Phase 1: Error Exploration**
- **Command**: error-explorer
- **Agents**: Multiple error-explorer agents (parallel, one per error)
- **Templates**: None
- **Instructions**: error-explorer-instructions.md (deep logic tracing methodology)
- **Rules**: None (read-only analysis)
- **Scripts**: None
- **Quality Gate**: Root causes identified with 100% confidence
- **Output**: foreman/docs/error_investigation/[timestamp]-[name]/error-N-analysis.md

**Phase 2: Synthesis**
- **Command**: error-explorer (same command, synthesis phase)
- **Agents**: None (command synthesizes findings)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: Unified understanding of all error root causes
- **Output**: foreman/docs/error_investigation/[timestamp]-[name]/_summary.md

**Phase 3: User Review**
- **Command**: error-explorer (same command, reporting phase)
- **Agents**: None (presents findings to user)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: User reviews findings
- **Output**: Findings presentation

**Phase 4: Error Fixing**
- **Command**: error-fix
- **Agents**: surgical-fixes (iterative)
- **Templates**: None
- **Instructions**: surgical-fix-methodology.md
- **Rules**: development-standards.mdc, system-standards.mdc
- **Scripts**: None
- **Quality Gate**: All errors resolved, tests passing
- **Output**: Fixed codebase with passing tests

### Workflow 4: Memory Management

**Command**: manage-memory
**Modes**: Assessment mode (auto-fix validation issues) OR Directory mode (standard workflow)

**Assessment Mode** (when $1 is validation assessment file):
1. Read and parse assessment extracting issues by category
2. Execute fixes sequentially (prevents API concurrency):
   - **Structural Gaps**: Launch memory-manager (Workflow 2: Targeted Area Update) per directory
   - **Size Violations**: Launch memory-manager with content promotion/delegation instructions
   - **Navigation Gaps**: Launch memory-manager to cascade-update parent directories
   - **Dependency Violations**: Output manual edit instructions (no automation)
3. Wait for each agent completion before processing next

**Directory Mode** (standard workflow):

**Step 1**: Analyze complete directory tree
- Generate full file tree for $1 and descendants
- Identify hierarchy (depth levels from project root)
- Check which directories have existing CLAUDE.md
- Calculate nesting level for each directory (depth-scaled adjacency thresholds)

**Step 2**: Identify directories to process
- Apply depth-scaled thresholds from memory-system-standards.mdc:
  - Level 1-2: ≥3 files OR entrypoint OR logical architectural unit
  - Level 3-4: ≥5 files OR entrypoint OR logical architectural unit
  - Level 5+: ≥8 files OR entrypoint OR logical architectural unit
- Create processing list with depth information

**Step 3**: Process directories bottom-up (deepest-first)
- If subdirectory has subdirectories: Recursively run workflow for subtree
- If leaf directory: Launch memory-manager (Workflow 2: Targeted Area Update)
- Sibling subdirectories process in parallel

**Step 4**: Process parent directory
- If $1 has CLAUDE.md: Skip (already created/updated by cascade)
- Else determine appropriate workflow:
  - Children have CLAUDE.md AND parent doesn't meet thresholds: Workflow 3 (Parent Aggregation)
  - Else: Workflow 2 (Targeted Area Update)

- **Agents**: memory-manager (1-N instances based on hierarchy)
- **Templates**: None directly (agents generate CLAUDE.md content)
- **Instructions**: memory-manager-instructions.md (adjacency-oriented generation, hierarchy management)
- **Rules**: memory-system-standards.mdc (root: 80-100 lines max 150, subtree: 100-150 lines max 150, adjacency heuristics)
- **Scripts**: memory-update (syncs CLAUDE.md files across hierarchy after generation)
- **Quality Gate**: All CLAUDE.md files meet size limits, proper hierarchy, navigation complete
- **Output**: Hierarchical CLAUDE.md system across project

### Workflow 5: Dead Code Review

**Phase 1: Parallel Analysis**
- **Command**: dead-code-review
- **Agents**: Multiple dead-code-reviewer agents (parallel, one per codebase section)
- **Templates**: None
- **Instructions**: Dead code identification methodology
- **Rules**: None (analysis only)
- **Scripts**: None
- **Quality Gate**: Code marked as dead only with 100% certainty
- **Output**: foreman/docs/dead_code_review/[timestamp]/section-N-findings.md

**Phase 2: Synthesis**
- **Command**: dead-code-review (same command, synthesis phase)
- **Agents**: None (command synthesizes findings)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: Unified list of removable code
- **Output**: foreman/docs/dead_code_review/[timestamp]/_summary.md

**Phase 3: User Approval**
- **Command**: dead-code-review (same command, approval gate)
- **Agents**: None (waits for user confirmation)
- **Templates**: None
- **Instructions**: None
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: User explicitly approves removals
- **Output**: Approval signal

**Phase 4: Removal**
- **Command**: dead-code-review (same command, execution phase)
- **Agents**: surgical-edits (removes dead code)
- **Templates**: None
- **Instructions**: Surgical removal methodology
- **Rules**: development-standards.mdc (maintain functionality)
- **Scripts**: None
- **Quality Gate**: Dead code removed, all tests still passing
- **Output**: Cleaned codebase

**Phase 5: UI Verification (Conditional)**
- **Command**: dead-code-review (same command, conditional phase)
- **Agents**: verify-ui (if frontend code removed)
- **Templates**: None
- **Instructions**: UI verification methodology
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: UI still works correctly after removal
- **Output**: Verified UI functionality

### Workflow 6: Chore Management

**Phase 1: PR Review**
- **Command**: review-chore-prs
- **Agents**: pr-chore-reviewer (sequential, one PR at a time)
- **Templates**: None
- **Instructions**: pr-review-criteria.md (merge readiness, refactoring detection)
- **Rules**: None directly
- **Scripts**: gh CLI (PR operations)
- **Quality Gate**: PR assessed as merge-ready or needing refactoring
- **Output**: Merge decision OR foreman/docs/development/chores/[PR-name]-refactoring.md

**Phase 2: Refactoring Application**
- **Command**: apply-chore-refactors
- **Agents**: chore-refactorer (sequential, one doc at a time)
- **Templates**: None
- **Instructions**: Dependency migration patterns
- **Rules**: development-standards.mdc
- **Scripts**: None
- **Quality Gate**: All refactorings applied, tests passing
- **Output**: Updated codebase with dependency migrations

### Workflow 7: Plan Updates

**Phase 1: Research (Conditional)**
- **Command**: update-plans
- **Agents**: chain-update-researcher (if new services/templates needed)
- **Templates**: None
- **Instructions**: Update research methodology, focused evaluation
- **Rules**: None
- **Scripts**: None
- **Quality Gate**: User approval of research findings
- **Output**: foreman/release-X/docs/update-research/[timestamp]-findings.md

**Phase 2: Coordinated Updates**
- **Command**: update-plans
- **Agents**: chain-ux-updater + chain-ui-updater + chain-architecture-updater (parallel)
- **Templates**: All UX, UI, architecture templates (updates only)
- **Instructions**: seamless-update-methodology.md (updates appearing as originally written)
- **Rules**: diagram-standard.mdc
- **Scripts**: None
- **Quality Gate**: All updates seamless, no change references
- **Output**: Updated UX, UI, architecture documentation in foreman/release-X/docs/

## Cross-Component Integration Matrix

| Component | Rules | Instructions | Scripts | Templates | Agents | Commands |
|-----------|-------|--------------|---------|-----------|--------|----------|
| **Rules** | - | Enforcement guidelines | None | Standards validation | All implementation agents | All implementation commands |
| **Instructions** | Reference | - | Usage guidance | Filling guidance | Methodology | Workflow patterns |
| **Scripts** | None | Usage guidance | Composition | None | Activity logging (15+ agents), GitHub integration (10+ agents) | Terminal handoffs (4 chain commands), activity logging (all commands) |
| **Templates** | Validation | Filling guidance | None | - | Document generation (13 chain agents) | Workflow artifacts (6 chain commands) |
| **Agents** | Compliance | Methodology | Activity tracking, GitHub ops | Output generation | Tandem coordination (8 groups) | Execution (44 agents supporting 24 commands) |
| **Commands** | Enforcement | Orchestration | Terminal handoffs, logging | Workflow structure | Agent launching | Tandem patterns (10 groups) |

## Quality Enforcement Mechanisms

### Development Standards Enforcement
1. **≤200 LOC Limit**: code-restructurer monitors and splits files exceeding limit
2. **DRY Principle**: shared-util-check identifies duplicates, code-restructurer consolidates
3. **Type Safety**: All implementation agents enforce no "any" casting, no disabled checks
4. **Single Responsibility**: Agents create focused, single-concern files
5. **TDD Stub Failures**: tdd-development.mdc enforces deliberate failure mechanisms (raise NotImplementedError, throw new Error, panic)

### Test Coverage Standards
1. **≥90% Line Coverage**: test-organization.mdc targets, test-manager creates comprehensive tests
2. **TDD Cycle**: test-manager (RED), implementation agents (GREEN), code-restructurer (REFACTOR)
3. **Zero Silent Failures**: troubleshooting-investigator resolves all failures before merge
4. **Test Organization**: tests/ directory structure (unit, integration, e2e, fixtures, helpers, mocks)

### System Architecture Standards
1. **12-Factor Methodology**: framework-manager enforces environment-driven config
2. **Containerization**: system-standards.mdc requires stateless containers, one service per container
3. **Health Checks**: /healthz (liveness), /readyz (readiness) required
4. **Graceful Shutdown**: SIGTERM handling completing in-flight requests
5. **Logging Standards**: Logs to stdout/stderr only, no local files

### Documentation Quality Gates
1. **Token Budgets**: documentation-rules.mdc enforces Getting Started (1-2K), Reference (2-4K), Architecture (3-6K)
2. **Hierarchical Structure**: documentation-updater splits >6K token docs
3. **QRG Blocks**: Quick Reference Guides in _index.md files
4. **Diagram Validation**: diagram-standard.mdc enforces 9 error-prevention checks, WCAG ≥4.5:1 contrast
5. **CI Validation**: docs-lint job validates token counts, hierarchy, QRG presence, link validity

### Memory System Standards
1. **Size Limits**: memory-system-standards.mdc enforces root CLAUDE.md: 80-100 lines (max 150), subtree: 100-150 lines (max 150)
2. **Adjacency Heuristics**: Depth-scaled thresholds for memory placement
3. **Hierarchy Management**: memory-manager creates children when subdirectory has ≥3 files OR ≥150 LOC OR logical architectural unit
4. **Content Promotion**: Oversized parents create child CLAUDE.md files, delegate details
5. **Navigation Completeness**: Parents document all children in "Documented Subdirectories" section

## Audit Trail and Traceability

### Activity Logging
- **Script**: log-activity release <id> [sprint <id>] agent <name> "message"
- **Users**: 15+ agents (backend-architect, frontend-developer, ai-engineer, all workers, test-manager, framework-manager, pipeline-manager, troubleshooting-investigator, github-issue-creator, reviewerpr, analyzers)
- **Frequency**: Every significant step in agent workflows
- **Output**: Structured log files in release directory
- **Purpose**: Complete audit trail of agent/command execution history

### Concept-to-Code Traceability
- **{{CONCEPT_ID}}**: Embedded in release-specification-template.md linking concept → spec → design → issues → implementation
- **Issue Sequencing**: issue-plan.md maintains ordered list with dependencies
- **Letter-Suffix Insertions**: 004a, 004b maintain order when inserting issues near completed work
- **GitHub Integration**: Issues reference foreman docs, PRs reference issues, commits reference PRs

### Template-Driven Consistency
- **Mustache Placeholders**: {{PLACEHOLDER}} syntax enables programmatic population
- **Template-Instruction Pairing**: Every template has corresponding instruction file
- **Structured Outputs**: All agents produce standardized deliverables following templates
- **Version Control**: All artifacts in foreman/ directory under git control

### Quality Gates Documentation
- **Concept Phase**: ≥95% confidence score in concept-checklist.md
- **Design Phase**: Deployment decision approval, requirements review documented
- **Implementation Phase**: TDD cycle completion (RED-GREEN-REFACTOR), type error resolution, test passage documented in GitHub issue comments
- **Merge Phase**: ReviewerPR approval, documentation update confirmation, memory update confirmation documented in PR

## Next-Generation Integration Opportunities

### Claude Code Skills Potential
1. **Test Creation Skill**: Interactive TDD workflow with test-manager (progressive disclosure: acceptance criteria → test strategy → test generation)
2. **Architecture Analysis Skill**: Pattern detection from backend-architecture-analyzer and frontend-component-analyzer (allowed-tools: Read, Glob, Grep only)
3. **Issue Planning Skill**: Template-driven atomic issue breakdown with chain-issue-builder (YAML frontmatter: model: haiku for speed)
4. **Quality Review Skill**: Sandy Metz-style PR review from reviewerpr (allowed-tools: Read, Bash for gh CLI)
5. **Memory Management Skill**: Already implemented (/manage-memory) - could optimize with skill format

### Claude-Mem Memory Integration Potential
1. **Navigation Cache**: Root CLAUDE.md functional area mapping for agent routing (80% token reduction)
2. **Cross-Cutting Patterns**: Reusable workflows stored once (TDD cycle, parent-worker orchestration, sequential handoffs), referenced by all agents
3. **Issue Context Pre-Assembly**: GitHub cache for faster chain-issue starts (pre-load issue details, branch status, PR status)
4. **Variance Detection**: Lean hybrid model where agents embed only variance-critical values (~600-900 tokens), rest from memory
5. **Specialist Triggers**: Memory system suggests when specialist agents needed (error-explorer for complex bugs, dead-code-reviewer after refactoring)
6. **Template Context**: Templates stored in memory with dynamic placeholder injection (reduce duplication across 25+ templates)

### MCP Integration Potential
1. **GitHub Sync Service**: Cached issues/PRs/comments MCP (80% token reduction) used by github-issue-creator, reviewerpr, test-manager, all domain experts and workers
2. **Playwright Integration**: Already used by vite-frontend-fix and verify-ui (full MCP suite) - could extend to more UI testing scenarios
3. **Custom Foreman MCP**: Foreman-specific operations (log-activity, template management, memory sync, issue sequencing)
4. **Documentation Validation MCP**: Real-time docs-lint validation during documentation-updater execution
5. **Code Analysis MCP**: Real-time standards enforcement (LOC counting, DRY detection, type checking) during agent execution

### Hook Integration Potential (Claude-Mem)
1. **SessionStart Hook**: Load relevant CLAUDE.md hierarchy based on working directory
2. **UserPromptSubmit Hook**: Detect command invocation patterns, suggest relevant foreman commands
3. **PostToolUse Hook**: Capture activity logging events, store in claude-mem observations
4. **Summary Hook**: Generate release progress summaries, issue completion summaries
5. **SessionEnd Hook**: Persist session learnings to memory system, update CLAUDE.md if needed

## System Statistics

### Component Counts
- **Commands**: 24 (6 chain, 10 duo, 8 standalone orchestrating 10 tandem patterns)
- **Agents**: 44 (13 chain, 10 duo, 20 standalone forming 8 tandem groups)
- **Rules**: 7 (.mdc files: 4 always-apply, 3 contextual)
- **Instructions**: 30+ (.md files across 6 categories)
- **Templates**: 25+ (.md/.yml files across 7 categories)
- **Scripts**: 10+ (7 categories from logging to validation)

### Integration Statistics
- **Rules-Agents**: All 20+ implementation agents reference development-standards.mdc, system-standards.mdc
- **Instructions-Agents**: All 44 agents reference methodology instructions
- **Scripts-Agents**: 15+ agents use log-activity, 10+ use gh CLI
- **Templates-Agents**: 13 chain agents generate documents from templates
- **Commands-Agents**: All 44 agents launched by 24 commands
- **Tandem Patterns**: 8 agent groups, 10 command groups forming complex workflows

### Quality Metrics
- **LOC Limit**: ≤200 LOC per file (excluding whitespace/comments)
- **Test Coverage**: ≥90% line coverage target
- **Confidence Standard**: 100% certainty for analysis agents (error-explorer, dead-code-reviewer)
- **Concept Confidence**: ≥95% confidence before proceeding to specification
- **CLAUDE.md Size**: Root: 80-100 lines (max 150), Subtree: 100-150 lines (max 150)
- **Documentation Token Budgets**: Getting Started (1-2K), Reference (2-4K), Architecture (3-6K)
- **Diagram Accessibility**: WCAG ≥4.5:1 contrast for all Mermaid diagrams

### Workflow Statistics
- **Release Delivery**: 6 phases (concept → spec → design → issues → implementation → deployment)
- **Design Phase Agents**: 7 sequential agents (prototype → ux → ui → architecture → coordination → whimsy → issues)
- **Issue Implementation Steps**: 10 steps per issue (analysis → updater → test-manager → TDD → type resolution → troubleshooting → reviewpr → user testing → merge → documentation)
- **Impact Assessment Agents**: 3-7 parallel agents depending on complexity
- **Parent-Worker Pattern**: 3 parent-worker triads (backend, frontend, ai)

## Conclusion

Foreman represents a comprehensive software development orchestration system with tight integration across 6 component layers (rules, instructions, scripts, templates, agents, commands). The system enforces engineering standards through multiple mechanisms (rules enforcement, agent compliance, quality gates), maintains traceability through activity logging and concept-to-code linking, and enables sophisticated multi-agent coordination through tandem patterns. The architecture provides clear separation of concerns (standards → guidance → utilities → artifacts → execution → orchestration) while maintaining seamless integration across layers. Next-generation opportunities exist for Skills integration (test creation, architecture analysis, issue planning, quality review), Memory integration (navigation cache, variance detection, specialist triggers), MCP integration (GitHub sync, documentation validation, code analysis), and Hook integration (session lifecycle, context loading, activity capture).
