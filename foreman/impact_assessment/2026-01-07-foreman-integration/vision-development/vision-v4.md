# Forge Vision v4: The Bridge

> "The computer is a bicycle for the mind. But what if the bicycle had two wheels that actually talked to each other?"

---

## The Real Workflow

Here's what actually happens:

You're deep in thought. Terminal open—iTerm2, Ghostty, Kitty, whatever feels right. You type `claude` and start a conversation. Claude reads your codebase, understands the problem, and starts making changes.

Meanwhile, VS Code sits beside the terminal. Files are open. The editor is waiting.

**The problem:** Claude writes to files. VS Code sees... nothing special. Just files that changed. No attribution. No review workflow. No Keep/Discard. The magic of Cursor's agent review experience? Gone.

**The solution:** Forge bridges them.

When Claude Code runs in your external terminal and edits `src/auth/jwt.ts`, the change doesn't just appear in VS Code as a modified file. It appears as an **agent change**—with inline diffs, gutter icons, CodeLens actions, and the full Cursor-style Keep/Discard experience.

The terminal is where you think.
VS Code is where you review.
Forge is the bridge that makes them one.

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              THE BRIDGE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         EXTERNAL TERMINAL                                │   │
│   │                                                                          │   │
│   │   iTerm2 / Ghostty / Kitty / WezTerm / Alacritty                        │   │
│   │                                                                          │   │
│   │   $ claude                                                               │   │
│   │   > "Add JWT refresh token support to the auth service"                 │   │
│   │                                                                          │   │
│   │   Claude Code executes:                                                  │   │
│   │     • Edit src/auth/jwt.ts (3 hunks)                                    │   │
│   │     • Edit src/api/middleware.ts (2 hunks)                              │   │
│   │     • Write src/auth/refresh.ts (new file)                              │   │
│   │                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │ claude-mem hooks capture every tool use automatically           │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                          │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                          │
│                                      │ PostToolUse hook fires                   │
│                                      │ Session + file + diff captured           │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      FORGE WORKER SERVICE (37777)                        │   │
│   │                                                                          │   │
│   │   ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐    │   │
│   │   │  Session Bridge   │  │  Change Tracker   │  │   WebSocket Hub  │    │   │
│   │   │                   │  │                   │  │                  │    │   │
│   │   │ • Active session  │  │ • File → Session  │  │ • VS Code sub    │    │   │
│   │   │ • Agent context   │  │ • Hunk parsing    │  │ • Real-time push │    │   │
│   │   │ • Terminal PID    │  │ • Before/after    │  │ • Change events  │    │   │
│   │   └───────────────────┘  └───────────────────┘  └──────────────────┘    │   │
│   │                                                                          │   │
│   │   POST /api/forge/changes ←── Hook sends changes                        │   │
│   │   WS   /api/forge/live   ───► VS Code receives                          │   │
│   │                                                                          │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                          │
│                                      │ WebSocket pushes change event            │
│                                      │ {file, session, agent, hunks}            │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                           VS CODE EXTENSION                              │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────────────────────────────────────┐ │   │
│   │   │                    AGENT CHANGE MANAGER                            │ │   │
│   │   │                                                                    │ │   │
│   │   │  Receives change event → Parses hunks → Creates decorations       │ │   │
│   │   │                                                                    │ │   │
│   │   └───────────────────────────────────────────────────────────────────┘ │   │
│   │                              │                                           │   │
│   │              ┌───────────────┼───────────────┐                          │   │
│   │              ▼               ▼               ▼                          │   │
│   │   ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐              │   │
│   │   │ Inline Diff     │ │ Gutter      │ │ CodeLens        │              │   │
│   │   │ Decorations     │ │ Icons       │ │ Actions         │              │   │
│   │   │                 │ │             │ │                 │              │   │
│   │   │ Green = added   │ │ 🤖 = agent  │ │ [Keep] [Discard]│              │   │
│   │   │ Red = removed   │ │ changed     │ │ above each hunk │              │   │
│   │   └─────────────────┘ └─────────────┘ └─────────────────┘              │   │
│   │                                                                          │   │
│   │   ┌───────────────────────────────────────────────────────────────────┐ │   │
│   │   │ src/auth/jwt.ts                                                    │ │   │
│   │   │                                                                    │ │   │
│   │   │   12 │ import { sign, verify } from 'jsonwebtoken';               │ │   │
│   │   │   13 │                                             ┌────────────┐ │ │   │
│   │   │ 🤖14 │-const SECRET = process.env.JWT_SECRET;      │Keep│Discard│ │ │   │
│   │   │ 🤖14 │+const SECRET = process.env.JWT_SECRET ??... └────────────┘ │ │   │
│   │   │ 🤖15 │+const REFRESH_SECRET = process.env.JWT_R...                │ │   │
│   │   │   16 │                                                            │ │   │
│   │   │                                                                    │ │   │
│   │   │      Session: S312 │ Agent: backend-worker │ 2m ago               │ │   │
│   │   └───────────────────────────────────────────────────────────────────┘ │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## The Session Bridge

