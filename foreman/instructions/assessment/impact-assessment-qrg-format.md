# Impact Assessment QRG Format

## Single File Format (≤3,000 tokens)

```markdown
> QRG · [Change Name] Impact Assessment
> • Purpose: Comprehensive impact analysis for [change description]
> • Entrypoints: #executive-summary, #impact-map, #detailed-logic-chains
> • Related: [Link to related planning docs if any]
> • Master TOC: [docs/README_TOC.md](../../README_TOC.md)

# Impact Assessment: [Change Description]

[Rest of assessment content...]
```

## Hierarchical Format (>3,000 tokens)

**_index.md as TOC:**
```markdown
> QRG · [Change Name] Impact Assessment
> • Purpose: Comprehensive impact analysis for [change description]
> • Entrypoints: [00-executive-summary.md], [01-impact-map.md], [02-logic-chains.md]
> • Related: [Link to related planning docs if any]
> • Master TOC: [docs/README_TOC.md](../../README_TOC.md)

# Impact Assessment: [Change Description]

## Overview
[Brief 2-3 sentence overview]

## Document Structure
1. [00-executive-summary.md](00-executive-summary.md) - Overview and scope
2. [01-impact-map.md](01-impact-map.md) - Impact areas across layers
3. [02-logic-chains.md](02-logic-chains.md) - Detailed flow analysis
4. [03-execution-plan.md](03-execution-plan.md) - Phased implementation plan
5. [04-risk-testing.md](04-risk-testing.md) - Risk assessment and testing strategy
```

Then create numbered child files with content split logically.

## Agent Findings Numbering

- If main assessment is split (00-04), agent findings start at 05
- If main assessment is single file, agent findings use 01-NN
- Format: `XX-[focus-area]-findings.md`

## Master TOC Entry

```markdown
- [Impact Assessment: [Name]](impact_assessment/[folder]/_index.md)
```
