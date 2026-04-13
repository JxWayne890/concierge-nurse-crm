'use client';

import Header from '@/components/layout/Header';
import EmailComposer from '@/components/campaigns/EmailComposer';

export default function NewEmailCampaignPage() {
  return (
    <>
      <Header title="New Email Campaign" subtitle="Compose and send an email campaign via Resend" />
      <div className="p-8">
        <EmailComposer />
      </div>
    </>
  );
}
