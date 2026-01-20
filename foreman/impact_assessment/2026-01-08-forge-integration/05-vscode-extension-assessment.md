# VS Code Extension Impact Assessment

## Executive Summary

The Forge VS Code extension represents a fundamental shift in how developers interact with AI-assisted orchestration. Rather than building a standalone editor, we leverage VS Code as a shell that provides terminal integration, SCM tracking, file watching, and extension distribution - capabilities that would require 1,150+ engineering hours to build from scratch.

The extension architecture centers on three pillars: (1) a webview panel hosting a ReactFlow canvas for visual artifact editing, (2) a suite of providers (CodeLens, Decoration, SCM, Hover, Completion, Definition, Diagnostic) that integrate Forge deeply into the editing experience, and (3) a Language Server Protocol implementation that enables real-time validation, @ autocomplete, and intelligent navigation. The bridge between external Claude Code terminal sessions and VS Code enables Cursor-style Keep/Discard review of agent changes.

Distribution via the VS Code Marketplace ensures broad reach with minimal friction. The extension targets VS Code 1.85+ for stable API access to proposed features like terminal data events. The architecture prioritizes lazy loading and modular activation to minimize startup impact on the IDE.

## Extension Architecture

### Activation

The extension employs lazy activation to minimize VS Code startup impact:

```json
{
  "activationEvents": [
    "workspaceContains:.claude/",
    "onStartupFinished",
    "onCommand:forge.openEditor",
    "onLanguage:markdown",
    "onWebviewPanel:forge.editor"
  ]
}
```

**Activation Strategy:**
| Event | Trigger | Loaded Components |
|-------|---------|-------------------|
| `workspaceContains:.claude/` | Workspace has orchestration files | Full extension |
| `onStartupFinished` | VS Code ready, background registration | WebSocket client only |
| `onCommand:forge.openEditor` | User opens Forge | Webview panel |
| `onLanguage:markdown` | Edit .md file in .claude/ | Language features |

**Lazy Loading Implementation:**
```typescript
// extension.ts
export async function activate(context: vscode.ExtensionContext) {
  // Immediate: Register commands (lightweight)
  registerCommands(context);

  // Immediate: Start WebSocket client for bridge
  const wsClient = new ForgeWebSocketClient();

  // Deferred: Language features (only when editing .claude/ files)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      if (doc.uri.fsPath.includes('.claude/')) {
        activateLanguageFeatures(context);
      }
    })
  );

  // Deferred: Webview (only when panel opened)
  // Webview activates via onWebviewPanel event
}
```

### Extension Host

The main extension code runs in the VS Code Extension Host process, separate from the UI thread:

```
Extension Host Architecture
---------------------------

+------------------------------------------+
| VS CODE MAIN PROCESS                      |
|   - UI rendering                          |
|   - Editor management                     |
+------------------------------------------+
          |
          | IPC
          v
+------------------------------------------+
| EXTENSION HOST PROCESS                    |
|                                           |
|  +------------------------------------+  |
|  | Forge Extension                     |  |
|  |                                     |  |
|  | +--------------------------------+ |  |
|  | | Core Services                   | |  |
|  | |  - ForgeWebSocketClient        | |  |
|  | |  - AgentChangeManager          | |  |
|  | |  - ArtifactCache               | |  |
|  | +--------------------------------+ |  |
|  |                                     |  |
|  | +--------------------------------+ |  |
|  | | Providers (registered lazily)   | |  |
|  | |  - ArtifactTreeProvider        | |  |
|  | |  - AgentChangesProvider        | |  |
|  | |  - CodeLensProvider            | |  |
|  | |  - DecorationProvider          | |  |
|  | |  - CompletionProvider          | |  |
|  | |  - HoverProvider               | |  |
|  | |  - DiagnosticProvider          | |  |
|  | +--------------------------------+ |  |
|  |                                     |  |
|  | +--------------------------------+ |  |
|  | | Language Server (separate proc) | |  |
|  | |  - LSP client                   | |  |
|  | +--------------------------------+ |  |
|  +------------------------------------+  |
+------------------------------------------+
          |
          | WebSocket
          v
+------------------------------------------+
| FORGE WORKER (localhost:37777)            |
|   - Artifact database                     |
|   - Change tracking                       |
|   - Behavior learning                     |
+------------------------------------------+
```

