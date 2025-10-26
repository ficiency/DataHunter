const fs = require('fs').promises;
const path = require('path');

class ScreenshotHandler {
    constructor(baseDir = null) {
        // Default to uploads/screenshots relative to project root
        this.baseDir = baseDir || path.join(__dirname, '../../uploads/screenshots');
    }

    // Ensure  scan directory exists
    async ensureScanDirectory(scanId) {
        const scanDir = path.join(this.baseDir, scanId);

        try {
            await fs.access(scanDir);
        } catch {
            await fs.mkdir(scanDir, { recursive: true });
            console.log(`Created screenshot directory: ${scanId}`);
        }

        return scanDir;
    }

    // Get absolute path for screenshot
    getAbsolutePath(scanId, findingId) {
        return path.join(this.baseDir, scanId, `${findingId}.jpg`);
    }

    // Get relative path for DB storage
    getRelativePath(scanId, findingId) {
        return `/uploads/screenshots/${scanId}/${findingId}.jpg`;
    }

    // In screenshot-handler.js
    async takeScreenshot(page, scanId, identifier = Date.now()) {
        try {
            // Create scan directory inline
            const scanDir = path.join(this.baseDir, scanId);
            await fs.mkdir(scanDir, { recursive: true });  // ✅ Crear directorio directamente
    
            // Generate filename with identifier
            const filename = `${identifier}.jpg`;
            const filepath = path.join(scanDir, filename);
    
            // Take screenshot
            await page.screenshot({
                path: filepath,
                type: 'jpeg',
                quality: 80,
                fullPage: false,
            });
    
            // Return relative path for database (must match static route)
            const relativePath = `uploads/screenshots/${scanId}/${filename}`;
            console.log(`📸 Screenshot saved: ${relativePath}`);
    
            return relativePath;
        } catch (error) {
            console.error('❌ Failed to take screenshot:', error.message);
            return null;
        }
    }


    // Clean up screenshots for a scan (optional, for manteinance)
    async cleanupScan(scanId) {
        const scanDir = path.join(this.baseDir, scanId);

        try {
            await fs.rm(scanDir, { recursive: true, force: true });
            console.log(`Cleaned up screenshots for scan: ${scanId}`);
            return true;
        } catch (error) {
            console.error(`Failed to cleanup ${scanId}: `, error.message);
            return false;
        }
    }


    // Get statistics (optional, for monitoring)
    async getStats(scanId) {
        const scanDir = path.join(this.baseDir, scanId);

        try {
            const files = await fs.readdir(scanDir);
            let totalSize = 0;

            for (const file of files) {
                const stats = await fs.stat(path.join(scanDir, file));
                totalSize += stats.size;
            }

            return {
                count: files.length,
                totalSize: totalSize,
                avgSize: files.length > 0 ? totalSize / files.length : 0
            };
        } catch (error) {
            return { count: 0, totalSize: 0, avgSize: 0 }
        }
    }
}

module.exports = ScreenshotHandler;