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

    const response = await fetch(`${supabaseUrl}/rest/v1/messages?limit=500`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error:', errorText);
      return Response.json({ error: `Supabase error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('Fetched messages:', data.length);
    return Response.json({ messages: data || [] });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});