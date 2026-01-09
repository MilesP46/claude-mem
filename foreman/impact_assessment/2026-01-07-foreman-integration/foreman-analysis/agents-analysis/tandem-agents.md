# Tandem Agent Workflows Analysis

## Overview

The foreman agent system employs multiple coordinated tandem workflows where agents operate in hierarchical architect/worker patterns, sequential pipeline patterns, and iterative error-fix loops. These tandem relationships enable complex development tasks to be decomposed into specialized, atomic work units while maintaining architectural consistency and quality standards.

## Tandem Workflows Identified

### 1. Backend Architect + Backend Worker Tandem

- **Agents Involved**: `backend-architect`, `backend-worker`
- **Purpose**: Hierarchical backend development with architectural oversight and specialized implementation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/tdd-development.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/github/gh-issue-workflow.md`
- **Workflow**:
  1. `backend-architect` reviews GH issue, creates plan with subtasks, and defines architectural boundaries
  2. `backend-architect` launches parallel `backend-worker` agents for independent subtasks
  3. Each `backend-worker` identifies its scope via "Worker Scope: backend-worker-[identifier]" in GH comments
  4. `backend-worker` implements using TDD (RED-GREEN-REFACTOR cycle)
  5. `backend-architect` validates worker implementations for uniform integration patterns
  6. `backend-architect` performs integrated dev environment verification of all worker outputs
  7. `backend-architect` adjusts worker implementations if necessary for consistency
- **Combined Outputs**:
  - Tested backend APIs, services, and database components
  - GH issue comments with progress updates (checked-off items)
  - Draft PR completion comments
- **Dependencies**: `test-manager` (provides failing tests), `framework-manager` (infrastructure setup)

---

### 2. AI Engineer + AI Technician Tandem

- **Agents Involved**: `ai-engineer`, `ai-technician`
- **Purpose**: Hierarchical AI/ML development with engineering oversight and specialized implementation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/tdd-development.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/github/gh-issue-workflow.md`
- **Workflow**:
  1. `ai-engineer` reviews GH issue, creates plan for AI/ML components
  2. `ai-engineer` launches parallel `ai-technician` agents for independent ML tasks
  3. Each `ai-technician` identifies scope via "Worker Scope: ai-technician-[identifier]"
  4. `ai-technician` implements adapters, prompts, ML pipelines following TDD
  5. `ai-engineer` validates technician work for uniform integration patterns
  6. `ai-engineer` performs integrated verification of all worker outputs
  7. `ai-engineer` adjusts technician implementations for architectural alignment
- **Combined Outputs**:
  - Inference adapters, evaluation harnesses
  - Shadow mode configurations, feature flags
  - Baseline metrics and sample I/O fixtures
- **Dependencies**: `test-manager` (provides failing tests)

---

### 3. Error Explorer + Surgical Fixes Tandem

- **Agents Involved**: `error-explorer`, `surgical-fixes`
- **Purpose**: Deep error analysis followed by targeted fix implementation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None directly referenced
- **Workflow**:
  1. `error-explorer` agents (multiple parallel) perform deep-dive error analysis
  2. `error-explorer` identifies root cause, location, evidence, and complete logic flow
  3. `error-explorer` produces structured error analysis with files requiring modification
  4. `surgical-fixes` receives error analysis from error-explorer
  5. `surgical-fixes` reads affected files and plans minimal fix
  6. `surgical-fixes` implements targeted edits following fix patterns (logic bugs, race conditions, validation, etc.)
  7. `surgical-fixes` updates tests and adds regression tests
  8. `surgical-fixes` verifies fix resolves error without breaking functionality
- **Combined Outputs**:
  - Error analysis report with root cause identification
  - Targeted code fixes with updated tests
  - Completion report with verification checklist
- **Dependencies**: None external; self-contained error resolution loop

---

### 4. Test Manager + Implementation Agents Tandem

