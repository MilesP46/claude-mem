# Foreman + Claude-Mem Integration Specification v6

## Executive Summary

v6 addresses critical gaps in v5's restart mechanism and introduces GitHub as a synchronized data layer rather than a live API dependency. Key refinements:

1. **Restart at prompt boundaries** - Not mid-response, not after arbitrary delay
2. **Subagent-aware restart queuing** - Track parent-child relationships, wait for subagent completion
3. **GitHub sync service** - Worker maintains cached GitHub state; CLI never calls GitHub directly
4. **Hook thinning** - Hooks become thin clients; worker does heavy lifting

**Core Insight**: The restart problem isn't "when was the artifact written?" but "when is the conversation at a safe boundary?" The GitHub problem isn't "how do we call the API?" but "how do we avoid calling it at all?"

---

## Part 1: Addressing the Open Questions

### Q1: Does restart consider chat completion?

**v5 Gap**: The 2-second delay after artifact write is naive. A response can take 30+ seconds. The artifact write might be step 1 of 5 in Claude's response.

**v6 Solution**: Restart at **prompt boundaries**, not tool boundaries.

```
Timeline of a typical response:

User prompt: "Create a billing API agent"
    │
    ▼
Claude response starts
    │
    ├── Tool: Read existing agents (context)
    │
    ├── Tool: Write billing-agent.md  ◄── Artifact written here
    │         │
    │         └── Hook fires, records "restart pending"
    │
    ├── Tool: Read the new file (verification)
    │
    ├── Text: "I've created the billing-agent.md with..."
    │
    └── Response complete
    │
    ▼
[SAFE RESTART POINT] ◄── Restart happens HERE, not at artifact write
    │
    ▼
User's next prompt OR idle timeout
```

**Implementation**:

```typescript
// Worker state
interface PendingRestart {
  main_session_id: string;
  artifact_path: string;
  triggered_at: Date;
  status: 'pending' | 'ready' | 'executing';
}

// PostToolUse hook - records intent, doesn't trigger restart
async function postToolUseHook(input: PostToolUseInput): Promise<void> {
  if (isArtifactWrite(input)) {
    await fetch('http://localhost:37777/api/orchestration/restart-pending', {
      method: 'POST',
      body: JSON.stringify({
        session_id: input.session_id,
        artifact_path: input.tool_input.file_path
      })
    });
    // Don't restart here - let response complete
  }
}

// UserPromptSubmit hook - checks for pending restart BEFORE processing
async function userPromptSubmitHook(input: UserPromptSubmitInput): Promise<void> {
  const pending = await fetch(
    `http://localhost:37777/api/orchestration/restart-pending/${input.session_id}`
  ).then(r => r.json());

  if (pending.should_restart) {
    // Signal user and restart
    console.log(JSON.stringify({
      result: 'block',
      message: `Restarting to load new artifact: ${pending.artifact_path}`
    }));

    // Worker will handle actual restart
    await fetch('http://localhost:37777/api/orchestration/execute-restart', {
      method: 'POST',
      body: JSON.stringify({ session_id: input.session_id })
    });

    // This process will be terminated; new one will resume
    return;
  }

  // No pending restart - continue normally
}
```

**The Flow**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ARTIFACT WRITE DETECTED                                                 │
│                                                                          │
│  PostToolUse hook fires                                                  │
│       │                                                                  │
│       ▼                                                                  │
│  Record in worker: "restart pending for session X"                       │
│       │                                                                  │
│       ▼                                                                  │
│  Continue response (don't restart yet)                                   │
│       │                                                                  │
│       ▼                                                                  │
│  Response completes naturally                                            │
│       │                                                                  │
│       ▼                                                                  │
│  User sees full output                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NEXT PROMPT SUBMITTED                                                   │
│                                                                          │
│  UserPromptSubmit hook fires                                             │
│       │                                                                  │
│       ▼                                                                  │
│  Check worker: "any pending restart for this session?"                   │
│       │                                                                  │
│       ├── No → Continue with prompt                                      │
│       │                                                                  │
│       └── Yes → Block prompt, execute restart                            │
│                      │                                                   │
│                      ▼                                                   │
│              Show message: "Restarting to load billing-agent.md..."      │
│                      │                                                   │
│                      ▼                                                   │
│              Worker terminates CLI, launches with --resume               │
│                      │                                                   │
│                      ▼                                                   │
│              New CLI starts, user's prompt is first input                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Edge Case: User doesn't send another prompt**

If user closes CLI without another prompt, that's fine:
- Artifact is saved to filesystem
- Next time user starts CLI, artifact is available
- No restart needed because it's a fresh session

**Edge Case: Multiple artifacts in one response**

If Claude writes 3 agents in one response:
- Each write records a pending restart
- Worker coalesces into single restart
- One restart loads all 3 artifacts

---

### Q2: Does it consider subagents?

**The Problem**: Claude's Task tool spawns subagents. If a subagent creates an artifact:

```
Main Session (abc123)
    │
    └── Spawns Subagent (def456) via Task tool
              │
              └── Subagent writes billing-agent.md
                        │
                        └── Hook fires... but for which session?
