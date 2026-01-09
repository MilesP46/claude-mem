# Issue Map — Release {{X}} — **Instructions**

- **Template file:** `templates/planning/issue-map-template.yaml`
- **Who fills this:** The `chain-issue-builder` agent; if unspecified, the owning agent for this stage.
- **Output structure:** Individual YAML files in `issue-map/` folder, one file per issue
- **File naming:** `issue-001.yaml`, `issue-002.yaml`, etc.
- **Editing rules:** Keep tiered YAML structure intact; use 2-space indentation; quote strings when needed; write concise, actionable content.

## How to use

1. **Create issue-map folder:** `foreman/release-{{X}}/docs/00-planning/issue-map/`
2. **Review all planning documents** to understand which ConceptIDs are being implemented.
3. **For each issue:** Create a separate YAML file using the template:
   - **File naming:** `issue-001.yaml`, `issue-002.yaml`, `issue-003.yaml`, etc.
   - **Fill in metadata:** Set `{{issue_key}}` to match the file number (e.g., "001", "002")
   - **Fill in identification:** Set `{{sequence_number}}` to the numeric value (e.g., 1, 2, 3)
4. **Fill in all placeholders** and required sections for each issue file.
5. **Map each issue to ConceptIDs** it delivers using the "delivers_concepts" field in Tier 2.
6. **Configure agent workflows** in Tier 3 with appropriate task breakdown and agent roles.
7. Keep **tiered YAML structure** and field names unchanged unless explicitly allowed.
8. **Validate YAML syntax** for each individual file before saving.
9. **Commit all issue files** to the release docs folder.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

### Metadata Placeholders

- `{{X}}` — provide release number; do **not** leave braces.
- `{{S}}` — provide sprint number; do **not** leave braces.
- `{{YYYY-MM-DD}}` — provide creation date; do **not** leave braces.
- `{{issue_key}}` — provide issue identifier (e.g., "001", "002"); do **not** leave braces.
- `{{sequence_number}}` — provide issue number as integer (e.g., 1, 2); do **not** leave braces.

### Tier 1: Identification Placeholders

- `{{Foo Issue Title}}` — provide concise, action-oriented title; do **not** leave braces.
- `{{What to build/fix}}` — provide one paragraph summary; do **not** leave braces.
- `{{feat}}` — provide issue type (feat|fix|chore|refactor); do **not** leave braces.
- `{{P1}}` — provide priority (P0|P1|P2); do **not** leave braces.
- `{{todo}}` — provide status (todo|in-progress|blocked|review|done); do **not** leave braces.
- `{{api}}` — provide area (api|ui|db|infra|security|devex|docs); do **not** leave braces.
- `{{dev}}` — provide phase (dev|build|deploy); **CRITICAL**: use "dev" for all development work; do **not** leave braces.

### Tier 2: Planning Placeholders

- `{{CONCEPT-001}}` — provide ConceptID from concept-checklist.md; do **not** leave braces.
- `{{What's broken, needed, or missing}}` — provide problem description; do **not** leave braces.
- `{{Explicitly out of scope}}` — provide non-goals; do **not** leave braces.
- `{{src/components/feature/}}` — provide primary folder path; **filled by chain-issue-updater**; do **not** leave braces.
- `{{src/utils/}}` — provide secondary folder path; **filled by chain-issue-updater**; do **not** leave braces.
- `{{legacy/}}` — provide excluded folder path; **filled by chain-issue-updater**; do **not** leave braces.
- `{{Testable outcomes using Given/When/Then or bullet list}}` — provide acceptance criteria; do **not** leave braces.

### Tier 3: Execution Placeholders

- `{{X days}}` — provide estimated duration; do **not** leave braces.
- `{{authentication}}` — provide capability block name; do **not** leave braces.
- `{{framework-manager}}` — provide agent name; do **not** leave braces.
- `{{backend-architect}}` — provide agent name; do **not** leave braces.
- `{{setup}}` — provide execution phase (setup|implementation|validation|review); do **not** leave braces.
- `{{Set up project structure and dependencies}}` — provide detailed task description; do **not** leave braces.
- `{{Configured development environment}}` — provide deliverable description; do **not** leave braces.

