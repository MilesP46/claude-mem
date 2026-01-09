# Extraction Scripts

Python utilities for extracting XML observations from Claude Code session transcripts.

## Purpose

Extract structured XML blocks (observations, summaries, facts) from JSONL transcript files stored by Claude Code sessions. Used for historical memory import and analysis.

## Key Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `filter-actual-xml.py` | Extract real XML from assistant responses only; filters templates | `actual_xml_only_with_timestamps.xml` |
| `extract-all-xml.py` | Extract ALL XML blocks without filtering; for debugging | `all_xml_fragments_with_timestamps.xml` |

**Recommended for import:** `filter-actual-xml.py`

## Usage

```bash
# Extract filtered XML (recommended)
python3 scripts/extraction/filter-actual-xml.py

# Then import to database
npm run import:xml
```

## Implementation Patterns

**XML Tag Detection:** Regex patterns for claude-mem XML elements:
- `<observation>`, `<session_summary>`, `<summary>`
- `<facts>`, `<concepts>`, `<files_read>`, `<files_edited>`
- `<narrative>`, `<learned>`, `<completed>`, `<next_steps>`

**Template Filtering:** `filter-actual-xml.py` excludes example XML using pattern detection:
- Placeholder patterns: `[...]`, `{...}`, `**field**:`
- Template filenames: `file1.ts`, `file2.ts`
- Example phrases: "Concise, self-contained statement"

**Source Role Filtering:** Only processes `role: 'assistant'` messages, excluding user prompts and tool inputs.

## Data Flow

```
~/.claude/projects/.../*.jsonl (transcripts)
    |
    v
extraction/filter-actual-xml.py
    |
    v
~/Scripts/claude-mem/actual_xml_only_with_timestamps.xml
    |
    v
npm run import:xml (separate import script)
```

## Invariants

- Output XML includes block numbers and UTC timestamps as comments
- Hardcoded transcript path: `~/.claude/projects/-Users-alexnewman-Scripts-claude-mem/`
- Processes 62 most recent transcript files (sorted by modification time)
