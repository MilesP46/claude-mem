# Forge Vision v2: The Living Development Environment

> "The computer is the most remarkable tool that we've ever come up with. It's the equivalent of a bicycle for our minds."

---

## The Convergence

v1 imagined Forge as a visual editor for orchestration. v2 recognizes something deeper: **the editor is not enough**. We need the entire development environment.

**VS Code** isn't just an IDE. It's a platform. 50 million developers use it daily. It has:
- Terminals where commands are typed
- Git integration where changes flow
- Extensions that augment everything
- Webviews that can render any React application

**ReactFlow** isn't just a graph library. It's a visual programming paradigm used by n8n, Stripe, and countless workflow tools.

**Claude-mem** isn't just observation storage. It's the memory layer that makes everything intelligent.

When these three converge, we don't get a better foreman. We get a **living development environment** that observes, learns, adapts, and assists—without ever leaving the tools developers already use.

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VS CODE AS SHELL                                   │
│                                                                              │
│   ┌─────────────┐   ┌────────────────────────────────────────────────────┐  │
│   │  ARTIFACT   │   │              FORGE WEBVIEW PANEL                    │  │
│   │   TREE      │   │                                                     │  │
│   │ (TreeView)  │   │   ┌──────────────────────────────────────────────┐ │  │
│   │             │   │   │           REACTFLOW CANVAS                   │ │  │
│   │ ▾ Commands  │   │   │                                              │ │  │
│   │   ◉ forge-  │   │   │      ┌─────────┐        ┌─────────┐         │ │  │
│   │     impact  │   │   │      │ Command │───────▶│  Agent  │         │ │  │
│   │   ○ forge-  │   │   │      │         │ 127×   │         │         │ │  │
│   │     issue   │   │   │      └────┬────┘  82%   └────┬────┘         │ │  │
│   │             │   │   │           │                  │              │ │  │
│   │ ▾ Agents    │   │   │           │     ┌────────────┘              │ │  │
│   │   ◉ forge-  │   │   │           │     │                          │ │  │
│   │     backend │   │   │           ▼     ▼                          │ │  │
│   │   ○ forge-  │   │   │      ┌─────────┐   ┌─────────┐             │ │  │
│   │     frontend│   │   │      │Template │   │  Skill  │             │ │  │
│   │             │   │   │      └─────────┘   └─────────┘             │ │  │
│   │ ▾ Skills    │   │   │                                              │ │  │
│   │   ○ analyze │   │   └──────────────────────────────────────────────┘ │  │
│   │   ○ verify  │   │                                                     │  │
│   │             │   │   ┌──────────────────────────────────────────────┐ │  │
│   │ ▾ Behaviors │   │   │         MONACO EDITOR (with LSP)             │ │  │
│   │   ✓ npm dev │   │   │                                              │ │  │
│   │   ✓ test-   │   │   │   ---                                        │ │  │
│   │     after   │   │   │   name: forge-impact                         │ │  │
│   │   ✓ verify  │   │   │   description: Impact change workflow        │ │  │
│   │     UI      │   │   │   ---                                        │ │  │
│   │             │   │   │                                              │ │  │
│   └─────────────┘   │   │   Launch @agent/forge-backend-assess| ...    │ │  │
│                     │   │            └─────────────────────────┘       │ │  │
│                     │   │            Autocomplete: @agent/forge-...    │ │  │
│                     │   │                                              │ │  │
│                     │   └──────────────────────────────────────────────┘ │  │
│                     │                                                     │  │
│                     │   ┌──────────────────────────────────────────────┐ │  │
│                     │   │         EXECUTION HISTORY                    │ │  │
│                     │   │  ┌─────┬───────┬─────────┬─────────┬──────┐ │ │  │
│                     │   │  │Time │Status │ Agents  │ Tokens  │ View │ │ │  │
│                     │   │  ├─────┼───────┼─────────┼─────────┼──────┤ │ │  │
│                     │   │  │3:42 │  ✓    │   5     │  2,341  │  ◉   │ │ │  │
│                     │   │  │2:15 │  ✗    │   3     │  1,892  │  ○   │ │ │  │
│                     │   │  └─────┴───────┴─────────┴─────────┴──────┘ │ │  │
│                     │   └──────────────────────────────────────────────┘ │  │
│                     └────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    INTEGRATED TERMINAL (Observed)                     │  │
│   │                                                                       │  │
│   │  ~/claude-mem $ npm run dev                                          │  │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│   │  │ [Forge] Command observed: npm run dev (occurrence #143)         │ │  │
│   │  │ [Forge] Updated behavior: script_preference.npm_run_dev = 94%   │ │  │
│   │  └─────────────────────────────────────────────────────────────────┘ │  │
│   │  > claude-mem@8.5.9 dev                                              │  │
│   │  > bun run src/services/worker-service.ts                           │  │
│   │                                                                       │  │
│   │  ~/claude-mem $ git commit -m "feat: add JWT auth"                   │  │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│   │  │ [Forge] Commit style: conventional (occurrence #87)             │ │  │
│   │  │ [Forge] Files modified by: forge-backend-worker (session S305)  │ │  │
│   │  └─────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                         FORGE EXTENSION HOST                                 │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │ Terminal Observer │  │  SCM Observer    │  │   File Watcher   │          │
│   │                   │  │                  │  │                  │          │
│   │ Captures every    │  │ Tracks git ops   │  │ Watches .claude/ │          │
│   │ command executed  │  │ Links files to   │  │ Syncs to DB on   │          │
│   │ in all terminals  │  │ sessions/agents  │  │ external edit    │          │
│   └────────┬──────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│            │                      │                     │                    │
│            └──────────────────────┼─────────────────────┘                    │
│                                   │                                          │
│                                   ▼                                          │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    FORGE LANGUAGE SERVER                              │  │
│   │                                                                       │  │
│   │   • Provides @ autocomplete for all .md files in .claude/            │  │
│   │   • Validates references at edit-time (red squiggle if invalid)      │  │
│   │   • Hover shows artifact details (description, run count, success)   │  │
│   │   • Go-to-definition: Click @agent/x to jump to agent                │  │
│   │   • Find all references: See everywhere an artifact is used          │  │
│   │                                                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    CLAUDE-MEM INTEGRATION                             │  │
│   │                                                                       │  │
│   │   • Uses existing worker service (port 37777)                        │  │
│   │   • Adds Forge-specific API endpoints                                │  │
│   │   • Real-time sync via WebSocket                                     │  │
│   │   • Shares observation storage                                       │  │
│   │   • Reuses search MCP tools                                          │  │
│   │                                                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE-MEM BACKEND                                   │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  UNIFIED DATABASE (~/.claude-mem/claude-mem.db)                       │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│   │  │ EXISTING TABLES (claude-mem core)                               │ │  │
│   │  │                                                                 │ │  │
│   │  │  • observations      - Tool usage, summaries, discoveries       │ │  │
│   │  │  • sessions          - Session tracking                         │ │  │
│   │  │  • settings          - User configuration                       │ │  │
│   │  │                                                                 │ │  │
│   │  └─────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│   │  │ FORGE TABLES (new)                                              │ │  │
│   │  │                                                                 │ │  │
│   │  │  • forge_artifacts   - Commands, agents, skills, templates      │ │  │
│   │  │  • forge_relations   - How artifacts connect                    │ │  │
│   │  │  • forge_executions  - When artifacts run                       │ │  │
│   │  │  • forge_behaviors   - Learned user patterns                    │ │  │
│   │  │  • forge_planning    - Research cache, planning state           │ │  │
│   │  │  • forge_terminals   - Terminal command history                 │ │  │
│   │  │                                                                 │ │  │
│   │  └─────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌───────────────────────────────────────┐  ┌───────────────────────────┐  │
│   │     WORKER SERVICE (port 37777)       │  │    SEARCH MCP SERVER     │  │
│   │                                       │  │                          │  │
│   │  Existing endpoints:                  │  │  • search                │  │
│   │    POST /api/observations             │  │  • timeline              │  │
│   │    GET  /api/search                   │  │  • get_observations      │  │
│   │    GET  /api/sessions                 │  │                          │  │
│   │                                       │  │  (used by Claude CLI)    │  │
│   │  New Forge endpoints:                 │  │                          │  │
│   │    GET  /api/forge/artifacts          │  └───────────────────────────┘  │
│   │    POST /api/forge/artifacts          │                                 │
│   │    GET  /api/forge/relations          │  ┌───────────────────────────┐  │
│   │    GET  /api/forge/behaviors          │  │      REACT VIEWER UI     │  │
│   │    WS   /api/forge/sync               │  │                          │  │
│   │                                       │  │  Existing components:    │  │
│   └───────────────────────────────────────┘  │    • ObservationCard     │  │
│                                               │    • SessionList         │  │
│                                               │    • SearchPanel         │  │
│                                               │                          │  │
│                                               │  Reusable for VS Code:   │  │
│                                               │    • Design tokens       │  │
│                                               │    • Dark mode theming   │  │
│                                               │    • API hooks           │  │
│                                               │                          │  │
│                                               └───────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Why VS Code

The question isn't "should we use VS Code?" The question is "why would we build anything else?"

### What We Get for Free

| Capability | DIY Cost | VS Code Provides |
|------------|----------|------------------|
| **Terminal integration** | 200+ hours | `vscode.window.terminals` API |
| **Git/SCM tracking** | 100+ hours | `vscode.scm` API |
| **File watching** | 40+ hours | `vscode.workspace.createFileSystemWatcher` |
| **Extension distribution** | 80+ hours | VS Code Marketplace |
| **Settings sync** | 60+ hours | Built-in settings sync |
| **Remote development** | 300+ hours | WSL, SSH, Containers—free |
| **Editor integration** | 150+ hours | Monaco editor, LSP support |
| **Keyboard shortcuts** | 20+ hours | `keybindings.json` |
| **Command palette** | 30+ hours | `vscode.commands.registerCommand` |
| **Multi-window** | 100+ hours | Built-in |
| **Diff view & inline actions** | 150+ hours | `vscode.scm` + Decorations API |

**Total saved: 1,150+ engineering hours**

### What We Build

1. **Forge Extension** (~600 LOC TypeScript)
   - Terminal observer (captures commands)
   - SCM observer (tracks file changes)
   - File watcher (.claude/ sync)
   - Agent change review (Cursor-style diff with Keep/Discard)
   - Commands (forge-impact, forge-issue, etc.)

2. **Forge Language Server** (~1,500 LOC TypeScript)
   - @ autocomplete provider
   - Reference validation
   - Hover information
   - Go-to-definition

3. **Forge Webview** (~3,000 LOC React)
   - ReactFlow canvas
   - Monaco editor integration
   - Execution history panel
   - Behavior learning panel

4. **Forge API** (~1,000 LOC TypeScript)
   - New endpoints on claude-mem worker
   - WebSocket for real-time sync
   - Database migrations for Forge tables

**Total new code: ~6,000 LOC** vs building from scratch: **50,000+ LOC**

---

## Terminal Command Learning

This is the breakthrough that VS Code enables.

### How It Works

```typescript
// In Forge extension activation
vscode.window.onDidOpenTerminal(terminal => {
  // For each terminal, observe what's typed
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
      key: cmd.baseCommand,  // npm, git, bun, etc.
      value: cmd.fullCommand,
      evidence: session_id
    });
  }
});
```

### What We Learn

```
TERMINAL OBSERVATION LOG
────────────────────────────────────────────────────────────
Session S305 | Project: claude-mem | Duration: 45 min
────────────────────────────────────────────────────────────

Commands executed:
  1. npm run dev          [3x]  → behavior: always starts dev server
  2. npm run test         [5x]  → behavior: runs tests frequently
  3. git add .            [2x]  → behavior: stages all files
  4. git commit -m "..."  [2x]  → behavior: conventional commits (feat:, fix:)
  5. npm run build        [1x]  → behavior: builds before commit (sometimes)

Inferred behaviors:
  • build_mode: development (never ran production build)
  • test_strategy: test-during (tests run between edits)
  • commit_style: conventional (100% conventional prefixes)
  • script_runner: npm (not yarn, not bun for scripts)

These behaviors inform future forge-impact runs:
  ✓ Don't ask "are you in dev mode?" — we know
  ✓ Auto-run npm run test after changes
  ✓ Skip production build verification
  ✓ Use npm for script execution
```

---

## The Language Server

Edit-time intelligence for orchestration files.

### @ Autocomplete

When typing in any `.md` file inside `.claude/`:

```markdown
# forge-impact

Launch @|
        ┌────────────────────────────────────────────────┐
        │ @ Suggestions                                  │
        │                                                │
        │ @agent/                                        │
        │   forge-backend-assess    [127 runs | 82% ✓]  │
        │   forge-backend-worker    [98 runs  | 79% ✓]  │
        │   forge-frontend-dev      [145 runs | 91% ✓]  │
        │                                                │
        │ @skill/                                        │
        │   forge-analyze-error     [45 triggers]       │
        │   forge-verify-ui         [67 triggers]       │
        │                                                │
        │ @template/                                     │
        │   forge-release-spec      [12 uses]           │
        │   forge-impact-qrg        [89 uses]           │
        │                                                │
        └────────────────────────────────────────────────┘
```

### Hover Information

Hovering over `@agent/forge-backend-assess`:

```
┌──────────────────────────────────────────────────────┐
│ forge-backend-assess                                  │
│                                                       │
│ Analyzes backend code for impact assessment.          │
│ Examines service files, database operations,          │
│ and API endpoints to identify change scope.           │
│                                                       │
│ ────────────────────────────────────────────────────  │
│ Executions: 127                                       │
│ Success rate: 82%                                     │
│ Avg tokens: 2,341                                     │
│ Last run: 2 hours ago                                 │
│                                                       │
│ Uses skills:                                          │
│   • @skill/forge-analyze-error (on failure)          │
│   • @skill/forge-restructure (if >200 LOC)           │
│                                                       │
│ [Go to definition] [Find all references]             │
└──────────────────────────────────────────────────────┘
```

### Diagnostics

Invalid reference detection:

```markdown
Launch @agent/forge-bakcend-assess
                    ~~~~~~~~~~~~~~~
        Error: Unknown artifact 'forge-bakcend-assess'
        Did you mean: @agent/forge-backend-assess?
```

---

## ReactFlow Integration

The visual programming layer.

### Custom Node Types

```typescript
// CommandNode - Represents a command artifact
const CommandNode = ({ data }: NodeProps<CommandNodeData>) => (
  <div className="forge-node forge-node-command">
    <div className="node-header">
      <CommandIcon />
      <span>{data.name}</span>
    </div>
    <div className="node-stats">
      <span>{data.executions} runs</span>
      <span className={data.successRate > 80 ? 'success' : 'warning'}>
        {data.successRate}% success
      </span>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// AgentNode - Represents an agent artifact
const AgentNode = ({ data }: NodeProps<AgentNodeData>) => (
  <div className="forge-node forge-node-agent">
    <div className="node-header">
      <AgentIcon />
      <span>{data.name}</span>
    </div>
    <div className="node-skills">
      {data.availableSkills.map(skill => (
        <span key={skill} className="skill-badge">{skill}</span>
      ))}
    </div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// SkillNode - Represents a skill artifact
const SkillNode = ({ data }: NodeProps<SkillNodeData>) => (
  <div className="forge-node forge-node-skill">
    <div className="node-header">
      <SkillIcon />
      <span>{data.name}</span>
    </div>
    <div className="node-triggers">
      {data.triggerCount} triggers
    </div>
    <Handle type="target" position={Position.Top} />
  </div>
);
```

### Edge Styling

```typescript
// Custom edge that shows execution frequency
const ForgeEdge = ({
  id,
  sourceX, sourceY,
  targetX, targetY,
  data
}: EdgeProps<ForgeEdgeData>) => {
  // Thickness based on usage
  const strokeWidth = Math.min(1 + data.executionCount / 20, 8);

  // Color based on success rate
  const strokeColor = data.successRate > 80
    ? '#10b981'  // green
    : data.successRate > 60
      ? '#f59e0b'  // yellow
      : '#ef4444'; // red

  return (
    <path
      id={id}
      className="forge-edge"
      d={`M${sourceX},${sourceY} C${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      fill="none"
    />
  );
};
```

### Drag and Drop

```typescript
// Drop handler for creating relationships
const onDrop = useCallback((event: React.DragEvent) => {
  const artifactId = event.dataTransfer.getData('application/forge-artifact');
  const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

  if (selectedNode) {
    // Create relationship between selected and dropped
    createRelationship({
      source: selectedNode.id,
      target: artifactId,
      type: inferRelationshipType(selectedNode.type, getArtifactType(artifactId))
    });
  } else {
    // Add node at drop position
    addNode({
      id: artifactId,
      position,
      type: getNodeType(artifactId),
      data: await loadArtifactData(artifactId)
    });
  }
}, [selectedNode]);
```

---

## SCM Integration

Learning from git operations.

### File Ownership Inference

```typescript
// In Forge extension
vscode.workspace.onDidChangeTextDocument(event => {
  const { uri, document } = event;

  // Track which files change during which sessions
  if (forge.currentSession) {
    forge.recordFileChange({
      session: forge.currentSession,
      file: uri.fsPath,
      agent: forge.currentAgent,  // if known
      timestamp: Date.now()
    });
  }
});

// On git commit, associate files with agents
vscode.workspace.onDidCommit(async (commit) => {
  const changedFiles = await git.getChangedFiles(commit.hash);

  for (const file of changedFiles) {
    const session = await forge.getSessionForFile(file);
    if (session?.agent) {
      await forge.updateFileOwnership({
        path: file,
        agent: session.agent,
        lastModified: commit.date
      });
    }
  }
});
```

### What We Learn

```
FILE OWNERSHIP MAP (Auto-Inferred)
────────────────────────────────────────────────────────────

src/hooks/*.ts
  └─ Primary: forge-backend-worker (87 modifications)
  └─ Secondary: forge-assess (12 reads)
  └─ Last modified: 2026-01-07 by S305

src/ui/viewer/*.tsx
  └─ Primary: forge-frontend-dev (145 modifications)
  └─ Secondary: forge-verify-ui (67 verifications)
  └─ Last modified: 2026-01-06 by S298

src/services/sqlite/*.ts
  └─ Primary: forge-backend-worker (34 modifications)
  └─ Secondary: forge-assess (56 reads)
  └─ Last modified: 2026-01-07 by S305

tests/*.test.ts
  └─ Primary: forge-backend-worker (parallel with implementations)
  └─ Secondary: forge-test-manager (23 runs)
  └─ Last modified: 2026-01-07 by S305
```

This enables **intelligent routing**. When forge-impact encounters a change:

```
Change: "Update auth to JWT"

Affected files (from impact assessment):
  • src/services/auth/*.ts → route to forge-backend-worker
  • src/ui/viewer/LoginForm.tsx → route to forge-frontend-dev
  • tests/auth.test.ts → parallel with forge-backend-worker

No guessing. No asking. We know.
```

---

## Agent Change Review

When Claude Code CLI executes through Forge commands, changes shouldn't just appear silently in your files. You need to **see what changed**, **understand why**, and **decide what to keep**—with surgical precision.

### The Cursor Paradigm

Cursor IDE pioneered inline change review: agent-made edits appear as diffs with per-line Keep/Discard controls. This is the right UX. Forge brings it to VS Code.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ src/services/auth/JWTService.ts                     [Agent: forge-backend]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   12   import { User } from '../models/User';                               │
│   13   import { TokenPayload } from '../types';                             │
│   14                                                                        │
│ ┌─ AGENT CHANGE ──────────────────────────────────────────── [✓ Keep] [✗] ─┐│
│ │- 15   const SECRET = process.env.JWT_SECRET;                             ││
│ │+ 15   const SECRET = process.env.JWT_SECRET ?? 'dev-fallback';           ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│   16                                                                        │
│   17   export class JWTService {                                            │
│ ┌─ AGENT CHANGE ──────────────────────────────────────────── [✓ Keep] [✗] ─┐│
│ │+ 18     private readonly refreshTokenTTL = 60 * 60 * 24 * 7; // 7 days   ││
│ │+ 19                                                                      ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│   20     constructor(private secret: string = SECRET) {}                    │
│   21                                                                        │
│ ┌─ AGENT CHANGE ──────────────────────────────────────────── [✓ Keep] [✗] ─┐│
│ │  22     async generateToken(user: User): Promise<string> {               ││
│ │- 23       return jwt.sign({ userId: user.id }, this.secret);             ││
│ │+ 23       return jwt.sign(                                               ││
│ │+ 24         { userId: user.id, email: user.email },                      ││
│ │+ 25         this.secret,                                                 ││
│ │+ 26         { expiresIn: '1h' }                                          ││
│ │+ 27       );                                                             ││
│ │  28     }                                                                ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  3 changes  │  [✓ Accept All]  [✗ Discard All]  [View Full Diff]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### How It Works

```typescript
// In Forge extension
interface AgentChange {
  file: string;
  agent: string;
  session: string;
  hunks: ChangeHunk[];
  timestamp: Date;
}

interface ChangeHunk {
  startLine: number;
  endLine: number;
  original: string[];
  modified: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

// When Claude Code CLI makes changes via forge command
forge.onAgentFileChange(async (change: AgentChange) => {
  // Store pending changes
  await db.insert('forge_pending_changes', {
    file_path: change.file,
    agent_id: change.agent,
    session_id: change.session,
    hunks: JSON.stringify(change.hunks),
    status: 'pending'
  });

  // Apply decorations to editor
  const editor = vscode.window.visibleTextEditors.find(
    e => e.document.uri.fsPath === change.file
  );

  if (editor) {
    applyAgentChangeDecorations(editor, change.hunks);
  }

  // Show in Agent Changes view
  agentChangesProvider.refresh();
});
```

### The Agent Changes View

A dedicated panel in the explorer showing all pending agent changes:

```
┌─────────────────────────────────────────────┐
│ AGENT CHANGES                    [⟳] [✓ All]│
├─────────────────────────────────────────────┤
│                                             │
│ ▾ forge-backend-worker (Session S305)       │
│   │                                         │
│   ├─ src/services/auth/JWTService.ts        │
│   │    3 hunks · +15 -4 lines               │
│   │    [✓ Accept] [✗ Discard] [👁 View]     │
│   │                                         │
│   ├─ src/services/auth/RefreshToken.ts      │
│   │    1 hunk · +28 -0 lines (new file)     │
│   │    [✓ Accept] [✗ Discard] [👁 View]     │
│   │                                         │
│   └─ tests/auth/jwt.test.ts                 │
│        2 hunks · +45 -12 lines              │
│        [✓ Accept] [✗ Discard] [👁 View]     │
│                                             │
│ ▸ forge-frontend-dev (Session S305)         │
│     2 files · 4 hunks pending               │
│                                             │
├─────────────────────────────────────────────┤
│ Total: 5 files · 10 hunks · +88 -16 lines   │
│                                             │
│ [✓ Accept All] [✗ Discard All] [⎌ Undo]     │
└─────────────────────────────────────────────┘
```

### Inline Actions

When you open a file with pending agent changes:

1. **Gutter decorations** mark changed lines with agent icon
2. **Inline diff** shows original vs modified (toggleable)
3. **Hover actions** on each hunk: Keep, Discard, Edit
4. **CodeLens** above each hunk showing agent name and change summary

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
          title: `🤖 ${change.agent}: ${hunk.modified.length - hunk.original.length > 0 ? '+' : ''}${hunk.modified.length - hunk.original.length} lines`,
          command: 'forge.showHunkActions',
          arguments: [change, hunk]
        }
      ))
    );
  }
}
```

### Decision Recording

Every accept/reject decision feeds back into the system:

```typescript
// When user accepts or rejects a change
async function recordChangeDecision(
  change: AgentChange,
  hunk: ChangeHunk,
  decision: 'accepted' | 'rejected'
) {
  // Update pending change status
  hunk.status = decision;

  if (decision === 'rejected') {
    // Revert the change in file
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

### The Developer Experience

When you run `/forge-impact "Add JWT authentication"`:

1. **Assessment runs** → Files identified
2. **Implementation begins** → Changes made by agents
3. **Changes appear in Agent Changes view** → Grouped by agent
4. **Files show inline diffs** → Cursor-style decorations
5. **You review per-hunk** → Keep what's good, discard what's not
6. **Decisions recorded** → Agents learn from your feedback
7. **Accepted changes persist** → Ready for commit

No surprises. No blind trust. Full control with minimal friction.

---

## The Unified Database

Claude-mem already has SQLite. Forge extends it.

### Migration Strategy

```sql
-- forge_artifacts: Every command, agent, skill is a node
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

-- forge_relations: Edges between artifacts
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

-- forge_executions: When artifacts run
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

-- forge_behaviors: Learned user patterns
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

-- forge_terminals: Raw terminal command history
CREATE TABLE forge_terminals (
  id INTEGER PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  project_id TEXT NOT NULL,

  command TEXT NOT NULL,
  working_dir TEXT,
  exit_code INTEGER,

  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- forge_planning: Research cache and planning state
CREATE TABLE forge_planning (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  planning_mode TEXT NOT NULL CHECK (planning_mode IN ('greenfield', 'brownfield', 'hybrid')),
  current_phase TEXT NOT NULL CHECK (current_phase IN (
    'research', 'concept', 'design', 'architecture', 'issues', 'execution'
  )),

  phase_data JSON,      -- Phase-specific state
  research_cache JSON,  -- Persists between planning cycles

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- forge_pending_changes: Agent changes awaiting review
CREATE TABLE forge_pending_changes (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  agent_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  file_path TEXT NOT NULL,

  hunks JSON NOT NULL,           -- Array of ChangeHunk objects
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'partial')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- forge_change_decisions: Record of keep/discard decisions for learning
CREATE TABLE forge_change_decisions (
  id INTEGER PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES forge_artifacts(id),
  file_path TEXT NOT NULL,
  hunk_hash TEXT NOT NULL,       -- Hash of the change for deduplication

  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_artifacts_project ON forge_artifacts(project_id);
CREATE INDEX idx_artifacts_type ON forge_artifacts(artifact_type);
CREATE INDEX idx_relations_source ON forge_relations(source_id);
CREATE INDEX idx_relations_target ON forge_relations(target_id);
CREATE INDEX idx_executions_artifact ON forge_executions(artifact_id);
CREATE INDEX idx_executions_session ON forge_executions(session_id);
CREATE INDEX idx_behaviors_project ON forge_behaviors(project_id);
CREATE INDEX idx_terminals_session ON forge_terminals(session_id);
CREATE INDEX idx_planning_project ON forge_planning(project_id);
CREATE INDEX idx_pending_changes_session ON forge_pending_changes(session_id);
CREATE INDEX idx_pending_changes_status ON forge_pending_changes(status);
CREATE INDEX idx_change_decisions_agent ON forge_change_decisions(agent_id);
```

### Integration with Existing Tables

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

---

## The API Layer

New endpoints on the existing worker service.

### Forge Endpoints

```typescript
// src/services/worker/http/routes/ForgeRoutes.ts

export function registerForgeRoutes(app: Express): void {

  // Artifacts CRUD
  app.get('/api/forge/artifacts', async (req, res) => {
    const { project_id, type } = req.query;
    const artifacts = await db.query(`
      SELECT a.*,
        (SELECT COUNT(*) FROM forge_executions WHERE artifact_id = a.id) as execution_count,
        (SELECT AVG(CASE WHEN status = 'success' THEN 100 ELSE 0 END)
         FROM forge_executions WHERE artifact_id = a.id) as success_rate
      FROM forge_artifacts a
      WHERE a.project_id = ?
        AND (? IS NULL OR a.artifact_type = ?)
    `, [project_id, type, type]);
    res.json(artifacts);
  });

  app.post('/api/forge/artifacts', async (req, res) => {
    const { project_id, artifact_type, name, content } = req.body;
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    const id = await db.insert('forge_artifacts', {
      id: `${artifact_type}/${name}`,
      project_id,
      artifact_type,
      name,
      content,
      frontmatter: parseFrontmatter(content),
      checksum
    });

    // Sync to filesystem
    await forge.syncToFile(id);

    res.json({ id, checksum });
  });

  // Relationships
  app.get('/api/forge/relations', async (req, res) => {
    const { artifact_id, direction } = req.query;
    const relations = await db.query(`
      SELECT r.*,
        s.name as source_name, s.artifact_type as source_type,
        t.name as target_name, t.artifact_type as target_type
      FROM forge_relations r
      JOIN forge_artifacts s ON r.source_id = s.id
      JOIN forge_artifacts t ON r.target_id = t.id
      WHERE ? IS NULL
        OR (? = 'outgoing' AND r.source_id = ?)
        OR (? = 'incoming' AND r.target_id = ?)
    `, [artifact_id, direction, artifact_id, direction, artifact_id]);
    res.json(relations);
  });

  // Behaviors
  app.get('/api/forge/behaviors', async (req, res) => {
    const { project_id, min_confidence } = req.query;
    const behaviors = await db.query(`
      SELECT * FROM forge_behaviors
      WHERE project_id = ?
        AND confidence >= ?
      ORDER BY confidence DESC
    `, [project_id, min_confidence || 0.5]);
    res.json(behaviors);
  });

  // Executions
  app.get('/api/forge/executions', async (req, res) => {
    const { artifact_id, session_id, limit } = req.query;
    const executions = await db.query(`
      SELECT e.*, a.name as artifact_name, a.artifact_type
      FROM forge_executions e
      JOIN forge_artifacts a ON e.artifact_id = a.id
      WHERE (? IS NULL OR e.artifact_id = ?)
        AND (? IS NULL OR e.session_id = ?)
      ORDER BY e.started_at DESC
      LIMIT ?
    `, [artifact_id, artifact_id, session_id, session_id, limit || 50]);
    res.json(executions);
  });

  // Real-time sync WebSocket
  app.ws('/api/forge/sync', (ws, req) => {
    const projectId = req.query.project_id;

    // Subscribe to file changes
    const unsubscribe = forge.onFileChange(projectId, (change) => {
      ws.send(JSON.stringify({
        type: 'file_change',
        artifact_id: change.artifactId,
        checksum: change.newChecksum
      }));
    });

    // Subscribe to execution updates
    const unsubExec = forge.onExecution(projectId, (exec) => {
      ws.send(JSON.stringify({
        type: 'execution',
        ...exec
      }));
    });

    ws.on('close', () => {
      unsubscribe();
      unsubExec();
    });
  });
}
```

---

## VS Code Extension Structure

```
forge-vscode/
├── src/
│   ├── extension.ts              # Activation, commands, providers
│   ├── observers/
│   │   ├── TerminalObserver.ts   # Captures terminal commands
│   │   ├── SCMObserver.ts        # Tracks git operations
│   │   └── FileObserver.ts       # Watches .claude/ directory
│   ├── providers/
│   │   ├── ArtifactTreeProvider.ts    # TreeView for artifacts
│   │   ├── AgentChangesProvider.ts    # TreeView for pending changes
│   │   ├── AgentChangeCodeLens.ts     # Inline Keep/Discard actions
│   │   ├── AgentChangeDecorations.ts  # Diff highlighting in editor
│   │   ├── HoverProvider.ts           # Hover info for @ refs
│   │   ├── CompletionProvider.ts      # @ autocomplete
│   │   ├── DefinitionProvider.ts      # Go to definition
│   │   └── DiagnosticProvider.ts      # Invalid reference warnings
│   ├── webview/
│   │   ├── ForgePanel.ts         # Webview panel management
│   │   └── react/                # React app for webview
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── ReactFlowCanvas.tsx
│   │       │   ├── MonacoEditor.tsx
│   │       │   ├── ExecutionHistory.tsx
│   │       │   └── BehaviorPanel.tsx
│   │       └── hooks/
│   │           ├── useArtifacts.ts
│   │           ├── useRelations.ts
│   │           └── useBehaviors.ts
│   ├── language-server/
│   │   ├── server.ts             # LSP server entry
│   │   ├── completions.ts        # @ completions
│   │   └── diagnostics.ts        # Reference validation
│   └── api/
│       └── ForgeClient.ts        # HTTP + WebSocket client
├── package.json                  # Extension manifest
└── tsconfig.json
```

### Extension Manifest

```json
{
  "name": "forge",
  "displayName": "Forge: Living Orchestration",
  "description": "Visual orchestration editor with behavior learning",
  "version": "0.1.0",
  "publisher": "claude-mem",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other", "Visualization"],
  "activationEvents": [
    "workspaceContains:.claude",
    "onLanguage:markdown"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "forge.openEditor",
        "title": "Forge: Open Visual Editor"
      },
      {
        "command": "forge.runCommand",
        "title": "Forge: Run Command"
      },
      {
        "command": "forge.showBehaviors",
        "title": "Forge: Show Learned Behaviors"
      },
      {
        "command": "forge.acceptChange",
        "title": "Forge: Accept This Change"
      },
      {
        "command": "forge.rejectChange",
        "title": "Forge: Discard This Change"
      },
      {
        "command": "forge.acceptAllChanges",
        "title": "Forge: Accept All Agent Changes"
      },
      {
        "command": "forge.rejectAllChanges",
        "title": "Forge: Discard All Agent Changes"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "forgeArtifacts",
          "name": "Forge Artifacts",
          "when": "workspaceFolderCount > 0"
        },
        {
          "id": "forgeAgentChanges",
          "name": "Agent Changes",
          "when": "forge.hasPendingChanges"
        }
      ]
    },
    "languages": [
      {
        "id": "forge-markdown",
        "aliases": ["Forge Markdown"],
        "extensions": [".md"],
        "configuration": "./language-configuration.json"
      }
    ],
    "configuration": {
      "title": "Forge",
      "properties": {
        "forge.apiUrl": {
          "type": "string",
          "default": "http://localhost:37777",
          "description": "Claude-mem worker API URL"
        },
        "forge.autoLearnBehaviors": {
          "type": "boolean",
          "default": true,
          "description": "Automatically learn behaviors from terminal usage"
        },
        "forge.behaviorMinConfidence": {
          "type": "number",
          "default": 0.7,
          "minimum": 0,
          "maximum": 1,
          "description": "Minimum confidence for behavior application"
        }
      }
    }
  }
}
```

---

## The Webview Application

The heart of the visual experience.

### Main App Structure

```tsx
// src/webview/react/App.tsx
import { ReactFlowProvider } from 'reactflow';
import { ForgeCanvas } from './components/ForgeCanvas';
import { ArtifactEditor } from './components/ArtifactEditor';
import { ExecutionHistory } from './components/ExecutionHistory';
import { BehaviorPanel } from './components/BehaviorPanel';
import { useArtifacts } from './hooks/useArtifacts';
import { useWebSocket } from './hooks/useWebSocket';

export function App() {
  const { artifacts, relations, loading } = useArtifacts();
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [view, setView] = useState<'graph' | 'editor'>('graph');

  // Real-time sync
  useWebSocket({
    onFileChange: (change) => {
      // Refresh artifact if changed externally
      artifacts.refetch(change.artifact_id);
    },
    onExecution: (exec) => {
      // Update execution history
      executions.add(exec);
    }
  });

  return (
    <div className="forge-app">
      <header className="forge-toolbar">
        <button onClick={() => setView('graph')}>Graph View</button>
        <button onClick={() => setView('editor')}>Editor View</button>
        <div className="spacer" />
        <BehaviorIndicator />
      </header>

      <main className="forge-main">
        {view === 'graph' ? (
          <ReactFlowProvider>
            <ForgeCanvas
              artifacts={artifacts}
              relations={relations}
              selectedId={selectedArtifact}
              onSelect={setSelectedArtifact}
              onDoubleClick={(id) => {
                setSelectedArtifact(id);
                setView('editor');
              }}
            />
          </ReactFlowProvider>
        ) : (
          <ArtifactEditor
            artifactId={selectedArtifact}
            onNavigate={(id) => {
              setSelectedArtifact(id);
            }}
          />
        )}
      </main>

      <footer className="forge-footer">
        <ExecutionHistory artifactId={selectedArtifact} />
      </footer>
    </div>
  );
}
```

### ForgeCanvas Component

```tsx
// src/webview/react/components/ForgeCanvas.tsx
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import { CommandNode } from './nodes/CommandNode';
import { AgentNode } from './nodes/AgentNode';
import { SkillNode } from './nodes/SkillNode';
import { ForgeEdge } from './edges/ForgeEdge';

const nodeTypes = {
  command: CommandNode,
  agent: AgentNode,
  skill: SkillNode,
  template: TemplateNode,
  rule: RuleNode,
  instruction: InstructionNode
};

const edgeTypes = {
  forge: ForgeEdge
};

export function ForgeCanvas({ artifacts, relations, selectedId, onSelect, onDoubleClick }) {
  // Convert artifacts to nodes
  const initialNodes = useMemo(() =>
    artifacts.map(a => ({
      id: a.id,
      type: a.artifact_type,
      position: a.position || calculatePosition(a, artifacts),
      data: {
        name: a.name,
        description: a.description,
        executions: a.execution_count,
        successRate: a.success_rate,
        availableSkills: a.frontmatter?.available_skills || []
      },
      selected: a.id === selectedId
    }))
  , [artifacts, selectedId]);

  // Convert relations to edges
  const initialEdges = useMemo(() =>
    relations.map(r => ({
      id: `${r.source_id}-${r.target_id}`,
      source: r.source_id,
      target: r.target_id,
      type: 'forge',
      data: {
        relationType: r.relation_type,
        executionCount: r.execution_count || 0,
        successRate: r.success_rate || 100,
        confidence: r.confidence
      },
      markerEnd: { type: MarkerType.ArrowClosed }
    }))
  , [relations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event, node) => {
    onSelect(node.id);
  }, [onSelect]);

  const onNodeDoubleClick = useCallback((event, node) => {
    onDoubleClick(node.id);
  }, [onDoubleClick]);

  // Drag from artifact tree to canvas
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const artifactId = event.dataTransfer.getData('application/forge-artifact');

    if (artifactId && !nodes.find(n => n.id === artifactId)) {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const artifact = artifacts.find(a => a.id === artifactId);
      if (artifact) {
        setNodes(nds => [...nds, {
          id: artifactId,
          type: artifact.artifact_type,
          position,
          data: { /* ... */ }
        }]);
      }
    }
  }, [nodes, artifacts, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case 'command': return '#3b82f6';
            case 'agent': return '#10b981';
            case 'skill': return '#f59e0b';
            case 'template': return '#8b5cf6';
            default: return '#6b7280';
          }
        }}
      />
    </ReactFlow>
  );
}
```

---

## Reusing Claude-Mem Components

The existing viewer has components we can leverage.

### Shared Design System

```typescript
// Extract from src/ui/viewer to shared package
// src/shared/design-system/

