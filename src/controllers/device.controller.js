const DeviceData = require('../models/deviceData.model');

exports.getDeviceData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;

        let query = { deviceId };

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const data = await DeviceData.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching device data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching device data'
        });
    }
};

exports.getLatestDeviceData = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const data = await DeviceData.findOne({ deviceId })
            .sort({ timestamp: -1 });

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching latest device data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latest device data'
        });
    }
}; 