- **Agents Involved**: `test-manager`, `backend-architect`, `frontend-developer`, `ai-engineer`
- **Purpose**: TDD contract creation before implementation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/tdd-development.mdc`
  - `@foreman/rules/test-organization.mdc`
- **Instructions Referenced**:
  - `@foreman/templates/github/labels.yaml`
- **Workflow**:
  1. `test-manager` ingests GH issue context, extracts ConceptIDs and Capability Block
  2. `test-manager` checks for existing draft PR with `tdd:red` label
  3. `test-manager` synthesizes acceptance tests (Cucumber) and unit/integration tests (RSpec)
  4. `test-manager` creates intentionally failing tests with NotImplemented stubs
  5. `test-manager` creates or updates draft PR with `tdd:red` label
  6. Implementation agents (`backend-architect`, `frontend-developer`, `ai-engineer`) receive failing tests
  7. Implementation agents execute GREEN phase to make tests pass
  8. When implementation complete, `tdd:red` label is removed, CI requires green
- **Combined Outputs**:
  - Draft PR with failing tests (RED phase contract)
  - Cucumber features in `features/critical/`
  - RSpec specs in `spec/unit/`, `spec/integration/`
  - Implementation code that satisfies test contracts
- **Dependencies**: `framework-manager` (if test infrastructure missing)

---

### 5. Impact Assessment + Change Plan Builder Tandem

- **Agents Involved**: `impact-assessment`, `change-plan-builder`
- **Purpose**: Comprehensive change analysis followed by granular implementation planning
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/planning/granular-change-plan-instructions.md`
- **Workflow**:
  1. `impact-assessment` analyzes proposed changes across codebase
  2. `impact-assessment` identifies affected files, dependencies, and integration points
  3. `impact-assessment` produces impact assessment document with change TOC
  4. Multiple `change-plan-builder` agents launched (one per work item)
  5. Each `change-plan-builder` reads impact assessment and prior work item plans
  6. `change-plan-builder` verifies all information against actual project structure using Glob/Grep/Read
  7. `change-plan-builder` creates file-by-file change plan with guardrails
  8. Plans reference dependencies on prior work items for sequential execution
- **Combined Outputs**:
  - Impact assessment document
  - Granular change plans per work item (max 1,500 tokens each)
  - File-by-file specifications with verified paths
  - Guardrails and dos/don'ts
- **Dependencies**: Prior work item plans (for sequential items)

---

### 6. Chain UX Researcher + Chain UI Designer Tandem

- **Agents Involved**: `chain-ux-researcher`, `chain-ui-designer`
- **Purpose**: Sequential UX research followed by UI design based on research findings
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**: Various planning templates
- **Workflow**:
  1. `chain-ux-researcher` reads release specifications and concept documents
  2. `chain-ux-researcher` produces UX research documentation in `docs/01-ux-research/`
  3. `chain-ui-designer` reads UX research findings
  4. `chain-ui-designer` creates UI design documentation in `docs/02-ui-design/`
  5. Both reference shared release specification for consistency
- **Combined Outputs**:
  - UX research documents (personas, journeys, requirements)
  - UI design documents (wireframes, component specs, interaction patterns)
- **Dependencies**: Release specification documents

---

### 7. Chain System Architect + Chain Architecture Updater Tandem

- **Agents Involved**: `chain-system-architect`, `chain-architecture-updater`
- **Purpose**: Initial architecture design followed by revision-based updates
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**: Architecture templates and instructions
- **Workflow**:
  1. `chain-system-architect` reads UX/UI research and release specifications
  2. `chain-system-architect` produces architecture documentation in `docs/03-architecture/`
  3. When direction changes occur, `chain-architecture-updater` is invoked
  4. `chain-architecture-updater` reads existing architecture and new requirements
  5. `chain-architecture-updater` revises architecture documents to reflect changes
- **Combined Outputs**:
  - System architecture documentation
  - Updated architecture documents reflecting revisions
- **Dependencies**: UX research, UI design documents

---

### 8. Chain Issue Builder + GitHub Issue Creator Tandem

