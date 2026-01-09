# Templates Analysis

## Overview

The templates system in `/Users/miles/.my_coding/templates/` provides standardized document structures for the foreman planning and development workflow. Templates are organized into six categories covering architecture, coordination, planning, pipeline (CI/CD), UI design, and UX research. Each template uses placeholder syntax (`{{PLACEHOLDER}}`) for dynamic content and includes structured sections, YAML blocks, and Mermaid diagrams.

## Template Categories

### Architecture Templates
Technical architecture documentation templates for API design, database schemas, infrastructure planning, and service integration specifications.

### Coordination Templates
Templates for agent/command creation and cross-agent coordination including conflict resolution and decision reconciliation.

### Planning Templates
Core planning documents including release specifications, issue planning, concept checklists, deployment decisions, and recommendation reports.

### Pipeline Templates
CI/CD workflow templates for GitHub Actions supporting multi-stack projects.

### UI Design Templates
Comprehensive UI documentation templates covering component specs, design systems, mockups, prototypes, and interaction patterns.

### UX Research Templates
User-centered design templates for personas, user flows, wireframes, and interaction patterns.

### GitHub Templates
GitHub artifact configurations including label definitions.

---

## Templates Identified

### api-design-template.md
- **Location**: `/Users/miles/.my_coding/templates/architecture/api-design-template.md`
- **Purpose**: Defines backend-frontend API contracts including REST endpoints, GraphQL schemas, authentication, pagination, error handling, webhooks, and security specifications
- **Used By**: Architecture phase agents, backend-architect agent
- **Instruction File**: Part of architecture phase workflow
- **Placeholders**: `{{X}}` (release), `{{base_url}}`, `{{API_style}}`, `{{auth}}`, `{{versioning}}`, `{{CONCEPT_IDS}}`, endpoint-specific placeholders
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-architecture/api-design.md`

### database-schema-template.md
- **Location**: `/Users/miles/.my_coding/templates/architecture/database-schema-template.md`
- **Purpose**: Documents database schema design including entity models (ERD), table definitions, indexes, data lifecycle, privacy/retention policies, migrations, and performance considerations
- **Used By**: Architecture phase agents, database-architect agent
- **Instruction File**: Part of architecture phase workflow
- **Placeholders**: `{{X}}` (release), datastore selection, table/column definitions, PII classifications, migration tool choices
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-architecture/database-schema.md`

### infrastructure-plan-template.md
- **Location**: `/Users/miles/.my_coding/templates/architecture/infrastructure-plan-template.md`
- **Purpose**: Defines infrastructure including environments, IaC/CI-CD, networking, security, observability, DR/backup, and cost management
- **Used By**: Infrastructure planning agents, DevOps workflows
- **Instruction File**: Part of architecture phase workflow
- **Placeholders**: `{{X}}` (release), environment configs, IaC tool choices, networking/security rules, SLO targets, RPO/RTO values
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-architecture/infrastructure-plan.md`

### service-integration-template.md
- **Location**: `/Users/miles/.my_coding/templates/architecture/service-integration-template.md`
- **Purpose**: Documents external service integrations including auth, endpoints, retry/circuit breaker policies, webhooks, data mapping, and testing strategies
- **Used By**: Integration agents, service-integrator workflows
- **Instruction File**: Part of architecture phase workflow
- **Placeholders**: `{{X}}` (release), `{{Service Name}}`, integration specs (timeouts, retries, circuit breakers), data mapping tables
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-architecture/service-integration.md`

### agent-template.md
- **Location**: `/Users/miles/.my_coding/templates/coordination/agent-template.md`
- **Purpose**: Template for creating project-level agents with execution processes, tool usage, guidelines, and optional git integration
- **Used By**: create-project-agent-command-duo skill, agent creation workflows
- **Instruction File**: References Anthropic Subagent Documentation
- **Placeholders**: `[agent-name]`, `[CONTEXT]`, `[PATH]`, `[GIT]`, tool specifications, step instructions
- **Output Location**: `.claude/agents/[agent-name].md` in target project

### orchestrating-command-template.md
- **Location**: `/Users/miles/.my_coding/templates/coordination/orchestrating-command-template.md`
- **Purpose**: Template for creating orchestrating commands that coordinate multiple agents (sequential, parallel, or complex workflows)
- **Used By**: create-project-agent-command-duo skill, command creation workflows
- **Instruction File**: References Anthropic Slash-Command Documentation
- **Placeholders**: `[CONTEXT]`, `[agent prompts]`, phase/step definitions, synthesis patterns
- **Output Location**: `.claude/commands/[command-name].md` in target project

