const dashboardService = require('../services/dashboard.service');

class DashboardController {
    async getDashboardStats(req, res) {
        try {
            const userId = req.user.id;
            const { data, error } = await dashboardService.getDashboardStats(userId);

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getTotalDevices(req, res) {
        try {
            const userId = req.user.id;
            const { data, error } = await dashboardService.getTotalDevices(userId);

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data: { totalDevices: data }
            });
        } catch (error) {
            console.error('Error in getTotalDevices:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getActiveAlertsCount(req, res) {
        try {
            const userId = req.user.id;
            const { data, error } = await dashboardService.getActiveAlertsCount(userId);

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data: { activeAlerts: data }
            });
        } catch (error) {
            console.error('Error in getActiveAlertsCount:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getRecentAlerts(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 5;
            const { data, error } = await dashboardService.getRecentAlerts(userId, limit);

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            res.json({
                success: true,
                data: { recentAlerts: data }
            });
        } catch (error) {
            console.error('Error in getRecentAlerts:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new DashboardController(); 