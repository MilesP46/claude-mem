# Subtree CLAUDE.md Generation

**Purpose:** Generate CLAUDE.md files that efficiently guide AI agents navigating the codebase.

---

## Template

**Philosophy:** Provide essential guidance, not exhaustive documentation. Summarize, don't enumerate.

```markdown
# {NAME} Memory

## Purpose & Entry Points
- {WHAT_THIS_DOES}
- {MAIN_ENTRY_FILES}

## Patterns (Essential Conventions Only)
- {IMPORT_EXPORT_STYLE}
- {NAMING_CONVENTIONS}
- {KEY_ARCHITECTURAL_PATTERNS}

## Key APIs & Interactions
- {PRIMARY_EXPORTS} (3-5 key functions/components, not exhaustive)
- {MAIN_DEPENDENCIES} (what this calls, what calls this)

## Dos & Don'ts
- {CRITICAL_GUARDRAILS}
- {COMMON_PITFALLS}

## Dependencies

@../../docs/security/CLAUDE.md
@../../docs/api/CLAUDE.md

(@ followed by path triggers AI context loading - use ONLY for functional dependencies: cross-cutting CLAUDE.md files this code area needs. NEVER for parent/child/sibling. NEVER for rule files. Use relative paths from this file's location.)

## Documented Subdirectories

{SUBDIRS_WITH_CLAUDE}

**Other:** {NOTABLE_SUBDIRS_WITHOUT_CLAUDE}

(Plain text paths only - NO @ syntax. These are navigation references, not imports.)
```

**Optional sections (add ONLY if critical):**
- `## Local Development` - Only if special setup/commands needed
- `## Invariants` - Only if business-critical rules exist

---

## Generation

**CRITICAL: Content Delegation (see rule file)**
- Check for existing child CLAUDE.md files FIRST
- If child has CLAUDE.md: Delegate details to child, parent only references
- Document only THIS directory's direct code, not children's internals

**Core Principles:**
- **Summarize, don't enumerate** - Describe patterns, don't list every instance
- **Essential over exhaustive** - 3-5 key items per section, not complete catalogs
- **Navigation over documentation** - Guide to code, don't replace it
- **Depth-aware sizing** - Calculate nesting level from project root and apply appropriate size limits and content focus

1. **Purpose & Entry Points** - What this does + where to start (1-2 sentences + main files)
2. **Patterns** - Import/export style, naming conventions, key architectural patterns (3-5 items)
3. **Key APIs** - Primary exports only (3-5 functions/components), main dependencies (what it calls/is called by)
4. **Dos/Don'ts** - Critical guardrails and common pitfalls (from TODOs, FIXMEs, code reviews)
5. **Dependencies** - Use rule file decision matrix to identify functional deps; list with `@` syntax ONLY cross-cutting CLAUDE.md files this area needs (example: @../../docs/security/CLAUDE.md); use relative paths from this file; NEVER include rule files
6. **Subdirs** - Two parts:
    - **With CLAUDE.md:** List with brief description; DON'T duplicate their content
    - **Other:** Mention notable subdirs below threshold (utils/, types/, constants/)

**Optional (only if critical):**
- **Local Dev** - Only if special setup/commands needed beyond standard workflow
- **Invariants** - Only if business-critical rules exist (validation, constraints)

## Size Enforcement

- **Apply depth-scaled limits based on nesting level** (excluding blank lines):
  - Level 2: ≤120 lines
  - Level 3: ≤100 lines  
  - Level 4: ≤75 lines
  - Level 5+: ≤50 lines
- **If approaching limit:**
  - First: Check if content is too detailed (summarize, don't enumerate)
  - Focus content appropriately for depth (architectural vs API-card style)
  - Then: Promote subdirs meeting depth-scaled thresholds (if they exist)
  - Last resort: Split by functional concern
- **If significantly under limit:** Consider folding to parent (unless clear architectural boundary)

## Validation

- [ ] Follows "summarize, don't enumerate" principle
- [ ] 3-5 key items per section (not exhaustive lists)
- [ ] All content verified in code (no speculation)
- [ ] Dependencies use `@path` syntax (e.g., @../../docs/security/CLAUDE.md)
- [ ] Documented Subdirectories: Part 1 (with CLAUDE.md) + Part 2 ("Other:")
- [ ] No `@` in Documented Subdirectories section
- [ ] Size within depth-scaled limits appropriate to nesting level (excluding blanks)
- [ ] No secrets exposed