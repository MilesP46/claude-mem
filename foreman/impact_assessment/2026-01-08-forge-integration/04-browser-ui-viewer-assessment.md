# Browser UI (Viewer) Impact Assessment

## Executive Summary

The Forge integration introduces five major new components to the existing claude-mem viewer: PipelineTracker, DecisionExplorer, TerminalViewer, RelationshipGraph, and ArtifactEditor. These components represent a significant expansion of the viewer's scope from a passive memory display to an active orchestration control surface.

The current viewer architecture is well-suited for incremental expansion. It uses a clean hook composition pattern with SSE for real-time updates, modular components with TypeScript interfaces, and esbuild for optimized bundling. The existing bundle (247KB minified) provides a solid foundation, but the proposed additions - particularly ReactFlow for graph visualization and Monaco Editor for artifact editing - will substantially increase bundle size. Strategic code splitting and lazy loading will be essential to maintain acceptable performance.

The primary technical challenges are: (1) integrating heavy dependencies (ReactFlow ~180KB, Monaco ~2.5MB) without degrading initial load time, (2) extending the existing SSE infrastructure to handle bidirectional WebSocket communication for real-time change tracking, and (3) maintaining the current design system coherence while adding significantly more complex UI patterns.

## New Components

### PipelineTracker

**Purpose:** Visualizes chain workflow progression through planning phases (research, design, issues, execution) with real-time status updates.

**Props Interface:**
```typescript
interface PipelineTrackerProps {
  releaseId: string;
  projectId: string;
  pipelineType: 'greenfield' | 'brownfield';
  currentPhase: 'research' | 'concept' | 'design' | 'architecture' | 'issues' | 'execution';
  currentStep?: number;
  decisionsCount: number;
  isResumable: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

interface PhaseStatus {
  phase: string;
  status: 'pending' | 'active' | 'complete';
  subSteps?: SubStepStatus[];
}

interface SubStepStatus {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'queued';
  agent?: string;
  duration?: number;
}
```

**State Management:**
- WebSocket subscription for real-time phase transitions
- Local state for expanded/collapsed phase views
- Derived state for phase progress percentages

**Rendering Strategy:**
- SVG-based pipeline visualization with animated transitions
- CSS custom properties for phase colors matching existing theme system
- Responsive layout: horizontal timeline on desktop, vertical stack on mobile
- Skeleton loading state while awaiting initial pipeline state

**Integration Points:**
- New API endpoint: `GET /api/forge/planning/pipeline`
- WebSocket event: `pipeline_state_update`
- Existing `useSSE` hook extended or new `usePipelineState` hook

**Estimated Complexity:** Medium (2-3 days implementation)

---

### DecisionExplorer

**Purpose:** Displays decision timeline with ConceptID traceability, override tracking, and dependency visualization.

**Props Interface:**
```typescript
interface DecisionExplorerProps {
  projectId: string;
  releaseId: string;
  onDecisionSelect?: (decision: Decision) => void;
  onDecisionOverride?: (decisionId: string, newValue: string, rationale: string) => void;
}

interface Decision {
  id: string;
  agent: string;
  phase: string;
  category: string;
  title: string;
  description?: string;
  value: string;
  score?: number;
  alternatives: Alternative[];
  conceptIds: string[];
  dependsOn: string[];
  status: 'pending' | 'locked' | 'user_override' | 'inherited';
  originalValue?: string;
  overrideRationale?: string;
  createdAt: string;
  lockedAt?: string;
}

interface Alternative {
  value: string;
  score: number;
  reasoning?: string;
}
```

**State Management:**
- Filter state: agent, type, status, search query
- Selection state for decision detail view
- Optimistic updates for decision locking/overriding
- Dependency graph computed from decision relationships

**Rendering Strategy:**
- Timeline view using CSS Grid with phase groupings
- Expandable decision cards with alternative comparison
- Inline override form with rationale input
- Dependency links rendered as lightweight SVG connectors (not full ReactFlow)

**Sub-Components:**
- `DecisionCard` - Individual decision display with status badge
- `DecisionFilters` - Filter bar with chips (reuse existing `ChipGroup`)
- `DecisionDetail` - Expanded view with alternatives and dependencies
- `OverrideDialog` - Modal for changing decision values

