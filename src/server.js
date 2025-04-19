const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const mqttService = require('./services/mqtt.service');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',  // Allow all origins in production
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Store io instance globally for MQTT service
global.io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle device data subscription
    socket.on('subscribe:device', (deviceId) => {
        socket.join(`device:${deviceId}`);
        console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Store io instance in app for use in other files
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`MQTT Broker: ${process.env.MQTT_BROKER_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
