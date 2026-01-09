# Wireframes (Low‑Fi, Text/ASCII) — Release {X}

> **Source:** `{{foreman}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md` (only).  
> **Purpose:** Convey **layout, hierarchy, and content zones** for each page. No visual design, tokens, or components.

---

## Legend

`[]` interactive element • `()` grouping • `{}` notes • `...` repeated content

---

## Page: {{Page Name}} — `P-101`

**Purpose:** {{From Screen Inventory}}  
**Primary flow(s):** {{F-001, F-002}}

**Mobile (base)**

```
+----------------------------------+
| Header: [Logo] [Primary Nav?]    |
+----------------------------------+
| {{Hero / Intro copy}}            |
+----------------------------------+
| (Content Section)                |
|  [Card]                          |
|  [Card]                          |
|  [CTA Button]                    |
+----------------------------------+
| Footer: {{links}}                |
+----------------------------------+
```

**Desktop (wider)**

```
+------------------+---------------------------+
| Global Nav       |  Content                  |
| [Home][X][Y]     |  {{Hero}}                 |
|                  |  [Grid of Cards x N]      |
|                  |  [CTA]                    |
+------------------+---------------------------+
```

**Screen‑level states**

- **Empty:** {{What appears if no data?}}
- **Loading:** {{Skeleton/list placeholder, copy-only description}}
- **Error:** {{Inline message position and guidance}}

**Notes & Open Questions**

- {{Any ambiguity traced to epic line/section}}

---

## Page: {{Next Page}} — `P-102`

{{Repeat block above for each page in inventory}}

> Keep wireframes minimal; the UI‑Designer will decide visuals, components, spacing, and tokens.
