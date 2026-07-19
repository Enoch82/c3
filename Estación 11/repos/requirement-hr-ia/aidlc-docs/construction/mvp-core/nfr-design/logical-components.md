# Logical Components — Unit 1: MVP Core

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                 │
└───────────┬───────────────────────────────┬─────────────────────┘
            │                               │
            v                               v
    ┌───────────────┐              ┌────────────────┐
    │  Telegram API │              │  Browser (HTTPS)│
    └───────┬───────┘              └────────┬───────┘
            │                               │
            v                               v
┌───────────────────────────────────────────────────────────────────┐
│  AWS ALB (Application Load Balancer)                              │
│  - TLS termination (ACM certificate)                              │
│  - Health check: /api/health                                      │
│  - Routes: /* → ECS target group                                  │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                v
┌───────────────────────────────────────────────────────────────────┐
│  AWS ECS Fargate (Private Subnet)                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Next.js Application Container                              │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ Telegram     │  │ Dashboard    │  │ API Routes      │  │  │
│  │  │ Webhook      │  │ UI (SSR)     │  │ (REST)          │  │  │
│  │  │ /api/telegram│  │ /(dashboard) │  │ /api/*          │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────────┘  │  │
│  │         │                 │                  │              │  │
│  │         v                 v                  v              │  │
│  │  ┌────────────────────────────────────────────────────────┐│  │
│  │  │           Application Layer (Use Cases)                ││  │
│  │  │  ScreeningOrchestrator | EvaluationService |          ││  │
│  │  │  CampaignManagement | HITLReview | Compliance         ││  │
│  │  └───────────┬──────────────────────────┬─────────────────┘│  │
│  │              │                          │                  │  │
│  │              v                          v                  │  │
│  │  ┌───────────────────┐    ┌────────────────────────────┐  │  │
│  │  │ Domain Layer      │    │ Infrastructure Layer       │  │  │
│  │  │ (Business Rules)  │    │ ┌─────────┐ ┌───────────┐ │  │  │
│  │  └───────────────────┘    │ │DynamoDB │ │ OpenAI    │ │  │  │
│  │                           │ │Repos    │ │ Client    │ │  │  │
│  │                           │ └────┬────┘ └─────┬─────┘ │  │  │
│  │                           │      │            │       │  │  │
│  │                           └──────┼────────────┼───────┘  │  │
│  └──────────────────────────────────┼────────────┼──────────┘  │
└─────────────────────────────────────┼────────────┼─────────────┘
                                      │            │
                                      v            v
                              ┌──────────────┐  ┌──────────────┐
                              │ DynamoDB     │  │ OpenAI API   │
                              │ (6 tables)   │  │ (GPT-4o)     │
                              │ On-demand    │  │              │
                              └──────────────┘  └──────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ AWS Cognito          │  │ AWS CloudWatch       │
│ User Pool            │  │ Logs (30d retention) │
│ - Auth flows         │  │ Alarms               │
│ - JWT tokens         │  │                      │
│ - custom:tenantId    │  │                      │
└──────────────────────┘  └──────────────────────┘
```

---

## Logical Component Specifications

### LC-01: Application Load Balancer (ALB)

| Attribute | Configuration |
|---|---|
| **Type** | Application Load Balancer (Layer 7) |
| **Scheme** | Internet-facing |
| **Subnets** | Public subnets (2 AZs minimum) |
| **Listeners** | HTTPS:443 (TLS via ACM certificate) → redirect HTTP:80 to HTTPS |
| **Target Group** | ECS tasks, port 3000 (Next.js) |
| **Health Check** | GET /api/health, interval 30s, healthy 2, unhealthy 3, timeout 5s |
| **Security Group** | Inbound: 80, 443 from 0.0.0.0/0. Outbound: 3000 to ECS SG |

### LC-02: ECS Fargate Service

| Attribute | Configuration |
|---|---|
| **Launch Type** | Fargate (serverless containers) |
| **Platform Version** | LATEST |
| **Subnets** | Private subnets (no public IP) |
| **Task CPU** | 512 (0.5 vCPU) — MVP sizing |
| **Task Memory** | 1024 MB (1 GB) — MVP sizing |
| **Desired Count** | 1 (min 1, max 3) |
| **Auto-scaling** | Target tracking: CPU utilization > 70% |
| **Container Port** | 3000 |
| **Security Group** | Inbound: 3000 from ALB SG only. Outbound: 443 (HTTPS to DynamoDB, OpenAI, Cognito) |
| **Log Driver** | awslogs → CloudWatch log group |

### LC-03: DynamoDB Tables

| Table | PK | SK | GSI | Capacity |
|---|---|---|---|---|
| `{prefix}-conversations` | `tenantId` | `conversationId` | `ByTelegram`: PK=`telegramUserId#campaignId` | On-demand |
| `{prefix}-campaigns` | `tenantId` | `campaignId` | — | On-demand |
| `{prefix}-candidates` | `tenantId` | `candidateId` | `ByCampaign`: PK=`campaignId`, SK=`state`; `ByTelegram`: PK=`telegramUserId` | On-demand |
| `{prefix}-evaluations` | `tenantId` | `conversationId` | — | On-demand |
| `{prefix}-audit-events` | `tenantId` | `timestamp#eventId` | — | On-demand |
| `{prefix}-consent` | `tenantId` | `candidateId` | — | On-demand |

**Common settings**: Encryption at rest (AWS-managed), point-in-time recovery enabled, on-demand capacity.

### LC-04: Cognito User Pool

| Attribute | Configuration |
|---|---|
| **User Pool** | Standard user pool |
| **Sign-in** | Email (primary identifier) |
| **Password Policy** | Min 8 chars, require uppercase, lowercase, number |
| **MFA** | Optional (not required for MVP) |
| **Custom Attributes** | `custom:tenantId` (string, immutable after set) |
| **App Client** | Confidential client with client secret |
| **OAuth Flows** | Authorization code grant |
| **Callback URLs** | `{APP_URL}/api/auth/callback/cognito` |
| **Token Expiry** | Access: 1 hour, Refresh: 30 days |

### LC-05: ECR Repository

| Attribute | Configuration |
|---|---|
| **Repository** | `entrevista-ai` |
| **Image Scanning** | On push |
| **Lifecycle Policy** | Keep last 10 images |
| **Encryption** | AES-256 (default) |

### LC-06: VPC

| Attribute | Configuration |
|---|---|
| **CIDR** | 10.0.0.0/16 |
| **Public Subnets** | 2 (one per AZ) — for ALB |
| **Private Subnets** | 2 (one per AZ) — for ECS tasks |
| **NAT Gateway** | 1 (single AZ for MVP cost savings) |
| **VPC Endpoints** | DynamoDB (gateway endpoint — free), CloudWatch Logs (interface endpoint), ECR (interface endpoints for pull) |
| **Internet Gateway** | Yes (for ALB) |

### LC-07: CloudWatch

| Attribute | Configuration |
|---|---|
| **Log Group** | `/ecs/entrevista-ai/{env}` |
| **Retention** | 30 days |
| **Alarms** | ECS task unhealthy count > 0, HTTP 5xx rate > 5% (5min), OpenAI error rate > 10% (5min) |
| **Dashboard** | Basic: task count, CPU/memory, 5xx rate, request count |

---

## Cross-Cutting Middleware Stack

Request processing order for dashboard API routes:

```
1. Next.js Middleware (route matching)
2. Auth Check (NextAuth session validation)
3. Tenant Extraction (tenantId from JWT)
4. Correlation ID Generation (uuid)
5. Request Logging (structured log entry)
6. Zod Validation (input parsing)
7. Use Case Execution (business logic)
8. Response Logging (status, duration)
9. Error Boundary (catch unhandled errors)
```

Request processing for Telegram webhook:

```
1. grammY Webhook Handler (validates Telegram token)
2. Extract campaignId from /start or conversation lookup
3. Tenant Resolution (campaign → tenantId)
4. Correlation ID Generation
5. Request Logging
6. ScreeningOrchestrator (business logic)
7. Response via Telegram API
8. Error Boundary (graceful retry+pause)
```
