# Forge Integration: Impact Assessment Synthesis

**Date:** 2026-01-08
**Scope:** Full-stack integration of Forge orchestration system into claude-mem
**Complexity:** COMPLEX
**Risk Level:** HIGH

---

## Quick Reference Guide (QRG)

### At a Glance
| Aspect | Summary |
|--------|---------|
| Total New Files | ~60 files (services, routes, hooks, UI components, tests) |
| Modified Files | ~15 files (hooks, worker service, build scripts) |
| New Database Tables | 14 tables (forge_* namespace) |
| New API Endpoints | 35+ endpoints under /api/v2/forge/* |
| Timeline Estimate | 16 weeks (4 phases) |
| Critical Path | Database Schema -> WebSocketHub -> SessionBridge -> Hooks -> UI |

### Go/No-Go Checklist
- [ ] Database migration tested on 100K+ observations
- [ ] WebSocket latency verified <1s terminal-to-VS Code
- [ ] VS Code extension activates cleanly on workspace with .claude/
- [ ] All feature flags default to OFF (FORGE_ENABLED=false)
- [ ] Rollback procedure documented and tested (migration down)
- [ ] Backward compatibility verified (existing API unchanged)
- [ ] Unit test coverage >80% for core services
- [ ] Integration tests pass for Hook->Worker->DB pipeline
- [ ] Performance benchmarks show no regression with Forge disabled

---

## Executive Summary

The Forge integration represents a transformative expansion of claude-mem from a passive memory system into an active AI orchestration platform. This synthesis consolidates findings from seven detailed impact assessments covering database persistence, HTTP APIs, lifecycle hooks, browser UI, VS Code extension, WebSocket streaming, and testing infrastructure.

The architecture introduces four major capability domains: **Core Artifacts** (living graph of commands, agents, skills with relationship tracking), **Behavior Learning** (pattern detection from terminal usage with confidence scoring), **Planning Layer** (decision tracking, pipeline state, capability gap detection), and **The Bridge** (real-time streaming of agent changes from terminal to VS Code for Keep/Discard review). These domains are implemented through 14 new database tables, 5 new route handlers, enhanced lifecycle hooks, and two rich client interfaces (browser viewer + VS Code extension).

The integration follows a safety-first approach with all functionality gated behind the `FORGE_ENABLED` feature flag (default: false). Existing claude-mem functionality remains completely unchanged when Forge is disabled. The database schema uses a `forge_*` namespace to prevent collision with existing tables, and all new API endpoints use a `/api/v2/forge/*` prefix for clean separation. The estimated 16-week timeline is divided into Foundation (database, core services), Orchestration (hooks, WebSocket), Planning Layer (decisions, pipelines), and Bridge (VS Code integration) phases.

---

## Cross-Cutting Findings

### Conflicts Identified

1. **Table Naming Inconsistency**: Assessment 01 uses `forge_relationships` while Assessment 02 references `forge_relations`. **Resolution:** Standardize on `forge_relationships` as defined in the migration.

2. **WebSocket vs SSE Strategy**: Assessment 02 proposes replacing SSE with WebSocket, while Assessment 06 recommends a hybrid approach. **Resolution:** Adopt hybrid strategy - keep SSE for existing observation broadcasts, add WebSocket for bidirectional Forge features.

3. **Monaco vs CodeMirror**: Assessment 04 recommends CodeMirror for bundle size, but Assessment 05 shows Monaco in VS Code webview examples. **Resolution:** Use native Monaco in VS Code (already available), CodeMirror for browser UI to minimize bundle size.

### Gaps Identified

1. **Cross-Platform Terminal Detection**: Hooks assessment covers macOS terminals (iTerm2, Ghostty) but lacks Windows terminal detection patterns. **Action Required:** Add Windows Terminal, PowerShell, and WSL detection.

2. **Chroma Vector Integration**: Database assessment mentions ChromaSync extension for artifact embeddings but lacks implementation details. **Action Required:** Add dedicated section in implementation phase for Chroma collection setup.

3. **Error Recovery for Hunk Reversion**: WebSocket assessment mentions hunk rejection reverts files but doesn't detail git integration or undo support. **Action Required:** Define file backup strategy before reversion.

4. **Rate Limiting on New Endpoints**: Only Assessment 02 mentions rate limiting (100 req/min). Other assessments lack rate limiting specifics. **Action Required:** Define unified rate limiting policy across all Forge endpoints.

5. **Mobile Responsiveness**: Browser UI assessment acknowledges mobile as a gap. **Action Required:** Define mobile degradation strategy (read-only mode, simplified views).

### Overlaps & Dependencies

**Dependency Chain:**
```
migration008 (Database)
    ├── ForgeRoutes (API) - requires tables
    ├── SessionBridge (Service) - requires forge_sessions table
    └── WebSocketHub (Service) - requires SessionBridge
            ├── TerminalRoutes - requires WebSocketHub
            ├── PlanningRoutes - requires WebSocketHub
            └── VS Code Extension - requires WebSocketHub
                    └── Browser UI (WebSocket client)
```

**Shared Components:**
- `WebSocketHub` is used by both VS Code extension and browser UI
- `HaikuSummaryService` is used by both ChangeTracker (hunk summaries) and potentially DecisionExplorer
- `ArtifactCache` is shared between ForgeRoutes and Language Server

**Cross-Assessment Dependencies:**
| Source Assessment | Depends On |
|-------------------|------------|
| 02 Worker Service | 01 Database Schema |
| 03 Hooks | 02 Worker Service Endpoints |
| 04 Browser UI | 06 WebSocket Streaming |
| 05 VS Code Extension | 02 Worker Service, 06 WebSocket |
| 06 WebSocket Streaming | 01 Database, 02 Worker Service |
| 07 Testing | All other assessments |

---

## Component Summaries

### 1. Database & Persistence
**Assessment:** [01-database-persistence-assessment.md](./01-database-persistence-assessment.md)

**Key Decisions:**
- 14 new tables with `forge_*` prefix for namespace isolation
- Single migration008 containing all tables with full up/down procedures
- WAL mode continuation for concurrent access
- FTS5 extension for artifact content search
- Dual timestamp format (ISO + epoch) per project convention
- JSON columns for flexible metadata (frontmatter, alternatives, hunks)

**Core Tables:**
- `forge_artifacts` - Central node table for orchestration artifacts
- `forge_relationships` - Edge table for artifact connections
- `forge_executions` - Execution history linking artifacts to sessions
- `forge_behaviors` - Learned user patterns with confidence scoring
- `forge_sessions` - External terminal session tracking
- `forge_decisions` - Planning decisions with alternatives
- `forge_changes` - File change hunks for Bridge review

**Risk Level:** MEDIUM
**Timeline:** 2 weeks

---

### 2. Worker Service & HTTP API
**Assessment:** [02-worker-service-http-api-assessment.md](./02-worker-service-http-api-assessment.md)

**Key Decisions:**
- All new endpoints under `/api/v2/forge/*` prefix
- 5 new route files: ForgeRoutes, TerminalRoutes, ForgeSessionRoutes, WebSocketRoutes, PlanningRoutes
- API versioning for future breaking changes
- Hybrid HTTP (CRUD) + WebSocket (real-time) communication
- Rate limiting at 100 requests/minute for Forge endpoints

**New Services:**
- `SessionBridge` - Terminal-to-VS Code session coordination
- `WebSocketHub` - Real-time bidirectional communication
- `ForgeService` - Artifact CRUD and relationship management
- `PlanningService` - Pipeline state and decision management

**Risk Level:** MEDIUM
**Timeline:** 3 weeks

---

### 3. Hooks Enhancement
**Assessment:** [03-hooks-enhancement-assessment.md](./03-hooks-enhancement-assessment.md)

**Key Decisions:**
- Fire-and-forget pattern for all Forge API calls (no blocking)
- Artifact detection via regex on file paths in `.claude/` directories
- Change capture for Edit/Write tools with before/after content
- Terminal session registration in new-hook
- Forge context injection gated by `.claude/` directory existence

**Modified Hooks:**
- `save-hook.ts` - Add artifact detection + change capture
- `new-hook.ts` - Add terminal session registration
- `context-hook.ts` - Add Forge context parameters

**Performance Budget:**
- save-hook: +20ms (fire-and-forget)
- new-hook: +50ms (non-blocking registration)
- context-hook: +50ms (cached Forge context)

**Risk Level:** LOW-MEDIUM
**Timeline:** 2 weeks

---

### 4. Browser UI (Viewer)
**Assessment:** [04-browser-ui-viewer-assessment.md](./04-browser-ui-viewer-assessment.md)

**Key Decisions:**
- 5 new components: PipelineTracker, DecisionExplorer, TerminalViewer, RelationshipGraph, ArtifactEditor
- ReactFlow for artifact graph visualization (~180KB lazy-loaded)
- CodeMirror 6 for artifact editing (~150KB lazy-loaded)
- Code splitting via dynamic imports for bundle optimization
- Extended hook pattern for state management (no new state library for core)

**Bundle Impact:**
- Initial load: ~280KB (up from 247KB)
- With ReactFlow: +180KB (lazy)
- With CodeMirror: +150KB (lazy)
- Target: <300KB initial, <1.5MB total

**Risk Level:** MEDIUM
**Timeline:** 4 weeks

---

### 5. VS Code Extension
**Assessment:** [05-vscode-extension-assessment.md](./05-vscode-extension-assessment.md)

**Key Decisions:**
- Lazy activation on `workspaceContains:.claude/`
- 7 providers: CodeLens, Decoration, SCM, Hover, Completion, Definition, Diagnostic
- Language Server Protocol for @ autocomplete and validation
- ReactFlow canvas in webview for visual artifact editing
- WebSocket client with exponential backoff reconnection

**Distribution:**
- VS Code Marketplace publishing via vsce
- Minimum VS Code version: 1.85+
- esbuild for extension bundling, Vite for webview

**Risk Level:** MEDIUM-HIGH
**Timeline:** 5 weeks

---

### 6. WebSocket & Streaming
**Assessment:** [06-websocket-streaming-assessment.md](./06-websocket-streaming-assessment.md)

**Key Decisions:**
- Hybrid SSE + WebSocket approach (SSE for existing, WebSocket for new)
- JSON message format (not MessagePack/Protobuf - complexity not justified)
- Version field in all messages for protocol evolution
- Line-buffered terminal streaming with 100ms flush interval
- 1MB output limit per command with head/tail truncation

**Performance Targets:**
- Terminal-to-VS Code latency: <1s (P50), <2s (P95)
- File change latency: <800ms (P50), <1.5s (P95)
- Message delivery rate: >99.9%

**Event Types:**
- `terminal-output` - Terminal streaming with ANSI preservation
- `file-change` - Agent changes with AI-generated hunk summaries
- `agent-status` - Agent lifecycle updates
- `pipeline-update` - Planning phase transitions
- `decision-made` - New planning decisions

**Risk Level:** HIGH
**Timeline:** 3 weeks

---

### 7. Testing & Backward Compatibility
**Assessment:** [07-testing-backward-compat-assessment.md](./07-testing-backward-compat-assessment.md)

**Key Decisions:**
- `FORGE_ENABLED` master flag (default: false) gates all functionality
- Three-tier testing: unit (80%+), integration (pipeline), E2E (VS Code + browser)
- All existing API endpoints unchanged
- Migration rollback tested and documented
- CI/CD expanded with extension build, E2E, and backward compat jobs

**Feature Flags:**
- `FORGE_ENABLED` - Master switch (default: false)
- `FORGE_TERMINAL_TRACKING` - Terminal command tracking
- `FORGE_ARTIFACT_DETECTION` - Automatic artifact indexing
- `FORGE_WEBSOCKET_STREAMING` - Real-time updates
- `FORGE_VSCODE_EXTENSION` - VS Code integration
- `FORGE_BEHAVIOR_LEARNING` - Pattern learning
- `FORGE_PLANNING_LAYER` - Planning features (separate rollout)

**Risk Level:** LOW (mitigates other risks)
**Timeline:** Ongoing (parallel with development)

---

## Unified Risk Matrix

| Risk | Source | Likelihood | Impact | Mitigation | Owner |
|------|--------|------------|--------|------------|-------|
| Migration corrupts existing data | 01, 07 | Low | Critical | Additive-only migrations; backup before apply; tested rollback | DB Lead |
| Large database migration slow | 01 | Medium | Medium | Pre-flight size check; user notification; off-peak execution | DB Lead |
| WebSocket connection instability | 02, 06 | Medium | High | Exponential backoff reconnection; SSE fallback for read-only | Backend Lead |
| WebSocket overwhelms worker | 06, 07 | Medium | High | Connection limits (100 max); rate limiting; backpressure | Backend Lead |
| Hook timeout from Forge calls | 03 | Medium | High | Fire-and-forget pattern; no await on Forge calls | Hooks Lead |
| Privacy tag bypass in changes | 03 | Low | High | Strip tags before diff; validate at worker | Security Lead |
| Bundle size bloat (browser UI) | 04 | High | Medium | Code splitting; replace Monaco with CodeMirror | Frontend Lead |
| ReactFlow CSS conflicts | 04 | Medium | Low | Scope CSS with CSS modules | Frontend Lead |
| VS Code extension compatibility | 05, 07 | Medium | Medium | Test multiple VS Code versions; API versioning | Extension Lead |
| Worker not running for extension | 05 | High | High | Graceful degradation; "Start Worker" prompt; offline mode | Extension Lead |
| Haiku rate limiting breaks summaries | 06 | Medium | Medium | Token bucket limiter; fallback to generic summaries | Backend Lead |
| Large terminal output causes OOM | 06 | Low | High | 1MB limit per command; truncation with head/tail | Backend Lead |
| End-to-end latency exceeds 1s | 06 | Medium | High | Performance monitoring; skip Haiku if behind | Backend Lead |
| Feature flag bypass | 07 | Low | Medium | Centralized flag evaluation; unit tests for flag logic | QA Lead |
| Performance regression | 07 | Medium | High | Benchmark suite; CI performance tests; async init | QA Lead |
| Graph query performance | 01 | Medium | Medium | Depth limits on recursive CTEs; result caching | DB Lead |

---

## Implementation Sequence

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Database Schema**
- Create migration008 with all 14 forge_* tables
- Implement and test up/down procedures
- Add indexes for common access patterns
- Create FTS5 virtual table for artifact search
- **Deliverables:** migration008.ts, forge-migrations.test.ts

**Week 2: Core Services**
- Implement WebSocketHub with connection management
- Implement SessionBridge for terminal-to-client coordination
- Create ForgeService for artifact CRUD
- Set up feature flag system
- **Deliverables:** WebSocketHub.ts, SessionBridge.ts, ForgeService.ts, feature-flags.ts

**Week 3: HTTP Routes**
- Implement ForgeRoutes (artifacts, relations, executions)
- Implement TerminalRoutes (registration, commands)
- Implement ForgeSessionRoutes (lifecycle, hierarchy)
- Add rate limiting middleware
- **Deliverables:** 5 route files, route tests

### Phase 2: Orchestration (Weeks 4-7)

**Week 4-5: Hook Enhancements**
- Add artifact detection to save-hook
- Add change capture to save-hook
- Add terminal registration to new-hook
- Add Forge context parameters to context-hook
- **Deliverables:** Modified hooks, hook tests

**Week 6: Change Tracking**
- Implement ChangeTracker with diff generation
- Implement HunkProcessor with Haiku summaries
- Add WebSocket broadcast for file changes
- Create terminal buffer manager
- **Deliverables:** ChangeTracker.ts, HunkProcessor.ts, TerminalBufferManager.ts

**Week 7: Integration Testing**
- Hook-to-Worker-to-Database pipeline tests
- WebSocket flow integration tests
- Artifact sync integration tests
- Performance benchmarks
- **Deliverables:** Integration test suite

### Phase 3: Planning Layer (Weeks 8-10)

**Week 8: Planning Routes**
- Implement PlanningRoutes (pipeline, decisions, branches)
- Create PlanningService for state management
- Add decision dependency tracking
- Implement capability gap detection
- **Deliverables:** PlanningRoutes.ts, PlanningService.ts

**Week 9: Behavior Learning**
- Implement pattern detection from terminal commands
- Create BehaviorLearner with confidence scoring
- Add behavior context injection
- Create behavior aggregation jobs
- **Deliverables:** PatternDetector.ts, BehaviorLearner.ts

**Week 10: Planning UI**
- Create PipelineTracker component
- Create DecisionExplorer component
- Add planning WebSocket subscriptions
- Implement decision override UI
- **Deliverables:** React components, planning hooks

### Phase 4: The Bridge (Weeks 11-14)

**Week 11-12: VS Code Extension Core**
- Extension scaffolding with lazy activation
- WebSocket client with reconnection
- AgentChangeManager for state
- CodeLens and Decoration providers
- **Deliverables:** Extension skeleton, core providers

**Week 13: VS Code Extension Features**
- SCM provider for Agent Changes view
- Language Server with @ autocomplete
- Hover and diagnostic providers
- Go-to-definition for artifacts
- **Deliverables:** Language server, advanced providers

**Week 14: VS Code Extension UI**
- Webview panel with ReactFlow canvas
- Artifact tree view
- Keep/Discard command handlers
- Marketplace preparation
- **Deliverables:** Complete extension, VSIX package

### Phase 5: Refinement (Weeks 15-16)

**Week 15: Browser UI Enhancement**
- RelationshipGraph component (ReactFlow)
- ArtifactEditor component (CodeMirror)
- TerminalViewer with replay
- Mobile responsiveness pass
- **Deliverables:** Remaining React components

**Week 16: Polish & Release**
- E2E test suite completion
- Performance optimization
- Accessibility audit
- Documentation finalization
- Staged rollout (alpha -> beta -> GA)
- **Deliverables:** Complete test coverage, release candidate

---

## Critical Path Analysis

```
Database Schema (01)
    |
    +---> WebSocketHub + SessionBridge (02, 06)
              |
              +---> Hook Enhancements (03)
              |         |
              |         +---> ChangeTracker + HunkProcessor (06)
              |                   |
              |                   +---> VS Code Extension (05)
              |                             |
              |                             +---> E2E Testing (07)
              |
              +---> ForgeRoutes (02)
                        |
                        +---> PlanningRoutes (02)
                        |         |
                        |         +---> Browser UI - Planning (04)
                        |
                        +---> Browser UI - Artifacts (04)
```

**Critical Path Duration:** 14 weeks (Weeks 1-14)
**Parallel Work Possible:**
- Browser UI components (Week 8+) can proceed alongside VS Code extension
- Planning routes (Week 8+) can proceed alongside behavior learning
- Testing infrastructure should run parallel throughout

---

## Resource Requirements

### Development
| Role | Allocation | Person-Weeks |
|------|------------|--------------|
| Backend Engineer | Full-time | 16 |
| Frontend Engineer | Full-time | 16 |
| Extension Developer | Full-time (Weeks 11-16) | 6 |
| QA Engineer | 50% | 8 |
| **Total** | | **46 person-weeks** |

### Infrastructure
- **CI/CD Expansion:** Add VS Code extension build/test/publish jobs
- **Chroma Collection:** New collection for artifact embeddings
- **WebSocket Scaling:** Connection pooling if >100 concurrent clients needed

### External Dependencies
- **Anthropic Claude API:** Haiku for hunk summaries (50 RPM limit)
- **VS Code Marketplace:** Publisher account and PAT for publishing
- **ReactFlow:** MIT license, no commercial restrictions
- **CodeMirror 6:** MIT license, no commercial restrictions

---

## Approval Gate

**This synthesis represents the complete impact assessment for Forge integration.**

**High-Risk Changes:**
1. Database schema addition (14 tables, migration008)
2. WebSocket infrastructure (new protocol, connection management)
3. Hook modifications (fire-and-forget calls, artifact detection)
4. VS Code extension (new codebase, marketplace distribution)
5. Real-time streaming (latency requirements, reliability)

**Mitigation Summary:**
- Feature flags with `FORGE_ENABLED` default: false
- Phased rollout: internal -> alpha -> beta -> GA
- Comprehensive testing: unit (80%+), integration, E2E
- Rollback procedures: migration down, feature disable
- Backward compatibility: existing API unchanged, namespace isolation

**Success Metrics:**
- Terminal-to-VS Code latency: <1s (P50)
- WebSocket uptime: >99.9%
- Hunk acceptance rate: >85%
- Extension activation: <500ms
- No regression in existing functionality

**Next Steps:**
Respond with "approved"/"proceed" to begin implementation, "revise [section]" for changes, or "cancel" to stop.

---

## Appendix: Assessment Document Index

| # | Document | Focus Area | Lines | Key Deliverables |
|---|----------|------------|-------|------------------|
| 1 | [01-database-persistence-assessment.md](./01-database-persistence-assessment.md) | Schema, migrations, queries | 1180 | 14 tables, migration008, FTS5 |
| 2 | [02-worker-service-http-api-assessment.md](./02-worker-service-http-api-assessment.md) | API routes, services | 1352 | 5 route files, SessionBridge, WebSocketHub |
| 3 | [03-hooks-enhancement-assessment.md](./03-hooks-enhancement-assessment.md) | Hook modifications | 950 | Artifact detection, change capture, session registration |
| 4 | [04-browser-ui-viewer-assessment.md](./04-browser-ui-viewer-assessment.md) | React components, state | 665 | 5 new components, code splitting, ReactFlow/CodeMirror |
| 5 | [05-vscode-extension-assessment.md](./05-vscode-extension-assessment.md) | Extension architecture | 1157 | Extension, 7 providers, Language Server, webview |
| 6 | [06-websocket-streaming-assessment.md](./06-websocket-streaming-assessment.md) | Real-time protocol | 1615 | Event types, terminal streaming, change streaming |
| 7 | [07-testing-backward-compat-assessment.md](./07-testing-backward-compat-assessment.md) | Testing strategy, flags | 1067 | Test suites, feature flags, CI/CD, rollback plan |

**Total Assessment Lines:** ~8,000
**Synthesis Date:** 2026-01-08
**Status:** Ready for Approval
