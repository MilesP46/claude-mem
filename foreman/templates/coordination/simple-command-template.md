# Simple Command Template

Template for creating simple commands that launch a single agent. Replace placeholders with actual values from PATH, CONTEXT, and GIT arguments.

Based on [Anthropic Slash-Command Documentation](https://docs.claude.com/en/docs/agent-sdk/slash-commands#common-slash-commands)

## Structure

```markdown
---
description: [CONTEXT-based description, concise]
argument-hint: [If command accepts runtime arguments]
allowed-tools: Task, Read, Bash
model: sonnet
---

# [Command Name from CONTEXT]

[1-2 sentence introduction explaining what this command does]

## Execution

Launch [agent-name]:

```
You are working with files in [PATH].

Your task: [CONTEXT]

[IF GIT ENABLED:]
Git workflow:
- [When to commit from GIT]
- [Message format from GIT]

Proceed.
```

Monitor completion and report results.

## Guidelines

**DO:**
- Pass complete context to agent
- Report results clearly
- [Additional guideline if needed]

**DON'T:**
- Omit required information
- [Additional constraint if needed]
```

## Placeholders to Replace

**[CONTEXT-based description]:** Short description from CONTEXT
**[argument-hint]:** If command accepts arguments, describe them (otherwise omit this line)
**[Command Name from CONTEXT]:** Human-readable command name
**[1-2 sentence introduction]:** Brief intro explaining command purpose
**[agent-name]:** Name of agent this command launches
**[PATH]:** Actual path argument
**[CONTEXT]:** Actual context argument
**[GIT]:** Git workflow instructions if provided

## Size Guidelines

**Target:** <250 lines
**Maximum:** 250 lines

Apply:
- Clear phases if needed
- Concise agent prompts
- Essential guidelines only

## Examples

### Simple Command Example

```markdown
---
description: Validates API response schemas in src/api directory
allowed-tools: Task
model: claude-sonnet-4-5-20250929
---

# Validate API Responses

Validates API response schemas in the src/api directory to ensure compliance with defined contracts.

## Execution

Launch api-response-validator:

```
You are working with files in src/api.

Your task: validate API response schemas

Git workflow:
- Commit after each file validated
- Message format: "Validate: [filename]"

Proceed.
```

Monitor completion and report results.

## Guidelines

**DO:**
- Pass complete context to agent
- Report results clearly

**DON'T:**
- Omit required information
```

### Command Without Git

```markdown
---
description: Formats TypeScript files in components directory
allowed-tools: Task
model: claude-sonnet-4-5-20250929
---

# Format Components

Formats TypeScript files in the components directory according to project style guidelines.

## Execution

Launch typescript-formatter:

```
You are working with files in components/.

Your task: format TypeScript files according to project style guidelines

Proceed.
```

Monitor completion and report results.

## Guidelines

**DO:**
- Pass complete context to agent
- Report results clearly

**DON'T:**
- Omit required information
```

## Prompt Structure

The agent prompt should include:
1. **Path context:** "You are working with files in [PATH]"
2. **Task:** "Your task: [CONTEXT]"
3. **Git workflow (if enabled):** When and how to commit
4. **Instruction:** "Proceed."

Keep prompt concise and clear.
