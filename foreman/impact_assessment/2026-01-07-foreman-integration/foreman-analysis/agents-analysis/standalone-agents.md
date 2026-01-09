# Standalone Agents Analysis

This document catalogs all foreman agents that operate as standalone specialists, not following the chain-* pattern or command-agent duo pattern. These agents are invoked by commands or other agents to perform focused, specialized tasks.

---

## Agent Categories

### Implementation Workers

#### backend-worker
- **Purpose**: Backend implementation specialist for executing well-defined subtasks within larger development efforts
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan - identify scope from GH issue worker scope identifier
  2. Execute with TDD (RED/GREEN/REFACTOR phases)
  3. Language-Agnostic Type Error Resolution
  4. Test and Verification Loop
  5. Quality Gates validation
  6. Work Completion with progress tracking
- **Outputs**: Implemented backend code, updated tests, GH issue comment updates
- **Dependencies**: test-manager (for failing tests), troubleshooting-investigator (for type errors)

#### frontend-worker
- **Purpose**: Frontend implementation specialist for executing well-defined subtasks within larger frontend development efforts
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan - identify scope from GH issue worker scope identifier
  2. Execute with TDD (RED/GREEN/REFACTOR phases)
  3. Language-Agnostic Type Error Resolution
  4. Test and Verification Loop
  5. Quality Gates validation
  6. Work Completion with progress tracking
- **Outputs**: Implemented frontend components, updated tests, GH issue comment updates
- **Dependencies**: test-manager (for failing tests), troubleshooting-investigator (for type errors)

#### ai-technician
- **Purpose**: AI/ML implementation specialist for executing well-defined subtasks within larger AI/ML development efforts
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan - identify scope from GH issue worker scope identifier
  2. Execute with TDD (RED/GREEN/REFACTOR phases)
  3. Language-Agnostic Type Error Resolution
  4. Test and Verification Loop
  5. Quality Gates validation
  6. Work Completion with progress tracking
- **Outputs**: Implemented AI/ML components, updated tests, GH issue comment updates
- **Dependencies**: test-manager (for failing tests), troubleshooting-investigator (for type errors)

---

### Architecture Specialists

#### backend-architect
- **Purpose**: Backend systems design agent for architectural decisions and implementation oversight
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-workflow.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan with scope validation
  2. Execute with TDD following strict discipline
  3. Test and Refactor Loop
  4. Work Completion with validation
- **Outputs**: Backend architecture decisions, coordinated worker implementations
- **Dependencies**: backend-worker (for subtask execution), test-manager (for tests)

#### backend-architecture-analyzer
- **Purpose**: Analyzes existing backend architecture patterns and makes technical decisions for new features
- **Invoking Commands**: Various commands needing architecture analysis
- **Rules Referenced**: @foreman/rules/requested/secret-management.mdc, @foreman/rules/requested/dependency-management.mdc, @foreman/rules/requested/logging-standard.mdc, @foreman/rules/requested/performance-general.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: sonnet
- **Workflow Steps**:
  1. Phase 1: Architecture Discovery (API, Data Layer, Service, Infrastructure patterns)
  2. Phase 2: Automatic Technical Decisions
  3. Output generation with detected stack and implementation decisions
- **Outputs**: YAML-structured autonomous architecture analysis document
- **Dependencies**: None (autonomous analysis)

#### frontend-component-analyzer
- **Purpose**: Analyzes frontend codebases to detect patterns, identify reusable components, and make technical decisions
- **Invoking Commands**: Various commands needing frontend pattern analysis
- **Rules Referenced**: @foreman/rules/requested/coding-standards-general.mdc, @foreman/rules/requested/performance-general.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: sonnet
- **Workflow Steps**:
  1. Phase 1: Automatic Pattern Detection (components, tech stack, conventions)
  2. Phase 2: Autonomous Decision Making using decision matrix
  3. Phase 3: Output Generation
