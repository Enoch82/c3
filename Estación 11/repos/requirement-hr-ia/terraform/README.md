# EntreVista AI — Infraestructura Terraform

Infraestructura como código (IaC) para la plataforma **EntreVista AI**, utilizando Terraform con soporte dual: **LocalStack** para desarrollo local y **AWS** para ambientes desplegados (dev/staging/prod).

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                │
│                            │                                    │
│                     ┌──────┴──────┐                             │
│                     │     ALB     │  (HTTPS:443 / HTTP:80)      │
│                     └──────┬──────┘                             │
│                            │                                    │
│              ┌─────────────┴─────────────┐                      │
│              │    VPC (10.0.0.0/16)       │                      │
│              │                           │                      │
│  ┌───────────┴───────────┐  ┌────────────┴──────────┐           │
│  │   Public Subnets (2)  │  │  Private Subnets (2)  │           │
│  │   ALB, NAT Gateway    │  │  ECS Fargate Tasks    │           │
│  └───────────────────────┘  └────────────┬──────────┘           │
│                                          │                      │
│              ┌───────────────────────────┬┴──────────────┐      │
│              │           │              │               │       │
│        ┌─────┴─────┐ ┌──┴───┐  ┌───────┴──────┐ ┌──────┴────┐ │
│        │ DynamoDB   │ │Cognito│ │Secrets Manager│ │CloudWatch │ │
│        │ (6 tablas) │ │      │  │  (4 secrets)  │ │  Logs     │ │
│        └───────────┘ └──────┘  └──────────────┘ └───────────┘ │
│                                                                │
│        ┌───────────┐                                           │
│        │    ECR     │  Registro de imágenes Docker             │
│        └───────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Directorios

```
terraform/
├── README.md                          # Este archivo
├── modules/                           # Módulos reutilizables
│   ├── vpc/main.tf                    # VPC, subnets, NAT, security groups
│   ├── alb/main.tf                    # Application Load Balancer
│   ├── ecs/main.tf                    # ECS Fargate cluster, service, auto-scaling
│   ├── dynamodb/main.tf               # 6 tablas DynamoDB
│   ├── cognito/main.tf                # User Pool + OAuth 2.0
│   ├── ecr/main.tf                    # Container registry
│   ├── cloudwatch/main.tf             # Log groups + alarmas
│   └── secrets/main.tf                # Secrets Manager (4 secrets)
└── environments/                      # Configuraciones por ambiente
    ├── local/main.tf                  # LocalStack (desarrollo local)
    ├── dev/main.tf                    # AWS desarrollo
    ├── staging/                       # AWS staging (por crear)
    └── prod/                          # AWS producción (por crear)
```

---

## Módulos

### VPC (`modules/vpc`)
| Recurso | Descripción |
|---------|-------------|
| `aws_vpc` | VPC principal — CIDR `10.0.0.0/16` |
| `aws_subnet.public[2]` | 2 subnets públicas (ALB, NAT Gateway) |
| `aws_subnet.private[2]` | 2 subnets privadas (ECS tasks) |
| `aws_internet_gateway` | Acceso a internet para subnets públicas |
| `aws_nat_gateway` | Egress para subnets privadas |
| `aws_vpc_endpoint.dynamodb` | Endpoint de DynamoDB (tráfico interno, sin NAT) |
| `aws_security_group.alb` | Ingress puertos 80/443 |
| `aws_security_group.ecs` | Ingress puerto 3000 desde ALB únicamente |

### ALB (`modules/alb`)
| Recurso | Descripción |
|---------|-------------|
| `aws_lb` | Application Load Balancer público |
| `aws_lb_target_group` | Target group IP → puerto 3000, health check `/api/health` |
| `aws_lb_listener.https` | HTTPS:443 con TLS 1.3 (solo AWS, `enable_https = true`) |
| `aws_lb_listener.http_redirect` | HTTP:80 → HTTPS:443 redirect (solo AWS) |
| `aws_lb_listener.http` | HTTP:80 forward (solo LocalStack, `enable_https = false`) |

### ECS (`modules/ecs`)
| Recurso | Descripción |
|---------|-------------|
| `aws_ecs_cluster` | Cluster Fargate con Container Insights |
| `aws_ecs_task_definition` | Task definition (CPU/memoria configurable) |
| `aws_ecs_service` | Service con load balancer y auto-scaling |
| `aws_appautoscaling_target` | Escalado 1-N tasks |
| `aws_appautoscaling_policy` | Target tracking CPU al 70% |
| `aws_iam_role.execution` | Rol para pull de ECR + Secrets Manager + CloudWatch |
| `aws_iam_role.task` | Rol para acceso a DynamoDB desde la app |

### DynamoDB (`modules/dynamodb`)
| Tabla | Partition Key | Sort Key | GSIs |
|-------|--------------|----------|------|
| `conversations` | `tenantId` | `conversationId` | `ByTelegram` (telegramChatId) |
| `campaigns` | `tenantId` | `campaignId` | — |
| `candidates` | `tenantId` | `candidateId` | `ByCampaign` (campaignId), `ByTelegram` (telegramUserId) |
| `evaluations` | `tenantId` | `conversationId` | — |
| `audit_events` | `tenantId` | `eventId` | — |
| `consent` | `tenantId` | `candidateId` | — |

