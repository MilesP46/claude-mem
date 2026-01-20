# WebSocket & Streaming Impact Assessment

**Date:** 2026-01-08
**Assessment Type:** Architectural Design
**Scope:** Real-time streaming infrastructure for Forge terminal-to-editor bridge

---

## Executive Summary

This assessment designs the real-time communication layer that powers Forge's "terminal-to-editor bridge" - the capability to stream changes from external Claude Code sessions into VS Code with sub-second latency. The design extends claude-mem's existing SSEBroadcaster infrastructure while adding WebSocket support for bidirectional communication.

The core architecture decision is a **hybrid SSE + WebSocket approach**: SSE for simple broadcasts (existing infrastructure), WebSocket for bidirectional communication (new Forge features). This preserves backward compatibility while enabling the advanced features required by the bridge.

**Key Design Decisions:**

1. **Protocol:** WebSocket for bidirectional + SSE for backward compatibility
2. **Message Format:** JSON with versioned schema (not MessagePack/Protobuf - complexity not justified)
3. **Latency Target:** <1 second terminal-to-VS Code end-to-end (500ms P95)
4. **Connection Management:** Heartbeat at 30s, reconnect with exponential backoff, max 100 connections
5. **Terminal Streaming:** Line-buffered with ANSI preservation, 1MB output limit per command

---

## Protocol Design

### Event Types

The Forge bridge requires five distinct event types, each with well-defined payloads:

```typescript
// Event type union for type safety
type ForgeWebSocketEvent =
  | TerminalOutputEvent
  | FileChangeEvent
  | AgentStatusEvent
  | PipelineUpdateEvent
  | DecisionMadeEvent;

// ============================================
// 1. TERMINAL OUTPUT
// ============================================

interface TerminalOutputEvent {
  type: 'terminal-output';
  version: 1;
  payload: {
    sessionId: string;          // Forge session ID
    terminalId: string;         // Terminal instance (for multi-terminal)
    streamType: 'stdout' | 'stderr';
    content: string;            // May contain ANSI codes
    sequenceNumber: number;     // For ordering/gap detection
    timestamp: number;          // Unix epoch ms
    isComplete: boolean;        // True when command finishes
    exitCode?: number;          // Set when isComplete=true
  };
}

// ============================================
// 2. FILE CHANGE
// ============================================

interface FileChangeEvent {
  type: 'file-change';
  version: 1;
  payload: {
    changeId: string;           // Unique change ID
    sessionId: string;          // Originating session
    agentName: string | null;   // Agent that made the change (null if user)
    filePath: string;           // Absolute path
    tool: 'Edit' | 'Write';     // Which tool was used
    hunks: ChangeHunk[];        // Diff hunks
    summary: string;            // AI-generated 10-word summary
    timestamp: number;          // Unix epoch ms
  };
}

interface ChangeHunk {
  index: number;                // 0-based hunk index
  startLine: number;            // 1-based start line in new file
  endLine: number;              // 1-based end line in new file
  oldLines: string[];           // Lines removed
  newLines: string[];           // Lines added
  context: string[];            // Surrounding context lines
  summary: string;              // AI-generated hunk summary
  status: 'pending' | 'accepted' | 'rejected';
}

// ============================================
// 3. AGENT STATUS
// ============================================

interface AgentStatusEvent {
  type: 'agent-status';
  version: 1;
  payload: {
    sessionId: string;
    agentName: string;
    status: 'starting' | 'running' | 'idle' | 'completed' | 'failed';
    issueNumber?: number;       // GitHub issue being worked
    releaseId?: string;         // Release context
    sprintId?: string;          // Sprint context
    currentFile?: string;       // File currently being edited
    tokenCount?: {
      input: number;
      output: number;
    };
    error?: string;             // Error message if status='failed'
    timestamp: number;
  };
}

// ============================================
// 4. PIPELINE UPDATE
// ============================================

interface PipelineUpdateEvent {
  type: 'pipeline-update';
  version: 1;
  payload: {
    projectId: string;
    releaseId: string;
    pipelineType: 'greenfield' | 'brownfield';
    currentPhase: 'research' | 'concept' | 'design' | 'architecture' | 'issues' | 'execution';
    currentCommand: string;     // e.g., 'chain-ux-researcher'
    currentStep: number;        // Step within phase
    totalSteps: number;         // Total steps in phase
    decisionsCount: number;     // Decisions made so far
    isActive: boolean;
    startedAt: number;
    estimatedCompletion?: number;
    timestamp: number;
  };
}

// ============================================
// 5. DECISION MADE
// ============================================

interface DecisionMadeEvent {
  type: 'decision-made';
  version: 1;
  payload: {
    decisionId: string;
    projectId: string;
    releaseId: string;
    agentName: string;
    phase: string;
    category: string;
    title: string;
    decisionValue: string;
    decisionScore: number | null;
    alternatives: Alternative[];
    status: 'pending' | 'locked' | 'user_override';
    conceptIds: string[];
    timestamp: number;
  };
}

interface Alternative {
  value: string;
  score: number;
  rationale: string;
}
```

### Message Format

**Decision: JSON**

Comparison analysis:

| Factor | JSON | MessagePack | Protobuf |
|--------|------|-------------|----------|
| **Payload size (typical)** | 1.2KB | 0.9KB | 0.7KB |
| **Parse time** | 0.1ms | 0.08ms | 0.05ms |
| **Human readability** | Excellent | None | None |
| **Debugging ease** | Excellent | Poor | Poor |
| **Schema evolution** | Easy | Easy | Complex |
| **Browser support** | Native | Library | Library |
| **Implementation effort** | None | 2-3 hours | 8-12 hours |

**Rationale:**