```

If we restart the main session immediately, we kill the subagent mid-work.

**v6 Solution**: Session hierarchy tracking with subagent-aware restart queuing.

**Data Model**:

```sql
CREATE TABLE session_hierarchy (
  session_id TEXT PRIMARY KEY,
  parent_session_id TEXT,  -- NULL for root sessions
  root_session_id TEXT,    -- Always points to top-level session
  status TEXT DEFAULT 'active',  -- 'active' | 'completed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  FOREIGN KEY (parent_session_id) REFERENCES session_hierarchy(session_id)
);

CREATE TABLE pending_restarts (
  id INTEGER PRIMARY KEY,
  root_session_id TEXT NOT NULL,  -- Always restart the root
  triggered_by_session TEXT NOT NULL,  -- Which session wrote the artifact
  artifact_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'ready' | 'executing' | 'completed'
  active_subagents INTEGER DEFAULT 0,  -- Count of running subagents
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP,

  FOREIGN KEY (root_session_id) REFERENCES session_hierarchy(session_id)
);
```

**Session Registration**:

```typescript
// SessionStart hook - register with hierarchy
async function sessionStartHook(input: SessionStartInput): Promise<void> {
  const { session_id, parent_session_id } = input;

  await fetch('http://localhost:37777/api/sessions/register', {
    method: 'POST',
    body: JSON.stringify({
      session_id,
      parent_session_id: parent_session_id || null,
      // Root is self if no parent, otherwise inherit from parent
      root_session_id: parent_session_id
        ? await getRootSession(parent_session_id)
        : session_id
    })
  });
}

// SessionEnd hook - mark completed, check restart readiness
async function sessionEndHook(input: SessionEndInput): Promise<void> {
  const { session_id } = input;

  const result = await fetch('http://localhost:37777/api/sessions/complete', {
    method: 'POST',
    body: JSON.stringify({ session_id })
  }).then(r => r.json());

  // Worker checks: is this session part of a hierarchy with pending restart?
  // If all subagents done AND restart pending → worker executes restart
}
```

**Restart Logic**:

```typescript
// Worker: handle artifact change notification
async function handleArtifactChanged(session_id: string, artifact_path: string) {
  const session = await db.get('SELECT * FROM session_hierarchy WHERE session_id = ?', session_id);
  const rootSessionId = session.root_session_id;

  // Count active subagents under root
  const activeCount = await db.get(`
    SELECT COUNT(*) as count FROM session_hierarchy
    WHERE root_session_id = ? AND status = 'active' AND session_id != ?
  `, [rootSessionId, rootSessionId]);

  // Record pending restart
  await db.run(`
    INSERT OR REPLACE INTO pending_restarts
    (root_session_id, triggered_by_session, artifact_path, active_subagents, status)
    VALUES (?, ?, ?, ?, 'pending')
  `, [rootSessionId, session_id, artifact_path, activeCount.count]);

  // If no active subagents, mark as ready
  if (activeCount.count === 0) {
    await db.run(`
      UPDATE pending_restarts SET status = 'ready' WHERE root_session_id = ?
    `, [rootSessionId]);
  }
}

