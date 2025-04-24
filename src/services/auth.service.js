const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class AuthService {
    // Generate JWT tokens
    generateTokens(userId) {
        const accessToken = jwt.sign(
            { userId },
            config.jwtSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    // Register new user
    async register(email, password) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already registered');
            }

            // Create new user
            const user = new User({
                email,
                password
            });

            await user.save();

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user._id);

            return {
                userId: user._id,
                email: user.email,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Login user
    async login(email, password) {
        try {
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user._id);

            return {
                userId: user._id,
                email: user.email,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Refresh access token
    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error('Refresh token is required');
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwtSecret);
            const { userId } = decoded;

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(userId);

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Get user profile
    async getProfile(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService(); 