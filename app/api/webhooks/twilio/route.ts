import { NextRequest, NextResponse } from 'next/server';

// Twilio SMS status callback
interface TwilioStatusCallback {
  MessageSid: string;
  MessageStatus: 'queued' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  To: string;
  From: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

export async function POST(request: NextRequest) {
  let body: TwilioStatusCallback;
  try {
    // Twilio sends form-encoded data
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries()) as unknown as TwilioStatusCallback;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Stub: Verify Twilio request signature
  // const signature = request.headers.get('x-twilio-signature');
  // const isValid = twilio.validateRequest(authToken, signature, url, body);

  console.log('[Twilio Webhook]', body.MessageSid, body.MessageStatus);

  // Stub: Update campaign_recipients based on status
  switch (body.MessageStatus) {
    case 'delivered':
      // Update recipient status to 'delivered'
      break;
    case 'undelivered':
    case 'failed':
      // Update recipient status to 'failed'
      // Log error code
      break;
  }

  // Twilio expects a 200 with TwiML or empty body
  return new Response('', { status: 200 });
}
