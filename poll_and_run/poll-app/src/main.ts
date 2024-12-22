import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import type { S3Event } from 'aws-lambda'

// Configure your AWS SQS Client
const client = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/533267321799/videosqueue";

// Function to receive messages
async function receiveMessages(): Promise<void> {
    const params = {
        QueueUrl: queueUrl, // URL of the SQS queue
        MaxNumberOfMessages: 2, // Maximum messages to retrieve (1-10)
        WaitTimeSeconds: 2, // Long polling time (up to 20 seconds)
    };

    try {
        const command = new ReceiveMessageCommand(params);
        const response = await client.send(command);

        if (response.Messages) {
            console.log("Received messages:", response.Messages);

            // Process each message
            for (const message of response.Messages) {
                const { MessageId, Body } = message;

                // Ignore messages with no body
                if (!Body) {
                    console.log(`Message ${MessageId} has no body, skipping.`);
                    continue;
                }

                // Parse the message body to check for S3 event
                try {
                    const eventBody = JSON.parse(Body) as S3Event;
                    if ("Service" in eventBody && "Event" in eventBody) {
                        if (eventBody.Event === "s3:TestEvent") {
                            console.log(`Message ${MessageId} is an S3 Test event, skipping.`);
                            continue;
                        }
                    }
                    console.log(`Processing message: ${MessageId}`);
                    for (let record of eventBody.Records) {
                        const { s3 } = record
                        const { bucket: { name }, object: { key } } = s3
                        console.log(name, key)
                    }

                    // Optionally delete the message after processing
                    if (message.ReceiptHandle) {
                        // await deleteMessage(message.ReceiptHandle);
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
        await client.send(command);
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