export { colors } from './colors';        // Theme colors
export { spacing } from './spacing';       // Consistent spacing
export { typography } from './typography'; // Font scales
export { shadows } from './shadows';       // Elevation

// Components that work in both web and VS Code webview
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Input } from './components/Input';
export { Select } from './components/Select';
export { Table } from './components/Table';
export { Badge } from './components/Badge';
export { Tooltip } from './components/Tooltip';
```

### API Hooks

```typescript
// Both viewer and VS Code webview use same API patterns
// src/shared/api/

export function useForgeArtifacts(projectId: string) {
  return useQuery({
    queryKey: ['forge', 'artifacts', projectId],
    queryFn: () => fetch(`${API_URL}/api/forge/artifacts?project_id=${projectId}`)
      .then(r => r.json())
  });
}

export function useForgeRelations(artifactId?: string) {
  return useQuery({
    queryKey: ['forge', 'relations', artifactId],
    queryFn: () => fetch(`${API_URL}/api/forge/relations?artifact_id=${artifactId}`)
      .then(r => r.json()),
    enabled: !!artifactId
  });
}

export function useForgeBehaviors(projectId: string) {
  return useQuery({
    queryKey: ['forge', 'behaviors', projectId],
    queryFn: () => fetch(`${API_URL}/api/forge/behaviors?project_id=${projectId}`)
      .then(r => r.json())
  });
}
```

---

## The Behavior Learning Pipeline

End-to-end flow from terminal to intelligent action.

```
USER TYPES IN TERMINAL
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ Terminal Observer (VS Code Extension)                          │
│                                                                │
│ Captures: "npm run dev"                                        │
│ Context: Working dir, timestamp, exit code                     │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ Forge API: POST /api/forge/terminals                           │
│                                                                │
│ {                                                              │
│   "session_id": "S305",                                        │
│   "project_id": "claude-mem",                                  │
│   "command": "npm run dev",                                    │
│   "working_dir": "/Users/miles/claude-mem",                    │
│   "exit_code": 0                                               │
│ }                                                              │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ Behavior Learning Service                                       │
│                                                                │
│ Pattern extraction:                                            │
│   • Base command: npm                                          │
│   • Subcommand: run                                            │
│   • Script: dev                                                │
│   • Category: script_usage                                     │
│                                                                │
│ Behavior update:                                               │
│   • Check existing: script_usage.npm_run_dev                   │
│   • If exists: evidence_count++, update confidence             │
│   • If new: create with confidence 0.5                         │
│                                                                │
│ Confidence formula:                                            │
│   confidence = min(0.95, 0.5 + (evidence_count * 0.05))       │
│                                                                │
│ After 9 occurrences: confidence = 0.95                         │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ forge_behaviors table                                           │
│                                                                │
│ | pattern_key        | pattern_value | count | confidence |    │
│ |--------------------|---------------|-------|------------|    │
│ | script.npm_run_dev | npm run dev   | 143   | 0.95       |    │
│ | script.npm_test    | npm run test  | 98    | 0.95       |    │
│ | commit.style       | conventional  | 87    | 0.95       |    │
│ | build.mode         | development   | 156   | 0.95       |    │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ LATER: User runs /forge-impact "Change auth to JWT"            │
│                                                                │
│ Behavior context injection (no questions asked):               │
│                                                                │
│ "Based on observed behaviors:                                  │
│  • Build mode: development (skip production build)             │
│  • After changes: run npm run dev                              │
│  • Verification: run npm run test                              │
│  • UI changes: trigger forge-verify-ui                         │
│                                                                │
│  Proceeding with these assumptions..."                         │
│                                                                │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ Assessment → Implementation → Verification                      │
│                                                                │
│ Auto-runs learned scripts:                                     │
│   ✓ npm run dev (started)                                      │
│   ✓ npm run test (98 tests passed)                             │
│   ✓ forge-verify-ui (UI verified)                              │
│                                                                │
│ Feedback prompt:                                               │
│   "Applied behaviors: dev mode, npm scripts, UI verify"        │
│   "Were these correct? [Yes] [Adjust]"                         │
│                                                                │
│ If [Yes]: confidence maintained                                │
│ If [Adjust]: update behavior, reduce confidence                │
└───────────────────────────────────────────────────────────────┘
```

---

## Living CLAUDE.md Generation

The project CLAUDE.md becomes auto-generated.

### Generation Process

```typescript
// src/services/forge/ClaudeMdGenerator.ts