### simple-command-template.md
- **Location**: `/Users/miles/.my_coding/templates/coordination/simple-command-template.md`
- **Purpose**: Template for creating simple commands that launch a single agent with context and optional git workflow
- **Used By**: create-project-agent-command-duo skill, simple command creation
- **Instruction File**: References Anthropic Slash-Command Documentation
- **Placeholders**: `[CONTEXT]`, `[PATH]`, `[GIT]`, `[agent-name]`
- **Output Location**: `.claude/commands/[command-name].md` in target project

### cross-agent-coordination-request-template.md
- **Location**: `/Users/miles/.my_coding/templates/coordination/cross-agent-coordination-request-template.md`
- **Purpose**: Documents cross-agent conflict resolution requests when multiple agents have conflicting decisions
- **Used By**: chain-plan-design-green orchestrator
- **Instruction File**: Orchestrator coordination workflow
- **Placeholders**: `{{RELEASE_NUMBER}}`, `{{CONFLICT_DESCRIPTION}}`, `{{AGENT_NAMES}}`, option analysis, impact assessments
- **Output Location**: Coordination decision documents during design phase

### decision-reconciliation-template.md
- **Location**: `/Users/miles/.my_coding/templates/coordination/decision-reconciliation-template.md`
- **Purpose**: Logs agent decisions and orchestrator coordination analysis for decision tracking
- **Used By**: chain-plan-design-green orchestrator, agent decision workflows
- **Instruction File**: Orchestrator coordination workflow
- **Placeholders**: `{{AGENT_NAME}}`, `{{TIMESTAMP}}`, decision entries, coordination status
- **Output Location**: Release decision logs

### chain-context-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/chain-context-template.md`
- **Purpose**: Comprehensive issue context document (the "Bible") for agents including decisions, scope of work, impact matrices, test plans, and architecture analysis
- **Used By**: context-manager agent, chain-issue workflow
- **Instruction File**: Context manager instructions
- **Placeholders**: `{{X}}` (release), `{{N}}` (sprint), `{{ISSUE_ID}}`, YAML blocks for decisions/scope/tests per agent
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/03-issues/issue-{{N}}-context.md`

### concept-checklist-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/concept-checklist-template.md`
- **Purpose**: Captures core app capabilities with unique ConceptIDs for traceability, stripped of implementation details
- **Used By**: chain-concept-gen workflow
- **Instruction File**: concept-gen.md command
- **Placeholders**: `{{PROJECT_NAME}}`, `{{PROJECT_VISION}}`, `{{CONCEPT_CATEGORY}}`, `[CONCEPT-XXX]` IDs with intent/not descriptions
- **Output Location**: `{{FOREMAN_ROOT}}/concept-checklist.md`

### concept-qa-documentation-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/concept-qa-documentation-template.md`
- **Purpose**: Documents the Q&A exchange process during concept discovery including evolution tracking and decision points
- **Used By**: chain-concept-gen workflow
- **Instruction File**: Part of concept generation workflow
- **Placeholders**: Exchange logs, concept evolution tracking, MVP scope decisions, deployment approach
- **Output Location**: `{{FOREMAN_ROOT}}/concept-qa-documentation.md`

### context-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/context-template.md`
- **Purpose**: Issue context document similar to chain-context-template with codebase context and CLAUDE.md memory integration
- **Used By**: context-manager agent
- **Instruction File**: Context manager instructions
- **Placeholders**: Issue overview, codebase patterns, YAML decision blocks per agent
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/03-issues/`

### deployment-decision-matrix-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/deployment-decision-matrix-template.md`
- **Purpose**: Presents deployment options (full strategies and a la carte) with cost analysis, platform comparisons, and capability placement
- **Used By**: chain-plan-design-green workflow, prototyping-agent
- **Instruction File**: Part of design phase workflow
- **Placeholders**: Platform options, cost breakdowns, capability-to-platform mapping, research scores
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/deployment-decision-matrix.md`

### issue-map-template.yaml
- **Location**: `/Users/miles/.my_coding/templates/planning/issue-map-template.yaml`
- **Purpose**: Single issue YAML template with 4-tier structure (identification, planning, execution, integration)
- **Used By**: chain-issue-builder agent, issue planning workflows
- **Instruction File**: Issue builder instructions
- **Placeholders**: Issue metadata, concept delivery, agent assignments with folder restrictions, GitHub integration
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/03-issues/issue-{{N}}.yaml`

