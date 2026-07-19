# Code Generation Plan — Unit 1: MVP Core

## Unit Context
- **Unit**: MVP Core (entire MVP as single unit)
- **Stories**: 18 user stories (US-1.1 through US-7.2)
- **Architecture**: Next.js 16 modular monolith, DDD layers, DynamoDB, ECS Fargate
- **Workspace Root**: `<workspace-root>/requirement-hr-ia/`

## Code Location
- **Application Code**: Workspace root (`src/`, `terraform/`, `Dockerfile`, etc.)
- **Documentation**: `aidlc-docs/construction/mvp-core/code/` (markdown summaries only)

---

## Generation Steps

### Phase A: Project Foundation

- [x] **Step 1**: Project scaffold — Initialize Next.js 16 project with TypeScript, Tailwind CSS, shadcn/ui, ESLint, Prettier, Vitest configuration. Create DDD directory structure (`src/domain/`, `src/application/`, `src/infrastructure/`, `src/shared/`). Create `Dockerfile` (multi-stage), `docker-compose.yml`, `.env.example`, `.gitignore`.
  - Stories: Foundation for all

- [x] **Step 2**: Shared types and utilities — Create shared TypeScript types (`src/shared/types/`), ID generation utilities, date utils, constants, Zod validation helpers, logger utility, correlation ID generator, API handler wrapper (error boundary pattern).
  - Stories: US-7.1 (multi-tenant types), US-7.2 (performance utils)

- [x] **Step 3**: DynamoDB infrastructure — Create DynamoDB client configuration (`src/infrastructure/dynamodb/client.ts`), base repository helper, and all 6 repository implementations (ConversationRepository, CampaignRepository, CandidateRepository, EvaluationRepository, AuditEventRepository, ConsentRepository) with tenant-scoped operations.
  - Stories: US-7.1 (multi-tenant isolation)

- [x] **Step 4**: Authentication infrastructure — Configure NextAuth.js with Cognito provider (`src/infrastructure/auth/`), auth middleware for API routes, tenant extraction from JWT, protected route wrapper for dashboard pages.
  - Stories: US-3.5 (authentication and access control)

### Phase B: Domain Layer

- [x] **Step 5**: Conversation domain — Create entities (`Conversation`, `Message`, `SessionState`), conversation rules (state machine transitions, phase handlers, follow-up logic, escalation detection, re-engagement triggers), and repository port interfaces.
  - Stories: US-1.1, US-1.2, US-1.4, US-1.5, US-1.6, US-1.7, US-1.8

- [x] **Step 6**: Evaluation domain — Create entities (`Rubric`, `Competency`, `Score`, `Evidence`, `ExecutiveSummary`), evaluation rules (scoring validation, weighted average calculation, recommendation thresholds, evidence validation), hardcoded BPO and Tech rubric templates, and repository port interfaces.
  - Stories: US-2.1, US-2.2, US-2.3

- [x] **Step 7**: Campaign domain — Create entities (`Campaign`, `CampaignConfig`, `BasicRequirement`), campaign rules (lifecycle state machine, Telegram link generation, activation validation), and repository port interfaces.
  - Stories: US-3.1

- [x] **Step 8**: Candidate domain — Create entities (`Candidate`, `CandidateState`, `ReviewDecision`), candidate rules (state transition validation, review decision logic), and repository port interfaces.
  - Stories: US-5.1

- [x] **Step 9**: Compliance domain — Create entities (`ConsentRecord`, `AuditEvent`), compliance rules, and repository port interfaces.
  - Stories: US-4.1

- [x] **Step 10**: Domain layer unit tests — Tests for all domain rules: conversation state machine, evaluation scoring/recommendation, campaign lifecycle, candidate state transitions, data validation. Using Vitest.
  - Stories: All domain stories

### Phase C: Application Layer (Use Cases)

- [x] **Step 11**: Conversation use cases — `StartScreeningUseCase`, `ProcessMessageUseCase`, `CompleteScreeningUseCase`, `ResumeSessionUseCase`, `HandleEscalationUseCase`. Orchestration logic coordinating domain rules, OpenAI client, repositories, and compliance logging.
  - Stories: US-1.1, US-1.2, US-1.3, US-1.4, US-1.5, US-1.6, US-1.8

- [x] **Step 12**: Evaluation use cases — `EvaluateConversationUseCase` (dual-pass: calls evaluator prompt after screening), `GenerateSummaryUseCase`, `GetEvaluationDetailUseCase`.
  - Stories: US-2.2, US-2.3

- [x] **Step 13**: Campaign use cases — `CreateCampaignUseCase`, `UpdateCampaignUseCase`, `ListCampaignsUseCase`, `GetCampaignDetailUseCase`.
  - Stories: US-3.1

- [x] **Step 14**: Candidate use cases — `ListCandidatesForReviewUseCase`, `ReviewCandidateUseCase` (with disagreement capture).
  - Stories: US-3.2, US-3.3, US-5.1

- [x] **Step 15**: Compliance use cases — `RecordConsentUseCase`, `LogAuditEventUseCase`, `GetAuditTrailUseCase`.
  - Stories: US-4.1, US-1.2

- [x] **Step 16**: Application layer unit tests — Tests for all use cases with mocked repositories and OpenAI client. Focus on orchestration logic, error handling, retry+pause pattern.
  - Stories: All application stories

### Phase D: Infrastructure Layer (External Integrations)

