import { NextRequest } from 'next/server';
import type { ConsultingInquiryPayload } from '@/lib/types';
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
  addNote,
} from '@/lib/webhook';

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return unauthorizedResponse();
  }

  let body: ConsultingInquiryPayload;
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
    logWebhook('/api/webhooks/consulting-inquiry', body as unknown as Record<string, unknown>, 400);
    return validationErrorResponse(errors);
  }

  const email = body.email.toLowerCase().trim();
  const { firstName, lastName } = parseFullName(body.full_name);
  const existing = findContactByEmail(email);
  const tag = 'Consulting Inquiry';

  if (existing) {
    // Merge — don't overwrite non-empty fields with empty ones
    const updates: Partial<typeof existing> = {
      segments: appendTag(existing, tag),
      lifecycleStage: resolveLifecycleStage(existing.lifecycleStage, 'Established Owner'),
    };
    if (!existing.firstName && firstName) updates.firstName = firstName;
    if (!existing.lastName && lastName) updates.lastName = lastName;
    if (!existing.businessName && body.business_name?.trim()) updates.businessName = body.business_name.trim();
    if (!existing.annualRevenue && body.annual_revenue?.trim()) updates.annualRevenue = body.annual_revenue.trim();

    updateContact(existing.id, updates);

    if (body.biggest_challenge?.trim()) {
      addNote(existing.id, body.biggest_challenge.trim());
    }

    logActivity(existing.id, 'form_submission', 'Submitted consulting inquiry', body);
    logWebhook('/api/webhooks/consulting-inquiry', body as unknown as Record<string, unknown>, 200);
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
    lifecycleStage: 'Established Owner',
    businessName: body.business_name?.trim() || undefined,
    annualRevenue: body.annual_revenue?.trim() || undefined,
    leadScore: 0,
    programHistory: [],
  });

  if (body.biggest_challenge?.trim()) {
    addNote(contact.id, body.biggest_challenge.trim());
  }

  logActivity(contact.id, 'form_submission', 'Submitted consulting inquiry', body);
  logWebhook('/api/webhooks/consulting-inquiry', body as unknown as Record<string, unknown>, 201);
  return createdResponse(contact.id);
}
