variable "project_name" { type = string }
variable "environment" { type = string }
variable "app_url" { type = string }

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  schema {
    attribute_data_type      = "String"
    name                     = "tenantId"
    mutable                  = false
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "app" {
  name                                 = "${var.project_name}-app"
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
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

output "user_pool_id"    { value = aws_cognito_user_pool.main.id }
output "client_id"       { value = aws_cognito_user_pool_client.app.id }
output "client_secret" {
  value     = aws_cognito_user_pool_client.app.client_secret
  sensitive = true
}
output "issuer_url"      { value = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.main.id}" }

data "aws_region" "current" {}
