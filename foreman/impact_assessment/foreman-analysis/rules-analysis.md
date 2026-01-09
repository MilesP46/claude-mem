# Rules Analysis

## Overview
The foreman rules system enforces engineering standards across projects through `.mdc` (Markdown with YAML frontmatter) files. Each rule defines code constraints, patterns, and standards with optional glob-based file matching and a flag indicating whether the rule always applies or requires explicit invocation. Rules serve as the "what must be true" layer that instructions and agents must honor.

## Categories Identified
1. Development Standards - Code quality, architecture, implementation discipline
2. System Standards - Packaging, deployment, operability
3. Testing Standards - TDD, test organization, coverage requirements
4. Documentation Standards - Document structure, length budgets, QRG format
5. Logging & Error Handling - Log levels, output formats, exception handling
6. Memory System Standards - CLAUDE.md file size and structure requirements
7. Diagram Standards - Mermaid diagram formatting and validation

## Detailed Analysis

### Development Standards
**Rules in this category:**
- **development-standards.mdc** (alwaysApply: true): Enforces 20 core engineering principles:
  - **Requirement 5**: Files ≤150 LOC (excluding whitespace/comments), max 200 before mandatory split
  - **Requirement 10**: DRY principle - shared utilities over duplication
  - **Requirement 11**: Single-responsibility files (one concern per file)
  - **Requirement 12**: Modularity - clear boundaries, minimal coupling
  - **Requirement 13**: File headers with purpose, dependencies, entry points
  - **Requirement 14**: Inline comments for non-obvious logic
  - **Requirement 15**: Function documentation for functions >20 LOC
  - **Requirement 16**: Type safety - no casting to "any", no disabled checks
  - **Requirement 17**: Caching discipline - cache expensive operations
  - **Requirement 18**: Static imports over dynamic (better tree-shaking)
  - **Requirement 19**: Standardized error handling at trust boundaries
  - **Requirement 20**: Environment-driven configuration (12-factor methodology)

**Referenced by:**
- Commands: impact-change, impact-change-review, plan-change, chain-issue
- Agents: All implementation agents (backend-architect, frontend-developer, ai-engineer, workers, test-manager, troubleshooting-investigator, fix-issue, code-restructurer, surgical-fixes, framework-manager, pipeline-manager)

### System Standards
**Rules in this category:**
- **system-standards.mdc** (alwaysApply: true): Enforces infrastructure and deployment standards:
  - Containerized, stateless architecture (one service per container)
  - Managed relational databases (DATABASE_URL environment variable)
  - Health checks at `/healthz` (liveness) and `/readyz` (readiness)
  - Graceful SIGTERM handling (finish in-flight requests, close connections)
  - Logs to stdout/stderr only (no local log files)
  - Service discovery via environment variables (no hardcoded hosts)
  - Proper PORT and HOST binding from environment

**Referenced by:**
- Commands: impact-change, impact-change-review, chain-issue
- Agents: All implementation agents (same as development-standards), framework-manager, pipeline-manager

