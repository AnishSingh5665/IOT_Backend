require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || '*',

    // MongoDB Configuration
    mongodbUri: process.env.MONGODB_URI,

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET,

    // MQTT Configuration
    mqtt: {
        brokerUrl: process.env.MQTT_BROKER_URL || 'ws://mqtt.eclipseprojects.io:80/mqtt',
        username: process.env.MQTT_USERNAME || '',
        password: process.env.MQTT_PASSWORD || '',
        options: {
            clientId: `iot_backend_${Date.now()}`,
            clean: true,
            reconnectPeriod: 3000,
            connectTimeout: 8000,
            keepalive: 30,
            rejectUnauthorized: false,
            protocolVersion: 4,
            resubscribe: true
        }
    }
}; 