The magic starts with knowing **which Claude session made which change**.

### How It Works

1. **Claude Code starts** in external terminal
2. **claude-mem's SessionStart hook** registers the session with Forge worker
3. **Every tool use** (Edit, Write) triggers PostToolUse hook
4. **Hook captures**: file path, before content, after content, session ID, agent context
5. **Worker processes** the change into hunks
6. **WebSocket broadcasts** to VS Code extension
7. **VS Code decorates** the file with Keep/Discard UI

### Session Registration

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
      terminal_pid: process.ppid,        // Parent process (terminal)
      terminal_type: detectTerminal(),    // iTerm2, Ghostty, etc.
      project_root: session.cwd,
      started_at: new Date().toISOString()
    })
  });
}

function detectTerminal(): string {
  // Detect terminal from environment
  if (process.env.ITERM_SESSION_ID) return 'iTerm2';
  if (process.env.GHOSTTY_RESOURCES_DIR) return 'Ghostty';
  if (process.env.KITTY_PID) return 'Kitty';
  if (process.env.WEZTERM_PANE) return 'WezTerm';
  if (process.env.ALACRITTY_SOCKET) return 'Alacritty';
  if (process.env.TERM_PROGRAM) return process.env.TERM_PROGRAM;
  return 'unknown';
}
```

### Change Capture

```typescript
// src/hooks/post-tool-use-hook.ts (enhanced for Forge)
export async function onPostToolUse(toolUse: ToolUse, result: ToolResult) {
  // Existing claude-mem observation recording
  await recordObservation(toolUse, result);

  // Forge enhancement: Capture file changes for bridge
  if (toolUse.tool === 'Edit' || toolUse.tool === 'Write') {
    const filePath = toolUse.params.file_path;
    const beforeContent = toolUse.tool === 'Edit'
      ? await getFileContentBefore(filePath)
      : null;
    const afterContent = await fs.readFile(filePath, 'utf-8');

    await fetch('http://localhost:37777/api/forge/changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: toolUse.session_id,
        file_path: filePath,
        tool: toolUse.tool,
        before_content: beforeContent,
        after_content: afterContent,
        agent: extractAgentFromContext(toolUse),
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

---

## The Change Tracker

The worker service transforms raw changes into reviewable hunks.

### Hunk Processing

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
    // Use fast model for quick summaries
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

### WebSocket Broadcasting

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
      const clientType = req.headers['x-client-type'] as string; // 'vscode' | 'browser'

      this.clients.set(clientId, ws);

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      // Send current pending changes on connect
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

  broadcastDecision(decision: ChangeDecision) {
    const message = JSON.stringify({
      type: 'change_decision',
      payload: decision
    });

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}
```

---

## The VS Code Extension

The extension brings external terminal changes into VS Code's editor experience.

### Extension Architecture

```typescript
// src/vscode-extension/extension.ts
import * as vscode from 'vscode';
import { ForgeWebSocketClient } from './ForgeWebSocketClient';
import { AgentChangeManager } from './AgentChangeManager';
import { AgentChangeDecorationProvider } from './decorations/AgentChangeDecorationProvider';
import { AgentChangeCodeLensProvider } from './codelens/AgentChangeCodeLensProvider';

export async function activate(context: vscode.ExtensionContext) {
  // Connect to Forge worker service
  const wsClient = new ForgeWebSocketClient('ws://localhost:37777/api/forge/live');

  // Manage agent changes
  const changeManager = new AgentChangeManager();

  // Register decoration provider for inline diffs
  const decorationProvider = new AgentChangeDecorationProvider(changeManager);
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  );

  // Register CodeLens provider for Keep/Discard actions
  const codeLensProvider = new AgentChangeCodeLensProvider(changeManager);
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  );

  // Listen for changes from external terminal
  wsClient.on('agent_change', (change: ProcessedChange) => {
    changeManager.addChange(change);

    // Show notification
    vscode.window.showInformationMessage(
      `Agent change: ${change.file_path} (${change.hunks.length} hunks)`,
      'Review'
    ).then(action => {
      if (action === 'Review') {
        vscode.workspace.openTextDocument(change.file_path)
          .then(doc => vscode.window.showTextDocument(doc));
      }
    });
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('forge.acceptHunk', (changeId, hunkIndex) => {
      changeManager.acceptHunk(changeId, hunkIndex);
    }),
    vscode.commands.registerCommand('forge.rejectHunk', (changeId, hunkIndex) => {
      changeManager.rejectHunk(changeId, hunkIndex);
    }),
    vscode.commands.registerCommand('forge.acceptAllInFile', (filePath) => {
      changeManager.acceptAllInFile(filePath);
    }),
    vscode.commands.registerCommand('forge.rejectAllInFile', (filePath) => {
      changeManager.rejectAllInFile(filePath);
    }),
    vscode.commands.registerCommand('forge.showPendingChanges', () => {
      PendingChangesPanel.show(context.extensionUri, changeManager);
    })
  );

  // Status bar indicator
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBar.command = 'forge.showPendingChanges';
  context.subscriptions.push(statusBar);

  changeManager.on('change', () => {
    const pending = changeManager.getPendingCount();
    if (pending > 0) {
      statusBar.text = `$(git-pull-request) Forge: ${pending} pending`;
      statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      statusBar.show();
    } else {
      statusBar.hide();
    }
  });

  await wsClient.connect();
}
```

### Inline Decorations

```typescript
// src/vscode-extension/decorations/AgentChangeDecorationProvider.ts
import * as vscode from 'vscode';

export class AgentChangeDecorationProvider {
  private addedDecoration: vscode.TextEditorDecorationType;
  private removedDecoration: vscode.TextEditorDecorationType;
  private agentGutterDecoration: vscode.TextEditorDecorationType;

  constructor(private changeManager: AgentChangeManager) {
    // Green background for additions
    this.addedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor('diffEditor.insertedTextBackground'),
      isWholeLine: true
    });

    // Red strikethrough for removals (shown as ghost text)
    this.removedDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor('diffEditor.removedTextBackground'),
      textDecoration: 'line-through',
      opacity: '0.6'
    });

    // Agent icon in gutter
    this.agentGutterDecoration = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.file(path.join(__dirname, 'assets', 'agent-icon.svg')),
      gutterIconSize: 'contain'
    });

    // Update decorations when editor changes
    vscode.window.onDidChangeActiveTextEditor(this.updateDecorations.bind(this));
    vscode.workspace.onDidChangeTextDocument(this.updateDecorations.bind(this));
    changeManager.on('change', this.updateDecorations.bind(this));
  }

  updateDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const filePath = editor.document.uri.fsPath;
    const changes = this.changeManager.getChangesForFile(filePath);

    if (changes.length === 0) {
      editor.setDecorations(this.addedDecoration, []);
      editor.setDecorations(this.removedDecoration, []);
      editor.setDecorations(this.agentGutterDecoration, []);
      return;
    }

    const addedRanges: vscode.DecorationOptions[] = [];
    const gutterRanges: vscode.DecorationOptions[] = [];

    for (const change of changes) {
      for (const hunk of change.hunks) {
        if (hunk.status !== 'pending') continue;

        // Highlight added lines
        for (let i = hunk.startLine; i <= hunk.endLine; i++) {
          const line = editor.document.lineAt(i - 1);
          addedRanges.push({
            range: line.range,
            hoverMessage: new vscode.MarkdownString(
              `**Agent:** ${change.agent}\n\n` +
              `**Session:** ${change.session_id}\n\n` +
              `**Summary:** ${hunk.summary}`
            )
          });
          gutterRanges.push({ range: line.range });
        }
      }
    }

    editor.setDecorations(this.addedDecoration, addedRanges);
    editor.setDecorations(this.agentGutterDecoration, gutterRanges);
  }
}
```

### CodeLens for Keep/Discard

```typescript
// src/vscode-extension/codelens/AgentChangeCodeLensProvider.ts
import * as vscode from 'vscode';

