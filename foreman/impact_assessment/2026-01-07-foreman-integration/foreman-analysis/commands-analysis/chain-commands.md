# Chain-* Workflow Commands Analysis

## Overview

The chain-* workflow is a comprehensive orchestration pattern for software release planning and development. It provides an end-to-end pipeline from concept generation through issue execution, with specialized commands orchestrating multiple agents at each phase. The pattern emphasizes:

- **Autonomous Operation**: Commands operate without user intervention except at defined decision points
- **Template-Driven Output**: All documentation follows strict templates with corresponding instructions
- **Agent Orchestration**: Commands launch specialized agents rather than performing work directly
- **Seamless Updates**: Plan revision commands integrate changes without leaving modification traces
- **Activity Logging**: All commands log progress using the `log-activity` bash script

The chain-* workflow follows a linear progression: Concept Generation -> Planning Initialization -> Design Phase -> Issue Submission -> Issue Execution, with an optional branch for plan updates.

---

## Commands Identified

### chain-concept-gen

- **Purpose**: Assist in defining a concept for a new release through iterative Q&A, producing a concept checklist document
- **Agents Used**: None (direct orchestration)
- **Rules Referenced**: None directly
- **Instructions Referenced**:
  - `@foreman/instructions/planning/concept-checklist-template-instructions.md`
  - `@foreman/instructions/planning/concept-qa-documentation-template-instructions.md`
- **Scripts Executed**:
  - `foreman-templates install` - Ensures templates are installed
  - `log-activity release <X> "message"` - Activity logging
  - `handoff-claude "/chain-plan-init" "{RELEASE_NUMBER}" --app iterm --cwd "{PROJECT_ROOT}"` - Handoff to next phase
  - `exit-shell` - Terminates the session
- **Workflow**:
  1. Initialize Foreman by installing templates
  2. Understand the concept from user input or provided files
  3. Build concept checklist using template
  4. Engage in iterative Q&A refinement (5 phases: Vision, Discovery, Refinement, Categorization, Deployment Context)
  5. Create final checklist and Q&A documentation
  6. Handoff to chain-plan-init when 95% confidence achieved
- **Dependencies**:
  - Requires: User-provided concept description or file
  - Outputs to: chain-plan-init

---

### chain-plan-init

- **Purpose**: Orchestrate specification file creation for a new release based on the concept checklist
- **Agents Used**: None (direct orchestration)
- **Rules Referenced**: None directly
- **Instructions Referenced**:
  - `@foreman/instructions/planning/release-specification-template-instructions.md`
- **Scripts Executed**:
  - `log-activity release <X> "message"` - Activity logging
  - `handoff-claude "/chain-plan-design-green" "$1" --app iterm --cwd "{PROJECT_ROOT}"` - Handoff to design phase
  - `exit-shell` - Terminates the session
- **Workflow**:
  1. Read template instructions
  2. Read concept checklist
  3. Use release specification template
  4. Fill all placeholders per instructions
  5. Complete quality checklist
  6. Save to correct location
  7. Resolve outstanding questions autonomously
  8. Handoff to chain-plan-design-green
- **Dependencies**:
  - Requires: chain-concept-gen output (concept-checklist.md)
  - Outputs to: chain-plan-design-green

---

### chain-plan-design-green

