const supabaseService = require('../services/supabase.service');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Password validation function
const isValidPassword = (password) => {
    return password && typeof password === 'string' && password.length >= 6;
};

// Generate JWT tokens for our API
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        config.jwtSecret,
        { expiresIn: config.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
        { userId },
        config.jwtSecret,
        { expiresIn: config.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
};

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Sign up user
        const { data, error } = await supabaseService.signUp(email, password);

        if (error) {
            if (error.message.includes('already registered')) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for confirmation.',
            data: {
                user: data.user,
                session: data.session
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Sign in user
        const { data, error } = await supabaseService.signIn(email, password);

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                return res.status(401).json({
                    success: false,
                    message: 'Please confirm your email before logging in'
                });
            }
            if (error.message.includes('Invalid password')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
            if (error.message.includes('User not found')) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            if (error.message.includes('Multiple users found')) {
                return res.status(500).json({
                    success: false,
                    message: 'System error: Multiple users found with same email'
                });
            }
            throw error;
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: data.user,
                session: data.session
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        await supabaseService.signOut();
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get the user's profile data
        const { data: userData, error } = await supabaseService.client
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        // Remove sensitive data
        const { password, ...profile } = userData;

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
}; 