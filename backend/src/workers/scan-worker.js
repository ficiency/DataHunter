const queue = require('../queue/rabbitmq-queue');
const CrawlerService = require('../crawler/crawler-service');
const db = require('../database/postgres');

class ScanWorker {
    constructor() {
        this.crawler = new CrawlerService({
            enableScreenshots: true
        });
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.crawler.on('scan:completed', ({scanId}) => {
            console.log(`Worker: Scan ${scanId} completed`)
        })

        this.crawler.on('scan:failed', ({ scanId, error }) => {
            console.error(`Worker: Scan ${scanId} failed: ${error}`);
        });

        this.crawler.on('findings:found', ({ scanId, siteName, count }) => {
            console.log(`Worker: [${siteName}] Found ${count} findings`);
        });
    }


    async processJob(data) {
        const { scanId, targetName, options } = data;

        console.log(`\nWorker processing: ${scanId}`);
        console.log(`Target: ${targetName}`);
        if (options.state) console.log(`State: ${options.state}`);

        await this.crawler.executeScan(scanId, targetName, options);
    }


    async start() {
        try {
            console.log('Scan worker starting...\n');
            await this.crawler.init(); // Initialize persistent cluster
            await queue.connect();
            await queue.consumeScans(this.processJob.bind(this), {
                prefetch: 5     // Configure prefetch to 5
            });
            console.log('Scan worker ready and listening\n');
        } catch (error) {
            console.error('Worker failed to start: ', error.message);
            process.exit(1);
        }
    }

    async stop() {
        console.log('\n Stopping worker...');
        await this.crawler.shutdown();
        await queue.close();
        await db.closePool();
        console.log('Worker stopped');
    }
}

if (require.main === module) {
    const worker = new ScanWorker();

    worker.start();
    process.on('SIGINT', async () => {
        await worker.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await worker.stop();
        process.exit(0);
    });
}

module.exports = ScanWorker;