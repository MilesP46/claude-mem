# Worker Service & HTTP API Impact Assessment

## Executive Summary

The Forge integration introduces a substantial expansion of the claude-mem worker service HTTP API to support artifact management, terminal session bridging, planning visibility, and real-time WebSocket communication with VS Code. The existing architecture is well-suited for this extension: the current route handler pattern (BaseRouteHandler inheritance, dependency injection, feature-based organization) provides a clean template for the five new route files.

The most significant architectural additions are the SessionBridge service (for tracking external terminal sessions and their relationship to VS Code) and the WebSocket hub (for real-time bidirectional communication). The existing SSEBroadcaster provides a foundation but WebSocket offers advantages for bidirectional communication, lower latency, and client subscriptions. The recommended approach is to implement WebSocket alongside SSE, with SSE deprecated over time.

Backward compatibility is preserved by keeping all existing endpoints unchanged, using API versioning (`/api/v2/forge/*`) for new functionality, and ensuring that clients unaware of Forge continue to operate normally. The existing SessionManager, DatabaseManager, and route patterns require minimal modification - the Forge routes integrate as new consumers of these services rather than replacements.

## New Routes

### ForgeRoutes.ts

Handles artifact CRUD operations, validation, and relationship management for the living graph system.

```typescript
// Location: src/services/worker/http/routes/ForgeRoutes.ts

import express, { Request, Response } from 'express';
import { BaseRouteHandler } from '../BaseRouteHandler.js';
import { DatabaseManager } from '../../DatabaseManager.js';

interface ForgeArtifact {
  id: string;
  project_id: string;
  artifact_type: 'command' | 'agent' | 'skill' | 'instruction' | 'template' | 'rule';
  name: string;
  description?: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  checksum: string;
  format_version: string;
  format_valid: boolean;
  format_errors?: string[];
  created_at: string;
  updated_at: string;
}

interface ForgeRelation {
  id: number;
  source_id: string;
  target_id: string;
  relation_type: 'launches' | 'uses_skill' | 'references_template' | 'applies_rule' | 'includes_instruction';
  context_line?: number;
  context_text?: string;
  detection_method: 'explicit' | 'inferred' | 'manual';
  confidence: number;
  created_at: string;
}

export class ForgeRoutes extends BaseRouteHandler {
  constructor(
    private dbManager: DatabaseManager,
    private forgeService: ForgeService
  ) {
    super();
  }

  setupRoutes(app: express.Application): void {
    // Artifact CRUD
    app.get('/api/v2/forge/artifacts', this.handleListArtifacts.bind(this));
    app.get('/api/v2/forge/artifacts/:id', this.handleGetArtifact.bind(this));
    app.post('/api/v2/forge/artifacts', this.handleCreateArtifact.bind(this));
    app.put('/api/v2/forge/artifacts/:id', this.handleUpdateArtifact.bind(this));
    app.delete('/api/v2/forge/artifacts/:id', this.handleDeleteArtifact.bind(this));

    // Artifact validation
    app.post('/api/v2/forge/artifacts/validate', this.handleValidateArtifact.bind(this));
    app.post('/api/v2/forge/artifacts/:id/sync', this.handleSyncArtifact.bind(this));

    // Relationships
    app.get('/api/v2/forge/relations', this.handleListRelations.bind(this));
    app.post('/api/v2/forge/relations', this.handleCreateRelation.bind(this));
    app.delete('/api/v2/forge/relations/:id', this.handleDeleteRelation.bind(this));

    // Executions (read-only, auto-populated)
    app.get('/api/v2/forge/executions', this.handleListExecutions.bind(this));
    app.get('/api/v2/forge/executions/:id', this.handleGetExecution.bind(this));

    // Behaviors (read-only, learned patterns)
    app.get('/api/v2/forge/behaviors', this.handleListBehaviors.bind(this));
  }
}
```

**Endpoint Definitions:**

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | /api/v2/forge/artifacts | List artifacts | `?project_id&type&limit&offset` | `{ artifacts: ForgeArtifact[], total: number }` |
| GET | /api/v2/forge/artifacts/:id | Get artifact by ID | - | `ForgeArtifact` |
| POST | /api/v2/forge/artifacts | Create artifact | `{ project_id, artifact_type, name, content }` | `ForgeArtifact` |
| PUT | /api/v2/forge/artifacts/:id | Update artifact | `{ content, description? }` | `ForgeArtifact` |
| DELETE | /api/v2/forge/artifacts/:id | Delete artifact | - | `{ success: true }` |
| POST | /api/v2/forge/artifacts/validate | Validate artifact content | `{ artifact_type, content }` | `{ valid: boolean, errors?: string[] }` |
| POST | /api/v2/forge/artifacts/:id/sync | Force file<->DB sync | - | `{ synced: boolean, direction: 'file_to_db' \| 'db_to_file' }` |
| GET | /api/v2/forge/relations | List relationships | `?artifact_id&direction=outgoing\|incoming` | `{ relations: ForgeRelation[] }` |
| POST | /api/v2/forge/relations | Create relationship | `{ source_id, target_id, relation_type }` | `ForgeRelation` |
| DELETE | /api/v2/forge/relations/:id | Delete relationship | - | `{ success: true }` |
| GET | /api/v2/forge/executions | List executions | `?artifact_id&session_id&limit` | `{ executions: ForgeExecution[] }` |
| GET | /api/v2/forge/behaviors | List learned behaviors | `?project_id&min_confidence` | `{ behaviors: ForgeBehavior[] }` |

