# ECS Cluster Creation
resource "aws_ecs_cluster" "moviemate_cluster" {
  name = "moviemate_cluster"
  service_connect_defaults {
    namespace = aws_service_discovery_http_namespace.local.arn
  }
}