- **Agents Involved**: `chain-issue-builder`, `github-issue-creator`
- **Purpose**: Comprehensive issue planning followed by GitHub issue creation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-plan-template-instructions.md`
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/planning/issue-overview-template-instructions.md`
  - `@foreman/instructions/planning/user-requirements-template-instructions.md`
- **Workflow**:
  1. `chain-issue-builder` reads release specification, architecture, UX/UI docs
  2. `chain-issue-builder` produces `issue-plan.md` with GitHub-ready descriptions
  3. `chain-issue-builder` produces `issue-map/` folder with YAML files per issue
  4. `chain-issue-builder` produces `issue-overview.md` and `user-requirements.md`
  5. `github-issue-creator` reads issue-plan.md and issue-map files
  6. `github-issue-creator` creates actual GitHub issues with proper labels
  7. Issues are created with MVP-first prioritization
- **Combined Outputs**:
  - Issue planning documents (4 files)
  - GitHub issues with agent mapping
  - Issue labels per `@foreman/templates/github/labels.yaml`
- **Dependencies**: All planning phase documents (specification, architecture, UX, UI)

---

### 9. PR Chore Reviewer + Chore Refactorer Tandem

- **Agents Involved**: `pr-chore-reviewer`, `chore-refactorer`
- **Purpose**: Dependency/CI PR review followed by refactoring when needed
- **Rules Referenced**: None explicitly referenced
- **Instructions Referenced**: None explicitly referenced
- **Workflow**:
  1. `pr-chore-reviewer` reviews chore PRs (deps, deps-dev, ci labels)
  2. `pr-chore-reviewer` analyzes if PR requires application code changes
  3. If safe to merge: `pr-chore-reviewer` merges and deletes branch
  4. If refactoring needed: `pr-chore-reviewer` comments on PR with file list
  5. `chore-refactorer` reads flagged PR comments and chore documentation
  6. `chore-refactorer` implements required refactoring changes
  7. `chore-refactorer` updates application code to work with dependency updates
- **Combined Outputs**:
  - Merged dependency PRs (when safe)
  - PR comments with refactoring requirements (when needed)
  - Refactored application code compatible with updates
- **Dependencies**: GH CLI for PR operations

---

### 10. Vite Frontend Fix + Verify UI Tandem

- **Agents Involved**: `vite-frontend-fix`, `verify-ui`
- **Purpose**: Frontend UI issue fixing with iterative verification
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly referenced
- **Workflow**:
  1. `vite-frontend-fix` identifies frontend UI/UX issues
  2. `vite-frontend-fix` implements targeted fixes
  3. `verify-ui` performs comprehensive visual and functional verification
  4. `verify-ui` uses Playwright MCP for browser-based testing
  5. If verification fails, loop back to `vite-frontend-fix`
  6. Continue iteration until verification passes
- **Combined Outputs**:
  - Fixed frontend code
  - Verification reports
  - Passing visual/functional tests
- **Dependencies**: Playwright MCP, running dev server

---

### 11. Troubleshooting Investigator + Surgical Edits Tandem

- **Agents Involved**: `troubleshooting-investigator`, `surgical-edits`
- **Purpose**: Problem investigation followed by minimal targeted changes
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly referenced
- **Workflow**:
  1. `troubleshooting-investigator` analyzes reported problems
  2. `troubleshooting-investigator` traces execution paths and identifies issues
  3. `troubleshooting-investigator` documents findings with evidence
  4. `surgical-edits` receives investigation findings
  5. `surgical-edits` makes minimal, targeted changes
  6. `surgical-edits` preserves existing functionality
  7. Changes verified against investigation findings
- **Combined Outputs**:
  - Investigation reports
  - Targeted code modifications
  - Verification of issue resolution
- **Dependencies**: None external

---

### 12. Dead Code Reviewer + Documentation Updater Tandem

