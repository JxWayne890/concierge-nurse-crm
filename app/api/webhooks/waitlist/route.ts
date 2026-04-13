import { NextRequest, NextResponse } from 'next/server';
import type { WaitlistPayload } from '@/lib/types';

function validateWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret');
  return !!secret;
}

export async function POST(request: NextRequest) {
  if (!validateWebhookSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WaitlistPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.email || !body.fullName) {
    return NextResponse.json(
      { error: 'Missing required fields: email, fullName' },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Stub: Check for duplicate
  // Stub: Create contact

  const nameParts = body.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const contact = {
    id: crypto.randomUUID(),
    email: body.email,
    firstName,
    lastName,
    source: 'webhook' as const,
    status: 'unconfirmed' as const,
    segments: ['Accelerator Waitlist'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('[Webhook] Waitlist signup:', contact);

  return NextResponse.json({ message: 'Contact created', contact }, { status: 201 });
}
