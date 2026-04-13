import { NextRequest, NextResponse } from 'next/server';
import type {
  Contact,
  LifecycleStage,
  InterestType,
  WebhookInterest,
  WebhookSharedMetadata,
  WebhookSuccessResponse,
  WebhookErrorResponse,
} from './types';
import { mockContacts } from './mock-data';

// --- Auth ---

export function validateWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret');
  // Stub: compare against process.env.WEBHOOK_SECRET
  // In production, use a constant-time comparison
  if (!secret) return false;
  const expected = process.env.WEBHOOK_SECRET || 'dev-webhook-secret';
  return secret === expected;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { status: 'error', message: 'Unauthorized' } satisfies WebhookErrorResponse,
    { status: 401 }
  );
}

// --- Response helpers ---

export function createdResponse(contactId: string) {
  return NextResponse.json(
    { status: 'created', contact_id: contactId, message: 'Contact created successfully' } satisfies WebhookSuccessResponse,
    { status: 201 }
  );
}

export function updatedResponse(contactId: string) {
  return NextResponse.json(
    { status: 'updated', contact_id: contactId, message: 'Existing contact updated' } satisfies WebhookSuccessResponse,
    { status: 200 }
  );
}

export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    { status: 'error', message: 'Validation failed', errors } satisfies WebhookErrorResponse,
    { status: 400 }
  );
}

// --- Validation ---

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Name parsing ---

export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' };
  }
  return {
    firstName: trimmed.substring(0, spaceIndex),
    lastName: trimmed.substring(spaceIndex + 1).trim(),
  };
}

// --- Lifecycle stage hierarchy ---

const LIFECYCLE_ORDER: LifecycleStage[] = ['Explorer', 'DIYer', 'Builder', 'Established Owner'];

export function shouldUpgradeLifecycle(
  current: LifecycleStage | undefined,
  proposed: LifecycleStage
): boolean {
  if (!current) return true;
  const currentIndex = LIFECYCLE_ORDER.indexOf(current);
  const proposedIndex = LIFECYCLE_ORDER.indexOf(proposed);
  return proposedIndex > currentIndex;
}

export function resolveLifecycleStage(
  current: LifecycleStage | undefined,
  proposed: LifecycleStage
): LifecycleStage {
  if (shouldUpgradeLifecycle(current, proposed)) return proposed;
  return current!;
}

// --- Interest mapping (snake_case webhook values → display strings) ---

const INTEREST_MAP: Record<WebhookInterest, InterestType> = {
  clarity_consult: 'Clarity Consult',
  accelerator_cohort: 'Accelerator Cohort',
  toolkits_resources: 'Toolkits & Resources',
  private_coaching: '1:1 Private Coaching',
  business_consulting: 'Business Consulting',
  vip_bridge_session: 'VIP Bridge Session',
  general_question: 'General Question',
  other: 'Other',
};

const VALID_INTERESTS = new Set(Object.keys(INTEREST_MAP));

export function isValidInterest(value: string): value is WebhookInterest {
  return VALID_INTERESTS.has(value);
}

export function mapInterest(webhookInterest: WebhookInterest): InterestType {
  return INTEREST_MAP[webhookInterest];
}

// --- Mock contact store (simulates database for frontend-only phase) ---
// Uses the mockContacts array as an in-memory store

const contactStore: Contact[] = [...mockContacts];

export function findContactByEmail(email: string): Contact | undefined {
  return contactStore.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
  const contact: Contact = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contactStore.push(contact);
  return contact;
}

export function updateContact(id: string, updates: Partial<Contact>): Contact | undefined {
  const index = contactStore.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  contactStore[index] = {
    ...contactStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return contactStore[index];
}

export function appendTag(contact: Contact, tag: string): string[] {
  const segments = [...contact.segments];
  if (!segments.includes(tag)) {
    segments.push(tag);
  }
  return segments;
}

// --- Webhook logging (stub) ---

export function logWebhook(endpoint: string, payload: Record<string, unknown>, status: number) {
  console.log(`[Webhook Log] ${endpoint} — Status: ${status}`, JSON.stringify(payload).substring(0, 200));
  // Stub: In production, insert into webhook_logs table
}

// --- Activity logging (stub) ---

export function logActivity(
  contactId: string,
  type: string,
  description: string,
  metadata?: WebhookSharedMetadata
) {
  console.log(`[Activity] ${type}: ${description}`, { contactId, metadata });
  // Stub: In production, insert into activity_log table
}

// --- Note creation (stub) ---

export function addNote(contactId: string, body: string) {
  console.log(`[Note] Contact ${contactId}: ${body}`);
  // Stub: In production, insert into notes table
}