Todas las tablas usan **billing mode on-demand** (PAY_PER_REQUEST) y encriptación server-side.

### Cognito (`modules/cognito`)
| Recurso | Descripción |
|---------|-------------|
| `aws_cognito_user_pool` | Pool con atributo custom `tenantId`, verificación por email |
| `aws_cognito_user_pool_client` | OAuth 2.0 con authorization code flow |
| `aws_cognito_user_pool_domain` | Dominio para hosted UI |

**Política de contraseñas**: mínimo 8 caracteres, mayúsculas, minúsculas, números, símbolos.

### ECR (`modules/ecr`)
| Recurso | Descripción |
|---------|-------------|
| `aws_ecr_repository` | Repositorio con image scanning habilitado |
| Lifecycle policy | Retiene últimas 10 imágenes |

### CloudWatch (`modules/cloudwatch`)
| Recurso | Descripción |
|---------|-------------|
| `aws_cloudwatch_log_group` | Log group con retención configurable |
| `aws_cloudwatch_metric_alarm` | Alarma de CPU alto (80%) |

### Secrets Manager (`modules/secrets`)
| Secret | Uso |
|--------|-----|
| `openai_api_key` | API key de OpenAI para evaluaciones |
| `telegram_bot_token` | Token del bot de Telegram |
| `nextauth_secret` | Secret para NextAuth.js sessions |
| `cognito_client_secret` | Client secret de Cognito |

---

## Ambientes

### Comparación Local vs AWS

| Aspecto | Local (LocalStack) | AWS (dev/staging/prod) |
|---------|-------------------|----------------------|
| Provider | LocalStack `localhost:4566` | AWS real |
| Backend | `local` (archivo) | S3 + DynamoDB locking |
| TLS/HTTPS | Deshabilitado (HTTP only) | ACM Certificate + TLS 1.3 |
| Credenciales | `test/test` | IAM roles / credentials |
| PITR | Deshabilitado | Configurable por ambiente |
| Auto-scaling | 1 task | Configurable (1-N) |
| Logs retention | 1 día | 7-90 días según ambiente |

---

## Guía de Despliegue

### Prerrequisitos

```bash
# Terraform >= 1.5
terraform --version

# AWS CLI v2
aws --version

# Para ambiente local: LocalStack corriendo
curl http://localhost:4566/_localstack/health
```

---

### Ambiente Local (LocalStack)

#### 1. Verificar que LocalStack esté corriendo

```bash
curl -s http://localhost:4566/_localstack/health | jq .
```

#### 2. Inicializar Terraform

```bash
cd terraform/environments/local
terraform init
```

#### 3. Planificar cambios

```bash
terraform plan
```

#### 4. Aplicar infraestructura

```bash
terraform apply -auto-approve
```

#### 5. Verificar recursos creados

```bash
# Listar tablas DynamoDB
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Verificar Cognito
aws --endpoint-url=http://localhost:4566 cognito-idp list-user-pools --max-results 10

# Verificar Secrets
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets
```

#### 6. Poblar secrets para desarrollo local

```bash
ENDPOINT="http://localhost:4566"

aws --endpoint-url=$ENDPOINT secretsmanager put-secret-value \
  --secret-id entrevista-ai-local-openai-api-key \
  --secret-string "sk-your-openai-key"

aws --endpoint-url=$ENDPOINT secretsmanager put-secret-value \
  --secret-id entrevista-ai-local-telegram-bot-token \
  --secret-string "your-telegram-bot-token"

aws --endpoint-url=$ENDPOINT secretsmanager put-secret-value \
  --secret-id entrevista-ai-local-nextauth-secret \
  --secret-string "local-dev-secret-$(openssl rand -hex 16)"

aws --endpoint-url=$ENDPOINT secretsmanager put-secret-value \
  --secret-id entrevista-ai-local-cognito-client-secret \
  --secret-string "local-cognito-secret"
```

#### 7. Destruir infraestructura local

```bash
terraform destroy -auto-approve
```

---

### Ambiente AWS (dev / staging / prod)

#### 1. Configurar credenciales AWS

```bash
# Opción A: AWS CLI profile
aws configure --profile entrevista-ai
export AWS_PROFILE=entrevista-ai

# Opción B: Variables de entorno
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

#### 2. Crear backend de estado (solo primera vez)

```bash
# Crear bucket S3 para estado
aws s3 mb s3://entrevista-ai-terraform-state --region us-east-1

# Habilitar versionamiento
aws s3api put-bucket-versioning \
  --bucket entrevista-ai-terraform-state \
  --versioning-configuration Status=Enabled

# Crear tabla DynamoDB para locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### 3. Solicitar certificado ACM (solo primera vez)

```bash
# Solicitar certificado SSL
aws acm request-certificate \
  --domain-name "dev.entrevista-ai.example.com" \
  --validation-method DNS \
  --region us-east-1

# Anotar el ARN del certificado para usarlo en el paso 4
```

