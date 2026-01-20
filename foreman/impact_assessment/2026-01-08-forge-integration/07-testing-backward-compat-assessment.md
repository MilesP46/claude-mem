# Testing & Backward Compatibility Impact Assessment

## Executive Summary

The Forge integration introduces a significant expansion to claude-mem's capabilities, including database-backed artifact management, real-time WebSocket synchronization, VS Code extension integration, and behavior learning systems. This assessment outlines a comprehensive testing strategy to ensure quality while maintaining backward compatibility with existing installations.

The core principle guiding this assessment is **feature flags as the safety mechanism**. All Forge functionality will be gated behind a master `FORGE_ENABLED` flag (default: `false`), ensuring existing users experience zero disruption. The testing strategy employs a three-tier approach: unit tests for individual services with 80%+ coverage, integration tests for pipeline validation, and E2E tests for VS Code extension and browser UI verification.

Critical to success is the database migration strategy, which adds new tables without modifying existing ones. The `forge_*` table prefix creates a clean namespace separation. All migrations include reversible `down` procedures, and the existing 20+ migration files in `src/services/sqlite/migrations/` provide a proven pattern to follow.

## Unit Test Strategy

### New Test Files

The following test files should be created to cover new Forge services:

```
tests/forge/
  bridge/
    session-bridge.test.ts        # Session registration and lifecycle
    change-tracker.test.ts        # Unified diff generation and hunk parsing
    hunk-processor.test.ts        # Individual hunk extraction and manipulation
    websocket-hub.test.ts         # WebSocket connection management and broadcasting

  artifacts/
    artifact-indexer.test.ts      # File scanning and artifact discovery
    artifact-sync.test.ts         # Bidirectional file-DB synchronization
    relation-detector.test.ts     # @reference parsing and relationship inference
    checksum-manager.test.ts      # Content hash generation for conflict detection

  behaviors/
    pattern-detector.test.ts      # Terminal command pattern extraction
    behavior-learner.test.ts      # Confidence scoring and behavior aggregation
    terminal-observer.test.ts     # Terminal session tracking

  planning/
    pipeline-tracker.test.ts      # Chain workflow state management
    decision-manager.test.ts      # Decision storage and retrieval
    decision-branch.test.ts       # Decision branching and merging
    template-tracker.test.ts      # Template usage and completeness tracking
    capability-gap-detector.test.ts  # Gap identification from patterns

  sqlite/
    forge-migrations.test.ts      # Migration up/down procedures
    forge-artifacts.test.ts       # Artifact CRUD operations
    forge-relations.test.ts       # Relation CRUD operations
    forge-executions.test.ts      # Execution tracking operations
    forge-behaviors.test.ts       # Behavior storage operations
    forge-planning.test.ts        # Planning state operations
    forge-pending-changes.test.ts # Change queue operations

  routes/
    forge-routes.test.ts          # Artifact API endpoints
    planning-routes.test.ts       # Planning API endpoints
    bridge-routes.test.ts         # Bridge API endpoints

  feature-flags/
    forge-flags.test.ts           # Feature flag evaluation logic
```

### Coverage Targets

| Service | Target Coverage | Rationale |
|---------|-----------------|-----------|
| SessionBridge | 90% | Critical path for terminal-to-editor bridge |
| ChangeTracker | 85% | Core diff processing, edge cases matter |
| HunkProcessor | 90% | Complex parsing logic, many edge cases |
| ArtifactIndexer | 80% | File I/O heavy, mock-intensive |
| BehaviorLearner | 85% | Confidence scoring accuracy critical |
| WebSocketHub | 80% | Connection management, harder to unit test |
| PlanningDecisionManager | 85% | Decision integrity critical |
| ForgeMigrations | 95% | Migration correctness essential |
| ForgeRoutes | 80% | HTTP endpoint validation |
| FeatureFlags | 95% | Gate correctness essential |

### Mock Strategy

Following the established patterns in the codebase:

**Database Mocking:**
```typescript
// Pattern from tests/sqlite/sessions.test.ts
import { ClaudeMemDatabase } from '../../src/services/sqlite/Database.js';

describe('ForgeArtifacts', () => {
  let db: Database;

  beforeEach(() => {
    db = new ClaudeMemDatabase(':memory:').db;
  });

  afterEach(() => {
    db.close();
  });
});
```

