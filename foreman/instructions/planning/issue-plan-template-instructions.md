# Issue Plan — Release {{X}} — **Instructions**

- **Purpose:** Create GitHub-ready issue descriptions with prior art references.
- **Editing rules:** Keep headings intact; write concise, actionable content; include specific file references for prior art.

## How to use

1. **Create this file alongside issue-map/ folder** during chain-issue-builder execution.
2. **Review all planning documents** to understand which ConceptIDs are being implemented.
3. **Analyze prior art** from prescribed reading files and identify relevant references.
4. Fill in all placeholders and required sections including prior art references.
5. **Map each issue to ConceptIDs** it delivers using the "Delivers Concepts" field.
6. **Include specific file paths and line numbers** for all prior art references.
7. **Follow issue sequencing protocol** for consistent issue creation.
8. Keep **structure** and headings unchanged unless explicitly allowed.
9. Commit the completed file to the release docs.

## Issue Planning Principles

### Core Approach

**Evidence-Based Planning**: All issue planning must be grounded in existing documentation and patterns
**MVP-First Planning**: Identify minimum viable functionality and defer enhancements  
**User-Facing Priority**: Prioritize customer value over internal tooling
**Measurable Delivery**: Each issue must deliver verifiable, testable value

### Issue Sequencing Strategy

**Capability-First Approach**: Group related work into end-to-end testable capability blocks
**Phase-Based Sequencing**: Development work (phase:dev) comes before build work (phase:build)
**Early Context Setup**: Establish project fundamentals and context scoping in first issues

### Quality Standards

**TDD/BDD Discipline**: Every issue must include appropriate test strategy
**Coverage Maintenance**: Ensure code coverage is maintained or improved  
**Risk Management**: Include rollback plans and feature flag strategies as needed

### Issue Creation Standards

**Smart Grouping Principles** - Each issue must:

- Deliver a **capability block** with end-to-end verifiability
- Represent a **user or developer story**, not a micro-task
- Have clear preconditions and postconditions
- Be deterministic done (tests green, coverage maintained, docs updated)
- Allow internal sub-checklists for AI to self-sequence

## Issue Sequencing Protocol

### Issue 001: Project Fundamentals (Required)

For all projects, ALWAYS create Issue 001 "Project Fundamentals/Test Framework Initialization" covering:

**Template Completion:**

- `{{Issue 001 Title}}` → "Project Fundamentals/Test Framework Initialization"
- `{{CONCEPT-IDS}}` → [PROJECT-FOUNDATION]
- `{{What to build/fix}}` → "Establish project fundamentals including template alignment, local environment setup, error handling, and logging infrastructure" → "Initialize **Rails mixed** testing infra — RSpec + Cucumber, directory mapping, coverage, parallelization, headless driver, WebMock/VCR." → "Analyze codebase structure and establish error handling conventions, logging standards, and context boundaries for efficient development"
- `{{What's broken, needed, or missing}}` → "New project needs foundational infrastructure for development and needs robust testing infrastructure for TDD/BDD development" → "Need specific folder locations and context restrictions for efficient agent operation"
- `{{Explicitly out of scope}}` → "Feature implementation, business logic"
- `{{agents}}` → "framework-manager" → "pipeline-manager" → "chain-issue-updater"
- `{{tasks}}` → "Set up project structure, dependencies, foundational systems, initial test infrastructure, error handler, logging" → "CI jobs for bundle exec rspec, bundle exec cucumber (and Playwright), including the red-mode gate (continue-on-error for draft / tdd:red) If greenfield, **NO** build/deployment tests." → "Analyze structure and add folder scoping to all subsequent issues"
- `{{Dependencies and additional notes}}` → "Foundation for all subsequent development work"

**Acceptance Criteria Content:**

- Template alignment verified and documented
- Local startup commands functional
- Global error handler implemented
- Structured logging system operational (distinct from log-activity)
- Repository created and initial push completed
- `.github/workflows/*.yml` with RSpec + Cucumber + Playwright jobs
- Codebase structure analyzed and documented
- Specific folder locations added to subsequent issues
- Context boundaries established and enforced
- **Phase: dev**

**Prior Art Content:**

- Include relevant context management patterns and folder structure examples as appropriate

### Phase Sequencing (Critical)

- **All development issues MUST use phase:dev**
- **Build/deployment issues MUST use phase:build and come at the END**
- This prevents unnecessary build tests during development
- **Test framework must be established before feature development begins**

## Agent Selection Guidelines

### Default Capability Agents

