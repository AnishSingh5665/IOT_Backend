const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Alert routes
router.get('/alerts', verifyToken, alertController.getAlerts);
router.get('/alerts/:id', verifyToken, alertController.getAlert);
router.post('/alerts', verifyToken, alertController.createAlert);
router.put('/alerts/:id', verifyToken, alertController.updateAlert);
router.delete('/alerts/:id', verifyToken, alertController.deleteAlert);

module.exports = router; 