### issue-overview-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/issue-overview-template.md`
- **Purpose**: MVP-first development overview with timeline, flow diagrams, and post-MVP roadmap
- **Used By**: chain-plan workflow, issue planning
- **Instruction File**: Part of planning workflow
- **Placeholders**: MVP features, success criteria, Mermaid flowcharts and Gantt charts, enhancement phases
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/issue-overview.md`

### issue-plan-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/issue-plan-template.md`
- **Purpose**: Detailed issue plan with index table and individual issue breakdowns including scope, acceptance criteria, and agent maps
- **Used By**: chain-plan workflow, issue planning agents
- **Instruction File**: Part of planning workflow
- **Placeholders**: Issue index table, concept IDs, prior art references, agent sequences
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/issue-plan.md`

### recommendation-report-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/recommendation-report-template.md`
- **Purpose**: Phase 3 prototyping recommendation report with executive summary, implementation plan, gate checks, deployment setup guide
- **Used By**: prototyping-agent, chain-plan-design-green workflow
- **Instruction File**: Prototyping agent instructions
- **Placeholders**: Mode (greenfield/brownfield), CFS scores, template/API/service shortlists, deployment setup commands
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/release{{X}}-recommendation-report.md`

### release-specification-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/release-specification-template.md`
- **Purpose**: Core release specification with concept brief, MVP scope, requirements (must-have/nice-to-have), epics, and implementation risks
- **Used By**: chain-plan-init workflow
- **Instruction File**: Part of chain-plan-init
- **Placeholders**: `{{RELEASE_ID}}`, `{{RELEASE_NAME}}`, MVP features, epics with concept IDs, business goals/KPIs
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md`

### user-requirements-template.md
- **Location**: `/Users/miles/.my_coding/templates/planning/user-requirements-template.md`
- **Purpose**: Documents user input requirements (credentials, configurations, business logic) to minimize workflow interruptions
- **Used By**: chain-plan workflow, pre-issue phase
- **Instruction File**: Part of planning workflow
- **Placeholders**: API keys, database connections, service accounts, environment variables, business rules
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/user-requirements.md`

### gh-actions-template.yml
- **Location**: `/Users/miles/.my_coding/templates/pipeline/gh-actions-template.yml`
- **Purpose**: Multi-stack GitHub Actions CI template with auto-detection for Rails, Node, Python stacks plus BDD/linting jobs
- **Used By**: Pipeline agent, CI/CD setup workflows
- **Instruction File**: Pipeline agent instructions
- **Placeholders**: Stack-specific job configurations, test commands
- **Output Location**: `.github/workflows/ci.yml` in target project

### component-mockups-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/component-mockups-template.md`
- **Purpose**: Detailed UI component mockups with states (default, hover, active, error, loading, disabled), responsive behavior, and accessibility features
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: ASCII art mockups, component properties, design tokens, animation specs
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/component-mockups.md`

### component-specs-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/component-specs-template.md`
- **Purpose**: Complete Component Bill of Materials (CBOM) with specs, page templates, and global patterns including whimsy/delight slots
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: Component IDs, YAML specs, platform equivalents (Web/iOS/Android), telemetry/test IDs
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/component-specs.md`

### config-notes-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/config-notes-template.md`
- **Purpose**: Implementation-ready configuration notes including stack assimilation, token-to-code pipeline, theming, accessibility notes
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: Stack choices, Tailwind/Material mappings, accessibility implementation notes, decisions log
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/config-notes.md`

### design-system-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/design-system-template.md`
- **Purpose**: Platform-agnostic design system foundations with semantic tokens (colors, typography, spacing, radius, motion, icons)
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: Color palette JSON, CSS variables, Tailwind config, cross-stack mappings (Web/iOS/Android)
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/design-system.md`

### interactive-prototypes-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/interactive-prototypes-template.md`
- **Purpose**: Comprehensive interactive prototypes with system architecture, user flows, screen layouts, component library, state management
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: ASCII screen layouts, component specs, state YAML, navigation patterns, accessibility features
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/interactive-prototypes.md`

### navigation-state-patterns-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/navigation-state-patterns-template.md`
- **Purpose**: Navigation architecture and state management including routes, breadcrumbs, deep linking, browser history, keyboard shortcuts
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: Route YAML, state management specs, breakpoint configurations, navigation transitions
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/navigation-state-patterns.md`

### ui-interaction-patterns-template.md
- **Location**: `/Users/miles/.my_coding/templates/ui-design/ui-interaction-patterns-template.md`
- **Purpose**: UI-level interaction patterns and feedback systems including loading states, error handling, success patterns, micro-interactions
- **Used By**: UI-Designer agent
- **Instruction File**: UI designer instructions
- **Placeholders**: Feedback system specs, loading patterns, error handling flows, animation specifications
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/02-ui-design/ui-interaction-patterns.md`

