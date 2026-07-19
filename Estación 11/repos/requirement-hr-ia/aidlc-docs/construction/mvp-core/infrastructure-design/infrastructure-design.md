# Infrastructure Design — Unit 1: MVP Core

## Logical → Physical Mapping

| Logical Component | AWS Service | Terraform Module |
|---|---|---|
| LC-01: Load Balancer | Application Load Balancer | `terraform/modules/alb/` |
| LC-02: Compute | ECS Fargate (service + task definition) | `terraform/modules/ecs/` |
| LC-03: Database | DynamoDB (6 tables + 3 GSIs) | `terraform/modules/dynamodb/` |
| LC-04: Authentication | Cognito User Pool + App Client | `terraform/modules/cognito/` |
| LC-05: Container Registry | ECR Repository | `terraform/modules/ecr/` |
| LC-06: Networking | VPC + Subnets + NAT + IGW + Endpoints | `terraform/modules/vpc/` |
| LC-07: Logging/Monitoring | CloudWatch Logs + Alarms | `terraform/modules/cloudwatch/` |
| Secrets | AWS Secrets Manager | `terraform/modules/secrets/` |

---

## Terraform Module Structure

```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf              # VPC, subnets, IGW, NAT, route tables
│   │   ├── endpoints.tf         # DynamoDB gateway endpoint, CW Logs interface endpoint
│   │   ├── security_groups.tf   # ALB SG, ECS SG
│   │   ├── variables.tf
│   │   └── outputs.tf           # vpc_id, subnet_ids, sg_ids
│   │
│   ├── alb/
│   │   ├── main.tf              # ALB, target group, listeners (HTTP→HTTPS redirect, HTTPS→TG)
│   │   ├── variables.tf
│   │   └── outputs.tf           # alb_dns_name, alb_arn, target_group_arn
│   │
│   ├── ecs/
│   │   ├── main.tf              # ECS cluster, service, task definition
│   │   ├── iam.tf               # Task execution role, task role (DynamoDB, CW Logs, Secrets)
│   │   ├── autoscaling.tf       # App auto-scaling (CPU target tracking)
│   │   ├── variables.tf
│   │   └── outputs.tf           # cluster_arn, service_name
│   │
│   ├── dynamodb/
│   │   ├── main.tf              # 6 tables with on-demand capacity
│   │   ├── variables.tf         # table_prefix, pitr_enabled
│   │   └── outputs.tf           # table_names, table_arns
│   │
│   ├── cognito/
│   │   ├── main.tf              # User Pool, App Client, domain
│   │   ├── variables.tf
│   │   └── outputs.tf           # user_pool_id, client_id, client_secret, issuer_url
│   │
│   ├── ecr/
│   │   ├── main.tf              # ECR repository, lifecycle policy, scanning
│   │   ├── variables.tf
│   │   └── outputs.tf           # repository_url
│   │
│   ├── cloudwatch/
│   │   ├── main.tf              # Log group, metric alarms
│   │   ├── variables.tf
│   │   └── outputs.tf           # log_group_name
│   │
│   └── secrets/
│       ├── main.tf              # Secrets Manager secrets (OpenAI key, Telegram token, NextAuth secret)
│       ├── variables.tf
│       └── outputs.tf           # secret_arns
│
├── environments/
│   ├── dev/
│   │   ├── main.tf              # Module instantiation with dev values
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   ├── backend.tf           # S3 backend for state
│   │   └── outputs.tf
│   ├── staging/
│   │   └── (same structure)
│   └── prod/
│       └── (same structure)
│
├── main.tf                      # Root module (optional — can use environment-specific)
├── variables.tf
└── outputs.tf
```

---

## Module Specifications

### VPC Module (`terraform/modules/vpc/`)

```hcl
# Key resources:
resource "aws_vpc" "main"                    # CIDR: 10.0.0.0/16
resource "aws_subnet" "public" (count=2)     # 10.0.1.0/24, 10.0.2.0/24
resource "aws_subnet" "private" (count=2)    # 10.0.10.0/24, 10.0.20.0/24
resource "aws_internet_gateway" "igw"
resource "aws_nat_gateway" "nat"             # Single NAT (cost saving for MVP)
resource "aws_route_table" "public"          # → IGW
resource "aws_route_table" "private"         # → NAT

# VPC Endpoints (cost optimization):
resource "aws_vpc_endpoint" "dynamodb"       # Gateway endpoint (free)
resource "aws_vpc_endpoint" "logs"           # Interface endpoint (CW Logs)

# Security Groups:
resource "aws_security_group" "alb"          # Inbound: 80, 443 from 0.0.0.0/0
resource "aws_security_group" "ecs"          # Inbound: 3000 from ALB SG only
                                             # Outbound: 443 (HTTPS)
```

