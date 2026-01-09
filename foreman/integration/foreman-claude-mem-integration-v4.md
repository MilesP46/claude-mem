# Foreman + Claude-Mem Integration Specification v4

## Executive Summary

v4 evolves claude-mem from "memory system" to **development cockpit**. The viewer becomes the unified interface for:
- Managing Claude Code CLI sessions (launch, restart, resume)
- Editing foreman artifacts (agents, commands, rules, instructions)
- Storing and generating from planning documents
- All memory and context capabilities from v3

**Core Insight**: The CLI restart problem reveals a fundamental need—users need a stable control plane above the ephemeral CLI sessions. Claude-mem's viewer is that control plane.

---

## Part 1: Addressing the Open Questions

### Q1: How can the claude-mem frontend be where the user interacts with the terminal?

**Answer**: The viewer becomes a **session orchestrator**, not a terminal replacement.

**Why not embed a terminal?**
- Users have terminal preferences (iTerm, Warp, etc.)
- Terminal emulation adds significant complexity
- Users already have muscle memory for their terminal

**What the viewer does instead**:
1. **Launch Sessions**: Opens Claude Code in user's preferred terminal
2. **Track Sessions**: Maps session IDs to projects and conversations
3. **Signal Restarts**: When artifacts change, signals CLI to restart
4. **Resume Conversations**: After restart, auto-resumes via `claude --resume {id}`

```
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE-MEM VIEWER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SESSION MANAGER                                     │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │    │
│  │  │ my-app  │ │ api-svc │ │ (new)   │               │    │
│  │  │ Active  │ │ Paused  │ │   +     │               │    │
│  │  └────┬────┘ └─────────┘ └─────────┘               │    │
│  └───────┼──────────────────────────────────────────────┘    │
│          │                                                    │
│          ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Restart CLI] [Pause] [Resume] [View Logs]         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   USER'S TERMINAL       │
              │   (iTerm, Terminal,     │
              │    Warp, etc.)          │
              │                         │
              │   $ claude              │
              │   > ...                 │
              └─────────────────────────┘
```

### Q2: Can the user select their CLI (iTerm, Terminal, etc.)?

**Answer**: Yes, via settings.

```json
// ~/.claude-mem/settings.json
{
  "terminal": {
    "app": "iTerm",  // "Terminal" | "iTerm" | "Warp" | "Alacritty" | "custom"
    "custom_command": null,  // For custom: "open -a MyTerminal"
    "new_window": true,  // vs new tab
    "working_directory": "project"  // "project" | "home" | "custom"
  }
}
```

**Implementation**: Platform-specific launchers
- macOS: AppleScript for iTerm/Terminal, direct launch for others
- Linux: xdg-open or direct app launch
- Windows: start command with appropriate app

### Q3: Project-specific vs personal-level artifacts

**Answer**: Dual-scope indexing with clear UI separation.

**Storage Model**:
```
foreman_artifacts table:
  scope: 'personal' | 'project:{project_id}'
  source_path: absolute filesystem path
  ...
```

**UI Model**:
```
┌─────────────────────────────────────────────────────────────┐
│  ARTIFACT BROWSER                                            │
├─────────────────────────────────────────────────────────────┤
│  📁 Personal (~/.claude/)          📁 Project (.claude/)     │
│  ├─ agents/                        ├─ agents/                │
│  │  ├─ backend-architect.md        │  └─ billing-specialist  │
│  │  ├─ frontend-developer.md       ├─ commands/              │
│  │  └─ ...                         │  └─ deploy-staging      │
│  ├─ commands/                      └─ rules/                 │
│  │  ├─ chain-issue.md                  └─ billing-conventions│
│  │  └─ ...                                                   │
│  └─ rules/                                                   │
│     └─ ...                                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Behavior**:
- Personal artifacts: Read-only in project context (edit via personal workspace)
- Project artifacts: Full edit capability
- When creating: User chooses scope explicitly
- UI clearly distinguishes which is which

### Q4: Restore CLI after creating agents/commands and resume conversation?

**Answer**: Session capture → artifact write → CLI restart → auto-resume.

**Flow**:
```
1. User in Claude Code session, session_id = "abc123"

2. User triggers artifact creation (via viewer or CLI command)

3. Before write:
   - Viewer captures: session_id, project, conversation_position
   - Stores in: active_sessions table

4. Artifact written to filesystem

5. Viewer signals CLI restart:
   - Send SIGTERM to current Claude process
   - Wait for graceful shutdown

