# GitHub Issue Work Templates

## Templates

### Plan Template Structure

```markdown
## 🤖 Agent Work Plan - [Agent Name]

- **Started**: [Date/Time]

### Overview

[Brief description of the approach and strategy for addressing this issue]

### Implementation Plan

- [ ] **Task 1**: [Clear, actionable description]
  - [ ] Subtask 1.1: [Specific implementation detail]
  - [ ] Subtask 1.2: [Specific implementation detail]
- [ ] **Task 2**: [Clear, actionable description]
  - [ ] Subtask 2.1: [Specific implementation detail]
  - [ ] Subtask 2.2: [Specific implementation detail]

_[Add additional tasks/subtasks as needed]_

### Implementation Items

#### Create

- [ ] [Component/Feature/Module]: [Purpose and key functionality]
- [ ] [Configuration/Setup]: [What needs to be configured or initialized]
- [ ] [Helper/Utility]: [Supporting functionality needed]

#### Modify (if any)

- [ ] [Existing Component/Feature]: [Changes needed and rationale]
- [ ] [Configuration/Settings]: [Updates required]
- [ ] [Integration Points]: [How existing code needs to be adapted]

#### Remove (if any)

- [ ] [Obsolete Component/Feature]: [What to remove and why]
- [ ] [Deprecated Functionality]: [Cleanup requirements]

#### Supporting Items (if any)

- [ ] [Helper Functions/Utils]: [Shared functionality needed]

### Testing Requirements (Added by Test Manager)

**Draft PR**: #[PR_NUMBER] (labeled `tdd:red`)

#### Test Files This Agent Must Satisfy

- [ ] `features/critical/[feature-slug].feature` - [Main scenario description]
- [ ] `spec/integration/[area]/[component]_spec.rb` - [Integration scope]
- [ ] `spec/unit/[area]/[component]_spec.rb` - [Unit test scope]

#### Testing Notes

- **RED**: All tests above currently FAIL (NotImplemented)
- **GREEN**: [Specific implementation focus areas]
- **Dependencies**: [External mocks/stubs needed]

### Dependencies

- [ ] **Style Guide**: [Reference relevant coding standards/style guides to follow]
- [ ] [Any external dependencies or requirements]
- [ ] [Prerequisites that must be completed first]

### Notes

[Any additional context, assumptions, or considerations]

---

_This plan will be updated as work progresses. Completed items will be checked off in real-time._
```

### Agent Specific Work Competion Comment Structure

```markdown
## ✅ [Agent Name] Work Completed

- **Finished**: [Date/Time]

### Changes Made:

- **[File]**: [Brief description of specific changes]
- **[File]**: [Brief description of specific changes]

### Deliverables:

- [List of key deliverables completed]
```

### Agent Cycle Competion Comment for PR Structure

```markdown
## Summary

Resolves Issue #$1

[Brief description of changes]

## Changes Made

- [List of specific changes]

## Testing

- [How the changes were tested]
- [Whether all tests are passing]
- [Whether any and all behavior validation was completed]

## Checklist

- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] No regressions introduced
```

### Agent Specific Testing Structure Template

```markdown
---
# [Agent's Name That Will Use Tests (not test-manager)]

## 🧪 Testing Requirements - Added by Test Manager

**Draft PR**: #[PR_NUMBER] (labeled `tdd:red`)

### Test Files This Agent Must Satisfy
- [ ] `features/critical/[feature-slug].feature` - [Main scenario description]
- [ ] `spec/integration/[area]/[component]_spec.rb` - [Integration scope]
- [ ] `spec/unit/[area]/[component]_spec.rb` - [Unit test scope]

### Testing Notes
- **RED**: All tests above currently FAIL (NotImplemented)
- **GREEN**: [Specific implementation focus areas]
- **Dependencies**: [External mocks/stubs needed]

---
```

_Note: Duplicate the Agent Specific Testing Structure into the same comment for multiple agents_

### User Testing Validation Template

**Usage:** Post this comment after ReviewerPR agent completion but before merge. Used to provide user testing opportunities to verify work completion.

