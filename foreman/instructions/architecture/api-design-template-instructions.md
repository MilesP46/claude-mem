# API Design — Architecture (Release {{X}}) — **Instructions**

- **Template file:** `templates/architecture/api-design-template.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Review component specs and flows** to identify which ConceptIDs each API operation supports.
3. Fill in all placeholders and required sections.
4. **Map each API operation to ConceptIDs** using the "Supports Concepts" field.
5. Keep **structure** and headings unchanged unless explicitly allowed.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `...` — provide an explicit value; do **not** leave braces.
- `1‑N with orders` — provide an explicit value; do **not** leave braces.
- `< 100KB` — provide an explicit value; do **not** leave braces.
- `< 300ms` — provide an explicit value; do **not** leave braces.
- `Account holder` — provide an explicit value; do **not** leave braces.
- `Assumption with owner & due date` — provide an explicit value; do **not** leave braces.
- `Create Order` — provide an explicit value; do **not** leave braces.
- `OAuth2 / OIDC / API key / session` — provide an explicit value; do **not** leave braces.
- `Question tied to epic or component` — provide an explicit value; do **not** leave braces.
- `REST / GraphQL / gRPC` — provide an explicit value; do **not** leave braces.
- `URI `/v1`| header`Accept: application/vnd.app.v1+json` | GraphQL deprecation policy` — provide an explicit value; do **not** leave braces.
- `X` — provide an explicit value; do **not** leave braces.
- `core` — provide an explicit value; do **not** leave braces.
- `fields` — provide an explicit value; do **not** leave braces.
- `https://api.example.com` — provide an explicit value; do **not** leave braces.
- `latency, availability, throughput` — provide an explicit value; do **not** leave braces.
- `reason` — provide an explicit value; do **not** leave braces.
- `user_id` — provide an explicit value; do **not** leave braces.
- `users` — provide an explicit value; do **not** leave braces.
- `uuidv7` — provide an explicit value; do **not** leave braces.
- `…` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **0) Summary & Inputs** — Write 1–3 concise paragraphs summarizing the key points. Do **not** introduce new scope; stick to what is decided.
- **1) Resource Inventory (derived from CBOM & flows)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **2) REST Endpoints (or GraphQL Schema)** — Document interfaces using **fenced code blocks**. Prefer `yaml` (OpenAPI excerpts) or tabular specs for methods, params, and responses.
- **Operation: {{Create Order}} — `POST /v1/orders`** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading. **IMPORTANT**: Include the "Supports Concepts" field listing which ConceptIDs this operation fulfills.
- **Pagination & Filtering (standard)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Error Envelope (standardized)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **Webhooks / Events (if applicable)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **GraphQL (if chosen)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3) Security** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Contract Testing & Mocking** — Document interfaces using **fenced code blocks**. Prefer `yaml` (OpenAPI excerpts) or tabular specs for methods, params, and responses.
- **5) Open Questions & Assumptions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
