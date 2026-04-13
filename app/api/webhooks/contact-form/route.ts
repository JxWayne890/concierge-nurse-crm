import { NextRequest } from 'next/server';
import type { ContactFormPayload } from '@/lib/types';
import {
  validateWebhookSecret,
  unauthorizedResponse,
  validationErrorResponse,
  createdResponse,
  updatedResponse,
  validateEmail,
  isValidInterest,
  mapInterest,
  findContactByEmail,
  createContact,
  updateContact,
  appendTag,
  logWebhook,
  logActivity,
  addNote,
} from '@/lib/webhook';

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return unauthorizedResponse();
  }

  let body: ContactFormPayload;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: 'Invalid JSON' });
  }

  // Validate required fields
  const errors: Record<string, string> = {};
  if (!body.first_name?.trim()) errors.first_name = 'First name is required';
  if (!body.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!body.email?.trim()) errors.email = 'Valid email is required';
  else if (!validateEmail(body.email)) errors.email = 'Valid email is required';
  if (!body.interest) errors.interest = 'Interest is required';
  else if (!isValidInterest(body.interest)) errors.interest = 'Interest must be a valid option';

  if (Object.keys(errors).length > 0) {
    logWebhook('/api/webhooks/contact-form', body as unknown as Record<string, unknown>, 400);
    return validationErrorResponse(errors);
  }

  const email = body.email.toLowerCase().trim();
  const existing = findContactByEmail(email);
  const tag = 'Contact Form Lead';
  const interest = mapInterest(body.interest);

  if (existing) {
    // Update existing contact — fill empty fields, never overwrite populated ones
    const updates: Partial<typeof existing> = {
      segments: appendTag(existing, tag),
      interest: interest,
    };
    if (!existing.firstName && body.first_name) updates.firstName = body.first_name.trim();
    if (!existing.lastName && body.last_name) updates.lastName = body.last_name.trim();

    updateContact(existing.id, updates);

    if (body.message?.trim()) {
      addNote(existing.id, body.message.trim());
    }

    logActivity(existing.id, 'form_submission', `Submitted contact form with interest: ${interest}`, body);
    logWebhook('/api/webhooks/contact-form', body as unknown as Record<string, unknown>, 200);
    return updatedResponse(existing.id);
  }

  // Create new contact
  const contact = createContact({
    email,
    firstName: body.first_name.trim(),
    lastName: body.last_name.trim(),
    status: 'confirmed',
    source: 'formSubmission',
    segments: [tag],
    interest,
    lifecycleStage: 'Explorer',
    leadScore: 0,
    programHistory: [],
  });

  if (body.message?.trim()) {
    addNote(contact.id, body.message.trim());
  }

  logActivity(contact.id, 'form_submission', `Submitted contact form with interest: ${interest}`, body);
  logWebhook('/api/webhooks/contact-form', body as unknown as Record<string, unknown>, 201);
  return createdResponse(contact.id);
}
