# Component Specs — Complete Bill of Materials (Release `{{release_id}}`)

**Save To:** `{{foreman_root}}/release-{{release_id}}/docs/02-ui-design/component-specs.md`  
**Goal:** Define every component/page required by UX flows so developers can build them rapidly using the chosen stack.  
**Sources:** `user-flows.md`, `wireframes.md`, `interaction-patterns.md`, `recommendation-report.md`.

> Global placeholders available to all sections:
>
> - `{{project_id}}`, `{{release_id}}`, `{{sprint_id}}`, `{{issue_id}}`
> - `{{brand_voice_doc}}`, `{{accessibility_policy}}`, `{{performance_policy}}`
> - `{{platforms}}` (e.g., `["web","ios","android"]`), `{{locales}}`, `{{regions}}`
> - `{{design_system}}` (e.g., “shadcn + Radix”), `{{token_source}}` (design tokens reference)
> - `{{repo_url}}`, `{{pr_number}}`

---

## 0) Component Bill of Materials (CBOM)

Populate this table from UX flows. Adjust priorities if the prototyping plan offers ready-made equivalents.

|    ID | Component / Pattern | Used in Flows (refs) | Base Library (Use/Extend/Compose/Net-new) | Platforms (Web/iOS/Android) | Priority (P0/P1/P2) |
| ----: | ------------------- | -------------------- | ----------------------------------------- | --------------------------- | ------------------- |
| C-001 | {{component_name}}  | {{F1, F2}}           | {{Use/Extend/Compose/Net-new}}            | {{platforms}}               | {{P0}}              |
| C-002 | {{component_name}}  | {{F3}}               | {{Use/Extend/Compose/Net-new}}            | {{platforms}}               | {{P1}}              |

> Keep this as an index; each item below requires a full spec section with the matching `[ID]`.

---

## 1) Spec Template (Copy for each component)

```yaml
component:
  id: "{{component_id}}"
  name: "{{component_name}}"
  concepts: ["{{CONCEPT-001}}", "{{CONCEPT-003}}"] # Which concepts this fulfills
  flows: ["{{F1}}", "{{F2}}"]
  platforms: ["{{web}}", "{{ios}}", "{{android}}"]
  base_library: "{{Use|Extend|Compose|Net-new}}"
  design_system: "{{design_system}}"
  tokens_ref: "{{token_source}}"
  ownership:
    designer: "{{name_or_handle}}"
    dev_lead: "{{name_or_handle}}"
  telemetry:
    event_base: "ui.{{component_slug}}"
    testid_base: "cmp-{{component_slug}}"
  constraints:
    accessibility_policy: "{{accessibility_policy}}"
    performance_policy: "{{performance_policy}}"
    locales: { { locales } }
    regions: { { regions } }
  context_hooks:
    backlinks:
      - "{{repo_url}}/issues/{{issue_id}}"
      - "{{repo_url}}/pull/{{pr_number}}"
```

### {{component_name}} — `{{component_id}}`

**Purpose**  
_One line tied to user value & flows:_ “Enables {{user_goal}} in Flow {{flow_ref}}.”

**Anatomy**

- Parts: {{container}}, {{icon}}, {{label}}, {{assistive_text}}, {{badge}}.

**Props / Slots / Variants**

- Variants: {{size_sm_md_lg}}, {{emphasis_primary_secondary_tertiary}}, {{destructive}}, {{ghost}}.
- Props: `{{prop_name}}: {{type}}` — default `{{value}}`

**States**

- Default / Hover / Focus / Active / Disabled / Loading / Error / Empty.
- Include **dark mode** visuals.

**Behavior & Interactions**

- Keyboard: Tab order {{order}}.
- Pointer/touch: hit area ≥ 44×44.
- Motion: enter/exit animations `{{anim_enter}} / {{anim_exit}}`.

**Accessibility**

- Role & name: `{{role}}`; name from `{{label_src}}`.
- ARIA: `{{aria-expanded}}`, `{{aria-controls}}`.

**Tailwind / CSS Vars (Web)**

```html
<button class="...">{{label}}</button>
```

**Material / iOS / Android Equivalents**

- Material: `{{MaterialEquivalent}}`
- iOS SwiftUI: `{{SwiftUIEquivalent}}`
- Android Compose: `{{ComposeEquivalent}}`

**Data & Analytics**

- Events: `ui.{{component_slug}}.click`
- Test IDs: `data-testid="{{telemetry.testid_base}}-{{variant}}"`

**Performance**

- Budgets: {{max_animation_cpu}}, {{max_animation_duration}}, {{max_asset_kb}}.

<!-- WHIMSY:ANCHORS -->

**Delight Opportunities**: `{{loading_quip_slot}}`, `{{celebration_type}}`, `{{empty_state_pattern}}`  
**Reduced-Motion Alternate**: `{{reduced_motion_alt}}`  
**Copy Voice Slots**: `{{copy_variant_a}}`, `{{copy_variant_b}}`  
**Anti-Patterns**: `unskippable_animation`, `sound_on_by_default`

---

## 2) Page Template Spec (use for each screen)

```yaml
screen:
  id: "{{screen_id}}"
  name: "{{screen_name}}"
  route: "{{/path}}"
  flows: ["{{F1}}"]
  critical_components: ["{{C-001}}"]
```

### {{screen_name}}

- **Route / ID:** `{{/path}}`
- **Purpose:** aligns to flow {{flow_refs}}.
- **Critical components:** {{ids}}.
- **Empty/Loading/Error:** explicit designs.

<!-- WHIMSY:PAGE -->

- **Delight Opportunities:** `{{loading_quips}}`, `{{success_celebration}}`
- **Reduced-Motion Alternate:** `{{page_reduced_motion_alt}}`

---

## 3) Global Patterns

- Forms: validation, errors.
- Lists & cards: density, gestures.

<!-- WHIMSY:GLOBAL -->

- Delight Allowlist: `{{pull_to_refresh_surprise}}`
- Anti-Patterns: `unskippable_animation`
