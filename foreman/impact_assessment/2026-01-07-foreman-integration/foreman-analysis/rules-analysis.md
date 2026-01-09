# Rules Analysis

## Overview

The foreman project maintains a centralized rules system in `/Users/miles/.my_coding/rules/` containing 8 active rule files in `.mdc` (Markdown Configuration) format. These rules define standards for development practices, system architecture, documentation, testing, and memory management. Rules use frontmatter metadata to control their application scope via `alwaysApply` (always loaded) or `globs` (pattern-matched loading).

## Rule Categories

### Development Standards
- `development-standards.mdc` - Core engineering and coding standards (alwaysApply: true)
- `tdd-development.mdc` - Test-driven development practices (alwaysApply: true)

### System Standards
- `system-standards.mdc` - System architecture and packaging standards (alwaysApply: true)
- `logging-standard.mdc` - Logging and error handling patterns (alwaysApply: false)

### Documentation Standards
- `documentation-rules.mdc` - Documentation structure and quick-reference guides (alwaysApply: false, globs: docs/**/**/*.md)
- `diagram-standard.mdc` - Mermaid diagram creation standards (alwaysApply: false)

### Testing Standards
- `test-organization.mdc` - Test directory structure and naming conventions (alwaysApply: false)

### Memory System Standards
- `memory-system-standards.mdc` - CLAUDE.md generation and maintenance standards (alwaysApply: false)

## Rules Identified

### development-standards.mdc
- **Location**: `/Users/miles/.my_coding/rules/development-standards.mdc`
- **Purpose**: Defines core engineering principles, code structure requirements, documentation standards, code quality guidelines, and performance considerations for all development work.
- **Referenced By**:
  - **Most agents** (25+ agents): frontend-developer, backend-worker, backend-architect, ai-engineer, ai-technician, test-manager, frontend-worker, troubleshooting-investigator, chain-issue-creator, chain-issue-updater, chain-issue-builder, framework-manager, pipeline-manager, github-issue-creator, surgical-fixes, vite-frontend-fix, fix-issue
  - **Commands**: chain-issue, fix-issue, error-fix, error-explorer, vite-UI-fix, plan-change, restructure-docs
- **Key Standards**:
  - DRY principle, single-responsibility, modularity
  - **Code length**: <=150 LOC per file (buffer <=200), split logic if exceeded
  - **File headers**: Purpose, author, last update required
  - **Function documentation**: Docstrings for functions >20 LOC
  - **Style guides**: Follow language-native conventions (PEP 8, Prettier, gofmt)
  - **Naming**: Explicit names over abbreviations
  - **Typed integrity**: No bypassing type systems (e.g., casting to "any")
  - **Algorithm complexity**: Avoid O(n^2)+ in hot paths
  - **Caching**: Memoization for expensive pure functions
  - **Dynamic imports**: Avoid unless required for modular runtime
  - **Error handling**: No redundant guards or broad try/catch
  - **Code cleanliness**: No broad linting suppressions
  - **Future code**: Prefix with `_` and add TODO comments
  - **Environment config**: All config from environment variables (12-factor)
- **Enforcement**:
  - Agents validate code meets LOC limits and standards
  - Referenced as `@foreman/rules/development-standards.mdc` in agent/command files
  - Compliance checks in agent completion criteria
- **Dependencies**: None (foundational rule)

### system-standards.mdc
- **Location**: `/Users/miles/.my_coding/rules/system-standards.mdc`
- **Purpose**: Defines system architecture, packaging, deployment, and operational standards for production systems.
- **Referenced By**:
  - **Agents**: chain-system-architect, chain-ui-designer, chain-prototype-researcher, backend-architect, backend-worker, frontend-worker, ai-technician, ai-engineer, chain-issue-creator, chain-issue-updater, chain-issue-builder, framework-manager, pipeline-manager, github-issue-creator, troubleshooting-investigator, fix-issue
  - **Commands**: chain-issue, fix-issue, vite-UI-fix
- **Key Standards**:
  - **One container = one service**: No multi-duty images
  - **Stateless app containers**: Persist data in external stores or volumes only
  - **Managed primary database**: Use managed relational DB from day one via `DATABASE_URL`
  - **Health checks**: Map to `/healthz` and `/readyz`
  - **Graceful shutdown**: Handle `SIGTERM` to drain and exit cleanly
  - **Logs to stdout/stderr**: No local file logging
  - **Network binding**: Respect `PORT`/`HOST` env vars, no localhost-only bindings
- **Enforcement**:
  - Architecture agents must follow standards
  - Referenced with "CRITICAL IMPORTANCE" in chain-system-architect
- **Dependencies**: None (foundational rule)

### tdd-development.mdc
- **Location**: `/Users/miles/.my_coding/rules/tdd-development.mdc`
- **Purpose**: Enforces Test-Driven Development (TDD) practices by requiring stub functions to fail until implemented.
- **Referenced By**:
  - **Agents**: frontend-developer, backend-architect, backend-worker, frontend-worker, ai-engineer, ai-technician, test-manager
  - **Commands**: Referenced indirectly through agents
- **Key Standards**:
  - All stubs must include deliberate failure mechanisms:
    - Python: `raise NotImplementedError`
    - JavaScript/TypeScript: `throw new Error('NotImplemented')`
    - Go: `panic("not implemented")`
  - Guarantees meaningful red tests in TDD cycle
- **Enforcement**:
  - Agents follow TDD discipline per this rule
  - Test stubs must fail until implementation complete
- **Dependencies**: References `test-organization.mdc` for test stub organization

### test-organization.mdc
- **Location**: `/Users/miles/.my_coding/rules/test-organization.mdc`
- **Purpose**: Defines test directory structure, categorization, naming conventions, and quality standards.
- **Referenced By**:
  - **Agents**: test-manager, chain-issue-updater
  - **Commands**: chain-issue (via agents)
- **Key Standards**:
  - **Directory structure**:
    ```
    {{PROJECT_ROOT}}/tests/
    ├── unit/           # Pure logic, fast, isolated
    ├── integration/    # I/O, external dependencies
    ├── e2e/            # End-to-end user journeys
    │   ├── critical/   # Must-not-break scenarios
    │   └── extended/   # Extended coverage
    ├── fixtures/       # Test data
    ├── helpers/        # Test utilities
    └── mocks/          # Mock implementations
    ```
  - **Test categorization**: Unit (pure logic), Integration (I/O), E2E (user journeys)
  - **Naming conventions**:
    - Files: `test_<component>.py` or `<component>_test.py`
    - Functions: `test_<behavior>_<condition>_<expected_result>`
    - Classes: `Test<ComponentName>`
  - **Coverage target**: >=90% line coverage
  - **Test independence**: Run independently and in parallel
- **Enforcement**: Agents organize tests per this structure
- **Dependencies**: Referenced by `tdd-development.mdc`

### documentation-rules.mdc
- **Location**: `/Users/miles/.my_coding/rules/documentation-rules.mdc`
- **Purpose**: Defines documentation structure, length budgets, Quick Reference Guide (QRG) format, and hierarchical organization requirements.
- **Referenced By**:
  - **Commands**: plan-change, restructure-docs
  - **Agents**: documentation-updater (indirectly)
- **Key Standards**:
  - **Token limits by document class**:
    | Doc Class | Target | Hard cap | Action if over |
    |-----------|--------|----------|----------------|
    | Micro-guide/README | <=1,000 | 1,500 | Keep flat file |
    | Standard spec/ADR | <=3,000 | 4,000 | Split into subsections |
    | Complex manual | <=5,000 | 6,000 | Enforce hierarchy |
  - **Hierarchy requirements** (docs >3,000 tokens):
    - Reside in `docs/<domain>/<topic>/`
    - Split into child files (`00-intro.md`, `01-design.md`, ...)
    - Include `_index.md` as subtree TOC
  - **Quick Reference Guide (QRG)**: Every `_index.md` must have:
    - Purpose (one sentence)
    - Key entrypoints
    - Related docs
    - Master TOC link to `docs/README_TOC.md`
  - **Master TOC**: `docs/README_TOC.md` aggregates all QRG paths
- **Enforcement**:
  - CI job `docs-lint` validates token counts, hierarchy, QRG blocks
  - Foreman and BG-DOC agents must run `docs-lint` before marking DONE
- **Dependencies**: None

### diagram-standard.mdc
- **Location**: `/Users/miles/.my_coding/rules/diagram-standard.mdc`
- **Purpose**: Defines Mermaid diagram creation standards including syntax rules, visual styling, and validation requirements.
- **Referenced By**:
  - **Commands**: chain-issue, restructure-docs
  - **Agents**: documentation-updater
- **Key Standards**:
  - **9 error-avoidance checks**:
    1. Fence diagrams first in triple-backtick blocks
    2. Keep relationship labels unquoted in erDiagram
    3. ASCII-only node IDs (`[A-Za-z0-9_]+`)
    4. Fixed orientation by diagram type
    5. Version comment first (`%% version:x.y - YYYY-MM-DD`)
    6. Validate before commit via CI linter
    7. No `:::` class suffix on subgraph declarations
    8. Apply classes after `end` keyword for subgraphs
    9. No trailing spaces in class definitions
  - **Diagram type orientations**:
    | Type | Notation | Orientation |
    |------|----------|-------------|
    | Business Process | flowchart TD | TD |
    | Component | graph TD | TD |
    | Deployment | flowchart LR | LR |
    | Sequence | sequenceDiagram | LR |
    | ERD | erDiagram | TB |
  - **Styling tokens**: PRIMARY (#005DAD), ACCENT1 (#F4A300), SUCCESS (#0F8F57), etc.
  - **Mandatory class definitions**: component, external, database, process, decision, action, critical, error, success, note
  - **WCAG contrast**: >=4.5:1 for text/fill color pairs
- **Enforcement**:
  - CI linter validates diagrams
  - `make validate-diagrams` for local validation
  - Templates in `{{FOREMAN_ROOT}}/templates/diagram_templates/`
- **Dependencies**: None

### logging-standard.mdc
- **Location**: `/Users/miles/.my_coding/rules/logging-standard.mdc`
- **Purpose**: Defines universal logging and error handling patterns.
- **Referenced By**:
  - **Agents**: backend-architecture-analyzer
  - Referenced in `development-standards.mdc` as global standard to adhere to
- **Key Standards**:
  - **Logging**:
    - Use project-level logger package (never ad-hoc print/console.log)
    - Levels: TRACE (dev only), DEBUG, INFO, WARN, ERROR, FATAL
    - JSON lines in prod; colorized text locally
    - Route prod logs to central sink (OpenTelemetry -> Grafana Loki)
  - **Error handling**:
    - Wrap entry-points with try/except
    - Log stack-trace at ERROR level
    - Re-raise custom `AppError`
    - Avoid silencing exceptions; log at WARN if necessary
  - **Testing**: Integration tests must assert no ERROR/FATAL lines for happy-path
- **Enforcement**: Patterns referenced for implementation guidance
- **Dependencies**: Supports `development-standards.mdc` requirement 17

### memory-system-standards.mdc
- **Location**: `/Users/miles/.my_coding/rules/memory-system-standards.mdc`
- **Purpose**: Defines standards for CLAUDE.md file generation and maintenance across the codebase, including size limits, adjacency heuristics, and content philosophy.
- **Referenced By**:
  - **Commands**: manage-memory
  - **Agents**: memory-manager
- **Key Standards**:
  - **Size limits**:
    | File Type | Target | Maximum |
    |-----------|--------|---------|
    | Root CLAUDE.md | 80-100 lines | 100 lines |
    | Subtree CLAUDE.md | 100-150 lines | 150 lines |
    | Cross-cutting CLAUDE.md | 100-150 lines | 150 lines |
  - **Adjacency heuristics** (create child CLAUDE.md when):
    - Subdir has >=3 source files (primary rule)
    - Has entrypoint + >=2 additional files
    - >=150 LOC total across source files
    - Has config or test harness
    - Contains `CLAUDE: local` tag
    - Is logical architectural unit
  - **Content philosophy**:
    - Summarize, don't enumerate
    - Essential over exhaustive (3-5 key items per section)
    - Navigation over documentation
    - Bottom-up generation (deepest first)
  - **Import rules**:
    - `@` syntax triggers AI context loading (use sparingly)
    - Cross-cutting CLAUDE.md only in `## Dependencies` section
    - Root CLAUDE.md: ZERO `@` syntax
    - Plain text paths for structural references
  - **Secret safety**: Never include API keys, tokens, passwords
- **Enforcement**: memory-manager agent applies these standards
- **Dependencies**: None

## Cross-Rule Patterns

### 1. Application Scope Classification
- **alwaysApply: true** rules (3): `development-standards`, `system-standards`, `tdd-development`
  - These are foundational and apply to all code changes
- **alwaysApply: false** rules (5): `documentation-rules`, `diagram-standard`, `logging-standard`, `test-organization`, `memory-system-standards`
  - Loaded contextually via globs or explicit reference

### 2. Reference Pattern
All rules use `@foreman/rules/<rule-name>.mdc` or `@rules/<rule-name>.mdc` syntax for cross-referencing:
- Most frequently referenced: `development-standards.mdc` (25+ agents, 10+ commands)
- Second most referenced: `system-standards.mdc` (15+ agents)
- TDD pair: `tdd-development.mdc` references `test-organization.mdc`

### 3. Enforcement Hierarchy
1. **CI/Automation**: `docs-lint`, `make validate-diagrams`
2. **Agent verification**: Completion criteria check rule compliance
3. **Explicit requirements**: Numbered requirements in `development-standards.mdc` (e.g., requirement 5, requirement 20)

### 4. LOC Philosophy
Consistent emphasis on file length limits:
- Code files: <=150 LOC (buffer <=200)
- Root CLAUDE.md: <=100 lines
- Subtree CLAUDE.md: <=150 lines
- Documentation: Token-based limits by class

### 5. Dependency Chain
```
development-standards.mdc
    └── logging-standard.mdc (supports requirement 17)

tdd-development.mdc
    └── test-organization.mdc (test stub organization)

documentation-rules.mdc
    └── diagram-standard.mdc (referenced for diagram creation)
```

## Key Insights

### 1. Three Core Pillars
The rules system establishes three foundational standards that always apply:
- **Code quality**: `development-standards.mdc`
- **Architecture**: `system-standards.mdc`
- **Testing discipline**: `tdd-development.mdc`

### 2. Agent-Centric Enforcement
Rules are primarily enforced through agent instructions rather than automated tooling. Agents are instructed to "follow all standards in @foreman/rules/development-standards.mdc" with "CRITICAL IMPORTANCE" markers.

### 3. Documentation as First-Class Concern
Three rules address documentation: `documentation-rules.mdc`, `diagram-standard.mdc`, and `memory-system-standards.mdc`. This reflects the AI-centric nature of the foreman system where documentation quality directly impacts agent effectiveness.

### 4. 12-Factor App Alignment
`system-standards.mdc` strongly aligns with 12-factor app methodology:
- Config from environment
- Stateless processes
- Disposable containers
- Logs as event streams
- Port binding

### 5. Token/LOC Awareness
Multiple rules show awareness of AI context limitations through explicit token/line count budgets:
- Documentation token limits (1,000-6,000)
- CLAUDE.md line limits (100-150)
- Code LOC limits (150-200)

### 6. Missing/Referenced-but-Absent Rules
Some agents reference rules that do not exist in the current `/rules/` directory:
- `@foreman/rules/requested/secret-management.mdc`
- `@foreman/rules/requested/dependency-management.mdc`
- `@foreman/rules/requested/performance-general.mdc`
- `@foreman/rules/requested/coding-standards-general.mdc`
- `@foreman/rules/always/engineering-standards.mdc`
- `@foreman/rules/requested/secure-by-default.mdc`

These appear to have been consolidated or archived (found in `archive/rules/`).
