# Config Notes — Implementation, Stack Assimilation & Decisions (Release {{X}})

**Save To:** `{{foreman}}/release-{{X}}/docs//02-ui-design/config-notes.md`  
**Purpose:** Make designs truly “implementation‑ready.” Capture stack specifics, token pipelines, and decisions so devs can build without guesswork.

---

## 1) Stack Assimilation (from prototyping composition)

**Chosen stack summary:**  
- UI Library: `{{ui_library}}` (e.g., shadcn/ui, Material 3, SwiftUI, Compose)  
- Primitives: `{{primitives}}` (e.g., Radix)  
- Styling: `{{styling}}` (Tailwind, CSS Modules, native themes)  
- Icon set: `{{icons}}`  
- Motion: `{{motion_lib}}`

**Adoption rules:**  
- Prefer **Use** → **Extend** → **Compose** → **Net‑new**. Document any net‑new rationale here.

---

## 2) Tokens → Code Pipeline

**Source of truth:** Figma variables → `tokens.json` → build tool → platform configs.

### 2.1 Tailwind Mapping
```js
// tailwind.config.js (skeleton)
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--sys-color-primary)',
          surface: 'var(--sys-color-surface)',
          on: 'var(--sys-color-on-primary)'
        }
      },
      borderColor: { DEFAULT: 'var(--sys-color-border)' },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', pill: 'var(--radius-pill)'
      },
      boxShadow: {
        1: '0 1px 2px rgba(0,0,0,.05)',
        2: '0 2px 8px rgba(0,0,0,.08)',
        3: '0 8px 24px rgba(0,0,0,.12)'
      }
    }
  },
  plugins: []
}
```

### 2.2 Material 3 Mapping
- Define `ColorScheme` using tokens; set `primary`, `onPrimary`, `surface`, etc.  
- Use typography scale from `design-system.md`.

### 2.3 Native (iOS/Android)
- iOS: Asset catalog colors (light/dark); dynamic type; SF Symbols mapping.  
- Android: `MaterialTheme` with color/typography/shape; enforce min touch targets.

---

## 3) Theming & Modes

- **Light/Dark:** CSS variables or native schemes; ensure contrast & brand consistency.  
- **Reduced motion:** disable non‑essential animations.  
- **High contrast (optional):** alternative palette notes.

---

## 4) Accessibility Implementation Notes

- **Focus management:** use focus traps in dialogs; restore focus on close.  
- **ARIA roles:** tables, lists, landmarks.  
- **Keyboard maps:** document global shortcuts (if any).  
- **Screen reader announcements:** live regions for async updates.  
- **Color contrast audits:** record results & fixes here.

---

## 5) Performance & Assets

- **Images:** responsive sources; modern formats (WebP/AVIF where applicable).  
- **Icons:** single sprite or component imports; sizes 16/20/24.  
- **Animation:** cap to ≤ 200–320ms; avoid layout thrashing.  
- **Skeletons & progressive loading:** specify for long‑latency areas.

---

## 6) Analytics & Testability

- **Event naming:** `ui.<action>` with `component`, `id`, `variant`, `screen`.  
- **Test IDs:** `data-testid` strategy; stable across releases.  
- **Visual regression:** baseline screenshots per screen; thresholds.

---

## 7) Decisions Log (authoritative)

Record trade‑offs & resolutions impacting implementation (date, owner, context, decision).

| Date | Owner | Context | Decision | Impact |
|------|-------|--------|----------|--------|
| {{YYYY-MM-DD}} | {{name}} | {{issue}} | {{decision}} | {{impact}} |

---

## 8) Open Questions

Track items blocking design finalization; assign owner & due date.

- [ ] {{question}} — **Owner:** {{name}} — **Due:** {{date}}

---

## 9) Handoff Checklist

- [ ] `design-system.md` complete; tokens exported.  
- [ ] `component-specs.md` complete; all CBOM items covered.  
- [ ] This file updated with stack specifics & decisions.  
- [ ] Figma library and prototype links shared with engineering.