// Worker: handle session completion
async function handleSessionComplete(session_id: string) {
  const session = await db.get('SELECT * FROM session_hierarchy WHERE session_id = ?', session_id);

  // Mark session completed
  await db.run(`
    UPDATE session_hierarchy SET status = 'completed', completed_at = datetime('now')
    WHERE session_id = ?
  `, [session_id]);

  // Check if there's a pending restart for this hierarchy
  const pending = await db.get(`
    SELECT * FROM pending_restarts
    WHERE root_session_id = ? AND status = 'pending'
  `, [session.root_session_id]);

  if (pending) {
    // Recalculate active subagents
    const activeCount = await db.get(`
      SELECT COUNT(*) as count FROM session_hierarchy
      WHERE root_session_id = ? AND status = 'active' AND session_id != ?
    `, [session.root_session_id, session.root_session_id]);

    if (activeCount.count === 0) {
      // All subagents done - mark restart as ready
      await db.run(`
        UPDATE pending_restarts SET status = 'ready', active_subagents = 0
        WHERE root_session_id = ?
      `, [session.root_session_id]);
    } else {
      // Update count
      await db.run(`
        UPDATE pending_restarts SET active_subagents = ?
        WHERE root_session_id = ?
      `, [activeCount.count, session.root_session_id]);
    }
  }
}
```

**Visual Flow**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MAIN SESSION (abc123)                                                   │
│                                                                          │
│  User: "Create billing and payments agents"                              │
│       │                                                                  │
│       ▼                                                                  │
│  Claude: "I'll create both agents using subagents for parallel work"     │
│       │                                                                  │
│       ├─────────────────────────────┐                                    │
│       ▼                             ▼                                    │
│  ┌─────────────┐              ┌─────────────┐                           │
│  │ Subagent 1  │              │ Subagent 2  │                           │
│  │ (def456)    │              │ (ghi789)    │                           │
│  │             │              │             │                           │
│  │ Writes:     │              │ Writes:     │                           │
│  │ billing.md  │              │ payments.md │                           │
│  │      │      │              │      │      │                           │
│  │      ▼      │              │      ▼      │                           │
│  │ Hook fires  │              │ Hook fires  │                           │
│  │ Restart     │              │ Restart     │                           │
│  │ queued for  │              │ queued for  │                           │
│  │ abc123      │              │ abc123      │                           │
│  │ (coalesced) │              │ (coalesced) │                           │
│  │             │              │             │                           │
│  │ Returns     │              │ Returns     │                           │
│  └──────┬──────┘              └──────┬──────┘                           │
│         │                            │                                   │
│         └────────────┬───────────────┘                                   │
│                      ▼                                                   │
│  Both subagents completed → Worker marks restart as 'ready'              │
│       │                                                                  │
│       ▼                                                                  │
│  Main session continues: "Both agents created. The billing agent..."     │
│       │                                                                  │
│       ▼                                                                  │
│  Response completes                                                      │
│       │                                                                  │
│       ▼                                                                  │
│  User sends next prompt                                                  │
│       │                                                                  │
│       ▼                                                                  │
│  UserPromptSubmit checks: restart ready? YES                             │
│       │                                                                  │
│       ▼                                                                  │
│  RESTART with both new agents available                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Q3 & Q4: GitHub API as synchronized data layer

**The Problem**: Every time an agent needs issue context, it calls GitHub API:
- Slow (network round-trip)
- Token-heavy (parsing API responses)
- Rate-limited
- Fails offline

**v6 Solution**: Worker maintains synchronized GitHub cache. CLI never calls GitHub directly.

**Architecture**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GITHUB                                                                  │
│       │                                                                  │
│       │ Webhooks (push)           Polling (pull, fallback)              │
│       │      │                           │                              │
│       ▼      ▼                           ▼                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  GITHUB SYNC SERVICE (in worker)                                 │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │    │
│  │  │ Webhook Handler │  │ Polling Service │  │ Cache Manager   │ │    │
│  │  │ POST /webhook   │  │ Every 30s       │  │ SQLite tables   │ │    │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │    │
│  │           │                    │                    │          │    │
│  │           └────────────────────┴────────────────────┘          │    │
│  │                               │                                 │    │
│  │                               ▼                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐   │    │
│  │  │  GITHUB CACHE                                            │   │    │
│  │  │  • issues: id, number, title, body, state, labels       │   │    │
│  │  │  • comments: id, issue_id, body, author, created_at     │   │    │
│  │  │  • pull_requests: id, number, state, head, base         │   │    │
│  │  │  • pr_reviews: id, pr_id, state, body                   │   │    │
│  │  └─────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    │ Local API                           │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CLAUDE CODE CLI                                                 │    │
│  │                                                                  │    │
│  │  Instead of:                    Now:                             │    │
│  │  mcp__github__get_issue(42)  →  GET /api/github/issues/42       │    │
│  │  (slow, token-heavy)            (fast, minimal tokens)           │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cache Schema**:

```sql
-- Cached GitHub issues
CREATE TABLE github_issues (
  id INTEGER PRIMARY KEY,  -- GitHub's ID
  repo TEXT NOT NULL,      -- "owner/repo"
  number INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  state TEXT,              -- 'open' | 'closed'
  labels JSON,             -- Array of label names
  assignees JSON,
  milestone TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(repo, number)
);

