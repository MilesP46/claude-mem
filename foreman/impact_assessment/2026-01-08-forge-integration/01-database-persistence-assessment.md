# Database & Persistence Impact Assessment

## Executive Summary

The Forge integration introduces a significant expansion to the claude-mem SQLite database, adding 15 new tables to support artifact management, behavior learning, planning decisions, session bridging, and change tracking. The current database architecture (7 migrations, ~20 schema versions from runner) provides a solid foundation using WAL mode, prepared statements, and FTS5 full-text search.

The new Forge tables fall into four logical domains: **Core Artifacts** (forge_artifacts, forge_relations, forge_executions), **Behavior Learning** (forge_behaviors, forge_terminals), **Planning** (forge_planning, forge_pipeline_state, forge_planning_decisions, forge_decision_dependencies, forge_decision_branches, forge_template_usage, forge_capability_gaps), and **Bridge** (forge_bridge_sessions, forge_pending_changes, forge_change_decisions). Each domain integrates cleanly with existing tables through foreign key relationships to `sessions` and cross-references to `observations`.

The migration strategy employs a single migration008 containing all 15 tables with full up/down migrations, transactional safety, and pre-flight checks for large databases. Query performance analysis reveals recursive CTE requirements for graph traversal, necessitating careful index design on relationship edges and common filter columns. FTS5 extension is recommended for artifact content search with triggers maintaining sync.

## Schema Design

### forge_artifacts

The central node table for all orchestration artifacts (commands, agents, skills, instructions, templates, rules).

```sql
CREATE TABLE forge_artifacts (
  id TEXT PRIMARY KEY,                    -- UUID for global uniqueness
  project_id TEXT NOT NULL,               -- Links to project context
  artifact_type TEXT NOT NULL CHECK (artifact_type IN (
    'command', 'agent', 'skill', 'instruction', 'template', 'rule'
  )),
  name TEXT NOT NULL,                     -- Human-readable identifier
  description TEXT,                       -- Optional description
  content TEXT NOT NULL,                  -- Full artifact content (markdown)
  frontmatter JSON,                       -- Parsed YAML frontmatter
  checksum TEXT NOT NULL,                 -- SHA-256 for conflict detection

  -- Format validation
  format_version TEXT DEFAULT '1.0',
  format_valid BOOLEAN DEFAULT true,
  format_errors JSON,                     -- Array of validation errors

  -- Timestamps (dual format per project convention)
  created_at TEXT NOT NULL,
  created_at_epoch INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  updated_at_epoch INTEGER NOT NULL,

  UNIQUE(project_id, artifact_type, name)
);

-- Indexes for common access patterns
CREATE INDEX idx_forge_artifacts_project ON forge_artifacts(project_id);
CREATE INDEX idx_forge_artifacts_type ON forge_artifacts(artifact_type);
CREATE INDEX idx_forge_artifacts_project_type ON forge_artifacts(project_id, artifact_type);
CREATE INDEX idx_forge_artifacts_name ON forge_artifacts(name);
CREATE INDEX idx_forge_artifacts_checksum ON forge_artifacts(checksum);
CREATE INDEX idx_forge_artifacts_updated ON forge_artifacts(updated_at_epoch DESC);
```

### forge_relationships (renamed from forge_relations for clarity)

Edge table connecting artifacts with typed relationships.

```sql
CREATE TABLE forge_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'launches',              -- Command launches Agent
    'uses_skill',            -- Agent/Command uses Skill
    'references_template',   -- Any artifact references Template
    'applies_rule',          -- Artifact applies Rule
    'includes_instruction',  -- Artifact includes Instruction
    'extends',               -- Artifact extends another
    'depends_on'             -- General dependency
  )),

  -- Context for relationship (where it was detected)
  context_line INTEGER,
  context_text TEXT,

  -- Detection metadata
  detection_method TEXT CHECK (detection_method IN ('explicit', 'inferred', 'manual')),
  confidence REAL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),

  created_at TEXT NOT NULL,
  created_at_epoch INTEGER NOT NULL,

  FOREIGN KEY (source_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  UNIQUE(source_id, target_id, relationship_type)
);

-- Critical indexes for graph traversal
CREATE INDEX idx_forge_relationships_source ON forge_relationships(source_id);
CREATE INDEX idx_forge_relationships_target ON forge_relationships(target_id);
CREATE INDEX idx_forge_relationships_type ON forge_relationships(relationship_type);
CREATE INDEX idx_forge_relationships_source_type ON forge_relationships(source_id, relationship_type);
CREATE INDEX idx_forge_relationships_target_type ON forge_relationships(target_id, relationship_type);
```

### forge_executions

Execution history linking artifacts to sessions and observations.

