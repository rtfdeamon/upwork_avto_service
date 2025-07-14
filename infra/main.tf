terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

resource "aws_sqs_queue" "jobs_discovered" {
  name                        = "jobs-discovered.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
}

resource "aws_sqs_queue" "proposals" {
  name                        = "proposals.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
}

resource "aws_iam_role" "lambda_worker" {
  name               = "lambda_worker"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_worker_policy" {
  name = "lambda_worker_policy"
  role = aws_iam_role.lambda_worker.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Effect   = "Allow"
        Resource = aws_sqs_queue.jobs_discovered.arn
      },
      {
        Action   = ["sqs:SendMessage"]
        Effect   = "Allow"
        Resource = [aws_sqs_queue.jobs_discovered.arn, aws_sqs_queue.proposals.arn]
      },
      {
        Action   = "secretsmanager:GetSecretValue"
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "poller" {
  function_name = "job-poller"
  role          = aws_iam_role.lambda_worker.arn
  handler       = "poller.handler"
  runtime       = "nodejs18.x"
  filename      = "../dist/poller.zip"
}

resource "aws_lambda_function" "activity_feed" {
  function_name = "activity-feed"
  role          = aws_iam_role.lambda_worker.arn
  handler       = "activity-feed.handler"
  runtime       = "nodejs18.x"
  filename      = "../dist/activity-feed.zip"
}

resource "aws_cloudwatch_event_rule" "poll_activity_feed" {
  name                = "poll-activity-feed"
  schedule_expression = "rate(30 seconds)"
}

resource "aws_cloudwatch_event_target" "activity_target" {
  rule = aws_cloudwatch_event_rule.poll_activity_feed.name
  arn  = aws_lambda_function.activity_feed.arn
}

resource "aws_lambda_permission" "allow_eventbridge_activity" {
  statement_id  = "AllowActivityFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.activity_feed.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.poll_activity_feed.arn
}

resource "aws_cloudwatch_event_rule" "poll_upwork_jobs" {
  name                = "poll-upwork-jobs"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "poller_target" {
  rule = aws_cloudwatch_event_rule.poll_upwork_jobs.name
  arn  = aws_lambda_function.poller.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.poller.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.poll_upwork_jobs.arn
}
