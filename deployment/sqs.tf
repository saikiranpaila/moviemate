# Define the SQS Queue
resource "aws_sqs_queue" "movies_queue" {
  name                       = "movies_queue" # The name of the SQS queue
  delay_seconds              = 0              # The time in seconds that the delivery of all messages in the queue will be delayed
  max_message_size           = 262144         # Maximum message size (in bytes)
  message_retention_seconds  = 345600         # Message retention period (in seconds, 345600 = 4 days)
  receive_wait_time_seconds  = 0              # Long polling wait time in seconds
  visibility_timeout_seconds = 60             # The visibility timeout for messages (in seconds)
  sqs_managed_sse_enabled    = false
}

# Retrieve the AWS Account ID dynamically
data "aws_caller_identity" "current" {}

# Define the SQS Queue Policy (attach all necessary permissions directly)
resource "aws_sqs_queue_policy" "movies_queue_policy" {
  queue_url = aws_sqs_queue.movies_queue.id

  # Define the entire policy as a JSON string
  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "__default_policy_ID"
    Statement = [
      # allows full access to the root account
      {
        Sid    = "__owner_statement"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "SQS:*"
        Resource = "${aws_sqs_queue.movies_queue.arn}"
      },
      # New statement to allow S3 to send messages to the SQS queue
      {
        Sid    = "Stmt1734857933361"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = "${aws_sqs_queue.movies_queue.arn}"
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = "${module.s3_source_bucket.s3_bucket_arn}"
          }
        }
      },
      {
        Sid    = "Stmt1734857933362"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = "${aws_sqs_queue.movies_queue.arn}"
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = "${module.s3_destination_bucket.s3_bucket_arn}"
          }
        }
      }
    ]
  })
}
