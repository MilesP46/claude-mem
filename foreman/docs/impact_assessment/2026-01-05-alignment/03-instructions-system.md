# Foreman Instructions System Analysis

## Categories

10 functional categories:
1. **UI Design** - Component specs, design systems, navigation patterns
2. **Pipeline** - GitHub labels, CI/CD actions, workflow configuration
3. **Coordination** - Agent-command creation, orchestration patterns
4. **Memory** - Context loading, CLAUDE.md generation, promotion/demotion
5. **Planning** - Issue mapping, granular change plans, release specifications
6. **Architecture** - API design, database schemas, infrastructure
7. **GitHub** - Issue workflows, issue creation procedures
8. **UX Research** - User flows, personas, wireframes
9. **Assessment** - Capability assessment, change assessment
10. **Coordination (operational)** - Decision reconciliation, impact orchestration

## File Format & Structure

**Format:** Markdown (.md) with optional YAML frontmatter
**Naming:** Descriptive-kebab-case with `-template-instructions.md` suffix

**Common structure:**
- Purpose/intro section
- How to use (step-by-step)
- Section-by-section guidance
- Placeholders reference (`{{X}}`)
- Quality checklist

## Instructions vs Agents

| Aspect | Instructions | Agents |
|--------|--------------|--------|
| Purpose | Define HOW to create deliverables | Execute tasks |
| Consumption | Referenced via `@instructions/path` | Created from instructions |
| Content | Procedural guidance, templates | System prompts, tool access |
| Enforcement | Agent responsible for following | Built-in constraints |

## Consumption Pattern

Agents consume instructions through explicit frontmatter declaration:
```yaml
instructions:
  - @instructions/planning/issue-map-template-instructions.md
  - @instructions/coordination/agent-command-creation-standards.md
```

## Root vs Foreman Instructions

**Root instructions** (`/Users/miles/.my_coding/instructions/`): 44 files, fully populated
**Foreman instructions** (`/Users/miles/.my_coding/foreman/instructions/`): Empty directories (mirrors structure)

Foreman instructions would provide project-specific variants; agents fall back to root.
