> QRG · Agent Skills Identification Assessment
> • Purpose: Comprehensive analysis identifying Skills that can be created from foreman agents
> • Entrypoints: #executive-summary, #skills-candidates, #implementation-recommendations
> • Related: [Agent Catalog](01-agent-catalog-findings.md), [Orchestration](02-orchestration-agents-findings.md), [Specialized Tasks](03-specialized-task-findings.md), [Workers](04-worker-agents-findings.md), [Utilities](05-utility-agents-findings.md)
> • Master TOC: [docs/README_TOC.md](../../README_TOC.md)

# Impact Assessment: Agent Skills Identification

**Date:** 2026-01-07
**Scope:** Identify Skills that can be created from existing foreman agents
**Agent Count:** 38 active agents analyzed across 5 focus areas

---

## Executive Summary

Analyzed 38 active agents to identify Skills candidates. **Recommended 15 high-value Skills** across three tiers that enable natural language triggering of agent capabilities.

### Key Findings

**Skills Architecture:**
- Skills = Auto-triggered based on natural language matching descriptions
- Slash Commands = Explicitly invoked by user typing `/command`
- Agents remain the implementation layer, Skills/Commands become the invocation layer

**Conversion Strategy:**
- **Tier 1 (6 Skills):** High-value analysis/fix workflows with clear natural triggers
- **Tier 2 (6 Skills):** Moderate-value utilities with direct request patterns
- **Tier 3 (3 Skills):** Specialized workflow support
- **Keep as Commands:** Planning, creation, and irreversible operations (7 agents)

**Implementation Impact:**
- Zero code changes to agents themselves
- Create `~/.claude/skills/` or `.claude/skills/` directories with SKILL.md wrappers
- Skills invoke existing commands using Skill tool
- Progressive rollout: Start with read-only analysis Skills, expand to fix/modify Skills

---

## Skills Candidates

### Tier 1: High-Value Skills (Strong Recommendation)

#### 1. Error Analysis (`analyze-error`)

**Source Agent:** error-explorer
**Current Command:** `/error-explorer`

**Description:**
```
Deep error analysis to identify root causes with 100% confidence through
comprehensive code tracing. Read-only analysis, no code modifications.
```

**Natural Triggers:**
- "I'm getting an error..."
- "Why is this failing?"
- "Find the root cause"
- "Debug this issue"
- "What's causing this bug?"

**Value:** Foundation for error resolution workflows. Read-only = safe auto-triggering.

---

#### 2. Error Fixing (`fix-error`)

**Source Agent:** surgical-fixes (via error-fix command)
**Current Command:** `/error-fix`

**Description:**
```
Fixes identified errors with targeted surgical edits while preserving
functionality and updating tests. Follows error-explorer analysis.
```

**Natural Triggers:**
- "Fix this error"
- "Resolve this bug"
- "Make this work"
- "Repair this code"

**Value:** Most common developer need. Complements analyze-error for complete resolution.

---

#### 3. Impact Analysis (`impact-change`)

**Source Agent:** impact-assessment (via impact-change command)
**Current Command:** `/impact-change`

**Description:**
```
Analyzes comprehensive impact of code changes by launching parallel
assessment agents, synthesizing findings, and optionally executing
surgical implementation with verification.
```

**Natural Triggers:**
- "Analyze impact of [change]"
- "What files are affected?"
- "Assess the scope of [modification]"
- "Help me understand the impact"

**Value:** Users naturally describe changes without knowing they need impact analysis.

---

#### 4. UI Bug Fixing (`fix-ui-bug`)

**Source Agent:** vite-frontend-fix
**Current Command:** `/vite-UI-fix`

**Description:**
```
Fixes Vite frontend UI/UX issues through Playwright-based iterative
verification and repair with comprehensive service validation.
```

**Natural Triggers:**
- "UI bug in [component]"
- "Frontend is broken"
- "Component not rendering"
- "Button doesn't work"
- "Layout is broken"

**Value:** UI issues are described naturally; users rarely think of specific commands.

---

#### 5. Git Error Fixing (`fix-git-errors`)

**Source Agent:** git-error-fixer
**Current Command:** `/fix-git`

**Description:**
```
Fixes pre-commit hook, linter, and type checker errors blocking git
commits by launching parallel agents for affected files.
```

**Natural Triggers:**
- "Git commit failed"
- "Pre-commit hook error"
- "Linter blocking commit"
- "Type errors preventing commit"
- "Can't commit"

**Value:** High frequency, clear trigger context, immediate value.

---

#### 6. Test Troubleshooting (`troubleshoot-tests`)

**Source Agent:** troubleshooting-investigator
**Current Command:** None (invoked by validation)

