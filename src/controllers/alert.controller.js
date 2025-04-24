const Alert = require('../models/alert.model');

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().select('-__v');
        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts'
        });
    }
};

exports.getAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id).select('-__v');
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }
        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Get alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alert'
        });
    }
};

exports.createAlert = async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating alert'
        });
    }
};

exports.updateAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Update alert error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating alert'
        });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }
        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        console.error('Delete alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting alert'
        });
    }
}; 