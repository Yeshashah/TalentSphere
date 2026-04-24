import { supabase } from '@/lib/supabaseClient';

// Helper to convert ReactQuery style filter/sort limits
async function fetchEntity(tableName, filters = {}, sort = '', limit = 1000) {
    let query = supabase.from(tableName).select('*');
    if (filters) {
        for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
        }
    }
    if (sort) {
        let isDesc = sort.startsWith('-');
        let field = isDesc ? sort.slice(1) : sort;
        query = query.order(field, { ascending: !isDesc });
    }
    if (limit) {
        query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) {
        console.error(`Error filtering ${tableName}:`, error);
        throw error;
    }
    return data;
}

function makeSupabaseEntityStore(tableName) {
    return {
        async list() {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;
            return data;
        },
        async filter(filters = {}, sort = '', limit = 1000) {
            return fetchEntity(tableName, filters, sort, limit);
        },
        async get(id) {
            const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
            return data;
        },
        async create(data) {
            // Some tables might not support inserting UUID explicitly if it's generated,
            // but we'll try to pass the data as is.
            const { data: result, error } = await supabase.from(tableName).insert([data]).select().single();
            if (error) {
                console.error(`Create Error on ${tableName}:`, error);
                throw error;
            }
            return result;
        },
        async update(id, data) {
            const { data: result, error } = await supabase.from(tableName).update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        async delete(id) {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
            return { id };
        }
    };
}

const auth = {
    async me() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw { status: 401, message: 'Not authenticated' };
        
        try {
            // Try fetching from the custom 'users' table
            const { data: customUser } = await supabase.from('users').select('*').eq('id', user.id).single();
            if (customUser) return { ...user, ...user.user_metadata, ...customUser, id: user.id };
        } catch (e) {
            // ignore if table doesn't exist or row missing
        }
        return { ...user, ...user.user_metadata, id: user.id };
    },
    async login({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        
        try {
            const { data: customUser } = await supabase.from('users').select('*').eq('id', data.user.id).single();
            if (customUser) return { ...data.user, ...data.user.user_metadata, ...customUser, id: data.user.id };
        } catch (e) {}
        
        return { ...data.user, ...data.user.user_metadata, id: data.user.id };
    },
    async logout() {
        await supabase.auth.signOut();
    },
    redirectToLogin(returnUrl) {
        window.dispatchEvent(new CustomEvent('localAuth:redirectToLogin', { detail: { returnUrl } }));
    },
    async updateMe(data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw { status: 401, message: 'Not authenticated' };
        
        try {
            const { data: result, error } = await supabase.from('users').update(data).eq('id', user.id).select().single();
            if (!error) return { ...user, ...user.user_metadata, ...result, id: user.id };
        } catch(e) {}
        
        // Additionally update user_metadata in Supabase Auth
        await supabase.auth.updateUser({ data });
        return { ...user, ...user.user_metadata, ...data, id: user.id };
    },
    async register(userData) {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                role: userData.role,
                full_name: userData.full_name
              }
            }
        });
        if (error) throw error;
        
        const newUser = {
            id: data.user.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.full_name,
            created_date: new Date().toISOString()
        };

        try {
            await supabase.from('users').insert([newUser]);
        } catch(e) {
            console.error('Failed to create in users table:', e);
        }
        
        return { success: true, user: newUser };
    }
};

// Functions mock / Integrations mock
const functions = { invoke() { return Promise.resolve({ success: true }); } };
const integrations = { Core: { UploadFile() { return Promise.resolve({ file_url: "" }); } } };

// Mapping based on user input
const ENTITY_MAPPINGS = {
    'User': 'users',
    'CandidateProfile': 'candidate_profile',
    'CompanyProfile': 'company_profile',
    'Job': 'jobs', // Fallback
    'Application': 'job_application',
    'SavedItem': 'saved_items', // Fallback, maybe 'saved_candidate' for candidates? We keep SavedItem general.
    'SavedCandidate': 'saved_candidate',
    'Message': 'messages',
    'Notification': 'notifications'
};

const entities = Object.fromEntries(
  Object.entries(ENTITY_MAPPINGS).map(([entityName, tableName]) => [
    entityName, makeSupabaseEntityStore(tableName)
  ])
);

export const supabaseWrapper = { auth, entities, functions, integrations };
