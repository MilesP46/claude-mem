# Foreman-Claude-Mem Integration Synthesis Prompt

**Objective**: Create a comprehensive `revised_integration.md` that consolidates the best insights from all 14 versions (v0-v13) of the foreman-claude-mem integration specification.

---

## Your Task

You are reviewing the evolution of the foreman-claude-mem integration specification across 14 iterative versions. Each version addressed specific questions and added new capabilities, but later versions may have dropped valuable content from earlier versions as focus shifted.

**Your mission**: Create `foreman/revised_integration.md` that:
1. Uses v13 as the architectural foundation (lean hybrid model, memory as source of truth)
2. Recovers valuable content from v0-v12 that was lost or underemphasized in v13
3. Ensures ALL aspects of the integration are covered comprehensively
4. Resolves any contradictions between versions with clear reasoning

---

## Files to Review

Read these files in reverse chronological order (v13 → v0), taking notes on unique contributions:

```
foreman/foreman-claude-mem-integration-v13.md  ← START HERE (current architecture)
foreman/foreman-claude-mem-integration-v12.md
foreman/foreman-claude-mem-integration-v11.md
foreman/foreman-claude-mem-integration-v10.md
foreman/foreman-claude-mem-integration-v9.md
foreman/foreman-claude-mem-integration-v8.md
foreman/foreman-claude-mem-integration-v7.md
foreman/foreman-claude-mem-integration-v6.md
foreman/foreman-claude-mem-integration-v5.md
foreman/foreman-claude-mem-integration-v4.md
foreman/foreman-claude-mem-integration-v3.md
foreman/foreman-claude-mem-integration-v2.md
foreman/foreman-claude-mem-integration.md      ← v0 (original)
```

---

## Version Evolution Summary (For Context)

| Version | Primary Focus |
|---------|---------------|
| v0 | Original integration concept |
| v2 | Early architecture refinement |
| v3 | Real foreman architecture discovery |
| v4 | Development cockpit paradigm |
| v5 | Hook-driven auto-restart, planning lifecycle |
| v6 | Stream-aware orchestration, GitHub API decoupling |
| v7 | Intelligence layer, memory-agent transition |
| v8 | Scope-based thresholds, context efficiency |
| v9 | Memory automation, navigation vs detail layers |
| v10 | Cross-cutting coordination, WHAT-not-HOW pattern |
| v11 | Patchwork problem (implementation consistency) |
| v12 | Placement consistency (what-goes-where) |
| v13 | Context-level DRY, hybrid reference model |

---

## Analysis Framework

For each version (v13 → v0), identify:

### 1. Unique Contributions
What concepts/features does THIS version introduce that may not be in later versions?

### 2. Architectural Decisions
What key decisions were made? Are they superseded or still valid?

### 3. Lost Content
What valuable content from this version was dropped in later iterations?

### 4. Integration Points
What specific integration mechanisms are described (hooks, APIs, data flows)?

---

## Key Areas to Ensure Coverage

The revised document MUST address ALL of these areas. Check each version for content:

### A. Architecture
- [ ] Three-layer model (Memory, Agent, Claude-Mem)
- [ ] Bottom-up loading and context management
- [ ] Hook architecture (SessionStart, UserPromptSubmit, PostToolUse, Summary, SessionEnd)
- [ ] Worker service and API endpoints

### B. Memory System
- [ ] CLAUDE.md hierarchy and generation
- [ ] Content delegation and depth-scaled limits
- [ ] Cross-cutting concerns and @path dependencies
- [ ] Memory update procedures and triggers
- [ ] File ownership maps (v12 contribution)

### C. Agent Integration
- [ ] General vs Specialist agent distinction
- [ ] Lean hybrid model (v13 - methodology + variance-critical only)
- [ ] Agent suggestion mechanism at prompt time
- [ ] Worker orchestration patterns
- [ ] Agent-to-agent handoff protocols

### D. Orchestration
- [ ] WHAT-not-HOW pattern
- [ ] Routing decisions (root → area → specialist)
- [ ] Cross-cutting coordination strategies
- [ ] Static vs dynamic context separation

### E. Variance and Consistency
- [ ] Implementation patchwork problem (v11)
- [ ] Placement patchwork problem (v12)
- [ ] Variance detection mechanisms
- [ ] Specialist creation triggers and templates
- [ ] Memory evolution to specialist

