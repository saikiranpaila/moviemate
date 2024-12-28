resource "aws_ecs_task_definition" "task_definition_moviemate_client" {
  family                   = "moviemate_client"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  cpu                      = 256
  memory                   = 1024
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = "startup-container"
      image     = "${aws_ecr_repository.moviemate_startup_repository.repository_url}"
      essential = false
      environment = [
        {
          name  = "MONGO_HOST"
          value = "mongo.local"
        },
        {
          name  = "MONGO_PORT"
          value = "27017"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.startup-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "startup-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
    },
    {
      name      = "moviemate-client-container"
      image     = "${aws_ecr_repository.moviemate_client_repository.repository_url}"
      essential = true
      environment = [
        {
          name  = "MONGO_URI"
          value = "mongodb://mongo.local:27017/moviemate"
        }
      ]
      portMappings = [
        {
          name          = "client-port"
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.moviemate-client-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "moviemate-client-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "task_definition_moviemate_admin" {
  family             = "moviemate_admin"
  network_mode       = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.moviemate_s3_access.arn
  cpu                = 256
  memory             = 1024
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = "startup-container"
      image     = "${aws_ecr_repository.moviemate_startup_repository.repository_url}"
      essential = false
      environment = [
        {
          name  = "MONGO_HOST"
          value = "mongo.local"
        },
        {
          name  = "MONGO_PORT"
          value = "27017"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.startup-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "startup-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
    },
    {
      name      = "moviemate-admin-container"
      image     = "${aws_ecr_repository.moviemate_admin_repository.repository_url}"
      essential = true
      environment = [
        {
          name  = "MONGO_URI"
          value = "mongodb://mongo.local:27017/moviemate"
        },
        {
          name  = "REGION"
          value = "${var.region}"
        },
        {
          name  = "SOURCE_BUCKET"
          value = "${module.s3_source_bucket.s3_bucket_id}"
        }
      ]
      portMappings = [
        {
          name          = "admin-port"
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.moviemate-admin-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "moviemate-admin-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
      dependsOn = [
        {
          containerName = "startup-container"
          condition     = "SUCCESS"
        }
      ]
    }
  ])
}

resource "aws_ecs_task_definition" "task_definition_moviemate_database" {
  family             = "moviemate_database"
  network_mode       = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  cpu                = 256
  memory             = 1024
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name        = "moviemate-database-container"
      image       = "${aws_ecr_repository.moviemate_database_repository.repository_url}"
      essential   = true
      environment = []
      portMappings = [
        {
          name          = "mongo-port"
          containerPort = 27017
          hostPort      = 27017
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.database-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "moviemate-database-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "task_definition_moviemate_poller" {
  family             = "moviemate_poller"
  network_mode       = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.moviemate_sqs_and_ecs_access.arn
  cpu                = 256
  memory             = 1024
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = "startup-container"
      image     = "${aws_ecr_repository.moviemate_startup_repository.repository_url}"
      essential = false
      environment = [
        {
          name  = "MONGO_HOST"
          value = "mongo.local"
        },
        {
          name  = "MONGO_PORT"
          value = "27017"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.startup-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "startup-container"
          awslogs-create-group  = "true"
          max-buffer-size       = "25m"
        }
      }
    },
    {
      name      = "moviemate-poller-container"
      image     = "${aws_ecr_repository.moviemate_poller_repository.repository_url}"
      essential = true
      environment = [
        {
          name  = "MONGO_URI"
          value = "mongodb://mongo.local:27017/moviemate"
        },
        {
          name  = "AWS_REGION"
          value = "${var.region}"
        },
        {
          name  = "TASK_DEFINITION_ARN"
          value = "${aws_ecs_task_definition.task_definition_moviemate_transcoder.arn}"
        },
        {
          name  = "CLUSTER_ARN"
          value = "${aws_ecs_cluster.moviemate_cluster.arn}"
        },
        {
          name  = "CONTAINER_NAME"
          value = "${local.transcoder_container_name}"
        },
        {
          name  = "QUEUE_URL"
          value = "${aws_sqs_queue.movies_queue.url}"
        },
        {
          name  = "SG_GROUP_ID"
          value = "${aws_security_group.moviemate_security_group.id}"
        },
        {
          name  = "SUBNET_ID"
          value = "${aws_subnet.public_subnet_a.id}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.poller-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "poller-container"
          max-buffer-size       = "25m"
        }
      }
      dependsOn = [
        {
          containerName = "startup-container"
          condition     = "SUCCESS"
        }
      ]
    }
  ])
}

resource "aws_ecs_task_definition" "task_definition_moviemate_transcoder" {
  family             = "moviemate_transcoder"
  network_mode       = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.moviemate_s3_access.arn
  cpu                = 4096
  memory             = 8192
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = "${local.transcoder_container_name}"
      image     = "${aws_ecr_repository.moviemate_transcoder_repository.repository_url}"
      essential = true
      environment = [
        {
          name  = "AWS_REGION"
          value = "${var.region}"
        },
        {
          name  = "SOURCE_BUCKET"
          value = "${module.s3_source_bucket.s3_bucket_id}"
        },
        {
          name  = "TARGET_BUCKET"
          value = "${module.s3_destination_bucket.s3_bucket_id}"
        },
        {
          name  = "SOURCE_KEY"
          value = ""
        },
        {
          name  = "MONGO_URI"
          value = "mongodb://mongo.local:27017/moviemate"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.transcoder-container-log-group.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "transcoder-container"
          max-buffer-size       = "25m"
        }
      }
    }
  ])
}

# Log groups
resource "aws_cloudwatch_log_group" "startup-container-log-group" {
  name              = "/ecs/startup-container-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "moviemate-client-container-log-group" {
  name              = "/ecs/moviemate-client-container-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "moviemate-admin-container-log-group" {
  name              = "/ecs/moviemate-admin-container-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "database-container-log-group" {
  name              = "/ecs/database-container-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "poller-container-log-group" {
  name              = "/ecs/poller-container-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "transcoder-container-log-group" {
  name              = "/ecs/transcoder-container-logs"
  retention_in_days = 7
}

locals {
  transcoder_container_name = "moviemate-transcoder-container"
}
