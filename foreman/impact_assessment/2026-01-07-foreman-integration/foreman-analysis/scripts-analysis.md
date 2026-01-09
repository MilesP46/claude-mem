# Scripts Analysis

## Overview

The foreman project contains a comprehensive suite of CLI scripts located in `/Users/miles/.my_coding/scripts/`. These scripts provide automation capabilities for project management, template installation, activity logging, agent/command synchronization, and various utility functions. All scripts are written in Node.js (ES modules) and designed to work globally across projects.

## Script Categories

### Activity Logging Scripts
Scripts for logging activities and tracking work progress within releases/sprints.

### Workflow Control Scripts
Scripts for managing terminal sessions, handoffs between Claude instances, and session control.

### Template Management Scripts
Scripts for installing, updating, and managing project templates, rules, and instructions.

### Synchronization Scripts
Scripts for copying agents and commands to Claude CLI directories.

### Memory Management Scripts
Scripts for managing CLAUDE.md and AGENTS.md files.

### Scoring and Validation Scripts
Scripts for evaluating OSS candidates and shared utilities.

### Document Conversion Scripts
Scripts for converting documentation formats.

### Meta-Update Scripts
Scripts for updating the tooling system itself.

## Scripts Identified

### log-activity (Activity Logger)
- **Location**: `/Users/miles/.my_coding/scripts/activity-logger/global-activity-logger.js`
- **Purpose**: Project-aware activity logging for Foreman projects. Records activities with timestamps, project context, release/sprint IDs, agent names, and task IDs.
- **Invoked By**:
  - Nearly all agents including: `ai-engineer`, `ai-technician`, `backend-architect`, `backend-worker`, `chain-*` agents, `fix-issue`, `frontend-*` agents, `github-issue-creator`, `memory-manager`, `reviewerpr`, `test-manager`, `troubleshooting-investigator`
- **Parameters**:
  - `release <id>` (required) - Release identifier (numeric)
  - `sprint <id>` (optional) - Sprint identifier (numeric)
  - `agent <name>` (optional) - Agent or subagent name
  - `task <id>` (optional) - Task identifier
  - `<message>` (required) - Activity message
- **Workflow**:
  1. Parse command-line arguments to extract release, sprint, agent, task, and message
  2. Find project root using `.foreman-project` marker
  3. Get project configuration
  4. Find foreman root with release directory structure
  5. Construct activity file paths (release and optionally sprint)
  6. Format activity entry with timestamp and context
  7. Write entries atomically using temp file + rename pattern
  8. Output success message
- **Dependencies**:
  - `helpers/project-detection/index.js`
  - `helpers/fs-utils/index.js`

---

### handoff-claude (Claude Handoff)
- **Location**: `/Users/miles/.my_coding/scripts/claude-handoff/claude-handoff.js`
- **Purpose**: Launch Claude in a new macOS terminal window with a specified command. Enables workflow chaining between Claude instances.
- **Invoked By**:
  - `chain-concept-gen.md` command
  - `chain-plan-init.md` command
  - `chain-plan-design-green.md` command
  - `chain-send-issues.md` command
- **Parameters**:
  - `<COMMAND>` (required) - The Claude command to execute (e.g., "/issue", "/plan")
  - `<PARAMS>` (required) - Parameters for the command
  - `--app terminal|iterm|warp` (optional) - Terminal application to use (default: terminal)
  - `--cwd /path/to/project` (optional) - Working directory for the new session
- **Workflow**:
  1. Parse command-line arguments
  2. Validate required command and params
  3. Construct Claude CLI command with `--dangerously-skip-permissions` flag
  4. Generate AppleScript based on target terminal app (Terminal, iTerm, or Warp)
  5. Execute osascript to open new terminal window and run command
  6. Print "Command has been handed off!" on success
- **Dependencies**:
  - `helpers/arg-parser/index.js`
- **Platform**: macOS only

---

### exit-shell
- **Location**: `/Users/miles/.my_coding/scripts/exit-shell/exit-shell.js`
- **Purpose**: Gracefully exit the active terminal session across different terminal apps on macOS.
- **Invoked By**:
  - `chain-concept-gen.md` command
  - `chain-plan-init.md` command
  - `chain-plan-design-green.md` command
- **Parameters**:
  - `--app auto|terminal|iterm|warp` (optional) - Target terminal (default: auto-detect from $TERM_PROGRAM)
  - `--close-window` (optional) - Close the tab/window after exit
  - `--interrupt` (optional) - Send Ctrl-C before exit to stop running task
  - `--delay-ms <n>` (optional) - Delay before sending keys (default: 700ms)
- **Workflow**:
  1. Parse command-line arguments
  2. Detect terminal application from environment or flag
  3. Generate AppleScript for the target terminal app
  4. Optionally send Ctrl-C interrupt
  5. Send 'exit' command via keystroke simulation
  6. Optionally close the window
  7. Execute osascript in detached mode