- **test-manager** — Preflight red-phase tests from GH issue
- **frontend-developer** - UI components, user interactions, visual elements
- **backend-architect** - APIs, services, data layer, business logic
- **ai-engineer** - ML models, AI integrations, evaluation frameworks
- **framework-manager** - Template alignment, dependency management, tooling, test framework setup
- **pipeline-manager** - CI/CD Pipline Initialization/Retrofitting
- **documentation-updater** - Documentation Updates
- **chain-issue-updater** - Updates individual issue files and GH issue statuses; adds folder scoping

### Agent Sequencing Patterns

- Place analysis agents before implementation agents
- Run TDD agents before BDD agents
- Execute infrastructure changes before feature work

### Scenario-Specific Patterns

**UI Features:**

1. **test-manager** (Cucumber + RSpec reds)
2. **frontend-developer** (implement UI + step defs; MCP Playwright for UI robustness)
3. **backend-architect** (if API work)
4. **pipeline-manager** (path filters/updates if needed)

**API Endpoints:**

1. **test-manager** (request + unit reds)
2. **backend-architect** (implement)
3. **frontend-developer** (wire UI if applicable; MCP Playwright to confirm)

**Third-Party Integrations:**

1. **test-manager** (adapter contract reds + WebMock/VCR)
2. **backend-architect** (adapter + error handling)
3. **pipeline-manager** (secret management/testing jobs)

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

### Basic Issue Placeholders

- `{{X}}` — provide release number; do **not** leave braces.
- `{{S}}` — provide sprint number; do **not** leave braces.
- `{{Issue 001 Title}}` — provide "Project Fundamentals/Test Framework Setup" or similar foundational title; do **not** leave braces.
- `{{Feature Issue Title}}` — provide concise, action-oriented feature title; do **not** leave braces.
- `{{feat}}` — provide issue type (feat|fix|chore|refactor); do **not** leave braces.
- `{{chore}}` — provide issue type for infrastructure work; do **not** leave braces.
- `{{P0}}` — provide critical priority for foundational work; do **not** leave braces.
- `{{P1}}` — provide high priority (P0|P1|P2); do **not** leave braces.
- `{{todo}}` — provide status (todo|in-progress|blocked|review|done); do **not** leave braces.
- `{{dev}}` — provide phase (dev|build|deploy); do **not** leave braces.
- `{{devex}}` — provide area for developer experience work; do **not** leave braces.
- `{{api}}` — provide area for API/backend work; do **not** leave braces.
- `{{agent1 → agent2}}` — provide agent sequence; do **not** leave braces.
- `{{agent}}` — provide single agent name; do **not** leave braces.
- `{{What to build/fix}}` — provide one paragraph summary; do **not** leave braces.
- `{{What's broken, needed, or missing}}` — provide problem description; do **not** leave braces.
- `{{Explicitly out of scope}}` — provide non-goals; do **not** leave braces.
- `{{Testable outcomes using Given/When/Then or bullet list}}` — provide acceptance criteria; do **not** leave braces.
- `{{task}}` — provide specific task description; do **not** leave braces.
- `{{Dependencies and additional notes}}` — provide dependency references and notes; do **not** leave braces.
- `{{CONCEPT-IDS}}` — provide ConceptID list (e.g., CONCEPT-001, CONCEPT-002); do **not** leave braces.

### Prior Art Placeholders

- `{{@foreman/templates/path/file.md}}` — provide specific template file path; do **not** leave braces.
- `{{@foreman/release-{{X}}/docs/path/file.md}}` — provide specific documentation file path; do **not** leave braces.
- `{{X-Y}}` — provide specific line numbers (e.g., 15-32); do **not** leave braces.
- `{{Description of how this template/pattern applies}}` — provide brief explanation of relevance; do **not** leave braces.
- `{{Description of relevant existing implementation}}` — provide brief explanation of existing code; do **not** leave braces.
- `{{Description of relevant design patterns or specifications}}` — provide brief explanation of design reference; do **not** leave braces.

## Section‑by‑section guidance

- **Index** — Replace ALL placeholders with concrete values per the guidance above. Include the Phase column with proper dev/build/deploy sequencing. The 'GH Issue #' column will be filled after sending to GitHub.

- **Issues** — Replace ALL placeholders in each issue section using the specific guidance provided for Issue 001 and general feature guidance for subsequent issues.

- **001** — Use the specific **Template Completion** for **Project Fundamentals/Test Framework Initialization** guidance provided above the first issue. Follow the exact placeholder-to-content mappings.

