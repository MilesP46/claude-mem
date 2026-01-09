# Deployment Decision Matrix — Release {{X}} — **Instructions**

- **Purpose:** Reconcile research findings with user's WHERE choice to show HOW to deploy their WHAT capabilities.
- **Context:** Created by chain-prototype-researcher after research, showing research-based options for deploying capabilities to chosen platform.

## How to use

1. **Create this file during chain-prototype-researcher Phase 1** after completing research and scoring.
2. **Read deployment ConceptID** from concept-checklist.md to understand WHERE user wants to deploy.
3. **Read all other ConceptIDs** to understand WHAT capabilities need to be deployed.
4. **Determine optimal WHAT→WHERE mapping**: Where each capability should live for best results.
5. **Create recommended deployment strategy** showing how ALL capabilities get deployed.
6. **Provide full deployment options** that handle all capabilities in complete strategies.
7. **Offer a la carte choices** for individual capability placement control.
8. **Include TOC** for easy navigation of deployment options.
9. **Add comprehensive cost analysis** including platform costs, scaling considerations, and open source alternatives.
10. Fill in all placeholders with optimal capability placement analysis.
11. Keep **structure** and headings unchanged.
12. Save the completed file for user review.

## Hybrid Structure

### Primary: Recommended Deployment Strategy
**Present the top research-based recommendation** for deploying all WHAT capabilities:
- Show how ALL capabilities can live somewhere (primary WHERE or alternative platforms)
- Focus on optimal capability placement based on platform strengths
- Provide clear WHAT→WHERE mapping for the recommended approach

### Secondary: Full vs A La Carte Options
**Present deployment choices**:
- **Full Deployment Options**: Complete strategies that deploy all capabilities
- **A La Carte Capability Placement**: Individual control over where each capability lives
- **Platform-specific solutions**: How capabilities optimally deploy to different WHERE options

## Content Guidelines

**Capability Placement Focus**: Show WHERE each WHAT capability should optimally live
**Solution-Oriented**: All capabilities get deployed somewhere - no capability removal
**Platform Optimization**: Match capabilities to platforms based on strengths and research findings
**Research-Grounded**: Templates/services recommendations based on actual compatibility analysis
**Full Coverage**: Every WHAT capability has a clear WHERE deployment solution
**Flexible Options**: Both complete strategies and individual capability placement choices
**Cost Transparency**: Include cost analysis for all platform and service options
**MVP Cost Focus**: Prioritize minimal cost solutions for MVP phase

## Placeholders

Replace every placeholder of the form `{{…}}` with concrete research findings:

### Basic Placeholders
- `{{X}}` — release number
- `{{Template Name}}` — specific template that works with this option
- `{{Deployment Option}}` — specific platform or service name
- `{{Pros/Cons}}` — specific advantages and disadvantages found during research

### Research-Based Placeholders
- `{{Platform capability}}` — specific WHERE platform capability or limitation
- `{{Capability compatibility}}` — whether WHAT capability can live natively/externally/not at all on WHERE
- `{{Research solution}}` — template/service that enables capability on WHERE platform
- `{{Platform constraints}}` — specific limitations of WHERE platform for this capability
- `{{Alternative WHERE}}` — alternative platforms that better support this capability
- `{{Workaround approach}}` — external services or hybrid solutions for unsupported capabilities
- `{{Deployment feasibility}}` — realistic assessment of deploying this capability to WHERE

## Quality checklist

**Research Integration:**
- [ ] All options based on template research findings
- [ ] Template compatibility clearly specified for each option
- [ ] Deployment context from release specification considered
- [ ] Trade-offs reflect actual research findings

**Decision Readiness:**
- [ ] Complete scenarios ready for single selection
- [ ] A la carte options available for advanced users
- [ ] MVP viability clearly indicated for each approach
- [ ] Open source vs paid service costs properly indicated
- [ ] Service deployment structure documented
- [ ] Template scoring integrated into recommendations
- [ ] All `{{…}}` placeholders resolved

**File Location:**
- [ ] Saved to `foreman/release-{{X}}/docs/00-planning/deployment-decision-matrix.md`