**Integration Points:**
- API: `GET /api/forge/planning/decisions`
- API: `POST /api/forge/planning/decisions/:id/lock`
- API: `POST /api/forge/planning/decisions/:id/override`

**Estimated Complexity:** High (4-5 days implementation)

---

### TerminalViewer

**Purpose:** Renders terminal output with full ANSI code support, session replay capability, and real-time streaming.

**Props Interface:**
```typescript
interface TerminalViewerProps {
  sessionId?: string;
  content?: string;
  isStreaming?: boolean;
  enableReplay?: boolean;
  className?: string;
}

interface TerminalSession {
  id: string;
  commands: TerminalCommand[];
  startedAt: string;
  endedAt?: string;
}

interface TerminalCommand {
  command: string;
  output: string;
  exitCode: number;
  timestamp: string;
  workingDir: string;
}
```

**State Management:**
- Streaming buffer for real-time content accumulation
- Replay position state (current command index, playback speed)
- Word wrap toggle (reuse existing pattern from `TerminalPreview`)
- Auto-scroll vs manual scroll position

**Rendering Strategy:**
- Extend existing `TerminalPreview` component with streaming capability
- Add replay controls: play/pause, step forward/back, speed selector
- Progress bar for replay position
- Command segmentation for clickable navigation

**ANSI Rendering:**
- Current implementation uses `ansi-to-html` (0.7.2) - adequate for basic colors
- For full terminal emulation (cursor positioning, etc.), evaluate:
  - `xterm.js` (~700KB) - Full terminal emulation, overkill for replay
  - `ansi-to-html` (current) - Lightweight, handles 90% of cases
  - **Recommendation:** Stick with `ansi-to-html`, add selective xterm.js lazy-load for advanced sessions

**Integration Points:**
- API: `GET /api/forge/terminals/:sessionId`
- WebSocket: `terminal_output` for streaming
- Existing `useSSE` hook or dedicated streaming hook

**Estimated Complexity:** Medium (3-4 days, accounting for replay logic)

---

### RelationshipGraph

**Purpose:** Interactive artifact graph with ReactFlow canvas, showing commands, agents, skills, and their relationships.

**Props Interface:**
```typescript
interface RelationshipGraphProps {
  projectId: string;
  selectedArtifactId?: string;
  onArtifactSelect?: (artifactId: string) => void;
  onArtifactDoubleClick?: (artifactId: string) => void;
  viewMode?: 'full' | 'focused' | 'minimap';
}

interface ArtifactNode {
  id: string;
  type: 'command' | 'agent' | 'skill' | 'template' | 'rule';
  name: string;
  description?: string;
  executionCount: number;
  successRate: number;
  avgTokens: number;
}

interface RelationshipEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: 'launches' | 'uses_skill' | 'references_template' | 'applies_rule';
  confidence: number;
  usageCount: number;
}
```

**State Management:**
- Node positions (user-dragged or auto-layout)
- Zoom and pan state
- Selection state (single/multi-select)
- Layout algorithm state (dagre for initial, manual for persisted)

**Custom Node Types:**
```typescript
// Custom node for artifact visualization
interface ArtifactNodeData {
  artifact: ArtifactNode;
  isSelected: boolean;
  showStats: boolean;
}

// Node color scheme by type (matching existing type badges)
const NODE_COLORS = {
  command: 'var(--color-type-badge-command)',
  agent: 'var(--color-type-badge-agent)',
  skill: 'var(--color-type-badge-skill)',
  template: 'var(--color-type-badge-template)',
  rule: 'var(--color-type-badge-rule)'
};
```

**Edge Rendering:**
- Animated edges for active executions
- Edge thickness proportional to usage frequency
- Hover tooltip with relationship details

**Sub-Components:**
- `ArtifactNode` - Custom ReactFlow node component
- `RelationshipEdge` - Custom edge with animation support
- `GraphControls` - Zoom, fit-to-view, layout reset
- `GraphMinimap` - Overview navigation for large graphs

**Integration Points:**
- API: `GET /api/forge/artifacts`
- API: `GET /api/forge/relations`
- WebSocket: `artifact_updated`, `relation_created`

**Estimated Complexity:** High (5-7 days, ReactFlow learning curve + custom nodes)

