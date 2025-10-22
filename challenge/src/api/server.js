const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// CORS - Allow all origins in development
app.use(cors());


// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Request logger (simple)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});


// Routes
const scansRoutes = require('./routes/scans');
app.use('/api/scans', scansRoutes);


// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Data discovery System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            scans: '/api/scans',
        },
    });
});


//  404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});


// Error handler
app.use((err, req, res, next) => {
    console.error('Error', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

module.exports = app;