**Description:**
```
Autonomous resolution of test failures with zero-regression tolerance
through fix-and-verify cycles.
```

**Natural Triggers:**
- "Tests are failing"
- "Test suite is broken"
- "CI is broken"
- "Build is failing"
- "Unit tests are red"

**Value:** Common pain point, autonomous resolution, clear triggers.

---

### Tier 2: Moderate-Value Skills

#### 7. Dead Code Analysis (`dead-code`)

**Source Agent:** dead-code-reviewer
**Current Command:** `/dead-code-review`

**Description:**
```
Identifies unused code that can be safely removed through parallel
analysis with 100% certainty requirements.
```

**Natural Triggers:**
- "Find dead code"
- "What code is unused?"
- "Identify unreachable code"
- "Find orphaned files"

---

#### 8. Memory Management (`update-memory`)

**Source Agent:** memory-manager
**Current Command:** `/manage-memory`

**Description:**
```
Updates CLAUDE.md memory files using hierarchical system with
depth-scaled limits.
```

**Natural Triggers:**
- "Update memory files"
- "Refresh CLAUDE.md"
- "Update project documentation"

---

#### 9. Code Restructuring (`restructure`)

**Source Agent:** code-restructurer
**Current Command:** None

**Description:**
```
Reorganizes large files into modular components while preserving
functionality and tests. Enforces 150-200 LOC limits.
```

**Natural Triggers:**
- "This file is too big"
- "Split this module"
- "Refactor into smaller files"
- "Extract repeated logic"

---

#### 10. Documentation Update (`update-docs`)

**Source Agent:** documentation-updater
**Current Command:** None

**Description:**
```
Creates or updates technical documentation following project standards
with proper hierarchy and QRG blocks.
```

**Natural Triggers:**
- "Document this feature"
- "Update the docs"
- "Add documentation"
- "Create a diagram"

---

#### 11. UI Verification (`verify-ui`)

**Source Agent:** verify-ui
**Current Command:** None (invoked by other agents)

**Description:**
```
Playwright-based UI testing to verify frontend changes and validate
backend execution.
```

**Natural Triggers:**
- "Verify the UI works"
- "Test this in the browser"
- "Check if the frontend works"

---

#### 12. Surgical Edits (`surgical-edit`)

**Source Agent:** surgical-edits
**Current Command:** None (invoked by impact-change)

**Description:**
```
Executes planned code changes from impact assessment with surgical
precision and test updates.
```

**Natural Triggers:**
- "Implement the planned changes"
- "Execute the impact assessment"
- "Apply the changes"

---

### Tier 3: Specialized Support Skills

#### 13. Chore Refactoring (`apply-chore`)

**Source Agent:** chore-refactorer
**Current Command:** `/apply-chore-refactors`

**Description:**
```
Applies refactoring changes documented in chore PR files sequentially.
```

**Natural Triggers:**
- "Apply chore refactoring"
- "Update dependencies"

---

#### 14. Exploration (`explore`)

**Source Agent:** Explore (built-in)
**Current Command:** None

**Description:**
```
Fast codebase exploration to find files by patterns, search keywords,
or answer questions about the codebase.
```

**Natural Triggers:**
- "Where is [feature] implemented?"
- "Find all [pattern] files"
- "How does [feature] work?"

---

#### 15. Planning (`plan`)

**Source Agent:** Plan (built-in)
**Current Command:** None

**Description:**
```
Software architect agent for designing implementation plans with
step-by-step strategies and critical file identification.
```

**Natural Triggers:**
- "How should I implement [feature]?"
- "Create a plan for [task]"
- "Design the approach for [change]"

---

## Agents to Keep as Slash Commands

### Planning & Creation Workflows

| Command | Agent | Reason |
|---------|-------|--------|
| `/chain-plan-design-green` | chain-system-architect | Specialized release planning requires explicit intent |
| `/chain-plan-design-update` | chain-update-researcher | Existing release updates need explicit context |
| `/chain-send-issues` | chain-issue-creator | GitHub issue creation requires user authorization |
| `/chain-issue` | chain-issue-builder | Issue execution requires explicit workflow control |
| `/review-chore-prs` | pr-chore-reviewer | PR merge consequences need explicit approval |
| `/new-issue` | chain-issue-creator | Strategic issue insertion requires explicit intent |
| `/chain-concept-gen` | chain-prototype-researcher | Concept refinement requires explicit invocation |

**Rationale:** These operations are irreversible (GitHub issue creation), require deep context (release planning), or have external system effects (PR merging) that need explicit user control.

---

## Implementation Recommendations

### Priority Order

**Phase 1: Read-Only Analysis (Low Risk)**
1. `analyze-error` (error-explorer)
2. `dead-code` (dead-code-reviewer)
3. `explore` (Explore agent)

