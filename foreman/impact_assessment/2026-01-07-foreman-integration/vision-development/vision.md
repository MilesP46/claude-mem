# Forge: The Living Orchestration System

> "The people who are crazy enough to think they can change the world are the ones who do."

---

## Executive Summary

We're not integrating foreman and claude-mem. We're **creating something new**.

**Forge** is a living orchestration system where commands, agents, skills, and rules are nodes in a graph. Where relationships have history. Where the system learns how you work and adapts to you. Where authoring is visual, immediate, and intelligent. Where every decision made during planning is visible, controllable, and traceable. Where changes made in external terminals flow seamlessly into your editor with surgical review capabilities.

### The Core Breakthrough

Today's orchestration is static text. Files reference other files with no validation, no history, no understanding. You write `@agent/backend-worker` and hope it exists. You make decisions during planning and lose them in markdown files. You run Claude Code in your terminal and VS Code knows nothing about it.

Forge transforms orchestration into a **living system**:

1. **Artifacts as nodes** in a queryable graph with relationships, execution history, and learned behaviors
2. **Behavior learning** that observes how you work and adapts without asking
3. **Planning visibility** that surfaces every decision with user control at key points
4. **Terminal-to-editor bridge** that brings external Claude Code changes into VS Code with Cursor-style Keep/Discard review

### Why It Matters

We're not building a tool. We're building the **future of development environments**.

Today's IDEs are passive. They wait for you to act. They forget between sessions. They don't learn.

Forge is **active**. It observes. It remembers. It adapts. It becomes an extension of how you work, not a tool you work with.

---

## Part 1: The Foundation

### 1.1 The Database-Backed Artifact Model

*Source: v1*

Every command, agent, skill, instruction, template, and rule becomes a **node** in a graph database. Relationships between them become **edges** with metadata about usage frequency, confidence, and context.

```
THE LIVING GRAPH
+--------------------------------------------------------+
|                                                         |
|       +-----------------------------------------+       |
|       |         ARTIFACT DATABASE               |       |
|       |                                         |       |
|       |  +---------+    edge    +---------+    |       |
|       |  | Command |----------->|  Agent  |    |       |
|       |  |  Node   |  (127 runs |  Node   |    |       |
|       |  |         |   80% ok)  |         |    |       |
|       |  +----+----+            +----+----+    |       |
|       |       |                      |         |       |
|       |       | edge                 | edge    |       |
|       |       | (auto-detected)      |         |       |
|       |       v                      v         |       |
|       |  +---------+            +---------+    |       |
|       |  |Template |            |  Skill  |    |       |
|       |  |  Node   |            |  Node   |    |       |
|       |  +---------+            +---------+    |       |
|       |                                         |       |
|       +-----------------------------------------+       |
|                         |                               |
|                         v                               |
|       +-----------------------------------------+       |
|       |         BEHAVIOR LAYER                  |       |
|       |                                         |       |
|       |  * User runs npm run dev (92%)          |       |
|       |  * User prefers test-after (78%)        |       |
|       |  * User always verifies UI              |       |
|       |  * User uses conventional commits       |       |
|       |                                         |       |
|       +-----------------------------------------+       |
|                         |                               |
|                         v                               |
|       +-----------------------------------------+       |
|       |         EXECUTION HISTORY               |       |
|       |                                         |       |
|       |  Session 1: command -> agent -> skill   |       |
|       |  Session 2: command -> agent (failed)   |       |
|       |  Session 3: command -> agent -> skill   |       |
|       |                                         |       |
|       +-----------------------------------------+       |
|                                                         |
+--------------------------------------------------------+
```

The graph enables:
- **Edit-time validation**: Reference an unknown artifact? Red squiggle immediately.
- **Relationship navigation**: Double-click to jump from command to agent to skill.
- **Execution intelligence**: This command succeeded 80% of the time. This agent averages 2,341 tokens.
- **Automatic detection**: Relationships inferred from both explicit `@references` and observed execution patterns.

### 1.2 The Living Memory Layer

*Source: v1 + v2 integration*

Forge extends claude-mem's SQLite database with new tables for artifacts, relationships, executions, and behaviors:

```sql
-- Every command, agent, skill, instruction, template, rule is a node
CREATE TABLE forge_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN (
    'command', 'agent', 'skill', 'instruction', 'template', 'rule'
  )),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  frontmatter JSON,
  checksum TEXT NOT NULL,  -- SHA-256 for conflict detection

  format_version TEXT DEFAULT '1.0',
  format_valid BOOLEAN DEFAULT true,
  format_errors JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(project_id, artifact_type, name)
);

-- Edges: How artifacts connect
CREATE TABLE forge_relations (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'launches', 'uses_skill', 'references_template',
    'applies_rule', 'includes_instruction'
  )),

  context_line INTEGER,    -- Line number in source
  context_text TEXT,       -- Surrounding text

  detection_method TEXT CHECK (detection_method IN ('explicit', 'inferred', 'manual')),
  confidence REAL DEFAULT 1.0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Execution: When artifacts run
CREATE TABLE forge_executions (
  id INTEGER PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  parent_execution_id INTEGER REFERENCES forge_executions(id),

  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  status TEXT CHECK (status IN ('running', 'success', 'failure', 'timeout')),
  tokens_used INTEGER,
  error_message TEXT,

  -- Links to claude-mem observations
  observation_ids JSON,

  -- Child artifacts launched
  child_artifacts JSON
);

-- Behaviors: Learned user patterns
CREATE TABLE forge_behaviors (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN (
    'script_usage', 'build_mode', 'test_strategy',
    'commit_style', 'verification_pref', 'editor_pref'
  )),

  pattern_key TEXT NOT NULL,
  pattern_value TEXT NOT NULL,

  evidence_count INTEGER DEFAULT 1,
  evidence_sessions JSON,  -- Array of session IDs

  confidence REAL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),

  first_seen TIMESTAMP NOT NULL,
  last_seen TIMESTAMP NOT NULL,

  UNIQUE(project_id, behavior_type, pattern_key)
);
```

The database integrates with existing claude-mem tables:

```sql
-- forge_executions links to sessions (existing claude-mem table)
-- This connects Forge execution tracking to existing session management

-- forge_executions.observation_ids links to observations (existing table)
-- This connects Forge execution to existing observation storage

-- Example query: Get all observations for a command execution
SELECT o.*
FROM observations o
JOIN json_each(
  (SELECT observation_ids FROM forge_executions WHERE id = ?)
) AS oid ON o.id = oid.value;

-- Example query: Get behavior context for a session
SELECT b.pattern_key, b.pattern_value, b.confidence
FROM forge_behaviors b
JOIN sessions s ON b.project_id = s.project_id
WHERE s.id = ?
  AND b.confidence > 0.7
ORDER BY b.confidence DESC;
```

### 1.3 Bidirectional File Sync

*Source: v1*

Artifacts live in the database but are also on disk for version control, external editing, and CLI access:

```
SYNC ARCHITECTURE
+--------------------------------------------------------------+
|                                                              |
|  .claude/                                                    |
|  +-- commands/              <--+                             |
|  |   +-- forge-issue.md        |                             |
|  |   +-- forge-impact.md       |                             |
|  |   +-- forge-plan.md         |                             |
|  |                             | BIDIRECTIONAL SYNC          |
|  +-- agents/                   |                             |
|  |   +-- forge-backend.md      | * File edit -> DB update    |
|  |   +-- forge-frontend.md     | * DB edit -> File write     |
|  |                             | * Checksum for conflicts    |
|  +-- skills/                   |                             |
|  |   +-- forge-analyze-error/  |                             |
|  |       +-- SKILL.md      <---+                             |
|  |                                                           |
|  +-- CLAUDE.md                  (References, not content)    |
|                                                              |
+--------------------------------------------------------------+
                              |
                              v
+--------------------------------------------------------------+
| FORGE DATABASE (~/.claude-mem/forge.db)                      |
|                                                              |
| forge_artifacts:                                             |
|   - id, type, name, content, frontmatter, checksum           |
|                                                              |
| forge_relations:                                             |
|   - source -> target, type, line, confidence                 |
|                                                              |
| forge_executions:                                            |
|   - artifact, session, status, tokens, observations          |
|                                                              |
| forge_behaviors:                                             |
|   - pattern, evidence, confidence                            |
|                                                              |
+--------------------------------------------------------------+
```

---

## Part 2: The Visual Layer

### 2.1 The Visual Editor

*Source: v1*

The Forge editor transforms artifact authoring from text editing to visual programming:

