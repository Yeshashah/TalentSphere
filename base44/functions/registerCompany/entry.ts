import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      email,
      password,
      company_name,
      hq_country,
      year_founded,
      company_type,
      linkedin_profile_name,
      linkedin_profile_url,
      linkedin_logo_url,
      company_website,
      linkedin_industries,
      recent_job_openings_title,
      recent_job_openings,
      all_office_addresses,
    } = body;

    // Validation
    if (!email || !password || !company_name || !hq_country) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers.length > 0) {
      return Response.json({ error: 'This email is already registered' }, { status: 400 });
    }

    // Create User record
    const user = await base44.asServiceRole.entities.User.create({
      email,
      full_name: company_name,
      role: 'company',
    });

    // Create CompanyProfile record
    await base44.asServiceRole.entities.CompanyProfile.create({
      user_email: email,
      company_name,
      headquarters: hq_country,
      year_founded: year_founded || null,
      company_type: company_type || '',
      linkedin_profile_name: linkedin_profile_name || '',
      linkedin_profile_url: linkedin_profile_url || '',
      logo_url: linkedin_logo_url || '',
      website: company_website || '',
      industry: linkedin_industries.join(', ') || '',
      recent_job_openings_title: recent_job_openings_title || '',
      jobs_posted_count: recent_job_openings || 0,
      description: all_office_addresses || '',
    });

    return Response.json({ success: true, user_id: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
});