const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    connectionString: config.database.url,
    min: config.database.pool.min,
    max: config.database.pool.max,
});


//Log when connected
pool.on('connect', () => {
    console.log('Connection to PostgreSQL database');
});


//Handle unexpected errors
pool.on('error', (err) => {
    console.log('Unexpected PostgreSQL error: ', err);
    process.exit(-1);
});


//Helper function to run queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;

        // Optionally log slow queries only
        // if (duration > 1000) {
        //     console.log(`Slow query (${duration}ms)`);
        // }

        return res;
    } catch (error) {
        console.error('Database query error', error.message);
        throw error;
    }
};


//Get a client from the pool (for transactions later)
const getClient = async () => {
    const client = await pool.connect();
    return client;
};


// Graceful shutdown
const closePool = async () => {
    await pool.end();
    console.log('PostgreSQL pool closed');
};

module.exports = {
    query,
    getClient,
    pool,
    closePool
};