**Module Mocking:**
```typescript
// Pattern from tests/server/server.test.ts
mock.module('../../src/utils/logger.js', () => ({
  logger: {
    info: () => {},
    debug: () => {},
    warn: () => {},
    error: () => {},
  },
}));

// Mock WebSocket for bridge tests
mock.module('ws', () => ({
  WebSocketServer: class MockWSS {
    on() {}
    clients = new Set();
  },
  WebSocket: class MockWS {
    send() {}
    close() {}
    readyState = 1;
  },
}));
```

**Fetch Mocking:**
```typescript
// Pattern from tests/infrastructure/health-monitor.test.ts
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

it('should handle API call', async () => {
  global.fetch = mock(() => Promise.resolve({ ok: true } as Response));
  // test logic
});
```

**Factory Functions:**
```typescript
// Create consistent test data
function createMockArtifact(overrides: Partial<ForgeArtifact> = {}): ForgeArtifact {
  return {
    id: 'artifact-' + Math.random().toString(36).slice(2),
    project_id: 'test-project',
    artifact_type: 'command',
    name: 'test-command',
    description: 'Test description',
    content: '# Test Command\n\nContent here',
    frontmatter: '{}',
    checksum: 'abc123',
    format_version: '1.0',
    format_valid: true,
    format_errors: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockChange(overrides: Partial<RawChange> = {}): RawChange {
  return {
    session_id: 'session-123',
    file_path: '/path/to/file.ts',
    tool: 'Edit',
    before_content: 'const x = 1;',
    after_content: 'const x = 2;',
    agent: 'forge-backend-worker',
    timestamp: Date.now(),
    ...overrides,
  };
}

function createMockHunk(overrides: Partial<ChangeHunk> = {}): ChangeHunk {
  return {
    id: 'hunk-' + Math.random().toString(36).slice(2),
    startLine: 1,
    endLine: 5,
    lines: ['-const x = 1;', '+const x = 2;'],
    original: 'const x = 1;',
    modified: 'const x = 2;',
    status: 'pending',
    summary: 'Update variable value',
    ...overrides,
  };
}
```

## Integration Test Strategy

### Test Scenarios

**1. Hook-to-Worker-to-Database Pipeline:**
```typescript
describe('Forge Pipeline Integration', () => {
  it('should process Edit tool use through complete pipeline', async () => {
    // 1. Simulate PostToolUse hook with Edit payload
    // 2. Verify worker receives and processes change
    // 3. Verify change stored in forge_pending_changes
    // 4. Verify WebSocket broadcast occurs
  });

  it('should handle session registration flow', async () => {
    // 1. Simulate SessionStart hook
    // 2. Verify forge_bridge_sessions entry created
    // 3. Verify session available via WebSocket
  });

  it('should track artifact executions', async () => {
    // 1. Create artifact
    // 2. Record execution start
    // 3. Record execution end with status
    // 4. Verify forge_executions populated
    // 5. Verify observation_ids linked correctly
  });
});
```

**2. WebSocket Flow Integration:**
```typescript
describe('WebSocket Integration', () => {
  it('should broadcast changes to connected clients', async () => {
    // 1. Connect WebSocket client
    // 2. Post change via API
    // 3. Verify client receives agent_change message
  });

  it('should handle client reconnection', async () => {
    // 1. Connect client
    // 2. Disconnect client
    // 3. Reconnect client
    // 4. Verify pending changes sent on reconnect
  });

  it('should synchronize multiple clients', async () => {
    // 1. Connect VS Code client
    // 2. Connect browser client
    // 3. Post change
    // 4. Verify both clients receive message
  });
});
```

**3. Artifact Sync Integration:**
```typescript
describe('Artifact Sync Integration', () => {
  it('should sync file edit to database', async () => {
    // 1. Create artifact file on disk
    // 2. Trigger file watcher
    // 3. Verify database updated with new checksum
  });

  it('should detect conflict on concurrent edit', async () => {
    // 1. Create artifact in DB
    // 2. Modify file with different checksum
    // 3. Modify DB with different content
    // 4. Verify conflict detection triggers
  });
});
```