---

### TerminalRoutes.ts

Handles terminal registration and status for external Claude Code sessions.

```typescript
// Location: src/services/worker/http/routes/TerminalRoutes.ts

import express, { Request, Response } from 'express';
import { BaseRouteHandler } from '../BaseRouteHandler.js';
import { SessionBridge } from '../../forge/SessionBridge.js';

interface TerminalRegistration {
  session_id: string;           // Claude Code content session ID
  terminal_pid: number;         // Process ID of terminal
  terminal_type: string;        // iTerm2, Ghostty, Kitty, etc.
  project_root: string;         // Working directory
  started_at: string;           // ISO timestamp
}

interface TerminalCommandRecord {
  session_id: string;
  project_id: string;
  command: string;
  working_dir: string;
  exit_code?: number;
  executed_at: string;
}

export class TerminalRoutes extends BaseRouteHandler {
  constructor(
    private sessionBridge: SessionBridge
  ) {
    super();
  }

  setupRoutes(app: express.Application): void {
    // Terminal registration
    app.post('/api/v2/forge/terminals/register', this.handleRegisterTerminal.bind(this));
    app.post('/api/v2/forge/terminals/heartbeat', this.handleHeartbeat.bind(this));
    app.post('/api/v2/forge/terminals/disconnect', this.handleDisconnect.bind(this));

    // Terminal status
    app.get('/api/v2/forge/terminals', this.handleListTerminals.bind(this));
    app.get('/api/v2/forge/terminals/:sessionId', this.handleGetTerminal.bind(this));

    // Command recording (for behavior learning)
    app.post('/api/v2/forge/terminals/commands', this.handleRecordCommand.bind(this));
    app.get('/api/v2/forge/terminals/:sessionId/commands', this.handleGetCommands.bind(this));
  }
}
```

**Endpoint Definitions:**

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | /api/v2/forge/terminals/register | Register external terminal | `TerminalRegistration` | `{ registered: true, bridge_session_id: number }` |
| POST | /api/v2/forge/terminals/heartbeat | Keep-alive for session | `{ session_id }` | `{ alive: true, last_activity: string }` |
| POST | /api/v2/forge/terminals/disconnect | Graceful disconnect | `{ session_id }` | `{ disconnected: true }` |
| GET | /api/v2/forge/terminals | List active terminals | `?project_root` | `{ terminals: BridgeSession[] }` |
| GET | /api/v2/forge/terminals/:sessionId | Get terminal details | - | `BridgeSession` |
| POST | /api/v2/forge/terminals/commands | Record terminal command | `TerminalCommandRecord` | `{ recorded: true, behavior_updated?: boolean }` |
| GET | /api/v2/forge/terminals/:sessionId/commands | Get session commands | `?limit` | `{ commands: TerminalCommandRecord[] }` |

---

### ForgeSessionRoutes.ts

Handles session lifecycle for Forge-specific session hierarchy (nested agents, parent/child tracking).

```typescript
// Location: src/services/worker/http/routes/ForgeSessionRoutes.ts

import express, { Request, Response } from 'express';
import { BaseRouteHandler } from '../BaseRouteHandler.js';
import { SessionBridge } from '../../forge/SessionBridge.js';

interface ForgeSession {
  id: string;
  session_id: string;           // Links to claude-mem sessions.id
  terminal_pid?: number;
  terminal_type?: string;
  project_root: string;
  parent_session_id?: string;   // For nested agent tracking
  status: 'active' | 'paused' | 'terminated';
  vscode_connected: boolean;
  browser_connected: boolean;
  started_at: string;
  ended_at?: string;
}

export class ForgeSessionRoutes extends BaseRouteHandler {
  constructor(
    private sessionBridge: SessionBridge
  ) {
    super();
  }

  setupRoutes(app: express.Application): void {
    // Session lifecycle
    app.post('/api/v2/forge/sessions/register', this.handleRegisterSession.bind(this));
    app.post('/api/v2/forge/sessions/:sessionId/pause', this.handlePauseSession.bind(this));
    app.post('/api/v2/forge/sessions/:sessionId/resume', this.handleResumeSession.bind(this));
    app.post('/api/v2/forge/sessions/:sessionId/terminate', this.handleTerminateSession.bind(this));

    // Session hierarchy
    app.get('/api/v2/forge/sessions', this.handleListSessions.bind(this));
    app.get('/api/v2/forge/sessions/:sessionId', this.handleGetSession.bind(this));
    app.get('/api/v2/forge/sessions/:sessionId/children', this.handleGetChildren.bind(this));
    app.get('/api/v2/forge/sessions/:sessionId/tree', this.handleGetSessionTree.bind(this));

    // Client connections
    app.post('/api/v2/forge/sessions/:sessionId/connect', this.handleClientConnect.bind(this));
    app.post('/api/v2/forge/sessions/:sessionId/disconnect', this.handleClientDisconnect.bind(this));
  }
}
```

