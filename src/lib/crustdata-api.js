import { base44 } from '@/api/base44Client';

export const fetchCrustCandidates = async (filters = {}) => {
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
  console.log('CrustData raw count:', raw.length);

  // Normalize to CandidateProfile schema
  const candidates = raw.map(p => ({
    user_email: `external-${p.person_id}@crustdata`,
    full_name: p.name,
    job_title: p.headline,
    location: p.region,
    years_of_experience: p.years_of_experience ?? p.years_of_experience_raw,
    skills: Array.isArray(p.skills) ? p.skills : [],
    avatar_url: p.profile_picture_url,
    linkedin: p.linkedin_profile_url,
    open_to_work: true,
  }));

  // Store in CandidateProfile database
  if (candidates.length > 0) {
    await base44.entities.CandidateProfile.bulkCreate(candidates);
    console.log('Stored', candidates.length, 'candidates in database');
  }

  return candidates;
};