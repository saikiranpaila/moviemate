variable "region" {
  description = "region where the resources gets deployed"
  type        = string
  default     = "us-east-1"
}

variable "source_bucket" {
  description = "source bucket name"
  type        = string
  default     = "src.bucket.moviemate"
}

variable "destination_bucket" {
  description = "destination bucket name"
  type        = string
  default     = "dest.bucket.moviemate"
}

variable "azs" {
  description = "Availability zones for VPC"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

