# Database Schema — Architecture (Release {{X}}) — **Instructions**

- **Template file:** `templates/architecture/database-schema-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use
1. Duplicate this template into the target release folder (see final save location if specified).
2. Fill in all placeholders and required sections.
3. Keep **structure** and headings unchanged unless explicitly allowed.
4. Commit the completed file to the release docs.

## Placeholders
Replace every placeholder of the form `{{…}}` with a concrete value:
  - `Ambiguity about ownership of auth` — provide an explicit value; do **not** leave braces.
  - `PII classification pending from compliance` — provide an explicit value; do **not** leave braces.
  - `PostgreSQL / MySQL / MongoDB / Serverless` — provide an explicit value; do **not** leave braces.
  - `Prisma/Flyway/Liquibase/Knex` — provide an explicit value; do **not** leave braces.
  - `Search / Cache / Blob` — provide an explicit value; do **not** leave braces.
  - `X` — provide an explicit value; do **not** leave braces.
  - `schema per tenant / column / database` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance
- **0) Datastore Selection & Rationale** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **1) Entity Model (ERD)** — Provide entity definitions and relationships. Use diagrams if available; otherwise include a minimal **DDL** or `yaml` schema.
- **2) Tables / Collections** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **`users`** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **`orders`** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3) Data Lifecycle & Privacy** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Migrations & Seeding** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **5) Performance** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **6) Open Questions & Assumptions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?
- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist
- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.