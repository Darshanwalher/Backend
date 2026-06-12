import amqplib from "amqplib";

const QUEUE = 'auth_notification_queue';

let channel = null;

async function getChannel() {
    if (channel) return channel;
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE, { durable: true });
        return channel;
    } catch (err) {
        console.error('RabbitMQ connection error:', err.message);
        return null;
    }
}

export async function sendAuthNotification(message) {
    const ch = await getChannel();
    if (!ch) {
        console.error('RabbitMQ channel not available, skipping notification');
        return;
    }
    ch.sendToQueue(
        QUEUE, 
        Buffer.from(JSON.stringify(message)), 
        { persistent: true }
    );
}