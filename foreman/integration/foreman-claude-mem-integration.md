# Foreman ↔ claude-mem (fork) integration: crystallizing issue-work into reusable tooling

> Foreman project docs + files live under: `/Users/miles/.my_coding` (treat this as the source-of-truth “Foreman root” on your machine).

## Why this document exists

You have two powerful systems:

1. **Foreman**: a GitHub-issue–driven development orchestrator (planning → execution → review → merge → close) with multi-agent sequencing.
2. **Command–agent duos**: focused, reusable “micro-tooling” bundles (a slash-command + a specialized agent pairing) scoped to paths/contexts.

The missing link is **automatic crystallization**:

- Context (decisions, edge cases, blockers, “don’t run X, run Y”, environment rules) emerges *during* execution.
- That context currently ends up scattered across GitHub comments and ephemeral agent memory.
- You want that context to **condense into durable, queryable, non-bloated artifacts** that can automatically refine:
  - `/start-issue <N>` behavior
  - the project-level agent roster
  - issue-tag–dependent allowed commands
  - reusable duos (and their promotion lifecycle)

This fork of **claude-mem** is the ideal “single-pass compressor + index” layer that can observe what happened, extract stable patterns, and expose them in a cheap-to-reuse form.

This doc proposes a concrete architecture and file/contract design that connects:
- GitHub Issues (system of record)
- Local filesystem (archive + working set)
- claude-mem (compressed index + pattern extraction)
- Foreman (orchestrator + duo generator/promoter)

---

## Design principles

### 1) GitHub is the public ledger; local FS is the working archive
- Keep **high-signal** summaries, decisions, and outcomes on GitHub (for human continuity and collaboration).
- Keep **high-volume** material (full comment history, logs, long tool outputs, stack traces, diffs) on disk, referenced by pointer.

### 2) “Capture once, reuse many”
Minimize “agent re-reads” by having *one* pipeline capture and normalize context:
- Capture raw artifacts to disk as they occur.
- Extract compressed observations/patterns once (claude-mem worker).
- Feed forward only small “briefs” and curated policy bundles to downstream commands/agents.

### 3) Progressive disclosure everywhere
- Auto-inject *indexes* / briefs / bullet policy lists.
- Fetch heavy details *on-demand* from disk or via mem-search.

### 4) Foreman root file is the configuration source-of-truth
No `CLAUDE_ENV_FILE`-style state required.
- Foreman writes/reads state + config from its own root config and state files.
- Hooks and commands consult Foreman state files directly.

---

## The missing integration layer: Foreman Memory Bridge

Introduce a small, explicit interface between Foreman and claude-mem:

### Foreman Memory Bridge responsibilities
1. **Issue context packaging** (disk-first)
2. **Session/issue binding** (so memory knows “this work belonged to issue 123”)
3. **Policy + pattern crystallization**
4. **Duo generation + promotion** (based on validated, repeated patterns)
5. **Context rendering** for `/start-issue <N>` and general prompts with strict size budgets

---

## Filesystem layout (Foreman-side)

Store *all heavy context* and *curated artifacts* in a Foreman-managed local directory (under `/Users/miles/.my_coding`), not in the chat context.

Recommended structure (adapt to your existing Foreman conventions):

```
/Users/miles/.my_coding/
  foreman/
    projects/
      <project-slug>/
        foreman.root.(json|yaml|toml)     # your existing Foreman root project file (source of truth)
        state/
          active-issue.json              # current issue + mode for hooks & commands
        issues/
          00123/
            issue.md                     # title + body + acceptance criteria (normalized)
            labels.json                  # labels/tags at time of sync
            comments.raw.json            # full comment history (heavy)
            comments.summary.md          # small summary (<= ~150 lines)
            worklog/                     # “local mirror” of what was posted to GitHub
              2026-01-05T12-31Z.md
            artifacts/                   # heavy but useful
              logs/
              screenshots/
              stacktraces/
              repro-steps.md
            crystallized/
              outcome.md                 # what shipped / what changed
              decisions.md               # durable decisions (low volume)
              edge-cases.md              # durable gotchas
              patterns.md                # candidate reusable patterns for promotion
              command-policies.md        # command preferences (do/don’t/alias)
        policies/
          commands.md                    # project-level canonical command policies (small)
          logging.md                     # project logging / error handling conventions (small)
          environments.md                # dev/prod/test behavior rules (small)
        duos/
          registry.json                  # catalog of generated duos + scopes + scores
          <duo-name>/
            command.md                   # command instructions
            agent.md                     # agent definition / training prompt
            scope.json                   # file globs, language, env constraints
            examples/                    # small examples only
```