export async function generateProjectClaudeMd(projectId: string): Promise<string> {
  const behaviors = await db.query(`
    SELECT * FROM forge_behaviors
    WHERE project_id = ? AND confidence > 0.7
    ORDER BY behavior_type, confidence DESC
  `, [projectId]);

  const scripts = await db.query(`
    SELECT command, COUNT(*) as count
    FROM forge_terminals
    WHERE project_id = ?
    GROUP BY command
    ORDER BY count DESC
    LIMIT 10
  `, [projectId]);

  const agents = await db.query(`
    SELECT
      a.name,
      COUNT(e.id) as runs,
      AVG(CASE WHEN e.status = 'success' THEN 100 ELSE 0 END) as success_rate,
      AVG(e.tokens_used) as avg_tokens
    FROM forge_artifacts a
    LEFT JOIN forge_executions e ON e.artifact_id = a.id
    WHERE a.project_id = ? AND a.artifact_type = 'agent'
    GROUP BY a.id
  `, [projectId]);

  const research = await db.query(`
    SELECT research_cache
    FROM forge_planning
    WHERE project_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `, [projectId]);

  return `
# Project Memory (Auto-Generated by Forge)

> Last updated: ${new Date().toISOString()}

## Learned Behaviors

| Behavior | Value | Confidence |
|----------|-------|------------|
${behaviors.map(b => `| ${b.behavior_type}.${b.pattern_key} | ${b.pattern_value} | ${(b.confidence * 100).toFixed(0)}% |`).join('\n')}

## Frequently Used Scripts

${scripts.map((s, i) => `${i + 1}. \`${s.command}\` (${s.count} invocations)`).join('\n')}

