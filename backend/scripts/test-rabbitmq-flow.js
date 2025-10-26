const axios = require('axios');
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

const API_URL = 'http://localhost:3000/api/scans';
const POLL_INTERVAL = 3000; // Check every 3 seconds

// Simulates different users searching for different people
const TEST_CASES = [
    { user_id: 1, target_name: 'John Doe', state: 'CA', priority: 1 },
    { user_id: 2, target_name: 'Jane Smith', state: 'TX', priority: 1 },
    { user_id: 3, target_name: 'Bob Johnson', state: 'NY', priority: 1 },
    { user_id: 4, target_name: 'Alice Williams', state: 'FL', priority: 1 },
    { user_id: 5, target_name: 'Michael Brown', state: 'IL', priority: 1 },
    { user_id: 6, target_name: 'Sarah Davis', state: 'WA', priority: 1 },
    { user_id: 7, target_name: 'David Miller', state: 'AZ', priority: 1 },
    { user_id: 8, target_name: 'Emma Wilson', state: 'GA', priority: 1 },
    { user_id: 9, target_name: 'James Martinez', state: 'NV', priority: 1 },
];

class RabbitMQFlowTester {
    constructor() {
        this.createdScans = [];
        this.completedScans = [];
        this.failedScans = [];
        this.startTime = Date.now();
    }

    log(message, color = colors.reset) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    }

    // Step 1: Create multiple scans concurrently
    async createScans() {
        this.log('='.repeat(60), colors.cyan);
        this.log('STEP 1: Creating scans (simulating concurrent users)', colors.cyan);
        this.log('='.repeat(60), colors.cyan);

        const promises = TEST_CASES.map(async (testCase, index) => {
            try {
                this.log(`User ${testCase.user_id}: Requesting scan for "${testCase.target_name}"...`, colors.blue);
                
                const response = await axios.post(API_URL, testCase);
                const scan = response.data.scan;
                
                this.createdScans.push(scan);
                this.log(`✓ Scan ${scan.id} enqueued (priority: ${testCase.priority})`, colors.green);
                
                return scan;
            } catch (error) {
                this.log(`✗ Failed to create scan: ${error.message}`, colors.red);
                throw error;
            }
        });

        await Promise.all(promises);
        
        this.log(`\n✓ All ${this.createdScans.length} scans enqueued successfully\n`, colors.green);
        return this.createdScans;
    }

    // Step 2: Poll scans until all complete or fail
    async monitorScans() {
        this.log('='.repeat(60), colors.cyan);
        this.log('STEP 2: Monitoring scan progress', colors.cyan);
        this.log('='.repeat(60), colors.cyan);

        const scanIds = this.createdScans.map(s => s.id);
        let previousStatuses = {};

        while (this.completedScans.length + this.failedScans.length < scanIds.length) {
            for (const scanId of scanIds) {
                // Skip if already completed or failed
                if (this.completedScans.includes(scanId) || this.failedScans.includes(scanId)) {
                    continue;
                }

                try {
                    const response = await axios.get(`${API_URL}/${scanId}`);
                    const { scan, findings } = response.data;

                    // Only log status changes
                    if (previousStatuses[scanId] !== scan.status) {
                        previousStatuses[scanId] = scan.status;

                        if (scan.status === 'processing') {
                            this.log(`⚙ Scan ${scanId} (${scan.target_name}): Processing...`, colors.yellow);
                        } else if (scan.status === 'completed') {
                            this.completedScans.push(scanId);
                            const elapsed = ((new Date(scan.completed_at) - new Date(scan.created_at)) / 1000).toFixed(2);
                            this.log(`✓ Scan ${scanId} (${scan.target_name}): COMPLETED in ${elapsed}s with ${findings.length} findings`, colors.green);
                        } else if (scan.status === 'failed') {
                            this.failedScans.push(scanId);
                            this.log(`✗ Scan ${scanId} (${scan.target_name}): FAILED`, colors.red);
                        }
                    }
                } catch (error) {
                    this.log(`✗ Error checking scan ${scanId}: ${error.message}`, colors.red);
                }
            }

            // Wait before next poll
            if (this.completedScans.length + this.failedScans.length < scanIds.length) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            }
        }

        this.log('\n✓ All scans finished\n', colors.green);
    }

    // Step 3: Show final results
    async showResults() {
        this.log('='.repeat(60), colors.cyan);
        this.log('STEP 3: Final Results', colors.cyan);
        this.log('='.repeat(60), colors.cyan);

        for (const scanId of this.createdScans.map(s => s.id)) {
            try {
                const response = await axios.get(`${API_URL}/${scanId}`);
                const { scan, findings } = response.data;

                this.log(`\nScan #${scan.id} - ${scan.target_name}`, colors.blue);
                this.log(`  Status: ${scan.status}`, colors.blue);
                this.log(`  Created: ${new Date(scan.created_at).toLocaleTimeString()}`, colors.blue);
                this.log(`  Completed: ${scan.completed_at ? new Date(scan.completed_at).toLocaleTimeString() : 'N/A'}`, colors.blue);
                this.log(`  Findings: ${findings.length}`, colors.blue);

                if (findings.length > 0) {
                    this.log('  Data found:', colors.green);
                    findings.slice(0, 3).forEach(f => {
                        this.log(`    - ${f.data_type}: ${f.found_value} (${f.website_url})`, colors.green);
                    });
                    if (findings.length > 3) {
                        this.log(`    ... and ${findings.length - 3} more`, colors.green);
                    }
                }
            } catch (error) {
                this.log(`✗ Error fetching results for scan ${scanId}: ${error.message}`, colors.red);
            }
        }

        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.log('\n' + '='.repeat(60), colors.cyan);
        this.log('SUMMARY', colors.cyan);
        this.log('='.repeat(60), colors.cyan);
        this.log(`Total scans created: ${this.createdScans.length}`, colors.blue);
        this.log(`Completed: ${this.completedScans.length}`, colors.green);
        this.log(`Failed: ${this.failedScans.length}`, this.failedScans.length > 0 ? colors.red : colors.blue);
        this.log(`Total test duration: ${totalTime}s`, colors.cyan);
        this.log('='.repeat(60) + '\n', colors.cyan);
    }

    async run() {
        try {
            console.log('\n');
            this.log('🚀 Starting RabbitMQ Flow Test', colors.cyan);
            this.log('Make sure the following are running:', colors.yellow);
            this.log('  1. Docker containers (PostgreSQL + RabbitMQ)', colors.yellow);
            this.log('  2. API Server (npm run dev or node src/index.js)', colors.yellow);
            this.log('  3. Worker (node src/workers/scan-worker.js)', colors.yellow);
            this.log('\nStarting in 3 seconds...\n', colors.yellow);
            
            await new Promise(resolve => setTimeout(resolve, 3000));

            await this.createScans();
            await this.monitorScans();
            await this.showResults();

            this.log('✓ Test completed successfully!', colors.green);
            process.exit(0);
        } catch (error) {
            this.log(`✗ Test failed: ${error.message}`, colors.red);
            console.error(error);
            process.exit(1);
        }
    }
}

// Run the test
if (require.main === module) {
    const tester = new RabbitMQFlowTester();
    tester.run();
}

module.exports = RabbitMQFlowTester;