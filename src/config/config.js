require('dotenv').config();

// Log environment variables (for debugging)
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

module.exports = {
    // Server Configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL || 'https://iot-frontend.onrender.com'
        : process.env.CLIENT_URL || 'http://localhost:3000',

    // MongoDB Configuration
    mongodbUri: process.env.MONGODB_URI,

    // Supabase Configuration
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'your-default-jwt-secret',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',

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
    },

    // CORS Configuration
    corsOrigin: process.env.CORS_ORIGIN || '*'
}; 