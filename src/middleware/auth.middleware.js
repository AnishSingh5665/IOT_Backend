const jwt = require('jsonwebtoken');
const config = require('../config/config');
const supabaseService = require('../services/supabase.service');

exports.verifyToken = async (req, res, next) => {
    try {
        // Get the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        // Verify the token with Supabase
        const { data: { user }, error } = await supabaseService.client.auth.getUser(token);

        if (error || !user) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        // Attach the user to the request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying token',
            error: error.message
        });
    }
}; 