**Endpoint Definitions:**

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | /api/v2/forge/sessions/register | Register Forge session | `{ session_id, terminal_pid?, terminal_type?, project_root, parent_session_id? }` | `ForgeSession` |
| POST | /api/v2/forge/sessions/:sessionId/pause | Pause session | - | `{ paused: true }` |
| POST | /api/v2/forge/sessions/:sessionId/resume | Resume session | - | `{ resumed: true }` |
| POST | /api/v2/forge/sessions/:sessionId/terminate | Terminate session | - | `{ terminated: true }` |
| GET | /api/v2/forge/sessions | List Forge sessions | `?status&project_root` | `{ sessions: ForgeSession[] }` |
| GET | /api/v2/forge/sessions/:sessionId | Get session details | - | `ForgeSession` |
| GET | /api/v2/forge/sessions/:sessionId/children | Get child sessions | - | `{ children: ForgeSession[] }` |
| GET | /api/v2/forge/sessions/:sessionId/tree | Get full session tree | - | `{ tree: SessionTreeNode }` |
| POST | /api/v2/forge/sessions/:sessionId/connect | Register client connection | `{ client_type: 'vscode' \| 'browser', client_id }` | `{ connected: true }` |
| POST | /api/v2/forge/sessions/:sessionId/disconnect | Unregister client | `{ client_type, client_id }` | `{ disconnected: true }` |

---

### WebSocketRoutes.ts

Handles WebSocket upgrade and subscription management for real-time communication.

```typescript
// Location: src/services/worker/http/routes/WebSocketRoutes.ts

import express, { Request, Response } from 'express';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { BaseRouteHandler } from '../BaseRouteHandler.js';
import { WebSocketHub } from '../../forge/WebSocketHub.js';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'agent_change' | 'session_update' | 'behavior_update';
  payload: unknown;
  timestamp?: number;
}

interface SubscriptionRequest {
  channel: 'changes' | 'sessions' | 'behaviors' | 'planning' | 'all';
  filters?: {
    project_id?: string;
    session_id?: string;
  };
}

export class WebSocketRoutes extends BaseRouteHandler {
  constructor(
    private wsHub: WebSocketHub
  ) {
    super();
  }

  setupRoutes(app: express.Application): void {
    // WebSocket status (HTTP endpoints for management)
    app.get('/api/v2/forge/ws/status', this.handleWsStatus.bind(this));
    app.get('/api/v2/forge/ws/clients', this.handleListClients.bind(this));

    // Note: Actual WebSocket upgrade is handled at server level via wsHub.attachToServer()
    // These endpoints are for HTTP-based management only
  }

  /**
   * Attach WebSocket server to HTTP server
   * Called by WorkerService after server.listen()
   */
  attachWebSocket(httpServer: http.Server): void {
    this.wsHub.attachToServer(httpServer, '/api/v2/forge/live');
  }
}
```

**WebSocket Protocol:**

```typescript
// Client -> Server messages
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'change_decision';
  id?: string;           // Message ID for acknowledgment
  payload: {
    channel?: string;    // For subscribe/unsubscribe
    filters?: object;    // For subscribe
    change_id?: string;  // For change_decision
    hunk_index?: number; // For change_decision
    decision?: 'accepted' | 'rejected';  // For change_decision
  };
}

// Server -> Client messages
interface ServerMessage {
  type: 'ack' | 'pong' | 'agent_change' | 'session_update' | 'behavior_update' |
        'planning_update' | 'error';
  id?: string;           // Matches request ID for acks
  timestamp: number;
  payload: unknown;
}

// Event payloads
interface AgentChangePayload {
  change_id: string;
  session_id: string;
  file_path: string;
  agent: string;
  hunks: ChangeHunk[];
  status: 'pending' | 'partial' | 'resolved';
}

interface SessionUpdatePayload {
  session_id: string;
  status: 'active' | 'paused' | 'terminated';
  project_root: string;
  clients_connected: number;
}

interface BehaviorUpdatePayload {
  behavior_id: number;
  project_id: string;
  behavior_type: string;
  pattern_key: string;
  pattern_value: string;
  confidence: number;
}
```

---

### PlanningRoutes.ts

Handles planning documents, decisions, pipelines, and capability gaps.