```sql
CREATE TABLE forge_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id TEXT NOT NULL,
  session_id TEXT NOT NULL,                -- Links to sdk_sessions.content_session_id
  parent_execution_id INTEGER,             -- For nested artifact execution

  started_at TEXT NOT NULL,
  started_at_epoch INTEGER NOT NULL,
  ended_at TEXT,
  ended_at_epoch INTEGER,
  status TEXT CHECK (status IN ('running', 'success', 'failure', 'timeout')) DEFAULT 'running',
  tokens_used INTEGER,
  error_message TEXT,

  -- Links to claude-mem observations (JSON array of observation IDs)
  observation_ids JSON,
  -- Child artifacts launched during this execution (JSON array of artifact IDs)
  child_artifacts JSON,

  FOREIGN KEY (artifact_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_execution_id) REFERENCES forge_executions(id) ON DELETE SET NULL
);

-- Indexes for execution queries
CREATE INDEX idx_forge_executions_artifact ON forge_executions(artifact_id);
CREATE INDEX idx_forge_executions_session ON forge_executions(session_id);
CREATE INDEX idx_forge_executions_status ON forge_executions(status);
CREATE INDEX idx_forge_executions_parent ON forge_executions(parent_execution_id);
CREATE INDEX idx_forge_executions_started ON forge_executions(started_at_epoch DESC);
CREATE INDEX idx_forge_executions_artifact_status ON forge_executions(artifact_id, status);
```

### forge_behaviors

Learned user patterns with confidence scoring.

```sql
CREATE TABLE forge_behaviors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN (
    'script_usage',       -- npm run dev, npm test, etc.
    'build_mode',         -- development vs production
    'test_strategy',      -- test-first, test-after, test-during
    'commit_style',       -- conventional, descriptive, etc.
    'verification_pref',  -- UI verification, API testing, etc.
    'editor_pref',        -- VS Code, Cursor, etc.
    'workflow_pref'       -- Sequential vs parallel, etc.
  )),

  pattern_key TEXT NOT NULL,              -- Unique pattern identifier
  pattern_value TEXT NOT NULL,            -- The actual pattern/command

  evidence_count INTEGER DEFAULT 1,
  evidence_sessions JSON,                 -- Array of session IDs as evidence

  -- Confidence formula: min(0.95, 0.5 + (evidence_count * 0.05))
  confidence REAL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),

  first_seen TEXT NOT NULL,
  first_seen_epoch INTEGER NOT NULL,
  last_seen TEXT NOT NULL,
  last_seen_epoch INTEGER NOT NULL,

  UNIQUE(project_id, behavior_type, pattern_key)
);

-- Indexes for behavior queries
CREATE INDEX idx_forge_behaviors_project ON forge_behaviors(project_id);
CREATE INDEX idx_forge_behaviors_type ON forge_behaviors(behavior_type);
CREATE INDEX idx_forge_behaviors_confidence ON forge_behaviors(confidence DESC);
CREATE INDEX idx_forge_behaviors_project_type ON forge_behaviors(project_id, behavior_type);
CREATE INDEX idx_forge_behaviors_last_seen ON forge_behaviors(last_seen_epoch DESC);
```

### forge_terminals

Raw terminal command history for behavior inference.

```sql
CREATE TABLE forge_terminals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,                        -- Optional link to sdk_sessions.content_session_id
  project_id TEXT NOT NULL,

  command TEXT NOT NULL,
  working_dir TEXT,
  exit_code INTEGER,
  duration_ms INTEGER,                    -- Command execution duration

  executed_at TEXT NOT NULL,
  executed_at_epoch INTEGER NOT NULL
);

-- Indexes for terminal queries
CREATE INDEX idx_forge_terminals_session ON forge_terminals(session_id);
CREATE INDEX idx_forge_terminals_project ON forge_terminals(project_id);
CREATE INDEX idx_forge_terminals_executed ON forge_terminals(executed_at_epoch DESC);
CREATE INDEX idx_forge_terminals_command ON forge_terminals(command);
```

### forge_sessions (renamed from forge_bridge_sessions for consistency)

External terminal session tracking for the Bridge feature.

```sql
CREATE TABLE forge_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,        -- Links to sdk_sessions.content_session_id
  terminal_pid INTEGER,
  terminal_type TEXT,                     -- iTerm2, Ghostty, Kitty, WezTerm, etc.
  project_root TEXT NOT NULL,

  started_at TEXT NOT NULL,
  started_at_epoch INTEGER NOT NULL,
  ended_at TEXT,
  ended_at_epoch INTEGER,

  vscode_connected BOOLEAN DEFAULT false,
  browser_connected BOOLEAN DEFAULT false,

  -- Metadata for session recovery
  last_heartbeat_epoch INTEGER,
  agent_context TEXT                      -- Active agent/command context
);

-- Indexes for session queries
CREATE INDEX idx_forge_sessions_session_id ON forge_sessions(session_id);
CREATE INDEX idx_forge_sessions_terminal_pid ON forge_sessions(terminal_pid);
CREATE INDEX idx_forge_sessions_started ON forge_sessions(started_at_epoch DESC);
CREATE INDEX idx_forge_sessions_heartbeat ON forge_sessions(last_heartbeat_epoch DESC);
```

### forge_decisions

Planning decisions with alternatives and dependency tracking.

