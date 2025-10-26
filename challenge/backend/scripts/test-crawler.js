const CrawlerService = require('../src/crawler/crawler-service');
const db = require('../src/database/postgres');

async function testCrawler() {
    const crawler = new CrawlerService();
    
    console.log('\nStarting crawler test...\n');
    
    // Listen to all events
    crawler.on('site:start', ({ siteName, url }) => {
        console.log(`[${siteName}] Starting scan: ${url}`);
    });
    
    crawler.on('findings:found', ({ siteName, count }) => {
        console.log(`[${siteName}] Found ${count} data points!`);
    });
    
    crawler.on('site:completed', ({ siteName, count }) => {
        console.log(`[${siteName}] Completed (${count} findings)`);
    });
    
    crawler.on('site:error', ({ siteName, error }) => {
        console.log(`[${siteName}] Error: ${error}`);
    });
    
    crawler.on('scan:completed', ({ scanId }) => {
        console.log(`\nScan ${scanId} completed!\n`);
    });
    
    try {
        // Create test scan in DB
        const result = await db.query(
            'INSERT INTO scans (user_id, target_name, status) VALUES ($1, $2, $3) RETURNING id',
            ['test-user', 'John Doe', 'pending']
        );
        
        const searchOptions = {
            state: 'California',
            city: 'San Francisco'
        };
        
        const scanId = result.rows[0].id;
        console.log(`📝 Created scan: ${scanId}\n`);
        
        // Execute scan
        await crawler.executeScan(scanId, 'John Doe', searchOptions);
        
        // Check results
        const scan = await db.query('SELECT * FROM scans WHERE id = $1', [scanId]);
        console.log('\nScan status:', scan.rows[0].status);
        
        const findings = await db.query('SELECT * FROM findings WHERE scan_id = $1', [scanId]);
        console.log(`Total findings: ${findings.rows.length}\n`);
        
        if (findings.rows.length > 0) {
            console.log('🔍 Sample findings:');
            findings.rows.slice(0, 5).forEach(f => {
                console.log(`  - ${f.data_type}: ${f.found_value} (from ${f.website_url})`);
            });
        }
        
    } catch (error) {
        console.error('\nTest failed:', error.message);
    } finally {
        await db.closePool();
        console.log('\nTest completed\n');
    }
}

testCrawler();