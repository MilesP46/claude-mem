# Chain-* Workflow Agents Analysis

## Overview

The chain-* agent pattern is a coordinated workflow system designed to orchestrate the complete software development lifecycle from concept to implementation. These agents work in sequence, each producing specific documentation artifacts that serve as inputs for subsequent agents. The pattern emphasizes:

- **Autonomous operation** with minimal user intervention
- **Template-driven documentation** ensuring consistency
- **Activity logging** for traceability
- **Decision reconciliation** across agent boundaries
- **Strict scope boundaries** (no feature additions, no overlap)

The chain workflow is divided into two major categories:
1. **Greenfield agents** - Create new documentation for new releases
2. **Updater agents** - Make surgical, seamless modifications to existing documentation

## Agents Identified

### chain-prototype-researcher

- **Purpose**: Research and identify open-source templates, libraries, and services to accelerate development from concept to reality. Conducts exhaustive research using systematic scoring formulas to evaluate candidates and recommend optimal combinations for rapid prototyping.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 1 and Step 1b)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/system-standards.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/planning/deployment-decision-matrix-template-instructions.md`
  - `@foreman/instructions/planning/recommendation-report-template-instructions.md`

- **Templates Used**:
  - `@foreman/templates/planning/deployment-decision-matrix-template.md`
  - `@foreman/templates/planning/recommendation-report-template.md`

- **Workflow**:
  1. **Phase 1 (research mode)**:
     - Read release specification and concept checklist
     - Research and score templates using score-candidate bash command
     - Research and score APIs using score-candidate bash command
     - Research and score services using score-candidate bash command
     - Run composition analysis using score-composition bash command
     - Create deployment decision matrix for user review
  2. **Phase 2 (finalize mode)**:
     - Read user deployment decisions from decision matrix
     - Plan final recommendations
     - Create final recommendation report incorporating user choices

- **Outputs**:
  - `@foreman/release-{{X}}/research/templates.yaml`
  - `@foreman/release-{{X}}/research/apis.yaml`
  - `@foreman/release-{{X}}/research/services.yaml`
  - `@foreman/release-{{X}}/research/compositions.yaml`
  - `@foreman/release-{{X}}/docs/00-planning/deployment-decision-matrix.md`
  - `@foreman/release-{{X}}/docs/00-planning/release{{X}}-recommendation-report.md`

- **Dependencies**:
  - Requires release specification from chain-plan-init
  - Requires concept-checklist.md
  - Feeds into chain-ux-researcher, chain-ui-designer, chain-system-architect

---

### chain-ux-researcher

- **Purpose**: Translate release specifications into UX research deliverables including user flows, personas, wireframes, and interaction patterns. Operates autonomously without user prompts, focusing strictly on user experience research without visual design details.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 2)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (focuses on UX research domain)

- **Instructions Referenced**:
  - `@foreman/instructions/ux-research/user-flows-template-instructions.md`
  - `@foreman/instructions/ux-research/personas-template-instructions.md`
  - `@foreman/instructions/ux-research/wireframes-template-instructions.md`
  - `@foreman/instructions/ux-research/interaction-patterns-template-instructions.md`
  - `@foreman/instructions/coordination/decision-reconciliation-template-instructions.md`

- **Templates Used**:
  - `@foreman/templates/ux-research/user-flows-template.md`
  - `@foreman/templates/ux-research/personas-template.md`
  - `@foreman/templates/ux-research/wireframes-template.md`
  - `@foreman/templates/ux-research/interaction-patterns-template.md`
  - `@foreman/templates/coordination/decision-reconciliation-template.md`

- **Workflow**:
  1. **Ingest** - Parse epics from release specification; extract Primary Goals, Journeys, Pain Points, Success Criteria
  2. **Page Inventory** - Derive canonical list of screens/pages required
  3. **User Flows** - Map happy path + essential alternates with Mermaid diagrams and ASCII fallbacks
  4. **Proto-Personas** - Create 3-5 concise personas grounded in the spec
  5. **Wireframes** - Text/ASCII boxes illustrating layout and hierarchy per page
  6. **Interaction Patterns** - Document recurring patterns (forms, search, lists, modals, navigation)
  7. **QC & Non-Overlap Check** - Ensure no visual design or components specified
  8. **Decision Logging** - Review assumptions, make decisions, update documentation, log to decision-log.md

- **Outputs**:
  - `@foreman/release-{{X}}/docs/01-ux-research/user-flows.md`
  - `@foreman/release-{{X}}/docs/01-ux-research/personas.md`
  - `@foreman/release-{{X}}/docs/01-ux-research/wireframes.md`
  - `@foreman/release-{{X}}/docs/01-ux-research/interaction-patterns.md`
  - Appends to `@foreman/release-{{X}}/coordination/decision-log.md`

- **Dependencies**:
  - Requires release specification
  - Requires recommendation report from chain-prototype-researcher
  - Feeds into chain-ui-designer

---

### chain-ui-designer

- **Purpose**: Create detailed UI designs and component specifications based on completed UX research and prototyping decisions. Transforms wireframes, user flows, and prototyping recommendations into production-ready design systems with tokens, component specs, and implementation notes.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 3)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/system-standards.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/ui-design/component-specs-template-instructions.md`
  - `@foreman/instructions/ui-design/config-notes-template-instructions.md`
  - `@foreman/instructions/ui-design/design-system-template-instructions.md`
  - `@foreman/instructions/ui-design/component-markups-template-instructions.md`
  - `@foreman/instructions/ui-design/interactive-prototypes-template-instructions.md`
  - `@foreman/instructions/ui-design/ui-interaction-patterns-template-instructions.md`
  - `@foreman/instructions/ui-design/navigation-state-patterns-template-instructions.md`
  - `@foreman/instructions/coordination/decision-reconciliation-template-instructions.md`

