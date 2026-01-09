# Granular Change Plan Instructions

Standards for creating detailed, fact-based change plans for specific work items based on impact assessments.

## Purpose

Guide for building actionable, surgical change plans that:
- Document exactly what needs to change
- Verify all information against actual project structure
- Provide guardrails to prevent breaking changes
- Enable precise implementation with confidence

## Document Structure

Each granular change plan must include these sections:

### 1. Work Item Overview

**What this accomplishes:**
- Clear statement of what this work item achieves
- Why it's necessary in the overall change

**Position in sequence:**
- Where it fits in the change execution order
- What happens before and after

**Dependencies:**
- Prerequisites from other work items
- What must be in place before starting
- What depends on this completing

### 2. Areas to Consider

Comprehensive list of all aspects requiring attention:

- **Related systems** - All systems, modules, or components involved
- **Integration points** - Where this work item connects to others
- **Boundaries** - What's in scope vs out of scope
- **Error handling** - Where errors can occur and must be handled
- **Test coverage** - What tests are needed
- **Performance** - Any performance implications
- **Security** - Any security considerations
- **Data flow** - How data moves through the changes

### 3. File-by-File Change Plan

For each file requiring modification:

**File path:** `/exact/path/to/file.ext` (verified to exist)

**Current state:**
- What exists now (based on actual code reading)
- Relevant functions/classes/components
- Line number ranges where applicable

**Required changes:**
- Exactly what needs to change
- Specific functions/classes/components to modify
- Nature of changes (add, modify, remove)

**Why needed:**
- Purpose of this specific change
- How it contributes to work item goal
- Dependencies on other file changes

**Affected areas:**
- Function names
- Class names
- Component names
- Variable/constant names
- Type definitions

### 4. Guardrails

**What must NOT change:**
- Existing functionality to preserve
- Public interfaces to maintain
- Contracts that must stay intact

**Compatibility requirements:**
- Backward compatibility needs
- API version constraints
- Data migration considerations

**Performance constraints:**
- Response time requirements
- Resource usage limits
- Scaling considerations

**Security boundaries:**
- Authentication requirements
- Authorization checks
- Data validation needs

### 5. Dos and Don'ts

**DO:**
- Specific actions to take
- Patterns to follow
- Best practices for this change
- Validation steps to perform

**DON'T:**
- Specific actions to avoid
- Anti-patterns to prevent
- Common mistakes for this type of change
- Shortcuts that create technical debt

## Quality Standards

### 100% Fact-Based

**Requirements:**
- All file paths verified to exist using Glob/Grep/Read
- Current state documented from actual code reading
- No assumptions about code structure
- No invented requirements

**Verification:**
- Use Glob to find files
- Use Grep to search for patterns
- Use Read to examine actual code
- Cross-reference with impact assessment

### No Code Snippets

**Why:** Plans describe changes, not implement them

**Instead of code:**
- Describe what needs to change
- Specify exact locations (file, function, line numbers)
- Explain the nature of changes
- Reference existing patterns in codebase

### Specific and Exact

**File paths:** Absolute paths, verified to exist
**Functions:** Exact names, verified in code
**Line numbers:** Where possible, provide ranges
**Components:** Exact names, verified in code
**Variables:** Exact names where relevant

### Actionable

Plans must enable surgical implementation:
- Clear enough to implement without guesswork
- Specific enough to know exactly what to change
- Complete enough to catch all impacts
- Verified enough to trust

### Complete

All impacts identified and documented:
- All files requiring changes listed
- All integration points noted
- All error cases considered
- All test updates specified

## Verification Requirements

Before finalizing plan, verify:

**File verification:**
- [ ] All file paths exist (Glob verified)
- [ ] Current state documented (Read verified)
- [ ] Functions/classes exist (Grep verified)

**Dependency verification:**
- [ ] Dependencies on prior work items stated
- [ ] Integration points identified
- [ ] Boundary conditions noted