**4. Behavior Learning Integration:**
```typescript
describe('Behavior Learning Integration', () => {
  it('should learn from terminal commands', async () => {
    // 1. Record multiple "npm run dev" commands
    // 2. Verify behavior confidence increases
    // 3. Verify behavior available in context
  });

  it('should integrate behaviors into planning context', async () => {
    // 1. Record behavior patterns
    // 2. Start new planning session
    // 3. Verify behaviors injected into context
  });
});
```

### Test Infrastructure

**Server Setup Helper:**
```typescript
// tests/forge/helpers/server-setup.ts
import { Server } from '../../../src/services/server/Server.js';

export async function createTestServer(): Promise<{
  server: Server;
  port: number;
  cleanup: () => Promise<void>;
}> {
  const port = 40000 + Math.floor(Math.random() * 10000);
  const server = new Server({
    getInitializationComplete: () => true,
    getMcpReady: () => true,
    onShutdown: () => Promise.resolve(),
    onRestart: () => Promise.resolve(),
  });

  await server.listen(port, '127.0.0.1');

  return {
    server,
    port,
    cleanup: async () => {
      try { await server.close(); } catch {}
    },
  };
}
```

**WebSocket Test Client:**
```typescript
// tests/forge/helpers/ws-client.ts
import WebSocket from 'ws';

export class TestWSClient {
  private ws: WebSocket | null = null;
  private messages: any[] = [];

  async connect(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://127.0.0.1:${port}/api/forge/live`);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        this.messages.push(JSON.parse(data.toString()));
      });
    });
  }

  getMessages(): any[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  disconnect(): void {
    this.ws?.close();
  }
}
```

**Database Seeding:**
```typescript
// tests/forge/helpers/seed-db.ts
export async function seedForgeTestData(db: Database): Promise<{
  artifact: ForgeArtifact;
  session: ForgeBridgeSession;
  change: ForgePendingChange;
}> {
  // Create base session first (required FK)
  const sessionId = createSDKSession(db, 'test-content-123', 'test-project', 'test prompt');

  // Create forge bridge session
  const bridgeSession = createBridgeSession(db, {
    session_id: sessionId,
    terminal_pid: 12345,
    terminal_type: 'iTerm2',
    project_root: '/test/project',
    started_at: new Date().toISOString(),
  });

  // Create artifact
  const artifact = createArtifact(db, createMockArtifact());

  // Create pending change
  const change = createPendingChange(db, createMockChange({ session_id: sessionId }));

  return { artifact, session: bridgeSession, change };
}
```

## E2E Test Strategy

### VS Code Extension

**Testing Approach:**
- Use VS Code Extension Testing framework (`@vscode/test-electron`)
- Run in headless mode for CI
- Test activation, commands, providers, and WebView

**Test Scenarios:**
```typescript
// forge-vscode/src/test/suite/extension.test.ts
describe('Forge Extension E2E', () => {
  describe('Activation', () => {
    it('should activate when .claude directory exists', async () => {
      // Create workspace with .claude directory
      // Verify extension activates
      // Verify ArtifactTreeProvider registered
    });

    it('should not activate without .claude directory', async () => {
      // Create workspace without .claude
      // Verify extension does not activate
    });
  });

  describe('Agent Changes', () => {
    it('should display pending changes in tree view', async () => {
      // Connect to worker
      // Trigger change via API
      // Verify AgentChangesProvider updates
    });

    it('should apply inline decorations for changes', async () => {
      // Open file with pending changes
      // Verify decoration applied
      // Verify CodeLens appears
    });

    it('should handle Accept action', async () => {
      // Execute forge.acceptHunk command
      // Verify hunk marked accepted
      // Verify decoration removed
    });

    it('should handle Reject action', async () => {
      // Execute forge.rejectHunk command
      // Verify content reverted
      // Verify decoration removed
    });
  });

  describe('Artifact Navigation', () => {
    it('should navigate to definition on @reference click', async () => {
      // Open file with @agent/test-agent reference
      // Execute go-to-definition
      // Verify correct file opens
    });

    it('should provide autocomplete for @ references', async () => {
      // Trigger completion at @ position
      // Verify artifact suggestions appear
    });
  });
});
```

**VS Code Test Configuration:**
```json
// forge-vscode/src/test/runTest.ts
import { runTests } from '@vscode/test-electron';
import path from 'path';

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '../../');
  const extensionTestsPath = path.resolve(__dirname, './suite/index');
  const testWorkspace = path.resolve(__dirname, './fixtures/test-workspace');

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, '--disable-extensions'],
  });
}

