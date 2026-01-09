# Prototyping Recommendation Report — Phase 3 (Release {{X}})

**Save to (final):** `{{FOREMAN_ROOT}}/release-{{X}}/docs/00-planning/release{{X}}-recommendation-report.md`  
**Authored by:** prototyping-agent  
**Mode:** {{greenfield|brownfield}}  
**Date:** {{date}}  
**References (read-only):** release spec → `{{FOREMAN_ROOT}}/docs/00-planning/release-{{X}}/release{{X}}-specification.md`

> **Note:** This is a narrative report for decision-making. It **does not** store raw scores or logs. Phase 1/2 outputs remain in `release-{{X}}/research/`.

---

## 1) Executive Summary

- **Objective:** {{one-paragraph on what we’re building and why now}}
- **Recommendation:** {{template-only | mixed | api/service-only}}
- **Composite Fit Score (CFS):** {{value}}
- **Key drivers:** {{speed-to-demo | risk constraints | compatibility | licensing}}
- **Decision context:** {{greenfield|brownfield}} with constraints {{budget|data locality|license|hosting|offline}}.

---

## 2) Actionable Implementation Plan

> Clearly delineate what is **reused** vs **built** so downstream agents can act without re-reading raw logs.

### 2.1 Templated Items (to reuse)

- {{Template Name}} — provides {{capabilities}} — initial integration tasks: {{list}}
- {{Template Name}} — …

### 2.2 From‑Scratch Items (to build)

- **Capability:** {{name}} — **owner:** {{agent/team}} — **acceptance:** {{criteria}}
- **Capability:** {{name}} — …

### 2.3 Sequencing & Milestones

| Milestone          |   Target | Scope                            | Exit Criteria                      |
| ------------------ | -------: | -------------------------------- | ---------------------------------- |
| M0: Scaffolding    | {{date}} | repo init, env, templates landed | app boots locally; tests run       |
| M1: Core Demo      | {{date}} | must‑have flows wired            | demo script passes end‑to‑end      |
| M2: Risk Burn‑down | {{date}} | security, perf, data             | gates met (SP/MH); perf budgets OK |
| M3: Pilot Ready    | {{date}} | polish, docs                     | user‑journey happy‑path validated  |

### 2.4 Dependencies & Interfaces

- **External APIs/Services:** {{list + contract summary}}
- **Internal service boundaries:** {{modules, microservices, adapters, events}}
- **Data model notes:** {{pivotal entities, migrations, compat strategy}}

---

## 3) Context & Assumptions

- **Must‑haves:** {{list}}
- **Nice‑to‑haves:** {{list}}
- **Constraints:** {{license, hosting, budget, data‑locality, offline, security posture}}
- **Assumptions:** {{e.g., team skill set, runtime preferences, infra availability}}

### 3.1 Greenfield Notes (fill only if mode = greenfield)

- **Starting point:** No existing code/memories; clean scaffolding.
- **Preferred app template(s):** {{list}} — rationale: {{why}}
- **Expected coverage:** {{RC/NIC overview in plain language}}
- **Bootstrapping moves:** {{which template(s) + minimal glue code}}
- **Greenfield risks:** {{learning curve, integration gaps, timebox}} → **Mitigations:** {{list}}

### 3.2 Brownfield Notes (fill only if mode = brownfield)

- **Existing state:** repo {{url}}, languages {{list}}, CLAUDE.md: {{present|missing}}
- **Compat targets:** {{frameworks, DBs, auth, hosting}}
- **Refactor/upgrade approach:** {{strangler, module extraction, adapter pattern, gradual migration}}
- **Brownfield risks:** {{regressions, lock‑in, license conflicts}} → **Mitigations:** {{list}}

---

## 4) Gate Checks & Rationale (Synthesis Only)

> Summarize whether recommended plan meets gates. Do **not** paste raw metrics; reference the research set instead.

| Gate                         | Pass?         | Why it passes / Mitigation if not |
| ---------------------------- | ------------- | --------------------------------- |
| Integration Effort (IE ≥ 70) | {{pass/fail}} | {{plain-language reasoning}}      |
| Maintenance Health (MH ≥ 60) | {{pass/fail}} | {{reasoning}}                     |
| Security Posture (SP ≥ 70)   | {{pass/fail}} | {{reasoning}}                     |
| License Fit (LC ≥ 80)        | {{pass/fail}} | {{reasoning}}                     |

**Chosen plan type:** {{template-only | mixed | api/service-only}}  
**Rationale (1–2 paragraphs):**

> {{Explain tradeoffs: speed vs. compatibility vs. risk; call out mode-specific reasoning.}}

---

## 5) Validation, KPIs & Acceptance

- **Functional acceptance:** {{BDD highlights / must‑have scenarios}}
- **Non‑functional budgets:** perf {{p95, tti}}, security {{min bar}}, reliability {{SLO}}
- **Success metrics (KPIs):** {{time‑to‑demo, feature coverage %, test coverage %, defects}}
- **Exit criteria for Phase 3:** {{checklist}}

---

## 6) Risks & Mitigations

- {{risk}} → {{mitigation}}
- {{risk}} → {{mitigation}}