1. **Latency target is 1s, not 10ms** - JSON parsing overhead (0.1ms) is negligible
2. **Payload sizes are small** - Typical events are 1-2KB, compression ratio gains are minimal
3. **Debugging value** - Being able to log/inspect messages directly is invaluable during development
4. **Browser compatibility** - No additional libraries required for viewer UI
5. **Implementation cost** - Zero additional dependencies

**Wire Format:**

```
// Outbound (server -> client)
{
  "event": "file-change",
  "version": 1,
  "payload": { ... },
  "timestamp": 1736380800000
}

// Inbound (client -> server)
{
  "action": "accept-hunk",
  "changeId": "change-abc123",
  "hunkIndex": 0,
  "timestamp": 1736380800500
}

// Control messages
{
  "event": "ping",
  "timestamp": 1736380830000
}

{
  "event": "pong",
  "clientId": "vscode-abc123",
  "timestamp": 1736380830005
}
```

### Versioning Strategy

**Version Negotiation Protocol:**

1. **Client connects** with `Sec-WebSocket-Protocol: forge-v1`
2. **Server responds** with supported version or error
3. **Version in every message** for future-proofing
4. **Backward compatibility window:** N-1 versions supported (2 weeks deprecation notice)

```typescript
// Connection handshake
const SUPPORTED_VERSIONS = [1];
const CURRENT_VERSION = 1;

interface ConnectionHandshake {
  event: 'connected';
  version: number;
  supportedVersions: number[];
  clientId: string;
  serverTime: number;
}

// Version mismatch handling
interface VersionMismatchError {
  event: 'error';
  code: 'VERSION_MISMATCH';
  message: string;
  clientVersion: number;
  supportedVersions: number[];
}
```

**Schema Evolution Rules:**

1. **Additive only** - New optional fields can be added
2. **No removal** - Fields never removed (can be deprecated)
3. **No type changes** - Field types never change
4. **Major version bump** - Required for breaking changes

---

## Terminal Streaming

### Architecture

```
TERMINAL STREAMING PIPELINE
+--------------------------------------------------------------------------+
|                                                                          |
|  EXTERNAL TERMINAL (iTerm2, Ghostty, etc.)                              |
|  +--------------------------------------------------------------------+ |
|  | Claude Code subprocess                                              | |
|  |   stdout/stderr -> plugin hook                                      | |
|  +--------------------------------------------------------------------+ |
|              |                                                          |
|              v                                                          |
|  +--------------------------------------------------------------------+ |
|  | PostToolUse Hook (enhanced)                                         | |
|  |   - Captures Bash tool output                                       | |
|  |   - Buffers by line                                                 | |
|  |   - Preserves ANSI codes                                           | |
|  |   - POSTs to worker API                                            | |
|  +--------------------------------------------------------------------+ |
|              |                                                          |
|              v                                                          |
|  +--------------------------------------------------------------------+ |
|  | Worker API: POST /api/v2/forge/terminal/output                      | |
|  |   - Validates session                                               | |
|  |   - Assigns sequence number                                        | |
|  |   - Stores in ring buffer (last 100 commands)                      | |
|  +--------------------------------------------------------------------+ |
|              |                                                          |
|              v                                                          |
|  +--------------------------------------------------------------------+ |
|  | WebSocket Hub                                                       | |
|  |   - Broadcasts to subscribed clients                               | |
|  |   - Filters by sessionId                                           | |
|  +--------------------------------------------------------------------+ |
|              |                                                          |
|              v                                                          |
|  +--------------------------------------------------------------------+ |
|  | VS Code Extension                                                   | |
|  |   - Receives terminal output                                       | |
|  |   - Renders in "Forge Terminal" panel                              | |
|  |   - Highlights errors (ANSI-aware)                                 | |
|  +--------------------------------------------------------------------+ |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Buffering Strategy

**Decision: Line-buffered with periodic flush**

```typescript
interface TerminalBuffer {
  sessionId: string;
  terminalId: string;
  lines: string[];
  lastFlushTime: number;
  sequenceNumber: number;
}

const BUFFER_CONFIG = {
  maxLines: 100,              // Buffer up to 100 lines
  flushIntervalMs: 100,       // Flush every 100ms minimum
  maxBufferSizeBytes: 64_000, // 64KB max buffer before force flush
  maxOutputSizeBytes: 1_048_576, // 1MB max per command (truncate after)
};

class TerminalBufferManager {
  private buffers: Map<string, TerminalBuffer> = new Map();

