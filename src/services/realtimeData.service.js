const DeviceData = require('../models/deviceData.model');

class RealtimeDataService {
    // Get latest data for a specific device
    async getLatestDeviceData(deviceId) {
        try {
            const latestData = await DeviceData.findOne({ deviceId })
                .sort({ timestamp: -1 })
                .select('timestamp voltage temperature vibration singalPCurrent AphaseCurrent BphaseCurrent CphaseCurrent');

            if (!latestData) {
                return null;
            }

            return {
                deviceId,
                timestamp: latestData.timestamp,
                voltage: latestData.voltage,
                temperature: latestData.temperature,
                vibration: latestData.vibration,
                singalPCurrent: latestData.singalPCurrent,
                AphaseCurrent: latestData.AphaseCurrent,
                BphaseCurrent: latestData.BphaseCurrent,
                CphaseCurrent: latestData.CphaseCurrent
            };
        } catch (error) {
            console.error('Error fetching device data:', error);
            throw error;
        }
    }

    // Get latest data for all devices
    async getAllDevicesLatestData() {
        try {
            // Get unique deviceIds
            const deviceIds = await DeviceData.distinct('deviceId');
            
            // Get latest data for each device
            const devicesData = await Promise.all(
                deviceIds.map(deviceId => this.getLatestDeviceData(deviceId))
            );

            return devicesData.filter(data => data !== null);
        } catch (error) {
            console.error('Error fetching all devices data:', error);
            throw error;
        }
    }

    // Get aggregated sensor data across all devices
    async getAggregatedSensorData() {
        try {
            const latestData = await DeviceData.find()
                .sort({ timestamp: -1 })
                .select('deviceId timestamp voltage temperature vibration singalPCurrent AphaseCurrent BphaseCurrent CphaseCurrent');

            // Group data by sensor type
            const aggregatedData = {
                voltage: [],
                temperature: [],
                vibration: [],
                singalPCurrent: [],
                AphaseCurrent: [],
                BphaseCurrent: [],
                CphaseCurrent: []
            };

            latestData.forEach(data => {
                if (data.voltage !== undefined) {
                    aggregatedData.voltage.push({
                        deviceId: data.deviceId,
                        value: data.voltage,
                        timestamp: data.timestamp
                    });
                }
                if (data.temperature !== undefined) {
                    aggregatedData.temperature.push({
                        deviceId: data.deviceId,
                        value: data.temperature,
                        timestamp: data.timestamp
                    });
                }
                if (data.vibration !== undefined) {
                    aggregatedData.vibration.push({
                        deviceId: data.deviceId,
                        value: data.vibration,
                        timestamp: data.timestamp
                    });
                }
                if (data.singalPCurrent !== undefined) {
                    aggregatedData.singalPCurrent.push({
                        deviceId: data.deviceId,
                        value: data.singalPCurrent,
                        timestamp: data.timestamp
                    });
                }
                if (data.AphaseCurrent !== undefined) {
                    aggregatedData.AphaseCurrent.push({
                        deviceId: data.deviceId,
                        value: data.AphaseCurrent,
                        timestamp: data.timestamp
                    });
                }
                if (data.BphaseCurrent !== undefined) {
                    aggregatedData.BphaseCurrent.push({
                        deviceId: data.deviceId,
                        value: data.BphaseCurrent,
                        timestamp: data.timestamp
                    });
                }
                if (data.CphaseCurrent !== undefined) {
                    aggregatedData.CphaseCurrent.push({
                        deviceId: data.deviceId,
                        value: data.CphaseCurrent,
                        timestamp: data.timestamp
                    });
                }
            });

            return aggregatedData;
        } catch (error) {
            console.error('Error fetching aggregated sensor data:', error);
            throw error;
        }
    }

    async getSensorDataHistory(deviceId, limit = 100) {
        try {
            const data = await DeviceData.find({ deviceId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('timestamp voltage temperature vibration singalPCurrent AphaseCurrent BphaseCurrent CphaseCurrent');

            return data.map(record => ({
                timestamp: record.timestamp,
                voltage: record.voltage,
                temperature: record.temperature,
                vibration: record.vibration,
                singalPCurrent: record.singalPCurrent,
                AphaseCurrent: record.AphaseCurrent,
                BphaseCurrent: record.BphaseCurrent,
                CphaseCurrent: record.CphaseCurrent
            }));
        } catch (error) {
            console.error('Error fetching sensor data history:', error);
            throw error;
        }
    }

    // Get voltage data for all devices with time range and aggregation
    async getVoltageData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp voltage');

            // Group data by device and apply time interval aggregation
            const groupedData = this.aggregateDataByInterval(data, 'voltage', interval);

            return groupedData;
        } catch (error) {
            console.error('Error fetching voltage data:', error);
            throw error;
        }
    }

