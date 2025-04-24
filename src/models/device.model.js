const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['sensor', 'actuator', 'gateway']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    location: {
        type: String,
        required: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    data: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        voltage: Number,
        temperature: Number,
        vibration: Number,
        singalPCurrent: Number,
        AphaseCurrent: Number,
        BphaseCurrent: Number,
        CphaseCurrent: Number,
        AgpioState: Number,
        BgpioState: Number,
        CgpioState: Number,
        generalGpio: Number,
        rs485DataCount: Number,
        rs485Data: [Number]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ 'data.timestamp': -1 });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device; 