```typescript
// Location: src/services/worker/http/routes/PlanningRoutes.ts

import express, { Request, Response } from 'express';
import { BaseRouteHandler } from '../BaseRouteHandler.js';
import { DatabaseManager } from '../../DatabaseManager.js';

interface PlanningDecision {
  id: string;
  project_id: string;
  release_id: string;
  agent: string;
  phase: string;
  category: string;
  title: string;
  description?: string;
  decision_value: string;
  decision_score?: number;
  alternatives?: Alternative[];
  status: 'pending' | 'locked' | 'user_override' | 'inherited';
  original_value?: string;
  override_rationale?: string;
  branch_id: string;
  created_at: string;
  locked_at?: string;
  locked_by?: string;
}

interface PipelineState {
  id: number;
  project_id: string;
  release_id: string;
  pipeline_type: 'greenfield' | 'brownfield';
  current_command: string;
  current_phase: string;
  current_step?: number;
  session_name?: string;
  session_id?: string;
  is_resumable: boolean;
  started_at: string;
  updated_at: string;
  completed_at?: string;
  decisions_count: number;
  artifacts_generated?: string[];
}

export class PlanningRoutes extends BaseRouteHandler {
  constructor(
    private dbManager: DatabaseManager,
    private planningService: PlanningService
  ) {
    super();
  }

  setupRoutes(app: express.Application): void {
    // Pipeline state
    app.get('/api/v2/forge/planning/pipeline', this.handleGetPipeline.bind(this));
    app.post('/api/v2/forge/planning/pipeline', this.handleCreatePipeline.bind(this));
    app.put('/api/v2/forge/planning/pipeline/:id', this.handleUpdatePipeline.bind(this));

    // Decisions
    app.get('/api/v2/forge/planning/decisions', this.handleListDecisions.bind(this));
    app.get('/api/v2/forge/planning/decisions/:id', this.handleGetDecision.bind(this));
    app.post('/api/v2/forge/planning/decisions/:id/lock', this.handleLockDecision.bind(this));
    app.post('/api/v2/forge/planning/decisions/:id/unlock', this.handleUnlockDecision.bind(this));
    app.post('/api/v2/forge/planning/decisions/:id/override', this.handleOverrideDecision.bind(this));

    // Decision branches
    app.get('/api/v2/forge/planning/branches', this.handleListBranches.bind(this));
    app.post('/api/v2/forge/planning/branches', this.handleCreateBranch.bind(this));
    app.post('/api/v2/forge/planning/branches/:id/activate', this.handleActivateBranch.bind(this));
    app.post('/api/v2/forge/planning/branches/:id/merge', this.handleMergeBranch.bind(this));

    // Templates
    app.get('/api/v2/forge/planning/templates', this.handleListTemplates.bind(this));
    app.get('/api/v2/forge/planning/templates/:id', this.handleGetTemplate.bind(this));

    // Capability gaps
    app.get('/api/v2/forge/planning/gaps', this.handleListGaps.bind(this));
    app.post('/api/v2/forge/planning/gaps/:id/acknowledge', this.handleAcknowledgeGap.bind(this));
    app.post('/api/v2/forge/planning/gaps/:id/dismiss', this.handleDismissGap.bind(this));
    app.post('/api/v2/forge/planning/gaps/:id/implement', this.handleImplementGap.bind(this));
  }
}
```

**Endpoint Definitions:**

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | /api/v2/forge/planning/pipeline | Get pipeline state | `?project_id&release_id` | `PipelineState` |
| POST | /api/v2/forge/planning/pipeline | Create pipeline | `{ project_id, release_id, pipeline_type }` | `PipelineState` |
| PUT | /api/v2/forge/planning/pipeline/:id | Update pipeline | `{ current_phase?, current_step? }` | `PipelineState` |
| GET | /api/v2/forge/planning/decisions | List decisions | `?project_id&release_id&phase&status&branch_id` | `{ decisions: PlanningDecision[] }` |
| POST | /api/v2/forge/planning/decisions/:id/lock | Lock decision | - | `{ locked: true }` |
| POST | /api/v2/forge/planning/decisions/:id/override | Override decision | `{ new_value, rationale }` | `PlanningDecision` |
| GET | /api/v2/forge/planning/branches | List decision branches | `?project_id&release_id` | `{ branches: DecisionBranch[] }` |
| POST | /api/v2/forge/planning/branches | Create branch | `{ name, description }` | `DecisionBranch` |
| GET | /api/v2/forge/planning/gaps | List capability gaps | `?project_id&status&priority` | `{ gaps: CapabilityGap[] }` |
| POST | /api/v2/forge/planning/gaps/:id/dismiss | Dismiss gap | `{ reason? }` | `{ dismissed: true }` |

---

## SessionBridge Service

### Architecture

The SessionBridge service manages the relationship between external terminal Claude Code sessions and VS Code/browser clients. It serves as the central coordinator for the terminal-to-editor bridge functionality.

