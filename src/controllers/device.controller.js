const DeviceData = require('../models/deviceData.model');
const Device = require('../models/device.model');
const { exportToCSV } = require('../utils/export');
const deviceService = require('../services/device.service');

class DeviceController {
    async createDevice(req, res) {
        try {
            const userId = req.user.id;
            const deviceData = req.body;

            const { data, error } = await deviceService.createDevice(userId, deviceData);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(201).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in createDevice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getDevices(req, res) {
        try {
            const userId = req.user.id;
            
            // If no query parameters are present, return all devices without pagination
            if (Object.keys(req.query).length === 0) {
                const { data, error } = await deviceService.getAllDevices(userId);
                
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: error.message
                    });
                }

                return res.json({
                    success: true,
                    data: data
                });
            }

            // If query parameters are present, use the filtered/paginated version
            const options = {
                type: req.query.type,
                status: req.query.status,
                search: req.query.search,
                sortBy: req.query.sortBy,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };

            const { data, count, error } = await deviceService.getDevices(userId, options);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data: {
                    devices: data,
                    pagination: {
                        total: count,
                        page: options.page,
                        limit: options.limit,
                        totalPages: Math.ceil(count / options.limit)
                    },
                    filters: {
                        type: options.type,
                        status: options.status,
                        search: options.search,
                        sortBy: options.sortBy
                    }
                }
            });
        } catch (error) {
            console.error('Error in getDevices:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getDeviceById(req, res) {
        try {
            const userId = req.user.id;
            const deviceId = req.params.id;

            const { data, error } = await deviceService.getDeviceById(userId, deviceId);

            if (error) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in getDeviceById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateDevice(req, res) {
        try {
            const userId = req.user.id;
            const deviceId = req.params.id;
            const updates = req.body;

            const { data, error } = await deviceService.updateDevice(userId, deviceId, updates);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in updateDevice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteDevice(req, res) {
        try {
            const userId = req.user.id;
            const deviceId = req.params.id;

            const { error } = await deviceService.deleteDevice(userId, deviceId);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                message: 'Device deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteDevice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new DeviceController(); 