#### 4. Inicializar y aplicar (dev)

```bash
cd terraform/environments/dev
terraform init

# Planificar con el ARN del certificado
terraform plan \
  -var="certificate_arn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID"

# Aplicar
terraform apply \
  -var="certificate_arn=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID"
```

#### 5. Poblar secrets en AWS

```bash
aws secretsmanager put-secret-value \
  --secret-id entrevista-ai-dev-openai-api-key \
  --secret-string "sk-your-production-openai-key"

aws secretsmanager put-secret-value \
  --secret-id entrevista-ai-dev-telegram-bot-token \
  --secret-string "your-telegram-bot-token"

aws secretsmanager put-secret-value \
  --secret-id entrevista-ai-dev-nextauth-secret \
  --secret-string "$(openssl rand -hex 32)"

aws secretsmanager put-secret-value \
  --secret-id entrevista-ai-dev-cognito-client-secret \
  --secret-string "your-cognito-client-secret"
```

#### 6. Desplegar la aplicación (después de infra)

```bash
# Login en ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build y push de imagen
ECR_REPO=$(terraform output -raw ecr_repository)
docker build -t $ECR_REPO:latest ../../../webapp
docker push $ECR_REPO:latest

# Forzar nuevo deploy en ECS
aws ecs update-service \
  --cluster entrevista-ai-dev \
  --service entrevista-ai-dev \
  --force-new-deployment
```

#### 7. Verificar despliegue

```bash
# Obtener URL del ALB
terraform output alb_dns_name

# Health check
curl -s https://$(terraform output -raw alb_dns_name)/api/health | jq .

# Ver logs
aws logs tail /entrevista-ai/dev --follow
```

---

### Staging / Producción

Para crear ambientes adicionales, copiar la configuración de dev y ajustar:

```bash
# Copiar ambiente
cp -r terraform/environments/dev terraform/environments/staging
```

Editar `terraform/environments/staging/main.tf`:

```hcl
# Cambiar backend key
backend "s3" {
  key = "staging/terraform.tfstate"  # ← cambiar de "dev/" a "staging/"
}

# Cambiar variables
variable "environment" { default = "staging" }
variable "app_url"     { default = "https://staging.entrevista-ai.example.com" }
```

Valores recomendados por ambiente:

| Variable | dev | staging | prod |
|----------|-----|---------|------|
| `environment` | `dev` | `staging` | `prod` |
| `cpu` | 256 | 512 | 1024 |
| `memory` | 512 | 1024 | 2048 |
| `desired_count` | 1 | 1 | 2 |
| `max_count` | 1 | 3 | 10 |
| `pitr_enabled` | false | true | true |
| `retention_days` | 7 | 30 | 90 |

---

## Comandos Útiles

### Terraform

```bash
# Ver estado actual
terraform state list

# Ver detalle de un recurso
terraform state show module.dynamodb.aws_dynamodb_table.conversations

# Importar recurso existente
terraform import module.dynamodb.aws_dynamodb_table.conversations TABLE_NAME

# Refrescar estado
terraform refresh

# Formatear archivos
terraform fmt -recursive

# Validar configuración
terraform validate

# Ver outputs
terraform output
terraform output -json
```

### Diagnóstico

```bash
# Ver logs de ECS en tiempo real
aws logs tail /entrevista-ai/dev --follow --since 5m

# Describir servicio ECS
aws ecs describe-services \
  --cluster entrevista-ai-dev \
  --services entrevista-ai-dev

# Listar tasks corriendo
aws ecs list-tasks --cluster entrevista-ai-dev

# Ver items en DynamoDB (dev)
aws dynamodb scan --table-name entrevista-ai-dev-campaigns --max-items 5

# Ver items en DynamoDB (local)
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name entrevista-ai-local-campaigns --max-items 5
```

---

## Variables de Entorno de la Aplicación

Variables inyectadas al contenedor ECS via task definition:

| Variable | Fuente | Descripción |
|----------|--------|-------------|
| `NODE_ENV` | Variable | `development` / `dev` / `staging` / `production` |
| `DYNAMODB_TABLE_PREFIX` | DynamoDB module | Prefijo de tablas (`entrevista-ai-{env}-`) |
| `DYNAMODB_ENDPOINT` | Variable (solo local) | `http://localhost:4566` |
| `AWS_REGION` | Variable | `us-east-1` |
| `NEXTAUTH_URL` | Variable | URL pública de la app |
| `COGNITO_ISSUER` | Cognito module | URL del issuer de Cognito |
| `COGNITO_CLIENT_ID` | Cognito module | Client ID de Cognito |
| `TELEGRAM_WEBHOOK_URL` | Variable | `{app_url}/api/telegram/webhook` |
| `OPENAI_API_KEY` | Secrets Manager | API key de OpenAI |
| `TELEGRAM_BOT_TOKEN` | Secrets Manager | Token del bot de Telegram |
| `NEXTAUTH_SECRET` | Secrets Manager | Secret para sesiones |
| `COGNITO_CLIENT_SECRET` | Secrets Manager | Client secret de Cognito |
