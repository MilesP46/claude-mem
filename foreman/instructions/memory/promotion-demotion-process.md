# Promotion/Demotion Process

**Concept:** File management for size limits, NOT import graphs.

---

## When to Promote

**See thresholds in rule file.**

Promote when:
- Parent approaching depth-scaled size limit AND content already condensed (see Size Management)
- Subdir meets depth-scaled adjacency heuristics (see rule file for thresholds by nesting level)
- Subdir represents logical unit with clear boundaries

---

## Promotion Steps

1. **Create** `child/CLAUDE.md`
2. **Move** subdir-specific content from parent → child (patterns, API, rules, do/don't)
3. **Add** to parent's `## Documented Subdirectories`:
   ```markdown
   - Auth: `./auth/` (see CLAUDE.md) - Authentication logic
   ```
4. **Remove** from parent's "Other:" list if previously there
5. **Update** parent - remove child-scoped details
6. **Set** child's `## Dependencies` - list cross-cutting CLAUDE.md files it needs (using `@path` syntax)
7. **Verify** parent has NO `@` reference for child

**Result:** Parent leaner; child loads on-demand via traversal.

---

## When to Demote

**See thresholds in rule file.**

Demote when:
- Child < depth-scaled adjacency thresholds
- Parent has room under its depth-scaled limit
- Avoiding fragmentation

---

## Demotion Steps

1. **Review** child for essential content (apply "summarize, don't enumerate")
2. **Fold** into parent sections (keep only essential items, 3-5 key points)
3. **Remove** from parent's `## Documented Subdirectories` list
4. **Add** to parent's "Other:" if subdir still notable (brief inline note)
5. **Delete** `child/CLAUDE.md`
6. **Update** parent dependencies if child had unique imports
7. **Verify** parent remains within depth-scaled size limit after folding

**Result:** Fewer files; parent within depth-scaled limits (condense if needed).

---

## Size Management

**Approaching depth-scaled size limit:**
1. **Calculate nesting level** from project root to determine appropriate limit
2. **First: Condense content** - Check if following "summarize, don't enumerate" (see rule file)
   - Are you listing every item instead of describing patterns?
   - Can API section show 3-5 key exports instead of exhaustive catalog?
   - Are sections essential or can some be removed?
   - Focus content appropriately for depth (architectural vs API-card style)
3. **Then: Promote subdirs** (if condensing isn't enough AND subdirs exist)
   - Identify substantial subdirs meeting depth-scaled thresholds
   - Check depth-scaled adjacency heuristics
   - Promote best candidates
   - Parent drops within depth-scaled limit
4. **If no subdirs exist** (leaf directory) - Content MUST be condensed to fit depth-scaled limit

**Prevent over-fragmentation:** Keep trivial subdirs in parent.

---

## Examples

### Promotion

**Before (Parent):**
```markdown
## Documented Subdirectories
**Other:** auth/ (authentication), routes/ (endpoints), middleware/ (request processing), utils/ (helpers)
```
Parent: 145 lines (substantial content for auth, routes)

**After:**
```markdown
## Documented Subdirectories
- Auth: `./auth/` (see CLAUDE.md) - Authentication logic
- Routes: `./routes/` (see CLAUDE.md) - API endpoints

**Other:** middleware/ (request processing), utils/ (helpers)
```
Parent: 95 lines; auth/CLAUDE.md: 90 lines; routes/CLAUDE.md: 110 lines

### Demotion

**Before (Parent):**
```markdown
## Documented Subdirectories
- Old Feature: `./old-feature/` (see CLAUDE.md) - Legacy code
```
Parent: 110 lines; old-feature/CLAUDE.md: 45 lines (shrunk)

**After:**
```markdown
## Documented Subdirectories
**Other:** old-feature/ (legacy helper functions)
```
Parent: 135 lines (folded content); old-feature/CLAUDE.md: Deleted

### Multi-Subdir Structure

**Typical services/api/:**
```markdown
## Documented Subdirectories
- Routes: `./routes/` (see CLAUDE.md) - HTTP route handlers
- Middleware: `./middleware/` (see CLAUDE.md) - Request/response processing
- Services: `./services/` (see CLAUDE.md) - Business logic layer

**Other:** validators/ (input validation), types/ (TypeScript types), utils/ (helpers), constants/ (config values)
```
Promoted: 3 subdirs (meet thresholds)  
Inline: 4 subdirs (below thresholds but worth noting)

---

## Validation

**After promotion:**
- [ ] Child created with condensed, essential content
- [ ] Content moved (summarized, not duplicated verbatim)
- [ ] Parent lists in Documented Subdirectories with path (plain text)
- [ ] Removed from "Other:" if was there
- [ ] Parent has NO `@` reference for child
- [ ] Child has `## Dependencies`
- [ ] Sizes: parent and child within depth-scaled limits appropriate to their nesting levels
- [ ] Both follow "summarize, don't enumerate" principle

**After demotion:**
- [ ] Essential content identified (not exhaustive)
- [ ] Content folded with 3-5 key points only
- [ ] Entry removed from Documented Subdirectories list
- [ ] Added to "Other:" if still notable
- [ ] Child deleted
- [ ] Parent within depth-scaled size limit (condensed if needed)

**Documented Subdirectories structure:**
- [ ] Part 1: Subdirs with CLAUDE.md (bulleted list with paths)
- [ ] Part 2: "Other:" notable subdirs without CLAUDE.md (inline, brief)
- [ ] NO `@` syntax anywhere