import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const { requiredRoles } = await req.json();
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!allowed.includes(user.role)) {
      return Response.json({ error: 'Forbidden', status: 403, userRole: user.role }, { status: 403 });
    }

    return Response.json({ authorized: true, userRole: user.role });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});