**Core Services:**
```typescript
// src/services/ForgeWebSocketClient.ts
export class ForgeWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket('ws://localhost:37777/api/forge/live');

      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      });

      this.ws.on('close', () => {
        this.scheduleReconnect();
      });
    } catch (error) {
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: ForgeMessage) {
    switch (message.type) {
      case 'agent_change':
        this.emit('change', message.payload);
        break;
      case 'artifact_updated':
        this.emit('artifact', message.payload);
        break;
      case 'behavior_learned':
        this.emit('behavior', message.payload);
        break;
    }
  }
}
```

### Webview

The webview panel hosts the React-based visual editor with ReactFlow canvas:

**Panel Lifecycle:**
```typescript
// src/webview/ForgePanel.ts
export class ForgePanel {
  public static currentPanel: ForgePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ForgePanel.currentPanel) {
      ForgePanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'forge.editor',
      'Forge Editor',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
        ]
      }
    );

    ForgePanel.currentPanel = new ForgePanel(panel, extensionUri);
  }
}
```

**Webview Content Security Policy:**
```typescript
private _getHtmlForWebview(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'main.js')
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'main.css')
  );
  const nonce = getNonce();

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${webview.cspSource} 'unsafe-inline';
        script-src 'nonce-${nonce}';
        connect-src ws://localhost:37777 http://localhost:37777;
        img-src ${webview.cspSource} data:;
      ">
      <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
      <div id="root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
}
```

**State Persistence:**
```typescript
// Webview state persisted in memento
interface ForgeWebviewState {
  selectedArtifact: string | null;
  graphLayout: ReactFlowViewport;
  expandedCategories: string[];
  panelWidth: number;
}

// Save state on dispose
private _saveState() {
  this._context.workspaceState.update(
    'forge.webviewState',
    this._state
  );
}

// Restore state on create
private _restoreState(): ForgeWebviewState {
  return this._context.workspaceState.get('forge.webviewState', {
    selectedArtifact: null,
    graphLayout: { x: 0, y: 0, zoom: 1 },
    expandedCategories: ['commands', 'agents'],
    panelWidth: 300
  });
}
```

## Providers

### CodeLens Provider

CodeLens displays Keep/Discard buttons above change hunks and artifact metadata above definitions:

```typescript
// src/providers/AgentChangeCodeLensProvider.ts
export class AgentChangeCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  constructor(private changeManager: AgentChangeManager) {
    changeManager.onDidChange(() => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const changes = this.changeManager.getChangesForFile(document.uri.fsPath);
    const lenses: vscode.CodeLens[] = [];

    for (const change of changes) {
      for (const hunk of change.hunks) {
        if (hunk.status !== 'pending') continue;

        const range = new vscode.Range(
          hunk.startLine - 1, 0,
          hunk.startLine - 1, 0
        );

        // Agent attribution
        lenses.push(new vscode.CodeLens(range, {
          title: `Agent: ${change.agent} - ${hunk.summary}`,
          command: 'forge.showHunkDetails',
          arguments: [change, hunk]
        }));

        // Keep button
        lenses.push(new vscode.CodeLens(range, {
          title: 'Keep',
          command: 'forge.acceptHunk',
          arguments: [change.id, hunk.id]
        }));

        // Discard button
        lenses.push(new vscode.CodeLens(range, {
          title: 'Discard',
          command: 'forge.rejectHunk',
          arguments: [change.id, hunk.id]
        }));
      }
    }

    return lenses;
  }
}
```

**Performance Optimization:**
```typescript
// Debounce CodeLens updates during rapid typing
private _debouncedRefresh = debounce(() => {
  this._onDidChangeCodeLenses.fire();
}, 150);

// Cache resolved lenses per document version
private _lensCache = new Map<string, {
  version: number;
  lenses: vscode.CodeLens[];
}>();

provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
  const cacheKey = document.uri.fsPath;
  const cached = this._lensCache.get(cacheKey);

  if (cached && cached.version === document.version) {
    return cached.lenses;
  }

  const lenses = this._computeLenses(document);
  this._lensCache.set(cacheKey, {
    version: document.version,
    lenses
  });

  return lenses;
}
```

### Decoration Provider

Decorations highlight forge-tracked files and show inline diffs:

