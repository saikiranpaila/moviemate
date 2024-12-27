variable "region" {
  description = "region where the resources gets deployed"
  type        = string
  default     = ""
}

variable "source_bucket" {
  description = "source bucket name"
  type        = string
  default     = ""
}

variable "destination_bucket" {
  description = "destination bucket name"
  type        = string
  default     = ""
}

variable "azs" {
  description = "Availability zones for VPC"
  type        = list(string)
  default     = [""]
}