export class AgentChangeCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  constructor(private changeManager: AgentChangeManager) {
    changeManager.on('change', () => this._onDidChangeCodeLenses.fire());
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const changes = this.changeManager.getChangesForFile(document.uri.fsPath);
    const lenses: vscode.CodeLens[] = [];

    for (const change of changes) {
      for (let i = 0; i < change.hunks.length; i++) {
        const hunk = change.hunks[i];
        if (hunk.status !== 'pending') continue;

        const line = hunk.startLine - 1;
        const range = new vscode.Range(line, 0, line, 0);

        // Summary lens
        lenses.push(new vscode.CodeLens(range, {
          title: `🤖 ${change.agent}: ${hunk.summary}`,
          command: ''
        }));

        // Keep button
        lenses.push(new vscode.CodeLens(range, {
          title: '✓ Keep',
          command: 'forge.acceptHunk',
          arguments: [change.id, i]
        }));

        // Discard button
        lenses.push(new vscode.CodeLens(range, {
          title: '✗ Discard',
          command: 'forge.rejectHunk',
          arguments: [change.id, i]
        }));
      }
    }

    return lenses;
  }
}
```

---

## The Change Manager

Handles applying and reverting changes when user makes decisions.

```typescript
// src/vscode-extension/AgentChangeManager.ts
import * as vscode from 'vscode';
import { EventEmitter } from 'events';

