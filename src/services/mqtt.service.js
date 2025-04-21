const mqtt = require('mqtt');
const DeviceData = require('../models/deviceData.model');
const config = require('../config/config');

class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000;
    }

    connect() {
        console.log('Connecting to MQTT broker:', config.mqtt.brokerUrl);
        
        try {
            this.client = mqtt.connect(config.mqtt.brokerUrl, config.mqtt.options);

            this.client.on('connect', () => {
                console.log('✅ MQTT Connected to broker');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.subscribeToTopics();
            });

            this.client.on('error', (error) => {
                console.error('❌ MQTT Error:', error.message);
                this.handleReconnect();
            });

            this.client.on('close', () => {
                console.log('MQTT Connection closed');
                this.isConnected = false;
                this.handleReconnect();
            });

            this.client.on('message', this.handleMessage.bind(this));

            this.client.on('offline', () => {
                console.log('MQTT Client is offline');
                this.isConnected = false;
            });

            this.client.on('reconnect', () => {
                console.log('Attempting to reconnect...');
            });

        } catch (error) {
            console.error('Failed to create MQTT client:', error);
            this.handleReconnect();
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            if (this.client) {
                this.client.end();
                this.client = null;
            }
            
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect();
                }
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached. Please check your network connection.');
            setTimeout(() => {
                this.reconnectAttempts = 0;
                this.connect();
            }, 30000);
        }
    }

    subscribeToTopics() {
        if (this.isConnected) {
            const topic = 'iot/devices/+/data';
            this.client.subscribe(topic, { qos: 1 }, (err) => {
                if (err) {
                    console.error('Error subscribing to topics:', err);
                } else {
                    console.log(`Subscribed to topic: ${topic} with QoS 1`);
                }
            });
        }
    }

    async handleMessage(topic, message) {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received data:', JSON.stringify(data, null, 2));

            // Extract deviceId from topic
            const deviceId = topic.split('/')[2];

            // Create device data object
            const deviceData = new DeviceData({
                deviceId,
                timestamp: new Date(data.time),
                voltage: data.voltage,
                temperature: data.temperature,
                vibration: data.vibration,
                singalPCurrent: data.singalPCurrent,
                AphaseCurrent: data.AphaseCurrent,
                BphaseCurrent: data.BphaseCurrent,
                CphaseCurrent: data.CphaseCurrent,
                AgpioState: data.AgpioState,
                BgpioState: data.BgpioState,
                CgpioState: data.CgpioState,
                generalGpio: data.generalGpio,
                rs485DataCount: data.rs485DataCount,
                rs485Data: data.rs485Data
            });

            // Save data to MongoDB
            await deviceData.save();
            console.log('Data saved to MongoDB');

            // Send acknowledgment to device
            const ackTopic = `iot/devices/${deviceId}/ack`;
            this.client.publish(ackTopic, 'OK', { qos: 1 }, (err) => {
                if (err) {
                    console.error('Error sending acknowledgment:', err);
                } else {
                    console.log('Acknowledgment sent to device:', deviceId);
                }
            });

            // Emit real-time data through Socket.IO if available
            if (global.io) {
                global.io.to(`device:${deviceId}`).emit('device:data', deviceData);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    publish(topic, message) {
        if (this.isConnected) {
            this.client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
                if (err) {
                    console.error('Error publishing message:', err);
                }
            });
        } else {
            console.error('Cannot publish: MQTT client not connected');
        }
    }
}

module.exports = new MQTTService(); 