**Phase 2: Common Fix Workflows (High Value)**
4. `fix-git-errors` (git-error-fixer)
5. `troubleshoot-tests` (troubleshooting-investigator)
6. `fix-ui-bug` (vite-frontend-fix)

**Phase 3: Complex Workflows (Orchestrated)**
7. `fix-error` (surgical-fixes + verify-ui)
8. `impact-change` (impact-assessment + surgical-edits)
9. `restructure` (code-restructurer)

**Phase 4: Utilities & Support**
10. `update-memory` (memory-manager)
11. `update-docs` (documentation-updater)
12. `verify-ui` (verify-ui)
13. `apply-chore` (chore-refactorer)
14. `surgical-edit` (surgical-edits)
15. `plan` (Plan agent)

---

## Skills Architecture Patterns

### Pattern 1: Direct Agent Mapping

**Example:** `analyze-error` → error-explorer agent

```yaml
---
name: analyze-error
description: Deep error analysis to identify root causes with 100% confidence. Use when investigating errors, bugs, failures, or issues to understand root causes.
---

When the user describes an error or asks for debugging help, launch the error-explorer agent:

1. Gather error context from user message
2. Use the Skill tool to invoke "error-explorer" command
3. Present findings to user

This skill is read-only and makes no code changes.
```

---

### Pattern 2: Command Wrapper

**Example:** `impact-change` → /impact-change command

```yaml
---
name: impact-change
description: Analyzes comprehensive impact of code changes through parallel assessment agents. Use when user describes changes, asks about affected files, or needs scope analysis.
---

When user describes a code change, invoke the impact-change command:

1. Extract change description from user message
2. Use the Skill tool to invoke "impact-change" command with change description
3. Command orchestrates parallel assessment agents
4. Wait for assessment completion and user approval
5. Present results and next steps
```

---

### Pattern 3: Multi-Agent Orchestration

**Example:** `fix-error` → error-explorer + surgical-fixes + verify-ui

```yaml
---
name: fix-error
description: Fixes errors through analysis, surgical edits, and verification. Use when user asks to fix bugs, resolve errors, or repair broken code.
---

Complete error resolution workflow:

1. Launch error-explorer for root cause analysis
2. Wait for 100% confidence findings
3. Launch surgical-fixes with error context
4. If frontend changes, launch verify-ui
5. Report completion with test results
```

---

## Skills vs. Slash Commands Decision Matrix

| Factor | Skills (Auto-Triggered) | Slash Commands (Explicit) |
|--------|------------------------|---------------------------|
| **Best For** | Analysis, fixes, common utilities | Planning, creation, irreversible operations |
| **User Effort** | Zero - describes problem naturally | Must know command exists |
| **Risk Level** | May trigger unexpectedly | Precise control |
| **Discovery** | Invisible but helpful | Requires documentation |
| **Authorization** | Low stakes (analysis/fixes) | High stakes (GitHub, planning) |

---

## SKILL.md Structure

### Minimal Example (analyze-error)

```yaml
---
name: analyze-error
description: Deep error analysis to identify root causes with 100% confidence through code tracing. Use when investigating errors, bugs, or failures.
---

# Error Analysis Skill

## When to Use
- User describes an error or exception
- User asks "Why is this failing?"
- User requests debugging help
- User mentions bugs or broken code

## How It Works
1. Extract error context from user message
2. Launch error-explorer agent with context
3. Agent performs read-only analysis
4. Present findings with file:line references

## Output
- Root cause with 100% confidence
- Complete logic chain from entry to error
- File and line references
- No code modifications
```

---

### Complex Example with Progressive Disclosure (impact-change)

```
impact-change/
├── SKILL.md              # Overview and orchestration
├── WORKFLOW.md           # 6-phase detailed workflow
└── EXAMPLES.md           # Real-world usage examples
```

**SKILL.md:**
```yaml
---
name: impact-change
description: Comprehensive impact analysis and implementation of code changes through parallel agents. Use when user describes changes or asks about affected files.
---

# Impact Change Skill

## Quick Start
Invoke when user describes a code change:
- "Change X to use Y"
- "What's affected by modifying Z?"
- "Implement feature F"

For detailed workflow, see [WORKFLOW.md](WORKFLOW.md).
For examples, see [EXAMPLES.md](EXAMPLES.md).

## Invocation
Use the Skill tool to invoke "impact-change" command with change description.
```

---

## Dead Code Detection Integration

**For Skills that modify code:** Include dead code detection phase after gap analysis.

**Example in impact-change Skill:**
```markdown
## Phase 2.5: Dead Code Detection

After gap analysis, identify code that will become dead:
1. Launch analysis agent to review assessment
2. Identify replaced/superseded code
3. Find functions losing only usage
4. Detect obsolete patterns
5. Add "Dead Code to Remove" section to assessment if found
```