interface PendingChange {
  id: string;
  file_path: string;
  session_id: string;
  agent: string;
  hunks: ChangeHunk[];
  timestamp: Date;
}

export class AgentChangeManager extends EventEmitter {
  private changes: Map<string, PendingChange> = new Map();
  private wsClient: ForgeWebSocketClient;

  async acceptHunk(changeId: string, hunkIndex: number) {
    const change = this.changes.get(changeId);
    if (!change) return;

    const hunk = change.hunks[hunkIndex];
    hunk.status = 'accepted';

    // File already has the change (Claude wrote it)
    // Just mark as accepted and record decision
    await this.recordDecision(changeId, hunkIndex, 'accepted');

    this.emit('change');
    this.cleanupIfComplete(changeId);
  }

  async rejectHunk(changeId: string, hunkIndex: number) {
    const change = this.changes.get(changeId);
    if (!change) return;

    const hunk = change.hunks[hunkIndex];

    // Revert the change in the file
    await this.revertHunk(change, hunk);

    hunk.status = 'rejected';
    await this.recordDecision(changeId, hunkIndex, 'rejected');

    this.emit('change');
    this.cleanupIfComplete(changeId);
  }

  private async revertHunk(change: PendingChange, hunk: ChangeHunk) {
    const doc = await vscode.workspace.openTextDocument(change.file_path);
    const edit = new vscode.WorkspaceEdit();

    // Calculate the range to replace
    const startLine = hunk.startLine - 1;
    const endLine = hunk.endLine;
    const range = new vscode.Range(startLine, 0, endLine, 0);

    // Replace with original content
    edit.replace(doc.uri, range, hunk.original.join('\n') + '\n');

    await vscode.workspace.applyEdit(edit);
  }

  async acceptAllInFile(filePath: string) {
    const changes = this.getChangesForFile(filePath);
    for (const change of changes) {
      for (let i = 0; i < change.hunks.length; i++) {
        if (change.hunks[i].status === 'pending') {
          await this.acceptHunk(change.id, i);
        }
      }
    }
  }

