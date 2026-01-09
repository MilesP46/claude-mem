# Component Specs — Complete Bill of Materials (Release `{{release_id}}`) — **Instructions**

- **Template file:** `templates/ui-design/component-specs-template.md`
- **Final save location:** `{{foreman_root}}/release-{{release_id}}/docs/02-ui-design/component-specs.md`
- **Who fills this:** The agent indicated in the template header; if unspecified, the owning agent for this stage.
- **Editing rules:** Keep headings intact; write concise, actionable content; prefer bullets over prose where possible.

## How to use

1. Duplicate this template into the target release folder (see final save location if specified).
2. **Review the UX flows** to identify which ConceptIDs each component supports.
3. Fill in all placeholders and required sections.
4. **Include ConceptIDs in each component's YAML spec** to maintain traceability.
5. Keep **structure** and headings unchanged unless explicitly allowed.
6. Commit the completed file to the release docs.

## Placeholders

Replace every placeholder of the form `{{…}}` with a concrete value:

- `/path` — provide an explicit value; do **not** leave braces.
- `C-001` — provide an explicit value; do **not** leave braces.
- `ComposeEquivalent` — provide an explicit value; do **not** leave braces.
- `F1` — provide an explicit value; do **not** leave braces.
- `F1, F2` — provide an explicit value; do **not** leave braces.
- `F2` — provide an explicit value; do **not** leave braces.
- `F3` — provide an explicit value; do **not** leave braces.
- `MaterialEquivalent` — provide an explicit value; do **not** leave braces.
- `P0` — provide an explicit value; do **not** leave braces.
- `P1` — provide an explicit value; do **not** leave braces.
- `SwiftUIEquivalent` — provide an explicit value; do **not** leave braces.
- `Use/Extend/Compose/Net-new` — provide an explicit value; do **not** leave braces.
- `Use|Extend|Compose|Net-new` — provide an explicit value; do **not** leave braces.
- `accessibility_policy` — provide an explicit value; do **not** leave braces.
- `android` — provide an explicit value; do **not** leave braces.
- `anim_enter` — provide an explicit value; do **not** leave braces.
- `anim_exit` — provide an explicit value; do **not** leave braces.
- `aria-controls` — provide an explicit value; do **not** leave braces.
- `aria-expanded` — provide an explicit value; do **not** leave braces.
- `assistive_text` — provide an explicit value; do **not** leave braces.
- `badge` — provide an explicit value; do **not** leave braces.
- `brand_voice_doc` — provide an explicit value; do **not** leave braces.
- `celebration_type` — provide an explicit value; do **not** leave braces.
- `component_id` — provide an explicit value; do **not** leave braces.
- `component_name` — provide an explicit value; do **not** leave braces.
- `component_slug` — provide an explicit value; do **not** leave braces.
- `container` — provide an explicit value; do **not** leave braces.
- `copy_variant_a` — provide an explicit value; do **not** leave braces.
- `copy_variant_b` — provide an explicit value; do **not** leave braces.
- `design_system` — provide an explicit value; do **not** leave braces.
- `destructive` — provide an explicit value; do **not** leave braces.
- `emphasis_primary_secondary_tertiary` — provide an explicit value; do **not** leave braces.
- `empty_state_pattern` — provide an explicit value; do **not** leave braces.
- `flow_ref` — provide an explicit value; do **not** leave braces.
- `flow_refs` — provide an explicit value; do **not** leave braces.
- `foreman_root` — provide an explicit value; do **not** leave braces.
- `ghost` — provide an explicit value; do **not** leave braces.
- `icon` — provide an explicit value; do **not** leave braces.
- `ids` — provide an explicit value; do **not** leave braces.
- `ios` — provide an explicit value; do **not** leave braces.
- `issue_id` — provide an explicit value; do **not** leave braces.
- `label` — provide an explicit value; do **not** leave braces.
- `label_src` — provide an explicit value; do **not** leave braces.
- `loading_quip_slot` — provide an explicit value; do **not** leave braces.
- `loading_quips` — provide an explicit value; do **not** leave braces.
- `locales` — provide an explicit value; do **not** leave braces.
- `max_animation_cpu` — provide an explicit value; do **not** leave braces.
- `max_animation_duration` — provide an explicit value; do **not** leave braces.
- `max_asset_kb` — provide an explicit value; do **not** leave braces.
- `name_or_handle` — provide an explicit value; do **not** leave braces.
- `order` — provide an explicit value; do **not** leave braces.
- `page_reduced_motion_alt` — provide an explicit value; do **not** leave braces.
- `performance_policy` — provide an explicit value; do **not** leave braces.
- `platforms` — provide an explicit value; do **not** leave braces.
- `pr_number` — provide an explicit value; do **not** leave braces.
- `project_id` — provide an explicit value; do **not** leave braces.
- `prop_name` — provide an explicit value; do **not** leave braces.
- `pull_to_refresh_surprise` — provide an explicit value; do **not** leave braces.
- `reduced_motion_alt` — provide an explicit value; do **not** leave braces.
- `regions` — provide an explicit value; do **not** leave braces.
- `release_id` — provide an explicit value; do **not** leave braces.
- `repo_url` — provide an explicit value; do **not** leave braces.
- `role` — provide an explicit value; do **not** leave braces.
- `screen_id` — provide an explicit value; do **not** leave braces.
- `screen_name` — provide an explicit value; do **not** leave braces.
- `size_sm_md_lg` — provide an explicit value; do **not** leave braces.
- `sprint_id` — provide an explicit value; do **not** leave braces.
- `success_celebration` — provide an explicit value; do **not** leave braces.
- `telemetry.testid_base` — provide an explicit value; do **not** leave braces.
- `token_source` — provide an explicit value; do **not** leave braces.
- `type` — provide an explicit value; do **not** leave braces.
- `user_goal` — provide an explicit value; do **not** leave braces.
- `value` — provide an explicit value; do **not** leave braces.
- `variant` — provide an explicit value; do **not** leave braces.
- `web` — provide an explicit value; do **not** leave braces.

## Section‑by‑section guidance

- **0) Component Bill of Materials (CBOM)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **1) Spec Template (Copy for each component)** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **{{component_name}} — `{{component_id}}`** — Describe artifacts with **bullets and short paragraphs**. You **may add** items; keep headings intact.
- **2) Page Template Spec (use for each screen)** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **{{screen_name}}** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.
- **3) Global Patterns** — Fill this section succinctly. You **may add** bullets or sub‑sections, but **do not** remove the heading.

## YAML / Code Blocks

When adding configuration, use fenced blocks:

```yaml
# example
key: value
```

**Every CBOM and Page MUST include valid YAML spec**: (2‑space indentation; strings quoted when needed).

**IMPORTANT**: The `concepts` field in each component's YAML spec should list the ConceptIDs that component fulfills (e.g., `concepts: ["CONCEPT-001", "CONCEPT-003"]`).

## Can I add more?

- You **may** add bullet items and sub‑sections under existing headings.
- You **must not** delete or rename top‑level headings unless instructed.
- Keep cross‑references and file paths accurate.

## Quality checklist

- [ ] All `{{…}}` placeholders resolved.
- [ ] Sections are concise and actionable.
- [ ] Any YAML validates and uses 2‑space indentation.
- [ ] Saved to the correct release folder.
