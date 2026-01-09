# Foreman Rules & Configuration Analysis

## Rules Inventory

8 rules in `/Users/miles/.my_coding/rules/`:
1. **development-standards.mdc** - 20 engineering principles (DRY, LOC ≤200, typing)
2. **system-standards.mdc** - Packaging, data stores, operability
3. **logging-standard.mdc** - Log levels, JSON in prod, error handling
4. **documentation-rules.mdc** - Length budgets (1K-6K tokens), hierarchical structure
5. **test-organization.mdc** - Test organization patterns
6. **diagram-standard.mdc** - Diagram standards
7. **tdd-development.mdc** - TDD stub failure requirements
8. **memory-system-standards.mdc** - CLAUDE.md size limits (80-150 lines)

## Rule Format & Structure

**Format:** `.mdc` (Markdown with YAML frontmatter)
```yaml
description: Rule purpose
globs: [patterns] or empty
alwaysApply: true/false
```

## Rules vs Instructions vs Agents

| Aspect | Rules | Instructions | Agents |
|--------|-------|--------------|--------|
| Purpose | Code constraints | Process definitions | Task execution |
| Trigger | globs or alwaysApply | Workflow request | Commands/events |

## Project Configuration

**.foreman-project** (JSON at workspace root):
```json
{
  "createdAt": "2025-09-11T17:54:50.987Z",
  "id": "02d231dbc9d3b5ffc51d74c785f3a543",
  "templatesSource": "/Users/miles/.my_coding",
  "foremanRoot": "/Users/admin/.my-coding"
}
```

## State Management

- **memory_assessment/** - Timestamped validation reports
- **impact_assessment/** - Change impact reports
- No flat issue tracker - uses timestamped assessment reports
- Foreman rules directory empty (inherits from parent)
