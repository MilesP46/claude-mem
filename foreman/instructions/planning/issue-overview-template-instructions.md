# Issue Overview — Release {{X}} — **Instructions**

- **Purpose:** Create a concise overview clearly separating MVP deliverables from post-MVP enhancements.
- **Focus:** What gets delivered in MVP vs what comes after.

## How to use

1. **Create this file alongside issue-plan.md and issue-map/ folder** during chain-issue-builder execution.
2. **Review all planning documents** to identify MVP scope boundaries.
3. **Clearly separate** MVP issues from enhancement issues.
4. Fill in all placeholders focusing on delivery clarity.
5. Keep **structure** and headings unchanged.
6. Commit the completed file to the release docs.

## Core Principles

**MVP Focus**: Clearly identify minimum viable functionality that delivers user value
**Post-MVP Clarity**: Define what enhancements come after MVP is established
**Delivery Timeline**: Show realistic MVP delivery vs enhancement phases
**Stakeholder Communication**: Enable clear scope and timeline decisions

## Content Structure

### MVP Scope Definition
**Purpose**: Clear boundary between MVP and future enhancements
**Required Elements**:
- Core MVP features and capabilities
- Acceptance criteria for "MVP Complete"
- Explicit exclusions from MVP scope

### Delivery Flow
**Purpose**: Simple process showing MVP delivery phases
**Required Elements**:
- MVP development phases
- Post-MVP enhancement phases
- Clear transition points

### Timeline
**Purpose**: Realistic MVP delivery timeline
**Required Elements**:
- MVP milestone dates
- Enhancement planning timeline
- Buffer allocation

## Diagram Requirements

**Follow diagram-standard.mdc**: Version comments, ASCII identifiers, proper fencing
**Keep it simple**: Focus on MVP vs post-MVP distinction
**Required diagrams**:
- **MVP Flow**: `flowchart TD` showing MVP delivery phases
- **Timeline**: `gantt` showing MVP delivery vs enhancement phases

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

### Basic Placeholders

- `{{X}}` — release number
- `{{YYYY-MM-DD}}` — creation date  
- `{{N issues}}` — total issue count
- `{{X weeks}}` — MVP delivery timeline

### MVP Content Placeholders

- `{{MVP core features}}` — 2-3 essential MVP capabilities
- `{{MVP success criteria}}` — how to know MVP is complete
- `{{Post-MVP enhancements}}` — what comes after MVP
- `{{MVP timeline}}` — realistic MVP delivery timeframe
- `{{Enhancement timeline}}` — when post-MVP work begins

## Section guidance

- **MVP Definition** — What core features make up the MVP
- **MVP Flow Diagram** — Simple flowchart showing MVP delivery phases
- **Delivery Timeline** — Gantt chart showing MVP vs enhancement timing
- **Post-MVP Roadmap** — What gets built after MVP is established

## Can I add more?

- You **may** add bullet items under existing headings
- You **must not** delete or rename top-level headings
- You **must** follow diagram-standard.mdc for diagrams
- Keep content focused on MVP vs post-MVP distinction

## Quality checklist

**Template Completion:**

- [ ] All `{{…}}` placeholders resolved
- [ ] MVP scope clearly defined and bounded
- [ ] Post-MVP enhancements identified
- [ ] Diagrams follow diagram-standard.mdc

**Content Requirements:**

- [ ] **MVP Definition**: Clear list of core MVP features
- [ ] **MVP Flow**: Simple flowchart showing MVP delivery phases  
- [ ] **Timeline**: Gantt chart showing MVP vs enhancement timing
- [ ] **Post-MVP Roadmap**: What gets built after MVP

**File Location:**

- [ ] Saved to `foreman/release-{{X}}/docs/00-planning/issue-overview.md`
