# Issue {{X}} Context — Release {{X}}, Sprint {{N}} — **Instructions**

- **Who fills this:** The `chain-context-manager` agent for comprehensive codebase analysis.
- **Purpose:** Create implementation context by analyzing codebase patterns, not prior art (which is in GitHub issue).
- **Editing rules:** Keep headings intact; write concise, actionable content; focus on discovered implementation patterns.

## How to use

1. **Read the GitHub issue** which contains complete relevant art.
2. **Extract ConceptIDs and requirements** from the issue and concept-checklist.md.
3. **Review existing patterns** from relevant CLAUDE.md memory files in affected areas.
4. **Analyze codebase patterns** that relate to the issue requirements, leveraging documented patterns.
5. **Document implementation context** - how new work integrates with existing code and patterns.
6. Fill in all placeholders focusing on codebase discoveries.
7. **Create per-agent YAML blocks** with implementation-focused decisions.
8. Keep **structure** and headings unchanged unless explicitly allowed.
9. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `Chosen option` — provide an explicit value; do **not** leave braces.
- `FOREMAN_ROOT` — provide an explicit value; do **not** leave braces.
- `IMPLEMENTATION_PATTERN` — provide discovered codebase pattern; do **not** leave braces.
- `ISSUE_ASSIGNEES` — provide an explicit value; do **not** leave braces.
- `ISSUE_ID` — provide an explicit value; do **not** leave braces.
- `ISSUE_LABELS` — provide an explicit value; do **not** leave braces.
- `ISSUE_PROJECTS` — provide an explicit value; do **not** leave braces.
- `ISSUE_STATE` — provide an explicit value; do **not** leave braces.
- `ISSUE_SUMMARY` — provide an explicit value; do **not** leave braces.
- `ISSUE_TITLE` — provide an explicit value; do **not** leave braces.
- `Issue # / AC ref` — provide an explicit value; do **not** leave braces.
- `N` — provide an explicit value; do **not** leave braces.
- `PATH/TO/COMPONENT` — provide an explicit value; do **not** leave braces.
- `PATH/TO/FILE` — provide an explicit value; do **not** leave braces.
- `PATH/TO/RULE` — provide an explicit value; do **not** leave braces.
- `PURPOSE` — provide an explicit value; do **not** leave braces.
- `WHY` — provide an explicit value; do **not** leave braces.
- `X` — provide an explicit value; do **not** leave braces.
- `YYYY-MM-DD` — provide an explicit value; do **not** leave braces.
- `name` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **Issue Overview** — Write 1–3 concise paragraphs summarizing the key points extracted from the GitHub issue. Do **not** introduce new scope; stick to what is decided.
- **Issue Specific Epics** — **IMPORTANT**: Include the "Implementing Concepts" field to show which ConceptIDs are being delivered (extracted from GitHub issue).
- **Codebase Context** — Document discovered implementation patterns, reusable components, and integration points. **First review existing patterns from CLAUDE.md memories** in relevant areas, then analyze codebase for additional patterns. Focus on **how this issue integrates with existing code and patterns**, not prior art (which is in the GitHub issue)..
- **Decision Matrix — YAML Blocks (one per agent; **no code**, instructions only)** — Focus on implementation decisions based on codebase analysis. Use `yaml` blocks for agent instructions; keep values parameterized. **NOTE**: Each decision should include a `concepts` field listing the ConceptIDs it supports and `github_issue_context` field referencing the GitHub issue.

## YAML / Code Blocks

When adding configuration, use fenced blocks:

```yaml
# example
key: value
```

Ensure valid YAML (2‑space indentation; strings quoted when needed).

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] GitHub issue content reviewed for ConceptIDs and requirements.
- [ ] **Existing patterns reviewed** from relevant CLAUDE.md memory files.
- [ ] Codebase patterns analyzed and documented, leveraging existing pattern knowledge.
- [ ] Implementation integration points identified.
- [ ] Per-agent YAML blocks focus on codebase implementation decisions.
- [ ] All ConceptIDs from GitHub issue mapped to agent decisions.
- [ ] Prior art references come from GitHub issue, not duplicated here.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