```sql
CREATE TABLE forge_decisions (
  id TEXT PRIMARY KEY,                    -- UUID for decision reference
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  agent TEXT NOT NULL,                    -- Which agent made the decision
  phase TEXT NOT NULL,                    -- research, concept, design, etc.
  category TEXT NOT NULL,                 -- technology, architecture, ux, etc.

  title TEXT NOT NULL,
  description TEXT,
  decision_value TEXT NOT NULL,           -- The chosen value
  decision_score REAL,                    -- Score/ranking (0-10)

  alternatives JSON,                      -- Array of {value, score, rationale}

  -- Traceability
  concept_ids JSON,                       -- Array of concept IDs
  depends_on JSON,                        -- Array of decision IDs
  source_file TEXT,
  source_line INTEGER,

  -- Status management
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'locked', 'user_override', 'inherited'
  )),

  original_value TEXT,                    -- Value before override
  override_rationale TEXT,
  branch_id TEXT DEFAULT 'main',

  created_at TEXT NOT NULL,
  created_at_epoch INTEGER NOT NULL,
  locked_at TEXT,
  locked_at_epoch INTEGER,
  locked_by TEXT                          -- User or agent that locked
);

-- Indexes for decision queries
CREATE INDEX idx_forge_decisions_project_release ON forge_decisions(project_id, release_id);
CREATE INDEX idx_forge_decisions_agent ON forge_decisions(agent);
CREATE INDEX idx_forge_decisions_phase ON forge_decisions(phase);
CREATE INDEX idx_forge_decisions_status ON forge_decisions(status);
CREATE INDEX idx_forge_decisions_branch ON forge_decisions(branch_id);
CREATE INDEX idx_forge_decisions_created ON forge_decisions(created_at_epoch DESC);
```

### forge_changes

File change hunks for Bridge review functionality.

```sql
CREATE TABLE forge_changes (
  id TEXT PRIMARY KEY,                    -- UUID for change reference
  session_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  agent TEXT,                             -- Which agent made the change

  -- Hunk data as JSON array
  hunks JSON NOT NULL,                    -- [{id, startLine, endLine, lines, original, modified, summary, status}]

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'resolved')),

  created_at TEXT NOT NULL,
  created_at_epoch INTEGER NOT NULL,
  resolved_at TEXT,
  resolved_at_epoch INTEGER
);

-- Indexes for change queries
CREATE INDEX idx_forge_changes_session ON forge_changes(session_id);
CREATE INDEX idx_forge_changes_file ON forge_changes(file_path);
CREATE INDEX idx_forge_changes_status ON forge_changes(status);
CREATE INDEX idx_forge_changes_created ON forge_changes(created_at_epoch DESC);
```

### forge_pipelines

Chain workflow state tracking.

```sql
CREATE TABLE forge_pipelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('greenfield', 'brownfield', 'hybrid')),
  current_command TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,

  -- Session integration
  session_name TEXT,
  session_id TEXT,                        -- Links to sdk_sessions.content_session_id
  is_resumable BOOLEAN DEFAULT true,

  started_at TEXT NOT NULL,
  started_at_epoch INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  updated_at_epoch INTEGER NOT NULL,
  completed_at TEXT,
  completed_at_epoch INTEGER,

  decisions_count INTEGER DEFAULT 0,
  artifacts_generated JSON,               -- Array of artifact IDs generated

  UNIQUE(project_id, release_id)
);

-- Indexes for pipeline queries
CREATE INDEX idx_forge_pipelines_project ON forge_pipelines(project_id);
CREATE INDEX idx_forge_pipelines_release ON forge_pipelines(release_id);
CREATE INDEX idx_forge_pipelines_session ON forge_pipelines(session_id);
CREATE INDEX idx_forge_pipelines_updated ON forge_pipelines(updated_at_epoch DESC);
```

### Additional Supporting Tables