```
+-------------------------------------------------------------------------+
| Forge Editor                                              [#] [-] [x]   |
+-------------------------------------------------------------------------+
| [+ Command] [+ Agent] [+ Skill] [Settings]        [> Run] [@ Sync]      |
+---------------+---------------------------------+-----------------------+
| ARTIFACTS     | CONTENT                         | RELATIONSHIPS         |
|               |                                 |                       |
| v Commands    | ---                             |      +-----------+    |
|   +- forge-   | name: forge-impact              |      |forge-impact|   |
|     impact    | description: Comprehensive...   |      +-----+-----+    |
|   +- forge-   | ---                             |            |          |
|     issue     |                                 |     +------+------+   |
|   +- forge-   | # Impact Change                 |     v             v   |
|     plan      |                                 | +-------+   +-------+ |
|               | When user describes a change... | |backend|   |verify | |
| v Agents      |                                 | |-assess|   |-ui    | |
|   +- forge-   | ## Phase 1: Assessment          | +-------+   +-------+ |
|     backend   |                                 |     |           |     |
|   +- forge-   | Launch @agent/forge-backend-    |     v           v     |
|     frontend  | assess| with 5 parallel agents  | +-------+   +-------+ |
|   +- forge-   |        ^                        | |analyze|   |skill/ | |
|     assess    |  +-----+--------------------+   | |-error |   |verify | |
|               |  | @ Autocomplete           |   | +-------+   +-------+ |
| v Skills      |  |                          |   |                       |
|   +- forge-   |  | @agent/forge-backend-    |   | 127 executions        |
|     analyze   |  |   worker                 |   | 80% success rate      |
|   +- forge-   |  | @agent/forge-frontend-   |   | avg 2,847 tokens      |
|     fix-error |  |   dev                    |   |                       |
|               |  | @skill/forge-analyze-    |   |                       |
|               |  |   error                  |   |                       |
|               |  | @template/impact-qrg     |   |                       |
|               |  +--------------------------+   |                       |
+---------------+---------------------------------+-----------------------+
| EXECUTION HISTORY                                                       |
| +---------------------------------------------------------------------+ |
| | Today 3:42pm  | ok Success | 5 agents | 2,341 tokens | [View]       | |
| | Today 2:15pm  | x  Failed  | 3 agents | 1,892 tokens | [View]       | |
| | Yesterday     | ok Success | 5 agents | 3,102 tokens | [View]       | |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

#### Key Features

**@ Autocomplete**: Type `@` anywhere in the content editor. Instantly see all artifacts you can reference with execution stats:

```typescript
interface ArtifactSuggestion {
  type: 'agent' | 'skill' | 'template' | 'rule';
  name: string;
  description: string;
  executionCount: number;
  successRate: number;
  avgTokens: number;
}
```

**Double-Click Navigation**: See `@agent/forge-backend-assess` in your command? Double-click. You're now editing that agent. See what skills it uses. What templates it references. What rules apply.

**Relationship Graph**: The right panel shows what this artifact touches. Not as text. As a visual graph. Color-coded by type. Edge thickness by usage frequency. Click any node to navigate there.

**Execution History**: Not just "this file exists." This file **ran 127 times**. **80% success rate**. **Average 2,847 tokens**. Click to see the observations from each run.

### 2.2 VS Code Integration

*Source: v2*

Forge embeds into VS Code as an extension, leveraging the platform's capabilities:

```
+-----------------------------------------------------------------------------+
|                           VS CODE AS SHELL                                   |
|                                                                              |
|   +-------------+   +----------------------------------------------------+  |
|   |  ARTIFACT   |   |              FORGE WEBVIEW PANEL                    |  |
|   |   TREE      |   |                                                     |  |
|   | (TreeView)  |   |   +----------------------------------------------+ |  |
|   |             |   |   |           REACTFLOW CANVAS                   | |  |
|   | v Commands  |   |   |                                              | |  |
|   |   * forge-  |   |   |      +---------+        +---------+         | |  |
|   |     impact  |   |   |      | Command |------->|  Agent  |         | |  |
|   |   o forge-  |   |   |      |         | 127x   |         |         | |  |
|   |     issue   |   |   |      +----+----+  82%   +----+----+         | |  |
|   |             |   |   |           |                  |              | |  |
|   | v Agents    |   |   |           |     +------------+              | |  |
|   |   * forge-  |   |   |           |     |                          | |  |
|   |     backend |   |   |           v     v                          | |  |
|   |   o forge-  |   |   |      +---------+   +---------+             | |  |
|   |     frontend|   |   |      |Template |   |  Skill  |             | |  |
|   |             |   |   |      +---------+   +---------+             | |  |
|   | v Skills    |   |   |                                              | |  |
|   |   o analyze |   |   +----------------------------------------------+ |  |
|   |   o verify  |   |                                                     |  |
|   |             |   |   +----------------------------------------------+ |  |
|   | v Behaviors |   |   |         MONACO EDITOR (with LSP)             | |  |
|   |   ok npm    |   |   |                                              | |  |
|   |     dev     |   |   |   ---                                        | |  |
|   |   ok test-  |   |   |   name: forge-impact                         | |  |
|   |     after   |   |   |   description: Impact change workflow        | |  |
|   |   ok verify |   |   |   ---                                        | |  |
|   |     UI      |   |   |                                              | |  |
|   |             |   |   |   Launch @agent/forge-backend-assess| ...    | |  |
|   +-------------+   |   |            +-------------------------+       | |  |
|                     |   |            Autocomplete: @agent/forge-...    | |  |
|                     |   |                                              | |  |
|                     |   +----------------------------------------------+ |  |
|                     +----------------------------------------------------+  |
|                                                                              |
|   +----------------------------------------------------------------------+  |
|   |                    INTEGRATED TERMINAL (Observed)                     |  |
|   |                                                                       |  |
|   |  ~/claude-mem $ npm run dev                                          |  |
|   |  +---------------------------------------------------------------+   |  |
|   |  | [Forge] Command observed: npm run dev (occurrence #143)       |   |  |
|   |  | [Forge] Updated behavior: script_preference.npm_run_dev = 94% |   |  |
|   |  +---------------------------------------------------------------+   |  |
|   |  > claude-mem@8.5.9 dev                                              |  |
|   |  > bun run src/services/worker-service.ts                           |  |
|   |                                                                       |  |
|   +----------------------------------------------------------------------+  |
|                                                                              |
+-----------------------------------------------------------------------------+
```

#### What VS Code Provides For Free

| Capability | DIY Cost | VS Code Provides |
|------------|----------|------------------|
| **Terminal integration** | 200+ hours | `vscode.window.terminals` API |
| **Git/SCM tracking** | 100+ hours | `vscode.scm` API |
| **File watching** | 40+ hours | `vscode.workspace.createFileSystemWatcher` |
| **Extension distribution** | 80+ hours | VS Code Marketplace |
| **Settings sync** | 60+ hours | Built-in settings sync |
| **Remote development** | 300+ hours | WSL, SSH, Containers - free |
| **Editor integration** | 150+ hours | Monaco editor, LSP support |
| **Diff view & inline actions** | 150+ hours | `vscode.scm` + Decorations API |

**Total saved: 1,150+ engineering hours**

#### Extension Structure

```
forge-vscode/
+-- src/
|   +-- extension.ts              # Activation, commands, providers
|   +-- observers/
|   |   +-- TerminalObserver.ts   # Captures terminal commands
|   |   +-- SCMObserver.ts        # Tracks git operations
|   |   +-- FileObserver.ts       # Watches .claude/ directory
|   +-- providers/
|   |   +-- ArtifactTreeProvider.ts    # TreeView for artifacts
|   |   +-- AgentChangesProvider.ts    # TreeView for pending changes
|   |   +-- AgentChangeCodeLens.ts     # Inline Keep/Discard actions
|   |   +-- AgentChangeDecorations.ts  # Diff highlighting in editor
|   |   +-- HoverProvider.ts           # Hover info for @ refs
|   |   +-- CompletionProvider.ts      # @ autocomplete
|   |   +-- DefinitionProvider.ts      # Go to definition
|   |   +-- DiagnosticProvider.ts      # Invalid reference warnings
|   +-- webview/
|   |   +-- ForgePanel.ts         # Webview panel management
|   |   +-- react/                # React app for webview
|   |       +-- App.tsx
|   |       +-- components/
|   |       |   +-- ReactFlowCanvas.tsx
|   |       |   +-- MonacoEditor.tsx
|   |       |   +-- ExecutionHistory.tsx
|   |       |   +-- BehaviorPanel.tsx
|   |       +-- hooks/
|   |           +-- useArtifacts.ts
|   |           +-- useRelations.ts
|   |           +-- useBehaviors.ts
|   +-- language-server/
|   |   +-- server.ts             # LSP server entry
|   |   +-- completions.ts        # @ completions
|   |   +-- diagnostics.ts        # Reference validation
|   +-- api/
|       +-- ForgeClient.ts        # HTTP + WebSocket client
+-- package.json                  # Extension manifest
+-- tsconfig.json
```

### 2.3 The Language Server

*Source: v2*

Edit-time intelligence for orchestration files via Language Server Protocol:

#### @ Autocomplete

When typing in any `.md` file inside `.claude/`:

```markdown
# forge-impact

Launch @|
        +------------------------------------------------+
        | @ Suggestions                                  |
        |                                                |
        | @agent/                                        |
        |   forge-backend-assess    [127 runs | 82% ok] |
        |   forge-backend-worker    [98 runs  | 79% ok] |
        |   forge-frontend-dev      [145 runs | 91% ok] |
        |                                                |
        | @skill/                                        |
        |   forge-analyze-error     [45 triggers]       |
        |   forge-verify-ui         [67 triggers]       |
        |                                                |
        | @template/                                     |
        |   forge-release-spec      [12 uses]           |
        |   forge-impact-qrg        [89 uses]           |
        |                                                |
        +------------------------------------------------+
```

#### Hover Information

Hovering over `@agent/forge-backend-assess`:

```
+------------------------------------------------------+
| forge-backend-assess                                  |
|                                                       |
| Analyzes backend code for impact assessment.          |
| Examines service files, database operations,          |
| and API endpoints to identify change scope.           |
|                                                       |
| ----------------------------------------------------  |
| Executions: 127                                       |
| Success rate: 82%                                     |
| Avg tokens: 2,341                                     |
| Last run: 2 hours ago                                 |
|                                                       |
| Uses skills:                                          |
|   * @skill/forge-analyze-error (on failure)          |
|   * @skill/forge-restructure (if >200 LOC)           |
|                                                       |
| [Go to definition] [Find all references]             |
+------------------------------------------------------+
```

#### Diagnostics

Invalid reference detection:

```markdown
Launch @agent/forge-bakcend-assess
                    ~~~~~~~~~~~~~~~
        Error: Unknown artifact 'forge-bakcend-assess'
        Did you mean: @agent/forge-backend-assess?
```

---

## Part 3: The Intelligence Layer

### 3.1 Behavior Learning

*Source: v2*

Forge learns how you work by observing, not asking.

#### Terminal Command Observation

```typescript
// In Forge extension activation
vscode.window.onDidOpenTerminal(terminal => {
  terminal.onDidWriteData(data => {
    forge.recordTerminalOutput(terminal.name, data);
  });
});

// On terminal close, analyze the session
vscode.window.onDidCloseTerminal(terminal => {
  const commands = forge.parseTerminalHistory(terminal.name);

  for (const cmd of commands) {
    // Record in database
    await db.insert('forge_terminals', {
      session_id: currentSession,
      command: cmd.text,
      working_dir: cmd.cwd,
      exit_code: cmd.exitCode,
      timestamp: cmd.timestamp
    });

    // Update behavior patterns
    await forge.updateBehavior({
      type: 'script_usage',
      key: cmd.baseCommand,
      value: cmd.fullCommand,
      evidence: session_id
    });
  }
});
```

#### What We Learn

```
TERMINAL OBSERVATION LOG
------------------------------------------------------------
Session S305 | Project: claude-mem | Duration: 45 min
------------------------------------------------------------

Commands executed:
  1. npm run dev          [3x]  -> behavior: always starts dev server
  2. npm run test         [5x]  -> behavior: runs tests frequently
  3. git add .            [2x]  -> behavior: stages all files
  4. git commit -m "..."  [2x]  -> behavior: conventional commits (feat:, fix:)
  5. npm run build        [1x]  -> behavior: builds before commit (sometimes)

Inferred behaviors:
  * build_mode: development (never ran production build)
  * test_strategy: test-during (tests run between edits)
  * commit_style: conventional (100% conventional prefixes)
  * script_runner: npm (not yarn, not bun for scripts)

These behaviors inform future forge-impact runs:
  ok Don't ask "are you in dev mode?" -- we know
  ok Auto-run npm run test after changes
  ok Skip production build verification
  ok Use npm for script execution
```

#### Confidence Formula

```typescript
// Confidence grows with evidence
confidence = min(0.95, 0.5 + (evidence_count * 0.05));

// After 9 occurrences: confidence = 0.95 (maximum)
```

#### The Behavior Pipeline

```
USER TYPES IN TERMINAL
        |
        v
+---------------------------------------------------------------+
| Terminal Observer (VS Code Extension)                          |
|                                                                |
| Captures: "npm run dev"                                        |
| Context: Working dir, timestamp, exit code                     |
+---------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------+
| Forge API: POST /api/forge/terminals                           |
|                                                                |
| {                                                              |
|   "session_id": "S305",                                        |
|   "project_id": "claude-mem",                                  |
|   "command": "npm run dev",                                    |
|   "working_dir": "/Users/miles/claude-mem",                    |
|   "exit_code": 0                                               |
| }                                                              |
+---------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------+
| Behavior Learning Service                                       |
|                                                                |
| Pattern extraction:                                            |
|   * Base command: npm                                          |
|   * Subcommand: run                                            |
|   * Script: dev                                                |
|   * Category: script_usage                                     |
|                                                                |
| Confidence formula:                                            |
|   confidence = min(0.95, 0.5 + (evidence_count * 0.05))       |
+---------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------+
| forge_behaviors table                                           |
|                                                                |
| | pattern_key        | pattern_value | count | confidence |    |
| |--------------------|---------------|-------|------------|    |
| | script.npm_run_dev | npm run dev   | 143   | 0.95       |    |
| | script.npm_test    | npm run test  | 98    | 0.95       |    |
| | commit.style       | conventional  | 87    | 0.95       |    |
| | build.mode         | development   | 156   | 0.95       |    |
+---------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------+
| LATER: User runs /forge-impact "Change auth to JWT"            |
|                                                                |
| Behavior context injection (no questions asked):               |
|                                                                |
| "Based on observed behaviors:                                  |
|  * Build mode: development (skip production build)             |
|  * After changes: run npm run dev                              |
|  * Verification: run npm run test                              |
|  * UI changes: trigger forge-verify-ui                         |
|                                                                |
|  Proceeding with these assumptions..."                         |
+---------------------------------------------------------------+
```

### 3.2 Agent Change Review

*Source: v2 + v4*

When Claude Code makes changes, you see them with surgical precision and control.

#### The Cursor Paradigm

Cursor IDE pioneered inline change review: agent-made edits appear as diffs with per-line Keep/Discard controls. Forge brings this to VS Code:

```
+-----------------------------------------------------------------------------+
| src/services/auth/JWTService.ts                     [Agent: forge-backend]  |
+-----------------------------------------------------------------------------+
|                                                                              |
|   12   import { User } from '../models/User';                               |
|   13   import { TokenPayload } from '../types';                             |
|   14                                                                        |
| +- AGENT CHANGE ------------------------------------------- [ok Keep] [x] -+|
| |- 15   const SECRET = process.env.JWT_SECRET;                             ||
| |+ 15   const SECRET = process.env.JWT_SECRET ?? 'dev-fallback';           ||
| +-------------------------------------------------------------------------- +|
|   16                                                                        |
|   17   export class JWTService {                                            |
| +- AGENT CHANGE ------------------------------------------- [ok Keep] [x] -+|
| |+ 18     private readonly refreshTokenTTL = 60 * 60 * 24 * 7; // 7 days   ||
| |+ 19                                                                      ||
| +--------------------------------------------------------------------------+|
|   20     constructor(private secret: string = SECRET) {}                    |
|   21                                                                        |
| +- AGENT CHANGE ------------------------------------------- [ok Keep] [x] -+|
| |  22     async generateToken(user: User): Promise<string> {               ||
| |- 23       return jwt.sign({ userId: user.id }, this.secret);             ||
| |+ 23       return jwt.sign(                                               ||
| |+ 24         { userId: user.id, email: user.email },                      ||
| |+ 25         this.secret,                                                 ||
| |+ 26         { expiresIn: '1h' }                                          ||
| |+ 27       );                                                             ||
| |  28     }                                                                ||
| +--------------------------------------------------------------------------+|
|                                                                              |
+-----------------------------------------------------------------------------+
|  3 changes  |  [ok Accept All]  [x Discard All]  [View Full Diff]           |
+-----------------------------------------------------------------------------+
```

#### The Agent Changes View

A dedicated panel in the explorer showing all pending agent changes:

```
+---------------------------------------------+
| AGENT CHANGES                    [@] [ok All]|
+---------------------------------------------+
|                                             |
| v forge-backend-worker (Session S305)       |
|   |                                         |
|   +- src/services/auth/JWTService.ts        |
|   |    3 hunks * +15 -4 lines               |
|   |    [ok Accept] [x Discard] [eye View]   |
|   |                                         |
|   +- src/services/auth/RefreshToken.ts      |
|   |    1 hunk * +28 -0 lines (new file)     |
|   |    [ok Accept] [x Discard] [eye View]   |
|   |                                         |
|   +- tests/auth/jwt.test.ts                 |
|        2 hunks * +45 -12 lines              |
|        [ok Accept] [x Discard] [eye View]   |
|                                             |
| > forge-frontend-dev (Session S305)         |
|     2 files * 4 hunks pending               |
|                                             |
+---------------------------------------------+
| Total: 5 files * 10 hunks * +88 -16 lines   |
|                                             |
| [ok Accept All] [x Discard All] [<- Undo]   |
+---------------------------------------------+
```

#### Inline Decorations

```typescript
// Decoration types
const agentAdditionDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(46, 160, 67, 0.15)',
  isWholeLine: true,
  gutterIconPath: agentIcon,
  gutterIconSize: 'contain'
});

const agentDeletionDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(248, 81, 73, 0.15)',
  isWholeLine: true,
  textDecoration: 'line-through'
});

// CodeLens for each hunk
class AgentChangeCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const changes = forge.getPendingChanges(document.uri.fsPath);
    return changes.flatMap(change =>
      change.hunks.map(hunk => new vscode.CodeLens(
        new vscode.Range(hunk.startLine - 1, 0, hunk.startLine - 1, 0),
        {
          title: `robot ${change.agent}: ${hunk.summary}`,
          command: 'forge.showHunkActions',
          arguments: [change, hunk]
        }
      ))
    );
  }
}
```

#### Decision Recording

Every accept/reject decision feeds back into the system:

```typescript
async function recordChangeDecision(
  change: AgentChange,
  hunk: ChangeHunk,
  decision: 'accepted' | 'rejected'
) {
  // Update pending change status
  hunk.status = decision;

  if (decision === 'rejected') {
    await revertHunk(change.file, hunk);
  }

  // Record decision for learning
  await db.insert('forge_change_decisions', {
    agent_id: change.agent,
    file_path: change.file,
    hunk_hash: hashHunk(hunk),
    decision,
    timestamp: new Date()
  });

  // Update agent confidence based on acceptance rate
  await updateAgentConfidence(change.agent);
}
```

This creates a feedback loop: agents whose changes are consistently rejected see reduced confidence scores, affecting future routing decisions.

---

## Part 4: The Planning Layer

*Source: v3*

### 4.1 Pipeline Tracker

When you run chain workflows, the Pipeline Tracker shows exactly where you are:

```
+-----------------------------------------------------------------------------+
| PLANNING PIPELINE                                          Release 9 | Green|
+-----------------------------------------------------------------------------+
|                                                                              |
|  +---------+    +---------+    +---------------------------------------------+
|  | CONCEPT |-->| PLAN    |-->|              DESIGN PHASE                   |
|  |  GEN    |    |  INIT   |    |                                             |
|  |   ok    |    |   ok    |    |  +---------+  +---------+  +---------+     |
|  +---------+    +---------+    |  |RESEARCH |  |   UX    |  |   UI    |     |
|                                |  |         |  |         |  |         |     |
|                                |  | ok Done |  | * Active|  | o Next  |     |
|                                |  +---------+  +---------+  +---------+     |
|                                |        |            |            |          |
|                                |  +---------+  +---------+  +---------+     |
|                                |  |  ARCH   |  | WHIMSY  |  | ISSUES  |     |
|                                |  |         |  |         |  |         |     |
|                                |  | o Queue |  | o Queue |  | o Queue |     |
|                                |  +---------+  +---------+  +---------+     |
|                                +---------------------------------------------+
|                                                     |                        |
|                                                     v                        |
|                                +---------------------------------------------+
|                                |              EXECUTION PHASE                |
|                                |                                             |
|                                |  Issue 001 ok | Issue 002 * | Issue 003 o   |
|                                |  Issue 004 o | Issue 005 o | Issue 006 o    |
|                                +---------------------------------------------+
|                                                                              |
+-----------------------------------------------------------------------------+
| Current: chain-ux-researcher | Duration: 12m | Decisions: 8 logged | [Pause]|
+-----------------------------------------------------------------------------+
```

#### Pipeline State Storage

```sql
CREATE TABLE forge_pipeline_state (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('greenfield', 'brownfield')),
  current_command TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  current_step INTEGER,

  -- Session integration
  session_name TEXT,
  session_id TEXT,
  is_resumable BOOLEAN DEFAULT true,

  started_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  decisions_count INTEGER DEFAULT 0,
  artifacts_generated JSON,

  UNIQUE(project_id, release_id)
);
```

### 4.2 Decision Explorer

Every decision made during planning is captured, visualized, and queryable:

```
+-----------------------------------------------------------------------------+
| DECISION EXPLORER                                              Release 9    |
+-----------------------------------------------------------------------------+
|                                                                              |
|  Filter: [All Agents v] [All Types v] [All Status v]    Search: [________]  |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  |                          DECISION TIMELINE                             |  |
|  |                                                                        |  |
|  |  RESEARCH ----------------------------------------------------------->|  |
|  |  |                                                                     |  |
|  |  +- DEC-001: UI Framework Selection                                   |  |
|  |  |  Agent: chain-prototype-researcher                                 |  |
|  |  |  Decision: React + shadcn/ui (Score: 8.5)                         |  |
|  |  |  Alternatives: Vue+Vuetify (7.2), Svelte+Skeleton (7.8)           |  |
|  |  |  Status: ok Locked                                                 |  |
|  |  |                                                                     |  |
|  |  +- DEC-002: Authentication Provider                                  |  |
|  |  |  Agent: chain-prototype-researcher                                 |  |
|  |  |  Decision: Supabase Auth (Score: 9.2)                             |  |
|  |  |  Alternatives: Auth0 (8.1), Firebase Auth (7.9)                   |  |
|  |  |  Status: ok Locked                                                 |  |
|  |  |                                                                     |  |
|  |  UX ----------------------------------------------------------------->|  |
|  |  |                                                                     |  |
|  |  +- DEC-003: Primary User Flow                                        |  |
|  |  |  Agent: chain-ux-researcher                                        |  |
|  |  |  Decision: Dashboard-first with progressive disclosure             |  |
|  |  |  ConceptID: CONCEPT-003 (User onboarding)                         |  |
|  |  |  Status: ok Locked                                                 |  |
|  |  |                                                                     |  |
|  |  +- DEC-004: Mobile Strategy                                          |  |
|  |  |  Agent: chain-ux-researcher                                        |  |
|  |  |  Decision: Responsive web (no native app)                          |  |
|  |  |  Status: ! User Override (was: PWA)                               |  |
|  |                                                                        |  |
|  +-----------------------------------------------------------------------+  |
|                                                                              |
|  [Export Decisions] [Compare with Release 8] [View Decision Log]            |
+-----------------------------------------------------------------------------+
```

#### Decision Data Model

```sql
CREATE TABLE forge_planning_decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  agent TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  decision_value TEXT NOT NULL,
  decision_score REAL,

  alternatives JSON,

  concept_ids JSON,
  depends_on JSON,
  source_file TEXT,
  source_line INTEGER,

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'locked', 'user_override', 'inherited'
  )),

  original_value TEXT,
  override_rationale TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  locked_at TIMESTAMP,
  locked_by TEXT
);

