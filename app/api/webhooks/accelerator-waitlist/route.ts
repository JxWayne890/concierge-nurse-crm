import { NextRequest } from 'next/server';
import type { AcceleratorWaitlistPayload } from '@/lib/types';
import {
  validateWebhookSecret,
  unauthorizedResponse,
  validationErrorResponse,
  createdResponse,
  updatedResponse,
  validateEmail,
  parseFullName,
  resolveLifecycleStage,
  findContactByEmail,
  createContact,
  updateContact,
  appendTag,
  logWebhook,
  logActivity,
} from '@/lib/webhook';

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return unauthorizedResponse();
  }

  let body: AcceleratorWaitlistPayload;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: 'Invalid JSON' });
  }

  // Validate required fields
  const errors: Record<string, string> = {};
  if (!body.full_name?.trim()) errors.full_name = 'Full name is required';
  if (!body.email?.trim()) errors.email = 'Valid email is required';
  else if (!validateEmail(body.email)) errors.email = 'Valid email is required';

  if (Object.keys(errors).length > 0) {
    logWebhook('/api/webhooks/accelerator-waitlist', body as unknown as Record<string, unknown>, 400);
    return validationErrorResponse(errors);
  }

  const email = body.email.toLowerCase().trim();
  const { firstName, lastName } = parseFullName(body.full_name);
  const existing = findContactByEmail(email);
  const tag = 'Accelerator Waitlist';

  if (existing) {
    const updates: Partial<typeof existing> = {
      segments: appendTag(existing, tag),
      lifecycleStage: resolveLifecycleStage(existing.lifecycleStage, 'Builder'),
    };
    if (!existing.firstName && firstName) updates.firstName = firstName;
    if (!existing.lastName && lastName) updates.lastName = lastName;

    updateContact(existing.id, updates);

    logActivity(existing.id, 'form_submission', 'Joined accelerator waitlist', body);
    logWebhook('/api/webhooks/accelerator-waitlist', body as unknown as Record<string, unknown>, 200);
    return updatedResponse(existing.id);
  }

  // Create new contact
  const contact = createContact({
    email,
    firstName,
    lastName,
    status: 'confirmed',
    source: 'formSubmission',
    segments: [tag],
    lifecycleStage: 'Builder',
    leadScore: 0,
    programHistory: [],
  });

  logActivity(contact.id, 'form_submission', 'Joined accelerator waitlist', body);
  logWebhook('/api/webhooks/accelerator-waitlist', body as unknown as Record<string, unknown>, 201);
  return createdResponse(contact.id);
}