---

### ArtifactEditor

**Purpose:** Full-featured editor for artifact files with Monaco integration, YAML frontmatter validation, and @ autocomplete.

**Props Interface:**
```typescript
interface ArtifactEditorProps {
  artifactId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onChange?: (content: string, isDirty: boolean) => void;
  readOnly?: boolean;
}

interface AutocompleteSuggestion {
  type: 'agent' | 'skill' | 'template' | 'rule';
  name: string;
  description: string;
  executionCount: number;
  successRate: number;
}

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

**State Management:**
- Editor content (controlled or uncontrolled mode)
- Dirty state for unsaved changes
- Validation errors from frontmatter parser
- Autocomplete state (trigger position, suggestions, selection)

**Monaco Configuration:**
```typescript
const MONACO_CONFIG: editor.IStandaloneEditorConstructionOptions = {
  language: 'markdown',
  theme: 'forge-dark', // Custom theme matching viewer
  minimap: { enabled: false },
  lineNumbers: 'on',
  wordWrap: 'on',
  fontSize: 13,
  fontFamily: 'var(--font-terminal)',
  automaticLayout: true,
  scrollBeyondLastLine: false
};
```

**Custom Features:**
1. **@ Autocomplete Provider:** Triggers on `@` character, queries artifact API
2. **YAML Frontmatter Validation:** Real-time validation of `---` blocks
3. **Reference Highlighting:** Underline `@artifact/name` references with navigation
4. **Live Preview Panel:** Split view with rendered markdown (optional)

**Sub-Components:**
- `EditorToolbar` - Save, format, preview toggle
- `FrontmatterPanel` - Visual frontmatter editor (alternative to raw YAML)
- `PreviewPane` - Rendered markdown with syntax highlighting
- `ValidationPanel` - List of errors with click-to-navigate

**Integration Points:**
- API: `GET /api/forge/artifacts/:id`
- API: `PUT /api/forge/artifacts/:id`
- API: `GET /api/forge/autocomplete?prefix=`

**Estimated Complexity:** Very High (7-10 days, Monaco setup + custom providers)

---

## Library Evaluation

### ReactFlow

**Purpose:** Interactive graph visualization for artifact relationships.

**Pros:**
- Purpose-built for node-graph UIs in React
- Excellent performance with virtualization (handles 1000+ nodes)
- Built-in zoom, pan, minimap, controls
- Customizable node/edge components
- TypeScript support
- Active maintenance (4k+ GitHub stars)

**Cons:**
- Bundle size: ~180KB minified (significant for initial load)
- Learning curve for custom node implementations
- May conflict with existing CSS if not scoped properly

**Bundle Impact:**
| Current | + ReactFlow | Total |
|---------|-------------|-------|
| 247KB   | +180KB      | ~427KB |

**Mitigation:**
- Lazy load ReactFlow only when RelationshipGraph is rendered
- Dynamic import: `const { ReactFlow } = await import('@xyflow/react')`

**Recommendation:** **ADOPT** - Essential for the vision, no viable lightweight alternative for interactive graphs.

---

### Monaco Editor

**Purpose:** Code editing with syntax highlighting, autocomplete, and validation.

**Pros:**
- Same editor as VS Code (familiarity, feature parity)
- Excellent TypeScript/JavaScript support
- Extensible language services
- Built-in diff viewer, find/replace
- Accessibility support (screen readers)

**Cons:**
- **Massive bundle size:** ~2.5MB minified (web workers + languages)
- Complex initialization (web workers required)
- Heavy memory footprint
- Overkill for simple markdown editing

**Bundle Impact:**
| Current | + Monaco | Total |
|---------|----------|-------|
| 247KB   | +2.5MB   | ~2.75MB |

**Alternatives Evaluated:**
| Library | Size | Features | Recommendation |
|---------|------|----------|----------------|
| Monaco | 2.5MB | Full IDE | Enterprise use only |
| CodeMirror 6 | ~150KB | Good editing | **Preferred** |
| Ace Editor | ~300KB | Legacy, stable | Fallback |
| Prism + textarea | ~30KB | Basic | MVP only |

**Mitigation:**
- **Use CodeMirror 6 instead** - 85% of features at 6% of size
- If Monaco required, load via CDN with aggressive caching
- Lazy load editor only when ArtifactEditor is opened

**Recommendation:** **REPLACE** with CodeMirror 6 for initial implementation. Monaco available as opt-in "power user" mode.

---

### ANSI Rendering

**Current:** `ansi-to-html` (0.7.2) - 15KB, handles standard ANSI codes.

**Options Evaluated:**
| Library | Size | Capability | Recommendation |
|---------|------|------------|----------------|
| ansi-to-html | 15KB | Colors, basic styles | **Keep for most cases** |
| ansi-to-react | 20KB | React-native rendering | Redundant with current |
| xterm.js | 700KB | Full terminal emulation | Lazy-load for replay |
| anser | 5KB | Minimal, parse-only | Too low-level |

**Recommendation:** **KEEP** `ansi-to-html` as primary. Add lazy-loaded `xterm.js` as optional enhancement for full terminal replay with cursor movement.

---

## State Management

**Current Architecture:** Component-level state with custom hooks (`useSSE`, `useSettings`, `usePagination`).

**Proposed Architecture for Forge Features:**

### Option 1: Extended Hook Pattern (Recommended)
Continue current pattern with new hooks:
```typescript
// New hooks for Forge features
useArtifacts(projectId: string)
useRelations(projectId: string)
usePipelineState(projectId: string, releaseId: string)
useDecisions(projectId: string, releaseId: string, filters?: DecisionFilters)
useForgeWebSocket() // Extends useSSE for bidirectional communication
```

**Pros:**
- Consistent with existing codebase
- No new dependencies
- Easy to test in isolation
- Familiar to maintainers

**Cons:**
- May lead to prop drilling for deeply nested components
- Complex cross-component updates require lifting state

### Option 2: Zustand Store
```typescript
// Minimal global store for cross-cutting state
interface ForgeStore {
  // Artifacts
  artifacts: Map<string, Artifact>;
  selectedArtifactId: string | null;

