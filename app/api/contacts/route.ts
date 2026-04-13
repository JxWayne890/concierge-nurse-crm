import { NextRequest, NextResponse } from 'next/server';
import { mockContacts } from '@/lib/mock-data';
import type { Contact } from '@/lib/types';

// GET /api/contacts — list all contacts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const search = searchParams.get('search');
  const segment = searchParams.get('segment');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let contacts: Contact[] = [...mockContacts];

  // Stub: Replace with database queries
  if (status) contacts = contacts.filter((c) => c.status === status);
  if (source) contacts = contacts.filter((c) => c.source === source);
  if (segment) contacts = contacts.filter((c) => c.segments.includes(segment));
  if (search) {
    const q = search.toLowerCase();
    contacts = contacts.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q)
    );
  }

  const total = contacts.length;
  const offset = (page - 1) * limit;
  const paginated = contacts.slice(offset, offset + limit);

  return NextResponse.json({
    contacts: paginated,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/contacts — create a new contact
export async function POST(request: NextRequest) {
  let body: Partial<Contact>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Stub: Check for duplicate
  const existing = mockContacts.find((c) => c.email.toLowerCase() === body.email!.toLowerCase());
  if (existing) {
    return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 409 });
  }

  const contact: Contact = {
    id: crypto.randomUUID(),
    email: body.email,
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    status: body.status || 'unconfirmed',
    source: body.source || 'formSubmission',
    segments: body.segments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: body.phone,
    interest: body.interest,
    lifecycleStage: body.lifecycleStage,
    leadScore: body.leadScore ?? 0,
    programHistory: body.programHistory || [],
  };

  // Stub: Insert into database

  return NextResponse.json({ contact }, { status: 201 });
}
