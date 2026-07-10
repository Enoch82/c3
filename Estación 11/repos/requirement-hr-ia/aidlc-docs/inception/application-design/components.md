# Components — EntreVista AI

## Architecture Style
- **Pattern**: Domain-Driven Design (DDD) layered architecture
- **Structure**: `src/domain/`, `src/application/`, `src/infrastructure/`
- **Framework**: Next.js 16 modular monolith

## Layer Organization

```
src/
├── domain/                    # Business logic — pure, no framework dependencies
│   ├── conversation/          # Screening conversation aggregate
│   ├── evaluation/            # Rubrics, scoring, summaries
│   ├── campaign/              # Campaign configuration
│   ├── candidate/             # Candidate lifecycle
│   └── compliance/            # Consent, audit events
│
├── application/               # Use cases — orchestration, no UI/infra
│   ├── conversation/          # Conversation use cases
│   ├── evaluation/            # Evaluation use cases
│   ├── campaign/              # Campaign use cases
│   ├── candidate/             # Candidate use cases
│   └── compliance/            # Compliance use cases
│
├── infrastructure/            # External integrations — framework-dependent
│   ├── telegram/              # grammY bot, webhook handler
│   ├── openai/                # OpenAI chat + embeddings client
│   ├── dynamodb/              # DynamoDB repositories
│   ├── auth/                  # NextAuth.js / Cognito adapter
│   ├── logging/               # Structured logging
│   └── knowledge-base/        # Document processing + retrieval
│
├── app/                       # Next.js App Router — UI + API routes
│   ├── api/
│   │   ├── telegram/          # Webhook endpoint
│   │   ├── campaigns/         # Campaign CRUD
│   │   ├── candidates/        # Candidate queries
│   │   ├── evaluations/       # Evaluation queries
│   │   └── auth/              # NextAuth routes
│   ├── (dashboard)/           # Route group for recruiter UI
│   │   ├── campaigns/
│   │   ├── review/
│   │   ├── candidates/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
│
└── shared/                    # Cross-cutting types, utils, constants
    ├── types/
    ├── utils/
    └── constants/
```

---

## Component Definitions

### C1: Conversation Domain

| Attribute | Detail |
|---|---|
| **Name** | `domain/conversation` |
| **Purpose** | Model the screening conversation lifecycle and state machine |
| **Responsibilities** | Define conversation entity, session states, message handling rules, re-engagement rules, escalation levels |
| **Key Entities** | `Conversation`, `Message`, `ConversationState`, `EscalationRequest` |
| **Dependencies** | None (pure domain) |

### C2: Evaluation Domain

| Attribute | Detail |
|---|---|
| **Name** | `domain/evaluation` |
| **Purpose** | Model rubrics, competency scoring, and executive summary generation |
| **Responsibilities** | Define rubric structure, scoring criteria, evidence linkage rules, summary format, recommendation levels |
| **Key Entities** | `Rubric`, `Competency`, `Score`, `Evidence`, `ExecutiveSummary`, `Recommendation` |
| **Dependencies** | None (pure domain) |

### C3: Campaign Domain

| Attribute | Detail |
|---|---|
| **Name** | `domain/campaign` |
| **Purpose** | Model campaign configuration and lifecycle |
| **Responsibilities** | Define campaign entity, states (active/inactive/archived), Telegram link generation rules, knowledge base association |
| **Key Entities** | `Campaign`, `CampaignStatus`, `CampaignConfig` |
| **Dependencies** | None (pure domain) |

### C4: Candidate Domain

| Attribute | Detail |
|---|---|
| **Name** | `domain/candidate` |
| **Purpose** | Model candidate profile and lifecycle state machine |
| **Responsibilities** | Define candidate entity, lifecycle states, duplicate detection rules, tenant scoping |
| **Key Entities** | `Candidate`, `CandidateState`, `CandidateProfile` |
| **Dependencies** | None (pure domain) |

### C5: Compliance Domain

| Attribute | Detail |
|---|---|
| **Name** | `domain/compliance` |
| **Purpose** | Model consent, audit events, and data retention rules |
| **Responsibilities** | Define consent record structure, audit event types, retention policy rules |
| **Key Entities** | `ConsentRecord`, `AuditEvent`, `RetentionPolicy` |
| **Dependencies** | None (pure domain) |

### C6: Conversation Application

| Attribute | Detail |
|---|---|
| **Name** | `application/conversation` |
| **Purpose** | Orchestrate the screening conversation flow |
| **Responsibilities** | Handle incoming Telegram messages, manage session state, coordinate with OpenAI for responses and follow-ups, trigger evaluation, manage re-engagement, handle escalation |
| **Key Use Cases** | `StartScreening`, `ProcessMessage`, `HandleEscalation`, `ResumeSession`, `CompleteScreening` |
| **Dependencies** | C1 (Conversation Domain), C2 (Evaluation Domain), C5 (Compliance Domain) |

