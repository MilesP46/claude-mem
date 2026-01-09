# Foreman Templates System Analysis

## Categories

7 primary categories:
1. **Planning** (8 templates) - Issue planning, release specs, overviews
2. **Coordination** (5 templates) - Command templates, agent templates
3. **Architecture** (4 templates) - API design, database schema, infrastructure
4. **UI Design** (7 templates) - Components, design systems, mockups
5. **UX Research** (4 templates) - User flows, personas, wireframes
6. **Pipeline** - CI/CD and deployment workflow templates
7. **GitHub** - Issue labels and configurations (labels.yaml)

## File Format & Structure

**Format**: Markdown (.md) files

**Structure:**
- Header with context/release variables: `# Issue {{X}} Context — Release {{X}}`
- Placeholder syntax: `{{VARIABLE}}` or `{VARIABLE}`
- Structured sections divided by `---`
- Tabular data for tracking (status, priority, phase)
- YAML blocks for decision tracking
- Mermaid diagrams for timelines

## Templates vs Instructions

| Aspect | Templates | Instructions |
|--------|-----------|--------------|
| Purpose | Fillable scaffolding | Execution guidance |
| Scope | Per-release or per-issue | Framework for agents |
| Syntax | `{{mustache}}` placeholders | Prose step-by-step |

## Usage Pattern

1. **Selection**: Choose category based on work domain
2. **Instantiation**: Copy, replace `{{PLACEHOLDERS}}`
3. **Enrichment**: Add issue-specific details
4. **Reference**: Link back to other artifacts

## Issue/Workflow Templates

**issue-plan-template.md**: Issue matrix with status/priority/phase/labels/agents

**issue-overview-template.md**: MVP definition, Gantt chart, post-MVP roadmap

**chain-context-template.md** (210+ lines): Complex YAML for per-agent decision matrices
- Decision matrix, scope of work, rule ledger, prior art
- Designed as agent "Bible"—single authoritative source
- Finality statement: `"NO QUESTIONS - ALL DECISIONS FINAL"`

**orchestrating-command-template.md**: Sequential/parallel multi-agent patterns (350-500 lines)