- **Purpose**: Orchestrate the complete design phase for a new release, coordinating multiple specialized agents
- **Agents Used**:
  - `chain-prototype-researcher` (Phases 1, 1b)
  - `chain-ux-researcher` (Step 2)
  - `chain-ui-designer` (Step 3)
  - `chain-system-architect` (Step 4)
  - `chain-whimsy-injector` (Step 6)
  - `chain-issue-builder` (Step 7)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc` (via agents)
  - `@foreman/rules/system-standards.mdc` (via agents)
- **Instructions Referenced**:
  - `@foreman/instructions/coordination/agent-scope-impact-matrix.md`
  - `@foreman/instructions/coordination/cross-agent-coordination-request-template-instructions.md`
- **Scripts Executed**:
  - `log-activity release $1 "message"` - Activity logging
  - `handoff-claude "/chain-send-issues" "$1" --app iterm --cwd "{PROJECT_ROOT}"` - Handoff to issue submission
  - `exit-shell` - Terminates the session
- **Workflow**:
  1. Launch chain-prototype-researcher (mode: research)
  1a. **USER DECISION POINT**: Deployment decision review
  1b. Launch chain-prototype-researcher (mode: finalize)
  2. Launch chain-ux-researcher for user flows, personas, wireframes
  3. Launch chain-ui-designer for component specifications
  4. Launch chain-system-architect for technical architecture
  5. Decision reconciliation coordination (cross-agent)
  5a. **OPTIONAL USER INPUT**: Cross-agent coordination uncertainty
  6. Launch chain-whimsy-injector for UI/UX enhancement
  7. Launch chain-issue-builder for issue generation
  8. **USER DECISION POINT**: User requirements review
  9. User approval of plan
  10. Handoff to chain-send-issues
- **Dependencies**:
  - Requires: chain-plan-init output (release specification)
  - Outputs to: chain-send-issues

---

### chain-send-issues

- **Purpose**: Submit generated issues to GitHub and integrate user requirements
- **Agents Used**: None (direct orchestration using GitHub MCP/CLI)
- **Rules Referenced**:
  - `@foreman/templates/github/labels.yaml` (for label specs)
- **Instructions Referenced**: None directly
- **Scripts Executed**:
  - GitHub MCP or GH CLI for issue creation
  - `handoff-claude "/chain-issue" "{FIRST_ISSUE}" --app iterm --cwd "{PROJECT_ROOT}"` - Handoff to issue execution
  - `log-activity release $1 "message"` - Activity logging
- **Workflow**:
  1. Read and integrate user-requirements.md
  2. Analyze issue-plan.md
  3. For each issue: extract metadata, issue content, prior art references
  4. Include user requirements sections where relevant
  5. Submit issues sequentially numbered (Issue 001, Issue 002, etc.)
  6. Update issue-plan.md with GitHub issue numbers
  7. Update individual issue files with GitHub numbers
  8. Update DependsOn columns with GitHub issue numbers
  9. Handoff to chain-issue for first issue
- **Dependencies**:
  - Requires: chain-plan-design-green outputs (issue-plan.md, issue-map/, user-requirements.md)
  - Outputs to: chain-issue

---

### chain-issue

- **Purpose**: Execute development work on individual GitHub issues through coordinated agent cycles
- **Agents Used**:
  - `chain-issue-updater` (planning for each agent)
  - `test-manager` (preflight test creation)
  - `framework-manager` (conditional, for framework setup)
  - `backend-architect` / `backend-worker` (backend development)
  - `frontend-developer` / `frontend-worker` (frontend development)
  - `ai-engineer` / `ai-technician` (AI/ML development)
  - `troubleshooting-investigator` (blocking issues)
  - `reviewerpr` (PR review)
  - `documentation-updater` (post-merge docs)
  - `memory-manager` (post-merge CLAUDE.md updates)
- **Rules Referenced**:
  - `@foreman/rules/development-standards.mdc`
  - `@foreman/rules/system-standards.mdc`
  - `@foreman/rules/test-organization.mdc`
  - `@foreman/rules/diagram-standard.mdc`
  - `@foreman/templates/github/labels.yaml`
- **Instructions Referenced**:
  - `@foreman/instructions/github/gh-issue-workflow.md`
- **Scripts Executed**:
  - GitHub MCP/CLI for issue management
  - Git commands for branch management (tags, branches)
  - `log-activity release $1 "message"` - Activity logging
- **Workflow**:
  1. Review and understand the GitHub issue
  2. Branch Management:
     - Create tag on main (gh-issue-N-start)
     - Create branch (issueN-tdd) for multi-agent workflows
     - Stay on main for chain-issue-updater only workflows
     - Update issue status label (todo -> in-progress)
  3. Iterative Agent Planning and Execution:
     3.1 Pre-Agent: chain-issue-updater creates plan, test-manager creates tests
     3.2 Agent Execution Coordination
     3.2.1 Worker Orchestration (for parent agents)
     3.3 Immediate Agent Launch
     3.4 Blocking Issue Intervention (troubleshooting-investigator)
     3.5 Unfinished Work Detection
     3.6 Type Error Resolution Check
     3.7 Proceed to Next Agent
  4. Post-Agent Cycle: Update labels, create PR
  5. Launch ReviewerPR agent
  6. **USER DECISION POINT**: User Testing Validation
  7. Merge Pull Request
  8. Launch Documentation-Updater and Memory-Manager
  9. Final Step: Exit and log completion
- **Dependencies**:
  - Requires: chain-send-issues output (GitHub issues)
  - Self-continuing: chains to next issue automatically

---

### chain-plan-design-update

- **Purpose**: Orchestrate plan revision for an existing release when direction changes, making seamless updates
- **Agents Used**:
  - `chain-update-researcher` (conditional, for new services/templates)
  - `chain-ux-updater`
  - `chain-ui-updater`
  - `chain-architecture-updater`
  - `chain-issue-plan-updater` (parallel execution for multiple issues)
- **Rules Referenced**: None directly
- **Instructions Referenced**:
  - `@instructions/coordination/orchestration-patterns.md`
  - `@instructions/coordination/impact-change-orchestration.md`
  - `@instructions/coordination/agent-scope-impact-matrix.md`
- **Scripts Executed**:
  - `mkdir -p foreman/release-$1/docs/00-planning/update-$2` - Create update directory
  - Activity logging commands
- **Workflow**:
  0. Setup update directory
  1. Analyze change impact against existing documentation
  1a. **CONDITIONAL USER DECISION POINT**: Research phase (if new services needed)
  2. Launch chain-ux-updater for UX documentation
  3. Launch chain-ui-updater for UI documentation
  4. Launch chain-architecture-updater for architecture documentation
  5. Issue plan analysis (identify states, insertion points)
  6. User requirements update (if new requirements introduced)
  7. **Parallel Execution**: Launch chain-issue-plan-updater for each issue (create/modify)
  8. Validation (no open questions, no change references, proper sequencing)
  9. **CONDITIONAL USER DECISION POINT**: User requirements review
  10. Generate completion report
- **Dependencies**:
  - Requires: Existing release documentation
  - Uses letter suffixes for issue insertion (e.g., 004a, 004b)
  - Respects issue completion states

---

## Supporting Chain-* Agents

These agents are launched by the chain-* commands but are defined in the agents directory:

### chain-prototype-researcher
- **Purpose**: Research and score templates, APIs, and services for development acceleration
- **Modes**: "research" (Phase 1) and "finalize" (Phase 2)
- **Outputs**: templates.yaml, apis.yaml, services.yaml, compositions.yaml, deployment-decision-matrix.md, recommendation-report.md

### chain-ux-researcher
- **Purpose**: Translate release specifications into UX research deliverables
- **Outputs**: user-flows.md, personas.md, wireframes.md, interaction-patterns.md
- **Self-reconciliation**: Logs decisions to coordination/decision-log.md

### chain-ui-designer
- **Purpose**: Transform UX research into production-ready design systems
- **Outputs**: component-specs.md, config-notes.md, design-system.md, component-markups.md, interactive-prototypes.md, ui-interaction-patterns.md, navigation-state-patterns.md
- **Self-reconciliation**: Logs decisions to coordination/decision-log.md

### chain-system-architect
- **Purpose**: Convert technology choices into architecture documentation
- **Outputs**: api-design.md, service-integration.md, database-schema.md, infrastructure-plan.md
- **Self-reconciliation**: Logs decisions to coordination/decision-log.md

### chain-whimsy-injector
- **Purpose**: Enhance UI/UX with delightful interactions and personality
- **Outputs**: Minor adjustments to component-specs.md and wireframes.md

### chain-issue-builder
- **Purpose**: Create atomic, sequenced issue plans for development
- **Outputs**: issue-plan.md, issue-map/ folder, issue-overview.md, user-requirements.md

### chain-issue-updater
- **Purpose**: Supporting agent for chain-issue providing advanced planning and context
- **Modes**: Mode A (Pre-Agent Planning) and Mode B (Standalone Issue Work)
- **Outputs**: GitHub issue comments with agent plans, folder scoping

### chain-issue-creator
- **Purpose**: Convert planning documents into GitHub issues
- **Outputs**: GitHub issues from issue-plan.md

### chain-update-researcher
- **Purpose**: Targeted research for plan updates (brownfield mode)
- **Outputs**: release{{X}}-update-report.md

### chain-ux-updater
- **Purpose**: Seamless minimal updates to UX documentation
- **Constraint**: No change markers or references

### chain-ui-updater
- **Purpose**: Seamless minimal updates to UI design documentation
- **Constraint**: No change markers or references

### chain-architecture-updater
- **Purpose**: Seamless minimal updates to architecture documentation
- **Constraint**: No change markers or references

### chain-issue-plan-updater
- **Purpose**: Create/modify issue YAML files and sync with GitHub
- **Modes**: CREATE (with letter suffixes) and MODIFY (edit existing)
- **GitHub Editing**: Uses --edit-last for single comments, GraphQL API for multi-comment issues

---

## Workflow Dependency Graph

```
chain-concept-gen
        |
        v
