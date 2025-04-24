const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        ref: 'Device'
    },
    type: {
        type: String,
        required: true,
        enum: ['temperature', 'voltage', 'current', 'vibration', 'gpio', 'rs485']
    },
    severity: {
        type: String,
        required: true,
        enum: ['critical', 'warning', 'info'],
        default: 'warning'
    },
    message: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    threshold: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'resolved', 'acknowledged'],
        default: 'active'
    },
    resolvedAt: {
        type: Date
    },
    acknowledgedAt: {
        type: Date
    },
    acknowledgedBy: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
alertSchema.index({ deviceId: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert; 