```sql
-- Decision dependencies (graph edges between decisions)
CREATE TABLE forge_decision_deps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  decision_id TEXT NOT NULL,
  depends_on_id TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'requires',

  FOREIGN KEY (decision_id) REFERENCES forge_decisions(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_id) REFERENCES forge_decisions(id) ON DELETE CASCADE,
  UNIQUE(decision_id, depends_on_id)
);

CREATE INDEX idx_forge_decision_deps_decision ON forge_decision_deps(decision_id);
CREATE INDEX idx_forge_decision_deps_depends ON forge_decision_deps(depends_on_id);

-- Decision branches for alternative planning paths
CREATE TABLE forge_decision_branches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  branched_from TEXT DEFAULT 'main',
  branched_at TEXT NOT NULL,
  branched_at_epoch INTEGER NOT NULL,

  is_active BOOLEAN DEFAULT false,
  merged_at TEXT,
  merged_at_epoch INTEGER,
  merged_into TEXT,

  UNIQUE(project_id, release_id, name)
);

CREATE INDEX idx_forge_decision_branches_project_release ON forge_decision_branches(project_id, release_id);

-- Template usage tracking per release
CREATE TABLE forge_template_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  release_id TEXT NOT NULL,

  template_path TEXT NOT NULL,
  instructions_path TEXT NOT NULL,
  output_path TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),

  placeholders_total INTEGER DEFAULT 0,
  placeholders_filled INTEGER DEFAULT 0,

  filled_by_agent TEXT,
  filled_at TEXT,
  filled_at_epoch INTEGER,

  UNIQUE(project_id, release_id, template_path)
);

CREATE INDEX idx_forge_template_usage_project_release ON forge_template_usage(project_id, release_id);
CREATE INDEX idx_forge_template_usage_status ON forge_template_usage(status);

-- Capability gap identification
CREATE TABLE forge_capability_gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT,                        -- NULL for cross-project gaps

  gap_type TEXT NOT NULL CHECK (gap_type IN (
    'command', 'agent', 'skill', 'template', 'hook', 'rule'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  pattern_description TEXT,
  evidence_count INTEGER DEFAULT 1,
  evidence_releases JSON,                 -- Array of release IDs

  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  impact_score REAL,

  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'acknowledged', 'in_progress', 'implemented', 'dismissed'
  )),

  implemented_artifact_id TEXT,
  implemented_at TEXT,
  implemented_at_epoch INTEGER,

  created_at TEXT NOT NULL,
  created_at_epoch INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  updated_at_epoch INTEGER NOT NULL
);

CREATE INDEX idx_forge_capability_gaps_project ON forge_capability_gaps(project_id);
CREATE INDEX idx_forge_capability_gaps_status ON forge_capability_gaps(status);
CREATE INDEX idx_forge_capability_gaps_priority ON forge_capability_gaps(priority);

-- Change decisions (hunk-level accept/reject tracking)
CREATE TABLE forge_change_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  change_id TEXT NOT NULL,
  hunk_index INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  decided_in TEXT CHECK (decided_in IN ('vscode', 'browser', 'cli')),

  decided_at TEXT NOT NULL,
  decided_at_epoch INTEGER NOT NULL,

  FOREIGN KEY (change_id) REFERENCES forge_changes(id) ON DELETE CASCADE,
  UNIQUE(change_id, hunk_index)
);

CREATE INDEX idx_forge_change_decisions_change ON forge_change_decisions(change_id);
```

## Migration Strategy

### migration008 - Complete Forge Tables

