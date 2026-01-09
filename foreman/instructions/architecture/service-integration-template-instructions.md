# Service Integration — Architecture (Release {{X}}) — **Instructions**

- **Template file:** `templates/architecture/service-integration-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - `3` — provide an explicit value; do **not** leave braces.
  - `30s` — provide an explicit value; do **not** leave braces.
  - `3s` — provide an explicit value; do **not** leave braces.
  - `5` — provide an explicit value; do **not** leave braces.
  - `OAuth2, API keys, HMAC` — provide an explicit value; do **not** leave braces.
  - `Question with link to epic or vendor doc` — provide an explicit value; do **not** leave braces.
  - `Service` — provide an explicit value; do **not** leave braces.
  - `Service Name` — provide an explicit value; do **not** leave braces.
  - `Stripe` — provide an explicit value; do **not** leave braces.
  - `X` — provide an explicit value; do **not** leave braces.
  - `graceful degradation path` — provide an explicit value; do **not** leave braces.
  - `header` — provide an explicit value; do **not** leave braces.
  - `list` — provide an explicit value; do **not** leave braces.
  - `memoize|get|ttl` — provide an explicit value; do **not** leave braces.
  - `payments, auth, search` — provide an explicit value; do **not** leave braces.
  - `tokens/sec` — provide an explicit value; do **not** leave braces.
  - `…` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **0) Selected Services (from composition)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1) Integration Specs (repeat per service)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **{{Service Name}} — `INT-01`** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2) Global Integration Policies** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **3) Open Questions & Assumptions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?
- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist
- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.