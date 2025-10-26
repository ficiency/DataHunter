require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL,
        pool: {
            min: parseInt(process.env.DB_POOL_MIN),
            max: parseInt(process.env.DB_POOL_MAX),
        },
    },

    security: {
        encryptionKey: process.env.ENCRYPTION_KEY,
        jwtSecret: process.env.JWT_SECRET,
    },

    puppeteer: {
        headless: process.env.PUPPETEER_HEADLESS === "true",
        timeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 30000,
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};