```typescript
import { Database } from 'bun:sqlite';
import { Migration } from './Database.js';

/**
 * Migration 008 - Forge Integration Tables
 *
 * Creates all tables required for the Forge orchestration system:
 * - Artifact management (nodes, edges, executions)
 * - Behavior learning (patterns, terminals)
 * - Planning visibility (decisions, pipelines, templates, gaps)
 * - Bridge functionality (sessions, changes, change decisions)
 *
 * This migration is designed to be safe for large databases:
 * - All CREATE TABLE use IF NOT EXISTS
 * - All CREATE INDEX use IF NOT EXISTS
 * - No data migration required (fresh tables)
 * - Full transactional safety
 */
export const migration008: Migration = {
  version: 8,
  up: (db: Database) => {
    // Pre-flight check: Estimate database size for logging
    const sizeCheck = db.query(`
      SELECT page_count * page_size as size_bytes
      FROM pragma_page_count(), pragma_page_size()
    `).get() as { size_bytes: number } | undefined;

    const dbSizeMB = sizeCheck ? (sizeCheck.size_bytes / 1024 / 1024).toFixed(2) : 'unknown';
    console.log(`[migration008] Starting Forge tables migration (DB size: ${dbSizeMB} MB)`);

    // Execute all table creations in a single transaction
    db.run('BEGIN IMMEDIATE TRANSACTION');

    try {
      // ==========================================
      // CORE ARTIFACT TABLES
      // ==========================================

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_artifacts (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          artifact_type TEXT NOT NULL CHECK (artifact_type IN (
            'command', 'agent', 'skill', 'instruction', 'template', 'rule'
          )),
          name TEXT NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          frontmatter JSON,
          checksum TEXT NOT NULL,
          format_version TEXT DEFAULT '1.0',
          format_valid BOOLEAN DEFAULT true,
          format_errors JSON,
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          updated_at TEXT NOT NULL,
          updated_at_epoch INTEGER NOT NULL,
          UNIQUE(project_id, artifact_type, name)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_relationships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          relationship_type TEXT NOT NULL CHECK (relationship_type IN (
            'launches', 'uses_skill', 'references_template',
            'applies_rule', 'includes_instruction', 'extends', 'depends_on'
          )),
          context_line INTEGER,
          context_text TEXT,
          detection_method TEXT CHECK (detection_method IN ('explicit', 'inferred', 'manual')),
          confidence REAL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          FOREIGN KEY (source_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
          FOREIGN KEY (target_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
          UNIQUE(source_id, target_id, relationship_type)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_executions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          artifact_id TEXT NOT NULL,
          session_id TEXT NOT NULL,
          parent_execution_id INTEGER,
          started_at TEXT NOT NULL,
          started_at_epoch INTEGER NOT NULL,
          ended_at TEXT,
          ended_at_epoch INTEGER,
          status TEXT CHECK (status IN ('running', 'success', 'failure', 'timeout')) DEFAULT 'running',
          tokens_used INTEGER,
          error_message TEXT,
          observation_ids JSON,
          child_artifacts JSON,
          FOREIGN KEY (artifact_id) REFERENCES forge_artifacts(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_execution_id) REFERENCES forge_executions(id) ON DELETE SET NULL
        )
      `);

      // ==========================================
      // BEHAVIOR LEARNING TABLES
      // ==========================================

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_behaviors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL,
          behavior_type TEXT NOT NULL CHECK (behavior_type IN (
            'script_usage', 'build_mode', 'test_strategy',
            'commit_style', 'verification_pref', 'editor_pref', 'workflow_pref'
          )),
          pattern_key TEXT NOT NULL,
          pattern_value TEXT NOT NULL,
          evidence_count INTEGER DEFAULT 1,
          evidence_sessions JSON,
          confidence REAL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
          first_seen TEXT NOT NULL,
          first_seen_epoch INTEGER NOT NULL,
          last_seen TEXT NOT NULL,
          last_seen_epoch INTEGER NOT NULL,
          UNIQUE(project_id, behavior_type, pattern_key)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_terminals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          project_id TEXT NOT NULL,
          command TEXT NOT NULL,
          working_dir TEXT,
          exit_code INTEGER,
          duration_ms INTEGER,
          executed_at TEXT NOT NULL,
          executed_at_epoch INTEGER NOT NULL
        )
      `);

      // ==========================================
      // PLANNING TABLES
      // ==========================================

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_decisions (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          release_id TEXT NOT NULL,
          agent TEXT NOT NULL,
          phase TEXT NOT NULL,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          decision_value TEXT NOT NULL,
          decision_score REAL,
          alternatives JSON,
          concept_ids JSON,
          depends_on JSON,
          source_file TEXT,
          source_line INTEGER,
          status TEXT DEFAULT 'pending' CHECK (status IN (
            'pending', 'locked', 'user_override', 'inherited'
          )),
          original_value TEXT,
          override_rationale TEXT,
          branch_id TEXT DEFAULT 'main',
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          locked_at TEXT,
          locked_at_epoch INTEGER,
          locked_by TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_decision_deps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          decision_id TEXT NOT NULL,
          depends_on_id TEXT NOT NULL,
          dependency_type TEXT DEFAULT 'requires',
          FOREIGN KEY (decision_id) REFERENCES forge_decisions(id) ON DELETE CASCADE,
          FOREIGN KEY (depends_on_id) REFERENCES forge_decisions(id) ON DELETE CASCADE,
          UNIQUE(decision_id, depends_on_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_decision_branches (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          release_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          branched_from TEXT DEFAULT 'main',
          branched_at TEXT NOT NULL,
          branched_at_epoch INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT false,
          merged_at TEXT,
          merged_at_epoch INTEGER,
          merged_into TEXT,
          UNIQUE(project_id, release_id, name)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_pipelines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL,
          release_id TEXT NOT NULL,
          pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('greenfield', 'brownfield', 'hybrid')),
          current_command TEXT NOT NULL,
          current_phase TEXT NOT NULL,
          current_step INTEGER DEFAULT 0,
          session_name TEXT,
          session_id TEXT,
          is_resumable BOOLEAN DEFAULT true,
          started_at TEXT NOT NULL,
          started_at_epoch INTEGER NOT NULL,
          updated_at TEXT NOT NULL,
          updated_at_epoch INTEGER NOT NULL,
          completed_at TEXT,
          completed_at_epoch INTEGER,
          decisions_count INTEGER DEFAULT 0,
          artifacts_generated JSON,
          UNIQUE(project_id, release_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_template_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL,
          release_id TEXT NOT NULL,
          template_path TEXT NOT NULL,
          instructions_path TEXT NOT NULL,
          output_path TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),
          placeholders_total INTEGER DEFAULT 0,
          placeholders_filled INTEGER DEFAULT 0,
          filled_by_agent TEXT,
          filled_at TEXT,
          filled_at_epoch INTEGER,
          UNIQUE(project_id, release_id, template_path)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_capability_gaps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT,
          gap_type TEXT NOT NULL CHECK (gap_type IN (
            'command', 'agent', 'skill', 'template', 'hook', 'rule'
          )),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          pattern_description TEXT,
          evidence_count INTEGER DEFAULT 1,
          evidence_releases JSON,
          priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          impact_score REAL,
          status TEXT DEFAULT 'identified' CHECK (status IN (
            'identified', 'acknowledged', 'in_progress', 'implemented', 'dismissed'
          )),
          implemented_artifact_id TEXT,
          implemented_at TEXT,
          implemented_at_epoch INTEGER,
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          updated_at TEXT NOT NULL,
          updated_at_epoch INTEGER NOT NULL
        )
      `);

      // ==========================================
      // BRIDGE TABLES
      // ==========================================

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL UNIQUE,
          terminal_pid INTEGER,
          terminal_type TEXT,
          project_root TEXT NOT NULL,
          started_at TEXT NOT NULL,
          started_at_epoch INTEGER NOT NULL,
          ended_at TEXT,
          ended_at_epoch INTEGER,
          vscode_connected BOOLEAN DEFAULT false,
          browser_connected BOOLEAN DEFAULT false,
          last_heartbeat_epoch INTEGER,
          agent_context TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_changes (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          file_path TEXT NOT NULL,
          agent TEXT,
          hunks JSON NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'resolved')),
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          resolved_at TEXT,
          resolved_at_epoch INTEGER
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS forge_change_decisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          change_id TEXT NOT NULL,
          hunk_index INTEGER NOT NULL,
          decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
          decided_in TEXT CHECK (decided_in IN ('vscode', 'browser', 'cli')),
          decided_at TEXT NOT NULL,
          decided_at_epoch INTEGER NOT NULL,
          FOREIGN KEY (change_id) REFERENCES forge_changes(id) ON DELETE CASCADE,
          UNIQUE(change_id, hunk_index)
        )
      `);

      // ==========================================
      // CREATE ALL INDEXES
      // ==========================================

      // Artifact indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_project ON forge_artifacts(project_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_type ON forge_artifacts(artifact_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_project_type ON forge_artifacts(project_id, artifact_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_name ON forge_artifacts(name)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_checksum ON forge_artifacts(checksum)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_artifacts_updated ON forge_artifacts(updated_at_epoch DESC)');

      // Relationship indexes (critical for graph traversal)
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_relationships_source ON forge_relationships(source_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_relationships_target ON forge_relationships(target_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_relationships_type ON forge_relationships(relationship_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_relationships_source_type ON forge_relationships(source_id, relationship_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_relationships_target_type ON forge_relationships(target_id, relationship_type)');

      // Execution indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_artifact ON forge_executions(artifact_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_session ON forge_executions(session_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_status ON forge_executions(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_parent ON forge_executions(parent_execution_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_started ON forge_executions(started_at_epoch DESC)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_executions_artifact_status ON forge_executions(artifact_id, status)');

      // Behavior indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_behaviors_project ON forge_behaviors(project_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_behaviors_type ON forge_behaviors(behavior_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_behaviors_confidence ON forge_behaviors(confidence DESC)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_behaviors_project_type ON forge_behaviors(project_id, behavior_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_behaviors_last_seen ON forge_behaviors(last_seen_epoch DESC)');

      // Terminal indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_terminals_session ON forge_terminals(session_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_terminals_project ON forge_terminals(project_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_terminals_executed ON forge_terminals(executed_at_epoch DESC)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_terminals_command ON forge_terminals(command)');

      // Decision indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_project_release ON forge_decisions(project_id, release_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_agent ON forge_decisions(agent)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_phase ON forge_decisions(phase)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_status ON forge_decisions(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_branch ON forge_decisions(branch_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decisions_created ON forge_decisions(created_at_epoch DESC)');

      // Decision dependency indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decision_deps_decision ON forge_decision_deps(decision_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decision_deps_depends ON forge_decision_deps(depends_on_id)');

      // Decision branch indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_decision_branches_project_release ON forge_decision_branches(project_id, release_id)');

      // Pipeline indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_pipelines_project ON forge_pipelines(project_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_pipelines_release ON forge_pipelines(release_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_pipelines_session ON forge_pipelines(session_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_pipelines_updated ON forge_pipelines(updated_at_epoch DESC)');

      // Template usage indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_template_usage_project_release ON forge_template_usage(project_id, release_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_template_usage_status ON forge_template_usage(status)');

      // Capability gap indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_capability_gaps_project ON forge_capability_gaps(project_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_capability_gaps_status ON forge_capability_gaps(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_capability_gaps_priority ON forge_capability_gaps(priority)');

      // Session indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_sessions_session_id ON forge_sessions(session_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_sessions_terminal_pid ON forge_sessions(terminal_pid)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_sessions_started ON forge_sessions(started_at_epoch DESC)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_sessions_heartbeat ON forge_sessions(last_heartbeat_epoch DESC)');

      // Change indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_changes_session ON forge_changes(session_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_changes_file ON forge_changes(file_path)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_changes_status ON forge_changes(status)');
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_changes_created ON forge_changes(created_at_epoch DESC)');

      // Change decision indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_forge_change_decisions_change ON forge_change_decisions(change_id)');

      db.run('COMMIT');
      console.log('[migration008] Successfully created all Forge tables and indexes');
    } catch (error) {
      db.run('ROLLBACK');
      console.error('[migration008] Migration failed, rolling back:', error);
      throw error;
    }
  },

  down: (db: Database) => {
    console.log('[migration008] Rolling back Forge tables');

    db.run('BEGIN IMMEDIATE TRANSACTION');

    try {
      // Drop in reverse dependency order
      db.run('DROP TABLE IF EXISTS forge_change_decisions');
      db.run('DROP TABLE IF EXISTS forge_changes');
      db.run('DROP TABLE IF EXISTS forge_sessions');
      db.run('DROP TABLE IF EXISTS forge_capability_gaps');
      db.run('DROP TABLE IF EXISTS forge_template_usage');
      db.run('DROP TABLE IF EXISTS forge_pipelines');
      db.run('DROP TABLE IF EXISTS forge_decision_branches');
      db.run('DROP TABLE IF EXISTS forge_decision_deps');
      db.run('DROP TABLE IF EXISTS forge_decisions');
      db.run('DROP TABLE IF EXISTS forge_terminals');
      db.run('DROP TABLE IF EXISTS forge_behaviors');
      db.run('DROP TABLE IF EXISTS forge_executions');
      db.run('DROP TABLE IF EXISTS forge_relationships');
      db.run('DROP TABLE IF EXISTS forge_artifacts');

      db.run('COMMIT');
      console.log('[migration008] Successfully rolled back Forge tables');
    } catch (error) {
      db.run('ROLLBACK');
      console.error('[migration008] Rollback failed:', error);
      throw error;
    }
  }
};
```