**Test verification:**
- [ ] Test file locations identified
- [ ] Test coverage areas specified
- [ ] Validation approach documented

**Standards verification:**
- [ ] Error handling considerations included
- [ ] Performance implications noted
- [ ] Security considerations addressed
- [ ] Adheres to @rules/development-standards.mdc

**Completeness verification:**
- [ ] All sections complete
- [ ] No placeholders or TODOs
- [ ] Guardrails clearly defined
- [ ] Dos and Don'ts specific to this work item

## Length Guidelines

Per @rules/documentation-rules.mdc:

**Target:** ≤1,000 tokens (Micro-guide)
**Hard cap:** 1,500 tokens
**Action if over:** Focus on specific work item, remove redundancy

**Token estimation:** Word count × 1.3

**Stay focused:**
- This is ONE work item, not the entire change
- Reference other plans for dependencies
- Link to impact assessment, don't repeat it
- Be concise but complete

## Example Structure

```markdown
# [Work Item Name]

## Overview

This work item [accomplishes what]. It is the [Nth] step in the change sequence and [depends on / is independent of] [other items].

## Areas to Consider

- System integration: [specific systems]
- Error handling: [specific error cases]
- Test coverage: [specific test areas]
- Performance: [specific implications]

## File-by-File Plan

### `/path/to/file1.ts`

**Current state:**
Function `handleRequest()` (lines 45-78) currently [does what].

**Required changes:**
Modify `handleRequest()` to [do what instead]. Add parameter [name] to support [requirement].

**Why needed:**
This enables [capability] required by [feature].

**Affected:**
- Function: `handleRequest`
- Type: `RequestOptions` (add field)

### `/path/to/file2.ts`

[Similar structure]

## Guardrails

**Do NOT change:**
- Public API signature of `processData()`
- Existing error codes (maintain backward compatibility)

**Maintain:**
- Response time <200ms
- Existing authentication flow

## Dos and Don'ts

**DO:**
- Validate input using existing `validateSchema()`
- Add comprehensive error handling per development-standards.mdc
- Update unit tests in `__tests__/file1.test.ts`

**DON'T:**
- Skip input validation
- Add new error codes (use existing taxonomy)
- Modify shared types without checking dependents
```

## Integration with Development Standards

All plans must respect @rules/development-standards.mdc:

**Code quality:**
- Plans should lead to DRY implementations
- Single-responsibility per change
- Modular approach

**Documentation:**
- Plans specify where inline comments needed
- Identify functions needing docstrings
- Note header updates required

**Performance:**
- Plans note algorithm complexity implications
- Identify caching opportunities
- Avoid unnecessary dynamic imports

**Error handling:**
- Plans specify boundary validation
- Identify trust boundaries
- Note global handler integration

## Common Pitfalls to Avoid

**Assumptions:**
- Don't assume files exist - verify with Glob
- Don't assume functions exist - verify with Grep/Read
- Don't assume structure - read actual code

**Vagueness:**
- Don't say "update the handler" - specify which handler, which file, what changes
- Don't say "add validation" - specify what to validate, how, where

**Incompleteness:**
- Don't forget test files
- Don't forget error cases
- Don't forget integration points

**Length:**
- Don't exceed 1,500 tokens
- Don't repeat impact assessment
- Don't include code snippets

## Final Checklist

Before writing plan document:

**Content:**
- [ ] All sections complete
- [ ] 100% fact-based (no assumptions)
- [ ] Specific file paths and function names
- [ ] Clear guardrails
- [ ] Actionable dos and don'ts

**Verification:**
- [ ] All files verified to exist
- [ ] Current state from actual code
- [ ] Dependencies documented
- [ ] Test files identified

**Standards:**
- [ ] Adheres to development-standards.mdc
- [ ] No code snippets
- [ ] Length within limits (≤1,500 tokens)
- [ ] Ready for surgical implementation