---

## Change Execution Plan

### Phase 1: Create Skills Directory Structure

**Personal Skills:**
```bash
mkdir -p ~/.claude/skills/{analyze-error,fix-error,impact-change,fix-ui-bug,fix-git-errors,troubleshoot-tests,dead-code,update-memory,restructure,update-docs,verify-ui,surgical-edit,apply-chore,explore,plan}
```

**Project Skills (for team sharing):**
```bash
mkdir -p .claude/skills/{analyze-error,fix-error,impact-change,fix-ui-bug,fix-git-errors,troubleshoot-tests,dead-code,update-memory,restructure,update-docs,verify-ui,surgical-edit,apply-chore,explore,plan}
```

---

### Phase 2: Create SKILL.md Files (Priority Order)

**Read-Only Analysis Skills:**
1. `~/.claude/skills/analyze-error/SKILL.md`
2. `~/.claude/skills/dead-code/SKILL.md`
3. `~/.claude/skills/explore/SKILL.md`

**Common Fix Workflows:**
4. `~/.claude/skills/fix-git-errors/SKILL.md`
5. `~/.claude/skills/troubleshoot-tests/SKILL.md`
6. `~/.claude/skills/fix-ui-bug/SKILL.md`

**Complex Workflows:**
7. `~/.claude/skills/fix-error/SKILL.md`
8. `~/.claude/skills/impact-change/SKILL.md` (with WORKFLOW.md, EXAMPLES.md)
9. `~/.claude/skills/restructure/SKILL.md`

**Utilities:**
10-15. Remaining skills

---

### Phase 3: Test Skill Triggering

For each skill:
1. Restart Claude Code to load skill
2. Verify skill appears in "What Skills are available?"
3. Test with natural language trigger
4. Verify skill invokes correct command/agent
5. Validate output matches expectations

**Test Cases:**
- **analyze-error:** "I'm getting this error: [paste error]"
- **fix-git-errors:** "Git commit failed with linter errors"
- **impact-change:** "I want to change the auth system to use JWT"
- **fix-ui-bug:** "The login button isn't working"

---

### Phase 4: Documentation Updates

1. Create Skills catalog in `docs/skills/`
2. Document trigger patterns and keywords
3. Create troubleshooting guide for Skills
4. Add Skills to project README
5. Update CLAUDE.md with Skills usage patterns

---

## Risk Assessment

### Low Risk (Read-Only)
- `analyze-error` - No code changes
- `dead-code` - Analysis only
- `explore` - Read-only exploration

### Medium Risk (Targeted Fixes)
- `fix-git-errors` - Scoped to commit errors
- `troubleshoot-tests` - Autonomous but test-verified
- `fix-ui-bug` - Iterative with verification

### Higher Risk (Complex Workflows)
- `impact-change` - Multi-phase orchestration, requires approval
- `fix-error` - Modifies code, needs error context
- `restructure` - Major refactoring, test baseline required

**Mitigation:** Start with read-only Skills, validate triggering accuracy before enabling modify Skills.

---

## Testing Strategy

### Unit Testing Skills (Manual)
1. Create test conversation for each skill
2. Use natural trigger phrase
3. Verify skill invoked (not command)
4. Validate correct agent launched
5. Check output quality

### Integration Testing (Workflow)
1. Test skill chains (analyze-error → fix-error → verify-ui)
2. Verify context passing between skills
3. Validate orchestration coordination
4. Check parallel agent launches

### Negative Testing
1. Test with ambiguous triggers (verify wrong skill doesn't fire)
2. Test with irrelevant context (skill should not trigger)
3. Test with missing arguments (graceful degradation)

---

## Rollback Plan

If skills cause unexpected triggering:
1. Delete specific skill directory
2. Restart Claude Code
3. Revert to slash command for that capability
4. Refine skill description and retry

**Rollback Command:**
```bash
rm -rf ~/.claude/skills/[skill-name]
# Restart Claude Code
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Agents Analyzed** | 38 |
| **Recommended as Skills** | 15 |
| **Keep as Slash Commands** | 7 |
| **Phase 1 (Read-Only)** | 3 |
| **Phase 2 (Common Fixes)** | 3 |
| **Phase 3 (Complex Workflows)** | 3 |
| **Phase 4 (Utilities)** | 6 |

---

## Next Steps

After user approval:
1. Create Skills directory structure
2. Write SKILL.md files for Phase 1 (read-only)
3. Test triggering accuracy
4. Iterate on descriptions based on testing
5. Roll out Phase 2-4 incrementally
6. Document final Skills catalog
7. Update project standards to use Skills
