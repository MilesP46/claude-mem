# GitHub Actions — Multi‑stack Template (to be specialized by Pipeline Agent) — **Instructions**

- **Template file:** `templates/pipeline/gh-actions-template.yml`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - ` steps.detect.outputs.node ` — provide an explicit value; do **not** leave braces.
  - ` steps.detect.outputs.python ` — provide an explicit value; do **not** leave braces.
  - ` steps.detect.outputs.rails ` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

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