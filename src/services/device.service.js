const supabaseService = require('./supabase.service');

// Valid device types and statuses
const VALID_DEVICE_TYPES = ['sensor', 'actuator', 'gateway'];
const VALID_DEVICE_STATUSES = ['active', 'inactive', 'maintenance'];

class DeviceService {
    validateDeviceData(deviceData) {
        const errors = [];

        // Validate type
        if (deviceData.type && !VALID_DEVICE_TYPES.includes(deviceData.type)) {
            errors.push(`Invalid device type. Must be one of: ${VALID_DEVICE_TYPES.join(', ')}`);
        }

        // Validate status
        if (deviceData.status && !VALID_DEVICE_STATUSES.includes(deviceData.status)) {
            errors.push(`Invalid device status. Must be one of: ${VALID_DEVICE_STATUSES.join(', ')}`);
        }

        return errors;
    }

    async createDevice(userId, deviceData) {
        console.log('Creating device for user:', userId);
        try {
            // Validate device data
            const validationErrors = this.validateDeviceData(deviceData);
            if (validationErrors.length > 0) {
                return { data: null, error: new Error(validationErrors.join(', ')) };
            }

            // Use admin client to bypass RLS
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .insert([{
                    user_id: userId,
                    name: deviceData.name,
                    type: deviceData.type,
                    status: deviceData.status || 'active',
                    min_threshold_value: deviceData.min_threshold_value || null,
                    max_threshold_value: deviceData.max_threshold_value || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating device:', error);
                return { data: null, error };
            }

            console.log('Device created successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Create device error:', error);
            return { data: null, error };
        }
    }

    async getDevices(userId, options = {}) {
        console.log('Getting devices for user:', userId);
        try {
            let query = supabaseService.adminClient
                .from('devices')
                .select('id, name, type, status, min_threshold_value, max_threshold_value, created_at, updated_at')
                .eq('user_id', userId);

            // Apply filters
            if (options.type) {
                query = query.eq('type', options.type);
            }
            if (options.status) {
                query = query.eq('status', options.status);
            }

            // Apply search
            if (options.search) {
                query = query.or(`name.ilike.%${options.search}%,device_id.ilike.%${options.search}%`);
            }

            // Apply sorting
            if (options.sortBy) {
                const [field, direction] = options.sortBy.split(':');
                query = query.order(field, { ascending: direction === 'asc' });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            if (options.page && options.limit) {
                const from = (options.page - 1) * options.limit;
                const to = from + options.limit - 1;
                query = query.range(from, to);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching devices:', error);
                return { data: null, error };
            }

            console.log('Devices fetched successfully:', data);
            return { 
                data, 
                count: count || data.length,
                error: null 
            };
        } catch (error) {
            console.error('Get devices error:', error);
            return { data: null, error };
        }
    }

    async getDeviceById(userId, deviceId) {
        console.log('Getting device:', deviceId);
        try {
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .select('id, name, type, status, min_threshold_value, max_threshold_value, created_at, updated_at')
                .eq('id', deviceId)
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching device:', error);
                return { data: null, error };
            }

            if (!data) {
                return { data: null, error: new Error('Device not found') };
            }

            console.log('Device fetched successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Get device error:', error);
            return { data: null, error };
        }
    }

    async updateDevice(userId, deviceId, updates) {
        console.log('Updating device:', deviceId);
        try {
            // Validate device data
            const validationErrors = this.validateDeviceData(updates);
            if (validationErrors.length > 0) {
                return { data: null, error: new Error(validationErrors.join(', ')) };
            }

            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', deviceId)
                .eq('user_id', userId)
                .select('id, name, type, status, min_threshold_value, max_threshold_value, created_at, updated_at')
                .single();

            if (error) {
                console.error('Error updating device:', error);
                return { data: null, error };
            }

            if (!data) {
                return { data: null, error: new Error('Device not found') };
            }

            console.log('Device updated successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Update device error:', error);
            return { data: null, error };
        }
    }

    async deleteDevice(userId, deviceId) {
        console.log('Deleting device:', deviceId);
        try {
            const { error } = await supabaseService.adminClient
                .from('devices')
                .delete()
                .eq('id', deviceId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting device:', error);
                return { error };
            }

            console.log('Device deleted successfully');
            return { error: null };
        } catch (error) {
            console.error('Delete device error:', error);
            return { error };
        }
    }
}

module.exports = new DeviceService(); 