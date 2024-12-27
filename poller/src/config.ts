// config.ts
export const MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/moviemate_test"
export const AWS_REGION: string = process.env.AWS_REGION || "us-east-1";
export const TASK_DEFINITION_ARN: string = process.env.TASK_DEFINITION_ARN || "arn:aws:ecs:us-east-1:533267321799:task-definition/transcoder-task";
export const CLUSTER_ARN: string = process.env.CLUSTER_ARN || "arn:aws:ecs:us-east-1:533267321799:cluster/dev-cluster";
export const CONTAINER_NAME: string = process.env.CONTAINER_NAME || "transcoder";
export const QUEUE_URL: string = process.env.QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/533267321799/videosqueue";
export const SG_GROUP_ID: string = process.env.SG_GROUP_ID || "sg-094f7ee1f5f0ce1b5";
export const SUBNET_ID: string = process.env.SUBNET_ID || "subnet-0efe005dc85ab61a7";