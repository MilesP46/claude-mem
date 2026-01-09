# Chain-Issue Command Analysis

## Arguments & Context Passing

**Argument**: Single positional `$1` = GitHub issue number

**Context Flow**:
- Issue number is the reference point throughout workflow
- Context retrieved FROM GitHub (GH CLI/MCP), NOT from files initially
- Explicit: "DO NOT work from issue-plan.md directly, all work must be done based on actual GH issues"
- `chain-issue-updater` creates detailed comments on GitHub that serve as context for subsequent agents
- Context passed via: GitHub issue comments, direct issue number references, scoped parameters

## Workflow Steps

1. **Review issue** using GH MCP/CLI
2. **Branch management**: Create tag `gh-issue-<N>-start`, branch `issue<N>-tdd`, update labels
3. **Iterative agent execution**:
   - 3.1: Pre-agent context via chain-issue-updater + test-manager
   - 3.2: Worker orchestration coordination
   - 3.3: Launch current agent with plan reference
   - 3.4: Handle blocking issues via troubleshooting-investigator
   - 3.5: Scan for NOT_IMPLEMENTED, TODO/FIXME markers
   - 3.6: Resolve type errors
   - 3.7: Proceed to next agent
4. **Post-agent**: Update label to `review`, update issue-XXX.yaml with PR details
5. **ReviewerPR agent** for PR review
6. **User testing validation**
7. **Merge pull request**
8. **Documentation-Updater + Memory-Manager** (parallel)
9. **Log completion**

## Agent Invocation Pattern

**Two-Tier System**:
- **Planning agents** (first): chain-issue-updater, test-manager
- **Execution agents** (per issue sequence): backend-architect, frontend-developer, ai-engineer (may orchestrate workers)
- **Worker agents**: backend-worker, frontend-worker, ai-technician
- **Post-implementation**: troubleshooting-investigator, reviewpr-agent, documentation-updater, memory-manager

**Launch mechanism**: Direct invocation with parameters (issue number, agent type, scope, context refs)

## GitHub Integration

- GitHub issue is SOURCE OF TRUTH
- Comments used for: agent plans, test specs, completion reports, worker scopes, validation templates
- Label management: `todo` → `in-progress` → `review` → `done`
- `phase:dev` label gates build test creation
- PR linked to issue, reviewed by ReviewerPR agent

## Dynamic Behavior

- Multi-agent workflows create branch; updater-only stays on main
- `phase:dev` prevents build test creation
- Worker orchestration auto-analyzes scope if none predefined
- Blocking issues detected → troubleshooting-investigator → re-launch original agent
- User input gated for: credentials, env config, ambiguous logic, external deps
