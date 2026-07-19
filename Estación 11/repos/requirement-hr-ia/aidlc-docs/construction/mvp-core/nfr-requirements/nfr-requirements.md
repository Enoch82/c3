# NFR Requirements — Unit 1: MVP Core

## 1. Performance

| ID | Requirement | Target | Measurement |
|---|---|---|---|
| PERF-01 | Telegram bot response latency (including OpenAI) | < 10 seconds | End-to-end: message received → response sent |
| PERF-02 | Dashboard page load (server-rendered) | < 3 seconds | Time to First Contentful Paint |
| PERF-03 | Executive summary generation | < 30 seconds | Time from screening completion to summary stored |
| PERF-04 | API endpoint response (CRUD operations) | < 500ms | Server-side processing time |
| PERF-05 | DynamoDB query latency | < 50ms | Single-item read/write |
| PERF-06 | Concurrent Telegram conversations | Up to 50 | Simultaneous active screening sessions |

### Performance Budget (Bot Turn)
```
DynamoDB read (session state):     ~50ms
OpenAI chat completion:            ~3-8s (variable)
DynamoDB writes (state + message): ~50ms
Telegram API send:                 ~100ms
─────────────────────────────────────────
Total budget:                      < 10s
```

---

## 2. Availability & Reliability

| ID | Requirement | Target |
|---|---|---|
| AVAIL-01 | Telegram bot uptime | 99.5% (24/7) |
| AVAIL-02 | Dashboard availability | 99% during business hours (8am-8pm COT) |
| AVAIL-03 | Session state persistence | No data loss on ECS task restart |
| AVAIL-04 | Graceful degradation on OpenAI failure | Retry once (3s delay). If still failing: pause conversation, notify candidate, preserve state |

### Error Handling Strategy

**OpenAI API Failures**:
1. First attempt fails → wait 3 seconds → retry once
2. Retry fails → send candidate: "Estoy teniendo dificultades técnicas. Puedes intentar de nuevo en unos minutos. Tu progreso está guardado."
3. Set conversation state to `paused`
4. Log error with correlation ID to CloudWatch
5. When candidate sends next message → resume normally (system retries OpenAI)

**DynamoDB Failures**:
- Retries handled by AWS SDK (built-in exponential backoff)
- If persistent: return 503 to API, log error
- Telegram bot: same graceful pause pattern as OpenAI

**Telegram API Failures**:
- Retry sending message up to 3 times with 1s delay
- If persistent: log error, message queued in memory (best-effort for MVP)

---

## 3. Scalability

| ID | Requirement | Target |
|---|---|---|
| SCALE-01 | MVP candidate volume | 100-500 candidates over 90 days |
| SCALE-02 | DynamoDB capacity | On-demand (pay-per-request, auto-scales) |
| SCALE-03 | ECS horizontal scaling | Min 1 task, max 3 tasks (CPU-based auto-scaling) |
| SCALE-04 | Multi-tenant data model | Partition key-based isolation (ready for growth) |

### Capacity Estimates (MVP)
- ~5 candidates/day average, peaks of ~20/day
- ~50 messages per screening session (candidate + agent)
- ~250 DynamoDB writes/day, ~500 reads/day
- OpenAI: ~15 API calls per screening (conversation + evaluation)

---

## 4. Security & Compliance

| ID | Requirement | Implementation |
|---|---|---|
| SEC-01 | Authentication | AWS Cognito (OAuth 2.0 / OIDC). JWT validation on every API request |
| SEC-02 | Authorization | Tenant-scoped. `custom:tenantId` in Cognito JWT. Middleware enforces on all endpoints |
| SEC-03 | Data isolation | DynamoDB partition key = `tenantId`. No cross-tenant queries possible |
| SEC-04 | Data in transit | HTTPS/TLS everywhere (ALB terminates TLS, internal traffic within VPC) |
| SEC-05 | Data at rest | DynamoDB encryption at rest (AWS-managed keys, enabled by default) |
| SEC-06 | No biometric data | System never collects facial, voice, or emotional data |
| SEC-07 | No PII beyond professional | Only professional information stored. No government IDs, addresses, etc. |
| SEC-08 | Consent immutability | ConsentRecord cannot be modified after creation |
| SEC-09 | Audit log append-only | AuditEvents table: write-only from application. No delete/update operations |
| SEC-10 | Secrets management | Environment variables via ECS task definition. No hardcoded secrets in code |
| SEC-11 | Telegram webhook validation | Verify webhook requests come from Telegram (token-based validation via grammY) |

---

## 5. Observability

| ID | Requirement | Implementation |
|---|---|---|
| OBS-01 | Structured logging | JSON format: `{ timestamp, level, correlationId, message, context }` |
| OBS-02 | Log levels | INFO + WARN + ERROR (standard) |
| OBS-03 | Log retention | 30 days in CloudWatch |
| OBS-04 | Correlation IDs | Every request gets a unique ID. Propagated through all service calls |
| OBS-05 | Key metrics logged | Screening started/completed, evaluation generated, review decisions, escalations, OpenAI latency, errors |
| OBS-06 | Health check endpoint | `GET /api/health` → returns 200 + DynamoDB connectivity check |
| OBS-07 | CloudWatch alarms | ECS task health, 5xx error rate > 5%, OpenAI error rate > 10% |

### Log Format
```json
{
  "timestamp": "2026-03-15T10:30:00.000Z",
  "level": "INFO",
  "correlationId": "req-abc123",
  "tenantId": "tenant-xyz",
  "service": "conversation",
  "message": "Screening completed",
  "context": {
    "conversationId": "conv-456",
    "candidateId": "cand-789",
    "duration": 1250
  }
}
```

---

## 6. Maintainability

| ID | Requirement | Implementation |
|---|---|---|
| MAINT-01 | Code organization | DDD layered architecture (domain/application/infrastructure) |
| MAINT-02 | Type safety | TypeScript strict mode throughout |
| MAINT-03 | Testing | Unit tests for domain/business rules, integration tests for API routes |
| MAINT-04 | Environment parity | Docker for local dev matches ECS deployment |
| MAINT-05 | IaC | All infrastructure in Terraform (no manual AWS console changes) |
| MAINT-06 | CI/CD | GitHub Actions: lint → test → build → Docker → ECR → ECS deploy |

---

## 7. Usability

| ID | Requirement | Implementation |
|---|---|---|
| UX-01 | Dashboard responsive | Desktop-first, mobile-friendly (Tailwind breakpoints) |
| UX-02 | All UI in Spanish neutro | Labels, messages, validation errors in Spanish |
| UX-03 | Time-to-first-value | < 48 hours from tenant setup to first screening |
| UX-04 | Component library | shadcn/ui for consistent, accessible UI components |
| UX-05 | Loading states | Skeleton loaders for async data, disabled buttons during submission |
| UX-06 | Error feedback | Toast notifications for errors, inline validation for forms |
