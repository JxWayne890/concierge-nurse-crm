import { NextRequest } from 'next/server';
import type { SubscribePayload } from '@/lib/types';
import {
  validateWebhookSecret,
  unauthorizedResponse,
  validationErrorResponse,
  createdResponse,
  updatedResponse,
  validateEmail,
  findContactByEmail,
  createContact,
  updateContact,
  appendTag,
  logWebhook,
  logActivity,
} from '@/lib/webhook';

function getTagForSource(source: string): string {
  if (source === 'footer_newsletter') return 'Newsletter Subscriber';
  return 'Community Signup';
}

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return unauthorizedResponse();
  }

  let body: SubscribePayload;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: 'Invalid JSON' });
  }

  // Validate required fields
  const errors: Record<string, string> = {};
  if (!body.email?.trim()) errors.email = 'Valid email is required';
  else if (!validateEmail(body.email)) errors.email = 'Valid email is required';

  if (Object.keys(errors).length > 0) {
    logWebhook('/api/webhooks/subscribe', body as unknown as Record<string, unknown>, 400);
    return validationErrorResponse(errors);
  }

  const email = body.email.toLowerCase().trim();
  const existing = findContactByEmail(email);
  const tag = getTagForSource(body.source);

  if (existing) {
    const updates: Partial<typeof existing> = {
      segments: appendTag(existing, tag),
    };
    // Update first_name if provided and currently empty on the record
    if (body.first_name?.trim() && !existing.firstName) {
      updates.firstName = body.first_name.trim();
    }

    updateContact(existing.id, updates);

    logActivity(existing.id, 'form_submission', `Subscribed via ${body.source}`, body);
    logWebhook('/api/webhooks/subscribe', body as unknown as Record<string, unknown>, 200);
    return updatedResponse(existing.id);
  }

  // Create new contact
  const contact = createContact({
    email,
    firstName: body.first_name?.trim() || '',
    lastName: '',
    status: 'confirmed',
    source: 'formSubmission',
    segments: [tag],
    lifecycleStage: 'Explorer',
    leadScore: 0,
    programHistory: [],
  });

  logActivity(contact.id, 'form_submission', `Subscribed via ${body.source}`, body);
  logWebhook('/api/webhooks/subscribe', body as unknown as Record<string, unknown>, 201);
  return createdResponse(contact.id);
}
