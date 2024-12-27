# ECR Repositories creation
resource "aws_ecr_repository" "moviemate_client_repository" {
  name         = "moviemate/client"
  force_delete = true
}

resource "aws_ecr_repository" "moviemate_admin_repository" {
  name         = "moviemate/admin"
  force_delete = true
}

resource "aws_ecr_repository" "moviemate_database_repository" {
  name         = "moviemate/database"
  force_delete = true
}

resource "aws_ecr_repository" "moviemate_poller_repository" {
  name         = "moviemate/poller"
  force_delete = true
}

resource "aws_ecr_repository" "moviemate_transcoder_repository" {
  name         = "moviemate/transcoder"
  force_delete = true
}

resource "aws_ecr_repository" "moviemate_startup_repository" {
  name         = "moviemate/startup"
  force_delete = true
}