### F. DRY Enforcement
- [ ] Context-level DRY (v13)
- [ ] Shared utility references
- [ ] Pre-implementation search protocol
- [ ] Extension vs creation decision framework

### G. GitHub Integration
- [ ] Issue tracking and state management
- [ ] PR workflows
- [ ] Activity logging
- [ ] Session-to-issue correlation

### H. Planning Workflow
- [ ] Chain-issue integration
- [ ] File structure planning
- [ ] Bottom-up implementation order
- [ ] Memory-manager post-implementation updates

### I. Session Management
- [ ] File-based session tracking
- [ ] Affected areas derivation
- [ ] Restart triggers and behavior
- [ ] Context window management

### J. Claude-Mem Empowerment Role
- [ ] Observation layer
- [ ] Variance detection
- [ ] Memory validation
- [ ] Update suggestions
- [ ] Adjacency detection
- [ ] Staleness alerts
- [ ] Specialist triggers

### K. Success Metrics
- [ ] Consolidate metrics from all versions
- [ ] Ensure measurable, non-conflicting targets

---

## Output Structure

Create `foreman/revised_integration.md` with this structure:

```markdown
# Foreman + Claude-Mem Revised Integration Specification

## Executive Summary
[Synthesis of the complete vision]

## Part 1: Architecture Overview
### 1.1 Three-Layer Model
### 1.2 Context Loading Model
### 1.3 Hook Architecture

## Part 2: Memory System Integration
### 2.1 Foreman Memory Architecture
### 2.2 Claude-Mem Enhancement Layer
### 2.3 Memory Update Lifecycle

## Part 3: Agent Architecture
### 3.1 General vs Specialist Agents
### 3.2 Lean Hybrid Model
### 3.3 Agent Suggestion Mechanism
### 3.4 Worker Orchestration

## Part 4: Orchestration Patterns
### 4.1 WHAT-not-HOW Pattern
### 4.2 Routing Framework
### 4.3 Cross-Cutting Coordination
### 4.4 Static vs Dynamic Separation

## Part 5: Consistency Guarantees
### 5.1 Implementation Consistency (Patchwork Prevention)
### 5.2 Placement Consistency (What-Goes-Where)
### 5.3 Variance Detection System
### 5.4 Specialist Evolution

## Part 6: DRY Enforcement
### 6.1 Context-Level DRY
### 6.2 Code-Level DRY
### 6.3 Pre-Implementation Search Protocol

## Part 7: GitHub Integration
### 7.1 Issue Lifecycle
### 7.2 PR Workflows
### 7.3 Activity Logging

## Part 8: Planning Workflow Integration
### 8.1 Chain-Issue Integration
### 8.2 File Structure Planning
### 8.3 Memory Update Procedures

## Part 9: Session Management
### 9.1 Session Tracking
### 9.2 Context Window Management
### 9.3 Restart Behavior

## Part 10: Implementation Roadmap
### 10.1 Phase 1: Observation Layer
### 10.2 Phase 2: Validation Layer
### 10.3 Phase 3: Recommendation Layer
### 10.4 Phase 4: Automation

## Part 11: Success Metrics
[Consolidated from all versions]

## Appendices
### A: Version Lineage (What Came From Where)
### B: Context Budget Analysis
### C: Template Library
### D: Decision Trees
```

---

## Important Guidelines

1. **v13 is the foundation** - Its lean hybrid model and "memory as source of truth" principle should be preserved
2. **Don't lose valuable early work** - Earlier versions may have detailed implementation plans, specific APIs, or workflow details that v13 summarized away
3. **Resolve contradictions explicitly** - If v5 says X and v11 says Y, explain why you chose the resolution
4. **Include version lineage** - In Appendix A, note which version each major concept originated from
5. **Be comprehensive but not redundant** - The goal is one authoritative document, not a concatenation

---

## Begin

Start by reading v13 to understand the current architectural foundation, then work backward through each version, building your synthesis notes. Create the revised_integration.md only after reviewing all versions.

Think deeply about what was lost vs what was intentionally superseded. Some earlier content was dropped because it was wrong; other content was dropped because focus shifted. Your job is to recover the latter.
