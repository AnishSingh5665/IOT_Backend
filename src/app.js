const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const apiRoutes = require('./routes/api.routes');
const authRoutes = require('./routes/auth.routes');
const deviceRoutes = require('./routes/device.routes');
const deviceDataRoutes = require('./routes/devicedata.routes');
const realtimeDataRoutes = require('./routes/realtimeData.routes');
const morgan = require('morgan');
const deviceMonitorService = require('./services/deviceMonitor.service');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api', deviceDataRoutes);
app.use('/api/realtime', realtimeDataRoutes);

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
        message: 'Internal server error'
    });
});

// Set up periodic device status checking (every 5 minutes)
setInterval(async () => {
    try {
        await deviceMonitorService.checkAllSensorDevices();
    } catch (error) {
        console.error('Error in periodic device status check:', error);
    }
}, 5 * 60 * 1000);

// Initial device status check
deviceMonitorService.checkAllSensorDevices().catch(error => {
    console.error('Error in initial device status check:', error);
});

module.exports = app;
