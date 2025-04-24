const supabaseService = require('./supabase.service');

class DeviceService {
    async createDevice(userId, deviceData) {
        console.log('Creating device for user:', userId);
        try {
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

    async getDevices(userId) {
        console.log('Getting devices for user:', userId);
        try {
            const { data, error } = await supabaseService.adminClient
                .from('devices')
                .select('id, name, type, status, min_threshold_value, max_threshold_value, created_at, updated_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching devices:', error);
                return { data: null, error };
            }

            console.log('Devices fetched successfully:', data);
            return { data, error: null };
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