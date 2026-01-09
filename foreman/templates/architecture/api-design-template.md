# API Design — Architecture (Release {{X}})

> **Sources:** Prototyping selection (`templates.yaml`, `apis.yaml`, `services.yaml`, recommendation report) and UI‑Designer `component-specs.md`.  
> **Scope:** Define the **backend–frontend contract** and internal service boundaries. No UI decisions; no new features.

---

## 0) Summary & Inputs

- **Base URL(s):** `{{https://api.example.com}}` (per environment)
- **API Style:** {{REST / GraphQL / gRPC}} (justify based on composition)
- **Auth:** {{OAuth2 / OIDC / API key / session}}; scopes: {{...}}
- **Versioning:** {{URI `/v1` | header `Accept: application/vnd.app.v1+json` | GraphQL deprecation policy}}
- **Performance budgets:** P95 {{< 300ms}} for P0 endpoints; payload {{< 100KB}} typical.
- **NFRs:** {{latency, availability, throughput}} aligned with product SLOs.

---

## 1) Resource Inventory (derived from CBOM & flows)

| Resource  | Description        | Owner Service | IDs         | Relationships       | Notes |
| --------- | ------------------ | ------------- | ----------- | ------------------- | ----- |
| {{users}} | {{Account holder}} | {{core}}      | {{user_id}} | {{1‑N with orders}} | {{…}} |

---

## 2) REST Endpoints (or GraphQL Schema)

> Duplicate the block for each operation. Keep request/response minimal and stable.

### Operation: {{Create Order}} — `POST /v1/orders`

**Supports Concepts:** [{CONCEPT_IDS}] <!-- e.g., [CONCEPT-012, CONCEPT-015] -->
**Auth/Scopes:** `order:write`  
**Idempotency:** `Idempotency-Key` required; 24h window  
**Request (JSON Schema, 2020‑12):**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["items", "currency"],
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["sku", "qty"],
        "properties": {
          "sku": { "type": "string" },
          "qty": { "type": "integer", "minimum": 1 }
        }
      }
    },
    "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "note": { "type": "string", "maxLength": 280 }
  },
  "additionalProperties": false
}
```

**Response 201:**

```json
{ "orderId": "01J6Z8…", "status": "PENDING", "total": 1299, "currency": "USD" }
```

**Errors:**

- `400_invalid_request` — {{reason}}
- `409_conflict` — duplicate idempotency key
- `429_rate_limited` — retry‑after seconds

**Example (cURL):**

```bash
curl -X POST "$BASE_URL/v1/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: {{uuidv7}}" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"SKU-1","qty":1}],"currency":"USD"}'
```

---

### Pagination & Filtering (standard)

- **Pagination:** `?page[size]=25&page[after]=cursor` (RFC 5988 links).
- **Filtering:** `?filter[status]=PAID&filter[createdAt][gte]=...`
- **Sorting:** `?sort=-createdAt`
- **Field selection:** `?fields[orders]=orderId,status,total`

### Error Envelope (standardized)

```json
{
  "error": {
    "code": "400_invalid_request",
    "message": "…",
    "details": [{ "path": "/items/0/qty", "msg": "must be ≥ 1" }],
    "requestId": "…"
  }
}
```

### Webhooks / Events (if applicable)

| Event           | When         | Payload summary | Delivery     | Retries             | Signature     |
| --------------- | ------------ | --------------- | ------------ | ------------------- | ------------- |
| `order.created` | After create | {{fields}}      | HTTPS + HMAC | exponential backoff | `X-Signature` |

### GraphQL (if chosen)

```graphql
type Order {
  id: ID!
  status: OrderStatus!
  total: Int!
  currency: String!
}
type Mutation {
  createOrder(input: CreateOrderInput!): Order!
}
type Query {
  orders(after: String, first: Int): OrderConnection!
}
```

---

## 3) Security

- **AuthN/Z:** scopes per operation; least privilege.
- **Input validation:** JSON Schema or server validators.
- **Rate limits:** tiered per token/client; global and per‑route.
- **Data protection:** PII minimization; redact in logs.
- **Audit trail:** write to append‑only log.

---

## 4) Contract Testing & Mocking

- **Consumer tests:** UI uses contract tests (e.g., Pact).
- **Mock server:** generate from OpenAPI/GraphQL; seeded fixtures.
- **Backward compatibility:** never break GA fields; deprecate with schedule.

---

## 5) Open Questions & Assumptions

- [ ] {{Question tied to epic or component}}
- [ ] {{Assumption with owner & due date}}
