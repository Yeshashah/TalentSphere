import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Creates a notification for a user.
 * Payload: { user_email, type, title, body, link, meta }
 * Types: job_posted | job_approved | job_rejected | application_submitted | message_received
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { user_email, type, title, body, link, meta } = await req.json();

  if (!user_email || !type || !title) {
    return Response.json({ error: 'user_email, type, and title are required' }, { status: 400 });
  }

  const notification = await base44.asServiceRole.entities.Notification.create({
    user_email,
    type,
    title,
    body: body || '',
    link: link || '',
    read: false,
    meta: meta ? JSON.stringify(meta) : '',
  });

  return Response.json({ notification });
});