-- Cached comments
CREATE TABLE github_comments (
  id INTEGER PRIMARY KEY,  -- GitHub's ID
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  body TEXT,
  author TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (repo, issue_number) REFERENCES github_issues(repo, number)
);

-- Sync state tracking
CREATE TABLE github_sync_state (
  repo TEXT PRIMARY KEY,
  last_webhook_at TIMESTAMP,
  last_poll_at TIMESTAMP,
  etag TEXT,  -- For conditional requests
  status TEXT DEFAULT 'active'
);
```

**Worker API Endpoints**:

```typescript
// Get issue (from cache)
app.get('/api/github/issues/:number', async (req, res) => {
  const { number } = req.params;
  const repo = req.query.repo || getCurrentProjectRepo();

  const issue = await db.get(`
    SELECT * FROM github_issues WHERE repo = ? AND number = ?
  `, [repo, number]);

  if (!issue) {
    // Cache miss - fetch and cache
    const fetched = await fetchFromGitHub(`/repos/${repo}/issues/${number}`);
    await cacheIssue(repo, fetched);
    return res.json(fetched);
  }

  res.json(issue);
});

// Get comments (from cache)
app.get('/api/github/issues/:number/comments', async (req, res) => {
  const { number } = req.params;
  const repo = req.query.repo || getCurrentProjectRepo();

  const comments = await db.all(`
    SELECT * FROM github_comments
    WHERE repo = ? AND issue_number = ?
    ORDER BY created_at ASC
  `, [repo, number]);

  res.json(comments);
});

// Post comment (post to GitHub AND cache)
app.post('/api/github/issues/:number/comments', async (req, res) => {
  const { number } = req.params;
  const { body } = req.body;
  const repo = req.query.repo || getCurrentProjectRepo();

  // Post to GitHub
  const result = await postToGitHub(`/repos/${repo}/issues/${number}/comments`, { body });

  // Cache immediately
  await db.run(`
    INSERT INTO github_comments (id, repo, issue_number, body, author, created_at, cached_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `, [result.id, repo, number, body, result.user.login, result.created_at]);

  res.json(result);
});
```

**Webhook Handler**:

```typescript
// Receive GitHub webhooks
app.post('/api/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  switch (event) {
    case 'issues':
      await handleIssueEvent(payload);
      break;
    case 'issue_comment':
      await handleCommentEvent(payload);
      break;
    case 'pull_request':
      await handlePREvent(payload);
      break;
    case 'pull_request_review':
      await handleReviewEvent(payload);
      break;
  }

  res.status(200).send('OK');
});

