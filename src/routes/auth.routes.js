const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const supabaseService = require('../services/supabase.service');

// Test Supabase connection
router.get('/test-connection', async (req, res) => {
    try {
        const { data, error } = await supabaseService.client.auth.getSession();
        if (error) throw error;

        res.json({
            success: true,
            message: 'Successfully connected to Supabase',
            data: {
                isConnected: true,
                session: data.session
            }
        });
    } catch (error) {
        console.error('Supabase connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to Supabase',
            error: error.message
        });
    }
});

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authMiddleware.verifyToken, authController.logout);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/edit', authMiddleware.verifyToken, authController.editUser);
router.delete('/delete', authMiddleware.verifyToken, authController.deleteUser);

module.exports = router; 