### ECS Module (`terraform/modules/ecs/`)

```hcl
resource "aws_ecs_cluster" "main"

resource "aws_ecs_task_definition" "app" {
  family                   = "entrevista-ai-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "entrevista-ai"
    image     = "${var.ecr_repository_url}:${var.image_tag}"
    portMappings = [{ containerPort = 3000 }]
    environment = [
      { name = "NODE_ENV",           value = var.environment },
      { name = "DYNAMODB_TABLE_PREFIX", value = var.table_prefix },
      { name = "AWS_REGION",         value = var.aws_region },
      { name = "NEXTAUTH_URL",       value = var.app_url },
      { name = "COGNITO_ISSUER",     value = var.cognito_issuer },
      { name = "COGNITO_CLIENT_ID",  value = var.cognito_client_id },
      { name = "TELEGRAM_WEBHOOK_URL", value = "${var.app_url}/api/telegram/webhook" },
    ]
    secrets = [
      { name = "OPENAI_API_KEY",        valueFrom = var.openai_secret_arn },
      { name = "TELEGRAM_BOT_TOKEN",    valueFrom = var.telegram_secret_arn },
      { name = "NEXTAUTH_SECRET",       valueFrom = var.nextauth_secret_arn },
      { name = "COGNITO_CLIENT_SECRET", valueFrom = var.cognito_secret_arn },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = var.log_group_name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count  # default: 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "entrevista-ai"
    container_port   = 3000
  }
}

# Auto-scaling
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

# IAM: Task role (what the container can do)
resource "aws_iam_role" "ecs_task" {
  # Permissions: DynamoDB CRUD, CloudWatch Logs write
}

# IAM: Execution role (what ECS agent can do)
resource "aws_iam_role" "ecs_execution" {
  # Permissions: ECR pull, CloudWatch Logs create, Secrets Manager read
}
```

### DynamoDB Module (`terraform/modules/dynamodb/`)

```hcl
# 6 tables, all with on-demand capacity, encryption, PITR

resource "aws_dynamodb_table" "conversations" {
  name         = "${var.table_prefix}-conversations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "conversationId"

  attribute { name = "tenantId"                  type = "S" }
  attribute { name = "conversationId"            type = "S" }
  attribute { name = "telegramUserIdCampaignId"  type = "S" }

  global_secondary_index {
    name            = "ByTelegram"
    hash_key        = "telegramUserIdCampaignId"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
  server_side_encryption  { enabled = true }
}

# Similar for: campaigns, candidates (+ 2 GSIs), evaluations, audit-events, consent
```

### Cognito Module (`terraform/modules/cognito/`)

```hcl
resource "aws_cognito_user_pool" "main" {
  name = "entrevista-ai-${var.environment}"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
  }

  schema {
    attribute_data_type = "String"
    name                = "tenantId"
    mutable             = false
    string_attribute_constraints { min_length = 1, max_length = 256 }
  }

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]
}

resource "aws_cognito_user_pool_client" "app" {
  name                                 = "entrevista-ai-app"
  user_pool_id                         = aws_cognito_user_pool.main.id
  generate_secret                      = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls                        = ["${var.app_url}/api/auth/callback/cognito"]
  logout_urls                          = ["${var.app_url}"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "entrevista-ai-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}
```

---

## IAM Permissions Summary

### ECS Task Role (what the application can access)

| Service | Actions | Resource |
|---|---|---|
| DynamoDB | GetItem, PutItem, UpdateItem, Query, BatchGetItem, BatchWriteItem | All 6 tables + GSIs |
| CloudWatch Logs | CreateLogStream, PutLogEvents | Application log group |

### ECS Execution Role (what ECS agent needs)

| Service | Actions | Resource |
|---|---|---|
| ECR | GetAuthorizationToken, GetDownloadUrlForLayer, BatchGetImage | ECR repository |
| CloudWatch Logs | CreateLogGroup, CreateLogStream, PutLogEvents | Application log group |
| Secrets Manager | GetSecretValue | 4 secrets (OpenAI, Telegram, NextAuth, Cognito) |

---

## Environment Configuration

| Parameter | Dev | Staging | Prod |
|---|---|---|---|
| ECS desired count | 1 | 1 | 2 |
| ECS max count | 1 | 2 | 3 |
| ECS CPU | 256 | 512 | 512 |
| ECS Memory | 512 | 1024 | 1024 |
| DynamoDB PITR | false | true | true |
| CloudWatch retention | 7 days | 30 days | 30 days |
| NAT Gateway | 1 | 1 | 2 (HA) |
| Terraform state | S3 + DynamoDB lock | S3 + DynamoDB lock | S3 + DynamoDB lock |
