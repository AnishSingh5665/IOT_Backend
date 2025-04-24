const express = require('express');
const router = express.Router();
const deviceDataController = require('../controllers/devicedata.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get device data with optional date range and limit
router.get('/devices/:deviceId/data', deviceDataController.getDeviceData);

// Get latest data for a device
router.get('/devices/:deviceId/latest', deviceDataController.getLatestDeviceData);

module.exports = router; 