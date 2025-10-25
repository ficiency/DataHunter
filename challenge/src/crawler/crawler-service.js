const EventEmitter = require('events');
const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const DataExtractor = require('./data-extractor');
const ScreenshotHandler = require('./screenshot-handler');
const db = require('../database/postgres');
const SitesConfig = require('./sites-config');
const config = require('../config');

// Apply stealth mode
puppeteer.use(StealthPlugin());

class CrawlerService extends EventEmitter {
    constructor(options = {}) {
        super();
        this.extractor = new DataExtractor();
        this.sitesConfig = new SitesConfig();
        this.screenshotHandler = new ScreenshotHandler();
        this.enableScreenshots = options.enableScreenshots ?? true;
        this.cluster = null;
        this.scanTrackers = new Map();  // Track progress per scan
    }

    // Get cluster config
    getClusterOptions() {
        return {
            concurrency: Cluster.CONCURRENCY_PAGE,       // Create multiple "contexts" (like separated incognito windows)
            maxConcurrency: 15,                              // Max 5 websites per parallel scan.
            puppeteer,
            puppeteerOptions: {                           
                headless: config.puppeteer.headless,        // NO UI
                args: [
                    '--no-sandbox',                         // Prevents permission issues
                    '--disable-setuid-sandbox',             // Docker requirement
                    '--disable-dev-shm-usage',              // Uses /tmp instead of dev/shm (prevents crashes)
                    '--disable-gpu',                         // GPU off
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials',
                ],
            },
            timeout: config.puppeteer.timeout,              // Timeout per page
            retryLimit: 3,                                  // If failes, retries 3x
            retryDelay: 3000,                               // Waits 2s between retries
            skipDuplicateUrls: true,                        // Prevent scanning duplicated urls
        };
    }

    async init() {
        if (!this.cluster) {
            this.cluster = await Cluster.launch(this.getClusterOptions());

            // Define task handler for all scans
            await this.cluster.task(async ({ page, data }) => {
                await this.scanSiteWithCluster(page, data);
            });

            console.log('Persistent cluster initialized');
        }
    }

    // Main execution with cluster
    async executeScan(scanId, targetName, options = {}) {
        console.log(`Starting scan ${scanId} for "${targetName}"`);

        const startTime = Date.now();

        try {
            //Launch cluster
            //cluster = await Cluster.launch(this.getClusterOptions());
            //console.log('Cluster launched.');

            // Set up monitoring events
            this.setupClusterEvents(this.cluster, scanId);

            // Define the task that each worker will execute
            //await cluster.task(async ({ page, data }) => {
            //    await this.scanSiteWithCluster(page, scanId, data);
            //});


            // Generate URLs and queue them
            const urls = this.sitesConfig.generateUrls(targetName, options);
            console.log(`Queuing ${urls.length} URLs`);

            // Initialize tracker for this scan
            this.scanTrackers.set(scanId, {
                total: urls.length,
                completed: 0,
                startTime,
                resolve: null,
                reject: null
            });

            // Create promise that resolves when all URLs complete
            const completionPromise = new Promise((resolve, reject) => {
                this.scanTrackers.get(scanId).resolve = resolve;
                this.scanTrackers.get(scanId).reject = reject;
            });

            for (const { url, siteName } of urls) {
                this.cluster.queue({ 
                    url, 
                    siteName, 
                    targetName,
                    scanId
                });
                
                // Equitable distribution
                if (urls.length > 5) {
                    await new Promise(resolve => setImmediate(resolve));
                }
            }

            // Wait for all URLs to complete
            await completionPromise;
            console.log('All tasks completed')

            // Mark scan as completed
            await this.updateScanStatus(scanId, 'completed');

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.emit('scan:completed', { scanId });

            console.log(`Scan ${scanId} completed in ${duration}s\n`);
        } catch (error) {
           console.error(`Scan ${scanId} failed: `, error.message);
           await this.updateScanStatus(scanId, 'failed');

           const endTime = Date.now();
           const duration = ((endTime - startTime) / 1000).toFixed(2);

           this.emit('scan:failed', { scanId, error: error.message, duration });
           throw error; 
        } finally {
            // Cleanup tracker
            this.scanTrackers.delete(scanId);
        }
    }

