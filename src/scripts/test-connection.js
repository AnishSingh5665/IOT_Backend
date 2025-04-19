const mqtt = require('mqtt');
const mongoose = require('mongoose');
const DeviceData = require('../models/deviceData.model');

console.log('Starting connection test...');

// Test MongoDB connection
async function testMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connection: SUCCESS');
        
        // Test a simple query
        const count = await DeviceData.countDocuments();
        console.log(`📊 Current documents in database: ${count}`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ MongoDB Connection: FAILED');
        console.error(error);
    }
}

// Test MQTT connection
function testMQTT() {
    const options = {
        host: 'test.mosquitto.org',
        port: 1883,
        protocol: 'mqtt',
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `test_${Date.now()}`
    };

    const client = mqtt.connect(options);

    client.on('connect', () => {
        console.log('✅ MQTT Connection: SUCCESS');
        
        // Test subscription
        client.subscribe('iot/devices/+/data', (err) => {
            if (err) {
                console.error('❌ MQTT Subscription: FAILED');
                console.error(err);
            } else {
                console.log('✅ MQTT Subscription: SUCCESS');
            }
            client.end();
        });
    });

    client.on('error', (error) => {
        console.error('❌ MQTT Connection: FAILED');
        console.error(error);
        client.end();
    });
}

// Run tests
console.log('\nTesting MongoDB Connection...');
testMongoDB().then(() => {
    console.log('\nTesting MQTT Connection...');
    testMQTT();
}); 