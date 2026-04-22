import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      email,
      full_name,
      phone,
      job_title,
      years_of_experience,
      skills,
      linkedin,
      portfolio_link,
      education_degree,
      graduation_year,
      open_to_work,
    } = body;

    // Validation
    if (!email || !full_name || !phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers.length > 0) {
      return Response.json({ error: 'This email is already registered' }, { status: 400 });
    }

    // Invite the user via Base44 auth (this creates the actual auth account)
    await base44.asServiceRole.users.inviteUser(email, 'candidate');

    // Wait briefly for the user to be created in auth
    await new Promise(r => setTimeout(r, 500));

    // Update the user's full_name
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, { full_name });
    }

    // Create CandidateProfile record
    await base44.asServiceRole.entities.CandidateProfile.create({
      user_email: email,
      full_name,
      phone,
      job_title: job_title || '',
      years_of_experience: years_of_experience || 0,
      skills: skills || [],
      linkedin: linkedin || '',
      portfolio: portfolio_link || '',
      education_degree: education_degree || '',
      graduation_year: graduation_year || null,
      open_to_work: open_to_work || false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
});