```typescript
// Location: src/services/worker/forge/SessionBridge.ts

import { EventEmitter } from 'events';
import { DatabaseManager } from '../DatabaseManager.js';
import { WebSocketHub } from './WebSocketHub.js';
import { logger } from '../../../utils/logger.js';

interface BridgeSession {
  id: number;
  session_id: string;              // Claude Code content session ID
  terminal_pid?: number;
  terminal_type?: string;
  project_root: string;
  parent_session_id?: string;      // For nested agent sessions
  status: SessionStatus;
  vscode_connected: boolean;
  browser_connected: boolean;
  vscode_client_ids: Set<string>;
  browser_client_ids: Set<string>;
  started_at: Date;
  ended_at?: Date;
  last_heartbeat: Date;
}

type SessionStatus = 'active' | 'paused' | 'terminated';

interface SessionRegistration {
  session_id: string;
  terminal_pid?: number;
  terminal_type?: string;
  project_root: string;
  parent_session_id?: string;
}

export class SessionBridge extends EventEmitter {
  private sessions: Map<string, BridgeSession> = new Map();
  private dbManager: DatabaseManager;
  private wsHub: WebSocketHub;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Configurable timeouts
  private readonly HEARTBEAT_CHECK_INTERVAL = 30000;  // 30 seconds
  private readonly SESSION_TIMEOUT = 300000;          // 5 minutes without heartbeat

  constructor(dbManager: DatabaseManager, wsHub: WebSocketHub) {
    super();
    this.dbManager = dbManager;
    this.wsHub = wsHub;
    this.startHeartbeatChecker();
  }

  /**
   * Register a new session from external terminal
   */
  async registerSession(registration: SessionRegistration): Promise<BridgeSession> {
    // Check for existing session
    const existing = this.sessions.get(registration.session_id);
    if (existing && existing.status !== 'terminated') {
      // Update heartbeat and return existing
      existing.last_heartbeat = new Date();
      return existing;
    }

    // Create new bridge session
    const session: BridgeSession = {
      id: await this.persistSession(registration),
      session_id: registration.session_id,
      terminal_pid: registration.terminal_pid,
      terminal_type: this.detectTerminalType(registration.terminal_type),
      project_root: registration.project_root,
      parent_session_id: registration.parent_session_id,
      status: 'active',
      vscode_connected: false,
      browser_connected: false,
      vscode_client_ids: new Set(),
      browser_client_ids: new Set(),
      started_at: new Date(),
      last_heartbeat: new Date()
    };

    this.sessions.set(registration.session_id, session);

    // Broadcast to interested clients
    this.wsHub.broadcast({
      type: 'session_update',
      payload: {
        session_id: session.session_id,
        status: session.status,
        project_root: session.project_root,
        clients_connected: 0
      }
    });

    logger.info('BRIDGE', 'Session registered', {
      sessionId: session.session_id,
      terminalType: session.terminal_type,
      projectRoot: session.project_root
    });

    return session;
  }

  /**
   * Connect a VS Code or browser client to a session
   */
  connectClient(
    sessionId: string,
    clientType: 'vscode' | 'browser',
    clientId: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (clientType === 'vscode') {
      session.vscode_connected = true;
      session.vscode_client_ids.add(clientId);
    } else {
      session.browser_connected = true;
      session.browser_client_ids.add(clientId);
    }

    this.updateSessionInDb(session);

    logger.debug('BRIDGE', 'Client connected', {
      sessionId,
      clientType,
      clientId,
      totalClients: session.vscode_client_ids.size + session.browser_client_ids.size
    });

    return true;
  }

  /**
   * Disconnect a client from a session
   */
  disconnectClient(
    sessionId: string,
    clientType: 'vscode' | 'browser',
    clientId: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (clientType === 'vscode') {
      session.vscode_client_ids.delete(clientId);
      session.vscode_connected = session.vscode_client_ids.size > 0;
    } else {
      session.browser_client_ids.delete(clientId);
      session.browser_connected = session.browser_client_ids.size > 0;
    }

    this.updateSessionInDb(session);
    return true;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): BridgeSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): BridgeSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'active');
  }

  /**
   * Get session tree (parent + children)
   */
  getSessionTree(sessionId: string): SessionTreeNode | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Find root
    let root = session;
    while (root.parent_session_id) {
      const parent = this.sessions.get(root.parent_session_id);
      if (!parent) break;
      root = parent;
    }

    // Build tree recursively
    return this.buildTreeNode(root);
  }

  private buildTreeNode(session: BridgeSession): SessionTreeNode {
    const children = Array.from(this.sessions.values())
      .filter(s => s.parent_session_id === session.session_id);

    return {
      session,
      children: children.map(c => this.buildTreeNode(c))
    };
  }

  /**
   * Update session status
   */
  async updateStatus(sessionId: string, status: SessionStatus): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = status;
    if (status === 'terminated') {
      session.ended_at = new Date();
    }

    await this.updateSessionInDb(session);

    this.wsHub.broadcast({
      type: 'session_update',
      payload: {
        session_id: sessionId,
        status,
        project_root: session.project_root,
        clients_connected: session.vscode_client_ids.size + session.browser_client_ids.size
      }
    });

    return true;
  }

  /**
   * Process heartbeat from terminal
   */
  heartbeat(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.last_heartbeat = new Date();
    return true;
  }

  /**
   * Detect terminal type from environment
   */
  private detectTerminalType(provided?: string): string {
    if (provided) return provided;

    // These would be set by the hook calling the API
    if (process.env.ITERM_SESSION_ID) return 'iTerm2';
    if (process.env.GHOSTTY_RESOURCES_DIR) return 'Ghostty';
    if (process.env.KITTY_PID) return 'Kitty';
    if (process.env.WEZTERM_PANE) return 'WezTerm';
    if (process.env.ALACRITTY_SOCKET) return 'Alacritty';
    if (process.env.TERM_PROGRAM) return process.env.TERM_PROGRAM;
    return 'unknown';
  }

  /**
   * Start periodic heartbeat check
   */
  private startHeartbeatChecker(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions) {
        if (session.status === 'active' &&
            now - session.last_heartbeat.getTime() > this.SESSION_TIMEOUT) {
          logger.warn('BRIDGE', 'Session timed out (no heartbeat)', { sessionId });
          this.updateStatus(sessionId, 'terminated');
        }
      }
    }, this.HEARTBEAT_CHECK_INTERVAL);
  }

  /**
   * Persist session to database
   */
  private async persistSession(registration: SessionRegistration): Promise<number> {
    // Implementation delegates to DatabaseManager
    // Returns the auto-generated ID
    return 0; // Placeholder
  }

  /**
   * Update session in database
   */
  private async updateSessionInDb(session: BridgeSession): Promise<void> {
    // Implementation delegates to DatabaseManager
  }

  /**
   * Shutdown bridge (cleanup)
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.sessions.clear();
  }
}

interface SessionTreeNode {
  session: BridgeSession;
  children: SessionTreeNode[];
}
```