main();
```

### Browser UI

**Testing Approach:**
- Use Playwright for browser automation
- Test against local worker service
- Cover component rendering, interactions, and WebSocket updates

**Test Scenarios:**
```typescript
// tests/e2e/forge-browser.test.ts
import { test, expect } from '@playwright/test';

test.describe('Forge Browser UI', () => {
  test.beforeAll(async () => {
    // Start worker service
  });

  test.afterAll(async () => {
    // Stop worker service
  });

  test('should render artifact tree', async ({ page }) => {
    await page.goto('http://localhost:37777');
    await expect(page.locator('[data-testid="artifact-tree"]')).toBeVisible();
  });

  test('should filter artifacts by type', async ({ page }) => {
    await page.goto('http://localhost:37777');
    await page.click('[data-testid="filter-commands"]');
    await expect(page.locator('[data-testid="artifact-item"]')).toHaveCount(/* expected count */);
  });

  test('should update in real-time via WebSocket', async ({ page }) => {
    await page.goto('http://localhost:37777');

    // Post change via API
    await fetch('http://localhost:37777/api/forge/changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createMockChange()),
    });

    // Verify UI updates
    await expect(page.locator('[data-testid="pending-changes-badge"]')).toContainText('1');
  });

  test('should display decision explorer', async ({ page }) => {
    await page.goto('http://localhost:37777/planning');
    await expect(page.locator('[data-testid="decision-explorer"]')).toBeVisible();
  });
});
```

### Full Pipeline E2E

**Test Scenarios:**
```typescript
// tests/e2e/forge-pipeline.test.ts
test.describe('Forge Full Pipeline', () => {
  test('terminal edit flows to VS Code display', async () => {
    // 1. Start worker service
    // 2. Start VS Code extension in test mode
    // 3. Simulate PostToolUse hook call (Edit tool)
    // 4. Verify change appears in VS Code AgentChanges view
    // 5. Verify file shows inline decorations
    // 6. Accept change
    // 7. Verify file content updated
    // 8. Verify change removed from pending
  });

  test('artifact creation syncs to database', async () => {
    // 1. Create .claude/commands/test-cmd.md file
    // 2. Verify database artifact entry created
    // 3. Verify relations detected from @references
    // 4. Modify file
    // 5. Verify database updated with new checksum
  });

  test('planning workflow tracks decisions', async () => {
    // 1. Start chain workflow
    // 2. Verify pipeline state created
    // 3. Make planning decision
    // 4. Verify decision recorded
    // 5. Lock decision
    // 6. Verify status updated
  });
});
```

## Backward Compatibility

### API Compatibility

**Existing Endpoints Unchanged:**
All existing claude-mem API endpoints remain untouched:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/health` | Unchanged | Core health check |
| `GET /api/readiness` | Unchanged | Readiness probe |
| `GET /api/version` | Unchanged | Version info |
| `POST /api/observe` | Unchanged | Observation storage |
| `POST /api/summarize` | Unchanged | Session summarization |
| `GET /api/search` | Unchanged | Memory search |
| `GET /api/context` | Unchanged | Context generation |
| All MCP endpoints | Unchanged | MCP protocol unchanged |

**New Endpoints (Forge-specific):**
All Forge endpoints use `/api/forge/` prefix for clean separation:

```
GET  /api/forge/artifacts
POST /api/forge/artifacts
PUT  /api/forge/artifacts/:id
DELETE /api/forge/artifacts/:id

GET  /api/forge/relations
GET  /api/forge/behaviors
POST /api/forge/terminals
GET  /api/forge/executions

GET  /api/forge/planning/pipeline
GET  /api/forge/planning/decisions
POST /api/forge/planning/decisions/:id/lock
POST /api/forge/planning/decisions/:id/override

POST /api/forge/session/register
POST /api/forge/changes
POST /api/forge/decisions

WS   /api/forge/live
WS   /api/forge/sync
```

### Database Compatibility

**Migration Safety:**

