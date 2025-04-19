const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

// Get device data with optional date range and limit
router.get('/devices/:deviceId/data', deviceController.getDeviceData);

// Get latest data for a device
router.get('/devices/:deviceId/latest', deviceController.getLatestDeviceData);

module.exports = router; 