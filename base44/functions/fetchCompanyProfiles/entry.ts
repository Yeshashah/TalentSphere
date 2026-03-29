import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const apiKey = Deno.env.get('SUPABASE_API_KEY');

    if (!supabaseUrl || !apiKey) {
      return Response.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/company_profiles`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch from Supabase' }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ profiles: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});