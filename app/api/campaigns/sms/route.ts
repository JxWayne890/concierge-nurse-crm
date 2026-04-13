import { NextRequest, NextResponse } from 'next/server';
import { mockCampaigns } from '@/lib/mock-data';
import type { Campaign } from '@/lib/types';
// import { sendBatchSMS } from '@/lib/twilio';

// GET /api/campaigns/sms — list SMS campaigns
export async function GET() {
  const smsCampaigns = mockCampaigns.filter((c) => c.type === 'sms');
  return NextResponse.json({ campaigns: smsCampaigns });
}

// POST /api/campaigns/sms — create and optionally send an SMS campaign
export async function POST(request: NextRequest) {
  let body: {
    name: string;
    body: string;
    recipientSegments: string[];
    scheduledAt?: string;
    sendNow?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name || !body.body) {
    return NextResponse.json({ error: 'Missing required fields: name, body' }, { status: 400 });
  }

  const campaign: Campaign = {
    id: crypto.randomUUID(),
    name: body.name,
    type: 'sms',
    status: body.sendNow ? 'sending' : body.scheduledAt ? 'scheduled' : 'draft',
    body: body.body,
    recipientSegments: body.recipientSegments || [],
    recipientCount: 0, // Stub: calculate from segments (phone-only contacts)
    scheduledAt: body.scheduledAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, openRate: 0, clickRate: 0, deliveryRate: 0 },
  };

  // Stub: Save to database
  // Stub: If sendNow, resolve recipients (with phone numbers) and call sendBatchSMS()
  // const recipients = await db.contacts.findBySegmentsWithPhone(body.recipientSegments);
  // await sendBatchSMS(recipients.map(r => ({ body: body.body.replace('{firstName}', r.firstName), to: r.phone })));

  return NextResponse.json({ campaign }, { status: 201 });
}
