const supabaseService = require('./supabase.service');

class DashboardService {
    async getTotalDevices(userId) {
        try {
            const { count, error } = await supabaseService.adminClient
                .from('devices')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                console.error('Error getting total devices count:', error);
                return { data: null, error };
            }

            return { data: count, error: null };
        } catch (error) {
            console.error('Error getting total devices count:', error);
            return { data: null, error };
        }
    }

    async getActiveAlertsCount() {
        try {
            const { count, error } = await supabaseService.adminClient
                .from('alerts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            if (error) {
                console.error('Error getting active alerts count:', error);
                return { data: null, error };
            }

            return { data: count, error: null };
        } catch (error) {
            console.error('Error getting active alerts count:', error);
            return { data: null, error };
        }
    }

    async getRecentAlerts(limit = 5) {
        try {
            const { data, error } = await supabaseService.adminClient
                .from('alerts')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error getting recent alerts:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Error getting recent alerts:', error);
            return { data: null, error };
        }
    }

    async getDashboardStats(userId) {
        try {
            const [devicesResult, alertsResult, recentAlertsResult] = await Promise.all([
                this.getTotalDevices(userId),
                this.getActiveAlertsCount(),
                this.getRecentAlerts()
            ]);

            if (devicesResult.error || alertsResult.error || recentAlertsResult.error) {
                return {
                    data: null,
                    error: new Error('Error fetching dashboard stats')
                };
            }

            return {
                data: {
                    totalDevices: devicesResult.data,
                    activeAlerts: alertsResult.data,
                    recentAlerts: recentAlertsResult.data
                },
                error: null
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return { data: null, error };
        }
    }
}

module.exports = new DashboardService(); 