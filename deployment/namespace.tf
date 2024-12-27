resource "aws_service_discovery_http_namespace" "local" {
  name        = "moviemate"
  description = "local namespace for moviemate services"
}