## Agent Performance

| Agent | Runs | Success | Avg Tokens |
|-------|------|---------|------------|
${agents.map(a => `| ${a.name} | ${a.runs} | ${a.success_rate?.toFixed(0) || 0}% | ${a.avg_tokens?.toFixed(0) || 0} |`).join('\n')}

${research?.research_cache ? `
## Research Cache

${formatResearchCache(research.research_cache)}
` : ''}
`.trim();
}
```

### Auto-Update Hook

```typescript
// In VS Code extension
vscode.workspace.onDidSaveTextDocument(async (doc) => {
  if (doc.uri.path.includes('.claude/')) {
    // Artifact changed, might affect CLAUDE.md
    await regenerateClaudeMd();
  }
});

// After each session
forge.onSessionEnd(async (session) => {
  if (session.behaviors_changed || session.executions.length > 0) {
    await regenerateClaudeMd();
  }
});
```

---

## Implementation Roadmap

### Phase 0: Foundation (Week 0)

**Goal:** Establish the infrastructure before any UI work.

1. Database migrations
   - Add forge_* tables to claude-mem.db
   - Create indexes
   - Test migrations

2. API endpoints
   - `/api/forge/artifacts` CRUD
   - `/api/forge/relations` read
   - `/api/forge/behaviors` read
   - `/api/forge/executions` read
   - WebSocket `/api/forge/sync`