  async rejectAllInFile(filePath: string) {
    const changes = this.getChangesForFile(filePath);
    // Process in reverse order to maintain line numbers
    for (const change of changes) {
      for (let i = change.hunks.length - 1; i >= 0; i--) {
        if (change.hunks[i].status === 'pending') {
          await this.rejectHunk(change.id, i);
        }
      }
    }
  }

  private async recordDecision(changeId: string, hunkIndex: number, decision: 'accepted' | 'rejected') {
    // Send to worker for memory integration
    await fetch('http://localhost:37777/api/forge/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        change_id: changeId,
        hunk_index: hunkIndex,
        decision,
        timestamp: new Date().toISOString()
      })
    });

    // Also broadcast to other clients (e.g., browser UI)
    this.wsClient?.send(JSON.stringify({
      type: 'change_decision',
      payload: { changeId, hunkIndex, decision }
    }));
  }

  getChangesForFile(filePath: string): PendingChange[] {
    return Array.from(this.changes.values())
      .filter(c => c.file_path === filePath);
  }

  getPendingCount(): number {
    let count = 0;
    this.changes.forEach(change => {
      count += change.hunks.filter(h => h.status === 'pending').length;
    });
    return count;
  }

  private cleanupIfComplete(changeId: string) {
    const change = this.changes.get(changeId);
    if (!change) return;

    const allResolved = change.hunks.every(h => h.status !== 'pending');
    if (allResolved) {
      this.changes.delete(changeId);
    }
  }
}
```

---

## The File Explorer Integration

Changes from external terminal appear in VS Code's file explorer too.

### SCM Provider for Agent Changes

```typescript
// src/vscode-extension/scm/AgentChangesSourceControl.ts
import * as vscode from 'vscode';

export class AgentChangesSourceControl {
  private scm: vscode.SourceControl;
  private pendingGroup: vscode.SourceControlResourceGroup;
  private acceptedGroup: vscode.SourceControlResourceGroup;

  constructor(private changeManager: AgentChangeManager) {
    this.scm = vscode.scm.createSourceControl('forge-changes', 'Agent Changes');
    this.scm.inputBox.visible = false;

    this.pendingGroup = this.scm.createResourceGroup('pending', 'Pending Review');
    this.acceptedGroup = this.scm.createResourceGroup('accepted', 'Accepted');

    changeManager.on('change', () => this.refresh());
  }

  refresh() {
    const pendingFiles = new Map<string, ProcessedChange[]>();
    const acceptedFiles = new Map<string, ProcessedChange[]>();

    for (const change of this.changeManager.getAllChanges()) {
      const hasPending = change.hunks.some(h => h.status === 'pending');
      const hasAccepted = change.hunks.some(h => h.status === 'accepted');

      if (hasPending) {
        if (!pendingFiles.has(change.file_path)) {
          pendingFiles.set(change.file_path, []);
        }
        pendingFiles.get(change.file_path)!.push(change);
      }

      if (hasAccepted) {
        if (!acceptedFiles.has(change.file_path)) {
          acceptedFiles.set(change.file_path, []);
        }
        acceptedFiles.get(change.file_path)!.push(change);
      }
    }

    this.pendingGroup.resourceStates = Array.from(pendingFiles.entries()).map(([file, changes]) => ({
      resourceUri: vscode.Uri.file(file),
      decorations: {
        strikeThrough: false,
        faded: false,
        tooltip: `${changes.reduce((sum, c) => sum + c.hunks.filter(h => h.status === 'pending').length, 0)} pending hunks`,
        iconPath: new vscode.ThemeIcon('robot')
      },
      command: {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(file)]
      }
    }));

    this.acceptedGroup.resourceStates = Array.from(acceptedFiles.entries()).map(([file, changes]) => ({
      resourceUri: vscode.Uri.file(file),
      decorations: {
        strikeThrough: false,
        faded: true,
        tooltip: `${changes.reduce((sum, c) => sum + c.hunks.filter(h => h.status === 'accepted').length, 0)} accepted hunks`,
        iconPath: new vscode.ThemeIcon('check')
      }
    }));
  }
}
```

### File Badge Decorations

```typescript
// src/vscode-extension/decorations/FileBadgeProvider.ts
import * as vscode from 'vscode';