  // Pipeline
  pipelineState: PipelineState | null;

  // Actions
  selectArtifact: (id: string) => void;
  updateArtifact: (id: string, changes: Partial<Artifact>) => void;
}
```

**Pros:**
- Cleaner cross-component communication
- Built-in devtools
- Tiny bundle (~2KB)

**Cons:**
- Introduces new pattern to codebase
- Migration effort for existing state

### Recommendation

**Hybrid approach:**
1. Keep existing hooks for backward compatibility
2. Add `useForgeWebSocket` hook extending current SSE pattern
3. Introduce Zustand **only** for RelationshipGraph (complex cross-component state)
4. New hooks follow existing patterns:

```typescript
// src/ui/viewer/hooks/useArtifacts.ts
export function useArtifacts(projectId: string) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forge/artifacts?project_id=${projectId}`)
      .then(r => r.json())
      .then(setArtifacts)
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return { artifacts, isLoading };
}
```

---

## Performance Analysis

### Bundle Size

**Current State:**
| Asset | Size | Notes |
|-------|------|-------|
| viewer-bundle.js | 247KB | React + all components |
| Total loaded | ~370KB | + HTML, CSS, fonts |

**Projected with All Forge Features (Naive):**
| Asset | Size | Notes |
|-------|------|-------|
| viewer-bundle.js | 247KB | Base |
| + ReactFlow | +180KB | Graph viz |
| + CodeMirror | +150KB | Editor |
| + xterm.js | +700KB | Terminal (optional) |
| **Total** | **~1.3MB** | Without lazy loading |

**Projected with Code Splitting:**
| Load Phase | Size | Contents |
|------------|------|----------|
| Initial | ~280KB | Core viewer + route shell |
| /graph | +180KB | ReactFlow (lazy) |
| /editor | +150KB | CodeMirror (lazy) |
| /terminal (replay) | +700KB | xterm.js (lazy, optional) |

### Code Splitting Strategy

**Implementation via Dynamic Imports:**
```typescript
// src/ui/viewer/routes.tsx
const RelationshipGraph = lazy(() =>
  import('./components/forge/RelationshipGraph')
);

const ArtifactEditor = lazy(() =>
  import('./components/forge/ArtifactEditor')
);

// Conditional loading in main App
{showGraph && (
  <Suspense fallback={<GraphSkeleton />}>
    <RelationshipGraph projectId={projectId} />
  </Suspense>
)}
```

