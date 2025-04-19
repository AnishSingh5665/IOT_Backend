const mqtt = require('mqtt');

// MQTT client options
const options = {
    host: 'localhost',
    port: 1883,
    protocol: 'mqtt',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
};

// Create client
const client = mqtt.connect(options);

// Handle connection
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to test topic
    client.subscribe('test/topic', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Subscribed to test/topic');
            
            // Publish test message
            const message = {
                deviceId: 'test_device',
                timestamp: new Date().toISOString(),
                temperature: 25.5,
                vibration: 0.02,
                current: 1.2
            };
            
            client.publish('test/topic', JSON.stringify(message), (err) => {
                if (err) {
                    console.error('Publish error:', err);
                } else {
                    console.log('Published test message');
                }
            });
        }
    });
});

// Handle incoming messages
client.on('message', (topic, message) => {
    console.log('Received message:');
    console.log('Topic:', topic);
    console.log('Message:', message.toString());
});

// Handle errors
client.on('error', (error) => {
    console.error('MQTT Error:', error);
});

// Handle disconnection
client.on('close', () => {
    console.log('Connection closed');
});

// Handle process termination
process.on('SIGINT', () => {
    client.end();
    process.exit();
}); 