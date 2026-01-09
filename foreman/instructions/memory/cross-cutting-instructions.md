# Cross-Cutting CLAUDE.md Generation

**Philosophy:** Adjacent to code, NOT in root. Imported by areas that depend on them.

**Content Approach:** Summarize patterns, don't enumerate every instance. Focus on essential guidance (3-5 key items per section).

---

## Templates by Type

### API Contracts (`docs/api/CLAUDE.md`)

```markdown
# API Contracts

## Overview
- {STYLE} (REST/GraphQL/gRPC)
- {VERSIONING}
- {LOCATION}

## Standards
- {REQ_RES_FORMAT}
- {ERROR_STRUCTURE}
- {AUTH}
- {PAGINATION}

## Breaking Changes
- {DEFINITION}
- {DEPRECATION}

## Validation
- {TOOLS}

## Do / Don't
- {ANTI_PATTERNS}
```

### Security (`docs/security/CLAUDE.md`)

```markdown
# Security

## Authentication
- {MECHANISM}
- {TOKEN_LIFECYCLE}

## Authorization
- {MODEL}
- {PATTERNS}

## Input Validation
- {LIBRARY}
- {SANITIZATION}

## Secrets
- See `SECRETS.md`
- {ROTATION}

## Headers
- {CORS}
- {CSP}

## Audit
- {WHAT_TO_LOG}
- {RETENTION}

## Do / Don't
- {ANTI_PATTERNS}
```

### Observability (`docs/ops/CLAUDE.md`)

```markdown
# Observability

## Logging
- {LIBRARY}
- {FORMAT}
- {LEVELS}
- {FIELDS}

## Metrics
- {LIBRARY}
- {NAMING}
- {COMMON_METRICS}

## Tracing
- {LIBRARY}
- {PROPAGATION}

## Dashboards
- {LOCATIONS}

## Alerts
- {THRESHOLDS}

## Do / Don't
- {ANTI_PATTERNS}
```

### CI/CD (`.github/CLAUDE.md`)

```markdown
# CI/CD

## Pipeline
- {PLATFORM}
- {STAGES}
- {TRIGGERS}

## Build
- {STEPS}
- {ARTIFACTS}

## Testing
- {STAGES}
- {COVERAGE}

## Deployment
- {ENVIRONMENTS}
- {STRATEGY}
- {ROLLBACK}

## Secrets
- {MANAGEMENT}

## Do / Don't
- {ANTI_PATTERNS}
```

### Database (`db/CLAUDE.md`)

```markdown
# Database

## Schema
- {TYPE}
- {ORM}
- {LOCATION}

## Migration
- {TOOL}
- {WORKFLOW}
- {ROLLBACK}

## Access
- {QUERY_PATTERNS}
- {POOLING}
- {TRANSACTIONS}

## Indexes
- {KEY_INDEXES}

## Integrity
- {FK_STRATEGY}
- {CONSTRAINTS}

## Backup
- {SCHEDULE}
- {RECOVERY}

## Do / Don't
- {ANTI_PATTERNS}
```

---

## Detection

Scan for:
- Security: Auth code, security packages
- API: OpenAPI/Swagger, GraphQL schemas
- DB: Connection code, migrations, ORM
- Observability: Logging/metrics/tracing libs
- CI/CD: .github/workflows, .gitlab-ci.yml

## Generation

1. Select template variant
2. Extract project-specific content (summarize patterns, not exhaustive lists)
3. Remove inapplicable sections
4. Keep essential only (3-5 key items per section)
5. Ensure provider-agnostic (secrets)
6. Size ≤150 lines regardless of depth; if exceeded, condense first, then split

## Validation

- [ ] Adjacent to code
- [ ] Not imported by root
- [ ] Size ≤150
- [ ] Project-specific
- [ ] No secrets
- [ ] Provider-agnostic