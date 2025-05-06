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
        const { email, password, name } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const { data: existingUsers, error: checkError } = await supabaseService.adminClient
            .from('users')
            .select('*')
            .eq('email', email);

        if (checkError) {
            throw checkError;
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered. Please use a different email or try logging in.'
            });
        }

        // Sign up user using the service
        const { data, error } = await supabaseService.signUp(email, password, name);

        if (error) {
            if (error.message.includes('already registered')) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered. Please use a different email or try logging in.'
                });
            }
            throw error;
        }

        // Check if it's admin user to customize the response message
        const isAdmin = email === 'admin@gmail.com';
        const message = isAdmin 
            ? 'Admin user registered successfully.'
            : 'User registered successfully. Please check your email for confirmation.';

        res.status(201).json({
            success: true,
            message: message,
            data: {
                user: data.user
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
            if (error.message.includes('Invalid email or password')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
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
        // Get the token from the request
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.clearCookie('access_token');
            return res.json({
                success: true,
                message: 'Logged out successfully',
                data: {
                    session: null,
                    access_token: null
                }
            });
        }

        // Sign out from Supabase using the token
        const { error: signOutError } = await supabaseService.client.auth.signOut({
            scope: 'global'
        });
        
        if (signOutError) {
            console.error('Sign out error:', signOutError);
        }

        // Clear the access token from the response
        res.clearCookie('access_token');
        
        res.json({
            success: true,
            message: 'Logged out successfully',
            data: {
                session: null,
                access_token: null
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, we'll try to clear the tokens
        res.clearCookie('access_token');
        res.json({
            success: true,
            message: 'Logged out successfully',
            data: {
                session: null,
                access_token: null
            }
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

        // Get the user's profile data using admin client to bypass RLS
        const { data: userData, error } = await supabaseService.adminClient
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

        if (!userData) {
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

// Edit user profile
exports.editUser = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const { error } = await supabaseService.adminClient
            .from('users')
            .update({ name })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'User profile updated successfully',
            data: {
                name
            }
        });
    } catch (error) {
        console.error('Edit user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user profile',
            error: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // First delete from users table
        const { error: dbError } = await supabaseService.adminClient
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Error deleting from users table:', dbError);
            // Continue with auth deletion even if users table deletion fails
        }

        // Then delete from auth
        try {
            const { error: authError } = await supabaseService.adminClient.auth.admin.deleteUser(userId);
            if (authError) {
                console.error('Error deleting from auth:', authError);
                // If auth deletion fails, we should try to restore the users table record
                if (!dbError) {
                    await supabaseService.adminClient
                        .from('users')
                        .insert([{
                            id: userId,
                            email: req.user.email,
                            name: req.user.user_metadata?.name || '',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }]);
                }
                throw authError;
            }
        } catch (authError) {
            console.error('Auth deletion error:', authError);
            throw authError;
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

module.exports = exports; 