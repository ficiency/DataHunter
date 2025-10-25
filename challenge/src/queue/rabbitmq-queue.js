const amqp = require('amqplib');
const config = require('../config');

class RabbitMQQueue {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queueName = 'scans_queue';
    }

    async connect() {
        try {
            this.connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
            this.channel = await this.connection.createChannel();

            await this.channel.assertQueue(this.queueName, {
                durable: true,
                maxPriority: 10
            });

            console.log('RabbitMQ connected.');
            return true;
        } catch (error) {
            console.error('RabbitMQ connection failed', error.message);
            throw error;
        }
    }


    async enqueueScan(scanId, targetName, options = {}, priority = 5) {
        if (!this.channel) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const message = {
                scanId,
                targetName,
                options,
                enqueuedAt: new Date().toISOString(),
            };

            this.channel.sendToQueue(
                this.queueName,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    priority: priority,
                }
            );

            console.log(`Enqueued scan ${scanId} (priority: ${priority})`);
            return true;
        } catch (error) {
            console.error('Failed to enqueue: ', error.message);
            throw error;
        }
    }


    async consumeScans(handler, options = {}) {
        if (!this.channel) {
            throw new Error('RabbitMQ not connected.');
        }

        try {
            console.log('Listening for scan jobs...');

            const prefetch = options.prefetch || 1;
            this.channel.prefetch(prefetch);
            console.log(`Prefetch set to: ${prefetch}`);

            this.channel.consume(
                this.queueName,
                (msg) => {
                    if (msg) {
                        const data = JSON.parse(msg.content.toString());
                        console.log(`Processing scan ${data.scanId}`);

                        // Non-blocking handler
                        handler(data)
                            .then(() => {
                                this.channel.ack(msg);
                                console.log(`Scan ${data.scanId} acknowledge\n`);
                            })
                            .catch((error) => {
                                console.error(`Error processing scan: `, error.message);
                                this.channel.nack(msg, false, true);
                            });
                        }
                    },
                { noAck: false }
            );

        } catch (error) {
            console.error('Failed to consume: ', error.message);
            throw error;
        }
    }


    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            console.log('RabbitMQ connection closed.');
        } catch (error) {
            console.error(`Error closing RabbitMQ: `, error.message);
        }
    }
}

module.exports = new RabbitMQQueue();