**Build Configuration (esbuild):**
```javascript
// scripts/build-viewer.js - Enhanced for code splitting
await esbuild.build({
  entryPoints: ['src/ui/viewer/index.tsx'],
  bundle: true,
  splitting: true, // Enable code splitting
  format: 'esm',   // Required for splitting
  outdir: 'plugin/ui', // Directory output for chunks
  chunkNames: 'chunks/[name]-[hash]',
  // ...
});
```

### Lazy Loading Plan

| Component | Trigger | Preload Strategy |
|-----------|---------|------------------|
| PipelineTracker | Click "Pipeline" tab | Preload on hover |
| DecisionExplorer | Click "Decisions" tab | Preload on hover |
| TerminalViewer | Open terminal session | Immediate (lightweight) |
| RelationshipGraph | Click "Graph" tab | Preload after 3s idle |
| ArtifactEditor | Click artifact edit | Preload on artifact select |

### Performance Targets

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| FCP | ~800ms | < 1.0s | Code splitting |
| TTI | ~1.2s | < 2.0s | Lazy loading |
| Bundle (initial) | 247KB | < 300KB | Split heavy deps |
| Bundle (full) | N/A | < 1.5MB | Exclude xterm.js |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bundle size bloat | High | Medium | Code splitting, replace Monaco with CodeMirror |
| ReactFlow CSS conflicts | Medium | Low | Scope CSS with CSS modules or shadow DOM |
| WebSocket reliability | Medium | High | Fallback to SSE polling, reconnection logic |
| Editor performance on large files | Medium | Medium | Virtual scrolling, lazy parsing |
| Mobile responsiveness | High | Medium | Responsive design from start, feature degradation |
| Accessibility regression | Medium | High | Audit each component, maintain ARIA compliance |
| Build complexity increase | High | Low | Document chunk loading, add build metrics |
| State synchronization bugs | Medium | High | Optimistic updates with rollback, conflict resolution |

### Risk Detail: WebSocket Reliability

**Current:** SSE-only, unidirectional (server to client).

**Required:** Bidirectional for change tracking, decision overrides.

**Mitigation Strategy:**
1. Implement WebSocket with automatic reconnection (exponential backoff)
2. Fall back to polling if WebSocket fails after 3 attempts
3. Message queue for offline changes, sync on reconnection
4. Visual indicator of connection status (existing pattern in Header)

---

## Recommendations

### Priority 1: Foundation (Week 1)
1. **Create component directory structure:** `src/ui/viewer/components/forge/`
2. **Set up code splitting** in build-viewer.js
3. **Extend useSSE to useForgeWebSocket** for bidirectional communication
4. **Add API client** for new Forge endpoints

### Priority 2: Core Components (Weeks 2-3)
1. **PipelineTracker** - Highest visibility, relatively simple
2. **DecisionExplorer** - Critical for user control, can start without graph dependency
3. **TerminalViewer enhancement** - Extend existing component

### Priority 3: Heavy Components (Weeks 4-5)
1. **RelationshipGraph** - Add ReactFlow with custom nodes
2. **ArtifactEditor** - CodeMirror integration with custom autocomplete

### Priority 4: Polish (Week 6)
1. Mobile responsiveness pass
2. Accessibility audit
3. Performance optimization
4. Comprehensive error states

### Implementation Order Rationale

```
PipelineTracker (simple) -> DecisionExplorer (complex but standalone)
     |                              |
     v                              v
TerminalViewer (extend)    RelationshipGraph (needs graph lib)
                                    |
                                    v
                            ArtifactEditor (needs editor lib)
```

This order ensures:
- Early value delivery (pipeline visibility)
- Library additions deferred until necessary
- Each component can be shipped independently
- Complex dependencies isolated to later phases

### Technical Debt Prevention

1. **Add bundle size check to CI** - Fail if initial bundle exceeds 300KB
2. **Component performance budget** - Each new component < 50KB
3. **Lazy loading mandatory** for any dependency > 100KB
4. **Design system extension** - Document new colors, patterns in style guide
5. **Test coverage requirement** - 80% for new hooks, 60% for components
