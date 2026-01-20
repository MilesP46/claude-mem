# Hooks Enhancement Impact Assessment

## Executive Summary

The Forge integration requires significant enhancements to the existing claude-mem hooks infrastructure to enable artifact detection, terminal session registration, context injection for orchestration state, and most critically, change capture for the terminal-to-editor bridge. The current hook architecture is well-suited for extension: hooks are pure HTTP clients that delegate to the worker service, follow a consistent stdin/stdout protocol, and have established patterns for fire-and-forget operations.

The most impactful enhancement is the PostToolUse hook modification to capture file changes (before/after content) for Edit and Write tool operations. This "Bridge" functionality enables the Cursor-style Keep/Discard review workflow in VS Code. The save-hook already receives `tool_name`, `tool_input`, and `tool_response` - the enhancement involves extracting change data and sending it to new Forge endpoints. Secondary enhancements to context-hook and new-hook enable orchestration context injection and terminal session tracking.

Performance remains a critical constraint. Hooks execute synchronously in Claude Code's processing pipeline, so all Forge enhancements must maintain the existing fire-and-forget pattern. The worker service handles all heavy lifting asynchronously. Privacy tag handling must extend to Forge-related content to prevent meta-observation recursion.

## save-hook.ts Enhancements

### Current Implementation

The save-hook (`src/hooks/save-hook.ts`) handles PostToolUse events. Key characteristics:

```typescript
// Current input structure
export interface PostToolUseInput {
  session_id: string;
  cwd: string;
  tool_name: string;
  tool_input: any;
  tool_response: any;
}
```

**Current Flow:**
1. Validate input (no async operations first - performance pattern)
2. Check collection settings BEFORE worker startup (avoids 15s wait if disabled)
3. Call `ensureWorkerRunning()` to poll worker readiness
4. POST to `http://127.0.0.1:{port}/api/sessions/observations` with tool data
5. Output `STANDARD_HOOK_RESPONSE` and exit

**Key Design Decisions:**
- Pure HTTP client - no native dependencies, runtime agnostic
- Fire-and-forget - doesn't wait for worker processing completion
- Privacy tags stripped at worker layer (SessionRoutes.handleObservationsByClaudeId)
- No AbortSignal usage due to Windows Bun cleanup issues

### Required Changes

#### 1. Artifact Detection (writes to .claude/ directories)

Add artifact detection logic for file operations targeting orchestration directories:

```typescript
// New interface for artifact metadata
interface ArtifactDetection {
  isArtifact: boolean;
  artifactType?: 'command' | 'agent' | 'skill' | 'instruction' | 'template' | 'rule';
  artifactScope?: 'project' | 'user';
  artifactName?: string;
  artifactPath?: string;
}

// Detection function
function detectArtifact(toolName: string, toolInput: any): ArtifactDetection {
  if (!['Edit', 'Write'].includes(toolName)) {
    return { isArtifact: false };
  }

  const filePath = toolInput?.file_path;
  if (!filePath) return { isArtifact: false };

  // Project-level artifacts (.claude/ in cwd)
  const projectArtifactPatterns = [
    { pattern: /\.claude\/commands\/([^/]+)\.md$/, type: 'command' as const },
    { pattern: /\.claude\/agents\/([^/]+)\.md$/, type: 'agent' as const },
    { pattern: /\.claude\/skills\/([^/]+)\/SKILL\.md$/, type: 'skill' as const },
  ];

  // User-level artifacts (~/.claude/)
  const userArtifactPatterns = [
    { pattern: /\.claude\/commands\/([^/]+)\.md$/, type: 'command' as const },
    { pattern: /\.claude\/agents\/([^/]+)\.md$/, type: 'agent' as const },
    { pattern: /\.claude\/skills\/([^/]+)\/SKILL\.md$/, type: 'skill' as const },
  ];

  for (const { pattern, type } of projectArtifactPatterns) {
    const match = filePath.match(pattern);
    if (match && !filePath.includes(homedir())) {
      return {
        isArtifact: true,
        artifactType: type,
        artifactScope: 'project',
        artifactName: match[1],
        artifactPath: filePath
      };
    }
  }

  // Check user-level (must be in home directory)
  if (filePath.startsWith(homedir())) {
    for (const { pattern, type } of userArtifactPatterns) {
      const match = filePath.match(pattern);
      if (match) {
        return {
          isArtifact: true,
          artifactType: type,
          artifactScope: 'user',
          artifactName: match[1],
          artifactPath: filePath
        };
      }
    }
  }

  return { isArtifact: false };
}
```

