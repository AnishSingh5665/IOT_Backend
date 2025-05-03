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
        console.log('Getting devices with options:', options);
        try {
            let query = supabaseService.adminClient
                .from('devices')
                .select('*', { count: 'exact' });

            // Apply type filter
            if (options.type) {
                console.log('Applying type filter:', options.type);
                query = query.eq('type', options.type);
            }

            // Apply status filter
            if (options.status) {
                console.log('Applying status filter:', options.status);
                query = query.eq('status', options.status);
            }

            // Apply search
            if (options.search) {
                console.log('Applying search:', options.search);
                query = query.or(`name.ilike.%${options.search}%`);
            }

            // Apply sorting
            if (options.sortBy) {
                const [field, direction] = options.sortBy.split(':');
                const validFields = ['name', 'type', 'status', 'created_at', 'updated_at'];
                if (validFields.includes(field)) {
                    console.log('Applying sort:', field, direction);
                    query = query.order(field, { ascending: direction === 'asc' });
                }
            } else {
                // Default sorting by created_at desc
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            console.log('Applying pagination:', { page, limit, from, to });
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching devices:', error);
                return { data: null, count: 0, error };
            }

            // Format the response
            const formattedData = data.map(device => ({
                id: device.id,
                name: device.name,
                type: device.type,
                status: device.status,
                userId: device.user_id,
                thresholds: {
                    min: device.min_threshold_value,
                    max: device.max_threshold_value
                },
                timestamps: {
                    created: device.created_at,
                    updated: device.updated_at
                }
            }));

            console.log(`Fetched ${formattedData.length} devices successfully`);
            return { 
                data: formattedData, 
                count: count || 0,
                error: null 
            };
        } catch (error) {
            console.error('Get devices error:', error);
            return { data: null, count: 0, error };
        }
    }

    async getDeviceById(userId, deviceId) {
        console.log('Getting device:', deviceId);
        try {
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .select('*')
                .eq('id', deviceId)
                .single();

            if (error) {
                console.error('Error fetching device:', error);
                if (error.code === 'PGRST116') {
                    return { data: null, error: new Error('Device not found') };
                }
                return { data: null, error };
            }

            if (!data) {
                return { data: null, error: new Error('Device not found') };
            }

            // Format the response
            const formattedData = {
                id: data.id,
                name: data.name,
                type: data.type,
                status: data.status,
                userId: data.user_id,
                thresholds: {
                    min: data.min_threshold_value,
                    max: data.max_threshold_value
                },
                timestamps: {
                    created: data.created_at,
                    updated: data.updated_at
                }
            };

            console.log('Device fetched successfully:', formattedData);
            return { data: formattedData, error: null };
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

            // First check if device exists
            const { data: existingDevice, error: checkError } = await supabaseService.adminClient
                .from('devices')
                .select('*')
                .eq('id', deviceId)
                .single();

            if (checkError) {
                console.error('Error checking device:', checkError);
                if (checkError.code === 'PGRST116') {
                    return { data: null, error: new Error('Device not found') };
                }
                return { data: null, error: checkError };
            }

            // Update the device
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', deviceId)
                .select('*')
                .single();

            if (error) {
                console.error('Error updating device:', error);
                return { data: null, error };
            }

            // Format the response
            const formattedData = {
                id: data.id,
                name: data.name,
                type: data.type,
                status: data.status,
                userId: data.user_id,
                thresholds: {
                    min: data.min_threshold_value,
                    max: data.max_threshold_value
                },
                timestamps: {
                    created: data.created_at,
                    updated: data.updated_at
                }
            };

            console.log('Device updated successfully:', formattedData);
            return { data: formattedData, error: null };
        } catch (error) {
            console.error('Update device error:', error);
            return { data: null, error };
        }
    }

    async deleteDevice(userId, deviceId) {
        console.log('Deleting device:', deviceId);
        try {
            // First check if device exists
            const { data: existingDevice, error: checkError } = await supabaseService.adminClient
                .from('devices')
                .select('*')
                .eq('id', deviceId)
                .single();

            if (checkError) {
                console.error('Error checking device:', checkError);
                if (checkError.code === 'PGRST116') {
                    return { error: new Error('Device not found') };
                }
                return { error: checkError };
            }

            // Delete the device
            const { error } = await supabaseService.adminClient
                .from('devices')
                .delete()
                .eq('id', deviceId);

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

    async getAllDevices(userId) {
        console.log('Getting all devices');
        try {
            // Get all devices without any user filtering
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching all devices:', error);
                return { data: null, error };
            }

            console.log('All devices in database:', data);

            if (!data || data.length === 0) {
                return { data: [], error: null };
            }

            // Format the response
            const formattedData = data.map(device => ({
                id: device.id,
                name: device.name,
                type: device.type,
                status: device.status,
                userId: device.user_id,  // Include user_id in response
                thresholds: {
                    min: device.min_threshold_value,
                    max: device.max_threshold_value
                },
                timestamps: {
                    created: device.created_at,
                    updated: device.updated_at
                }
            }));

            console.log(`Fetched ${formattedData.length} devices successfully`);
            return { data: formattedData, error: null };
        } catch (error) {
            console.error('Get all devices error:', error);
            return { data: null, error };
        }
    }
}

module.exports = new DeviceService(); 