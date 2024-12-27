import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import type { S3Event } from 'aws-lambda'
import mongoose from 'mongoose';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import { AWS_REGION, TASK_DEFINITION_ARN, CLUSTER_ARN, CONTAINER_NAME, QUEUE_URL, SG_GROUP_ID, SUBNET_ID, MONGO_URI } from './config'

// Configure your AWS SQS Client
const sqsClient = new SQSClient({ region: AWS_REGION });
const ecsClient = new ECSClient({ region: AWS_REGION });

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const dynamicSchema = new mongoose.Schema({}, { strict: false });
// Create the model (not using a strict schema)
const DynamicModel = mongoose.model('Movie', dynamicSchema);

// Function to receive messages
async function receiveMessages(): Promise<void> {
    const params = {
        QueueUrl: QUEUE_URL, // URL of the SQS queue
        MaxNumberOfMessages: 2, // Maximum messages to retrieve (1-10)
        WaitTimeSeconds: 20, // Long polling time (up to 20 seconds)
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
                        const movieID = key.split('/')[0];
                        const substring = "master.m3u8";
                        if (key.includes(substring)) {
                            pushMovie(movieID, name, key)
                        } else {
                            const runTaskCommand = new RunTaskCommand({
                                taskDefinition: TASK_DEFINITION_ARN,
                                cluster: CLUSTER_ARN,
                                launchType: "FARGATE",
                                networkConfiguration: {
                                    awsvpcConfiguration: {
                                        securityGroups: [SG_GROUP_ID],
                                        assignPublicIp: "ENABLED",
                                        subnets: [
                                            SUBNET_ID
                                        ]
                                    }
                                },
                                overrides: {
                                    containerOverrides: [
                                        {
                                            name: CONTAINER_NAME,
                                            environment: [
                                                { name: "SOURCE_BUCKET", value: name },
                                                { name: "SOURCE_KEY", value: key },
                                            ]
                                        }
                                    ]
                                }
                            })
                            await ecsClient.send(runTaskCommand)
                            updateMovieStatus(movieID, "Started processing", STATUS_TYPE.INFO)
                            // delete the message after processing
                            if (message.ReceiptHandle) {
                                await deleteMessage(message.ReceiptHandle);
                            }
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
        QueueUrl: QUEUE_URL, // URL of the SQS queue
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

enum STATUS_TYPE {
    SAFE = "success",
    DANGER = "danger",
    WARNING = "warning",
    PENDING = "pending",
    INFO = "info"
}

async function updateMovieStatus(movieID: string, status: string, type: STATUS_TYPE) {
    // Create a dynamic schema (strict: false) without defining fields
    try {
        await DynamicModel.updateOne(
            { id: movieID },
            {
                $set: {
                    status: status,
                    status_type: type
                }
            }
        );
        console.log(`${movieID} document was updated.`);
    } catch (err) {
        console.error("Error updating document:", err);
    }
}

async function pushMovie(movieID: string, bucket: string, key: string) {
    console.log(movieID, bucket, key)
    const url = `https://s3.${AWS_REGION}.amazonaws.com/${bucket}/${key}`
    try {
        await DynamicModel.updateOne(
            { id: movieID },
            {
                $set: {
                    movie: url
                }
            }
        );
        console.log(`${movieID} document was updated.`);
    } catch (err) {
        console.error("Error updating document:", err);
    }
    updateMovieStatus(movieID, "Completed processing", STATUS_TYPE.SAFE)
}

async function main() {
    while (true) {
        await receiveMessages()
    }
}

main();