chain-plan-init
        |
        v
chain-plan-design-green ---------> [chain-plan-design-update]
  |                                       (branch for revisions)
  |-- chain-prototype-researcher
  |-- chain-ux-researcher
  |-- chain-ui-designer
  |-- chain-system-architect
  |-- chain-whimsy-injector
  |-- chain-issue-builder
        |
        v
chain-send-issues
        |
        v
chain-issue (loops through all issues)
  |-- chain-issue-updater
  |-- test-manager
  |-- [backend-architect/frontend-developer/ai-engineer]
  |-- [worker agents]
  |-- troubleshooting-investigator
  |-- reviewerpr
  |-- documentation-updater
  |-- memory-manager
```

---

## Key Patterns

### Activity Logging
All commands use standardized logging:
```bash
log-activity release <release-id> [agent <agent-name>] "message"
```

### Handoff Protocol
Commands transfer control using:
```bash
handoff-claude "/<command>" "<args>" --app iterm --cwd "{PROJECT_ROOT}"
```

### User Decision Points
- Deployment decisions (chain-plan-design-green Step 1a)
- Cross-agent coordination uncertainty (chain-plan-design-green Step 5a)
- User requirements review (chain-plan-design-green Step 8)
- User testing validation (chain-issue Step 6)
- Research approval for updates (chain-plan-design-update Step 1a)

### Template-Instruction Pairs
Every output document is created by:
1. Reading the corresponding `-template-instructions.md` file
2. Using the `-template.md` file
3. Saving to the specified location with exact filename

### Seamless Update Philosophy
Plan update commands (chain-plan-design-update and supporting updater agents) follow strict rules:
- No "updated," "added," "changed" language
- Changes appear as if originally written
- No open questions allowed
- Letter suffixes for issue insertion (004a, 004b)
- Respect completion states (never modify "done" issues)