### Pre-flight Checks for Large Databases

The migration includes automatic database size detection and logging. For databases over 1GB, consider:

1. **Backup Before Migration**: `cp ~/.claude-mem/claude-mem.db ~/.claude-mem/claude-mem.db.backup`
2. **Run During Low Activity**: Execute migration when claude-mem is idle
3. **Monitor WAL Size**: Large WAL files may grow during index creation

```typescript
// Optional: Add size warning before migration
const LARGE_DB_THRESHOLD_MB = 1024; // 1GB
if (parseFloat(dbSizeMB) > LARGE_DB_THRESHOLD_MB) {
  console.warn(`[migration008] Large database detected (${dbSizeMB} MB). Migration may take several minutes.`);
}
```

## Performance Analysis

### Query Patterns

#### 1. Artifact Graph Traversal (Recursive CTE)

Finding all artifacts connected to a command:

```sql
-- Get all artifacts reachable from a command
WITH RECURSIVE artifact_graph AS (
  -- Base case: starting artifact
  SELECT
    id, name, artifact_type, 0 as depth
  FROM forge_artifacts
  WHERE id = ?

  UNION ALL

  -- Recursive case: follow relationships
  SELECT
    a.id, a.name, a.artifact_type, ag.depth + 1
  FROM forge_artifacts a
  JOIN forge_relationships r ON r.target_id = a.id
  JOIN artifact_graph ag ON r.source_id = ag.id
  WHERE ag.depth < 5  -- Limit recursion depth
)
SELECT DISTINCT id, name, artifact_type, depth
FROM artifact_graph
ORDER BY depth, artifact_type, name;
```