### State Machine

```
                    +-------------+
                    |             |
         register   |   ACTIVE    |<------ heartbeat (refreshes timeout)
        +---------->|             |
        |           +------+------+
        |                  |
        |          pause   |   terminate
        |          +-------+-------+
        |          |               |
        |          v               v
        |    +----------+    +------------+
        |    |          |    |            |
        |    |  PAUSED  |    | TERMINATED |
        |    |          |    |            |
        |    +----+-----+    +------------+
        |         |
        |  resume |
        |         |
        +---------+

State Transitions:
- ACTIVE -> PAUSED:     User/system pauses session
- PAUSED -> ACTIVE:     User/system resumes session
- ACTIVE -> TERMINATED: Session ends naturally, timeout, or explicit termination
- PAUSED -> TERMINATED: Session terminated while paused

Timeout Behavior:
- Sessions without heartbeat for 5 minutes transition to TERMINATED
- VS Code extension sends heartbeat every 30 seconds when connected
- External terminal hook sends heartbeat on activity
```

---

## WebSocket Architecture

### Protocol Design

```typescript
// Location: src/services/worker/forge/WebSocketHub.ts

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { logger } from '../../../utils/logger.js';

interface Client {
  id: string;
  type: 'vscode' | 'browser' | 'unknown';
  ws: WebSocket;
  subscriptions: Set<string>;
  connectedAt: Date;
  lastPing: Date;
}

interface BroadcastMessage {
  type: string;
  payload: unknown;
  targetChannels?: string[];
  timestamp?: number;
}

export class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();

  // Protocol version for client compatibility
  private readonly PROTOCOL_VERSION = '1.0';

  // Heartbeat configuration
  private readonly PING_INTERVAL = 30000;       // 30 seconds
  private readonly PING_TIMEOUT = 10000;        // 10 seconds to respond
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Attach WebSocket server to existing HTTP server
   */
  attachToServer(httpServer: HttpServer, path: string = '/api/v2/forge/live'): void {
    this.wss = new WebSocketServer({
      server: httpServer,
      path,
      // Enable per-message deflate for compression
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 6
        }
      }
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.startPingInterval();

    logger.info('WEBSOCKET', 'WebSocket hub attached', { path });
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: any): void {
    const clientId = req.headers['x-client-id'] as string || this.generateClientId();
    const clientType = req.headers['x-client-type'] as string || 'unknown';

    const client: Client = {
      id: clientId,
      type: clientType as Client['type'],
      ws,
      subscriptions: new Set(['all']),  // Subscribe to 'all' by default
      connectedAt: new Date(),
      lastPing: new Date()
    };

    this.clients.set(clientId, client);

    // Send welcome message with protocol version
    this.sendToClient(client, {
      type: 'connected',
      payload: {
        clientId,
        protocolVersion: this.PROTOCOL_VERSION,
        serverTime: Date.now()
      }
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        this.sendToClient(client, {
          type: 'error',
          payload: { message: 'Invalid JSON' }
        });
      }
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      logger.debug('WEBSOCKET', 'Client disconnected', { clientId });
    });

    ws.on('pong', () => {
      client.lastPing = new Date();
    });

    logger.debug('WEBSOCKET', 'Client connected', {
      clientId,
      clientType,
      totalClients: this.clients.size
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(client: Client, message: any): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message);
        break;

      case 'unsubscribe':
        this.handleUnsubscribe(client, message);
        break;

      case 'ping':
        this.sendToClient(client, { type: 'pong', payload: {} });
        break;

      case 'change_decision':
        this.handleChangeDecision(client, message);
        break;

      default:
        this.sendToClient(client, {
          type: 'error',
          payload: { message: `Unknown message type: ${message.type}` }
        });
    }
  }

  /**
   * Handle subscription request
   */
  private handleSubscribe(client: Client, message: any): void {
    const channel = message.payload?.channel;
    if (!channel) {
      this.sendToClient(client, {
        type: 'error',
        id: message.id,
        payload: { message: 'Missing channel in subscribe' }
      });
      return;
    }

    client.subscriptions.add(channel);

    this.sendToClient(client, {
      type: 'ack',
      id: message.id,
      payload: { subscribed: channel }
    });
  }

  /**
   * Handle unsubscription request
   */
  private handleUnsubscribe(client: Client, message: any): void {
    const channel = message.payload?.channel;
    if (channel) {
      client.subscriptions.delete(channel);
    }

    this.sendToClient(client, {
      type: 'ack',
      id: message.id,
      payload: { unsubscribed: channel }
    });
  }

  /**
   * Handle change decision from VS Code
   */
  private handleChangeDecision(client: Client, message: any): void {
    const { change_id, hunk_index, decision } = message.payload || {};

    // Emit event for ChangeTracker to handle
    this.emit('change_decision', { change_id, hunk_index, decision, client_id: client.id });

    this.sendToClient(client, {
      type: 'ack',
      id: message.id,
      payload: { processed: true }
    });
  }

  /**
   * Broadcast message to subscribed clients
   */
  broadcast(message: BroadcastMessage): void {
    const channels = message.targetChannels || ['all'];
    const data = JSON.stringify({
      ...message,
      timestamp: Date.now()
    });

    let sentCount = 0;
    for (const client of this.clients.values()) {
      // Check if client is subscribed to any target channel
      const isSubscribed = channels.some(ch =>
        client.subscriptions.has(ch) || client.subscriptions.has('all')
      );

      if (isSubscribed && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
        sentCount++;
      }
    }

    logger.debug('WEBSOCKET', 'Broadcast sent', {
      type: message.type,
      channels,
      sentCount,
      totalClients: this.clients.size
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: Client, message: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Start ping/pong interval for connection health
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();

      for (const [clientId, client] of this.clients) {
        // Check for timeout
        if (now - client.lastPing.getTime() > this.PING_INTERVAL + this.PING_TIMEOUT) {
          logger.warn('WEBSOCKET', 'Client ping timeout, closing', { clientId });
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }

        // Send ping
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      }
    }, this.PING_INTERVAL);
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client info for management endpoint
   */
  getClientInfo(): ClientInfo[] {
    return Array.from(this.clients.values()).map(c => ({
      id: c.id,
      type: c.type,
      subscriptions: Array.from(c.subscriptions),
      connectedAt: c.connectedAt.toISOString(),
      lastPing: c.lastPing.toISOString()
    }));
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown hub
   */
  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    for (const client of this.clients.values()) {
      client.ws.close(1000, 'Server shutdown');
    }

    this.clients.clear();

    if (this.wss) {
      this.wss.close();
    }
  }

  // EventEmitter inheritance for internal events
  private listeners: Map<string, Function[]> = new Map();

  emit(event: string, data: any): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(h => h(data));
  }

  on(event: string, handler: Function): void {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }
}

interface ClientInfo {
  id: string;
  type: string;
  subscriptions: string[];
  connectedAt: string;
  lastPing: string;
}
```

