terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "entrevista-ai-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
    }
  }
}

variable "project_name" { default = "entrevista-ai" }
variable "environment"  { default = "dev" }
variable "aws_region"   { default = "us-east-1" }
variable "app_url"      { default = "https://dev.entrevista-ai.example.com" }
variable "certificate_arn" { type = string }

module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

module "ecr" {
  source       = "../../modules/ecr"
  project_name = var.project_name
}

module "cloudwatch" {
  source         = "../../modules/cloudwatch"
  project_name   = var.project_name
  environment    = var.environment
  retention_days = 7
}

module "secrets" {
  source       = "../../modules/secrets"
  project_name = var.project_name
  environment  = var.environment
}

module "cognito" {
  source       = "../../modules/cognito"
  project_name = var.project_name
  environment  = var.environment
  app_url      = var.app_url
}

module "dynamodb" {
  source       = "../../modules/dynamodb"
  project_name = var.project_name
  environment  = var.environment
  pitr_enabled = false
}

module "alb" {
  source                = "../../modules/alb"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.vpc.alb_security_group_id
  certificate_arn       = var.certificate_arn
}

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
    { name = "NODE_ENV",              value = var.environment },
    { name = "DYNAMODB_TABLE_PREFIX", value = module.dynamodb.table_prefix },
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

output "alb_dns_name"     { value = module.alb.alb_dns_name }
output "ecr_repository"   { value = module.ecr.repository_url }
output "cognito_pool_id"  { value = module.cognito.user_pool_id }
output "cognito_client_id" { value = module.cognito.client_id }
