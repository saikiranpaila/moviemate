import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import type { S3Event } from 'aws-lambda'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'

const AWS_REGION = "us-east-1"

// Configure your AWS SQS Client
const sqsClient = new SQSClient({ region: AWS_REGION });
const ecsClient = new ECSClient({ region: AWS_REGION })
const queueUrl = "https://sqs.us-east-1.amazonaws.com/533267321799/videosqueue";

// Function to receive messages
async function receiveMessages(): Promise<void> {
    const params = {
        QueueUrl: queueUrl, // URL of the SQS queue
        MaxNumberOfMessages: 2, // Maximum messages to retrieve (1-10)
        WaitTimeSeconds: 1, // Long polling time (up to 20 seconds)
    };

    try {
        const command = new ReceiveMessageCommand(params);
        const response = await sqsClient.send(command);

        if (response.Messages) {
            console.log("Received messages:", response.Messages);

            // Process each message
            for (const message of response.Messages) {
                const { MessageId, Body } = message;

                // Ignore messages with no body
                if (!Body) {
                    console.log(`Message ${MessageId} has no body, skipping.`);
                    if (message.ReceiptHandle) {
                        await deleteMessage(message.ReceiptHandle);
                    }
                    continue;
                }

                // Parse the message body to check for S3 event
                try {
                    const eventBody = JSON.parse(Body) as S3Event;
                    if ("Service" in eventBody && "Event" in eventBody) {
                        if (eventBody.Event === "s3:TestEvent") {
                            console.log(`Message ${MessageId} is an S3 Test event, skipping.`);
                            if (message.ReceiptHandle) {
                                await deleteMessage(message.ReceiptHandle);
                            }
                            continue;
                        }
                    }
                    console.log(`Processing message: ${MessageId}`);
                    for (let record of eventBody.Records) {
                        const { s3 } = record
                        const { bucket: { name }, object: { key } } = s3
                        console.log(name, key)
                        const runTaskCommand = new RunTaskCommand({
                            taskDefinition: "arn:aws:ecs:us-east-1:533267321799:task-definition/transcoder-task:3",
                            cluster: "arn:aws:ecs:us-east-1:533267321799:cluster/dev-cluster",
                            launchType: "FARGATE",
                            networkConfiguration: {
                                awsvpcConfiguration: {
                                    securityGroups: ['sg-094f7ee1f5f0ce1b5'],
                                    assignPublicIp: "ENABLED",
                                    subnets: [
                                        'subnet-0efe005dc85ab61a7',
                                        'subnet-0486d2ef5bc0253d0'
                                    ]
                                }
                            },
                            overrides: {
                                containerOverrides: [
                                    {
                                        name: "transcoder",
                                        environment: [
                                            { name: "AWS_REGION", value: AWS_REGION },
                                            { name: "SOURCE_BUCKET", value: name },
                                            { name: "TARGET_BUCKET", value: 'dest.22122024.bucket' },
                                            { name: "SOURCE_KEY", value: key },
                                            { name: "DATABASE_URI", value: 'mongodb://localhost:27017/' },
                                            { name: "MOVIE_ID", value: 'found' }
                                        ]
                                    }
                                ]
                            }
                        })
                        await ecsClient.send(runTaskCommand)
                        // delete the message after processing
                        if (message.ReceiptHandle) {
                            await deleteMessage(message.ReceiptHandle);
                        }
                    }
                } catch (error) {
                    console.log(`Failed to parse message body for ${MessageId}, processing anyway.`);
                }

            }
        } else {
            console.log("No messages available.");
        }
    } catch (err) {
        console.error("Error receiving messages:", err);
    }
}

// Function to delete a message from the queue
async function deleteMessage(receiptHandle: string): Promise<void> {
    const params = {
        QueueUrl: queueUrl, // URL of the SQS queue
        ReceiptHandle: receiptHandle, // Receipt handle of the message to delete
    };

    try {
        const command = new DeleteMessageCommand(params);
        await sqsClient.send(command);
        console.log("Message deleted successfully.");
    } catch (err) {
        console.error("Error deleting message:", err);
    }
}

async function main() {
    while (true) {
        await receiveMessages();
    }
}

main();
