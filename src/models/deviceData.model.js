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
        index: true
    },
    voltage: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    vibration: {
        type: Number,
        required: true
    },
    singalPCurrent: {
        type: Number,
        required: true
    },
    AphaseCurrent: {
        type: Number,
        required: true
    },
    BphaseCurrent: {
        type: Number,
        required: true
    },
    CphaseCurrent: {
        type: Number,
        required: true
    },
    AgpioState: {
        type: Number,
        required: true
    },
    BgpioState: {
        type: Number,
        required: true
    },
    CgpioState: {
        type: Number,
        required: true
    },
    generalGpio: {
        type: [Boolean],
        required: true
    },
    rs485DataCount: {
        type: Number,
        required: true
    },
    rs485Data: {
        type: [String],
        required: true
    }
}, {
    timestamps: true
});

// Create compound index for faster queries
deviceDataSchema.index({ deviceId: 1, timestamp: -1 });

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

module.exports = DeviceData; 