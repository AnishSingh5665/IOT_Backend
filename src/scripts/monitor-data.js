const mqtt = require('mqtt');
const mongoose = require('mongoose');
const DeviceData = require('../models/deviceData.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// MQTT client options
const options = {
    host: 'test.mosquitto.org',
    port: 1883,
    protocol: 'mqtt',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `monitor_${Date.now()}`
};

// Create MQTT client
const client = mqtt.connect(options);

// Handle connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('iot/devices/+/data', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Subscribed to iot/devices/+/data');
        }
    });
});

// Handle incoming messages
client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log('\nReceived MQTT Message:');
        console.log('Topic:', topic);
        console.log('Data:', data);

        // Save to MongoDB
        const deviceData = new DeviceData({
            deviceId: data.deviceId,
            timestamp: data.timestamp || new Date(),
            temperature: data.temperature,
            vibration: data.vibration,
            current: data.current
        });

        await deviceData.save();
        console.log('Data saved to MongoDB');

        // Query latest 5 records
        const latestData = await DeviceData.find()
            .sort({ timestamp: -1 })
            .limit(5);

        console.log('\nLatest 5 Records in Database:');
        console.log('--------------------------------');
        latestData.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`Device ID: ${record.deviceId}`);
            console.log(`Timestamp: ${record.timestamp}`);
            console.log(`Temperature: ${record.temperature}°C`);
            console.log(`Vibration: ${record.vibration}`);
            console.log(`Current: ${record.current}A`);
        });

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Handle errors
client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    client.end();
    mongoose.disconnect();
    process.exit();
}); 