- **Dependencies**:
  - `helpers/arg-parser/index.js`
- **Platform**: macOS only

---

### foreman-templates
- **Location**: `/Users/miles/.my_coding/scripts/foreman-templates-cli/foreman-templates.js`
- **Purpose**: Install and manage project templates, rules, and instructions from a centralized assets directory.
- **Invoked By**:
  - `foreman-update` script (step 3)
  - `setup-all.js` (configuration step)
  - Chain commands via `foreman-update`
- **Parameters**:
  - **Commands**: `install`, `update`, `configure`, `list`, `where`, `doctor`
  - `--src <path>` - Source assets directory
  - `--kinds templates,rules,instructions` - Asset types to install
  - `--pack <name>` - Specific template pack
  - `--rules-pack <name>` - Specific rules pack
  - `--instructions-pack <name>` - Specific instructions pack
  - `--templates-dest <rel>` - Destination for templates (default: foreman/templates)
  - `--rules-dest <rel>` - Destination for rules (default: foreman/rules)
  - `--instructions-dest <rel>` - Destination for instructions (default: foreman/instructions)
  - `--mode merge|overwrite|skip-existing` - Copy mode (default: merge)
  - `--dry-run` - Preview changes without writing
- **Workflow**:
  1. Parse command and arguments
  2. Find project root or prompt for initialization
  3. Resolve assets root from: CLI flag > env vars > project config > global config > bundled default
  4. Execute command:
     - `install`: Copy selected assets to project
     - `update`: Alias for install with overwrite mode
     - `configure`: Save source path to global config
     - `list`: Show available packs
     - `where`: Show resolved assets location
     - `doctor`: Diagnostic output of paths and status
- **Dependencies**:
  - `helpers/project-detection/index.js`
  - `helpers/fs-utils/index.js`
  - `helpers/json-utils/index.js`
  - `helpers/hash-utils/index.js`
  - `helpers/arg-parser/index.js`

---

### foreman-update
- **Location**: `/Users/miles/.my_coding/scripts/foreman-update/foreman-update.js`
- **Purpose**: Meta-update command that updates the .my_coding tooling repository, reinstalls CLI tools, and updates project templates.
- **Invoked By**: Manual execution, scheduled updates
- **Parameters**:
  - `--skip-repo-update` - Skip git pull on .my_coding repo
  - `--skip-setup` - Skip running setup-all.js
  - `--dry-run` - Preview changes without executing
- **Workflow**:
  1. Step 1: Update .my_coding repository (git pull)
     - Check if repo is git-managed
     - Check for uncommitted changes
     - Check remote status and pull if behind
  2. Step 2: Reinstall CLI tools (run setup-all.js)
  3. Step 3: Update project templates (foreman-templates install --mode overwrite)
- **Dependencies**:
  - `helpers/git-utils/index.js`
  - `setup-all.js`
  - `foreman-templates` (external CLI)

---

### memory-update
- **Location**: `/Users/miles/.my_coding/scripts/memory-update/memory-update.js`
- **Purpose**: Synchronize CLAUDE.md files to AGENTS.md format, or remove memory files.
- **Invoked By**: Manual execution, `manage-memory` skill
- **Parameters**:
  - `--root <path>` - Root directory to scan (default: cwd)
  - `--pattern <name>` - File name to look for (default: CLAUDE.md)
  - `--agents-name <name>` - Target file name (default: AGENTS.md)
  - `--remove` - Remove CLAUDE.md and AGENTS.md files
  - `--dry-run` - Preview changes
  - `--verbose` - Detailed logging
  - `--validate` - Run memory validation instead of sync
- **Workflow**:
  1. Parse arguments
  2. If `--validate`: Run memory-validator and output assessment
  3. Otherwise: Walk directory tree finding CLAUDE.md files
  4. For each file:
     - In remove mode: Delete CLAUDE.md and associated AGENTS.md
     - In sync mode: Create/update AGENTS.md with auto-generated header
  5. Report changes made
- **Dependencies**:
  - `helpers/dir-walker/index.js`
  - `helpers/hash-utils/index.js`
  - `helpers/fs-utils/index.js`
  - `helpers/memory-validator/index.js` (for --validate)

---

### send-agents
- **Location**: `/Users/miles/.my_coding/scripts/send-agents/send-agents.js`
- **Purpose**: Copy agent files from the repository to the Claude CLI agents directory.
- **Invoked By**:
  - `setup-all.js` (optional prompt)
  - Manual execution
- **Parameters**:
  - `--dry-run` - Preview what would be copied
- **Workflow**:
  1. Locate repository agents directory
  2. Detect or prompt for Claude agents directory
  3. Copy all .md, .yaml, .yml, .json files recursively
  4. Report number of files copied
