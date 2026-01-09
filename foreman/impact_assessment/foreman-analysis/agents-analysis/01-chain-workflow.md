# Chain-Workflow Agents Analysis

## Overview
Chain-* agents are specialized autonomous agents designed for specific phases of the release delivery pipeline. Each agent operates independently within its domain, producing structured outputs that feed into subsequent phases. These agents emphasize quality, completeness, and seamless handoffs.

## Agents Identified
1. chain-prototype-researcher
2. chain-ux-researcher
3. chain-ui-designer
4. chain-system-architect
5. chain-whimsy-injector
6. chain-issue-builder
7. chain-issue-creator
8. chain-issue-updater
9. chain-issue-plan-updater
10. chain-ux-updater
11. chain-ui-updater
12. chain-architecture-updater
13. chain-update-researcher

## Detailed Analysis

### chain-prototype-researcher
- **Purpose:** Research and identify open-source templates, libraries, and services to accelerate development
- **Location:** `/Users/miles/.my_coding/agents/chain-prototype-researcher.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Template research methodology, scoring systems
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Template discovery → Systematic scoring → Recommendations → Optimal combinations for rapid prototyping

### chain-ux-researcher
- **Purpose:** Translate release specifications into UX research deliverables (user flows, personas, wireframes, interaction patterns)
- **Location:** `/Users/miles/.my_coding/agents/chain-ux-researcher.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** UX research methodology, wireframe standards
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Specification analysis → User flows → Personas → Wireframes → Interaction patterns (strictly UX research, no visual design)

### chain-ui-designer
- **Purpose:** Create detailed UI designs and component specifications based on UX research and prototyping decisions
- **Location:** `/Users/miles/.my_coding/agents/chain-ui-designer.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Design system creation, component specification templates
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Transform wireframes → Production-ready design systems with tokens → Component specs → Implementation notes

### chain-system-architect
- **Purpose:** Create technical architecture documentation after UI design and prototyping phases
- **Location:** `/Users/miles/.my_coding/agents/chain-system-architect.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Architecture documentation standards, API design patterns
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Convert technology stack → Comprehensive architecture documentation (API design, database schemas, service integrations, infrastructure plans)

### chain-whimsy-injector
- **Purpose:** Enhance UI/UX with delightful interactions, playful animations, and personality-filled copy during initial research
- **Location:** `/Users/miles/.my_coding/agents/chain-whimsy-injector.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Delight pattern library, micro-interaction guidelines
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Review existing interfaces → Identify opportunities for micro-interactions → Emotional journey improvements → Copy enhancements (transforms functional interfaces into joyful experiences)

### chain-issue-builder
- **Purpose:** Create comprehensive, atomic issue plans for development work (greenfield or existing codebase)
- **Location:** `/Users/miles/.my_coding/agents/chain-issue-builder.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Issue planning methodology, atomic issue breakdown
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Break down complex requirements → Small, sequential issues for TDD/BDD cycles → Issue 001 for fundamentals → Sequence logically to reach MVP quickly

### chain-issue-creator
- **Purpose:** Create GitHub issues from existing issue plans or convert planning documents into trackable issues
- **Location:** `/Users/miles/.my_coding/agents/chain-issue-creator.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** GitHub issue workflow, issue formatting standards
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Read issue-map/ and issue-plan.md → Create properly formatted GitHub issues → Integrate with chain development process

### chain-issue-updater
- **Purpose:** Supporting agent for advanced issue documentation and context optimization
- **Location:** `/Users/miles/.my_coding/agents/chain-issue-updater.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Issue documentation standards, agent-specific pattern documentation
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Document work scope for agents → Add folder scoping for context restriction → Agent-specific pattern documentation

### chain-issue-plan-updater
- **Purpose:** Create or modify issue YAML files and GitHub issues with letter-suffix sequencing for insertions
- **Location:** `/Users/miles/.my_coding/agents/chain-issue-plan-updater.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Issue YAML schema, GitHub issue update patterns
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Handle letter-suffix sequencing (004a) → Create/modify issue YAML files → Update GitHub issues using edit-last-comment for modifications (designed for parallel execution)

### chain-ux-updater
- **Purpose:** Make surgical, seamless updates to existing UX research documentation when plan changes require minimal modifications
- **Location:** `/Users/miles/.my_coding/agents/chain-ux-updater.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Seamless update methodology
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Surgical updates to user flows, personas, wireframes, interaction patterns → Updates appear as if originally written that way (no change references allowed)

### chain-ui-updater
- **Purpose:** Make surgical, seamless updates to existing UI design documentation when plan changes require minimal modifications
- **Location:** `/Users/miles/.my_coding/agents/chain-ui-updater.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Seamless update methodology
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Surgical updates to component specs, design system, config notes → Updates appear as if originally written (no change references)

### chain-architecture-updater
- **Purpose:** Make surgical, seamless updates to existing architecture documentation when plan changes require minimal modifications
- **Location:** `/Users/miles/.my_coding/agents/chain-architecture-updater.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Seamless update methodology
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Surgical updates to API design, database schema, service integration, infrastructure plans → Updates appear as if originally written (no change references)

### chain-update-researcher
- **Purpose:** Conduct targeted research for plan updates on new services/templates/libraries not in original scope
- **Location:** `/Users/miles/.my_coding/agents/chain-update-researcher.md`
- **Rules Referenced:** None explicitly
- **Instructions Referenced:** Update research methodology, focused evaluation criteria
- **Scripts Referenced:** None
- **Tools Used:** All tools (full access)
- **Workflow:** Conduct targeted research based on change requirements → Produce focused update report for user approval → Documentation updates proceed after approval

## Pattern Summary

**Autonomous Operation**: All chain-* agents operate without user prompts, making independent decisions based on analysis and research.

**Full Tool Access**: All agents have access to all tools (no restrictions), enabling comprehensive research and implementation.

**Structured Outputs**: Each agent produces specific deliverables in standardized formats (flows, personas, specs, schemas, issues).

**Sequential Dependencies**: Agents build on prior agents' outputs (ux-researcher → ui-designer → system-architect).

**Quality Focus**: Emphasis on completeness, accuracy, and professional deliverables ready for implementation.

**Research-First Approach**: Multiple agents emphasize thorough research before making recommendations (prototype-researcher, update-researcher).

**Seamless Updates**: Update agents (ux-updater, ui-updater, architecture-updater) make changes that appear original (no change tracking).

**Issue Management Suite**: Multiple agents handle different aspects of issue lifecycle (builder, creator, updater, plan-updater).

**Delight Layer**: chain-whimsy-injector adds personality and joy to functional interfaces (unique in the chain).

**No User Questions**: Agents resolve uncertainties autonomously through research and analysis rather than asking users.