export class FileBadgeProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  constructor(private changeManager: AgentChangeManager) {
    changeManager.on('change', () => {
      const uris = Array.from(new Set(
        changeManager.getAllChanges().map(c => vscode.Uri.file(c.file_path))
      ));
      this._onDidChangeFileDecorations.fire(uris);
    });
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const changes = this.changeManager.getChangesForFile(uri.fsPath);
    if (changes.length === 0) return undefined;

    const pendingCount = changes.reduce(
      (sum, c) => sum + c.hunks.filter(h => h.status === 'pending').length,
      0
    );

    if (pendingCount > 0) {
      return {
        badge: `${pendingCount}`,
        color: new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'),
        tooltip: `${pendingCount} agent changes pending review`
      };
    }

    return undefined;
  }
}
```

---

## Real-Time Synchronization

As Claude types in the external terminal, changes appear in VS Code in real-time.

### The Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REAL-TIME SYNC FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   T+0s    Claude Code (external terminal)                                       │
│           > Edit src/auth/jwt.ts                                                │
│                                                                                  │
│   T+0.1s  claude-mem PostToolUse hook fires                                     │
│           └── Captures: {file, before, after, session, agent}                   │
│                                                                                  │
│   T+0.2s  Hook POSTs to Forge worker                                            │
│           └── POST http://localhost:37777/api/forge/changes                     │
│                                                                                  │
│   T+0.3s  Worker processes change                                               │
│           └── Generates hunks, AI summary                                       │
│                                                                                  │
│   T+0.5s  WebSocket broadcasts to VS Code                                       │
│           └── WS message: {type: 'agent_change', payload: {...}}                │
│                                                                                  │
│   T+0.6s  VS Code extension receives                                            │
│           └── Updates AgentChangeManager                                        │
│                                                                                  │
│   T+0.7s  Decorations update                                                    │
│           └── File shows inline diffs with Keep/Discard                         │
│                                                                                  │
│   T+0.8s  Status bar updates                                                    │
│           └── "Forge: 3 pending"                                                │
│                                                                                  │
│   T+0.9s  Notification appears (optional)                                       │
│           └── "Agent change: src/auth/jwt.ts (3 hunks)"                         │
│                                                                                  │
│   TOTAL: < 1 second from edit to visual feedback                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Latency Optimization

```typescript
// src/services/forge/ChangeTracker.ts
export class ChangeTracker {
  private pendingBatch: RawChange[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  async queueChange(change: RawChange) {
    this.pendingBatch.push(change);

    // Debounce to batch rapid changes (e.g., multi-file agent edit)
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, 100); // 100ms debounce
  }

  private async processBatch() {
    const batch = this.pendingBatch;
    this.pendingBatch = [];

    // Process all changes in parallel
    const processed = await Promise.all(
      batch.map(change => this.processChange(change))
    );

    // Broadcast all at once
    for (const change of processed) {
      this.wsHub.broadcastChange(change);
    }
  }
}
```

---

## The Browser Companion

The browser UI at localhost:37777 complements VS Code—it doesn't replace it.

### Use Cases for Browser UI

1. **Overview Dashboard** - See all pending changes across all files
2. **Batch Operations** - Accept/reject multiple files at once
3. **History** - View past agent changes and decisions
4. **Memory Search** - Search observations while reviewing
5. **Pipeline Tracker** - Monitor chain workflow progress (from v3)

### Browser-VS Code Sync

Both interfaces share state through the worker service:

```typescript
// Both VS Code and Browser connect to same WebSocket
// Decisions made in either are broadcast to both

// Browser accepts a hunk
browserClient.send(JSON.stringify({
  type: 'accept_hunk',
  payload: { changeId: 'change-123', hunkIndex: 0 }
}));

// Worker processes and broadcasts
wsHub.on('accept_hunk', async ({ changeId, hunkIndex }) => {
  await changeTracker.acceptHunk(changeId, hunkIndex);

  // Broadcast to all clients (VS Code will update decorations)
  wsHub.broadcast({
    type: 'hunk_accepted',
    payload: { changeId, hunkIndex }
  });
});
```

---

## Database Schema

```sql
-- Bridge session tracking
CREATE TABLE forge_bridge_sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id),
  terminal_pid INTEGER,
  terminal_type TEXT,              -- iTerm2, Ghostty, Kitty, etc.
  project_root TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  vscode_connected BOOLEAN DEFAULT false,
  browser_connected BOOLEAN DEFAULT false
);

