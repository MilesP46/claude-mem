# User Flows — Release {X}

> **Source:** `{{foreman}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md` (only).  
> **Purpose:** Define the **screen inventory**, **navigation model**, and **core flows** that realize the epics’ goals.  
> **Note:** Do not include visual design, tokens, or component specs.

---

## 0) Summary from Specification

- **Primary Goals:** {{summarize_from_epics}}
- **Key Journeys:** {{list_key_journeys_from_epics}}
- **Pain Points:** {{list_pain_points_from_epics}}
- **Success Criteria:** {{list_success_criteria_from_epics}}

---

## 1) Screen / Page Inventory

List the pages the app needs. Keep names stable and referenceable.

| Page ID | Name              | Purpose (from epics) | Entry Points         | Exit / Next | Data Needed | Notes / Open Questions |
| ------: | ----------------- | -------------------- | -------------------- | ----------- | ----------- | ---------------------- |
|   P-101 | {{Example: Home}} | {{Overview of X}}    | {{F-001, Deep link}} | {{P-102}}   | {{X/Y}}     | {{Assumptions…}}       |

---

## 2) Global Navigation Model

Describe how users move between major areas (no styling).

- **Primary structure:** {{tabs / drawer / bottom bar / top nav / none}}
- **Rules:**
  - Back behavior: {{rule}}
  - Deep link handling: {{rule}}
  - Auth guard / gated areas: {{rule}}

---

## 3) Core Flows

For each flow, include a diagram and details.

### Flow: {{Flow Name}} — `F-001`

**Implements Concepts:** [{CONCEPT_IDS}] <!-- e.g., [CONCEPT-001, CONCEPT-003] -->
**Goal:** {{Tie to epic goal}}  
**Entry points:** {{Page IDs, push notification, deep link}}  
**Success criteria:** {{Measurable outcome}}  
**Happy path steps:**

1. {{Step}}
2. {{Step}}
3. {{Step}}

**Alternate/edge paths:**

- {{Condition}} → {{Outcome}}
- {{Condition}} → {{Outcome}}

**Pages involved:** {{P-101, P-102}}  
**Screen‑level states:** {{empty, loading, error}} (describe at a high level)

**Diagram (Mermaid):**

```mermaid
flowchart TD
  A[Entry: {{trigger}}] --> B{{{{decision or task}}}}
  B -->|yes| C[{{next step}}]
  B -->|no| D[{{alternate}}]
  C --> E[Success: {{result}}]
  D --> F[Recover / Exit]
```

**ASCII fallback:**

```
[Entry: {{trigger}}] -> (Task: {{name}}) -> {Decision?} -> [Next]
                                | no -> [Alternate] -> [Exit]
                                | yes -> [Success]
```

> Duplicate this section for each flow: F-002, F-003, …

---

## 4) Flow–Page Cross‑Reference Matrix

| Flow ID | Pages Used (IDs) | Primary Persona(s) | Notes     |
| ------: | ---------------- | ------------------ | --------- |
|   F-001 | P-101, P-102     | PR-01              | {{notes}} |

---

## 5) Assumptions & Open Questions

- [ ] {{Assumption or question tied to epic & flow}}