### interaction-patterns-template.md
- **Location**: `/Users/miles/.my_coding/templates/ux-research/interaction-patterns-template.md`
- **Purpose**: Reusable interaction rules shared across flows/pages (navigation, forms, search, modals, loading/error conventions)
- **Used By**: UX-Researcher agent
- **Instruction File**: UX researcher instructions
- **Placeholders**: Pattern IDs (IP-XX), behavior descriptions, flow/page cross-references
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/01-ux-research/interaction-patterns.md`

### personas-template.md
- **Location**: `/Users/miles/.my_coding/templates/ux-research/personas-template.md`
- **Purpose**: Proto-personas derived from epics with goals, pain points, behaviors, accessibility considerations, and validation assumptions
- **Used By**: UX-Researcher agent
- **Instruction File**: UX researcher instructions
- **Placeholders**: Persona IDs (PR-XX), concept IDs, epic/flow references, confidence levels
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/01-ux-research/personas.md`

### user-flows-template.md
- **Location**: `/Users/miles/.my_coding/templates/ux-research/user-flows-template.md`
- **Purpose**: Screen inventory, navigation model, and core user flows with Mermaid diagrams and cross-reference matrices
- **Used By**: UX-Researcher agent
- **Instruction File**: UX researcher instructions
- **Placeholders**: Page IDs (P-XXX), flow IDs (F-XXX), concept IDs, happy/alternate paths
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/01-ux-research/user-flows.md`

### wireframes-template.md
- **Location**: `/Users/miles/.my_coding/templates/ux-research/wireframes-template.md`
- **Purpose**: Low-fidelity ASCII wireframes showing layout, hierarchy, and content zones (mobile and desktop) with screen states
- **Used By**: UX-Researcher agent
- **Instruction File**: UX researcher instructions
- **Placeholders**: ASCII layouts, page IDs, flow references, empty/loading/error state descriptions
- **Output Location**: `{{FOREMAN_ROOT}}/release-{{X}}/docs/01-ux-research/wireframes.md`

### labels.yaml
- **Location**: `/Users/miles/.my_coding/templates/github/labels.yaml`
- **Purpose**: Canonical GitHub label definitions with colors and descriptions for type, priority, status, area, phase, and dependency categories
- **Used By**: chain-send-issues workflow, GitHub issue creation
- **Instruction File**: Issue sending workflow
- **Placeholders**: None (static configuration)
- **Output Location**: Applied to GitHub repository labels

---

## Template-Instruction Pairs

The templates system works in conjunction with instruction files located in the foreman agents and commands. The relationship follows this pattern:

1. **Planning Phase**: `release-specification-template.md` paired with chain-plan-init command instructions
2. **Concept Phase**: `concept-checklist-template.md` and `concept-qa-documentation-template.md` paired with chain-concept-gen instructions
3. **Design Phase**: Architecture templates paired with system-architect agent instructions
4. **UX Phase**: UX research templates paired with ux-researcher agent instructions
5. **UI Phase**: UI design templates paired with ui-designer agent instructions
6. **Issue Phase**: Issue templates paired with context-manager and chain-issue-builder instructions
7. **Coordination**: Agent/command templates paired with create-project-agent-command-duo skill instructions

Templates provide the document structure while instruction files provide the execution logic and agent behavior.

---

## Key Insights

1. **Hierarchical Organization**: Templates are organized by domain (architecture, coordination, planning, UI, UX, pipeline) matching the phases of the foreman workflow.

2. **Traceability System**: ConceptIDs (CONCEPT-XXX) flow through all templates, enabling traceability from initial concepts through design, issues, and implementation.

3. **Multi-Agent Coordination**: The chain-context-template.md uses per-agent YAML blocks to provide agent-specific context within a shared document structure.

4. **Platform Agnosticism**: Design templates support multiple platforms (Web/iOS/Android) with explicit cross-platform mapping sections.

5. **MVP-First Approach**: Planning templates explicitly separate MVP scope from post-MVP enhancements.

6. **State Documentation**: UI templates comprehensively document all component states (default, hover, active, error, loading, disabled, empty).

7. **Accessibility Integration**: Multiple templates include dedicated accessibility sections ensuring WCAG compliance is considered from the start.

8. **Cost-Aware Deployment**: The deployment-decision-matrix template includes detailed cost analysis and scaling considerations.

9. **YAML-Based Decisions**: The chain-context-template uses structured YAML for decision matrices, enabling machine-readable decision tracking.

10. **Template Categories**:
    - Architecture: 4 templates
    - Coordination: 5 templates
    - Planning: 10 templates
    - Pipeline: 1 template
    - UI Design: 7 templates
    - UX Research: 4 templates
    - GitHub: 1 template
    - **Total: 32 templates**
