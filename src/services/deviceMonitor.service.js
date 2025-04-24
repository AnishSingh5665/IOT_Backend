const DeviceData = require('../models/deviceData.model');
const supabaseService = require('./supabase.service');

class DeviceMonitorService {
    async updateDeviceStatus(deviceId) {
        try {
            // Get the latest device data from MongoDB
            const latestData = await DeviceData.findOne({ deviceId })
                .sort({ timestamp: -1 });

            if (!latestData) {
                // If no data found, set status to offline
                await this.updateSupabaseStatus(deviceId, 'offline');
                return;
            }

            // Check if all required sensor values are present and valid
            const isOnline = this.checkSensorValues(latestData);

            // Update status in Supabase
            await this.updateSupabaseStatus(deviceId, isOnline ? 'online' : 'offline');
        } catch (error) {
            console.error('Error updating device status:', error);
            // In case of error, set status to offline
            await this.updateSupabaseStatus(deviceId, 'offline');
        }
    }

    checkSensorValues(data) {
        // Check if all required sensor values are present and not null
        const requiredSensors = [
            'voltage',
            'temperature',
            'vibration',
            'singalPCurrent',
            'AphaseCurrent',
            'BphaseCurrent',
            'CphaseCurrent'
        ];

        return requiredSensors.every(sensor => {
            const value = data[sensor];
            return value !== null && value !== undefined && !isNaN(value);
        });
    }

    async updateSupabaseStatus(deviceId, status) {
        try {
            const { error } = await supabaseService.adminClient
                .from('devices')
                .update({ status })
                .eq('id', deviceId);

            if (error) {
                console.error('Error updating Supabase status:', error);
            }
        } catch (error) {
            console.error('Error updating Supabase status:', error);
        }
    }

    // Method to check all sensor devices periodically
    async checkAllSensorDevices() {
        try {
            // Get all sensor devices from Supabase
            const { data: devices, error } = await supabaseService.adminClient
                .from('devices')
                .select('id')
                .eq('type', 'sensor');

            if (error) {
                console.error('Error fetching sensor devices:', error);
                return;
            }

            // Update status for each sensor device
            for (const device of devices) {
                await this.updateDeviceStatus(device.id);
            }
        } catch (error) {
            console.error('Error checking sensor devices:', error);
        }
    }
}

module.exports = new DeviceMonitorService(); 