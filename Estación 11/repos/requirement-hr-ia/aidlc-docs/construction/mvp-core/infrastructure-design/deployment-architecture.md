# Deployment Architecture — Unit 1: MVP Core

## Deployment Topology

```
                    ┌─────────────────────────────┐
                    │         INTERNET             │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │      Route 53 (optional)     │
                    │   entrevista-ai.example.com  │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────▼─────────────────────┐
              │           AWS Region (us-east-1)      │
              │                                       │
              │  ┌─────────────────────────────────┐  │
              │  │          VPC 10.0.0.0/16         │  │
              │  │                                  │  │
              │  │  ┌─────────── Public ──────────┐ │  │
              │  │  │  Subnet A     Subnet B      │ │  │
              │  │  │  10.0.1.0/24  10.0.2.0/24   │ │  │
              │  │  │                              │ │  │
              │  │  │     ┌──────────────┐         │ │  │
              │  │  │     │     ALB      │         │ │  │
              │  │  │     │  HTTPS:443   │         │ │  │
              │  │  │     └──────┬───────┘         │ │  │
              │  │  │            │                  │ │  │
              │  │  │  ┌─────┐  │                  │ │  │
              │  │  │  │ NAT │  │                  │ │  │
              │  │  │  │ GW  │  │                  │ │  │
              │  │  │  └──┬──┘  │                  │ │  │
              │  │  └─────┼─────┼──────────────────┘ │  │
              │  │        │     │                     │  │
              │  │  ┌─────┼─────┼── Private ───────┐  │  │
              │  │  │     │     │                   │  │  │
              │  │  │  Subnet A     Subnet B        │  │  │
              │  │  │  10.0.10.0/24 10.0.20.0/24    │  │  │
              │  │  │                               │  │  │
              │  │  │  ┌───────────┐ ┌───────────┐  │  │  │
              │  │  │  │ ECS Task  │ │ ECS Task  │  │  │  │
              │  │  │  │ (Fargate) │ │ (Fargate) │  │  │  │
              │  │  │  │ Port 3000 │ │ Port 3000 │  │  │  │
              │  │  │  └─────┬─────┘ └─────┬─────┘  │  │  │
              │  │  │        │             │         │  │  │
              │  │  │   VPC Endpoint    VPC Endpoint  │  │  │
              │  │  │   (DynamoDB)      (CW Logs)    │  │  │
              │  │  └────────────────────────────────┘  │  │
              │  └──────────────────────────────────────┘  │
              │                                            │
              │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
              │  │ DynamoDB │  │ Cognito  │  │   ECR    │ │
              │  │ 6 tables │  │ User Pool│  │  Repo    │ │
              │  └──────────┘  └──────────┘  └──────────┘ │
              │                                            │
              │  ┌──────────┐  ┌──────────────────┐       │
              │  │CloudWatch│  │ Secrets Manager   │       │
              │  │Logs+Alarm│  │ 4 secrets         │       │
              │  └──────────┘  └──────────────────┘       │
              └────────────────────────────────────────────┘
                               │
                               │ HTTPS (outbound via NAT)
                               v
                    ┌──────────────────────┐
                    │   OpenAI API         │
                    │   api.openai.com     │
                    └──────────────────────┘
                    ┌──────────────────────┐
                    │   Telegram API       │
                    │   api.telegram.org   │
                    └──────────────────────┘
```

---

## CI/CD Pipeline (GitHub Actions)

### Pipeline: Build & Deploy

**Trigger**: Push to `main` branch (production) or `develop` branch (staging)

```yaml
# .github/workflows/deploy.yml

name: Build and Deploy

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Run linting (eslint)
      - Run unit tests (vitest)
      - Run type check (tsc --noEmit)

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Configure AWS credentials (OIDC or access keys)
      - Login to ECR
      - Build Docker image (multi-stage)
      - Tag with git SHA + 'latest'
      - Push to ECR

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - Configure AWS credentials
      - Update ECS service with new task definition (image tag = git SHA)
      - Wait for service stability
      - Verify health check passes
```

### Pipeline: Terraform Plan/Apply

**Trigger**: Push to `main` (apply) or PR (plan only)

```yaml
# .github/workflows/terraform.yml

name: Terraform

on:
  push:
    branches: [main]
    paths: ['terraform/**']
  pull_request:
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Terraform
      - Configure AWS credentials
      - Terraform init (S3 backend)
      - Terraform plan
      - IF push to main: Terraform apply -auto-approve
      - IF pull request: Post plan output as PR comment
```

---

## Terraform State Management

| Component | Configuration |
|---|---|
| **Backend** | S3 bucket (`entrevista-ai-terraform-state-{account}`) |
| **State Lock** | DynamoDB table (`terraform-locks`) |
| **Encryption** | S3 SSE-S3 (default encryption) |
| **Versioning** | S3 bucket versioning enabled |
| **State per env** | Separate state file per environment (key = `{env}/terraform.tfstate`) |

---

## Deployment Process

### First-Time Setup
1. Create S3 bucket + DynamoDB lock table manually (one-time bootstrap)
2. Run `terraform init` in `terraform/environments/dev/`
3. Run `terraform apply` — creates all AWS resources
4. Build and push first Docker image to ECR
5. Update ECS service with initial image
6. Configure Telegram webhook URL: `POST https://api.telegram.org/bot{TOKEN}/setWebhook?url={ALB_URL}/api/telegram/webhook`
7. Create initial tenant + Cognito user (seed via script or AWS Console)

### Subsequent Deployments
1. Push code to `main` → GitHub Actions runs tests → builds Docker → pushes to ECR → updates ECS
2. ECS performs rolling update (new task starts → health check passes → old task drains)
3. Zero downtime deployment

### Rollback
1. ECS: revert task definition to previous revision
2. Application: revert git commit, pipeline rebuilds previous version
3. Terraform: `terraform apply` with previous state (state versioned in S3)

---

## Cost Estimate (MVP — Monthly)

| Service | Configuration | Estimated Cost |
|---|---|---|
| ECS Fargate | 1 task × 0.5 vCPU × 1GB × 24/7 | ~$15 |
| ALB | 1 ALB + minimal LCUs | ~$18 |
| NAT Gateway | 1 NAT + data processing | ~$35 |
| DynamoDB | On-demand, <1000 req/day | ~$1 |
| Cognito | <50 MAU (free tier) | $0 |
| ECR | <1GB storage | ~$0.10 |
| CloudWatch | Logs + 3 alarms | ~$5 |
| Secrets Manager | 4 secrets | ~$2 |
| ACM Certificate | Free | $0 |
| **Total** | | **~$76/month** |

**Note**: NAT Gateway is the biggest cost driver. For dev environments, consider NAT instance (t3.nano ~$4/mo) or VPC endpoints to reduce cost.

---

## DNS & TLS Configuration

| Component | Configuration |
|---|---|
| **Domain** | ALB DNS name directly (no custom domain / Route 53 for MVP) |
| **TLS Certificate** | ACM (AWS Certificate Manager) — free, auto-renewed |
| **ALB Listener** | HTTPS:443 with ACM cert → ECS target group. HTTP:80 → redirect to HTTPS |
| **Telegram Webhook** | HTTPS guaranteed via ALB TLS termination |
| **Post-MVP** | Add Route 53 when custom domain is needed |
