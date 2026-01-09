# Templates Analysis

## Overview
The foreman templates system provides structured formats for documentation, planning, coordination, and implementation artifacts. Each template uses Mustache-style `{{PLACEHOLDER}}` syntax and is paired with an instruction file providing section-by-section guidance. Templates enforce consistency, completeness, and traceability across the development lifecycle.

## Categories Identified
1. Planning Templates (8) - Release specs, issue plans, concept documents
2. Coordination Templates (5) - Agent/command creation, orchestration patterns
3. Architecture Templates (4) - API design, database schema, infrastructure
4. UI Design Templates (7) - Component specs, design systems, prototypes
5. UX Research Templates (4) - User flows, personas, wireframes
6. Pipeline Templates (1) - GitHub Actions CI/CD workflows
7. GitHub Templates (1) - Issue label taxonomy

## Detailed Analysis

### Planning Templates
**Templates in this category:**
- **release-specification-template.md**: Complete release definition
  - Sections: Overview, Objectives, Scope, User Stories, Architecture, Technical Considerations, Timeline, Success Criteria, Deployment Plan
  - Concept ID: `{{CONCEPT_ID}}` for traceability
  - Deployment decision matrix for environment selection
  - Paired with: release-specification-template-instructions.md

- **issue-plan-template.md**: Atomic issue breakdown
  - Sections: Issue list with sequencing, agent assignments, dependencies, acceptance criteria
  - Supports letter-suffix insertions (004a, 004b) for completed issues
  - Paired with: issue-plan-template-instructions.md

- **concept-checklist-template.md**: High-level requirements checklist
  - 5-phase structure: Vision, Discovery, Refinement, Categorization, Deployment Context
  - Confidence scoring (target: ≥95%)
  - Paired with: concept-checklist-template-instructions.md

- **concept-qa-documentation-template.md**: Iterative Q&A capture
  - Question-answer pairs organized by phase
  - Decision rationale tracking
  - Paired with: concept-qa-documentation-template-instructions.md

- **issue-overview-template.md**: Visual issue relationship map
  - Mermaid flowchart showing issue dependencies
  - Status tracking (pending, in-progress, completed)
  - Agent assignments per issue
  - Paired with: issue-overview-template-instructions.md

- **user-requirements-template.md**: User-facing feature requirements
  - Prioritized feature list
  - User journey mapping
  - Deployment constraints
  - Paired with: user-requirements-template-instructions.md

**Referenced by:**
- Commands: chain-concept-gen, chain-plan-init, chain-issue-builder, chain-send-issues
- Agents: chain-issue-builder

### Coordination Templates
**Templates in this category:**
- **agent-template.md**: Standard agent structure
  - Sections: Purpose, Methodology, Rules, Instructions, Tools, Workflow
  - Size constraint: 300 lines maximum
  - YAML frontmatter for metadata
  - Paired with: agent-template-instructions.md

- **command-template.md**: Standard command structure
  - Simple commands: 250 lines max
  - Orchestration commands: 350-500 lines
  - Step-by-step workflow
  - Paired with: command-template-instructions.md

- **cross-agent-coordination-request-template.md**: Multi-agent coordination
  - Sections: Affected Areas, Cross-Cutting Concerns, Coordination Strategy, Decision Matrix
  - Supports single coordinator, sequential handoff, parallel execution patterns
  - Paired with: cross-agent-coordination-request-template-instructions.md

- **orchestration-workflow-template.md**: Complex workflow orchestration
  - Phase definitions with agent assignments
  - Sequential vs parallel execution specifications
  - Quality gates and approval points
  - Paired with: orchestration-workflow-template-instructions.md

- **agent-assignment-matrix-template.md**: Per-agent instruction YAML
  - Precise work scope per agent
  - File-level responsibilities
  - Folder scoping for context restriction
  - Paired with: agent-assignment-matrix-template-instructions.md

**Referenced by:**
- Commands: chain-plan-design-green, create-project-agent-command-duo
- Agents: command-agent-duo, coordination orchestrators

### Architecture Templates
**Templates in this category:**
- **api-design-template.md**: RESTful/GraphQL API specification
  - Sections: Endpoints, Request/Response schemas, Authentication, Error handling, Rate limiting
  - OpenAPI/GraphQL schema integration
  - Paired with: api-design-template-instructions.md

- **database-schema-template.md**: Database design documentation
  - Sections: Entity definitions, Relationships, Indexes, Migrations, Constraints
  - Mermaid ER diagrams
  - Paired with: database-schema-template-instructions.md

- **infrastructure-plan-template.md**: Deployment infrastructure
  - Sections: Services, Dependencies, Scaling strategy, Monitoring, Disaster recovery
  - Architecture diagrams
  - Paired with: infrastructure-plan-template-instructions.md

- **service-integration-template.md**: External service integration
  - Sections: Service overview, Authentication, Endpoints, Error handling, Fallback strategies
  - Rate limiting and retry policies
  - Paired with: service-integration-template-instructions.md

