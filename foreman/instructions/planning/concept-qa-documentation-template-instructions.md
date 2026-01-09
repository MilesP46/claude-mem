# Concept Q&A Documentation — **Instructions**

- **Purpose:** Document the iterative Q&A process that leads to concept discovery and refinement.
- **Context:** Created during chain-concept-gen.md to track how concepts evolved through conversation.

## How to use

1. **Create this file alongside concept-checklist.md** during chain-concept-gen execution.
2. **Document each Q&A exchange** that results in concept changes.
3. **Track concept evolution** from initial idea to final ConceptIDs.
4. **Reference during concept-checklist creation** to understand the reasoning behind each concept.
5. Fill in all placeholders with actual Q&A exchanges.
6. Keep **structure** and headings unchanged.
7. Save the completed file for future reference.

## Documentation Structure

### Q&A Exchanges
**Document each meaningful exchange** that affects concept development:
- Question asked by agent
- User response
- Concept impact (added, modified, removed)
- ConceptID assignments

### Concept Evolution Tracking
**Show how concepts changed** throughout the conversation:
- Initial concepts → refined concepts
- Concept splitting or merging
- Scope clarifications
- MVP vs post-MVP decisions

### Deployment Context Discovery
**Document deployment-specific Q&A** based on existing concepts:
- How existing concepts influenced deployment questions
- Deployment capability mapping to concepts
- WHERE determination process

## Content Guidelines

**Chronological Order**: Document Q&A exchanges in the order they occurred
**Concept Impact Focus**: Emphasize how each exchange affected concept definition
**Decision Rationale**: Capture why certain concepts were added, modified, or removed
**Deployment Alignment**: Show how deployment concepts connect to functional concepts

## Placeholders

Replace every placeholder of the form `{{…}}` with actual conversation content:

### Basic Placeholders
- `{{Question asked}}` — exact question posed to user
- `{{User response}}` — user's actual response
- `{{Concept impact}}` — how this affected concept development
- `{{ConceptID}}` — specific ConceptID affected

### Evolution Tracking Placeholders
- `{{Initial concept description}}` — how concept started
- `{{Refined concept description}}` — how concept ended up
- `{{Reasoning for change}}` — why the concept evolved
- `{{Related concepts}}` — other concepts affected by this change

## Quality checklist

**Q&A Coverage:**
- [ ] All meaningful Q&A exchanges documented
- [ ] Concept evolution clearly tracked
- [ ] Deployment context discovery process captured
- [ ] Decision rationale provided for major concept changes

**Reference Value:**
- [ ] Provides clear audit trail of concept development
- [ ] Shows connection between user needs and final concepts
- [ ] Documents deployment alignment with functional concepts
- [ ] All `{{…}}` placeholders resolved

**File Location:**
- [ ] Saved to `foreman/concept-qa-documentation.md`
