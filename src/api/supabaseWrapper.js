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
            let mappedData = { ...data };
            const { data: { user } } = await supabase.auth.getUser();

            // Handle Primary Key generation in case DB default is missing
            const generateId = () => {
                try { return crypto.randomUUID(); }
                catch (e) { return Math.random().toString(36).substring(2) + Date.now().toString(36); }
            };

            if (tableName === 'users') {
                mappedData = {
                    userid: user?.id || data.id || generateId(),
                    email_id: data.email || data.email_id,
                    role: data.role,
                    password: data.password || '******',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
            }

            if (tableName === 'candidate_profile') {
                mappedData = {
                    candidate_id: generateId(),
                    userid: user?.id || data.userId,
                    candidate_name: data.full_name || data.candidate_name,
                    candidate_linkedin: data.linkedin || data.candidate_linkedin,
                    candidate_phone: data.phone || data.candidate_phone,
                    candidate_portfolio_link: data.portfolio_link || data.candidate_portfolio_link,
                    candidate_job_title: data.job_title || data.candidate_job_title,
                    candidate_years_of_experience: Number(data.years_of_experience || data.candidate_years_of_experience || 0),
                    candidate_skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
                    candidate_educational_degree: data.education_degree || data.candidate_educational_degree,
                    graduation_year: Number(data.graduation_year || 2024),
                    open_to_work: !!data.open_to_work,
                    candidate_resume: data.candidate_resume || data.resume_url || null,
                    data_source: data.data_source || 'Website',
                    external_platform_name: data.external_platform_name || 'TalentSphere',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
            }

            if (tableName === 'company_profile') {
                mappedData = {
                    company_id: generateId(),
                    userid: user?.id || data.userId,
                    company_name: data.company_name,
                    hq_country: data.hq_country,
                    year_founded: Number(data.year_founded || 0),
                    company_type: data.company_type,
                    linkedin_profile_name: data.linkedin_profile_name,
                    linkedin_profile_url: data.linkedin_profile_url,
                    linkedin_logo_url: data.linkedin_logo_url,
                    company_website: data.company_website,
                    linkedin_industries: Array.isArray(data.linkedin_industries) ? data.linkedin_industries.join(', ') : (data.linkedin_industries || ''),
                    recent_job_openings_title: data.recent_job_openings_title,
                    recent_job_openings: String(data.recent_job_openings || '0'),
                    all_office_addresses: data.all_office_addresses,
                    subscription_plan: data.subscription_plan || 'Free',
                    data_source: data.data_source || 'Website',
                    external_platform_name: data.external_platform_name || 'TalentSphere',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
            }

            console.log(`Attempting to insert into ${tableName}:`, mappedData);
            const { data: result, error } = await supabase.from(tableName).insert([mappedData]).select().single();

            if (error) {
                console.error(`PostgreSQL Error on ${tableName}:`, error);
                // Throwing a cleaner message for the UI
                throw new Error(error.message || `Database error while creating ${tableName}`);
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
        } catch (e) { }

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
        } catch (e) { }

        // Additionally update user_metadata in Supabase Auth
        await supabase.auth.updateUser({ data });
        return { ...user, ...user.user_metadata, ...data, id: user.id };
    },
    async register(userData) {
        console.log('🚀 Registration flow started for:', userData.email);

        try {
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

            if (error) {
                console.error('❌ Supabase Auth Signup Error:', error.message);
                throw error;
            }

            if (!data.user) {
                console.warn('⚠️ No user object returned. User might already exist or needs email confirmation.');
                throw new Error("Unable to create account. Please check if the email is already registered.");
            }

            console.log('✅ Supabase Auth Account Created:', data.user.id);

            const newUser = {
                userid: data.user.id,
                email_id: userData.email,
                role: userData.role,
                password: userData.password, // Storing for user's custom 'users' table as per diagram
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log('📝 Inserting into users table:', newUser);
            const { error: dbError } = await supabase.from('users').insert([newUser]);

            if (dbError) {
                console.error('❌ Failed to insert into users table:', dbError.message);
                // We continue even if this fails, or decide to throw. 
                // Let's throw so the user knows there is a table issue.
                throw new Error(`Database Error: ${dbError.message}`);
            }

            return {
                success: true,
                user: { ...newUser, userid: data.user.id },
                userid: data.user.id
            };
        } catch (err) {
            console.error('❌ Registration Process Failed:', err.message);
            throw err;
        }
    }
};

// Functions mock / Integrations mock
const functions = { invoke() { return Promise.resolve({ success: true }); } };
const integrations = {
    Core: {
        async UploadFile({ file }) {
            if (!file) throw new Error('No file provided');
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const { data, error } = await supabase.storage
                .from('resumes')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });
            if (error) throw new Error(error.message);
            const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.path);
            return { file_url: urlData.publicUrl };
        }
    }
};

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
