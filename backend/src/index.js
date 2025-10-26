const app = require('./api/server');
const config = require('./config');
const db = require('./database/postgres');


const PORT = config.port;

//Start server
const server = app.listen(PORT, () => {
    console.log('Server started successfully');
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Environment: ${config.nodeEnv}`);
});


// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n  ${signal} received, closing server gracefully`);

    server.close(async () => {
        console.log('HTTP server closed');

        try{
            await db.closePool();
            console.log('Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};


process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at: ', promise, 'reason: ', reason);
});


process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception: ', error);
    shutdown('UNCAUGHT_EXCEPTION');
});