1. **Table Namespace:** All new tables use `forge_` prefix
   - No collision with existing tables (`sessions`, `observations`, `summaries`, etc.)
   - Clear separation between core claude-mem and Forge tables

2. **Foreign Key References:**
   - `forge_executions.session_id` references existing `sessions.id`
   - `forge_bridge_sessions.session_id` references existing `sessions.id`
   - These are additive references, not modifications to existing tables

3. **Migration Structure:**
```typescript
// src/services/sqlite/migrations/021-forge-tables.ts
export const migration: Migration = {
  version: 21,
  up: (db: Database) => {
    // Create all forge_* tables
    db.run(`CREATE TABLE forge_artifacts (...)`);
    db.run(`CREATE TABLE forge_relations (...)`);
    // etc.
  },
  down: (db: Database) => {
    // Drop in reverse order to handle foreign keys
    db.run(`DROP TABLE IF EXISTS forge_change_decisions`);
    db.run(`DROP TABLE IF EXISTS forge_pending_changes`);
    // etc.
  },
};
```

4. **Index Safety:**
   - All new indexes use `idx_forge_*` prefix
   - No modification to existing indexes

**Rollback Testing:**
```typescript
describe('Forge Migration Rollback', () => {
  it('should cleanly rollback forge tables', () => {
    // 1. Apply migration up
    // 2. Insert test data
    // 3. Apply migration down
    // 4. Verify core tables unaffected
    // 5. Verify forge tables removed
    // 6. Re-apply migration up
    // 7. Verify clean state
  });
});
```

### Plugin Compatibility

**Activation Behavior:**

1. **Hook Changes (Minimal):**
   - `session-start-hook.ts`: Adds optional Forge registration call
   - `post-tool-use-hook.ts`: Adds optional change capture
   - Both changes gated by `FORGE_ENABLED` flag
   - When flag is `false`, hooks behave exactly as before

2. **Worker Service:**
   - Forge routes only registered when `FORGE_ENABLED=true`
   - WebSocket hub only initialized when `FORGE_ENABLED=true`
   - No impact on existing route handling

3. **Settings Migration:**
   - New settings added to `~/.claude-mem/settings.json`
   - Default values ensure backward compatibility
   - Existing settings remain unchanged

**Compatibility Test:**
```typescript
describe('Backward Compatibility', () => {
  it('should work identically with FORGE_ENABLED=false', async () => {
    process.env.FORGE_ENABLED = 'false';

    // Full existing test suite should pass
    // No Forge tables created
    // No Forge routes registered
    // No WebSocket hub started
  });

  it('should preserve existing hook behavior', async () => {
    process.env.FORGE_ENABLED = 'false';

    // PostToolUse hook should only call /api/observe
    // No calls to /api/forge/* endpoints
  });
});
```

## Feature Flags

### Flag Definitions

```typescript
// src/services/forge/feature-flags.ts
export interface ForgeFeatureFlags {
  /** Master switch for all Forge functionality */
  FORGE_ENABLED: boolean;

  /** Enable terminal command tracking and behavior learning */
  FORGE_TERMINAL_TRACKING: boolean;

  /** Enable automatic artifact detection and indexing */
  FORGE_ARTIFACT_DETECTION: boolean;

  /** Enable WebSocket real-time streaming to clients */
  FORGE_WEBSOCKET_STREAMING: boolean;

  /** Enable VS Code extension integration endpoints */
  FORGE_VSCODE_EXTENSION: boolean;

  /** Enable behavior learning from terminal patterns */
  FORGE_BEHAVIOR_LEARNING: boolean;

  /** Enable planning layer (pipeline tracker, decisions, templates) */
  FORGE_PLANNING_LAYER: boolean;
}

export function getForgeFlags(): ForgeFeatureFlags {
  const env = process.env;

  // Master flag must be true for any sub-flags to apply
  const masterEnabled = env.FORGE_ENABLED === 'true';

  return {
    FORGE_ENABLED: masterEnabled,
    FORGE_TERMINAL_TRACKING: masterEnabled && env.FORGE_TERMINAL_TRACKING !== 'false',
    FORGE_ARTIFACT_DETECTION: masterEnabled && env.FORGE_ARTIFACT_DETECTION !== 'false',
    FORGE_WEBSOCKET_STREAMING: masterEnabled && env.FORGE_WEBSOCKET_STREAMING !== 'false',
    FORGE_VSCODE_EXTENSION: masterEnabled && env.FORGE_VSCODE_EXTENSION !== 'false',
    FORGE_BEHAVIOR_LEARNING: masterEnabled && env.FORGE_BEHAVIOR_LEARNING !== 'false',
    FORGE_PLANNING_LAYER: masterEnabled && env.FORGE_PLANNING_LAYER !== 'false',
  };
}

export function isForgeEnabled(): boolean {
  return getForgeFlags().FORGE_ENABLED;
}
```

