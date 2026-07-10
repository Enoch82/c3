terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Local backend — no S3 needed for LocalStack
  backend "local" {
    path = "terraform.tfstate"
  }
}

# ──────────────────────────────────────────────
# LocalStack provider
# ──────────────────────────────────────────────
provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    acm                        = var.localstack_endpoint
    cloudwatch                 = var.localstack_endpoint
    cloudwatchlogs             = var.localstack_endpoint
    dynamodb                   = var.localstack_endpoint
    ec2                        = var.localstack_endpoint
    ecr                        = var.localstack_endpoint
    ecs                        = var.localstack_endpoint
    elasticloadbalancingv2     = var.localstack_endpoint
    iam                        = var.localstack_endpoint
    secretsmanager             = var.localstack_endpoint
    sts                        = var.localstack_endpoint
    cognitoidp                 = var.localstack_endpoint
  }

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      Provider    = "localstack"
    }
  }
}

# ──────────────────────────────────────────────
# Variables
# ──────────────────────────────────────────────
variable "project_name"        { default = "entrevista-ai" }
variable "environment"         { default = "local" }
variable "aws_region"          { default = "us-east-1" }
variable "localstack_endpoint" { default = "http://localhost:4566" }
variable "app_url"             { default = "http://localhost:3000" }

# ──────────────────────────────────────────────
# Modules — same as AWS, with local overrides
# ──────────────────────────────────────────────

# VPC
module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

# ECR
module "ecr" {
  source       = "../../modules/ecr"
  project_name = var.project_name
}

# CloudWatch (logs only)
module "cloudwatch" {
  source         = "../../modules/cloudwatch"
  project_name   = var.project_name
  environment    = var.environment
  retention_days = 1
}

# Secrets Manager
module "secrets" {
  source       = "../../modules/secrets"
  project_name = var.project_name
  environment  = var.environment
}

# Cognito
module "cognito" {
  source       = "../../modules/cognito"
  project_name = var.project_name
  environment  = var.environment
  app_url      = var.app_url
}

# DynamoDB (fully supported by LocalStack)
module "dynamodb" {
  source       = "../../modules/dynamodb"
  project_name = var.project_name
  environment  = var.environment
  pitr_enabled = false
}

# ALB — HTTP-only for LocalStack (no ACM/TLS needed)
module "alb" {
  source                = "../../modules/alb"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.vpc.alb_security_group_id
  enable_https          = false
}

# ECS
module "ecs" {
  source                = "../../modules/ecs"
  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  private_subnet_ids    = module.vpc.private_subnet_ids
  ecs_security_group_id = module.vpc.ecs_security_group_id
  target_group_arn      = module.alb.target_group_arn
  ecr_repository_url    = module.ecr.repository_url
  log_group_name        = module.cloudwatch.log_group_name
  cpu                   = 256
  memory                = 512
  desired_count         = 1
  max_count             = 1

  environment_variables = [
    { name = "NODE_ENV",              value = "development" },
    { name = "DYNAMODB_TABLE_PREFIX", value = module.dynamodb.table_prefix },
    { name = "DYNAMODB_ENDPOINT",     value = var.localstack_endpoint },
    { name = "AWS_REGION",            value = var.aws_region },
    { name = "NEXTAUTH_URL",          value = var.app_url },
    { name = "COGNITO_ISSUER",        value = module.cognito.issuer_url },
    { name = "COGNITO_CLIENT_ID",     value = module.cognito.client_id },
    { name = "TELEGRAM_WEBHOOK_URL",  value = "${var.app_url}/api/telegram/webhook" },
  ]

  secrets = [
    { name = "OPENAI_API_KEY",        valueFrom = module.secrets.openai_secret_arn },
    { name = "TELEGRAM_BOT_TOKEN",    valueFrom = module.secrets.telegram_secret_arn },
    { name = "NEXTAUTH_SECRET",       valueFrom = module.secrets.nextauth_secret_arn },
    { name = "COGNITO_CLIENT_SECRET", valueFrom = module.secrets.cognito_secret_arn },
  ]
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────
output "alb_dns_name"        { value = module.alb.alb_dns_name }
output "ecr_repository"      { value = module.ecr.repository_url }
output "cognito_pool_id"     { value = module.cognito.user_pool_id }
output "cognito_client_id"   { value = module.cognito.client_id }
output "dynamodb_tables"     { value = module.dynamodb.table_prefix }
output "localstack_endpoint" { value = var.localstack_endpoint }
