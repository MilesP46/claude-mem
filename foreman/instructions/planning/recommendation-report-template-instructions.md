# Prototyping Recommendation Report — Phase 3 (Release {{X}}) — **Instructions**

- **Template file:** @foreman/templates/00-planning/recommendation-report-template.md
- **Final save location:** `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/release{{X}}-recommendation-report.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Read deployment-decision-matrix.md** to understand user's chosen WHERE platforms and deployment strategy.
3. Fill in all placeholders and required sections.
4. **Include detailed setup steps** for each chosen deployment platform from the decision matrix.
5. Keep **structure** and headings unchanged unless explicitly allowed.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `BDD highlights / must‑have scenarios` — provide an explicit value; do **not** leave braces.
- `Explain tradeoffs: speed vs. compatibility vs. risk; call out mode-specific reasoning.` — provide an explicit value; do **not** leave braces.
- `FOREMAN_ROOT` — provide an explicit value; do **not** leave braces.
- `RC/NIC overview in plain language` — provide an explicit value; do **not** leave braces.
- `SLO` — provide an explicit value; do **not** leave braces.
- `Template Name` — provide an explicit value; do **not** leave braces.
- `X` — provide an explicit value; do **not** leave braces.
- `agent/team` — provide an explicit value; do **not** leave braces.
- `api` — provide an explicit value; do **not** leave braces.
- `budget|data locality|license|hosting|offline` — provide an explicit value; do **not** leave braces.
- `capabilities` — provide an explicit value; do **not** leave braces.
- `checklist` — provide an explicit value; do **not** leave braces.
- `criteria` — provide an explicit value; do **not** leave braces.
- `date` — provide an explicit value; do **not** leave braces.
- `e.g., team skill set, runtime preferences, infra availability` — provide an explicit value; do **not** leave braces.
- `frameworks, DBs, auth, hosting` — provide an explicit value; do **not** leave braces.
- `greenfield|brownfield` — provide an explicit value; do **not** leave braces.
- `learning curve, integration gaps, timebox` — provide an explicit value; do **not** leave braces.
- `license, hosting, budget, data‑locality, offline, security posture` — provide an explicit value; do **not** leave braces.
- `list` — provide an explicit value; do **not** leave braces.
- `list + contract summary` — provide an explicit value; do **not** leave braces.
- `min bar` — provide an explicit value; do **not** leave braces.
- `mitigation` — provide an explicit value; do **not** leave braces.
- `modules, microservices, adapters, events` — provide an explicit value; do **not** leave braces.
- `name` — provide an explicit value; do **not** leave braces.
- `one-paragraph on what we’re building and why now` — provide an explicit value; do **not** leave braces.
- `p95, tti` — provide an explicit value; do **not** leave braces.
- `pass/fail` — provide an explicit value; do **not** leave braces.
- `pivotal entities, migrations, compat strategy` — provide an explicit value; do **not** leave braces.
- `plain-language reasoning` — provide an explicit value; do **not** leave braces.
- `present|missing` — provide an explicit value; do **not** leave braces.
- `reasoning` — provide an explicit value; do **not** leave braces.
- `regressions, lock‑in, license conflicts` — provide an explicit value; do **not** leave braces.
- `risk` — provide an explicit value; do **not** leave braces.
- `service` — provide an explicit value; do **not** leave braces.
- `speed-to-demo | risk constraints | compatibility | licensing` — provide an explicit value; do **not** leave braces.
- `strangler, module extraction, adapter pattern, gradual migration` — provide an explicit value; do **not** leave braces.
- `strengths` — provide an explicit value; do **not** leave braces.
- `template` — provide an explicit value; do **not** leave braces.
- `template-only | mixed | api/service-only` — provide an explicit value; do **not** leave braces.
- `time‑to‑demo, feature coverage %, test coverage %, defects` — provide an explicit value; do **not** leave braces.
- `tradeoffs` — provide an explicit value; do **not** leave braces.
- `url` — provide an explicit value; do **not** leave braces.
- `value` — provide an explicit value; do **not** leave braces.
- `which template(s) + minimal glue code` — provide an explicit value; do **not** leave braces.
- `why` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **1) Executive Summary** — Write 1–3 concise paragraphs summarizing the key points. Do **not** introduce new scope; stick to what is decided.
- **2) Actionable Implementation Plan** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.1 Templated Items (to reuse)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **2.2 From‑Scratch Items (to build)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **2.3 Sequencing & Milestones** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **2.4 Dependencies & Interfaces** — Describe environments and automation. Use `yaml` blocks for IaC or workflow snippets; keep values parameterized.
- **3) Context & Assumptions** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3.1 Greenfield Notes (fill only if mode = greenfield)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3.2 Brownfield Notes (fill only if mode = brownfield)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **4) Gate Checks & Rationale (Synthesis Only)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **5) Validation, KPIs & Acceptance** — List **numbered, testable** acceptance criteria. Each item should be objectively verifiable.
- **6) Risks & Mitigations** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **7) Appendices (Shortlists Only — no raw logs)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **7.1 Top Template Candidates (shortlist)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **7.2 Top API Libraries (shortlist)** — Document interfaces using **fenced code blocks**. Prefer `yaml` (OpenAPI excerpts) or tabular specs for methods, params, and responses.
- **7.3 Top Services (shortlist)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **8) Deployment Setup Guide** — Provide detailed, step-by-step setup instructions for each chosen WHERE platform from the deployment decision matrix.
- **8.1 Platform Setup Steps** — Include CLI commands, web dashboard configuration, and deployment procedures for the primary chosen platform. For SaaS platforms, include site-specific guidance (dashboard navigation, settings configuration, deployment workflows).
- **8.2 Secondary Platform Setup (if applicable)** — If using hybrid deployment, include setup steps for additional platforms including both CLI and web-based configuration.
- **8.3 External Service Configuration** — Detailed setup for any external services selected in the deployment strategy, including both programmatic setup and web-based SaaS configuration.
- **8.4 Integration & Connectivity** — How to connect services across different platforms, including environment variables, networking, security configuration, and SaaS platform-specific integration methods.

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Deployment setup guide includes step-by-step instructions for chosen WHERE platforms.
- [ ] Setup steps include both CLI commands and web-based SaaS configuration guidance.
- [ ] SaaS platform guidance includes specific dashboard navigation and settings configuration.
- [ ] External service configuration details are complete and actionable for both programmatic and web-based setup.
- [ ] Cross-platform integration steps are clearly documented including SaaS-specific integration methods.
- [ ] Saved to the correct release folder.