### Default Values

| Flag | Default | Rationale |
|------|---------|-----------|
| `FORGE_ENABLED` | `false` | Master safety switch - opt-in required |
| `FORGE_TERMINAL_TRACKING` | `true` (if master on) | Core functionality |
| `FORGE_ARTIFACT_DETECTION` | `true` (if master on) | Core functionality |
| `FORGE_WEBSOCKET_STREAMING` | `true` (if master on) | Real-time updates essential |
| `FORGE_VSCODE_EXTENSION` | `true` (if master on) | Primary UI |
| `FORGE_BEHAVIOR_LEARNING` | `true` (if master on) | Core intelligence |
| `FORGE_PLANNING_LAYER` | `false` (if master on) | Advanced feature, later rollout |

### Rollout Strategy

**Phase 1: Internal Testing (Week 1-2)**
- `FORGE_ENABLED=true` for development team only
- All sub-flags enabled
- Monitor for issues, collect feedback

**Phase 2: Alpha Users (Week 3-4)**
- `FORGE_ENABLED=true` via opt-in setting
- Documentation for early adopters
- `FORGE_PLANNING_LAYER=false` (not ready)

**Phase 3: Beta Release (Week 5-6)**
- Wider availability with explicit opt-in
- All core flags enabled
- `FORGE_PLANNING_LAYER=true` for select users

**Phase 4: General Availability (Week 7+)**
- Consider `FORGE_ENABLED=true` as default
- All flags enabled by default
- Legacy mode documentation for opt-out

## Rollback Plan

### Migration Rollback

**Step-by-Step Procedure:**

1. **Stop Worker Service:**
   ```bash
   claude-mem stop
   ```

2. **Backup Current Database:**
   ```bash
   cp ~/.claude-mem/claude-mem.db ~/.claude-mem/claude-mem.db.backup-$(date +%Y%m%d)
   ```

3. **Run Migration Down:**
   ```typescript
   // Via CLI command
   claude-mem migrate down --to 20  // Last pre-Forge migration
   ```

4. **Verify Core Tables:**
   ```bash
   sqlite3 ~/.claude-mem/claude-mem.db ".tables"
   # Should show only core tables (sessions, observations, etc.)
   ```

5. **Restart Worker:**
   ```bash
   FORGE_ENABLED=false claude-mem start
   ```

6. **Verify Health:**
   ```bash
   curl http://localhost:37777/api/health
   ```

### Feature Disable

**Emergency Disable Process:**

1. **Immediate Disable (Environment Variable):**
   ```bash
   # Add to shell profile or systemd service
   export FORGE_ENABLED=false
   claude-mem restart
   ```

2. **Persistent Disable (Settings):**
   ```json
   // ~/.claude-mem/settings.json
   {
     "forge": {
       "enabled": false
     }
   }
   ```

3. **Selective Disable (Individual Features):**
   ```bash
   export FORGE_ENABLED=true
   export FORGE_WEBSOCKET_STREAMING=false  # Disable problematic feature
   claude-mem restart
   ```

### Data Preservation During Rollback

**Forge Data Preservation:**
- Forge tables remain in database even when disabled
- Data accessible for debugging/analysis
- Can be exported before full removal:

```sql
-- Export decisions before rollback
.mode csv
.output forge_decisions_export.csv
SELECT * FROM forge_planning_decisions;
.output stdout

-- Export artifacts
.output forge_artifacts_export.csv
SELECT * FROM forge_artifacts;
.output stdout
```

**Clean Removal (if needed):**
```bash
# Full removal of Forge data (irreversible)
claude-mem forge --cleanup
```

## CI/CD Changes

### Build Pipeline