- **Dependencies**:
  - `helpers/claude-paths/index.js`
  - `helpers/fs-utils/index.js`

---

### send-commands
- **Location**: `/Users/miles/.my_coding/scripts/send-commands/send-commands.js`
- **Purpose**: Copy command files from the repository to the Claude CLI commands directory.
- **Invoked By**:
  - `setup-all.js` (optional prompt)
  - Manual execution
- **Parameters**:
  - `--dry-run` - Preview what would be copied
- **Workflow**:
  1. Locate repository commands directory
  2. Detect or prompt for Claude commands directory
  3. Copy all .md, .yaml, .yml, .json files recursively
  4. Report number of files copied
- **Dependencies**:
  - `helpers/claude-paths/index.js`
  - `helpers/fs-utils/index.js`

---

### setup-all
- **Location**: `/Users/miles/.my_coding/scripts/setup-all.js`
- **Purpose**: Master installer that installs/refreshes all script CLIs and configures the tooling system.
- **Invoked By**:
  - `foreman-update` (step 2)
  - Manual execution for initial setup
- **Parameters**: None
- **Workflow**:
  1. Scan scripts/ subdirectories for installer files (install*.js, install-*.js)
  2. Execute each installer via Node.js
  3. Configure foreman-templates with repo root as assets source
  4. Prompt user to run send-agents (optional)
  5. Prompt user to run send-commands (optional)
  6. Report success/failure counts
