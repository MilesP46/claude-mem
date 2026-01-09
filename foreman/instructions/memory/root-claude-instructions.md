# Root CLAUDE.md Generation

**Purpose:** Generate minimal root CLAUDE.md that orients AI agents to navigate the codebase efficiently.

---

## Template

```markdown
# Project Memory

## Quick Start
- Install: {CMD}
- Dev: {CMD}
- Test: {CMD}

## Testing
{PATTERNS}

## Context Discovery Protocol

**When working on a task, discover relevant context by:**

1. **Identify the domain** - What am I modifying?
   {DOMAIN_LIST}

2. **Read the local CLAUDE.md** - Each domain has its own memory file
   - Open files in that directory to trigger subtree memory loading
   - Check the local CLAUDE.md for patterns, rules, and dependencies

3. **Follow dependency imports** - Local memories import what they need
   - Each CLAUDE.md imports only the cross-cutting concerns it uses
   - Imports are declared with @ syntax in subtree memories (not root)

4. **Cross-cutting concerns are on-demand**
   - Don't load all policies upfront
   - Navigate directly to cross-cutting docs when needed
   - Common locations: docs/api/, docs/security/, docs/ops/

## Service Map

{SERVICE_MAP}

(Plain text navigation only - NO @ imports)

## Build & Deploy
{BUILD_DEPLOY}

## Discovery Examples
{EXAMPLES}
```

---

## Generation

**Philosophy:** Minimal navigation guide - orient AI agents, don't duplicate subtree details.

1. **Commands** - Scan manifests; extract actual scripts; fallback to rule table
2. **Test Patterns** - Framework-specific (Jest: `-- path`, Pytest: `-k`, Cargo: `test_name`)
3. **Directories** - Map to roles; include only if exists + meets heuristics
4. **Domain List** - 4-6 top areas with actual paths (essential navigation only)
5. **Service Map** - Group: backend → frontend → shared → docs; brief descriptions (3-5 key areas)
6. **Build/Deploy** - Extract from package scripts, Makefile, CI config (essential commands only)
7. **Examples** - 2-3 based on detected architecture (backend, frontend, infra)

## Validation

- [ ] No `@` syntax
- [ ] Commands project-specific
- [ ] Paths exist
- [ ] Size ≤100 lines
- [ ] Context Discovery present