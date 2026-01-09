# Instructions Analysis

## Overview

The instructions directory (`/Users/miles/.my_coding/instructions/`) provides comprehensive guidance for filling templates, managing memory files, coordinating agents, executing assessments, and handling GitHub workflows. Instructions are paired with corresponding templates to ensure consistent document creation across planning, architecture, UI design, UX research, and pipeline configuration phases. The system follows a template-instruction pattern where each template has corresponding instructions that define placeholders, section guidance, quality checklists, and validation requirements.

## Instruction Categories

### Planning Instructions
Instructions for creating release specifications, issue plans, context documents, and QA documentation. These guide the creation of planning artifacts throughout the release lifecycle.

### Coordination Instructions
Instructions for agent orchestration, cross-agent communication, decision reconciliation, and impact assessment workflows. Define how multiple agents work together on complex tasks.

### Assessment Instructions
Instructions for impact assessments, gap analysis, and change verification. Guide the creation of comprehensive impact documentation for code changes.

### Memory Instructions
Instructions for CLAUDE.md file management at root, subtree, and cross-cutting levels. Define the memory system architecture and context loading patterns.

### Architecture Instructions
Instructions for technical documentation including API design, database schemas, infrastructure plans, and service integrations.

### UI Design Instructions
Instructions for visual design artifacts including component specs, design systems, prototypes, and interaction patterns.

### UX Research Instructions
Instructions for user research artifacts including personas, user flows, wireframes, and behavioral interaction patterns.

### GitHub Instructions
Instructions for GitHub issue workflows, templates, and agent work coordination.

### Pipeline Instructions
Instructions for CI/CD pipeline configuration and label management.

## Instructions Identified

### api-design-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/architecture/api-design-template-instructions.md`
- **Purpose**: Guide creation of API design documentation for releases
- **Used By**: chain-system-architect agent during architecture phase
- **Key Content**:
  - Section guidance for resource inventory, REST/GraphQL endpoints, security, contract testing
  - Placeholder definitions for API specifics (base URL, auth method, versioning)
  - Quality checklist for API documentation completeness
  - Concept mapping requirement ("Supports Concepts" field)
- **Related Templates**: `templates/architecture/api-design-template.md`
- **Dependencies**: Component specs, user flows (for ConceptID mapping)

### database-schema-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/architecture/database-schema-template-instructions.md`
- **Purpose**: Guide creation of database schema documentation
- **Used By**: chain-system-architect agent
- **Key Content**:
  - Section guidance for datastore selection, entity models, tables, lifecycle, migrations, performance
  - Placeholder definitions for database technology choices
  - ERD and DDL formatting guidance
- **Related Templates**: `templates/architecture/database-schema-template.md`
- **Dependencies**: None specified

### infrastructure-plan-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/architecture/infrastructure-plan-template-instructions.md`
- **Purpose**: Guide creation of infrastructure and deployment plans
- **Used By**: chain-system-architect agent
- **Key Content**:
  - Section guidance for environments, IaC, networking, observability, DR, cost
  - Placeholder definitions for IaC tools, secrets management, RPO/RTO targets
  - YAML formatting guidance for workflow snippets
- **Related Templates**: `templates/architecture/infrastructure-plan-template.md`
- **Dependencies**: None specified

### service-integration-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/architecture/service-integration-template-instructions.md`
- **Purpose**: Guide documentation of third-party service integrations
- **Used By**: chain-system-architect agent
- **Key Content**:
  - Section guidance for service selection, integration specs, global policies
  - Placeholder definitions for auth methods, rate limits, retry policies
  - Per-service integration specification format
- **Related Templates**: `templates/architecture/service-integration-template.md`
- **Dependencies**: None specified

### agent-scope-impact-matrix.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/agent-scope-impact-matrix.md`
- **Purpose**: Define agent ownership boundaries and cross-impact triggers
- **Used By**: chain-plan-design-green orchestrator
- **Key Content**:
  - Agent ownership mapping (chain-ux-researcher, chain-ui-designer, chain-system-architect)
  - Cross-agent impact scenarios and triggers
  - Decision keywords that cause cross-impacts (authentication, real-time, navigation, etc.)
  - Dispatch instruction format for re-dispatching agents
  - Round-based processing and completion criteria
