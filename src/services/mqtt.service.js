const mqtt = require('mqtt');
const DeviceData = require('../models/deviceData.model');

class MQTTService {
    constructor() {
        this.client = null;
        this.connect();
    }

    connect() {
        // Connect to MQTT broker
        this.client = mqtt.connect(process.env.MQTT_BROKER_URL, {
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            clientId: `nodejs_server_${Date.now()}`,
            clean: true
        });

        // Handle connection events
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.subscribeToTopics();
        });

        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
        });

        this.client.on('close', () => {
            console.log('MQTT Connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        });

        // Handle incoming messages
        this.client.on('message', this.handleMessage.bind(this));
    }

    subscribeToTopics() {
        // Subscribe to all device data topics
        this.client.subscribe('iot/devices/+/data', (err) => {
            if (err) {
                console.error('Error subscribing to topics:', err);
            } else {
                console.log('Subscribed to iot/devices/+/data');
            }
        });
    }

    async handleMessage(topic, message) {
        try {
            const data = JSON.parse(message.toString());
            
            // Validate required fields
            if (!data.deviceId || !data.temperature || !data.vibration || !data.current) {
                console.error('Invalid data format:', data);
                return;
            }

            // Create new device data record
            const deviceData = new DeviceData({
                deviceId: data.deviceId,
                timestamp: data.timestamp || new Date(),
                temperature: data.temperature,
                vibration: data.vibration,
                current: data.current
            });

            // Save to database
            await deviceData.save();
            console.log(`Saved data from device ${data.deviceId}`);

            // Emit data through Socket.IO if needed
            if (global.io) {
                global.io.emit(`device:${data.deviceId}`, data);
            }

        } catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    }

    publish(topic, message) {
        if (this.client && this.client.connected) {
            this.client.publish(topic, JSON.stringify(message));
        } else {
            console.error('MQTT client not connected');
        }
    }
}

// Create singleton instance
const mqttService = new MQTTService();

module.exports = mqttService; 