3. Bidirectional sync
   - File → DB sync on file change
   - DB → File sync on API write
   - Checksum-based conflict detection

### Phase 1: VS Code Extension Shell (Week 1)

**Goal:** Get the extension framework running with change review.

1. Extension scaffolding
   - `yo code` generator
   - TypeScript configuration
   - Build pipeline

2. Terminal Observer
   - Subscribe to terminal events
   - Parse commands
   - Record to `forge_terminals`

3. Artifact Tree Provider
   - TreeView showing commands, agents, skills
   - Drag support for later

4. Agent Changes Provider
   - TreeView showing pending agent changes
   - Grouped by agent and file
   - Accept/Discard actions per hunk

5. Agent Change Decorations
   - Inline diff highlighting
   - CodeLens with Keep/Discard
   - Gutter icons for agent changes

6. Basic commands
   - `forge.openEditor`
   - `forge.refresh`
   - `forge.acceptChange` / `forge.rejectChange`

### Phase 2: Language Server (Week 2)

**Goal:** Edit-time intelligence for orchestration files.

1. LSP server
   - Initialize with document sync
   - Connect to Forge API

2. Completion provider
   - @ autocomplete
   - Artifact suggestions with stats

3. Hover provider
   - Show artifact details on hover
   - Execution stats

4. Diagnostics
   - Invalid reference detection
   - Yellow squiggles for low-confidence refs

