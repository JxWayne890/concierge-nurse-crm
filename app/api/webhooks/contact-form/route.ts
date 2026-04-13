import { NextRequest, NextResponse } from 'next/server';
import type { ContactFormPayload } from '@/lib/types';

function validateWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret');
  // Stub: compare against process.env.WEBHOOK_SECRET
  return !!secret;
}

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ContactFormPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate required fields
  if (!body.email || !body.firstName || !body.lastName) {
    return NextResponse.json(
      { error: 'Missing required fields: email, firstName, lastName' },
      { status: 400 }
    );
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Stub: Check for duplicate email in database
  // const existing = await db.contacts.findByEmail(body.email);
  // if (existing) {
  //   return NextResponse.json({ error: 'Contact already exists', contactId: existing.id }, { status: 409 });
  // }

  // Stub: Create contact in database
  const contact = {
    id: crypto.randomUUID(),
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    source: 'webhook' as const,
    status: 'unconfirmed' as const,
    interest: body.interest,
    segments: ['Contact Form Lead'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('[Webhook] Contact form submission:', contact);

  return NextResponse.json({ message: 'Contact created', contact }, { status: 201 });
}
