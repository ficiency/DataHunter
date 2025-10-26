const express = require('express');
const { getAllScans, getScanById, updateScanStatus, createScan } = require('../controllers/scans-controller');
const router = express.Router();


router.get('/', getAllScans);

router.get('/:id', getScanById);

router.post('/', createScan);

router.patch('/:id', updateScanStatus);

module.exports = router;