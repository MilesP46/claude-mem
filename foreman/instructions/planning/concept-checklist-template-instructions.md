# Concept Checklist Template Instructions

## Purpose

This template captures the essential capabilities your application must deliver, creating traceable ConceptIDs that flow through your entire development pipeline. It focuses exclusively on WHAT the app does and WHERE it might live, not HOW it does it.

## Key Principles

1. **Capability-Focused**: Describe what users can accomplish, not technical implementations
2. **Minimal & Clear**: One concept = one user capability, expressed simply
3. **Traceable**: Each ConceptID follows the work through planning → design → development
4. **Categorized**: Group related concepts for easier navigation
5. **Refined Through Q&A**: Concepts evolve through clarifying questions, not assumptions

## ConceptID Format

- Pattern: `CONCEPT-XXX` where XXX is a three-digit number (001-999)
- Sequential within the project, not within categories
- Once assigned, a ConceptID is permanent (even if the concept is later removed)

## Writing Good Concepts

### DO Write:

- "Users can authenticate using email and password" [CONCEPT-001]
- "System automatically backs up user data daily" [CONCEPT-012]
- "Users can share documents with specific people" [CONCEPT-023]
- "Application uses managed hosting for simple deployment with minimal configuration" [CONCEPT-007]

### DON'T Write:

- ❌ "Implement OAuth2 with refresh tokens" (too technical)
- ❌ "Use PostgreSQL for data storage" (implementation detail)
- ❌ "Modal dialog for user settings" (UI decision)
- ❌ "Microservices architecture" (architectural choice)

## Categories

Choose categories that make sense for your domain:

- **User Management** (auth, profiles, permissions)
- **Core Features** (the main value proposition)
- **Data Operations** (CRUD, import/export, backup)
- **Communication** (notifications, messaging, sharing)
- **Business Logic** (calculations, workflows, rules)
- **Integration** (external services, APIs)
- **Infrastructure** (deployment, hosting, scaling capabilities)

## Intent vs Not

For each concept, clarify:

- **Intent**: The user need or business goal this addresses
- **Not**: Common misunderstandings to explicitly exclude

Example:

```
- [ ] **[CONCEPT-015]** Users can export their data
  - *Intent:* Give users control and portability of their information
  - *Not:* Not real-time sync or automated backups
```

## Q&A Trail

Document how concepts evolved through clarifying questions:

- Each Q&A should result in concepts being added, refined, or removed
- Reference which ConceptIDs were affected
- Keep questions focused on capabilities, not implementation

## Status Tracking

The registry tracks three states:

1. **Planning**: Concept is defined but not yet designed
2. **Designed**: UX/UI has created flows/specs for this concept
3. **Built**: Concept is implemented and tested

## ConceptID Usage

ConceptIDs created here will serve as the foundation for your entire project. They will be referenced throughout the planning and development pipeline to ensure every decision traces back to these core capabilities.

The concept-checklist.md becomes your project's north star - a minimal, clear definition of what needs to be built, free from implementation details.

## Best Practices

1. **Start Broad**: Begin with high-level capabilities, refine through Q&A
2. **Resist Detail**: If you're mentioning technologies or UI elements, you're too deep
3. **User Voice**: Write from the user's perspective when possible
4. **Business Voice**: Use business perspective for system behaviors users don't directly see
5. **Completeness Check**: Every ConceptID should map to at least one Epic in release specs
6. **Backward Tracing**: Every Issue should trace back to at least one ConceptID

## Common Pitfalls

1. **Feature Creep**: Don't add concepts during design/build without updating the checklist
2. **Tech Bleed**: Keep implementation choices out of concept descriptions
3. **UI Prescription**: Avoid describing screens, modals, or interaction patterns
4. **Orphaned Concepts**: Ensure every concept makes it into the release specification
5. **Scope Creep**: Mark post-MVP concepts clearly and don't let them into initial planning

Remember: This checklist is your north star. When design or implementation questions arise, trace back to these concepts to ensure alignment with core project goals.
