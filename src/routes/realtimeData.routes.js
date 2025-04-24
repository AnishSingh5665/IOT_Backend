const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const realtimeDataController = require('../controllers/realtimeData.controller');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get real-time voltage data
router.get('/voltage', realtimeDataController.getVoltageData);

// Get real-time temperature data
router.get('/temperature', realtimeDataController.getTemperatureData);

// Get real-time vibration data
router.get('/vibration', realtimeDataController.getVibrationData);

// Get real-time single phase current data
router.get('/single-phase-current', realtimeDataController.getSinglePhaseCurrentData);

// Get real-time A phase current data
router.get('/a-phase-current', realtimeDataController.getAPhaseCurrentData);

// Get real-time B phase current data
router.get('/b-phase-current', realtimeDataController.getBPhaseCurrentData);

// Get real-time C phase current data
router.get('/c-phase-current', realtimeDataController.getCPhaseCurrentData);

// Get real-time monitoring data for a specific device
router.get('/device/:deviceId', realtimeDataController.getDeviceMonitoringData);

// Get real-time monitoring data for all devices
router.get('/all-devices', realtimeDataController.getAllDevicesMonitoringData);

module.exports = router; 