- **002+** — For feature issues, replace placeholders with specific feature content following the same pattern as the required issues.

- **Prior Art & References** — **CRITICAL**: See "Prior Art Analysis Protocol" section below for complete guidance.

## Prior Art Analysis Protocol

**Purpose**: This section provides content that will be included directly in GitHub issues. Each issue must include comprehensive prior art references to guide implementation.

### Prior Art Identification Process

1. **Review prescribed reading** for patterns, examples, and existing solutions
2. **Identify relevant templates, patterns, and code examples** from architecture docs
3. **Find related UI/UX patterns** from research and design docs
4. **Locate existing implementations** that can guide the new work

### Required Prior Art Categories

Each issue must include these three categories with specific file paths and line numbers:

- **Templates & Patterns**: Existing templates that can be adapted
- **Existing Code Examples**: Similar implementations or established patterns
- **Design References**: UI/UX specifications, component designs, or interaction patterns

### Documentation Format & Quality Standards

For each issue, include this exact structure:

```markdown
**Prior Art & References**

**Templates & Patterns:**

- File: `@foreman/templates/ui-design/component-template.md` (lines 15-32)
  - Component structure pattern for authentication forms

**Existing Code Examples:**

- File: `@foreman/release-{{X}}/docs/03-architecture/api-design.md` (lines 45-67)
  - Authentication endpoint pattern

**Design References:**

- File: `@foreman/release-{{X}}/docs/02-ui-design/component-specs.md` (lines 89-112)
  - Login component specifications and behavior patterns
```

### File Reference Requirements

- **Specific file paths**: Use exact paths from @foreman/ root
- **Line number ranges**: Provide specific line ranges (e.g., lines 15-32) when possible
- **Brief descriptions**: Explain how the prior art relates to the current issue
- **Relevance**: Only include references that directly help with implementation
- **One reference per bullet point**
- **Start with most relevant references**
- **Group by category for clarity**
- **Avoid duplicate references across issues**

## Relationship with issue-map.yaml

- **issue-plan.md**: Contains GitHub-ready content with prior art (references only) for `/chain-send-issues`
- **issue-map/ folder**: Contains individual YAML files with structured data for agent orchestration and status tracking
- **No duplication**: Prior art lives only in issue-plan.md; individual issue files reference it
- **Complementary**: Both files created simultaneously by chain-issue-builder

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **may** add additional prior art categories if needed.
- You **must not** delete or rename top‑level headings unless instructed.
- You **must not** duplicate prior art in individual issue files.
- Keep cross‑references and file paths accurate.

## Quality Enforcement Guidelines

**Per Issue Requirements:**

- TDD/BDD strategy documented in Acceptance Criteria
- Coverage requirements specified (≥90% for critical components)
- Rollback plan documented for deployment-related issues
- Feature flag requirements specified for phased rollouts
- ConceptIDs mapped back to concept-checklist.md
- **Agent Documentation**: Every issue must include agent completion tracking requirement

**GitHub Integration Standards:**

- Apply labels from @foreman/templates/github/labels.yaml
- Add concept:<ID> labels for each ConceptID delivered
- Link related issues using "Depends on" notation
- Store issue numbers for sprint tracking and reporting

**Decision Framework:**

- Minimize scope to reach MVP quickly
- Defer non-critical enhancements to future releases
- Prioritize user-facing value over internal optimization
- Balance technical debt vs delivery speed
- Ensure each issue produces demoable results in preview environment

## Quality checklist

**Template Completion:**

- [ ] All `{{…}}` placeholders resolved.
- [ ] \*\*Issue 001:
  - [ ] **Project Fundamentals/Test Framework Setup** added.
  - [ ] **Development Context Scoping** included with chain-issue-updater usage.
- [ ] Phase column included in Index with proper dev/build/deploy sequencing.

**Content Requirements:**

- [ ] Each issue has "Delivers Concepts" field with ConceptIDs.
- [ ] Prior Art & References completed per "Prior Art Analysis Protocol" (see section above).
- [ ] Agent selection follows scenario-specific patterns where applicable.
- [ ] Sections are concise and actionable.
- [ ] TOC Created for issue-plan.md

**Quality Standards:**

- [ ] **All Quality Enforcement Guidelines requirements satisfied** (see section above).
- [ ] No duplication with individual issue file content.
- [ ] Content ready for direct inclusion in GitHub issues.
- [ ] Saved to `foreman/release-{{X}}/docs/00-planning/issue-plan.md`.
