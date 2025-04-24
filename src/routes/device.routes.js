const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all device routes
router.use(verifyToken);

// Create a new device
router.post('/', deviceController.createDevice);

// Get all devices for the authenticated user
router.get('/', deviceController.getDevices);

// Get a specific device by ID
router.get('/:id', deviceController.getDevice);

// Update a device
router.put('/:id', deviceController.updateDevice);

// Delete a device
router.delete('/:id', deviceController.deleteDevice);

module.exports = router; 