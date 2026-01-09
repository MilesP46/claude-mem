# Foreman Scripts/CLI Analysis

## Script Inventory

18+ script directories in `/Users/miles/.my_coding/scripts/`:

**Core CLI Tools:**
- `send-commands/` - Sync command files to Claude CLI (~/.claude/commands/)
- `send-agents/` - Sync agent files to Claude CLI (~/.claude/agents/)
- `foreman-update/` - Meta-update coordinator (repo, tools, templates)
- `memory-update/` - Sync CLAUDE.md to AGENTS.md format
- `foreman-templates-cli/` - Manage project templates and rules
- `activity-logger/` - Project-aware activity logging (`log-activity`)

**Helpers Library (16 modules):**
- `claude-paths/` - Multi-platform Claude directory detection
- `git-utils/` - Git repo operations
- `memory-validator/` - CLAUDE.md validation
- `memory-analyzer/` - Directory structure analysis

## Language & Runtime

All primary scripts: **Node.js/JavaScript (ESM)**
- Direct execution via global symlinks
- ESM modules for code reuse
- Child process spawning for subcommands

## Key Functionality

**send-commands/send-agents**: Copy files to `~/.claude/` with `.md`, `.yaml`, `.yml`, `.json` filtering

**foreman-update**:
1. `git pull` the .my_coding repo
2. Run `setup-all.js` to reinstall CLI tools
3. Execute `foreman-templates install`

**memory-update**:
- Walk directory tree for CLAUDE.md files
- Create/update AGENTS.md with auto-generated header
- SHA256 hashing for change detection

## Agent/Command Integration

**Central Hub: `claude-paths/index.js`**
- Multi-platform detection of `~/.claude` directory
- Used by send-agents and send-commands to locate targets

**Tool Installation Pattern:**
- Each script has paired `install-*.js`
- `setup-all.js` orchestrates all installations

## Memory Integration

**Pattern**: CLAUDE.md (source) → AGENTS.md (derived)
- Validation scans project for structural gaps
- Assessment reports saved to `_memory-assessment-*.md`
- `.foreman-project` config points to plugin templates
