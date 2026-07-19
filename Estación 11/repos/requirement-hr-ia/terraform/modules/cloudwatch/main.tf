variable "project_name" { type = string }
variable "environment" { type = string }
variable "retention_days" {
  type    = number
  default = 30
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}/${var.environment}"
  retention_in_days = var.retention_days
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "ECS CPU utilization above 80%"

  dimensions = {
    ClusterName = "${var.project_name}-${var.environment}"
    ServiceName = "${var.project_name}-${var.environment}"
  }
}

output "log_group_name" { value = aws_cloudwatch_log_group.app.name }
output "log_group_arn"  { value = aws_cloudwatch_log_group.app.arn }
