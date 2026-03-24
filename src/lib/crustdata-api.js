const CACHE_KEY = 'crustdata_candidates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const API_URL = 'https://api.crustdata.com/screener/persondb/search';
const BEARER_TOKEN = '698630e39a66b67bfca27f2e0a1a0a48a41d58a5';

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
  if (cached) return cached;

  const body = {
    limit: 20,
    filters: {
      op: 'and',
      conditions: [
        { column: 'region', type: '=', value: 'India' },
        ...( filters.conditions || [])
      ]
    },
    ...filters
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`CrustData API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  // API returns { data: [...] } or directly an array
  const raw = Array.isArray(json) ? json : (json.data || json.persons || json.results || []);

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