Key idea: **GitHub comment history is not the retrieval layer**. Your retrieval layer is:
- `comments.summary.md` (small)
- `crystallized/*.md` (small)
- claude-mem observation index (small)
- *raw* materials remain on disk.

---

## Binding Claude sessions to an issue (without CLAUDE_ENV_FILE)

### The “active issue” state file

When you run `/start-issue 123`, Foreman writes:

`/Users/miles/.my_coding/foreman/projects/<project>/state/active-issue.json`

Example:

```json
{
  "issue": 123,
  "repo": "org/repo",
  "mode": "dev",
  "labels": ["backend", "db", "bug"],
  "paths_hint": ["apps/api", "packages/db"],
  "language": "typescript",
  "package_manager": "npm",
  "created_at": "2026-01-05T12:34:56Z"
}
```

This file becomes the shared “single source of session truth” that:

- Foreman CLI commands read
- Claude Code hooks read (PreToolUse / UserPromptSubmit)
- claude-mem fork reads (to tag observations with issue metadata)

**No environment persistence file required.** The state is plain JSON on disk.

---

## A disk-first issue workflow that still posts to GitHub

### Start of issue: sync → summarize → brief

1. `foreman issue sync 123`
   - Pulls issue body + labels + comments
   - Writes:
     - `issue.md`
     - `labels.json`
     - `comments.raw.json`
   - Produces (or updates) a *small* `comments.summary.md`

2. `foreman issue brief 123`
   - Produces a strict-size “issue brief” (think: 2–5 minutes to read)

3. `foreman state set-active-issue 123 --mode dev`
   - Writes `active-issue.json`

4. `/start-issue 123`
   - Loads:
     - `issue brief`
     - relevant *project policies*
     - relevant *recent patterns* (from claude-mem)
   - Selects the appropriate agent roster (see “duo selection” below)

### During issue: “write once” worklog + GitHub comment mirror

Whenever Claude (or you) posts a GitHub comment, do it through a Foreman wrapper:

- `foreman gh comment issue 123 --file ./path/to/comment.md`

That wrapper:
1. Copies the exact text into `issues/00123/worklog/<timestamp>.md`
2. Posts the same content to GitHub via `gh issue comment ...`

Result:
- GitHub remains the public record
- Local FS remains the retrieval store
- You never need to pull full comments back into context later

### End of issue: crystallize + promote

On merge/close, run:

- `foreman issue crystallize 123`

Outputs:
- `crystallized/outcome.md`
- `crystallized/decisions.md`
- `crystallized/edge-cases.md`
- `crystallized/patterns.md`
- `crystallized/command-policies.md` (new/changed)

Then:
- `foreman promote`
  - updates `policies/*.md` and `duos/registry.json` based on thresholds & validation

---

## Where claude-mem fits (and what to change in your fork)

claude-mem already provides the right primitives:
- captures tool usage after each tool call
- generates structured “observations”
- stores them in SQLite and exposes them through an HTTP worker API and the mem-search skill
- injects a compact “recent context” index at session start

Your fork should add Foreman-specific capabilities:

### 1) Foreman-aware tagging
Modify the observation pipeline so every observation can include:

- `issue_id` (from `active-issue.json`)
- `labels`
- `mode` (dev/prod/test)
- `scope.paths_hint` (optional)
- `project_slug` (from Foreman root file)

**Implementation sketch (fork):**
- In the hook scripts (PostToolUse / Stop), read the active issue state file if it exists.
- Attach those fields to the observation payload before enqueueing it to the worker.

### 2) New observation type: “policy / command-policy”
Update the extraction prompt (in the worker) to explicitly extract:
- user command preferences
- do/don’t rules
- “in dev mode don’t build”
- aliases (“to reset db, use `npm run db:reset`”)

