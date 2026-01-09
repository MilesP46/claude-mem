# User Flows — Release {X} — **Instructions**

- **Template file:** @foreman/templates/ux-research/user-flows-template.md
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Read the release specification** to identify which ConceptIDs each epic addresses.
3. Fill in all placeholders and required sections.
4. **Map each flow to the ConceptIDs it implements** using the "Implements Concepts" field.
5. Keep **structure** and headings unchanged unless explicitly allowed.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `Assumption or question tied to epic & flow` — provide an explicit value; do **not** leave braces.
- `Assumptions…` — provide an explicit value; do **not** leave braces.
- `Condition` — provide an explicit value; do **not** leave braces.
- `Example: Home` — provide an explicit value; do **not** leave braces.
- `F-001, Deep link` — provide an explicit value; do **not** leave braces.
- `Flow Name` — provide an explicit value; do **not** leave braces.
- `Measurable outcome` — provide an explicit value; do **not** leave braces.
- `Outcome` — provide an explicit value; do **not** leave braces.
- `Overview of X` — provide an explicit value; do **not** leave braces.
- `P-101, P-102` — provide an explicit value; do **not** leave braces.
- `P-102` — provide an explicit value; do **not** leave braces.
- `Page IDs, push notification, deep link` — provide an explicit value; do **not** leave braces.
- `Step` — provide an explicit value; do **not** leave braces.
- `Tie to epic goal` — provide an explicit value; do **not** leave braces.
- `X` — provide an explicit value; do **not** leave braces.
- `X/Y` — provide an explicit value; do **not** leave braces.
- `alternate` — provide an explicit value; do **not** leave braces.
- `empty, loading, error` — provide an explicit value; do **not** leave braces.
- `foreman` — provide an explicit value; do **not** leave braces.
- `list_key_journeys_from_epics` — provide an explicit value; do **not** leave braces.
- `list_pain_points_from_epics` — provide an explicit value; do **not** leave braces.
- `list_success_criteria_from_epics` — provide an explicit value; do **not** leave braces.
- `name` — provide an explicit value; do **not** leave braces.
- `next step` — provide an explicit value; do **not** leave braces.
- `notes` — provide an explicit value; do **not** leave braces.
- `result` — provide an explicit value; do **not** leave braces.
- `rule` — provide an explicit value; do **not** leave braces.
- `summarize_from_epics` — provide an explicit value; do **not** leave braces.
- `tabs / drawer / bottom bar / top nav / none` — provide an explicit value; do **not** leave braces.
- `trigger` — provide an explicit value; do **not** leave braces.
- `{{decision or task` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **0) Summary from Specification** — Write 1–3 concise paragraphs summarizing the key points. Do **not** introduce new scope; stick to what is decided.
- **1) Screen / Page Inventory** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2) Global Navigation Model** — Provide entity definitions and relationships. Use diagrams if available; otherwise include a minimal **DDL** or `yaml` schema.
- **3) Core Flows** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **Flow: {{Flow Name}} — `F-001`** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading. **IMPORTANT**: Include the "Implements Concepts" field listing which ConceptIDs from the epics this flow fulfills.
- **4) Flow–Page Cross‑Reference Matrix** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **5) Assumptions & Open Questions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