- **Templates Used**:
  - `@foreman/templates/ui-design/component-specs-template.md`
  - `@foreman/templates/ui-design/config-notes-template.md`
  - `@foreman/templates/ui-design/design-system-template.md`
  - `@foreman/templates/ui-design/component-markups-template.md`
  - `@foreman/templates/ui-design/interactive-prototypes-template.md`
  - `@foreman/templates/ui-design/ui-interaction-patterns-template.md`
  - `@foreman/templates/ui-design/navigation-state-patterns-template.md`
  - `@foreman/templates/coordination/decision-reconciliation-template.md`

- **Workflow**:
  1. **Phase 1: Component Analysis** - Parse UX flows to generate Component Bill of Materials (CBOM), map to adoption strategy (Use/Extend/Compose/Net-new)
  2. **Phase 2: Design Foundations** - Establish semantic design tokens, create responsive breakpoint system, map tokens to chosen stack
  3. **Phase 3: Component Specification** - Define anatomy, props, all states, accessibility requirements, micro-interactions
  4. **Phase 4: Developer Handoff** - Generate copy-paste configuration values, create implementation notes, document theming approach
  5. **Decision Logging** - Review assumptions, make decisions, update documentation, log to decision-log.md

- **Outputs**:
  - `@foreman/release-{{X}}/docs/02-ui-design/component-specs.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/config-notes.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/design-system.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/component-markups.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/interactive-prototypes.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/ui-interaction-patterns.md`
  - `@foreman/release-{{X}}/docs/02-ui-design/navigation-state-patterns.md`
  - Appends to `@foreman/release-{{X}}/coordination/decision-log.md`

- **Dependencies**:
  - Requires release specification
  - Requires UX research outputs from chain-ux-researcher
  - Requires recommendation report from chain-prototype-researcher
  - Feeds into chain-system-architect

---

### chain-system-architect

