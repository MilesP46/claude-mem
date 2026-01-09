# Design System — Foundations & Tokens (Release {{X}})

**Save To:** `{{foreman}}/release-{{X}}/docs/02-ui-design/design-system.md`  
**Purpose:** Provide platform‑agnostic foundations that map cleanly to the chosen stack from the Prototyping Agent and flows from the UX‑Researcher.

---

## 0) Fill‑In Summary (delete this section after completion)
- Stack (from recommendation report): `{{stack_name}}`  
  - Web example: Tailwind + shadcn/ui + Radix  
  - Native example: iOS (SwiftUI), Android (Compose), or Material 3 on web
- Icon set: `{{icons}}` (Heroicons / Material / SF Symbols / Custom)
- Motion: `{{motion_lib}}` (Framer Motion / native / none)
- Theming: `{{theming}}` (CSS variables / Material dynamic color / native)

---

## 1) Design Tokens (Semantic‑first)

Use **semantic** tokens; reference tokens back raw palette. Keep names consistent across Figma variables and code.

### 1.1 Color Tokens

> Ensure WCAG 2.2 AA contrast. Provide both light & dark.

```json
{
  "ref": {
    "blue": { "50": "#EFF6FF", "100": "#DBEAFE", "500": "#3B82F6", "600": "#2563EB", "700": "#1D4ED8" },
    "gray": { "50": "#F9FAFB", "100": "#F3F4F6", "500": "#6B7280", "700": "#374151", "900": "#111827" },
    "green": { "500": "#10B981" },
    "amber": { "500": "#F59E0B" },
    "red": { "500": "#EF4444" }
  },
  "sys": {
    "color-primary": { "light": "var(--ref-blue-600)", "dark": "var(--ref-blue-500)" },
    "color-on-primary": { "light": "#FFFFFF", "dark": "#FFFFFF" },
    "color-secondary": { "light": "var(--ref-gray-900)", "dark": "var(--ref-gray-100)" },
    "color-surface": { "light": "#FFFFFF", "dark": "#0B0F16" },
    "color-on-surface": { "light": "#0F172A", "dark": "#E5E7EB" },
    "color-success": { "light": "var(--ref-green-500)", "dark": "var(--ref-green-500)" },
    "color-warning": { "light": "var(--ref-amber-500)", "dark": "var(--ref-amber-500)" },
    "color-error": { "light": "var(--ref-red-500)", "dark": "var(--ref-red-500)" },
    "color-border": { "light": "rgba(15,23,42,.12)", "dark": "rgba(229,231,235,.16)" },
    "color-focus": { "light": "var(--ref-blue-600)", "dark": "var(--ref-blue-500)" }
  }
}
```

#### CSS Variables (authoritative names)
```css
:root {
  /* reference */
  --ref-blue-600: #2563EB;
  --ref-blue-500: #3B82F6;
  --ref-gray-900: #111827;
  --ref-gray-100: #F3F4F6;
  --ref-green-500: #10B981;
  --ref-amber-500: #F59E0B;
  --ref-red-500: #EF4444;

  /* semantic */
  --sys-color-primary: var(--ref-blue-600);
  --sys-color-on-primary: #fff;
  --sys-color-secondary: var(--ref-gray-900);
  --sys-color-surface: #fff;
  --sys-color-on-surface: #0F172A;
  --sys-color-success: var(--ref-green-500);
  --sys-color-warning: var(--ref-amber-500);
  --sys-color-error: var(--ref-red-500);
  --sys-color-border: rgba(15,23,42,.12);
  --sys-color-focus: var(--ref-blue-600);
}
@media (prefers-color-scheme: dark) {
  :root {
    --sys-color-primary: var(--ref-blue-500);
    --sys-color-secondary: var(--ref-gray-100);
    --sys-color-surface: #0B0F16;
    --sys-color-on-surface: #E5E7EB;
    --sys-color-border: rgba(229,231,235,.16);
    --sys-color-focus: var(--ref-blue-500);
  }
}
```

### 1.2 Typography

- **Scale (mobile‑first):** Display 36/40, H1 30/36, H2 24/32, H3 20/28, Body 16/24, Small 14/20, Tiny 12/16.  
- **Font families:** `{{brand_font_primary}}`, fallbacks.  
- **Weights:** 700/600/500/400.  

**Tailwind mapping (example):**
```js
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['{{brand_font_primary}}', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        display: ['36px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        h1: ['30px', { lineHeight: '36px' }],
        h2: ['24px', { lineHeight: '32px' }],
        h3: ['20px', { lineHeight: '28px' }],
        body: ['16px', { lineHeight: '24px' }],
        small: ['14px', { lineHeight: '20px' }],
        tiny: ['12px', { lineHeight: '16px' }]
      }
    }
  }
}
```

### 1.3 Spacing & Sizing

- **Base grid:** 4/8px.  
- **Space tokens:** `--space-1` (4px), `--space-2` (8px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px).  
- **Container widths:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`.  
- **Touch target:** min 44×44px.

### 1.4 Radius & Elevation

- **Radius tokens:** `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-pill: 9999px`.  
- **Elevation tokens:** `--elevation-1..5` with balanced blur/spread; avoid heavy shadows on mobile.

### 1.5 Motion

- **Durations:** `--motion-fast: 120ms`, `--motion-normal: 200ms`, `--motion-slow: 320ms`.  
- **Easing:** standard cubic‑bezier `0.2, 0, 0, 1`.  
- **Reduced motion:** honor `prefers-reduced-motion`; provide non‑animated fallback.

### 1.6 Iconography

- Set: `{{icons}}`. Sizes: 16/20/24. Stroke: 1.5–2px. Color inherits current text color.

---

## 2) Cross‑Stack Mapping

Fill the section relevant to the chosen stack and delete others after finalization.

### 2.A Web (Tailwind + shadcn/ui + Radix)

- **Color mapping:** Tailwind `theme.extend.colors.brand.{50..900}` → map to `--sys-color-primary` variants.  
- **Focus ring:** `ring-2 ring-offset-2 ring-[var(--sys-color-focus)]`.  
- **Radix Primitives:** use for dialogs, popovers, menus, tabs, toggles; theme via CSS vars.

### 2.B Web (Material 3)

- Use Material color roles (`primary`, `onPrimary`, `surface`, `onSurface`, etc.).  
- Derive dynamic schemes if supported; otherwise map from tokens above.

### 2.C iOS (SwiftUI)

- Color assets named like `SysPrimary`, `SysSurface`.  
- Type: dynamic type categories; large content sizes supported.  
- SF Symbols variant mapping per size/weight.

### 2.D Android (Jetpack Compose)

- Use `MaterialTheme` with color/typography/shape from tokens.  
- Touch target sizes via `minimumTouchTargetEnforcement`.

---

## 3) Accessibility Rules (authoritative)

- **Contrast:** Body 4.5:1, large text 3:1, non‑text 3:1.  
- **Keyboard:** All interactive elements tabbable; visible focus; escape closes modals.  
- **Screen readers:** labels, roles, descriptions; announce async changes via live regions.  
- **Gestures:** Provide non‑gesture alternatives.

---

## 4) Brand & Visual Voice

- Gradients, shadows, corner radii set above. Keep visuals lightweight and screenshot‑friendly (9:16 hero moments).