**EXPLAIN Analysis**: With proper indexes on `forge_relationships(source_id)` and `forge_relationships(target_id)`, this query uses INDEX SEEK for each recursion level. Estimated cost: O(n * log(r)) where n = recursion depth, r = relationship count.

#### 2. Execution Statistics

Aggregate execution stats for an artifact:

```sql
SELECT
  artifact_id,
  COUNT(*) as total_executions,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
  SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures,
  AVG(tokens_used) as avg_tokens,
  MAX(ended_at_epoch) - MIN(started_at_epoch) as execution_span_ms
FROM forge_executions
WHERE artifact_id = ?
GROUP BY artifact_id;
```

**EXPLAIN Analysis**: Uses covering index on `forge_executions(artifact_id, status)`. Estimated cost: O(e) where e = executions for artifact.

#### 3. Behavior Context Injection

Get high-confidence behaviors for a project:

```sql
SELECT
  behavior_type,
  pattern_key,
  pattern_value,
  confidence,
  evidence_count
FROM forge_behaviors
WHERE project_id = ?
  AND confidence >= 0.7
ORDER BY confidence DESC
LIMIT 10;
```

**EXPLAIN Analysis**: Uses index on `forge_behaviors(project_id, confidence)`. Estimated cost: O(log(b)) where b = total behaviors.

### Index Strategy

| Index | Purpose | Access Pattern |
|-------|---------|----------------|
| `idx_forge_artifacts_project_type` | Filter by project and type | LIST commands |
| `idx_forge_relationships_source` | Forward traversal | Get children |
| `idx_forge_relationships_target` | Backward traversal | Get parents |
| `idx_forge_executions_artifact_status` | Execution stats | Success rate |
| `idx_forge_behaviors_confidence` | Confidence ranking | Context injection |
| `idx_forge_decisions_project_release` | Decision filtering | Planning queries |
| `idx_forge_changes_session` | Change lookup | Bridge UI |

### FTS5 Extension for Artifact Search

```sql
-- Create FTS5 virtual table for artifact content search
CREATE VIRTUAL TABLE IF NOT EXISTS forge_artifacts_fts USING fts5(
  name,
  description,
  content,
  content='forge_artifacts',
  content_rowid='rowid'
);

-- Sync triggers
CREATE TRIGGER forge_artifacts_ai AFTER INSERT ON forge_artifacts BEGIN
  INSERT INTO forge_artifacts_fts(rowid, name, description, content)
  SELECT rowid, new.name, new.description, new.content
  FROM forge_artifacts WHERE id = new.id;
END;

CREATE TRIGGER forge_artifacts_ad AFTER DELETE ON forge_artifacts BEGIN
  INSERT INTO forge_artifacts_fts(forge_artifacts_fts, rowid, name, description, content)
  VALUES('delete', old.rowid, old.name, old.description, old.content);
END;

CREATE TRIGGER forge_artifacts_au AFTER UPDATE ON forge_artifacts BEGIN
  INSERT INTO forge_artifacts_fts(forge_artifacts_fts, rowid, name, description, content)
  VALUES('delete', old.rowid, old.name, old.description, old.content);
  INSERT INTO forge_artifacts_fts(rowid, name, description, content)
  SELECT rowid, new.name, new.description, new.content
  FROM forge_artifacts WHERE id = new.id;
END;
```