-- Pending changes from external terminal
CREATE TABLE forge_pending_changes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  file_path TEXT NOT NULL,
  agent TEXT,
  hunks JSON NOT NULL,             -- Array of {startLine, endLine, original, modified, status, summary}
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Hunk-level decision tracking
CREATE TABLE forge_change_decisions (
  id INTEGER PRIMARY KEY,
  change_id TEXT NOT NULL REFERENCES forge_pending_changes(id),
  hunk_index INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  decided_in TEXT CHECK (decided_in IN ('vscode', 'browser')),
  decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(change_id, hunk_index)
);

-- Index for fast lookups
CREATE INDEX idx_pending_changes_session ON forge_pending_changes(session_id);
CREATE INDEX idx_pending_changes_file ON forge_pending_changes(file_path);
CREATE INDEX idx_pending_changes_status ON forge_pending_changes(status);
```

---

## Implementation Roadmap Update

### Phase 4: The Bridge (Week 4-5)

**Goal:** Seamless integration between external Claude Code terminal and VS Code.

1. **Session Bridge Infrastructure**
   - Session registration from hooks
   - Terminal type detection
   - Project root correlation

2. **Change Capture Enhancement**
   - PostToolUse hook extension
   - Before/after content capture
   - Diff generation and hunk parsing

3. **WebSocket Hub**
   - Real-time change broadcasting
   - Multi-client synchronization
   - Connection state management

4. **VS Code Extension Core**
   - WebSocket client
   - AgentChangeManager
   - Event handling

5. **Inline Decorations**
   - Added line highlighting
   - Gutter icons
   - Hover information

6. **CodeLens Integration**
   - Keep/Discard buttons
   - Hunk summaries
   - Agent attribution

7. **File Explorer Integration**
   - SCM provider for agent changes
   - File badge decorations
   - Pending/accepted grouping

8. **Browser UI Sync**
   - Shared state with VS Code
   - Batch operations
   - Change history

---

## Success Metrics

| Metric | Before Forge | With Forge |
|--------|--------------|------------|
| Time from terminal edit to VS Code visibility | Manual refresh | < 1 second |
| Change attribution | None (just "file modified") | Full (agent, session, summary) |
| Review workflow | Manual git diff | Inline Keep/Discard |
| Batch operations | Not possible | Accept/reject by file |
| Decision tracking | None | Full history with rationale |
| Terminal choice | Limits integration | Fully supported |

---

## The Vision Realized

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   You sit at your desk. Two windows open:                                       │
│                                                                                  │
│   LEFT: iTerm2, your terminal of choice.                                        │
│         The cursor blinks, waiting.                                             │
│                                                                                  │
│   RIGHT: VS Code, your editor.                                                  │
│          src/auth/jwt.ts is open.                                               │
│                                                                                  │
│   You type: claude "Add refresh token support to JWT auth"                      │
│                                                                                  │
│   Claude thinks. Reads the codebase. Makes a plan.                              │
│   Then: "I'll edit src/auth/jwt.ts to add refresh token generation..."          │
│                                                                                  │
│   The moment Claude's edit completes, VS Code lights up.                        │
│   Line 14 glows green. A robot icon appears in the gutter.                      │
│   Above the line: "🤖 backend-worker: Added dev fallback and refresh secret"    │
│   Below that: [✓ Keep] [✗ Discard]                                              │
│                                                                                  │
│   You read the change. It's good. You click Keep.                               │
│   The glow fades. The change is yours now.                                      │
│                                                                                  │
│   Claude continues. More files change. More lines light up.                     │
│   Each one reviewed. Each one decided. No surprises.                            │
│                                                                                  │
│   When you're done, git status shows only the changes you kept.                 │
│   The commit is clean. The code is right.                                       │
│                                                                                  │
│   This is development with agency.                                              │
│   This is the bridge.                                                           │
│   This is Forge.                                                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

*"The terminal is where you think. VS Code is where you review. Forge makes them one."*

This is **Forge v4**.
