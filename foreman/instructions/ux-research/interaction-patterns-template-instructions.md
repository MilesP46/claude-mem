# Interaction Patterns — Release {X} — **Instructions**

- **Template file:** `templates/ux-research/interaction-patterns-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - `Decision rules & constraints` — provide an explicit value; do **not** leave braces.
  - `F-001, P-101` — provide an explicit value; do **not** leave braces.
  - `Form Submission & Validation` — provide an explicit value; do **not** leave braces.
  - `Global Navigation` — provide an explicit value; do **not** leave braces.
  - `How user arrives` — provide an explicit value; do **not** leave braces.
  - `If affects global nav/back behavior` — provide an explicit value; do **not** leave braces.
  - `Keyboard focus, readable copies, confirmation clarity` — provide an explicit value; do **not** leave braces.
  - `Lists & Detail Drill‑down` — provide an explicit value; do **not** leave braces.
  - `Loading / Empty / Error Conventions` — provide an explicit value; do **not** leave braces.
  - `Modal / Bottom Sheet Usage` — provide an explicit value; do **not** leave braces.
  - `Pattern Name` — provide an explicit value; do **not** leave braces.
  - `Question or assumption with link to epic section` — provide an explicit value; do **not** leave braces.
  - `Search & Filter` — provide an explicit value; do **not** leave braces.
  - `Tie to pain point` — provide an explicit value; do **not** leave braces.
  - `Tie to success criteria from spec` — provide an explicit value; do **not** leave braces.
  - `What user does, not UI specifics` — provide an explicit value; do **not** leave braces.
  - `What user sees at a high level` — provide an explicit value; do **not** leave braces.
  - `Where they go next / success` — provide an explicit value; do **not** leave braces.
  - `X` — provide an explicit value; do **not** leave braces.
  - `foreman` — provide an explicit value; do **not** leave braces.
  - `notes` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **Candidate Patterns (from flows & wireframes)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **Pattern Template (duplicate for each)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Pattern: {{Pattern Name}} — `IP-01`** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Cross‑reference** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Assumptions & Open Questions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

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