    // Setup cluster monitoring events
    setupClusterEvents(cluster, scanId) {
        cluster.on('taskerror', (err, data) => {
            console.error(`[${data.siteName}] Task error: `, err.message);
            this.emit('site:error', {
                scanId,
                siteName: data.siteName,
                error: err.message
            });
        });

        cluster.on('queue', () => {
            const pending = cluster.jobQueue.size;
            if (pending > 0) {
                console.log(`Queue: ${pending} pending.`);
            }
        });
    }


    // Scan one website (executed by cluster worker)
    async scanSiteWithCluster(page, data) {
        const { url, siteName, targetName, scanId } = data;

        try {
            console.log(`[${siteName}] Starting...`);
            this.emit('site:start', { scanId, siteName, url });

            // Set random viewport
            const viewport = { width: 1920, height: 1080 };
            await page.setViewport(viewport);

            // Set user agent
            /*
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );
            */

            // Block unnecesary resources
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const resourceType = request.resourceType();
                if (['image', 'font', 'media'].includes(resourceType)) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            // Navigate
            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: config.puppeteer.timeout,
            });

            console.log(`[${siteName}] Page loaded`);

            // Extract page content
            const pageContent = await page.evaluate(() => {
                if (!document.body) return '';
                return document.body.innerHTML;
            });


            // Validate content
            if (!pageContent || pageContent.length === 0) {
                console.log(`[${siteName}] Empty page content`);
                return;
            }

            // Extract findings
            const findings = this.extractor.extractByType(pageContent, targetName);

            console.log(`[${siteName}] Found ${findings.length} data point(s)`);

            // Add metadata and save with screenshots
            if (findings.length > 0) {
                await this.saveFindings(scanId, findings, url, page);

                this.emit('findings:found', {
                    scanId,
                    siteName,
                    count: findings.length
                });
            }