**New Build Steps:**

1. **VS Code Extension Build:**
   ```yaml
   # .github/workflows/build.yml
   jobs:
     build-extension:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'

         - name: Install dependencies
           run: cd forge-vscode && npm ci

         - name: Compile extension
           run: cd forge-vscode && npm run compile

         - name: Package VSIX
           run: cd forge-vscode && npx vsce package

         - name: Upload VSIX artifact
           uses: actions/upload-artifact@v4
           with:
             name: forge-vscode-vsix
             path: forge-vscode/*.vsix
   ```

2. **Extension Publishing:**
   ```yaml
   # On release tag
   publish-extension:
     needs: [build-extension, test]
     if: startsWith(github.ref, 'refs/tags/v')
     steps:
       - name: Download VSIX
         uses: actions/download-artifact@v4
         with:
           name: forge-vscode-vsix

       - name: Publish to VS Code Marketplace
         run: npx vsce publish
         env:
           VSCE_PAT: ${{ secrets.VSCE_PAT }}
   ```

### Test Pipeline

**New Test Stages:**

```yaml
# .github/workflows/test.yml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun test tests/

      - name: Run Forge unit tests
        run: bun test tests/forge/

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    services:
      # Chroma for vector search tests
      chroma:
        image: chromadb/chroma:latest
        ports:
          - 8000:8000
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Run integration tests
        run: bun test tests/integration/
        env:
          FORGE_ENABLED: 'true'

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start worker service
        run: bun run src/services/worker-service.ts start &
        env:
          FORGE_ENABLED: 'true'

      - name: Wait for worker
        run: |
          for i in {1..30}; do
            curl -s http://localhost:37777/api/readiness && break
            sleep 1
          done

      - name: Run E2E tests
        run: npx playwright test tests/e2e/

  vscode-extension-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: cd forge-vscode && npm ci

      - name: Run extension tests
        run: xvfb-run -a npm test
        working-directory: forge-vscode

  backward-compat-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Run with Forge disabled
        run: bun test tests/
        env:
          FORGE_ENABLED: 'false'

      - name: Verify no Forge tables created
        run: |
          bun run scripts/verify-no-forge-tables.ts

  performance-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Run performance benchmarks
        run: bun run scripts/benchmark.ts

      - name: Compare with baseline
        run: bun run scripts/compare-benchmark.ts

      - name: Fail on regression
        run: |
          if [ -f benchmark-regression.txt ]; then
            cat benchmark-regression.txt
            exit 1
          fi
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration corrupts existing data | Low | Critical | Additive-only migrations; backup before apply; tested rollback |
| WebSocket overwhelms worker | Medium | High | Connection limits; rate limiting; backpressure handling |
| Feature flag bypass | Low | Medium | Centralized flag evaluation; unit tests for flag logic |
| VS Code extension compatibility | Medium | Medium | Test on multiple VS Code versions; extension API versioning |
| Behavior learning privacy concerns | Medium | Medium | Clear documentation; opt-out flag; no PII in patterns |
| Performance regression | Medium | High | Benchmark suite; CI performance tests; async initialization |
| Breaking changes to hook protocol | Low | High | Hook version header; deprecation warnings; phased migration |
| Database size growth | Medium | Low | Configurable retention; cleanup jobs; archival strategy |

## Recommendations

### Priority 1 (Critical)
1. **Implement feature flag system first** - All other work depends on safe rollout
2. **Create migration with tested down procedure** - Database safety is paramount
3. **Build comprehensive unit tests for SessionBridge and ChangeTracker** - Core bridge functionality

### Priority 2 (High)
4. **Set up VS Code extension test infrastructure** - Extension is primary UI
5. **Create integration test suite for Hook-Worker pipeline** - End-to-end validation
6. **Add backward compatibility test job to CI** - Prevent regressions

### Priority 3 (Medium)
7. **Implement E2E browser tests with Playwright** - UI quality assurance
8. **Create performance benchmark suite** - Detect regressions early
9. **Build migration rollback CLI command** - Easy emergency rollback

### Priority 4 (Lower)
10. **Add telemetry for feature flag usage** - Understand adoption
11. **Create documentation for testing patterns** - Team scalability
12. **Implement automated test data seeding** - Consistent test environments