- **Dependencies**:
  - All individual installer scripts in scripts/*/

---

### md-to-pdf
- **Location**: `/Users/miles/.my_coding/scripts/md-to-pdf/md-to-pdf.js`
- **Purpose**: Render Markdown files to PDF using Quarto with Chromium engine.
- **Invoked By**: Manual execution
- **Parameters**:
  - `<path/to/file.md>` (required) - Input markdown file
  - `--out <file.pdf>` - Output PDF path
  - `--paper letter|a4` - Paper size (default: letter)
  - `--margin "0.75in"` - Page margins
  - `--chrome-path <path>` - Custom Chrome/Chromium path
  - `--no-toc` - Disable table of contents
  - `--no-wrap` - Disable code wrapping
  - `--no-github-style` - Disable GitHub-style highlighting
- **Workflow**:
  1. Parse arguments
  2. Ensure Quarto is installed (auto-install if possible)
  3. Resolve input path (supports relative paths from cwd, foreman root, or project root)
  4. Detect Chrome/Chromium path
  5. Generate Quarto metadata YAML and CSS header
  6. Run quarto render with pdf-engine: chromium
  7. Output PDF path on success
- **Dependencies**:
  - `helpers/project-detection/index.js`
  - `helpers/fs-utils/index.js`
  - External: Quarto, Chrome/Chromium

---

### score-candidate
- **Location**: `/Users/miles/.my_coding/scripts/proto-scorer/score-candidate.js`
- **Purpose**: Score OSS candidates (templates, APIs, services) using a formula-based evaluation system.
- **Invoked By**: Manual execution during prototype research
- **Parameters**:
  - `release <id>` (required) - Release identifier
  - `type <template|api|service>` (required) - Candidate type
  - `name "<Name>"` (required) - Candidate name
  - Various scoring inputs (type-specific):
    - Template: mhit, mtotal, nhit, ntotal, nic_*, hours, dq_*, days_last_commit, etc.
    - API: ff_req, ff_cov, pa_*, avg_latency_ms, etc.
    - Service: required_caps, covered_caps, docker, helm, metrics, etc.
  - `url <url>` - Candidate URL
  - `license <text>` - License type
  - `capabilities <comma,list>` - Capabilities covered
  - `timebox <hours>` - Integration timebox
- **Workflow**:
  1. Parse arguments and key-value pairs
  2. Validate inputs based on candidate type
  3. Calculate subscores (RC, NIC, IE, DQ, MH, LC, SP, LR, etc.)
  4. Compute overall OSS score using type-specific formula
  5. Append score document to YAML file (templates.yaml, apis.yaml, or services.yaml)
  6. Output JSON result
- **Dependencies**:
  - `lib/store.js`
  - `lib/kv.js`
  - `lib/normalize.js`
  - `lib/validation.js`
  - `lib/scoring.js`

---

### score-composition
- **Location**: `/Users/miles/.my_coding/scripts/proto-scorer/score-composition.js`
- **Purpose**: Compute optimal compositions of templates, APIs, and services for a release.
- **Invoked By**: Manual execution during prototype planning
- **Parameters**:
  - `release <id>` (required) - Release identifier
  - `from-yaml` - Read candidates from YAML files
  - `must <a,b,c>` (required) - Must-have capabilities
  - `nice <x,y>` (optional) - Nice-to-have capabilities
  - `timebox <hours>` (optional) - Total time budget (default: 40)
  - `--mode greenfield|brownfield|apiservices` - Composition mode
  - `--pretty` - Pretty-print JSON output
  - `--write` - Write composition to compositions.yaml
- **Workflow**:
  1. Parse CLI arguments
  2. Load scored candidates from YAML files in release directory
  3. For each template (or none in apiservices mode):
     - Compute composition score with APIs/services
     - Track best CFS (Composite Fitness Score)
  4. Output best composition plan
  5. Optionally write to compositions.yaml
- **Dependencies**:
  - `lib/project.js`
  - `lib/store.js`
  - `lib/scoring.js`

---

### shared-util-check
- **Location**: `/Users/miles/.my_coding/scripts/shared-util-check/shared-util-check.js`
- **Purpose**: Evaluate whether a shared utility meets creation criteria (SUCS score >= 70 and all gates pass).
- **Invoked By**: Manual execution during shared utility evaluation
- **Parameters**:
  - `dm <0-100>` - Domain Match score
  - `cfc <0-100>` - Cross-Functional Coverage
  - `crr <0-100>` - Code Reuse Ratio
  - `sas <0-100>` - Standalone Architecture Score
  - `coh <0-100>` - Cohesion score
  - `df <0-100>` - Duplication Factor (penalized)
  - `ps <0-100>` - Performance Score
  - `tcg <0-100>` - Test Coverage Grade
  - `og <0-100>` - Observability Grade
  - `security_privacy <0|1>` - Gate: security/privacy compliant
  - `licensing <0|1>` - Gate: licensing compliant
  - `api_stability <0|1>` - Gate: API stability met
  - `observability <0|1>` - Gate: observability requirements met
  - `tests_docs_in_scope <0|1>` - Gate: tests and docs in scope
  - `--json` - Output detailed JSON
  - `--explain` - Explain failure reasons
  - Weight overrides: `w_dm`, `w_cfc`, etc.
- **Workflow**:
  1. Parse key-value arguments
  2. Extract and clamp metric values (0-100)
  3. Apply weights to compute SUCS score
  4. Check all boolean gates
  5. Output 'true' or 'false' (exit code 0 or 1)
  6. Optionally output JSON details or explain failures
- **Dependencies**:
  - `helpers/normalize-utils/index.js`

## Cross-Script Patterns

### Project Detection
All project-aware scripts use the same pattern:
1. `findProjectRoot()` - Walks up directory tree looking for `.foreman-project` marker
2. `getProjectConfig()` - Reads/creates project configuration
3. `findForemanRoot()` - Locates release directory structure

### Argument Parsing
Most scripts use the shared `arg-parser` helper:
- `parseArgs(argv)` - Structured argument parsing
- `isHelpRequested(args)` - Help flag detection
- `getArg(args, key, default)` - Safe value retrieval

### Atomic File Operations
Scripts that write files use atomic patterns:
1. Write to temporary file with unique name
2. Atomic rename to target path
3. Cleanup on failure

### Terminal Automation (macOS)
`handoff-claude` and `exit-shell` use AppleScript via `osascript`:
- Support for Terminal, iTerm, and Warp
- Handle differences in AppleScript APIs between apps
- Graceful fallbacks for unsupported configurations

### Installation Pattern
Each script has an installer in its directory:
- Named `install-*.js` or `install*.js`
- Uses `cli-installer` helper for cross-platform symlinking
- Idempotent (safe to re-run)

## Key Insights

1. **Decoupled Design**: Scripts are standalone CLIs that communicate via file system (activity logs, YAML scores) rather than direct coupling. This enables parallel agent execution.

2. **Chain Workflow Support**: The `handoff-claude` and `exit-shell` scripts enable chain commands that spawn new terminal sessions, allowing complex multi-agent workflows to proceed without human intervention.

3. **Agent Integration**: The `log-activity` script is referenced in 28+ agent files, serving as the primary mechanism for agents to record their progress.

4. **Two-Level Asset Management**: Templates can be managed at both global level (via `foreman-templates configure`) and per-project level (via `.foreman-project` configuration).

5. **No External Dependencies**: All scripts are pure Node.js with no npm dependencies, using shared helpers for common functionality. This ensures portability and reduces maintenance burden.

6. **Scoring System**: The proto-scorer scripts implement a sophisticated evaluation framework for OSS candidate selection, with type-specific scoring formulas and composition optimization.

7. **Memory Validation**: The `memory-update --validate` functionality provides automated checking of CLAUDE.md files against depth-scaled size limits and structural requirements.

8. **Helper Library**: 14 helper modules provide reusable functionality (arg parsing, path handling, git operations, file system utilities), following DRY principles across all scripts.