            this.emit('site:completed', { scanId, siteName, count: findings.length });
            console.log(`[${siteName}] Completed`);
        } catch (error) {
            console.error(`[${siteName}] Error: `, error.message);
            throw error; //Cluster handles retry automatically
        } finally {
            // ADD: Increment completion counter
            this.incrementScanProgress(scanId);
        }
    }

    // Track URL completion per scan
    incrementScanProgress(scanId) {
        const tracker = this.scanTrackers.get(scanId);
        if (!tracker) return;

        tracker.completed++;
        
        // Check if scan is complete
        if (tracker.completed >= tracker.total) {
            tracker.resolve();
        }
    }

    /* Save findings without screenshots
    async saveFindings(scanId, findings) {
        let saved = 0;
        let failed = 0;

        for (const finding of findings) {
            try {
                await db.query(
                    `INSERT INTO findings (scan_id, website_url, data_type, found_value, found_at)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        scanId,
                        finding.website_url,
                        finding.data_type,
                        finding.found_value,
                        finding.found_at
                    ]
                );
                saved++;
            } catch(error) {
                console.error('Failed to save finding: ', error.message);
                failed++;
            }
        }

        console.log(`Saved: ${saved}, Failed: ${failed}`)
        return { saved, failed };
    }
    */
    // Save findings with screenshots
    async saveFindings(scanId, findings, url, page) {
        let saved = 0;
        let failed = 0;

        // Take screenshot ONCE for the entire page (not per finding)
        let screenshotPath = null;
        if (this.enableScreenshots && page) {
            try {
                // Use scan_id + timestamp for unique screenshot name
                const timestamp = Date.now();
                screenshotPath = await this.screenshotHandler.takeScreenshot(
                    page,
                    scanId,
                    timestamp  // Use timestamp instead of finding_id
                );
                console.log(`📸 Screenshot captured: ${screenshotPath}`);
            } catch (error) {
                console.error('⚠️  Screenshot failed:', error.message);
                // Continue without screenshot
            }
        }

        for (const finding of findings) {
            try {
                // Insert finding first to get the ID
                const result = await db.query(
                    `INSERT INTO findings (scan_id, website_url, data_type, found_value, found_at)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [
                        scanId,
                        url,
                        finding.data_type,
                        finding.found_value,
                        new Date()
                    ]
                );

                saved++;
            } catch (error) {
                console.error('❌ Failed to save finding:', error.message);
                failed++;
            }
        }

        console.log(`💾 Saved: ${saved}, Failed: ${failed}`);
        return { saved, failed };
    }


    // Update scan status
    async updateScanStatus(scanId, status) {
        const completedAt = (status === 'completed' || status === 'failed')
            ? new Date()
            : null;

        await db.query(
            `UPDATE scans SET status = $1, completed_at = $2 WHERE id = $3`,
            [status, completedAt, scanId]
        );

        console.log(`Scan ${scanId} → ${status}`)
    }

    async shutdown() {
        if (this.cluster) {
            await this.cluster.close();
            this.cluster = null;
            console.log('Cluster closed');
        }
    }

    /*
    WIHOUT PUPPETER-CLUSTER
    async initCrawler() {
        if (!this.crawler || !this.crawler.isActive()) {
            this.crawler = new PuppeteerCrawler();
            await this.crawler.init();
            console.log('Crawler initialized');
        }
    }

    async closeCrawler() {
        if (this.crawler) {
            await this.crawler.close();
            this.crawler = null;
            console.log('Crawler close.');
        }
    }

    async executeScan(scanId, targetName) {
        console.log(`Starting scan ${scanId} for "${targetName}"`);

        try{
            await this.initCrawler();

            const urls = this.sitesConfig.generateUrls(targetName);
            console.log(`Will scan ${urls.length} URLs`);
            
            // Parallel scan withouth global await
            const scanPromises = urls.map(({ url, siteName }) => 
                this.scanSite(scanId, url, siteName, targetName)
            );

            // Wait every scan to finish
            await Promise.allSettled(scanPromises);

            // Mark scan as completed
            await this.updateScanStatus(scanId, 'completed');
            this.emit('scan:completed', { scanId });

            console.log(`Scan ${scanId} completed\n`);

        } catch (error) {
            console.error(`Scan ${scanId} failed: `, error.message);
            await this.updateScanStatus(scanId, 'failed');
            this.emit('scan:failed', { scanId, error: error.message });
            throw error;
        } finally {
            await this.closeCrawler();
        }
    }


    // Scan only one website
    async scanSite(scanId, url, siteName, targetName) {
        try {
            console.log(`\n[${siteName}] Starting...`);

            this.emit('site:start', { scanId, siteName, url });

            // Extract data
            const findings = await this.extractor.extractFromPage(
                this.crawler,
                url,
                targetName
            );

            console.log(`[${siteName}] Found ${findings.length} data point(s)`);
            
            // Save as soon thread completes
            if (findings.length > 0) {
                await this.saveFindings(scanId, findings);
                this.emit('findings:found', {
                    scanId, 
                    siteName,
                    count: findings.length
                });
            }

            this.emit('site:completed', { scanId, siteName, count: findings.length });
            console.log(`[${siteName}] Completed`);

        } catch (error) {
            console.error(`[${siteName}] Error`, error.message);
            this.emit('site:error', {
                scanId, 
                siteName,
                error: error.message
            });
            // No throw, to continue with other websites
        }
    }

    async saveFindings(scanId, findings) {
        let saved = 0;
        let failed = 0;

        for (const finding of findings) {
            try {
                await db.query(
                    `INSERT INTO findings (scan_id, website_url, data_type, found_value, found_at)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        scanId,
                        finding.website_url,
                        finding.data_type,
                        finding.found_value,
                        finding.found_at
                    ]
                );
                saved++;
            } catch(error) {
                console.error('Failed to save finding: ', error.message);
                failed++;
            }
        }

        console.log(`Saved: ${saved}, Failed: ${failed}`)
        return { saved, failed };
    }


    // Update scan status
    async updateScanStatus(scanId, status) {
        const completedAt = (status === 'completed' || status === 'failed')
            ? new Date()
            : null;

        await db.query(
            `UPDATE scans SET status = $1, completed_at = $2 WHERE id = $3`,
            [status, completedAt, scanId]
        );

        console.log(`Scan ${scanId} → ${status}`)
    }
    */
}

module.exports = CrawlerService;