# Business Rules — Unit 1: MVP Core

## BR-01: Consent Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-01.1 | No evaluative interaction before consent | SessionState.currentPhase must be 'consent' or later |
| BR-01.2 | Consent is binary — affirmative or denied | Parse response for affirmative signals: "sí", "si", "acepto", "de acuerdo", "ok" |
| BR-01.3 | Consent record is immutable | ConsentRecord cannot be modified after creation |
| BR-01.4 | Denied consent ends session without data retention | No candidate profile data stored beyond consent denial record |

## BR-02: Conversation Flow Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-02.1 | Maximum 1 follow-up per competency | `SessionState.followUpAsked` flag — after follow-up, advance to next competency |
| BR-02.2 | 3-5 competency questions per screening | Rubric defines competencies; agent covers all of them |
| BR-02.3 | No time limit on candidate responses | No timeout during active conversation (only re-engagement for inactivity) |
| BR-02.4 | Session context preserved on resume | When candidate resumes after pause, full SessionState + recent messages restored |
| BR-02.5 | Screening completes when all competencies covered | `competenciesCovered.length === rubric.competencies.length` triggers CLOSING phase |

## BR-03: Anti-Hallucination Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-03.1 | Agent confined to campaign knowledge base | System prompt restricts to provided context only |
| BR-03.2 | No salary/benefits/policy speculation | System prompt explicit prohibition + post-processing check |
| BR-03.3 | "No tengo esa información" response for unknown facts | Default fallback in system prompt |
| BR-03.4 | No contractual promises | System prompt prohibition |
| BR-03.5 | Truthful AI identity disclosure | System prompt: always confirm if asked "¿Eres IA?" |

## BR-04: Evaluation Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-04.1 | Every score must have ≥1 verbatim quote | Validation: `evidence.length >= 1` for each CompetencyScore |
| BR-04.2 | Scores range 1-5 only | Schema validation on evaluator output |
| BR-04.3 | Global score is weighted average | `globalScore = Σ(score × weight)` |
| BR-04.4 | Recommendation thresholds are fixed | ≥4.0: highly_recommended, ≥3.0: recommended, <3.0: not_recommended |
| BR-04.5 | Evaluation is generated once per conversation | One evaluation per conversationId. Immutable after generation |
| BR-04.6 | Dual-pass: conversation agent never sees scores | Conversation prompt contains NO scoring instructions |

## BR-05: HITL Review Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-05.1 | No auto-reject or auto-advance | Candidate state stays `pending_review` until human action |
| BR-05.2 | Disagreement reason mandatory when overriding AI | If `decision !== recommendation`, `disagreementReason` is required |
| BR-05.3 | Review decision is final (MVP) | No undo. State transitions: `pending_review → approved` or `pending_review → rejected` |
| BR-05.4 | Only recruiter's own tenant candidates visible | API middleware enforces `tenantId` filter on all queries |

## BR-06: Campaign Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-06.1 | Campaign must have name + role + rubric to activate | Validation on `draft → active` transition |
| BR-06.2 | Inactive campaigns reject new screenings | Bot checks campaign status on new conversation start |
| BR-06.3 | Archived campaigns cannot be reactivated | State machine: `archived` is terminal |
| BR-06.4 | Telegram link format is deterministic | `https://t.me/{BOT_USERNAME}?start={campaignId}` |
| BR-06.5 | Invalid campaign links trigger redirect | Bot responds with career page link or generic message |

## BR-07: Candidate Lifecycle Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-07.1 | Valid state transitions only | State machine enforced in domain layer |
| BR-07.2 | State transitions are: initiated→in_screening→completed→pending_review→approved/rejected | No skipping states |
| BR-07.3 | Candidate data scoped by tenant | `tenantId` in partition key |

**Valid State Transitions**:
```
initiated → in_screening       (consent granted + verification passed)
in_screening → completed       (screening finished)
completed → pending_review     (evaluation generated)
pending_review → approved      (recruiter approves)
pending_review → rejected      (recruiter rejects)
in_screening → abandoned       (72h inactivity — session-level, not candidate-level)
```

## BR-08: Tenant Isolation Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-08.1 | Every document has tenantId | DynamoDB partition key |
| BR-08.2 | Every API request scoped by tenant | Middleware extracts from Cognito JWT `custom:tenantId` |
| BR-08.3 | No cross-tenant data access | All repository methods require `tenantId` parameter |
| BR-08.4 | Telegram conversations derive tenant from campaign | Campaign lookup by campaignId → extract tenantId |

## BR-09: Escalation Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-09.1 | Level 1: log and continue | Increment `SessionState.escalationCount`. Log question |
| BR-09.2 | Level 2: stronger redirect language | At `escalationCount >= 2`, use enhanced response |
| BR-09.3 | All escalated questions logged | AuditEvent with type `escalation_triggered` |

## BR-10: Data Validation Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-10.1 | Campaign name: 1-200 characters | Schema validation |
| BR-10.2 | Rubric competency weights sum to 1.0 | `Σ(weight) = 1.0 ± 0.01` |
| BR-10.3 | Rubric: 3-5 competencies per rubric | Array length validation |
| BR-10.4 | Score criteria: all 5 levels defined | Each competency must have criteria for levels 1-5 |
| BR-10.5 | Review reason: max 1000 characters | String length validation |
