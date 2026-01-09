# Scripts Analysis

## Overview
The foreman scripts system provides utility functionality for activity logging, terminal handoffs, file synchronization, and workflow automation. Scripts serve as the executable glue between commands, agents, and the broader development environment.

## Categories Identified
1. Activity Logging - Progress tracking and audit trails
2. Terminal Management - CLI handoffs and session control
3. File Synchronization - Distributing agents/commands across projects
4. Project Management - Foreman installation and template management
5. Document Conversion - Markdown to PDF generation
6. Code Analysis - Scoring and validation utilities
7. Utility Validation - DRY enforcement checking

## Detailed Analysis

### Activity Logging
**Scripts in this category:**
- **log-activity**: Core logging script for tracking agent/command progress
  - Format: `log-activity release <id> [sprint <id>] agent <name> "message"`
  - Writes to structured log files for progress tracking and audit
  - Supports release-level and sprint-level logging
  - Timestamped entries with agent/command attribution

**Referenced by:**
- Commands: All chain-* commands, issue management commands
- Agents: backend-architect, frontend-developer, ai-engineer, workers, test-manager, framework-manager, pipeline-manager, troubleshooting-investigator, fix-issue, backend-architecture-analyzer, frontend-component-analyzer, reviewerpr, github-issue-creator

### Terminal Management
**Scripts in this category:**
- **handoff-claude**: Orchestrates CLI handoffs between commands
  - Format: `handoff-claude "/next-command" --app iterm --cwd /project/root`
  - Launches new terminal session with specified command
  - Preserves working directory context
  - Supports multiple terminal applications (iTerm, Terminal.app)

- **exit-shell**: Clean session termination
  - Signals completion of command execution
  - Prepares environment for handoff

**Referenced by:**
- Commands: chain-concept-gen, chain-plan-init, chain-plan-design-green, chain-send-issues (all chain-* orchestration)
- Agents: None (command-level only)

### File Synchronization
**Scripts in this category:**
- **send-agents**: Synchronizes agents from foreman to target projects
  - Discovers all agent files in source
  - Copies to target project's `.my_coding/agents/` directory
  - Maintains directory structure
  - Overwrites existing agents with latest versions

- **send-commands**: Synchronizes commands from foreman to target projects
  - Discovers all command files in source
  - Copies to target project's `.my_coding/commands/` directory
  - Maintains directory structure
  - Overwrites existing commands

- **memory-update**: Synchronizes CLAUDE.md memory files
  - Updates memory files across project hierarchy
  - Maintains consistency with latest patterns
  - Triggers after memory-manager agent execution

**Referenced by:**
- Commands: Project setup workflows, foreman distribution
- Agents: memory-manager (triggers memory-update)

### Project Management
**Scripts in this category:**
- **foreman-update**: Updates foreman system itself
  - Pulls latest foreman changes
  - Rebuilds documentation
  - Synchronizes templates and patterns
  - Self-update mechanism

- **foreman-templates**: Template management
  - Subcommands: install, update, list
  - Installs template sets into project
  - Updates existing templates
  - Lists available templates

**Referenced by:**
- Commands: chain-concept-gen (uses foreman-templates install)
- Agents: None (setup/maintenance only)

### Document Conversion
**Scripts in this category:**
- **md-to-pdf**: Converts markdown documents to PDF
  - Preserves formatting and structure
  - Handles code blocks, tables, diagrams
  - Professional output for documentation distribution
  - Batch conversion support

**Referenced by:**
- Commands: Documentation export workflows
- Agents: None (utility function)

### Code Analysis
**Scripts in this category:**
- **score-candidate**: Evaluates code quality and patterns
  - Analyzes code against standards
  - Produces quality scores
  - Identifies improvement opportunities
  - Used in code review workflows

- **score-composition**: Evaluates architectural composition
  - Analyzes module organization
  - Checks separation of concerns
  - Validates dependency graphs
  - Identifies architectural smells

**Referenced by:**
- Commands: Code review and quality workflows
- Agents: Potentially used by architecture analyzers

### Utility Validation
**Scripts in this category:**
- **shared-util-check**: DRY enforcement validator
  - Scans codebase for duplicate utility functions
  - Identifies candidates for shared utilities
  - Reports on DRY violations
  - Supports refactoring prioritization

**Referenced by:**
- Commands: Code quality audits
- Agents: Potentially used by code-restructurer

## Pattern Summary

**Ubiquitous Logging**: `log-activity` is the most widely used script, appearing in 15+ agents and commands for progress tracking.

**Chain Orchestration**: Terminal management scripts (`handoff-claude`, `exit-shell`) enable the chain-* command pattern for sequential workflow handoffs.

**Synchronization Layer**: File sync scripts (`send-agents`, `send-commands`, `memory-update`) distribute foreman patterns across projects.

**Self-Updating System**: `foreman-update` enables the foreman system to evolve and propagate changes.

**Quality Enforcement**: Analysis scripts (`score-candidate`, `score-composition`, `shared-util-check`) provide automated quality checks.

**Template Management**: `foreman-templates` script enables template-driven development with reusable patterns.

**Cross-Platform Support**: Terminal management scripts adapt to different terminal applications (iTerm, Terminal.app, etc.).

**Structured Output**: All scripts produce structured, parseable output for integration with other tools.

**Audit Trail**: Activity logging provides complete audit trail of agent/command execution history.

**DRY Philosophy**: Scripts themselves follow DRY principle - shared utilities used across all commands/agents rather than duplication.