- **Outputs**: YAML-structured autonomous analysis with tech stack, conventions, reusable components
- **Dependencies**: None (autonomous analysis)

---

### Development Leads

#### frontend-developer
- **Purpose**: Master frontend developer for transforming functional interfaces into joyful experiences
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-workflow.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan with scope validation
  2. Execute with TDD/BDD
  3. Test and Refactor Loop with MCP-Playwright
  4. Work Completion with comprehensive validation
- **Outputs**: Frontend implementations, coordinated frontend-worker outputs
- **Dependencies**: frontend-worker (for subtasks), test-manager (for tests)

#### ai-engineer
- **Purpose**: Expert AI engineer for practical ML implementation and AI integration in production
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-workflow.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Review and Plan with scope validation
  2. TDD Implementation (RED/GREEN/REFACTOR)
  3. Test and Refactor Loop
  4. Work Completion with validation
- **Outputs**: AI/ML implementations, inference adapters, evaluation harnesses
- **Dependencies**: ai-technician (for subtasks), test-manager (for tests)

---

### Testing & Quality

#### test-manager
- **Purpose**: Creates failing tests (RED phase) for TDD workflow
- **Invoking Commands**: chain-issue (via orchestration)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc, @foreman/rules/tdd-development.mdc, @foreman/rules/test-organization.mdc
- **Instructions Referenced**: None
- **Templates Used**: @foreman/templates/github/labels.yaml
- **Model**: opus
- **Workflow Steps**:
  1. Analyze issue requirements
  2. Create comprehensive failing tests
  3. Ensure deliberate failure mechanisms
- **Outputs**: Failing test suites for TDD workflow
- **Dependencies**: None

#### troubleshooting-investigator
- **Purpose**: Autonomous issue resolution with zero-regression tolerance for test and behavior failures
- **Invoking Commands**: error-fix, various commands on test failures
- **Rules Referenced**: @foreman/rules/always/engineering-standards.mdc, @foreman/rules/requested/secure-by-default.mdc, @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Phase 1: Failure Analysis
  2. Phase 2: Strategic Fix Generation
  3. Phase 3: Atomic Fix-and-Verify Cycle
  4. Phase 4: Regression Prevention
- **Outputs**: YAML-structured issue resolution report
- **Dependencies**: None (autonomous)

---

### Error & Fix Specialists

#### error-explorer
- **Purpose**: Deep code analysis agent for root cause identification of errors
- **Invoking Commands**: error-explorer (command), error-fix
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Glob, Bash(ls:*), Bash(cat:*), Bash(find:*), Bash(tree:*)
- **Workflow Steps**:
  1. Receive error context
  2. Deep code analysis
  3. Root cause identification
  4. Evidence collection
- **Outputs**: Root cause analysis with evidence
- **Dependencies**: None

#### surgical-edits
- **Purpose**: Executes planned code changes with surgical precision following impact assessment plans
- **Invoking Commands**: impact-change
- **Rules Referenced**: @development-standards.mdc (LOC limits)
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Edit, Bash, Glob, Grep
- **Workflow Steps**:
  1. Understand assignment from impact assessment
  2. Pre-Change Verification
  3. Execute Changes
  4. Update Tests
  5. Verification
  6. Silent Failure Check
  7. Report Completion
- **Outputs**: Modified code files, updated tests, completion report
- **Dependencies**: impact-assessment (for plan)

#### surgical-fixes
- **Purpose**: Implements targeted fixes for identified errors while preserving functionality
- **Invoking Commands**: error-fix
- **Rules Referenced**: @foreman/rules/development-standards.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Edit, Bash, Glob, Grep
- **Workflow Steps**:
  1. Understand the Error
  2. Implement the Fix
  3. Update Tests
  4. Verify the Fix
  5. Report Completion
- **Outputs**: Fixed code, updated tests, completion report
- **Dependencies**: error-explorer (for error analysis)

