resource "aws_ecs_service" "moviemate_database_service" {
  name                  = "moviemate-database-service"
  cluster               = aws_ecs_cluster.moviemate_cluster.id
  task_definition       = aws_ecs_task_definition.task_definition_moviemate_database.arn
  desired_count         = 1
  launch_type           = "FARGATE"
  wait_for_steady_state = true

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id, aws_subnet.public_subnet_c.id]
    security_groups  = [aws_security_group.moviemate_security_group.id]
    assign_public_ip = true
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.local.name
    service {
      client_alias {
        dns_name = "mongo.local"
        port     = 27017
      }
      discovery_name = "mongo"
      port_name      = "mongo-port"
    }
  }
  depends_on = [null_resource.push]
}


resource "aws_ecs_service" "moviemate_admin_service" {
  name            = "moviemate-admin-service"
  cluster         = aws_ecs_cluster.moviemate_cluster.id
  task_definition = aws_ecs_task_definition.task_definition_moviemate_admin.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
    security_groups  = [aws_security_group.moviemate_security_group.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_admin_tg.arn
    container_name   = "moviemate-admin-container"
    container_port   = 3000
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.local.name
  }
  depends_on = [null_resource.push, aws_ecs_service.moviemate_database_service]
}

resource "aws_ecs_service" "moviemate_client_service" {
  name            = "moviemate-client-service"
  cluster         = aws_ecs_cluster.moviemate_cluster.id
  task_definition = aws_ecs_task_definition.task_definition_moviemate_client.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
    security_groups  = [aws_security_group.moviemate_security_group.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "moviemate-client-container"
    container_port   = 3000
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.local.name
  }
  depends_on = [null_resource.push, aws_ecs_service.moviemate_database_service]
}

resource "aws_ecs_service" "moviemate_poller_service" {
  name            = "moviemate-poller-service"
  cluster         = aws_ecs_cluster.moviemate_cluster.id
  task_definition = aws_ecs_task_definition.task_definition_moviemate_poller.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
    security_groups  = [aws_security_group.moviemate_security_group.id]
    assign_public_ip = true
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.local.name
  }
  depends_on = [null_resource.push, aws_ecs_service.moviemate_database_service]
}

# ALB
resource "aws_lb" "frontend_alb" {
  name               = "moviematelb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.moviemate_security_group.id]
  subnets            = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id, aws_subnet.public_subnet_c.id]
}

# ALB Target Group
resource "aws_lb_target_group" "frontend_tg" {
  name        = "frontend-tg"
  protocol    = "HTTP"
  port        = 3000
  vpc_id      = aws_vpc.moviemate_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200"
  }
}

# ALB Listener for HTTP
resource "aws_lb_listener" "frontend_http_listener_client" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

# ALB
resource "aws_lb" "frontend_admin_alb" {
  name               = "moviemateadminlb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.moviemate_security_group.id]
  subnets            = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id, aws_subnet.public_subnet_c.id]
}

# ALB Target Group
resource "aws_lb_target_group" "frontend_admin_tg" {
  name        = "frontend-admin-tg"
  protocol    = "HTTP"
  port        = 3000
  vpc_id      = aws_vpc.moviemate_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200"
  }
}

# ALB Listener for HTTP
resource "aws_lb_listener" "frontend_http_listener_admin" {
  load_balancer_arn = aws_lb.frontend_admin_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_admin_tg.arn
  }
}

output "moviematelb" {
  value = aws_lb.frontend_alb.dns_name
}

output "moviemateadminlb" {
  value = aws_lb.frontend_admin_alb.dns_name
}
