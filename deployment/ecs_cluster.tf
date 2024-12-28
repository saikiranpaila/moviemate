# ECS Cluster Creation
resource "aws_ecs_cluster" "moviemate_cluster" {
  name = "moviemate_cluster"
}