- **Agents Involved**: `dead-code-reviewer`, `documentation-updater`
- **Purpose**: Identify removable code followed by documentation cleanup
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
- **Instructions Referenced**: None explicitly referenced
- **Workflow**:
  1. Multiple `dead-code-reviewer` agents analyze codebase in parallel
  2. Each `dead-code-reviewer` identifies code removable with 100% certainty
  3. `dead-code-reviewer` produces removal recommendations
  4. After code removal, `documentation-updater` reviews affected documentation
  5. `documentation-updater` updates docs to reflect removed code
  6. `documentation-updater` removes obsolete documentation references
- **Combined Outputs**:
  - Dead code identification report
  - Code removals
  - Updated documentation
- **Dependencies**: None external

---

### 13. Frontend Developer + Frontend Worker Tandem

- **Agents Involved**: `frontend-developer`, `frontend-worker`
- **Purpose**: Hierarchical frontend development with architectural oversight and specialized implementation
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/tdd-development.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/github/gh-issue-workflow.md`
- **Workflow**:
  1. `frontend-developer` reviews GH issue and creates component/feature plan
  2. `frontend-developer` launches parallel `frontend-worker` agents for component tasks
  3. Each `frontend-worker` identifies scope via worker scope identifier
  4. `frontend-worker` implements components using TDD
  5. `frontend-developer` validates worker implementations for consistency
  6. `frontend-developer` performs integrated UI verification
  7. `frontend-developer` adjusts implementations as needed
- **Combined Outputs**:
  - Frontend components and features
  - Component tests
  - Integrated UI functionality
- **Dependencies**: `test-manager` (provides failing tests)

---

### 14. Pipeline Manager + Test Manager Tandem

- **Agents Involved**: `pipeline-manager`, `test-manager`
- **Purpose**: CI/CD pipeline setup coordinated with test infrastructure
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
- **Instructions Referenced**:
  - `@foreman/instructions/github/gh-issue-workflow.md`
- **Workflow**:
  1. `pipeline-manager` designs CI/CD workflow structure
  2. `pipeline-manager` creates `.github/workflows/*.yml` files
  3. `pipeline-manager` configures `tdd:red` label support for draft PRs
  4. `test-manager` uses `tdd:red` label for draft PR test contracts
  5. `pipeline-manager` sets up `continue-on-error` for draft/tdd:red PRs
  6. Both agents coordinate on RSpec, Cucumber, Playwright job configuration
- **Combined Outputs**:
  - GitHub Actions workflows
  - Test job configurations
  - Label-based CI behavior (tdd:red support)
- **Dependencies**: `framework-manager` (for gem/library setup)

---

## Summary of Coordination Patterns

| Pattern | Description | Example Tandems |
|---------|-------------|-----------------|
| **Architect/Worker** | Hierarchical oversight with parallelized implementation | Backend Architect/Worker, AI Engineer/Technician, Frontend Developer/Worker |
| **Analysis/Fix** | Deep investigation followed by targeted remediation | Error Explorer/Surgical Fixes, Troubleshooting Investigator/Surgical Edits |
| **Contract/Implementation** | Test contracts created before implementation | Test Manager/Implementation Agents |
| **Sequential Pipeline** | Ordered document production building on prior outputs | UX Researcher/UI Designer, Issue Builder/GitHub Issue Creator |
| **Review/Refactor** | Assessment followed by conditional modification | PR Chore Reviewer/Chore Refactorer, Dead Code Reviewer/Documentation Updater |
| **Fix/Verify Loop** | Iterative fix and verification until passing | Vite Frontend Fix/Verify UI |

## Key Observations

1. **Shared Standards**: All tandem workflows reference `@foreman/rules/development-standards.mdc` and `@foreman/rules/system-standards.mdc` for consistency
2. **GH Issue Integration**: Most tandems use GitHub issues as the coordination mechanism with structured comments for progress tracking
3. **TDD Discipline**: Architect/worker patterns consistently follow TDD with test-manager providing initial failing tests
4. **Parallel Execution**: Worker agents can be launched in parallel for independent subtasks within a single issue
5. **Quality Gates**: All implementation tandems include verification steps before completion
