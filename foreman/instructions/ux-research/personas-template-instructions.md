# Personas — Release {X} — **Instructions**

- **Template file:** `templates/ux-research/personas-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Review the epics and flows** to understand which ConceptIDs are most relevant to each persona.
3. Fill in all placeholders and required sections.
4. **Assign Primary Concepts** to each persona based on which capabilities they care about most.
5. Keep **structure** and headings unchanged unless explicitly allowed.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `1–2 lines that tie to epic goals` — provide an explicit value; do **not** leave braces.
- `Assumption 1` — provide an explicit value; do **not** leave braces.
- `Assumption 2` — provide an explicit value; do **not** leave braces.
- `Codename` — provide an explicit value; do **not** leave braces.
- `E-1, E-2` — provide an explicit value; do **not** leave braces.
- `F-001, F-003` — provide an explicit value; do **not** leave braces.
- `Frequency, context, mental model hints` — provide an explicit value; do **not** leave braces.
- `From spec` — provide an explicit value; do **not** leave braces.
- `Keyboard, screen reader, color sensitivities, language` — provide an explicit value; do **not** leave braces.
- `Low / Medium / High` — provide an explicit value; do **not** leave braces.
- `Mobile/desktop, connectivity constraints` — provide an explicit value; do **not** leave braces.
- `Repeat the block above` — provide an explicit value; do **not** leave braces.
- `Top tasks they’re trying to accomplish` — provide an explicit value; do **not** leave braces.
- `What “good” looks like for them` — provide an explicit value; do **not** leave braces.
- `X` — provide an explicit value; do **not** leave braces.
- `foreman` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **Persona `PR-01` — {{Codename}}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading. **IMPORTANT**: Include the "Primary Concepts" field listing the ConceptIDs most relevant to this persona's needs.
- **Persona `PR-02` — {{Codename}}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Persona `PR-03` — {{Codename}}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