### Testing Standards
**Rules in this category:**
- **test-organization.mdc** (alwaysApply: false): Organizes tests under `tests/` directory:
  - **unit/**: Component/function tests in isolation
  - **integration/**: Cross-component/service tests
  - **e2e/**: Full user journey tests
  - **fixtures/**: Test data and setup
  - **helpers/**: Test utilities
  - **mocks/**: Test doubles
  - Enforces ≥90% line coverage target
  - Independent, parallel test execution
  - TDD cycles: red (failing test) → green (minimal code) → refactor (clean code)

- **tdd-development.mdc** (alwaysApply: true): TDD stub enforcement:
  - All stub/placeholder functions MUST include deliberate failure mechanisms
  - Python: `raise NotImplementedError("Method not implemented")`
  - JavaScript/TypeScript: `throw new Error("Not implemented")`
  - Go: `panic("not implemented")`
  - Guarantees red-phase test failures and TDD cycle compliance

**Referenced by:**
- Commands: chain-issue
- Agents: test-manager, all implementation agents (TDD cycle enforcement)

### Documentation Standards
**Rules in this category:**
- **documentation-rules.mdc** (alwaysApply: false): Enforces documentation quality:
  - Token budgets: Getting Started (1-2K), Reference (2-4K), Guides (2-4K), Architecture (3-6K)
  - Hierarchical structure for complex docs (split when >6K tokens)
  - QRG (Quick Reference Guide) blocks in `_index.md` files
  - Master TOC at `docs/README_TOC.md`
  - CI job `docs-lint` validates: token counts, hierarchy, QRG presence, link validity
  - Agents must run `docs-lint` before marking docs DONE

- **memory-system-standards.mdc** (alwaysApply: false): CLAUDE.md standards:
  - Root CLAUDE.md: 80-100 lines (max 150)
  - Subtree CLAUDE.md: 100-150 lines (max 150)
  - Create child CLAUDE.md when:
    - Subdir has ≥3 source files, OR
    - Subdir has ≥150 LOC total, OR
    - Subdir represents logical architectural unit
  - Adjacency heuristics for memory placement
  - LOC counting: exclude whitespace, comments, imports, exports
  - Import rules: @ syntax for cross-cutting concerns only (never rule files)
  - Content philosophy: summarize patterns, don't enumerate files

**Referenced by:**
- Commands: manage-memory, update-plans
- Agents: memory-manager, documentation-updater

### Logging & Error Handling
**Rules in this category:**
- **logging-standard.mdc** (alwaysApply: false): Structured logging requirements:
  - Mandates project-level logger service (no ad-hoc print/console.log)
  - Log levels: TRACE/DEBUG/INFO/WARN/ERROR/FATAL
  - JSON lines in production, colorized text locally
  - Prod logs route to central sink (OpenTelemetry → Loki)
  - Wrap entry-points with try/except, log stack-trace at ERROR level, re-raise custom AppError
  - Integration tests must assert no ERROR/FATAL lines on happy-path

**Referenced by:**
- Commands: Logging configuration workflows
- Agents: Error handling agents, observability setup

### Diagram Standards
**Rules in this category:**
- **diagram-standard.mdc** (alwaysApply: true): Mermaid diagram validation:
  - 9 error-prevention checks:
    1. Triple-backtick fencing (```mermaid)
    2. Unquoted relationship labels
    3. ASCII-only IDs (no special characters)
    4. Fixed orientation by type (TD/LR/TB)
    5. Version comments (`%% version:x.y – YYYY-MM-DD`)
    6. No trailing spaces
    7. No class on subgraph declaration
    8. Proper syntax compliance
    9. WCAG ≥4.5:1 contrast for classDef

  - Diagram catalog: flowchart TD/LR, graph TD, gantt, sequenceDiagram, erDiagram
  - Mandatory classDef definitions with accessibility-compliant colors
  - Styling tokens: PRIMARY/#005DAD, ACCENT1/#F4A300, SUCCESS/#0F8F57, GREY variants
  - CI validation enforces all checks

**Referenced by:**
- Commands: Issue planning, documentation workflows
- Agents: All planning agents (visual documentation requirement), documentation-updater

## Pattern Summary

**Always-Apply vs Contextual**:
- **Always Apply (3 rules)**: development-standards, system-standards, tdd-development, diagram-standard
- **Contextual (4 rules)**: test-organization, documentation-rules, memory-system-standards, logging-standard

**CI Enforcement**: Rules trigger CI validation gates:
- `docs-lint` for documentation token counts, hierarchy, QRG, links
- Diagram CI for Mermaid syntax, contrast, version tracking
- Test coverage gates for ≥90% line coverage

**Multi-Level Enforcement**:
- Code review: File length (≤200 LOC), typing (no "any"), modularity
- Test time: TDD stub failures, coverage thresholds
- Runtime: Logging patterns, error handling, graceful shutdown
- CI/CD: Documentation validation, diagram validation, test execution

**Critical Standards Hierarchy**:
- **Mandatory (alwaysApply: true)**: Code length ≤200 LOC, type safety, TDD stub failures, system architecture (12-factor, containerization), diagram standards
- **Highly Recommended**: Documentation length budgets, CLAUDE.md organization, test organization ≥90% coverage
- **Contextual**: Logging/error patterns (required at integration points), diagram standards (when visual documentation needed)

**Integration Points**: Rules referenced across:
- 10+ foreman planning/coordination documents
- All implementation agents (development + system standards)
- Test workflows (TDD, test-organization)
- Documentation pipelines (docs-lint, memory-manager)
- CI/CD validation (diagram, docs, coverage gates)

**Guidance Over Automation**: Rules provide guardrails; agents interpret and apply contextually based on code analysis and project needs.
