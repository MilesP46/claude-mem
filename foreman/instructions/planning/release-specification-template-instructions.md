# {RELEASE_NAME} — **Instructions**

- **Template file:** `templates/release-specification-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Read the concept-checklist.md** to understand which ConceptIDs need to be addressed.
3. Fill in all placeholders and required sections.
4. Keep **structure** and headings unchanged unless explicitly allowed.
5. Ensure every epic references the ConceptIDs it addresses.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `BUSINESS_GOAL` — provide an explicit value; do **not** leave braces.
- `CONCEPT_BRIEF` — provide an explicit value; do **not** leave braces.
- `FOREMAN_ROOT` — provide an explicit value; do **not** leave braces.
- `PRIMARY_KPI` — provide an explicit value; do **not** leave braces.
- `RELEASE_ID` — provide an explicit value; do **not** leave braces.
- `SECONDARY_KPIS` — provide an explicit value; do **not** leave braces.
- `SPRINT_LIST` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **Concept Brief** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **MVP Scope** — Clearly distinguish MVP features from post-MVP. Use "✅ MVP Includes" and "⏳ Post-MVP" bullet lists to show what gets built first vs later.
- **Requirements** — Provide a **bullet list** of inclusions and exclusions. You **may add** bullets as needed but keep it scannable.
- **Must Haves (MVP Core)** — Critical features required for initial launch. Mark each with MVP priority level (P0, P1, P2).
- **Nice to Haves (Post-MVP)** — Features to add after MVP is established. Focus on enhancement over essential functionality.
- **Target Stack (if applicable)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Constraints (if applicable)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Epics / Capabilities** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Epic {EPIC_ID}: {EPIC_NAME}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading. **IMPORTANT**: Each epic must include an "Addresses Concepts" field that lists the ConceptIDs from the concept-checklist.md that this epic fulfills (e.g., [CONCEPT-001, CONCEPT-002]). **MVP PRIORITY**: Mark each epic with "🚀 MVP Core", "⚡ MVP Extended", or "🔄 Post-MVP" to indicate implementation timing.
- **Business Goals and KPIs** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Implementation Requirements _(Brownfield only)_** — Provide a **bullet list** of inclusions and exclusions. You **may add** bullets as needed but keep it scannable.
- **Implementation Risks _(Brownfield only)_** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Risk {RISK_ID}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

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