#### 2. Change Capture (The Bridge)

Capture before/after content for Edit and Write tools:

```typescript
interface ChangeCapture {
  filePath: string;
  tool: 'Edit' | 'Write';
  beforeContent: string | null;  // null for new files
  afterContent: string;
  agent?: string;  // From context if available
}

function captureChange(
  toolName: string,
  toolInput: any,
  toolResponse: any
): ChangeCapture | null {
  if (!['Edit', 'Write'].includes(toolName)) {
    return null;
  }

  const filePath = toolInput?.file_path;
  if (!filePath) return null;

  // For Edit tool:
  // - tool_input contains: old_string, new_string, file_path
  // - tool_response contains: result message
  // We need to reconstruct before/after from the edit operation

  // For Write tool:
  // - tool_input contains: file_path, content
  // - tool_response contains: result message
  // beforeContent requires reading file before write (not available here)

  if (toolName === 'Edit') {
    // Edit provides old_string and new_string - worker will reconstruct diff
    return {
      filePath,
      tool: 'Edit',
      beforeContent: toolInput.old_string ?? null,
      afterContent: toolInput.new_string ?? '',
      agent: undefined  // Will be populated by worker from session context
    };
  }

  if (toolName === 'Write') {
    // Write provides full content - beforeContent not available at hook layer
    // Worker will need to track file state or rely on git
    return {
      filePath,
      tool: 'Write',
      beforeContent: null,  // Worker uses git or file cache
      afterContent: toolInput.content ?? '',
      agent: undefined
    };
  }

  return null;
}
```

#### 3. Modified saveHook Function

```typescript
async function saveHook(input?: PostToolUseInput): Promise<void> {
  // ... existing validation and settings checks ...

  await ensureWorkerRunning();
  const port = getWorkerPort();

  // Existing observation storage (unchanged)
  const response = await fetch(`http://127.0.0.1:${port}/api/sessions/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentSessionId: session_id,
      tool_name,
      tool_input,
      tool_response,
      cwd
    })
  });

  if (!response.ok) {
    throw new Error(`Observation storage failed: ${response.status}`);
  }

  // NEW: Artifact detection (fire-and-forget)
  const artifact = detectArtifact(tool_name, tool_input);
  if (artifact.isArtifact) {
    fetch(`http://127.0.0.1:${port}/api/forge/artifacts/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session_id,
        cwd,
        ...artifact
      })
    }).catch(() => {}); // Fire-and-forget - don't block hook
  }

  // NEW: Change capture for Bridge (fire-and-forget)
  const change = captureChange(tool_name, tool_input, tool_response);
  if (change) {
    fetch(`http://127.0.0.1:${port}/api/forge/changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session_id,
        timestamp: Date.now(),
        ...change
      })
    }).catch(() => {}); // Fire-and-forget - don't block hook
  }

  console.log(STANDARD_HOOK_RESPONSE);
}
```

### Artifact Detection Logic

```
ARTIFACT DETECTION FLOW
+------------------------------------------------------------------------+
|                                                                         |
|  PostToolUse Event                                                      |
|  tool_name: "Edit" | "Write"                                            |
|  tool_input.file_path: "/path/to/file"                                  |
|                                                                         |
|         |                                                               |
|         v                                                               |
|  +----------------------------------------------+                       |
|  | Is tool Edit or Write?                       |                       |
|  +----------------------------------------------+                       |
|         | No --> Skip artifact detection                                |
|         | Yes                                                           |
|         v                                                               |
|  +----------------------------------------------+                       |
|  | Extract file_path from tool_input            |                       |
|  +----------------------------------------------+                       |
|         |                                                               |
|         v                                                               |
|  +----------------------------------------------+                       |
|  | Match against artifact patterns:             |                       |
|  |                                              |                       |
|  | PROJECT SCOPE:                               |                       |
|  | - {cwd}/.claude/commands/*.md  --> command   |                       |
|  | - {cwd}/.claude/agents/*.md    --> agent     |                       |
|  | - {cwd}/.claude/skills/*/SKILL.md --> skill  |                       |
|  |                                              |                       |
|  | USER SCOPE:                                  |                       |
|  | - ~/.claude/commands/*.md      --> command   |                       |
|  | - ~/.claude/agents/*.md        --> agent     |                       |
|  | - ~/.claude/skills/*/SKILL.md  --> skill     |                       |
|  +----------------------------------------------+                       |
|         |                                                               |
|         v                                                               |
|  +----------------------------------------------+                       |
|  | POST /api/forge/artifacts/index              |                       |
|  | { artifactType, artifactScope, name, path }  |                       |
|  | (Fire-and-forget, async)                     |                       |
|  +----------------------------------------------+                       |
|                                                                         |
+------------------------------------------------------------------------+
```

**False Positive Prevention:**
- Only trigger on Edit/Write tools (not Read, Glob, Bash)
- Validate file path contains `.claude/` directory marker
- Check scope (project vs user) by comparing against cwd and homedir
- Ignore temp files and backup files (patterns like `.*.swp`, `*.bak`)

## context-hook.ts Enhancements

### Current Implementation

The context-hook (`src/hooks/context-hook.ts`) handles SessionStart events:

```typescript
export interface SessionStartInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name?: string;
}
```

**Current Flow:**
1. Call `ensureWorkerRunning()`
2. GET `http://127.0.0.1:{port}/api/context/inject?project={project}`
3. Return result wrapped in `hookSpecificOutput.additionalContext`