  /**
   * Add output to buffer, flush when appropriate
   */
  append(sessionId: string, terminalId: string, content: string): void {
    const key = `${sessionId}:${terminalId}`;
    let buffer = this.buffers.get(key);

    if (!buffer) {
      buffer = {
        sessionId,
        terminalId,
        lines: [],
        lastFlushTime: Date.now(),
        sequenceNumber: 0
      };
      this.buffers.set(key, buffer);
    }

    // Split by newlines, preserving partial lines
    const parts = content.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1 && !content.endsWith('\n')) {
        // Partial line - append to last
        if (buffer.lines.length > 0) {
          buffer.lines[buffer.lines.length - 1] += parts[i];
        } else {
          buffer.lines.push(parts[i]);
        }
      } else {
        buffer.lines.push(parts[i]);
      }
    }

    // Check flush conditions
    const shouldFlush =
      buffer.lines.length >= BUFFER_CONFIG.maxLines ||
      this.getBufferSize(buffer) >= BUFFER_CONFIG.maxBufferSizeBytes ||
      Date.now() - buffer.lastFlushTime >= BUFFER_CONFIG.flushIntervalMs;

    if (shouldFlush) {
      this.flush(key);
    }
  }

  private flush(key: string): void {
    const buffer = this.buffers.get(key);
    if (!buffer || buffer.lines.length === 0) return;

    const content = buffer.lines.join('\n');
    buffer.sequenceNumber++;

    // Broadcast via WebSocket
    websocketHub.broadcast({
      type: 'terminal-output',
      version: 1,
      payload: {
        sessionId: buffer.sessionId,
        terminalId: buffer.terminalId,
        streamType: 'stdout', // Determined by hook
        content,
        sequenceNumber: buffer.sequenceNumber,
        timestamp: Date.now(),
        isComplete: false
      }
    });

    buffer.lines = [];
    buffer.lastFlushTime = Date.now();
  }

  private getBufferSize(buffer: TerminalBuffer): number {
    return buffer.lines.reduce((acc, line) => acc + line.length, 0);
  }
}
```

### ANSI Code Preservation

Terminal output often contains ANSI escape codes for colors, cursor movement, and formatting. These must be preserved for accurate rendering in VS Code.

```typescript
// ANSI codes we explicitly preserve
const PRESERVED_ANSI_PATTERNS = [
  /\x1b\[[0-9;]*m/g,      // SGR (colors, bold, etc.)
  /\x1b\[[0-9]*J/g,       // ED (erase display)
  /\x1b\[[0-9]*K/g,       // EL (erase line)
  /\x1b\[[0-9;]*H/g,      // CUP (cursor position)
];

// ANSI codes we strip (cursor save/restore, alternate screen)
const STRIPPED_ANSI_PATTERNS = [
  /\x1b\[?[0-9;]*[suhl]/g,  // Cursor save/restore, show/hide
  /\x1b\[\?1049[hl]/g,      // Alternate screen buffer
];

function processTerminalOutput(raw: string): string {
  let processed = raw;

  // Strip problematic codes
  for (const pattern of STRIPPED_ANSI_PATTERNS) {
    processed = processed.replace(pattern, '');
  }

  // Preserved codes are left intact
  return processed;
}
```

### Large Output Handling

When commands produce excessive output (e.g., `cat large-file.txt`), we must prevent memory exhaustion:

```typescript
interface TruncationInfo {
  truncated: boolean;
  originalBytes: number;
  keptBytes: number;
  message: string;
}

function handleLargeOutput(content: string, maxBytes: number): { content: string; info: TruncationInfo } {
  const bytes = Buffer.byteLength(content, 'utf8');

  if (bytes <= maxBytes) {
    return {
      content,
      info: { truncated: false, originalBytes: bytes, keptBytes: bytes, message: '' }
    };
  }

  // Keep first 40% and last 10% of allowed size
  const headBytes = Math.floor(maxBytes * 0.4);
  const tailBytes = Math.floor(maxBytes * 0.1);
  const middleMessage = `\n\n... [truncated ${bytes - headBytes - tailBytes} bytes] ...\n\n`;

  // Find line boundaries for clean truncation
  const head = content.substring(0, headBytes);
  const tail = content.substring(content.length - tailBytes);

  const headEnd = head.lastIndexOf('\n') + 1;
  const tailStart = tail.indexOf('\n') + 1;

  return {
    content: content.substring(0, headEnd) + middleMessage + content.substring(content.length - tailBytes + tailStart),
    info: {
      truncated: true,
      originalBytes: bytes,
      keptBytes: headEnd + middleMessage.length + (tailBytes - tailStart),
      message: `Output truncated from ${Math.round(bytes / 1024)}KB to ${Math.round(maxBytes / 1024)}KB`
    }
  };
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hook capture latency | <10ms | Time from shell output to hook receipt |
| Buffer flush latency | <100ms | Time from line complete to WebSocket broadcast |
| End-to-end latency | <200ms | Time from shell output to VS Code render |
| Throughput | 10MB/s | Max terminal output processing rate |
| Memory footprint | <50MB | Max memory for terminal buffers across all sessions |

---

## Change Streaming

### Flow

```
CHANGE STREAMING FLOW (End-to-End)
+--------------------------------------------------------------------------+
|                                                                          |
|  T+0ms    Claude Code executes Edit/Write tool                          |
|           |                                                              |
|           v                                                              |
|  T+10ms   PostToolUse hook fires                                        |
|           +-- Captures: file path, before content, after content        |
|           +-- Captures: session ID, agent context                       |
|           |                                                              |
|           v                                                              |
|  T+50ms   Hook POSTs to worker                                          |
|           POST /api/v2/forge/changes                                    |
|           Body: { sessionId, filePath, tool, before, after, agent }     |
|           |                                                              |
|           v                                                              |
|  T+100ms  ChangeTracker processes                                       |
|           +-- Generates unified diff                                    |
|           +-- Parses into hunks                                         |
|           +-- Stores in forge_pending_changes                           |
|           |                                                              |
|           v                                                              |
|  T+300ms  HunkProcessor enriches (parallel)                             |
|           +-- Calls Haiku for each hunk summary                         |
|           +-- Batches requests (3 concurrent max)                       |
|           |                                                              |
|           v                                                              |
|  T+600ms  WebSocket broadcasts                                          |
|           +-- Event: file-change                                        |
|           +-- Payload: hunks with summaries                             |
|           |                                                              |
|           v                                                              |
|  T+650ms  VS Code extension receives                                    |
|           +-- Updates AgentChangeManager                                |
|           |                                                              |
|           v                                                              |
|  T+700ms  Decorations render                                            |
|           +-- Green background for additions                            |
|           +-- Red background for deletions                              |
|           +-- CodeLens: Keep/Discard above each hunk                   |
|           |                                                              |
|           v                                                              |
|  T+750ms  User sees change (< 1 second total)                          |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Hunk Processing

```typescript
import { createTwoFilesPatch, parsePatch, Hunk as DiffHunk } from 'diff';

interface RawChange {
  sessionId: string;
  filePath: string;
  tool: 'Edit' | 'Write';
  beforeContent: string | null;  // null for new files
  afterContent: string;
  agentName: string | null;
  timestamp: number;
}

interface ProcessedHunk {
  index: number;
  startLine: number;
  endLine: number;
  oldLines: string[];
  newLines: string[];
  context: string[];
  summary: string;
  status: 'pending';
}

class HunkProcessor {
  private summaryCache: Map<string, string> = new Map();

  async processChange(change: RawChange): Promise<{ hunks: ProcessedHunk[]; changeSummary: string }> {
    // Generate unified diff
    const patch = createTwoFilesPatch(
      change.filePath,
      change.filePath,
      change.beforeContent || '',
      change.afterContent,
      'before',
      'after'
    );

    // Parse into hunks
    const parsed = parsePatch(patch);
    if (parsed.length === 0 || !parsed[0].hunks) {
      return { hunks: [], changeSummary: 'No changes detected' };
    }

    const diffHunks = parsed[0].hunks;

    // Process each hunk with AI summary (parallel, rate-limited)
    const hunks = await this.processHunksWithSummaries(diffHunks, change);

    // Generate overall change summary
    const changeSummary = await this.generateChangeSummary(hunks, change);

    return { hunks, changeSummary };
  }

  private async processHunksWithSummaries(
    diffHunks: DiffHunk[],
    change: RawChange
  ): Promise<ProcessedHunk[]> {
    // Process in batches of 3 to avoid rate limits
    const BATCH_SIZE = 3;
    const results: ProcessedHunk[] = [];

    for (let i = 0; i < diffHunks.length; i += BATCH_SIZE) {
      const batch = diffHunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((hunk, batchIndex) =>
          this.processHunk(hunk, i + batchIndex, change)
        )
      );
      results.push(...batchResults);
    }

    return results;
  }

  private async processHunk(
    hunk: DiffHunk,
    index: number,
    change: RawChange
  ): Promise<ProcessedHunk> {
    const oldLines = hunk.lines
      .filter(l => l.startsWith('-') && !l.startsWith('---'))
      .map(l => l.substring(1));

    const newLines = hunk.lines
      .filter(l => l.startsWith('+') && !l.startsWith('+++'))
      .map(l => l.substring(1));

    const context = hunk.lines
      .filter(l => l.startsWith(' '))
      .map(l => l.substring(1));

    // Generate summary via Haiku (with caching)
    const hunkText = hunk.lines.join('\n');
    const cacheKey = this.hashHunk(hunkText);
    let summary = this.summaryCache.get(cacheKey);

    if (!summary) {
      summary = await this.generateHunkSummary(hunkText, change.filePath);
      this.summaryCache.set(cacheKey, summary);
    }

    return {
      index,
      startLine: hunk.newStart,
      endLine: hunk.newStart + hunk.newLines - 1,
      oldLines,
      newLines,
      context,
      summary,
      status: 'pending'
    };
  }

  private async generateHunkSummary(hunkText: string, filePath: string): Promise<string> {
    const extension = filePath.split('.').pop() || '';

    const response = await this.callHaiku({
      system: 'You summarize code changes in exactly 10 words or less. Be specific about what changed.',
      messages: [{
        role: 'user',
        content: `Summarize this ${extension} code change in 10 words or less:\n\n${hunkText}`
      }]
    });

    return response.trim();
  }

  private async generateChangeSummary(hunks: ProcessedHunk[], change: RawChange): Promise<string> {
    const hunkSummaries = hunks.map(h => `- ${h.summary}`).join('\n');

    const response = await this.callHaiku({
      system: 'You create brief file change summaries. Be specific.',
      messages: [{
        role: 'user',
        content: `Summarize these changes to ${change.filePath} in 15 words or less:\n\n${hunkSummaries}`
      }]
    });

    return response.trim();
  }

  private hashHunk(text: string): string {
    return Buffer.from(text).toString('base64').substring(0, 32);
  }

  private async callHaiku(request: { system: string; messages: { role: string; content: string }[] }): Promise<string> {
    // Implementation uses existing claude-mem Haiku integration
    // Rate limited to 50 requests/minute
    // Timeout: 5 seconds
    // Fallback: Returns "Code modification" on error
    return 'Implementation placeholder';
  }
}
```

### AI Summary Integration

**Haiku API Configuration:**

```typescript
const HAIKU_CONFIG = {
  model: 'claude-3-haiku-20240307',
  maxTokens: 50,           // 10 words ~ 15-20 tokens
  timeout: 5000,           // 5 second timeout
  rateLimitRpm: 50,        // 50 requests per minute
  retries: 2,              // Retry twice on failure
  fallbackSummary: 'Code modification',  // Used when API fails
};

interface HaikuRateLimiter {
  tokens: number;          // Current token count
  lastRefill: number;      // Last refill timestamp
  maxTokens: number;       // Max tokens (50 for 50 RPM)
  refillIntervalMs: number; // 60000ms for RPM
}

class HaikuSummaryService {
  private rateLimiter: HaikuRateLimiter = {
    tokens: 50,
    lastRefill: Date.now(),
    maxTokens: 50,
    refillIntervalMs: 60000
  };

  async summarize(prompt: string): Promise<string> {
    // Refill tokens if needed
    this.refillTokens();

    // Check rate limit
    if (this.rateLimiter.tokens <= 0) {
      logger.warn('FORGE', 'Haiku rate limit exceeded, using fallback');
      return HAIKU_CONFIG.fallbackSummary;
    }

    this.rateLimiter.tokens--;

    try {
      const response = await anthropic.messages.create({
        model: HAIKU_CONFIG.model,
        max_tokens: HAIKU_CONFIG.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : HAIKU_CONFIG.fallbackSummary;

    } catch (error) {
      logger.warn('FORGE', 'Haiku API error, using fallback', { error });
      return HAIKU_CONFIG.fallbackSummary;
    }
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.rateLimiter.lastRefill;

    if (elapsed >= this.rateLimiter.refillIntervalMs) {
      this.rateLimiter.tokens = this.rateLimiter.maxTokens;
      this.rateLimiter.lastRefill = now;
    }
  }
}
```

### Latency Targets

| Stage | Target | Budget |
|-------|--------|--------|
| PostToolUse hook | 50ms | 5% of budget |
| Network (hook -> worker) | 50ms | 5% of budget |
| Diff generation | 50ms | 5% of budget |
| Hunk parsing | 20ms | 2% of budget |
| Haiku summaries (parallel) | 500ms | 50% of budget |
| Database storage | 30ms | 3% of budget |
| WebSocket broadcast | 50ms | 5% of budget |
| VS Code rendering | 50ms | 5% of budget |
| **Total** | **800ms** | **80% of 1s budget** |
| **P95 buffer** | **200ms** | **20% margin** |

---

## Connection Management

### Lifecycle

```
CONNECTION STATE MACHINE
+--------------------------------------------------------------------------+
|                                                                          |
|                    +-------------+                                       |
|                    | DISCONNECTED|<-----------------------------------+  |
|                    +------+------+                                    |  |
|                           |                                           |  |
|                           | connect()                                 |  |
|                           v                                           |  |
|                    +-------------+                                    |  |
|                    | CONNECTING  |                                    |  |
|                    +------+------+                                    |  |
|                           |                                           |  |
|              +------------+------------+                              |  |
|              |                         |                              |  |
|              v                         v                              |  |
|       +-------------+           +-------------+                       |  |
|       | CONNECTED   |           |   FAILED    |----> reconnect -------+  |
|       +------+------+           +-------------+                       |  |
|              |                                                        |  |
|              | authenticated                                          |  |
|              v                                                        |  |
|       +-------------+                                                 |  |
|       |    READY    |<------+                                         |  |
|       +------+------+       |                                         |  |
|              |              |                                         |  |
|              | ping timeout |                                         |  |
|              v              |                                         |  |
|       +-------------+       |                                         |  |
|       | HEARTBEAT   |-------+                                         |  |
|       |  FAILED     |                                                 |  |
|       +------+------+                                                 |  |
|              |                                                        |  |
|              | 3 consecutive failures                                 |  |
|              v                                                        |  |
|       +-------------+                                                 |  |
|       |   STALE     |-----------------------> close -------------------+  |
|       +-------------+                                                    |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Connection Configuration

```typescript
interface ConnectionConfig {
  // Timing
  heartbeatIntervalMs: 30_000;       // Ping every 30 seconds
  heartbeatTimeoutMs: 10_000;        // Wait 10s for pong
  maxHeartbeatFailures: 3;           // Disconnect after 3 failures
  connectionTimeoutMs: 10_000;       // Initial connection timeout

  // Reconnection
  reconnectInitialDelayMs: 1_000;    // First retry after 1s
  reconnectMaxDelayMs: 60_000;       // Max retry delay 60s
  reconnectMultiplier: 2.0;          // Exponential backoff factor
  reconnectJitterMs: 500;            // Random jitter +/- 500ms
  maxReconnectAttempts: 10;          // Give up after 10 attempts

  // Resource limits
  maxConnections: 100;               // Max concurrent connections
  maxConnectionsPerClient: 5;        // Max connections per client ID
  idleTimeoutMs: 300_000;            // Disconnect idle clients after 5 min
  maxMessageSizeBytes: 1_048_576;    // 1MB max message size
}

const DEFAULT_CONFIG: ConnectionConfig = {
  heartbeatIntervalMs: 30_000,
  heartbeatTimeoutMs: 10_000,
  maxHeartbeatFailures: 3,
  connectionTimeoutMs: 10_000,
  reconnectInitialDelayMs: 1_000,
  reconnectMaxDelayMs: 60_000,
  reconnectMultiplier: 2.0,
  reconnectJitterMs: 500,
  maxReconnectAttempts: 10,
  maxConnections: 100,
  maxConnectionsPerClient: 5,
  idleTimeoutMs: 300_000,
  maxMessageSizeBytes: 1_048_576
};
```

### Reconnection Strategy

```typescript
class ReconnectionManager {
  private attempts = 0;
  private delay: number;
  private reconnecting = false;

  constructor(private config: ConnectionConfig) {
    this.delay = config.reconnectInitialDelayMs;
  }

  async reconnect(connectFn: () => Promise<void>): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    while (this.attempts < this.config.maxReconnectAttempts) {
      this.attempts++;

      // Calculate delay with jitter
      const jitter = (Math.random() - 0.5) * 2 * this.config.reconnectJitterMs;
      const waitTime = Math.min(this.delay + jitter, this.config.reconnectMaxDelayMs);

      logger.info('FORGE', 'Reconnecting', {
        attempt: this.attempts,
        maxAttempts: this.config.maxReconnectAttempts,
        delayMs: Math.round(waitTime)
      });

      await this.sleep(waitTime);

      try {
        await connectFn();
        this.reset();
        this.reconnecting = false;
        return;
      } catch (error) {
        logger.warn('FORGE', 'Reconnection failed', { attempt: this.attempts, error });
        // Exponential backoff
        this.delay = Math.min(
          this.delay * this.config.reconnectMultiplier,
          this.config.reconnectMaxDelayMs
        );
      }
    }

    logger.error('FORGE', 'Max reconnection attempts reached');
    this.reconnecting = false;
    throw new Error('Max reconnection attempts reached');
  }

  reset(): void {
    this.attempts = 0;
    this.delay = this.config.reconnectInitialDelayMs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Resource Limits

```typescript
class ConnectionLimiter {
  private connections: Map<string, Set<WebSocket>> = new Map();
  private totalConnections = 0;

  canAccept(clientId: string): { allowed: boolean; reason?: string } {
    // Check total limit
    if (this.totalConnections >= DEFAULT_CONFIG.maxConnections) {
      return { allowed: false, reason: 'Maximum server connections reached' };
    }

    // Check per-client limit
    const clientConnections = this.connections.get(clientId);
    if (clientConnections && clientConnections.size >= DEFAULT_CONFIG.maxConnectionsPerClient) {
      return { allowed: false, reason: 'Maximum connections per client reached' };
    }

    return { allowed: true };
  }

  add(clientId: string, ws: WebSocket): void {
    if (!this.connections.has(clientId)) {
      this.connections.set(clientId, new Set());
    }
    this.connections.get(clientId)!.add(ws);
    this.totalConnections++;
  }

  remove(clientId: string, ws: WebSocket): void {
    const clientConnections = this.connections.get(clientId);
    if (clientConnections) {
      clientConnections.delete(ws);
      if (clientConnections.size === 0) {
        this.connections.delete(clientId);
      }
    }
    this.totalConnections--;
  }

  getStats(): { total: number; byClient: Map<string, number> } {
    const byClient = new Map<string, number>();
    for (const [clientId, sockets] of this.connections) {
      byClient.set(clientId, sockets.size);
    }
    return { total: this.totalConnections, byClient };
  }
}
```

---

## SSE vs WebSocket

### Comparison

| Aspect | SSE (Existing) | WebSocket (New) |
|--------|----------------|-----------------|
| **Direction** | Server -> Client only | Bidirectional |
| **Protocol** | HTTP/1.1 (HTTP/2 multiplexed) | Persistent TCP |
| **Connection overhead** | Higher (HTTP headers per reconnect) | Lower (single handshake) |
| **Browser support** | Excellent (native) | Excellent (native) |
| **Reconnection** | Built-in automatic | Must implement |
| **Binary data** | Not supported | Supported |
| **Proxy compatibility** | Excellent | Variable |
| **Current usage** | Observation broadcasts | N/A |
| **Forge requirements** | Not sufficient | Required |

### Use Cases by Protocol

**SSE (Keep for):**
- Existing observation broadcasts to viewer UI
- Simple one-way status updates
- Low-frequency events (session started, session completed)

**WebSocket (Add for):**
- Terminal output streaming (high frequency)
- File change streaming with Keep/Discard actions (bidirectional)
- Pipeline updates (bidirectional - user can pause/resume)
- Decision streaming with user overrides (bidirectional)

### Recommendation

**Hybrid Approach: Extend SSE + Add WebSocket**

```typescript
// Architecture Overview
//
// EXISTING (SSE - unchanged)
// +------------------------------------------+
// | SSEBroadcaster                           |
// | - Observation broadcasts                 |
// | - Summary broadcasts                     |
// | - Session events                         |
// | - Processing status                      |
// +------------------------------------------+
//
// NEW (WebSocket - parallel)
// +------------------------------------------+
// | WebSocketHub                              |
// | - Terminal streaming                     |
// | - File change streaming                  |
// | - Pipeline updates                       |
// | - Decision streaming                     |
// | - Bidirectional actions                  |
// +------------------------------------------+
//
// UNIFIED API
// +------------------------------------------+
// | BroadcastManager                          |
// | - Routes events to appropriate protocol  |
// | - Handles protocol fallback              |
// | - Manages client subscriptions           |
// +------------------------------------------+
```

**Implementation Strategy:**

1. **Phase 1:** Keep SSEBroadcaster unchanged for backward compatibility
2. **Phase 2:** Add WebSocketHub on `/api/forge/live` for new Forge features
3. **Phase 3:** Add BroadcastManager to unify routing
4. **Phase 4:** (Optional) Migrate high-frequency SSE events to WebSocket

**Rationale:**

1. **Non-breaking:** Existing viewer continues to work with SSE
2. **Right tool for job:** WebSocket for bidirectional, SSE for simple broadcasts
3. **Incremental:** Can ship WebSocket features without rewriting SSE
4. **Fallback:** If WebSocket fails, VS Code extension can fallback to SSE for read-only mode

---

## WebSocket Hub Implementation

```typescript
// src/services/forge/WebSocketHub.ts

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { Server } from 'http';
import { logger } from '../../utils/logger.js';

interface ForgeClient {
  id: string;
  type: 'vscode' | 'browser' | 'unknown';
  ws: WebSocket;
  subscriptions: Set<string>;  // Session IDs subscribed to
  lastPing: number;
  missedPings: number;
}

interface ClientMessage {
  action: string;
  [key: string]: unknown;
}

export class WebSocketHub {
  private wss: WebSocketServer;
  private clients: Map<string, ForgeClient> = new Map();
  private limiter: ConnectionLimiter = new ConnectionLimiter();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/api/forge/live',
      maxPayload: DEFAULT_CONFIG.maxMessageSizeBytes
    });

    this.setupHandlers();
    this.startHeartbeat();
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.extractClientId(req);
      const clientType = this.extractClientType(req);

      // Check connection limits
      const limitCheck = this.limiter.canAccept(clientId);
      if (!limitCheck.allowed) {
        logger.warn('FORGE', 'Connection rejected', { clientId, reason: limitCheck.reason });
        ws.close(1013, limitCheck.reason);
        return;
      }

      // Register client
      const client: ForgeClient = {
        id: clientId,
        type: clientType,
        ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
        missedPings: 0
      };

      this.clients.set(clientId, client);
      this.limiter.add(clientId, ws);

      logger.info('FORGE', 'WebSocket client connected', {
        clientId,
        clientType,
        total: this.clients.size
      });

      // Send welcome message
      this.sendToClient(client, {
        event: 'connected',
        version: CURRENT_VERSION,
        supportedVersions: SUPPORTED_VERSIONS,
        clientId,
        serverTime: Date.now()
      });

      // Handle messages
      ws.on('message', (data) => this.handleMessage(client, data));

      // Handle disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        this.limiter.remove(clientId, ws);
        logger.info('FORGE', 'WebSocket client disconnected', {
          clientId,
          total: this.clients.size
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.warn('FORGE', 'WebSocket error', { clientId, error: error.message });
      });
    });
  }

  private handleMessage(client: ForgeClient, data: RawData): void {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.action) {
        case 'subscribe':
          this.handleSubscribe(client, message.sessionId as string);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(client, message.sessionId as string);
          break;

        case 'accept-hunk':
          this.handleAcceptHunk(client, message);
          break;

        case 'reject-hunk':
          this.handleRejectHunk(client, message);
          break;

        case 'pong':
          client.lastPing = Date.now();
          client.missedPings = 0;
          break;

        default:
          logger.warn('FORGE', 'Unknown action', { clientId: client.id, action: message.action });
      }
    } catch (error) {
      logger.warn('FORGE', 'Failed to parse message', { clientId: client.id, error });
    }
  }

  private handleSubscribe(client: ForgeClient, sessionId: string): void {
    client.subscriptions.add(sessionId);
    logger.debug('FORGE', 'Client subscribed', { clientId: client.id, sessionId });

    // Send pending changes for this session
    this.sendPendingChanges(client, sessionId);
  }

  private handleUnsubscribe(client: ForgeClient, sessionId: string): void {
    client.subscriptions.delete(sessionId);
    logger.debug('FORGE', 'Client unsubscribed', { clientId: client.id, sessionId });
  }

  private async handleAcceptHunk(client: ForgeClient, message: ClientMessage): Promise<void> {
    const { changeId, hunkIndex } = message as { changeId: string; hunkIndex: number };

    // Update database
    await this.recordDecision(changeId, hunkIndex, 'accepted', client.type);

    // Broadcast to other clients
    this.broadcastToSession(this.getSessionForChange(changeId), {
      type: 'hunk-decision',
      version: 1,
      payload: { changeId, hunkIndex, decision: 'accepted', decidedBy: client.type }
    }, client.id);
  }

  private async handleRejectHunk(client: ForgeClient, message: ClientMessage): Promise<void> {
    const { changeId, hunkIndex } = message as { changeId: string; hunkIndex: number };

    // Revert the hunk
    await this.revertHunk(changeId, hunkIndex);

    // Update database
    await this.recordDecision(changeId, hunkIndex, 'rejected', client.type);

    // Broadcast to other clients
    this.broadcastToSession(this.getSessionForChange(changeId), {
      type: 'hunk-decision',
      version: 1,
      payload: { changeId, hunkIndex, decision: 'rejected', decidedBy: client.type }
    }, client.id);
  }

  /**
   * Broadcast event to all clients subscribed to a session
   */
  broadcastToSession(sessionId: string, event: ForgeWebSocketEvent, excludeClientId?: string): void {
    for (const client of this.clients.values()) {
      if (client.subscriptions.has(sessionId) && client.id !== excludeClientId) {
        this.sendToClient(client, event);
      }
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastAll(event: ForgeWebSocketEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  /**
   * Send event to specific client
   */
  private sendToClient(client: ForgeClient, event: unknown): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Heartbeat to detect stale connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      for (const [clientId, client] of this.clients) {
        // Check if pong overdue
        if (now - client.lastPing > DEFAULT_CONFIG.heartbeatIntervalMs + DEFAULT_CONFIG.heartbeatTimeoutMs) {
          client.missedPings++;

          if (client.missedPings >= DEFAULT_CONFIG.maxHeartbeatFailures) {
            logger.warn('FORGE', 'Client stale, disconnecting', { clientId, missedPings: client.missedPings });
            client.ws.terminate();
            continue;
          }
        }

        // Send ping
        this.sendToClient(client, { event: 'ping', timestamp: now });
      }
    }, DEFAULT_CONFIG.heartbeatIntervalMs);
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const client of this.clients.values()) {
      client.ws.close(1001, 'Server shutting down');
    }

    this.wss.close();
  }

  // Helper methods (implementation details omitted)
  private extractClientId(req: unknown): string { /* ... */ return ''; }
  private extractClientType(req: unknown): 'vscode' | 'browser' | 'unknown' { /* ... */ return 'unknown'; }
  private async sendPendingChanges(client: ForgeClient, sessionId: string): Promise<void> { /* ... */ }
  private async recordDecision(changeId: string, hunkIndex: number, decision: string, source: string): Promise<void> { /* ... */ }
  private async revertHunk(changeId: string, hunkIndex: number): Promise<void> { /* ... */ }
  private getSessionForChange(changeId: string): string { /* ... */ return ''; }
}
```

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **WebSocket connection instability** | High | Medium | Reconnection with exponential backoff, SSE fallback for read-only mode |
| **Haiku rate limiting breaks summaries** | Medium | Medium | Token bucket rate limiter, fallback to generic summaries |
| **Large terminal output causes OOM** | High | Low | 1MB limit per command, truncation with head/tail preservation |
| **Connection storms on restart** | Medium | Low | Staggered reconnection with jitter, max connections limit |
| **Message ordering issues** | Medium | Medium | Sequence numbers per terminal, gap detection, replay on reconnect |
| **Hunk reversion causes data loss** | High | Low | Store original content, soft delete before hard delete, undo support |
| **Cross-client state sync failures** | Medium | Medium | Single source of truth (database), broadcast decisions to all clients |
| **VS Code extension crash** | Medium | Medium | Extension isolates WebSocket logic, graceful degradation to polling |
| **Latency exceeds 1s target** | High | Medium | Performance monitoring, skip Haiku if behind, batch broadcasts |
| **Proxy blocks WebSocket** | Low | High | WSS (TLS), fallback to HTTP long-polling or SSE |

---

## Recommendations

### Priority 1: Foundation (Week 1)

1. **Create WebSocketHub service** extending existing Express server
   - Path: `/api/forge/live`
   - Authentication via `x-client-id` header
   - Connection limiter (100 max, 5 per client)
   - Heartbeat at 30s interval

2. **Define event schema** with TypeScript interfaces
   - Version field in all events
   - Timestamp field in all events
   - Strict type checking via discriminated unions

3. **Implement reconnection manager** for VS Code extension
   - Exponential backoff with jitter
   - Max 10 attempts before giving up
   - Reset on successful connection

### Priority 2: Terminal Streaming (Week 2)

4. **Enhance PostToolUse hook** for Bash tool
   - Capture stdout/stderr separately
   - Preserve ANSI codes
   - Buffer by line, flush every 100ms

5. **Implement TerminalBufferManager**
   - 100 line buffer, 64KB max
   - Sequence numbers for ordering
   - Large output truncation (1MB limit)

6. **Add terminal-output broadcast**
   - Filter by session subscription
   - Include exit code on completion

### Priority 3: Change Streaming (Week 2-3)

7. **Implement ChangeTracker service**
   - Unified diff generation
   - Hunk parsing with line numbers
   - Storage in forge_pending_changes

8. **Implement HunkProcessor**
   - Parallel Haiku calls (3 concurrent)
   - Rate limiting (50 RPM)
   - Caching of hunk summaries

9. **Add file-change broadcast**
   - Include hunk summaries
   - Include change summary
   - Filter by session subscription

### Priority 4: Bidirectional Actions (Week 3)

10. **Implement hunk accept/reject handlers**
    - Update database
    - Revert file on reject
    - Broadcast decision to other clients

11. **Implement decision recording**
    - forge_change_decisions table
    - Track acceptance rate per agent
    - Learn from patterns

### Priority 5: Integration (Week 4)

12. **Create BroadcastManager**
    - Route events to SSE or WebSocket
    - Handle protocol fallback
    - Unified subscription management

13. **Add monitoring and metrics**
    - Connection count gauge
    - Latency histogram
    - Error rate counter
    - Broadcast throughput

14. **Document protocol**
    - OpenAPI-style WebSocket documentation
    - Event catalog with examples
    - VS Code extension integration guide

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Terminal-to-VS Code latency** | <1s (P50), <2s (P95) | Timestamp tracking in events |
| **File change latency** | <800ms (P50), <1.5s (P95) | Timestamp tracking in events |
| **Connection success rate** | >99% | Successful connects / attempts |
| **Reconnection success rate** | >95% | Successful reconnects / failures |
| **Message delivery rate** | >99.9% | Delivered / sent (with sequence gaps) |
| **Haiku summary quality** | >4/5 user rating | Manual validation |
| **Hunk acceptance rate** | >85% | Accepted / (accepted + rejected) |
| **WebSocket uptime** | >99.9% | Connection duration / session duration |

---

## Appendix: Database Schema for Streaming

```sql
-- Pending changes awaiting review
CREATE TABLE forge_pending_changes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  file_path TEXT NOT NULL,
  agent TEXT,
  tool TEXT NOT NULL CHECK (tool IN ('Edit', 'Write')),
  before_content TEXT,
  after_content TEXT NOT NULL,
  hunks JSON NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Hunk-level decisions