5. Definition provider
   - Go to definition for @ references

### Phase 3: ReactFlow Webview (Week 3)

**Goal:** Visual graph editing.

1. Webview panel
   - React app in webview
   - Communication with extension

2. ReactFlow integration
   - Custom node types
   - Custom edge types
   - Minimap

3. Node interactions
   - Click to select
   - Double-click to edit
   - Drag to create relationships

4. Layout algorithms
   - Auto-layout for imported graphs
   - Manual position persistence

### Phase 4: Behavior Learning (Week 4)

**Goal:** The intelligence layer.

1. Terminal pattern extraction
   - Command parsing
   - Pattern detection
   - Confidence calculation

2. SCM integration
   - Git operation tracking
   - File ownership inference

3. Behavior injection
   - Context generation from behaviors
   - Feedback collection
   - Confidence adjustment

4. CLAUDE.md generation
   - Template system
   - Auto-update triggers

### Phase 5: Full Integration (Week 5-6)

**Goal:** Everything working together.

1. Forge commands
   - Migrate forge-impact
   - Migrate forge-issue
   - Migrate forge-plan

2. Agent migration
   - forge-backend-* agents
   - forge-frontend-* agents
   - forge-assess agents

3. Skill creation
   - forge-analyze-error
   - forge-verify-ui
   - forge-restructure

