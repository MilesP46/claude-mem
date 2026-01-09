# Cross-Agent Coordination Request Template Instructions

## Purpose

This template is used by the **chain-plan-design-green orchestrator** when absolute uncertainty exists about cross-agent coordination decisions that could significantly impact project success. It provides a structured format for seeking user guidance during Step 5a of the design phase orchestration.

## When to Use This Template

### Trigger Condition
**ONLY** use this template when you encounter **absolute uncertainty** about coordination decisions that could significantly impact project success.

### Uncertainty Assessment Criteria

Apply **weighted consideration** using this decision matrix:

#### HIGH WEIGHT (Likely requires user input)
- Conflicting architectural decisions that affect core functionality
- Security/authentication approach contradictions with business requirements  
- Performance vs. user experience trade-offs without clear project guidance
- Technology stack conflicts that impact deployment or maintenance

#### MEDIUM WEIGHT (Consider context)
- UI/UX pattern conflicts between agents
- Database design decisions affecting multiple features
- Integration approach disagreements
- State management strategy conflicts

#### LOW WEIGHT (Handle autonomously)
- Minor styling or component naming decisions
- Implementation detail variations
- Non-critical feature prioritization
- Documentation format preferences

## How to Use This Template

### Pre-Template Analysis
Before using this template, you must have:

1. **Read All Decisions**: Complete `@foreman/release-{{X}}/coordination/decision-log.md`
2. **Analyzed Cross-Impacts**: Used `@foreman/instructions/coordination/agent-scope-impact-matrix.md`
3. **Identified Conflicts**: Found genuinely conflicting decisions that affect project success
4. **Applied Weight Assessment**: Determined the conflict meets HIGH or significant MEDIUM weight criteria
5. **Reviewed Project Context**: Read the concept-checklist and release specification to identify relevant CONCEPT IDs and Epics affected by the conflict

### Template Completion Guidelines

#### Context Section
- **Conflict Description**: Brief, factual description of the conflicting decisions
- **Agent Names**: List the specific agents whose decisions conflict
- **Decision Conflicts**: Quote or summarize the conflicting decisions from the decision log
- **Relevant CONCEPT IDs**: Identify which CONCEPT IDs from the concept-checklist are affected by this conflict
- **Related Epics**: List the Epics from the release specification that this decision impacts

#### Project Impact Section  
- **Impact Analysis**: Explain how this uncertainty affects release goals, user experience, or technical implementation
- **Affected Areas**: List specific areas of the project that will be impacted by the decision

#### Options Development
Always provide **2-3 specific solutions** with:

1. **Approach**: Clear description of the solution
2. **Pros**: 2-3 key advantages relevant to project goals
3. **Cons**: 2-3 key drawbacks or risks
4. **Impact on**: Which agents/documents will need updates

#### Recommendation Guidelines
- Always provide your preferred option with clear rationale
- Base recommendations on:
  - Project context and constraints
  - Release specification requirements and related Epics
  - CONCEPT ID fulfillment from concept-checklist
  - Technical feasibility
  - User needs and business goals
  - Industry best practices
- Include explicit alignment analysis showing how your recommendation supports the affected CONCEPT IDs and Epic requirements

### Template Variables

Replace these variables when completing the template:

- `{{RELEASE_NUMBER}}`: The current release number (e.g., "R1", "R2")
- `{{TIMESTAMP}}`: Current date and time in "YYYY-MM-DD HH:MM" format
- `{{CONFLICT_DESCRIPTION}}`: Brief factual description of the conflict
- `{{AGENT_NAMES}}`: Comma-separated list of conflicting agents
- `{{DECISION_CONFLICTS}}`: Summary of the conflicting decisions
- `{{CONCEPT_IDS}}`: Relevant CONCEPT IDs from concept-checklist affected by this conflict
- `{{RELATED_EPICS}}`: Epics from release specification impacted by this decision
- `{{IMPACT_ANALYSIS}}`: Analysis of how this affects the project
- `{{AFFECTED_AREA_X}}`: Specific project areas that will be impacted
- `{{OPTION_X_NAME}}`: Short name for each option (e.g., "Email-Based Auth")
- `{{OPTION_X_DESCRIPTION}}`: Detailed approach description
- `{{OPTION_X_PRO_X}}`: Specific advantages
- `{{OPTION_X_CON_X}}`: Specific disadvantages  
- `{{OPTION_X_AGENT_IMPACTS}}`: Which agents need updates
- `{{RECOMMENDED_OPTION}}`: Your preferred option (A, B, or C)
- `{{RECOMMENDATION_RATIONALE}}`: Brief reason for recommendation
- `{{DETAILED_REASONING}}`: Expanded reasoning with context
- `{{CONCEPT_ALIGNMENT}}`: How the recommendation aligns with affected CONCEPT IDs
- `{{EPIC_ALIGNMENT}}`: How the recommendation supports related Epic requirements

## Quality Standards

### Must Include
- Clear conflict explanation with specific agent references
- Relevant CONCEPT IDs and related Epics from project context
- Concrete impact analysis tied to project goals
- 2-3 well-developed options with balanced pros/cons
- Specific recommendation with solid rationale and alignment analysis
- Clear next steps for implementation

### Must Avoid
- Vague or generic conflicts
- Options without clear implementation details
- Biased pros/cons that favor one option
- Recommendations without supporting logic
- Analysis paralysis - stick to 2-3 options maximum

## Integration with Workflow

### Pre-Request
1. Complete uncertainty assessment using weighted criteria
2. Gather all relevant decision log entries
3. Analyze cross-impacts using scope impact matrix
4. Develop specific options with implementation details

### Post-Request
1. **Wait for user response** in format: `COORDINATION DECISION: [Option/Alternative]`
2. **Update coordination instructions** to incorporate user decision
3. **Document the decision** in the decision log with "User-Guided Coordination" notation
4. **Continue Step 5** agent dispatch with clarified approach

### File Location
Save completed requests to: `@foreman/release-{{X}}/coordination/coordination-request-{{TIMESTAMP}}.md`

## Critical Success Factors

1. **Judicious Use**: Only use for HIGH weight conflicts or significant MEDIUM weight conflicts with clear project impact
2. **Solution-Oriented**: Always provide actionable options, never just present problems
3. **Context-Rich**: Include enough background for informed decision-making
4. **Recommendation**: Always provide your professional assessment
5. **Integration**: Seamlessly continue workflow after receiving guidance

This template ensures that user feedback requests are structured, contextual, and solution-oriented while maintaining workflow efficiency.
