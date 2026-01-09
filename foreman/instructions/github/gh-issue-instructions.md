### Required Issue Fields

Title: {{Concise, action-oriented title}}
Delivers Concepts: [CONCEPT-XXX, CONCEPT-YYY] # Trace to concept-checklist.md
Short Description: {{One paragraph summary}}
Type: {{feat|fix|chore|refactor}} → label: type:_
Priority: {{P0|P1|P2}} → label: priority:_
Status: todo → label: status:todo
Area: {{api|ui|db|infra|security|devex|docs}} → label: area:\*

Scope:

- Problem: {{What's broken, missing, or needed}}
- Non-Goals: {{Explicitly out of scope}}
- Acceptance Criteria: {{Given/When/Then or bullet list}}

Agent Map (ordered):

1. {{agent}} — {{specific task}}
2. {{agent}} — {{specific task}}

## Sequencing Strategy (rail-guided)

Default per capability:

1. framework-manager — contracts/mocks, scaffolding, lint/test config
2. pipeline-manager — CI gates (contract drift, coverage), preview envs
3. backend-architect — implement to contract, migrations, fixtures
4. ai-engineer — adapter + eval harness (if applicable), shadow flag
5. frontend-developer — BDD + UI on mocks → flip to real
6. reviewerpr — Sandy Metz style review, minimal fixes

FE/AI may pre-start on mocks after step 1 if safe. Keep official order for handoffs.

## Agent Selection Guidelines

- Choose the minimal set of agents per issue
- Prefer vertical slices; avoid cross-domain sprawl
- Use feature flags for mock→real and model rollout

## Quality Enforcement

- TDD/BDD strategy per issue
- Coverage maintained/increased
- Rollback plan if applicable
- Feature flag requirements documented
- ConceptIDs mapped in issue and context docs

## GitHub Integration

- Apply labels from {{FOREMAN_ROOT}}/templates/github/labels.yaml
- Add concept:<ID> labels for each ConceptID
- Link related issues and milestones
- Store issue numbers for sprint mapping

## Decision Framework

- Minimize scope to reach MVP
- Defer non-critical enhancements
- Prioritize user-facing value
- Balance technical debt vs speed
- Each issue must be demoable in a preview env
