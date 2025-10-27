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
const POLL_INTERVAL = 30000; // Check every 30 seconds (to avoid rate limit with 15 scans)

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
    { user_id: 10, target_name: 'Olivia Anderson', state: 'PA', priority: 1 },
    { user_id: 11, target_name: 'William Taylor', state: 'OH', priority: 1 },
    { user_id: 12, target_name: 'Sophia Thomas', state: 'MA', priority: 1 },
    { user_id: 13, target_name: 'Liam Garcia', state: 'CO', priority: 1 },
    { user_id: 14, target_name: 'Ava Rodriguez', state: 'MI', priority: 1 },
    { user_id: 15, target_name: 'Noah Lee', state: 'VA', priority: 1 },
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

    // Calculate statistical metrics
    calculateStats(times) {
        if (times.length === 0) return null;

        const sorted = [...times].sort((a, b) => a - b);
        const sum = times.reduce((a, b) => a + b, 0);
        const mean = sum / times.length;

        // Standard deviation
        const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);

        // Percentiles
        const percentile = (p) => {
            const index = Math.ceil((p / 100) * sorted.length) - 1;
            return sorted[index];
        };

        return {
            count: times.length,
            mean: mean.toFixed(3),
            median: percentile(50).toFixed(3),
            min: sorted[0].toFixed(3),
            max: sorted[sorted.length - 1].toFixed(3),
            range: (sorted[sorted.length - 1] - sorted[0]).toFixed(3),
            stdDev: stdDev.toFixed(3),
            p90: percentile(90).toFixed(3),
            p95: percentile(95).toFixed(3),
            p99: percentile(99).toFixed(3)
        };
    }

    // Step 3: Show final results
    async showResults() {
        this.log('='.repeat(60), colors.cyan);
        this.log('STEP 3: Final Results', colors.cyan);
        this.log('='.repeat(60), colors.cyan);

        let websiteTimesMap = {}; // {website_name: {times: [], findings: count}}
        let totalFindings = 0;
        let totalWebsitesWithFindings = 0; // Count of scan-website combinations with findings

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
                    totalFindings += findings.length;
                    
                    // Group findings by website (to avoid counting processing_time multiple times)
                    const findingsByWebsite = {};
                    findings.forEach(f => {
                        const siteName = f.website_url.split('/')[2] || 'unknown';
                        if (!findingsByWebsite[siteName]) {
                            findingsByWebsite[siteName] = {
                                time: parseFloat(f.processing_time),
                                count: 0
                            };
                        }
                        findingsByWebsite[siteName].count++;
                    });

                    // Track each website once per scan
                    Object.entries(findingsByWebsite).forEach(([siteName, data]) => {
                        totalWebsitesWithFindings++;
                        if (!websiteTimesMap[siteName]) {
                            websiteTimesMap[siteName] = { times: [], findings: 0 };
                        }
                        websiteTimesMap[siteName].times.push(data.time);
                        websiteTimesMap[siteName].findings += data.count;
                    });

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

        // Extract all processing times (one per website per scan)
        const allProcessingTimes = [];
        Object.values(websiteTimesMap).forEach(data => {
            allProcessingTimes.push(...data.times);
        });

        // Calculate metrics
        const totalTime = (Date.now() - this.startTime) / 1000;
        const stats = this.calculateStats(allProcessingTimes);
        
        // Success rate calculation (unique websites out of 40 total)
        const uniqueWebsites = Object.keys(websiteTimesMap);
        const totalUniqueWebsites = 40; // Total unique websites configured
        const successfulWebsites = uniqueWebsites.length;
        const successRate = ((successfulWebsites / totalUniqueWebsites) * 100).toFixed(1);
        const failedWebsites = totalUniqueWebsites - successfulWebsites;

        // Total attempts across all scans
        const totalWebsitesAttempted = this.createdScans.length * totalUniqueWebsites;

        // Efficiency metrics
        const throughput = (totalWebsitesWithFindings / totalTime).toFixed(2);
        const totalProcessingTime = allProcessingTimes.reduce((a, b) => a + b, 0);
        const efficiencyRatio = (totalProcessingTime / totalTime).toFixed(2);
        const avgWebsitesPerScan = (totalWebsitesWithFindings / this.createdScans.length).toFixed(1);

        // Top 5 fastest/slowest websites
        const websiteAvgTimes = Object.entries(websiteTimesMap).map(([site, data]) => ({
            site,
            avgTime: (data.times.reduce((a, b) => a + b, 0) / data.times.length).toFixed(3),
            findings: data.findings
        }));
        const fastest = websiteAvgTimes.sort((a, b) => parseFloat(a.avgTime) - parseFloat(b.avgTime)).slice(0, 5);
        const slowest = websiteAvgTimes.sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime)).slice(0, 5);
        const mostProductive = websiteAvgTimes.sort((a, b) => b.findings - a.findings).slice(0, 5);

        // Display comprehensive summary
        this.log('\n' + '='.repeat(60), colors.cyan);
        this.log('📊 COMPREHENSIVE PERFORMANCE ANALYSIS', colors.cyan);
        this.log('='.repeat(60), colors.cyan);

        this.log('\n🎯 Test Overview', colors.cyan);
        this.log(`  Total scans created: ${this.createdScans.length}`, colors.blue);
        this.log(`  Completed: ${this.completedScans.length}`, colors.green);
        this.log(`  Failed: ${this.failedScans.length}`, this.failedScans.length > 0 ? colors.red : colors.blue);
        this.log(`  Total findings: ${totalFindings}`, colors.blue);
        this.log(`  Total test duration: ${totalTime.toFixed(2)}s`, colors.cyan);

        if (stats) {
            this.log('\n⏱️  Processing Time Statistics (per website)', colors.cyan);
            this.log(`  Average (mean): ${stats.mean}s`, colors.yellow);
            this.log(`  Median (p50): ${stats.median}s`, colors.yellow);
            this.log(`  Min: ${stats.min}s`, colors.green);
            this.log(`  Max: ${stats.max}s`, colors.red);
            this.log(`  Range: ${stats.range}s`, colors.blue);
            this.log(`  Std Deviation: ${stats.stdDev}s`, colors.blue);
            this.log(`  p90: ${stats.p90}s (90% of sites < this)`, colors.yellow);
            this.log(`  p95: ${stats.p95}s (95% of sites < this)`, colors.yellow);
            this.log(`  p99: ${stats.p99}s (99% of sites < this)`, colors.yellow);

            this.log('\n⚡ Efficiency Metrics', colors.cyan);
            this.log(`  Throughput: ${throughput} websites/second`, colors.yellow);
            this.log(`  Efficiency Ratio: ${efficiencyRatio}x`, colors.yellow);
            this.log(`  Average websites per scan: ${avgWebsitesPerScan}`, colors.blue);

            this.log('\n✅ Success/Failure Analysis', colors.cyan);
            this.log(`  Total unique websites configured: ${totalUniqueWebsites}`, colors.blue);
            this.log(`  Successful websites (with findings): ${successfulWebsites}`, colors.green);
            this.log(`  Failed/Zero-finding websites: ${failedWebsites}`, colors.yellow);
            this.log(`  Success Rate: ${successRate}%`, parseFloat(successRate) > 70 ? colors.green : colors.yellow);
            this.log(`  Total website attempts (across all scans): ${totalWebsitesAttempted}`, colors.blue);
            this.log(`  Total successful extractions: ${totalWebsitesWithFindings}`, colors.green);

            this.log('\n🚀 Top 5 Fastest Websites', colors.cyan);
            fastest.forEach((item, i) => {
                this.log(`  ${i + 1}. ${item.site} - ${item.avgTime}s (${item.findings} findings)`, colors.green);
            });

            this.log('\n🐌 Top 5 Slowest Websites', colors.cyan);
            slowest.forEach((item, i) => {
                this.log(`  ${i + 1}. ${item.site} - ${item.avgTime}s (${item.findings} findings)`, colors.red);
            });

            this.log('\n🏆 Most Productive Websites', colors.cyan);
            mostProductive.forEach((item, i) => {
                this.log(`  ${i + 1}. ${item.site} - ${item.findings} findings (${item.avgTime}s avg)`, colors.green);
            });
        }

        this.log('\n' + '='.repeat(60) + '\n', colors.cyan);
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