    // Get temperature data for all devices with time range and aggregation
    async getTemperatureData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp temperature');

            return this.aggregateDataByInterval(data, 'temperature', interval);
        } catch (error) {
            console.error('Error fetching temperature data:', error);
            throw error;
        }
    }

    // Get vibration data for all devices with time range and aggregation
    async getVibrationData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp vibration');

            return this.aggregateDataByInterval(data, 'vibration', interval);
        } catch (error) {
            console.error('Error fetching vibration data:', error);
            throw error;
        }
    }

    // Get single phase current data for all devices with time range and aggregation
    async getSinglePhaseCurrentData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp singalPCurrent');

            return this.aggregateDataByInterval(data, 'singalPCurrent', interval);
        } catch (error) {
            console.error('Error fetching single phase current data:', error);
            throw error;
        }
    }

    // Get A phase current data for all devices with time range and aggregation
    async getAPhaseCurrentData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp AphaseCurrent');

            return this.aggregateDataByInterval(data, 'AphaseCurrent', interval);
        } catch (error) {
            console.error('Error fetching A phase current data:', error);
            throw error;
        }
    }

    // Get B phase current data for all devices with time range and aggregation
    async getBPhaseCurrentData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp BphaseCurrent');

            return this.aggregateDataByInterval(data, 'BphaseCurrent', interval);
        } catch (error) {
            console.error('Error fetching B phase current data:', error);
            throw error;
        }
    }

    // Get C phase current data for all devices with time range and aggregation
    async getCPhaseCurrentData({ startTime, endTime, interval = '1m', limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('deviceId timestamp CphaseCurrent');

            return this.aggregateDataByInterval(data, 'CphaseCurrent', interval);
        } catch (error) {
            console.error('Error fetching C phase current data:', error);
            throw error;
        }
    }

    // Helper method to aggregate data by time intervals
    aggregateDataByInterval(data, field, interval) {
        const intervalMs = this.getIntervalMs(interval);
        const groupedData = {};

        data.forEach(record => {
            const deviceId = record.deviceId;
            if (!groupedData[deviceId]) {
                groupedData[deviceId] = [];
            }

            const timestamp = new Date(record.timestamp);
            const intervalTimestamp = new Date(Math.floor(timestamp.getTime() / intervalMs) * intervalMs);

            groupedData[deviceId].push({
                timestamp: intervalTimestamp,
                value: record[field]
            });
        });

        return groupedData;
    }

    // Helper method to convert interval string to milliseconds
    getIntervalMs(interval) {
        const unit = interval.slice(-1);
        const value = parseInt(interval.slice(0, -1));

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 60 * 1000; // Default to 1 minute
        }
    }

    // Get all sensor values for device monitoring
    async getDeviceMonitoringData(deviceId, { startTime, endTime, limit = 1000 }) {
        try {
            let query = { deviceId };
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            const data = await DeviceData.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('timestamp voltage temperature vibration singalPCurrent AphaseCurrent BphaseCurrent CphaseCurrent');

            return data.map(record => ({
                timestamp: record.timestamp,
                voltage: record.voltage,
                temperature: record.temperature,
                vibration: record.vibration,
                singalPCurrent: record.singalPCurrent,
                AphaseCurrent: record.AphaseCurrent,
                BphaseCurrent: record.BphaseCurrent,
                CphaseCurrent: record.CphaseCurrent
            }));
        } catch (error) {
            console.error('Error fetching device monitoring data:', error);
            throw error;
        }
    }

    // Get latest monitoring data for all devices
    async getAllDevicesMonitoringData({ startTime, endTime, limit = 1000 }) {
        try {
            let query = {};
            if (startTime && endTime) {
                query.timestamp = {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                };
            }

            // Get unique deviceIds
            const deviceIds = await DeviceData.distinct('deviceId');
            
            // Get latest data for each device
            const devicesData = await Promise.all(
                deviceIds.map(deviceId => 
                    DeviceData.findOne({ deviceId, ...query })
                        .sort({ timestamp: -1 })
                        .select('deviceId timestamp voltage temperature vibration singalPCurrent AphaseCurrent BphaseCurrent CphaseCurrent')
                )
            );

            return devicesData
                .filter(data => data !== null)
                .map(record => ({
                    deviceId: record.deviceId,
                    timestamp: record.timestamp,
                    voltage: record.voltage,
                    temperature: record.temperature,
                    vibration: record.vibration,
                    singalPCurrent: record.singalPCurrent,
                    AphaseCurrent: record.AphaseCurrent,
                    BphaseCurrent: record.BphaseCurrent,
                    CphaseCurrent: record.CphaseCurrent
                }));
        } catch (error) {
            console.error('Error fetching all devices monitoring data:', error);
            throw error;
        }
    }
}

module.exports = new RealtimeDataService(); 