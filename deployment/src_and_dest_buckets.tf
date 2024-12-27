module "s3_source_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.3.0"

  bucket = var.source_bucket

  force_destroy = true

  cors_rule = [
    {
      allowed_headers = ["*"]                  # Allow any headers
      allowed_methods = ["GET", "PUT", "POST"] # Allow GET, PUT, and POST methods
      allowed_origins = ["*"]                  # Allow all origins (any domain)
      expose_headers  = ["Etag"]               # Expose the "Etag" header
    }
  ]
}

resource "aws_s3_bucket_notification" "s3_event_notification_src_bucket" {
  bucket = module.s3_source_bucket.s3_bucket_id
  queue {
    queue_arn     = aws_sqs_queue.movies_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_suffix = ".mp4"
  }
  depends_on = [aws_sqs_queue_policy.movies_queue_policy]
}


module "s3_destination_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.3.0"

  bucket = var.destination_bucket

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  force_destroy = true

  cors_rule = [
    {
      allowed_headers = ["*"]   # Allow any headers
      allowed_methods = ["GET"] # Allow GET
      allowed_origins = ["*"]   # Allow all origins (any domain)
      expose_headers  = []      # Expose the no header
    }
  ]
}

resource "aws_s3_bucket_notification" "s3_event_notification_dest_bucket" {
  bucket = module.s3_destination_bucket.s3_bucket_id
  queue {
    queue_arn     = aws_sqs_queue.movies_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_suffix = "master.m3u8"
  }
  depends_on = [aws_sqs_queue_policy.movies_queue_policy]
}

data "aws_iam_policy_document" "s3_get_object_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_destination_bucket.s3_bucket_arn}/*"]
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "s3_policy" {
  bucket     = module.s3_destination_bucket.s3_bucket_id
  policy     = data.aws_iam_policy_document.s3_get_object_policy.json
  depends_on = [module.s3_destination_bucket, data.aws_iam_policy_document.s3_get_object_policy]
}
