# Agent Template 

Template for creating project-level agents. Replace placeholders with actual values from PATH, CONTEXT, and GIT arguments.

Based on [Anthropic Subagent Documentation](https://docs.claude.com/en/docs/agent-sdk/subagents#creating-subagents)

## Structure

```markdown
---
name: [agent-name]
description: [CONTEXT-based description, under 1024 characters]
allowed-tools: [appropriate tools based on task]
model: sonnet
---

# [Agent Title from CONTEXT]

[1-2 sentence introduction explaining what this agent does, using CONTEXT]

## Execution Process

### Step 1: [First Step Name]

[Instructions for first step, incorporating PATH]

**Actions:**
1. Find files in [PATH] using Glob: `**/[PATH]/**/*.ext`
2. [Action from extracted pattern or design, achieving CONTEXT]
3. [Validation or verification step]

### Step 2: [Second Step Name]

[Instructions for second step]

For each file in [PATH]:
1. [Read/analyze action]
2. [Transform/validate action achieving CONTEXT goal]
3. [Report or document result]

### Step 3: [Third Step Name]

[Instructions for third step]

[Additional steps as needed for workflow]

[IF GIT ENABLED:]

### Step N: Git Integration

[Instructions for git workflow from GIT argument]

After [triggering event]:
```bash
git add [PATH]/[file]
git commit -m "[message format from GIT]"
```

## Tool Usage

- **Tool1**: [Purpose for this agent]
- **Tool2**: [Purpose for this agent]
- **Tool3**: [Purpose for this agent]

## Guidelines

**DO:**
- [Guideline from extraction or design, adapted for PATH/CONTEXT]
- [Guideline specific to this agent's purpose]
- [Validation or quality requirement]
- Work only with files in [PATH]
- Achieve [CONTEXT] for each file

**DON'T:**
- [Constraint from extraction or design]
- [Constraint specific to this agent]
- [Anti-pattern to avoid]
- Work outside of [PATH]
- Skip [critical step]

[IF GIT ENABLED:]

## Git Integration

### When to Commit
[Timing from GIT argument]

### Message Format
`[Format from GIT argument]`

### Commands
```bash
[Specific git commands from GIT argument]
```
```

## Placeholders to Replace

**[agent-name]:** Lowercase-with-hyphens name derived from CONTEXT
**[CONTEXT-based description]:** Short description from CONTEXT, <1024 chars
**[appropriate tools]:** Tools needed for task (Read, Write, Edit, Glob, Grep, Bash)
**[Agent Title from CONTEXT]:** Human-readable title from CONTEXT
**[1-2 sentence introduction]:** Brief intro using CONTEXT
**[PATH]:** Actual path argument (e.g., "src/api", "components/")
**[CONTEXT]:** Actual context argument (e.g., "validate API responses")
**[GIT]:** Git workflow instructions if provided

## Size Guidelines

**Simple agents:** <250 lines
**Standard agents:** <300 lines
**Hard limit:** Never exceed 300 lines

Apply:
- Progressive disclosure
- One example per concept
- Concise language
- No redundancy

## Examples

### PATH Incorporation
```
❌ Generic: Find files using Glob
✓ Specific: Find files in src/api using Glob: **/src/api/**/*.ts
```

### CONTEXT Incorporation
```
❌ Generic: Process each file
✓ Specific: Validate API response schemas for each file
```

### GIT Incorporation
```
❌ Generic: Commit changes
✓ Specific: After validating each file, commit with format "Validate: [filename]"
```
