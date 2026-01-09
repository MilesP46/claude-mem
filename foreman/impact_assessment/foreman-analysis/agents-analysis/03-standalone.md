# Standalone Agents Analysis

## Overview
Standalone agents operate independently without being part of formal chain or duo structures. These agents provide specialized capabilities for specific tasks including architecture analysis, code restructuring, testing, documentation, and domain-specific implementation work.

## Agents Identified

**Architecture & Analysis (3):**
- backend-architecture-analyzer
- frontend-component-analyzer
- change-plan-builder

**Implementation & Verification (4):**
- surgical-edits
- verify-ui
- code-restructurer
- troubleshooting-investigator

**Documentation & Memory (2):**
- documentation-updater
- md-scratchpad-cleanup

**Infrastructure & Frameworks (2):**
- framework-manager
- pipeline-manager

**Domain Experts (7):**
- backend-architect
- frontend-developer
- ai-engineer
- backend-worker
- frontend-worker
- ai-technician
- test-manager

**Specialized Management (2):**
- github-issue-creator
- reviewerpr

## Detailed Analysis

### backend-architecture-analyzer
- **Purpose:** Analyze existing backend architecture patterns and make technical decisions for new features based on discovered patterns
- **Location:** `/Users/miles/.my_coding/agents/backend-architecture-analyzer.md`
- **Rules Referenced:** @foreman/rules/requested/secret-management.mdc, dependency-management.mdc, logging-standard.mdc, performance-general.mdc
- **Instructions Referenced:** @foreman/current-sprint.md
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Map architecture → Analyze patterns → Make technical decisions → Output comprehensive report → Ensure consistency with existing codebase patterns

### frontend-component-analyzer
- **Purpose:** Scan frontend codebases to detect patterns, components, and conventions before implementing new features
- **Location:** `/Users/miles/.my_coding/agents/frontend-component-analyzer.md`
- **Rules Referenced:** @foreman/rules/requested/coding-standards-general.mdc, performance-general.mdc
- **Instructions Referenced:** @foreman/current-sprint.md
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Scan codebase → Detect patterns → Analyze technology stack → Make autonomous technical decisions → Ensure new components align with existing patterns

### change-plan-builder
- **Purpose:** Create detailed, fact-based granular change plans for specific work items by analyzing impact assessments
- **Location:** `/Users/miles/.my_coding/agents/change-plan-builder.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Granular planning methodology, fact-based analysis
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Analyze impact assessments → Verify against actual project structure → Produce actionable surgical implementation guides

### surgical-edits
- **Purpose:** Execute planned code changes with surgical precision following impact assessment plan exactly
- **Location:** `/Users/miles/.my_coding/agents/surgical-edits.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Surgical implementation methodology
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Follow impact assessment plan exactly → Ensure tests updated and passing → No silent failures → Execute with precision

### verify-ui
- **Purpose:** Verify frontend changes by testing actual UI behavior with Playwright and validating backend logic
- **Location:** `/Users/miles/.my_coding/agents/verify-ui.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** UI verification methodology, Playwright testing patterns
- **Scripts Referenced:** None
- **Tools Used:** All tools including full Playwright MCP suite
- **Workflow:** Test actual UI behavior → Validate backend logic execution → Make minimal fixes → Ensure tests pass

### code-restructurer
- **Purpose:** Restructure existing code to comply with engineering standards (150-200 LOC limit, DRY, single-responsibility)
- **Location:** `/Users/miles/.my_coding/agents/code-restructurer.md`
- **Rules Referenced:** @development-standards.mdc
- **Instructions Referenced:** Code restructuring patterns, LOC enforcement
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Analyze file length and complexity → Break into smaller modules → Preserve all functionality → Ensure tests still pass

### troubleshooting-investigator
- **Purpose:** Autonomously diagnose and fix test failures (unit, integration, UI) while maintaining zero-regression tolerance
- **Location:** `/Users/miles/.my_coding/agents/troubleshooting-investigator.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Test failure diagnosis methodology
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Analyze failures → Generate strategic fixes → Apply atomic fix-verify cycles → Prevent regressions

### documentation-updater
- **Purpose:** Create, update, or restructure documentation files according to project documentation standards
- **Location:** `/Users/miles/.my_coding/agents/documentation-updater.md`
- **Rules Referenced:** @foreman/rules/diagram-standard.mdc
- **Instructions Referenced:** Documentation hierarchy standards, QRG format
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Check token counts → Split into hierarchy if needed → Add QRG blocks → Validate structure and diagrams

### md-scratchpad-cleanup
- **Purpose:** Clean up loose scratchpad and summary .md files by removing outdated content while preserving correct information
- **Location:** `/Users/miles/.my_coding/agents/md-scratchpad-cleanup.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Scratchpad cleanup decision tree
- **Scripts Referenced:** None
- **Tools Used:** Read, Edit, Grep, Glob (focused tool set)
- **Workflow:** Identify loose .md files → Remove outdated content → Preserve correct and intent-related info → Refine before formal documentation

### framework-manager
- **Purpose:** Initialize new projects with framework templates or add frameworks/libraries to existing projects
- **Location:** `/Users/miles/.my_coding/agents/framework-manager.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Bootstrap methodology, greenfield/brownfield patterns
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Bootstrap new projects → Add frameworks to existing code → Configure environment → Implement logging/error handling foundations

