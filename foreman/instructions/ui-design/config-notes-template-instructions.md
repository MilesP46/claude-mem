# Config Notes — Implementation, Stack Assimilation & Decisions (Release {{X}}) — **Instructions**

- **Template file:** `templates/ui-design/config-notes-template.md`
- **Final save location:** `{{foreman}}/release-{{X}}/docs//02-ui-design/config-notes.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - `X` — provide an explicit value; do **not** leave braces.
  - `YYYY-MM-DD` — provide an explicit value; do **not** leave braces.
  - `date` — provide an explicit value; do **not** leave braces.
  - `decision` — provide an explicit value; do **not** leave braces.
  - `foreman` — provide an explicit value; do **not** leave braces.
  - `icons` — provide an explicit value; do **not** leave braces.
  - `impact` — provide an explicit value; do **not** leave braces.
  - `issue` — provide an explicit value; do **not** leave braces.
  - `motion_lib` — provide an explicit value; do **not** leave braces.
  - `name` — provide an explicit value; do **not** leave braces.
  - `primitives` — provide an explicit value; do **not** leave braces.
  - `question` — provide an explicit value; do **not** leave braces.
  - `styling` — provide an explicit value; do **not** leave braces.
  - `ui_library` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **1) Stack Assimilation (from prototyping composition)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2) Tokens → Code Pipeline** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **2.1 Tailwind Mapping** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.2 Material 3 Mapping** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.3 Native (iOS/Android)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3) Theming & Modes** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Accessibility Implementation Notes** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **5) Performance & Assets** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **6) Analytics & Testability** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **7) Decisions Log (authoritative)** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **8) Open Questions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **9) Handoff Checklist** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

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