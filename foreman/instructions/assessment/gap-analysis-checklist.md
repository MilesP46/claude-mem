# Gap Analysis Checklist

## Completeness Verification

**Check for:**
- [ ] All direct impacts identified
- [ ] Indirect/downstream impacts traced
- [ ] Test files all identified
- [ ] Error handling considerations included
- [ ] Backend/frontend split clear
- [ ] Dependencies and sequencing explicit
- [ ] Complete logic chains (no missing steps)
- [ ] Risk assessment thorough
- [ ] Rollback plan present

## Common Gaps

- Missing error handling in logic chains
- Unidentified test files
- Incomplete dependency chains
- Missing edge case considerations
- Unclear sequencing between backend/frontend
- Missing configuration file updates
- Unidentified integration points

## Gap Verification Process

1. **Verify It's a True Gap**
   - Use Grep to search for related code
   - Use Glob to find related files
   - Use Read to verify missing items exist
   - Don't invent requirements - respect existing infrastructure

2. **Determine If It Needs Addition**
   - Is this actually impacted by the change?
   - Does this really need to be in the plan?
   - Is this already covered elsewhere in the document?

## Gap Filling Guidelines

**Make Minimal, Natural Edits:**
- Add to appropriate section
- Match existing writing style
- Use same formatting and structure
- Make it seamless (as if always there)

**Don't Over-Edit:**
- Don't rewrite entire sections
- Don't add unnecessary detail
- Don't change tone or style
- Keep additions focused and minimal

## Common Gap Fill Examples

**Missing error handling:**
```markdown
Add to logic chain:
"Step X: Add try-catch for [operation]
- Handle [error type] by [action]"
```

**Missing test file:**
```markdown
Add to Test Impacts:
"- path/to/missing.test.ts - [what needs testing]"
```

**Missing dependency:**
```markdown
Add to Dependencies section:
"- [Component X] depends on [Component Y] completing first"
```
