const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all device routes
router.use(verifyToken);

// Get all dashboard stats in one call
router.get('/stats', dashboardController.getDashboardStats);

// Individual endpoints
router.get('/devices/count', dashboardController.getTotalDevices);
router.get('/alerts/active/count', dashboardController.getActiveAlertsCount);
router.get('/alerts/recent', dashboardController.getRecentAlerts);

module.exports = router; 