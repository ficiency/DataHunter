
class DataExtractor {
    constructor() {
        //Regex patterns for data extraction
        this.patterns = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            // Add more patterns as needed
        };

        /*  DEPRECATED: Used with old PuppeteerCrawler approach
        // Configuration
        this.config = {
            maxContentSize: 10 * 1024 * 1024, // 10MB max page size
            extractionTimeout: 10000, // 10 seconds timeout
            maxRetries: 2, // Retry twice on failure
        };
        */
    }

    // Extract all text from page
    extractAllText(pageContent) {
        //Remove HTML tags and extra whitespaces
        return pageContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }


    // Detect and extract emails
    extractEmails(text) {
        const matches = text.match(this.patterns.email);
        if (!matches) return [];

        // Filter invalid emails
        return [...new Set(matches)].filter(email => {
            return email.length < 255 && // Max length
            !email.includes('..') && // No consecutives dots
            email.split('@').length === 2;
        });
    }

    // Detect and extract phone numbers
    extractPhones(text) {
        const matches = text.match(this.patterns.phone);
        if (!matches) return [];

        // Filter invalid phones
        return [...new Set(matches)].filter(phone => {
            const digitsOnly = phone.replace(/\D/g, '');
            return digitsOnly.length >= 10 && digitsOnly.length <= 15;
        });
    }


    // Extract data by type
    extractByType(pageContent, targetName) {
        const text = this.extractAllText(pageContent);
        const findings = [];

        // Extract emails
        const emails = this.extractEmails(text);
        emails.forEach(email => {
            findings.push({
                data_type: 'email',
                found_value: email,
            });
        });

        // Extract phones
        const phones = this.extractPhones(text);
        phones.forEach(phone => {
            findings.push({
                data_type: 'phone',
                found_value: phone
            });
        });

        // Check if target name appears on page
        if (targetName && text.toLowerCase().includes(targetName.toLowerCase())) {
            findings.push({
                data_type: 'name',
                found_value: targetName,
            });
        }

        return findings;
    }

    /*  DEPRECATED: Used with old PuppeteerCrawler approach (puppeteer-cluster handles and extracts page content automatically)
    // Get page content with timeout
    async getPageContentSafely(crawler) {
        try {
            const pageContent = await Promise.race([
                crawler.evaluate(() => {
                    if (!document.body) {
                        return '';
                    }
                    return document.body.innerHTML;
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Content extraction timeout')), this.config.extractionTimeout)
                ),
            ]);

            // Validate content
            if (!pageContent || pageContent.length === 0) {
                console.warn(' Empty page content');
                return null;
            }

            // Check size limit
            if (pageContent.length > this.config.maxContentSize) {
                console.warn(`Page too large (${(pageContent.length / 1024 / 1024).toFixed(2)}MB), truncating...`);
                return pageContent.substring(0, this.config.maxContentSize);
            }

            return pageContent;
        } catch (error) {
            console.error('Failed to get page content', error.message);
            return null;
        }
    }

    
    async extractFromPage(crawler, url, targetName, attempt = 0) {
        try {
            // Navigate to page
            await crawler.navigateTo(url);

            // Get page content safely
            const pageContent = await this.getPageContentSafely(crawler);

            if (!pageContent) {
                console.log('No content to extract, skipping...');
                return [];
            }

            // Extract data
            const findings = this.extractByType(pageContent, targetName);

            if (findings.length === 0) {
                console.log(`No data found on ${url}`);
            } else {
                console.log(`Found ${findings.length} data point(s) on ${url}`);
            }

            // Add metadata to each finding
            return findings.map(finding => ({
                ...finding,
                website_url: url,
                found_at: new Date(),
            }));
        } catch (error) {
            // Retry logic
            if (attempt < this.config.maxRetries) {
                console.log(`Attempt ${attempt + 1} failed, retrying...`);
                await this.delay(2000 * (attempt + 1));
                return this.extractFromPage(crawler, url, targetName, attempt + 1);
            }

            console.error(`Failed to extract from ${url}:`, error.message);
            return [];
        }
    }
    
    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    */
}


module.exports = DataExtractor;