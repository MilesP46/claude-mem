# Agent Scope & Impact Matrix

## Purpose

This matrix helps the orchestrator (chain-plan-design-green) understand:

1. What each agent controls and can modify
2. Which decisions from one agent might impact another agent's work
3. How to dispatch targeted updates to affected agents

## Agent Ownership & Control

### chain-ux-researcher

**Controls:**

- User flows and navigation models
- Personas and user journeys
- Wireframes and page layouts
- Interaction patterns (behavioral)

**Files Owned:**

- `01-ux-research/user-flows.md`
- `01-ux-research/personas.md`
- `01-ux-research/wireframes.md`
- `01-ux-research/interaction-patterns.md`

### chain-ui-designer

**Controls:**

- Component specifications and anatomy
- Design system tokens and theming
- Visual interaction patterns
- Component configuration and markup

**Files Owned:**

- `02-ui-design/component-specs.md`
- `02-ui-design/config-notes.md`
- `02-ui-design/design-system.md`
- `02-ui-design/component-markups.md`
- `02-ui-design/interactive-prototypes.md`
- `02-ui-design/ui-interaction-patterns.md`
- `02-ui-design/navigation-state-patterns.md`

### chain-system-architect

**Controls:**

- API design and contracts
- Database schemas and data models
- Service integrations and external APIs
- Infrastructure and deployment architecture

**Files Owned:**

- `03-architecture/api-design.md`
- `03-architecture/service-integration.md`
- `03-architecture/database-schema.md`
- `03-architecture/infrastructure-plan.md`

## Cross-Agent Impact Scenarios

### Decisions That Trigger chain-ui-designer Updates

**From chain-ux-researcher:**

- Navigation flow changes → Update navigation components
- New page/screen added → Create new component specs
- Interaction pattern changes → Update UI interaction patterns
- User flow modifications → Adjust component states and behaviors

**From chain-system-architect:**

- Authentication method changes → Update login/auth components
- Data structure changes → Modify form components and validation
- API response format changes → Update data display components
- Real-time features added → Add live update components

### Decisions That Trigger chain-system-architect Updates

**From chain-ux-researcher:**

- New user flows → API endpoints and data requirements
- Authentication requirements → Security and session management
- Search/filter patterns → Query APIs and indexing
- File upload flows → Storage and processing APIs

**From chain-ui-designer:**

- Component data requirements → API response schemas
- Real-time component needs → WebSocket/polling infrastructure
- File handling components → Storage service integration
- Complex form validations → Backend validation rules

### Decisions That Trigger chain-ux-researcher Updates

**From chain-ui-designer:**

- Component limitations → Adjust interaction patterns or flows
- Performance constraints → Simplify complex flows
- Accessibility requirements → Modify navigation patterns

**From chain-system-architect:**

- API limitations → Adjust data flow expectations
- Real-time constraints → Modify instant feedback patterns
- Security requirements → Add authentication steps to flows

## Decision Keywords That Trigger Cross-Impacts

### High-Impact Keywords

- **Authentication/Login** → Impacts all three agents
- **Real-time/Live updates** → UI Designer + System Architect
- **Navigation/Routing** → UX Researcher + UI Designer
- **Data validation** → UI Designer + System Architect
- **File upload/handling** → All three agents
- **Search/filtering** → UX Researcher + System Architect
- **Permissions/roles** → All three agents

### Medium-Impact Keywords

- **Form design** → UI Designer + System Architect
- **Error handling** → UI Designer + System Architect
- **Loading states** → UX Researcher + UI Designer
- **Mobile/responsive** → UX Researcher + UI Designer
- **Notifications** → All three agents

## Dispatch Instructions Format

When re-dispatching an agent for decision impact, use this format:

```bash
# Example dispatch for UI Designer impacted by UX decision
You are being re-dispatched to update your documentation based on a decision from another agent.

**Specific Update Required:**
Review decision about [SPECIFIC DECISION] and update your [SPECIFIC FILE/SECTION] accordingly.

**Decision Context:**
[COPY THE EXACT DECISION FROM THE LOG]

**Your Task:**
1. Read the decision above
2. Determine what changes are needed in your documentation
3. Update your files seamlessly as if this was always the plan
4. Do NOT create new files or go outside your scope
5. Do NOT log this as a new decision - this is an update based on coordination

**Files to Focus On:** [LIST SPECIFIC FILES]
```

## Coordination Logic

### Round-Based Processing

1. **Round 1**: All agents complete initial work + self-reconciliation
2. **Round 2+**: Process decision log, identify impacts, dispatch targeted updates
3. **Continue** until no new cross-impacts are identified

### Impact Detection Algorithm

1. Parse each decision for high/medium impact keywords
2. Check decision context against agent scope boundaries
3. Identify specific files/sections that need updates
4. Generate targeted dispatch instructions
5. Track updates to prevent infinite loops

### Completion Criteria

- All decisions logged and processed
- No new cross-impacts detected in latest round
- All agents have updated their documentation
- Decision log shows "coordination complete"
