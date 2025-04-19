const mongoose = require('mongoose');

const deviceDataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    temperature: {
        type: Number,
        required: true
    },
    current: {
        type: Number,
        required: false
    },
    vibration: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});

// Index for faster queries
deviceDataSchema.index({ deviceId: 1, timestamp: -1 });

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

module.exports = DeviceData; 