### C7: Evaluation Application

| Attribute | Detail |
|---|---|
| **Name** | `application/evaluation` |
| **Purpose** | Orchestrate rubric-based evaluation and summary generation |
| **Responsibilities** | Score responses against rubric in real-time, extract evidence quotes, generate executive summary on completion, produce recommendation |
| **Key Use Cases** | `EvaluateResponse`, `GenerateSummary`, `GetEvaluationDetail` |
| **Dependencies** | C2 (Evaluation Domain), C1 (Conversation Domain) |

### C8: Campaign Application

| Attribute | Detail |
|---|---|
| **Name** | `application/campaign` |
| **Purpose** | Orchestrate campaign management operations |
| **Responsibilities** | CRUD campaigns, assign rubrics, manage knowledge base, generate Telegram links, aggregate metrics |
| **Key Use Cases** | `CreateCampaign`, `UpdateCampaign`, `GetCampaignMetrics`, `ManageKnowledgeBase` |
| **Dependencies** | C3 (Campaign Domain) |

### C9: Candidate Application

| Attribute | Detail |
|---|---|
| **Name** | `application/candidate` |
| **Purpose** | Orchestrate candidate lifecycle and review operations |
| **Responsibilities** | Manage candidate state transitions, handle HITL decisions (approve/reject), detect duplicates, record disagreements |
| **Key Use Cases** | `ReviewCandidate`, `ApproveCandidate`, `RejectCandidate`, `ListCandidatesForReview` |
| **Dependencies** | C4 (Candidate Domain), C2 (Evaluation Domain) |

### C10: Compliance Application

| Attribute | Detail |
|---|---|
| **Name** | `application/compliance` |
| **Purpose** | Orchestrate consent recording and audit logging |
| **Responsibilities** | Record consent with timestamp, append audit events, manage escalation logs |
| **Key Use Cases** | `RecordConsent`, `LogAuditEvent`, `LogEscalation`, `GetAuditTrail` |
| **Dependencies** | C5 (Compliance Domain) |

### C11: Telegram Infrastructure

| Attribute | Detail |
|---|---|
| **Name** | `infrastructure/telegram` |
| **Purpose** | Handle Telegram Bot API integration via grammY |
| **Responsibilities** | Receive webhook updates, parse messages, send bot responses, manage bot commands |
| **Key Integrations** | Telegram Bot API via grammY framework |
| **Dependencies** | C6 (Conversation Application) |

### C12: OpenAI Infrastructure

| Attribute | Detail |
|---|---|
| **Name** | `infrastructure/openai` |
| **Purpose** | Interface with OpenAI API for chat completions and embeddings |
| **Responsibilities** | Build prompts with session state, send chat completion requests, parse responses, generate embeddings for knowledge base documents |
| **Key Integrations** | OpenAI GPT-4o (chat), OpenAI Embeddings (knowledge base) |
| **Dependencies** | None (called by application layer) |

### C13: DynamoDB Infrastructure

| Attribute | Detail |
|---|---|
| **Name** | `infrastructure/dynamodb` |
| **Purpose** | Data persistence layer implementing repository interfaces |
| **Responsibilities** | CRUD operations for all entities, tenant-scoped queries via partition keys, session state storage, audit log append-only operations |
| **Key Integrations** | AWS DynamoDB |
| **Dependencies** | Domain entities (implements repository interfaces) |

### C14: Auth Infrastructure

| Attribute | Detail |
|---|---|
| **Name** | `infrastructure/auth` |
| **Purpose** | Authentication and authorization for the recruiter dashboard |
| **Responsibilities** | NextAuth.js with Cognito adapter, session management, tenant extraction from JWT, route protection middleware |
| **Key Integrations** | AWS Cognito (User Pool + App Client) via NextAuth.js Cognito provider |
| **Dependencies** | None (middleware layer) |

### C15: Knowledge Base Infrastructure

| Attribute | Detail |
|---|---|
| **Name** | `infrastructure/knowledge-base` |
| **Purpose** | Document ingestion and retrieval for campaign knowledge bases |
| **Responsibilities** | Document upload/parsing, text chunking, embedding generation, similarity search |
| **Key Integrations** | OpenAI Embeddings + Vector storage (MVP: in-context loading; post-MVP: Pinecone/pgvector) |
| **Dependencies** | C12 (OpenAI Infrastructure) |

### C16: Dashboard UI

| Attribute | Detail |
|---|---|
| **Name** | `app/(dashboard)` |
| **Purpose** | Recruiter-facing web interface |
| **Responsibilities** | Campaign management UI, HITL review queue, candidate detail view, metrics display |
| **Key Technologies** | React Server Components, Tailwind CSS, shadcn/ui |
| **Dependencies** | Next.js API routes → Application layer |