---

## 7) Appendices (Shortlists Only — no raw logs)

### 7.1 Top Template Candidates (shortlist)

| Name         | Why it’s attractive | Key tradeoffs |
| ------------ | ------------------- | ------------- |
| {{template}} | {{strengths}}       | {{tradeoffs}} |

### 7.2 Top API Libraries (shortlist)

| Name    | Why it’s attractive | Key tradeoffs |
| ------- | ------------------- | ------------- |
| {{api}} | {{strengths}}       | {{tradeoffs}} |

### 7.3 Top Services (shortlist)

| Name        | Why it's attractive | Key tradeoffs |
| ----------- | ------------------- | ------------- |
| {{service}} | {{strengths}}       | {{tradeoffs}} |

---

## 8) Deployment Setup Guide

**Based on user selections from deployment-decision-matrix.md**

### 8.1 Platform Setup Steps

**Primary Platform: {{chosen platform name}}**

**CLI Setup (if applicable):**

```bash
# Initial platform setup
{{platform-specific setup commands}}

# Environment configuration
{{environment variables and configuration}}

# Authentication setup
{{authentication and access configuration}}
```

**SaaS Dashboard Configuration (if applicable):**

1. **Account Setup:**
   - {{Navigate to platform URL and signup/login process}}
   - {{Account verification and initial setup requirements}}

2. **Project Creation:**
   - {{Step-by-step dashboard navigation for creating new project}}
   - {{Required project settings and configuration options}}

3. **Deployment Configuration:**
   - {{How to configure deployment settings in the web interface}}
   - {{Environment variables setup through dashboard}}
   - {{Build and deployment pipeline configuration}}

4. **Domain & SSL Setup:**
   - {{Custom domain configuration steps}}
   - {{SSL certificate setup process}}

**Key Configuration Files:**

```yaml
# {{platform}}-config.yml
{{platform configuration yaml}}
```

### 8.2 Secondary Platform Setup (if applicable)

**Secondary Platform: {{secondary platform name}}**

**CLI Setup:**

```bash
# Secondary platform setup
{{secondary platform setup commands}}

# Cross-platform networking
{{networking configuration between platforms}}
```

**SaaS Dashboard Configuration:**

1. **Platform-Specific Setup:**
   - {{Dashboard navigation and setup process}}
   - {{Integration with primary platform configuration}}

2. **Cross-Platform Integration:**
   - {{How to configure communication between platforms}}
   - {{Shared environment variables and secrets management}}
   - {{API endpoints and service discovery configuration}}

### 8.3 External Service Configuration

**{{External service name}}:**

**Programmatic Setup:**

```bash
# Service setup commands
{{external service setup}}

# Integration configuration
{{service integration steps}}
```

**SaaS Service Setup (if applicable):**

1. **Service Account Creation:**
   - {{External service signup and account verification}}
   - {{Plan selection and billing configuration}}

2. **Service Configuration:**
   - {{Dashboard navigation for service setup}}
   - {{API key generation and management}}
   - {{Service-specific settings and configuration}}

3. **Integration Setup:**
   - {{How to integrate with chosen deployment platforms}}
   - {{Webhook configuration and event handling}}
   - {{Security and authentication setup}}

**Service Configuration:**

```yaml
# {{service-name}}-config.yml
{{service configuration yaml}}
```

### 8.4 Integration & Connectivity

**Environment Variables Setup:**

**CLI Configuration:**

```bash
# Primary platform environment
{{PRIMARY_PLATFORM_VARS}}

# Secondary platform environment (if applicable)
{{SECONDARY_PLATFORM_VARS}}

# External service credentials
{{EXTERNAL_SERVICE_VARS}}
```

**SaaS Platform Environment Configuration:**

1. **Primary Platform Dashboard:**
   - {{How to navigate to environment variables section}}
   - {{Adding and managing environment variables through web interface}}
   - {{Secret management and security configuration}}

2. **Secondary Platform Dashboard (if applicable):**
   - {{Environment variable synchronization between platforms}}
   - {{Shared secrets and cross-platform configuration}}

3. **External Service Integration:**
   - {{How to configure API keys and credentials in each platform's dashboard}}
   - {{Webhook URLs and callback configuration}}
   - {{Service-to-service authentication setup}}

**Networking & Security:**

```yaml
# network-config.yml
{{networking configuration}}
```

**SaaS-Specific Security Configuration:**

1. **Access Control:**
   - {{Platform-specific access control and permission setup}}
   - {{Team member access and role configuration}}

2. **Domain & SSL:**
   - {{Custom domain setup across platforms}}
   - {{SSL certificate management and renewal}}

**Validation Steps:**

**CLI Testing:**

```bash
# Test platform connectivity
{{connectivity test commands}}

# Verify service integration
{{integration verification commands}}
```

**Dashboard Validation:**

1. **Deployment Verification:**
   - {{How to check deployment status in each platform's dashboard}}
   - {{Monitoring and logging access through web interfaces}}

2. **Service Health Checks:**
   - {{Platform-specific health monitoring and alerts setup}}
   - {{Integration testing through dashboard tools}}