### Tier 4: Integration Placeholders

- `{{TDD/BDD approach}}` — provide testing strategy; do **not** leave braces.
- `{{X%}}` — provide coverage target; do **not** leave braces.
- `{{unit}}` — provide test type; do **not** leave braces.
- `{{depends-on:issue-number}}` — provide dependency label if applicable; do **not** leave braces.
- `{{parallel-ok}}` — add if issue can run in parallel; do **not** leave braces.
- `{{sequential}}` — add if issue must run sequentially; do **not** leave braces.
- `{{Rollback strategy if applicable}}` — provide rollback plan; do **not** leave braces.
- `{{Feature flag requirements}}` — provide feature flag needs; do **not** leave braces.
- `{{What to monitor post-deployment}}` — provide monitoring requirements; do **not** leave braces.
- `{{Any technical debt incurred}}` — provide technical debt notes; do **not** leave braces.
- `{{How to address debt later}}` — provide debt mitigation plan; do **not** leave braces.
- `{{Additional notes or dependencies}}` — provide notes; do **not** leave braces.

## Tiered Structure Guidance

### Tier 1: Issue Identification

- **identification.sequence_number** — Sequential integers starting from 1.
- **identification.title** — Concise, action-oriented title.
- **identification.short_description** — One paragraph summary of what to build/fix.
- **identification.type/priority/status/area** — Standard categorization fields.
- **identification.phase** — **CRITICAL**: Use "dev" for development work, "build" for build/system integration, "deploy" for deployment. **ALL dev work must come before build work.**

### Tier 2: Planning & Requirements

- **planning.delivers_concepts** — **CRITICAL**: Map to ConceptIDs from concept-checklist.md that this issue implements.
- **planning.scope.problem** — Clear description of what's broken, needed, or missing.
- **planning.scope.non_goals** — Array of explicit exclusions to prevent scope creep.
- **planning.scope.folders** — **Added by chain-issue-updater**: Folder scoping for context restriction with primary, secondary, and excluded folders.
- **planning.acceptance_criteria** — Array of testable outcomes; prefer Given/When/Then format.
- **planning.dependencies** — Use arrays for `blocks` and `blocked_by` with sequence numbers.

### Tier 3: Execution & Orchestration

- **execution.workflow.parallel_execution** — Boolean indicating if this can run parallel to other issues.
- **execution.workflow.capability_block** — What specific capability this issue delivers (e.g., "authentication", "user-management").
- **execution.workflow.estimated_duration** — Rough time estimate for planning purposes.
- **execution.agents.required_agents**: All agents needed for this capability block with roles and execution phases.
- **execution.agents.task_breakdown** — Sequential task list with agent assignments, execution phases, deliverables, and effort estimates.

### Tier 4: Quality & Integration

- **integration.github** — GitHub-specific fields (issue_number, issue_url, labels). **CRITICAL**: Labels must include phase label.
- **integration.quality.testing** — Testing strategy, coverage targets, and test types.
- **integration.quality.deployment** — Rollback plans, feature flags, and monitoring requirements.
- **integration.quality.technical_debt** — Debt incurred and mitigation plans.
- **integration.notes** — Additional notes or dependencies.

## YAML Requirements

- Use **2-space indentation** consistently
- Quote strings containing special characters or spaces
- Use `null` for empty values, not empty strings
- Arrays use dash notation (`- item`)
- Validate YAML syntax before saving

## Agent Workflow Configuration

### Capability Block Approach

- **capability_block** — Each issue delivers a specific capability (e.g., "authentication", "user-profile", "payment-processing").
- **required_agents** — All agents needed for the capability block with equal importance:
  - `implementer` — Contributes to implementation
  - `reviewer` — Reviews work and provides feedback
  - `consultant` — Provides expertise or guidance
  - `tester` — Focuses on testing and validation

