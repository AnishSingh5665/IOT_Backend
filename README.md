# IoT Backend

A Node.js backend for collecting and managing data from ESP32 devices using MQTT and MongoDB.

## Features

- MQTT data collection from ESP32 devices
- MongoDB data storage
- REST API for device management
- Real-time data monitoring
- User authentication
- CORS support
- Error handling

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- MQTT broker (test.mosquitto.org for testing)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/iot-db
   MQTT_BROKER_URL=mqtt://test.mosquitto.org:1883
   MQTT_USERNAME=public
   MQTT_PASSWORD=public
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Testing

Run the test suite:
```bash
npm test
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

## MQTT Topics

- `devices/+/data` - Device data topic
- `devices/+/status` - Device status topic

## Monitoring

Use the monitoring script to view incoming MQTT data:
```bash
node src/scripts/monitor-data.js
```

## License

MIT 