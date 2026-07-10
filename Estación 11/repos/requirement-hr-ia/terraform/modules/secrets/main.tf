variable "project_name" { type = string }
variable "environment" { type = string }

resource "aws_secretsmanager_secret" "openai_api_key" {
  name = "${var.project_name}-${var.environment}-openai-api-key"
}

resource "aws_secretsmanager_secret" "telegram_bot_token" {
  name = "${var.project_name}-${var.environment}-telegram-bot-token"
}

resource "aws_secretsmanager_secret" "nextauth_secret" {
  name = "${var.project_name}-${var.environment}-nextauth-secret"
}

resource "aws_secretsmanager_secret" "cognito_client_secret" {
  name = "${var.project_name}-${var.environment}-cognito-client-secret"
}

output "openai_secret_arn"   { value = aws_secretsmanager_secret.openai_api_key.arn }
output "telegram_secret_arn" { value = aws_secretsmanager_secret.telegram_bot_token.arn }
output "nextauth_secret_arn" { value = aws_secretsmanager_secret.nextauth_secret.arn }
output "cognito_secret_arn"  { value = aws_secretsmanager_secret.cognito_client_secret.arn }
