const mqtt = require('mqtt');

// MQTT client options
const options = {
    host: 'localhost',
    port: 1883,
    protocol: 'mqtt',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: 'esp32_simulator'
};

// Create client
const client = mqtt.connect(options);

// Simulated sensor readings
function getRandomValue(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

// Handle connection
client.on('connect', () => {
    console.log('ESP32 Simulator connected to MQTT broker');
    
    // Simulate sensor readings every 5 seconds
    setInterval(() => {
        const data = {
            deviceId: 'esp32_01',
            timestamp: new Date().toISOString(),
            temperature: parseFloat(getRandomValue(20, 30)),
            vibration: parseFloat(getRandomValue(0, 0.1)),
            current: parseFloat(getRandomValue(1, 2))
        };
        
        client.publish('iot/devices/esp32_01/data', JSON.stringify(data), (err) => {
            if (err) {
                console.error('Publish error:', err);
            } else {
                console.log('Published sensor data:', data);
            }
        });
    }, 5000);
});

// Handle errors
client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    client.end();
    process.exit();
}); 