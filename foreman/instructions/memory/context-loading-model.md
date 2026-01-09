# Context Loading Model

**Critical:** Understanding loading prevents context bloat.

---

## Bottom-Up Traversal

**Example:** Editing `services/api/routes/users.js`

**Loads (in order):**
1. `services/api/routes/CLAUDE.md` ← Start (if exists)
2. `services/api/CLAUDE.md` ← Walk up
3. `services/CLAUDE.md` ← Walk up (if exists)
4. Root `CLAUDE.md` ← Root
5. Each memory's `## Dependencies` `@path` references

**NOT loaded:**
- Siblings: `services/workers/CLAUDE.md`
- Cousins: `apps/web/CLAUDE.md`
- Children: Until file opened in that dir

---

## Principles

### 1. Siblings Don't Load

Working in `services/api/` → loads api/, services/, root
Does NOT load `services/workers/` or `services/webhooks/`

**Why:** No cross-contamination between parallel areas.

### 2. Subtrees Load On-Demand

**Root has:** services/, apps/, packages/

**Working in services/api/:**
- ✅ services/CLAUDE.md
- ❌ apps/CLAUDE.md
- ❌ packages/CLAUDE.md

**Working in apps/web/:**
- ✅ apps/CLAUDE.md
- ❌ services/CLAUDE.md
- ❌ packages/CLAUDE.md

**Why:** Context loads only for current area, not entire project.

### 3. Parents Never Import Children

**WRONG (old system):**
```markdown
# services/CLAUDE.md
## Child Memories
@./api/CLAUDE.md       ← DON'T
@./workers/CLAUDE.md   ← DON'T
```

**CORRECT (new system):**
```markdown
# services/CLAUDE.md
## Documented Subdirectories
- API Server: `./api/` (see CLAUDE.md)
- Workers: `./workers/` (see CLAUDE.md)
```

**Why:** Prevents parent from loading all children.

### 4. Root Has Zero Imports

**Root must have:**
- ✅ Context Discovery Protocol
- ✅ Service Map (plain text)
- ✅ Quick Start
- ❌ ZERO `@` syntax

**Why:** Root always loads; imports would always load.

---

## Documented Subdirectories Purpose

**Structure (TWO parts):**

1. **Subdirs with CLAUDE.md:**
   ```markdown
   - Routes: `./routes/` (see CLAUDE.md) - API endpoints
   - Auth: `./auth/` (see CLAUDE.md) - Authentication
   ```
   Navigate here for full context; loads on-demand when working in that dir.

2. **Notable subdirs without CLAUDE.md:**
   ```markdown
   **Other:** utils/ (helpers), types/ (type defs), constants/ (config)
   ```
   Below threshold; documented inline in parent; no separate file.

**Purposes:**
- Navigation: "Which subdirs have dedicated docs?"
- Manifest: Tracks promotion/demotion state
- Context: Brief notes for subdirs not meeting threshold

**NOT for:** Triggering context loading (plain text, not `@path`)

---

## Functional Dependencies via @path

**In `## Dependencies` section of subtree files:**

```markdown
# API Service
## Dependencies
@../../docs/api/CLAUDE.md        ← API contracts
@../../docs/security/CLAUDE.md   ← Security
@../../db/CLAUDE.md              ← DB schema
@../../docs/ops/CLAUDE.md        ← Observability
```

**Loading:** When working in `services/api/`, loads service + these 4 cross-cutting = ~5 files total

**Frontend:**
```markdown
# Web App
## Dependencies
@../../docs/api/CLAUDE.md        ← API contracts only
```

**Loading:** When working in `apps/web/`, loads app + API contracts = ~3 files total

**Notice:** Frontend doesn't import security, DB, or observability (doesn't need them).

---

## Context Comparison

### Old (Top-Down with Memory Map)

**Editing:** `services/api/routes/users.js`

**Loaded:**
- Root + all Memory Map imports (10-20+ files)
- All services, apps, packages, docs
- Massive bloat, mostly irrelevant

### New (Bottom-Up, On-Demand)

**Editing:** `services/api/routes/users.js`

**Loaded:**
- services/api/routes/ (if exists)
- services/api/
- services/ (if exists)
- Root
- API contracts, security, DB, observability (via api/ imports)
- Total: ~8 files, all relevant

**NOT loaded:**
- apps/web/
- services/workers/
- packages/ui/

---

## Design Implications

**Root:** Minimal, instructional, no imports (≤100 lines)

**Subtree:** Detailed local, selective imports (depth-scaled: Level 2 ≤120 lines, Level 3 ≤100 lines, Level 4 ≤75 lines, Level 5+ ≤50 lines)

**Cross-Cutting:** Reusable, imported by dependents (≤150 lines regardless of depth)

---

## Validation

1. Root has zero `@` syntax? ✅/❌
2. Documented Subdirectories plain text? ✅/❌
3. Dependencies = functional only? ✅/❌
4. Cross-cutting adjacent to code? ✅/❌
5. Backend work avoids frontend load? ✅/❌

---

**Summary:** Bottom-up (file → parent → root), on-demand (subtrees when working there), selective (import functional deps only), isolated (siblings don't cross-load).