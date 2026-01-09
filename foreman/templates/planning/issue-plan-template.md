# Issue Plan — Release {{X}}

## Table of Contents

- [Issue Plan — Release {{X}}](#issue-plan--release-x)
  - [Index](#index)
  - [Issues](#issues)
    - [001 — {{Issue 001 Title}}](#001--issue-001-title)
    - [002 — {{Feature Issue Title}}](#002--feature-issue-title)

## Index

|   # | Title                   | Type      | Priority | Status   | Phase   | Labels (comma‑sep)                                                                                           | Agents (sequence)   | Depends On | GH Issue # |
| --: | ----------------------- | --------- | -------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------ | ------------------- | ---------- | ---------- |
| 001 | {{Issue 001 Title}}     | {{chore}} | {{P0}}   | {{todo}} | {{dev}} | type:{{chore}}, priority:{{P0}}, status:{{todo}}, area:{{devex}}, phase:{{dev}}, release:{{X}}, sprint:{{S}} | {{agent}}           | -          | -          |
| 002 | {{Feature Issue Title}} | {{feat}}  | {{P1}}   | {{todo}} | {{dev}} | type:{{feat}}, priority:{{P1}}, status:{{todo}}, area:{{api}}, phase:{{dev}}, release:{{X}}, sprint:{{S}}    | {{agent1 → agent2}} | 001        | -          |

_Add additional issues by copying the row above and incrementing the sequence number_

- **Type:** `feat` | `fix` | `chore` | `refactor`
- **Priority:** `P0` (critical) | `P1` (high) | `P2` (normal)
- **Status:** `todo` | `in-progress` | `blocked` | `review` | `done`
- **Phase:** `dev` (development) | `build` (build/system integration) | `deploy` (deployment)
- **Area:** `api` | `ui` | `db` | `infra` | `security` | `devex` | `docs`

---

## Issues

### 001 — {{Issue 001 Title}}

**Delivers Concepts:** [{{CONCEPT-IDS}}]

**Short Description**  
{{What to build/fix}}.

**Scope**

- **Problem:** {{What's broken, needed, or missing}}
- **Non‑Goals:** {{Explicitly out of scope}}

**Acceptance Criteria**

- {{Testable outcomes using Given/When/Then or bullet list}}
- **Agent Documentation**: Each agent must comment on GitHub issue with completion summary

**Agent Map (sequence)**

1. {{agent}} — {{task}}

**Notes**

- {{Dependencies and additional notes}}

---

### 002 — {{Feature Issue Title}}

**Delivers Concepts:** [{CONCEPT_IDS}] <!-- e.g., [CONCEPT-001, CONCEPT-003] -->

**Short Description**  
{{What to build/fix}}.

**Scope**

- **Problem:** {{What's broken, needed, or missing}}
- **Non‑Goals:** {{Explicitly out of scope}}

**Acceptance Criteria**

- {{Testable outcomes using Given/When/Then or bullet list}}
- **Agent Documentation**: Each agent must comment on GitHub issue with completion summary

**Prior Art & References**

**Templates & Patterns:**

- File: `{{@foreman/templates/path/file.md}}` (lines {{X-Y}})
  - {{Description of how this template/pattern applies}}

**Existing Code Examples:**

- File: `{{@foreman/release-{{X}}/docs/path/file.md}}` (lines {{X-Y}})
  - {{Description of relevant existing implementation}}

**Design References:**

- File: `{{@foreman/release-{{X}}/docs/path/file.md}}` (lines {{X-Y}})
  - {{Description of relevant design patterns or specifications}}

**Agent Map (sequence)**

1. {{agent}} — {{task}}
2. {{agent}} — {{task}}  
   _Add additional if more than one._

**Notes**

- Depends on: #001

> Duplicate this block for issues 002..N.
