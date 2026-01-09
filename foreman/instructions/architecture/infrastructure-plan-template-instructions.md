# Infrastructure Plan — Architecture (Release {{X}}) — **Instructions**

- **Template file:** `templates/architecture/infrastructure-plan-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - `Choice of serverless vs containers` — provide an explicit value; do **not** leave braces.
  - `Regional requirements from stakeholders` — provide an explicit value; do **not** leave braces.
  - `Terraform/Pulumi/CloudFormation` — provide an explicit value; do **not** leave braces.
  - `Vault/SSM/KMS` — provide an explicit value; do **not** leave braces.
  - `X` — provide an explicit value; do **not** leave braces.
  - `e.g., RPO 15m, RTO 1h` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **0) High‑Level Diagram** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1) Environments** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2) IaC & CI/CD** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **3) Networking & Security** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Observability & Reliability** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **5) Data Management & DR** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **6) Cost & Capacity** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **7) Open Questions & Assumptions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?
- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist
- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.