### Event Types and Payloads

| Event Type | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `connected` | S->C | `{ clientId, protocolVersion, serverTime }` | Initial connection acknowledgment |
| `ack` | S->C | `{ ... }` | Acknowledgment of client request |
| `pong` | S->C | `{}` | Response to ping |
| `error` | S->C | `{ message }` | Error response |
| `agent_change` | S->C | `AgentChangePayload` | New or updated agent change |
| `session_update` | S->C | `SessionUpdatePayload` | Session status change |
| `behavior_update` | S->C | `BehaviorUpdatePayload` | New learned behavior |
| `planning_update` | S->C | `PlanningUpdatePayload` | Pipeline or decision change |
| `subscribe` | C->S | `{ channel, filters? }` | Subscribe to event channel |
| `unsubscribe` | C->S | `{ channel }` | Unsubscribe from channel |
| `ping` | C->S | `{}` | Client-initiated ping |
| `change_decision` | C->S | `{ change_id, hunk_index, decision }` | Accept/reject hunk |

### Connection Lifecycle

```
Client                                     Server
   |                                          |
   |--- HTTP Upgrade /api/v2/forge/live ----->|
   |                                          |
   |<---------- 101 Switching Protocols ------|
   |                                          |
   |<---------- connected { clientId } -------|
   |                                          |
   |--- subscribe { channel: 'changes' } ---->|
   |<---------- ack { subscribed } -----------|
   |                                          |
   |                    ... time passes ...   |
   |                                          |
   |<---------- agent_change { ... } ---------|
   |                                          |
   |--- change_decision { accepted } -------->|
   |<---------- ack { processed } ------------|
   |                                          |
   |<---------- ping --------------------------|
   |--- pong --------------------------------->|
   |                                          |
   |--- close -------------------------------->|
   |<---------- close ------------------------|
```