- **Related Templates**: None (coordination guide)
- **Dependencies**: All design phase agents

### cross-agent-coordination-request-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/cross-agent-coordination-request-template-instructions.md`
- **Purpose**: Guide creation of coordination requests between agents
- **Used By**: All design phase agents
- **Key Content**:
  - Template for requesting coordination with other agents
  - Format for specifying decision context and required updates
  - Scope boundaries for coordination requests
- **Related Templates**: `templates/coordination/cross-agent-coordination-request-template.md`
- **Dependencies**: agent-scope-impact-matrix.md

### decision-reconciliation-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/decision-reconciliation-template-instructions.md`
- **Purpose**: Guide reconciliation of conflicting decisions across agents
- **Used By**: chain-plan-design-green orchestrator
- **Key Content**:
  - Format for documenting decision conflicts
  - Resolution process and documentation
  - Cross-reference requirements
- **Related Templates**: `templates/coordination/decision-reconciliation-template.md`
- **Dependencies**: agent-scope-impact-matrix.md

### agent-command-creation-standards.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/agent-command-creation-standards.md`
- **Purpose**: Define standards for creating agents and commands
- **Used By**: create-project-agent-command-duo skill
- **Key Content**:
  - Size constraints (agents <300 lines, commands vary by type)
  - Best practices (progressive disclosure, concise writing, structure)
  - Argument incorporation patterns (PATH, CONTEXT, GIT)
  - Frontmatter requirements for agents and commands
  - Naming conventions and verification checklist
  - Tool selection guidance
  - Error handling requirements
- **Related Templates**: None (standards document)
- **Dependencies**: None

### orchestration-patterns.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/orchestration-patterns.md`
- **Purpose**: Define patterns for multi-agent coordination
- **Used By**: Commands that orchestrate multiple agents
- **Key Content**:
  - Pattern types: Simple (1 agent), Sequential (2-3 agents), Parallel (N instances), Complex (3+ mixed)
  - Size limits per pattern type
  - Agent launch patterns (sequential, parallel, conditional)
  - Synthesis patterns for combining results
  - Task tool usage examples
  - Common orchestration patterns (Backend→Frontend, Assess→Implement→Verify)
- **Related Templates**: None (patterns document)
- **Dependencies**: agent-command-creation-standards.md

### impact-change-orchestration.md
- **Location**: `/Users/miles/.my_coding/instructions/coordination/impact-change-orchestration.md`
- **Purpose**: Define workflow phases for impact-change command
- **Used By**: impact-change command/skill
- **Key Content**:
  - 6-phase workflow (Assessment, Gap Analysis, User Approval, Implementation, UI Verification, Summary)
  - Agent assignment strategies (simple, moderate, complex)
  - Sequencing rules (backend before frontend)
  - Error handling for each phase
- **Related Templates**: None (orchestration guide)
- **Dependencies**: gap-analysis-checklist.md, impact-assessment-qrg-format.md

### gh-issue-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/github/gh-issue-instructions.md`
- **Purpose**: Define GitHub issue structure and templates
- **Used By**: chain-issue, chain-send-issues skills
- **Key Content**:
  - Plan template structure (tasks, implementation items, testing requirements)
  - Agent work completion comment structure
  - PR comment structure
  - User testing validation template
  - Guidelines for agents using templates
- **Related Templates**: None (workflow templates embedded)
- **Dependencies**: labels-instructions.md

### gh-issue-workflow.md
- **Location**: `/Users/miles/.my_coding/instructions/github/gh-issue-workflow.md`
- **Purpose**: Define required issue fields and sequencing strategy
- **Used By**: Issue creation agents
- **Key Content**:
  - Required issue fields (title, concepts, description, type, priority, status, area)
  - Agent sequencing strategy (framework→pipeline→backend→AI→frontend→reviewer)
  - Agent selection guidelines
  - Quality enforcement requirements
  - GitHub integration (labels, milestones, concept mapping)
  - Decision framework for scoping
- **Related Templates**: `templates/github/labels.yaml`
- **Dependencies**: concept-checklist-template-instructions.md

### root-claude-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/memory/root-claude-instructions.md`
- **Purpose**: Guide creation of root CLAUDE.md files
- **Used By**: memory-manager agent
- **Key Content**:
  - Template for root CLAUDE.md (Quick Start, Testing, Context Discovery Protocol, Service Map)
  - Generation guidance (minimal navigation guide philosophy)
  - Validation checklist (no @ syntax, commands project-specific, size ≤100 lines)
  - Domain list and service map structure
