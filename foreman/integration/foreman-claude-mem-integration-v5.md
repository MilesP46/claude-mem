# Foreman + Claude-Mem Integration Specification v5

## Executive Summary

v5 addresses the fundamental orchestration challenge: **Claude Code is ephemeral; the orchestrator must be persistent**. The claude-mem worker becomes the control plane that survives CLI restarts, enabling fully automatic artifact-triggered restarts and living planning documents that evolve with reality.

**Key Insight**: Hooks run inside Claude Code. If a hook triggers a restart, it kills itself. The solution is hook → worker notification → external orchestration.

---

## Part 1: Addressing the Open Questions

### Q1: Hook-based automatic restart without frontend intervention?

**Problem**: When Claude Code creates/updates an agent or command, the CLI needs to restart to pick up the change. v4 required frontend interaction. How do we make this automatic?

**Solution**: Three-component architecture.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE CLI (ephemeral)                                             │
│                                                                          │
│  PostToolUse Hook fires on Write/Edit                                    │
│       │                                                                  │
│       ▼                                                                  │
│  Detects artifact path:                                                  │
│    ~/.claude/agents/*.md  OR  .claude/agents/*.md                       │
│    ~/.claude/commands/*.md OR .claude/commands/*.md                      │
│       │                                                                  │
│       ▼                                                                  │
│  HTTP POST to worker:                                                    │
│    POST /api/orchestration/artifact-changed                              │
│    { session_id, artifact_path, change_type }                           │
│       │                                                                  │
└───────┼──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM WORKER (persistent - survives CLI restarts)                  │
│                                                                          │
│  Receives artifact-changed notification                                  │
│       │                                                                  │
│       ▼                                                                  │
│  1. Records session state (session_id, cwd, terminal PID)               │
│  2. Waits for CLI to reach safe point (next tool completion)            │
│  3. Sends graceful shutdown signal to CLI process                       │
│  4. CLI terminates                                                       │
│  5. Worker launches new CLI: `claude --resume {session_id}`             │
│       │                                                                  │
└───────┼──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  TERMINAL (user's choice OR embedded)                                    │
│                                                                          │
│  New Claude Code process starts                                          │
│  Conversation resumes from last message                                  │
│  New artifact is available                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hook Implementation**:

```typescript
// In PostToolUse hook
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  const { tool_name, tool_input, session_id } = input;

  // Only care about Write/Edit to artifact paths
  if (tool_name !== 'Write' && tool_name !== 'Edit') return;

  const filePath = tool_input.file_path;
  if (!isArtifactPath(filePath)) return;

  // Notify worker (fire and forget - don't block the stream)
  fetch('http://localhost:37777/api/orchestration/artifact-changed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      artifact_path: filePath,
      change_type: tool_name.toLowerCase(),
      pid: process.pid,
      cwd: process.cwd()
    })
  }).catch(() => {}); // Ignore errors - best effort

  // Continue normally - worker handles restart asynchronously
}

function isArtifactPath(path: string): boolean {
  const patterns = [
    /\.claude\/agents\/.*\.md$/,
    /\.claude\/commands\/.*\.md$/,
    /\.my_coding\/agents\/.*\.md$/,
    /\.my_coding\/commands\/.*\.md$/
  ];
  return patterns.some(p => p.test(path));
}
```

**Worker Orchestration**:

```typescript
// Worker endpoint
app.post('/api/orchestration/artifact-changed', async (req, res) => {
  const { session_id, artifact_path, pid, cwd } = req.body;

  // Record pending restart
  await db.run(`
    INSERT INTO pending_restarts (session_id, artifact_path, pid, cwd, requested_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `, [session_id, artifact_path, pid, cwd]);

  // Acknowledge immediately - don't block the hook
  res.json({ status: 'queued' });

  // Schedule restart after brief delay (let current operation complete)
  setTimeout(() => executeRestart(session_id, pid, cwd), 2000);
});

async function executeRestart(session_id: string, pid: number, cwd: string) {
  // 1. Send SIGTERM to Claude process
  try {
    process.kill(pid, 'SIGTERM');
  } catch (e) {
    // Process may have already exited
  }

  // 2. Wait for process to terminate
  await waitForProcessExit(pid, 5000);

  // 3. Launch new CLI with resume
  const terminalConfig = await getTerminalConfig();
  await launchInTerminal(terminalConfig, cwd, `claude --resume ${session_id}`);

  // 4. Record restart completed
  await db.run(`
    UPDATE pending_restarts SET completed_at = datetime('now')
    WHERE session_id = ?
  `, [session_id]);
}
```

**Key Design Decisions**:
- Hook is fire-and-forget (doesn't wait for restart)
- 2-second delay allows current operation to complete
- Graceful SIGTERM, not SIGKILL
- Worker tracks restart state for debugging

---

### Q2: Is embedded terminal doable?

**Answer**: Yes, using xterm.js + node-pty. Here's the architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM VIEWER (Browser)                                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  xterm.js Terminal Component                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐│    │
│  │  │ $ claude                                                    ││    │
│  │  │ > I'll help you implement that feature...                   ││    │
│  │  │ > [Reading src/api/users.ts]                                ││    │
│  │  │ > ...                                                       ││    │
│  │  │ █                                                           ││    │
│  │  └─────────────────────────────────────────────────────────────┘│    │
│  └───────────────────────────────────────────┬─────────────────────┘    │
│                                              │ WebSocket                 │
└──────────────────────────────────────────────┼──────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM WORKER                                                       │
│                                                                          │
│  WebSocket Server (/api/terminal/ws)                                     │
│       │                                                                  │
│       ▼                                                                  │
│  node-pty PTY Manager                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PTY Session 1: /bin/zsh (project: my-app)                       │    │
│  │  PTY Session 2: /bin/zsh (project: api-svc) [paused]            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Implementation Complexity Assessment**:

| Component | Effort | Risk | Notes |
|-----------|--------|------|-------|
| xterm.js integration | Medium | Low | Well-documented, many examples |
| node-pty setup | Medium | Medium | Platform-specific quirks |
| WebSocket streaming | Low | Low | Standard pattern |
| Resize handling | Low | Low | xterm.js handles this |
| Multi-session management | Medium | Medium | State management complexity |
| Shell environment inheritance | Medium | High | Ensuring Claude sees user's env |
| Reconnection handling | Medium | Medium | Browser refresh, network issues |

**Total Estimate**: 2-3 weeks for solid implementation.

**Trade-offs**:

| Embedded Terminal | External Terminal |
|-------------------|-------------------|
| Single pane of glass | Context switching |
| Full control over restart | Relies on OS automation |
| Works identically cross-platform | Platform-specific scripts |
| More complex codebase | Simpler codebase |
| User learns new interface | User keeps familiar terminal |

**Recommendation**: Implement as optional. Default to external terminal, offer embedded as power-user feature.

```json
// settings.json
{
  "terminal": {
    "mode": "external",  // "external" | "embedded"
    "external": {
      "app": "iTerm",
      "new_window": true
    },
    "embedded": {
      "shell": "/bin/zsh",
      "font_size": 14,
      "scrollback": 10000
    }
  }
}
```

---

### Q3 & Q4: Living planning documents that stay in sync?

**Problem**: Planning documents (issue YAMLs, release specs) are created upfront. Reality diverges as implementation proceeds. How do we:
1. Know when docs need updating?
2. Keep them as accurate single-source-of-truth?

**Solution**: Plan-Reality Reconciliation Engine.

**Detection Mechanisms**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DETECTION: When do planning docs need updates?                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. ISSUE COMPLETION                                                     │
│     ─────────────────                                                    │
│     When: Issue marked done (label change or PR merge)                   │
│     Check: Compare planned scope vs actual changes                       │
│     Detect: Files touched outside planned folders                        │
│             Endpoints created beyond spec                                │
│             Dependencies added not in plan                               │
│                                                                          │
│  2. OBSERVATION DRIFT                                                    │
│     ─────────────────                                                    │
│     When: Continuous (background analysis)                               │
│     Check: Observations mentioning issue vs issue YAML                   │
│     Detect: Decisions made that contradict plan                          │
│             Scope changes discussed in session                           │
│             Error patterns indicating plan gaps                          │
│                                                                          │
│  3. EXPLICIT TRIGGERS                                                    │
│     ─────────────────                                                    │
│     When: User says "scope changed" or "we added X"                      │
│     Check: Parse natural language for plan-relevant changes              │
│     Detect: New requirements, dropped features, pivots                   │
│                                                                          │
│  4. PR ANALYSIS                                                          │
│     ─────────────────                                                    │
│     When: PR created or merged                                           │
│     Check: PR diff vs issue YAML scope                                   │
│     Detect: Changes outside declared folders                             │
│             New files in unexpected locations                            │
│             Modified files not in plan                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Reconciliation Flow**:

```
Detection triggers
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ANALYSIS: What specifically changed?                                    │
│                                                                          │
│  Planned:                          Actual:                               │
│  ┌─────────────────────────┐      ┌─────────────────────────┐           │
│  │ folders: [src/api/users]│      │ Modified:                │           │
│  │ endpoints: [GET /users] │      │   src/api/users/index.ts│           │
│  │ deps: []                │      │   src/api/billing/tax.ts│  ← DRIFT  │
│  └─────────────────────────┘      │ New endpoint: POST /tax │  ← DRIFT  │
│                                   │ New dep: stripe-node    │  ← DRIFT  │
│                                   └─────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PROPOSAL: Auto-generate update suggestions                              │
│                                                                          │
│  Suggested changes to issue-042.yaml:                                    │
│                                                                          │
│  ```diff                                                                 │
│  scope:                                                                  │
│    folders:                                                              │
│      - src/api/users/                                                    │
│  +   - src/api/billing/                                                  │
│    endpoints:                                                            │
│      - GET /users                                                        │
│  +   - POST /tax                                                         │
│  + dependencies:                                                         │
│  +   - stripe-node                                                       │
│  ```                                                                     │
│                                                                          │
│  [Accept All] [Accept Selected] [Reject] [Edit Manually]                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  APPLICATION: Update planning docs                                       │
│                                                                          │
│  On accept:                                                              │
│  1. Update issue YAML file                                               │
│  2. Version the change (track history)                                   │
│  3. Update GitHub issue if linked                                        │
│  4. Re-index in claude-mem                                               │
│  5. Log reconciliation in observations                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data Model for Reconciliation**:

```sql
-- Track plan versions
CREATE TABLE planning_doc_versions (
  id INTEGER PRIMARY KEY,
  doc_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_reason TEXT,  -- 'initial' | 'manual_edit' | 'reconciliation'
  change_source TEXT,  -- observation_id or 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doc_id) REFERENCES foreman_planning_docs(id)
);

-- Track detected drift
CREATE TABLE plan_drift_events (
  id INTEGER PRIMARY KEY,
  doc_id INTEGER NOT NULL,
  detection_type TEXT NOT NULL,  -- 'completion' | 'observation' | 'pr' | 'explicit'
  drift_details JSON NOT NULL,   -- What specifically diverged
  suggested_changes JSON,        -- Proposed updates
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'partial'
  resolved_at TIMESTAMP,
  resolved_by TEXT,  -- 'user' | 'auto'

  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doc_id) REFERENCES foreman_planning_docs(id)
);

-- Link observations to plans for drift detection
CREATE TABLE observation_plan_links (
  observation_id INTEGER NOT NULL,
  doc_id INTEGER NOT NULL,
  relevance_score REAL,  -- How relevant is this observation to this plan
  drift_indicator BOOLEAN DEFAULT FALSE,  -- Does this suggest drift?

  PRIMARY KEY (observation_id, doc_id)
);
```

**Continuous Monitoring**:

```typescript
// Background job in worker
async function monitorPlanDrift() {
  const activeDocs = await db.all(`
    SELECT * FROM foreman_planning_docs
    WHERE generation_status = 'approved'
    AND doc_type IN ('issue-yaml', 'release-spec')
  `);

  for (const doc of activeDocs) {
    // Get recent observations for this project
    const observations = await db.all(`
      SELECT o.* FROM observations o
      JOIN observation_plan_links opl ON o.id = opl.observation_id
      WHERE opl.doc_id = ?
      AND o.created_at > ?
    `, [doc.id, doc.updated_at]);

    // Analyze for drift indicators
    const drift = await analyzeDrift(doc, observations);

    if (drift.detected) {
      await db.run(`
        INSERT INTO plan_drift_events (doc_id, detection_type, drift_details, suggested_changes)
        VALUES (?, 'observation', ?, ?)
      `, [doc.id, JSON.stringify(drift.details), JSON.stringify(drift.suggestions)]);

      // Notify user via viewer
      await notifyDriftDetected(doc, drift);
    }
  }
}

// Run every 5 minutes
setInterval(monitorPlanDrift, 5 * 60 * 1000);
```

---

## Part 2: Unified v5 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                        │
│                                │                                         │
│              ┌─────────────────┼─────────────────┐                      │
│              ▼                 ▼                 ▼                       │
│    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │
│    │ External Term   │ │ Embedded Term   │ │ Viewer UI       │          │
│    │ (iTerm, etc.)   │ │ (xterm.js)      │ │ (React)         │          │
│    └────────┬────────┘ └────────┬────────┘ └────────┬────────┘          │
│             │                   │                   │                    │
└─────────────┼───────────────────┼───────────────────┼────────────────────┘
              │                   │                   │
              │    ┌──────────────┴───────────────────┘
              │    │
              ▼    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM WORKER (persistent orchestrator)                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ORCHESTRATION ENGINE                                            │    │
│  │  • Session registry (active CLIs, PIDs, states)                 │    │
│  │  • Restart queue (pending, in-progress, completed)              │    │
│  │  • Terminal launcher (external or PTY management)               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  RECONCILIATION ENGINE                                           │    │
│  │  • Drift detection (completion, observation, PR, explicit)      │    │
│  │  • Change proposal generation                                    │    │
│  │  • Version management                                            │    │
│  │  • GitHub sync                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CONTEXT ENGINE (from v3/v4)                                     │    │
│  │  • Local context persistence                                     │    │
│  │  • Label-based rule injection                                    │    │
│  │  • Pattern detection → duo candidates                           │    │
│  │  • Agent refinement loop                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DATA LAYER                                                      │    │
│  │  • SQLite: sessions, artifacts, plans, drift, observations      │    │
│  │  • Chroma: semantic search                                       │    │
│  │  • Filesystem: source of truth for artifacts                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
              ▲
              │ Hooks (HTTP notifications)
              │
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE CLI (ephemeral)                                             │
│                                                                          │
│  Hooks fire on:                                                          │
│  • SessionStart → Register session with worker                          │
│  • PostToolUse → Notify artifact changes, capture observations          │
│  • SessionEnd → Deregister session                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Implementation Phases

### Phase 1: Automatic Restart Infrastructure

**Goal**: Artifact changes trigger automatic CLI restart without frontend.

**Deliverables**:
1. Hook detection for artifact writes
2. Worker orchestration endpoint
3. Session registry
4. External terminal restart (platform-specific)
5. Resume verification

**Validation**: Create agent via CLI → CLI restarts → conversation continues → agent available.

### Phase 2: Embedded Terminal (Optional)

**Goal**: Single-pane-of-glass option for power users.

**Deliverables**:
1. xterm.js integration in viewer
2. node-pty PTY manager in worker
3. WebSocket streaming
4. Multi-session tabs
5. Resize handling

**Validation**: User can run full Claude session in browser.

### Phase 3: Plan Drift Detection

**Goal**: Know when planning docs are stale.

**Deliverables**:
1. Completion-based drift detection
2. Observation-based drift detection
3. PR-based drift detection
4. Drift event storage

**Validation**: Complete an issue with scope creep → system flags drift.

### Phase 4: Plan Reconciliation

**Goal**: Update planning docs to match reality.

**Deliverables**:
1. Change proposal generation
2. Diff preview UI
3. Accept/reject workflow
4. Version history
5. GitHub issue sync

**Validation**: Accept proposed changes → YAML updated → GitHub issue updated.

### Phase 5: Context Engine (from v3/v4)

**Goal**: Intelligent context injection.

**Deliverables**:
1. Local context persistence
2. Label-based rules
3. Pattern detection
4. Agent refinement

**Validation**: Agent receives locally-cached context + historical guidance.

---

## Part 4: Hook Specifications

### SessionStart Hook Enhancement

```typescript
async function sessionStartHook(input: SessionStartInput): Promise<void> {
  const { session_id, cwd } = input;

  // Register session with worker
  await fetch('http://localhost:37777/api/sessions/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      cwd,
      pid: process.pid,
      started_at: new Date().toISOString()
    })
  });

  // Continue with normal context injection...
}
```

### PostToolUse Hook Enhancement

```typescript
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  const { tool_name, tool_input, tool_result, session_id } = input;

  // Existing observation capture...

  // NEW: Check for artifact changes
  if ((tool_name === 'Write' || tool_name === 'Edit') && tool_input.file_path) {
    if (isArtifactPath(tool_input.file_path)) {
      // Notify worker - it handles restart
      fetch('http://localhost:37777/api/orchestration/artifact-changed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          artifact_path: tool_input.file_path,
          change_type: tool_name.toLowerCase()
        })
      }).catch(() => {});
    }
  }

  // NEW: Check for plan-relevant observations
  if (isPlanRelevant(tool_name, tool_result)) {
    fetch('http://localhost:37777/api/reconciliation/observation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id,
        tool_name,
        summary: extractSummary(tool_result),
        files_touched: extractFiles(tool_input, tool_result)
      })
    }).catch(() => {});
  }
}
```

### SessionEnd Hook

```typescript
async function sessionEndHook(input: SessionEndInput): Promise<void> {
  const { session_id } = input;

  // Deregister session
  await fetch('http://localhost:37777/api/sessions/deregister', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id })
  });

  // Trigger completion-based drift check if issue was being worked
  await fetch('http://localhost:37777/api/reconciliation/session-ended', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id })
  });
}
```

---

## Part 5: UI for Reconciliation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PLAN RECONCILIATION                                          [×]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️  Drift detected in issue-042.yaml                                   │
│                                                                          │
│  Detection: PR #87 merged with changes outside planned scope            │
│  Detected: 5 minutes ago                                                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PLANNED                        │  ACTUAL                        │    │
│  │  ─────────────────────────────  │  ─────────────────────────────│    │
│  │  folders:                       │  Files modified:               │    │
│  │    - src/api/users/             │    ✓ src/api/users/index.ts   │    │
│  │                                 │    ⚠ src/api/billing/tax.ts   │    │
│  │  endpoints:                     │                                │    │
│  │    - GET /users                 │  Endpoints:                    │    │
│  │                                 │    ✓ GET /users                │    │
│  │                                 │    ⚠ POST /api/tax             │    │
│  │  dependencies: []               │                                │    │
│  │                                 │  New dependencies:             │    │
│  │                                 │    ⚠ stripe-node               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  SUGGESTED UPDATES:                                                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ☑ Add folder: src/api/billing/                                 │    │
│  │  ☑ Add endpoint: POST /api/tax                                  │    │
│  │  ☑ Add dependency: stripe-node                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [Preview YAML] [Accept Selected] [Reject All] [Edit Manually]          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Also update GitHub Issue #42?  ☑ Yes                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: What v5 Adds Over v4

| Capability | v4 | v5 |
|------------|----|----|
| Session management | Frontend-triggered | Hook-triggered automatic |
| CLI restart | Manual from viewer | Automatic on artifact change |
| Embedded terminal | Not specified | Optional, fully spec'd |
| Plan updates | Manual | Auto-detected, user-approved |
| Drift detection | None | Multi-signal (completion, obs, PR) |
| Plan versioning | None | Full history |
| GitHub sync | Manual | Automatic with plan updates |

---

## Part 7: Success Metrics

1. **Restart Seamlessness**: 99%+ of artifact-triggered restarts succeed and resume
2. **Restart Latency**: <3 seconds from artifact save to resumed session
3. **Drift Detection Recall**: 90%+ of actual drifts detected
4. **Drift Detection Precision**: 80%+ of flagged drifts are real
5. **Reconciliation Adoption**: 70%+ of suggested updates accepted

---

## Part 8: What This Does NOT Do

1. **Does NOT auto-update plans without approval** - User always confirms
2. **Does NOT require embedded terminal** - External terminal fully supported
3. **Does NOT block on restart** - Hook fires and continues; restart is async
4. **Does NOT track every file change** - Only artifact paths trigger restart
5. **Does NOT replace Git** - Plan versions complement, don't replace VCS