Store these as:
- observation `type = policy` (or `command-policy`)
- concept tags like `command`, `dev-mode`, `workflow`, `safety`, `logging`

### 3) Aggregation: project policy table (or materialized view)
Add a small aggregation step:
- de-duplicate identical/near-identical policies
- track frequency + recency
- track “validated” status

Expose a cheap endpoint or export for Foreman to consume:
- `GET /api/policies?project=<slug>`
- `GET /api/policies?project=<slug>&issue=123`
- or emit `policies.rendered.md` to disk

### 4) “Skip / trim” huge GitHub tool outputs
Your biggest context burner is **fetching GitHub comments into the LLM**.

You have two non-exclusive strategies:

**A. Prefer Foreman sync + disk artifacts**
- Don’t run `gh issue view --comments` inside Claude.
- Run `foreman issue sync` instead, which prints only a brief summary.

**B. Teach claude-mem to archive heavy outputs**
In your fork:
- Detect commands like `gh issue view` (Bash tool) or MCP GitHub tools that return megabytes.
- Store full output on disk (in Foreman issue artifacts) and only keep:
  - a pointer path
  - a hash
  - a short summary

This maintains observability without blowing up memory storage or future injection.

---

## /start-issue as the single entry point (dynamic, non-bloated)

You do **not** want per-issue commands (`/start-issue-123`).
You want a single dynamic command with an argument.

### Claude Code project command: `.claude/commands/start-issue.md`

Template (adapt as needed):

```md
---
description: Start work on a Foreman issue (disk-first, policy-aware)
argument-hint: [issue-number]
allowed-tools: Bash(foreman:*), Bash(git:*), Bash(curl:*), Read, Write, Edit, Task
---

## Context (auto-generated, size-budgeted)

- Issue brief: !`foreman issue brief $1 --max-chars 6000`
- Recent relevant memory (compressed): !`foreman mem related --issue $1 --limit 8 --max-chars 4000`
- Project policies (command + logging + env): !`foreman policy render --issue $1 --max-chars 4000`
- Active duos / subagent roster recommendation: !`foreman duos recommend --issue $1 --max-chars 2500`

## Your mission

You are starting work on issue #$1.

1) Confirm understanding of:
   - acceptance criteria
   - constraints from policies (dev/prod behavior, allowed commands)
   - relevant prior decisions / patterns

2) Select the *minimum necessary* subagents based on the duo recommendation.
   - If a specialized duo exists for the impacted paths, prefer it.
   - Otherwise fall back to the general project agents.

3) Execute work in a tight loop:
   - make the smallest safe change
   - validate with the lightest-allowed checks for the current mode
   - record meaningful discoveries into the issue worklog (Foreman wrapper)
   - post high-signal updates to GitHub

4) If an “impact-change” run fails to land cleanly:
   - run the “impact-change-review” flow:
     a) load the prior impact report from disk
     b) re-assess with what actually happened
     c) propose a corrected plan + patch set

5) Before stopping:
   - ensure the local issue artifacts are updated
   - ensure policy candidates and patterns are emitted for promotion
```

This command stays stable and small; the “dynamic smarts” are in the Foreman scripts that print budgeted context.

---

## Claude Code hooks: enforce command policies + reduce accidental bloat

Use **project hooks** to:
- prevent “wrong environment” actions (e.g., building in dev mode)
- redirect to canonical commands (`npm run db:reset`)
- keep output budgets small
- keep behavior consistent across subagents

### Hook 1: UserPromptSubmit – inject current issue context
A project hook script can read `active-issue.json` and print ~20–60 lines of context (max).

### Hook 2: PreToolUse (Bash) – command guardrail + optional rewrite
When Claude tries to run bash commands:
- Block disallowed commands (exit code 2 / JSON decision deny)
- Optionally rewrite `tool_input.command` to the canonical alternative

Examples of policies enforced here:
- “In dev mode: don’t run build”
- “DB reset must use `npm run db:reset`”
- “Use project’s logging script / log format”

---

## Duo selection: making agents project-aware and issue-aware

Think of each duo as:

- **Command**: “how to do work in this slice of the repo”
- **Agent**: specialized expertise + constraints + preferred tools

