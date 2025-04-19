const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const deviceRoutes = require('./routes/device.routes');

const app = express();

// Middleware
app.use(cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', deviceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

module.exports = app;
