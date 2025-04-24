const realtimeDataService = require('../services/realtimeData.service');

// Get latest data for a specific device
exports.getDeviceData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const data = await realtimeDataService.getLatestDeviceData(deviceId);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the device'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getDeviceData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching device data'
        });
    }
};

// Get latest data for all devices
exports.getAllDevicesData = async (req, res) => {
    try {
        const data = await realtimeDataService.getAllDevicesLatestData();
        
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getAllDevicesData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all devices data'
        });
    }
};

// Get aggregated sensor data across all devices
exports.getAggregatedSensorData = async (req, res) => {
    try {
        const data = await realtimeDataService.getAggregatedSensorData();
        
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getAggregatedSensorData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching aggregated sensor data'
        });
    }
};

exports.getSensorDataHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { limit } = req.query;
        
        const data = await realtimeDataService.getSensorDataHistory(deviceId, limit);
        
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getSensorDataHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensor data history'
        });
    }
};

// Get voltage data for all devices
exports.getVoltageData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getVoltageData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getVoltageData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching voltage data'
        });
    }
};

// Get temperature data for all devices
exports.getTemperatureData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getTemperatureData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getTemperatureData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching temperature data'
        });
    }
};

// Get vibration data for all devices
exports.getVibrationData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getVibrationData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getVibrationData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vibration data'
        });
    }
};

// Get single phase current data for all devices
exports.getSinglePhaseCurrentData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getSinglePhaseCurrentData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getSinglePhaseCurrentData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching single phase current data'
        });
    }
};

// Get A phase current data for all devices
exports.getAPhaseCurrentData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getAPhaseCurrentData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getAPhaseCurrentData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching A phase current data'
        });
    }
};

// Get B phase current data for all devices
exports.getBPhaseCurrentData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getBPhaseCurrentData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getBPhaseCurrentData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching B phase current data'
        });
    }
};

// Get C phase current data for all devices
exports.getCPhaseCurrentData = async (req, res) => {
    try {
        const { startTime, endTime, interval, limit } = req.query;
        const data = await realtimeDataService.getCPhaseCurrentData({ startTime, endTime, interval, limit });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getCPhaseCurrentData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching C phase current data'
        });
    }
};

// Get monitoring data for a specific device
exports.getDeviceMonitoringData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startTime, endTime, limit } = req.query;
        
        const data = await realtimeDataService.getDeviceMonitoringData(deviceId, { startTime, endTime, limit });
        
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getDeviceMonitoringData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching device monitoring data'
        });
    }
};

// Get monitoring data for all devices
exports.getAllDevicesMonitoringData = async (req, res) => {
    try {
        const { startTime, endTime, limit } = req.query;
        
        const data = await realtimeDataService.getAllDevicesMonitoringData({ startTime, endTime, limit });
        
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getAllDevicesMonitoringData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all devices monitoring data'
        });
    }
}; 