4. Research caching
   - Persist greenfield research
   - Reuse in brownfield

5. Testing and polish
   - End-to-end tests
   - Performance optimization
   - Documentation

---

## Success Metrics

| Metric | Today | Phase 1 | Phase 3 | Phase 5 |
|--------|-------|---------|---------|---------|
| Questions asked by impact-change | 3-5 | 3-5 | 1-2 | 0 |
| Time to navigate command→agent→skill | 30s | 20s | 5s | 2s |
| Artifact validation | Runtime | Runtime | Edit-time | Edit-time |
| Behavior detection | None | Terminal | +SCM | +Feedback |
| Behavior consistency | 0% | 30% | 60% | 85%+ |
| Research reuse (brownfield) | 0% | 0% | 30% | 70%+ |
| Context load (orchestrator) | Unknown | Unknown | <300 tok | <200 tok |
| Agent skill triggering | Manual | Manual | Semi-auto | Auto |
| Change review granularity | All-or-nothing | Per-hunk | Per-line | Per-line |
| Agent change acceptance rate | Unknown | Tracked | 75%+ | 90%+ |

---

## The Vision Realized

Imagine this workflow:

**Morning:**
You open VS Code. Forge silently loads your project's behaviors. It knows you use `npm run dev`, prefer test-after, and always verify UI changes.

