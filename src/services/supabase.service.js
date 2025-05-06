const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class SupabaseService {
    constructor() {
        if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseServiceKey) {
            throw new Error('Missing required Supabase configuration');
        }

        // Initialize regular client
        this.client = createClient(
            config.supabaseUrl,
            config.supabaseAnonKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false
                }
            }
        );

        // Initialize service role client for admin operations
        this.adminClient = createClient(
            config.supabaseUrl,
            config.supabaseServiceKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false
                }
            }
        );

        console.log('Supabase clients initialized successfully');
    }

    // Get the current session
    async getSession() {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            // First check if the user is admin
            const { data: userData, error: userError } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            
            // If user is admin, prevent access
            if (userData.email === 'admin@gmail.com') {
                throw new Error('Admin users cannot access this endpoint');
            }

            return userData;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    // Create user in public.users table (using service role)
    async createUser(userData) {
        console.log('Creating user record:', userData);
        try {
            // First verify the user exists in auth.users
            const { data: authUser, error: authError } = await this.adminClient.auth.admin.getUserById(userData.id);
            
            if (authError) {
                console.error('Auth user not found:', authError);
                return { data: null, error: authError };
            }

            if (!authUser) {
                console.error('Auth user not found');
                return { data: null, error: new Error('Auth user not found') };
            }

            // Create user record using the service role client
            const { data, error } = await this.adminClient
                .from('users')
                .insert([{
                    id: userData.id,
                    email: userData.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Create user error:', error);
                return { data: null, error };
            }

            console.log('User record created successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Create user error:', error);
            return { data: null, error };
        }
    }

    // Update user
    async updateUser(userId, updates) {
        try {
            // First check if the user is admin
            const { data: userData, error: userError } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            
            // If user is admin, prevent access
            if (userData.email === 'admin@gmail.com') {
                throw new Error('Admin users cannot access this endpoint');
            }

            const { data, error } = await this.client
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Sign up user
    async signUp(email, password, name) {
        console.log('Attempting to sign up user:', email);
        try {
            // Check if it's admin user
            const isAdmin = email === 'admin@gmail.com';

            // First check if user exists in auth
            try {
                const { data: authUser } = await this.adminClient.auth.admin.listUsers({
                    email: email
                });

                if (authUser && authUser.users && authUser.users.length > 0) {
                    // If user exists in auth, try to delete them
                    try {
                        await this.adminClient.auth.admin.deleteUser(authUser.users[0].id);
                        console.log('Deleted existing auth user');
                    } catch (deleteError) {
                        console.error('Error deleting existing auth user:', deleteError);
                        return { 
                            data: null, 
                            error: new Error('This email is already registered. Please use a different email or try logging in.') 
                        };
                    }
                }
            } catch (authError) {
                console.log('No existing auth user found, proceeding with registration');
            }

            // Check and clean up any orphaned records in users table
            const { data: existingUser } = await this.adminClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (existingUser) {
                console.log('Cleaning up orphaned user record:', email);
                await this.adminClient
                    .from('users')
                    .delete()
                    .eq('email', email);
            }

            let authData;
            let signUpError;

            // Create the user in auth with different options for admin
            if (isAdmin) {
                const result = await this.adminClient.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true, // Bypass email verification for admin
                    user_metadata: {
                        name: name,
                        is_admin: true
                    }
                });
                authData = result.data;
                signUpError = result.error;
            } else {
                const result = await this.client.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${config.clientUrl}/auth/callback`,
                        data: {
                            name: name
                        }
                    }
                });
                authData = result.data;
                signUpError = result.error;
            }

            if (signUpError) {
                console.error('Signup error:', signUpError);
                return { data: null, error: signUpError };
            }

            if (!authData || !authData.user) {
                return { data: null, error: new Error('No user data returned from signup') };
            }

            // Create the user record in public.users
            const { data: userData, error: createUserError } = await this.adminClient
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email: authData.user.email,
                    name: name,
                    password: password, // Store plain password for Supabase auth
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createUserError) {
                console.error('Create user error:', createUserError);
                // If user record creation fails, we should clean up the auth user
                try {
                    await this.adminClient.auth.admin.deleteUser(authData.user.id);
                } catch (deleteError) {
                    console.error('Error deleting auth user:', deleteError);
                }
                return { data: null, error: createUserError };
            }

            console.log('Signup successful:', { authData, userData });
            return { 
                data: { 
                    user: userData,
                    session: authData.session 
                }, 
                error: null 
            };
        } catch (error) {
            console.error('Signup error:', error);
            return { data: null, error };
        }
    }

    // Sign in user
    async signIn(email, password) {
        console.log('Attempting to sign in user:', email);
        try {
            // Check if it's admin user
            const isAdmin = email === 'admin@gmail.com';

            // For admin user, check users table first
            if (isAdmin) {
                const { data: userData, error: userError } = await this.adminClient
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (userError || !userData) {
                    console.error('Admin user not found:', userError);
                    return { 
                        data: null, 
                        error: new Error('Invalid email or password') 
                    };
                }

                // For admin, verify password directly
                if (userData.password !== password) {
                    console.error('Invalid admin password');
                    return { 
                        data: null, 
                        error: new Error('Invalid email or password') 
                    };
                }

                // Create a custom JWT token for admin
                const token = jwt.sign(
                    {
                        id: userData.id,
                        email: userData.email,
                        role: 'admin',
                        is_admin: true
                    },
                    config.jwtSecret,
                    { expiresIn: '24h' }
                );

                // Create a custom session for admin
                const session = {
                    access_token: token,
                    refresh_token: token,
                    user: {
                        id: userData.id,
                        email: userData.email,
                        role: 'admin',
                        user_metadata: {
                            name: userData.name,
                            is_admin: true
                        }
                    }
                };

                console.log('Admin sign in successful:', { user: userData, session });
                return { 
                    data: { 
                        user: userData,
                        session: session
                    }, 
                    error: null 
                };
            }

            // For regular users, use regular client
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Sign in error:', error);
                
                if (error.message.includes('Email not confirmed')) {
                    return { 
                        data: null, 
                        error: new Error('Please confirm your email before logging in') 
                    };
                }
                return { 
                    data: null, 
                    error: new Error('Invalid email or password') 
                };
            }

            if (!data || !data.user) {
                return { data: null, error: new Error('No user data returned from sign in') };
            }

            // Get user data from users table
            const { data: userData, error: userError } = await this.adminClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
                return { 
                    data: null, 
                    error: new Error('Error fetching user data') 
                };
            }

            console.log('Regular user sign in successful:', { user: userData, session: data.session });
            return { 
                data: { 
                    user: userData,
                    session: data.session 
                }, 
                error: null 
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    }

    // Sign out user
    async signOut(userId) {
        try {
            // First check if the user is admin
            const { data: userData, error: userError } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            
            // If user is admin, prevent access
            if (userData.email === 'admin@gmail.com') {
                throw new Error('Admin users cannot access this endpoint');
            }

            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            // First check if the user is admin
            const { data: userData, error: userError } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            
            // If user is admin, prevent access
            if (userData.email === 'admin@gmail.com') {
                throw new Error('Admin users cannot access this endpoint');
            }

            // Delete from auth
            const { error: authError } = await this.adminClient.auth.admin.deleteUser(userId);
            if (authError) throw authError;

            // Delete from users table
            const { error: deleteError } = await this.client
                .from('users')
                .delete()
                .eq('id', userId);

            if (deleteError) throw deleteError;
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    // Get user by session
    async getUserBySession(session) {
        try {
            const { data: { user }, error } = await this.client.auth.getUser(session);
            if (error) throw error;

            // If user is admin, prevent access
            if (user.email === 'admin@gmail.com') {
                throw new Error('Admin users cannot access this endpoint');
            }

            return user;
        } catch (error) {
            console.error('Get user by session error:', error);
            throw error;
        }
    }
}

module.exports = new SupabaseService(); 