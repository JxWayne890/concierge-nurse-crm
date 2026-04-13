// Resend client stub — do NOT configure with a real API key
// This file is ready to be connected once RESEND_API_KEY is set

// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

interface BatchSendParams {
  from: string;
  recipients: string[];
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  // Stub: replace with resend.emails.send(params) when ready
  console.log('[Resend Stub] Sending email:', params.subject, 'to', params.to);
  return {
    id: `email_${Date.now()}`,
    from: params.from,
    to: params.to,
    subject: params.subject,
  };
}

export async function sendBatchEmails(params: BatchSendParams) {
  // Stub: replace with batch resend.emails.send() when ready
  console.log('[Resend Stub] Batch sending:', params.subject, 'to', params.recipients.length, 'recipients');
  return params.recipients.map((to, i) => ({
    id: `email_${Date.now()}_${i}`,
    from: params.from,
    to,
    subject: params.subject,
  }));
}