- **Purpose**: Create technical architecture documentation after UI design and prototyping phases are complete. Converts the chosen technology stack and research into comprehensive architecture documentation including API design, database schemas, service integrations, and infrastructure plans.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 4)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/system-standards.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/architecture/api-design-template-instructions.md`
  - `@foreman/instructions/architecture/service-integration-template-instructions.md`
  - `@foreman/instructions/architecture/database-schema-template-instructions.md`
  - `@foreman/instructions/architecture/infrastructure-plan-template-instructions.md`
  - `@foreman/instructions/coordination/decision-reconciliation-template-instructions.md`

- **Templates Used**:
  - `@foreman/templates/architecture/api-design-template.md`
  - `@foreman/templates/architecture/service-integration-template.md`
  - `@foreman/templates/architecture/database-schema-template.md`
  - `@foreman/templates/architecture/infrastructure-plan-template.md`
  - `@foreman/templates/coordination/decision-reconciliation-template.md`

- **Workflow**:
  1. **Derive Domain & Contracts** - Extract resources and operations from component specs and flows, map to selected APIs/services
  2. **Draft API Design** - Define resources, endpoints/operations, request/response schemas, error model, authentication, versioning
  3. **Model the Data** - Derive entities, relationships, constraints; design physical model; include ERD, indices, migration strategy
  4. **Plan Integrations** - Define authentication, rate limits, timeouts, retries, circuit breakers, webhooks for each external service
  5. **Design Infrastructure** - Define environments, deployment targets, IaC approach, CI/CD pipeline, observability, security controls
  6. **Apply Quality Gates** - Verify API contract completeness, data model integrity, integration resilience, security posture
  7. **Decision Logging** - Review assumptions, make decisions, update documentation, log to decision-log.md

- **Outputs**:
  - `@foreman/release-{{X}}/docs/03-architecture/api-design.md`
  - `@foreman/release-{{X}}/docs/03-architecture/service-integration.md`
  - `@foreman/release-{{X}}/docs/03-architecture/database-schema.md`
  - `@foreman/release-{{X}}/docs/03-architecture/infrastructure-plan.md`
  - Appends to `@foreman/release-{{X}}/coordination/decision-log.md`

- **Dependencies**:
  - Requires release specification
  - Requires UX research outputs from chain-ux-researcher
  - Requires UI design outputs from chain-ui-designer
  - Requires recommendation report from chain-prototype-researcher
  - Feeds into chain-issue-builder

---

### chain-issue-builder

- **Purpose**: Create comprehensive, atomic issue plans for development work. Breaks down complex requirements into small, sequential issues that can be implemented efficiently through TDD/BDD cycles. Specializes in MVP-first sequencing and agent orchestration planning.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 7)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-plan-template-instructions.md`
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/planning/issue-overview-template-instructions.md`
  - `@foreman/instructions/planning/user-requirements-template-instructions.md`

- **Templates Used**:
  - `@foreman/templates/planning/issue-plan-template.md`
  - `@foreman/templates/planning/issue-map-template.yaml`
  - `@foreman/templates/planning/issue-overview-template.md`
  - `@foreman/templates/planning/user-requirements-template.md`

- **Workflow**:
  1. Read all prescribed documents completely (recommendation report, release specs, architecture, UX research, UI design)
  2. Read template instructions thoroughly
  3. Create issue-plan.md with GitHub-ready issue descriptions and prior art references
  4. Create issue-map/ folder with individual YAML files for each issue
  5. Create issue-overview.md with high-level development process overview and diagrams
  6. Create user-requirements.md identifying user input needs to minimize workflow interruptions
  7. Log progress using activity logging

- **Outputs**:
  - `@foreman/release-{{X}}/docs/00-planning/issue-plan.md`
  - `@foreman/release-{{X}}/docs/00-planning/issue-map/*.yaml`
  - `@foreman/release-{{X}}/docs/00-planning/issue-overview.md`
  - `@foreman/release-{{X}}/docs/00-planning/user-requirements.md`

- **Dependencies**:
  - Requires recommendation report from chain-prototype-researcher
  - Requires release specification
  - Requires architecture outputs from chain-system-architect
  - Requires UX research outputs from chain-ux-researcher
  - Requires UI design outputs from chain-ui-designer
  - Feeds into chain-issue-creator and chain-send-issues

---

### chain-issue-creator

- **Purpose**: Create GitHub issues from existing issue plans. Converts planning documents into trackable GitHub issues that integrate with the chain development process with proper formatting, labels, and sequencing.

- **Invoked By**:
  - `/chain-send-issues` command (indirectly through issue submission)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/github/gh-issue-workflow.md`
  - `@foreman/instructions/github/gh-issue-instructions.md`

- **Templates Used**:
  - `@foreman/templates/github/labels.yaml`

- **Workflow**:
  1. Read planning documents (issue-plan.md, issue-map/ folder)
  2. Analyze repository context for consistency requirements
  3. Create GitHub issues from planning documents with exact titles, comprehensive descriptions, proper labels
  4. Apply initial "todo" status label
  5. Include links to relevant planning documents
  6. Add proper cross-references to dependent issues
  7. Verify quality (issues match spec, agent assignments align, proper labels applied)

- **Outputs**:
  - GitHub issues created in repository
  - Updates to issue files in issue-map/ folder with GitHub issue numbers

- **Dependencies**:
  - Requires issue-plan.md from chain-issue-builder
  - Requires issue-map/ folder from chain-issue-builder
  - Used by /chain-send-issues command

---

### chain-issue-updater

- **Purpose**: Supporting agent to chain-issue for advanced issue documentation and context optimization. Handles GitHub issue work scope documentation, folder scoping for context restriction, and agent-specific pattern documentation.

- **Invoked By**:
  - `/chain-issue` command (Step 3.1 Pre-Agent Context and Test Preparation)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/test-organization.mdc`

- **Instructions Referenced**:
  - `@foreman/instructions/planning/issue-map-template-instructions.md`
  - `@foreman/instructions/github/gh-issue-workflow.md`

- **Templates Used**:
  - Uses Plan Template Structure from gh-issue-workflow.md

- **Workflow**:
  **Mode A: Pre-Agent Planning & Context Preparation**
  1. Issue Analysis & Agent Planning - Use GH MCP/CLI to identify work, break into small tasks
  2. Pre-Work Analysis Protocol - Review dependent issues, analyze completed work, identify folder scoping patterns
  3. Test Requirements Scoping - Plan unit tests, integration tests, component tests based on development standards
  4. Development Context Scoping & Folder Planning - Classify folders as primary, secondary, excluded per agent
  5. Context & Test Requirements Documentation - Create comprehensive context comment
  6. Worker Agent Scope Planning - Define specific scope for worker agents when parent agents require them

  **Mode B: Standalone Issue Work**
  - Perform complete issue work including folder structure creation and documentation updates

- **Outputs**:
  - GitHub issue comments with agent plans and folder scoping
  - Updates to issue-XXX.yaml files with folder scopes
  - Worker scope definitions within parent agent plans

- **Dependencies**:
  - Works with chain-issue orchestrator
  - Supports backend-architect, frontend-developer, ai-engineer parent agents
  - Prepares context for all development agents

---

### chain-update-researcher

- **Purpose**: Conduct targeted research for plan updates when new services, templates, or libraries are needed that weren't part of the original release. Builds upon existing recommendation report, investigating only specific additions or modifications required by the change.

- **Invoked By**:
  - `/chain-plan-design-update` command (Step 1a)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (follows same scoring methodology as chain-prototype-researcher)

- **Instructions Referenced**:
  - `@instructions/planning/recommendation-report-template-instructions.md`
  - `@instructions/planning/deployment-decision-matrix-template-instructions.md`

- **Templates Used**:
  - Uses same scoring methodology as chain-prototype-researcher

- **Workflow**:
  1. **Phase 1: Context Ingestion** - Read existing recommendation report, impact assessment, identify integration points
  2. **Phase 2: Targeted Research and Scoring** - Score only new capabilities using score-candidate bash commands, always use brownfield mode for compositions
  3. **Phase 3: Create Update Report** - Write update report with Change Context, Existing Stack Context, Research Findings, Integration Summary, Recommendation

- **Outputs**:
  - `@foreman/release-{{X}}/docs/00-planning/update-{{U}}/release{{X}}-update-report.md`
  - `@foreman/release-{{X}}/research/templates.yaml` (updated)
  - `@foreman/release-{{X}}/research/apis.yaml` (updated)
  - `@foreman/release-{{X}}/research/services.yaml` (updated)

- **Dependencies**:
  - Requires existing recommendation report
  - Requires impact assessment from orchestrator
  - Feeds into chain-ux-updater, chain-ui-updater, chain-architecture-updater

---

### chain-ux-updater

- **Purpose**: Make surgical, seamless updates to existing UX research documentation when plan updates require minimal changes. Updates user flows, personas, wireframes, and interaction patterns so they appear as if originally written that way.

- **Invoked By**:
  - `/chain-plan-design-update` command (Step 2)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (follows UX research conventions)

- **Instructions Referenced**:
  - `@instructions/ux-research/user-flows-template-instructions.md`
  - `@instructions/ux-research/personas-template-instructions.md`
  - `@instructions/ux-research/wireframes-template-instructions.md`
  - `@instructions/ux-research/interaction-patterns-template-instructions.md`

- **Templates Used**:
  - References existing UX templates for structure understanding

- **Workflow**:
  1. **Phase 1: Understand Change Scope** - Read impact assessment, research report (if provided), existing UX documentation
  2. **Phase 2: Plan Minimal Updates** - Identify specific sections, new elements, existing elements, cross-references to update
  3. **Phase 3: Execute Updates** - Update user flows, personas, wireframes, interaction patterns following existing conventions
  4. **Phase 4: Cross-Reference Validation** - Verify all flow/page/persona/pattern references are consistent
  5. **Phase 5: Quality Check** - Ensure no "updated"/"new"/"changed" language, all IDs follow conventions

- **Outputs**:
  - In-place updates to `@foreman/release-{{X}}/docs/01-ux-research/*.md` files

- **Dependencies**:
  - Requires impact assessment
  - May require research report from chain-update-researcher
  - Feeds into chain-ui-updater

---

### chain-ui-updater

- **Purpose**: Make surgical, seamless updates to existing UI design documentation when plan updates require minimal changes. Updates component specs, design system, config notes, and related UI docs so they appear as if originally written that way.

- **Invoked By**:
  - `/chain-plan-design-update` command (Step 3)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (follows UI design conventions)

- **Instructions Referenced**:
  - `@instructions/ui-design/component-specs-template-instructions.md`
  - `@instructions/ui-design/config-notes-template-instructions.md`
  - `@instructions/ui-design/design-system-template-instructions.md`
  - `@instructions/ui-design/interactive-prototypes-template-instructions.md`
  - `@instructions/ui-design/ui-interaction-patterns-template-instructions.md`
  - `@instructions/ui-design/navigation-state-patterns-template-instructions.md`

- **Templates Used**:
  - References existing UI templates for structure understanding

- **Workflow**:
  1. **Phase 1: Understand Change Scope** - Read impact assessment, research report, existing UI and UX documentation
  2. **Phase 2: Plan Minimal Updates** - Identify specific sections, new components, token updates, cross-references
  3. **Phase 3: Execute Updates** - Update component specs, design system, config notes, patterns
  4. **Phase 4: Cross-Reference Validation** - Verify component/token/pattern references are consistent
  5. **Phase 5: Quality Check** - Ensure no change language, accessibility requirements complete

- **Outputs**:
  - In-place updates to `@foreman/release-{{X}}/docs/02-ui-design/*.md` files

- **Dependencies**:
  - Requires impact assessment
  - May require research report from chain-update-researcher
  - Should align with chain-ux-updater changes
  - Feeds into chain-architecture-updater

---

### chain-architecture-updater

- **Purpose**: Make surgical, seamless updates to existing architecture documentation when plan updates require minimal changes. Updates API design, database schema, service integration, and infrastructure plans so they appear as if originally written that way.

- **Invoked By**:
  - `/chain-plan-design-update` command (Step 4)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (follows architecture conventions)

- **Instructions Referenced**:
  - `@instructions/architecture/api-design-template-instructions.md`
  - `@instructions/architecture/service-integration-template-instructions.md`
  - `@instructions/architecture/database-schema-template-instructions.md`
  - `@instructions/architecture/infrastructure-plan-template-instructions.md`

- **Templates Used**:
  - References existing architecture templates for structure understanding

- **Workflow**:
  1. **Phase 1: Understand Change Scope** - Read impact assessment, research report, existing architecture and UI/UX docs
  2. **Phase 2: Plan Minimal Updates** - Identify specific sections, new endpoints/entities, cross-references, security implications
  3. **Phase 3: Execute Updates** - Update API design, database schema, service integration, infrastructure plan
  4. **Phase 4: Cross-Reference Validation** - Verify API/database/integration references are consistent
  5. **Phase 5: Quality Check** - Ensure no change language, security requirements documented

- **Outputs**:
  - In-place updates to `@foreman/release-{{X}}/docs/03-architecture/*.md` files

- **Dependencies**:
  - Requires impact assessment
  - May require research report from chain-update-researcher
  - Should align with chain-ui-updater changes
  - Feeds into chain-issue-plan-updater

---

### chain-issue-plan-updater

- **Purpose**: Create or modify issue YAML files and GitHub issues for plan updates. Handles letter-suffix sequencing for inserted issues (e.g., 004a), creates/modifies issue YAML files, and updates GitHub issues using edit-last-comment for modifications. Designed to run in parallel for multiple issues.

- **Invoked By**:
  - `/chain-plan-design-update` command (Step 7)
  - Direct invocation via Task tool

- **Rules Referenced**:
  - None explicitly (follows issue planning conventions)

- **Instructions Referenced**:
  - `@instructions/planning/issue-map-template-instructions.md`
  - `@instructions/github/gh-issue-workflow.md`
  - `@instructions/github/gh-issue-instructions.md`

- **Templates Used**:
  - References issue-map template structure

- **Workflow**:
  **Mode: CREATE**
  1. Validate insertion point respects completion status
  2. Create issue YAML with tiered structure (Identification, Planning, Execution, Integration)
  3. Create GitHub issue using GH CLI
  4. Update YAML with GitHub issue number/URL

  **Mode: MODIFY**
  1. Read existing YAML and assess modification safety
  2. Apply YAML changes (update only specified fields)
  3. Update GitHub issue comment (edit-last for single-comment, GraphQL API for multi-comment)
  4. Verify synchronization between YAML and GitHub

- **Outputs**:
  - New issue YAML files (issue-004a.yaml, etc.)
  - Modified existing issue YAML files
  - New GitHub issues
  - Updated GitHub issue comments

- **Dependencies**:
  - Requires issue manifest from orchestrator
  - Respects issue completion states (done issues cannot be modified)
  - Works in parallel with other chain-issue-plan-updater instances

---

### chain-whimsy-injector

- **Purpose**: Enhance UI/UX with delightful interactions, playful animations, and personality-filled copy. Reviews existing interfaces to identify opportunities for micro-interactions, emotional journey improvements, and copy enhancements that transform functional interfaces into joyful experiences.

- **Invoked By**:
  - `/chain-plan-design-green` command (Step 6)
  - Direct invocation via Task tool (after UI-designer agent)

- **Rules Referenced**:
  - None explicitly (focuses on delight and personality)

- **Instructions Referenced**:
  - None explicitly (uses domain expertise)

- **Templates Used**:
  - None (makes adjustments to existing files)

- **Workflow**:
  1. Read release specification, UX research, and UI design documentation
  2. Scan for mundane interactions that could spark joy
  3. Find transitions that could be more playful
  4. Spot static elements that could have personality
  5. Locate text that could be more human and fun
  6. Make small adjustments to component-specs.md and wireframes.md
  7. Ensure adjustments appear as if originally part of the documents (not additions)

- **Outputs**:
  - In-place adjustments to `@foreman/release-{{X}}/docs/02-ui-design/component-specs.md`
  - In-place adjustments to `@foreman/release-{{X}}/docs/01-ux-research/wireframes.md`

- **Dependencies**:
  - Requires completed UI design documentation from chain-ui-designer
  - Requires completed UX research documentation from chain-ux-researcher
  - Runs after chain-ui-designer in the greenfield workflow

---

## Chain Commands (Orchestrators)

### /chain-concept-gen

- **Purpose**: Assist in defining a concept for a release through iterative Q&A process
- **Agents Used**: None (direct user interaction)
- **Outputs**: concept-checklist.md, concept-qa-documentation.md
- **Hands Off To**: /chain-plan-init

### /chain-plan-init

- **Purpose**: Orchestrate specification file creation for a new release
- **Agents Used**: None (direct template completion)
- **Outputs**: release{{X}}-specification.md
- **Hands Off To**: /chain-plan-design-green

### /chain-plan-design-green

- **Purpose**: Orchestrate complete design phase for a new release (greenfield)
- **Agents Used**: chain-prototype-researcher, chain-ux-researcher, chain-ui-designer, chain-system-architect, chain-whimsy-injector, chain-issue-builder
- **Outputs**: All planning, UX, UI, architecture, and issue documentation
- **Hands Off To**: /chain-send-issues

### /chain-plan-design-update

- **Purpose**: Orchestrate plan revision for an existing release when direction changes
- **Agents Used**: chain-update-researcher, chain-ux-updater, chain-ui-updater, chain-architecture-updater, chain-issue-plan-updater
- **Outputs**: Updated planning, UX, UI, architecture documentation and issues
- **Hands Off To**: Depends on update scope

### /chain-send-issues

- **Purpose**: Send the planned issues to GitHub
- **Agents Used**: chain-issue-creator (implicitly through issue submission)
- **Outputs**: GitHub issues created, issue-plan.md updated with GH issue numbers
- **Hands Off To**: /chain-issue

### /chain-issue

- **Purpose**: Work on GitHub issues through the development workflow
- **Agents Used**: chain-issue-updater (for planning), plus development agents (backend-architect, frontend-developer, etc.)
- **Outputs**: Implemented code, merged PRs, closed issues
- **Hands Off To**: Next issue in sequence (automatic chaining)

---

## Agent Dependency Graph

```
chain-concept-gen
       |
       v
chain-plan-init
       |
       v
chain-plan-design-green ─────────────────────────────────────────┐
       |                                                          |
       v                                                          |
chain-prototype-researcher (mode: research)                       |
       |                                                          |
       v                                                          |
[USER: Deployment Decisions]                                      |
       |                                                          |
       v                                                          |
chain-prototype-researcher (mode: finalize)                       |
       |                                                          |
       v                                                          |
chain-ux-researcher                                               |
       |                                                          |
       v                                                          |
chain-ui-designer                                                 |
       |                                                          |
       v                                                          |
chain-system-architect                                            |
       |                                                          |
       v                                                          |
[Decision Reconciliation Coordination]                            |
       |                                                          |
       v                                                          |
chain-whimsy-injector                                             |
       |                                                          |
       v                                                          |
chain-issue-builder                                               |
       |                                                          |
       v                                                          |
[USER: Requirements Review] ─────────────────────────────────────┘
       |
       v
chain-send-issues
       |
       v
chain-issue-creator (GitHub issues created)
       |
       v
chain-issue (development workflow)
       |
       v
chain-issue-updater (per-agent planning)
       |
       v
[Development Agents: backend-architect, frontend-developer, etc.]
       |
       v
[Next Issue] (automatic chaining)
```

### Update Flow (Brownfield)

```
chain-plan-design-update
       |
       v
[Impact Assessment]
       |
       v
chain-update-researcher (if research needed)
       |
       v
[USER: Research Approval]
       |
       v
chain-ux-updater
       |
       v
chain-ui-updater
       |
       v
chain-architecture-updater
       |
       v
[Issue Plan Analysis]
       |
       v
chain-issue-plan-updater (parallel, multiple instances)
       |
       v
[USER: Requirements Review]
```