### Data Retention Policies

| Table | Retention | Rationale |
|-------|-----------|-----------|
| `forge_artifacts` | Permanent | Core orchestration data |
| `forge_relationships` | Permanent | Graph structure |
| `forge_executions` | 90 days | Rolling statistics |
| `forge_behaviors` | Permanent | Learned patterns |
| `forge_terminals` | 30 days | Raw data for behavior inference |
| `forge_decisions` | Per release | Archive on release close |
| `forge_changes` | 7 days after resolution | Short-term review |

## Integration Points

### Integration with Existing sessions Table

The `sdk_sessions` table is the existing session tracking table. Forge tables integrate through:

1. **forge_executions.session_id** references `sdk_sessions.content_session_id`
2. **forge_sessions.session_id** references `sdk_sessions.content_session_id`
3. **forge_changes.session_id** references `sdk_sessions.content_session_id`
4. **forge_pipelines.session_id** references `sdk_sessions.content_session_id`

This allows joining Forge execution data with existing session metadata.

### Integration with Existing observations Table

The `observations` table stores AI-generated observations. Forge integrates through:

1. **forge_executions.observation_ids** stores JSON array of observation IDs
2. Join query to retrieve observations for an artifact execution:

```sql
SELECT o.*
FROM observations o
JOIN json_each(
  (SELECT observation_ids FROM forge_executions WHERE id = ?)
) AS oid ON o.id = oid.value;
```

### Integration with ChromaSync for Vector Embeddings

ChromaSync currently handles vector embeddings for observations. Forge artifacts should be indexed similarly:

1. **Add Forge collection** in ChromaSync for artifact content
2. **Embedding strategy**: Combine name + description + content truncated to 8192 tokens
3. **Metadata fields**: `artifact_type`, `project_id`, `checksum`

```typescript
// In ChromaSync.ts, add method:
async indexForgeArtifact(artifact: ForgeArtifact): Promise<void> {
  const text = `${artifact.name}\n${artifact.description || ''}\n${artifact.content}`;
  const embedding = await this.embedder.embed(text);

  await this.forgeCollection.add({
    ids: [artifact.id],
    embeddings: [embedding],
    metadatas: [{
      artifact_type: artifact.artifact_type,
      project_id: artifact.project_id,
      checksum: artifact.checksum
    }],
    documents: [text]
  });
}
```

## Risks & Mitigations

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| **Migration on large DB** | Medium | Slow migration, WAL growth | Pre-flight size check, user notification, backup recommendation |
| **Graph query performance** | Medium | Slow UI for complex graphs | Depth limits on recursive CTEs, result caching |
| **FTS5 sync overhead** | Low | Insert latency increase | Trigger optimization, async FTS updates |
| **Foreign key cascades** | Medium | Accidental data loss | Careful ON DELETE design, soft deletes where appropriate |
| **JSON column queries** | Low | Full table scans | Denormalize frequently-queried JSON fields |
| **Cross-table transactions** | Medium | Lock contention | Minimize transaction scope, use WAL mode (already enabled) |
| **Schema version gaps** | Low | Migration confusion | Document all version numbers, use continuous numbering |
| **Artifact name collisions** | Low | Unique constraint violations | UNIQUE(project_id, artifact_type, name) constraint |
| **Session ID format changes** | Medium | Broken references | Consistent use of content_session_id across tables |

## Recommendations

### Priority 1: Implementation Order

1. **Core Artifact Tables First**: `forge_artifacts`, `forge_relationships`, `forge_executions`
2. **Behavior Learning Second**: `forge_behaviors`, `forge_terminals`
3. **Planning Tables Third**: `forge_decisions`, `forge_pipelines`, `forge_decision_deps`
4. **Bridge Tables Last**: `forge_sessions`, `forge_changes`, `forge_change_decisions`

### Priority 2: Index Optimization

1. Create covering indexes for the most common queries (execution stats, graph traversal)
2. Add FTS5 for artifact content search after core tables are stable
3. Monitor slow queries using `EXPLAIN QUERY PLAN` during development

### Priority 3: Data Integrity

1. Use `BEGIN IMMEDIATE TRANSACTION` for multi-table writes (prevents read-write conflicts)
2. Implement soft deletes for artifacts (add `deleted_at` column) to prevent cascade surprises
3. Add checksum validation on artifact file sync to detect external modifications

### Priority 4: Performance Monitoring

1. Add query timing to ForgeRoutes for performance regression detection
2. Track index usage with periodic `ANALYZE` runs
3. Monitor WAL file size under heavy write load

### Priority 5: Future Considerations

1. **Partitioning**: If `forge_executions` grows large, consider date-based partitioning
2. **Sharding**: If multi-project scale becomes an issue, project_id-based sharding
3. **Read Replicas**: For VS Code extension queries, consider read-only replica connection