CREATE TABLE forge_change_decisions (
  id INTEGER PRIMARY KEY,
  change_id TEXT NOT NULL REFERENCES forge_pending_changes(id),
  hunk_index INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  decided_in TEXT CHECK (decided_in IN ('vscode', 'browser')),
  decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(change_id, hunk_index)
);

-- Terminal output ring buffer (last 100 commands per session)
CREATE TABLE forge_terminal_output (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  terminal_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('stdout', 'stderr')),
  content TEXT NOT NULL,
  exit_code INTEGER,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(session_id, terminal_id, sequence_number)
);

-- Indexes for fast querying
CREATE INDEX idx_pending_changes_session ON forge_pending_changes(session_id);
CREATE INDEX idx_pending_changes_status ON forge_pending_changes(status);
CREATE INDEX idx_terminal_output_session ON forge_terminal_output(session_id, terminal_id);
```

---

## Appendix: VS Code Extension Integration

```typescript
// forge-vscode/src/api/ForgeWebSocketClient.ts

import WebSocket from 'ws';

export class ForgeWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectManager: ReconnectionManager;
  private eventHandlers: Map<string, Set<(payload: unknown) => void>> = new Map();

  constructor(
    private baseUrl: string = 'ws://localhost:37777',
    private clientId: string = `vscode-${Date.now()}`
  ) {
    this.reconnectManager = new ReconnectionManager(DEFAULT_CONFIG);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.baseUrl}/api/forge/live`, {
        headers: {
          'x-client-id': this.clientId,
          'x-client-type': 'vscode'
        }
      });

      this.ws.on('open', () => {
        console.log('Forge WebSocket connected');
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('close', () => {
        console.log('Forge WebSocket disconnected');
        this.reconnectManager.reconnect(() => this.connect());
      });

      this.ws.on('error', reject);
    });
  }

  subscribe(sessionId: string): void {
    this.send({ action: 'subscribe', sessionId });
  }

  unsubscribe(sessionId: string): void {
    this.send({ action: 'unsubscribe', sessionId });
  }

  acceptHunk(changeId: string, hunkIndex: number): void {
    this.send({ action: 'accept-hunk', changeId, hunkIndex });
  }

  rejectHunk(changeId: string, hunkIndex: number): void {
    this.send({ action: 'reject-hunk', changeId, hunkIndex });
  }

  on(event: string, handler: (payload: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      const handlers = this.eventHandlers.get(message.type || message.event);
      if (handlers) {
        for (const handler of handlers) {
          handler(message.payload);
        }
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.ws?.close();
  }
}
```

---

*Assessment complete. Ready for implementation planning.*
