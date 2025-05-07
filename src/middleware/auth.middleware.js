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

        try {
            // First try to verify as a custom JWT token
            const decoded = jwt.verify(token, config.jwtSecret);
            
            // Check if it's a refresh token
            if (decoded.type === 'refresh') {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token cannot be used for authentication'
                });
            }

            // If it's a custom token, check if it's for admin
            if (decoded.is_admin) {
                // Get admin user data
                const { data: userData, error: userError } = await supabaseService.adminClient
                    .from('users')
                    .select('*')
                    .eq('email', 'admin@gmail.com')
                    .single();

                if (userError || !userData) {
                    throw new Error('Admin user not found');
                }

                // Attach admin user to request
                req.user = {
                    id: userData.id,
                    email: userData.email,
                    role: 'admin',
                    is_admin: true
                };
            } else {
                // For regular users with custom token
                const { data: userData, error: userError } = await supabaseService.adminClient
                    .from('users')
                    .select('*')
                    .eq('id', decoded.id)
                    .single();

                if (userError || !userData) {
                    throw new Error('User not found');
                }

                req.user = {
                    id: userData.id,
                    email: userData.email,
                    role: userData.role || 'user'
                };
            }
        } catch (jwtError) {
            // If JWT verification fails, try Supabase token
            const { data: { user }, error } = await supabaseService.client.auth.getUser(token);

            if (error || !user) {
                console.error('Token verification error:', error);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid access token'
                });
            }

            // Get user role from users table
            const { data: userData, error: userError } = await supabaseService.adminClient
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user role:', userError);
                return res.status(401).json({
                    success: false,
                    message: 'Error verifying user role'
                });
            }

            // Attach the user and role to the request
            req.user = {
                ...user,
                role: userData?.role || 'user'
            };
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Middleware to prevent admin from modifying users
exports.preventAdminModification = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin users cannot modify user accounts. Please contact the system administrator.'
        });
    }
    next();
};

// Middleware to require admin access
exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
}; 