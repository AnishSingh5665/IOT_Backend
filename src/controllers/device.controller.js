const DeviceData = require('../models/deviceData.model');
const Device = require('../models/device.model');
const { exportToCSV } = require('../utils/export');
const deviceService = require('../services/device.service');

exports.getDevices = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await deviceService.getDevices(userId);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Error fetching devices',
                error: error.message
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get devices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching devices',
            error: error.message
        });
    }
};

exports.getDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const deviceId = req.params.id;

        const { data, error } = await deviceService.getDeviceById(userId, deviceId);

        if (error) {
            if (error.message === 'Device not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Error fetching device',
                error: error.message
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get device error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching device',
            error: error.message
        });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { name, type, status, min_threshold_value, max_threshold_value } = req.body;
        const userId = req.user.id;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Device name and type are required'
            });
        }

        const { data, error } = await deviceService.createDevice(userId, {
            name,
            type,
            status: status || 'active',
            min_threshold_value: min_threshold_value || null,
            max_threshold_value: max_threshold_value || null
        });

        if (error) {
            console.error('Error creating device:', error);
            return res.status(400).json({
                success: false,
                message: 'Error creating device',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Device created successfully',
            data
        });
    } catch (error) {
        console.error('Create device error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating device',
            error: error.message
        });
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const deviceId = req.params.id;
        const { name, type, status, min_threshold_value, max_threshold_value } = req.body;

        if (!name && !type && !status && min_threshold_value === undefined && max_threshold_value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No valid updates provided'
            });
        }

        const updates = {
            ...(name && { name }),
            ...(type && { type }),
            ...(status && { status }),
            ...(min_threshold_value !== undefined && { min_threshold_value }),
            ...(max_threshold_value !== undefined && { max_threshold_value })
        };

        const { data, error } = await deviceService.updateDevice(userId, deviceId, updates);

        if (error) {
            if (error.message === 'Device not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Error updating device',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Device updated successfully',
            data
        });
    } catch (error) {
        console.error('Update device error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating device',
            error: error.message
        });
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const deviceId = req.params.id;

        const { error } = await deviceService.deleteDevice(userId, deviceId);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Error deleting device',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Device deleted successfully'
        });
    } catch (error) {
        console.error('Delete device error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting device',
            error: error.message
        });
    }
}; 