The context generation happens entirely in the worker service via `ContextBuilder`.

### Required Changes

#### 1. Forge Context Query Parameters

Add query parameters to request Forge-specific context:

```typescript
async function contextHook(input?: SessionStartInput): Promise<string> {
  await ensureWorkerRunning();

  const cwd = input?.cwd ?? process.cwd();
  const project = getProjectName(cwd);
  const port = getWorkerPort();

  // NEW: Build URL with Forge context parameters
  const url = new URL(`http://127.0.0.1:${port}/api/context/inject`);
  url.searchParams.set('project', project);

  // Request Forge orchestration context if in orchestration mode
  const forgeContextEnabled = await isForgeContextEnabled(cwd);
  if (forgeContextEnabled) {
    url.searchParams.set('includeForge', 'true');
    url.searchParams.set('sessionId', input?.session_id ?? '');
  }

  const response = await fetch(url.toString());
  // ... rest unchanged
}

// Check if Forge context should be enabled for this project
async function isForgeContextEnabled(cwd: string): Promise<boolean> {
  // Check for .claude/ directory existence (indicates orchestration project)
  const claudeDir = path.join(cwd, '.claude');
  try {
    await fs.access(claudeDir);
    return true;
  } catch {
    return false;
  }
}
```

#### 2. Worker-Side Changes (ContextBuilder)

The worker's `ContextBuilder` will need new sections for Forge context:

```typescript
// New section types for Forge
interface ForgeContextSection {
  type: 'forge_session' | 'forge_pipeline' | 'forge_artifacts';
  content: string;
}

// Worker will inject:
// - Current orchestration session info (if in pipeline)
// - Active artifacts relevant to current operation
// - Behavior context (learned user preferences)
```

### Context Injection Format

The Forge context will be appended to the existing memory context:

```
## Forge Orchestration Context

**Active Pipeline:** Release 9 | Phase: Design | Step: UX Research
**Current Command:** chain-ux-researcher
**Session:** S305 | Duration: 12m

**Relevant Artifacts:**
- @agent/forge-backend-assess (127 runs, 82% success)
- @skill/forge-analyze-error (45 triggers)

**Learned Behaviors:**
- Build mode: development
- Test strategy: test-during
- Script runner: npm (not yarn)
```

### Performance Considerations

- Context query adds ~50ms to existing context generation
- Forge context is optional and only requested when `.claude/` exists
- Worker caches artifact metadata and behaviors (no cold DB queries)
- Total context hook time target: < 200ms

## new-hook.ts Enhancements

### Current Implementation

The new-hook (`src/hooks/new-hook.ts`) handles UserPromptSubmit events:

```typescript
export interface UserPromptSubmitInput {
  session_id: string;
  cwd: string;
  prompt: string;
}
```

**Current Flow:**
1. Call `ensureWorkerRunning()`
2. POST to `/api/sessions/init` with contentSessionId, project, prompt
3. POST to `/sessions/{sessionDbId}/init` to start SDK agent
4. Output `STANDARD_HOOK_RESPONSE`

### Required Changes

#### 1. Terminal Session Registration

Register the terminal session with Forge for bridge functionality:

```typescript
async function newHook(input?: UserPromptSubmitInput): Promise<void> {
  await ensureWorkerRunning();

  // ... existing session initialization ...

  // NEW: Register terminal session with Forge bridge
  await registerTerminalSession(input.session_id, cwd, port);

  // ... existing SDK agent start ...
}