**Referenced by:**
- Commands: chain-plan-design-green, update-plans
- Agents: chain-system-architect, chain-architecture-updater

### UI Design Templates
**Templates in this category:**
- **component-specs-template.md**: React/Vue/Angular component specifications
  - Sections: Component hierarchy, Props/API, State management, Styling, Accessibility
  - Behavior definitions per component
  - Paired with: component-specs-template-instructions.md

- **design-system-template.md**: Design tokens and component library
  - Sections: Color palette, Typography, Spacing, Components, Patterns
  - Token definitions (CSS variables, Tailwind config, etc.)
  - Paired with: design-system-template-instructions.md

- **design-config-notes-template.md**: Implementation notes for designers
  - Sections: Framework choice rationale, Library usage, Custom vs library components
  - Deviations from standard patterns
  - Paired with: design-config-notes-template-instructions.md

- **prototype-recommendations-template.md**: Template/library selection
  - Sections: Recommended templates, UI libraries, Scoring rationale, Integration notes
  - Decision matrix for selections
  - Paired with: prototype-recommendations-template-instructions.md

- **deployment-decision-matrix-template.md**: Hosting and deployment choices
  - Sections: Platform options, Scoring criteria, Selected platform, Implementation notes
  - Infrastructure requirements
  - Paired with: deployment-decision-matrix-template-instructions.md

**Referenced by:**
- Commands: chain-plan-design-green, chain-plan-design-update
- Agents: chain-ui-designer, chain-ui-updater, chain-prototype-researcher

### UX Research Templates
**Templates in this category:**
- **user-flows-template.md**: User journey documentation
  - Sections: Flow diagrams (Mermaid), Decision points, Success/error paths
  - Entry/exit conditions
  - Paired with: user-flows-template-instructions.md

- **personas-template.md**: User persona definitions
  - Sections: Demographics, Goals, Pain points, Behaviors, Technical proficiency
  - 3-5 personas per project
  - Paired with: personas-template-instructions.md

- **wireframes-template.md**: Low-fidelity interface layouts
  - Sections: Screen layouts, Navigation, Content hierarchy, Interactions
  - ASCII or Mermaid diagram format
  - Paired with: wireframes-template-instructions.md

- **interaction-patterns-template.md**: UX pattern library
  - Sections: Pattern catalog, When to use, Examples, Accessibility considerations
  - Reusable interaction definitions
  - Paired with: interaction-patterns-template-instructions.md

**Referenced by:**
- Commands: chain-plan-design-green, chain-plan-design-update
- Agents: chain-ux-researcher, chain-ux-updater

### Pipeline Templates
**Templates in this category:**
- **github-actions-workflow-template.yml**: CI/CD pipeline definition
  - Sections: Build, Test, Lint, Security scan, Deploy stages
  - Multi-environment support (dev, staging, prod)
  - Test framework integration (Jest, RSpec, Playwright)
  - Rollback mechanisms
  - Paired with: github-actions-workflow-template-instructions.md

**Referenced by:**
- Commands: Chain-issue workflow (conditional pipeline setup)
- Agents: pipeline-manager

### GitHub Templates
**Templates in this category:**
- **labels.yaml**: Issue label taxonomy
  - Categories: Type (feature, bug, refactor), Status (needs-review, blocked), Priority (high, medium, low), Area (frontend, backend, infrastructure)
  - Color coding and descriptions
  - Paired with: labels-template-instructions.md

**Referenced by:**
- Commands: chain-issue, chain-send-issues
- Agents: GitHub integration workflows

## Pattern Summary

**Template-Instruction Pairing**: Every template has a corresponding instruction file providing detailed section guidance and completion criteria.

**Mustache Syntax**: All templates use `{{PLACEHOLDER}}` syntax for dynamic content, enabling programmatic population.

**Concept ID Traceability**: Planning templates embed `{{CONCEPT_ID}}` linking concept → spec → design → issues → implementation.

**Size Constraints**: Templates enforce length limits (agents: 300 lines, simple commands: 250 lines, orchestration: 350-500 lines).

**YAML Decision Matrices**: Complex templates include structured decision documentation (deployment, technology selection, agent assignment).

**Mermaid Diagrams**: Visual templates (flows, schemas, architecture) embed Mermaid diagram definitions following diagram-standard.mdc.

**Multi-Level Organization**: Templates organize by:
  - Domain: Planning, UX, UI, Architecture
  - Abstraction level: High-level (release spec) → Low-level (component specs)
  - Stakeholder: Product (user stories) → Engineering (API design) → DevOps (infrastructure)
  - Lifecycle phase: Concept → Design → Implementation → Deployment

**Consistency Enforcement**: Templates ensure uniform structure across projects, enabling pattern recognition and reuse.

**Progressive Disclosure**: Templates support both quick-start and comprehensive documentation depending on project complexity.

**Integration Points**: Templates consumed by:
  - chain-* commands for workflow orchestration
  - chain-* agents for autonomous document generation
  - update commands for seamless modification
  - CI/CD pipelines for validation (docs-lint, diagram validation)
