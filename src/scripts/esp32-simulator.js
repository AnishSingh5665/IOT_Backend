const mqtt = require('mqtt');

// MQTT Configuration
const brokerUrl = 'ws://mqtt.eclipseprojects.io:80/mqtt';
const topic = 'iot/devices/esp32_01/data';

console.log('Starting ESP32 Simulator...');
console.log('Connecting to broker:', brokerUrl);

// Create MQTT client
const client = mqtt.connect(brokerUrl, {
    clientId: `esp32_simulator_${Date.now()}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
});

// Handle connection
client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    console.log('Starting to publish sensor data...');

    // Start publishing data every 5 seconds
    setInterval(() => {
        const data = {
            deviceId: 'esp32_01',
            timestamp: new Date().toISOString(),
            temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)), // Random temp between 20-30
            vibration: parseFloat((Math.random() * 0.1).toFixed(2)),      // Random vibration between 0-0.1
            current: parseFloat((Math.random() * 2 + 1).toFixed(1))       // Random current between 1-3
        };

        client.publish(topic, JSON.stringify(data), { qos: 1 }, (err) => {
            if (err) {
                console.error('Error publishing:', err);
            } else {
                console.log('Published:', JSON.stringify(data, null, 2));
            }
        });
    }, 5000);
});

// Handle errors
client.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
});

// Handle connection close
client.on('close', () => {
    console.log('Connection closed');
});

// Handle offline
client.on('offline', () => {
    console.log('Client is offline');
});

// Handle reconnect
client.on('reconnect', () => {
    console.log('Attempting to reconnect...');
}); 