#### git-error-fixer
- **Purpose**: Fixes git commit-time errors with minimal changes
- **Invoking Commands**: fix-git
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Edit, Bash, Grep, Glob
- **Workflow Steps**:
  1. Receive specific file(s) and error messages
  2. Follow commit-time fixes playbook
  3. Make minimal changes preserving behavior
  4. Verify unit tests pass
- **Outputs**: Fixed files ready for commit
- **Dependencies**: None

---

### Impact & Change Analysis

#### impact-assessment
- **Purpose**: Performs comprehensive impact analysis for code changes
- **Invoking Commands**: impact-change, plan-change
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Glob, Grep, Bash(ls:*), Bash(find:*), Bash(tree:*)
- **Workflow Steps**:
  1. Phase 1: Impact Identification
  2. Phase 2: Logic Chain Documentation
- **Outputs**: Comprehensive impact assessment document (markdown)
- **Dependencies**: None

#### change-plan-builder
- **Purpose**: Creates granular change plans from impact assessments
- **Invoking Commands**: plan-change
- **Rules Referenced**: @rules/development-standards.mdc
- **Instructions Referenced**: @instructions/planning/granular-change-plan-instructions.md
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Glob, Grep, Bash, Write
- **Workflow Steps**:
  1. Read impact assessment
  2. Analyze change requirements
  3. Create granular change plan
- **Outputs**: Granular change plan document
- **Dependencies**: impact-assessment

---

### Code Quality & Review

#### dead-code-reviewer
- **Purpose**: Analyzes codebases to identify dead code with 100% certainty
- **Invoking Commands**: dead-code-review
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Glob, Grep, Bash(ls:*), Bash(find:*), Bash(tree:*)
- **Workflow Steps**:
  1. Analyze codebase for unused code
  2. Verify with 100% certainty
  3. Document findings
- **Outputs**: Dead code analysis report
- **Dependencies**: None

#### code-restructurer
- **Purpose**: Restructures code to meet engineering standards (150-200 LOC limits)
- **Invoking Commands**: Various commands needing code restructuring
- **Rules Referenced**: @development-standards.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Analyze file for LOC violations
  2. Plan restructuring
  3. Execute restructuring
  4. Verify compliance
- **Outputs**: Restructured code files meeting LOC limits
- **Dependencies**: None

#### reviewerpr
- **Purpose**: Sandy Metz-style PR reviewer
- **Invoking Commands**: Various PR review commands
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**: Standard PR review workflow
- **Outputs**: PR review comments and approval/changes requested
- **Dependencies**: None

#### pr-chore-reviewer
- **Purpose**: Reviews chore PRs for dependency updates
- **Invoking Commands**: review-chore-prs
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Bash, Grep, Glob
- **Workflow Steps**:
  1. Review dependency updates
  2. Check for breaking changes
  3. Approve or flag for refactoring
- **Outputs**: PR review decision
- **Dependencies**: None

#### chore-refactorer
- **Purpose**: Performs refactoring for chore PRs based on docs/development/chores/
- **Invoking Commands**: apply-chore-refactors
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Edit, Bash, Grep, Glob
- **Workflow Steps**:
  1. Read chore documentation
  2. Apply refactoring changes
  3. Verify tests pass
- **Outputs**: Refactored code
- **Dependencies**: None

---

### UI Verification & Fix

#### vite-frontend-fix
- **Purpose**: Fixes Vite frontend UI/UX issues through iterative verification and repair
- **Invoking Commands**: vite-UI-fix (skill)
- **Rules Referenced**: @foreman/rules/development-standards.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: sonnet
- **Allowed Tools**: Read, Write, Edit, Bash, Glob, Grep, mcp__playwright__* (all browser tools), mcp__github__get_issue, mcp__github__add_issue_comment, mcp__github__list_issues
- **Workflow Steps**:
  1. Phase 0: Environment Setup & Context Gathering
  2. Phase 1: Issue Reproduction with Playwright
  3. Phase 2: Root Cause Analysis
  4. Phase 3: Iterative Fix & Verify Loop
  5. Phase 4: Test Restructuring (after fix)
  6. Phase 5: Silent Error Prevention