CREATE TABLE forge_decision_dependencies (
  id INTEGER PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  depends_on_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  dependency_type TEXT DEFAULT 'requires',

  UNIQUE(decision_id, depends_on_id)
);
```

### 4.3 Decision Setting Panel

After research completes but before design begins, the Decision Setting Panel lets you review and set decisions:

```
+-----------------------------------------------------------------------------+
| DECISION SETTING                                    Release 9 | Post-Research|
+-----------------------------------------------------------------------------+
|                                                                              |
|  Research phase complete. Review and set your decisions before design begins.|
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  | DEPLOYMENT DECISIONS                                       [Lock All]  |  |
|  |                                                                        |  |
|  | +-------------------------------------------------------------------+ |  |
|  | | UI Framework                                              REQUIRED | |  |
|  | |                                                                    | |  |
|  | |  (*) React + shadcn/ui          Score: 8.5  * Recommended         | |  |
|  | |      * Best DX, excellent component quality                       | |  |
|  | |      * Strong TypeScript support                                  | |  |
|  | |      * Active community, regular updates                          | |  |
|  | |                                                                    | |  |
|  | |  ( ) Vue 3 + Vuetify            Score: 7.2                        | |  |
|  | |  ( ) Svelte + Skeleton UI       Score: 7.8                        | |  |
|  | |  ( ) Other: [_______________]                                     | |  |
|  | |                                                                    | |  |
|  | |  [Lock Decision]  [View Full Analysis]                            | |  |
|  | +-------------------------------------------------------------------+ |  |
|  |                                                                        |  |
|  | +-------------------------------------------------------------------+ |  |
|  | | Authentication                                            REQUIRED | |  |
|  | |                                                                    | |  |
|  | |  (*) Supabase Auth              Score: 9.2  * Recommended         | |  |
|  | |  ( ) Auth0                      Score: 8.1                        | |  |
|  | |  ( ) Firebase Auth              Score: 7.9                        | |  |
|  | |  ( ) Custom JWT                 Score: 6.5                        | |  |
|  | |                                                                    | |  |
|  | |  [Lock Decision]  [View Full Analysis]                            | |  |
|  | +-------------------------------------------------------------------+ |  |
|  +-----------------------------------------------------------------------+  |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  | DECISION SUMMARY                                                       |  |
|  |                                                                        |  |
|  |  Required: 3 of 3 set                                                 |  |
|  |  Optional: 2 of 4 enabled                                             |  |
|  |  Locked: 0 (lock to prevent agent modification)                       |  |
|  |                                                                        |  |
|  |  Estimated complexity: Medium (based on selections)                   |  |
|  |  Composition compatibility: ok All services integrate well            |  |
|  +-----------------------------------------------------------------------+  |
|                                                                              |
|  [Save & Continue to Design] [Save as Branch] [Reset to Recommendations]    |
+-----------------------------------------------------------------------------+
```

### 4.4 Template Browser

Templates are the DNA of the chain workflow. The Template Browser makes this visible:

```
+-----------------------------------------------------------------------------+
| TEMPLATE BROWSER                                               Release 9    |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +----------------------------------+  +----------------------------------+  |
|  | TEMPLATE CATEGORIES             |  | TEMPLATE DETAIL                   |  |
|  |                                 |  |                                   |  |
|  | v Planning (4 templates)        |  | release-specification-template.md |  |
|  |   +- concept-checklist    ok    |  |                                   |  |
|  |   +- release-specification ok   |  | +-------------------------------+ |  |
|  |   +- deployment-decision   ok   |  | | Status: ok Used               | |  |
|  |   +- recommendation-report ok   |  | | Output: release9-spec.md      | |  |
|  |                                 |  | | Completeness: 100%            | |  |
|  | v UX Research (4 templates)     |  | +-------------------------------+ |  |
|  |   +- user-flows           ok    |  |                                   |  |
|  |   +- personas             ok    |  | Placeholders:                     |  |
|  |   +- wireframes           *     |  | +-------------------------------+ |  |
|  |   +- interaction-patterns o     |  | | {{RELEASE_NUMBER}}    -> 9    | |  |
|  |                                 |  | | {{PROJECT_NAME}}      -> Forge| |  |
|  | v UI Design (7 templates)       |  | | {{CONCEPT_SUMMARY}}   -> ...  | |  |
|  |   +- component-specs      o     |  | +-------------------------------+ |  |
|  |   +- design-system        o     |  |                                   |  |
|  |   ...                           |  | [View Template] [View Output]     |  |
|  +----------------------------------+  +----------------------------------+  |
|                                                                              |
|  Legend: ok Complete | * In Progress | o Pending                            |
+-----------------------------------------------------------------------------+
```

#### Template Tracking

```sql
CREATE TABLE forge_template_usage (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  template_path TEXT NOT NULL,
  instructions_path TEXT NOT NULL,
  output_path TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),

  placeholders_total INTEGER,
  placeholders_filled INTEGER,
  completeness_pct REAL GENERATED ALWAYS AS (
    CASE WHEN placeholders_total > 0
    THEN (placeholders_filled * 100.0 / placeholders_total)
    ELSE 100 END
  ) STORED,

  filled_by_agent TEXT,
  filled_at TIMESTAMP,

  UNIQUE(project_id, release_id, template_path)
);
```

### 4.5 Capability Gap Detection

By tracking decision patterns, template usage, and workflow friction, Forge identifies where new capabilities are needed:

```
+-----------------------------------------------------------------------------+
| CAPABILITY GAPS                                                     Analysis|
+-----------------------------------------------------------------------------+
|                                                                              |
|  Based on patterns across 12 releases and 847 decisions:                    |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  | SUGGESTED NEW CAPABILITIES                                             |  |
|  |                                                                        |  |
|  |  wrench COMMAND: /forge-realtime-setup                   Priority: High|  |
|  |     Pattern: 4 releases needed real-time features                     |  |
|  |     Current: Manual setup each time                                   |  |
|  |     Suggestion: Automate Supabase Realtime + Yjs integration         |  |
|  |     [Create Command] [Dismiss]                                        |  |
|  |                                                                        |  |
|  |  robot AGENT: forge-accessibility-reviewer               Priority: Med |  |
|  |     Pattern: Accessibility issues found in 67% of UI reviews          |  |
|  |     Current: Manual review, often missed                              |  |
|  |     Suggestion: Auto-run WCAG checks after chain-ui-designer         |  |
|  |     [Create Agent] [Dismiss]                                          |  |
|  |                                                                        |  |
|  |  zap SKILL: forge-migration-generator                    Priority: Med |  |
|  |     Pattern: Database changes require manual migration writing        |  |
|  |     Current: chain-system-architect outputs schema, not migrations    |  |
|  |     Suggestion: Auto-generate Prisma/Drizzle migrations from schema  |  |
|  |     [Create Skill] [Dismiss]                                          |  |
|  +-----------------------------------------------------------------------+  |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  | DECISION PATTERN INSIGHTS                                              |  |
|  |                                                                        |  |
|  |  * React selected in 92% of releases (consider making default)        |  |
|  |  * Supabase chosen for auth+db in 78% (consider bundled template)    |  |
|  |  * Mobile strategy overridden by user in 45% of cases                |  |
|  |  * API pagination decided inconsistently (cursor: 40%, offset: 60%)  |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