- [x] **Step 17**: OpenAI client — `OpenAIChatClient` (conversation agent prompt builder, evaluator prompt builder, structured output parsing), `ResilientOpenAIClient` wrapper (retry+pause pattern). Environment-based configuration.
  - Stories: US-1.4, US-1.5, US-2.2, US-2.3

- [x] **Step 18**: Telegram bot — grammY setup, webhook handler (`src/infrastructure/telegram/`), message routing to ScreeningOrchestrator, bot response formatting, campaign ID extraction from `/start` command.
  - Stories: US-1.1, US-1.2, US-1.4, US-1.8

- [x] **Step 19**: Structured logging — Logger implementation (JSON format to stdout for CloudWatch), correlation ID propagation, key event logging.
  - Stories: US-7.2

### Phase E: API Routes

- [x] **Step 20**: Telegram webhook route — `app/api/telegram/webhook/route.ts` — grammY webhook integration with Next.js API route.
  - Stories: US-1.1 through US-1.8

- [x] **Step 21**: Campaign API routes — `app/api/campaigns/` — CRUD endpoints with Zod validation, tenant scoping, auth middleware.
  - Stories: US-3.1

- [x] **Step 22**: Candidate and review API routes — `app/api/candidates/` — List for review (filtered), candidate detail, review decision endpoint.
  - Stories: US-3.2, US-3.3, US-5.1

- [x] **Step 23**: Health check and utility routes — `app/api/health/route.ts` (DynamoDB connectivity check), evaluation detail endpoint.
  - Stories: US-7.2

- [x] **Step 24**: API route tests — Integration-style tests for all API routes with mocked DynamoDB and OpenAI.
  - Stories: All API stories

### Phase F: Frontend Dashboard

- [x] **Step 25**: Dashboard layout — Root layout, dashboard shell (`(dashboard)/layout.tsx`), sidebar navigation, header with user menu, login page. shadcn/ui setup (install components).
  - Stories: US-3.5

- [x] **Step 26**: Campaign pages — Campaign list page (table with status badges), create campaign form (with rubric template selection, basic requirements), campaign detail page (info + Telegram link + stats).
  - Stories: US-3.1

- [x] **Step 27**: Review pages — HITL review queue page (filterable table with recommendation badges), candidate review detail page (summary card + competency accordion with evidence quotes + transcript viewer + decision panel with disagreement capture).
  - Stories: US-3.2, US-3.3

- [x] **Step 28**: Shared UI components — `ScoreBadge`, `RecommendationBadge`, `TranscriptViewer`, `EvidenceQuote`, `EmptyState`, loading skeletons, toast notifications.
  - Stories: US-3.2, US-3.3

- [x] **Step 29**: Frontend component tests — Tests for key interactive components (review decision form, campaign creation form, filter interactions).
  - Stories: All dashboard stories

### Phase G: Terraform Infrastructure

- [x] **Step 30**: Terraform modules — VPC module (subnets, NAT, IGW, endpoints, security groups), ALB module (listeners, target group, ACM cert), ECS module (cluster, service, task definition, IAM roles, auto-scaling), DynamoDB module (6 tables + GSIs), Cognito module (user pool, app client, domain), ECR module, CloudWatch module (log group, alarms), Secrets Manager module.
  - Stories: Infrastructure foundation

- [x] **Step 31**: Terraform environments — Dev environment configuration (`terraform/environments/dev/`), backend config (S3 + DynamoDB lock), variables, outputs. Staging and prod environment stubs.
  - Stories: Infrastructure foundation

### Phase H: CI/CD and Deployment

- [x] **Step 32**: GitHub Actions workflows — Deploy workflow (test → build Docker → push ECR → deploy ECS), Terraform workflow (plan on PR, apply on main). `docker-compose.yml` for local development.
  - Stories: Infrastructure foundation

- [x] **Step 33**: Documentation — Code generation summary (`aidlc-docs/construction/mvp-core/code/code-summary.md`), API documentation, environment setup guide.
  - Stories: Documentation

---

## Story Coverage Matrix

| Story | Steps |
|---|---|
| US-1.1 (Onboarding) | 5, 11, 18, 20 |
| US-1.2 (Consent) | 5, 9, 11, 15, 18, 20 |
| US-1.3 (Verification) | 5, 7, 11, 20 |
| US-1.4 (Screening) | 5, 6, 11, 17, 18, 20 |
| US-1.5 (Anti-hallucination) | 5, 11, 17, 20 |
| US-1.6 (Escalation L1-2) | 5, 11, 20 |
| US-1.8 (Closing) | 5, 11, 12, 18, 20 |
| US-2.1 (Rubrics — templates) | 6 |
| US-2.2 (Real-time eval) | 6, 12, 17 |
| US-2.3 (Summary) | 6, 12, 17 |
| US-3.1 (Campaigns) | 7, 13, 21, 26 |
| US-3.2 (Review queue) | 14, 22, 27 |
| US-3.3 (Candidate detail) | 14, 22, 27, 28 |
| US-3.5 (Auth) | 4, 25 |
| US-4.1 (Audit — basic) | 9, 15 |
| US-5.1 (Candidate lifecycle) | 8, 14, 22 |
| US-7.1 (Multi-tenant) | 2, 3 |
| US-7.2 (Performance) | 2, 17, 19, 23 |

**Total**: 33 steps across 8 phases (A-H)
