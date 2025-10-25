const db = require('../../database/postgres');
const queue = require('../../queue/rabbitmq-queue');

// Connect rabbit when starting module
queue.connect().catch(err =>  {
    console.error('Failed to connect RabbitMQ:', err.message);
});

const createScan = async (req, res) => {
    try {
        const { user_id, target_name, state, city, priority } = req.body;

        //Validate input
        if (!user_id || !target_name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'user_id and target_name are required.'
            });
        }

        //Insert scan into database
        const result = await db.query(
            `INSERT INTO scans (user_id, target_name, status)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, target_name, status, created_at`,
            [user_id, target_name, 'pending']
        );

        const scan = result.rows[0];

        // Queue in RabbitMQ instead of direct execution
        await queue.enqueueScan(
            scan.id,
            target_name,
            { state, city },
            priority || 5
        );

        res.status(201).json({
            message: 'Scan enqueued successfully',
            scan,
            note: 'Check status at GET /api/scans/:id'
        });
    } catch (error) {
        console.error('Error creating scan: ', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create scan'
        });
    }
};


// Get all scans
const getAllScans = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, user_id, target_name, status, created_at, completed_at
            FROM scans
            ORDER BY created_at DESC`
        );

        res.status(200).json({
            count: result.rowCount,
            scans: result.rows,
        });
    } catch (error) {
        console.error('Error fetching scans: ', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch scans'
        });
    }
};


// Get scan by ID
const getScanById = async (req, res) => {
    try{
        const { id } = req.params;

        // Get scan
        const scanResult = await db.query(
            `SELECT id, user_id, target_name, status, created_at, completed_at
            FROM scans
            WHERE id = $1`,
            [id]
        );

        if (scanResult.rowCount === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: `Scan with id ${id} not found.`
            });
        }

        const scan = scanResult.rows[0];

        const findingsResult = await db.query(
            `SELECT id, website_url, data_type, found_value, found_at
            FROM findings
            WHERE scan_id = $1
            ORDER BY found_at DESC`,
            [id]
        );

        res.status(200).json({
            scan, 
            findings: findingsResult.rows,
        });
    } catch (error) {
        console.error('Error fetching scan: ', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch scan',
        });
    }
};



// Update scan status
const updateScanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'processing', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: `Status must be one of: ${validStatuses.join(', ')}`,
            });
        }


        const result = await db.query(
            `UPDATE scans
            SET status = $1, completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE completed_at END
            WHERE id = $2
            RETURNING id, user_id, target_name, status, created_at, completed_at`,
            [status, id]
        );


        if (result.rowCount === 0){
            return res.status(404).json({
                error: 'Not found',
                message: `Scan with id ${id} not found`,
            });
        }

        res.status(200).json({
            message: 'Scan updated successfully',
            scan: result.rows[0],   
        });
    } catch (error) {
        console.error('Error updating scan: ', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update scan',
        });
    }
};


module.exports = {
    createScan,
    getAllScans,
    getScanById,
    updateScanStatus
};