#### Gap Tracking

```sql
CREATE TABLE forge_capability_gaps (
  id INTEGER PRIMARY KEY,
  project_id TEXT,

  gap_type TEXT NOT NULL CHECK (gap_type IN (
    'command', 'agent', 'skill', 'template', 'hook', 'rule'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  pattern_description TEXT,
  evidence_count INTEGER DEFAULT 1,
  evidence_releases JSON,

  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  impact_score REAL,

  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'acknowledged', 'in_progress', 'implemented', 'dismissed'
  )),

  implemented_artifact_id TEXT,
  implemented_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Part 5: The Bridge

*Source: v4*

### 5.1 Session Bridge

The bridge connects external terminal sessions to VS Code.

#### How It Works

1. **Claude Code starts** in external terminal (iTerm2, Ghostty, Kitty, etc.)
2. **claude-mem's SessionStart hook** registers the session with Forge worker
3. **Every tool use** (Edit, Write) triggers PostToolUse hook
4. **Hook captures**: file path, before content, after content, session ID, agent context
5. **Worker processes** the change into hunks
6. **WebSocket broadcasts** to VS Code extension
7. **VS Code decorates** the file with Keep/Discard UI

#### Session Registration

```typescript
// src/hooks/session-start-hook.ts (enhanced for Forge)
export async function onSessionStart(session: Session) {
  // Existing claude-mem session tracking
  await recordSession(session);

  // Forge enhancement: Register with bridge
  await fetch('http://localhost:37777/api/forge/session/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: session.id,
      terminal_pid: process.ppid,
      terminal_type: detectTerminal(),
      project_root: session.cwd,
      started_at: new Date().toISOString()
    })
  });
}

function detectTerminal(): string {
  if (process.env.ITERM_SESSION_ID) return 'iTerm2';
  if (process.env.GHOSTTY_RESOURCES_DIR) return 'Ghostty';
  if (process.env.KITTY_PID) return 'Kitty';
  if (process.env.WEZTERM_PANE) return 'WezTerm';
  if (process.env.ALACRITTY_SOCKET) return 'Alacritty';
  if (process.env.TERM_PROGRAM) return process.env.TERM_PROGRAM;
  return 'unknown';
}
```

### 5.2 Change Tracker

The worker transforms raw changes into reviewable hunks:

```typescript
// src/services/forge/ChangeTracker.ts
import { createPatch, parsePatch } from 'diff';