```typescript
// src/providers/AgentChangeDecorationProvider.ts
export class AgentChangeDecorationProvider {
  // Decoration types
  private additionDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    isWholeLine: true,
    overviewRulerColor: 'rgba(46, 160, 67, 0.6)',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    gutterIconPath: this.getAgentIcon(),
    gutterIconSize: 'contain'
  });

  private deletionDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    isWholeLine: true,
    overviewRulerColor: 'rgba(248, 81, 73, 0.6)',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    textDecoration: 'line-through',
    opacity: '0.7'
  });

  private hunkBorderDecoration = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    borderWidth: '1px 0 0 0',
    borderStyle: 'dashed',
    borderColor: 'rgba(100, 100, 100, 0.5)'
  });

  updateDecorations(editor: vscode.TextEditor) {
    const changes = this.changeManager.getChangesForFile(editor.document.uri.fsPath);

    const additions: vscode.DecorationOptions[] = [];
    const deletions: vscode.DecorationOptions[] = [];
    const borders: vscode.DecorationOptions[] = [];

    for (const change of changes) {
      for (const hunk of change.hunks) {
        if (hunk.status !== 'pending') continue;

        // Mark hunk boundary
        borders.push({
          range: new vscode.Range(hunk.startLine - 1, 0, hunk.startLine - 1, 0),
          hoverMessage: new vscode.MarkdownString(
            `**Agent Change**: ${change.agent}\n\n${hunk.summary}`
          )
        });

        // Mark added/removed lines
        for (const line of hunk.lines) {
          if (line.startsWith('+')) {
            additions.push({
              range: new vscode.Range(line.newLineNumber - 1, 0, line.newLineNumber - 1, Number.MAX_VALUE)
            });
          } else if (line.startsWith('-')) {
            deletions.push({
              range: new vscode.Range(line.oldLineNumber - 1, 0, line.oldLineNumber - 1, Number.MAX_VALUE)
            });
          }
        }
      }
    }

    editor.setDecorations(this.additionDecoration, additions);
    editor.setDecorations(this.deletionDecoration, deletions);
    editor.setDecorations(this.hunkBorderDecoration, borders);
  }
}
```

**File Explorer Decorations:**
```typescript
// src/providers/FileDecorationProvider.ts
export class ForgeFileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | undefined>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const pendingCount = this.changeManager.getPendingCountForFile(uri.fsPath);

    if (pendingCount > 0) {
      return {
        badge: pendingCount.toString(),
        tooltip: `${pendingCount} pending agent change${pendingCount > 1 ? 's' : ''}`,
        color: new vscode.ThemeColor('gitDecoration.addedResourceForeground')
      };
    }

    // Mark .claude/ artifacts
    if (uri.fsPath.includes('.claude/')) {
      return {
        badge: 'F',
        tooltip: 'Forge artifact',
        color: new vscode.ThemeColor('charts.purple')
      };
    }

    return undefined;
  }
}
```

### SCM Provider

The "Agent Changes" view integrates with VS Code's Source Control panel:

```typescript
// src/providers/AgentChangesProvider.ts
export class AgentChangesSourceControl {
  private scm: vscode.SourceControl;
  private pendingGroup: vscode.SourceControlResourceGroup;
  private acceptedGroup: vscode.SourceControlResourceGroup;

  constructor(private changeManager: AgentChangeManager) {
    this.scm = vscode.scm.createSourceControl('forge-changes', 'Agent Changes');
    this.scm.quickDiffProvider = this;
    this.scm.inputBox.placeholder = 'Agent changes review';

    this.pendingGroup = this.scm.createResourceGroup('pending', 'Pending Review');
    this.pendingGroup.hideWhenEmpty = true;

    this.acceptedGroup = this.scm.createResourceGroup('accepted', 'Accepted');
    this.acceptedGroup.hideWhenEmpty = true;

    // Accept All action
    this.scm.acceptInputCommand = {
      command: 'forge.acceptAllChanges',
      title: 'Accept All'
    };

    changeManager.onDidChange(() => this.refresh());
  }

  refresh() {
    const pending: vscode.SourceControlResourceState[] = [];
    const accepted: vscode.SourceControlResourceState[] = [];

    for (const change of this.changeManager.getAllChanges()) {
      const resourceUri = vscode.Uri.file(change.file_path);
      const pendingHunks = change.hunks.filter(h => h.status === 'pending');
      const acceptedHunks = change.hunks.filter(h => h.status === 'accepted');

      if (pendingHunks.length > 0) {
        pending.push({
          resourceUri,
          decorations: {
            strikeThrough: false,
            faded: false,
            tooltip: `${pendingHunks.length} hunk(s) pending - ${change.agent}`,
            iconPath: this.getAgentIcon(change.agent)
          },
          command: {
            command: 'forge.showDiff',
            title: 'Show Diff',
            arguments: [change]
          }
        });
      }

      if (acceptedHunks.length > 0) {
        accepted.push({
          resourceUri,
          decorations: {
            strikeThrough: false,
            faded: true,
            tooltip: `${acceptedHunks.length} hunk(s) accepted`
          }
        });
      }
    }

    this.pendingGroup.resourceStates = pending;
    this.acceptedGroup.resourceStates = accepted;
  }

  // Quick diff provider
  provideOriginalResource(uri: vscode.Uri): vscode.Uri | undefined {
    const change = this.changeManager.getChangeForFile(uri.fsPath);
    if (change) {
      return vscode.Uri.parse(`forge-original:${uri.fsPath}`);
    }
    return undefined;
  }
}
```

