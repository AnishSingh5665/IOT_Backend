const mongoose = require('mongoose');
const DeviceData = require('../models/deviceData.model');

async function queryData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Query the latest 5 records
        const latestData = await DeviceData.find()
            .sort({ timestamp: -1 })
            .limit(5);

        console.log('\nLatest 5 Device Data Records:');
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
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

queryData(); 