- **Outputs**: YAML-structured issue resolution report
- **Dependencies**: None (uses Playwright MCP)

#### verify-ui
- **Purpose**: Verifies frontend changes by testing actual UI behavior with Playwright
- **Invoking Commands**: impact-change (post-implementation verification)
- **Rules Referenced**: None explicit
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: sonnet
- **Allowed Tools**: Read, Edit, Bash, Glob, Grep, mcp__playwright__* (all browser tools)
- **Workflow Steps**:
  1. Understand the Context from impact assessment
  2. Setup Verification Environment
  3. Test Each Modified UI Flow
  4. Issue Detection and Analysis
  5. Make Minimal Fixes
  6. Comprehensive Verification
  7. Report Results
- **Outputs**: UI verification report
- **Dependencies**: impact-assessment

---

### Documentation & Memory

#### documentation-updater
- **Purpose**: Creates and updates documentation following standards
- **Invoking Commands**: Various commands needing documentation updates
- **Rules Referenced**: @foreman/rules/diagram-standard.mdc
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**: Standard documentation update workflow
- **Outputs**: Updated documentation files
- **Dependencies**: None

#### memory-manager
- **Purpose**: Generates, updates, and maintains CLAUDE.md memory files across projects
- **Invoking Commands**: manage-memory
- **Rules Referenced**: rules/memory-system-standards.mdc
- **Instructions Referenced**:
  - @foreman/instructions/memory/root-claude-instructions.md
  - @foreman/instructions/memory/subtree-claude-instructions.md
  - @foreman/instructions/memory/cross-cutting-instructions.md
  - @foreman/instructions/memory/promotion-demotion-process.md
  - @foreman/instructions/memory/context-loading-model.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**:
  1. Workflow Selection (Full Project, Targeted Area, or Parent Aggregation)
  2. Workflow-specific execution (bottom-up creation, targeted updates, or navigation aggregation)
  3. Run memory-update script
- **Outputs**: CLAUDE.md files across project directories
- **Dependencies**: None

#### md-scratchpad-cleanup
- **Purpose**: Cleans up loose markdown scratchpad files by removing outdated content
- **Invoking Commands**: cleanup-docs
- **Rules Referenced**: None
- **Instructions Referenced**: None
- **Templates Used**: None
- **Model**: sonnet
- **Allowed Tools**: Read, Edit, Grep, Glob
- **Workflow Steps**:
  1. Read the file
  2. Analyze content section by section
  3. Verify claims against codebase
  4. Apply decision tree to determine what to keep
  5. Edit the file (remove outdated, preserve correct)
  6. Review changes
- **Outputs**: Cleaned markdown files
- **Dependencies**: None

---

### Planning & Issue Management

#### fix-issue
- **Purpose**: Makes surgical modifications to single issues within the issue planning system
- **Invoking Commands**: fix-issue (skill)
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc
- **Instructions Referenced**:
  - @foreman/instructions/planning/issue-map-template-instructions.md
  - @foreman/instructions/planning/issue-plan-template-instructions.md
  - @foreman/instructions/planning/issue-overview-template-instructions.md
  - @foreman/instructions/planning/user-requirements-template-instructions.md
- **Templates Used**: None
- **Model**: opus
- **Allowed Tools**: Read, Edit, Write, Grep, Glob, Bash
- **Workflow Steps**:
  1. Understand the Modification Context
  2. Read Template Instructions
  3. Analyze Impact Scope
  4. Make Surgical Modifications (update all 4 planning documents)
  5. Validate Consistency
  6. Document Changes
- **Outputs**: Updated issue-XXX.yaml, issue-plan.md, issue-overview.md, user-requirements.md
- **Dependencies**: None

