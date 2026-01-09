# Interaction Patterns — Release {X}

> **Source:** `{{foreman}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md` (only).  
> **Goal:** Define **reusable interaction rules** that multiple flows/pages share. No visual design or component specs.

---

## Candidate Patterns (from flows & wireframes)

- IP-01 {{Global Navigation}}
- IP-02 {{Form Submission & Validation}}
- IP-03 {{Search & Filter}}
- IP-04 {{Lists & Detail Drill‑down}}
- IP-05 {{Modal / Bottom Sheet Usage}}
- IP-06 {{Loading / Empty / Error Conventions}}

---

## Pattern Template (duplicate for each)

### Pattern: {{Pattern Name}} — `IP-01`

**Problem it solves:** {{Tie to pain point}}  
**When to use:** {{Decision rules & constraints}}  
**Behavior (user‑level):**

- Entry: {{How user arrives}}
- Interaction steps: {{What user does, not UI specifics}}
- Exit: {{Where they go next / success}}

**Navigation rules:** {{If affects global nav/back behavior}}  
**Error & Empty:** {{What user sees at a high level}}  
**Accessibility considerations:** {{Keyboard focus, readable copies, confirmation clarity}}  
**Flows & Pages using this pattern:** {{F-001, P-101}}  
**Rationale:** {{Tie to success criteria from spec}}

---

## Cross‑reference

| Pattern ID | Used by Flows | Used by Pages | Notes     |
| ---------: | ------------- | ------------- | --------- |
|      IP-01 | F-001         | P-101, P-103  | {{notes}} |

---

## Assumptions & Open Questions

- [ ] {{Question or assumption with link to epic section}}
