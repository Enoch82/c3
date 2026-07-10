variable "project_name" { type = string }
variable "environment" { type = string }

variable "pitr_enabled" {
  type    = bool
  default = true
}

locals { prefix = "${var.project_name}-${var.environment}" }

resource "aws_dynamodb_table" "conversations" {
  name         = "${local.prefix}-conversations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "conversationId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "conversationId"
    type = "S"
  }

  attribute {
    name = "telegramUserIdCampaignId"
    type = "S"
  }

  global_secondary_index {
    name            = "ByTelegram"
    hash_key        = "telegramUserIdCampaignId"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

resource "aws_dynamodb_table" "campaigns" {
  name         = "${local.prefix}-campaigns"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "campaignId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "campaignId"
    type = "S"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

resource "aws_dynamodb_table" "candidates" {
  name         = "${local.prefix}-candidates"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "candidateId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "candidateId"
    type = "S"
  }

  attribute {
    name = "campaignId"
    type = "S"
  }

  attribute {
    name = "state"
    type = "S"
  }

  attribute {
    name = "telegramUserId"
    type = "S"
  }

  global_secondary_index {
    name            = "ByCampaign"
    hash_key        = "campaignId"
    range_key       = "state"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "ByTelegram"
    hash_key        = "telegramUserId"
    range_key       = "tenantId"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

resource "aws_dynamodb_table" "evaluations" {
  name         = "${local.prefix}-evaluations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "conversationId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "conversationId"
    type = "S"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

resource "aws_dynamodb_table" "audit_events" {
  name         = "${local.prefix}-audit-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "eventId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

resource "aws_dynamodb_table" "consent" {
  name         = "${local.prefix}-consent"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenantId"
  range_key    = "candidateId"

  attribute {
    name = "tenantId"
    type = "S"
  }

  attribute {
    name = "candidateId"
    type = "S"
  }

  point_in_time_recovery { enabled = var.pitr_enabled }
  server_side_encryption { enabled = true }
}

output "table_arns" {
  value = [
    aws_dynamodb_table.conversations.arn,
    aws_dynamodb_table.campaigns.arn,
    aws_dynamodb_table.candidates.arn,
    aws_dynamodb_table.evaluations.arn,
    aws_dynamodb_table.audit_events.arn,
    aws_dynamodb_table.consent.arn,
  ]
}

output "table_prefix" { value = local.prefix }