6. Viewer launches new CLI:
   - Opens terminal in project directory
   - Runs: claude --resume abc123

7. User continues from where they left off
```

**User Experience**:
- Terminal briefly closes/reopens
- Conversation continues seamlessly
- New artifact is immediately available

**Backend Support Needed**:
```typescript
// Session tracking
interface ActiveSession {
  session_id: string;
  project_id: string;
  pid: number;
  terminal_app: string;
  started_at: Date;
  status: 'active' | 'paused' | 'restarting';
}
```

### Q5: .foreman-project file into claude-mem backend

**Answer**: Index into backend, keep file as source of truth.

**Why keep the file?**
- Foreman can work without claude-mem (standalone mode)
- File is version-controllable
- Other tools might read it

**What claude-mem does**:
1. On session start: Read `.foreman-project`, store in `foreman_projects` table
2. On file change (fswatch): Re-index
3. Queries hit database, not filesystem
4. Editor in viewer can modify file directly

**Schema**:
```sql
CREATE TABLE foreman_projects (
  id TEXT PRIMARY KEY,  -- project_name
  root_path TEXT NOT NULL,

  -- From .foreman-project
  issue_dir TEXT,
  active_release TEXT,
  rule_labels JSON,

  -- Claude-mem additions
  claude_mem_enabled BOOLEAN DEFAULT TRUE,
  last_indexed_at TIMESTAMP,
  file_hash TEXT,  -- For change detection

  -- Session tracking
  active_session_id TEXT,

  UNIQUE(root_path)
);
```

### Q6: Edit artifacts in frontend markdown editor

**Answer**: Integrated editor with filesystem sync.

**Editor Requirements**:
- Monaco or CodeMirror for markdown
- Syntax highlighting for YAML frontmatter
- Live preview for agent/command structure
- Validation before save

**Edit Flow**:
```
1. User clicks artifact in browser

2. Editor loads:
   - Raw content from filesystem (via backend read)
   - Metadata from claude-mem index

3. User edits in split view:
   ┌──────────────────┬──────────────────┐
   │  EDITOR          │  PREVIEW         │
   │                  │                  │
   │  ```yaml         │  Agent: backend  │
   │  name: backend   │  Tools: [Bash,   │
   │  ...             │         Read]    │
   │  ```             │  Scope: src/api/ │
   └──────────────────┴──────────────────┘

4. On save:
   - Validate structure
   - Write to filesystem
   - Update claude-mem index
   - If CLI running: trigger restart flow (Q4)