Your duo recommendation engine should use:

1. **Issue labels** (frontend/backend/db/docs/infra)
2. **Paths hint** (from Foreman planning or impact analysis)
3. **Language/runtime** (ts, go, python, rails, etc.)
4. **Environment mode** (dev/prod/test)
5. **Known policies** (command preferences, logging rules)
6. **Historical similarity** (claude-mem search: “what did we do before in these paths?”)

### Auto-creation vs. auto-selection
- **Auto-selection** should happen on every `/start-issue`.
- **Auto-creation** should happen only when:
  - a pattern recurs across issues, AND
  - it clearly improves speed/safety, AND
  - its scope can be expressed cleanly (paths + labels + constraints)

---

## Pattern detection → promotion lifecycle (the “crystallization loop”)

To avoid bloat and thrash, treat new patterns as candidates with a lifecycle:

1. **Candidate (unvalidated)**
   - extracted automatically from observations
   - stored in `issues/<id>/crystallized/patterns.md` and in claude-mem
2. **Provisional (validated locally)**
   - confirmed by passing tests / repeated success
   - stored in `policies/*.md` but marked provisional
3. **Stable (promoted)**
   - used across ≥ N issues or explicitly approved
   - becomes part of:
     - project policy bundle
     - duo training prompts
     - hook guardrails

### Promotion signals
- frequency across issues
- “stop the bleeding” urgency (safety/security)
- reduction in repeated corrections (“don’t do X”)
- low ambiguity in scope (clear command mapping, clear env constraints)

---

## How impact-change-review fits correctly

Treat “impact-change” outputs as *artifacts*:

- `issues/<id>/artifacts/impact-change/<timestamp>/report.md`
- `issues/<id>/artifacts/impact-change/<timestamp>/patch.diff` (optional)

Then “impact-change-review” is a deterministic re-assessment step that:
1. Loads the prior report + patch from disk
2. Loads what actually happened (tests failed, runtime errors, new constraints)
3. Produces a corrected impact analysis + a new patch set
4. Emits a *short* GitHub comment summarizing the delta
5. Emits pattern candidates if the failure reveals a reusable gotcha

This prevents re-hydrating huge GitHub threads into context and ensures the review agent isn’t guessing what “impact-change” did.

---

## Practical integration checklist

### Foreman repo work (in `/Users/miles/.my_coding`)
- [ ] Add disk-based Issue Pack + Crystallized artifacts structure
- [ ] Implement `foreman issue sync`, `brief`, `crystallize`
- [ ] Implement `foreman gh comment --file ...` wrapper
- [ ] Implement `foreman policy render` (size-budgeted)
- [ ] Implement `foreman mem related` (queries claude-mem API/DB, size-budgeted)
- [ ] Implement `foreman duos recommend` + `foreman promote`

### Claude Code project config
- [ ] Add `.claude/commands/start-issue.md`
- [ ] Add `.claude/hooks/foreman_prompt_context.*`
- [ ] Add `.claude/hooks/foreman_bash_guard.*`
- [ ] Add `.claude/settings.json` hook wiring

### claude-mem fork work
- [ ] Add Foreman-aware tagging (issue id, labels, mode)
- [ ] Add policy extraction + aggregation
- [ ] Add heavy-output trimming/archiving strategy (optional but recommended)
- [ ] Expose policy endpoints or export files for Foreman

---

## References (primary docs)

Put these in your repo as-is (no need to embed them into prompt context):

```text
Claude Code (slash commands, hooks, memory)
- https://code.claude.com/docs/en/slash-commands
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/memory

Claude-Mem docs (architecture, config, search APIs)
- https://docs.claude-mem.ai/introduction
- https://docs.claude-mem.ai/configuration
- https://docs.claude-mem.ai/architecture/overview
- https://docs.claude-mem.ai/architecture/worker-service
- https://docs.claude-mem.ai/usage/search-tools
- https://docs.claude-mem.ai/best-practices/progressive-disclosure
- https://docs.claude-mem.ai/private-tags

Anthropic platform docs (Agent Skills + Agent SDK hooks)
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://platform.claude.com/docs/en/agent-sdk/hooks
```
