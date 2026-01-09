# Command-Agent-Duo Creation System

## Trigger Mechanism

**User-initiated, command-driven, pattern-analyzed**:
- User calls `/create-project-agent-command-duo` with 4 arguments:
  - `<path>` - Directory/area (e.g., "src/api")
  - `<context>` - What to achieve (e.g., "validate API responses")
  - `<include-git>` - Boolean
  - `[git-instructions]` - Optional workflow details

**7-Phase Process**:
1. Argument parsing and validation
2. Scan existing patterns (project + personal agents/commands)
3. Determine orchestration strategy (Type A-D)
4. User confirmation before creation
5. Prepare extraction instructions
6. Execute via `command-agent-duo` agent
7. Report results

## Scoping Model

**Dual-Location Awareness**:
- Personal agents: `~/.claude/agents/` (reusable patterns)
- Project agents: `.claude/agents/` (project-specific)
- Personal commands: `~/.claude/commands/` (patterns to adapt)
- Project commands: `.claude/commands/` (delivered to users)

**Path Scoping**:
- File patterns: `**/[PATH]/**/*.ext`
- Validation enforces "only [PATH]" throughout
- Scope checked in file operations, prompts, examples

## Project vs Personal Level

| Level | Location | Purpose | Lifecycle |
|-------|----------|---------|-----------|
| Personal | `~/.claude/` | Reusable patterns | Extracted as basis |
| Project | `.claude/` | Project-specific | Created via duo agent |

**Strategy Rules**:
- Perfect project agent exists → Leverage
- Relevant personal agent exists → Base on (extract, adapt)
- No relevant agent → Create new

## Refinement Over Time

- **Extraction-Based**: Analyzes existing agents for patterns, feeds into new creation
- **Strategy Detection**: Complexity indicators trigger Type B/C/D orchestration
- **Template-Driven**: All duos from standardized templates
- **Feedback Loop**: User confirmation gates creation; adjustments re-present for approval

## Templates & Patterns

| Type | Pattern | Command Size | Agent Size |
|------|---------|--------------|------------|
| A: Simple | 1 agent | <250 lines | <250 lines |
| B: Sequential | Phase 1 → Phase 2 | 350-450 | <300 each |
| C: Parallel | N instances parallel | 350-450 | <300 |
| D: Complex | 3+ agents, mixed | up to 500 | <300 each |

**Templates**: `agent-template.md`, `simple-command-template.md`, `orchestrating-command-template.md`
