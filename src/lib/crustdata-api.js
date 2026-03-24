import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'crustdata_candidates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getCached = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

const setCached = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value: data, timestamp: Date.now() }));
  } catch (e) {
    console.error('Cache write failed:', e);
  }
};

export const fetchCrustCandidates = async (filters = {}) => {
  const cached = getCached();
  if (cached && cached.length > 0) return cached;

  const requestBody = filters.filters ? filters : {
    limit: 20,
    filters: {
      op: 'and',
      conditions: [
        { column: 'region', type: '=', value: 'India' }
      ]
    }
  };

  const response = await base44.functions.invoke('crustdataProxy', requestBody);
  const json = response.data;

  const raw = Array.isArray(json) ? json : (json.profiles || json.data || json.persons || json.results || []);
  console.log('CrustData raw count:', raw.length, 'sample:', raw[0]);

  // Normalize to match CandidateCard expectations
  const candidates = raw.map(p => ({
    id: p.person_id || p.id,
    full_name: p.name,
    job_title: p.headline,
    location: p.region,
    years_of_experience: p.years_of_experience ?? p.years_of_experience_raw,
    skills: Array.isArray(p.skills) ? p.skills : [],
    avatar_url: p.profile_picture_url,
    linkedin_profile_url: p.linkedin_profile_url,
    education_background: p.education_background,
    open_to_work: true,
  }));

  setCached(candidates);
  return candidates;
};