export class ChangeTracker {
  async processChange(change: RawChange): Promise<ProcessedChange> {
    // Generate unified diff
    const patch = createPatch(
      change.file_path,
      change.before_content || '',
      change.after_content,
      'before',
      'after'
    );

    // Parse into hunks
    const parsed = parsePatch(patch)[0];
    const hunks: ChangeHunk[] = parsed.hunks.map((hunk, index) => ({
      id: `${change.session_id}-${change.file_path}-${index}`,
      startLine: hunk.newStart,
      endLine: hunk.newStart + hunk.newLines - 1,
      lines: hunk.lines,
      original: this.extractOriginal(hunk),
      modified: this.extractModified(hunk),
      status: 'pending' as const
    }));

    // Generate AI summary for each hunk
    const summaries = await this.generateHunkSummaries(hunks, change);

    return {
      id: `change-${Date.now()}`,
      session_id: change.session_id,
      file_path: change.file_path,
      agent: change.agent,
      hunks: hunks.map((h, i) => ({ ...h, summary: summaries[i] })),
      timestamp: new Date(change.timestamp),
      status: 'pending'
    };
  }

  private async generateHunkSummaries(hunks: ChangeHunk[], change: RawChange): Promise<string[]> {
    const summaries = await Promise.all(hunks.map(async (hunk) => {
      const response = await generateSummary({
        model: 'claude-3-haiku-20240307',
        prompt: `Summarize this code change in 10 words or less:\n\n${hunk.lines.join('\n')}`
      });
      return response.trim();
    }));
    return summaries;
  }
}
```

### 5.3 WebSocket Hub

Real-time broadcasting to VS Code and browser clients:

```typescript
// src/services/forge/WebSocketHub.ts
import { WebSocketServer, WebSocket } from 'ws';

export class WebSocketHub {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/forge/live' });