#### github-issue-creator
- **Purpose**: Adds new issues to existing releases with seamless integration
- **Invoking Commands**: new-issue, chain-send-issues
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-instructions.md
- **Templates Used**: @foreman/templates/github/labels.yaml
- **Model**: opus
- **Workflow Steps**:
  1. Analyze release structure
  2. Determine optimal placement and numbering
  3. Update planning documents
  4. Create GitHub issues with proper labels
- **Outputs**: GitHub issues, updated planning documents
- **Dependencies**: None

---

### Infrastructure & DevOps

#### framework-manager
- **Purpose**: Framework initialization and configuration for greenfield/brownfield projects
- **Invoking Commands**: Various initialization commands
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-workflow.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**: Framework-specific initialization workflow
- **Outputs**: Initialized framework configuration
- **Dependencies**: None

#### pipeline-manager
- **Purpose**: CI/CD pipeline design and deployment infrastructure
- **Invoking Commands**: Various deployment commands
- **Rules Referenced**: @foreman/rules/development-standards.mdc, @foreman/rules/system-standards.mdc
- **Instructions Referenced**: @foreman/instructions/github/gh-issue-workflow.md
- **Templates Used**: None
- **Model**: opus
- **Workflow Steps**: Pipeline-specific workflow
- **Outputs**: CI/CD pipeline configuration
- **Dependencies**: None

---

### Creation & Orchestration

#### command-agent-duo
- **Purpose**: Executes creation of project-level agent-command pairs following strategy
- **Invoking Commands**: create-project-agent-command-duo
- **Rules Referenced**: None explicit
- **Instructions Referenced**:
  - @instructions/coordination/agent-command-creation-standards.md
  - @instructions/coordination/orchestration-patterns.md
- **Templates Used**:
  - @templates/coordination/agent-template.md
  - @templates/coordination/simple-command-template.md
  - @templates/coordination/orchestrating-command-template.md
- **Model**: opus
- **Allowed Tools**: Read, Write, Edit, Glob, Grep, Bash
- **Workflow Steps**:
  1. Parse Assignment (orchestration type, strategy, templates)
  2. Extract Patterns (if leveraging existing)
  3. Create Files (agents and commands)
  4. Verify & Report
- **Outputs**: Agent files (.claude/agents/*.md), Command files (.claude/commands/*.md)
- **Dependencies**: None

---

## Summary Statistics

| Category | Agent Count |
|----------|-------------|
| Implementation Workers | 3 |
| Architecture Specialists | 3 |
| Development Leads | 3 |
| Testing & Quality | 2 |
| Error & Fix Specialists | 4 |
| Impact & Change Analysis | 2 |
| Code Quality & Review | 5 |
| UI Verification & Fix | 2 |
| Documentation & Memory | 3 |
| Planning & Issue Management | 2 |
| Infrastructure & DevOps | 2 |
| Creation & Orchestration | 1 |
| **Total** | **32** |

---

## Common Patterns

### Rules Referenced Across Agents
- `@foreman/rules/development-standards.mdc` - Most common (code quality, LOC limits)
- `@foreman/rules/system-standards.mdc` - Architecture and system patterns
- `@foreman/rules/tdd-development.mdc` - TDD workflow enforcement

### Instructions Referenced Across Agents
- `@foreman/instructions/github/gh-issue-workflow.md` - GitHub workflow integration
- `@foreman/instructions/planning/*.md` - Planning document management
- `@foreman/instructions/memory/*.md` - Memory system management

### Model Distribution
- **opus**: 28 agents (87.5%) - Complex reasoning, implementation
- **sonnet**: 4 agents (12.5%) - Analysis, lightweight tasks

### Common Tool Patterns
- Read, Edit, Bash, Grep, Glob - Standard file operations
- mcp__playwright__* - UI testing and verification
- mcp__github__* - GitHub integration