```markdown
## 🧪 Ready for User Testing - Implementation Validation Required

**Status**: Implementation completed, ready for user validation
**Next**: User testing required before merge approval

---

### 📋 Implementation Summary

#### Changes Made:
- **[File/Component]**: [Brief description of specific changes made]
- **[File/Component]**: [Brief description of specific changes made]
- **[File/Component]**: [Brief description of specific changes made]

#### Key Functionality Implemented:
- [Primary feature/capability added]
- [Secondary feature/capability added]
- [Integration points or architectural decisions]

#### Dependencies Added/Updated:
- **New packages**: [List new packages with versions]
- **Configuration changes**: [Environment variables, config files modified]
- **Database changes**: [Migrations, schema updates, new tables/columns]

#### Visual Documentation:
*Include relevant diagrams to illustrate the implementation (reference @foreman/rules/diagram-standard.mdc):*

**Architecture Diagrams** (if applicable):
[Insert diagram showing component relationships, data flow, system interactions]

**User Flow Diagrams** (if applicable):
[Insert diagram showing frontend navigation paths, user interaction sequences]

**API Flow Diagrams** (if applicable):
[Insert diagram showing request/response patterns, endpoint relationships]

**Database Schema Diagrams** (if applicable):
[Insert diagram showing entity relationships, table structures]

---

### 🔬 Testing Instructions

**CRITICAL**: Please test the following scenarios to validate the implementation before merge.

#### Command-Line Testing

# [Specific test commands to run]
# Expected: [What success should look like]

# Example:
npm run test:integration
# Expected: All tests pass with green checkmarks

[Additional specific commands for this implementation]


#### Frontend Testing (if applicable)

1. Navigate to: [specific URL or page]
2. Perform action: [specific user interaction] 
3. Expected result: [what user should see/experience]
4. Validation: [how to confirm feature works correctly]

Browser Testing Checklist:
- [ ] Chrome (desktop)
- [ ] Firefox (desktop) 
- [ ] Safari (if macOS)
- [ ] Mobile responsiveness
- [ ] Key interactions: [clicks, forms, navigation]


#### Integration Testing


1. [End-to-end workflow testing steps]
2. [API endpoint testing with sample requests]
3. [Database connectivity and data flow validation]

Example API Testing:
curl -X POST [endpoint] -d '[sample data]'
# Expected response: [expected JSON/response format]


---

### 🚨 Troubleshooting Guide

**If you encounter any issues during testing:**

#### Common Issues & Solutions:
- **Error: [Specific error message]** → [Solution steps]
- **Issue: [Behavior not working]** → [Resolution approach]
- **Problem: [Performance/UI issue]** → [Fix instructions]

#### If Issues Persist:
1. **Document the issue**: Describe what you tried and what failed
2. **Tag for investigation**: Comment with `@troubleshooting-investigator` to launch diagnostic workflow
3. **Include details**: Error messages, screenshots, browser/environment info

#### Getting Additional Help:
- [Reference documentation links]
- [Configuration guides updated]
- [Contact information if applicable]

---

### ✅ Validation Checklist

Please confirm the following before approving merge:

- [ ] **Command-line tests**: All specified tests pass successfully
- [ ] **Frontend functionality**: User interactions work as expected  
- [ ] **Integration flows**: End-to-end workflows complete successfully
- [ ] **Error handling**: Edge cases and error scenarios handled appropriately
- [ ] **Performance**: No significant performance regressions observed
- [ ] **Code quality**: Implementation follows project standards and conventions

### 🔄 Next Steps

**If testing passes**: Comment "✅ User testing validated" to proceed with merge  
**If issues found**: Tag `@troubleshooting-investigator` with specific details  

---

*User testing validation ensures quality delivery and reduces post-merge issues.*
```

## Guidelines for Agents

### 1. Initial Comment

- **Post immediately** when starting work on an issue
- Use clear, specific task descriptions
- Break down complex tasks into subtasks
- Include realistic time estimates

### 2. Task Structure

- **Main tasks** should be high-level work items
- **Subtasks** should be specific, actionable steps
- Each item should be completable and verifiable
- Use present tense, action-oriented language

### 3. Task Examples

#### Good Task Examples:

- [ ] **Set up project structure**: Create directory layout and configuration files
- [ ] **Implement user authentication**: Add login/logout functionality with JWT tokens
- [ ] **Create API endpoints**: Build REST endpoints for user management
- [ ] **Add unit tests**: Write comprehensive test coverage for new features
- [ ] **Update documentation**: Add API docs and usage examples

_This plan will be updated as work progresses. Completed items will be checked off in real-time._

```

```
