const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, preventAdminModification, requireAdmin } = require('../middleware/auth.middleware');
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
router.post('/logout', verifyToken, authController.logout);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/edit', verifyToken, preventAdminModification, authController.editUser);
router.delete('/delete', verifyToken, preventAdminModification, authController.deleteUser);

// Admin routes
router.get('/admin/users', verifyToken, requireAdmin, authController.getAllUsers);
router.delete('/admin/users/:userId', verifyToken, requireAdmin, authController.adminDeleteUser);
router.put('/admin/users/:userId', verifyToken, requireAdmin, authController.adminEditUser);

module.exports = router; 