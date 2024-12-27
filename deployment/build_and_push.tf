
# Locals with images
locals {
  images = {
    "moviemate_client" = {
      context = "./../moviemate_client/"
      tag     = aws_ecr_repository.moviemate_client_repository.repository_url
    },
    "moviemate_admin" = {
      context = "./../moviemate_admin/"
      tag     = aws_ecr_repository.moviemate_admin_repository.repository_url
    },
    "moviemate_database" = {
      context = "./../database/"
      tag     = aws_ecr_repository.moviemate_database_repository.repository_url
    },
    "moviemate_poller" = {
      context = "./../poller/"
      tag     = aws_ecr_repository.moviemate_poller_repository.repository_url
    },
    "moviemate_startup" = {
      context = "./../startup/"
      tag     = aws_ecr_repository.moviemate_startup_repository.repository_url
    },
    "moviemate_transcoder" = {
      context = "./../transcoder/"
      tag     = aws_ecr_repository.moviemate_transcoder_repository.repository_url
    }
  }
}

# Build Docker images with for_each on the map
resource "null_resource" "login" {

  provisioner "local-exec" {
    command = "aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${aws_ecr_repository.moviemate_startup_repository.repository_url}"
  }

  depends_on = [
    aws_ecr_repository.moviemate_client_repository,
    aws_ecr_repository.moviemate_admin_repository,
    aws_ecr_repository.moviemate_database_repository,
    aws_ecr_repository.moviemate_poller_repository,
    aws_ecr_repository.moviemate_transcoder_repository,
    aws_ecr_repository.moviemate_startup_repository
  ]
}

resource "null_resource" "build" {
  for_each = local.images
  provisioner "local-exec" {
    command = "docker build -t ${each.value.tag}:latest ${each.value.context}"
  }

  depends_on = [
    null_resource.login
  ]
}

resource "null_resource" "push" {
  for_each = local.images

  provisioner "local-exec" {
    command = "docker push ${each.value.tag}:latest"
  }

  depends_on = [
    null_resource.build
  ]
}
