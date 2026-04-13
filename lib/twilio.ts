// Twilio client stub — do NOT configure with real credentials
// This file is ready to be connected once Twilio env vars are set

// import twilio from 'twilio';
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface SendSMSParams {
  body: string;
  to: string;
  from?: string;
}

export async function sendSMS(params: SendSMSParams) {
  // Stub: replace with client.messages.create(params) when ready
  const from = params.from || process.env.TWILIO_PHONE_NUMBER || '+1placeholder';
  console.log('[Twilio Stub] Sending SMS to', params.to, ':', params.body.substring(0, 50));
  return {
    sid: `SM_${Date.now()}`,
    body: params.body,
    from,
    to: params.to,
    status: 'queued' as const,
  };
}

export async function sendBatchSMS(messages: SendSMSParams[]) {
  console.log('[Twilio Stub] Batch sending', messages.length, 'SMS messages');
  return Promise.all(messages.map(sendSMS));
}

export function getCharacterCount(message: string): { characters: number; segments: number } {
  const characters = message.length;
  const segments = characters <= 160 ? 1 : Math.ceil(characters / 153);
  return { characters, segments };
}