5. Confirmation: "Saved. CLI will restart to pick up changes."
```

**Validation Rules**:
- Agent: Must have `name`, valid `allowed-tools`, parseable scope
- Command: Must have valid slash-command format
- Rule: Must be valid MDC format

### Q7: Store planning documents, edit in frontend, generate artifacts

**Answer**: Planning documents as first-class entities with generation pipeline.

**Planning Document Types**:
- `release-spec.md` - High-level release goals
- `issue-plan.md` - Issue breakdown
- `issue-XXX.yaml` - Individual issue definitions
- `context-template.md` - Agent context packages

**Storage**:
```sql
CREATE TABLE foreman_planning_docs (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  doc_type TEXT NOT NULL,  -- 'release-spec' | 'issue-plan' | 'issue-yaml' | 'context-template'
  title TEXT,
  content TEXT NOT NULL,

  -- Generation tracking
  generated_artifacts JSON,  -- Array of artifact IDs generated from this doc
  generation_status TEXT,  -- 'draft' | 'generating' | 'generated' | 'approved'

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id INTEGER,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Generation Flow**:
```
┌─────────────────────────────────────────────────────────────┐
│  PLANNING EDITOR                                             │
├─────────────────────────────────────────────────────────────┤
│  📄 issue-042.yaml                            [Generate ▼]   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ sequence_number: "042"                                   ││
│  │ title: "Add billing API"                                 ││
│  │ type: feat                                               ││
│  │ area: api                                                ││
│  │ agents:                                                  ││
│  │   required_agents:                                       ││
│  │     - agent: backend-architect                           ││
│  │       folders:                                           ││
│  │         primary: ["src/api/billing/"]                    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  GENERATED PREVIEW                                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Will create:                                             ││
│  │  ✓ GitHub Issue #42                                      ││
│  │  ✓ Agent context package for backend-architect           ││
│  │  ✓ Test spec for billing API                             ││
│  │                                                          ││
│  │ [Preview Context] [Create All] [Edit Before Create]      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Generation Pipeline**:
1. **Parse**: Extract structure from planning doc
2. **Validate**: Check references, dependencies, completeness
3. **Preview**: Show what will be generated
4. **Generate**: Create artifacts (files, GitHub issues, context packages)
5. **Link**: Store relationships in `generated_artifacts`
6. **Sync**: Write to filesystem, update indexes

---

## Part 2: Unified Architecture

### 2.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE-MEM VIEWER (React)                        │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   SESSIONS   │ │   ARTIFACTS  │ │   PLANNING   │ │   MEMORY     │   │
│  │   MANAGER    │ │   EDITOR     │ │   HUB        │ │   BROWSER    │   │
│  │              │ │              │ │              │ │              │   │
│  │ • Launch     │ │ • Edit       │ │ • Write docs │ │ • Search     │   │
│  │ • Restart    │ │ • Preview    │ │ • Generate   │ │ • Timeline   │   │
│  │ • Resume     │ │ • Validate   │ │ • Approve    │ │ • Patterns   │   │
│  │ • Track      │ │ • Sync       │ │ • Track      │ │ • Insights   │   │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘   │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ HTTP API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLAUDE-MEM WORKER (Express + Bun)                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         API ROUTES                               │    │
│  │  /sessions/*    /artifacts/*    /planning/*    /search/*        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   SESSION    │ │   ARTIFACT   │ │   PLANNING   │ │   CONTEXT    │   │
│  │   SERVICE    │ │   SERVICE    │ │   SERVICE    │ │   ENGINE     │   │
│  │              │ │              │ │              │ │              │   │
│  │ • PID mgmt   │ │ • Index      │ │ • Store docs │ │ • Local cache│   │
│  │ • Terminal   │ │ • Validate   │ │ • Generate   │ │ • Rules      │   │
│  │ • Resume     │ │ • Write      │ │ • Version    │ │ • Patterns   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      DATA LAYER                                  │    │
│  │  SQLite: observations, artifacts, planning_docs, sessions       │    │
│  │  Chroma: semantic search                                         │    │
│  │  Filesystem: actual agent/command files (source of truth)       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 New API Routes

**Sessions**:
```
POST   /api/sessions/launch          Launch new Claude Code session
POST   /api/sessions/:id/restart     Restart session (preserves conversation)
POST   /api/sessions/:id/pause       Pause session
DELETE /api/sessions/:id             Terminate session
GET    /api/sessions                 List active sessions
GET    /api/sessions/:id             Get session details
```

**Artifacts**:
```
GET    /api/artifacts                List all artifacts (with scope filter)
GET    /api/artifacts/:id            Get artifact content
PUT    /api/artifacts/:id            Update artifact (triggers CLI restart)
POST   /api/artifacts                Create new artifact
DELETE /api/artifacts/:id            Delete artifact
POST   /api/artifacts/:id/validate   Validate artifact structure
```

**Planning**:
```
GET    /api/planning/docs            List planning documents
GET    /api/planning/docs/:id        Get document content
PUT    /api/planning/docs/:id        Update document
POST   /api/planning/docs            Create document
POST   /api/planning/docs/:id/generate  Generate artifacts from document
GET    /api/planning/docs/:id/preview   Preview what generation will create
```

### 2.3 Database Schema Additions

```sql
-- Session tracking
CREATE TABLE active_sessions (
  id TEXT PRIMARY KEY,  -- Claude session ID
  project_id TEXT,
  pid INTEGER,
  terminal_app TEXT,
  working_directory TEXT,
  status TEXT DEFAULT 'active',  -- active | paused | restarting | terminated
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);

-- Artifact index (enhanced from v3)
CREATE TABLE foreman_artifacts (
  id INTEGER PRIMARY KEY,
  scope TEXT NOT NULL,  -- 'personal' | 'project:{id}'
  type TEXT NOT NULL,   -- 'agent' | 'command' | 'rule' | 'instruction' | 'template'

  source_path TEXT NOT NULL,  -- Filesystem path (source of truth)
  content_hash TEXT NOT NULL,

  name TEXT,
  description TEXT,
  metadata JSON,  -- Parsed frontmatter

  -- Processing
  raw_content TEXT,
  processed_content TEXT,  -- Distilled version

  -- Validation
  is_valid BOOLEAN DEFAULT TRUE,
  validation_errors JSON,

  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(source_path)
);

-- Planning documents
CREATE TABLE foreman_planning_docs (
  id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT,

  doc_type TEXT NOT NULL,
  doc_path TEXT,  -- Filesystem path if synced
  title TEXT,
  content TEXT NOT NULL,

  generated_artifacts JSON,
  generation_status TEXT DEFAULT 'draft',

  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES foreman_projects(id)
);

-- Generation lineage
CREATE TABLE artifact_lineage (
  id INTEGER PRIMARY KEY,
  planning_doc_id INTEGER NOT NULL,
  artifact_id INTEGER NOT NULL,
  generation_params JSON,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (planning_doc_id) REFERENCES foreman_planning_docs(id),
  FOREIGN KEY (artifact_id) REFERENCES foreman_artifacts(id)
);
```

---

## Part 3: Implementation Phases

### Phase 1: Session Management (Foundation)

**Goal**: Control Claude Code from viewer.

**Deliverables**:
1. Terminal app selection in settings
2. Launch session API (opens Claude in user's terminal)
3. Session tracking (PID, status)
4. Basic restart capability

**Validation**: User can launch/restart Claude Code from viewer.

### Phase 2: Artifact Editor

**Goal**: Edit agents/commands in viewer.

**Deliverables**:
1. Artifact browser UI (dual-pane: personal/project)
2. Monaco-based markdown editor
3. YAML frontmatter validation
4. Filesystem sync on save
5. CLI restart trigger on save

**Validation**: User edits agent, saves, CLI restarts with new agent available.

### Phase 3: Planning Hub

**Goal**: Store and edit planning documents.

**Deliverables**:
1. Planning document storage
2. Document editor with structure validation
3. Version history
4. GitHub issue preview

**Validation**: User creates issue YAML in viewer, sees valid structure.

### Phase 4: Artifact Generation

**Goal**: Generate from planning documents.

**Deliverables**:
1. Generation preview
2. GitHub issue creation
3. Context package generation
4. Lineage tracking

**Validation**: User generates GitHub issue + agent context from issue YAML.

### Phase 5: Context Engine (from v3)

**Goal**: Intelligent context injection.

**Deliverables**:
1. Local context persistence (GitHub comment capture)
2. Label-based rule injection
3. Pattern detection
4. Duo candidate surfacing

**Validation**: Agent receives locally-cached context without GitHub round-trip.

### Phase 6: Agent Refinement (from v3)

**Goal**: Agents improve over time.

**Deliverables**:
1. Success/failure tracking
2. Preventive instruction injection
3. Refinement suggestions

**Validation**: Agent working on billing folder receives billing-specific guidance from past failures.

---

## Part 4: UI Wireframes

### 4.1 Main Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLAUDE-MEM                                        ⚙️ Settings  👤 User  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ACTIVE SESSIONS                                                 │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ 🟢 my-app   │ │ 🟡 api-svc  │ │   + New     │                │    │
│  │  │ Issue #42   │ │ Paused      │ │   Session   │                │    │
│  │  │ [Open] [⟳]  │ │ [Resume]    │ │             │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐  │
│  │  ARTIFACTS                      │ │  INSIGHTS                      │  │
│  │  Personal: 44 agents, 25 cmds   │ │  🎯 Duo candidate detected:    │  │
│  │  my-app: 2 agents, 1 cmd        │ │     billing-api-specialist     │  │
│  │                                 │ │     Confidence: 87%            │  │
│  │  [Browse & Edit →]              │ │     [Review] [Dismiss]         │  │
│  └────────────────────────────────┘ └────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  RECENT MEMORY                                          [More →] │    │
│  │  • #4772 Issue Planning 4-Tier YAML Structure           3:54 PM │    │
│  │  • #4770 Chain-Issue GitHub-Driven Workflow             3:54 PM │    │
│  │  • #4768 Impact-Change Dual-Phase Workflow              3:54 PM │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Artifact Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back    ARTIFACT EDITOR                          [Validate] [Save]   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐ ┌────────────────────────────────────────────┐│
│  │  📁 BROWSER          │ │  backend-architect.md                      ││
│  │  ──────────────────  │ │  ────────────────────────────────────────  ││
│  │  ▼ Personal          │ │  ```yaml                                   ││
│  │    ▼ agents/         │ │  name: backend-architect                   ││
│  │      backend-arch... │ │  description: Backend API implementation   ││
│  │      frontend-dev... │ │  allowed-tools:                            ││
│  │      ai-engineer.md  │ │    - Bash                                  ││
│  │    ▶ commands/       │ │    - Read                                  ││
│  │    ▶ rules/          │ │    - Edit                                  ││
│  │  ▼ Project: my-app   │ │  ```                                       ││
│  │    ▼ agents/         │ │                                            ││
│  │      billing-spec... │ │  You are a backend architect...            ││
│  │    ▶ commands/       │ │                                            ││
│  └──────────────────────┘ └────────────────────────────────────────────┘│
│                           ┌────────────────────────────────────────────┐│
│                           │  PREVIEW                                   ││
│                           │  Name: backend-architect                   ││
│                           │  Tools: Bash, Read, Edit                   ││
│                           │  Status: ✓ Valid                           ││
│                           └────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Planning Hub

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back    PLANNING HUB                                    [+ New Doc]  │
├─────────────────────────────────────────────────────────────────────────┤
│  Project: my-app    Release: release-1                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  DOCUMENTS                                                          ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │ release-    │ │ issue-      │ │ issue-042   │ │ issue-043   │   ││
│  │  │ spec.md     │ │ plan.md     │ │ .yaml       │ │ .yaml       │   ││
│  │  │ ✓ Approved  │ │ ✓ Approved  │ │ 🔄 Draft    │ │ 📝 New      │   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐  │
│  │  EDITOR: issue-042.yaml        │ │  GENERATION PREVIEW            │  │
│  │  ──────────────────────────── │ │  ────────────────────────────  │  │
│  │  sequence_number: "042"        │ │  Will create:                  │  │
│  │  title: "Add billing API"      │ │                                │  │
│  │  type: feat                    │ │  ☐ GitHub Issue #42            │  │
│  │  area: api                     │ │  ☐ Agent context package       │  │
│  │  phase: dev                    │ │  ☐ Test specification          │  │
│  │  agents:                       │ │                                │  │
│  │    required_agents:            │ │  [Preview Details]             │  │
│  │      - agent: backend-arch...  │ │  [Generate Selected]           │  │
│  │                                │ │  [Generate All]                │  │
│  └────────────────────────────────┘ └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: What v4 Adds Over v3

| Capability | v3 | v4 |
|------------|----|----|
| Local context persistence | ✓ | ✓ |
| Pattern detection | ✓ | ✓ |
| Agent refinement | ✓ | ✓ |
| Label-based rules | ✓ | ✓ |
| CLI session management | - | ✓ |
| Artifact editing in viewer | - | ✓ |
| Planning document storage | - | ✓ |
| Artifact generation | - | ✓ |
| Terminal app selection | - | ✓ |
| Auto-restart on artifact change | - | ✓ |
| Conversation resume after restart | - | ✓ |

---

## Part 6: Success Metrics

1. **Session Continuity**: 95%+ of restarts successfully resume conversation
2. **Artifact Edit Time**: Edit-save-available cycle < 5 seconds
3. **Generation Accuracy**: 90%+ of generated artifacts require no manual fixes
4. **Context Window Reduction**: 50%+ (from v3 baseline)
5. **Duo Detection Accuracy**: 80%+ useful suggestions

---

## Part 7: What This Does NOT Do

1. **Does NOT embed a terminal** - Uses user's preferred terminal app
2. **Does NOT replace filesystem** - Files remain source of truth
3. **Does NOT auto-generate without approval** - User controls generation
4. **Does NOT require viewer to use foreman** - Standalone mode still works
5. **Does NOT store secrets** - No API keys or credentials in planning docs

---

## Appendix A: Terminal Launch Commands

**macOS - iTerm**:
```bash
osascript -e 'tell application "iTerm"
  create window with default profile
  tell current session of current window
    write text "cd /path/to/project && claude"
  end tell
end tell'
```

**macOS - Terminal**:
```bash
osascript -e 'tell application "Terminal"
  do script "cd /path/to/project && claude"
end tell'
```

**Linux**:
```bash
gnome-terminal -- bash -c "cd /path/to/project && claude; exec bash"
# or
xterm -e "cd /path/to/project && claude"
```

**Windows**:
```powershell
Start-Process wt -ArgumentList "new-tab -d /path/to/project claude"
```

---

## Appendix B: Artifact Validation Rules

**Agent**:
- Must have `name` field
- `allowed-tools` must be array of valid tools
- If `scope` present, must have valid `paths` or `globs`

**Command**:
- Must start with valid slash-command declaration
- Arguments must be documented
- No recursive agent launches without exit condition

**Rule**:
- Must be valid MDC format
- `alwaysApply` must be boolean
- `globs` must be valid glob patterns

**Issue YAML**:
- Must have `sequence_number`, `title`, `type`
- `agents.required_agents` must reference existing agents
- `folders.primary` must be valid paths