### Agent Execution Phases

- `setup` — Initial setup, scaffolding, configuration
- `implementation` — Core development, feature building
- `validation` — Testing, verification, quality assurance
- `review` — Code review, final validation

### Phase Sequencing (CRITICAL)

- **ALL development issues must use phase: "dev"**
- **Build issues must use phase: "build" and come AFTER all dev work**
- **Deploy issues must use phase: "deploy" and come AFTER build work**
- This prevents unnecessary build tests during active development

### Folder Scoping (Added by chain-issue-updater)

- **primary** — Core folders where most work happens
- **secondary** — Supporting folders that may need updates
- **excluded** — Folders explicitly out of scope
- Optimizes agent context and improves development efficiency

### Task Breakdown

- Each task should have a clear `sequence`, assigned `agent`, `execution_phase`, specific `task` description, expected `deliverable`, and `estimated_effort`.
- Tasks should be atomic and independently completable.
- Deliverables should be concrete and verifiable.

## Integration with chain-issue-updater

### When chain-issue-updater is Used

- **Issue 002**: Always create "Development Context Scoping" issue using chain-issue-updater
- **After project structure**: chain-issue-updater adds folder scoping to subsequent issues
- **Status updates**: chain-issue-updater manages GitHub issue status synchronization
- **Progress tracking**: Updates issue-map.yaml with current progress

### Folder Scoping Process

1. chain-issue-updater analyzes project structure
2. Adds relevant folder paths to `planning.scope.folders`
3. Categorizes as primary, secondary, or excluded
4. Optimizes agent context for efficient development

## Can I add more?

- You **may** add additional issues by creating new YAML files with sequential naming ("issue-002.yaml", "issue-003.yaml", etc.).
- You **may** add items to arrays (non_goals, acceptance_criteria, required_agents, task_breakdown, notes) within each issue file.
- You **may** add additional concept labels and dependency labels to the labels array.
- You **may** add custom fields within each tier if needed for specific workflows.
- You **must not** change the tiered YAML structure or core field names within each issue file.
- You **must not** remove required fields from any tier.
- You **must not** create build/deploy issues before all dev work is complete.

## Quality checklist

- [ ] **Issue-map folder created:** `foreman/release-{{X}}/docs/00-planning/issue-map/`
- [ ] **Individual files created** with proper naming: `issue-001.yaml`, `issue-002.yaml`, etc.
- [ ] All `{{…}}` placeholders resolved across all tiers in each issue file.
- [ ] **Metadata consistency:** Each file has correct `{{issue_key}}` and `{{sequence_number}}`.
- [ ] **YAML validates** with 2-space indentation for each individual file.
- [ ] All ConceptIDs mapped from concept-checklist.md in Tier 2 of each relevant issue.
- [ ] **Phase labels correctly applied**: "dev" for development, "build" for build work, "deploy" for deployment.
- [ ] **Build work sequenced AFTER all dev work** to prevent unnecessary build tests.
- [ ] Each issue has clear acceptance criteria in Tier 2.
- [ ] Agent workflows properly configured in Tier 3 with capability block approach (no primary agent).
- [ ] Task breakdown sequences are logical and atomic with execution phases.
- [ ] Dependencies properly mapped via `blocks` and `blocked_by` arrays across files.
- [ ] GitHub labels include all required categories plus concept, phase, and dependency labels in Tier 4.
- [ ] Quality requirements complete with testing strategy and deployment plans.
- [ ] Effort estimates provided for all tasks in each issue file.
- [ ] Deliverables clearly defined for each task.
- [ ] Folder scoping structure ready for chain-issue-updater (primary/secondary/excluded).
- [ ] Issue 002 planned for "Development Context Scoping" using chain-issue-updater.
- [ ] **All issue files committed** to the release docs folder.