async function handleCommentEvent(payload: any) {
  const { action, comment, issue, repository } = payload;
  const repo = repository.full_name;

  if (action === 'created' || action === 'edited') {
    await db.run(`
      INSERT OR REPLACE INTO github_comments
      (id, repo, issue_number, body, author, created_at, updated_at, cached_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      comment.id,
      repo,
      issue.number,
      comment.body,
      comment.user.login,
      comment.created_at,
      comment.updated_at
    ]);

    // Notify active sessions about the update
    await notifySessionsOfUpdate(repo, issue.number, 'comment', comment);
  }
}
```

### Q4a: GitHub API for agentic workflow facilitation

**Vision**: Worker proactively informs CLI of relevant GitHub events.

```typescript
// Worker maintains subscription list
interface GitHubSubscription {
  session_id: string;
  repo: string;
  issue_numbers: number[];  // Issues this session cares about
}

// When webhook arrives for a subscribed issue
async function notifySessionsOfUpdate(repo: string, issueNumber: number, type: string, data: any) {
  const subscriptions = await db.all(`
    SELECT session_id FROM github_subscriptions
    WHERE repo = ? AND issue_numbers LIKE ?
  `, [repo, `%${issueNumber}%`]);

  for (const sub of subscriptions) {
    // Queue context injection for next prompt
    await db.run(`
      INSERT INTO pending_context_injections (session_id, context_type, context_data)
      VALUES (?, 'github_update', ?)
    `, [sub.session_id, JSON.stringify({ repo, issueNumber, type, data })]);
  }
}

// UserPromptSubmit hook checks for pending context
async function userPromptSubmitHook(input: UserPromptSubmitInput): Promise<void> {
  const pending = await fetch(
    `http://localhost:37777/api/context/pending/${input.session_id}`
  ).then(r => r.json());

  if (pending.github_updates?.length > 0) {
    const contextAddition = formatGitHubUpdates(pending.github_updates);
    // Inject into context
    console.log(JSON.stringify({
      result: 'continue',
      context: contextAddition  // "Note: Issue #42 received a new comment from @reviewer..."
    }));
  }
}
```

### Q4b: Foreman workflow via Hooks

**Hook responsibilities become minimal**:

| Before (v5) | After (v6) |
|-------------|------------|
| Hook calls GitHub MCP | Hook calls worker API |
| Hook parses GitHub response | Worker returns clean data |
| Hook manages rate limits | Worker manages rate limits |
| Hook handles errors | Worker handles errors |
| Hook caches nothing | Worker caches everything |

**Example: chain-issue-updater posting a comment**

```typescript
// BEFORE: Hook calls GitHub MCP directly
// Problem: Slow, token-heavy, no caching

// AFTER: Hook calls worker API
async function postIssueComment(issueNumber: number, body: string): Promise<void> {
  // Single HTTP call to local worker
  await fetch(`http://localhost:37777/api/github/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body })
  });

  // Worker handles:
  // 1. Posting to GitHub
  // 2. Caching the comment locally
  // 3. Notifying other sessions
}
```

### Q4c: Built-in vs Claude Code agent handling

**Clear separation of concerns**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WORKER HANDLES (Built-in, always running)                               │
│                                                                          │
│  • GitHub sync (webhooks, polling, caching)                             │
│  • Session management (registry, hierarchy, restart queue)              │
│  • Artifact indexing (agents, commands, rules)                          │
│  • Plan reconciliation (drift detection, version tracking)              │
│  • Pattern detection (duo candidates, refinement suggestions)           │
│  • Context assembly (layer composition, budget management)              │
│                                                                          │
│  Characteristics:                                                        │
│  • Background processes                                                  │
│  • No user interaction                                                   │
│  • Deterministic logic                                                   │
│  • Fast, cached responses                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE HANDLES (Ephemeral, per-session)                            │
│                                                                          │
│  • Code generation and modification                                      │
│  • Decision making (architecture, implementation choices)               │
│  • User interaction (questions, confirmations)                          │
│  • Complex reasoning (debugging, optimization)                          │
│  • Tool orchestration (when to use which tool)                          │
│  • Agent/subagent coordination                                          │
│                                                                          │
│  Characteristics:                                                        │
│  • Interactive                                                           │
│  • Requires judgment                                                     │
│  • Non-deterministic                                                     │
│  • Token-intensive (but for valuable work)                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**API Surface for Claude Code**:

```
Worker exposes simple, pre-processed endpoints:

GET  /api/github/issues/:number              → Cached issue data (clean JSON)
GET  /api/github/issues/:number/comments     → Cached comments (array)
POST /api/github/issues/:number/comments     → Post + cache (returns ID)
GET  /api/github/prs/:number                 → Cached PR data
GET  /api/github/prs/:number/status          → Aggregated status checks

GET  /api/foreman/issue/:number/context      → Pre-assembled context package
GET  /api/foreman/rules/for-labels           → Rules matching issue labels
GET  /api/foreman/agents/performance/:name   → Agent success/failure history

GET  /api/orchestration/restart-pending/:id  → Check if restart queued
POST /api/orchestration/artifact-changed     → Record artifact write
POST /api/sessions/register                  → Register session in hierarchy
POST /api/sessions/complete                  → Mark session done
```

---

## Part 2: Complete v6 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              GITHUB                                      │
│                                │                                         │
│                    Webhooks    │    API (fallback)                       │
│                         │      │      │                                  │
└─────────────────────────┼──────┼──────┼──────────────────────────────────┘
                          │      │      │
                          ▼      ▼      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM WORKER (persistent)                                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  GITHUB SYNC SERVICE                                             │    │
│  │  • Webhook receiver                                              │    │
│  │  • Polling fallback                                              │    │
│  │  • Cache manager                                                 │    │
│  │  • Session notifier                                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ORCHESTRATION ENGINE                                            │    │
│  │  • Session hierarchy (parent/child tracking)                    │    │
│  │  • Restart queue (pending → ready → executing)                  │    │
│  │  • Prompt boundary detection                                     │    │
│  │  • Terminal launcher                                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CONTEXT ENGINE                                                  │    │
│  │  • Foreman context assembly                                      │    │
│  │  • Label-based rule injection                                    │    │
│  │  • Pattern detection                                             │    │
│  │  • Agent refinement                                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  RECONCILIATION ENGINE                                           │    │
│  │  • Plan drift detection                                          │    │
│  │  • Change proposal generation                                    │    │
│  │  • Version management                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DATA LAYER                                                      │    │
│  │  SQLite: sessions, github_cache, artifacts, plans, observations │    │
│  │  Chroma: semantic search                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
          │ HOOKS           │ │ VIEWER    │ │ CLI             │
          │ (thin clients)  │ │ (React)   │ │ (user terminal) │
          │                 │ │           │ │                 │
          │ • Notify worker │ │ • Editor  │ │ • Claude Code   │
          │ • Query worker  │ │ • Browser │ │ • Conversation  │
          │ • Inject context│ │ • Monitor │ │ • Tool use      │
          └─────────────────┘ └───────────┘ └─────────────────┘
```

---

## Part 3: Implementation Phases

### Phase 1: Session Hierarchy & Prompt-Boundary Restart

**Goal**: Restart works correctly with subagents and waits for response completion.

**Deliverables**:
1. Session hierarchy tracking (parent/child)
2. Pending restart queue with status
3. Subagent completion detection
4. UserPromptSubmit restart interception
5. Restart coalescing (multiple artifacts → one restart)

**Validation**: Main spawns 2 subagents, each writes agent file → single restart after both complete.

### Phase 2: GitHub Sync Service

**Goal**: Worker maintains GitHub cache; CLI never calls GitHub.

**Deliverables**:
1. GitHub cache schema
2. Webhook handler
3. Polling fallback
4. Worker API endpoints
5. Hook migration (MCP → worker API)

**Validation**: chain-issue-updater posts comment via worker → appears in GitHub → cached locally.

### Phase 3: Proactive Context Injection

**Goal**: Worker notifies CLI of relevant GitHub events.

**Deliverables**:
1. Session subscription model
2. Update notification queue
3. Context injection on next prompt
4. Subscription auto-management (based on active issue)

**Validation**: External comment on issue #42 → CLI working on #42 sees "New comment from @reviewer".

### Phase 4-6: (From v5)

- Plan drift detection
- Artifact editor
- Embedded terminal (optional)

---

## Part 4: Token Savings Analysis

| Operation | Before (v5) | After (v6) | Savings |
|-----------|-------------|------------|---------|
| Get issue context | ~2000 tokens (GitHub API response) | ~400 tokens (clean JSON) | 80% |
| Get issue comments | ~3000 tokens (10 comments) | ~800 tokens (cached, formatted) | 73% |
| Post comment | ~500 tokens (request + response) | ~100 tokens (fire and forget) | 80% |
| Check PR status | ~1500 tokens | ~200 tokens | 87% |

**Estimated session reduction**: 40-60% fewer tokens for GitHub-heavy workflows.

---

## Part 5: What v6 Adds Over v5

| Capability | v5 | v6 |
|------------|----|----|
| Restart timing | 2-second delay | Prompt boundary |
| Subagent awareness | None | Full hierarchy tracking |
| GitHub access | Direct MCP calls | Cached via worker |
| Webhook support | None | Full event handling |
| Proactive updates | None | Context injection on events |
| Token efficiency | Baseline | 40-60% reduction |

---

## Part 6: Success Metrics

1. **Restart Safety**: 100% of restarts occur at prompt boundaries (never mid-response)
2. **Subagent Handling**: 100% of subagent hierarchies tracked correctly
3. **GitHub Cache Hit Rate**: >95% after warmup
4. **Webhook Latency**: <1 second from GitHub event to cache update
5. **Token Reduction**: 40%+ reduction in GitHub-related token usage
