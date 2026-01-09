# Decision Reconciliation Template Instructions

## Purpose

This template is for agents to log their decisions in a minimal, coordination-friendly format. The orchestrator uses this log to determine cross-agent impacts and coordinate updates.

## Agent Usage Instructions

### When to Use This Template

**ONLY** after you have:

1. Created your initial documentation
2. Identified assumptions/open questions in your work
3. Resolved those questions with specific decisions
4. Updated your own documentation seamlessly

### How to Log Your Decisions

1. **Check if decision log exists**: Look for `@foreman/release-{{X}}/coordination/decision-log.md`
2. **If it doesn't exist**: Create it using this template
3. **If it exists**: Append your decision using the "Agent Decision Entries" format

### What to Include

**Question Resolved**: Copy the exact assumption/question from your original documentation

**Decision**: State your decision clearly and concisely (1-2 sentences maximum)

**Files Updated**: List the specific files you modified and what sections you changed

### What NOT to Include

- **NO speculation about other agents** - You don't know about other agents
- **NO cross-agent impact analysis** - The orchestrator handles this
- **NO recommendations for other documentation** - Stay in your lane
- **NO multiple decisions in one entry** - One entry per distinct decision

### Example Entry

```markdown
### chain-ui-designer - 2024-01-15 14:30

**Question Resolved**: Should the login form use email or username for authentication?

**Decision**: Login form will use email address as the primary identifier for consistency with password reset flows.

**Files Updated**:

- component-specs.md (Login Form Component section)
- design-system.md (Authentication Patterns section)
```

### File Location

Always save/append to: `@foreman/release-{{X}}/coordination/decision-log.md`

### Critical Rules

1. **Domain focus**: Only log decisions within your expertise domain
2. **Factual only**: State what you decided, not why other agents should care
3. **One decision per entry**: Don't batch multiple decisions
4. **Update first, log second**: Always update your documentation before logging
5. **No orchestration**: Never attempt to coordinate with other agents

## Template Variables

- `{{X}}`: Replace with the release number
- `{{AGENT_NAME}}`: Replace with your agent name (e.g., "chain-ui-designer")
- `{{TIMESTAMP}}`: Use format "YYYY-MM-DD HH:MM"
- `{{ORIGINAL_QUESTION}}`: The exact question/assumption you resolved
- `{{DECISION_SUMMARY}}`: Your decision in 1-2 sentences
- `{{UPDATED_FILES}}`: List of files you modified with brief description of changes
