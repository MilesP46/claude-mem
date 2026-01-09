# Agent-Command Creation Standards

Standards for creating project-level agents and commands with proper sizing, structure, and best practices.

## Size Constraints

### Agents

**Simple agents:** <250 lines
**Standard agents:** <300 lines
**Hard limit:** No agent should exceed 300 lines

### Commands

**Simple command (1 agent):** <250 lines
**Orchestrating command (2-3 agents, sequential):** 350-450 lines
**Parallel command (multi-instance):** 350-450 lines
**Complex orchestrating (3+ agents, mixed):** up to 500 lines

## Best Practices

### Progressive Disclosure
- Front-load essential information
- Move details to later sections
- Load content in stages: metadata → instructions → resources

### Concise Writing
- One example per concept
- No redundant sections
- Clear, direct language
- Remove unnecessary explanations

### Structure
- Clear phase/step organization
- Explicit dependencies
- Minimal nesting

## Argument Incorporation

### PATH (Directory/Area)

**In agents:**
- File patterns: `**/[PATH]/**/*.ext`
- Directory refs: "in [PATH]", "Work with [PATH]"
- Scope: "only [PATH]", "files in [PATH]"
- Examples: Use actual path

**In commands:**
- Pass to agent in prompt
- Use in usage examples

### CONTEXT (What to Achieve)

**In agents:**
- Description field
- Responsibilities/purpose statements
- Workflow goal descriptions
- Process explanations

**In commands:**
- Description field
- Pass to agent as task
- Report in results

### GIT (Workflow if Enabled)

**In agents:**
- Dedicated "Git Integration" section
- When to commit (timing)
- Message format
- Specific git commands

**In commands:**
- Pass to agent in prompt
- Note in reporting

## Frontmatter Requirements

### Agent Frontmatter

```yaml
---
name: [agent-name]
description: [CONTEXT-based, <1024 chars]
allowed-tools: [appropriate tools]
model: claude-sonnet-4-5-20250929
---
```

### Command Frontmatter

```yaml
---
description: [CONTEXT-based, concise]
argument-hint: [If accepts arguments]
allowed-tools: [appropriate tools]
model: claude-sonnet-4-5-20250929
---
```

## Naming Conventions

**Format:** lowercase-with-hyphens
**Length:** Max 64 characters
**Clarity:** Descriptive and clear
**Conflicts:** Check for existing files

**Orchestrating commands:** Reflect orchestration in name
- Examples: "analyze-fix-issue", "assess-implement-change"

## Verification Checklist

### PATH Incorporated
- [ ] In file patterns
- [ ] In directory references
- [ ] In scope/validation
- [ ] In examples
- [ ] No `[PATH]` placeholders remain

### CONTEXT Incorporated
- [ ] In descriptions
- [ ] In responsibilities
- [ ] In workflow
- [ ] Passed from command to agent(s)
- [ ] No `[CONTEXT]` placeholders remain

### GIT Incorporated (if enabled)
- [ ] Git Integration section added
- [ ] Timing specified
- [ ] Message format specified
- [ ] Passed to agent(s)
- [ ] No `[GIT]` placeholders remain

### Size Constraints
- [ ] Each agent <300 lines
- [ ] Command within appropriate limit for type
- [ ] No redundancy
- [ ] Concise language

### Best Practices
- [ ] Progressive disclosure applied
- [ ] Clear instructions
- [ ] Proper frontmatter
- [ ] No generic placeholders remain

## Tool Selection

### Common Agent Tools
- **Read**: Reading file contents
- **Write**: Creating new files
- **Edit**: Modifying existing files
- **Glob**: Finding files by pattern
- **Grep**: Searching file contents
- **Bash**: Running commands (git, build, test)

### Command Tools
- **Task**: Launching agents
- **Read**: Reading assessment docs, configs
- **Write**: Creating assessment/report docs
- **Bash**: Running verification commands

## Error Handling

**Agents should:**
- Validate inputs before processing
- Report errors clearly
- Provide actionable feedback
- Continue when possible

**Commands should:**
- Handle agent failures gracefully
- Report failures to user
- Don't proceed if critical step fails
- Offer guidance on resolution
