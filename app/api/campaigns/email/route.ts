import { NextRequest, NextResponse } from 'next/server';
import { mockCampaigns } from '@/lib/mock-data';
import type { Campaign } from '@/lib/types';
// import { sendBatchEmails } from '@/lib/resend';

// GET /api/campaigns/email — list email campaigns
export async function GET() {
  const emailCampaigns = mockCampaigns.filter((c) => c.type === 'email');
  return NextResponse.json({ campaigns: emailCampaigns });
}

// POST /api/campaigns/email — create and optionally send an email campaign
export async function POST(request: NextRequest) {
  let body: {
    name: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    html: string;
    recipientSegments: string[];
    scheduledAt?: string;
    sendNow?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name || !body.subject || !body.html) {
    return NextResponse.json({ error: 'Missing required fields: name, subject, html' }, { status: 400 });
  }

  const campaign: Campaign = {
    id: crypto.randomUUID(),
    name: body.name,
    type: 'email',
    status: body.sendNow ? 'sending' : body.scheduledAt ? 'scheduled' : 'draft',
    subject: body.subject,
    fromName: body.fromName,
    fromEmail: body.fromEmail,
    body: body.html,
    recipientSegments: body.recipientSegments || [],
    recipientCount: 0, // Stub: calculate from segments
    scheduledAt: body.scheduledAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, openRate: 0, clickRate: 0, deliveryRate: 0 },
  };

  // Stub: Save to database
  // Stub: If sendNow, resolve recipients and call sendBatchEmails()
  // const recipients = await db.contacts.findBySegments(body.recipientSegments);
  // await sendBatchEmails({ from: `${body.fromName} <${body.fromEmail}>`, recipients: recipients.map(r => r.email), subject: body.subject, html: body.html });

  return NextResponse.json({ campaign }, { status: 201 });
}