**You type `/forge-impact "Add JWT authentication"`**

Forge doesn't ask questions. It knows your patterns. It launches parallel assessment agents, each aware of your preferences. They identify 12 files to modify.

**You switch to the Forge panel.**

The graph shows your command connected to 3 agents, each connected to 2 skills. Edges are thick where usage is high. You double-click an agent to see its content—@ references glow with autocomplete awareness.

**Implementation begins.**

Each agent works according to your learned patterns. As changes are made, they appear in the **Agent Changes** panel—grouped by agent, showing exactly what's being modified.

**You review inline.**

The files light up with Cursor-style diff decorations. Green for additions, red strikethrough for deletions. Each hunk has **Keep** and **Discard** buttons. You accept the JWT token changes but reject the overly aggressive error handling—one click each.

**Tests run automatically.** The dev server restarts. UI verification triggers without prompting.

**You make a small edit in vim.**

Forge detects the external file change, syncs to the database, updates the graph. No conflicts—checksums match.

**Session ends.**

Your CLAUDE.md updates automatically. New behaviors recorded. Agent performance stats updated. Your accept/reject decisions feed back into agent confidence scores. Research cache preserved for the next brownfield change.

**Tomorrow:**
You start a new change. Forge already knows everything from yesterday. Zero questions. Zero friction. Just flow.

---

## Why This Matters

We're not building another tool. We're building the **future of development environments**.

Today's IDEs are passive. They wait for you to act. They forget between sessions. They don't learn.

Forge is **active**. It observes. It remembers. It adapts. It becomes an extension of how you work, not a tool you work with.

The technology exists:
- VS Code's extension APIs
- ReactFlow's visual programming
- Claude-mem's observation storage
- SQLite's reliable persistence

What's been missing is the **vision** to connect them.

That vision is Forge.

---

*"Technology alone is not enough. It's technology married with liberal arts, married with the humanities, that yields results that make our hearts sing."*

This isn't just an IDE extension.
This is orchestration that thinks.
This is development that flows.
This is **Forge**.
