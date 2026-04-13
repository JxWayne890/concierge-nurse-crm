import { NextRequest, NextResponse } from 'next/server';

// Resend webhook events: delivered, opened, clicked, bounced, complained
interface ResendWebhookEvent {
  type: 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained';
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
  };
}

export async function POST(request: NextRequest) {
  let event: ResendWebhookEvent;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Stub: Verify Resend webhook signature
  // const signature = request.headers.get('resend-signature');

  console.log('[Resend Webhook]', event.type, event.data.email_id);

  // Stub: Update campaign_recipients table based on event type
  switch (event.type) {
    case 'email.delivered':
      // Update recipient status to 'delivered'
      break;
    case 'email.opened':
      // Update recipient status to 'opened', set opened_at
      // Update contact's lastOpen
      break;
    case 'email.clicked':
      // Update recipient status to 'clicked', set clicked_at
      break;
    case 'email.bounced':
      // Update recipient status to 'bounced'
      // Update contact status to 'bounced'
      break;
    case 'email.complained':
      // Update contact status to 'unsubscribed'
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
