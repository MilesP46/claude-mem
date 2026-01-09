# Design System — Foundations & Tokens (Release {{X}}) — **Instructions**

- **Template file:** `templates/ui-design/design-system-template.md`
- **Final save location:** `{{foreman}}/release-{{X}}/docs/02-ui-design/design-system.md`
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
  - `brand_font_primary` — provide an explicit value; do **not** leave braces.
  - `foreman` — provide an explicit value; do **not** leave braces.
  - `icons` — provide an explicit value; do **not** leave braces.
  - `motion_lib` — provide an explicit value; do **not** leave braces.
  - `stack_name` — provide an explicit value; do **not** leave braces.
  - `theming` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **0) Fill‑In Summary (delete this section after completion)** — Write 1–3 concise paragraphs summarizing the key points. Do **not** introduce new scope; stick to what is decided.
- **1) Design Tokens (Semantic‑first)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **1.1 Color Tokens** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **CSS Variables (authoritative names)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1.2 Typography** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1.3 Spacing & Sizing** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **1.4 Radius & Elevation** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1.5 Motion** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1.6 Iconography** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2) Cross‑Stack Mapping** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.A Web (Tailwind + shadcn/ui + Radix)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **2.B Web (Material 3)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.C iOS (SwiftUI)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **2.D Android (Jetpack Compose)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3) Accessibility Rules (authoritative)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Brand & Visual Voice** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

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