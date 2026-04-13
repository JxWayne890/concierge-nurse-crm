import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { Contact } from '@/lib/types';

// Map a Supabase row (snake_case) to a Contact (camelCase)
function mapRowToContact(row: Record<string, unknown>, segments: string[] = []): Contact {
  return {
    id: row.id as string,
    email: row.email as string,
    firstName: (row.first_name as string) || '',
    lastName: (row.last_name as string) || '',
    status: row.status as Contact['status'],
    source: row.source as Contact['source'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    phone: row.phone as string | undefined,
    segments,
    lastIp: row.last_ip as string | undefined,
    lastOpen: row.last_open as string | undefined,
    interest: row.interest as Contact['interest'],
    lifecycleStage: row.lifecycle_stage as Contact['lifecycleStage'],
    programHistory: (row.program_history as string[]) || [],
    leadScore: (row.lead_score as number) ?? 0,
    businessName: row.business_name as string | undefined,
    annualRevenue: row.annual_revenue as string | undefined,
  };
}

// GET /api/contacts — list all contacts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const search = searchParams.get('search');
  const segment = searchParams.get('segment');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Build query
  let query = getSupabase().from('contacts').select('*', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data: rows, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch segments for all returned contacts
  const contactIds = (rows || []).map((r) => r.id);
  let segmentMap: Record<string, string[]> = {};

  if (contactIds.length > 0) {
    const { data: csRows } = await getSupabase()
      .from('contact_segments')
      .select('contact_id, segments(name)')
      .in('contact_id', contactIds);

    if (csRows) {
      for (const row of csRows) {
        const cid = row.contact_id as string;
        const segName = (row.segments as unknown as { name: string })?.name;
        if (segName) {
          if (!segmentMap[cid]) segmentMap[cid] = [];
          segmentMap[cid].push(segName);
        }
      }
    }
  }

  // If filtering by segment, we need to filter after fetching
  let contacts = (rows || []).map((r) => mapRowToContact(r, segmentMap[r.id] || []));
  if (segment) {
    contacts = contacts.filter((c) => c.segments.includes(segment));
  }

  const total = segment ? contacts.length : (count || 0);

  return NextResponse.json({
    contacts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/contacts — create a new contact (single or batch)
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Support batch import: { contacts: [...] }
  if (Array.isArray(body.contacts)) {
    return handleBatchImport(body.contacts as Record<string, unknown>[]);
  }

  // Single contact creation
  const email = (body.email as string)?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Check for duplicate
  const { data: existing } = await getSupabase()
    .from('contacts')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 409 });
  }

  const { data: contact, error } = await getSupabase()
    .from('contacts')
    .insert({
      email,
      first_name: (body.firstName as string) || '',
      last_name: (body.lastName as string) || '',
      status: (body.status as string) || 'unconfirmed',
      source: (body.source as string) || 'formSubmission',
      phone: body.phone || null,
      interest: body.interest || null,
      lifecycle_stage: body.lifecycleStage || 'Explorer',
      lead_score: body.leadScore ?? 0,
      program_history: body.programHistory || [],
      last_ip: body.lastIp || null,
      last_open: body.lastOpen || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Handle segments
  const segments = (body.segments as string[]) || [];
  if (segments.length > 0) {
    await assignSegments(contact.id, segments);
  }

  return NextResponse.json({ contact: mapRowToContact(contact, segments) }, { status: 201 });
}

// Batch import contacts
async function handleBatchImport(contacts: Record<string, unknown>[]) {
  let imported = 0;
  let skippedDuplicates = 0;
  let errors = 0;

  for (const row of contacts) {
    const email = (row.email as string)?.toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors++;
      continue;
    }

    // Check duplicate
    const { data: existing } = await getSupabase()
      .from('contacts')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      skippedDuplicates++;
      continue;
    }

    const { data: contact, error } = await getSupabase()
      .from('contacts')
      .insert({
        email,
        first_name: (row.firstName as string) || '',
        last_name: (row.lastName as string) || '',
        status: (row.status as string) || 'confirmed',
        source: (row.source as string) || 'csvImport',
        phone: row.phone || null,
        last_ip: row.lastIp || null,
        last_open: row.lastOpen || null,
        interest: row.interest || null,
        lifecycle_stage: row.lifecycleStage || 'Explorer',
        lead_score: row.leadScore ?? 0,
        program_history: row.programHistory || [],
      })
      .select('id')
      .single();

    if (error) {
      errors++;
      continue;
    }

    // Handle segments
    const segments = (row.segments as string[]) || [];
    if (segments.length > 0 && contact) {
      await assignSegments(contact.id, segments);
    }

    imported++;
  }

  return NextResponse.json({
    totalProcessed: contacts.length,
    imported,
    skippedDuplicates,
    errors,
  });
}

// Find or create segments, then link to contact
async function assignSegments(contactId: string, segmentNames: string[]) {
  for (const name of segmentNames) {
    // Find or create the segment
    let { data: seg } = await getSupabase()
      .from('segments')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (!seg) {
      const { data: newSeg } = await getSupabase()
        .from('segments')
        .insert({ name: name.trim(), type: 'manual' })
        .select('id')
        .single();
      seg = newSeg;
    }

    if (seg) {
      await getSupabase()
        .from('contact_segments')
        .upsert({ contact_id: contactId, segment_id: seg.id }, { onConflict: 'contact_id,segment_id' });
    }
  }
}