### Language Server

The LSP implementation provides intelligent editing support for orchestration files:

```typescript
// src/language-server/server.ts
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  CompletionItemKind,
  Hover,
  TextDocumentPositionParams,
  Definition,
  Diagnostic,
  DiagnosticSeverity
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// Artifact cache for completions
let artifactCache: Map<string, ArtifactInfo> = new Map();

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: 1,
      completionProvider: {
        triggerCharacters: ['@', '/'],
        resolveProvider: true
      },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: true
      }
    }
  };
});

// @ Autocomplete
connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const line = document.getText({
    start: { line: params.position.line, character: 0 },
    end: params.position
  });

  // Check for @ trigger
  const atMatch = line.match(/@(\w*\/)?(\w*)$/);
  if (!atMatch) return [];

  const [, prefix, partial] = atMatch;
  const items: CompletionItem[] = [];

  for (const [id, artifact] of artifactCache) {
    // Filter by prefix if provided
    if (prefix && !id.startsWith(`@${prefix}`)) continue;
    if (partial && !artifact.name.toLowerCase().includes(partial.toLowerCase())) continue;

    items.push({
      label: `@${artifact.type}/${artifact.name}`,
      kind: getCompletionKind(artifact.type),
      detail: artifact.description,
      documentation: {
        kind: 'markdown',
        value: [
          artifact.description,
          '',
          '---',
          `**Executions:** ${artifact.executionCount}`,
          `**Success Rate:** ${(artifact.successRate * 100).toFixed(0)}%`,
          `**Avg Tokens:** ${artifact.avgTokens}`
        ].join('\n')
      },
      insertText: `@${artifact.type}/${artifact.name}`,
      data: { artifactId: id }
    });
  }

  return items;
});

// Hover information
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const wordRange = getWordRangeAtPosition(document, params.position);
  const word = document.getText(wordRange);

  const match = word.match(/@(\w+)\/(\w+)/);
  if (!match) return null;

  const [, type, name] = match;
  const artifact = artifactCache.get(`${type}/${name}`);

  if (!artifact) return null;

  return {
    contents: {
      kind: 'markdown',
      value: [
        `## ${artifact.name}`,
        '',
        artifact.description,
        '',
        '---',
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Executions | ${artifact.executionCount} |`,
        `| Success Rate | ${(artifact.successRate * 100).toFixed(0)}% |`,
        `| Avg Tokens | ${artifact.avgTokens} |`,
        `| Last Run | ${artifact.lastRun || 'Never'} |`,
        '',
        artifact.usesSkills?.length ? `**Uses Skills:** ${artifact.usesSkills.join(', ')}` : '',
        '',
        '[Go to definition](command:forge.goToArtifact) | [Find all references](command:forge.findReferences)'
      ].join('\n')
    }
  };
});

// Diagnostics
connection.onDidChangeTextDocument(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return;

  const diagnostics: Diagnostic[] = [];
  const text = document.getText();

  // Find all @ references
  const refPattern = /@(\w+)\/(\w+)/g;
  let match;

  while ((match = refPattern.exec(text)) !== null) {
    const [fullMatch, type, name] = match;
    const artifactId = `${type}/${name}`;

    if (!artifactCache.has(artifactId)) {
      // Find closest match for suggestion
      const suggestion = findClosestArtifact(artifactId);

      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: document.positionAt(match.index),
          end: document.positionAt(match.index + fullMatch.length)
        },
        message: `Unknown artifact '${artifactId}'${suggestion ? `. Did you mean: @${suggestion}?` : ''}`,
        source: 'forge'
      });
    }
  }

  connection.sendDiagnostics({
    uri: params.textDocument.uri,
    diagnostics
  });
});

documents.listen(connection);
connection.listen();
```

