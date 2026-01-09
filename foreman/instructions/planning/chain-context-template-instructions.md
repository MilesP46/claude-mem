# Sprint {{X}} Context — Release {{X}}, Sprint {{N}} — **Instructions**

- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Read the concept-checklist.md** to understand the core concepts.
3. **Extract ConceptIDs from the issue** being implemented.
4. Fill in all placeholders and required sections.
5. **Trace ConceptIDs through all planning documents** to provide complete context.
6. Keep **structure** and headings unchanged unless explicitly allowed.
7. Commit the completed file to the release docs.
8. Upsert prior art **only** if it is relevant to the issue being worked on **and** the agents assigned, **be selective** so you do not overwhelm the context file.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `Chosen option` — provide an explicit value; do **not** leave braces.
- `FOREMAN_ROOT` — provide an explicit value; do **not** leave braces.
- `UPSERTED_PRIOR_ART` — provide an explicit value; do **not** leave braces.
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

- **Issue Overview** — Write 1–3 concise paragraphs summarizing the key points. Do **not** introduce new scope; stick to what is decided.
- **Issue Specific Epics** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized. **IMPORTANT**: Include the "Implementing Concepts" field to show which ConceptIDs are being delivered.
- **Prior Art - As Is Documentation Snippets** - Copied and paste of art directly related to issue **and** the agents assigned to it.
- **Decision Matrix** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **Decision Matrix — YAML Blocks (one per agent; **no code**, instructions only)** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized. **NOTE**: Each decision in the YAML should include a `concepts` field listing the ConceptIDs it supports.

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
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
