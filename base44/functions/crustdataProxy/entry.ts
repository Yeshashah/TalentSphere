import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_URL = 'https://api.crustdata.com/screener/persondb/search';
const BEARER_TOKEN = '698630e39a66b67bfca27f2e0a1a0a48a41d58a5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestBody = body.filters ? body : {
      limit: 20,
      filters: {
        op: 'and',
        conditions: [
          { column: 'region', type: '=', value: 'India' }
        ]
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    console.log('CrustData status:', response.status);
    console.log('CrustData response:', text.slice(0, 500));

    if (!response.ok) {
      return Response.json({ error: `API error: ${response.status}`, detail: text }, { status: 502 });
    }

    const json = JSON.parse(text);
    return Response.json(json);
  } catch (error) {
    console.error('crustdataProxy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});