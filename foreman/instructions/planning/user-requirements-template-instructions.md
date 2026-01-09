# User Requirements — Release {{X}} — **Instructions**

- **Purpose:** Identify potential user input needs during development to minimize workflow interruptions.
- **Focus:** Analyze architecture, UX, and UI docs to predict authentication, configuration, business logic, and external dependency needs.

## How to use

1. **Create this file alongside other planning documents** during chain-issue-builder execution.
2. **Review all prescribed reading** (architecture, UX research, UI design, release specs) to identify potential needs.
3. **Categorize requirements** using the 4 categories from chain-issue workflow.
4. **Provide specific guidance** on where users can find or prepare needed information.
5. Fill in all placeholders with concrete, actionable guidance.
6. Keep **structure** and headings unchanged.
7. Commit the completed file to the release docs.

## Analysis Categories

### Authentication & Credentials
**Look for:** API integrations, database connections, third-party services, authentication systems
**Provide:** Specific service names, where credentials are stored, environment variable names, step-by-step credential acquisition instructions

### Environment-Specific Configuration  
**Look for:** External endpoints, deployment environments, service URLs, custom configurations
**Provide:** Specific URLs needed, configuration file locations, environment differences

### Business Logic Clarification
**Look for:** Complex business rules, domain-specific requirements, unclear specifications
**Provide:** Specific decision points that may need clarification during development

### External Dependencies
**Look for:** Third-party services, external APIs, licensing requirements, approval workflows
**Provide:** Specific services, access requirements, approval processes

## Placeholders

Replace every placeholder of the form `{{…}}` with concrete values:

### Basic Placeholders
- `{{X}}` — release number
- `{{YYYY-MM-DD}}` — creation date
- `{{Service Name}}` — specific service or API name
- `{{Credential Location}}` — where credentials are stored (e.g., "1Password vault 'API Keys'")
- `{{Environment Variable}}` — specific env var names (e.g., "STRIPE_API_KEY")

### Content Placeholders
- `{{Specific authentication needs}}` — concrete auth requirements identified
- `{{Key acquisition steps}}` — step-by-step instructions for obtaining API keys/credentials
- `{{Configuration requirements}}` — specific config needs found
- `{{Business logic questions}}` — unclear requirements that may need clarification
- `{{External service dependencies}}` — third-party services requiring access

## Quality checklist

**Template Completion:**
- [ ] All `{{…}}` placeholders resolved with specific guidance
- [ ] Each category contains concrete, actionable information
- [ ] Credential locations specify exact sources (1Password, environment, etc.)
- [ ] Key acquisition steps are detailed and include dashboard navigation
- [ ] Business logic questions are specific and clear

**Analysis Coverage:**
- [ ] All architecture documents reviewed for technical dependencies
- [ ] UX research reviewed for external service integrations  
- [ ] UI design reviewed for authentication and configuration needs
- [ ] Release specifications reviewed for business logic requirements

**File Location:**
- [ ] Saved to `foreman/release-{{X}}/docs/00-planning/user-requirements.md`