    this.wss.on('connection', (ws, req) => {
      const clientId = req.headers['x-client-id'] as string || crypto.randomUUID();
      const clientType = req.headers['x-client-type'] as string;

      this.clients.set(clientId, ws);

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      this.sendPendingChanges(ws);
    });
  }

  broadcastChange(change: ProcessedChange) {
    const message = JSON.stringify({
      type: 'agent_change',
      payload: change
    });

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}
```

### 5.4 The Complete Flow

```
REAL-TIME SYNC FLOW
+-----------------------------------------------------------------------------+
|                                                                              |
|   T+0s    Claude Code (external terminal)                                   |
|           > Edit src/auth/jwt.ts                                            |
|                                                                              |
|   T+0.1s  claude-mem PostToolUse hook fires                                 |
|           +-- Captures: {file, before, after, session, agent}               |
|                                                                              |
|   T+0.2s  Hook POSTs to Forge worker                                        |
|           +-- POST http://localhost:37777/api/forge/changes                 |
|                                                                              |
|   T+0.3s  Worker processes change                                           |
|           +-- Generates hunks, AI summary                                   |
|                                                                              |
|   T+0.5s  WebSocket broadcasts to VS Code                                   |
|           +-- WS message: {type: 'agent_change', payload: {...}}            |
|                                                                              |
|   T+0.6s  VS Code extension receives                                        |
|           +-- Updates AgentChangeManager                                    |
|                                                                              |
|   T+0.7s  Decorations update                                                |
|           +-- File shows inline diffs with Keep/Discard                     |
|                                                                              |
|   T+0.8s  Status bar updates                                                |
|           +-- "Forge: 3 pending"                                            |
|                                                                              |
|   T+0.9s  Notification appears (optional)                                   |
|           +-- "Agent change: src/auth/jwt.ts (3 hunks)"                     |
|                                                                              |
|   TOTAL: < 1 second from edit to visual feedback                            |
+-----------------------------------------------------------------------------+
```

---

## Part 6: Unified Planning

*Source: v1 + v3*

### 6.1 The Research Cache

Research findings persist between planning cycles:

```sql
CREATE TABLE forge_planning (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  planning_mode TEXT NOT NULL CHECK (planning_mode IN ('greenfield', 'brownfield', 'hybrid')),
  current_phase TEXT NOT NULL CHECK (current_phase IN (
    'research', 'concept', 'design', 'architecture', 'issues', 'execution'
  )),

  phase_data JSON,
  research_cache JSON,  -- Persists between planning cycles

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

When you do greenfield research, you learn:
- "React with shadcn/ui scores 8.5"
- "Supabase for auth scores 9.2"
- "Vercel for deployment scores 8.8"

When you later do brownfield ("add real-time sync"), the system:
1. Checks the cache: "What did we learn about this project?"
2. Does **delta research**: "What's needed for real-time that we don't have?"
3. Produces recommendations that **build on** prior decisions

### 6.2 The Phase Convergence

Greenfield and brownfield are not different workflows. They're the same workflow with different starting points:

```
                    THE UNIFIED PLANNING SPECTRUM

     GREENFIELD                                      BROWNFIELD
         |                                               |
         |  Research   Concept   Design    Arch   Issues |
         |     |          |        |        |       |    |
         v     v          v        v        v       v    v
    +------------------------------------------------------------+
    |                                                            |
    |  +----------+                                              |
    |  | RESEARCH |<---- Both paths start here                  |
    |  | PHASE    |      Templates, libraries, services          |
    |  +----+-----+      Scoring, composition                    |
    |       |                                                    |
    |       |  Greenfield: Full stack research                  |
    |       |  Brownfield: Delta research (what's new?)         |
    |       v                                                    |
    |  +----------+                                              |
    |  | CONCEPT/ |      Greenfield: Q&A to define concepts     |
    |  |  SCOPE   |      Brownfield: Scope the change           |
    |  +----+-----+                                              |
    |       |                                                    |
    |       |  Concepts become the connective tissue            |
    |       |  ConceptIDs trace through to completion           |
    |       v                                                    |
    |  +----------+                                              |
    |  | DESIGN   |<---- CONVERGED                              |
    |  | PHASE    |      UX, UI, Architecture                   |
    |  +----+-----+      Same agents, same templates            |
    |       |            Greenfield: Full generation            |
    |       |            Brownfield: Surgical updates           |
    |       v                                                    |
    |  +----------+                                              |
    |  | ISSUES   |<---- IDENTICAL                              |
    |  | PHASE    |      Both produce issue-map/*.yaml          |
    |  +----+-----+      Atomic, sequential, TDD-ready          |
    |       |                                                    |
    |       v                                                    |
    |  +----------+                                              |
    |  |EXECUTION |<---- IDENTICAL                              |
    |  | PHASE    |      RED -> GREEN -> REFACTOR               |
    |  +----------+      Same workflow, same verification       |
    |                                                            |
    +------------------------------------------------------------+
```

---

## Part 7: Implementation Strategy

### 7.1 Database Migrations

Eight new tables for Forge functionality:

| Table | Purpose |
|-------|---------|
| `forge_artifacts` | Commands, agents, skills as graph nodes |
| `forge_relations` | Edges between artifacts |
| `forge_executions` | When and how artifacts ran |
| `forge_behaviors` | Learned user patterns |
| `forge_terminals` | Raw terminal command history |
| `forge_planning` | Research cache, planning state |
| `forge_pipeline_state` | Chain workflow progress |
| `forge_planning_decisions` | Individual planning decisions |
| `forge_decision_dependencies` | Decision graph edges |
| `forge_template_usage` | Template tracking per release |
| `forge_capability_gaps` | Identified missing capabilities |
| `forge_decision_branches` | Alternative decision sets |
| `forge_bridge_sessions` | External terminal session tracking |
| `forge_pending_changes` | Agent changes awaiting review |
| `forge_change_decisions` | Hunk-level decision tracking |

### 7.2 Component Reuse

The existing claude-mem viewer provides reusable foundations:

```typescript
// Extract from src/ui/viewer to shared package
// src/shared/design-system/

export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { shadows } from './shadows';

export { Button } from './components/Button';
export { Card } from './components/Card';
export { Input } from './components/Input';
export { Table } from './components/Table';
export { Badge } from './components/Badge';
export { Tooltip } from './components/Tooltip';

// API hooks work in both web and VS Code webview
export function useForgeArtifacts(projectId: string) {
  return useQuery({
    queryKey: ['forge', 'artifacts', projectId],
    queryFn: () => fetch(`${API_URL}/api/forge/artifacts?project_id=${projectId}`)
      .then(r => r.json())
  });
}
```

### 7.3 Phase Roadmap

| Phase | Focus | Duration |
|-------|-------|----------|
| **Phase 1: Foundation** | Database migrations, Forge API endpoints, bidirectional file sync | 1 week |
| **Phase 2: VS Code Shell** | Extension scaffolding, terminal observer, artifact tree, agent changes view | 1 week |
| **Phase 3: Language Server** | @ autocomplete, hover info, diagnostics, go-to-definition | 1 week |
| **Phase 4: ReactFlow Webview** | Visual graph editing, custom nodes/edges, drag-and-drop | 1 week |
| **Phase 5: Behavior Learning** | Terminal pattern extraction, SCM integration, confidence scoring | 1 week |
| **Phase 6: Planning Layer** | Pipeline tracker, decision explorer, template browser, capability gaps | 1 week |
| **Phase 7: The Bridge** | Session bridge, change tracker, WebSocket hub, real-time sync | 1 week |
| **Phase 8: Full Integration** | Migrate forge commands/agents, skill creation, testing, polish | 2 weeks |

---

## Part 8: Success Metrics

### Technical Metrics

| Metric | Target |
|--------|--------|
| Hook execution time | < 50ms per hook |
| Database query time | < 10ms for common queries |
| WebSocket latency | < 100ms broadcast time |
| File sync time | < 200ms for bidirectional sync |
| Terminal-to-VS Code | < 1 second end-to-end |

### User Experience Metrics

| Metric | Today | Target |
|--------|-------|--------|
| Questions asked by impact-change | 3-5 | 0 |
| Time to navigate command -> agent -> skill | 30s | 2s |
| Artifact validation | Runtime only | Edit-time |
| Behavior consistency | 0% | 85%+ |
| Research reuse (brownfield) | 0% | 70%+ |
| Context load (orchestrator) | Unknown | < 200 tokens |
| Agent skill triggering | Manual | Automatic |
| Change review granularity | All-or-nothing | Per-hunk |
| Agent change acceptance rate | Unknown | 90%+ |
| Planning visibility | None | Full decisions |
| Decision control | File editing | UI + branches |

---

## Appendices

### Appendix A: Database Schema (Complete)

```sql
-- ============================================
-- CORE ARTIFACT TABLES
-- ============================================

CREATE TABLE forge_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN (
    'command', 'agent', 'skill', 'instruction', 'template', 'rule'
  )),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  frontmatter JSON,
  checksum TEXT NOT NULL,

  format_version TEXT DEFAULT '1.0',
  format_valid BOOLEAN DEFAULT true,
  format_errors JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(project_id, artifact_type, name)
);

CREATE TABLE forge_relations (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'launches', 'uses_skill', 'references_template',
    'applies_rule', 'includes_instruction'
  )),

  context_line INTEGER,
  context_text TEXT,

  detection_method TEXT CHECK (detection_method IN ('explicit', 'inferred', 'manual')),
  confidence REAL DEFAULT 1.0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forge_executions (
  id INTEGER PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  parent_execution_id INTEGER REFERENCES forge_executions(id),

  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  status TEXT CHECK (status IN ('running', 'success', 'failure', 'timeout')),
  tokens_used INTEGER,
  error_message TEXT,

  observation_ids JSON,
  child_artifacts JSON
);

-- ============================================
-- BEHAVIOR LEARNING TABLES
-- ============================================

CREATE TABLE forge_behaviors (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN (
    'script_usage', 'build_mode', 'test_strategy',
    'commit_style', 'verification_pref', 'editor_pref'
  )),

  pattern_key TEXT NOT NULL,
  pattern_value TEXT NOT NULL,

  evidence_count INTEGER DEFAULT 1,
  evidence_sessions JSON,

  confidence REAL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),

  first_seen TIMESTAMP NOT NULL,
  last_seen TIMESTAMP NOT NULL,

  UNIQUE(project_id, behavior_type, pattern_key)
);

CREATE TABLE forge_terminals (
  id INTEGER PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  project_id TEXT NOT NULL,

  command TEXT NOT NULL,
  working_dir TEXT,
  exit_code INTEGER,

  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PLANNING TABLES
-- ============================================

CREATE TABLE forge_planning (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  planning_mode TEXT NOT NULL CHECK (planning_mode IN ('greenfield', 'brownfield', 'hybrid')),
  current_phase TEXT NOT NULL CHECK (current_phase IN (
    'research', 'concept', 'design', 'architecture', 'issues', 'execution'
  )),

  phase_data JSON,
  research_cache JSON,

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forge_pipeline_state (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('greenfield', 'brownfield')),
  current_command TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  current_step INTEGER,

  session_name TEXT,
  session_id TEXT,
  is_resumable BOOLEAN DEFAULT true,

  started_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  decisions_count INTEGER DEFAULT 0,
  artifacts_generated JSON,

  UNIQUE(project_id, release_id)
);

CREATE TABLE forge_planning_decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  agent TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  decision_value TEXT NOT NULL,
  decision_score REAL,

  alternatives JSON,

  concept_ids JSON,
  depends_on JSON,
  source_file TEXT,
  source_line INTEGER,

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'locked', 'user_override', 'inherited'
  )),

  original_value TEXT,
  override_rationale TEXT,
  branch_id TEXT DEFAULT 'main',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  locked_at TIMESTAMP,
  locked_by TEXT
);

CREATE TABLE forge_decision_dependencies (
  id INTEGER PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  depends_on_id TEXT NOT NULL REFERENCES forge_planning_decisions(id),
  dependency_type TEXT DEFAULT 'requires',

  UNIQUE(decision_id, depends_on_id)
);

CREATE TABLE forge_decision_branches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  branched_from TEXT DEFAULT 'main',
  branched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  is_active BOOLEAN DEFAULT false,
  merged_at TIMESTAMP,
  merged_into TEXT,

  UNIQUE(project_id, release_id, name)
);

CREATE TABLE forge_template_usage (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  template_path TEXT NOT NULL,
  instructions_path TEXT NOT NULL,
  output_path TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),

  placeholders_total INTEGER,
  placeholders_filled INTEGER,
  completeness_pct REAL GENERATED ALWAYS AS (
    CASE WHEN placeholders_total > 0
    THEN (placeholders_filled * 100.0 / placeholders_total)
    ELSE 100 END
  ) STORED,

  filled_by_agent TEXT,
  filled_at TIMESTAMP,

  UNIQUE(project_id, release_id, template_path)
);

CREATE TABLE forge_capability_gaps (
  id INTEGER PRIMARY KEY,
  project_id TEXT,

  gap_type TEXT NOT NULL CHECK (gap_type IN (
    'command', 'agent', 'skill', 'template', 'hook', 'rule'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  pattern_description TEXT,
  evidence_count INTEGER DEFAULT 1,
  evidence_releases JSON,

  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  impact_score REAL,

  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'acknowledged', 'in_progress', 'implemented', 'dismissed'
  )),

  implemented_artifact_id TEXT,
  implemented_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BRIDGE TABLES
-- ============================================

CREATE TABLE forge_bridge_sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id),
  terminal_pid INTEGER,
  terminal_type TEXT,
  project_root TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  vscode_connected BOOLEAN DEFAULT false,
  browser_connected BOOLEAN DEFAULT false
);

CREATE TABLE forge_pending_changes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  file_path TEXT NOT NULL,
  agent TEXT,
  hunks JSON NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE TABLE forge_change_decisions (
  id INTEGER PRIMARY KEY,
  change_id TEXT NOT NULL REFERENCES forge_pending_changes(id),
  hunk_index INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  decided_in TEXT CHECK (decided_in IN ('vscode', 'browser')),
  decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(change_id, hunk_index)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_artifacts_project ON forge_artifacts(project_id);
CREATE INDEX idx_artifacts_type ON forge_artifacts(artifact_type);
CREATE INDEX idx_relations_source ON forge_relations(source_id);
CREATE INDEX idx_relations_target ON forge_relations(target_id);
CREATE INDEX idx_executions_artifact ON forge_executions(artifact_id);
CREATE INDEX idx_executions_session ON forge_executions(session_id);
CREATE INDEX idx_behaviors_project ON forge_behaviors(project_id);
CREATE INDEX idx_terminals_session ON forge_terminals(session_id);
CREATE INDEX idx_planning_project ON forge_planning(project_id);
CREATE INDEX idx_decisions_release ON forge_planning_decisions(project_id, release_id);
CREATE INDEX idx_decisions_agent ON forge_planning_decisions(agent);
CREATE INDEX idx_decisions_status ON forge_planning_decisions(status);
CREATE INDEX idx_pending_changes_session ON forge_pending_changes(session_id);
CREATE INDEX idx_pending_changes_file ON forge_pending_changes(file_path);
CREATE INDEX idx_pending_changes_status ON forge_pending_changes(status);
```

### Appendix B: API Endpoints Reference

```typescript
// ============================================
// ARTIFACT ENDPOINTS
// ============================================

// List artifacts
GET /api/forge/artifacts
  ?project_id=string
  ?type=command|agent|skill|template|rule

// Create artifact
POST /api/forge/artifacts
  { project_id, artifact_type, name, content }

// Update artifact
PUT /api/forge/artifacts/:id
  { content }

// Delete artifact
DELETE /api/forge/artifacts/:id

// ============================================
// RELATIONSHIP ENDPOINTS
// ============================================

// List relationships
GET /api/forge/relations
  ?artifact_id=string
  ?direction=outgoing|incoming

// ============================================
// BEHAVIOR ENDPOINTS
// ============================================

// List behaviors
GET /api/forge/behaviors
  ?project_id=string
  ?min_confidence=number

// Record terminal command
POST /api/forge/terminals
  { session_id, project_id, command, working_dir, exit_code }

// ============================================
// EXECUTION ENDPOINTS
// ============================================

// List executions
GET /api/forge/executions
  ?artifact_id=string
  ?session_id=string
  ?limit=number

// ============================================
// PLANNING ENDPOINTS
// ============================================

// Get pipeline state
GET /api/forge/planning/pipeline
  ?project_id=string
  ?release_id=string

// List decisions
GET /api/forge/planning/decisions
  ?project_id=string
  ?release_id=string
  ?phase=string
  ?status=string
  ?branch_id=string

// Lock decision
POST /api/forge/planning/decisions/:id/lock

// Override decision
POST /api/forge/planning/decisions/:id/override
  { new_value, rationale }

// List templates
GET /api/forge/planning/templates
  ?project_id=string
  ?release_id=string

// List capability gaps
GET /api/forge/planning/gaps
  ?project_id=string
  ?status=string

// Dismiss gap
POST /api/forge/planning/gaps/:id/dismiss

// List branches
GET /api/forge/planning/branches
  ?project_id=string
  ?release_id=string

// Create branch
POST /api/forge/planning/branches
  { project_id, release_id, name, description }

// ============================================
// BRIDGE ENDPOINTS
// ============================================

// Register session
POST /api/forge/session/register
  { session_id, terminal_pid, terminal_type, project_root, started_at }

// Submit change
POST /api/forge/changes
  { session_id, file_path, tool, before_content, after_content, agent, timestamp }

// Record decision
POST /api/forge/decisions
  { change_id, hunk_index, decision, timestamp }

// WebSocket for real-time sync
WS /api/forge/live

// WebSocket for artifact sync
WS /api/forge/sync
  ?project_id=string
```

### Appendix C: VS Code Extension API

```typescript
// ============================================
// EXTENSION ACTIVATION
// ============================================

interface ForgeExtensionContext {
  wsClient: ForgeWebSocketClient;
  changeManager: AgentChangeManager;
  artifactProvider: ArtifactTreeProvider;
  agentChangesProvider: AgentChangesProvider;
  decorationProvider: AgentChangeDecorationProvider;
  codeLensProvider: AgentChangeCodeLensProvider;
}

// ============================================
// COMMANDS
// ============================================

// Artifact commands
'forge.openEditor'           // Open visual editor
'forge.refresh'              // Refresh artifact tree
'forge.createArtifact'       // Create new artifact
'forge.deleteArtifact'       // Delete artifact

// Change review commands
'forge.acceptHunk'           // Accept single hunk
'forge.rejectHunk'           // Reject single hunk
'forge.acceptAllInFile'      // Accept all in file
'forge.rejectAllInFile'      // Reject all in file
'forge.acceptAllChanges'     // Accept all pending
'forge.rejectAllChanges'     // Reject all pending
'forge.showPendingChanges'   // Show pending changes panel

// Behavior commands
'forge.showBehaviors'        // Show learned behaviors

// ============================================
// PROVIDERS
// ============================================

interface ArtifactTreeProvider extends vscode.TreeDataProvider<ArtifactNode> {
  refresh(): void;
  getChildren(element?: ArtifactNode): ArtifactNode[];
}

interface AgentChangesProvider extends vscode.TreeDataProvider<ChangeNode> {
  refresh(): void;
  getChangesForFile(filePath: string): ProcessedChange[];
  getPendingCount(): number;
}

interface AgentChangeCodeLensProvider extends vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[];
}

// ============================================
// WEBVIEW COMMUNICATION
// ============================================

interface WebviewMessage {
  type: 'select_artifact' | 'update_content' | 'create_relation' | 'refresh';
  payload: unknown;
}

interface ExtensionMessage {
  type: 'artifacts_loaded' | 'artifact_updated' | 'execution_complete';
  payload: unknown;
}
```

### Appendix D: Naming Conventions

| Type | Personal Foreman | Project Forge |
|------|-----------------|---------------|
| **Commands** | `/chain-issue` | `/forge-issue` |
| **Agents** | `backend-worker` | `forge-backend-worker` |
| **Skills** | N/A | `forge-analyze-error` |
| **Templates** | `release-specification-template.md` | `forge-release-template.md` |
| **Rules** | `development-standards.mdc` | `forge-dev-standards.mdc` |

Why "Forge"?
- **Craftsmanship**: Forging implies careful creation
- **Merging**: Forging two systems into one
- **Strength**: Forged metal is stronger than raw ore
- **Distinct**: No collision with `chain-`, `claude-`, or vanilla names

### Appendix E: File Structure

```
Project Structure
-----------------

forge-vscode/                     # VS Code Extension
+-- src/
|   +-- extension.ts
|   +-- observers/
|   |   +-- TerminalObserver.ts
|   |   +-- SCMObserver.ts
|   |   +-- FileObserver.ts
|   +-- providers/
|   |   +-- ArtifactTreeProvider.ts
|   |   +-- AgentChangesProvider.ts
|   |   +-- AgentChangeCodeLens.ts
|   |   +-- AgentChangeDecorations.ts
|   |   +-- HoverProvider.ts
|   |   +-- CompletionProvider.ts
|   |   +-- DefinitionProvider.ts
|   |   +-- DiagnosticProvider.ts
|   +-- webview/
|   |   +-- ForgePanel.ts
|   |   +-- react/
|   |       +-- App.tsx
|   |       +-- components/
|   |       +-- hooks/
|   +-- language-server/
|   |   +-- server.ts
|   |   +-- completions.ts
|   |   +-- diagnostics.ts
|   +-- api/
|       +-- ForgeClient.ts
+-- package.json
+-- tsconfig.json

claude-mem/src/services/forge/    # Worker Service Extensions
+-- ChangeTracker.ts
+-- WebSocketHub.ts
+-- BehaviorLearning.ts
+-- ClaudeMdGenerator.ts
+-- routes/
    +-- ForgeRoutes.ts
    +-- PlanningRoutes.ts
    +-- BridgeRoutes.ts

claude-mem/src/hooks/             # Hook Enhancements
+-- session-start-hook.ts         # + Session registration
+-- post-tool-use-hook.ts         # + Change capture

.claude/                          # Project Artifacts
+-- commands/
|   +-- forge-issue.md
|   +-- forge-impact.md
|   +-- forge-plan.md
+-- agents/
|   +-- forge-backend.md
|   +-- forge-frontend.md
|   +-- forge-assess.md
+-- skills/
|   +-- forge-analyze-error/
|   |   +-- SKILL.md
|   +-- forge-verify-ui/
|       +-- SKILL.md
+-- CLAUDE.md

~/.claude-mem/                    # Runtime Data
+-- claude-mem.db                 # SQLite + Forge tables
+-- forge.db                      # Forge-specific (optional split)
+-- chroma/                       # Vector embeddings
```

---

## The Vision

We're not building a tool. We're building a **craftsman's workbench**.

A place where orchestration is visual. Where relationships are tangible. Where the system learns how you work and adapts to you. Where greenfield and brownfield flow naturally from the same source. Where every artifact has history, has relationships, has meaning. Where decisions are visible and controllable. Where changes from any terminal appear in your editor with surgical review capabilities.

**Forge**: Where foreman meets memory. Where commands come alive. Where planning becomes transparent. Where the terminal and editor become one. Where the future of orchestration authoring begins.

---

*"Design is not just what it looks like and feels like. Design is how it works."*

*"The computer is a bicycle for the mind. But what if the bicycle had two wheels that actually talked to each other?"*

*"Simplicity is the ultimate sophistication."*

*"Details matter. It's worth waiting to get it right."*

This is **Forge**.
