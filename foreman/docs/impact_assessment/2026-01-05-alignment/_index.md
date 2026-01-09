# Foreman ↔ claude-mem Integration Alignment Assessment

## Purpose

This assessment reconciles the original `foreman-claude-mem-integration.md` (written without full knowledge of foreman's actual architecture) against the real foreman system discovered through exploration.

## Key Discrepancies Identified

### 1. CLI vs Agent-Command Architecture

**Original Assumption:** Foreman is a CLI tool with commands like:
- `foreman issue sync 123`
- `foreman issue brief 123`
- `foreman gh comment --file ...`
- `foreman policy render`
- `foreman duos recommend`

**Reality:** Foreman is an **agent-command orchestration system**, not a CLI:
- **44 agents** in `.my_coding/agents/`
- **25 slash commands** in `.my_coding/commands/`
- **Chain-* workflow orchestration** (chain-issue, chain-plan-design-green, etc.)
- Scripts like `send-agents`, `send-commands` sync to `~/.claude/`

**Implication:** Integration should leverage existing agent/command patterns, not propose new CLI tools.

---

### 2. Issue/Project State Management

**Original Assumption:** State via `active-issue.json`:
```
state/
  active-issue.json  # {"issue": 123, "mode": "dev", "labels": [...]}
```

**Reality:** State is **release-scoped through planning documents**:
- `foreman/release-X/docs/00-planning/issue-map/issue-XXX.yaml`
- `issue-plan.md`, `issue-overview.md`, `user-requirements.md`
- `.foreman-project` identifies project, not issue state
- Timestamped assessment reports track changes over time

**Implication:** claude-mem tagging should use release context from planning docs, not proposed state files.

---

### 3. Filesystem Structure

**Original Assumption:**
```
foreman/projects/<project>/issues/00123/
  issue.md
  comments.raw.json
  crystallized/outcome.md
  crystallized/patterns.md
```

**Reality:**
```
.my_coding/
  agents/              # 44 agent definitions
  commands/            # 25 slash commands
  instructions/        # 10 categories of process guidance
  templates/           # Scaffolding for releases/issues
  rules/               # .mdc enforcement files
  foreman/
    docs/impact_assessment/  # Change tracking
    docs/memory_assessment/  # CLAUDE.md validation
```

**Implication:** claude-mem should integrate with existing structure, not propose parallel storage.

---

### 4. "Crystallization" Mechanism

**Original Assumption:** Crystallization produces:
- `crystallized/outcome.md`
- `crystallized/decisions.md`
- `crystallized/patterns.md`
- `crystallized/command-policies.md`

**Reality:** Crystallization happens through:
- **Instructions** (`@instructions/`) - process guidance consumed by agents
- **Templates** (`@templates/`) - scaffolding with `{{placeholders}}`
- **Rules** (`.mdc` files) - enforcement with globs/alwaysApply
- **chain-context-template.md** - the "agent Bible" with decision matrices

**Implication:** Pattern extraction should feed into existing instruction/rule system, not new crystallized files.

---

### 5. Duo Generation & Promotion

**Original Assumption:** Automated duo generation with:
- `duos/registry.json`
- `duos/<duo-name>/command.md + agent.md`
- `foreman promote` lifecycle

**Reality:** Duos already exist as **paired agents + commands**:
- `command-agent-duo.md` agent creates new duos
- `agent-command-creation-standards.md` instruction guides creation
- Agents reference commands via naming convention (`error-explorer` ↔ `error-fix`)
- Templates: `simple-command-template.md`, `agent-template.md`, `orchestrating-command-template.md`

**Implication:** Promotion should enhance existing duo creation patterns, not create separate registry.

---

### 6. GitHub Integration

**Original Assumption:** Foreman CLI wraps GitHub:
- `foreman gh comment issue 123 --file ./comment.md`
- Local worklog mirroring

**Reality:** GitHub integration exists through:
- `chain-send-issues` command - batch GitHub submission
- `chain-issue` command - references GitHub issue numbers
- Issue YAML files track GitHub issue # after creation
- No local comment mirroring (GitHub is source of truth for comments)

**Implication:** claude-mem should leverage GitHub MCP tools, not propose foreman wrappers.

---

## What the Original Document Got Right

1. **Progressive disclosure** - Small briefs/indexes injected, heavy details on-demand
2. **Issue-binding** - Sessions should be tagged with issue/release context
3. **Policy extraction** - Observations can identify command preferences
4. **Duo concept** - Agent + command pairings are fundamental to foreman
5. **Heavy output trimming** - Large tool outputs need archival strategy

---

## Recommended Integration Approach

### Phase 1: Observation Tagging
- Tag observations with `release_id` from current working directory's `.foreman-project` or `foreman/release-X/`
- Tag with issue context when inside `issue-map/` paths

### Phase 2: Pattern → Instruction Pipeline
- Extract command preferences from observations
- Generate candidate `@instructions/` or `.mdc` rules
- Use existing `command-agent-duo` agent for duo creation

### Phase 3: Context Injection
- Inject release-scoped brief at session start
- Query claude-mem for related observations by release/issue
- Size-budget context using existing progressive disclosure patterns

---

## Supporting Reports

1. [01-agents-structure.md](./01-agents-structure.md) - Agent system analysis
2. [02-commands-structure.md](./02-commands-structure.md) - Command system analysis
3. [03-instructions-system.md](./03-instructions-system.md) - Instructions analysis
4. [04-scripts-cli.md](./04-scripts-cli.md) - Scripts/CLI analysis
5. [05-templates-system.md](./05-templates-system.md) - Templates analysis
6. [06-rules-config.md](./06-rules-config.md) - Rules and configuration analysis