### Reconnection Strategy

The VS Code extension should implement exponential backoff reconnection:

```typescript
// Recommended client-side reconnection logic
class ForgeWebSocketClient {
  private reconnectDelay = 1000;  // Start at 1 second
  private maxDelay = 30000;       // Max 30 seconds
  private reconnectAttempts = 0;

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private onConnect(): void {
    this.reconnectAttempts = 0;  // Reset on successful connection
  }
}
```

### Backpressure Handling

```typescript
// Server-side backpressure monitoring
private checkBackpressure(client: Client): boolean {
  // WebSocket bufferedAmount indicates queued data
  if (client.ws.bufferedAmount > 1024 * 1024) {  // 1MB threshold
    logger.warn('WEBSOCKET', 'Client backpressure detected', {
      clientId: client.id,
      bufferedAmount: client.ws.bufferedAmount
    });
    return true;  // Skip sending to this client
  }
  return false;
}
```

---

## Backward Compatibility

### Impact on Existing API Clients

| Existing Endpoint | Impact | Notes |
|-------------------|--------|-------|
| `/api/sessions/*` | None | Unchanged |
| `/api/observations` | None | Unchanged |
| `/api/search/*` | None | Unchanged |
| `/api/settings` | None | Unchanged |
| `/stream` (SSE) | None | SSE continues working alongside WebSocket |
| `/health` | None | Unchanged |

### API Versioning Strategy

All new Forge endpoints use `/api/v2/forge/*` prefix:

1. **v1 endpoints** (current): `/api/*` - Unchanged, fully backward compatible
2. **v2 endpoints** (Forge): `/api/v2/forge/*` - New functionality

This allows:
- Existing clients to continue working without modification
- New clients to explicitly opt into v2 APIs
- Future breaking changes to create `/api/v3/*` if needed

### Rate Limiting for New Endpoints

New Forge endpoints should implement rate limiting to prevent abuse:

```typescript
// Location: src/services/worker/http/middleware.ts

import rateLimit from 'express-rate-limit';

export const forgeRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 100,             // 100 requests per minute per IP
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to all /api/v2/forge/* routes
app.use('/api/v2/forge', forgeRateLimiter);
```

### Migration Path

Existing claude-mem installations can adopt Forge incrementally:

1. **Phase 1**: Database migrations add new tables (no impact on existing)
2. **Phase 2**: New route files registered (existing routes unchanged)
3. **Phase 3**: VS Code extension connects via WebSocket (SSE still works)
4. **Phase 4**: Hooks enhanced to call bridge registration (existing flow unchanged if bridge unavailable)

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| WebSocket connection instability | Medium | Medium | Implement robust reconnection with exponential backoff; keep SSE as fallback |
| Session state divergence | High | Low | Use database as source of truth; in-memory state is cache only |
| Performance degradation from new routes | Medium | Low | Profile endpoints; use database indexes; consider caching for read-heavy operations |
| Breaking changes to existing clients | High | Very Low | API versioning with v2 prefix; all existing endpoints unchanged |
| Memory leaks from orphaned sessions | Medium | Medium | Heartbeat timeout mechanism; periodic cleanup job |
| WebSocket backpressure causing dropped messages | Medium | Low | Monitor bufferedAmount; implement message queuing with backoff |
| Database schema migrations fail | High | Low | Transactional migrations; test rollback procedures |
| Terminal detection false positives | Low | Medium | Conservative detection; allow manual override in settings |
| Nested session tracking complexity | Medium | Medium | Limit nesting depth; clear parent/child relationship rules |

---

## Recommendations

### Priority 1: Critical Path

1. **Database migrations first** - Add all Forge tables before any route implementation
2. **WebSocketHub before SessionBridge** - Hub is a dependency for real-time features
3. **ForgeRoutes before PlanningRoutes** - Artifacts are the foundation for planning

### Priority 2: Implementation Order

1. Database schema (migrations)
2. WebSocketHub service
3. SessionBridge service
4. ForgeRoutes (artifacts)
5. TerminalRoutes (registration)
6. ForgeSessionRoutes (lifecycle)
7. WebSocketRoutes (management)
8. PlanningRoutes (planning features)

### Priority 3: Testing Strategy

1. **Unit tests** for each new service (SessionBridge, WebSocketHub)
2. **Integration tests** for route handlers
3. **E2E tests** for WebSocket protocol
4. **Load tests** for concurrent WebSocket connections
5. **Backward compatibility tests** for existing endpoints

### Priority 4: Monitoring

1. Add metrics for:
   - WebSocket connections (active, total, reconnects)
   - Message throughput (messages/second by type)
   - Session bridge registrations
   - API latency by endpoint
2. Alert on:
   - WebSocket connection errors > threshold
   - Session timeout rate increases
   - API error rate spikes

### Priority 5: Documentation

1. OpenAPI/Swagger spec for all new endpoints
2. WebSocket protocol documentation for VS Code extension developers
3. Migration guide for existing installations
4. Architecture decision records (ADRs) for key decisions
