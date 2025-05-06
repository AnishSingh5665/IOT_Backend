const mqtt = require('mqtt');
const config = require('../config/config');
const { createClient } = require('@supabase/supabase-js');

class CollectDataMQTT {
    constructor() {
        // Initialize MQTT client
        this.client = mqtt.connect(config.mqttBrokerUrl, {
            username: config.mqttUsername,
            password: config.mqttPassword,
            clientId: `collect_data_${Math.random().toString(16).slice(3)}`
        });

        // Initialize Supabase client
        this.supabase = createClient(
            config.supabaseUrl,
            config.supabaseAnonKey
        );

        // Set up MQTT event handlers
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker for data collection');
            this.subscribeToTopics();
        });

        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
        });

        this.client.on('message', this.handleMessage.bind(this));
    }

    // Subscribe to relevant topics
    subscribeToTopics() {
        // Subscribe to input topic for receiving data from frontend
        this.client.subscribe('iot/devices/+/input', (err) => {
            if (err) {
                console.error('Error subscribing to input topics:', err);
            } else {
                console.log('Subscribed to input topics');
            }
        });

        // Subscribe to acknowledgment topics
        this.client.subscribe('iot/devices/+/ack', (err) => {
            if (err) {
                console.error('Error subscribing to ack topics:', err);
            } else {
                console.log('Subscribed to ack topics');
            }
        });
    }

    // Handle incoming MQTT messages
    async handleMessage(topic, message) {
        try {
            const topicParts = topic.split('/');
            const deviceId = topicParts[2];
            const messageType = topicParts[3];
            const data = JSON.parse(message.toString());

            if (messageType === 'input') {
                // Handle input data from frontend
                if (this.validateDataFormat(data)) {
                    // Store the input data
                    await this.storeInputData(deviceId, data);
                    console.log(`Received input data for device ${deviceId}:`, data);
                } else {
                    console.error(`Invalid data format for device ${deviceId}:`, data);
                }
            } else if (messageType === 'ack') {
                // Handle acknowledgment from hardware
                await this.storeAcknowledgment(deviceId, data);
                console.log(`Received acknowledgment for device ${deviceId}:`, data);
            }
        } catch (error) {
            console.error('Error handling MQTT message:', error);
        }
    }

    // Validate data format
    validateDataFormat(data) {
        const requiredFields = ['Gpio0', 'Gpio1', 'Gpio2', 'Adc1', 'Adc2'];
        
        // Check if all required fields are present
        if (!requiredFields.every(field => field in data)) {
            return false;
        }

        // Validate GPIO values (should be 0 or 1)
        if (![0, 1].includes(data.Gpio0) || 
            ![0, 1].includes(data.Gpio1) || 
            ![0, 1].includes(data.Gpio2)) {
            return false;
        }

        // Validate ADC values (should be numbers)
        if (typeof data.Adc1 !== 'number' || typeof data.Adc2 !== 'number') {
            return false;
        }

        return true;
    }

    // Store input data in database
    async storeInputData(deviceId, data) {
        try {
            const { error } = await this.supabase
                .from('device_inputs')
                .insert([{
                    device_id: deviceId,
                    input_data: data,
                    timestamp: new Date().toISOString()
                }]);

            if (error) {
                console.error('Error storing input data:', error);
            }
        } catch (error) {
            console.error('Error in storeInputData:', error);
        }
    }

    // Store acknowledgment in database
    async storeAcknowledgment(deviceId, data) {
        try {
            const { error } = await this.supabase
                .from('device_acknowledgments')
                .insert([{
                    device_id: deviceId,
                    ack_data: data,
                    timestamp: new Date().toISOString()
                }]);

            if (error) {
                console.error('Error storing acknowledgment:', error);
            }
        } catch (error) {
            console.error('Error in storeAcknowledgment:', error);
        }
    }
}

module.exports = new CollectDataMQTT(); 