- **Related Templates**: None (template embedded)
- **Dependencies**: context-loading-model.md

### subtree-claude-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/memory/subtree-claude-instructions.md`
- **Purpose**: Guide creation of subtree CLAUDE.md files
- **Used By**: memory-manager agent
- **Key Content**:
  - Template structure (Purpose, Patterns, Key APIs, Dos/Don'ts, Dependencies, Documented Subdirectories)
  - Generation principles (summarize don't enumerate, essential over exhaustive, depth-aware sizing)
  - Size limits by depth level (L2: 120, L3: 100, L4: 75, L5+: 50 lines)
  - Content delegation rules
  - @path syntax for functional dependencies
- **Related Templates**: None (template embedded)
- **Dependencies**: context-loading-model.md, promotion-demotion-process.md

### context-loading-model.md
- **Location**: `/Users/miles/.my_coding/instructions/memory/context-loading-model.md`
- **Purpose**: Document how CLAUDE.md files are loaded during navigation
- **Used By**: All memory management operations
- **Key Content**:
  - Bottom-up traversal model (file→parent→root)
  - Principles: siblings don't load, subtrees on-demand, parents never import children, root has zero imports
  - Documented Subdirectories purpose and structure
  - Functional dependencies via @path
  - Context comparison (old vs new system)
  - Design implications and validation checklist
- **Related Templates**: None (architectural document)
- **Dependencies**: None (foundational)

### cross-cutting-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/memory/cross-cutting-instructions.md`
- **Purpose**: Guide creation of cross-cutting CLAUDE.md files
- **Used By**: memory-manager agent
- **Key Content**:
  - Templates by type (API Contracts, Security, Observability, CI/CD, Database)
  - Detection guidance for each cross-cutting concern
  - Generation process (summarize patterns, 3-5 key items per section)
  - Size limit ≤150 lines regardless of depth
  - Validation checklist
- **Related Templates**: None (templates embedded)
- **Dependencies**: context-loading-model.md

### promotion-demotion-process.md
- **Location**: `/Users/miles/.my_coding/instructions/memory/promotion-demotion-process.md`
- **Purpose**: Define when and how to promote/demote CLAUDE.md files
- **Used By**: memory-manager agent
- **Key Content**:
  - Promotion triggers and steps (when parent approaching size limit)
  - Demotion triggers and steps (when child below thresholds)
  - Size management workflow (condense first, then promote)
  - Examples of promotion and demotion scenarios
  - Multi-subdir structure examples
  - Validation checklists for both processes
- **Related Templates**: None (process document)
- **Dependencies**: context-loading-model.md, subtree-claude-instructions.md

### gh-actions-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/pipeline/gh-actions-template-instructions.md`
- **Purpose**: Guide creation of GitHub Actions workflow files
- **Used By**: pipeline-manager agent
- **Key Content**:
  - Section guidance for workflow triggers, jobs, steps
  - YAML validation requirements
  - Placeholder definitions for workflow specifics
- **Related Templates**: `templates/pipeline/gh-actions-template.yaml`
- **Dependencies**: None

### labels-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/pipeline/labels-instructions.md`
- **Purpose**: Define GitHub label taxonomy and usage
- **Used By**: Issue creation agents
- **Key Content**:
  - Label categories (type, priority, status, area, concept)
  - Color conventions
  - Application guidelines
- **Related Templates**: `templates/github/labels.yaml`
- **Dependencies**: None

### chain-context-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/chain-context-template-instructions.md`
- **Purpose**: Guide creation of context documents for chain workflows
- **Used By**: chain-plan-init skill
- **Key Content**:
  - Section guidance for project context, release scope, constraints
  - Placeholder definitions
  - Quality checklist
- **Related Templates**: `templates/planning/chain-context-template.md`
- **Dependencies**: None

### concept-checklist-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/concept-checklist-template-instructions.md`
- **Purpose**: Guide creation of concept tracking checklists
- **Used By**: chain-concept-gen skill
- **Key Content**:
  - ConceptID format and tracking requirements
  - Checklist structure for concept completion
  - Cross-reference requirements
- **Related Templates**: `templates/planning/concept-checklist-template.md`
- **Dependencies**: release-specification-template-instructions.md

### concept-qa-documentation-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/concept-qa-documentation-template-instructions.md`
- **Purpose**: Guide QA documentation for concepts
- **Used By**: QA agents
- **Key Content**:
  - Test case structure
  - Acceptance criteria format
  - Coverage tracking
- **Related Templates**: `templates/planning/concept-qa-documentation-template.md`
- **Dependencies**: concept-checklist-template-instructions.md

### context-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/context-template-instructions.md`
- **Purpose**: Guide creation of project context documents
- **Used By**: Planning agents
- **Key Content**:
  - Project background documentation
  - Technical context requirements
  - Stakeholder information
- **Related Templates**: `templates/planning/context-template.md`
- **Dependencies**: None

### deployment-decision-matrix-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/deployment-decision-matrix-template-instructions.md`
- **Purpose**: Guide deployment decision documentation
- **Used By**: chain-system-architect agent
- **Key Content**:
  - Decision criteria and weights
  - Option comparison format
  - Recommendation structure
- **Related Templates**: `templates/planning/deployment-decision-matrix-template.md`
- **Dependencies**: infrastructure-plan-template-instructions.md

### issue-map-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/issue-map-template-instructions.md`
- **Purpose**: Guide creation of issue dependency maps
- **Used By**: Issue planning agents
- **Key Content**:
  - Issue relationship documentation
  - Dependency graph format
  - Sequencing visualization
- **Related Templates**: `templates/planning/issue-map-template.md`
- **Dependencies**: issue-plan-template-instructions.md

### issue-overview-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/issue-overview-template-instructions.md`
- **Purpose**: Guide creation of issue overviews for releases
- **Used By**: Issue planning agents
- **Key Content**:
  - Overview structure (scope, goals, milestones)
  - Issue summary format
  - Release context
- **Related Templates**: `templates/planning/issue-overview-template.md`
- **Dependencies**: release-specification-template-instructions.md

### issue-plan-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/issue-plan-template-instructions.md`
- **Purpose**: Guide creation of detailed issue plans
- **Used By**: Issue planning agents
- **Key Content**:
  - Issue structure (problem, scope, acceptance criteria)
  - Agent mapping format
  - Task breakdown requirements
- **Related Templates**: `templates/planning/issue-plan-template.md`
- **Dependencies**: concept-checklist-template-instructions.md

### recommendation-report-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/recommendation-report-template-instructions.md`
- **Purpose**: Guide creation of recommendation reports
- **Used By**: Assessment agents
- **Key Content**:
  - Analysis structure
  - Recommendation format
  - Supporting evidence requirements
- **Related Templates**: `templates/planning/recommendation-report-template.md`
- **Dependencies**: None

### release-specification-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/release-specification-template-instructions.md`
- **Purpose**: Guide creation of release specification documents
- **Used By**: chain-plan-init skill
- **Key Content**:
  - Epic structure and requirements
  - Success criteria format
  - Scope definition guidelines
  - ConceptID creation requirements
- **Related Templates**: `templates/planning/release-specification-template.md`
- **Dependencies**: user-requirements-template-instructions.md

### user-requirements-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/user-requirements-template-instructions.md`
- **Purpose**: Guide creation of user requirements documents
- **Used By**: Planning agents
- **Key Content**:
  - Requirements gathering structure
  - User story format
  - Prioritization criteria
- **Related Templates**: `templates/planning/user-requirements-template.md`
- **Dependencies**: None

### granular-change-plan-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/planning/granular-change-plan-instructions.md`
- **Purpose**: Guide creation of detailed, fact-based change plans for work items
- **Used By**: plan-change skill, planning agents
- **Key Content**:
  - Document structure (overview, areas to consider, file-by-file plan, guardrails, dos/don'ts)
  - Quality standards (100% fact-based, no code snippets, specific and exact, actionable, complete)
  - Verification requirements using Glob/Grep/Read
  - Length guidelines (≤1,000 tokens target, 1,500 hard cap)
  - Example structure
  - Common pitfalls to avoid
- **Related Templates**: None (guidance document)
- **Dependencies**: impact-assessment-qrg-format.md, development-standards.mdc rule file

### gap-analysis-checklist.md
- **Location**: `/Users/miles/.my_coding/instructions/assessment/gap-analysis-checklist.md`
- **Purpose**: Define checklist for verifying impact assessment completeness
- **Used By**: impact-change command, gap analysis phase
- **Key Content**:
  - Completeness verification checklist (impacts, tests, error handling, dependencies, risk)
  - Common gaps identification
  - Gap verification process (verify with Grep/Glob/Read, don't invent requirements)
  - Gap filling guidelines (minimal, natural edits)
  - Example gap fill patterns
- **Related Templates**: None (checklist document)
- **Dependencies**: None

### impact-assessment-qrg-format.md
- **Location**: `/Users/miles/.my_coding/instructions/assessment/impact-assessment-qrg-format.md`
- **Purpose**: Define Quick Reference Guide format for impact assessments
- **Used By**: impact-change command, impact-assessment agents
- **Key Content**:
  - Single file format (≤3,000 tokens) with QRG block
  - Hierarchical format (>3,000 tokens) with _index.md as TOC
  - Agent findings numbering scheme
  - Master TOC entry format
- **Related Templates**: None (format specification)
- **Dependencies**: None

### component-mockups-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/component-mockups-template-instructions.md`
- **Purpose**: Guide creation of component mockup documentation
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Mockup documentation structure
  - Visual specification format
  - State documentation requirements
- **Related Templates**: `templates/ui-design/component-mockups-template.md`
- **Dependencies**: component-specs-template-instructions.md

### component-specs-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/component-specs-template-instructions.md`
- **Purpose**: Guide creation of component specification documents
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Component anatomy documentation
  - Props and state specifications
  - Accessibility requirements
  - ConceptID mapping requirement
- **Related Templates**: `templates/ui-design/component-specs-template.md`
- **Dependencies**: wireframes-template-instructions.md

### config-notes-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/config-notes-template-instructions.md`
- **Purpose**: Guide creation of configuration notes for UI components
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Configuration option documentation
  - Environment-specific settings
  - Feature flag documentation
- **Related Templates**: `templates/ui-design/config-notes-template.md`
- **Dependencies**: component-specs-template-instructions.md

### design-system-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/design-system-template-instructions.md`
- **Purpose**: Guide creation of design system documentation
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Token definitions (colors, typography, spacing)
  - Component library structure
  - Theme configuration
- **Related Templates**: `templates/ui-design/design-system-template.md`
- **Dependencies**: None

### interactive-prototypes-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/interactive-prototypes-template-instructions.md`
- **Purpose**: Guide creation of interactive prototype documentation
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Prototype scope documentation
  - Interaction flow descriptions
  - User testing scenario format
- **Related Templates**: `templates/ui-design/interactive-prototypes-template.md`
- **Dependencies**: component-specs-template-instructions.md, user-flows-template-instructions.md

### navigation-state-patterns-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/navigation-state-patterns-template-instructions.md`
- **Purpose**: Guide documentation of navigation and state management patterns
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Navigation pattern documentation
  - State management approach
  - Route configuration
- **Related Templates**: `templates/ui-design/navigation-state-patterns-template.md`
- **Dependencies**: user-flows-template-instructions.md

### ui-interaction-patterns-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ui-design/ui-interaction-patterns-template-instructions.md`
- **Purpose**: Guide documentation of UI interaction and feedback patterns
- **Used By**: chain-ui-designer agent
- **Key Content**:
  - Extensive placeholder definitions (200+ placeholders for comprehensive UI patterns)
  - Section guidance for interaction principles, feedback systems, loading/progress, error handling, success states, real-time patterns, accessibility, mobile adaptations, micro-interactions, pattern cross-reference
  - Quality checklist for interaction pattern completeness
- **Related Templates**: `templates/ui-design/ui-interaction-patterns-template.md`
- **Dependencies**: component-specs-template-instructions.md

### interaction-patterns-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ux-research/interaction-patterns-template-instructions.md`
- **Purpose**: Guide documentation of behavioral interaction patterns
- **Used By**: chain-ux-researcher agent
- **Key Content**:
  - Pattern template structure
  - Behavioral pattern documentation (not visual)
  - Cross-reference requirements
- **Related Templates**: `templates/ux-research/interaction-patterns-template.md`
- **Dependencies**: user-flows-template-instructions.md, wireframes-template-instructions.md

### personas-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ux-research/personas-template-instructions.md`
- **Purpose**: Guide creation of user persona documents
- **Used By**: chain-ux-researcher agent
- **Key Content**:
  - Persona structure (goals, behaviors, pain points, success criteria)
  - Primary Concepts field for ConceptID mapping
  - Epic and flow review requirements
- **Related Templates**: `templates/ux-research/personas-template.md`
- **Dependencies**: release-specification-template-instructions.md

### user-flows-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ux-research/user-flows-template-instructions.md`
- **Purpose**: Guide creation of user flow documentation
- **Used By**: chain-ux-researcher agent
- **Key Content**:
  - Screen/page inventory structure
  - Global navigation model
  - Core flow documentation format
  - "Implements Concepts" field for ConceptID mapping
  - Flow-page cross-reference matrix
- **Related Templates**: `templates/ux-research/user-flows-template.md`
- **Dependencies**: release-specification-template-instructions.md

### wireframes-template-instructions.md
- **Location**: `/Users/miles/.my_coding/instructions/ux-research/wireframes-template-instructions.md`
- **Purpose**: Guide creation of low-fidelity wireframe documentation
- **Used By**: chain-ux-researcher agent
- **Key Content**:
  - ASCII/text wireframe format
  - Page structure documentation
  - Component placement and flow references
- **Related Templates**: `templates/ux-research/wireframes-template.md`
- **Dependencies**: user-flows-template-instructions.md

## Cross-Instruction Patterns

### Template-Instruction Pairing
Every template file has a corresponding instruction file with the naming pattern `{template-name}-instructions.md`. Instructions provide:
- **How to use**: Step-by-step process
- **Placeholders**: List of all `{{...}}` placeholders to replace
- **Section-by-section guidance**: Purpose and format for each section
- **Quality checklist**: Validation requirements

### ConceptID Tracing
Multiple instructions require mapping content to ConceptIDs:
- Release specifications define concepts
- User flows map to "Implements Concepts"
- Component specs map to "Supports Concepts"
- Personas map to "Primary Concepts"
- Issues map to "Delivers Concepts"

### Depth-Scaled Sizing
Memory instructions enforce size limits based on directory depth:
- Root: ≤100 lines, no imports
- Level 2: ≤120 lines
- Level 3: ≤100 lines
- Level 4: ≤75 lines
- Level 5+: ≤50 lines
- Cross-cutting: ≤150 lines regardless of depth

### Agent Ownership Model
Coordination instructions define clear ownership boundaries:
- chain-ux-researcher: Flows, personas, wireframes, behavioral patterns
- chain-ui-designer: Components, design system, visual patterns
- chain-system-architect: API, database, infrastructure, integrations

### Orchestration Patterns
Commands follow defined patterns based on complexity:
- Simple (1 agent): <250 lines
- Sequential (2-3 agents): 350-450 lines
- Parallel (N instances): 350-450 lines
- Complex (3+ mixed): up to 500 lines

## Key Insights

1. **Comprehensive Coverage**: The instruction system covers the complete software development lifecycle from requirements through deployment, with specialized guidance for each phase.

2. **Memory System Architecture**: The memory instructions implement a sophisticated context loading system that minimizes token usage through bottom-up traversal, on-demand loading, and strict size limits by depth level.

3. **Agent Coordination**: The coordination instructions enable complex multi-agent workflows with clear ownership boundaries, impact detection, and cross-agent communication protocols.

4. **Fact-Based Planning**: Assessment and planning instructions emphasize 100% fact-based documentation verified through code examination (Glob/Grep/Read), preventing assumptions and speculation.

5. **Consistent Structure**: All template instructions follow a standard format (how to use, placeholders, section guidance, quality checklist), enabling consistent document creation across different agents and phases.

6. **ConceptID Traceability**: The system maintains full traceability from high-level concepts through implementation via ConceptID mapping in multiple document types.

7. **Graduated Detail**: Instructions scale appropriately - root files are minimal navigation guides while deeper files contain more specific implementation details, all within depth-appropriate size limits.

8. **GitHub Integration**: The GitHub instructions provide complete templates for issue creation, agent work tracking, PR comments, and user testing validation, enabling automated GitHub workflows.