## Worker Communication

### Protocol

The extension communicates with the Forge worker via both HTTP (for request/response) and WebSocket (for real-time updates):

**Decision: HTTP + WebSocket Hybrid**

| Aspect | HTTP | WebSocket |
|--------|------|-----------|
| **Use Case** | CRUD operations, queries | Real-time updates |
| **Connection** | Per-request | Persistent |
| **Reliability** | Request/response guarantee | Reconnection logic needed |
| **Latency** | Higher (connection overhead) | Lower (already connected) |

```typescript
// src/api/ForgeClient.ts
export class ForgeClient {
  private wsClient: ForgeWebSocketClient;
  private httpBaseUrl = 'http://localhost:37777';

  constructor() {
    this.wsClient = new ForgeWebSocketClient();
  }

  // HTTP for queries and mutations
  async getArtifacts(projectId: string): Promise<Artifact[]> {
    const response = await fetch(
      `${this.httpBaseUrl}/api/forge/artifacts?project_id=${projectId}`
    );
    return response.json();
  }

  async updateArtifact(id: string, content: string): Promise<void> {
    await fetch(`${this.httpBaseUrl}/api/forge/artifacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  }

  async recordDecision(
    changeId: string,
    hunkIndex: number,
    decision: 'accepted' | 'rejected'
  ): Promise<void> {
    await fetch(`${this.httpBaseUrl}/api/forge/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change_id: changeId, hunk_index: hunkIndex, decision })
    });
  }

  // WebSocket for real-time updates
  onAgentChange(handler: (change: ProcessedChange) => void): void {
    this.wsClient.on('change', handler);
  }

  onArtifactUpdate(handler: (artifact: Artifact) => void): void {
    this.wsClient.on('artifact', handler);
  }
}
```

### Message Types

**WebSocket Messages (Worker -> Extension):**
```typescript
// Real-time messages from worker
type ForgeWebSocketMessage =
  | { type: 'agent_change'; payload: ProcessedChange }
  | { type: 'artifact_updated'; payload: ArtifactUpdate }
  | { type: 'artifact_deleted'; payload: { id: string } }
  | { type: 'behavior_learned'; payload: Behavior }
  | { type: 'session_connected'; payload: SessionInfo }
  | { type: 'session_ended'; payload: { session_id: string } };

interface ProcessedChange {
  id: string;
  session_id: string;
  file_path: string;
  agent: string;
  hunks: ChangeHunk[];
  timestamp: string;
  status: 'pending' | 'partial' | 'resolved';
}

interface ChangeHunk {
  id: string;
  startLine: number;
  endLine: number;
  lines: DiffLine[];
  original: string;
  modified: string;
  summary: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface DiffLine {
  type: '+' | '-' | ' ';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}
```

**HTTP Request/Response Schemas:**
```typescript
// GET /api/forge/artifacts
interface ArtifactsResponse {
  artifacts: Artifact[];
  total: number;
}

interface Artifact {
  id: string;
  project_id: string;
  artifact_type: 'command' | 'agent' | 'skill' | 'template' | 'rule';
  name: string;
  description: string | null;
  content: string;
  frontmatter: Record<string, unknown>;
  checksum: string;
  execution_stats?: {
    count: number;
    success_rate: number;
    avg_tokens: number;
    last_run: string | null;
  };
  created_at: string;
  updated_at: string;
}

// POST /api/forge/changes
interface ChangeSubmission {
  session_id: string;
  file_path: string;
  tool: 'Edit' | 'Write';
  before_content: string | null;
  after_content: string;
  agent: string;
  timestamp: string;
}

// POST /api/forge/decisions
interface DecisionSubmission {
  change_id: string;
  hunk_index: number;
  decision: 'accepted' | 'rejected';
  decided_in: 'vscode' | 'browser';
}
```

**Webview <-> Extension Messages:**
```typescript
// Webview -> Extension
type WebviewToExtensionMessage =
  | { type: 'select_artifact'; payload: { id: string } }
  | { type: 'update_content'; payload: { id: string; content: string } }
  | { type: 'create_artifact'; payload: CreateArtifactPayload }
  | { type: 'delete_artifact'; payload: { id: string } }
  | { type: 'create_relation'; payload: CreateRelationPayload }
  | { type: 'request_refresh' }
  | { type: 'navigate_to_file'; payload: { path: string; line?: number } };

// Extension -> Webview
type ExtensionToWebviewMessage =
  | { type: 'artifacts_loaded'; payload: { artifacts: Artifact[]; relations: Relation[] } }
  | { type: 'artifact_updated'; payload: Artifact }
  | { type: 'artifact_deleted'; payload: { id: string } }
  | { type: 'execution_started'; payload: ExecutionInfo }
  | { type: 'execution_complete'; payload: ExecutionResult }
  | { type: 'behaviors_updated'; payload: Behavior[] }
  | { type: 'error'; payload: { message: string; code?: string } };
```

## Distribution

### Packaging

The extension is packaged as a VSIX using the `@vscode/vsce` tool:

```json
// package.json
{
  "name": "forge-vscode",
  "displayName": "Forge - AI Orchestration",
  "description": "Visual orchestration editor with artifact graph, behavior learning, and agent change review",
  "version": "1.0.0",
  "publisher": "thedotmack",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other",
    "Machine Learning",
    "Programming Languages"
  ],
  "keywords": [
    "ai",
    "orchestration",
    "claude",
    "agents",
    "automation"
  ],
  "activationEvents": [
    "workspaceContains:.claude/",
    "onStartupFinished"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "forge.openEditor",
        "title": "Open Forge Editor",
        "category": "Forge"
      },
      {
        "command": "forge.acceptHunk",
        "title": "Accept Change",
        "category": "Forge"
      },
      {
        "command": "forge.rejectHunk",
        "title": "Discard Change",
        "category": "Forge"
      }
    ],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "forge",
          "title": "Forge",
          "icon": "resources/forge-icon.svg"
        }
      ]
    },
    "views": {
      "forge": [
        {
          "id": "forge.artifacts",
          "name": "Artifacts"
        },
        {
          "id": "forge.changes",
          "name": "Agent Changes"
        },
        {
          "id": "forge.behaviors",
          "name": "Behaviors"
        }
      ]
    },
    "menus": {
      "scm/title": [
        {
          "command": "forge.acceptAllChanges",
          "group": "navigation",
          "when": "scmProvider == forge-changes"
        }
      ]
    },
    "languages": [
      {
        "id": "forge-markdown",
        "extensions": [".md"],
        "filenames": [],
        "filenamePatterns": ["**/.claude/**/*.md"]
      }
    ],
    "grammars": [
      {
        "language": "forge-markdown",
        "scopeName": "text.html.markdown.forge",
        "path": "./syntaxes/forge-markdown.tmLanguage.json",
        "injectTo": ["text.html.markdown"]
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node && npm run build:webview",
    "build:webview": "vite build --config vite.webview.config.ts",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "dependencies": {
    "ws": "^8.16.0",
    "diff": "^5.1.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/vsce": "^2.22.0",
    "esbuild": "^0.19.0",
    "vite": "^5.0.0"
  }
}
```

**Build Process:**
```bash
# Build extension
npm run build

# Package VSIX
npm run package
# Outputs: forge-vscode-1.0.0.vsix

# Test locally
code --install-extension forge-vscode-1.0.0.vsix
```

**Bundle Size Optimization:**
```typescript
// esbuild config
const buildOptions = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  minify: process.env.NODE_ENV === 'production',
  treeShaking: true,
  metafile: true // Generate bundle analysis
};
```

### Marketplace

**Publishing Requirements:**
1. **Publisher Account**: Register at https://marketplace.visualstudio.com/manage
2. **Personal Access Token**: Azure DevOps PAT with Marketplace scope
3. **Icon**: 128x128 PNG for marketplace listing
4. **README**: Comprehensive with screenshots and GIFs
5. **CHANGELOG**: Version history
6. **LICENSE**: MIT or similar

**Marketplace Listing:**
```markdown
# Forge - AI Orchestration

Transform your AI orchestration from text editing to visual programming.

## Features

- **Visual Artifact Graph**: See commands, agents, and skills as connected nodes
- **@ Autocomplete**: Type @ for intelligent artifact suggestions with execution stats
- **Agent Change Review**: Cursor-style Keep/Discard for AI-made changes
- **Behavior Learning**: System learns how you work and adapts

## Requirements

- VS Code 1.85+
- Forge Worker running (localhost:37777)
- Claude Code for terminal integration

## Getting Started

1. Install the extension
2. Open a workspace with a `.claude/` folder
3. Click the Forge icon in the Activity Bar

## Screenshots

[Artifact Graph] [Agent Changes] [@ Autocomplete]
```

**Version Compatibility:**
| VS Code Version | Extension Version | Notes |
|-----------------|-------------------|-------|
| 1.85+ | 1.x | Full support |
| 1.80-1.84 | 0.9.x | Limited terminal observation |
| < 1.80 | Not supported | Missing required APIs |

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Worker not running** | High | High | Graceful degradation with "Start Worker" prompt; extension functions in offline mode for file editing |
| **WebSocket disconnection** | Medium | Medium | Exponential backoff reconnection; queue changes locally; sync on reconnect |
| **Large file performance** | Medium | Medium | Virtualize change lists; lazy load hunks; debounce decorations |
| **Conflicting extensions** | Low | Medium | Namespace all commands/providers; document known conflicts |
| **VS Code API deprecation** | Low | High | Pin to stable APIs; monitor proposed API status; maintain compatibility layer |
| **Webview memory leaks** | Medium | Medium | Strict cleanup in dispose(); limit ReactFlow node count; pagination for large graphs |
| **Language server crashes** | Low | Medium | Separate process with auto-restart; graceful fallback to basic completion |
| **Terminal observation privacy** | Medium | High | Clear opt-in for terminal observation; local-only storage; no cloud sync of terminal data |

**Graceful Degradation Modes:**
```typescript
enum ExtensionMode {
  Full = 'full',           // Worker connected, all features
  Offline = 'offline',     // No worker, file editing only
  ReadOnly = 'readonly',   // Worker connected, no write permissions
  Minimal = 'minimal'      // Errors prevented activation of some features
}

function determineMode(): ExtensionMode {
  if (!workerConnected) return ExtensionMode.Offline;
  if (!hasWritePermissions) return ExtensionMode.ReadOnly;
  if (activationErrors.length > 0) return ExtensionMode.Minimal;
  return ExtensionMode.Full;
}
```

## Recommendations

**Priority 1 - Foundation (Week 1-2):**
1. Implement extension scaffolding with lazy activation
2. Build ForgeWebSocketClient with robust reconnection
3. Create AgentChangeManager as central state management
4. Implement basic CodeLens and Decoration providers

**Priority 2 - Core UX (Week 3-4):**
5. Build Agent Changes SCM provider for Source Control panel
6. Implement Keep/Discard command handlers with undo support
7. Create ArtifactTreeProvider for sidebar navigation
8. Build basic webview panel with React infrastructure

**Priority 3 - Language Features (Week 5):**
9. Implement Language Server with @ autocomplete
10. Add hover information with execution stats
11. Create diagnostic provider for reference validation
12. Implement go-to-definition for artifact navigation

**Priority 4 - Visual Editor (Week 6-7):**
13. Build ReactFlow canvas in webview
14. Implement custom nodes for each artifact type
15. Add edge rendering with execution frequency
16. Create Monaco editor integration within webview

**Priority 5 - Polish (Week 8):**
17. Comprehensive error handling and status bar
18. Performance optimization (caching, debouncing)
19. Documentation and marketplace assets
20. Beta testing and feedback integration

**Technical Decisions:**
- Use esbuild for extension bundling (faster than webpack)
- Use Vite for webview React app (HMR during development)
- Separate Language Server process for stability
- Store state in VS Code's workspaceState for persistence
- Use WebSocket for real-time, HTTP for CRUD operations
