# Instructions Analysis

## Overview
The foreman instructions system provides detailed behavioral guidance for agents and commands through structured markdown files. Instructions define methodologies, workflows, template usage, and coordination patterns. They serve as the "how-to" layer above rules (which define "what must be true") and below agents/commands (which execute work).

## Categories Identified
1. Planning - Release specification, concept development, issue planning
2. Coordination - Agent orchestration, cross-cutting concerns, execution strategies
3. Assessment - Impact analysis, gap detection, change planning
4. GitHub - Issue workflows, PR processes, label management
5. Agents - Agent-specific methodologies and patterns
6. Templates - Template filling instructions paired with each template

## Detailed Analysis

### Planning Instructions
**Instructions in this category:**
- **concept-checklist-template-instructions.md**: Guides creation of high-level requirements checklist from concept Q&A
- **concept-qa-documentation-template-instructions.md**: Structures iterative Q&A documentation through 5 phases (vision, discovery, refinement, categorization, deployment)
- **release-specification-template-instructions.md**: Defines release specification structure including objectives, scope, architecture, timeline, deployment
- **issue-planning-methodology.md**: Breaks down requirements into atomic, sequential issues for TDD/BDD cycles

**Referenced by:**
- Commands: chain-concept-gen, chain-plan-init, chain-issue-builder
- Agents: chain-issue-builder

### Coordination Instructions
**Instructions in this category:**
- **orchestration-patterns.md**: Defines WHAT-not-HOW pattern, cross-cutting coordination strategies (single coordinator, sequential handoff, parallel independent)
- **agent-scope-impact-matrix.md**: Maps agent expertise, scope, and sequencing dependencies
- **cross-agent-coordination-request-template-instructions.md**: Structures requests for cross-agent impact analysis and coordination
- **impact-change-orchestration.md**: 6-phase workflow for implementing code changes (assessment, gap analysis, dead code, approval, surgical implementation, UI verification)

**Referenced by:**
- Commands: chain-plan-design-green, chain-plan-design-update, impact-change
- Agents: Multiple orchestration contexts

### Assessment Instructions
**Instructions in this category:**
- **impact-assessment-qrg-format.md**: Defines Quick Reference Guide format for assessment documents (summary, impacts, logic chains, execution plan, risks, testing)
- **gap-analysis-checklist.md**: Verification checklist for assessment completeness
- **change-planning-workflow.md**: Fact-based granular change planning methodology
- **duo-creation-strategy.md**: Strategy for creating command-agent duos
- **duo-pattern-extraction.md**: Extracting patterns from existing duos for new creations

**Referenced by:**
- Commands: impact-change, impact-change-review, plan-change, create-project-agent-command-duo
- Agents: impact-assessment, change-plan-builder, command-agent-duo

### GitHub Instructions
**Instructions in this category:**
- **gh-issue-workflow.md**: Complete issue lifecycle (creation, branch management, development, PR, review, merge, documentation)
- **issue-creation-workflow.md**: Creating GitHub issues from plans with proper sequencing
- **issue-documentation-standards.md**: Work scope documentation, folder scoping, agent-specific patterns
- **pr-review-criteria.md**: Review criteria for chore PRs and refactoring detection

**Referenced by:**
- Commands: chain-issue, chain-send-issues, new-issue, review-chore-prs
- Agents: chain-issue-creator, chain-issue-updater, pr-chore-reviewer

### Agent-Specific Instructions
**Instructions in this category:**
- **error-explorer-instructions.md**: Deep logic tracing methodology for root cause identification
- **memory-manager-instructions.md**: Adjacency-oriented CLAUDE.md generation and hierarchy management
- **surgical-fix-methodology.md**: Targeted fix implementation while preserving functionality
- **seamless-update-methodology.md**: Making updates appear as if originally written (no change references)
- **vite-ui-fix-workflow.md**: Iterative UI verification and repair with Playwright
- **test-manager-methodology.md**: Creating intentionally failing tests that define DONE

**Referenced by:**
- Commands: error-explorer, manage-memory, error-fix, chain-plan-design-update, vite-UI-fix, chain-issue
- Agents: error-explorer, memory-manager, surgical-fixes, chain-ux-updater, chain-ui-updater, chain-architecture-updater, vite-frontend-fix, test-manager

### Template Instructions
**Instructions in this category:**
Each template has a paired instruction file providing section-by-section guidance:
- **release-specification-template-instructions.md**: Guides completion of release spec template
- **issue-plan-template-instructions.md**: Structures issue planning document
- **cross-agent-coordination-request-template-instructions.md**: Fills coordination request template
- **api-design-template-instructions.md**: Structures API design documentation
- **database-schema-template-instructions.md**: Guides database schema documentation
- Plus 20+ template-instruction pairs for UX, UI, architecture, coordination

**Referenced by:**
- Commands: chain-plan-init, chain-plan-design-green, update-plans
- Agents: chain-ux-researcher, chain-ui-designer, chain-system-architect, chain-architecture-updater

## Pattern Summary

**Template-Instruction Pairing**: Every template has a corresponding instruction file providing detailed section guidance and placeholder definitions.

**Methodology vs Mechanics**: Instructions define "how to do" work (methodology), while templates define "what structure" to produce (mechanics).

**Reusability Across Contexts**: Same instructions referenced by multiple commands and agents (impact-change-orchestration used by 3+ commands).

**Progressive Disclosure**: Instructions support both quick-start and comprehensive guidance depending on agent/command needs.

**Consistency Enforcement**: Instructions ensure consistent interpretation of requirements across different agents/sessions.

**Quality Gates**: Instructions embed approval gates, verification steps, and completion criteria.

**Context-Aware Guidance**: Instructions adapt based on greenfield vs brownfield, simple vs complex, single-area vs multi-area contexts.

**Integration Points**: Instructions coordinate between layers (rules → instructions → agents → templates → output).
