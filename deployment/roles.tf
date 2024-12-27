data "aws_iam_policy_document" "assume_role_policy_ecs" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ecs.json
}

# ECS Task Role for S3 access
resource "aws_iam_role" "moviemate_s3_access" {
  name               = "ecs-task-s3-access"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ecs.json
}

# ECS Task Role for SQS and ECS access
resource "aws_iam_role" "moviemate_sqs_and_ecs_access" {
  name               = "ecs-task-sqs-and-ecs-access"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ecs.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "moviemate_s3_access_policy_attachment" {
  role       = aws_iam_role.moviemate_s3_access.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "moviemate_sqs_access" {
  role       = aws_iam_role.moviemate_sqs_and_ecs_access.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}

resource "aws_iam_role_policy_attachment" "moviemate_ecs_access" {
  role       = aws_iam_role.moviemate_sqs_and_ecs_access.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
}