async function registerTerminalSession(
  sessionId: string,
  cwd: string,
  port: number
): Promise<void> {
  const terminalInfo = detectTerminal();

  try {
    await fetch(`http://127.0.0.1:${port}/api/forge/session/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        terminal_pid: process.ppid,
        terminal_type: terminalInfo.type,
        terminal_name: terminalInfo.name,
        project_root: cwd,
        started_at: new Date().toISOString(),
        parent_session_id: detectParentSession()  // For nested agents
      })
    });
  } catch (error) {
    // Non-blocking - Forge integration is optional
    logger.debug('HOOK', 'Forge session registration failed (non-blocking)', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Terminal detection from environment variables
interface TerminalInfo {
  type: string;
  name: string;
}

function detectTerminal(): TerminalInfo {
  // iTerm2
  if (process.env.ITERM_SESSION_ID) {
    return { type: 'iTerm2', name: 'iTerm2' };
  }
  // Ghostty
  if (process.env.GHOSTTY_RESOURCES_DIR) {
    return { type: 'Ghostty', name: 'Ghostty' };
  }
  // Kitty
  if (process.env.KITTY_PID) {
    return { type: 'Kitty', name: 'Kitty' };
  }
  // WezTerm
  if (process.env.WEZTERM_PANE) {
    return { type: 'WezTerm', name: 'WezTerm' };
  }
  // Alacritty
  if (process.env.ALACRITTY_SOCKET) {
    return { type: 'Alacritty', name: 'Alacritty' };
  }
  // VS Code integrated terminal
  if (process.env.VSCODE_GIT_IPC_HANDLE) {
    return { type: 'VSCode', name: 'VS Code Terminal' };
  }
  // Generic fallback
  return {
    type: process.env.TERM_PROGRAM ?? 'unknown',
    name: process.env.TERM_PROGRAM ?? 'Unknown Terminal'
  };
}

// Detect parent session for nested agent tracking
function detectParentSession(): string | undefined {
  // Claude Code sets CLAUDE_SESSION_ID for nested agents
  return process.env.CLAUDE_PARENT_SESSION_ID ?? undefined;
}
```

#### 2. Parent Session Tracking

For orchestration chains where agents launch other agents:

```typescript
// Environment variable propagation in agent launchers
// When /forge-impact launches @agent/forge-backend-assess:
// - Parent session exports CLAUDE_PARENT_SESSION_ID
// - Child session detects it and registers relationship
```

### Session Registration Data Model

```sql
-- From vision.md: forge_bridge_sessions table
CREATE TABLE forge_bridge_sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id),
  terminal_pid INTEGER,
  terminal_type TEXT,
  project_root TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  vscode_connected BOOLEAN DEFAULT false,
  browser_connected BOOLEAN DEFAULT false,
  parent_session_id TEXT  -- For nested agent chains
);
```

## PostToolUse Enhancement (The Bridge)

### Change Capture Flow

```
CHANGE CAPTURE FLOW - THE BRIDGE
+------------------------------------------------------------------------+
|                                                                         |
|  T+0.0s  Claude Code in external terminal                               |
|          > Edit src/services/auth/jwt.ts                                |
|          tool_input: { file_path, old_string, new_string }              |
|                                                                         |
|  T+0.1s  PostToolUse hook fires (save-hook.ts)                          |
|          +-----------------------------------------------------+        |
|          | 1. Parse input JSON from stdin                      |        |
|          | 2. Validate collection settings (early exit check)  |        |
|          | 3. ensureWorkerRunning() - poll readiness          |        |
|          | 4. POST /api/sessions/observations (existing)       |        |
|          | 5. Detect if Edit/Write tool                        |        |
|          | 6. Extract change data from tool_input              |        |
|          | 7. POST /api/forge/changes (fire-and-forget)        |        |
|          | 8. Output STANDARD_HOOK_RESPONSE                    |        |
|          +-----------------------------------------------------+        |
|                        |                                                |
|                        v (async, non-blocking)                          |
|  T+0.2s  Worker receives POST /api/forge/changes                        |
|          +-----------------------------------------------------+        |
|          | Body: {                                             |        |
|          |   sessionId: "abc123",                              |        |
|          |   filePath: "src/services/auth/jwt.ts",             |        |
|          |   tool: "Edit",                                     |        |
|          |   beforeContent: "const SECRET = ...",              |        |
|          |   afterContent: "const SECRET = ... ?? 'fallback'", |        |
|          |   timestamp: 1704729600000                          |        |
|          | }                                                   |        |
|          +-----------------------------------------------------+        |
|                        |                                                |
|                        v                                                |
|  T+0.3s  ChangeTracker.processChange()                                  |
|          +-----------------------------------------------------+        |
|          | 1. Generate unified diff using 'diff' library       |        |
|          | 2. Parse diff into hunks                            |        |
|          | 3. Generate AI summary for each hunk (Haiku)        |        |
|          | 4. Store in forge_pending_changes table             |        |
|          | 5. Broadcast to WebSocket clients                   |        |
|          +-----------------------------------------------------+        |
|                        |                                                |
|                        v                                                |
|  T+0.5s  WebSocket broadcast to VS Code extension                       |
|          { type: 'agent_change', payload: ProcessedChange }             |
|                        |                                                |
|                        v                                                |
|  T+0.6s  VS Code decorates file with Keep/Discard UI                    |
|                                                                         |
|  TOTAL: < 1 second from edit to visual feedback                         |
|                                                                         |
+------------------------------------------------------------------------+
```

### Diff Generation

The diff generation happens in the worker service, not the hook:

```typescript
// Worker: src/services/forge/ChangeTracker.ts
import { createPatch, parsePatch } from 'diff';

interface ChangeHunk {
  id: string;
  startLine: number;
  endLine: number;
  lines: string[];
  original: string;
  modified: string;
  summary: string;  // AI-generated
  status: 'pending' | 'accepted' | 'rejected';
}

interface ProcessedChange {
  id: string;
  session_id: string;
  file_path: string;
  agent?: string;
  hunks: ChangeHunk[];
  timestamp: Date;
  status: 'pending' | 'partial' | 'resolved';
}

async function processChange(raw: RawChange): Promise<ProcessedChange> {
  // For Edit tool: reconstruct full file content
  // For Write tool: beforeContent from git or file cache

  const beforeContent = raw.beforeContent ?? await getFileFromGit(raw.filePath);
  const afterContent = raw.afterContent;

  // Generate unified diff
  const patch = createPatch(
    raw.filePath,
    beforeContent || '',
    afterContent,
    'before',
    'after'
  );

  // Parse into hunks
  const parsed = parsePatch(patch)[0];
  const hunks: ChangeHunk[] = parsed.hunks.map((hunk, index) => ({
    id: `${raw.sessionId}-${raw.filePath}-${index}`,
    startLine: hunk.newStart,
    endLine: hunk.newStart + hunk.newLines - 1,
    lines: hunk.lines,
    original: extractOriginal(hunk),
    modified: extractModified(hunk),
    summary: '',  // Populated by AI
    status: 'pending'
  }));

  // Generate AI summaries (batch for efficiency)
  const summaries = await generateHunkSummaries(hunks, raw);
  hunks.forEach((h, i) => h.summary = summaries[i]);

  return {
    id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    session_id: raw.sessionId,
    file_path: raw.filePath,
    agent: await resolveAgent(raw.sessionId),
    hunks,
    timestamp: new Date(raw.timestamp),
    status: 'pending'
  };
}
```

### Worker Communication

**API Contract:**

```typescript
// POST /api/forge/changes
interface ChangeSubmission {
  sessionId: string;
  filePath: string;
  tool: 'Edit' | 'Write';
  beforeContent: string | null;
  afterContent: string;
  timestamp: number;
}

// Response (immediate acknowledgment)
interface ChangeResponse {
  status: 'queued' | 'skipped';
  changeId?: string;
  reason?: string;  // If skipped
}

// WebSocket broadcast (async)
interface ChangeNotification {
  type: 'agent_change';
  payload: ProcessedChange;
}
```

**Skip Conditions:**
- File path matches skip patterns (node_modules, .git, etc.)
- File is in `.claude-mem/` directory (prevents meta-observation)
- beforeContent equals afterContent (no actual change)
- Privacy tags detected in file content

## Performance Analysis

### Timing Budget

| Hook | Current Time | With Forge | Budget |
|------|-------------|------------|--------|
| context-hook | 100-150ms | 150-200ms | 300ms max |
| new-hook | 50-100ms | 100-150ms | 200ms max |
| save-hook | 20-50ms | 30-70ms | 100ms max |
| summary-hook | 30-80ms | 30-80ms (unchanged) | 100ms max |
| user-message-hook | 100-150ms | 100-150ms (unchanged) | 200ms max |

**Per-Hook Analysis:**

**context-hook (+50ms):**
- Additional URL parameter parsing: ~1ms
- Forge context enabled check (fs.access): ~5ms
- Worker-side Forge context generation: ~40ms (cached after first)
- Total overhead: ~50ms within budget

**new-hook (+50ms):**
- Terminal detection (env var reads): ~1ms
- Fire-and-forget POST to Forge registration: ~20-30ms
- Parent session detection: ~1ms
- Total overhead: ~50ms within budget (non-blocking)

**save-hook (+20ms):**
- Artifact detection (regex match): ~1ms
- Change capture (data extraction): ~2ms
- Fire-and-forget POST to artifact index: ~10ms
- Fire-and-forget POST to changes: ~10ms
- Total overhead: ~20ms (parallel, non-blocking)

### Optimization Strategies

**1. Fire-and-Forget Pattern:**
```typescript
// All Forge API calls use fire-and-forget
fetch(forgeEndpoint, { method: 'POST', body }).catch(() => {});
// Hook continues immediately without awaiting
```

**2. Early Exit Optimization:**
```typescript
// Check if Forge is enabled before any processing
if (!isForgeEnabled()) {
  // Skip all Forge processing
  return;
}
```

**3. Batched Context Caching:**
```typescript
// Worker caches Forge context per project (5 minute TTL)
const cachedContext = forgeContextCache.get(projectId);
if (cachedContext && !cachedContext.isStale()) {
  return cachedContext.data;
}
```

**4. Lazy Initialization:**
```typescript
// Terminal detection only runs once per hook process
let cachedTerminalInfo: TerminalInfo | null = null;
function detectTerminal(): TerminalInfo {
  if (cachedTerminalInfo) return cachedTerminalInfo;
  cachedTerminalInfo = performDetection();
  return cachedTerminalInfo;
}
```

**5. Parallel Fire-and-Forget:**
```typescript
// Artifact detection and change capture run in parallel
Promise.all([
  artifact.isArtifact ? forgeArtifactIndex(artifact) : null,
  change ? forgeChangeSubmit(change) : null
]).catch(() => {}); // Both fire-and-forget
```

## Privacy Considerations

### Tag Handling

The dual-tag system must extend to Forge content:

```typescript
// Existing tags (unchanged)
<private>content</private>  // User-level privacy
<claude-mem-context>content</claude-mem-context>  // System-level

// Forge content handling
// 1. Forge context injected via context-hook is NOT tagged
//    (it's reference data, not observations)
// 2. Artifact content IS subject to privacy tags
// 3. Change capture strips privacy tags before diff

function shouldCaptureChange(filePath: string, content: string): boolean {
  // Skip files in privacy-sensitive directories
  if (filePath.includes('.env') || filePath.includes('credentials')) {
    return false;
  }

  // Check for privacy tags in content
  const stripped = stripMemoryTagsFromJson(content);
  if (stripped !== content) {
    // Content had privacy tags - log but still capture stripped version
    logger.debug('FORGE', 'Privacy tags stripped from change capture', {
      filePath,
      originalLength: content.length,
      strippedLength: stripped.length
    });
  }

  return true;
}
```

### Data Retention

```
FORGE DATA RETENTION POLICY
+------------------------------------------------------------------------+
|                                                                         |
| forge_bridge_sessions:                                                  |
|   - Retained for session duration + 24 hours                            |
|   - Cleaned up by periodic background job                               |
|                                                                         |
| forge_pending_changes:                                                  |
|   - Pending: Retained until resolved (accepted/rejected)                |
|   - Resolved: Retained for 7 days, then archived to observations        |
|   - Privacy: beforeContent/afterContent NOT stored if privacy-tagged    |
|                                                                         |
| forge_change_decisions:                                                 |
|   - Retained permanently for learning (acceptance rate tracking)        |
|   - Used to adjust agent confidence scores                              |
|   - No sensitive content - just decision metadata                       |
|                                                                         |
| forge_artifacts:                                                        |
|   - Synced bidirectionally with .claude/ files                          |
|   - Database is source of truth for metadata                            |
|   - Files are source of truth for content                               |
|                                                                         |
+------------------------------------------------------------------------+
```

### Environment Variable Security

```typescript
// Terminal detection only reads env vars, never exposes them
// Session registration includes terminal_type but NOT env contents
// Parent session detection uses dedicated CLAUDE_PARENT_SESSION_ID

// Never include in logs or API payloads:
const sensitiveEnvVars = [
  'CLAUDE_MEM_GEMINI_API_KEY',
  'CLAUDE_MEM_OPENROUTER_API_KEY',
  'JWT_SECRET',
  'DATABASE_URL'
];
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook timeout from slow Forge API | Medium | High | Fire-and-forget pattern; no await on Forge calls |
| Privacy tag bypass in change capture | Low | High | Strip tags before diff generation; validate at worker |
| Terminal detection false positives | Low | Low | Fallback to 'unknown'; non-blocking registration |
| Parent session detection race | Medium | Low | Retry logic in worker; orphan cleanup job |
| Artifact detection false positives | Medium | Medium | Strict path patterns; scope validation |
| Worker not ready for Forge calls | Low | Medium | Reuse existing `ensureWorkerRunning()`; queue in worker |
| Large file change capture (>1MB) | Medium | Medium | Skip files over size threshold; log warning |
| Circular observation (hook captures Forge files) | Medium | High | Explicit skip pattern for `.claude-mem/` and Forge artifacts |
| Windows path handling | Low | Medium | Use `path.normalize()` consistently |
| AbortSignal issues (Windows Bun) | Known | Medium | Continue avoiding AbortSignal per existing pattern |

## Recommendations

### Priority 1: High Impact, Low Risk

1. **save-hook artifact detection** - Simple pattern matching, fire-and-forget, enables artifact graph building
2. **new-hook terminal registration** - Environment variable reads only, non-blocking, enables bridge

### Priority 2: High Impact, Medium Risk

3. **save-hook change capture** - Core bridge functionality, requires careful privacy handling
4. **Worker-side ChangeTracker** - Diff generation and WebSocket broadcast

### Priority 3: Medium Impact, Low Risk

5. **context-hook Forge context** - Optional enhancement, cached at worker level
6. **Parent session tracking** - Enables nested agent visualization

### Implementation Order

```
PHASE 1: Foundation (save-hook artifact detection)
   |
   +-- Add artifact detection function
   +-- Add fire-and-forget POST to /api/forge/artifacts/index
   +-- Add worker route handler (stub)
   |
PHASE 2: Bridge Core (new-hook registration + save-hook changes)
   |
   +-- Add terminal detection to new-hook
   +-- Add session registration endpoint
   +-- Add change capture to save-hook
   +-- Add worker ChangeTracker service
   +-- Add WebSocket broadcast infrastructure
   |
PHASE 3: Context Enhancement (context-hook)
   |
   +-- Add Forge context query parameters
   +-- Add worker ForgeContextSection
   +-- Add caching layer
   |
PHASE 4: Advanced Features
   |
   +-- Parent session tracking
   +-- Agent confidence from decision tracking
   +-- Capability gap detection
```

### Testing Strategy

1. **Unit Tests:**
   - `detectArtifact()` with various file paths
   - `captureChange()` for Edit vs Write tools
   - `detectTerminal()` with mocked env vars
   - `detectParentSession()` with/without parent

2. **Integration Tests:**
   - Hook -> Worker round-trip for artifact indexing
   - Hook -> Worker -> WebSocket for change broadcast
   - Session registration and retrieval

3. **Performance Tests:**
   - Hook timing with Forge features enabled/disabled
   - Worker response time under load
   - WebSocket broadcast latency

4. **Privacy Tests:**
   - Privacy tag stripping in change capture
   - Sensitive file skip patterns
   - Meta-observation prevention