### pipeline-manager
- **Purpose:** Initialize or retrofit CI/CD pipelines for any project (greenfield or brownfield) with automated testing
- **Location:** `/Users/miles/.my_coding/agents/pipeline-manager.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** CI/CD pipeline patterns, multi-environment deployment
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Create GitHub Actions workflows → Set up test automation → Configure deployment workflows → Establish monitoring/observability (TDD by default, BDD for frontend)

### backend-architect
- **Purpose:** Design and implement backend systems including APIs, databases, microservices using TDD methodology
- **Location:** `/Users/miles/.my_coding/agents/backend-architect.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, issue requirements
- **Scripts Referenced:** gh issue comment, log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Review plan → TDD execution → Test loop (RED-GREEN-REFACTOR) → Work completion → Progress tracking

### frontend-developer
- **Purpose:** Implement frontend UI and experiences with rapid TDD/BDD development within sprint cycles
- **Location:** `/Users/miles/.my_coding/agents/frontend-developer.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, issue requirements
- **Scripts Referenced:** gh issue comment, log-activity release
- **Tools Used:** All tools including full Playwright MCP suite
- **Workflow:** Review plan → TDD/BDD execution → Test loop → Ensure delightful, performant UX → Work completion

### ai-engineer
- **Purpose:** Implement AI/ML features, integrate language models, build recommendation systems, add computer vision
- **Location:** `/Users/miles/.my_coding/agents/ai-engineer.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, issue requirements
- **Scripts Referenced:** gh issue comment, log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Review plan → TDD implementation → Test loop → Optimize AI infrastructure → Work completion

### backend-worker
- **Purpose:** Execute well-defined backend subtasks as part of larger development effort within sprint context
- **Location:** `/Users/miles/.my_coding/agents/backend-worker.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Acquire context from GitHub issue → TDD execution → Type error resolution → Run tests → Quality gates

### frontend-worker
- **Purpose:** Execute well-defined frontend subtasks as part of larger development effort within sprint context
- **Location:** `/Users/miles/.my_coding/agents/frontend-worker.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools including Playwright MCP
- **Workflow:** Acquire context from GitHub issue → TDD execution → Type error resolution → Quality gates

### ai-technician
- **Purpose:** Execute well-defined AI/ML implementation subtasks within sprint context following project patterns
- **Location:** `/Users/miles/.my_coding/agents/ai-technician.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Reference GitHub issue → TDD implementation → Run unit tests → Verify implementation

### test-manager
- **Purpose:** Create intentionally failing tests that define DONE using TDD principles
- **Location:** `/Users/miles/.my_coding/agents/test-manager.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc, tdd-development.mdc, test-organization.mdc
- **Instructions Referenced:** Sprint context, GitHub issue details
- **Scripts Referenced:** gh issue comment, log-activity release
- **Tools Used:** All tools (full access)
- **Workflow:** Ingest issue context → Check existing PR → Synthesize acceptance criteria → Plan unit/integration tests → Generate intentionally failing tests (RED phase)

### github-issue-creator
- **Purpose:** Add new issues to existing releases seamlessly with proper sequencing and agent mapping
- **Location:** `/Users/miles/.my_coding/agents/github-issue-creator.md`
- **Rules Referenced:** @foreman/rules/development-standards.mdc, system-standards.mdc
- **Instructions Referenced:** Issue planning system structure
- **Scripts Referenced:** log-activity release, gh CLI
- **Tools Used:** All tools (full access)
- **Workflow:** Analyze existing release structure → Add new issues with proper sequencing → Update issue-map.yaml and issue-plan.md → Create GitHub issues

### reviewerpr
- **Purpose:** Review GitHub pull requests in Sandy Metz style focusing on OO design principles, simplicity, maintainability
- **Location:** `/Users/miles/.my_coding/agents/reviewerpr.md`
- **Rules Referenced:** Sandy Metz's POODR principles
- **Instructions Referenced:** OO design patterns, simplicity guidelines
- **Scripts Referenced:** log-activity release, gh CLI
- **Tools Used:** All tools (full access)
- **Workflow:** Fetch PR → Analyze in Sandy Metz style → Post structured review comment → Make small refined improvements directly on branch

## Pattern Summary

**Autonomous Decision-Making**: All standalone agents make independent decisions based on codebase analysis without user prompts.

**Sprint Context Integration**: Domain expert agents (backend-architect, frontend-developer, ai-engineer) and workers reference sprint context and GitHub issues.

**TDD/BDD Methodology**: Implementation agents follow strict TDD principles (RED-GREEN-REFACTOR cycle) or BDD for frontend.

**Activity Logging**: Consistent use of `log-activity release` for progress tracking across agents.

**Full Tool Access**: Most standalone agents have access to all tools for comprehensive implementation capabilities.

**Quality Standards**: All agents enforce development standards (≤150 LOC, DRY, single-responsibility, type safety).

**Zero Silent Failures**: Implementation agents ensure all errors are properly handled and tests pass.

**Pattern Detection**: Analyzer agents (backend-architecture-analyzer, frontend-component-analyzer) ensure consistency with existing codebase.

**Worker Pattern**: Worker agents (backend-worker, frontend-worker, ai-technician) execute focused subtasks within larger parent agent contexts.

**GitHub Integration**: Several agents integrate with GitHub CLI for issue management, comments, and PR operations.
