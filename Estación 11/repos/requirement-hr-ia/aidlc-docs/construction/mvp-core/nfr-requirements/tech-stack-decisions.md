# Tech Stack Decisions — Unit 1: MVP Core

## Summary

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Runtime** | Node.js | 20 LTS | Next.js requirement, TypeScript native support |
| **Framework** | Next.js | 16 | Fullstack (SSR + API routes), App Router, React Server Components |
| **Language** | TypeScript | 5.x | Type safety, better DX, strict mode |
| **UI Library** | React | 19 | Next.js default, Server Components support |
| **Styling** | Tailwind CSS | 4.x | Utility-first, fast prototyping, shadcn/ui compatibility |
| **Component Library** | shadcn/ui | latest | Accessible, customizable, Tailwind-based components |
| **Telegram Bot** | grammY | latest | TypeScript-native, webhook support, active maintenance |
| **LLM** | OpenAI GPT-4o | latest | Chat completions (screening + evaluation) + embeddings (post-MVP) |
| **Database** | AWS DynamoDB | - | Managed NoSQL, on-demand capacity, partition key multi-tenancy |
| **Auth** | AWS Cognito + NextAuth.js | - | Managed user pool + framework adapter for session handling |
| **Compute** | AWS ECS Fargate | - | Serverless containers, no EC2 management |
| **Load Balancer** | AWS ALB | - | HTTP/HTTPS routing, health checks, TLS termination |
| **Container Registry** | AWS ECR | - | Private Docker image storage |
| **Networking** | AWS VPC | - | Private subnets for ECS, public for ALB |
| **Logging** | AWS CloudWatch Logs | - | Structured JSON logs, 30-day retention |
| **IaC** | Terraform | ≥1.5 | All AWS resources defined as code, modular structure |
| **CI/CD** | GitHub Actions | - | Build, test, Docker push, ECS deploy |
| **Containerization** | Docker | - | Multi-stage build for Next.js standalone output |

---

## Key Decision Rationale

### Why DynamoDB (not PostgreSQL/MongoDB)?
- User chose DynamoDB explicitly for session state storage
- On-demand capacity mode eliminates capacity planning for MVP
- Partition key model naturally supports multi-tenant isolation
- Fully managed — zero operational overhead
- Millisecond latency at any scale

### Why ECS Fargate (not Lambda/EC2)?
- User requirement: Docker containers on ECS
- Fargate: serverless containers — no EC2 instance management
- Next.js runs as a long-lived process (better than Lambda cold starts for bot latency)
- Docker ensures local-production parity
- Auto-scaling via ECS service auto-scaling policies

### Why Cognito (not Auth0/Clerk)?
- User chose Cognito explicitly
- Native AWS integration (IAM, ALB, CloudWatch)
- Managed user pool with built-in flows (sign-up, sign-in, password reset)
- Custom attributes (`custom:tenantId`) for tenant association
- Cost-effective for MVP volume

### Why Dual-Pass Evaluation (not inline)?
- User chose dual-pass explicitly
- Separation of concerns: conversation quality ≠ evaluation quality
- Conversation agent can focus on natural dialogue without scoring overhead
- Evaluator prompt can be optimized independently for accuracy
- Trade-off: higher latency/cost at screening completion, but better evaluation quality

### Why shadcn/ui (not Material UI/Ant Design)?
- User requirement: Tailwind + shadcn
- Copy-paste components — no heavy dependency
- Full Tailwind integration (no CSS-in-JS overhead)
- Accessible by default (Radix UI primitives)
- Easy to customize for Spanish UI

---

## Dependencies (npm packages)

### Production
```
next@16
react@19
react-dom@19
typescript@5
tailwindcss@4
grammy                    # Telegram bot framework
openai                    # OpenAI SDK
@aws-sdk/client-dynamodb  # DynamoDB client
@aws-sdk/lib-dynamodb     # DynamoDB Document client
next-auth                 # Authentication framework
@auth/core                # NextAuth core
uuid                      # ID generation
zod                       # Schema validation
```

### Development
```
@types/node
@types/react
eslint
prettier
vitest                    # Unit testing
@testing-library/react    # Component testing
```

### shadcn/ui components (installed via CLI)
```
button, card, table, badge, dialog, input, textarea,
select, dropdown-menu, accordion, avatar, sheet,
tabs, progress, alert, toast, label, form, skeleton
```

---

## Docker Configuration

### Multi-stage Dockerfile
```
Stage 1: deps     → Install dependencies
Stage 2: builder  → Build Next.js (standalone output)
Stage 3: runner   → Production image (Node.js alpine + standalone output)
```

**Target image size**: < 200MB
**Base image**: `node:20-alpine`
**Output mode**: Next.js `standalone` (self-contained server)

---

## Environment Variables

| Variable | Source | Description |
|---|---|---|
| `OPENAI_API_KEY` | ECS task definition (Secrets Manager) | OpenAI API authentication |
| `TELEGRAM_BOT_TOKEN` | ECS task definition (Secrets Manager) | Telegram Bot API token |
| `TELEGRAM_WEBHOOK_URL` | ECS task definition | Public URL for webhook (ALB domain) |
| `NEXTAUTH_SECRET` | ECS task definition (Secrets Manager) | NextAuth.js session encryption |
| `NEXTAUTH_URL` | ECS task definition | Application base URL |
| `COGNITO_CLIENT_ID` | ECS task definition | Cognito App Client ID |
| `COGNITO_CLIENT_SECRET` | ECS task definition (Secrets Manager) | Cognito App Client Secret |
| `COGNITO_ISSUER` | ECS task definition | Cognito User Pool issuer URL |
| `AWS_REGION` | ECS task definition | AWS region (e.g., us-east-1) |
| `DYNAMODB_TABLE_PREFIX` | ECS task definition | Table name prefix per environment |
| `NODE_ENV` | ECS task definition | production / staging / development |
